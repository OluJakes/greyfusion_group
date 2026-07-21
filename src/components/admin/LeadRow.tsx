"use client";

import { useState, useTransition } from "react";
import { updateLeadStatus } from "@/app/admin/actions";
import { cn, fmtDate, safeJson } from "@/lib/utils";

export interface LeadDto {
  id: string;
  ref: string;
  type: string;
  division: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  payload: string;
  status: string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-amber-signal/15 text-amber-signal",
  CONTACTED: "bg-sky-500/15 text-sky-600",
  CLOSED: "bg-green-600/10 text-green-600",
};

export function LeadRow({ lead }: { lead: LeadDto }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(lead.status);
  const [pending, startTransition] = useTransition();
  const payload = safeJson<Record<string, string | number | boolean>>(lead.payload, {});

  const setLeadStatus = (s: string) => {
    setStatus(s);
    startTransition(() => updateLeadStatus(lead.id, s));
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full flex-wrap items-center gap-3 p-4 text-left text-sm hover:bg-[var(--surface-2)]"
      >
        <span className="num w-40 shrink-0 font-semibold">{lead.ref}</span>
        <span className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-[11px] font-semibold">{lead.type.replace(/_/g, " ")}</span>
        <span className="min-w-0 flex-1 truncate">{lead.name} <span className="ink-muted">· {lead.division}</span></span>
        <span className={cn("rounded px-2 py-0.5 text-[11px] font-bold", STATUS_STYLES[status])}>{status}</span>
        <span className="num text-xs ink-muted">{fmtDate(lead.createdAt)}</span>
      </button>
      {open && (
        <div className="border-t px-4 py-4 hairline">
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p><span className="ink-muted">Email:</span> <a className="text-fusion" href={`mailto:${lead.email}`}>{lead.email}</a></p>
              {lead.phone && <p className="mt-1"><span className="ink-muted">Phone:</span> <span className="num">{lead.phone}</span></p>}
              {lead.subject && <p className="mt-1"><span className="ink-muted">Subject:</span> {lead.subject}</p>}
            </div>
            <div>
              {Object.entries(payload).map(([k, v]) => (
                <p key={k} className="mt-0.5"><span className="ink-muted">{k}:</span> {String(v)}</p>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider ink-muted">Set status</span>
            {["NEW", "CONTACTED", "CLOSED"].map((s) => (
              <button
                key={s}
                type="button"
                disabled={pending}
                onClick={() => setLeadStatus(s)}
                className={cn("rounded-full border px-3 py-1 text-xs font-semibold hairline", status === s && "bg-fusion text-white")}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
