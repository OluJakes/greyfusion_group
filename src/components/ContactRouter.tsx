"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DIVISIONS } from "@/lib/divisions";
import { LeadForm, type FieldDef } from "@/components/LeadForm";

const DIVISION_FIELDS: Record<string, { intro: string; fields: FieldDef[] }> = {
  corporate: {
    intro: "General, media and partnership enquiries.",
    fields: [
      { name: "subject", label: "Subject", kind: "text", required: true, placeholder: "e.g. Partnership proposal" },
      { name: "message", label: "Message", kind: "textarea", required: true, placeholder: "Tell us what you need and by when." },
    ],
  },
  construction: {
    intro: "Project intake for civil, structural and design-build work.",
    fields: [
      { name: "projectType", label: "Project type", kind: "select", required: true, options: ["Civil infrastructure", "Structural engineering", "Design-build", "Project management / QS", "General contracting"] },
      { name: "budgetBand", label: "Indicative budget", kind: "select", required: true, options: ["Under ₦50M", "₦50M – ₦250M", "₦250M – ₦1B", "Above ₦1B"], half: true },
      { name: "timeline", label: "Target start", kind: "select", options: ["Within 3 months", "3–6 months", "6–12 months", "Exploratory"], half: true },
      { name: "message", label: "Project brief", kind: "textarea", required: true, placeholder: "Location, scope, current stage of design…" },
    ],
  },
  energy: {
    intro: "Solar, storage and micro-grid enquiries.",
    fields: [
      { name: "siteType", label: "Site type", kind: "select", required: true, options: ["Commercial / office", "Industrial / factory", "Estate / residential cluster", "Agricultural", "Public institution"], half: true },
      { name: "monthlyBill", label: "Monthly energy spend (₦)", kind: "number", half: true },
      { name: "message", label: "What are you trying to achieve?", kind: "textarea", required: true },
    ],
  },
  it: {
    intro: "Security, cloud and managed services enquiries.",
    fields: [
      { name: "service", label: "Service area", kind: "select", required: true, options: ["Cybersecurity operations", "GRC / compliance", "Cloud architecture", "Managed DevOps", "Not sure yet"], half: true },
      { name: "headcount", label: "Organisation size", kind: "select", options: ["1–20", "21–100", "101–500", "500+"], half: true },
      { name: "message", label: "Context", kind: "textarea", required: true, placeholder: "Current stack, deadlines, compliance drivers…" },
    ],
  },
  "smart-home": {
    intro: "Automation, CCTV and security-system enquiries.",
    fields: [
      { name: "facilityType", label: "Facility type", kind: "select", required: true, options: ["Apartment / flat", "Detached home / duplex", "Estate (multi-unit)", "Office / commercial", "Industrial / warehouse", "Hospitality"], half: true },
      { name: "interest", label: "Primary interest", kind: "select", required: true, options: ["Full smart-home automation", "CCTV & surveillance", "Access control & smart locks", "Alarm & intrusion detection", "Facility-wide integration"], half: true },
      { name: "message", label: "Tell us about the space", kind: "textarea", required: true, placeholder: "Size, current systems, what you want automated or secured…" },
    ],
  },
  "real-estate": {
    intro: "Lettings, sales and portfolio enquiries.",
    fields: [
      { name: "interest", label: "I'm interested in", kind: "select", required: true, options: ["Renting residential", "Shortlet stay", "Commercial space", "Warehousing", "Listing my property"], half: true },
      { name: "budget", label: "Budget (₦)", kind: "number", half: true },
      { name: "message", label: "Requirements", kind: "textarea", required: true, placeholder: "Location, size, move-in date…" },
    ],
  },
  autos: {
    intro: "Vehicle sales, fleet and charging enquiries.",
    fields: [
      { name: "interest", label: "Enquiry type", kind: "select", required: true, options: ["Personal vehicle purchase", "Fleet / corporate", "Charging infrastructure", "After-sales & service"], half: true },
      { name: "vehicle", label: "Vehicle of interest (optional)", kind: "text", half: true, placeholder: "e.g. BYD Seal" },
      { name: "message", label: "Details", kind: "textarea", required: true },
    ],
  },
  commerce: {
    intro: "Orders, bulk procurement and store support.",
    fields: [
      { name: "topic", label: "Topic", kind: "select", required: true, options: ["Order support", "Bulk / B2B quote", "Product question", "Returns & warranty"], half: true },
      { name: "orderRef", label: "Order ref (if any)", kind: "text", half: true, placeholder: "GF-ORD-…" },
      { name: "message", label: "Message", kind: "textarea", required: true },
    ],
  },
};

const TABS = [{ slug: "corporate", short: "General" }, ...DIVISIONS.map((d) => ({ slug: d.slug, short: d.short }))];

export function ContactRouter() {
  const [division, setDivision] = useState("corporate");
  const config = DIVISION_FIELDS[division];

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Choose a division">
        {TABS.map((t) => (
          <button
            key={t.slug}
            role="tab"
            aria-selected={division === t.slug}
            type="button"
            onClick={() => setDivision(t.slug)}
            className="relative rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-300 hairline hover:border-fusion"
          >
            {division === t.slug && (
              <motion.span
                layoutId="contact-tab-pill"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="absolute inset-0 rounded-full bg-fusion"
              />
            )}
            <span className={"relative " + (division === t.slug ? "text-white" : "")}>{t.short}</span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm ink-muted">{config.intro}</p>
      <div className="mt-6">
        <LeadForm
          key={division}
          type="CONTACT"
          division={division as never}
          cta="Send enquiry"
          successNote="Expect a reply within one working day — sooner on WhatsApp."
          fields={config.fields}
        />
      </div>
    </div>
  );
}
