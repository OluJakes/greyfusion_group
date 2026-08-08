"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { EASE } from "@/components/Reveal";

const HERO_VIDEO = {
  src: "https://assets.mixkit.co/videos/preview/mixkit-cyber-security-system-scanning-network-41584-large.mp4",
  poster: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1920&q=80",
};

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
  return (
    <section className="relative overflow-hidden bg-graphite text-white">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={poster}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 brightness-[0.75] contrast-[1.05]"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(18,20,23,0.82) 0%, rgba(18,20,23,0.62) 45%, rgba(18,20,23,0.92) 100%), radial-gradient(60% 50% at 70% 20%, rgba(226,88,62,0.16), transparent 70%)",
        }}
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/3 w-full"
        viewBox="0 0 1440 320"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M-40 240 C 220 240, 300 80, 560 96 S 940 260, 1180 190 S 1420 60, 1500 90"
          stroke="url(#gf-grad)"
          strokeWidth="2"
          className="animate-thread"
        />
        <defs>
          <linearGradient id="gf-grad" x1="0" x2="1440" y1="0" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#C9432B" />
            <stop offset="0.55" stopColor="#E2583E" />
            <stop offset="1" stopColor="#F0765D" />
          </linearGradient>
        </defs>
      </svg>

      <div className="container-gf relative flex min-h-[92svh] flex-col justify-center py-32">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-xs font-semibold uppercase tracking-[0.3em] text-titanium"
        >
          Greyfusion Limited · Est. 2011 · RC 1120352
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl"
        >
          {title} <br />
          One <span className="fusion-text">{titleAccent}</span> of Execution.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22, ease: EASE }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-titanium sm:text-lg"
        >
          {subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.34, ease: EASE }}
          className="mt-9 flex flex-wrap gap-3"
        >
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link href="#divisions" className="btn-primary">
              Explore Our Divisions
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link href="/contact" className="btn-ghost-dark backdrop-blur-sm">
              Start a Project
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
