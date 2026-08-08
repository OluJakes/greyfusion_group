import type { Metadata } from "next";
import { OrderTracker } from "@/components/commerce/OrderTracker";

export const metadata: Metadata = { title: "Track your order · Store" };

export default function TrackPage() {
  return (
    <section className="container-gf min-h-[60vh] max-w-xl pb-20 pt-32">
      <h1 className="font-display text-3xl font-semibold">Track your order</h1>
      <p className="mt-3 text-sm ink-muted">Enter the order number from your confirmation (e.g. GF-ORD-20260719-4821).</p>
      <div className="mt-6"><OrderTracker /></div>
    </section>
  );
}
