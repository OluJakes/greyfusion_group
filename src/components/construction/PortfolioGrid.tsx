"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/components/Reveal";
import { cn } from "@/lib/utils";
import { MEDIA } from "@/lib/media";
import { MediaImage } from "@/components/media/MediaImage";

export interface ProjectItem {
  slug: string;
  title: string;
  sector: string;
  status: string;
  location: string;
  valueBand: string;
  year: number;
  client: string;
  summary: string;
  /** Admin-managed main cover; falls back to coded construction art when unset. */
  thumbnailUrl?: string;
}

export function PortfolioGrid({ projects }: { projects: ProjectItem[] }) {
  const sectors = useMemo(() => ["All", ...Array.from(new Set(projects.map((p) => p.sector)))], [projects]);
  const [sector, setSector] = useState("All");
  const [status, setStatus] = useState("All");

  const filtered = projects.filter(
    (p) => (sector === "All" || p.sector === sector) && (status === "All" || p.status === status)
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {sectors.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSector(s)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors hairline",
              sector === s ? "text-white" : "hover:border-[#D97706]"
            )}
            style={sector === s ? { background: "#D97706" } : undefined}
          >
            {s}
          </button>
        ))}
        <span className="mx-2 hidden h-5 w-px bg-[var(--line)] sm:block" aria-hidden="true" />
        {["All", "Completed", "Ongoing"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors hairline",
              status === s ? "bg-graphite text-white dark:bg-white dark:text-graphite" : "hover:border-fusion"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <motion.div layout className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((p) => (
            <motion.div
              key={p.slug}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <Link href={`/divisions/construction/projects/${p.slug}`} className="group card block h-full overflow-hidden transition-all duration-500 ease-fusion hover:-translate-y-1 hover:shadow-xl">
                <MediaImage
                  src={p.thumbnailUrl || (p.status === "Ongoing" ? MEDIA.construction.process : MEDIA.construction.done)}
                  alt={`${p.title} — ${p.status === "Ongoing" ? "active works" : "completed"}`}
                  tint="#D97706"
                  className="h-36"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="p-5">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
                    <span style={{ color: "#D97706" }}>{p.sector}</span>
                    <span className={cn("rounded px-1.5 py-0.5", p.status === "Ongoing" ? "bg-amber-signal/15 text-amber-signal" : "bg-green-600/10 text-green-600")}>
                      {p.status}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-lg font-semibold leading-snug group-hover:text-fusion">{p.title}</h3>
                  <p className="mt-1 text-sm ink-muted">{p.location} · {p.client}</p>
                  <p className="mt-3 text-xs ink-muted num">Contract band {p.valueBand} · {p.year}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {filtered.length === 0 && <p className="mt-8 text-sm ink-muted">No projects match this filter.</p>}
    </div>
  );
}
