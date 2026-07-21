"use client";

import { useTransition } from "react";
import { deleteRecord, updateRecordStatus } from "@/app/admin/actions";

export function StatusPicker({ model, id, current, options }: { model: string; id: string; current: string; options: string[] }) {
  const [pending, startTransition] = useTransition();
  return (
    <select
      aria-label="Update status"
      className="input-gf !w-auto !px-2 !py-1 text-xs"
      value={current}
      disabled={pending}
      onChange={(e) => startTransition(() => updateRecordStatus(model, id, e.target.value))}
    >
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

export function DeleteButton({ model, id }: { model: string; id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="text-xs font-semibold ink-muted hover:text-fusion"
      onClick={() => {
        if (confirm("Delete this record? This cannot be undone.")) {
          startTransition(() => deleteRecord(model, id));
        }
      }}
    >
      {pending ? "…" : "Delete"}
    </button>
  );
}
