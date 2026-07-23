import type { MappedProduct, ProductCategory } from "@/lib/cron/intavaltoMap";

/**
 * Pure Magento listing parser (V15) for solarvillage.africa. No network/db imports so it
 * is unit-testable. Targets standard Magento Luma markup: `product-item` cards containing a
 * `product-item-link` (name + url), a `product-image-photo` (image), and a
 * `data-price-amount` (final price). Layered fallbacks keep it resilient to theme tweaks.
 */

export const SOLARVILLAGE_PREFIX = "solarvillage-";
export const SOLARVILLAGE_HOST = "solarvillage.africa";

export function stripTags(s: string): string {
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8358;/g, "₦")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&rsquo;|&lsquo;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Namespaced slug from a Magento product URL (…/felicity-ivem-3kva.html). */
export function slugFromUrl(url: string): string {
  try {
    const path = new URL(url, `https://${SOLARVILLAGE_HOST}`).pathname;
    const last = path.split("/").filter(Boolean).pop() ?? "";
    const base = last.replace(/\.html?$/i, "").replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
    return `${SOLARVILLAGE_PREFIX}${base}`.slice(0, 90);
  } catch {
    return "";
  }
}

/** Map a solarvillage product name to a Greyfusion storefront department. */
export function magentoCategory(name: string): ProductCategory {
  const t = name.toLowerCase();
  if (/panel|street light|flood ?light|\blight\b|all-in-one|\bcube\b|\bsystem\b|isite|photovoltaic/.test(t)) return "solar";
  if (/inverter|battery|batteries|lithium|lifepo4|tubular|li-wall|\bbms\b|\bups\b|kwh|\bah\b/.test(t)) return "inverters";
  if (/solar/.test(t)) return "solar";
  return "solar"; // solarvillage is a solar/energy retailer by default
}

function parsePrice(chunk: string): number {
  const amount = /data-price-amount="([\d.]+)"/.exec(chunk);
  if (amount) return Math.round(Number(amount[1]));
  const naira = /(?:₦|&#8358;)\s*([\d,]+)(?:\.\d+)?/.exec(chunk);
  if (naira) return Math.round(Number(naira[1].replace(/,/g, "")));
  return 0;
}

function parseImage(chunk: string): string | null {
  const photo = /class="[^"]*product-image-photo[^"]*"[^>]*\s(?:data-src|src)="([^"]+)"/.exec(chunk)
    ?? /\s(?:data-src|src)="([^"]+)"[^>]*class="[^"]*product-image-photo/.exec(chunk);
  if (photo) return photo[1];
  const media = new RegExp(`https?://${SOLARVILLAGE_HOST.replace(/\./g, "\\.")}/media/catalog/product/[^"' )]+`).exec(chunk);
  return media ? media[0] : null;
}

/**
 * Parse a Magento category/listing HTML page into products. Splits on `product-item`
 * cards, then extracts name+url, price and image from each card.
 */
export function parseMagentoListing(html: string): MappedProduct[] {
  const out: MappedProduct[] = [];
  const seen = new Set<string>();

  const cards = html.split(/<(?:li|div)[^>]*class="[^"]*product-item(?:-info)?[^"]*"/i).slice(1);
  for (const chunk of cards) {
    const link = /<a[^>]*class="[^"]*product-item-link[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i.exec(chunk)
      ?? /<a[^>]*href="([^"]+\.html?)"[^>]*class="[^"]*product-item-link/i.exec(chunk);
    if (!link) continue;
    const url = link[1];
    const name = stripTags(link[2] ?? "").slice(0, 200);
    if (!url || !name) continue;

    const slug = slugFromUrl(url);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);

    const priceNGN = parsePrice(chunk);
    const image = parseImage(chunk);
    out.push({
      slug,
      name,
      category: magentoCategory(name),
      priceNGN,
      stock: 10,
      summary: `${name} — available at Solar Village.`,
      images: image ? [{ url: image, altText: name }] : [],
    });
  }
  return out;
}
