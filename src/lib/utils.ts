export function ngn(value: number): string {
  return "₦" + value.toLocaleString("en-NG");
}

export function ngnCompact(value: number): string {
  if (value >= 1_000_000_000) return "₦" + (value / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (value >= 1_000_000) return "₦" + (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (value >= 1_000) return "₦" + Math.round(value / 1_000) + "K";
  return "₦" + value;
}

export function makeRef(prefix: string): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `${prefix}-${ymd}-${rand}`;
}

export function fmtDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function daysUntil(d: Date | string): number {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function safeJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export type Currency = "NGN" | "USD" | "EUR";

const CURRENCY_SYMBOL: Record<Currency, string> = { NGN: "\u20a6", USD: "$", EUR: "\u20ac" };

/** Format an NGN base amount in the requested currency using NGN-per-unit fx rates. */
export function money(amountNGN: number, currency: Currency, fx: { USD: number; EUR: number }): string {
  if (currency === "NGN") return ngn(Math.round(amountNGN));
  const rate = currency === "USD" ? fx.USD : fx.EUR;
  const value = amountNGN / rate;
  return CURRENCY_SYMBOL[currency] + value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/** Format an amount already denominated in `currency` (e.g. pricing plans). */
export function moneyIn(amount: number, currency: Currency): string {
  return CURRENCY_SYMBOL[currency] + amount.toLocaleString(currency === "NGN" ? "en-NG" : "en-US", { maximumFractionDigits: 0 });
}

/** Nigerian states, delivery-priority first, then A–Z; ECOWAS tail for regional orders. */
export const NG_STATES = [
  "Lagos", "FCT (Abuja)", "Rivers",
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa",
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Nasarawa", "Niger", "Ogun",
  "Ondo", "Osun", "Oyo", "Plateau", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

export const ECOWAS_REGIONS = ["Ghana", "C\u00f4te d'Ivoire", "Senegal", "Sierra Leone", "Benin", "Togo"];

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes >= 1_048_576) return (bytes / 1_048_576).toFixed(1).replace(/\.0$/, "") + " MB";
  if (bytes >= 1024) return Math.round(bytes / 1024) + " KB";
  return bytes + " B";
}

export type CredentialStatus = "valid" | "expiring" | "expired" | "perpetual";

export function credentialStatus(expiry: Date | string | null | undefined): { status: CredentialStatus; days: number | null } {
  if (!expiry) return { status: "perpetual", days: null };
  const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / 86_400_000);
  if (days <= 0) return { status: "expired", days };
  if (days <= 30) return { status: "expiring", days };
  return { status: "valid", days };
}

export const MAX_UPLOAD = { bidpack: 104_857_600, standard: 10_485_760 } as const;
