"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MediaImage } from "@/components/media/MediaImage";
import { EASE } from "@/components/Reveal";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  url: string;
  altText: string;
  isMain: boolean;
  kind: string;
}

/**
 * Universal media gallery: high-res main viewport with click-to-zoom modal, plus a
 * horizontal thumbnail strip that swaps the main frame on hover/click with a fade.
 * Used on vehicle, property, product and project detail pages.
 */
export function ProductGallery({
  images,
  tint = "#1A1D22",
  aspect = "aspect-[4/3]",
  title,
}: {
  images: GalleryImage[];
  tint?: string;
  aspect?: string;
  title: string;
}) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const current = images[active] ?? images[0];

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
      if (e.key === "ArrowRight") setActive((a) => (a + 1) % images.length);
      if (e.key === "ArrowLeft") setActive((a) => (a - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [zoom, images.length]);

  if (!current) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setZoom(true)}
        aria-label="Expand image"
        className={cn("group relative block w-full overflow-hidden rounded-2xl", aspect)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.url}
            initial={{ opacity: 0.35 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.35 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="absolute inset-0"
          >
            <MediaImage
              src={current.url}
              alt={current.altText || title}
              tint={tint}
              overlay={false}
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="h-full w-full"
              imgClassName="group-hover:scale-[1.05]"
            />
          </motion.div>
        </AnimatePresence>
        <span className="absolute bottom-3 right-3 rounded-lg bg-graphite/70 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
          ⤢ Click to zoom
        </span>
        {images.length > 1 && (
          <span className="num absolute bottom-3 left-3 rounded-lg bg-graphite/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            {active + 1} / {images.length}
          </span>
        )}
      </button>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1" role="listbox" aria-label={`${title} gallery`}>
          {images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 sm:h-20 sm:w-28",
                i === active ? "scale-[1.02]" : "border-transparent opacity-70 hover:opacity-100"
              )}
              style={i === active ? { borderColor: tint } : undefined}
            >
              <MediaImage src={img.url} alt={img.altText || `${title} thumbnail ${i + 1}`} tint={tint} overlay={false} sizes="112px" className="h-full w-full" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {zoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-graphite/92 p-4 backdrop-blur-sm"
            onClick={() => setZoom(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`${title} — expanded image`}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setZoom(false)}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white"
            >
              ✕
            </button>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous"
                  onClick={(e) => { e.stopPropagation(); setActive((a) => (a - 1 + images.length) % images.length); }}
                  className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-xl text-white sm:left-8"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  onClick={(e) => { e.stopPropagation(); setActive((a) => (a + 1) % images.length); }}
                  className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-xl text-white sm:right-8"
                >
                  ›
                </button>
              </>
            )}
            <motion.div
              key={current.url}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="relative h-[76vh] w-[min(92vw,1100px)] overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <MediaImage src={current.url} alt={current.altText || title} tint={tint} overlay={false} priority sizes="92vw" className="h-full w-full" imgClassName="object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
