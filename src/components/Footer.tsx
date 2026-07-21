import Link from "next/link";
import { DIVISIONS, COMPANY } from "@/lib/divisions";
import { Logo } from "@/components/Logo";
import type { Branding, SocialView, NavItemView } from "@/lib/branding";

const SOCIAL_PATHS: Record<string, string> = {
  linkedin: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C21.4 8.65 22 11 22 14.1V21h-4v-6.1c0-1.45-.03-3.3-2-3.3-2 0-2.3 1.57-2.3 3.2V21h-4V9Z",
  x: "M18.9 2H22l-7.6 8.7L23.3 22h-6.9l-5-6.5L5.6 22H2.5l8.1-9.3L1.7 2h7l4.5 6 5.7-6Zm-1.2 18h1.9L7.3 4H5.3l12.4 16Z",
  instagram: "M12 2c2.7 0 3 .01 4.07.06 1.06.05 1.79.22 2.42.46.66.26 1.22.6 1.77 1.15.55.55.89 1.11 1.15 1.77.24.63.41 1.36.46 2.42C21.99 9 22 9.3 22 12s-.01 3-.06 4.07c-.05 1.06-.22 1.79-.46 2.42a4.9 4.9 0 0 1-1.15 1.77c-.55.55-1.11.89-1.77 1.15-.63.24-1.36.41-2.42.46C15 21.99 14.7 22 12 22s-3-.01-4.07-.06c-1.06-.05-1.79-.22-2.42-.46a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.24-.63-.41-1.36-.46-2.42C2.01 15 2 14.7 2 12s.01-3 .06-4.07c.05-1.06.22-1.79.46-2.42.26-.66.6-1.22 1.15-1.77.55-.55 1.11-.89 1.77-1.15.63-.24 1.36-.41 2.42-.46C9 2.01 9.3 2 12 2Zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Zm5.2-8.4a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z",
  facebook: "M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z",
  whatsapp: "M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.4-3c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.1-.3.2-.5v-.5c0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.5 1.1 2.7c.1.2 1.9 3 4.6 4.2.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.4-.3Z",
  youtube: "M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.7-1.7C19.4 5.2 12 5.2 12 5.2s-7.4 0-8.9.4A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.7 1.7c1.5.4 8.9.4 8.9.4s7.4 0 8.9-.4a2.5 2.5 0 0 0 1.7-1.7C23 15.2 23 12 23 12Zm-13.2 3.4V8.6l5.8 3.4-5.8 3.4Z",
  link: "M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5",
};

const DEFAULT_SOCIALS: SocialView[] = [
  { platform: "X", url: "https://x.com/greyfusionng", iconKey: "x" },
  { platform: "LinkedIn", url: "https://linkedin.com/company/greyfusion", iconKey: "linkedin" },
  { platform: "Instagram", url: "https://instagram.com/greyfusionng", iconKey: "instagram" },
];

const CERTS = ["ISO 9001:2015", "ISO 27001:2022", "SON MANCAP", "COREN Registered", "NDPR Compliant", "CAC · RC 1120352"];

export function Footer({
  branding,
  socials = [],
  quickLinks = [],
}: {
  branding?: Branding;
  socials?: SocialView[];
  quickLinks?: NavItemView[];
}) {
  const socialLinks = socials.length > 0 ? socials : DEFAULT_SOCIALS;
  return (
    <footer className="border-t hairline bg-graphite text-mist">
      <div className="container-gf grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo className="text-white" markClass="text-white" logoUrl={branding?.logoDarkUrl || ""} siteName={branding?.siteName ?? "GREYFUSION"} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-titanium">
            Eight industries. One standard of execution. Engineering, powering, building, securing,
            automating, housing, moving and supplying modern Africa since 2011.
          </p>
          <p className="mt-4 text-xs text-titanium">{COMPANY.rc}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {CERTS.map((c) => (
              <span key={c} className="rounded-md border border-white/15 px-2 py-1 text-[11px] text-titanium">
                {c}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">Divisions</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {DIVISIONS.map((d) => (
              <li key={d.slug}>
                <Link href={d.href} className="text-titanium transition-colors hover:text-white">
                  {d.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">Company</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/about" className="text-titanium hover:text-white">About Greyfusion</Link></li>
            <li><Link href="/insights" className="text-titanium hover:text-white">Insights</Link></li>
            <li><Link href="/careers" className="text-titanium hover:text-white">Careers</Link></li>
            <li><Link href="/contact" className="text-titanium hover:text-white">Contact</Link></li>
            <li><Link href="/compliance" className="text-titanium hover:text-white">Compliance & Trust Center</Link></li>
            <li><Link href="/divisions/construction#tenders" className="text-titanium hover:text-white">Tenders & procurement</Link></li>
            <li><Link href="/divisions/commerce/track" className="text-titanium hover:text-white">Track an order</Link></li>
            {quickLinks.map((l) => (
              <li key={l.id}>
                <Link href={l.url} target={l.target === "_blank" ? "_blank" : undefined} rel={l.target === "_blank" ? "noopener noreferrer" : undefined} className="text-titanium hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">Head Office</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-titanium">
            <li>{COMPANY.address}</li>
            <li className="num">{COMPANY.phones.join(" · ")}</li>
            <li>
              <a href={`mailto:${COMPANY.email}`} className="hover:text-white">{COMPANY.email}</a>
            </li>
            <li>{COMPANY.hours}</li>
          </ul>
          <h3 className="mt-6 font-display text-sm font-semibold uppercase tracking-wider text-white">Offices</h3>
          <ul className="mt-3 space-y-1.5 text-xs text-titanium">
            {COMPANY.offices.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-titanium">
            West Africa operations: 🇳🇬 Nigeria (hub) · 🇬🇭 🇨🇮 🇸🇳 🇸🇱 🇧🇯 🇹🇬 — SLAs confirmed per country.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-gf flex flex-col items-center justify-between gap-3 py-5 text-xs text-titanium sm:flex-row">
          <p>© {new Date().getFullYear()} Greyfusion Limited · {COMPANY.rc} · {COMPANY.site}</p>
          <div className="flex items-center gap-3">
            {socialLinks.map((s) => (
              <a
                key={s.platform + s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.platform}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 text-titanium transition-colors hover:border-white/40 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill={s.iconKey === "link" ? "none" : "currentColor"} stroke={s.iconKey === "link" ? "currentColor" : "none"} strokeWidth="1.8" aria-hidden="true">
                  <path d={SOCIAL_PATHS[s.iconKey] ?? SOCIAL_PATHS.link} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
