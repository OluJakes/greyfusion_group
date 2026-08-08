import { NextResponse, type NextRequest } from "next/server";
import { runCatalogSync } from "@/lib/cron/catalogSync";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

// 12-hourly external catalogue sync (Solar Village + Intavalto Retail).
// Schedule: cron "0 */12 * * *" — Vercel uses vercel.json `crons`; on cPanel add a job:
//   0 */12 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" \
//     https://www.greyfusion.com.ng/api/cron/sync-catalog > /dev/null
// Security: when CRON_SECRET is set the caller must present it via the
// "Authorization: Bearer <secret>" header or ?key=<secret>. Unset -> runs (dev convenience).
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const header = req.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const key = req.nextUrl.searchParams.get("key") ?? "";
  return bearer === secret || key === secret;
}

async function handle(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const result = await runCatalogSync();
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

export async function GET(req: NextRequest) {
  return handle(req);
}
export async function POST(req: NextRequest) {
  return handle(req);
}
