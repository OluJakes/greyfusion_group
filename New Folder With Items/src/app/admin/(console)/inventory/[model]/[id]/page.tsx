import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminModel } from "@/lib/admin-models";
import { RecordForm } from "@/components/admin/RecordForm";

interface Props { params: { model: string; id: string } }

async function fetchRecord(model: string, id: string): Promise<Record<string, unknown> | null> {
  switch (model) {
    case "vehicles": return prisma.vehicle.findUnique({ where: { id } });
    case "properties": return prisma.property.findUnique({ where: { id } });
    case "products": return prisma.product.findUnique({ where: { id } });
    case "projects": return prisma.project.findUnique({ where: { id } });
    case "tenders": return prisma.tender.findUnique({ where: { id } });
    case "jobs": return prisma.job.findUnique({ where: { id } });
    case "posts": return prisma.post.findUnique({ where: { id } });
    case "pagecontent": return prisma.dynamicPageContent.findUnique({ where: { id } });
    case "plans": return prisma.pricingPlan.findUnique({ where: { id } });
    case "showcase": return prisma.showcaseAsset.findUnique({ where: { id } });
    case "siteconfig": return prisma.siteConfiguration.findUnique({ where: { id } });
    case "leadership": return prisma.leadershipPersonnel.findUnique({ where: { id } });
    case "credentials": return prisma.corporateCredential.findUnique({ where: { id } });
    case "branding": return prisma.siteBranding.findUnique({ where: { id: "default" } });
    case "navigation": return prisma.navigationItem.findUnique({ where: { id } });
    case "social": return prisma.socialMediaLink.findUnique({ where: { id } });
    case "gallery": {
      const r = await prisma.entityMedia.findUnique({
        where: { id },
        include: {
          vehicle: { select: { slug: true } },
          property: { select: { slug: true } },
          product: { select: { slug: true } },
          project: { select: { slug: true } },
        },
      });
      if (!r) return null;
      const entityType = r.vehicleId ? "vehicle" : r.propertyId ? "property" : r.productId ? "product" : "project";
      const entitySlug = r.vehicle?.slug ?? r.property?.slug ?? r.product?.slug ?? r.project?.slug ?? "";
      return { ...r, entityType, entitySlug };
    }
    default: return null;
  }
}

export default async function RecordEditPage({ params }: Props) {
  const config = getAdminModel(params.model);
  if (!config || !config.creatable) notFound();

  const isNew = params.id === "new";
  const record = isNew ? {} : await fetchRecord(params.model, params.id);
  if (!isNew && !record) notFound();

  const initial: Record<string, string> = {};
  for (const f of config.fields) {
    const v = (record as Record<string, unknown>)[f.name];
    if (v === undefined || v === null) initial[f.name] = "";
    else if (v instanceof Date) initial[f.name] = v.toISOString().slice(0, 10);
    else if (typeof v === "boolean") initial[f.name] = v ? "on" : "";
    else initial[f.name] = String(v);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold">
        {isNew ? `New ${config.singular}` : `Edit ${config.singular}`}
      </h1>
      <div className="card mt-6 p-6">
        <RecordForm model={config.key} id={isNew ? null : params.id} fields={config.fields} initial={initial} />
      </div>
    </div>
  );
}
