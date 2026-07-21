import { MediaImage } from "@/components/media/MediaImage";
import type { ReactNode } from "react";

/**
 * Standard divisional hero cover: full-bleed photograph, dark-graphite base and a
 * bottom-up gradient scrim guaranteeing WCAG-safe white typography in any lighting.
 * Keyline sits above the scrim so the division accent still reads.
 */
export function HeroCover({
  src,
  alt,
  accent,
  children,
  priority = true,
}: {
  src: string;
  alt: string;
  accent: string;
  children: ReactNode;
  priority?: boolean;
}) {
  return (
    <section className="relative flex min-h-[62svh] items-center overflow-hidden bg-graphite pt-16 text-white">
      <MediaImage
        src={src}
        alt={alt}
        tint={accent}
        overlay={false}
        priority={priority}
        sizes="100vw"
        className="absolute inset-0 h-full w-full"
        imgClassName="brightness-[0.42] contrast-[1.05]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(18,20,23,0.96) 0%, rgba(18,20,23,0.55) 45%, rgba(18,20,23,0.25) 100%)" }}
      />
      <span aria-hidden="true" className="absolute inset-x-0 top-16 z-10 keyline" style={{ background: accent }} />
      <div className="container-gf relative z-10 py-24">{children}</div>
    </section>
  );
}
