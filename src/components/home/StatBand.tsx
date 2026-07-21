import { Counter } from "@/components/Counter";
import { Reveal } from "@/components/Reveal";

const STATS = [
  { to: 214, suffix: "", label: "Projects delivered" },
  { to: 48, suffix: "MW", label: "Solar deployed" },
  { to: 12400, suffix: "+", label: "Vehicles & products moved" },
  { to: 8, suffix: "", label: "Business units" },
  { to: 2011, suffix: "", label: "Established", plain: true },
];

export function StatBand() {
  return (
    <section className="border-b hairline bg-graphite-2 text-white">
      <div className="container-gf grid grid-cols-2 gap-y-8 py-12 sm:grid-cols-3 lg:grid-cols-5">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.07}>
            <div className="text-center">
              {s.plain ? (
                <span className="num font-display text-3xl font-semibold sm:text-4xl">{s.to}</span>
              ) : (
                <Counter to={s.to} suffix={s.suffix} className="font-display text-3xl font-semibold sm:text-4xl" />
              )}
              <p className="mt-1.5 text-xs uppercase tracking-widest text-titanium">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
