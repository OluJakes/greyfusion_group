"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Resilient media frame: division-tinted gradient base → shimmer while loading →
 * photograph on top. If the CDN fails, the gradient art direction remains and
 * the layout never breaks.
 */
export function MediaImage({
  src,
  alt,
  className,
  imgClassName,
  tint = "#1A1D22",
  overlay = true,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  tint?: string;
  overlay?: boolean;
  sizes?: string;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ background: `linear-gradient(150deg, #121417 5%, ${tint} 140%)` }}
    >
      {!loaded && !failed && (
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-pulse"
          style={{ background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)" }}
        />
      )}
      {!failed && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "object-cover transition-all duration-700 ease-out",
            loaded ? "opacity-100" : "opacity-0",
            "brightness-90 group-hover:scale-[1.04] group-hover:brightness-100",
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
