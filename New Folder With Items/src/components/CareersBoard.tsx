"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LeadForm } from "@/components/LeadForm";
import { EASE } from "@/components/Reveal";
import { cn } from "@/lib/utils";

export interface JobItem {
  id: string;
  slug: string;
  title: string;
  division: string;
  location: string;
  type: string;
  summary: string;
  description: string;
}

export function CareersBoard({ jobs }: { jobs: JobItem[] }) {
  const divisions = useMemo(() => ["All", ...Array.from(new Set(jobs.map((j) => j.division)))], [jobs]);
  const locations = useMemo(() => ["All", ...Array.from(new Set(jobs.map((j) => j.location)))], [jobs]);
  const [division, setDivision] = useState("All");
  const [location, setLocation] = useState("All");
  const [openJob, setOpenJob] = useState<string | null>(null);

  const filtered = jobs.filter(
    (j) => (division === "All" || j.division === division) && (location === "All" || j.location === location)
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by division">
          {divisions.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDivision(d)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors hairline",
                division === d ? "bg-fusion text-white" : "hover:border-fusion"
              )}
            >
              {d}
            </button>
          ))}
        </div>
        <label className="ml-auto text-xs font-semibold ink-muted" htmlFor="loc-filter">
          Location
        </label>
        <select id="loc-filter" className="input-gf !w-auto" value={location} onChange={(e) => setLocation(e.target.value)}>
          {locations.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </div>

      <p className="mt-4 text-sm ink-muted num">{filtered.length} open role(s)</p>

      <ul className="mt-4 space-y-4">
        {filtered.map((j) => (
          <li key={j.id} className="card overflow-hidden">
            <button
              type="button"
              className="flex w-full flex-col gap-1 p-5 text-left sm:flex-row sm:items-center sm:justify-between"
              aria-expanded={openJob === j.id}
              onClick={() => setOpenJob(openJob === j.id ? null : j.id)}
            >
              <span>
                <span className="font-display text-lg font-semibold">{j.title}</span>
                <span className="mt-1 block text-sm ink-muted">{j.summary}</span>
              </span>
              <span className="mt-2 flex shrink-0 gap-2 text-xs sm:mt-0">
                <span className="rounded-md bg-[var(--surface-2)] px-2 py-1 font-semibold">{j.division}</span>
                <span className="rounded-md bg-[var(--surface-2)] px-2 py-1">{j.location}</span>
                <span className="rounded-md bg-[var(--surface-2)] px-2 py-1">{j.type}</span>
              </span>
            </button>
            <AnimatePresence>
              {openJob === j.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="border-t p-5 hairline">
                    <p className="max-w-3xl text-sm leading-relaxed ink-muted">{j.description}</p>
                    <h4 className="mt-6 font-display font-semibold">Apply for this role</h4>
                    <div className="mt-4 max-w-2xl">
                      <LeadForm
                        type="APPLICATION"
                        division="corporate"
                        cta="Submit application"
                        successNote="Our people team reviews every application within five working days."
                        hidden={{ role: j.title, jobSlug: j.slug }}
                        fields={[
                          { name: "linkedin", label: "LinkedIn / portfolio URL", kind: "text", placeholder: "https://…", half: true },
                          { name: "experience", label: "Years of relevant experience", kind: "number", required: true, half: true },
                          { name: "coverNote", label: "Why you, in five sentences", kind: "textarea", required: true, placeholder: "Skip the buzzwords — tell us what you've shipped." },
                        ]}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>
    </div>
  );
}
