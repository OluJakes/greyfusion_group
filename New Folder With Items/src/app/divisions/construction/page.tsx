import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/Reveal";
import { MediaImage } from "@/components/media/MediaImage";
import { HERO_COVERS } from "@/lib/media";
import { getMainThumbnails } from "@/lib/gallery";
import { getPageContent } from "@/lib/content";
import { LeadForm } from "@/components/LeadForm";
import { PortfolioGrid } from "@/components/construction/PortfolioGrid";
import { TenderBoard } from "@/components/construction/TenderBoard";

export const metadata: Metadata = {
  title: "Construction & Engineering",
  description:
    "Civil infrastructure, structural engineering, design-build and general contracting — COREN-registered, ISO 9001-certified delivery across Nigeria.",
};

const SERVICES = [
  { title: "Civil Infrastructure", body: "Roads, drainage, bridges and earthworks to FMWH and state specifications — 96km of carriageway delivered to date." },
  { title: "Structural Engineering", body: "Design, detailing and supervision for commercial and institutional structures up to 18 storeys, Eurocode- and NBC-compliant." },
  { title: "Project Management & QS", body: "Independent PM and quantity surveying with open-book cost control; average final-account variance of 3.1%." },
  { title: "Industrial Design-Build", body: "Warehouses, processing plants and cold-chain facilities delivered as single-point EPC contracts." },
  { title: "General Contracting", body: "Main-contractor delivery with a vetted subcontractor bench of 240+ firms and a 0.41 LTIFR safety record." },
];

