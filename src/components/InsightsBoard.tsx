"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MediaImage } from "@/components/media/MediaImage";
import { EASE } from "@/components/Reveal";
import { cn, fmtDate } from "@/lib/utils";

export interface InsightCard {
  slug: string;
  title: string;
  division: string;
  excerpt: string;
  author: string;
  coverImage: string;
  publishedAt: string;
  readMins: number;
}

const LABELS: Record<string, string> = {
  construction: "Construction",
  energy: "Energy",
  it: "IT & Security",
  realestate: "Real Estate",
  autos: "EV & Autos",
  ecommerce: "eCommerce",
  governance: "Governance",
  macroeconomy: "Macroeconomy",
};

const PAGE = 12;

export function InsightsBoard({ posts }: { posts: InsightCard[] }) {
  const verticals = useMemo(() => {
    const present = Array.from(new Set(posts.map((p) => p.division)));
    return ["all", ...present];
  }, [posts]);
  const [active, setActive] = useState("all");
  const [count, setCount] = useState(PAGE);

  const filtered = useMemo(
    () => (active === "all" ? posts : posts.filter((p) => p.division === active)),
    [posts, active]
  );
  const shown = filtered.slice(0, count);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter insights by sector">
        {verticals.map((v) => (
          <button
            key={v}
            role="tab"
            aria-selected={active === v}
            type="button"
            onClick={() => {
              setActive(v);
              setCount(PAGE);
            }}
            className="relative rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-300 hairline hover:border-fusion"
          >
            {active === v && (
              <motion.span
                layoutId="insights-tab-pill"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="absolute inset-0 rounded-full bg-fusion"
              />
            )}
            <span className={cn("relative", active === v ? "text-white" : "")}>
              {v === "all" ? "All sectors" : LABELS[v] ?? v}
            </span>
          </button>
        ))}
      </div>

      <p className="num mt-4 text-sm ink-muted">{filtered.length} article(s)</p>

      <motion.div layout className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((p) => (
            <motion.div
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <Link
                href={`/insights/${p.slug}`}
                className="group card block h-full overflow-hidden transition-all duration-500 ease-fusion hover:-translate-y-1 hover:shadow-lg"
              >
                {p.coverImage && (
                  <MediaImage src={p.coverImage} alt={p.title} tint="#E2583E" className="h-40" sizes="(max-width: 768px) 100vw, 33vw" />
                )}
                <div className="p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-fusion">{LABELS[p.division] ?? p.division}</p>
                  <h2 className="mt-2 font-display text-lg font-semibold leading-snug group-hover:text-fusion">{p.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed ink-muted">{p.excerpt}</p>
                  <p className="num mt-4 text-xs ink-muted">
                    {p.author} · {fmtDate(p.publishedAt)} · {p.readMins} min read
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {count < filtered.length && (
        <div className="mt-10 text-center">
          <button type="button" onClick={() => setCount((c) => c + PAGE)} className="btn-secondary">
            Load more articles ({filtered.length - count} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
