import { unstable_cache } from "next/cache";
import { getConfig, DEFAULT_FX, type FxRates } from "@/lib/content";

/**
 * Nigeria Customs Service FX alignment.
 *
 * Policy: international pricing (NGN → USD/EUR) is computed as
 *   P_ccy = P_NGN / R_NCS
 * where R_NCS is the statutory rate published at https://customs.gov.ng/exchange-rate.
 *
 * Resolution order:
 *   1. Best-effort fetch of the NCS page (cached 12h, 4s timeout) — parsed defensively.
 *   2. Admin override: SiteConfiguration key "fx_rates" (edit in /admin → Site config).
 *   3. Coded defaults.
 *
 * The customs site is HTML (no public JSON API), so the parser is deliberately
 * conservative: any doubt → fall through to the admin-controlled rate.
 */

async function fetchNcsRates(): Promise<Partial<FxRates> | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://customs.gov.ng/exchange-rate", {
      signal: controller.signal,
      headers: { "User-Agent": "GreyfusionPlatform/1.0 (+https://www.greyfusion.com.ng)" },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const html = await res.text();
    const pick = (codes: string[]): number | undefined => {
      for (const code of codes) {
        // Match e.g. "USD ... 1,530.25" within a table row-ish window
        const re = new RegExp(`${code}[^0-9]{0,400}?([0-9]{3,4}(?:,[0-9]{3})*(?:\\.[0-9]+)?)`, "i");
        const m = html.match(re);
        if (m) {
          const value = Number(m[1].replace(/,/g, ""));
          if (Number.isFinite(value) && value > 200 && value < 20000) return value;
        }
      }
      return undefined;
    };
    const usd = pick(["USD", "US DOLLAR"]);
    const eur = pick(["EUR", "EURO"]);
    if (!usd && !eur) return null;
    return { ...(usd ? { USD: usd } : {}), ...(eur ? { EUR: eur } : {}) };
  } catch {
    return null;
  }
}

const cachedNcs = unstable_cache(fetchNcsRates, ["ncs-fx"], { revalidate: 60 * 60 * 12 });

import type { FxResolution } from "@/lib/fx-shared";
export type { FxResolution };

export async function resolveFxRates(): Promise<FxResolution> {
  const admin = await getConfig<FxRates>("fx_rates", DEFAULT_FX);
  const ncs = await cachedNcs();
  if (ncs && (ncs.USD || ncs.EUR)) {
    return { USD: ncs.USD ?? admin.USD, EUR: ncs.EUR ?? admin.EUR, source: "NCS" };
  }
  const isDefault = admin.USD === DEFAULT_FX.USD && admin.EUR === DEFAULT_FX.EUR;
  return { ...admin, source: isDefault ? "default" : "admin" };
}

export { convertNGN, NCS_DISCLAIMER, type FxResolution as FxResolutionShared } from "@/lib/fx-shared";
