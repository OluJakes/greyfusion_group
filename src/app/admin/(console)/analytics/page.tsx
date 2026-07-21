import Link from "next/link";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/rbac";
import { fmtDate } from "@/lib/utils";
import {
  computeOverview,
  trafficByDay,
  topDownloads,
  topPaths,
  diagnostics,
  peakHours,
  type AnalyticsEventLike,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

const INTERVALS = [7, 30, 90];

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function Denied() {
  return (
    <div className="card p-8 text-center">
      <h1 className="font-display text-xl font-semibold">Analytics</h1>
      <p className="mt-2 text-sm ink-muted">You don&apos;t have permission to view analytics. Ask a super administrator for the VIEW_ANALYTICS permission.</p>
    </div>
  );
}

interface Props {
  searchParams: { days?: string };
}

export default async function AnalyticsPage({ searchParams }: Props) {
  if (!(await hasPermission("VIEW_ANALYTICS"))) return <Denied />;

  const days = INTERVALS.includes(Number(searchParams.days)) ? Number(searchParams.days) : 30;
  const cutoff = new Date(Date.now() - days * 86_400_000);

  let events: AnalyticsEventLike[] = [];
  try {
    const rows = await db.analyticsEvent.findMany({
      where: { createdAt: { gte: cutoff } },
      orderBy: { createdAt: "desc" },
      take: 50_000,
    });
    events = rows.map((r) => ({ eventType: r.eventType, path: r.path, sessionId: r.sessionId, metadata: r.metadata, createdAt: r.createdAt }));
  } catch {
    events = [];
  }

  const overview = computeOverview(events);
  const byDay = trafficByDay(events, days);
  const downloads = topDownloads(events, 8);
  const pages = topPaths(events, 8);
  const diag = diagnostics(events);
  const hours = peakHours(events);
  const maxDay = Math.max(1, ...byDay.map((d) => d.visits));
  const maxHour = Math.max(1, ...hours.map((h) => h.count));

  const cards = [
    { label: "Total visits", value: overview.totalVisits.toLocaleString() },
    { label: "Unique visitors", value: overview.uniqueVisitors.toLocaleString() },
    { label: "Downloads", value: overview.downloads.toLocaleString() },
    { label: "Bounce rate", value: pct(overview.bounceRate) },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Analytics</h1>
          <p className="mt-1 text-xs ink-muted">Native telemetry · page views, downloads and engagement over the selected window.</p>
        </div>
        <div className="flex rounded-xl border p-0.5 hairline" role="group" aria-label="Interval">
          {INTERVALS.map((n) => (
            <Link
              key={n}
              href={`/admin/analytics?days=${n}`}
              className={"num rounded-lg px-3 py-1.5 text-xs font-bold transition-colors " + (n === days ? "bg-fusion text-white" : "hover:bg-[var(--surface-2)]")}
            >
              {n}d
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <p className="text-xs uppercase tracking-wider ink-muted">{c.label}</p>
            <p className="num mt-1 font-display text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="card mt-5 p-5">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider">Visits · last {days} days</h2>
        <div className="mt-4 flex h-40 items-end gap-1">
          {byDay.map((d) => (
            <div key={d.date} className="group flex flex-1 flex-col items-center justify-end" title={`${d.date}: ${d.visits} visits · ${d.uniques} unique`}>
              <div className="w-full rounded-t bg-fusion/80 transition-all group-hover:bg-fusion" style={{ height: `${Math.max(2, (d.visits / maxDay) * 100)}%` }} />
            </div>
          ))}
        </div>
        <div className="num mt-2 flex justify-between text-[10px] ink-muted">
          <span>{byDay[0]?.date}</span>
          <span>{byDay[byDay.length - 1]?.date}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider">Most downloaded documents</h2>
          {downloads.length === 0 ? (
            <p className="mt-3 text-sm ink-muted">No downloads recorded in this window yet.</p>
          ) : (
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase tracking-wider hairline ink-muted">
                  <th className="py-2 font-semibold">Document</th>
                  <th className="py-2 text-right font-semibold">Count</th>
                  <th className="py-2 text-right font-semibold">Last</th>
                </tr>
              </thead>
              <tbody>
                {downloads.map((d) => (
                  <tr key={d.title} className="border-b hairline">
                    <td className="max-w-[16rem] truncate py-2 font-medium">{d.title}</td>
                    <td className="num py-2 text-right font-semibold">{d.count}</td>
                    <td className="num py-2 text-right ink-muted">{fmtDate(d.lastAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider">Top pages</h2>
          {pages.length === 0 ? (
            <p className="mt-3 text-sm ink-muted">No page views recorded yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {pages.map((p) => (
                <li key={p.path} className="flex items-center gap-3">
                  <span className="num w-12 shrink-0 text-right text-sm font-semibold">{p.views}</span>
                  <span className="h-2 rounded-full bg-fusion/70" style={{ width: `${Math.max(6, (p.views / (pages[0]?.views || 1)) * 100)}%` }} />
                  <span className="truncate text-xs ink-muted">{p.path}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <div className="card p-5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider">Peak hours (UTC)</h2>
          <div className="mt-4 flex h-28 items-end gap-0.5">
            {hours.map((h) => (
              <div key={h.hour} className="flex flex-1 flex-col items-center justify-end" title={`${String(h.hour).padStart(2, "0")}:00 — ${h.count}`}>
                <div className="w-full rounded-t bg-[#0284C7]/70" style={{ height: `${Math.max(2, (h.count / maxHour) * 100)}%` }} />
              </div>
            ))}
          </div>
          <p className="num mt-2 text-[10px] ink-muted">00:00 → 23:00</p>
        </div>

        <div className="card p-5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider">Strengths &amp; weaknesses</h2>
          <p className="mt-3 text-sm leading-relaxed">{diag.headline}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-[var(--surface-2)] p-3">
              <dt className="text-xs ink-muted">Peak hour</dt>
              <dd className="num font-display text-lg font-bold">{String(diag.peakHour).padStart(2, "0")}:00</dd>
            </div>
            <div className="rounded-lg bg-[var(--surface-2)] p-3">
              <dt className="text-xs ink-muted">Strongest page</dt>
              <dd className="truncate text-sm font-semibold">{diag.topPath}</dd>
            </div>
            <div className="rounded-lg bg-[var(--surface-2)] p-3">
              <dt className="text-xs ink-muted">Form submits</dt>
              <dd className="num font-display text-lg font-bold">{overview.formSubmits}</dd>
            </div>
            <div className="rounded-lg bg-[var(--surface-2)] p-3">
              <dt className="text-xs ink-muted">Weakest tracked page</dt>
              <dd className="truncate text-sm font-semibold">{diag.weakestPath}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
