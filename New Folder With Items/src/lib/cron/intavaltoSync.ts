import { db } from "@/lib/db";
import { mapWooProduct, type MappedProduct, type WooProduct } from "@/lib/cron/intavaltoMap";

/**
 * Intavalto Retail → Greyfusion product sync (V9).
 *
 * Source: https://intavaltoretail.com is a WooCommerce store exposing the public
 * WooCommerce Store API (`/wp-json/wc/store/v1/products`) — clean JSON, no auth,
 * paginated. We ingest the live catalogue hourly and upsert into `Product` + the
 * relational `EntityMedia` gallery. Pure mapping lives in ./intavaltoMap (unit-tested).
 *
 * Ownership rule: every synced record is namespaced with an `intavalto-` slug and its
 * images are sourced from intavaltoretail.com, so manually-created products and any
 * admin-added media are never touched. Re-syncs update price/stock/description/media
 * for synced items only.
 */

const SOURCE = "INTAVALTO_RETAIL";
const BASE = "https://intavaltoretail.com/wp-json/wc/store/v1/products";
const PER_PAGE = 100;
const MAX_PAGES = 25; // safety cap → up to 2,500 products
const REQ_TIMEOUT_MS = 20_000;

async function fetchPage(page: number): Promise<WooProduct[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQ_TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}?per_page=${PER_PAGE}&page=${page}`, {
      headers: { Accept: "application/json", "User-Agent": "GreyfusionSync/1.0 (+https://greyfusion.com.ng)" },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`WooCommerce API responded ${res.status} on page ${page}`);
    const data = (await res.json()) as unknown;
    return Array.isArray(data) ? (data as WooProduct[]) : [];
  } finally {
    clearTimeout(timer);
  }
}

/** Upsert one mapped product and reconcile its sync-owned media. */
async function persist(mp: MappedProduct): Promise<"created" | "updated"> {
  const existing = await db.product.findUnique({ where: { slug: mp.slug }, select: { id: true } });

  const product = await db.product.upsert({
    where: { slug: mp.slug },
    // On update: refresh live fields, but never overwrite `featured` or manual curation flags.
    update: { name: mp.name, category: mp.category, priceNGN: mp.priceNGN, stock: mp.stock, summary: mp.summary },
    create: {
      slug: mp.slug,
      name: mp.name,
      category: mp.category,
      priceNGN: mp.priceNGN,
      stock: mp.stock,
      summary: mp.summary,
      variants: "[]",
      specs: "[]",
      featured: false,
    },
    select: { id: true },
  });

  // Replace only the images we own (from intavaltoretail.com); keep admin-added media.
  await db.entityMedia.deleteMany({ where: { productId: product.id, url: { contains: "intavaltoretail.com" } } });
  if (mp.images.length > 0) {
    await db.entityMedia.createMany({
      data: mp.images.map((im, i) => ({
        productId: product.id,
        url: im.url,
        altText: im.altText,
        isMain: i === 0,
        displayOrder: i,
      })),
    });
    // Guarantee a main cover exists even if the product already had (admin) media.
    const mainCount = await db.entityMedia.count({ where: { productId: product.id, isMain: true } });
    if (mainCount === 0) {
      const first = await db.entityMedia.findFirst({
        where: { productId: product.id },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      });
      if (first) await db.entityMedia.update({ where: { id: first.id }, data: { isMain: true } });
    }
  }

  return existing ? "updated" : "created";
}

export interface SyncResult {
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  created: number;
  updated: number;
  failed: number;
  pages: number;
  message: string;
}

/**
 * Run a full catalogue sync. Always writes a SyncLog row (audit trail), even on failure.
 */
export async function runIntavaltoSync(): Promise<SyncResult> {
  let created = 0;
  let updated = 0;
  let failed = 0;
  let pages = 0;
  let fatal = "";

  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      let batch: WooProduct[];
      try {
        batch = await fetchPage(page);
      } catch (e) {
        // A page-level fetch error is fatal only if it's the very first page.
        if (page === 1) throw e;
        fatal = e instanceof Error ? e.message : String(e);
        break;
      }
      if (batch.length === 0) break;
      pages = page;

      for (const woo of batch) {
        const mp = mapWooProduct(woo);
        if (!mp) {
          failed++;
          continue;
        }
        try {
          const outcome = await persist(mp);
          if (outcome === "created") created++;
          else updated++;
        } catch {
          failed++;
        }
      }

      if (batch.length < PER_PAGE) break; // last page reached
    }
  } catch (e) {
    fatal = e instanceof Error ? e.message : String(e);
  }

  const itemCount = created + updated;
  const status: SyncResult["status"] = fatal && itemCount === 0 ? "FAILED" : fatal || failed > 0 ? "PARTIAL" : "SUCCESS";
  const message = fatal
    ? `${status}: ${created} created, ${updated} updated, ${failed} failed — ${fatal}`
    : `${created} created, ${updated} updated, ${failed} skipped across ${pages} page(s)`;

  try {
    await db.syncLog.create({
      data: {
        source: SOURCE,
        status,
        itemCount,
        details: JSON.stringify({ created, updated, failed, pages, message }),
      },
    });
  } catch {
    /* logging must never crash the sync */
  }

  return { status, created, updated, failed, pages, message };
}
