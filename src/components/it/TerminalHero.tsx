"use client";

import { useEffect, useState } from "react";

const LINES = [
  "[SOC] 02:41:07 UTC — anomalous OAuth grant blocked · tenant: meridian-trust",
  "[EDR] lateral-movement heuristic tripped on FIN-SRV-04 · host isolated in 1.8s",
  "[GRC] ISO 27001 A.8.16 evidence pack compiled · 0 nonconformities",
  "[NET] 14,206 events/min ingested · 3 escalations · 0 breaches",
  "[IAM] stale privileged account disabled · access review #See-Q3 complete",
];

export function TerminalHero() {
  const [lineIdx, setLineIdx] = useState(0);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    const line = LINES[lineIdx];
    if (chars < line.length) {
      const t = setTimeout(() => setChars((c) => c + 2), 18);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setLineIdx((i) => (i + 1) % LINES.length);
      setChars(0);
    }, 2200);
    return () => clearTimeout(t);
  }, [chars, lineIdx]);

  return (
    <div className="card overflow-hidden bg-[#0B0E12] font-mono text-[13px] leading-relaxed text-[#7EE787] shadow-2xl">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" aria-hidden="true" />
        <span className="ml-3 text-xs text-white/40">gf-soc — live feed</span>
      </div>
      <div className="h-40 space-y-1.5 p-4" aria-live="off">
        {LINES.slice(0, lineIdx).slice(-3).map((l) => (
          <p key={l} className="opacity-50">{l}</p>
        ))}
        <p>
          {LINES[lineIdx].slice(0, chars)}
          <span className="terminal-caret inline-block h-4 w-2 translate-y-0.5 bg-[#7EE787]" aria-hidden="true" />
        </p>
      </div>
    </div>
  );
}
