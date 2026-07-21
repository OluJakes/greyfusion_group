import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LeadRow } from "@/components/admin/LeadRow";
import { cn } from "@/lib/utils";

const TYPES = ["ALL", "PROJECT_INTAKE", "VENDOR_REG", "MAINTENANCE", "TEST_DRIVE", "B2B_QUOTE", "APPLICATION", "CONTACT", "TRADE_IN", "CAPABILITY_DECK"];
const DIVS = ["ALL", "corporate", "construction", "energy", "it", "smart-home", "real-estate", "autos", "commerce"];
const STATUSES = ["ALL", "NEW", "CONTACTED", "CLOSED"];

interface Props {
  searchParams: { type?: string; division?: string; status?: string };
}

export default async function LeadsPage({ searchParams }: Props) {
  const { type = "ALL", division = "ALL", status = "ALL" } = searchParams;
  const leads = await prisma.lead.findMany({
    where: {
      ...(type !== "ALL" ? { type } : {}),
      ...(division !== "ALL" ? { division } : {}),
      ...(status !== "ALL" ? { status } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const qs = (patch: Record<string, string>) => {
    const params = new URLSearchParams({ type, division, status, ...patch });
    return `/admin/leads?${params.toString()}`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold">Leads pipeline</h1>
        <a href={`/api/admin/leads-export?type=${type}&division=${division}&status=${status}`} className="btn-secondary !py-2 text-xs">
          Export CSV ↓
        </a>
      </div>

      <div className="card mt-5 space-y-3 p-4 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-semibold uppercase tracking-wider ink-muted">Type</span>
          {TYPES.map((t) => (
            <Link key={t} href={qs({ type: t })} className={cn("rounded-full border px-2.5 py-1 font-semibold hairline", type === t && "bg-fusion text-white")}>
              {t.replace(/_/g, " ")}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-semibold uppercase tracking-wider ink-muted">Division</span>
          {DIVS.map((d) => (
            <Link key={d} href={qs({ division: d })} className={cn("rounded-full border px-2.5 py-1 font-semibold hairline", division === d && "bg-fusion text-white")}>
              {d}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-semibold uppercase tracking-wider ink-muted">Status</span>
          {STATUSES.map((s) => (
            <Link key={s} href={qs({ status: s })} className={cn("rounded-full border px-2.5 py-1 font-semibold hairline", status === s && "bg-fusion text-white")}>
              {s}
            </Link>
          ))}
        </div>
      </div>

      <p className="num mt-4 text-sm ink-muted">{leads.length} lead(s)</p>
      <div className="card mt-3 divide-y overflow-hidden hairline">
        {leads.map((l) => (
          <LeadRow
            key={l.id}
            lead={{
              id: l.id, ref: l.ref, type: l.type, division: l.division, name: l.name, email: l.email,
              phone: l.phone, subject: l.subject, payload: l.payload, status: l.status, createdAt: l.createdAt.toISOString(),
            }}
          />
        ))}
        {leads.length === 0 && <p className="p-8 text-center text-sm ink-muted">No leads match these filters.</p>}
      </div>
    </div>
  );
}
