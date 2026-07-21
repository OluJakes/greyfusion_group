"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { COMPANY } from "@/lib/divisions";
import { EASE } from "@/components/Reveal";

const ACTIONS = [
  {
    label: "WhatsApp",
    sub: "Chat with us now",
    href: `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent("Hello Greyfusion, I'd like to make an enquiry.")}`,
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.4-3c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.2-.3.3-.5v-.5c0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.5 1.1 2.7c.1.2 1.9 3 4.6 4.2.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.4-.3Z" />
      </svg>
    ),
  },
  {
    label: "Call us",
    sub: COMPANY.phones[0],
    href: "tel:+2348092024484",
    external: false,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Email",
    sub: COMPANY.email,
    href: `mailto:${COMPANY.email}`,
    external: false,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    ),
  },
  {
    label: "Contact form",
    sub: "Division-routed intake",
    href: "/contact",
    external: false,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function FloatingContact() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="card w-64 overflow-hidden p-2 shadow-2xl"
            role="menu"
            aria-label="Contact options"
          >
            <li className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-widest ink-muted">
              Talk to Greyfusion
            </li>
            {ACTIONS.map((a) =>
              a.external || a.href.startsWith("tel") || a.href.startsWith("mailto") ? (
                <li key={a.label} role="none">
                  <a
                    role="menuitem"
                    href={a.href}
                    target={a.external ? "_blank" : undefined}
                    rel={a.external ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--surface-2)]"
                    onClick={() => setOpen(false)}
                  >
                    <span className="text-fusion">{a.icon}</span>
                    <span>
                      <span className="block text-sm font-semibold">{a.label}</span>
                      <span className="block text-xs ink-muted">{a.sub}</span>
                    </span>
                  </a>
                </li>
              ) : (
                <li key={a.label} role="none">
                  <Link
                    role="menuitem"
                    href={a.href}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--surface-2)]"
                    onClick={() => setOpen(false)}
                  >
                    <span className="text-fusion">{a.icon}</span>
                    <span>
                      <span className="block text-sm font-semibold">{a.label}</span>
                      <span className="block text-xs ink-muted">{a.sub}</span>
                    </span>
                  </Link>
                </li>
              )
            )}
            <li className="border-t px-3 py-2 text-[11px] leading-relaxed hairline ink-muted">
              {COMPANY.hours}
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close contact options" : "Open contact options"}
        className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl"
        style={{ background: "linear-gradient(135deg, #C9432B, #E2583E 60%, #F0765D)" }}
      >
        {open ? (
          <span className="text-xl" aria-hidden="true">✕</span>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M21 12a8 8 0 0 1-8 8H4l1.6-3.2A8 8 0 1 1 21 12Z" strokeLinejoin="round" />
            <path d="M8 10h8M8 14h5" strokeLinecap="round" />
          </svg>
        )}
      </motion.button>
    </div>
  );
}
