import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { getPageContent } from "@/lib/content";
import { LeadForm } from "@/components/LeadForm";
import { SmartHomeConfigurator } from "@/components/smarthome/SmartHomeConfigurator";
import { MediaImage } from "@/components/media/MediaImage";
import { MEDIA, HERO_COVERS } from "@/lib/media";
import { moneyIn, type Currency } from "@/lib/utils";
import { getPlans, type PlanView } from "@/lib/content";

export const metadata: Metadata = {
  title: "Smart Home & Security",
  description:
    "Home automation, access control, CCTV and integrated security systems for residential and commercial facilities across Nigeria — designed, installed and maintained by Greyfusion.",
};

const ACCENT = "#A855F7";

const RESIDENTIAL = [
  { title: "Whole-Home Automation", body: "Lighting scenes, climate, blinds and AV on one app and one wall panel — engineered to run on your inverter, not against it. Voice control via Alexa and Google, offline-first so NEPA never bricks your house." },
  { title: "Access Control & Smart Locks", body: "Fingerprint, PIN, card and app entry with full audit trails. Gate automation with GSM fallback, video doorbells with two-way talk, and temporary codes for staff and shortlet guests." },
  { title: "CCTV & Surveillance", body: "4K PoE cameras with colour night vision, licence-plate capture at the gate, and encrypted local + cloud recording that survives both outages and burglars who know to take the DVR." },
  { title: "Alarm & Intrusion Detection", body: "Perimeter beams, door/window contacts, glass-break and motion sensors — armed from your phone, escalating to sirens, lights-on scenes and your estate security desk." },
];

const COMMERCIAL = [
  { title: "Office & Facility Automation", body: "Occupancy-driven lighting and HVAC that cut energy spend 20–35%, meeting-room booking panels, and centralised scheduling across floors and branches." },
  { title: "Enterprise Access Control", body: "Card, biometric and mobile-credential systems for staff and visitors — anti-passback, time-zoned permissions, and clean CSV exports your HR and auditors will actually use." },
  { title: "Facility-Wide Surveillance", body: "Multi-site camera estates with a single command view, AI motion analytics that ignore the generator's heat shimmer, and retention policies mapped to NDPR." },
  { title: "Fire, Safety & BMS Integration", body: "Smoke and heat detection integrated with access (doors release, lifts ground), plus building-management hooks into pumps, tanks, generators and our solar-hybrid plants." },
];

const FALLBACK_PACKAGES: PlanView[] = [
  { id: "essential", title: "Essential", price: 6_850_000, currency: "NGN", billingCycle: "one-time", scope: "2-bed apartment", highlight: false, ctaText: "Start with a walkthrough", features: ["Smart lock + video doorbell", "4× 4K PoE cameras + NVR", "Smart lighting, 6 zones", "App + voice control", "1-year support"] },
  { id: "signature", title: "Signature", price: 12_500_000, currency: "NGN", billingCycle: "one-time", scope: "4-bed duplex", highlight: true, ctaText: "Start with a walkthrough", features: ["Everything in Essential", "Full lighting & AC automation", "Perimeter alarm + beams", "Gate automation w/ GSM", "Energy monitoring per circuit", "2-year support"] },
  { id: "estate", title: "Estate & Commercial", price: 0, currency: "NGN", billingCycle: "one-time", scope: "Engineered to spec", highlight: false, ctaText: "Start with a walkthrough", features: ["Multi-unit access control", "Facility-wide CCTV command view", "BMS & fire integration", "Solar-hybrid pairing", "SLA-backed maintenance"] },
];

