import type { NextRequest } from "next/server";
import { db } from "@/lib/db";

/**
 * Server-side telemetry writer (V13). Used by the /api/analytics/track route and the
 * /api/compliance/download route. Logging is best-effort and never throws into the
 * request path.
 */

export interface LoggableEvent {
  eventType: string; // PAGE_VIEW | DOWNLOAD | CLICK | FORM_SUBMIT
  path: string;
  sessionId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: string | null;
}

/** Best-effort client fingerprint from request headers. */
export function clientMeta(req: NextRequest): { ipAddress: string | null; userAgent: string | null } {
  const fwd = req.headers.get("x-forwarded-for");
  const ipAddress = (fwd ? fwd.split(",")[0].trim() : "") || req.headers.get("x-real-ip") || null;
  const userAgent = req.headers.get("user-agent") || null;
  return { ipAddress, userAgent };
}

export async function logEvent(event: LoggableEvent): Promise<void> {
  try {
    await db.analyticsEvent.create({
      data: {
        eventType: event.eventType,
        path: event.path.slice(0, 512),
        sessionId: event.sessionId.slice(0, 64),
        ipAddress: event.ipAddress ?? null,
        userAgent: event.userAgent ? event.userAgent.slice(0, 512) : null,
        metadata: event.metadata ?? null,
      },
    });
  } catch {
    /* telemetry must never break the request */
  }
}
