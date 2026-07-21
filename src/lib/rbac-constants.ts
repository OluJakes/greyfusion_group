/**
 * Pure RBAC vocabulary (V13) — safe to import from both server and client code.
 * The server-only resolution logic lives in src/lib/rbac.ts.
 */

export const PERMISSIONS = [
  "MANAGE_VEHICLES",
  "MANAGE_PROPERTIES",
  "MANAGE_PRODUCTS",
  "MANAGE_PROJECTS",
  "MANAGE_COMPLIANCE",
  "MANAGE_CONTENT",
  "VIEW_ANALYTICS",
  "MANAGE_USERS",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<Permission, string> = {
  MANAGE_VEHICLES: "Manage vehicles",
  MANAGE_PROPERTIES: "Manage properties",
  MANAGE_PRODUCTS: "Manage products",
  MANAGE_PROJECTS: "Manage projects",
  MANAGE_COMPLIANCE: "Manage compliance",
  MANAGE_CONTENT: "Manage content",
  VIEW_ANALYTICS: "View analytics",
  MANAGE_USERS: "Manage users",
};

export const ROLES = ["SUPER_ADMIN", "COMPLIANCE_OFFICER", "EDITOR", "AUDITOR"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [...PERMISSIONS],
  COMPLIANCE_OFFICER: ["MANAGE_COMPLIANCE", "VIEW_ANALYTICS"],
  EDITOR: ["MANAGE_VEHICLES", "MANAGE_PROPERTIES", "MANAGE_PRODUCTS", "MANAGE_PROJECTS", "MANAGE_CONTENT"],
  AUDITOR: ["VIEW_ANALYTICS"],
};

export function isPermission(x: string): x is Permission {
  return (PERMISSIONS as readonly string[]).includes(x);
}

/** Effective permissions = explicit list if any valid, else the role defaults. Super = all. */
export function effectivePermissions(role: string, explicit: string[]): Permission[] {
  if (role === "SUPER_ADMIN") return [...PERMISSIONS];
  const fromExplicit = explicit.filter(isPermission);
  if (fromExplicit.length > 0) return fromExplicit;
  return ROLE_PERMISSIONS[role as Role] ?? [];
}
