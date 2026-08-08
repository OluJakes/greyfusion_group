import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/Reveal";
import { MEDIA } from "@/lib/media";
import { MediaImage } from "@/components/media/MediaImage";
import { ProductGallery } from "@/components/common/ProductGallery";
import { getEntityGallery } from "@/lib/gallery";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await prisma.project.findUnique({ where: { slug: params.slug } });
  return p ? { title: `${p.title} · Projects`, description: p.summary } : { title: "Project not found" };
}

export default async function ProjectPage({ params }: Props) {
  const p = await prisma.project.findUnique({ where: { slug: params.slug } });
  if (!p) notFound();
  const gallery = await getEntityGallery(
    "project",
    p.id,
    [p.status === "Ongoing" ? MEDIA.construction.process : MEDIA.construction.done, MEDIA.construction.pre, MEDIA.construction.process, MEDIA.construction.done],
    p.title
  );

  const facts = [
    { k: "Client", v: p.client },
    { k: "Location", v: p.location },
    { k: "Sector", v: p.sector },
    { k: "Status", v: p.status },
    { k: "Contract band", v: p.valueBand },
    { k: "Year", v: String(p.year) },
  ];

  return (
    <>
      <section className="relative bg-graphite pb-16 pt-36 text-white">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 keyline" style={{ background: "#D97706" }} />
        <div className="container-gf">
          <Link href="/divisions/construction#portfolio" className="text-sm text-titanium hover:text-white">← Portfolio</Link>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-tight">{p.title}</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-titanium">{p.summary}</p>
        </div>
      </section>
      <section className="container-gf grid gap-10 py-16 lg:grid-cols-[1fr_18rem]">
        <div>
          <ProductGallery images={gallery} tint="#D97706" aspect="aspect-[16/9]" title={p.title} />
          <Reveal>
            <h2 className="mt-12 font-display text-2xl font-semibold">The engineering challenge</h2>
            <p className="mt-3 leading-relaxed ink-muted">{p.challenge}</p>
          </Reveal>
          <Reveal>
            <h2 className="mt-10 font-display text-2xl font-semibold">How we solved it</h2>
            <p className="mt-3 leading-relaxed ink-muted">{p.solution}</p>
          </Reveal>
          <div className="card mt-12 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-display font-semibold">Planning something comparable?</h3>
              <p className="mt-1 text-sm ink-muted">Our estimating desk responds within two working days.</p>
            </div>
            <Link href="/contact" className="btn-primary shrink-0">Request a Capability Deck</Link>
          </div>
        </div>
        <aside className="card h-fit p-5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider">Project facts</h2>
          <dl className="mt-4 space-y-3 text-sm">
            {facts.map((f) => (
              <div key={f.k} className="flex justify-between gap-4 border-b pb-2.5 hairline">
                <dt className="ink-muted">{f.k}</dt>
                <dd className="text-right font-medium num">{f.v}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>
    </>
  );
}
