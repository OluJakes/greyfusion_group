/**
 * Smart-home live configurator pricing + WhatsApp routing (V9). Pure & testable.
 * Target WhatsApp line: +234 809 202 4484.
 */

export const SMART_HOME_WHATSAPP = "2348092024484";

export interface PropertyTypeDef {
  key: string;
  label: string;
  base: number; // base supply-and-install (NGN)
}

export const PROPERTY_TYPES: PropertyTypeDef[] = [
  { key: "apartment", label: "Apartment", base: 3_500_000 },
  { key: "duplex", label: "Duplex", base: 6_850_000 },
  { key: "mansion", label: "Mansion", base: 12_500_000 },
  { key: "commercial", label: "Commercial Estate", base: 20_000_000 },
];

export interface ModuleDef {
  key: string;
  label: string;
  price: number; // NGN
}

export const SMART_MODULES: ModuleDef[] = [
  { key: "lighting", label: "Automated Lighting", price: 1_200_000 },
  { key: "access", label: "Smart Access / Biometrics", price: 950_000 },
  { key: "shades", label: "Motorized Shades", price: 1_400_000 },
  { key: "cctv", label: "CCTV AI Telemetry", price: 1_600_000 },
  { key: "audio", label: "Distributed Audio", price: 1_800_000 },
  { key: "climate", label: "Climate Control", price: 900_000 },
];

const PER_ZONE = 450_000; // added per bedroom/zone

/** Estimate supply-and-install cost from the configurator selections. */
export function estimateSmartHome(propertyKey: string, zoneCount: number, moduleKeys: string[]): number {
  const base = PROPERTY_TYPES.find((p) => p.key === propertyKey)?.base ?? 0;
  const zones = Math.max(0, Math.floor(zoneCount)) * PER_ZONE;
  const modules = moduleKeys.reduce((sum, k) => sum + (SMART_MODULES.find((m) => m.key === k)?.price ?? 0), 0);
  return base + zones + modules;
}

function ngn(n: number): string {
  return "₦" + Math.round(n).toLocaleString("en-NG");
}

export interface QuoteSelection {
  propertyLabel: string;
  zoneCount: number;
  moduleLabels: string[];
  estimatedCost: number;
  clientPhone?: string;
}

/** Build the formatted quote summary text block sent to WhatsApp. */
export function buildWhatsAppMessage(sel: QuoteSelection): string {
  const lines = [
    "*Greyfusion Smart Home — System Configurator*",
    "",
    `Property type: ${sel.propertyLabel}`,
    `Bedrooms / zones: ${sel.zoneCount}`,
    "",
    "Selected modules:",
    ...(sel.moduleLabels.length ? sel.moduleLabels.map((m) => `• ${m}`) : ["• (none selected yet)"]),
    "",
    `Indicative estimate: ${ngn(sel.estimatedCost)}`,
    sel.clientPhone ? `Callback number: ${sel.clientPhone}` : "",
    "",
    "Please send me a formal quotation and book a site walkthrough.",
  ];
  return lines.filter((l) => l !== undefined).join("\n");
}

/** wa.me deep link to the smart-home desk with the pre-filled quote. */
export function buildWhatsAppUrl(message: string, phone: string = SMART_HOME_WHATSAPP): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
