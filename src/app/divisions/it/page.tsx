import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { getPageContent } from "@/lib/content";
import { TerminalHero } from "@/components/it/TerminalHero";
import { ReadinessChecker } from "@/components/it/ReadinessChecker";
import { Helpdesk, ClientPortal } from "@/components/it/Helpdesk";
import { LeadForm } from "@/components/LeadForm";
import { MediaImage } from "@/components/media/MediaImage";
import { MEDIA, HERO_COVERS } from "@/lib/media";

export const metadata: Metadata = {
  title: "Information Technology",
  description:
    "Greyfusion IT: cybersecurity, GRC, cloud, DevOps, web & app development, data analytics, AI/ML — plus full device-lifecycle IT infrastructure across Nigeria & West Africa. Fulfilment partner to Deel IT.",
};

const ACCENT = "#6366F1";

const SERVICES = [
  { title: "Cybersecurity Operations", body: "24/7 SOC with 1.8-second median containment on endpoint isolation. SIEM, EDR and threat-intel tuned for Nigerian financial and public-sector threat profiles." },
  { title: "GRC & Compliance", body: "ISO 27001, SOC 2 and NIST CSF programmes run as evidence pipelines, not audit scrambles. Meridian Trust Bank certified in 11 months." },
  { title: "Cloud Architecture", body: "Landing zones, migration and FinOps on AWS and Azure — 40+ workloads moved with zero unplanned downtime." },
  { title: "Managed DevOps", body: "Pipelines, IaC and on-call engineering as a service. Median deploy time for onboarded teams drops from days to 26 minutes." },
  { title: "Web & App Development", body: "Design-led product engineering: Next.js/React web platforms, Flutter & native mobile apps, and the APIs behind them — shipped with tests, telemetry and documentation your next team can inherit." },
  { title: "Data Analytics & BI", body: "Warehouses, ELT pipelines and executive dashboards that reconcile to the general ledger. We turn operational exhaust into decisions — Power BI, Metabase or bespoke." },
  { title: "AI & Machine Learning", body: "Practical ML in production: document intelligence, demand forecasting, fraud-signal models and LLM assistants grounded on your data — deployed with evaluation harnesses, not hype." },
  { title: "IT Infrastructure & Device Lifecycle", body: "Multiscale IT infrastructure provision & management: procurement, enrollment, delivery, retrieval, wipe and redeployment — the machinery behind our Deel IT partnership." },
];

const FRAMEWORKS = [
  { name: "ISO 27001:2022", plain: "The international standard for running security as a managed system. Best when clients and regulators ask 'are you certified?' — we take you from gap assessment to certificate, typically in 9–14 months." },
  { name: "SOC 2 Type II", plain: "The report US and SaaS partners request. Proves your controls operated effectively over 6–12 months. We build the evidence pipeline so the audit becomes an export, not a scramble." },
  { name: "NIST CSF 2.0", plain: "A pragmatic maturity map — no certificate, maximum clarity. Ideal first framework for boards that want a roadmap before committing to certification." },
];

const LIFECYCLE = [
  { step: "01", title: "Procurement & Quoting", body: "Multi-brand sourcing with competitive quotes, model options and live stock visibility — typical turnaround 24–48 hours. Import and customs clearance handled; AppleCare facilitated." },
  { step: "02", title: "Enrollment & MDM", body: "Apple Business Manager, Windows Autopilot and MDM configuration before dispatch — every device leaves our facility pre-enrolled, tested and day-one ready." },
  { step: "03", title: "Last-Mile Delivery", body: "Tracked physical delivery to any end-user location in Nigeria with proof of delivery — and regional reach into Ghana, Côte d'Ivoire, Senegal, Sierra Leone, Benin and Togo." },
  { step: "04", title: "Retrieval, Wipe & Storage", body: "End-of-life collection, certified secure data wipe, repair and refurbishment, and storage-for-reuse in our secure warehouse — closing the loop on every asset." },
];

const DEVICE_COVERAGE = [
  { cat: "Computing", items: "Laptops · desktops · tablets & 2-in-1s · servers & NAS" },
  { cat: "Peripherals", items: "Monitors · keyboards & mice · security keys (YubiKey)" },
  { cat: "Print & AV", items: "Printers · scanners · projectors · display screens" },
  { cat: "Power & Workspace", items: "Inverters · power stations · desks · ergonomic chairs" },
];

