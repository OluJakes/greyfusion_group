/** Client-safe FX helpers (no database imports). */

export interface FxRatesShared {
  USD: number;
  EUR: number;
}

export interface FxResolution extends FxRatesShared {
  source: "NCS" | "admin" | "default";
}

/** P_ccy = P_NGN / R — formatted to B2B invoice criteria (2dp, thousands-grouped). */
export function convertNGN(amountNGN: number, rate: number): string {
  return (amountNGN / rate).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const NCS_DISCLAIMER =
  "Rates calculated in accordance with current Nigeria Customs Service (NCS) statutory FX benchmarks.";
