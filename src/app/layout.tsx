import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CommandBar } from "@/components/CommandBar";
import { FloatingContact } from "@/components/FloatingContact";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { getBranding, getNav, getSocials } from "@/lib/branding";

export const revalidate = 60;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.greyfusion.com.ng";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBranding();
  return {
    metadataBase: new URL(SITE),
    title: {
      default: `${branding.siteName} — Eight Industries. One Standard of Execution.`,
      template: `%s · ${branding.siteName}`,
    },
    description:
      "Greyfusion Limited engineers, powers, builds, secures, automates, houses, moves, and supplies modern Africa. Construction, renewable energy, IT, smart home & security, real estate, EV & hybrid autos, and eCommerce under one standard.",
    ...(branding.faviconUrl ? { icons: { icon: branding.faviconUrl } } : {}),
    openGraph: { siteName: branding.siteName, type: "website", locale: "en_NG", url: SITE },
  };
}

const themeScript = `(function(){try{var t=localStorage.getItem('gf-theme')||'auto';var d=new Date();var h=d.getHours()+d.getMinutes()/60;var dark=t==='dark'||(t==='auto'&&!(h>=7&&h<18.5));if(dark)document.documentElement.classList.add('dark');}catch(e){}})();`;

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Greyfusion Limited",
  url: SITE,
  email: "hello@greyfusion.com.ng",
  telephone: "+2348092024484",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Suite A-6, Emab Plaza, Wuse 2",
    addressLocality: "Abuja",
    addressCountry: "NG",
  },
  identifier: "RC 1120352",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [branding, headerNav, footerNav, socials] = await Promise.all([
    getBranding(),
    getNav("HEADER"),
    getNav("FOOTER_QUICK"),
    getSocials(),
  ]);
  return (
    <html lang="en-NG" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Sans:wght@500;600&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </head>
      <body className="font-sans antialiased bg-[var(--bg)] text-[var(--ink)] transition-colors duration-300">
        <Providers>
          <Header branding={branding} extraNav={headerNav} />
          <main id="main">{children}</main>
          <Footer branding={branding} socials={socials} quickLinks={footerNav} />
          <CommandBar />
          <FloatingContact />
          <AnalyticsTracker />
        </Providers>
      </body>
    </html>
  );
}
