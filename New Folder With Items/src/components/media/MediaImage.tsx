"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Resilient media frame: division-tinted gradient base → shimmer while loading →
 * photograph on top.
 *
 * Rendering: uses a native <img> (not next/image). The site runs with
 * `images.unoptimized`, so there is no optimizer benefit to lose — and a plain <img>
 * loads remote product/CDN photos directly in the browser, with no dependency on the
 * Next image optimizer or `remotePatterns`. This is what makes thumbnails reliable in
 * production (Fly) as well as local dev.
 *
 * Reliability: if the primary `src` fails (dead CDN link, 404) we fall back to
 * `fallbackSrc` (coded placeholder art); only if BOTH fail do we show the tinted gradient.
 *
 * Sharpness: pass `dim={false}` for product/vehicle/property thumbnails so photos render
 * at full brightness with no dark overlay — crisp and clean. Heroes keep `dim` on for
 * the moody, legible-text art direction.
 */
export function MediaImage({
  src,
  alt,
  className,
  imgClassName,
  tint = "#1A1D22",
  overlay = true,
  sizes,
  priority = false,
  dim = true,
  fallbackSrc,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  tint?: string;
  overlay?: boolean;
  /** Retained for API compatibility; ignored by the native <img>. */
  sizes?: string;
  priority?: boolean;
  /** Apply the subtle brightness dimming (default true). Set false for clean thumbnails. */
  dim?: boolean;
  /** Coded placeholder to try if the primary src fails before giving up to the gradient. */
  fallbackSrc?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  // Which source we're currently attempting: 0 = primary, 1 = fallback, 2 = gave up.
  const [stage, setStage] = useState<0 | 1 | 2>(0);

  // Reset when the primary source changes (e.g., admin swaps the main image).
  useEffect(() => {
    setLoaded(false);
    setStage(0);
  }, [src]);

  const activeSrc = stage === 0 ? src : stage === 1 ? fallbackSrc : undefined;
  const failed = stage === 2 || !activeSrc;

  // The absolutely-positioned <img> needs this frame to be a positioning context.
  // Only add `relative` when the caller hasn't supplied its own position (e.g. cards
  // pass `absolute inset-0`). Without this guard, `cn()` emits both `relative` and
  // `absolute`, and Tailwind's CSS order lets `relative` win — collapsing the frame to
  // zero height so the image (and its dark gradient) vanish and the white card shows through.
  const hasOwnPosition = /(?:^|\s)(?:absolute|fixed|sticky)(?:\s|$)/.test(className ?? "");

  return (
    <div
      className={cn(!hasOwnPosition && "relative", "overflow-hidden", className)}
      style={{ background: `linear-gradient(150deg, #121417 5%, ${tint} 140%)` }}
    >
      {!loaded && !failed && (
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-pulse"
          style={{ background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)" }}
        />
      )}
      {!failed && activeSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={activeSrc}
          src={activeSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => {
            // primary failed → try fallback; fallback failed (or none) → gradient
            if (stage === 0 && fallbackSrc && fallbackSrc !== src) {
              setLoaded(false);
              setStage(1);
            } else {
              setStage(2);
            }
          }}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.04]",
            loaded ? "opacity-100" : "opacity-0",
            dim && "brightness-90 group-hover:brightness-100",
            imgClassName
          )}
        />
      )}
      {overlay && (
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent"
        />
      )}
    </div>
  );
}
