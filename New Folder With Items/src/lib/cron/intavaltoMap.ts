/**
 * Pure WooCommerce → Greyfusion product transforms for the Intavalto sync (V9).
 * No database or network imports here, so the mapping is unit-testable in isolation.
 */

export const SLUG_PREFIX = "intavalto-";

/* ── WooCommerce Store API shapes (only the fields we read) ── */
export interface WooImage {
  src: string;
  thumbnail?: string;
  alt?: string;
  name?: string;
}
export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  permalink?: string;
  sku?: string;
  short_description?: string;
  description?: string;
  prices?: {
    price?: string;
    currency_minor_unit?: number;
    currency_code?: string;
  };
  is_in_stock?: boolean;
  low_stock_remaining?: number | null;
  categories?: { id: number; name: string; slug: string }[];
  images?: WooImage[];
}

/** Our storefront departments. */
export type ProductCategory = "solar" | "inverters" | "electronics" | "smart-home" | "enterprise";

/** Product shape after mapping — ready to upsert. */
export interface MappedProduct {
  slug: string;
  name: string;
  category: ProductCategory;
  priceNGN: number;
  stock: number;
  summary: string;
  images: { url: string; altText: string }[];
}

/** Strip HTML tags/entities from WooCommerce descriptions into clean plain text. */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8358;/g, "₦")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&rsquo;|&lsquo;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Map a WooCommerce category set + product name to a Greyfusion department. */
export function mapCategory(woo: WooProduct): ProductCategory {
  const text = [(woo.categories ?? []).map((c) => c.name).join(" "), woo.name].join(" ").toLowerCase();
  if (/\bsolar\b|panel|photovoltaic|\bpv\b/.test(text)) return "solar";
  if (/inverter|battery|ups|power station|\bess\b/.test(text)) return "inverters";
  if (/laptop|computer|desktop|\bphone\b|tablet|\btv\b|television|audio|speaker|headphone|router|network|monitor|printer/.test(text))
    return "electronics";
  if (/camera|cctv|\block\b|sensor|alarm|smart|automation|\bhub\b|zigbee|thread|doorbell|security|light|switch|thermostat|blind|shade|robot|vacuum/.test(text))
    return "smart-home";
  return "smart-home"; // Intavalto is a smart-home / IoT retailer by default
}

/** Pure transform: one WooCommerce product → our Product + media shape. */
export function mapWooProduct(woo: WooProduct): MappedProduct | null {
  if (!woo?.slug || !woo?.name) return null;
  const minor = woo.prices?.currency_minor_unit ?? 2;
  const rawPrice = Number(woo.prices?.price ?? "0");
  const priceNGN = Number.isFinite(rawPrice) ? Math.round(rawPrice / 10 ** minor) : 0;

  const inStock = woo.is_in_stock !== false;
  const stock = inStock ? (typeof woo.low_stock_remaining === "number" ? woo.low_stock_remaining : 20) : 0;

  const summarySource = woo.short_description || woo.description || "";
  const summary = stripHtml(summarySource).slice(0, 400) || woo.name;

  // De-duplicate images by src, keep order.
  const seen = new Set<string>();
  const images = (woo.images ?? [])
    .filter((im) => im?.src && !seen.has(im.src) && seen.add(im.src))
    .map((im) => ({ url: im.src, altText: (im.alt || im.name || woo.name).slice(0, 200) }));

  return {
    slug: `${SLUG_PREFIX}${woo.slug}`,
    name: woo.name.slice(0, 200),
    category: mapCategory(woo),
    priceNGN,
    stock,
    summary,
    images,
  };
}
