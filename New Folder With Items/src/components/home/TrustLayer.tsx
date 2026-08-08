import { Reveal } from "@/components/Reveal";

const CLIENTS = [
  "Deel IT",
  "United Nations",
  "350.org",
  "Meridian Trust Bank",
  "Zenith Agro Group",
  "FCT Ministry of Works",
  "Tiko B.V",
  "Spryker Systems",
  "Sunmart Retail",
  "GIG Logistics",
  "Harmattan Foods",
  "Delta Deepwater Services",
];

const TESTIMONIALS = [
  {
    quote:
      "Greyfusion certified our SOC against ISO 27001 in eleven months — a timeline our previous consultants called impossible. Their engineers write reports our board actually reads.",
    name: "Ngozi Adewale",
    role: "CIO, Meridian Trust Bank",
  },
  {
    quote:
      "The 2.4MW hybrid plant has held 99.2% uptime through two harmattan seasons. Diesel spend is down 81%. The numbers are theirs; the audit is ours.",
    name: "Ibrahim Danlami",
    role: "COO, Zenith Agro Group",
  },
  {
    quote:
      "Sixty electric vehicles, depot charging, driver training and a five-year TCO model — delivered as one contract, on one invoice, three weeks early.",
    name: "Chuka Eze",
    role: "Fleet Director, GIG Logistics",
  },
];

const CERTS = [
  { label: "CAC", sub: "RC 1120352" },
  { label: "FIRS TCC", sub: "Current" },
  { label: "ITF", sub: "Compliant" },
  { label: "PENCOM", sub: "Certified" },
  { label: "SCUML", sub: "Registered" },
  { label: "COREN", sub: "R.12,481" },
  { label: "NITDA", sub: "Compliant" },
  { label: "ISO 9001 · 27001", sub: "Certified" },
];

export function TrustLayer() {
  return (
    <section className="container-gf py-20 lg:py-24">
      <Reveal>
        <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] ink-muted">
          Trusted by operators who measure everything
        </p>
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          {CLIENTS.map((c) => (
            <span key={c} className="text-center font-display text-sm font-semibold uppercase tracking-wider ink-muted opacity-70">
              {c}
            </span>
          ))}
        </div>
      </Reveal>
      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.08}>
            <figure className="card flex h-full flex-col p-6 backdrop-blur-md transition-all duration-500 hover:shadow-2xl">
              <span aria-hidden="true" className="font-display text-4xl leading-none text-fusion">“</span>
              <blockquote className="mt-2 flex-1 text-sm leading-relaxed">{t.quote}</blockquote>
              <figcaption className="mt-5 border-t pt-4 hairline">
                <span className="block text-sm font-semibold">{t.name}</span>
                <span className="block text-xs ink-muted">{t.role}</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.1}>
        <div className="mt-12">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {CERTS.map((c) => (
              <div key={c.label} className="card flex flex-col items-center px-3 py-3.5 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 2 4 6v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-4Z" strokeLinejoin="round" />
                  <path d="m8.5 12 2.5 2.5L15.5 9.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="mt-1.5 text-xs font-bold">{c.label}</span>
                <span className="num text-[10px] ink-muted">{c.sub}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-sm">
            <a href="/compliance" className="font-semibold text-fusion">Open the full Compliance & Trust Center →</a>
          </p>
        </div>
      </Reveal>
    </section>
  );
}
