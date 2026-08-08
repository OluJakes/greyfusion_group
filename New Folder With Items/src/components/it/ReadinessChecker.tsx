"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { EASE } from "@/components/Reveal";

const QUESTIONS = [
  { q: "Do you maintain a current asset inventory (hardware, software, data)?", domain: "Asset Mgmt" },
  { q: "Is multi-factor authentication enforced for all admin and remote access?", domain: "Identity" },
  { q: "Are backups tested by actual restore at least quarterly?", domain: "Resilience" },
  { q: "Do you have a written, rehearsed incident response plan?", domain: "Response" },
  { q: "Are vendor/third-party risks formally assessed before onboarding?", domain: "Third Party" },
  { q: "Is security awareness training delivered to all staff at least annually?", domain: "People" },
  { q: "Are systems patched on a defined SLA (critical ≤ 14 days)?", domain: "Vuln Mgmt" },
  { q: "Does leadership review security metrics at least quarterly?", domain: "Governance" },
] as const;

const OPTIONS = ["No / not sure", "Partially", "Yes, documented"] as const;

export function ReadinessChecker() {
  const [answers, setAnswers] = useState<number[]>(Array(QUESTIONS.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);

  const answered = answers.filter((a) => a >= 0).length;
  const score = useMemo(() => answers.reduce((s, a) => s + Math.max(a, 0), 0), [answers]);
  const pct = Math.round((score / (QUESTIONS.length * 2)) * 100);

  const verdict =
    pct >= 80
      ? { title: "Audit-ready posture", body: "You're close. A gap assessment would likely surface only documentation-level findings. Consider moving straight to certification planning (ISO 27001 or SOC 2 Type I)." }
      : pct >= 50
        ? { title: "Foundations present, gaps material", body: "Core controls exist but wouldn't survive an auditor's sampling. A structured 12–16 week remediation programme typically closes this gap. Start with identity and incident response." }
        : { title: "Elevated exposure", body: "Your current posture leaves material risk unmanaged. We recommend a prioritised 90-day hardening sprint — MFA, backup restores and an IR plan first — before any compliance spend." };

  // radar polygon
  const radar = useMemo(() => {
    const cx = 110, cy = 110, R = 86;
    const pts = QUESTIONS.map((_, i) => {
      const angle = (Math.PI * 2 * i) / QUESTIONS.length - Math.PI / 2;
      const val = Math.max(answers[i], 0) / 2;
      return { x: cx + Math.cos(angle) * R * val, y: cy + Math.sin(angle) * R * val, lx: cx + Math.cos(angle) * (R + 16), ly: cy + Math.sin(angle) * (R + 16) };
    });
    const rings = [0.33, 0.66, 1].map((f) =>
      QUESTIONS.map((_, i) => {
        const angle = (Math.PI * 2 * i) / QUESTIONS.length - Math.PI / 2;
        return `${cx + Math.cos(angle) * R * f},${cy + Math.sin(angle) * R * f}`;
      }).join(" ")
    );
    return { pts, rings, poly: pts.map((p) => `${p.x},${p.y}`).join(" ") };
  }, [answers]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <ol className="space-y-4">
        {QUESTIONS.map((item, i) => (
          <li key={item.q} className="card p-5">
            <p className="text-sm font-medium">
              <span className="num mr-2 ink-muted">{String(i + 1).padStart(2, "0")}</span>
              {item.q}
            </p>
            <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={item.q}>
              {OPTIONS.map((o, v) => (
                <button
                  key={o}
                  type="button"
                  role="radio"
                  aria-checked={answers[i] === v}
                  onClick={() => {
                    const next = [...answers];
                    next[i] = v;
                    setAnswers(next);
                  }}
                  className={
                    "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors hairline " +
                    (answers[i] === v ? "bg-[#6366F1] text-white" : "hover:border-[#6366F1]")
                  }
                >
                  {o}
                </button>
              ))}
            </div>
          </li>
        ))}
        <button
          type="button"
          className="btn-primary w-full sm:w-auto"
          style={{ background: "linear-gradient(120deg,#4F46E5,#6366F1 60%,#818CF8)", boxShadow: "0 8px 24px -12px rgba(99,102,241,.5)" }}
          disabled={answered < QUESTIONS.length}
          onClick={() => setSubmitted(true)}
        >
          {answered < QUESTIONS.length ? `Answer ${QUESTIONS.length - answered} more to score` : "Score my readiness"}
        </button>
      </ol>

      <div className="lg:sticky lg:top-24 lg:h-fit">
        <motion.div layout className="card p-6" transition={{ duration: 0.4, ease: EASE }}>
          <p className="text-[11px] font-semibold uppercase tracking-wider ink-muted">Readiness radar</p>
          <svg viewBox="0 0 220 220" className="mx-auto mt-2 w-full max-w-[16rem]" role="img" aria-label={`Compliance readiness score ${pct} percent`}>
            {radar.rings.map((ring, i) => (
              <polygon key={i} points={ring} fill="none" stroke="var(--line)" strokeWidth="1" />
            ))}
            <polygon points={radar.poly} fill="rgba(99,102,241,0.25)" stroke="#6366F1" strokeWidth="2" strokeLinejoin="round" />
            {QUESTIONS.map((item, i) => (
              <text key={item.domain} x={radar.pts[i].lx} y={radar.pts[i].ly} fontSize="7.5" fill="var(--muted)" textAnchor="middle">
                {item.domain}
              </text>
            ))}
          </svg>
          <p className="num text-center font-display text-4xl font-semibold" style={{ color: "#6366F1" }}>{pct}%</p>
          {submitted ? (
            <div className="mt-4 border-t pt-4 hairline">
              <h3 className="font-display font-semibold">{verdict.title}</h3>
              <p className="mt-2 text-sm leading-relaxed ink-muted">{verdict.body}</p>
              <a href="#helpdesk" className="mt-4 inline-block text-sm font-semibold" style={{ color: "#6366F1" }}>
                Discuss your result with an engineer →
              </a>
            </div>
          ) : (
            <p className="mt-3 text-center text-xs ink-muted">Answer all eight to unlock your tailored recommendation.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
