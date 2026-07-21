"use server";

import { promises as fs } from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  GALLERY_FK,
  getEntityMediaRows,
  type GalleryEntity,
  type MediaDTO,
} from "@/lib/gallery";

/**
 * Universal multi-gallery controller (V8).
 *
 * One relational table (EntityMedia) backs the galleries of vehicles, properties,
 * products and projects. These actions power the admin MediaManagerModal: append
 * media (uploaded files as data URLs or external CDN URLs), promote a main cover,
 * reorder the strip, and delete individual assets. Every mutation re-reads and
 * returns the fresh, ordered gallery so the client stays authoritative.
 */

const STANDARD_MAX = 10_485_760; // 10MB per photo

function requireAdmin(): void {
  if (!isAdminAuthenticated()) throw new Error("Unauthorized");
}

function assertEntity(entityType: string): asserts entityType is GalleryEntity {
  if (!(entityType in GALLERY_FK)) throw new Error(`Unknown entity type "${entityType}"`);
}

/** base64 data URL → decoded byte length (0 for non-data URLs). */
function dataUrlBytes(value: string): number {
  if (!value.startsWith("data:")) return 0;
  const comma = value.indexOf(",");
  if (comma === -1) return 0;
  const b64 = value.slice(comma + 1);
  return Math.floor((b64.length * 3) / 4) - (b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0);
}

function validateUrl(url: string): void {
  const trimmed = url.trim();
  if (!trimmed) throw new Error("An image (uploaded file or URL) is required");
  const isData = trimmed.startsWith("data:");
  const isHttp = /^https?:\/\//i.test(trimmed);
  const isLocal = trimmed.startsWith("/");
  if (!isData && !isHttp && !isLocal) {
    throw new Error("Enter a full https:// image URL or upload a file");
  }
  if (isData) {
    if (!trimmed.startsWith("data:image/")) throw new Error("Only image files are supported");
    const bytes = dataUrlBytes(trimmed);
    if (bytes > STANDARD_MAX) {
      throw new Error(
        `Image is ${(bytes / 1_048_576).toFixed(1)}MB — over the 10MB per-photo limit. Host it externally and paste the URL instead.`
      );
    }
  }
}

/** Re-read the ordered gallery and push cache invalidations for every affected surface. */
async function syncAndReturn(entity: GalleryEntity, entityId: string): Promise<MediaDTO[]> {
  revalidatePath("/admin/inventory/vehicles");
  revalidatePath("/admin/inventory/properties");
  revalidatePath("/admin/inventory/products");
  revalidatePath("/admin/inventory/projects");
  revalidatePath("/admin/inventory/gallery");
  revalidatePath("/", "layout"); // public listing + detail pages refresh within the ISR window
  return getEntityMediaRows(entity, entityId);
}

/** Reveal which entity a media row belongs to (used by id-only signatures). */
async function ownerOf(mediaId: string): Promise<{ entity: GalleryEntity; entityId: string; url: string } | null> {
  const row = await prisma.entityMedia.findUnique({ where: { id: mediaId } });
  if (!row) return null;
  if (row.vehicleId) return { entity: "vehicle", entityId: row.vehicleId, url: row.url };
  if (row.propertyId) return { entity: "property", entityId: row.propertyId, url: row.url };
  if (row.productId) return { entity: "product", entityId: row.productId, url: row.url };
  if (row.projectId) return { entity: "project", entityId: row.projectId, url: row.url };
  return null;
}

/** Best-effort removal of a locally-stored upload (base64 rows live only in the DB). */
async function cleanupLocalFile(url: string): Promise<void> {
  if (!url.startsWith("/uploads/")) return;
  try {
    await fs.unlink(path.join(process.cwd(), "public", url.replace(/^\/+/, "")));
  } catch {
    /* file already gone or never written to disk */
  }
}

/** Input shape for a single new media asset (type only — not a runtime export). */
interface NewMediaInput {
  url: string;
  altText?: string;
  kind?: string;
}

/**
 * Append one or more media assets to an entity. New rows are placed after the
 * current strip. If the entity had no images, the first new one becomes the main
 * cover so a thumbnail always exists.
 */
