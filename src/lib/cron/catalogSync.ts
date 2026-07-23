import { runIntavaltoSync, type SyncResult } from "@/lib/cron/intavaltoSync";
import { runSolarvillageSync } from "@/lib/cron/solarvillageSync";

/**
 * Unified catalogue sync (V15). Runs every source adapter and returns a per-source report.
 *   • Intavalto Retail  — WooCommerce Store API (full data: descriptions, price, images)
 *   • Solar Village     — Magento listing scraper
 * Scheduled every 12 hours (see vercel.json / the cron route).
 */

function toFailed(e: unknown): SyncResult {
  const message = e instanceof Error ? e.message : String(e);
  return { status: "FAILED", created: 0, updated: 0, failed: 0, pages: 0, message };
}

export interface CatalogSyncResult {
  ok: boolean;
  totalCreated: number;
  totalUpdated: number;
  sources: Record<string, SyncResult>;
}

export async function runCatalogSync(): Promise<CatalogSyncResult> {
  const [intavalto, solarvillage] = await Promise.all([
    runIntavaltoSync().catch(toFailed),
    runSolarvillageSync().catch(toFailed),
  ]);

  const sources = { INTAVALTO_RETAIL: intavalto, SOLARVILLAGE: solarvillage };
  const totalCreated = intavalto.created + solarvillage.created;
  const totalUpdated = intavalto.updated + solarvillage.updated;
  // OK if at least one source did not hard-fail.
  const ok = intavalto.status !== "FAILED" || solarvillage.status !== "FAILED";

  return { ok, totalCreated, totalUpdated, sources };
}
