import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DIVISIONS } from "@/lib/divisions";
import { fmtDate, ngnCompact } from "@/lib/utils";

export default async function AdminOverview() {
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);
  const [leadsWeek, openTenders, pendingBookings, openTickets, orders, latestLeads, leadsByDivision] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.tender.count({ where: { status: "OPEN" } }),
    prisma.propertyBooking.count({ where: { status: "PENDING" } }),
    prisma.ticket.count({ where: { status: { not: "RESOLVED" } } }),
    prisma.order.groupBy({ by: ["status"], _count: true, _sum: { totalNGN: true } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.lead.groupBy({ by: ["division"], _count: true }),
  ]);

  const stats = [
    { label: "Leads this week", value: String(leadsWeek), href: "/admin/leads" },
    { label: "Open tenders", value: String(openTenders), href: "/admin/inventory/tenders" },
    { label: "Pending bookings", value: String(pendingBookings), href: "/admin/inventory/bookings" },
    { label: "Open tickets", value: String(openTickets), href: "/admin/inventory/tickets" },
  ];

  const maxDiv = Math.max(1, ...leadsByDivision.map((d) => d._count));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Command overview</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card block p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <p className="num font-display text-3xl font-bold text-fusion">{s.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider ink-muted">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-display font-semibold">Orders by status</h2>
          <ul className="num mt-4 space-y-2 text-sm">
            {orders.length === 0 && <li className="ink-muted">No orders yet.</li>}
            {orders.map((o) => (
              <li key={o.status} className="flex justify-between border-b pb-2 hairline">
                <span className="font-semibold capitalize">{o.status.toLowerCase()}</span>
                <span>{o._count} · {ngnCompact(o._sum.totalNGN ?? 0)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="font-display font-semibold">Division analytics · leads</h2>
          <svg viewBox="0 0 320 170" className="mt-4 w-full" role="img" aria-label="Lead counts per division">
            {DIVISIONS.map((d, i) => {
              const count = leadsByDivision.find((x) => x.division === d.slug)?._count ?? 0;
              const w = (count / maxDiv) * 200;
              return (
                <g key={d.slug} transform={`translate(0 ${i * 27})`}>
                  <text x="0" y="14" fontSize="10" fill="var(--muted)">{d.short}</text>
                  <rect x="78" y="4" width={Math.max(w, 2)} height="13" rx="3" fill={d.accent} />
                  <text x={84 + Math.max(w, 2)} y="14" fontSize="10" fill="var(--ink)" className="num">{count}</text>
                </g>
              );
            })}
          </svg>
        </section>
      </div>

      <section className="card mt-6 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold">Latest activity</h2>
          <Link href="/admin/leads" className="text-xs font-semibold text-fusion">Full pipeline →</Link>
        </div>
        <ul className="mt-4 divide-y hairline text-sm">
          {latestLeads.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center gap-3 py-2.5">
              <span className="num w-40 shrink-0 font-semibold">{l.ref}</span>
              <span className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-[11px] font-semibold">{l.type.replace(/_/g, " ")}</span>
              <span className="min-w-0 flex-1 truncate">{l.name} · <span className="ink-muted">{l.division}</span></span>
              <span className="num text-xs ink-muted">{fmtDate(l.createdAt)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
