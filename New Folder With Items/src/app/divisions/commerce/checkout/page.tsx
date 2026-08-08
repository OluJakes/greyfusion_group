import type { Metadata } from "next";
import { Checkout } from "@/components/commerce/Checkout";
import { resolveFxRates } from "@/lib/fx";

export const metadata: Metadata = { title: "Checkout · Store" };

export default async function CheckoutPage() {
  const fx = await resolveFxRates();
  return (
    <section className="container-gf min-h-[60vh] max-w-2xl pb-20 pt-32">
      <h1 className="font-display text-3xl font-semibold">Checkout</h1>
      <div className="mt-8"><Checkout fx={fx} /></div>
    </section>
  );
}
