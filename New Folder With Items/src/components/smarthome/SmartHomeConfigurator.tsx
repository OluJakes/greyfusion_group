"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  PROPERTY_TYPES,
  SMART_MODULES,
  estimateSmartHome,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
} from "@/lib/smarthome";
import { submitSmartHomeQuote } from "@/app/actions";

const ACCENT = "#A855F7";

export function SmartHomeConfigurator() {
  const [property, setProperty] = useState(PROPERTY_TYPES[1].key); // Duplex
  const [zones, setZones] = useState(4);
  const [modules, setModules] = useState<string[]>(["lighting", "cctv", "access"]);
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);

  const propertyLabel = PROPERTY_TYPES.find((p) => p.key === property)?.label ?? "";
  const moduleLabels = useMemo(
    () => SMART_MODULES.filter((m) => modules.includes(m.key)).map((m) => m.label),
    [modules]
  );
  const estimatedCost = useMemo(() => estimateSmartHome(property, zones, modules), [property, zones, modules]);

  const toggleModule = (key: string) =>
    setModules((m) => (m.includes(key) ? m.filter((k) => k !== key) : [...m, key]));

  async function routeToWhatsApp() {
    const message = buildWhatsAppMessage({ propertyLabel, zoneCount: zones, moduleLabels, estimatedCost, clientPhone: phone });
    const url = buildWhatsAppUrl(message);
    // Best-effort server log; never block the WhatsApp hand-off on it.
    void submitSmartHomeQuote({ propertyType: propertyLabel, zoneCount: zones, selectedModules: moduleLabels, estimatedCost, clientPhone: phone });
    setSent(true);
    if (typeof window !== "undefined") window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="card p-6">
        {/* Step 1 — property */}
        <h3 className="font-display text-lg font-semibold">1 · Property category</h3>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PROPERTY_TYPES.map((p) => (
            <button
              key={p.key} type="button" onClick={() => setProperty(p.key)} aria-pressed={property === p.key}
              className={cn("rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors hairline", property === p.key ? "text-white" : "hover:border-[#A855F7]")}
              style={property === p.key ? { background: ACCENT } : undefined}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Step 2 — zones */}
        <h3 className="mt-6 font-display text-lg font-semibold">2 · Bedrooms / zones</h3>
        <div className="mt-3 flex items-center gap-3">
          <button type="button" aria-label="Fewer zones" onClick={() => setZones((z) => Math.max(1, z - 1))} className="h-9 w-9 rounded-lg border text-lg hairline">−</button>
          <span className="num w-10 text-center font-display text-2xl font-bold">{zones}</span>
          <button type="button" aria-label="More zones" onClick={() => setZones((z) => Math.min(60, z + 1))} className="h-9 w-9 rounded-lg border text-lg hairline">+</button>
          <span className="text-sm ink-muted">zone{zones > 1 ? "s" : ""} to automate</span>
        </div>

        {/* Step 3 — modules */}
        <h3 className="mt-6 font-display text-lg font-semibold">3 · Smart modules</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SMART_MODULES.map((m) => {
            const on = modules.includes(m.key);
            return (
              <button
                key={m.key} type="button" onClick={() => toggleModule(m.key)} aria-pressed={on}
                className={cn("flex items-center justify-between gap-2 rounded-xl border px-3.5 py-3 text-left text-sm transition-colors", on ? "border-2" : "hairline hover:border-[#A855F7]")}
                style={on ? { borderColor: ACCENT, background: "color-mix(in srgb, #A855F7 8%, transparent)" } : undefined}
              >
                <span className="font-semibold">{m.label}</span>
                <span aria-hidden="true" className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px]", on ? "text-white" : "ink-muted")} style={on ? { background: ACCENT, borderColor: ACCENT } : undefined}>
                  {on ? "✓" : "+"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live summary + WhatsApp router */}
      <div className="card flex flex-col p-6">
        <h3 className="font-display text-base font-semibold uppercase tracking-wider">Your configuration</h3>
        <dl className="mt-4 space-y-2.5 text-sm">
          <div className="flex justify-between gap-3"><dt className="ink-muted">Property</dt><dd className="font-semibold">{propertyLabel}</dd></div>
          <div className="flex justify-between gap-3"><dt className="ink-muted">Zones</dt><dd className="num font-semibold">{zones}</dd></div>
          <div className="flex justify-between gap-3"><dt className="ink-muted">Modules</dt><dd className="font-semibold">{moduleLabels.length}</dd></div>
        </dl>
        <motion.p layout className="num mt-5 font-display text-3xl font-bold" style={{ color: ACCENT }}>
          ₦{Math.round(estimatedCost).toLocaleString("en-NG")}
        </motion.p>
        <p className="text-xs ink-muted">Indicative supply &amp; install — a free walkthrough fixes the quote.</p>

        <div className="mt-4">
          <label className="label-gf" htmlFor="sh-phone">Your WhatsApp / phone (optional)</label>
          <input id="sh-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-gf w-full" placeholder="0809…" />
        </div>

        <button
          type="button"
          onClick={routeToWhatsApp}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.01]"
          style={{ background: "#25D366", boxShadow: "0 8px 24px -12px rgba(37,211,102,.6)" }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M17.5 14.4c-.3-.15-1.7-.85-2-.95-.26-.1-.45-.15-.64.15-.19.28-.73.94-.9 1.13-.16.19-.33.21-.61.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.29-.02-.44.13-.59.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.08-.15-.64-1.55-.88-2.12-.23-.55-.47-.48-.64-.49h-.55c-.19 0-.5.07-.76.36-.26.29-1 .98-1 2.38s1.02 2.76 1.17 2.95c.15.19 2.02 3.08 4.9 4.32.68.29 1.22.47 1.63.6.69.22 1.31.19 1.8.11.55-.08 1.7-.69 1.94-1.37.24-.67.24-1.25.17-1.37-.07-.12-.26-.19-.55-.34zM12 2a10 10 0 0 0-8.6 15.05L2 22l5.05-1.33A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3 .79.8-2.92-.2-.31A8.2 8.2 0 1 1 12 20.2z" />
          </svg>
          {sent ? "Reopen in WhatsApp" : "Send quote via WhatsApp"}
        </button>
        {sent && <p className="mt-2 text-center text-xs ink-muted">Opened WhatsApp with your quote pre-filled. Didn&apos;t open? Check your pop-up blocker.</p>}
      </div>
    </div>
  );
}
