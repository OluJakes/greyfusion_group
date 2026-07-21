import { prisma } from "@/lib/prisma";

export type GalleryEntity = "vehicle" | "property" | "product" | "project";

/** Prisma foreign-key column for each gallery-capable entity. */
export const GALLERY_FK: Record<GalleryEntity, "vehicleId" | "propertyId" | "productId" | "projectId"> = {
  vehicle: "vehicleId",
  property: "propertyId",
  product: "productId",
  project: "projectId",
};

/** Serializable media row passed from server → client (modal / cards). */
export interface MediaDTO {
  id: string;
  url: string;
  kind: string;
  isMain: boolean;
  displayOrder: number;
  altText: string;
}

/**
 * Resolve the single main thumbnail URL for many entities in one query.
 * Main image = the row flagged isMain, else the lowest displayOrder. Returns a
 * map keyed by entity id; entities with no admin media are simply absent, letting
 * callers fall back to their coded placeholder art.
 */
export async function getMainThumbnails(
  entity: GalleryEntity,
  ids: string[]
): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  if (ids.length === 0) return out;
  try {
    const fk = GALLERY_FK[entity];
    const rows = await prisma.entityMedia.findMany({
      where: { [fk]: { in: ids } },
      orderBy: [{ isMain: "desc" }, { displayOrder: "asc" }, { createdAt: "asc" }],
      select: { url: true, vehicleId: true, propertyId: true, productId: true, projectId: true },
    });
    for (const r of rows) {
      const key = r[fk];
      if (key && !out[key]) out[key] = r.url; // first row per entity is the main one
    }
  } catch {
    /* table not migrated yet → callers fall back to coded art */
  }
  return out;
}

/** Ordered gallery rows for one entity, as serializable DTOs (for the admin modal). */
export async function getEntityMediaRows(entity: GalleryEntity, entityId: string): Promise<MediaDTO[]> {
  try {
    const fk = GALLERY_FK[entity];
    const rows = await prisma.entityMedia.findMany({
      where: { [fk]: entityId },
      orderBy: [{ isMain: "desc" }, { displayOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows.map((r) => ({
      id: r.id,
      url: r.url,
      kind: r.kind,
      isMain: r.isMain,
      displayOrder: r.displayOrder,
      altText: r.altText,
    }));
  } catch {
    return [];
  }
}

export interface GalleryImage {
  url: string;
  altText: string;
  isMain: boolean;
  kind: string;
}

/**
 * Resolve an entity's gallery. Admin-managed EntityMedia rows win; when none exist
 * we fall back to the coded default images so every detail page always shows media.
 * The main image is sorted first.
 */
export async function getEntityGallery(
  entity: GalleryEntity,
  entityId: string,
  fallback: string[],
  altBase: string
): Promise<GalleryImage[]> {
  try {
    const where =
      entity === "vehicle"
        ? { vehicleId: entityId }
        : entity === "property"
          ? { propertyId: entityId }
          : entity === "product"
            ? { productId: entityId }
            : { projectId: entityId };

    const rows = await prisma.entityMedia.findMany({
      where,
      orderBy: [{ isMain: "desc" }, { displayOrder: "asc" }, { createdAt: "asc" }],
    });

    if (rows.length > 0) {
      return rows.map((r) => ({ url: r.url, altText: r.altText, isMain: r.isMain, kind: r.kind }));
    }
  } catch {
    /* fall through to defaults */
  }
  return fallback.map((url, i) => ({ url, altText: `${altBase} — view ${i + 1}`, isMain: i === 0, kind: "image" }));
}
