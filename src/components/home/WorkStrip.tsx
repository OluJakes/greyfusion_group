import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { MediaImage } from "@/components/media/MediaImage";
import { MEDIA } from "@/lib/media";

const CASES = [
  {
    title: "Karu–Jikwoyi Dual Carriageway",
    division: "Construction",
    slug: "construction",
    accent: "#D97706",
    stat: "9.6km · FCT Ministry of Works",
    href: "/divisions/construction/projects/karu-jikwoyi-dual-carriageway",
  },
  {
    title: "Zenith Agro 2.4MW Hybrid Micro-Grid",
    division: "Energy",
    slug: "energy",
    accent: "#16A34A",
    stat: "2.4MW PV + 4.8MWh storage · Kaduna",
    href: "/divisions/energy#solutions",
  },
  {
    title: "Deel IT — Nigeria Fulfilment Partnership",
    division: "IT & Security",
    slug: "it",
    accent: "#6366F1",
    stat: "Full device lifecycle · 24–48h quoting SLA",
    href: "/divisions/it#lifecycle",
  },
  {
    title: "The Wuse Atrium Residences",
    division: "Real Estate",
    slug: "real-estate",
    accent: "#0D9488",
    stat: "38 units · 96% occupancy",
    href: "/divisions/real-estate#listings",
  },
  {
    title: "GIG Logistics EV Fleet Transition",
    division: "Autos",
    slug: "autos",
    accent: "#38BDF8",
    stat: "60 BEVs delivered · depot charging installed",
    href: "/divisions/autos#marketplace",
  },
  {
    title: "Asokoro Ridge Whole-Home Automation",
    division: "Smart Home",
    slug: "smart-home",
    accent: "#A855F7",
    stat: "42 zones · access, CCTV, climate, energy",
    href: "/divisions/smart-home#residential",
  },
  {
    title: "Sunmart Retail Solar Rollout",
    division: "eCommerce",
    slug: "commerce",
    accent: "#E11D48",
    stat: "214 stores supplied · 48-hour fulfilment",
    href: "/divisions/commerce#store",
  },
];

export function WorkStrip() {
  return (
    <section className="border-y hairline bg-[var(--surface)] py-20">
      <div className="container-gf flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fusion">Flagship Work</p>
          <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Proof, across divisions.</h2>
        </div>
        <p className="hidden text-sm ink-muted sm:block">Scroll →</p>
      </div>
      <div className="snap-strip mt-10 flex gap-5 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8" tabIndex={0} aria-label="Flagship case studies">
        {CASES.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.05} className="shrink-0">
            <Link
              href={c.href}
              className="group relative block h-72 w-[19rem] overflow-hidden rounded-2xl border border-white/5 sm:w-[22rem]"
            >
              <MediaImage
                src={MEDIA[c.slug]?.done ?? ""}
                alt={c.title}
                tint={c.accent}
                className="absolute inset-0"
                sizes="22rem"
              />
              <span className="absolute left-5 top-5 rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-white" style={{ background: c.accent }}>
                {c.division}
              </span>
              <span className="absolute inset-x-5 bottom-5 text-white">
                <span className="block font-display text-xl font-semibold leading-snug drop-shadow">{c.title}</span>
                <span className="mt-2 block text-sm text-mist/90 num">{c.stat}</span>
                <span className="mt-3 inline-block text-sm font-semibold opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  View case →
                </span>
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
