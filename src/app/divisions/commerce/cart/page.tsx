import type { Metadata } from "next";
import { CartView } from "@/components/commerce/CartView";

export const metadata: Metadata = { title: "Cart · Store" };

export default function CartPage() {
  return (
    <section className="container-gf min-h-[60vh] max-w-3xl pb-20 pt-32">
      <h1 className="font-display text-3xl font-semibold">Your cart</h1>
      <div className="mt-8"><CartView /></div>
    </section>
  );
}
