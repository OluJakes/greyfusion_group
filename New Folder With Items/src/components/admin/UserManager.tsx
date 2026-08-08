"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/components/Reveal";
import { cn, fmtDate } from "@/lib/utils";
import { ROLES, PERMISSIONS, PERMISSION_LABELS, ROLE_PERMISSIONS, type Role } from "@/lib/rbac-constants";
import { createAdminUser, updateAdminUser, deleteAdminUser, setAdminUserActive } from "@/app/admin/users/actions";

export interface AdminUserView {
  id: string;
  username: string;
  fullName: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  lastLoginAt: string | null;
}

interface Draft {
  id: string | null;
  username: string;
  fullName: string;
  password: string;
  role: Role;
  permissions: string[];
  isActive: boolean;
}

const emptyDraft: Draft = { id: null, username: "", fullName: "", password: "", role: "EDITOR", permissions: [...ROLE_PERMISSIONS.EDITOR], isActive: true };

const ROLE_STYLES: Record<string, string> = {
  SUPER_ADMIN: "bg-fusion/12 text-fusion",
  COMPLIANCE_OFFICER: "bg-[#0284C7]/12 text-[#0284C7]",
  EDITOR: "bg-[#16A34A]/12 text-[#16A34A]",
  AUDITOR: "bg-[var(--surface-2)] ink-muted",
};

export function UserManager({ users, currentUsername }: { users: AdminUserView[]; currentUsername: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const openNew = () => { setError(""); setDraft({ ...emptyDraft }); };
  const openEdit = (u: AdminUserView) =>
    setDraft({ id: u.id, username: u.username, fullName: u.fullName, password: "", role: (u.role as Role) ?? "EDITOR", permissions: u.permissions, isActive: u.isActive });

  const run = async (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setBusy(true); setError("");
    const res = await fn();
    setBusy(false);
    if (res.ok) { setDraft(null); router.refresh(); }
    else setError(res.error ?? "Something went wrong");
  };

  const save = () => {
    if (!draft) return;
    if (draft.id) {
      void run(() => updateAdminUser({ id: draft.id!, fullName: draft.fullName, role: draft.role, permissions: draft.permissions, isActive: draft.isActive, password: draft.password }));
    } else {
      void run(() => createAdminUser({ username: draft.username, fullName: draft.fullName, password: draft.password, role: draft.role, permissions: draft.permissions, isActive: draft.isActive }));
    }
  };

  const togglePerm = (p: string) =>
    setDraft((d) => (d ? { ...d, permissions: d.permissions.includes(p) ? d.permissions.filter((x) => x !== p) : [...d.permissions, p] } : d));

  const pickRole = (role: Role) =>
    setDraft((d) => (d ? { ...d, role, permissions: role === "SUPER_ADMIN" ? [...PERMISSIONS] : [...ROLE_PERMISSIONS[role]] } : d));

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Admin users</h1>
          <p className="mt-1 text-xs ink-muted">Manage administrator accounts, roles and granular permissions.</p>
        </div>
        <button type="button" onClick={openNew} className="btn-primary !py-2 text-xs">+ New admin</button>
      </div>

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b bg-[var(--surface-2)] text-left text-xs uppercase tracking-wider hairline ink-muted">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Perms</th>
              <th className="px-4 py-3 font-semibold">Last login</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hairline">
                <td className="px-4 py-3 font-semibold">{u.fullName || "—"}{u.username === currentUsername && <span className="ml-2 rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] ink-muted">you</span>}</td>
                <td className="px-4 py-3 ink-muted">{u.username}</td>
                <td className="px-4 py-3"><span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", ROLE_STYLES[u.role] ?? "bg-[var(--surface-2)]")}>{u.role.replace(/_/g, " ")}</span></td>
                <td className="num px-4 py-3">{u.role === "SUPER_ADMIN" ? "all" : u.permissions.length}</td>
                <td className="px-4 py-3 text-xs ink-muted">{u.lastLoginAt ? fmtDate(u.lastLoginAt) : "never"}</td>
                <td className="px-4 py-3">
                  <button
                    type="button" disabled={busy}
                    onClick={() => void run(() => setAdminUserActive(u.id, !u.isActive))}
                    className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors", u.isActive ? "bg-green-600/12 text-green-600" : "bg-fusion/12 text-fusion")}
                  >
                    {u.isActive ? "Active" : "Disabled"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <button type="button" onClick={() => openEdit(u)} className="text-xs font-semibold text-fusion">Edit</button>
                    <button
                      type="button" disabled={busy || u.username === currentUsername}
                      onClick={() => { if (confirm(`Delete ${u.username}? This cannot be undone.`)) void run(() => deleteAdminUser(u.id)); }}
                      className="text-xs font-semibold ink-muted hover:text-fusion disabled:opacity-30"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-sm ink-muted">No admin users yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {draft && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-graphite/70 p-4 backdrop-blur-sm"
            onClick={() => setDraft(null)} role="dialog" aria-modal="true" aria-label="Admin user"
          >
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="card max-h-[88vh] w-full max-w-lg overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display text-lg font-semibold">{draft.id ? "Edit admin" : "New admin"}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label-gf" htmlFor="u-email">Email (login username)</label>
                  <input id="u-email" type="email" value={draft.username} disabled={!!draft.id}
                    onChange={(e) => setDraft({ ...draft, username: e.target.value })}
                    className="input-gf w-full disabled:opacity-60" placeholder="name@greyfusion.com.ng" />
                </div>
                <div>
                  <label className="label-gf" htmlFor="u-name">Full name</label>
                  <input id="u-name" value={draft.fullName} onChange={(e) => setDraft({ ...draft, fullName: e.target.value })} className="input-gf w-full" />
                </div>
                <div>
                  <label className="label-gf" htmlFor="u-pass">{draft.id ? "New password (blank = keep)" : "Password"}</label>
                  <input id="u-pass" type="password" value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} className="input-gf w-full" placeholder="min 8 characters" />
                </div>
              </div>

              <div className="mt-4">
                <span className="label-gf">Role</span>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map((r) => (
                    <button key={r} type="button" onClick={() => pickRole(r)} aria-pressed={draft.role === r}
                      className={cn("rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors hairline", draft.role === r ? "bg-fusion text-white" : "hover:border-fusion")}>
                      {r.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <span className="label-gf">Permissions{draft.role === "SUPER_ADMIN" ? " (super admin has all)" : ""}</span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {PERMISSIONS.map((p) => {
                    const on = draft.role === "SUPER_ADMIN" || draft.permissions.includes(p);
                    return (
                      <label key={p} className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hairline", draft.role === "SUPER_ADMIN" ? "opacity-60" : "cursor-pointer")}>
                        <input type="checkbox" checked={on} disabled={draft.role === "SUPER_ADMIN"} onChange={() => togglePerm(p)} className="h-4 w-4 accent-[#E2583E]" />
                        {PERMISSION_LABELS[p]}
                      </label>
                    );
                  })}
                </div>
              </div>

              <label className="mt-4 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={draft.isActive} onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} className="h-4 w-4 accent-[#E2583E]" />
                Account active
              </label>

              {error && <p className="mt-3 text-xs font-semibold text-fusion">{error}</p>}

              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setDraft(null)} className="btn-secondary !py-2 text-xs">Cancel</button>
                <button type="button" onClick={save} disabled={busy} className="btn-primary !py-2 text-xs disabled:opacity-50">
                  {busy ? "Saving…" : draft.id ? "Save changes" : "Create admin"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
