import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/Reveal";
import { MediaImage } from "@/components/media/MediaImage";
import { HERO_COVERS } from "@/lib/media";
import { getMainThumbnails } from "@/lib/gallery";
import { getPageContent } from "@/lib/content";
import { LeadForm } from "@/components/LeadForm";
import { PropertyBrowser } from "@/components/realestate/PropertyBrowser";

export const metadata: Metadata = {
  title: "Real Estate",
  description:
    "Shortlets, residential, commercial and warehousing across Abuja, Lagos and Port Harcourt — transparent Naira pricing, instant shortlet booking.",
};

const ACCENT = "#0D9488";

export default async function RealEstatePage() {
  const heroContent = await getPageContent('real-estate', {
    heroTitle: '{heroContent.heroTitle}',
    heroSubtitle: 'A 96%-occupancy portfolio across Abuja, Lagos and Port Harcourt. Every listing shows the\n            full cost — rent, service charge, deposit, caution — in Naira, before you ask.',
    heroVideos: [],
    heroImages: [],
    body: {},
  });
  const properties = await prisma.property.findMany({ orderBy: { featured: "desc" } });
  const thumbs = await getMainThumbnails("property", properties.map((p) => p.id));

  return (
    <>
      <section className="relative overflow-hidden bg-graphite pb-20 pt-36 text-white">
        <div className="absolute inset-0"><MediaImage src={HERO_COVERS["real-estate"]} alt="Luxury architectural property at twilight" tint="#0D9488" overlay={false} priority sizes="100vw" className="h-full w-full" imgClassName="brightness-[0.4] contrast-[1.05]" /></div>
        <span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(18,20,23,0.95), rgba(18,20,23,0.55) 50%, rgba(18,20,23,0.3))" }} />
        <span aria-hidden="true" className="absolute inset-x-0 top-0 z-10 keyline" style={{ background: ACCENT }} />
        <div className="container-gf relative z-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: ACCENT }}>Real Estate</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Space that works as hard as you do.
          </h1>
          <p className="mt-6 leading-relaxed text-titanium">
            {heroContent.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#listings" className="btn-primary" style={{ background: "linear-gradient(120deg,#0F766E,#0D9488 60%,#14B8A6)", boxShadow: "0 8px 24px -12px rgba(13,148,136,.5)" }}>
              Browse properties
            </a>
            <a href="#maintenance" className="btn-ghost-dark">Tenant maintenance</a>
          </div>
        </div>
      </section>

      <section id="listings" className="container-gf py-16">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold">The marketplace</h2>
        </Reveal>
        <div className="mt-8">
          <PropertyBrowser
            properties={properties.map((p) => ({
              slug: p.slug, title: p.title, type: p.type, location: p.location, city: p.city,
              priceNGN: p.priceNGN, nightlyNGN: p.nightlyNGN, beds: p.beds, baths: p.baths, sqm: p.sqm, summary: p.summary,
              thumbnailUrl: thumbs[p.id],
            }))}
          />
        </div>
      </section>

      <section id="maintenance" className="border-t hairline bg-[var(--surface)] py-20">
        <div className="container-gf grid gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold">Tenant maintenance portal</h2>
            <p className="mt-4 leading-relaxed ink-muted">
              Current tenants: log issues here, not in the group chat. Plumbing and electrical
              faults are triaged same-day; our facilities team confirms an appointment window by
              WhatsApp.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card p-6">
              <LeadForm
                type="MAINTENANCE"
                division="real-estate"
                cta="Log maintenance request"
                successNote="Facilities will confirm an appointment window by WhatsApp."
                fields={[
                  { name: "propertyName", label: "Property / unit", kind: "text", required: true, placeholder: "e.g. Wuse Atrium, Unit 12B", half: true },
                  { name: "issueType", label: "Issue type", kind: "select", required: true, options: ["Plumbing", "Electrical", "AC / cooling", "Structural", "Security", "Other"], half: true },
                  { name: "urgency", label: "Urgency", kind: "select", required: true, options: ["Emergency — today", "This week", "Whenever convenient"], half: true },
                  { name: "details", label: "Describe the issue", kind: "textarea", required: true },
                ]}
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
