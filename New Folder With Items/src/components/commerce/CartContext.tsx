"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface CartLine {
  slug: string;
  name: string;
  priceNGN: number;
  qty: number;
  variant: string;
}

interface CartApi {
  lines: CartLine[];
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  remove: (slug: string, variant: string) => void;
  setQty: (slug: string, variant: string, qty: number) => void;
  clear: () => void;
  count: number;
  totalNGN: number;
}

const CartContext = createContext<CartApi | null>(null);
const KEY = "gf-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const add = useCallback((line: Omit<CartLine, "qty">, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.slug === line.slug && l.variant === line.variant);
      if (existing) {
        return prev.map((l) => (l === existing ? { ...l, qty: Math.min(99, l.qty + qty) } : l));
      }
      return [...prev, { ...line, qty }];
    });
  }, []);

  const remove = useCallback((slug: string, variant: string) => {
    setLines((prev) => prev.filter((l) => !(l.slug === slug && l.variant === variant)));
  }, []);

  const setQty = useCallback((slug: string, variant: string, qty: number) => {
    setLines((prev) => prev.map((l) => (l.slug === slug && l.variant === variant ? { ...l, qty: Math.max(1, Math.min(99, qty)) } : l)));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartApi>(
    () => ({
      lines,
      add,
      remove,
      setQty,
      clear,
      count: lines.reduce((s, l) => s + l.qty, 0),
      totalNGN: lines.reduce((s, l) => s + l.qty * l.priceNGN, 0),
    }),
    [lines, add, remove, setQty, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
