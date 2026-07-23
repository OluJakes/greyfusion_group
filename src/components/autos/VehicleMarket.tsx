"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/components/Reveal";
import { cn, money, ngnCompact, safeJson, type Currency } from "@/lib/utils";
import { MediaImage } from "@/components/media/MediaImage";
import { MEDIA } from "@/lib/media";
import { Pagination } from "@/components/common/Pagination";

const PER_PAGE = 10;

export interface VehicleItem {
  slug: string;
  make: string;
  model: string;
  year: number;
  powertrain: string;
  bodyStyle: string;
  priceNGN: number;
  rangeKm: number;
  batteryKwh: number;
  accel: number;
  colors: string;
  /** Admin-managed main cover; falls back to coded division art when unset. */
  thumbnailUrl?: string;
}

const POWERTRAINS = ["All", "BEV", "PHEV", "HEV"];
const SORTS = [
  { label: "Price · low to high", fn: (a: VehicleItem, b: VehicleItem) => a.priceNGN - b.priceNGN },
  { label: "Price · high to low", fn: (a: VehicleItem, b: VehicleItem) => b.priceNGN - a.priceNGN },
  { label: "Range · longest first", fn: (a: VehicleItem, b: VehicleItem) => b.rangeKm - a.rangeKm },
  { label: "0–100 · quickest first", fn: (a: VehicleItem, b: VehicleItem) => a.accel - b.accel },
];

export function VehicleMarket({ vehicles, fx = { USD: 1580, EUR: 1720 } }: { vehicles: VehicleItem[]; fx?: { USD: number; EUR: number } }) {
  const [currency, setCurrency] = useState<Currency>("NGN");
  const makes = useMemo(() => ["All", ...Array.from(new Set(vehicles.map((v) => v.make))).sort()], [vehicles]);
  const bodies = useMemo(() => ["All", ...Array.from(new Set(vehicles.map((v) => v.bodyStyle))).sort()], [vehicles]);
  const [pt, setPt] = useState("All");
  const [make, setMake] = useState("All");
  const [body, setBody] = useState("All");
  const [band, setBand] = useState(0);
  const [minRange, setMinRange] = useState(0);
  const [sort, setSort] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [pt, make, body, band, minRange, sort]);

  const BANDS = [
    { label: "Any price", test: () => true },
    { label: "Under ₦40M", test: (v: VehicleItem) => v.priceNGN < 40_000_000 },
    { label: "₦40M – ₦65M", test: (v: VehicleItem) => v.priceNGN >= 40_000_000 && v.priceNGN <= 65_000_000 },
    { label: "Above ₦65M", test: (v: VehicleItem) => v.priceNGN > 65_000_000 },
  ];

  const filtered = vehicles
    .filter(
      (v) =>
        (pt === "All" || v.powertrain === pt) &&
        (make === "All" || v.make === make) &&
        (body === "All" || v.bodyStyle === body) &&
        BANDS[band].test(v) &&
        v.rangeKm >= minRange
    )
    .sort(SORTS[sort].fn);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pageCount);
  const paged = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <div>
      <div className="card flex flex-wrap items-end gap-4 p-4">
        <div role="group" aria-label="Powertrain" className="flex gap-2">
          {POWERTRAINS.map((t) => (
            <button
              key={t} type="button" onClick={() => setPt(t)}
              className={cn("rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors hairline", pt === t ? "bg-[#0284C7] text-white" : "hover:border-[#38BDF8]")}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="label-gf" htmlFor="vm-make">Make</label>
            <select id="vm-make" className="input-gf !w-36" value={make} onChange={(e) => setMake(e.target.value)}>
              {makes.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label-gf" htmlFor="vm-body">Body</label>
            <select id="vm-body" className="input-gf !w-32" value={body} onChange={(e) => setBody(e.target.value)}>
              {bodies.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label-gf" htmlFor="vm-band">Price band</label>
            <select id="vm-band" className="input-gf !w-40" value={band} onChange={(e) => setBand(Number(e.target.value))}>
              {BANDS.map((b, i) => <option key={b.label} value={i}>{b.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label-gf" htmlFor="vm-range">Min range</label>
            <select id="vm-range" className="input-gf !w-32" value={minRange} onChange={(e) => setMinRange(Number(e.target.value))}>
              {[0, 300, 400, 500].map((r) => <option key={r} value={r}>{r === 0 ? "Any" : `${r}+ km`}</option>)}
            </select>
          </div>
        </div>
        <div className="ml-auto flex items-end gap-3">
          <div>
            <span className="label-gf">Currency</span>
            <div className="flex rounded-xl border p-0.5 hairline" role="group" aria-label="Display currency">
              {(["NGN", "USD", "EUR"] as Currency[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={currency === c}
                  onClick={() => setCurrency(c)}
                  className={cn(
                    "num rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all duration-300",
                    currency === c ? "bg-[#0284C7] text-white shadow" : "hover:bg-[var(--surface-2)]"
                  )}
                >
                  {c === "NGN" ? "₦" : c === "USD" ? "$" : "€"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label-gf" htmlFor="vm-sort">Sort</label>
            <select id="vm-sort" className="input-gf !w-44" value={sort} onChange={(e) => setSort(Number(e.target.value))}>
              {SORTS.map((s, i) => <option key={s.label} value={i}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <p className="num mt-4 text-sm ink-muted">
        {filtered.length} vehicle(s){pageCount > 1 ? ` · page ${current} of ${pageCount}` : ""}
      </p>

      <motion.div layout className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {paged.map((v) => {
            const colors = safeJson<{ name: string; hex: string }[]>(v.colors, []);
            const first = colors[0]?.hex ?? "#8B939E";
            return (
              <motion.div key={v.slug} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.35, ease: EASE }}>
                <Link href={`/divisions/autos/${v.slug}`} className="group card block overflow-hidden transition-all duration-500 ease-fusion hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <MediaImage
                      src={v.thumbnailUrl || MEDIA.autos.done}
                      alt={`${v.make} ${v.model} ${v.year}`}
                      tint={first}
                      className="absolute inset-0"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute left-3 top-3 flex gap-2">
                      <span className="rounded-full bg-graphite/80 px-2.5 py-1 text-[11px] font-semibold text-[#38BDF8] backdrop-blur-md">{v.powertrain}</span>
                    </div>
                    <span className="absolute right-3 top-3 rounded-full bg-graphite/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">{v.bodyStyle}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold group-hover:text-[#0284C7]">
                      {v.make} {v.model} <span className="num text-sm font-normal ink-muted">{v.year}</span>
                    </h3>
                    <p className="num mt-1 font-display text-lg font-semibold">
                      {currency === "NGN" ? ngnCompact(v.priceNGN) : money(v.priceNGN, currency, fx)}
                    </p>
                    <dl className="num mt-3 grid grid-cols-3 gap-2 border-t pt-3 hairline text-center text-xs">
                      <div><dt className="ink-muted">Range</dt><dd className="font-semibold">{v.rangeKm} km</dd></div>
                      <div><dt className="ink-muted">Battery</dt><dd className="font-semibold">{v.batteryKwh} kWh</dd></div>
                      <div><dt className="ink-muted">0–100</dt><dd className="font-semibold">{v.accel}s</dd></div>
                    </dl>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
      {filtered.length === 0 && <p className="mt-8 text-sm ink-muted">No vehicles match — relax a filter.</p>}
      <Pagination page={current} pageCount={pageCount} onChange={setPage} accent="#0284C7" />
    </div>
  );
}
