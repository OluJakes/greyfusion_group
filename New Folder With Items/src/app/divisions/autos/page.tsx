import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/Reveal";
import { getPageContent } from "@/lib/content";
import { VehicleMarket } from "@/components/autos/VehicleMarket";
import { TcoCalculator } from "@/components/autos/TcoCalculator";
import { TradeIn } from "@/components/autos/TradeIn";
import { MediaImage } from "@/components/media/MediaImage";
import { HERO_COVERS } from "@/lib/media";
import { getMainThumbnails } from "@/lib/gallery";
import { resolveFxRates, NCS_DISCLAIMER } from "@/lib/fx";

export const metadata: Metadata = {
  title: "EV & Hybrid Autos",
  description:
    "Electric and hybrid vehicles with honest specs and transparent Naira pricing — plus TCO calculator, trade-in valuations and charging infrastructure.",
};

const ACCENT = "#38BDF8";

export default async function AutosPage() {
  const heroContent = await getPageContent('autos', {
    heroTitle: '{heroContent.heroTitle}',
    heroSubtitle: 'Twelve electrified models in stock, real-world range figures we&apos;ll defend, and a\n            charging team that has installed 60-vehicle depot infrastructure. No fuel queues in your\n            future.',
    heroVideos: [],
    heroImages: [],
    body: {},
  });
  const [vehicles, fx] = await Promise.all([
    prisma.vehicle.findMany({ orderBy: { priceNGN: "asc" } }),
    resolveFxRates(),
  ]);
  const thumbs = await getMainThumbnails("vehicle", vehicles.map((v) => v.id));

  return (
    <>
      <section className="relative overflow-hidden bg-graphite pb-20 pt-36 text-white">
        <div className="absolute inset-0"><MediaImage src={HERO_COVERS["autos"]} alt="Premium electric vehicle at a glowing ultra-charger" tint={ACCENT} overlay={false} priority sizes="100vw" className="h-full w-full" imgClassName="brightness-[0.4] contrast-[1.05]" /></div>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(18,20,23,0.85), rgba(18,20,23,0.55) 50%, rgba(18,20,23,0.95))" }}
        />
        <span aria-hidden="true" className="absolute inset-x-0 top-0 keyline z-10" style={{ background: ACCENT }} />
        <div className="container-gf relative z-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: ACCENT }}>EV & Hybrid Autos</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            The quiet future of Nigerian roads.
          </h1>
          <p className="mt-6 leading-relaxed text-titanium">
            {heroContent.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#marketplace" className="btn-primary" style={{ background: "linear-gradient(120deg,#0284C7,#38BDF8)", boxShadow: "0 8px 24px -12px rgba(56,189,248,.5)" }}>
              Browse vehicles
            </a>
            <a href="#tco" className="btn-ghost-dark">Run the TCO calculator</a>
          </div>
        </div>
      </section>

      <section id="marketplace" className="container-gf py-16">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold">Vehicle marketplace</h2>
          <p className="mt-2 max-w-2xl text-xs ink-muted" title={NCS_DISCLAIMER}>
            $ / € display prices: {NCS_DISCLAIMER}{fx.source === "NCS" ? " (live NCS benchmark)" : fx.source === "admin" ? " (admin-set benchmark)" : ""}
          </p>
        </Reveal>
        <div className="mt-8">
          <VehicleMarket
            fx={fx}
            vehicles={vehicles.map((v) => ({
              slug: v.slug, make: v.make, model: v.model, year: v.year, powertrain: v.powertrain,
              bodyStyle: v.bodyStyle, priceNGN: v.priceNGN, rangeKm: v.rangeKm, batteryKwh: v.batteryKwh,
              accel: v.accel, colors: v.colors, thumbnailUrl: thumbs[v.id],
            }))}
          />
        </div>
      </section>

      <section id="tco" className="border-y hairline bg-[var(--surface)] py-20">
        <div className="container-gf">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold">Petrol vs. electric — the 5-year truth</h2>
            <p className="mt-3 max-w-2xl ink-muted">
              Slide your monthly distance and current fuel prices. The bars recalculate the total
              cost of ownership with Nigerian assumptions, not California ones.
            </p>
          </Reveal>
          <div className="mt-10"><TcoCalculator /></div>
        </div>
      </section>

      <section id="trade-in" className="container-gf grid gap-10 py-20 lg:grid-cols-2">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold">Trade-in estimator</h2>
          <p className="mt-4 max-w-xl leading-relaxed ink-muted">
            Your current car is part of the deal. Answer five questions for an indicative value band —
            then a 40-minute physical inspection turns it into a firm offer, usable as deposit on any
            vehicle in our stock.
          </p>
          <ul className="mt-6 space-y-2 text-sm ink-muted">
            <li>· Firm offers valid for 14 days</li>
            <li>· We settle outstanding car loans directly with the bank</li>
            <li>· Same-day transfer once documents clear</li>
          </ul>
        </Reveal>
        <Reveal delay={0.1}><div className="card p-6"><TradeIn /></div></Reveal>
      </section>

      <section className="bg-graphite py-20 text-white">
        <div className="container-gf">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold">Charging infrastructure, handled.</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-titanium">
              Home AC wallboxes (7.4kW), estate charging clusters, and DC fast depots up to 120kW —
              designed, installed and maintained by the same group that deploys megawatt solar. Ask
              about solar-paired charging: sunlight in, kilometres out.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {[
              { t: "Home wallbox", d: "7.4kW AC, load-managed against your inverter. Installed in a day.", p: "from ₦1.2M installed" },
              { t: "Estate cluster", d: "4–12 AC points with RFID billing for residents' associations.", p: "from ₦6.8M" },
              { t: "DC fast depot", d: "60–120kW DC for fleets; solar-hybrid options cut energy cost 55%.", p: "engineered to spec" },
            ].map((c, i) => (
              <Reveal key={c.t} delay={i * 0.07}>
                <div className="card h-full border-white/10 bg-graphite-2 p-6 text-white">
                  <h3 className="font-display text-lg font-semibold" style={{ color: ACCENT }}>{c.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-titanium">{c.d}</p>
                  <p className="num mt-4 text-sm font-semibold">{c.p}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
