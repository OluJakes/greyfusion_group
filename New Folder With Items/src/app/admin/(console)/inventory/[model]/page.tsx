import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { db } from "@/lib/db";
import { getAdminModel } from "@/lib/admin-models";
import { StatusPicker, DeleteButton } from "@/components/admin/RecordControls";
import { GalleryCell } from "@/components/admin/GalleryCell";
import { GALLERY_FK, type GalleryEntity, type MediaDTO } from "@/lib/gallery";

interface Props { params: { model: string } }

type Row = Record<string, unknown> & { id: string };

/** Fetch and group all gallery media for the rows on screen in a single query. */
async function fetchGalleryMap(entity: GalleryEntity, ids: string[]): Promise<Record<string, MediaDTO[]>> {
  const map: Record<string, MediaDTO[]> = {};
  if (ids.length === 0) return map;
  try {
    const fk = GALLERY_FK[entity];
    const rows = await prisma.entityMedia.findMany({
      where: { [fk]: { in: ids } },
      orderBy: [{ isMain: "desc" }, { displayOrder: "asc" }, { createdAt: "asc" }],
    });
    for (const r of rows) {
      const key = r[fk];
      if (!key) continue;
      (map[key] ??= []).push({
        id: r.id, url: r.url, kind: r.kind, isMain: r.isMain, displayOrder: r.displayOrder, altText: r.altText,
      });
    }
  } catch {
    /* table not migrated yet */
  }
  return map;
}

async function fetchRows(model: string): Promise<Row[]> {
  switch (model) {
    case "vehicles": return prisma.vehicle.findMany({ orderBy: { make: "asc" } });
    case "properties": return prisma.property.findMany({ orderBy: { title: "asc" } });
    case "products": return prisma.product.findMany({ orderBy: { name: "asc" } });
    case "projects": return prisma.project.findMany({ orderBy: { year: "desc" } });
    case "tenders": return prisma.tender.findMany({ orderBy: { closingDate: "asc" } });
    case "jobs": return prisma.job.findMany({ orderBy: { postedAt: "desc" } });
    case "posts": return prisma.post.findMany({ orderBy: { publishedAt: "desc" } });
    case "bookings": return prisma.propertyBooking.findMany({ orderBy: { createdAt: "desc" } });
    case "orders": return prisma.order.findMany({ orderBy: { createdAt: "desc" } });
    case "tickets": return prisma.ticket.findMany({ orderBy: { createdAt: "desc" } });
    case "synclog": return db.syncLog.findMany({ orderBy: { executedAt: "desc" }, take: 100 });
    case "essleads": return db.essCalculationLead.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
    case "shquotes": return db.smartHomeQuote.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
    case "pagecontent": return prisma.dynamicPageContent.findMany({ orderBy: { pageSlug: "asc" } });
    case "plans": return prisma.pricingPlan.findMany({ orderBy: [{ division: "asc" }, { displayOrder: "asc" }] });
    case "showcase": return prisma.showcaseAsset.findMany({ orderBy: [{ category: "asc" }, { displayOrder: "asc" }] });
    case "siteconfig": return prisma.siteConfiguration.findMany({ orderBy: { key: "asc" } });
    case "leadership": return prisma.leadershipPersonnel.findMany({ orderBy: { displayOrder: "asc" } });
    case "credentials": return prisma.corporateCredential.findMany({ orderBy: { displayOrder: "asc" } });
    case "branding": return prisma.siteBranding.findMany();
    case "navigation": return prisma.navigationItem.findMany({ orderBy: [{ location: "asc" }, { displayOrder: "asc" }] });
    case "social": return prisma.socialMediaLink.findMany({ orderBy: { displayOrder: "asc" } });
    case "gallery": {
      const rows = await prisma.entityMedia.findMany({
        orderBy: [{ createdAt: "desc" }],
        include: {
          vehicle: { select: { slug: true, make: true, model: true } },
          property: { select: { slug: true, title: true } },
          product: { select: { slug: true, name: true } },
          project: { select: { slug: true, title: true } },
        },
      });
      return rows.map((r) => ({
        ...r,
        entityRef: r.vehicle
          ? `vehicle · ${r.vehicle.make} ${r.vehicle.model}`
          : r.property
            ? `property · ${r.property.title}`
            : r.product
              ? `product · ${r.product.name}`
              : r.project
                ? `project · ${r.project.title}`
                : "—",
      }));
    }
    default: return [];
  }
}

export default async function InventoryListPage({ params }: Props) {
  const config = getAdminModel(params.model);
  if (!config) notFound();
  const rows = await fetchRows(params.model);
  const galleryMap = config.galleryEntity
    ? await fetchGalleryMap(config.galleryEntity, rows.map((r) => r.id))
    : {};

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold">{config.label}</h1>
        {config.creatable && (
          <Link href={`/admin/inventory/${config.key}/new`} className="btn-primary !py-2 text-xs">
            + New {config.singular}
          </Link>
        )}
      </div>
      <p className="mt-2 text-xs ink-muted">
        Edits reach the public site within the 60-second ISR window — no redeploy needed.
      </p>
      <div className="card mt-5 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b bg-[var(--surface-2)] text-left text-xs uppercase tracking-wider hairline ink-muted">
              {config.columns.map((c) => (
                <th key={c.name} className="px-4 py-3 font-semibold">{c.label}</th>
              ))}
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b hairline">
                {config.columns.map((c) => (
                  <td key={c.name} className="num max-w-[16rem] truncate px-4 py-3">
                    {typeof row[c.name] === "number" ? (row[c.name] as number).toLocaleString() : String(row[c.name] ?? "")}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {config.statusField && (
                      <StatusPicker
                        model={config.key}
                        id={row.id}
                        current={String(row[config.statusField.name] ?? "")}
                        options={config.statusField.options}
                      />
                    )}
                    {config.galleryEntity && (
                      <GalleryCell
                        entityType={config.galleryEntity}
                        entityId={row.id}
                        label={String(row[config.galleryLabelField ?? "title"] ?? config.singular)}
                        initial={galleryMap[row.id] ?? []}
                      />
                    )}
                    {config.creatable && (
                      <>
                        <Link href={`/admin/inventory/${config.key}/${row.id}`} className="text-xs font-semibold text-fusion">Edit</Link>
                        <DeleteButton model={config.key} id={row.id} />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={config.columns.length + 1} className="p-8 text-center text-sm ink-muted">Nothing here yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
