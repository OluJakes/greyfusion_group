import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fmtDate } from "@/lib/utils";
import { MediaImage } from "@/components/media/MediaImage";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } });
  if (!post) return { title: "Insight not found" };
  return { title: post.title, description: post.excerpt };
}

export default async function InsightPage({ params }: Props) {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } });
  if (!post) notFound();

  const paragraphs = post.body.split("\n\n");

  return (
    <>
      <section className="relative overflow-hidden bg-graphite pb-14 pt-36 text-white">
        {post.coverImage && (
          <>
            <MediaImage src={post.coverImage} alt={post.title} tint="#E2583E" overlay={false} priority sizes="100vw" className="absolute inset-0 h-full w-full" imgClassName="brightness-[0.35] contrast-[1.05]" />
            <span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(18,20,23,0.96), rgba(18,20,23,0.6) 55%, rgba(18,20,23,0.35))" }} />
          </>
        )}
        <div className="container-gf relative z-10 max-w-3xl">
          <Link href="/insights" className="text-sm text-titanium hover:text-white">← All insights</Link>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-fusion">{post.division}</p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">{post.title}</h1>
          <p className="mt-4 text-sm text-titanium num">
            {post.author} · {fmtDate(post.publishedAt)} · {post.readMins} min read
          </p>
        </div>
      </section>
      <article className="container-gf max-w-3xl py-14">
        {paragraphs.map((para, i) =>
          para.startsWith("## ") ? (
            <h2 key={i} className="mb-3 mt-9 font-display text-2xl font-semibold">{para.slice(3)}</h2>
          ) : (
            <p key={i} className="mb-5 leading-relaxed">{para}</p>
          )
        )}
        <div className="card mt-10 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-display font-semibold">Talk to the team behind this.</h3>
            <p className="mt-1 text-sm ink-muted">Route your enquiry directly to the {post.division} desk.</p>
          </div>
          <Link href="/contact" className="btn-primary shrink-0">Start a conversation</Link>
        </div>
      </article>
    </>
  );
}
