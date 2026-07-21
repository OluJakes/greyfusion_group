import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { getPageContent } from "@/lib/content";
import { LeadForm } from "@/components/LeadForm";
import { SolarEstimator } from "@/components/energy/SolarEstimator";
import { ProEssCalculator } from "@/components/energy/ProEssCalculator";
import { MediaImage } from "@/components/media/MediaImage";
import { HERO_COVERS } from "@/lib/media";

export const metadata: Metadata = {
  title: "Renewable Energy",
  description:
    "Hybrid micro-grids, commercial solar, storage and O&M — 48MW deployed across Nigeria. Run the Solar ROI estimator with real irradiance data.",
};

const ACCENT = "#16A34A";

const SOLUTION_IMAGES = ["photo-1509391366360-2e959784a276", "photo-1508514177221-188b1cf16e9d", "photo-1466611653911-95081537e5b7", "photo-1548337138-e87d889cc369"];

const SOLUTIONS = [
  { title: "Hybrid Micro-Grids", body: "PV + storage + generator orchestration for estates, campuses and agro-processing. Our flagship: 2.4MW/4.8MWh at Zenith Agro, 99.2% uptime over two harmattan seasons." },
  { title: "Commercial Grid-Tied", body: "Roof and ground-mount arrays from 50kWp to 5MWp with export limitation compliant to DisCo interconnection rules." },
  { title: "Energy Storage Systems", body: "LiFePO₄ banks engineered for 6,000+ cycles at 35°C ambient — sized from telemetry, not thumb rules." },
  { title: "Operations & Maintenance", body: "SLA-backed O&M with quarterly IV-curve tracing, thermal imaging and a 4-hour response window in Abuja, Lagos and PH." },
];

const SPEC_SHEETS = [
  { model: "GF-P580M", type: "Panel", specs: "580Wp N-type TOPCon bifacial · 22.6% eff. · 30-yr linear warranty" },
  { model: "GF-P450M", type: "Panel", specs: "450Wp mono PERC · 21.3% eff. · 25-yr linear warranty" },
  { model: "GF-INV-50K", type: "Inverter", specs: "50kW 3-phase hybrid · 98.1% max eff. · IP65 · 6 MPPT" },
  { model: "GF-INV-10K", type: "Inverter", specs: "10kW single/3-phase hybrid · 97.6% eff. · parallel up to 10 units" },
  { model: "GF-BAT-15K", type: "Battery", specs: "15.36kWh LiFePO₄ · 6,000 cycles @ 80% DoD · CAN/RS485 BMS" },
  { model: "GF-BAT-5K", type: "Battery", specs: "5.12kWh LiFePO₄ wall-mount · 6,000 cycles · stackable to 30.7kWh" },
];

