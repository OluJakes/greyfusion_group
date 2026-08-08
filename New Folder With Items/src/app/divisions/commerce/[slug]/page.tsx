import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeJson, ngn } from "@/lib/utils";
import { ProductDetailClient } from "@/components/commerce/ProductDetail";
import { productImage, productGalleryFor } from "@/lib/media";
import { getEntityGallery } from "@/lib/gallery";
import { ProductGallery } from "@/components/common/ProductGallery";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await prisma.product.findUnique({ where: { slug: params.slug } });
  return p ? { title: `${p.name} · Store`, description: p.summary } : { title: "Product not found" };
}

export default async function ProductPage({ params }: Props) {
  const p = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!p) notFound();
  const [related, gallery] = await Promise.all([
    prisma.product.findMany({ where: { category: p.category, NOT: { slug: p.slug } }, take: 3 }),
    getEntityGallery("product", p.id, productGalleryFor(p.category, p.slug), p.name),
  ]);
  const specs = safeJson<{ k: string; v: string }[]>(p.specs, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.summary,
    offers: {
      "@type": "Offer",
      priceCurrency: "NGN",
      price: p.priceNGN,
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="relative bg-graphite pb-10 pt-32 text-white">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 keyline" style={{ background: "#E11D48" }} />
        <div className="container-gf">
          <Link href="/divisions/commerce#store" className="text-sm text-titanium hover:text-white">← Back to store</Link>
        </div>
      </section>
      <section className="container-gf grid gap-10 py-12 lg:grid-cols-2">
        <ProductGallery images={gallery} tint="#E11D48" aspect="aspect-square" title={p.name} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#E11D48" }}>{p.category.replace("-", " ")}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold">{p.name}</h1>
          <p className="mt-3 leading-relaxed ink-muted">{p.summary}</p>
          <p className="num mt-5 font-display text-3xl font-bold">{ngn(p.priceNGN)}</p>
          <div className="mt-6 max-w-md">
            <ProductDetailClient product={{ slug: p.slug, name: p.name, category: p.category, priceNGN: p.priceNGN, stock: p.stock, variants: p.variants, summary: p.summary }} />
          </div>
          {specs.length > 0 && (
            <>
              <h2 className="mt-10 font-display text-lg font-semibold">Specifications</h2>
              <dl className="num mt-4 max-w-md space-y-2.5 text-sm">
                {specs.map((s) => (
                  <div key={s.k} className="flex justify-between gap-4 border-b pb-2.5 hairline">
                    <dt className="ink-muted">{s.k}</dt>
                    <dd className="text-right font-medium">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      </section>
      {related.length > 0 && (
        <section className="container-gf pb-16">
          <h2 className="font-display text-xl font-semibold">Related items</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/divisions/commerce/${r.slug}`} className="group card block p-5 transition-all duration-500 ease-fusion hover:-translate-y-1 hover:shadow-lg">
                <p className="font-display text-sm font-semibold group-hover:text-[#E11D48]">{r.name}</p>
                <p className="num mt-2 font-bold">{ngn(r.priceNGN)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
