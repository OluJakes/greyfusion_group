"use client";

import { useState } from "react";
import { daysUntil, fmtDate, cn } from "@/lib/utils";

export interface TenderItem {
  refNo: string;
  title: string;
  category: string;
  closingDate: string;
  status: string;
  description: string;
}

function Urgency({ date, status }: { date: string; status: string }) {
  const d = daysUntil(date);
  if (status === "CLOSED" || d < 0) return <span className="rounded-md bg-[var(--surface-2)] px-2 py-1 text-xs font-semibold ink-muted">Closed</span>;
  if (d <= 7)
    return <span className="rounded-md bg-amber-signal/15 px-2 py-1 text-xs font-semibold text-amber-signal num">Closes in {d}d</span>;
  return <span className="rounded-md bg-green-600/10 px-2 py-1 text-xs font-semibold text-green-600 num">Open · {d}d left</span>;
}

export function TenderBoard({ tenders }: { tenders: TenderItem[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wider hairline ink-muted">
            <th className="px-5 py-3.5 font-semibold">Reference</th>
            <th className="px-5 py-3.5 font-semibold">Title</th>
            <th className="px-5 py-3.5 font-semibold">Category</th>
            <th className="px-5 py-3.5 font-semibold">Closing</th>
            <th className="px-5 py-3.5 font-semibold">Status</th>
            <th className="px-5 py-3.5 font-semibold sr-only">Documents</th>
          </tr>
        </thead>
        <tbody>
          {tenders.map((t) => (
            <>
              <tr key={t.refNo} className="border-b align-top hairline">
                <td className="num whitespace-nowrap px-5 py-4 font-semibold">{t.refNo}</td>
                <td className="px-5 py-4">{t.title}</td>
                <td className="px-5 py-4 ink-muted">{t.category}</td>
                <td className="num whitespace-nowrap px-5 py-4">{fmtDate(t.closingDate)}</td>
                <td className="px-5 py-4"><Urgency date={t.closingDate} status={t.status} /></td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    className="text-xs font-semibold text-fusion"
                    onClick={() => setOpen(open === t.refNo ? null : t.refNo)}
                    aria-expanded={open === t.refNo}
                  >
                    {open === t.refNo ? "Hide" : "Details"}
                  </button>
                </td>
              </tr>
              {open === t.refNo && (
                <tr key={t.refNo + "-d"} className="border-b hairline">
                  <td colSpan={6} className="px-5 py-4">
                    <p className="max-w-3xl text-sm leading-relaxed ink-muted">{t.description}</p>
                    <a
                      href={`mailto:tenders@greyfusion.com.ng?subject=${encodeURIComponent("Tender documents request — " + t.refNo)}`}
                      className={cn("btn-secondary mt-3 !py-2 text-xs")}
                    >
                      Request tender documents ↓
                    </a>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
