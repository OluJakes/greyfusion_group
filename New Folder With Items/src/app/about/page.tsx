import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { Counter } from "@/components/Counter";
import { COMPANY } from "@/lib/divisions";
import { getPageContent, getLeadership, type LeaderView } from "@/lib/content";
import { MediaImage } from "@/components/media/MediaImage";
import { HERO_COVERS } from "@/lib/media";

export const metadata: Metadata = {
  title: "About",
  description:
    "Greyfusion Limited is a Nigerian conglomerate operating eight business units under one standard of execution — construction, energy, IT, real estate, autos and commerce.",
};

const LEADERSHIP_FALLBACK: Omit<LeaderView, "id" | "avatarUrl" | "linkedIn">[] = [
  { name: "Engr. Olumide Bankole", role: "Group Managing Director", bio: "Civil engineer (COREN). Led ₦40B+ of federal and state infrastructure delivery before founding Greyfusion in 2011." },
  { name: "Adaeze Okonkwo", role: "Group Executive Director, Operations", bio: "Former plant director, 14 years in industrial operations across West Africa. Owns the group-wide delivery standard." },
  { name: "Ibrahim Suleiman", role: "MD, Construction & Engineering", bio: "Structural engineer; delivered the Karu–Jikwoyi corridor and three state secretariat complexes." },
  { name: "Dr. Funmilayo Ashiru", role: "MD, Renewable Energy", bio: "PhD Power Systems (Ibadan). Architect of the Zenith Agro 2.4MW hybrid plant and 48MW of deployed capacity." },
  { name: "Tobi Adeleke", role: "MD, Information Technology", bio: "CISSP, ex-big-four cyber lead. Built Greyfusion's 24/7 SOC and the Meridian Trust Bank ISO 27001 programme." },
  { name: "Halima Yusuf", role: "MD, Real Estate", bio: "18 years in property development and asset management; runs a 96%-occupancy portfolio across three cities." },
  { name: "Emeka Nwosu", role: "MD, Autos & Mobility", bio: "Led the GIG Logistics 60-vehicle EV transition; former OEM regional sales director." },
  { name: "Kemi Alade", role: "Group CFO", bio: "FCA. Keeps eight business units on one accountable balance sheet and one audit." },
];

const VALUES = [
  { title: "Evidence over adjectives", body: "We publish uptime, tonnage, megawatts and payback periods — then let clients audit them." },
  { title: "One standard", body: "The same QA gates govern a road, a rack, a roof and a retail order. Standard is not negotiable by division." },
  { title: "Built for Nigeria", body: "Load profiles, logistics, regulation and naira economics are design inputs, not afterthoughts." },
];

const SUSTAINABILITY = [
  { metric: 48, suffix: "MW", label: "Renewable capacity deployed" },
  { metric: 61000, suffix: "t", label: "CO₂ offset per year (est.)" },
  { metric: 38, suffix: "%", label: "Group revenue from green lines" },
  { metric: 1200, suffix: "+", label: "Local jobs supported" },
];

export default async function AboutPage() {
  const dbLeaders = await getLeadership();
  const leaders: LeaderView[] =
    dbLeaders.length > 0
      ? dbLeaders
      : LEADERSHIP_FALLBACK.map((l, i) => ({ ...l, id: String(i), avatarUrl: "", linkedIn: "" }));
  const content = await getPageContent("about", {
    heroTitle: "A conglomerate run like a single machine.",
    heroSubtitle: "",
    heroVideos: [],
    heroImages: [],
    body: {},
  });
  return (
    <>
      <section className="relative overflow-hidden bg-graphite pb-20 pt-36 text-white">
        <MediaImage src={HERO_COVERS["about"]} alt="Greyfusion corporate headquarters" tint="#E2583E" overlay={false} priority sizes="100vw" className="absolute inset-0 h-full w-full" imgClassName="brightness-[0.4] contrast-[1.05]" />
        <span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(18,20,23,0.95), rgba(18,20,23,0.55) 50%, rgba(18,20,23,0.3))" }} />
        <div className="container-gf relative z-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fusion">About Greyfusion</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            {content.heroTitle}
          </h1>
          <p className="mt-6 leading-relaxed text-titanium">
            Founded in Abuja in 2011, Greyfusion Limited ({COMPANY.rc}) grew from a civil engineering
            practice into eight business units sharing one procurement engine, one quality system and
            one balance sheet. We don&apos;t diversify to hedge — we integrate to compound: our
            construction division builds what our energy division powers, our IT division secures
            what our commerce division sells, and our real estate division houses the people our
            autos division moves.
          </p>
        </div>
      </section>

      <section className="container-gf py-20">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold">What we hold ourselves to</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08}>
              <div className="card h-full p-6">
                <span className="keyline block w-10 bg-fusion" />
                <h3 className="mt-4 font-display text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed ink-muted">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y hairline bg-[var(--surface)] py-20">
        <div className="container-gf">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fusion">Leadership</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">The people accountable.</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {leaders.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 0.06}>
                <div className="group card h-full p-5 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-2xl">
                  {p.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.avatarUrl}
                      alt={p.name}
                      className="h-14 w-14 rounded-full border object-cover hairline transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-full font-display text-lg font-semibold text-white transition-transform duration-500 group-hover:scale-105"
                      style={{ background: "linear-gradient(135deg,#C9432B,#F0765D)" }}
                      aria-hidden="true"
                    >
                      {p.name.replace(/^(Engr\.|Dr\.|Col\.)\s*/, "").split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </div>
                  )}
                  <h3 className="mt-4 font-display text-base font-semibold">{p.name}</h3>
                  <p className="text-xs font-semibold uppercase tracking-wider text-fusion">{p.role}</p>
                  <p className="mt-2 text-sm leading-relaxed ink-muted">{p.bio}</p>
                  {p.linkedIn && (
                    <a href={p.linkedIn} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs font-semibold text-fusion">
                      LinkedIn ↗
                    </a>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-gf py-20">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fusion">Sustainability</p>
          <h2 className="mt-3 font-display text-3xl font-semibold">Measured, not marketed.</h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {SUSTAINABILITY.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.07}>
              <div className="card p-6 text-center">
                <Counter to={s.metric} suffix={s.suffix} className="font-display text-3xl font-semibold text-fusion" />
                <p className="mt-2 text-xs uppercase tracking-widest ink-muted">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}>
          <div className="card mt-10 p-6">
            <h3 className="font-display text-lg font-semibold">Governance</h3>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed ink-muted">
              Greyfusion operates a two-tier board with independent non-executive oversight, an audit
              & risk committee chaired externally, and annual ISO 9001/27001 surveillance audits.
              Procurement above ₦25M runs through open competitive tender — including our own
              subsidiaries, which win no work without bidding for it. Statutory filings are current
              with the CAC and FIRS; our COREN and SON registrations are renewed annually.
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
