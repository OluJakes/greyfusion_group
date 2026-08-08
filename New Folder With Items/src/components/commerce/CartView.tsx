"use client";

import Link from "next/link";
import { useCart } from "@/components/commerce/CartContext";
import { ngn } from "@/lib/utils";

export function CartView() {
  const { lines, remove, setQty, totalNGN } = useCart();

  if (lines.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="ink-muted">Your cart is empty.</p>
        <Link href="/divisions/commerce#store" className="btn-primary mt-5 inline-flex" style={{ background: "linear-gradient(120deg,#BE123C,#E11D48)" }}>
          Browse the store
        </Link>
      </div>
    );
  }

  return (
    <div className="card divide-y overflow-hidden hairline">
      {lines.map((l) => (
        <div key={l.slug + l.variant} className="flex flex-wrap items-center gap-4 p-4">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-semibold">{l.name}</p>
            {l.variant && <p className="mt-0.5 text-xs ink-muted">{l.variant}</p>}
            <p className="num mt-1 text-sm font-semibold">{ngn(l.priceNGN)}</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor={`qty-${l.slug}`}>Quantity</label>
            <button type="button" aria-label="Decrease" className="h-8 w-8 rounded-lg border hairline" onClick={() => setQty(l.slug, l.variant, l.qty - 1)}>−</button>
            <input
              id={`qty-${l.slug}`}
              className="input-gf num !w-14 text-center"
              value={l.qty}
              onChange={(e) => setQty(l.slug, l.variant, Number(e.target.value) || 1)}
              inputMode="numeric"
            />
            <button type="button" aria-label="Increase" className="h-8 w-8 rounded-lg border hairline" onClick={() => setQty(l.slug, l.variant, l.qty + 1)}>+</button>
          </div>
          <p className="num w-28 text-right font-bold">{ngn(l.priceNGN * l.qty)}</p>
          <button type="button" aria-label={`Remove ${l.name}`} className="text-sm ink-muted hover:text-fusion" onClick={() => remove(l.slug, l.variant)}>✕</button>
        </div>
      ))}
      <div className="flex items-center justify-between p-4">
        <p className="font-display font-semibold">Total</p>
        <p className="num font-display text-xl font-bold">{ngn(totalNGN)}</p>
      </div>
      <div className="p-4">
        <Link href="/divisions/commerce/checkout" className="btn-primary w-full" style={{ background: "linear-gradient(120deg,#BE123C,#E11D48)", boxShadow: "0 8px 24px -12px rgba(225,29,72,.5)" }}>
          Proceed to checkout
        </Link>
        <p className="mt-3 text-center text-xs ink-muted">Delivery calculated at dispatch · 48-hour delivery in Abuja, Lagos & PH</p>
      </div>
    </div>
  );
}
