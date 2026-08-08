"use server";

import { timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAdminSession, destroyAdminSession, isAdminAuthenticated } from "@/lib/auth";
import { getAdminModel } from "@/lib/admin-models";

function requireAdmin(): void {
  if (!isAdminAuthenticated()) throw new Error("Unauthorized");
}

export async function adminLogin(_prev: { error?: string } | null, formData: FormData): Promise<{ error?: string }> {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD ?? "";
  const a = Buffer.from(password.padEnd(64, "\0"));
  const b = Buffer.from(expected.padEnd(64, "\0"));
  if (!expected || !timingSafeEqual(a, b)) {
    return { error: "Incorrect password." };
  }
  createAdminSession();
  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  destroyAdminSession();
  redirect("/admin/login");
}

export async function updateLeadStatus(id: string, status: string): Promise<void> {
  requireAdmin();
  const s = z.enum(["NEW", "CONTACTED", "CLOSED"]).parse(status);
  await prisma.lead.update({ where: { id }, data: { status: s } });
  revalidatePath("/admin/leads");
}

const MODEL_STATUS_UPDATERS: Record<string, (id: string, status: string) => Promise<unknown>> = {
  bookings: (id, status) => prisma.propertyBooking.update({ where: { id }, data: { status } }),
  orders: (id, status) => prisma.order.update({ where: { id }, data: { status } }),
  tickets: (id, status) => prisma.ticket.update({ where: { id }, data: { status } }),
};

export async function updateRecordStatus(model: string, id: string, status: string): Promise<void> {
  requireAdmin();
  const config = getAdminModel(model);
  if (!config?.statusField || !config.statusField.options.includes(status)) throw new Error("Invalid status");
  const updater = MODEL_STATUS_UPDATERS[model];
  if (!updater) throw new Error("Unknown model");
  await updater(z.string().min(1).parse(id), status);
  revalidatePath(`/admin/inventory/${model}`);
  revalidatePath("/", "layout");
}

type Coerced = Record<string, string | number | boolean | Date | null>;

const BID_PACK_MAX = 104_857_600; // 100MB
const STANDARD_MAX = 10_485_760; // 10MB

/** base64 data URL → decoded byte length. */
function dataUrlBytes(value: string): number {
  const comma = value.indexOf(",");
  if (comma === -1) return 0;
  const b64 = value.slice(comma + 1);
  return Math.floor((b64.length * 3) / 4) - (b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0);
}

function coerce(model: string, form: Record<string, string>): Coerced {
  const config = getAdminModel(model);
  if (!config) throw new Error("Unknown model");
  const out: Coerced = {};
  const isBidPack = model === "credentials" && (form.category === "bidpack");
  const limit = isBidPack ? BID_PACK_MAX : STANDARD_MAX;
  for (const f of config.fields) {
    const raw = form[f.name];
    if (f.type === "checkbox") {
      out[f.name] = raw === "on" || raw === "true";
      continue;
    }
    if (f.type === "media" && raw && raw.startsWith("data:")) {
      const bytes = dataUrlBytes(raw);
      if (bytes > limit) {
        throw new Error(
          `${f.label} is ${(bytes / 1_048_576).toFixed(1)}MB — over the ${(limit / 1_048_576).toFixed(0)}MB ${isBidPack ? "bid-pack" : "standard document"} limit. Host large files externally and paste the URL instead.`
        );
      }
      // Record size on credentials so the vault can display it.
      if (model === "credentials") out.fileSizeInBytes = bytes;
    }
    if (raw === undefined || raw === "") {
      if (f.required) throw new Error(`${f.label} is required`);
      if (f.type === "number" || f.type === "float") out[f.name] = out[f.name] ?? 0;
      else if (f.type !== "date") out[f.name] = "";
      continue;
    }
    if (f.type === "number") out[f.name] = z.coerce.number().int().parse(raw);
    else if (f.type === "float") out[f.name] = z.coerce.number().parse(raw);
    else if (f.type === "date") out[f.name] = new Date(raw + "T12:00:00Z");
    else out[f.name] = raw;
  }
  return out;
}

const GALLERY_FK: Record<string, "vehicleId" | "propertyId" | "productId" | "projectId"> = {
  vehicle: "vehicleId", property: "propertyId", product: "productId", project: "projectId",
};

async function resolveEntityId(entityType: string, slug: string): Promise<string | null> {
  switch (entityType) {
    case "vehicle": return (await prisma.vehicle.findUnique({ where: { slug }, select: { id: true } }))?.id ?? null;
    case "property": return (await prisma.property.findUnique({ where: { slug }, select: { id: true } }))?.id ?? null;
    case "product": return (await prisma.product.findUnique({ where: { slug }, select: { id: true } }))?.id ?? null;
    case "project": return (await prisma.project.findUnique({ where: { slug }, select: { id: true } }))?.id ?? null;
    default: return null;
  }
}

