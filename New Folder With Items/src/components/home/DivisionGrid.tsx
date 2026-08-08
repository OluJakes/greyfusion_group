"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DIVISIONS } from "@/lib/divisions";
import { MEDIA } from "@/lib/media";
import { MediaImage } from "@/components/media/MediaImage";
import { EASE } from "@/components/Reveal";

export function DivisionGrid() {
  return (
    <section id="divisions" className="container-gf py-20 lg:py-28">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fusion">The Group</p>
        <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Seven portals. One company.</h2>
        <p className="mt-4 leading-relaxed ink-muted">
          Each division runs on shared engineering discipline, shared procurement muscle, and a
          single accountable balance sheet. Choose where to begin.
        </p>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {DIVISIONS.map((d, i) => {
          const media = MEDIA[d.slug];
          return (
            <motion.div
              key={d.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: EASE }}
            >
              <Link
                href={d.href}
                className="group card relative block h-full overflow-hidden transition-all duration-500 ease-fusion hover:-translate-y-1 hover:shadow-2xl"
              >
                <MediaImage
                  src={media?.process ?? media?.done ?? ""}
                  alt={`${d.name} — execution in progress`}
                  tint={d.accent}
                  className="h-36 opacity-90 transition-all duration-700 ease-fusion group-hover:h-40"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="p-6">
                  <span
                    className="keyline block w-10 transition-all duration-500 ease-fusion group-hover:w-20"
                    style={{ background: d.accent }}
                  />
                  <h3 className="mt-4 font-display text-xl font-semibold">{d.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed ink-muted">{d.description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: d.accent }}>
                    Enter portal
                    <span aria-hidden="true" className="transition-transform duration-500 ease-fusion group-hover:translate-x-1.5">→</span>
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
