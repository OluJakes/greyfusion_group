"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/components/Reveal";
import { cn, ngn, ngnCompact } from "@/lib/utils";
import { propertyImage } from "@/lib/media";
import { MediaImage } from "@/components/media/MediaImage";
import { Pagination } from "@/components/common/Pagination";

const PER_PAGE = 10;

export interface PropertyItem {
  slug: string;
  title: string;
  type: string;
  location: string;
  city: string;
  priceNGN: number;
  nightlyNGN: number;
  beds: number;
  baths: number;
  sqm: number;
  summary: string;
  /** Admin-managed main cover; falls back to coded property art when unset. */
  thumbnailUrl?: string;
}

const TYPES = ["All", "shortlet", "residential", "commercial", "warehousing"];
const BANDS = [
  { label: "Any price", test: () => true },
  { label: "Under ₦5M/yr", test: (p: PropertyItem) => p.type !== "shortlet" && p.priceNGN < 5_000_000 },
  { label: "₦5M – ₦20M/yr", test: (p: PropertyItem) => p.type !== "shortlet" && p.priceNGN >= 5_000_000 && p.priceNGN <= 20_000_000 },
  { label: "Above ₦20M/yr", test: (p: PropertyItem) => p.type !== "shortlet" && p.priceNGN > 20_000_000 },
  { label: "Shortlet under ₦150K/night", test: (p: PropertyItem) => p.type === "shortlet" && p.nightlyNGN < 150_000 },
];

const HUES: Record<string, string> = { shortlet: "#0D9488", residential: "#0F766E", commercial: "#115E59", warehousing: "#134E4A" };

export function PropertyBrowser({ properties }: { properties: PropertyItem[] }) {
  const cities = useMemo(() => ["All", ...Array.from(new Set(properties.map((p) => p.city)))], [properties]);
  const [type, setType] = useState("All");
  const [city, setCity] = useState("All");
  const [band, setBand] = useState(0);
  const [beds, setBeds] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [type, city, band, beds]);

  const filtered = properties.filter(
    (p) =>
      (type === "All" || p.type === type) &&
      (city === "All" || p.city === city) &&
      BANDS[band].test(p) &&
      (beds === 0 || p.beds >= beds)
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pageCount);
  const paged = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <div>
      <div className="card flex flex-wrap items-end gap-4 p-4">
        <div role="group" aria-label="Property type" className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors hairline",
                type === t ? "text-white" : "hover:border-[#0D9488]"
              )}
              style={type === t ? { background: "#0D9488" } : undefined}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap gap-3">
          <div>
            <label className="label-gf" htmlFor="pf-city">City</label>
            <select id="pf-city" className="input-gf !w-36" value={city} onChange={(e) => setCity(e.target.value)}>
              {cities.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label-gf" htmlFor="pf-band">Price band</label>
            <select id="pf-band" className="input-gf !w-48" value={band} onChange={(e) => setBand(Number(e.target.value))}>
              {BANDS.map((b, i) => <option key={b.label} value={i}>{b.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label-gf" htmlFor="pf-beds">Min beds</label>
            <select id="pf-beds" className="input-gf !w-24" value={beds} onChange={(e) => setBeds(Number(e.target.value))}>
              {[0, 1, 2, 3, 4].map((b) => <option key={b} value={b}>{b === 0 ? "Any" : `${b}+`}</option>)}
            </select>
          </div>
        </div>
      </div>

      <p className="num mt-4 text-sm ink-muted">
        {filtered.length} propert{filtered.length === 1 ? "y" : "ies"}{pageCount > 1 ? ` · page ${current} of ${pageCount}` : ""}
      </p>

      <motion.div layout className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {paged.map((p) => (
            <motion.div key={p.slug} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.35, ease: EASE }}>
              <Link href={`/divisions/real-estate/${p.slug}`} className="group card block overflow-hidden transition-all duration-500 ease-fusion hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <MediaImage
                    src={p.thumbnailUrl || propertyImage(p.type, p.slug)}
                    alt={`${p.title} — interior and exterior views`}
                    tint={HUES[p.type] ?? "#0D9488"}
                    className="absolute inset-0"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <span className="absolute left-4 top-4 rounded-md bg-white/90 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-graphite">{p.type}</span>
                  <span className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center bg-graphite/80 py-2.5 text-xs font-semibold text-white backdrop-blur transition-transform duration-500 ease-fusion group-hover:translate-y-0">
                    Quick view →
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold leading-snug group-hover:text-[#0D9488]">{p.title}</h3>
                  <p className="mt-1 text-sm ink-muted">{p.location} · {p.city}</p>
                  <p className="num mt-3 font-display text-lg font-semibold" style={{ color: "#0D9488" }}>
                    {p.type === "shortlet" ? `${ngn(p.nightlyNGN)}/night` : `${ngnCompact(p.priceNGN)}/yr`}
                  </p>
                  <p className="num mt-1 text-xs ink-muted">{p.beds > 0 ? `${p.beds} bed · ${p.baths} bath · ` : ""}{p.sqm} m²</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {filtered.length === 0 && <p className="mt-8 text-sm ink-muted">Nothing matches — widen the filters.</p>}
      <Pagination page={current} pageCount={pageCount} onChange={setPage} accent="#0D9488" />
    </div>
  );
}
