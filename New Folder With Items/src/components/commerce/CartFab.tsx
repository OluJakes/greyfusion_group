"use client";

import Link from "next/link";
import { useCart } from "@/components/commerce/CartContext";

export function CartFab() {
  const { count } = useCart();
  return (
    <Link
      href="/divisions/commerce/cart"
      className="fixed bottom-5 left-5 z-50 flex h-12 items-center gap-2 rounded-full border bg-[var(--surface)] px-4 shadow-xl hairline"
      aria-label={`Cart, ${count} item(s)`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M3 4h2l2.4 12.2A2 2 0 0 0 9.4 18h8.9a2 2 0 0 0 2-1.6L22 8H6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10" cy="21" r="1.2" /><circle cx="18" cy="21" r="1.2" />
      </svg>
      <span className="num text-sm font-bold text-[#E11D48]">{count}</span>
    </Link>
  );
}
