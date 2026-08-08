import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeJson, ngn } from "@/lib/utils";
import { VehicleConfig } from "@/components/autos/VehicleConfig";
import { ProductGallery } from "@/components/common/ProductGallery";
import { getEntityGallery } from "@/lib/gallery";
import { VEHICLE_GALLERY } from "@/lib/media";
import { Cutaway } from "@/components/autos/CarArt";
import { Reveal } from "@/components/Reveal";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const v = await prisma.vehicle.findUnique({ where: { slug: params.slug } });
  return v ? { title: `${v.make} ${v.model} · Autos`, description: v.summary } : { title: "Vehicle not found" };
}

export default async function VehiclePage({ params }: Props) {
  const v = await prisma.vehicle.findUnique({ where: { slug: params.slug } });
  if (!v) notFound();
  const gallery = await getEntityGallery("vehicle", v.id, VEHICLE_GALLERY.map((g) => g.src), `${v.make} ${v.model}`);

  const colors = safeJson<{ name: string; hex: string }[]>(v.colors, []);
  const name = `${v.make} ${v.model}`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${name} (${v.year})`,
    description: v.summary,
    brand: { "@type": "Brand", name: v.make },
    offers: { "@type": "Offer", priceCurrency: "NGN", price: v.priceNGN, availability: "https://schema.org/InStock" },
  };

  const specs = [
    { k: "Powertrain", v: v.powertrain === "BEV" ? "Battery electric" : v.powertrain === "PHEV" ? "Plug-in hybrid" : "Hybrid" },
    { k: "Body style", v: v.bodyStyle },
    { k: v.powertrain === "HEV" ? "Combined range (tank)" : "Range (WLTP-adj.)", v: `${v.rangeKm} km` },
    { k: "Battery", v: `${v.batteryKwh} kWh` },
    { k: "0–100 km/h", v: `${v.accel} s` },
    { k: "Max DC charge", v: v.chargeKw > 0 ? `${v.chargeKw} kW` : "—" },
    { k: "Charge time", v: v.chargeTime },
    { k: "Seats", v: String(v.seats) },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <section className="relative bg-graphite pb-14 pt-36 text-white">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 keyline" style={{ background: "#38BDF8" }} />
        <div className="container-gf">
          <Link href="/divisions/autos#marketplace" className="text-sm text-titanium hover:text-white">← All vehicles</Link>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="rounded-md bg-[#38BDF8]/15 px-2 py-1 text-[11px] font-bold text-[#38BDF8]">{v.powertrain}</span>
              <h1 className="mt-3 font-display text-4xl font-semibold">{name} <span className="num text-xl text-titanium">{v.year}</span></h1>
            </div>
            <p className="num font-display text-3xl font-bold" style={{ color: "#38BDF8" }}>{ngn(v.priceNGN)}</p>
          </div>
        </div>
      </section>

      <section className="container-gf grid gap-12 py-14 lg:grid-cols-[1fr_22rem]">
        <div>
          <ProductGallery images={gallery} tint="#38BDF8" aspect="aspect-[16/10]" title={name} />
          <div className="mt-8">
            <VehicleConfig colors={colors} vehicleName={name} slug={v.slug} />
          </div>
        </div>
        <aside>
          <div className="card p-5">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider">Specifications</h2>
            <dl className="num mt-4 space-y-2.5 text-sm">
              {specs.map((s) => (
                <div key={s.k} className="flex justify-between gap-4 border-b pb-2.5 hairline">
                  <dt className="ink-muted">{s.k}</dt>
                  <dd className="text-right font-medium">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="card mt-5 p-5 text-sm leading-relaxed ink-muted">{v.summary}</p>
        </aside>
      </section>

      {v.powertrain !== "HEV" && (
        <section className="border-t hairline bg-[var(--surface)] py-16">
          <div className="container-gf">
            <Reveal>
              <h2 className="font-display text-2xl font-semibold">Under the floor</h2>
              <p className="mt-2 max-w-xl text-sm ink-muted">
                Battery low and central, motor on the driven axle — the physics behind the composure.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mx-auto mt-8 max-w-3xl"><Cutaway accent="#38BDF8" /></div>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
