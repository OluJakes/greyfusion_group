"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/components/Reveal";

const HERO_VIDEO = {
  src: "https://assets.mixkit.co/videos/preview/mixkit-cyber-security-system-scanning-network-41584-large.mp4",
  poster: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1920&q=80",
};

/** The eight verbs from the value proposition — reinforces "Eight Industries" and
 *  anchors the lower third of the hero with brand substance (not duplicate stats). */
const CAPABILITIES = ["Engineer", "Power", "Build", "Secure", "Automate", "House", "Move", "Supply"];

export interface HeroProps {
  title?: string;
  titleAccent?: string;
  subtitle?: string;
  videoSrc?: string;
  poster?: string;
}

export function Hero({
  title = "Eight Industries.",
  titleAccent = "Standard",
  subtitle = "Greyfusion Limited engineers, powers, builds, secures, automates, houses, moves, and supplies modern Africa — from federal road corridors to 48MW of deployed solar.",
  videoSrc = HERO_VIDEO.src,
  poster = HERO_VIDEO.poster,
}: HeroProps) {
  const reduce = useReducedMotion();
  // Entrance reveal helper — respects prefers-reduced-motion (renders statically when reduced).
  const rise = (delay: number, y = 24) =>
    reduce ? {} : { initial: { opacity: 0, y }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease: EASE } };

  return (
    <section className="relative isolate overflow-hidden bg-graphite text-white">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={poster}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 brightness-[0.8] contrast-[1.05]"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Depth: accent focal glow behind the headline + directional darkening that deepens
          toward the base so the hero settles cleanly into the StatBand below. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(72% 56% at 24% 34%, rgba(226,88,62,0.22), transparent 60%)," +
            "linear-gradient(180deg, rgba(18,20,23,0.70) 0%, rgba(18,20,23,0.52) 40%, rgba(18,20,23,0.97) 100%)",
        }}
      />
      {/* Soft corner vignette for focal contrast. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 120% at 50% 0%, transparent 55%, rgba(18,20,23,0.55) 100%)" }}
      />

      <div className="container-gf relative flex min-h-[92svh] flex-col justify-center py-32">
        <motion.p
          {...rise(0, 16)}
          className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-titanium sm:text-xs sm:tracking-[0.3em]"
        >
          <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-fusion to-transparent" />
          Greyfusion Limited · Est. 2011 · RC 1120352
        </motion.p>

        <motion.h1
          {...rise(0.1)}
          className="mt-5 max-w-4xl font-display text-[2.35rem] font-semibold leading-[1.04] [text-wrap:balance] sm:text-6xl lg:text-7xl"
        >
          {title} <br />
          One{" "}
          <span className="relative inline-block whitespace-nowrap">
            <span className="fusion-text">{titleAccent}</span>
            <motion.span
              aria-hidden="true"
              initial={reduce ? false : { scaleX: 0 }}
              animate={reduce ? undefined : { scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
              style={{ transformOrigin: "left", background: "linear-gradient(90deg,#c9432b,#f0765d)" }}
              className="absolute -bottom-1.5 left-0 h-[3px] w-full rounded-full"
            />
          </span>{" "}
          <span className="whitespace-nowrap">of Execution.</span>
        </motion.h1>

        <motion.p {...rise(0.22)} className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
          {subtitle}
        </motion.p>

        <motion.div {...rise(0.34)} className="mt-9 flex flex-wrap items-center gap-3">
          <motion.div whileHover={reduce ? undefined : { y: -2 }} whileTap={reduce ? undefined : { scale: 0.97 }}>
            <Link href="#divisions" className="btn-primary group">
              Explore Our Divisions
              <span aria-hidden="true" className="transition-transform duration-300 ease-out group-hover:translate-x-1">
                →
              </span>
            </Link>
          </motion.div>
          <motion.div whileHover={reduce ? undefined : { y: -2 }} whileTap={reduce ? undefined : { scale: 0.97 }}>
            <Link href="/contact" className="btn-ghost-dark border-white/25 backdrop-blur-sm hover:border-white/60">
              Start a Project
            </Link>
          </motion.div>
        </motion.div>

        {/* Capabilities strip — fills the lower third with brand substance. */}
        <motion.ul
          {...rise(0.46)}
          className="mt-10 flex max-w-2xl flex-wrap gap-x-5 gap-y-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-titanium sm:text-[11px] sm:tracking-[0.2em]"
        >
          {CAPABILITIES.map((c) => (
            <li key={c} className="flex items-center gap-2">
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-fusion" />
              {c}
            </li>
          ))}
        </motion.ul>
      </div>

      {/* Scroll affordance (desktop) — anchors the base and cues the next section. */}
      <motion.a
        href="#divisions"
        aria-label="Scroll to divisions"
        initial={reduce ? false : { opacity: 0 }}
        animate={reduce ? undefined : { opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="absolute inset-x-0 bottom-6 mx-auto hidden w-max flex-col items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-titanium transition-colors hover:text-white sm:flex"
      >
        Scroll
        <motion.span
          aria-hidden="true"
          animate={reduce ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="block h-4 w-px bg-gradient-to-b from-fusion to-transparent"
        />
      </motion.a>
    </section>
  );
}
