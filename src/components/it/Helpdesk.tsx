"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { createTicket, findTickets, type ActionResult } from "@/app/actions";
import { fmtDate } from "@/lib/utils";

interface TicketFields {
  name: string;
  email: string;
  category: "Security incident" | "Cloud & infrastructure" | "Email & collaboration" | "Hardware" | "Access & identity" | "Other";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
}

interface TicketView {
  ref: string;
  category: string;
  severity: string;
  status: string;
  createdAt: Date;
  description: string;
}

export function Helpdesk() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TicketFields>();
  const [result, setResult] = useState<ActionResult | null>(null);

  const onSubmit = async (v: TicketFields) => {
    setResult(await createTicket(v));
  };

  if (result?.ok) {
    return (
      <div className="card p-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#6366F1]/10 text-2xl text-[#6366F1]">✓</span>
        <h3 className="mt-3 font-display text-lg font-semibold">Ticket opened.</h3>
        <p className="mt-2 text-sm ink-muted">Track it in the client portal with your email address.</p>
        <p className="mt-3 text-sm">
          Ticket ref: <span className="num font-semibold" style={{ color: "#6366F1" }}>{result.ref}</span>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="hd-name" className="label-gf">Full name <span style={{ color: "#6366F1" }}>*</span></label>
        <input id="hd-name" className="input-gf" {...register("name", { required: "Name is required", minLength: { value: 2, message: "Too short" } })} />
        {errors.name && <p className="mt-1 text-xs text-fusion">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="hd-email" className="label-gf">Work email <span style={{ color: "#6366F1" }}>*</span></label>
        <input id="hd-email" type="email" className="input-gf" {...register("email", { required: "Email is required", pattern: { value: /.+@.+\..+/, message: "Invalid email" } })} />
        {errors.email && <p className="mt-1 text-xs text-fusion">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="hd-cat" className="label-gf">Category <span style={{ color: "#6366F1" }}>*</span></label>
        <select id="hd-cat" className="input-gf" defaultValue="" {...register("category", { required: "Pick a category" })}>
          <option value="" disabled>Select…</option>
          {["Security incident", "Cloud & infrastructure", "Email & collaboration", "Hardware", "Access & identity", "Other"].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-xs text-fusion">{errors.category.message}</p>}
      </div>
      <div>
        <label htmlFor="hd-sev" className="label-gf">Severity <span style={{ color: "#6366F1" }}>*</span></label>
        <select id="hd-sev" className="input-gf" defaultValue="MEDIUM" {...register("severity", { required: true })}>
          <option value="LOW">Low — inconvenience</option>
          <option value="MEDIUM">Medium — degraded service</option>
          <option value="HIGH">High — business function down</option>
          <option value="CRITICAL">Critical — active incident / breach</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="hd-desc" className="label-gf">Description <span style={{ color: "#6366F1" }}>*</span></label>
        <textarea id="hd-desc" rows={4} className="input-gf" placeholder="What happened, when it started, what you've tried…"
          {...register("description", { required: "Describe the issue", minLength: { value: 10, message: "At least 10 characters" } })} />
        {errors.description && <p className="mt-1 text-xs text-fusion">{errors.description.message}</p>}
      </div>
      {result && !result.ok && <p className="text-sm text-fusion sm:col-span-2">{result.error}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ background: "linear-gradient(120deg,#4F46E5,#6366F1 60%,#818CF8)", boxShadow: "0 8px 24px -12px rgba(99,102,241,.5)" }}>
          {isSubmitting ? "Opening ticket…" : "Open a ticket"}
        </button>
      </div>
    </form>
  );
}

export function ClientPortal() {
  const [email, setEmail] = useState("");
  const [tickets, setTickets] = useState<TicketView[] | null>(null);
  const [loading, setLoading] = useState(false);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const found = await findTickets(email);
    setTickets(found.map((t) => ({ ref: t.ref, category: t.category, severity: t.severity, status: t.status, createdAt: new Date(t.createdAt), description: t.description })));
    setLoading(false);
  };

  const sevColor: Record<string, string> = { LOW: "text-green-600", MEDIUM: "text-amber-signal", HIGH: "text-fusion", CRITICAL: "text-fusion" };

  return (
    <div className="card p-6">
      <h3 className="font-display text-lg font-semibold">Client portal</h3>
      <p className="mt-1 text-sm ink-muted">Enter the email you filed tickets with to view their status.</p>
      <form onSubmit={lookup} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="portal-email" className="sr-only">Email address</label>
        <input id="portal-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="input-gf flex-1" />
        <button type="submit" className="btn-secondary shrink-0" disabled={loading}>
          {loading ? "Checking…" : "View my tickets"}
        </button>
      </form>
      {tickets !== null && (
        <div className="mt-5 space-y-3">
          {tickets.length === 0 && <p className="text-sm ink-muted">No tickets found for that address.</p>}
          {tickets.map((t) => (
            <div key={t.ref} className="rounded-xl border p-4 hairline">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="num text-sm font-semibold">{t.ref}</span>
                <span className={"text-xs font-bold " + (sevColor[t.severity] ?? "")}>{t.severity}</span>
                <span className="rounded-md bg-[var(--surface-2)] px-2 py-0.5 text-xs font-semibold">{t.status.replace("_", " ")}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm ink-muted">{t.description}</p>
              <p className="num mt-2 text-xs ink-muted">{t.category} · {fmtDate(t.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