export default async function ConstructionPage() {
  const heroContent = await getPageContent('construction', {
    heroTitle: '{heroContent.heroTitle}',
    heroSubtitle: '214 projects. 96km of carriageway. Zero abandoned sites. Greyfusion Construction is a\n            COREN-registered, ISO 9001:2015-certified contractor with in-house engineering, plant and\n            QS capability — which is why our bids carry programme guarantees, not caveats.',
    heroVideos: [],
    heroImages: [],
    body: {},
  });
  const [projects, tenders] = await Promise.all([
    prisma.project.findMany({ orderBy: { year: "desc" } }),
    prisma.tender.findMany({ orderBy: { closingDate: "asc" } }),
  ]);
  const thumbs = await getMainThumbnails("project", projects.map((p) => p.id));

  return (
    <>
      <section className="relative overflow-hidden bg-graphite pb-20 pt-36 text-white">
        <div className="absolute inset-0"><MediaImage src={HERO_COVERS["construction"]} alt="Active heavy engineering at twilight" tint="#D97706" overlay={false} priority sizes="100vw" className="h-full w-full" imgClassName="brightness-[0.4] contrast-[1.05]" /></div>
        <span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(18,20,23,0.95), rgba(18,20,23,0.55) 50%, rgba(18,20,23,0.3))" }} />
        <span aria-hidden="true" className="absolute inset-x-0 top-0 z-10 keyline" style={{ background: "#D97706" }} />
        <div className="container-gf relative z-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "#D97706" }}>
            Construction & Engineering
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Infrastructure delivered to standard, on schedule.
          </h1>
          <p className="mt-6 leading-relaxed text-titanium">
            {heroContent.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#capability" className="btn-primary">Request a Capability Deck</a>
            <a href="#tenders" className="btn-ghost-dark">View open tenders</a>
          </div>
        </div>
      </section>

      <section id="services" className="container-gf py-20">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold">Capability statement</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={(i % 3) * 0.07}>
              <div className="card h-full p-6">
                <span className="keyline block w-10" style={{ background: "#D97706" }} />
                <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed ink-muted">{s.body}</p>
              </div>
            </Reveal>
          ))}
          <Reveal delay={0.21}>
            <div className="card flex h-full flex-col justify-between bg-graphite p-6 text-white">
              <div>
                <h3 className="font-display text-lg font-semibold">Compliance on file</h3>
                <p className="mt-2 text-sm leading-relaxed text-titanium">
                  ISO 9001:2015 · COREN R.12,481 · SON MANCAP · Federal Works Registration Cat. A ·
                  NSITF/PENCOM current.
                </p>
              </div>
              <Link href="/contact" className="mt-6 text-sm font-semibold" style={{ color: "#F5B04C" }}>
                Request compliance pack →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="portfolio" className="border-y hairline bg-[var(--surface)] py-20">
        <div className="container-gf">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold">Project portfolio</h2>
            <p className="mt-3 max-w-2xl ink-muted">
              Filter by sector or status. Every entry links to the full engineering narrative —
              scope, contract value band, and the problem we actually solved.
            </p>
          </Reveal>
          <div className="mt-10">
            <PortfolioGrid
              projects={projects.map((p) => ({
                slug: p.slug, title: p.title, sector: p.sector, status: p.status,
                location: p.location, valueBand: p.valueBand, year: p.year, client: p.client, summary: p.summary,
                thumbnailUrl: thumbs[p.id],
              }))}
            />
          </div>
        </div>
      </section>

      <section id="tenders" className="container-gf py-20">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold">Tenders & procurement</h2>
          <p className="mt-3 max-w-2xl ink-muted">
            Open RFPs from Greyfusion Construction and its project SPVs. Registered vendors receive
            tender documents by email within 24 hours of request.
          </p>
        </Reveal>
        <div className="mt-8">
          <TenderBoard
            tenders={tenders.map((t) => ({
              refNo: t.refNo, title: t.title, category: t.category,
              closingDate: t.closingDate.toISOString(), status: t.status, description: t.description,
            }))}
          />
        </div>
      </section>

      <section id="vendor" className="border-t hairline bg-[var(--surface)] py-20">
        <div className="container-gf grid gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold">Vendor & subcontractor registration</h2>
            <p className="mt-4 leading-relaxed ink-muted">
              We maintain a pre-qualified bench of 240+ subcontractors and suppliers. Registration is
              free, reviewed within five working days, and required before any tender award. Have your
              CAC documents, tax clearance and HSE policy ready — we will request them at
              pre-qualification.
            </p>
            <ul className="mt-6 space-y-2 text-sm ink-muted">
              <li>· Payment terms: certified valuations, 21-day cycle</li>
              <li>· HSE induction mandatory before site access</li>
              <li>· Retention: 5%, released at DLP completion</li>
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card p-6">
              <LeadForm
                type="VENDOR_REG"
                division="construction"
                cta="Register as a vendor"
                successNote="Our procurement desk reviews registrations within five working days."
                fields={[
                  { name: "company", label: "Company name", kind: "text", required: true, half: true },
                  { name: "rcNumber", label: "RC number", kind: "text", required: true, half: true },
                  { name: "category", label: "Trade category", kind: "select", required: true, options: ["Civil works", "Electrical", "Mechanical / HVAC", "Aluminium & glazing", "Supply — aggregates", "Supply — steel & rebar", "Plant hire", "Other"] },
                  { name: "capacity", label: "Largest contract executed (₦)", kind: "number", half: true },
                  { name: "yearsActive", label: "Years in operation", kind: "number", half: true },
                ]}
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section id="capability" className="bg-graphite py-20 text-white">
        <div className="container-gf grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-semibold">Request a Capability Deck</h2>
            <p className="mt-4 leading-relaxed text-titanium">
              A 24-page PDF: organisation profile, plant schedule, key personnel CVs, project
              references with client contacts, and current certifications. Sent same day, no
              follow-up calls unless you ask.
            </p>
          </div>
          <div className="card p-6">
            <LeadForm
              type="CAPABILITY_DECK"
              division="construction"
              compact
              cta="Send me the deck"
              successNote="The capability deck is on its way to your inbox."
              fields={[{ name: "organisation", label: "Organisation", kind: "text", required: true }]}
            />
          </div>
        </div>
      </section>
    </>
  );
}
