"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { createOrder, type OrderResult } from "@/app/actions";
import { useCart } from "@/components/commerce/CartContext";
import { cn, ngn, NG_STATES, ECOWAS_REGIONS } from "@/lib/utils";
import { convertNGN, NCS_DISCLAIMER, type FxResolution } from "@/lib/fx-shared";
import { EASE } from "@/components/Reveal";

interface ContactStep { name: string; email: string; phone: string }
interface DeliveryStep { address: string; state: string; city: string }
type Method = "paystack" | "paypal" | "payoneer" | "transfer" | "pod";

const STEPS = ["Contact", "Delivery", "Payment"];

interface PayOption { key: Method; title: string; sub: string; badge?: string }

const REGIONAL: PayOption[] = [
  { key: "paystack", title: "Paystack — card · transfer · USSD · mobile money", sub: "Instant secure checkout in Naira. The fastest way to pay from Nigeria & West Africa.", badge: "Recommended" },
  { key: "transfer", title: "Direct bank transfer", sub: "Account details shown after confirmation · ships when payment reflects" },
  { key: "pod", title: "Pay on delivery", sub: "Abuja, Lagos & PH only · card or transfer to the rider" },
];

const INTERNATIONAL: PayOption[] = [
  { key: "paypal", title: "PayPal", sub: "International cards & PayPal balance · billed in USD" },
  { key: "payoneer", title: "Payoneer invoice (B2B)", sub: "Corporate wires in USD/EUR · procurement terms for approved accounts" },
];

