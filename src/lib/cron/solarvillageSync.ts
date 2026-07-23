import { db } from "@/lib/db";
import { parseMagentoListing, SOLARVILLAGE_HOST } from "@/lib/cron/magentoParse";
import { persistMappedProduct } from "@/lib/cron/catalogPersist";
import type { SyncResult } from "@/lib/cron/intavaltoSync";

/**
 * Solar Village (solarvillage.africa) catalogue sync (V15).
 *
 * solarvillage.africa is a Magento store with no public JSON product API, so we crawl its
 * listing pages and parse standard Magento product cards (see magentoParse). Products upsert
 * into `Product` + `EntityMedia` under a `solarvillage-` slug namespace. Additional category
 * listing URLs can be supplied via the SOLARVILLAGE_LISTING_URLS env var (comma-separated) to
 * widen coverage beyond the homepage.
 */

const SOURCE = "SOLARVILLAGE";
const DEFAULT_LISTINGS = ["https://solarvillage.africa/"];
const MAX_PAGES = 8;
const REQ_TIMEOUT_MS = 20_000;

function listingUrls(): string[] {
  const extra = (process.env.SOLARVILLAGE_LISTING_URLS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return Array.from(new Set([...DEFAULT_LISTINGS, ...extra]));
}

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQ_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "GreyfusionSync/1.0 (+https://greyfusion.com.ng)", Accept: "text/html" },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`solarvillage responded ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

export async function runSolarvillageSync(): Promise<SyncResult> {
  let created = 0;
  let updated = 0;
  let failed = 0;
  let pages = 0;
  let fatal = "";
  const seen = new Set<string>();
  const bases = listingUrls();

  try {
    for (const base of bases) {
      for (let p = 1; p <= MAX_PAGES; p++) {
        const url = p === 1 ? base : `${base}${base.includes("?") ? "&" : "?"}p=${p}`;
        let html = "";
        try {
          html = await fetchHtml(url);
        } catch (e) {
          if (p === 1 && base === bases[0]) throw e; // first fetch failing is fatal
          break;
        }
        const items = parseMagentoListing(html);
        if (items.length === 0) break;
        pages++;

        let newOnPage = 0;
        for (const mp of items) {
          if (seen.has(mp.slug)) continue;
          seen.add(mp.slug);
          newOnPage++;
          try {
            const outcome = await persistMappedProduct(mp, SOLARVILLAGE_HOST);
            if (outcome === "created") created++;
            else updated++;
          } catch {
            failed++;
          }
        }
        if (newOnPage === 0) break; // pagination exhausted (cards repeating)
      }
    }
  } catch (e) {
    fatal = e instanceof Error ? e.message : String(e);
  }

  const itemCount = created + updated;
  const status: SyncResult["status"] = fatal && itemCount === 0 ? "FAILED" : fatal || failed > 0 ? "PARTIAL" : "SUCCESS";
  const message = `${created} created, ${updated} updated, ${failed} failed across ${pages} page(s)${fatal ? ` — ${fatal}` : ""}`;

  try {
    await db.syncLog.create({ data: { source: SOURCE, status, itemCount, details: JSON.stringify({ created, updated, failed, pages, message }) } });
  } catch {
    /* logging must never crash the sync */
  }

  return { status, created, updated, failed, pages, message };
}
