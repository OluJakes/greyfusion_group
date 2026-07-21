import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Operations Console", robots: { index: false } };
export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[var(--bg)] pt-16">{children}</div>;
}