const IT_CLIENTS = [
  { name: "Deel IT (formerly Hofy)", scope: "IT fulfilment partner — Nigeria", scale: "50–100 assets", sector: "Global HR/IT platform" },
  { name: "United Nations", scope: "IT procurement & support", scale: "100–200 assets", sector: "International organisation" },
  { name: "Tiko B.V", scope: "Device procurement & logistics", scale: "50–100 assets", sector: "Real-estate tech, Africa" },
  { name: "350.org", scope: "Device procurement & delivery", scale: "20–50 assets", sector: "Global climate NGO" },
  { name: "Spryker Systems GmbH", scope: "Device supply & enrollment", scale: "10–20 assets", sector: "Enterprise software, Germany" },
];

const INDUSTRIES = [
  "Banking & fintech", "Government & public sector", "Health & pharma", "Oil, gas & energy",
  "Telecoms", "Education", "NGOs & multilaterals", "Retail & logistics",
];

export default async function ITPage() {
  const heroContent = await getPageContent('it', {
    heroTitle: '{heroContent.heroTitle}',
    heroSubtitle: 'From the SOC that certified a bank to the warehouse that fulfils Deel IT&apos;s Nigeria\n              operations: security, software, data, AI and the full device lifecycle — one partner,\n              enterprise accountability, West Africa reach.',
    heroVideos: [],
    heroImages: [],
    body: {},
  });
  return (
    <>
      <section className="relative overflow-hidden bg-graphite pb-20 pt-36 text-white">
        <div className="absolute inset-0"><MediaImage src={HERO_COVERS["it"]} alt="High-density enterprise data centre racks with cyan telemetry" tint={ACCENT} overlay={false} priority sizes="100vw" className="h-full w-full" imgClassName="brightness-[0.38] contrast-[1.1]" /></div>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(18,20,23,0.88), rgba(18,20,23,0.6) 50%, rgba(18,20,23,0.95))" }}
        />
        <span aria-hidden="true" className="absolute inset-x-0 top-0 keyline z-10" style={{ background: ACCENT }} />
        <div className="container-gf relative z-10 grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "#A5B4FC" }}>Greyfusion IT · Incorporated 2013</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Your end-to-end IT partner on the ground.
            </h1>
            <p className="mt-6 leading-relaxed text-titanium">
              {heroContent.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#services" className="btn-primary" style={{ background: "linear-gradient(120deg,#4F46E5,#6366F1 60%,#818CF8)", boxShadow: "0 8px 24px -12px rgba(99,102,241,.5)" }}>
                Explore services
              </a>
              <a href="#helpdesk" className="btn-ghost-dark backdrop-blur-sm">Open a ticket</a>
            </div>
            <dl className="num mt-10 grid max-w-md grid-cols-4 gap-4 border-t border-white/10 pt-6 text-center">
              {[["7+", "Years operating"], ["5+", "Global clients"], ["Full", "IT lifecycle"], ["NG+", "West Africa"]].map(([v, l]) => (
                <div key={l}>
                  <dt className="order-2 mt-1 block text-[10px] uppercase tracking-wider text-titanium">{l}</dt>
                  <dd className="font-display text-2xl font-bold" style={{ color: "#A5B4FC" }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <TerminalHero />
        </div>
      </section>

      <section id="services" className="container-gf py-20">
        <Reveal><h2 className="font-display text-3xl font-semibold">Services</h2>
          <p className="mt-3 max-w-2xl ink-muted">Eight practices, one engineering culture: everything measured, everything documented, everything owned end to end.</p>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={(i % 4) * 0.06}>
              <div className="card h-full p-6 backdrop-blur-md transition-all duration-500 hover:shadow-2xl">
                <span className="keyline block w-10" style={{ background: ACCENT }} />
                <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed ink-muted">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="group">
              <MediaImage src={MEDIA.it.gallery[0]} alt="High-density server racks under neon-cyan cooling" tint={ACCENT} className="h-56 rounded-2xl" sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
            <div className="group">
              <MediaImage src={MEDIA.it.gallery[3] ?? MEDIA.it.gallery[1]} alt="Engineering team shipping production code" tint={ACCENT} className="h-56 rounded-2xl" sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
          </div>
        </Reveal>
      </section>

      <section id="lifecycle" className="border-y hairline bg-graphite py-20 text-white">
        <div className="container-gf">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: "#A5B4FC" }}>Device lifecycle · proven with Deel IT</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">Full lifecycle, on the ground.</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-titanium">
              We are the in-country IT fulfilment partner for Deel IT (formerly Hofy) — managing the
              complete asset lifecycle in Nigeria so global platforms never coordinate multiple
              vendors in-country. You&apos;re not onboarding from zero.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {LIFECYCLE.map((l, i) => (
              <Reveal key={l.step} delay={i * 0.07}>
                <div className="card h-full border-white/10 bg-graphite-2 p-6 text-white backdrop-blur-md">
                  <span className="num font-display text-3xl font-bold" style={{ color: "#A5B4FC" }}>{l.step}</span>
                  <h3 className="mt-3 font-display text-base font-semibold">{l.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-titanium">{l.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <div className="card mt-8 grid gap-4 border-white/10 bg-graphite-2 p-6 text-white sm:grid-cols-2 lg:grid-cols-4">
              {DEVICE_COVERAGE.map((d) => (
                <div key={d.cat}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#A5B4FC" }}>{d.cat}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-titanium">{d.items}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-gf py-20">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold">Trusted by global organisations</h2>
          <p className="mt-3 max-w-2xl ink-muted">International clients operating across Nigeria and West Africa — coverage and SLAs confirmed per country.</p>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {IT_CLIENTS.map((c, i) => (
            <Reveal key={c.name} delay={(i % 3) * 0.06}>
              <div className="card h-full p-5 backdrop-blur-md transition-all duration-500 hover:shadow-2xl">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-base font-semibold">{c.name}</h3>
                  <span className="num shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold text-white" style={{ background: ACCENT }}>{c.scale}</span>
                </div>
                <p className="mt-2 text-sm font-medium">{c.scope}</p>
                <p className="mt-1 text-xs ink-muted">{c.sector}</p>
              </div>
            </Reveal>
          ))}
          <Reveal delay={0.18}>
            <div className="card flex h-full flex-col justify-between bg-graphite p-5 text-white">
              <div>
                <h3 className="font-display text-base font-semibold">Industries we serve</h3>
                <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-titanium">
                  {INDUSTRIES.map((ind) => (
                    <li key={ind} className="flex items-center gap-1.5"><span style={{ color: "#A5B4FC" }} aria-hidden="true">▸</span>{ind}</li>
                  ))}
                </ul>
              </div>
              <p className="mt-4 text-xs text-titanium">West Africa: 🇳🇬 🇬🇭 🇨🇮 🇸🇳 🇸🇱 🇧🇯 🇹🇬</p>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <h3 className="mt-14 font-display text-2xl font-semibold">GRC, in plain English</h3>
        </Reveal>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {FRAMEWORKS.map((f, i) => (
            <Reveal key={f.name} delay={i * 0.07}>
              <div className="card h-full bg-graphite p-6 text-white">
                <h4 className="num font-display text-lg font-semibold" style={{ color: "#A5B4FC" }}>{f.name}</h4>
                <p className="mt-2 text-sm leading-relaxed text-titanium">{f.plain}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="readiness" className="border-y hairline bg-[var(--surface)] py-20">
        <div className="container-gf">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold">Compliance readiness checker</h2>
            <p className="mt-3 max-w-2xl ink-muted">
              Eight questions, sixty seconds, zero email required. Your score maps to the same
              domains an auditor samples first.
            </p>
          </Reveal>
          <div className="mt-10"><ReadinessChecker /></div>
        </div>
      </section>

      <section id="helpdesk" className="container-gf grid gap-10 py-20 lg:grid-cols-2">
        <div>
          <Reveal>
            <h2 className="font-display text-3xl font-semibold">IT Helpdesk</h2>
            <p className="mt-3 max-w-xl ink-muted">
              Clients on support contracts: file it here and it hits the on-call queue instantly.
              Critical incidents page an engineer within five minutes, 24/7.
            </p>
          </Reveal>
          <div className="card mt-8 p-6"><Helpdesk /></div>
        </div>
        <div className="lg:pt-[6.2rem]">
          <ClientPortal />
          <div className="card mt-5 p-5">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider">B2B & platform partnerships</h3>
            <p className="mt-2 text-sm leading-relaxed ink-muted">
              Global platform looking for an in-country fulfilment partner? Talk directly to our B2B desk.
            </p>
            <p className="mt-3 text-sm">
              <span className="font-semibold">Christine Chinasa</span> · B2B Manager, Greyfusion IT
            </p>
            <p className="num mt-1 text-sm ink-muted">christine.o@greyfusion.com.ng · +234 809 202 4484 · WhatsApp +234 909 977 0779</p>
            <div className="mt-4">
              <LeadForm
                type="B2B_QUOTE"
                division="it"
                compact
                cta="Book a 30-minute call"
                successNote="Christine's desk responds within one working day with proposed times."
                fields={[{ name: "organisation", label: "Organisation & what you need fulfilled", kind: "textarea", required: true, placeholder: "Platform, asset volumes, countries…" }]}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