export default async function SmartHomePage() {
  const heroContent = await getPageContent('smart-home', {
    heroTitle: '{heroContent.heroTitle}',
    heroSubtitle: 'Automation and security engineered for Nigerian realities: systems that ride through\n            outages on your inverter, cameras that keep recording when the DVR walks away, and one\n            app for everything from the gate to the generator. Residential, estate and commercial.',
    heroVideos: [],
    heroImages: [],
    body: {},
  });
  const dbPlans = await getPlans("smart-home");
  const packages = dbPlans.length > 0 ? dbPlans : FALLBACK_PACKAGES;
  return (
    <>
      <section className="relative overflow-hidden bg-graphite pb-20 pt-36 text-white">
        <div className="absolute inset-0" aria-hidden="true">
          <MediaImage
            src={HERO_COVERS["smart-home"]}
            alt=""
            tint={ACCENT}
            className="h-full w-full"
            imgClassName="brightness-[0.5] contrast-[1.05]"
            overlay={false}
            sizes="100vw"
            priority
          />
          <span className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(18,20,23,0.88), rgba(18,20,23,0.62) 50%, rgba(18,20,23,0.95))" }} />
        </div>
        <span aria-hidden="true" className="absolute inset-x-0 top-0 keyline z-10" style={{ background: ACCENT }} />
        <div className="container-gf relative max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "#D8B4FE" }}>Smart Home & Security</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Buildings that think. Doors that answer to you.
          </h1>
          <p className="mt-6 leading-relaxed text-titanium">
            {heroContent.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#consult" className="btn-primary" style={{ background: "linear-gradient(120deg,#7E22CE,#A855F7 60%,#C084FC)", boxShadow: "0 8px 24px -12px rgba(168,85,247,.5)" }}>
              Book a free walkthrough
            </a>
            <a href="#packages" className="btn-ghost-dark backdrop-blur-sm">See packages & pricing</a>
          </div>
        </div>
      </section>

      <section id="residential" className="container-gf py-20">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: ACCENT }}>Residential</p>
          <h2 className="mt-3 font-display text-3xl font-semibold">Your home, on your terms.</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {RESIDENTIAL.map((s, i) => (
            <Reveal key={s.title} delay={(i % 2) * 0.07}>
              <div className="card h-full p-6 backdrop-blur-md transition-all duration-500 hover:shadow-2xl">
                <span className="keyline block w-10" style={{ background: ACCENT }} />
                <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed ink-muted">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {MEDIA["smart-home"].gallery.map((src, i) => (
              <div key={src} className="group">
                <MediaImage src={src} alt={["Integrated smart entry", "Automated living spaces", "Connected control"][i] ?? "Smart home detail"} tint={ACCENT} className="h-44 rounded-2xl" sizes="(max-width: 640px) 100vw, 33vw" />
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section id="commercial" className="border-y hairline bg-graphite py-20 text-white">
        <div className="container-gf">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: "#D8B4FE" }}>Commercial & facilities</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">Security and automation at building scale.</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-titanium">
              For offices, estates, hotels and industrial facilities — designed by the same group
              that builds the structures, powers them, and secures their networks. One integrator,
              one accountability chain, from the fence line to the server room.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {COMMERCIAL.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.06}>
                <div className="card h-full border-white/10 bg-graphite-2 p-6 text-white backdrop-blur-md">
                  <span className="keyline block w-10" style={{ background: ACCENT }} />
                  <h3 className="mt-4 font-display text-base font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-titanium">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="packages" className="container-gf py-20">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold">Packages, priced honestly.</h2>
          <p className="mt-3 max-w-2xl ink-muted">
            Indicative supply-and-install pricing — a free site walkthrough turns it into a fixed
            quote. All hardware sold through our own store, so warranty claims have one address.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {packages.map((pkg, i) => (
            <Reveal key={pkg.id} delay={i * 0.07}>
              <div className={"card flex h-full flex-col p-6 transition-all duration-300 hover:shadow-2xl " + (pkg.highlight ? "border-2" : "")} style={pkg.highlight ? { borderColor: ACCENT } : undefined}>
                {pkg.highlight && <span className="mb-3 w-fit rounded-full px-3 py-1 text-[11px] font-bold text-white" style={{ background: ACCENT }}>Most installed</span>}
                <h3 className="font-display text-xl font-semibold">{pkg.title}</h3>
                <p className="mt-1 text-xs uppercase tracking-wider ink-muted">{pkg.scope}</p>
                <p className="num mt-3 font-display text-2xl font-bold" style={{ color: ACCENT }}>
                  {pkg.price > 0 ? `from ${moneyIn(pkg.price, pkg.currency as Currency)}` : "Quoted to spec"}
                  {pkg.price > 0 && pkg.billingCycle !== "one-time" && <span className="text-sm font-medium ink-muted"> /{pkg.billingCycle === "monthly" ? "mo" : "yr"}</span>}
                </p>
                <ul className="mt-4 flex-1 space-y-2 text-sm ink-muted">
                  {pkg.features.map((item) => (
                    <li key={item} className="flex gap-2"><span style={{ color: ACCENT }} aria-hidden="true">✓</span>{item}</li>
                  ))}
                </ul>
                <a href="#consult" className="btn-secondary mt-6 w-full">{pkg.ctaText}</a>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}>
          <p className="mt-8 text-sm ink-muted">
            Prefer to build it yourself? Smart locks, camera kits and mesh WiFi are in stock at{" "}
            <Link href="/divisions/commerce#store" className="font-semibold" style={{ color: ACCENT }}>the Greyfusion Store →</Link>
          </p>
        </Reveal>
      </section>

      <section id="configurator" className="border-y hairline bg-[var(--surface)] py-20">
        <div className="container-gf">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: ACCENT }}>Live system configurator</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">Build your system, get an instant estimate.</h2>
            <p className="mt-3 max-w-2xl ink-muted">
              Pick your property, zones and modules — the price updates live. One tap sends the full
              spec straight to our automation desk on WhatsApp for a formal quote and walkthrough.
            </p>
          </Reveal>
          <div className="mt-10"><SmartHomeConfigurator /></div>
        </div>
      </section>

      <section id="consult" className="border-t hairline bg-[var(--surface)] py-20">
        <div className="container-gf grid gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold">Book a free walkthrough</h2>
            <p className="mt-4 leading-relaxed ink-muted">
              A systems engineer visits your home or facility, maps what you have, and returns a
              fixed-price design within five working days — cabling diagrams included. No obligation,
              and the survey fee is credited against any installation.
            </p>
            <ul className="mt-6 space-y-2 text-sm ink-muted">
              <li>· Abuja, Lagos & Port Harcourt — same-week slots</li>
              <li>· Works with your existing inverter/solar setup (or we pair one from our Energy division)</li>
              <li>· 24-month workmanship warranty · SLA maintenance plans available</li>
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card p-6">
              <LeadForm
                type="PROJECT_INTAKE"
                division="smart-home"
                cta="Book the walkthrough"
                successNote="Our automation desk confirms a survey slot within one working day."
                fields={[
                  { name: "facilityType", label: "Facility type", kind: "select", required: true, options: ["Apartment / flat", "Detached home / duplex", "Estate (multi-unit)", "Office / commercial", "Industrial / warehouse", "Hospitality"], half: true },
                  { name: "city", label: "City", kind: "select", required: true, options: ["Abuja", "Lagos", "Port Harcourt", "Other"], half: true },
                  { name: "interest", label: "Primary interest", kind: "select", required: true, options: ["Full automation", "CCTV & surveillance", "Access control & smart locks", "Alarm & intrusion", "Facility-wide integration"] },
                  { name: "details", label: "About the space", kind: "textarea", placeholder: "Size, current systems, what you want automated or secured…" },
                ]}
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
