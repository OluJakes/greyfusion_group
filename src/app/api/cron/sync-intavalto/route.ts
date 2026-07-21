import { NextResponse, type NextRequest } from "next/server";
import { runIntavaltoSync } from "@/lib/cron/intavaltoSync";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300; // sync can page through the full catalogue

/**
 * Hourly Intavalto Retail catalogue sync endpoint.
 *
 * Schedule (cron `0 * * * *`):
 *   • Vercel — see vercel.json `crons`.
 *   • cPanel / shared hosting — add a cron job:
 *       0 * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" \
 *         https://www.greyfusion.com.ng/api/cron/sync-intavalto > /dev/null
 *
 * Security: when `CRON_SECRET` is set, the caller must present it via the
 * `Authorization: Bearer <secret>` header or `?key=<secret>`. Vercel Cron sends the
 * secret automatically. If the env var is unset the route still runs (dev convenience).
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
  const result = await runIntavaltoSync();
  const httpStatus = result.status === "FAILED" ? 502 : 200;
  return NextResponse.json({ ok: result.status !== "FAILED", ...result }, { status: httpStatus });
}

export async function GET(req: NextRequest) {
  return handle(req);
}

// Allow POST too, so external schedulers/webhooks that only issue POST also work.
export async function POST(req: NextRequest) {
  return handle(req);
}
