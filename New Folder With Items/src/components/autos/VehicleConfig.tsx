"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CarSilhouette } from "@/components/autos/CarArt";
import { EASE } from "@/components/Reveal";
import { LeadForm } from "@/components/LeadForm";
import { VEHICLE_GALLERY } from "@/lib/media";
import { MediaImage } from "@/components/media/MediaImage";

export function VehicleConfig({
  colors,
  vehicleName,
  slug,
}: {
  colors: { name: string; hex: string }[];
  vehicleName: string;
  slug: string;
}) {
  const [idx, setIdx] = useState(0);
  const color = colors[idx] ?? { name: "Titanium", hex: "#8B939E" };

  return (
    <div>
      <motion.div key={color.hex} initial={{ opacity: 0.4, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, ease: EASE }}>
        <CarSilhouette color={color.hex} className="w-full" />
      </motion.div>
      <div className="mt-2 flex items-center justify-center gap-3" role="radiogroup" aria-label="Exterior colour">
        {colors.map((c, i) => (
          <button
            key={c.name}
            type="button"
            role="radio"
            aria-checked={i === idx}
            aria-label={c.name}
            title={c.name}
            onClick={() => setIdx(i)}
            className={"h-8 w-8 rounded-full border-2 transition-transform " + (i === idx ? "scale-110 border-[#0284C7]" : "border-transparent hover:scale-105")}
            style={{ background: c.hex }}
          />
        ))}
      </div>
      <p className="mt-2 text-center text-xs ink-muted">{color.name}</p>

      <div className="mt-8 grid grid-cols-3 gap-3">
        {VEHICLE_GALLERY.map((g) => (
          <figure key={g.label} className="group">
            <MediaImage src={g.src} alt={g.label} tint="#38BDF8" className="h-24 rounded-xl sm:h-32" sizes="30vw" />
            <figcaption className="mt-1.5 text-[11px] font-medium ink-muted">{g.label}</figcaption>
          </figure>
        ))}
      </div>

      <div id="test-drive" className="card mt-8 p-6">
        <h2 className="font-display text-lg font-semibold">Book a test drive</h2>
        <p className="mt-1 text-sm ink-muted">At our Abuja showroom (Sat 9am–6pm too) or we bring the car to you within city limits.</p>
        <div className="mt-5">
          <LeadForm
            type="TEST_DRIVE"
            division="autos"
            cta="Schedule test drive"
            successNote={`Our showroom team will confirm your ${vehicleName} slot by WhatsApp.`}
            hidden={{ vehicle: vehicleName, slug }}
            fields={[
              { name: "date", label: "Preferred date", kind: "date", required: true, half: true },
              { name: "timeSlot", label: "Time slot", kind: "select", required: true, half: true, options: ["9:00 – 11:00", "11:00 – 13:00", "13:00 – 15:00", "15:00 – 17:00"] },
              { name: "location", label: "Where?", kind: "select", required: true, options: ["Abuja showroom — Emab Plaza axis", "Bring the car to me (Abuja)", "Lagos — V.I. showroom", "Port Harcourt showroom"] },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
