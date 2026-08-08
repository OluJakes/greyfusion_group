"use client";

import { useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { EASE } from "@/components/Reveal";
import { cn } from "@/lib/utils";
import { APPLIANCES, aggregateLoad, sizeEss, ESS, type ApplianceRow } from "@/lib/ess";
import { submitEssLead } from "@/app/actions";

const ACCENT = "#16A34A";

function initialRows(): Record<string, ApplianceRow> {
  const defaults = new Set(["ac", "fridge", "lights", "tv"]);
  return Object.fromEntries(
    APPLIANCES.map((a) => [a.key, { included: defaults.has(a.key), qty: a.qty, hours: a.hours } as ApplianceRow])
  );
}

export function ProEssCalculator() {
  const [rows, setRows] = useState<Record<string, ApplianceRow>>(initialRows);
  const [autonomyDays, setAutonomyDays] = useState(1);
  const [lead, setLead] = useState({ fullName: "", email: "", phone: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const { dailyKwh, peakKw } = useMemo(() => aggregateLoad(rows), [rows]);
  const sizing = useMemo(() => sizeEss({ dailyKwh, peakKw, autonomyDays }), [dailyKwh, peakKw, autonomyDays]);

  const battery = `${sizing.batteryKwh.toFixed(1)} kWh LiFePO₄ rack`;
  const pv = `${sizing.pvKwp.toFixed(1)} kWp monocrystalline bifacial`;
  const inverter = `${sizing.inverterStandardKva} kVA hybrid pure-sine`;

  const update = (key: string, patch: Partial<ApplianceRow>) =>
    setRows((r) => ({ ...r, [key]: { ...r[key], ...patch } }));

  async function requestQuote(e: FormEvent) {
    e.preventDefault();
    if (dailyKwh <= 0) { setStatus("error"); setFeedback("Select at least one appliance first."); return; }
    setStatus("sending");
    setFeedback("");
    const res = await submitEssLead({
      fullName: lead.fullName,
      email: lead.email,
      phone: lead.phone,
      dailyKwh: Number(dailyKwh.toFixed(2)),
      recommendedBattery: battery,
      recommendedPv: pv,
      recommendedInverter: inverter,
    });
    if (res.ok) { setStatus("done"); setFeedback(res.ref ?? ""); }
    else { setStatus("error"); setFeedback(res.error ?? "Something went wrong"); }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      {/* Load inputs */}
      <div className="card p-6">
        <h3 className="font-display text-lg font-semibold">1 · Your daily load</h3>
        <p className="mt-1 text-sm ink-muted">Tick what you run, set quantity and hours/day. Everything recalculates live.</p>
        <div className="mt-5 space-y-3">
          {APPLIANCES.map((a) => {
            const r = rows[a.key];
            return (
              <div key={a.key} className={cn("rounded-xl border p-3 transition-colors", r.included ? "bg-[var(--surface-2)]" : "hairline")} style={r.included ? { borderColor: ACCENT } : undefined}>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={r.included} onChange={(e) => update(a.key, { included: e.target.checked })} className="h-4 w-4 accent-[#16A34A]" />
                  <span className="flex-1 text-sm font-semibold">{a.label}</span>
                  <span className="num text-xs ink-muted">{a.watts} W</span>
                </label>
                {r.included && (
                  <div className="mt-3 grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 pl-7">
                    <span className="text-xs ink-muted">Qty</span>
                    <div className="flex items-center gap-2">
                      <button type="button" aria-label="Decrease" onClick={() => update(a.key, { qty: Math.max(1, r.qty - 1) })} className="rounded-md border px-2 hairline">−</button>
                      <span className="num w-6 text-center text-sm font-semibold">{r.qty}</span>
                      <button type="button" aria-label="Increase" onClick={() => update(a.key, { qty: Math.min(50, r.qty + 1) })} className="rounded-md border px-2 hairline">+</button>
                    </div>
                    <span className="text-xs ink-muted">Hours/day</span>
                    <div className="flex items-center gap-3">
                      <input type="range" min={0} max={24} step={1} value={r.hours} onChange={(e) => update(a.key, { hours: Number(e.target.value) })} className="flex-1 accent-[#16A34A]" />
                      <span className="num w-10 text-right text-sm font-semibold">{r.hours}h</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-5">
          <span className="label-gf">Days of autonomy (backup with no sun)</span>
          <div className="mt-1 flex gap-2" role="group" aria-label="Autonomy days">
            {[1, 2, 3].map((d) => (
              <button key={d} type="button" onClick={() => setAutonomyDays(d)} aria-pressed={autonomyDays === d}
                className={cn("num rounded-lg border px-4 py-1.5 text-sm font-semibold transition-colors hairline", autonomyDays === d ? "text-white" : "hover:border-[#16A34A]")}
                style={autonomyDays === d ? { background: ACCENT } : undefined}>
                {d} day{d > 1 ? "s" : ""}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* System outputs */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4">
            <p className="text-xs uppercase tracking-wider ink-muted">Daily demand</p>
            <p className="num mt-1 font-display text-2xl font-bold" style={{ color: ACCENT }}>{dailyKwh.toFixed(1)}<span className="text-sm font-medium ink-muted"> kWh</span></p>
          </div>
          <div className="card p-4">
            <p className="text-xs uppercase tracking-wider ink-muted">Peak load</p>
            <p className="num mt-1 font-display text-2xl font-bold">{peakKw.toFixed(1)}<span className="text-sm font-medium ink-muted"> kW</span></p>
          </div>
        </div>

        <motion.div layout className="card p-5">
          <h3 className="font-display text-lg font-semibold">2 · Recommended system</h3>
          <dl className="mt-4 space-y-3">
            {[
              { k: "Battery bank", v: battery, sub: `${ESS.DOD * 100}% DoD · ${ESS.INVERTER_EFF * 100}% inverter eff.` },
              { k: "PV array", v: pv, sub: `${ESS.PEAK_SUN_HOURS} PSH · ${ESS.SYSTEM_LOSS * 100}% system factor` },
              { k: "Hybrid inverter", v: inverter, sub: `${sizing.inverterKva.toFixed(1)} kVA computed · ${ESS.SURGE}× surge` },
            ].map((row) => (
              <div key={row.k} className="flex items-start justify-between gap-4 border-b pb-3 hairline">
                <div>
                  <dt className="text-sm font-semibold">{row.k}</dt>
                  <dd className="text-xs ink-muted">{row.sub}</dd>
                </div>
                <span className="num text-right text-sm font-bold" style={{ color: ACCENT }}>{row.v}</span>
              </div>
            ))}
          </dl>
          <div className="num mt-4 grid grid-cols-2 gap-3 text-center text-xs">
            <div className="rounded-lg bg-[var(--surface-2)] p-2.5">
              <p className="ink-muted">Est. daily generation</p>
              <p className="mt-0.5 font-display text-base font-bold">{sizing.dailyGenKwh.toFixed(1)} kWh</p>
            </div>
            <div className="rounded-lg bg-[var(--surface-2)] p-2.5">
              <p className="ink-muted">Backup autonomy</p>
              <p className="mt-0.5 font-display text-base font-bold">{sizing.autonomyHours.toFixed(1)} h</p>
            </div>
          </div>
        </motion.div>

        {/* CTA / lead capture */}
        <div className="card p-5">
          {status === "done" ? (
            <div className="py-4 text-center">
              <p className="font-display text-lg font-semibold" style={{ color: ACCENT }}>✓ Quotation request received</p>
              <p className="num mt-1 text-sm ink-muted">Ref {feedback}. Our energy engineers will send a formal sizing &amp; quotation within one working day.</p>
            </div>
          ) : (
            <form onSubmit={requestQuote} className="space-y-3">
              <h3 className="font-display text-base font-semibold">3 · Request formal engineering quotation</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label-gf" htmlFor="ess-name">Full name</label>
                  <input id="ess-name" required value={lead.fullName} onChange={(e) => setLead((l) => ({ ...l, fullName: e.target.value }))} className="input-gf w-full" />
                </div>
                <div>
                  <label className="label-gf" htmlFor="ess-phone">Phone</label>
                  <input id="ess-phone" value={lead.phone} onChange={(e) => setLead((l) => ({ ...l, phone: e.target.value }))} className="input-gf w-full" placeholder="0803…" />
                </div>
              </div>
              <div>
                <label className="label-gf" htmlFor="ess-email">Email</label>
                <input id="ess-email" type="email" required value={lead.email} onChange={(e) => setLead((l) => ({ ...l, email: e.target.value }))} className="input-gf w-full" />
              </div>
              {status === "error" && <p className="text-xs font-semibold text-fusion">{feedback}</p>}
              <button type="submit" disabled={status === "sending"} className="btn-primary w-full disabled:opacity-50"
                style={{ background: "linear-gradient(120deg,#15803D,#16A34A 60%,#22C55E)" }}>
                {status === "sending" ? "Sending…" : "Request Formal Engineering Quotation"}
              </button>
              <p className="text-[11px] ink-muted">Indicative sizing for planning. A site load audit confirms the final specification.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
