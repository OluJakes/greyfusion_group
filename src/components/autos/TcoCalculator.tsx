"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { EASE } from "@/components/Reveal";
import { ngn, ngnCompact } from "@/lib/utils";

export function TcoCalculator() {
  const [kmPerMonth, setKmPerMonth] = useState(1500);
  const [petrolPrice, setPetrolPrice] = useState(950); // ₦/L
  const [tariff, setTariff] = useState(225); // ₦/kWh

  const r = useMemo(() => {
    const years = 5;
    const km = kmPerMonth * 12 * years;
    // Petrol: 11 km/L, service every 10,000km at ₦120k avg
    const petrolFuel = (km / 11) * petrolPrice;
    const petrolService = Math.floor(km / 10_000) * 120_000;
    // EV: 6.2 km/kWh, service every 20,000km at ₦45k avg
    const evCharge = (km / 6.2) * tariff;
    const evService = Math.floor(km / 20_000) * 45_000;
    const petrolTotal = petrolFuel + petrolService;
    const evTotal = evCharge + evService;
    return { petrolFuel, petrolService, evCharge, evService, petrolTotal, evTotal, saving: petrolTotal - evTotal };
  }, [kmPerMonth, petrolPrice, tariff]);

  const maxTotal = Math.max(r.petrolTotal, r.evTotal);

  const bars = [
    { label: "Petrol car", total: r.petrolTotal, parts: [{ v: r.petrolFuel, c: "#8B939E", t: "Fuel" }, { v: r.petrolService, c: "#5B6470", t: "Servicing" }] },
    { label: "Electric vehicle", total: r.evTotal, parts: [{ v: r.evCharge, c: "#38BDF8", t: "Charging" }, { v: r.evService, c: "#0284C7", t: "Servicing" }] },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[20rem_1fr]">
      <div className="card h-fit space-y-5 p-6">
        <div>
          <label htmlFor="tco-km" className="label-gf">Distance per month (km)</label>
          <input id="tco-km" type="range" min={500} max={5000} step={100} value={kmPerMonth} onChange={(e) => setKmPerMonth(Number(e.target.value))} className="w-full accent-[#38BDF8]" />
          <p className="num mt-1 text-sm font-semibold">{kmPerMonth.toLocaleString()} km</p>
        </div>
        <div>
          <label htmlFor="tco-petrol" className="label-gf">Petrol price (₦/L)</label>
          <input id="tco-petrol" type="range" min={600} max={1500} step={10} value={petrolPrice} onChange={(e) => setPetrolPrice(Number(e.target.value))} className="w-full accent-[#38BDF8]" />
          <p className="num mt-1 text-sm font-semibold">{ngn(petrolPrice)}/L</p>
        </div>
        <div>
          <label htmlFor="tco-tariff" className="label-gf">Electricity tariff (₦/kWh)</label>
          <input id="tco-tariff" type="range" min={68} max={400} step={1} value={tariff} onChange={(e) => setTariff(Number(e.target.value))} className="w-full accent-[#38BDF8]" />
          <p className="num mt-1 text-sm font-semibold">{ngn(tariff)}/kWh</p>
        </div>
        <p className="text-xs leading-relaxed ink-muted">
          Assumes 11 km/L petrol vs 6.2 km/kWh EV efficiency; servicing every 10,000 km (petrol) vs
          20,000 km (EV). Purchase price excluded — this is running cost only.
        </p>
      </div>

      <div className="card p-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider ink-muted">5-year running cost</p>
        <div className="mt-6 space-y-8">
          {bars.map((b) => (
            <div key={b.label}>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold">{b.label}</span>
                <span className="num font-display text-xl font-bold">{ngnCompact(Math.round(b.total))}</span>
              </div>
              <div className="mt-2 flex h-9 w-full overflow-hidden rounded-lg bg-[var(--surface-2)]">
                {b.parts.map((part) => (
                  <motion.div
                    key={part.t}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(part.v / maxTotal) * 100}%` }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.8, ease: EASE }}
                    style={{ background: part.c }}
                    title={`${part.t}: ${ngn(Math.round(part.v))}`}
                  />
                ))}
              </div>
              <p className="num mt-1.5 text-xs ink-muted">
                {b.parts.map((part) => `${part.t} ${ngnCompact(Math.round(part.v))}`).join(" · ")}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-xl border p-4 hairline">
          <p className="text-sm">
            Over five years, the EV keeps <span className="num font-bold text-[#0284C7]">{ngnCompact(Math.round(Math.max(r.saving, 0)))}</span> in
            your pocket — before you count a single fuel-scarcity morning.
          </p>
        </div>
      </div>
    </div>
  );
}
