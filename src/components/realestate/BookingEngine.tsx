"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { createBooking } from "@/app/actions";
import { cn, ngn } from "@/lib/utils";

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

interface ContactFields { name: string; email: string; phone: string }

export function BookingEngine({
  propertyId,
  nightlyNGN,
  cautionNGN,
  bookedDates,
}: {
  propertyId: string;
  nightlyNGN: number;
  cautionNGN: number;
  bookedDates: string[]; // ISO yyyy-mm-dd occupied nights
}) {
  const booked = useMemo(() => new Set(bookedDates), [bookedDates]);
  const [monthOffset, setMonthOffset] = useState(0);
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [result, setResult] = useState<{ ok: boolean; ref?: string; error?: string; totalNGN?: number } | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactFields>();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const months = [0, 1].map((add) => {
    const base = new Date(today.getFullYear(), today.getMonth() + monthOffset + add, 1);
    const label = base.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    const firstDow = (base.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
    const cells: (string | null)[] = Array(firstDow).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(iso(new Date(Date.UTC(base.getFullYear(), base.getMonth(), d))));
    }
    return { label, cells };
  });

  const nights = useMemo(() => {
    if (!start || !end) return 0;
    return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000);
  }, [start, end]);

  const rangeHasClash = useMemo(() => {
    if (!start || !end) return false;
    const d = new Date(start);
    while (iso(d) < end) {
      if (booked.has(iso(d))) return true;
      d.setUTCDate(d.getUTCDate() + 1);
    }
    return false;
  }, [start, end, booked]);

  const pick = (day: string) => {
    setResult(null);
    if (!start || (start && end)) {
      setStart(day);
      setEnd(null);
    } else if (day > start) {
      setEnd(day);
    } else {
      setStart(day);
    }
  };

  const total = nights * nightlyNGN;

  const onSubmit = async (v: ContactFields) => {
    if (!start || !end) return;
    const res = await createBooking({ propertyId, startDate: start, endDate: end, ...v });
    setResult(res);
  };

  if (result?.ok) {
    return (
      <div className="card p-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0D9488]/10 text-2xl text-[#0D9488]">✓</span>
        <h3 className="mt-3 font-display text-lg font-semibold">Booking request received.</h3>
        <p className="mt-2 text-sm ink-muted">
          We hold your dates for 12 hours while our lettings desk confirms payment details by email and WhatsApp.
        </p>
        <p className="mt-3 text-sm">
          Reference: <span className="num font-semibold" style={{ color: "#0D9488" }}>{result.ref}</span>
        </p>
        <p className="num mt-1 text-sm font-semibold">{ngn(result.totalNGN ?? total)}</p>
      </div>
    );
  }

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Book your stay</h3>
        <div className="flex gap-1">
          <button type="button" aria-label="Previous months" className="h-8 w-8 rounded-lg border hairline disabled:opacity-40" onClick={() => setMonthOffset((m) => Math.max(0, m - 1))} disabled={monthOffset === 0}>‹</button>
          <button type="button" aria-label="Next months" className="h-8 w-8 rounded-lg border hairline" onClick={() => setMonthOffset((m) => Math.min(10, m + 1))}>›</button>
        </div>
      </div>
      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        {months.map((m) => (
          <div key={m.label}>
            <p className="text-center text-sm font-semibold">{m.label}</p>
            <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[11px] ink-muted">
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => <span key={d}>{d}</span>)}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {m.cells.map((day, i) => {
                if (!day) return <span key={i} />;
                const isPast = day < iso(today);
                const isBooked = booked.has(day);
                const inRange = start && end && day >= start && day < end;
                const isEdge = day === start || day === end;
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={isPast || isBooked}
                    onClick={() => pick(day)}
                    aria-label={`${day}${isBooked ? " — booked" : ""}`}
                    aria-pressed={Boolean(isEdge || inRange)}
                    className={cn(
                      "num aspect-square rounded-md text-xs transition-colors",
                      isPast && "opacity-30",
                      isBooked && "bg-fusion/10 text-fusion line-through",
                      !isPast && !isBooked && !inRange && !isEdge && "hover:bg-[var(--surface-2)]",
                      inRange && !isEdge && "bg-[#0D9488]/15 text-[#0D9488]",
                      isEdge && "bg-[#0D9488] font-bold text-white"
                    )}
                  >
                    {Number(day.slice(8))}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border p-4 hairline">
        {nights > 0 ? (
          rangeHasClash ? (
            <p className="text-sm font-semibold text-fusion">Your range crosses booked nights — adjust the dates.</p>
          ) : (
            <dl className="num space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="ink-muted">{ngn(nightlyNGN)} × {nights} night{nights > 1 ? "s" : ""}</dt><dd className="font-semibold">{ngn(total)}</dd></div>
              <div className="flex justify-between"><dt className="ink-muted">Refundable caution</dt><dd>{ngn(cautionNGN)}</dd></div>
              <div className="flex justify-between border-t pt-2 hairline text-base"><dt className="font-semibold">Due at confirmation</dt><dd className="font-bold" style={{ color: "#0D9488" }}>{ngn(total + cautionNGN)}</dd></div>
            </dl>
          )
        ) : (
          <p className="text-sm ink-muted">Select check-in, then check-out. Struck-through dates are taken.</p>
        )}
      </div>

      {nights > 0 && !rangeHasClash && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="bk-name" className="sr-only">Full name</label>
            <input id="bk-name" placeholder="Full name *" className="input-gf" {...register("name", { required: "Name required", minLength: { value: 2, message: "Too short" } })} />
            {errors.name && <p className="mt-1 text-xs text-fusion">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="bk-email" className="sr-only">Email</label>
            <input id="bk-email" type="email" placeholder="Email *" className="input-gf" {...register("email", { required: "Email required", pattern: { value: /.+@.+\..+/, message: "Invalid email" } })} />
            {errors.email && <p className="mt-1 text-xs text-fusion">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="bk-phone" className="sr-only">Phone</label>
            <input id="bk-phone" type="tel" placeholder="Phone / WhatsApp *" className="input-gf" {...register("phone", { required: "Phone required", minLength: { value: 7, message: "Too short" } })} />
            {errors.phone && <p className="mt-1 text-xs text-fusion">{errors.phone.message}</p>}
          </div>
          {result && !result.ok && <p className="text-sm text-fusion sm:col-span-3">{result.error}</p>}
          <button type="submit" disabled={isSubmitting} className="btn-primary sm:col-span-3" style={{ background: "linear-gradient(120deg,#0F766E,#0D9488 60%,#14B8A6)", boxShadow: "0 8px 24px -12px rgba(13,148,136,.5)" }}>
            {isSubmitting ? "Requesting…" : `Request booking · ${ngn(total)}`}
          </button>
        </form>
      )}
    </div>
  );
}
