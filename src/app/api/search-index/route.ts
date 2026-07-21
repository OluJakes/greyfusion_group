import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DIVISIONS } from "@/lib/divisions";
import { ngnCompact } from "@/lib/utils";

export const revalidate = 300;

export async function GET() {
  const [vehicles, properties, products, posts, projects] = await Promise.all([
    prisma.vehicle.findMany({ select: { slug: true, make: true, model: true, powertrain: true, priceNGN: true } }),
    prisma.property.findMany({ select: { slug: true, title: true, location: true, type: true } }),
    prisma.product.findMany({ select: { slug: true, name: true, category: true, priceNGN: true } }),
    prisma.post.findMany({ select: { slug: true, title: true, division: true }, orderBy: { publishedAt: "desc" }, take: 60 }),
    prisma.project.findMany({ select: { slug: true, title: true, sector: true } }),
  ]);

  const index = [
    ...DIVISIONS.map((d) => ({ group: "Divisions", title: d.name, sub: d.tagline, href: d.href })),
    ...DIVISIONS.flatMap((d) => d.links.map((l) => ({ group: "Services & tools", title: l.label, sub: d.name, href: l.href }))),
    ...vehicles.map((v) => ({
      group: "Vehicles",
      title: `${v.make} ${v.model}`,
      sub: `${v.powertrain} · ${ngnCompact(v.priceNGN)}`,
      href: `/divisions/autos/${v.slug}`,
    })),
    ...properties.map((p) => ({ group: "Properties", title: p.title, sub: `${p.type} · ${p.location}`, href: `/divisions/real-estate/${p.slug}` })),
    ...products.map((p) => ({ group: "Store", title: p.name, sub: `${p.category} · ${ngnCompact(p.priceNGN)}`, href: `/divisions/commerce/${p.slug}` })),
    ...projects.map((p) => ({ group: "Projects", title: p.title, sub: p.sector, href: `/divisions/construction/projects/${p.slug}` })),
    ...posts.map((p) => ({ group: "Insights", title: p.title, sub: p.division, href: `/insights/${p.slug}` })),
    { group: "Company", title: "About Greyfusion", sub: "Leadership, governance, sustainability", href: "/about" },
    { group: "Company", title: "Careers", sub: "Open roles across divisions", href: "/careers" },
    { group: "Company", title: "Contact", sub: "Division-routed intake", href: "/contact" },
  ];

  return NextResponse.json(index);
}
