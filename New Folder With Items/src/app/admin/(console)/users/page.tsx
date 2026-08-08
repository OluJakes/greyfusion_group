import { db } from "@/lib/db";
import { getCurrentAdmin, hasPermission } from "@/lib/rbac";
import { safeJson } from "@/lib/utils";
import { UserManager, type AdminUserView } from "@/components/admin/UserManager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const me = await getCurrentAdmin();
  if (!me || (!me.isSuper && !me.permissions.includes("MANAGE_USERS"))) {
    return (
      <div className="card p-8 text-center">
        <h1 className="font-display text-xl font-semibold">Admin users</h1>
        <p className="mt-2 text-sm ink-muted">You don&apos;t have permission to manage users. This area requires the Manage users permission.</p>
      </div>
    );
  }

  let users: AdminUserView[] = [];
  try {
    const rows = await db.adminUser.findMany({ orderBy: { createdAt: "asc" } });
    users = rows.map((u) => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      role: u.role,
      permissions: safeJson<string[]>(u.permissions, []),
      isActive: u.isActive,
      lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
    }));
  } catch {
    users = [];
  }

  // The env-fallback super admin may have no AdminUser row yet — surface it so the
  // console never looks empty for the default account.
  if (!users.some((u) => u.username === me.username)) {
    users = [
      { id: "__session__", username: me.username, fullName: me.fullName, role: me.role, permissions: me.permissions, isActive: true, lastLoginAt: null },
      ...users,
    ];
  }

  return <UserManager users={users} currentUsername={me.username} />;
}
