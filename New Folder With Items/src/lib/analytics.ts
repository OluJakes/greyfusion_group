import { safeJson } from "@/lib/utils";

/**
 * Analytics aggregation (V13) — pure, deterministic functions over event rows so the
 * dashboard maths is unit-testable without a database.
 */

export const EVENT_TYPES = ["PAGE_VIEW", "DOWNLOAD", "CLICK", "FORM_SUBMIT"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const SESSION_COOKIE = "gf_sid";

export interface AnalyticsEventLike {
  eventType: string;
  path: string;
  sessionId: string;
  metadata: string | null;
  createdAt: Date | string;
}

function d(date: Date | string): Date {
  return date instanceof Date ? date : new Date(date);
}

/** UTC day key YYYY-MM-DD. */
export function dayKey(date: Date | string): string {
  return d(date).toISOString().slice(0, 10);
}

export interface Overview {
  totalVisits: number; // PAGE_VIEW events
  uniqueVisitors: number; // distinct sessionIds
  pageViews: number; // alias of totalVisits, kept explicit for the UI
  downloads: number;
  formSubmits: number;
  bounceRate: number; // 0..1 — sessions with a single page view
}

export function computeOverview(events: AnalyticsEventLike[]): Overview {
  const pageViews = events.filter((e) => e.eventType === "PAGE_VIEW");
  const downloads = events.filter((e) => e.eventType === "DOWNLOAD").length;
  const formSubmits = events.filter((e) => e.eventType === "FORM_SUBMIT").length;

  const sessions = new Set(events.map((e) => e.sessionId));
  const viewsPerSession = new Map<string, number>();
  for (const e of pageViews) viewsPerSession.set(e.sessionId, (viewsPerSession.get(e.sessionId) ?? 0) + 1);

  const sessionsWithView = viewsPerSession.size;
  const bounced = Array.from(viewsPerSession.values()).filter((n) => n === 1).length;
  const bounceRate = sessionsWithView > 0 ? bounced / sessionsWithView : 0;

  return {
    totalVisits: pageViews.length,
    uniqueVisitors: sessions.size,
    pageViews: pageViews.length,
    downloads,
    formSubmits,
    bounceRate,
  };
}

export interface DownloadStat {
  title: string;
  count: number;
  lastAt: string; // ISO
}

/** Rank downloads by frequency using the DOWNLOAD event metadata `title`. */
export function topDownloads(events: AnalyticsEventLike[], limit = 10): DownloadStat[] {
  const map = new Map<string, { count: number; lastAt: number }>();
  for (const e of events) {
    if (e.eventType !== "DOWNLOAD") continue;
    const meta = safeJson<{ title?: string }>(e.metadata ?? "{}", {});
    const title = (meta.title || "Untitled document").trim();
    const t = d(e.createdAt).getTime();
    const cur = map.get(title) ?? { count: 0, lastAt: 0 };
    map.set(title, { count: cur.count + 1, lastAt: Math.max(cur.lastAt, t) });
  }
  return Array.from(map.entries())
    .map(([title, v]) => ({ title, count: v.count, lastAt: new Date(v.lastAt).toISOString() }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export interface PathStat {
  path: string;
  views: number;
}

export function topPaths(events: AnalyticsEventLike[], limit = 10): PathStat[] {
  const map = new Map<string, number>();
  for (const e of events) {
    if (e.eventType !== "PAGE_VIEW") continue;
    map.set(e.path, (map.get(e.path) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

export interface DayStat {
  date: string;
  visits: number;
  uniques: number;
}

/** Per-day visits + unique visitors for the last `days` days (oldest → newest). */
export function trafficByDay(events: AnalyticsEventLike[], days: number): DayStat[] {
  const today = new Date();
  const buckets: DayStat[] = [];
  const index = new Map<string, { visits: number; sessions: Set<string> }>();

  for (let i = days - 1; i >= 0; i--) {
    const dt = new Date(today);
    dt.setUTCDate(dt.getUTCDate() - i);
    const key = dayKey(dt);
    index.set(key, { visits: 0, sessions: new Set() });
  }
  for (const e of events) {
    if (e.eventType !== "PAGE_VIEW") continue;
    const key = dayKey(e.createdAt);
    const b = index.get(key);
    if (!b) continue;
    b.visits++;
    b.sessions.add(e.sessionId);
  }
  index.forEach((b, date) => buckets.push({ date, visits: b.visits, uniques: b.sessions.size }));
  return buckets;
}

/** Page-view counts by hour of day (0–23), UTC. */
export function peakHours(events: AnalyticsEventLike[]): { hour: number; count: number }[] {
  const counts = new Array(24).fill(0) as number[];
  for (const e of events) {
    if (e.eventType !== "PAGE_VIEW") continue;
    counts[d(e.createdAt).getUTCHours()]++;
  }
  return counts.map((count, hour) => ({ hour, count }));
}

export interface Diagnostics {
  peakHour: number;
  peakHourViews: number;
  topPath: string;
  weakestPath: string;
  bounceRate: number;
  headline: string;
}

/** Automated strengths/weaknesses read-out for the dashboard. */
export function diagnostics(events: AnalyticsEventLike[]): Diagnostics {
  const overview = computeOverview(events);
  const hours = peakHours(events);
  const peak = hours.reduce((best, h) => (h.count > best.count ? h : best), { hour: 0, count: 0 });
  const paths = topPaths(events, 100);
  const topPath = paths[0]?.path ?? "—";
  const weakestPath = paths.length > 0 ? paths[paths.length - 1].path : "—";

  const bouncePct = Math.round(overview.bounceRate * 100);
  const headline =
    overview.totalVisits === 0
      ? "No traffic recorded yet in this window."
      : `Peak traffic at ${String(peak.hour).padStart(2, "0")}:00 UTC. ` +
        `${topPath} is the strongest page; bounce rate ${bouncePct}% ` +
        (bouncePct > 60 ? "— high, tighten above-the-fold CTAs." : "— healthy engagement.");

  return {
    peakHour: peak.hour,
    peakHourViews: peak.count,
    topPath,
    weakestPath,
    bounceRate: overview.bounceRate,
    headline,
  };
}
