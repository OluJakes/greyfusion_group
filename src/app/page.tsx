import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPageContent } from "@/lib/content";
import { Hero } from "@/components/home/Hero";
import { StatBand } from "@/components/home/StatBand";
import { DivisionGrid } from "@/components/home/DivisionGrid";
import { WorkStrip } from "@/components/home/WorkStrip";
import { TrustLayer } from "@/components/home/TrustLayer";
import { Reveal } from "@/components/Reveal";
import { fmtDate } from "@/lib/utils";

export default async function HomePage() {
  const [posts, content] = await Promise.all([
    prisma.post.findMany({ orderBy: { publishedAt: "desc" }, take: 3 }),
    getPageContent("home", {
      heroTitle: "Eight Industries.",
      heroSubtitle:
        "Greyfusion Limited engineers, powers, builds, secures, automates, houses, moves, and supplies modern Africa — from federal road corridors to 48MW of deployed solar.",
      heroVideos: ["https://assets.mixkit.co/videos/preview/mixkit-cyber-security-system-scanning-network-41584-large.mp4"],
      heroImages: ["https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1920&q=80"],
      body: { titleAccent: "Standard" },
    }),
  ]);

  return (
    <>
      <Hero
        title={content.heroTitle}
        titleAccent={String(content.body.titleAccent ?? "Standard")}
        subtitle={content.heroSubtitle}
        videoSrc={content.heroVideos[0]}
        poster={content.heroImages[0]}
      />
      <StatBand />
      <DivisionGrid />
      <WorkStrip />
      <TrustLayer />

      <section className="border-t hairline bg-[var(--surface)] py-20">
        <div className="container-gf">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fusion">Insights</p>
              <h2 className="mt-3 font-display text-3xl font-semibold">Thinking that ships.</h2>
            </div>
            <Link href="/insights" className="text-sm font-semibold text-fusion">
              All insights →
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {posts.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <Link href={`/insights/${p.slug}`} className="group card block h-full p-6 transition-all duration-500 ease-fusion hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-fusion">{p.division}</p>
                  <h3 className="mt-2 font-display text-lg font-semibold leading-snug group-hover:text-fusion">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed ink-muted">{p.excerpt}</p>
                  <p className="mt-4 text-xs ink-muted num">
                    {fmtDate(p.publishedAt)} · {p.readMins} min read
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-graphite py-20 text-white">
        <div className="container-gf flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fusion">Careers</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">Build the standard with us.</h2>
            <p className="mt-3 leading-relaxed text-titanium">
              Engineers, analysts, agents and operators — eight roles are open right now across our
              divisions in Abuja, Lagos and Port Harcourt.
            </p>
          </div>
          <Link href="/careers" className="btn-primary">
            View open roles
          </Link>
        </div>
      </section>
    </>
  );
}
