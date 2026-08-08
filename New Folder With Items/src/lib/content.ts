import { prisma } from "@/lib/prisma";
import { safeJson } from "@/lib/utils";

/**
 * Dynamic CMS layer. Every consumer supplies its coded default; the database
 * overrides when a row exists. Editable from /admin → Site config / Page content /
 * Pricing plans / Showcase media. Changes propagate within the 60s ISR window.
 */

export interface PageHero {
  heroTitle: string;
  heroSubtitle: string;
  heroVideos: string[];
  heroImages: string[];
  body: Record<string, unknown>;
}

export async function getPageContent(pageSlug: string, fallback: PageHero): Promise<PageHero> {
  try {
    const row = await prisma.dynamicPageContent.findUnique({ where: { pageSlug } });
    if (!row) return fallback;
    return {
      heroTitle: row.heroTitle || fallback.heroTitle,
      heroSubtitle: row.heroSubtitle || fallback.heroSubtitle,
      heroVideos: safeJson<string[]>(row.heroVideos, []).length ? safeJson<string[]>(row.heroVideos, []) : fallback.heroVideos,
      heroImages: safeJson<string[]>(row.heroImages, []).length ? safeJson<string[]>(row.heroImages, []) : fallback.heroImages,
      body: { ...fallback.body, ...safeJson<Record<string, unknown>>(row.bodyJson, {}) },
    };
  } catch {
    return fallback;
  }
}

export async function getConfig<T>(key: string, fallback: T): Promise<T> {
  try {
    const row = await prisma.siteConfiguration.findUnique({ where: { key } });
    return row ? safeJson<T>(row.value, fallback) : fallback;
  } catch {
    return fallback;
  }
}

export interface FxRates {
  USD: number; // NGN per USD
  EUR: number; // NGN per EUR
}

export const DEFAULT_FX: FxRates = { USD: 1580, EUR: 1720 };

export function getFxRates(): Promise<FxRates> {
  return getConfig<FxRates>("fx_rates", DEFAULT_FX);
}

export interface PlanView {
  id: string;
  title: string;
  price: number;
  currency: string;
  billingCycle: string;
  features: string[];
  scope: string;
  highlight: boolean;
  ctaText: string;
}

export async function getPlans(division: string): Promise<PlanView[]> {
  try {
    const rows = await prisma.pricingPlan.findMany({
      where: { division, isActive: true },
      orderBy: { displayOrder: "asc" },
    });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      price: r.price,
      currency: r.currency,
      billingCycle: r.billingCycle,
      features: safeJson<string[]>(r.features, []),
      scope: r.scope,
      highlight: r.highlight,
      ctaText: r.ctaText,
    }));
  } catch {
    return [];
  }
}

export interface ShowcaseView {
  url: string;
  kind: string;
  altText: string;
  isHeroCover: boolean;
}

/** Admin-uploaded media for an entity; empty array means "use coded defaults". */
export async function getShowcase(category: string, entityId: string): Promise<ShowcaseView[]> {
  try {
    const rows = await prisma.showcaseAsset.findMany({
      where: { category, entityId },
      orderBy: { displayOrder: "asc" },
    });
    return rows.map((r) => ({ url: r.url, kind: r.kind, altText: r.altText, isHeroCover: r.isHeroCover }));
  } catch {
    return [];
  }
}

export interface CredentialView {
  id: string;
  title: string;
  authority: string;
  licenseNumber: string;
  category: string;
  documentUrl: string;
  verificationUrl: string;
  validUntil: string;
  expiryDate: string | null;
  fileSizeInBytes: number;
}

export async function getCredentials(): Promise<CredentialView[]> {
  try {
    const rows = await prisma.corporateCredential.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    });
    return rows.map((r) => ({
      id: r.id, title: r.title, authority: r.authority, licenseNumber: r.licenseNumber,
      category: r.category, documentUrl: r.documentUrl, verificationUrl: r.verificationUrl, validUntil: r.validUntil,
      expiryDate: r.expiryDate ? r.expiryDate.toISOString() : null, fileSizeInBytes: r.fileSizeInBytes,
    }));
  } catch {
    return [];
  }
}

export interface LeaderView {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
  linkedIn: string;
}

export async function getLeadership(): Promise<LeaderView[]> {
  try {
    const rows = await prisma.leadershipPersonnel.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    });
    return rows.map((r) => ({ id: r.id, name: r.name, role: r.role, bio: r.bio, avatarUrl: r.avatarUrl, linkedIn: r.linkedIn }));
  } catch {
    return [];
  }
}
