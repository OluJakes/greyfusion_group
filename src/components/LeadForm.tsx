"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { submitLead, type ActionResult, type LeadInput } from "@/app/actions";
import { cn } from "@/lib/utils";

export interface FieldDef {
  name: string;
  label: string;
  kind: "text" | "email" | "tel" | "select" | "textarea" | "date" | "number";
  options?: string[];
  required?: boolean;
  placeholder?: string;
  half?: boolean;
}

const BASE_FIELDS: FieldDef[] = [
  { name: "name", label: "Full name", kind: "text", required: true, placeholder: "e.g. Adaeze Okonkwo", half: true },
  { name: "email", label: "Email", kind: "email", required: true, placeholder: "you@company.com", half: true },
  { name: "phone", label: "Phone / WhatsApp", kind: "tel", placeholder: "0803 000 0000", half: true },
];

export function LeadForm({
  type,
  division,
  cta,
  fields,
  successNote,
  compact = false,
  hidden = {},
}: {
  type: LeadInput["type"];
  division: LeadInput["division"];
  cta: string;
  fields: FieldDef[];
  successNote: string;
  compact?: boolean;
  hidden?: Record<string, string>;
}) {
  const all = [...BASE_FIELDS, ...fields];
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, string>>();
  const [result, setResult] = useState<ActionResult | null>(null);

  const onSubmit = async (values: Record<string, string>) => {
    const { name, email, phone, subject, ...rest } = values;
    const res = await submitLead({
      type,
      division,
      name,
      email,
      phone: phone ?? "",
      subject: subject ?? "",
      payload: { ...rest, ...hidden },
    });
    setResult(res);
  };

  if (result?.ok) {
    return (
      <div className="card p-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-600/10 text-2xl text-green-600">✓</span>
        <h3 className="mt-3 font-display text-lg font-semibold">Received. We&apos;re on it.</h3>
        <p className="mt-1 text-sm ink-muted">{successNote}</p>
        <p className="mt-3 text-sm">
          Reference: <span className="num font-semibold text-fusion">{result.ref}</span>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={cn("grid gap-4", compact ? "" : "sm:grid-cols-2")}>
      {all.map((f) => {
        const reg = register(f.name, { required: f.required ? `${f.label} is required` : false });
        const err = errors[f.name]?.message as string | undefined;
        const wide = f.kind === "textarea" || !f.half;
        return (
          <div key={f.name} className={cn(!compact && wide ? "sm:col-span-2" : "")}>
            <label htmlFor={`${type}-${f.name}`} className="label-gf">
              {f.label}
              {f.required && <span className="text-fusion"> *</span>}
            </label>
            {f.kind === "select" ? (
              <select id={`${type}-${f.name}`} className="input-gf" {...reg} defaultValue="">
                <option value="" disabled>
                  {f.placeholder ?? "Select…"}
                </option>
                {f.options?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : f.kind === "textarea" ? (
              <textarea id={`${type}-${f.name}`} rows={4} className="input-gf" placeholder={f.placeholder} {...reg} />
            ) : (
              <input id={`${type}-${f.name}`} type={f.kind} className="input-gf" placeholder={f.placeholder} {...reg} />
            )}
            {err && <p className="mt-1 text-xs text-fusion">{err}</p>}
          </div>
        );
      })}
      {result && !result.ok && (
        <p className={cn("text-sm text-fusion", compact ? "" : "sm:col-span-2")}>{result.error}</p>
      )}
      <div className={compact ? "" : "sm:col-span-2"}>
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={isSubmitting}>
          {isSubmitting ? "Submitting…" : cta}
        </button>
      </div>
    </form>
  );
}
