import { NextResponse, type NextRequest } from "next/server";
import { runCatalogSync } from "@/lib/cron/catalogSync";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300; // sync can page through the full catalogue

/**
 * Back-compat alias for the catalogue sync (kept so any existing cron pointing here still
 * works). It now runs BOTH sources (Solar Village + Intavalto). Prefer /api/cron/sync-catalog.
 * Security: when `CRON_SECRET` is set, the caller must present it via the
 * `Authorization: Bearer <secret>` header or `?key=<secret>`.
 */
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // not configured → allow (set CRON_SECRET in production)
  const header = req.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const key = req.nextUrl.searchParams.get("key") ?? "";
  return bearer === secret || key === secret;
}

async function handle(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const result = await runCatalogSync();
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

export async function GET(req: NextRequest) {
  return handle(req);
}

// Allow POST too, so external schedulers/webhooks that only issue POST also work.
export async function POST(req: NextRequest) {
  return handle(req);
}