async function saveGallery(id: string | null, form: Record<string, string>): Promise<{ ok: boolean; error?: string }> {
  const entityType = form.entityType;
  const fk = GALLERY_FK[entityType];
  if (!fk) return { ok: false, error: "Choose a valid entity type" };
  const entityId = await resolveEntityId(entityType, (form.entitySlug ?? "").trim());
  if (!entityId) return { ok: false, error: `No ${entityType} found with slug "${form.entitySlug}"` };
  if (!form.url) return { ok: false, error: "An image (upload or URL) is required" };

  const isMain = form.isMain === "on" || form.isMain === "true";
  const data = {
    url: form.url,
    kind: form.kind || "image",
    altText: form.altText || "Greyfusion media asset",
    displayOrder: Number(form.displayOrder) || 0,
    isMain,
    vehicleId: fk === "vehicleId" ? entityId : null,
    propertyId: fk === "propertyId" ? entityId : null,
    productId: fk === "productId" ? entityId : null,
    projectId: fk === "projectId" ? entityId : null,
  };

  if (isMain) {
    // Only one main per item — unset siblings.
    await prisma.entityMedia.updateMany({ where: { [fk]: entityId, isMain: true, ...(id ? { NOT: { id } } : {}) }, data: { isMain: false } });
  }
  if (id) await prisma.entityMedia.update({ where: { id }, data });
  else await prisma.entityMedia.create({ data });

  revalidatePath("/admin/inventory/gallery");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteEntityMedia(mediaId: string): Promise<void> {
  requireAdmin();
  await prisma.entityMedia.delete({ where: { id: mediaId } });
  revalidatePath("/admin/inventory/gallery");
  revalidatePath("/", "layout");
}

export async function saveRecord(model: string, id: string | null, form: Record<string, string>): Promise<{ ok: boolean; error?: string }> {
  requireAdmin();
  if (model === "gallery") return saveGallery(id, form);
  let data: Coerced;
  try {
    data = coerce(model, form);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid data" };
  }
  try {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const d = data as never;
    switch (model) {
      case "vehicles":
        id ? await prisma.vehicle.update({ where: { id }, data: d }) : await prisma.vehicle.create({ data: d });
        break;
      case "properties":
        id ? await prisma.property.update({ where: { id }, data: d }) : await prisma.property.create({ data: d });
        break;
      case "products":
        id ? await prisma.product.update({ where: { id }, data: d }) : await prisma.product.create({ data: d });
        break;
      case "projects":
        id ? await prisma.project.update({ where: { id }, data: d }) : await prisma.project.create({ data: d });
        break;
      case "tenders":
        id ? await prisma.tender.update({ where: { id }, data: d }) : await prisma.tender.create({ data: d });
        break;
      case "jobs":
        id ? await prisma.job.update({ where: { id }, data: d }) : await prisma.job.create({ data: d });
        break;
      case "posts":
        id ? await prisma.post.update({ where: { id }, data: d }) : await prisma.post.create({ data: d });
        break;
      case "pagecontent":
        id ? await prisma.dynamicPageContent.update({ where: { id }, data: d }) : await prisma.dynamicPageContent.create({ data: d });
        break;
      case "plans":
        id ? await prisma.pricingPlan.update({ where: { id }, data: d }) : await prisma.pricingPlan.create({ data: d });
        break;
      case "showcase":
        id ? await prisma.showcaseAsset.update({ where: { id }, data: d }) : await prisma.showcaseAsset.create({ data: d });
        break;
      case "siteconfig":
        id ? await prisma.siteConfiguration.update({ where: { id }, data: d }) : await prisma.siteConfiguration.create({ data: d });
        break;
      case "leadership":
        id ? await prisma.leadershipPersonnel.update({ where: { id }, data: d }) : await prisma.leadershipPersonnel.create({ data: d });
        break;
      case "credentials":
        id ? await prisma.corporateCredential.update({ where: { id }, data: d }) : await prisma.corporateCredential.create({ data: d });
        break;
      case "branding":
        await prisma.siteBranding.upsert({ where: { id: "default" }, update: d, create: Object.assign({ id: "default" }, data) as never });
        break;
      case "navigation":
        id ? await prisma.navigationItem.update({ where: { id }, data: d }) : await prisma.navigationItem.create({ data: d });
        break;
      case "social":
        id ? await prisma.socialMediaLink.update({ where: { id }, data: d }) : await prisma.socialMediaLink.create({ data: d });
        break;
      default:
        return { ok: false, error: "This model cannot be edited here" };
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Save failed" };
  }
  revalidatePath(`/admin/inventory/${model}`);
  revalidatePath("/", "layout"); // public pages refresh within the ISR window
  return { ok: true };
}

export async function deleteRecord(model: string, id: string): Promise<void> {
  requireAdmin();
  const key = z.string().min(1).parse(id);
  switch (model) {
    case "vehicles": await prisma.vehicle.delete({ where: { id: key } }); break;
    case "properties": await prisma.property.delete({ where: { id: key } }); break;
    case "products": await prisma.product.delete({ where: { id: key } }); break;
    case "projects": await prisma.project.delete({ where: { id: key } }); break;
    case "tenders": await prisma.tender.delete({ where: { id: key } }); break;
    case "jobs": await prisma.job.delete({ where: { id: key } }); break;
    case "posts": await prisma.post.delete({ where: { id: key } }); break;
    case "pagecontent": await prisma.dynamicPageContent.delete({ where: { id: key } }); break;
    case "plans": await prisma.pricingPlan.delete({ where: { id: key } }); break;
    case "showcase": await prisma.showcaseAsset.delete({ where: { id: key } }); break;
    case "siteconfig": await prisma.siteConfiguration.delete({ where: { id: key } }); break;
    case "leadership": await prisma.leadershipPersonnel.delete({ where: { id: key } }); break;
    case "credentials": await prisma.corporateCredential.delete({ where: { id: key } }); break;
    case "gallery": await prisma.entityMedia.delete({ where: { id: key } }); break;
    case "navigation": await prisma.navigationItem.delete({ where: { id: key } }); break;
    case "social": await prisma.socialMediaLink.delete({ where: { id: key } }); break;
    default: throw new Error("Unknown model");
  }
  revalidatePath(`/admin/inventory/${model}`);
  revalidatePath("/", "layout");
}
