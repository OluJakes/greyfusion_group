"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DIVISIONS } from "@/lib/divisions";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { EASE } from "@/components/Reveal";
import type { Branding, NavItemView } from "@/lib/branding";

export function Header({ branding, extraNav = [] }: { branding?: Branding; extraNav?: NavItemView[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accordion, setAccordion] = useState<string | null>(null);
  const megaRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaOpen(false);
        setDrawerOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const openCmdk = () => window.dispatchEvent(new CustomEvent("gf:cmdk"));

  // The marketing header has its own console chrome on /admin — don't render it there
  // (this also removes the old white-nav-on-light-background contrast bug entirely).
  if (pathname?.startsWith("/admin")) return null;

  // Two clearly-distinct states for contrast between scroll and rest:
  //  • rest (top): floats transparently over the page's dark hero with white nav text,
  //    backed by a top scrim so the text stays legible even where a hero is lighter.
  //  • scrolled / mega open: solid theme-aware surface with ink-token text.
  const onDark = !scrolled && !megaOpen;
  const navText = onDark ? "text-white/90 hover:text-white" : "text-[var(--ink)] hover:text-fusion";

  return (
    <header
      className={
        "fixed inset-x-0 top-0 z-40 transition-all duration-300 ease-fusion " +
        (scrolled || megaOpen
          ? "border-b hairline bg-[var(--surface)]/90 backdrop-blur-xl shadow-sm"
          : "bg-transparent")
      }
    >
      {onDark && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-transparent"
        />
      )}
      <div className="container-gf relative z-10 flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label={`${branding?.siteName ?? "Greyfusion Limited"} — home`} onClick={() => setMegaOpen(false)}>
          <Logo
            className={"transition-colors duration-300 " + (onDark ? "text-white" : "text-[var(--ink)]")}
            markClass={onDark ? "text-white" : "text-[var(--ink)]"}
            logoUrl={onDark ? (branding?.logoDarkUrl || "") : (branding?.logoLightUrl || "")}
            siteName={branding?.siteName ?? "GREYFUSION"}
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary" ref={megaRef as never}>
          <button
            type="button"
            className={"rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-300 " + navText}
            aria-expanded={megaOpen}
            aria-haspopup="true"
            onClick={() => setMegaOpen((v) => !v)}
          >
            Our Divisions <span aria-hidden="true" className="ml-1 inline-block text-xs">{megaOpen ? "▴" : "▾"}</span>
          </button>
          {[
            { label: "About", href: "/about" },
            { label: "Compliance", href: "/compliance" },
            { label: "Insights", href: "/insights" },
            { label: "Careers", href: "/careers" },
            { label: "Contact", href: "/contact" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className={"rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-300 " + navText}>
              {l.label}
            </Link>
          ))}
          {extraNav.map((l) => (
            <Link
              key={l.id}
              href={l.url}
              target={l.target === "_blank" ? "_blank" : undefined}
              rel={l.target === "_blank" ? "noopener noreferrer" : undefined}
              className={"rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-300 " + navText}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCmdk}
            className={
              "hidden items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors duration-300 hover:border-fusion sm:flex " +
              (onDark ? "border-white/25 text-white/85" : "hairline ink-muted")
            }
            aria-label="Open command bar"
          >
            Search
            <kbd className={"rounded border px-1.5 py-0.5 text-[10px] " + (onDark ? "border-white/25" : "hairline")}>⌘K</kbd>
          </button>
          <ThemeToggle className={onDark ? "!border-white/25 text-white" : ""} />
          <Link href="/contact" className="btn-primary hidden !px-4 !py-2 lg:inline-flex">
            Start a Project
          </Link>
          <button
            type="button"
            className={
              "flex h-9 w-9 flex-col items-center justify-center gap-1 rounded-lg border transition-colors duration-300 lg:hidden " +
              (onDark ? "border-white/25 text-white" : "hairline")
            }
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <span className="h-0.5 w-4 bg-current" />
            <span className="h-0.5 w-4 bg-current" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {megaOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="hidden border-t hairline bg-[var(--surface)]/95 backdrop-blur-xl lg:block"
          >
            <div className="container-gf grid grid-cols-3 gap-6 py-8 xl:grid-cols-4">
              {DIVISIONS.map((d, i) => (
                <motion.div
                  key={d.slug}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05, ease: EASE }}
                >
                  <Link
                    href={d.href}
                    onClick={() => setMegaOpen(false)}
                    className="group block rounded-xl p-3 transition-colors hover:bg-[var(--surface-2)]"
                  >
                    <span className="keyline block w-8" style={{ background: d.accent }} />
                    <p className="mt-3 font-display text-sm font-semibold">{d.name}</p>
                    <p className="mt-1 text-xs leading-relaxed ink-muted">{d.tagline}</p>
                  </Link>
                  <ul className="mt-2 space-y-1 px-3">
                    {d.links.map((l) => (
                      <li key={l.href + l.label}>
                        <Link
                          href={l.href}
                          onClick={() => setMegaOpen(false)}
                          className="text-xs ink-muted transition-colors hover:text-fusion"
                        >
                          {l.label} →
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-graphite/95 backdrop-blur-lg lg:hidden"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex h-16 items-center justify-between px-4">
              <Logo className="text-white" markClass="text-white" />
              <button
                type="button"
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 text-white"
                onClick={() => setDrawerOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="h-[calc(100dvh-4rem)] overflow-y-auto px-4 pb-10">
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-titanium">Divisions</p>
              <ul className="mt-2 divide-y divide-white/10">
                {DIVISIONS.map((d) => (
                  <li key={d.slug}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between py-3.5 text-left text-white"
                      aria-expanded={accordion === d.slug}
                      onClick={() => setAccordion(accordion === d.slug ? null : d.slug)}
                    >
                      <span className="flex items-center gap-3">
                        <span className="h-6 w-1 rounded-full" style={{ background: d.accent }} />
                        <span className="font-display font-semibold">{d.name}</span>
                      </span>
                      <span className="text-titanium">{accordion === d.slug ? "−" : "+"}</span>
                    </button>
                    <AnimatePresence>
                      {accordion === d.slug && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: EASE }}
                          className="overflow-hidden pb-3 pl-4"
                        >
                          <li>
                            <Link href={d.href} className="block py-1.5 text-sm text-titanium" onClick={() => setDrawerOpen(false)}>
                              Division overview →
                            </Link>
                          </li>
                          {d.links.map((l) => (
                            <li key={l.href + l.label}>
                              <Link href={l.href} className="block py-1.5 text-sm text-titanium" onClick={() => setDrawerOpen(false)}>
                                {l.label}
                              </Link>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                ))}
              </ul>
              <ul className="mt-6 space-y-1">
                {[
                  { label: "About", href: "/about" },
                  { label: "Compliance", href: "/compliance" },
                  { label: "Insights", href: "/insights" },
                  { label: "Careers", href: "/careers" },
                  { label: "Contact", href: "/contact" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="block py-2 font-display text-lg text-white" onClick={() => setDrawerOpen(false)}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/contact" className="btn-primary mt-6 w-full" onClick={() => setDrawerOpen(false)}>
                Start a Project
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