export async function addEntityMedia(
  entityType: string,
  entityId: string,
  items: NewMediaInput[]
): Promise<MediaDTO[]> {
  requireAdmin();
  assertEntity(entityType);
  if (!entityId) throw new Error("Missing entity id");
  if (!items?.length) throw new Error("Nothing to add");
  items.forEach((it) => validateUrl(it.url));

  const fk = GALLERY_FK[entityType];
  const agg = await prisma.entityMedia.aggregate({ where: { [fk]: entityId }, _max: { displayOrder: true } });
  const existing = await prisma.entityMedia.count({ where: { [fk]: entityId } });
  let order = (agg._max.displayOrder ?? -1) + 1;

  await prisma.entityMedia.createMany({
    data: items.map((it, i) => ({
      url: it.url.trim(),
      kind: it.kind || "image",
      altText: it.altText?.trim() || "Greyfusion media asset",
      displayOrder: order + i,
      isMain: existing === 0 && i === 0, // first-ever image auto-promotes to cover
      [fk]: entityId,
    })),
  });

  // Guarantee exactly one main cover exists for the entity.
  const mainCount = await prisma.entityMedia.count({ where: { [fk]: entityId, isMain: true } });
  if (mainCount === 0) {
    const first = await prisma.entityMedia.findFirst({
      where: { [fk]: entityId },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    });
    if (first) await prisma.entityMedia.update({ where: { id: first.id }, data: { isMain: true } });
  }

  return syncAndReturn(entityType, entityId);
}

/**
 * Promote a media row to the entity's main cover, demoting all siblings. This is
 * the field the public list/search cards read as their thumbnail.
 */
export async function setMainMedia(
  entityType: string,
  entityId: string,
  mediaId: string
): Promise<MediaDTO[]> {
  requireAdmin();
  assertEntity(entityType);
  const fk = GALLERY_FK[entityType];
  await prisma.entityMedia.updateMany({ where: { [fk]: entityId, isMain: true }, data: { isMain: false } });
  await prisma.entityMedia.update({ where: { id: mediaId }, data: { isMain: true } });
  return syncAndReturn(entityType, entityId);
}

/**
 * Delete a single media asset (and clean up its local file if stored on disk).
 * If the deleted row was the cover, the next image in order is promoted so the
 * entity never loses its thumbnail.
 */
export async function deleteEntityMedia(mediaId: string): Promise<MediaDTO[]> {
  requireAdmin();
  const owner = await ownerOf(mediaId);
  await prisma.entityMedia.delete({ where: { id: mediaId } });
  if (!owner) {
    revalidatePath("/", "layout");
    return [];
  }
  await cleanupLocalFile(owner.url);

  const fk = GALLERY_FK[owner.entity];
  const mainCount = await prisma.entityMedia.count({ where: { [fk]: owner.entityId, isMain: true } });
  if (mainCount === 0) {
    const next = await prisma.entityMedia.findFirst({
      where: { [fk]: owner.entityId },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    });
    if (next) await prisma.entityMedia.update({ where: { id: next.id }, data: { isMain: true } });
  }
  return syncAndReturn(owner.entity, owner.entityId);
}

/** Bulk-update displayOrder to persist a drag/move-up/move-down reordering. */
export async function reorderEntityMedia(
  mediaOrders: { id: string; displayOrder: number }[]
): Promise<MediaDTO[]> {
  requireAdmin();
  if (!mediaOrders?.length) return [];
  await prisma.$transaction(
    mediaOrders.map((m) =>
      prisma.entityMedia.update({ where: { id: m.id }, data: { displayOrder: m.displayOrder } })
    )
  );
  const owner = await ownerOf(mediaOrders[0].id);
  if (!owner) return [];
  return syncAndReturn(owner.entity, owner.entityId);
}

/** Read helper the modal calls on open (thin wrapper around the lib fetch). */
export async function listEntityMedia(entityType: string, entityId: string): Promise<MediaDTO[]> {
  requireAdmin();
  assertEntity(entityType);
  return getEntityMediaRows(entityType, entityId);
}
