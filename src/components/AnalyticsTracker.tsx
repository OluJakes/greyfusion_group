"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Fire-and-forget page-view telemetry (V13). Records a PAGE_VIEW on every client route
 * change (admin routes excluded server-side and here). Downloads are tracked server-side
 * in the /api/compliance/download route, so nothing sensitive relies on the client.
 */
export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const body = JSON.stringify({ eventType: "PAGE_VIEW", path: pathname });
    try {
      const blob = new Blob([body], { type: "application/json" });
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon("/api/analytics/track", blob);
      } else {
        void fetch("/api/analytics/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
      }
    } catch {
      /* never let telemetry surface an error to the user */
    }
  }, [pathname]);

  return null;
}
