"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, getSessionUsername } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { ROLES, isPermission, type Role } from "@/lib/rbac-constants";

/**
 * Admin user / RBAC management (V13). Every action is guarded server-side by the
 * MANAGE_USERS permission, and safety rails prevent locking the org out of its own
 * super-admin access.
 */

export interface UserActionResult {
  ok: boolean;
  error?: string;
}

const RoleSchema = z.enum([...ROLES] as [Role, ...Role[]]);

async function guarded(): Promise<{ me: string | null } | null> {
  try {
    await requirePermission("MANAGE_USERS");
  } catch {
    return null;
  }
  return { me: getSessionUsername() };
}

function cleanPermissions(perms: string[]): string {
  return JSON.stringify(perms.filter(isPermission));
}

const createSchema = z.object({
  username: z.string().email("Enter a valid email address").max(160),
  fullName: z.string().min(2, "Enter a full name").max(120),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
  role: RoleSchema,
  permissions: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export async function createAdminUser(input: z.input<typeof createSchema>): Promise<UserActionResult> {
  if (!(await guarded())) return { ok: false, error: "Forbidden — you need the Manage users permission." };
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid data" };
  const d = parsed.data;
  const username = d.username.trim().toLowerCase();
  try {
    const existing = await db.adminUser.findUnique({ where: { username } });
    if (existing) return { ok: false, error: "An admin with that email already exists." };
    await db.adminUser.create({
      data: {
        username,
        fullName: d.fullName.trim(),
        passwordHash: hashPassword(d.password),
        role: d.role,
        permissions: cleanPermissions(d.permissions),
        isActive: d.isActive,
      },
    });
  } catch {
    return { ok: false, error: "Could not create the admin user." };
  }
  revalidatePath("/admin/users");
  return { ok: true };
}

const updateSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().min(2).max(120),
  role: RoleSchema,
  permissions: z.array(z.string()).default([]),
  isActive: z.boolean(),
  password: z.string().max(200).optional().default(""),
});

/** Guard against removing the last active super admin (demote or disable). */
async function wouldOrphanSupers(targetRole: string, nextRole: string, nextActive: boolean): Promise<boolean> {
  if (targetRole !== "SUPER_ADMIN") return false;
  if (nextRole === "SUPER_ADMIN" && nextActive) return false;
  try {
    const supers = await db.adminUser.count({ where: { role: "SUPER_ADMIN", isActive: true } });
    return supers <= 1;
  } catch {
    return false;
  }
}

export async function updateAdminUser(input: z.input<typeof updateSchema>): Promise<UserActionResult> {
  if (!(await guarded())) return { ok: false, error: "Forbidden — you need the Manage users permission." };
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid data" };
  const d = parsed.data;
  try {
    const target = await db.adminUser.findUnique({ where: { id: d.id } });
    if (!target) return { ok: false, error: "User not found." };
    if (await wouldOrphanSupers(target.role, d.role, d.isActive)) {
      return { ok: false, error: "You can't demote or disable the last active super administrator." };
    }
    const data: Record<string, unknown> = {
      fullName: d.fullName.trim(),
      role: d.role,
      permissions: cleanPermissions(d.permissions),
      isActive: d.isActive,
    };
    if (d.password && d.password.length >= 8) data.passwordHash = hashPassword(d.password);
    await db.adminUser.update({ where: { id: d.id }, data });
  } catch {
    return { ok: false, error: "Could not update the admin user." };
  }
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function setAdminUserActive(id: string, isActive: boolean): Promise<UserActionResult> {
  if (!(await guarded())) return { ok: false, error: "Forbidden." };
  try {
    const target = await db.adminUser.findUnique({ where: { id } });
    if (!target) return { ok: false, error: "User not found." };
    if (!isActive && (await wouldOrphanSupers(target.role, target.role, false))) {
      return { ok: false, error: "You can't disable the last active super administrator." };
    }
    await db.adminUser.update({ where: { id }, data: { isActive } });
  } catch {
    return { ok: false, error: "Could not update status." };
  }
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteAdminUser(id: string): Promise<UserActionResult> {
  const g = await guarded();
  if (!g) return { ok: false, error: "Forbidden." };
  try {
    const target = await db.adminUser.findUnique({ where: { id } });
    if (!target) return { ok: false, error: "User not found." };
    if (g.me && target.username === g.me) return { ok: false, error: "You can't delete your own account." };
    if (await wouldOrphanSupers(target.role, "EDITOR", false)) {
      return { ok: false, error: "You can't delete the last active super administrator." };
    }
    await db.adminUser.delete({ where: { id } });
  } catch {
    return { ok: false, error: "Could not delete the admin user." };
  }
  revalidatePath("/admin/users");
  return { ok: true };
}
