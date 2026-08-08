import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { DIVISIONS } from "@/lib/divisions";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.greyfusion.com.ng";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [vehicles, properties, products, posts, projects] = await Promise.all([
    prisma.vehicle.findMany({ select: { slug: true } }).catch(() => []),
    prisma.property.findMany({ select: { slug: true } }).catch(() => []),
    prisma.product.findMany({ select: { slug: true } }).catch(() => []),
    prisma.post.findMany({ select: { slug: true } }).catch(() => []),
    prisma.project.findMany({ select: { slug: true } }).catch(() => []),
  ]);

  const statics = ["", "/about", "/insights", "/careers", "/contact", "/divisions/commerce/track"].map((p) => ({
    url: `${SITE}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));

  return [
    ...statics,
    ...DIVISIONS.map((d) => ({ url: `${SITE}${d.href}`, changeFrequency: "weekly" as const, priority: 0.9 })),
    ...vehicles.map((v) => ({ url: `${SITE}/divisions/autos/${v.slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...properties.map((p) => ({ url: `${SITE}/divisions/real-estate/${p.slug}`, changeFrequency: "daily" as const, priority: 0.6 })),
    ...products.map((p) => ({ url: `${SITE}/divisions/commerce/${p.slug}`, changeFrequency: "daily" as const, priority: 0.6 })),
    ...projects.map((p) => ({ url: `${SITE}/divisions/construction/projects/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...posts.map((p) => ({ url: `${SITE}/insights/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
