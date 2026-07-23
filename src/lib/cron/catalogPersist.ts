import { db } from "@/lib/db";
import type { MappedProduct } from "@/lib/cron/intavaltoMap";

/**
 * Shared upsert for synced catalogue products (V15). Products are keyed by their
 * namespaced slug; only source-owned media (URLs on `sourceHost`) are reconciled, so
 * admin-added media and manual products are never touched. A zero price never overwrites
 * an existing good price.
 */
export async function persistMappedProduct(mp: MappedProduct, sourceHost: string): Promise<"created" | "updated"> {
  const existing = await db.product.findUnique({ where: { slug: mp.slug }, select: { id: true } });

  const product = await db.product.upsert({
    where: { slug: mp.slug },
    // A zero price (parse miss) must not clobber an existing good price.
    update: {
      name: mp.name,
      category: mp.category,
      stock: mp.stock,
      summary: mp.summary,
      ...(mp.priceNGN > 0 ? { priceNGN: mp.priceNGN } : {}),
    },
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

  if (mp.images.length > 0) {
    await db.entityMedia.deleteMany({ where: { productId: product.id, url: { contains: sourceHost } } });
    await db.entityMedia.createMany({
      data: mp.images.map((im, i) => ({ productId: product.id, url: im.url, altText: im.altText, isMain: i === 0, displayOrder: i })),
    });
    const mainCount = await db.entityMedia.count({ where: { productId: product.id, isMain: true } });
    if (mainCount === 0) {
      const first = await db.entityMedia.findFirst({ where: { productId: product.id }, orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] });
      if (first) await db.entityMedia.update({ where: { id: first.id }, data: { isMain: true } });
    }
  }

  return existing ? "updated" : "created";
}
