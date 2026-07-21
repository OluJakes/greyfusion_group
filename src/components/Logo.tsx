import { cn } from "@/lib/utils";

export function LogoMark({ className, mono = false }: { className?: string; mono?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={cn("h-8 w-8", className)} aria-hidden="true">
      <defs>
        <mask id="gf-m1">
          <rect width="100" height="100" fill="white" />
          <circle cx="63" cy="63" r="41" fill="black" />
        </mask>
        <mask id="gf-m2">
          <rect width="100" height="100" fill="white" />
          <circle cx="37" cy="37" r="41" fill="black" />
        </mask>
      </defs>
      <circle cx="45" cy="43" r="43" fill="currentColor" mask="url(#gf-m1)" />
      <circle cx="55" cy="57" r="43" fill="currentColor" mask="url(#gf-m2)" />
      <polygon points="24,53 75,45 77,55 26,63" fill={mono ? "currentColor" : "#E2583E"} />
    </svg>
  );
}

/**
 * Brand lockup — single source of truth. If SiteBranding supplies a custom logo
 * (light/dark), it renders that image; otherwise it falls back to the precise inline
 * SVG mark + wordmark. `logoUrl` is passed by server components that read branding.
 */
export function Logo({
  className,
  markClass,
  logoUrl = "",
  siteName = "GREYFUSION",
}: {
  className?: string;
  markClass?: string;
  logoUrl?: string;
  siteName?: string;
}) {
  if (logoUrl) {
    return (
      <span className={cn("inline-flex items-center", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt={siteName} className="h-8 w-auto object-contain" />
      </span>
    );
  }
  const wordmark = siteName === "GREYFUSION" || siteName === "Greyfusion Limited";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={markClass} />
      {wordmark ? (
        <span className="font-display text-lg font-semibold tracking-[0.14em]">
          GREY<span className="text-fusion">F</span>USION
        </span>
      ) : (
        <span className="font-display text-lg font-semibold tracking-[0.08em]">{siteName}</span>
      )}
    </span>
  );
}
