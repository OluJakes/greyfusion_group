import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { SESSION_COOKIE, EVENT_TYPES } from "@/lib/analytics";
import { clientMeta, logEvent } from "@/lib/track";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Telemetry ingestion endpoint. The client posts { eventType, path, metadata? }; the
 * server owns the session id via an HTTP-only cookie (created on first hit, refreshed as
 * a 30-minute sliding window), plus IP and user-agent. Admin paths are ignored.
 */
export async function POST(req: NextRequest) {
  let body: { eventType?: string; path?: string; metadata?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const eventType = String(body.eventType ?? "PAGE_VIEW");
  const path = String(body.path ?? "");
  if (!(EVENT_TYPES as readonly string[]).includes(eventType) || !path || path.startsWith("/admin")) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  let sessionId = req.cookies.get(SESSION_COOKIE)?.value ?? "";
  const fresh = !sessionId;
  if (!sessionId) sessionId = randomUUID();

  const { ipAddress, userAgent } = clientMeta(req);
  const metadata = body.metadata != null ? JSON.stringify(body.metadata).slice(0, 2000) : null;
  await logEvent({ eventType, path, sessionId, ipAddress, userAgent, metadata });

  const res = NextResponse.json({ ok: true, session: fresh ? "new" : "existing" });
  res.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 60, // sliding 30-minute session window
  });
  return res;
}
