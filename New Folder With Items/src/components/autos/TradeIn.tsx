"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { submitLead, type ActionResult } from "@/app/actions";
import { ngnCompact } from "@/lib/utils";

interface Fields {
  name: string;
  email: string;
  phone: string;
  make: string;
  model: string;
  year: string;
  mileage: string;
  condition: "Excellent" | "Good" | "Fair" | "Needs work";
}

const BASE_VALUES: Record<string, number> = {
  Toyota: 18_000_000, Honda: 14_000_000, Lexus: 28_000_000, Mercedes: 30_000_000,
  BMW: 26_000_000, Hyundai: 12_000_000, Kia: 11_000_000, Other: 9_000_000,
};
const CONDITION_FACTOR: Record<string, number> = { Excellent: 1.0, Good: 0.85, Fair: 0.68, "Needs work": 0.5 };

export function TradeIn() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Fields>();
  const [band, setBand] = useState<{ lo: number; hi: number } | null>(null);
  const [result, setResult] = useState<ActionResult | null>(null);

  const onSubmit = async (v: Fields) => {
    const base = BASE_VALUES[v.make] ?? BASE_VALUES.Other;
    const age = Math.max(0, new Date().getFullYear() - Number(v.year));
    const ageFactor = Math.max(0.25, Math.pow(0.9, age));
    const mileageFactor = Math.max(0.55, 1 - Number(v.mileage) / 500_000);
    const value = base * ageFactor * mileageFactor * (CONDITION_FACTOR[v.condition] ?? 0.7);
    const lo = Math.round((value * 0.9) / 100_000) * 100_000;
    const hi = Math.round((value * 1.12) / 100_000) * 100_000;
    setBand({ lo, hi });
    setResult(
      await submitLead({
        type: "TRADE_IN",
        division: "autos",
        name: v.name,
        email: v.email,
        phone: v.phone,
        subject: `Trade-in: ${v.year} ${v.make} ${v.model}`,
        payload: { make: v.make, model: v.model, year: v.year, mileage: v.mileage, condition: v.condition, estimateLow: lo, estimateHigh: hi },
      })
    );
  };

  if (result?.ok && band) {
    return (
      <div className="card p-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wider ink-muted">Indicative trade-in value</p>
        <p className="num mt-2 font-display text-3xl font-bold text-[#0284C7]">
          {ngnCompact(band.lo)} – {ngnCompact(band.hi)}
        </p>
        <p className="mt-3 text-sm leading-relaxed ink-muted">
          Subject to physical inspection. Our valuation desk will contact you within one working day
          to schedule it — quote ref <span className="num font-semibold">{result.ref}</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="ti-make" className="label-gf">Make *</label>
        <select id="ti-make" className="input-gf" defaultValue="" {...register("make", { required: true })}>
          <option value="" disabled>Select…</option>
          {Object.keys(BASE_VALUES).map((m) => <option key={m}>{m}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="ti-model" className="label-gf">Model *</label>
        <input id="ti-model" className="input-gf" placeholder="e.g. Camry" {...register("model", { required: "Model required" })} />
        {errors.model && <p className="mt-1 text-xs text-fusion">{errors.model.message}</p>}
      </div>
      <div>
        <label htmlFor="ti-year" className="label-gf">Year *</label>
        <input id="ti-year" type="number" className="input-gf" placeholder="2019" {...register("year", { required: "Year required", min: { value: 1998, message: "1998 or newer" }, max: { value: 2026, message: "Invalid year" } })} />
        {errors.year && <p className="mt-1 text-xs text-fusion">{errors.year.message}</p>}
      </div>
      <div>
        <label htmlFor="ti-mileage" className="label-gf">Mileage (km) *</label>
        <input id="ti-mileage" type="number" className="input-gf" placeholder="85000" {...register("mileage", { required: "Mileage required", min: { value: 0, message: "Invalid" } })} />
        {errors.mileage && <p className="mt-1 text-xs text-fusion">{errors.mileage.message}</p>}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="ti-cond" className="label-gf">Condition *</label>
        <select id="ti-cond" className="input-gf" defaultValue="Good" {...register("condition", { required: true })}>
          {Object.keys(CONDITION_FACTOR).map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="ti-name" className="label-gf">Full name *</label>
        <input id="ti-name" className="input-gf" {...register("name", { required: "Name required" })} />
        {errors.name && <p className="mt-1 text-xs text-fusion">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="ti-email" className="label-gf">Email *</label>
        <input id="ti-email" type="email" className="input-gf" {...register("email", { required: "Email required", pattern: { value: /.+@.+\..+/, message: "Invalid email" } })} />
        {errors.email && <p className="mt-1 text-xs text-fusion">{errors.email.message}</p>}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="ti-phone" className="label-gf">Phone / WhatsApp *</label>
        <input id="ti-phone" type="tel" className="input-gf" {...register("phone", { required: "Phone required" })} />
        {errors.phone && <p className="mt-1 text-xs text-fusion">{errors.phone.message}</p>}
      </div>
      {result && !result.ok && <p className="text-sm text-fusion sm:col-span-2">{result.error}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ background: "linear-gradient(120deg,#0284C7,#38BDF8)", boxShadow: "0 8px 24px -12px rgba(56,189,248,.5)" }}>
          {isSubmitting ? "Valuing…" : "Get my trade-in value"}
        </button>
      </div>
    </form>
  );
}
