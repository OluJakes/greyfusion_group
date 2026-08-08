"use client";

import { useCallback, useEffect, useState } from "react";
import { trackOrder } from "@/app/actions";
import { cn, ngn, fmtDate, safeJson } from "@/lib/utils";

const FLOW = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export function OrderTracker() {
  const [ref, setRef] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "notfound" | "found">("idle");
  const [order, setOrder] = useState<{ ref: string; status: string; totalNGN: number; createdAt: string; items: string } | null>(null);

  const run = useCallback(async (value: string) => {
    setState("loading");
    const res = await trackOrder(value);
    if (!res) {
      setState("notfound");
      setOrder(null);
    } else {
      setOrder(res);
      setState("found");
    }
  }, []);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("ref");
    if (fromUrl) {
      setRef(fromUrl);
      void run(fromUrl);
    }
  }, [run]);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    await run(ref);
  };

  const stageIdx = order ? FLOW.indexOf(order.status) : -1;
  const items = order ? safeJson<{ name: string; qty: number; priceNGN: number }[]>(order.items, []) : [];

  return (
    <div>
      <form onSubmit={lookup} className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="track-ref" className="sr-only">Order number</label>
        <input id="track-ref" required value={ref} onChange={(e) => setRef(e.target.value)} placeholder="GF-ORD-…" className="input-gf num flex-1 uppercase" />
        <button type="submit" className="btn-primary shrink-0" style={{ background: "linear-gradient(120deg,#BE123C,#E11D48)" }} disabled={state === "loading"}>
          {state === "loading" ? "Checking…" : "Track"}
        </button>
      </form>

      {state === "notfound" && <p className="card mt-5 p-5 text-sm ink-muted">No order found with that number. Check the confirmation email — or WhatsApp us and we&apos;ll dig it out.</p>}

      {state === "found" && order && (
        <div className="card mt-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="num font-display text-lg font-bold">{order.ref}</p>
            <p className="num text-sm ink-muted">Placed {fmtDate(order.createdAt)}</p>
          </div>
          <ol className="mt-6 space-y-0" aria-label="Order progress">
            {FLOW.map((s, i) => (
              <li key={s} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold", i <= stageIdx ? "bg-[#E11D48] text-white" : "surface-2 ink-muted")}>
                    {i < stageIdx ? "✓" : i + 1}
                  </span>
                  {i < FLOW.length - 1 && <span className={cn("h-6 w-0.5", i < stageIdx ? "bg-[#E11D48]" : "bg-[var(--line)]")} aria-hidden="true" />}
                </div>
                <span className={cn("text-sm font-semibold capitalize", i <= stageIdx ? "" : "ink-muted")}>{s.toLowerCase()}</span>
              </li>
            ))}
          </ol>
          <dl className="num mt-5 space-y-1.5 border-t pt-4 hairline text-sm">
            {items.map((l) => (
              <div key={l.name} className="flex justify-between gap-3">
                <dt className="truncate ink-muted">{l.qty} × {l.name}</dt>
                <dd>{ngn(l.priceNGN * l.qty)}</dd>
              </div>
            ))}
            <div className="flex justify-between border-t pt-2 hairline font-bold"><dt>Total</dt><dd>{ngn(order.totalNGN)}</dd></div>
          </dl>
        </div>
      )}
    </div>
  );
}
