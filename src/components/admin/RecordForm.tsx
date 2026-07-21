"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveRecord } from "@/app/admin/actions";
import type { AdminField } from "@/lib/admin-models";

function MediaInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [mode, setMode] = useState<"url" | "upload">(value.startsWith("data:") ? "upload" : "url");
  const [error, setError] = useState<string | null>(null);

  const onFile = (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Keep uploads under 2MB — for larger media, host it and paste the URL instead.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result ?? ""));
    reader.onerror = () => setError("Could not read that file.");
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="mb-2 flex gap-1 rounded-lg border p-0.5 hairline" role="group" aria-label="Media input mode">
        {(["url", "upload"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            className={
              "flex-1 rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 " +
              (mode === m ? "bg-fusion text-white" : "ink-muted hover:bg-[var(--surface-2)]")
            }
          >
            {m === "url" ? "Paste URL" : "Upload file"}
          </button>
        ))}
      </div>
      {mode === "url" ? (
        <input
          id={id}
          type="text"
          className="input-gf"
          placeholder="https://… (image, video or PDF URL)"
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div>
          <input
            id={id}
            type="file"
            accept="image/*,video/mp4,application/pdf"
            className="input-gf !py-2 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--surface-2)] file:px-3 file:py-1.5 file:text-xs file:font-semibold"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <p className="mt-1 text-[11px] ink-muted">Stored inline (base64) in the database — ideal for logos, avatars and certificates under 2MB.</p>
        </div>
      )}
      {value && (
        <div className="mt-2 flex items-center gap-3">
          {value.startsWith("data:image") || /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(value) || value.includes("images.unsplash.com") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Preview" className="h-14 w-14 rounded-lg border object-cover hairline" />
          ) : (
            <span className="rounded-lg border px-2 py-1 text-[11px] hairline ink-muted">
              {value.startsWith("data:") ? "Uploaded file attached" : "Linked media"}
            </span>
          )}
          <button type="button" className="text-xs font-semibold text-fusion" onClick={() => onChange("")}>
            Clear
          </button>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-fusion">{error}</p>}
    </div>
  );
}

export function RecordForm({
  model,
  id,
  fields,
  initial,
}: {
  model: string;
  id: string | null;
  fields: AdminField[];
  initial: Record<string, string>;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await saveRecord(model, id, values);
    setBusy(false);
    if (res.ok) {
      router.push(`/admin/inventory/${model}`);
      router.refresh();
    } else {
      setError(res.error ?? "Save failed");
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      {fields.map((f) => (
        <div key={f.name}>
          {f.type === "checkbox" ? (
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                className="accent-fusion"
                checked={values[f.name] === "on"}
                onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.checked ? "on" : "" }))}
              />
              {f.label}
            </label>
          ) : (
            <>
              <label htmlFor={`rf-${f.name}`} className="label-gf">
                {f.label}{f.required && <span className="text-fusion"> *</span>}
              </label>
              {f.type === "media" ? (
                <MediaInput
                  id={`rf-${f.name}`}
                  value={values[f.name] ?? ""}
                  onChange={(v) => setValues((prev) => ({ ...prev, [f.name]: v }))}
                />
              ) : f.type === "textarea" ? (
                <textarea
                  id={`rf-${f.name}`} rows={4} className="input-gf font-mono text-xs"
                  value={values[f.name] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                />
              ) : f.type === "select" ? (
                <select
                  id={`rf-${f.name}`} className="input-gf"
                  value={values[f.name] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                >
                  <option value="" disabled>Select…</option>
                  {f.options?.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  id={`rf-${f.name}`}
                  type={f.type === "number" || f.type === "float" ? "number" : f.type === "date" ? "date" : "text"}
                  step={f.type === "float" ? "0.1" : undefined}
                  className="input-gf"
                  value={values[f.name] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                />
              )}
            </>
          )}
        </div>
      ))}
      {error && <p className="text-sm text-fusion">{error}</p>}
      <div className="flex gap-3">
        <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancel</button>
        <button type="submit" className="btn-primary flex-1" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}
