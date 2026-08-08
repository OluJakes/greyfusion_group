"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { EASE } from "@/components/Reveal";
import { ngn, ngnCompact } from "@/lib/utils";

const ZONES = [
  { name: "North-East (Maiduguri axis)", irr: 6.2 },
  { name: "North-West (Sokoto / Kano)", irr: 6.0 },
  { name: "North-Central (Abuja / Jos)", irr: 5.5 },
  { name: "South-East (Enugu / Owerri)", irr: 4.8 },
  { name: "South-West (Lagos / Ibadan)", irr: 4.6 },
  { name: "South-South (PH / Calabar)", irr: 4.2 },
] as const;

const ROOFS = [
  { name: "Pitched metal roof", factor: 0.97 },
  { name: "Flat concrete roof", factor: 1.0 },
  { name: "Ground mount", factor: 1.02 },
] as const;

const TARIFF = 225; // ₦/kWh Band A 2026
const DIESEL_PRICE = 1100; // ₦/L
const GEN_KWH_PER_L = 3.0;
const PR = 0.78; // performance ratio
const COST_PER_KW = 850_000;
const COST_PER_KWH_BATT = 450_000;
const SOLAR_COVERAGE = 0.85;
const CO2_PER_KWH = 0.52; // kg, blended grid+diesel

