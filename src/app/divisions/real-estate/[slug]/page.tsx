import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeJson, ngn } from "@/lib/utils";
import { BookingEngine } from "@/components/realestate/BookingEngine";
import { LeadForm } from "@/components/LeadForm";
import { propertyGallery } from "@/lib/media";
import { getEntityGallery } from "@/lib/gallery";
import { ProductGallery } from "@/components/common/ProductGallery";
import { MediaImage } from "@/components/media/MediaImage";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await prisma.property.findUnique({ where: { slug: params.slug } });
  return p ? { title: `${p.title} · Real Estate`, description: p.summary } : { title: "Property not found" };
}

function expandNights(start: Date, end: Date): string[] {
  const out: string[] = [];
  const d = new Date(start);
  while (d < end) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

export default async function PropertyPage({ params }: Props) {
  const p = await prisma.property.findUnique({
    where: { slug: params.slug },
    include: { bookings: { where: { status: { in: ["PENDING", "CONFIRMED", "BLOCKED"] } } } },
  });
  if (!p) notFound();

  const amenities = safeJson<string[]>(p.amenities, []);
  const gallery = await getEntityGallery("property", p.id, propertyGallery(p.type, p.slug), p.title);
  const bookedDates = p.bookings.flatMap((b) => expandNights(b.startDate, b.endDate));
  const isShortlet = p.type === "shortlet";

  const pricing = isShortlet
    ? [
        { k: "Nightly rate", v: ngn(p.nightlyNGN) },
        { k: "Caution fee (refundable)", v: ngn(p.cautionNGN) },
      ]
    : [
        { k: "Annual rent", v: ngn(p.priceNGN) },
        { k: "Service charge / yr", v: ngn(p.serviceNGN) },
        { k: "Security deposit", v: ngn(p.depositNGN) },
        { k: "Caution fee (refundable)", v: ngn(p.cautionNGN) },
        { k: "Total move-in", v: ngn(p.priceNGN + p.serviceNGN + p.depositNGN + p.cautionNGN) },
      ];

  return (
    <>
      <section className="relative bg-graphite pb-14 pt-36 text-white">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 keyline" style={{ background: "#0D9488" }} />
        <div className="container-gf">
          <Link href="/divisions/real-estate#listings" className="text-sm text-titanium hover:text-white">← All properties</Link>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-white/90 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-graphite">{p.type}</span>
            <span className="num text-sm text-titanium">{p.location} · {p.city}</span>
          </div>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold sm:text-4xl">{p.title}</h1>
        </div>
      </section>

      <section className="container-gf grid gap-10 py-14 lg:grid-cols-[1fr_24rem]">
        <div>
          <ProductGallery images={gallery} tint="#0D9488" aspect="aspect-[16/10]" title={p.title} />

          <p className="mt-8 max-w-3xl leading-relaxed ink-muted">{p.summary}</p>

          <h2 className="mt-10 font-display text-2xl font-semibold">Amenities</h2>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            {amenities.map((a) => (
              <li key={a} className="flex items-center gap-2">
                <span className="text-[#0D9488]" aria-hidden="true">✓</span> {a}
              </li>
            ))}
          </ul>

          <h2 className="mt-10 font-display text-2xl font-semibold">Location</h2>
          <div className="mt-4 flex h-56 items-center justify-center rounded-2xl surface-2 text-sm ink-muted" role="img" aria-label={`Map — ${p.location}, ${p.city}`}>
            Map · {p.location}, {p.city}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="card p-5">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider">Itemised pricing</h2>
            <dl className="num mt-4 space-y-2.5 text-sm">
              {pricing.map((row, i) => (
                <div key={row.k} className={"flex justify-between gap-4 " + (i === pricing.length - 1 && !isShortlet ? "border-t pt-2.5 hairline font-bold" : "")}>
                  <dt className="ink-muted">{row.k}</dt>
                  <dd className="font-medium">{row.v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs ink-muted">No agency fee — you deal directly with the owner-operator.</p>
          </div>

          {isShortlet ? (
            <BookingEngine propertyId={p.id} nightlyNGN={p.nightlyNGN} cautionNGN={p.cautionNGN} bookedDates={bookedDates} />
          ) : (
            <div className="card p-5">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider">Request a viewing</h2>
              <div className="mt-4">
                <LeadForm
                  type="CONTACT"
                  division="real-estate"
                  compact
                  cta="Request viewing"
                  successNote="Our lettings desk will call within one working day to fix a time."
                  hidden={{ property: p.title, slug: p.slug }}
                  fields={[{ name: "preferredTime", label: "Preferred day/time", kind: "text", placeholder: "e.g. Saturday morning" }]}
                />
              </div>
            </div>
          )}
        </aside>
      </section>
    </>
  );
}
