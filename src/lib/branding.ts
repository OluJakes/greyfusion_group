import { prisma } from "@/lib/prisma";

export interface Branding {
  logoLightUrl: string;
  logoDarkUrl: string;
  faviconUrl: string;
  siteName: string;
  tagline: string;
}

export const DEFAULT_BRANDING: Branding = {
  logoLightUrl: "",
  logoDarkUrl: "",
  faviconUrl: "",
  siteName: "Greyfusion Limited",
  tagline: "Eight industries. One standard of execution.",
};

export async function getBranding(): Promise<Branding> {
  try {
    const row = await prisma.siteBranding.findUnique({ where: { id: "default" } });
    if (!row) return DEFAULT_BRANDING;
    return {
      logoLightUrl: row.logoLightUrl,
      logoDarkUrl: row.logoDarkUrl,
      faviconUrl: row.faviconUrl,
      siteName: row.siteName || DEFAULT_BRANDING.siteName,
      tagline: row.tagline || DEFAULT_BRANDING.tagline,
    };
  } catch {
    return DEFAULT_BRANDING;
  }
}

export interface NavItemView {
  id: string;
  label: string;
  url: string;
  target: string;
  children: { label: string; url: string; target: string }[];
}

export async function getNav(location: string): Promise<NavItemView[]> {
  try {
    const rows = await prisma.navigationItem.findMany({
      where: { location, isVisible: true, parentId: null },
      orderBy: { displayOrder: "asc" },
      include: { children: { where: { isVisible: true }, orderBy: { displayOrder: "asc" } } },
    });
    return rows.map((r) => ({
      id: r.id,
      label: r.label,
      url: r.url,
      target: r.target,
      children: r.children.map((c) => ({ label: c.label, url: c.url, target: c.target })),
    }));
  } catch {
    return [];
  }
}

export interface SocialView {
  platform: string;
  url: string;
  iconKey: string;
}

export async function getSocials(): Promise<SocialView[]> {
  try {
    const rows = await prisma.socialMediaLink.findMany({
      where: { isVisible: true },
      orderBy: { displayOrder: "asc" },
    });
    return rows.map((r) => ({ platform: r.platform, url: r.url, iconKey: r.iconKey }));
  } catch {
    return [];
  }
}