export function SolarEstimator() {
  const [bill, setBill] = useState(450_000);
  const [diesel, setDiesel] = useState(600_000);
  const [zoneIdx, setZoneIdx] = useState(2);
  const [roofIdx, setRoofIdx] = useState(0);

  const r = useMemo(() => {
    const zone = ZONES[zoneIdx];
    const roof = ROOFS[roofIdx];
    const gridKwh = bill / TARIFF;
    const dieselKwh = (diesel / DIESEL_PRICE) * GEN_KWH_PER_L;
    const dailyKwh = (gridKwh + dieselKwh) / 30;
    const sizeKw = dailyKwh / (zone.irr * PR * roof.factor);
    const battKwh = (dailyKwh * 0.6) / 0.9;
    const monthlySavings = SOLAR_COVERAGE * (bill + diesel);
    const capex = sizeKw * COST_PER_KW + battKwh * COST_PER_KWH_BATT;
    const paybackYears = capex / (monthlySavings * 12);
    const annualGen = sizeKw * zone.irr * 365 * PR;
    const co2Tonnes25y = (annualGen * CO2_PER_KWH * 25) / 1000;
    return { dailyKwh, sizeKw, battKwh, monthlySavings, capex, paybackYears, co2Tonnes25y };
  }, [bill, diesel, zoneIdx, roofIdx]);

  // 10-year cumulative savings curve (inline SVG)
  const curve = useMemo(() => {
    const W = 560;
    const H = 180;
    const years = 10;
    const maxVal = Math.max(r.monthlySavings * 12 * years, r.capex) * 1.05;
    const pts: string[] = [];
    for (let y = 0; y <= years; y++) {
      const x = (y / years) * (W - 60) + 44;
      const val = r.monthlySavings * 12 * y;
      const yy = H - 24 - (val / maxVal) * (H - 44);
      pts.push(`${x},${yy}`);
    }
    const capexY = H - 24 - (r.capex / maxVal) * (H - 44);
    const breakEvenX = 44 + Math.min(r.paybackYears / years, 1) * (W - 60);
    return { W, H, pts: pts.join(" "), capexY, breakEvenX };
  }, [r]);

  const cards = [
    { label: "Recommended system", value: r.sizeKw.toFixed(1), unit: "kW solar array" },
    { label: "Battery bank", value: r.battKwh.toFixed(0), unit: "kWh LiFePO₄ storage" },
    { label: "Projected monthly savings", value: ngnCompact(Math.round(r.monthlySavings)), unit: "at 85% offset" },
    { label: "Payback period", value: r.paybackYears < 1 ? "<1" : r.paybackYears.toFixed(1), unit: "years" },
    { label: "Indicative system cost", value: ngnCompact(Math.round(r.capex)), unit: "supply + install" },
    { label: "25-year CO₂ offset", value: Math.round(r.co2Tonnes25y).toLocaleString(), unit: "tonnes avoided" },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
      <div className="card h-fit space-y-5 p-6">
        <div>
          <label htmlFor="se-bill" className="label-gf">Monthly NEPA/PHCN bill (₦)</label>
          <input
            id="se-bill" type="range" min={50000} max={5000000} step={25000} value={bill}
            onChange={(e) => setBill(Number(e.target.value))} className="w-full accent-[#16A34A]"
          />
          <p className="num mt-1 text-sm font-semibold">{ngn(bill)}</p>
        </div>
        <div>
          <label htmlFor="se-diesel" className="label-gf">Monthly generator diesel spend (₦)</label>
          <input
            id="se-diesel" type="range" min={0} max={8000000} step={50000} value={diesel}
            onChange={(e) => setDiesel(Number(e.target.value))} className="w-full accent-[#16A34A]"
          />
          <p className="num mt-1 text-sm font-semibold">{ngn(diesel)}</p>
        </div>
        <div>
          <label htmlFor="se-zone" className="label-gf">Location zone</label>
          <select id="se-zone" className="input-gf" value={zoneIdx} onChange={(e) => setZoneIdx(Number(e.target.value))}>
            {ZONES.map((z, i) => (
              <option key={z.name} value={i}>{z.name} · {z.irr} kWh/m²/day</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="se-roof" className="label-gf">Roof / mounting</label>
          <select id="se-roof" className="input-gf" value={roofIdx} onChange={(e) => setRoofIdx(Number(e.target.value))}>
            {ROOFS.map((z, i) => (
              <option key={z.name} value={i}>{z.name}</option>
            ))}
          </select>
        </div>
        <p className="text-xs leading-relaxed ink-muted">
          Assumptions: ₦{TARIFF}/kWh Band A tariff, diesel ₦{DIESEL_PRICE.toLocaleString()}/L at {GEN_KWH_PER_L} kWh/L,
          performance ratio {PR}, 85% consumption offset. Indicative only — a site audit fixes the numbers.
        </p>
      </div>

      <div>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
          {cards.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
              className="card p-5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider ink-muted">{c.label}</p>
              <p className="num mt-2 font-display text-2xl font-semibold" style={{ color: "#16A34A" }}>{c.value}</p>
              <p className="mt-0.5 text-xs ink-muted">{c.unit}</p>
            </motion.div>
          ))}
        </div>

        <div className="card mt-4 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider ink-muted">Cumulative savings vs. system cost · 10 years</p>
          <svg viewBox={`0 0 ${curve.W} ${curve.H}`} className="mt-3 w-full" role="img" aria-label="Savings curve crossing system cost at payback point">
            <line x1="44" y1={curve.H - 24} x2={curve.W - 12} y2={curve.H - 24} stroke="var(--line)" strokeWidth="1" />
            <line x1="44" y1={curve.capexY} x2={curve.W - 12} y2={curve.capexY} stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="6 4" />
            <text x={curve.W - 14} y={curve.capexY - 6} textAnchor="end" fontSize="10" fill="#F59E0B">system cost</text>
            <polyline points={curve.pts} fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={curve.breakEvenX} y1="16" x2={curve.breakEvenX} y2={curve.H - 24} stroke="var(--line)" strokeWidth="1" />
            <text x={curve.breakEvenX + 4} y="24" fontSize="10" fill="var(--muted)">payback</text>
            {[0, 2, 4, 6, 8, 10].map((yr) => (
              <text key={yr} x={44 + (yr / 10) * (curve.W - 60)} y={curve.H - 8} fontSize="10" fill="var(--muted)" textAnchor="middle">
                {yr}y
              </text>
            ))}
          </svg>
        </div>

        <div className="card mt-4 flex flex-col items-start justify-between gap-3 bg-graphite p-5 text-white sm:flex-row sm:items-center">
          <p className="text-sm text-titanium">
            These numbers hold up in audits. Get a binding proposal from a site survey.
          </p>
          <a href="#maintenance" className="btn-primary shrink-0 !py-2.5">Request engineering survey</a>
        </div>
      </div>
    </div>
  );
}
