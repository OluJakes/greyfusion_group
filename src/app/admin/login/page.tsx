import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  if (isAdminAuthenticated()) redirect("/admin");
  return (
    <section className="container-gf flex min-h-[70vh] max-w-sm flex-col justify-center pb-20">
      <h1 className="font-display text-2xl font-semibold">Operations Console</h1>
      <p className="mt-2 text-sm ink-muted">Authorised personnel only. Sessions expire after 12 hours.</p>
      <div className="card mt-6 p-6"><LoginForm /></div>
    </section>
  );
}