export default async function EnergyPage() {
  const heroContent = await getPageContent('energy', {
    heroTitle: '{heroContent.heroTitle}',
    heroSubtitle: '48MW deployed. 99.2% fleet uptime. Every system we ship is sized from measured load data\n            and real irradiance — then guaranteed in the contract, not the brochure.',
    heroVideos: [],
    heroImages: [],
    body: {},
  });
  return (
    <>
      {/* Hero — explicit z-index layering keeps typography legible over ambient media.
          z-0 background media → z-10 protective dark + directional gradients → z-20 text. */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-graphite pt-20 text-white">
        <div className="absolute inset-0 z-0">
          <MediaImage src={HERO_COVERS["energy"]} alt="Vast photovoltaic solar array at golden hour" tint={ACCENT} overlay={false} priority sizes="100vw" className="h-full w-full" imgClassName="brightness-[0.45] contrast-[1.1]" />
          {/* Protective filter + directional gradients — contrast defense for the copy. */}
          <span aria-hidden="true" className="absolute inset-0 bg-graphite/55" />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-graphite via-graphite/85 to-graphite/20" />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-graphite via-graphite/35 to-transparent" />
        </div>
        <span aria-hidden="true" className="absolute inset-x-0 top-0 z-20 keyline" style={{ background: ACCENT }} />
        <svg aria-hidden="true" className="pointer-events-none absolute right-0 top-16 z-10 hidden w-[36rem] opacity-50 lg:block" viewBox="0 0 600 300" fill="none">
          <path d="M40 260 A 260 260 0 0 1 560 260" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="5 7" className="animate-thread" />
          <circle cx="300" cy="60" r="26" fill={ACCENT} opacity="0.9" />
          <circle cx="300" cy="60" r="40" stroke={ACCENT} strokeWidth="1" opacity="0.4" />
          <line x1="40" y1="260" x2="560" y2="260" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        </svg>
        <div className="container-gf relative z-20 max-w-3xl py-24">
          <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-300 backdrop-blur-md">
            Renewable Energy
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.55)] sm:text-6xl sm:leading-[1.05]">
            Power that answers to engineering.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-200 sm:text-xl">
            {heroContent.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#pro-ess-calculator"
              className="btn-primary"
              style={{ background: "linear-gradient(120deg,#15803D,#16A34A 60%,#22C55E)", boxShadow: "0 8px 24px -12px rgba(22,163,74,.55)" }}
            >
              Run the Pro ESS Calculator
            </a>
            <a href="#estimator" className="btn-ghost-dark backdrop-blur-sm">Solar ROI estimator</a>
          </div>
        </div>
      </section>

      <section id="pro-ess-calculator" className="container-gf py-20">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: ACCENT }}>⚡ Engineering-grade sizing</p>
          <h2 className="mt-3 font-display text-3xl font-semibold">Pro ESS — solar &amp; storage sizing engine</h2>
          <p className="mt-3 max-w-2xl ink-muted">
            Build your load profile and get a first-pass battery bank, PV array and hybrid inverter
            specification — sized with LiFePO₄ depth-of-discharge, West African peak-sun-hours and real
            system-loss factors, not thumb rules.
          </p>
        </Reveal>
        <div className="mt-10"><ProEssCalculator /></div>
      </section>

      <section id="solutions" className="container-gf py-20">
        <Reveal><h2 className="font-display text-3xl font-semibold">Solutions</h2></Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {SOLUTIONS.map((s, i) => (
            <Reveal key={s.title} delay={(i % 2) * 0.07}>
              <div className="group card h-full overflow-hidden">
                <MediaImage
                  src={`https://images.unsplash.com/${SOLUTION_IMAGES[i % SOLUTION_IMAGES.length]}?auto=format&fit=crop&w=1200&q=80`}
                  alt={s.title}
                  tint={ACCENT}
                  className="h-40"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
                <div className="p-6">
                  <span className="keyline block w-10" style={{ background: ACCENT }} />
                  <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed ink-muted">{s.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="estimator" className="border-y hairline bg-[var(--surface)] py-20">
        <div className="container-gf">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: ACCENT }}>⚡ Division centerpiece</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">Solar ROI & Yield Estimator</h2>
            <p className="mt-3 max-w-2xl ink-muted">
              Six Nigerian irradiance zones, real 2026 tariffs and diesel economics. Slide your
              current spend — the engineering answers update live.
            </p>
          </Reveal>
          <div className="mt-10"><SolarEstimator /></div>
        </div>
      </section>

      <section id="specs" className="container-gf py-20">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold">Spec-sheet library</h2>
          <p className="mt-3 max-w-2xl ink-muted">Datasheets for the hardware we actually install. Request the PDF pack and it lands in your inbox within the hour.</p>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SPEC_SHEETS.map((s, i) => (
            <Reveal key={s.model} delay={(i % 3) * 0.06}>
              <div className="card flex h-full flex-col p-5">
                <div className="flex items-center justify-between">
                  <span className="num font-display text-lg font-semibold">{s.model}</span>
                  <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold text-white" style={{ background: ACCENT }}>{s.type}</span>
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed ink-muted">{s.specs}</p>
                <a
                  href={`mailto:energy@greyfusion.com.ng?subject=${encodeURIComponent("Spec sheet request — " + s.model)}`}
                  className="mt-4 text-sm font-semibold" style={{ color: ACCENT }}
                >
                  Request datasheet (PDF) ↓
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="maintenance" className="border-t hairline bg-[var(--surface)] py-20">
        <div className="container-gf grid gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold">Request a survey or maintenance visit</h2>
            <p className="mt-4 leading-relaxed ink-muted">
              For new systems we start with a load audit and site survey. For existing systems —
              ours or anyone&apos;s — our O&M crew diagnoses before it quotes. Response within
              4 working hours in Abuja, Lagos and Port Harcourt.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card p-6">
              <LeadForm
                type="MAINTENANCE"
                division="energy"
                cta="Book the visit"
                successNote="Our energy desk will confirm a slot within 4 working hours."
                fields={[
                  { name: "requestType", label: "Request type", kind: "select", required: true, options: ["New system — site survey", "Existing system — fault callout", "Existing system — preventive maintenance", "O&M contract enquiry"] },
                  { name: "siteAddress", label: "Site address", kind: "text", required: true },
                  { name: "systemDetails", label: "System details / symptoms", kind: "textarea", placeholder: "Inverter brand & size, battery bank, what's happening…" },
                ]}
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