export function Checkout({ fx }: { fx: FxResolution }) {
  const { lines, totalNGN, clear } = useCart();
  const [step, setStep] = useState(0);
  const [contact, setContact] = useState<ContactStep | null>(null);
  const [delivery, setDelivery] = useState<DeliveryStep | null>(null);
  const [region, setRegion] = useState<"wa" | "intl">("wa");
  const [method, setMethod] = useState<Method>("paystack");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<OrderResult | null>(null);

  const contactForm = useForm<ContactStep>();
  const deliveryForm = useForm<DeliveryStep>();

  if (done?.ok) {
    return (
      <div className="card p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-600/10 text-3xl text-green-600">✓</span>
        <h2 className="mt-4 font-display text-2xl font-semibold">Order confirmed.</h2>
        <p className="num mt-2 text-lg font-bold" style={{ color: "#E11D48" }}>{done.ref}</p>
        <p className="num mt-1 font-semibold">{ngn(done.totalNGN ?? totalNGN)}</p>
        {done.instructions && (
          <p className="mx-auto mt-5 max-w-md text-left text-sm leading-relaxed ink-muted">{done.instructions}</p>
        )}
        <p className="mt-4 text-xs ink-muted">Confirmation emailed. Track anytime with your order number.</p>
        <Link href={`/divisions/commerce/track`} className="btn-secondary mt-6 inline-flex">Track this order</Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="ink-muted">Nothing to check out yet.</p>
        <Link href="/divisions/commerce#store" className="btn-primary mt-5 inline-flex" style={{ background: "linear-gradient(120deg,#BE123C,#E11D48)" }}>Browse the store</Link>
      </div>
    );
  }

  const placeOrder = async () => {
    if (!contact || !delivery) return;
    setBusy(true);
    setError(null);
    const res = await createOrder({
      ...contact,
      ...delivery,
      method,
      items: lines.map((l) => ({ slug: l.slug, qty: l.qty, variant: l.variant })),
    });
    if (res.ok && res.redirectUrl) {
      clear();
      window.location.href = res.redirectUrl; // Paystack hosted checkout
      return;
    }
    setBusy(false);
    if (res.ok) {
      setDone(res);
      clear();
    } else {
      setError(res.error ?? "Something went wrong");
    }
  };

  const options = region === "wa" ? REGIONAL : INTERNATIONAL;

  return (
    <div>
      <ol className="flex items-center gap-2" aria-label="Checkout progress">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "num flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300",
                i <= step ? "bg-[#E11D48] text-white" : "surface-2 ink-muted"
              )}
              aria-current={i === step ? "step" : undefined}
            >
              {i + 1}
            </span>
            <span className={cn("text-xs font-semibold", i <= step ? "" : "ink-muted")}>{s}</span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-[var(--line)]" aria-hidden="true" />}
          </li>
        ))}
      </ol>

      <div className="card mt-6 p-6">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.form
              key="contact"
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3, ease: EASE }}
              onSubmit={contactForm.handleSubmit((v) => { setContact(v); setStep(1); })}
              noValidate className="grid gap-4"
            >
              <div>
                <label htmlFor="co-name" className="label-gf">Full name *</label>
                <input id="co-name" className="input-gf" {...contactForm.register("name", { required: "Name required", minLength: { value: 2, message: "Too short" } })} />
                {contactForm.formState.errors.name && <p className="mt-1 text-xs text-fusion">{contactForm.formState.errors.name.message}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="co-email" className="label-gf">Email *</label>
                  <input id="co-email" type="email" className="input-gf" {...contactForm.register("email", { required: "Email required", pattern: { value: /.+@.+\..+/, message: "Invalid email" } })} />
                  {contactForm.formState.errors.email && <p className="mt-1 text-xs text-fusion">{contactForm.formState.errors.email.message}</p>}
                </div>
                <div>
                  <label htmlFor="co-phone" className="label-gf">Phone *</label>
                  <input id="co-phone" type="tel" className="input-gf" {...contactForm.register("phone", { required: "Phone required", minLength: { value: 7, message: "Too short" } })} />
                  {contactForm.formState.errors.phone && <p className="mt-1 text-xs text-fusion">{contactForm.formState.errors.phone.message}</p>}
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ background: "linear-gradient(120deg,#BE123C,#E11D48)" }}>Continue to delivery</button>
            </motion.form>
          )}

          {step === 1 && (
            <motion.form
              key="delivery"
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3, ease: EASE }}
              onSubmit={deliveryForm.handleSubmit((v) => { setDelivery(v); setStep(2); })}
              noValidate className="grid gap-4"
            >
              <div>
                <label htmlFor="co-addr" className="label-gf">Delivery address *</label>
                <input id="co-addr" className="input-gf" placeholder="Street, area, landmark" {...deliveryForm.register("address", { required: "Address required", minLength: { value: 5, message: "Too short" } })} />
                {deliveryForm.formState.errors.address && <p className="mt-1 text-xs text-fusion">{deliveryForm.formState.errors.address.message}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="co-state" className="label-gf">State / region *</label>
                  <select id="co-state" className="input-gf" defaultValue="" {...deliveryForm.register("state", { required: "State required" })}>
                    <option value="" disabled>Select…</option>
                    <optgroup label="Nigeria — priority delivery">
                      {NG_STATES.slice(0, 3).map((s) => <option key={s}>{s}</option>)}
                    </optgroup>
                    <optgroup label="Nigeria — all states">
                      {NG_STATES.slice(3).map((s) => <option key={s}>{s}</option>)}
                    </optgroup>
                    <optgroup label="ECOWAS — regional (we'll confirm logistics)">
                      {ECOWAS_REGIONS.map((s) => <option key={s}>{s}</option>)}
                    </optgroup>
                  </select>
                  {deliveryForm.formState.errors.state && <p className="mt-1 text-xs text-fusion">{deliveryForm.formState.errors.state.message}</p>}
                </div>
                <div>
                  <label htmlFor="co-city" className="label-gf">City / town *</label>
                  <input id="co-city" className="input-gf" placeholder="e.g. Gwarinpa, Lekki, Trans-Amadi" {...deliveryForm.register("city", { required: "City required", minLength: { value: 2, message: "Too short" } })} />
                  {deliveryForm.formState.errors.city && <p className="mt-1 text-xs text-fusion">{deliveryForm.formState.errors.city.message}</p>}
                </div>
              </div>
              <p className="text-xs ink-muted">48-hour delivery in Lagos, FCT (Abuja) & Rivers · 3–5 working days nationwide · ECOWAS quoted per order.</p>
              <div className="flex gap-3">
                <button type="button" className="btn-secondary" onClick={() => setStep(0)}>Back</button>
                <button type="submit" className="btn-primary flex-1" style={{ background: "linear-gradient(120deg,#BE123C,#E11D48)" }}>Continue to payment</button>
              </div>
            </motion.form>
          )}

          {step === 2 && (
            <motion.div key="payment" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3, ease: EASE }}>
              <div className="relative flex rounded-xl border p-1 hairline" role="tablist" aria-label="Payment region">
                {[{ k: "wa" as const, label: "🇳🇬 Nigeria & West Africa" }, { k: "intl" as const, label: "🌍 International" }].map((t) => (
                  <button
                    key={t.k}
                    role="tab"
                    aria-selected={region === t.k}
                    type="button"
                    onClick={() => {
                      setRegion(t.k);
                      setMethod(t.k === "wa" ? "paystack" : "paypal");
                    }}
                    className="relative flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-300"
                  >
                    {region === t.k && (
                      <motion.span
                        layoutId="pay-region-tab"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        className="absolute inset-0 rounded-lg bg-[#E11D48]"
                      />
                    )}
                    <span className={cn("relative", region === t.k ? "text-white" : "")}>{t.label}</span>
                  </button>
                ))}
              </div>

              <fieldset className="mt-4">
                <legend className="sr-only">Payment method</legend>
                <div className="space-y-2.5">
                  {options.map((m) => (
                    <label key={m.key} className={cn("flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all duration-300 hairline hover:shadow-md", method === m.key && "border-[#E11D48] shadow-md")}>
                      <input type="radio" name="method" className="mt-1 accent-[#E11D48]" checked={method === m.key} onChange={() => setMethod(m.key)} />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                          {m.title}
                          {m.badge && (
                            <span className="rounded-full bg-green-600/10 px-2 py-0.5 text-[10px] font-bold text-green-600">{m.badge}</span>
                          )}
                        </span>
                        <span className="block text-xs ink-muted">{m.sub}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <dl className="num mt-5 space-y-1.5 border-t pt-4 hairline text-sm">
                {lines.map((l) => (
                  <div key={l.slug + l.variant} className="flex justify-between gap-3">
                    <dt className="truncate ink-muted">{l.qty} × {l.name}</dt>
                    <dd>{ngn(l.priceNGN * l.qty)}</dd>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-2 hairline text-base font-bold">
                  <dt>Total</dt><dd>{ngn(totalNGN)}</dd>
                </div>
              </dl>
              {region === "intl" && (
                <div className="mt-3 rounded-xl border p-3 hairline" role="note">
                  <p className="num text-sm font-semibold">
                    ≈ ${convertNGN(totalNGN, fx.USD)} <span className="ink-muted">·</span> €{convertNGN(totalNGN, fx.EUR)}
                  </p>
                  <p className="num mt-1 text-[11px] ink-muted">
                    ₦{fx.USD.toLocaleString()}/$ · ₦{fx.EUR.toLocaleString()}/€
                    {fx.source === "NCS" ? " — live NCS benchmark" : fx.source === "admin" ? " — admin-set benchmark" : ""}
                  </p>
                  <p className="mt-1.5 text-[11px] leading-relaxed ink-muted" title={NCS_DISCLAIMER}>
                    ⓘ {NCS_DISCLAIMER}
                  </p>
                </div>
              )}
              {error && <p className="mt-3 text-sm text-fusion">{error}</p>}
              <div className="mt-5 flex gap-3">
                <button type="button" className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                <button type="button" disabled={busy} onClick={placeOrder} className="btn-primary flex-1" style={{ background: "linear-gradient(120deg,#BE123C,#E11D48)", boxShadow: "0 8px 24px -12px rgba(225,29,72,.5)" }}>
                  {busy ? "Placing order…" : `Place order · ${ngn(totalNGN)}`}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
