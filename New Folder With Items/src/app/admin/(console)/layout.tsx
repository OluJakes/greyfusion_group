import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { ADMIN_MODELS } from "@/lib/admin-models";
import { Logo } from "@/components/Logo";
import { getBranding } from "@/lib/branding";
import { getCurrentAdmin } from "@/lib/rbac";
import { adminLogout } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminConsoleLayout({ children }: { children: ReactNode }) {
  // Defense in depth: middleware may be disabled on some hosts, so the console layout
  // independently verifies the HMAC-signed session on every request.
  if (!isAdminAuthenticated()) redirect("/admin/login");

  // Single-source branding: the admin sidebar renders the same active logo as the
  // public header, so a logo uploaded in /admin/branding shows up in the backend too.
  const [branding, admin] = await Promise.all([getBranding(), getCurrentAdmin()]);
  const can = (p: "VIEW_ANALYTICS" | "MANAGE_USERS") => !!admin && (admin.isSuper || admin.permissions.includes(p));

  return (
    <div className="container-gf grid gap-8 py-10 lg:grid-cols-[13rem_1fr]">
      <aside>
        <div className="flex flex-col gap-2">
          <Logo logoUrl={branding.logoLightUrl} siteName={branding.siteName} markClass="h-6 w-6 text-[var(--ink)]" />
          <span className="font-display text-[11px] font-bold uppercase tracking-widest ink-muted">Ops Console</span>
        </div>
        <nav className="mt-6 space-y-1 text-sm" aria-label="Admin">
          <Link href="/admin" className="block rounded-lg px-3 py-2 font-semibold hover:bg-[var(--surface-2)]">Command overview</Link>
          <Link href="/admin/leads" className="block rounded-lg px-3 py-2 font-semibold hover:bg-[var(--surface-2)]">Leads pipeline</Link>
          {can("VIEW_ANALYTICS") && (
            <Link href="/admin/analytics" className="block rounded-lg px-3 py-2 font-semibold hover:bg-[var(--surface-2)]">Analytics</Link>
          )}
          {can("MANAGE_USERS") && (
            <Link href="/admin/users" className="block rounded-lg px-3 py-2 font-semibold hover:bg-[var(--surface-2)]">Admin users</Link>
          )}
          <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-widest ink-muted">Inventory</p>
          {ADMIN_MODELS.map((m) => (
            <Link key={m.key} href={`/admin/inventory/${m.key}`} className="block rounded-lg px-3 py-2 hover:bg-[var(--surface-2)]">
              {m.label}
            </Link>
          ))}
          <form action={adminLogout} className="pt-3">
            <button type="submit" className="w-full rounded-lg border px-3 py-2 text-left text-sm hairline hover:border-fusion">Sign out</button>
          </form>
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
