import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/Reveal";
import { MediaImage } from "@/components/media/MediaImage";
import { HERO_COVERS } from "@/lib/media";
import { getMainThumbnails } from "@/lib/gallery";
import { getPageContent } from "@/lib/content";
import { LeadForm } from "@/components/LeadForm";
import { StoreFront } from "@/components/commerce/StoreFront";

export const metadata: Metadata = {
  title: "eCommerce Store",
  description:
    "Solar components, inverters, retail electronics, smart home and enterprise hardware — live stock, Naira pricing, 48-hour delivery in Abuja, Lagos and PH.",
};

const ACCENT = "#E11D48";

export default async function CommercePage() {
  const heroContent = await getPageContent('commerce', {
    heroTitle: '{heroContent.heroTitle}',
    heroSubtitle: 'The same panels, inverters and batteries our energy division installs — plus electronics\n            and smart-home kit — stocked in our warehouses, priced in Naira, delivered in 48 hours\n            within Abuja, Lagos and Port Harcourt.',
    heroVideos: [],
    heroImages: [],
    body: {},
  });
  const products = await prisma.product.findMany({ orderBy: [{ featured: "desc" }, { name: "asc" }] });
  const thumbs = await getMainThumbnails("product", products.map((p) => p.id));

  return (
    <>
      <section className="relative overflow-hidden bg-graphite pb-20 pt-36 text-white">
        <div className="absolute inset-0"><MediaImage src={HERO_COVERS["commerce"]} alt="Automated logistics distribution hub" tint="#E11D48" overlay={false} priority sizes="100vw" className="h-full w-full" imgClassName="brightness-[0.4] contrast-[1.05]" /></div>
        <span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(18,20,23,0.95), rgba(18,20,23,0.55) 50%, rgba(18,20,23,0.3))" }} />
        <span aria-hidden="true" className="absolute inset-x-0 top-0 z-10 keyline" style={{ background: ACCENT }} />
        <div className="container-gf relative z-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: ACCENT }}>Greyfusion Store</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Enterprise-grade hardware, retail-grade checkout.
          </h1>
          <p className="mt-6 leading-relaxed text-titanium">
            {heroContent.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#store" className="btn-primary" style={{ background: "linear-gradient(120deg,#BE123C,#E11D48)", boxShadow: "0 8px 24px -12px rgba(225,29,72,.5)" }}>
              Shop the store
            </a>
            <Link href="/divisions/commerce/track" className="btn-ghost-dark">Track an order</Link>
          </div>
        </div>
      </section>

      <section id="store" className="container-gf py-16">
        <Reveal><h2 className="font-display text-3xl font-semibold">Storefront</h2></Reveal>
        <div className="mt-8">
          <StoreFront
            products={products.map((p) => ({
              slug: p.slug, name: p.name, category: p.category, priceNGN: p.priceNGN,
              stock: p.stock, variants: p.variants, summary: p.summary, thumbnailUrl: thumbs[p.id],
            }))}
          />
        </div>
      </section>

      <section id="b2b" className="border-t hairline bg-[var(--surface)] py-20">
        <div className="container-gf grid gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold">B2B procurement</h2>
            <p className="mt-4 leading-relaxed ink-muted">
              Installers, estates and enterprises: bulk pricing kicks in from 10 units or ₦5M order
              value. Dedicated account manager, 30-day terms for approved accounts, and delivery
              scheduling to project milestones — the Sunmart rollout shipped to 214 stores on this
              desk.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card p-6">
              <LeadForm
                type="B2B_QUOTE"
                division="commerce"
                cta="Request bulk quote"
                successNote="A procurement account manager replies with pricing within one working day."
                fields={[
                  { name: "company", label: "Company", kind: "text", required: true, half: true },
                  { name: "orderValue", label: "Indicative order value (₦)", kind: "number", half: true },
                  { name: "requirements", label: "What do you need?", kind: "textarea", required: true, placeholder: "Products, quantities, delivery location and timeline…" },
                ]}
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
