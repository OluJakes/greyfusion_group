"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/components/Reveal";
import { cn, ngn, safeJson } from "@/lib/utils";
import { useCart } from "@/components/commerce/CartContext";
import { productImage } from "@/lib/media";
import { MediaImage } from "@/components/media/MediaImage";
import { Pagination } from "@/components/common/Pagination";

const PER_PAGE = 20;

export interface ProductItem {
  slug: string;
  name: string;
  category: string;
  priceNGN: number;
  stock: number;
  variants: string;
  summary: string;
  /** Admin-managed main cover; falls back to coded product art when unset. */
  thumbnailUrl?: string;
}

export const DEPARTMENTS: { key: string; label: string }[] = [
  { key: "All", label: "All departments" },
  { key: "solar", label: "Solar Components" },
  { key: "inverters", label: "Inverters" },
  { key: "electronics", label: "Retail Electronics" },
  { key: "smart-home", label: "Smart Home" },
  { key: "enterprise", label: "Enterprise Hardware" },
];

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <span className="rounded-md bg-fusion/10 px-2 py-0.5 text-[11px] font-bold text-fusion">Out of stock</span>;
  if (stock <= 5) return <span className="num rounded-md bg-amber-signal/15 px-2 py-0.5 text-[11px] font-bold text-amber-signal">Only {stock} left</span>;
  return <span className="rounded-md bg-green-600/10 px-2 py-0.5 text-[11px] font-bold text-green-600">In stock</span>;
}

const CAT_HUE: Record<string, string> = { solar: "#16A34A", inverters: "#F59E0B", electronics: "#38BDF8", "smart-home": "#8B5CF6", enterprise: "#E11D48" };

function VariantPicker({ product, onPicked }: { product: ProductItem; onPicked: (variant: string) => void }) {
  const variants = safeJson<{ label: string; options: string[] }[]>(product.variants, []);
  const [sel, setSel] = useState<Record<string, string>>({});
  const complete = variants.every((v) => sel[v.label]);
  return (
    <div className="space-y-3">
      {variants.map((v) => (
        <div key={v.label}>
          <p className="label-gf">{v.label}</p>
          <div className="flex flex-wrap gap-2">
            {v.options.map((o) => (
              <button
                key={o} type="button"
                onClick={() => setSel((s) => ({ ...s, [v.label]: o }))}
                className={cn("rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors hairline", sel[v.label] === o ? "bg-[#E11D48] text-white" : "hover:border-[#E11D48]")}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        disabled={!complete || product.stock === 0}
        onClick={() => onPicked(variants.map((v) => `${v.label}: ${sel[v.label]}`).join(" · "))}
        className="btn-primary w-full disabled:opacity-50"
        style={{ background: "linear-gradient(120deg,#BE123C,#E11D48)", boxShadow: "0 8px 24px -12px rgba(225,29,72,.5)" }}
      >
        {product.stock === 0 ? "Out of stock" : complete || variants.length === 0 ? "Add to cart" : "Choose options"}
      </button>
    </div>
  );
}

export function StoreFront({ products }: { products: ProductItem[] }) {
  const [dept, setDept] = useState("All");
  const [quick, setQuick] = useState<ProductItem | null>(null);
  const [added, setAdded] = useState(false);
  const [page, setPage] = useState(1);
  const { add } = useCart();

  const filtered = useMemo(() => products.filter((p) => dept === "All" || p.category === dept), [products, dept]);

  useEffect(() => { setPage(1); }, [dept]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pageCount);
  const paged = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const handleAdd = (p: ProductItem, variant: string) => {
    add({ slug: p.slug, name: p.name, priceNGN: p.priceNGN, variant });
    setAdded(true);
    setTimeout(() => {
      setQuick(null);
      setAdded(false);
    }, 900);
  };

  return (
    <div>
      <nav aria-label="Departments" className="flex flex-wrap gap-2">
        {DEPARTMENTS.map((d) => (
          <button
            key={d.key} type="button" onClick={() => setDept(d.key)} aria-pressed={dept === d.key}
            className="relative rounded-full border px-4 py-2 text-xs font-semibold transition-colors duration-300 hairline hover:border-[#E11D48]"
          >
            {dept === d.key && (
              <motion.span
                layoutId="dept-tab-pill"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="absolute inset-0 rounded-full bg-[#E11D48]"
              />
            )}
            <span className={cn("relative", dept === d.key ? "text-white" : "")}>{d.label}</span>
          </button>
        ))}
      </nav>

      <p className="num mt-6 text-sm ink-muted">
        {filtered.length} product(s){pageCount > 1 ? ` · page ${current} of ${pageCount}` : ""}
      </p>

      <motion.div layout className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {paged.map((p) => (
            <motion.div key={p.slug} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.3, ease: EASE }}>
              <div className="group card flex h-full flex-col overflow-hidden transition-all duration-500 ease-fusion hover:-translate-y-1 hover:shadow-xl">
                <Link href={`/divisions/commerce/${p.slug}`} className="relative block aspect-square overflow-hidden" aria-label={p.name}>
                  <MediaImage
                    src={p.thumbnailUrl || productImage(p.category, p.slug)}
                    alt={p.name}
                    tint={CAT_HUE[p.category] ?? "#E11D48"}
                    className="absolute inset-0"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  <span className="absolute bottom-3 left-3 font-display text-xs font-semibold uppercase tracking-wider text-white/80">
                    {DEPARTMENTS.find((d) => d.key === p.category)?.label}
                  </span>
                </Link>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/divisions/commerce/${p.slug}`} className="font-display text-sm font-semibold leading-snug hover:text-[#E11D48]">
                      {p.name}
                    </Link>
                    <StockBadge stock={p.stock} />
                  </div>
                  <p className="num mt-2 font-display text-lg font-bold">{ngn(p.priceNGN)}</p>
                  <button
                    type="button"
                    onClick={() => setQuick(p)}
                    className="btn-secondary mt-auto w-full !py-2 text-xs"
                  >
                    Quick view
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && <p className="mt-8 text-sm ink-muted">No products in this department yet.</p>}
      <Pagination page={current} pageCount={pageCount} onChange={setPage} accent="#E11D48" />

      <AnimatePresence>
        {quick && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] flex items-end justify-center bg-graphite/60 p-4 backdrop-blur-sm sm:items-center"
            onClick={() => setQuick(null)} role="dialog" aria-modal="true" aria-label={`Quick view: ${quick.name}`}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}
            >
              {added ? (
                <p className="py-8 text-center font-display text-lg font-semibold text-green-600">✓ Added to cart</p>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-semibold">{quick.name}</h3>
                    <button type="button" aria-label="Close" onClick={() => setQuick(null)} className="ink-muted">✕</button>
                  </div>
                  <p className="mt-2 text-sm ink-muted">{quick.summary}</p>
                  <p className="num mt-3 font-display text-xl font-bold">{ngn(quick.priceNGN)}</p>
                  <div className="mt-4"><VariantPicker product={quick} onPicked={(variant) => handleAdd(quick, variant)} /></div>
                  <Link href={`/divisions/commerce/${quick.slug}`} className="mt-3 block text-center text-xs font-semibold text-[#E11D48]">
                    Full details & specs →
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { VariantPicker, StockBadge };
