import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MediaImage } from "@/components/media/MediaImage";
import { HERO_COVERS } from "@/lib/media";
import { InsightsBoard } from "@/components/InsightsBoard";

export const metadata: Metadata = {
  title: "Insights",
  description: "Long-form thinking from Greyfusion's engineers, analysts and operators across seven industries.",
};

export default async function InsightsPage() {
  const posts = await prisma.post.findMany({ orderBy: { publishedAt: "desc" } });

  return (
    <>
      <section className="relative overflow-hidden bg-graphite pb-16 pt-36 text-white">
        <MediaImage src={HERO_COVERS["insights"]} alt="Research and telemetry authority" tint="#E2583E" overlay={false} priority sizes="100vw" className="absolute inset-0 h-full w-full" imgClassName="brightness-[0.4] contrast-[1.05]" />
        <span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(18,20,23,0.95), rgba(18,20,23,0.55) 50%, rgba(18,20,23,0.3))" }} />
        <div className="container-gf relative z-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fusion">Insights</p>
          <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">Thinking that ships.</h1>
          <p className="mt-5 leading-relaxed text-titanium">
            Field notes from the people who build, power, secure and supply — written for operators,
            not algorithms.
          </p>
        </div>
      </section>
      <section className="container-gf py-16">
        <InsightsBoard
          posts={posts.map((p) => ({
            slug: p.slug,
            title: p.title,
            division: p.division,
            excerpt: p.excerpt,
            author: p.author,
            coverImage: p.coverImage,
            publishedAt: p.publishedAt.toISOString(),
            readMins: p.readMins,
          }))}
        />
      </section>
    </>
  );
}
