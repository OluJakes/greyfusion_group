import { getSessionUsername } from "@/lib/auth";
import { db } from "@/lib/db";
import { safeJson } from "@/lib/utils";
import { PERMISSIONS, effectivePermissions, type Permission } from "@/lib/rbac-constants";

/**
 * Role-based access control (V13) — server-only resolution.
 *
 * The admin session carries the authenticated username; this module resolves it to the
 * live AdminUser record and its effective permissions. The default super-admin account
 * (env-fallback login) is treated as SUPER_ADMIN with every permission.
 */

export type { Permission };
export { PERMISSIONS } from "@/lib/rbac-constants";

const DEFAULT_ADMIN = "hello@greyfusion.com.ng";

export interface CurrentAdmin {
  username: string;
  fullName: string;
  role: string;
  permissions: Permission[];
  isSuper: boolean;
}

/** Resolve the current session to an admin identity, or null if unauthenticated/disabled. */
export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const username = getSessionUsername();
  if (!username) return null;

  try {
    const user = await db.adminUser.findUnique({ where: { username } });
    if (user) {
      if (!user.isActive) return null; // disabled accounts lose access immediately
      const perms = effectivePermissions(user.role, safeJson<string[]>(user.permissions, []));
      return {
        username: user.username,
        fullName: user.fullName || user.username,
        role: user.role,
        permissions: perms,
        isSuper: user.role === "SUPER_ADMIN",
      };
    }
  } catch {
    /* table/columns not migrated yet → fall through to env-default below */
  }

  // Env-fallback super admin (logged in via ADMIN_PASSWORD before any AdminUser row exists).
  if (username === DEFAULT_ADMIN) {
    return { username, fullName: "Super Admin", role: "SUPER_ADMIN", permissions: [...PERMISSIONS], isSuper: true };
  }
  return null;
}

export async function hasPermission(perm: Permission): Promise<boolean> {
  const admin = await getCurrentAdmin();
  return !!admin && (admin.isSuper || admin.permissions.includes(perm));
}

/** Throw if the current admin lacks `perm`. Use at the top of guarded actions/routes. */
export async function requirePermission(perm: Permission): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin || (!admin.isSuper && !admin.permissions.includes(perm))) {
    throw new Error("Forbidden: insufficient permissions");
  }
  return admin;
}
