"use client";

import { cn } from "@/lib/utils";

/**
 * Compact, accessible pager. Shows first/last, current ± 1, and ellipses.
 * Purely presentational — the parent owns the page state and slices the data.
 */
export function Pagination({
  page,
  pageCount,
  onChange,
  accent = "var(--accent)",
}: {
  page: number;
  pageCount: number;
  onChange: (p: number) => void;
  accent?: string;
}) {
  if (pageCount <= 1) return null;

  const nums: (number | "…")[] = [];
  const push = (n: number | "…") => nums.push(n);
  const window = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  let prev = 0;
  for (let i = 1; i <= pageCount; i++) {
    if (!window.has(i)) continue;
    if (i - prev > 1) push("…");
    push(i);
    prev = i;
  }

  const go = (p: number) => onChange(Math.min(pageCount, Math.max(1, p)));

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page === 1}
        className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors hairline hover:border-fusion disabled:opacity-40"
        aria-label="Previous page"
      >
        ← Prev
      </button>

      {nums.map((n, i) =>
        n === "…" ? (
          <span key={`e${i}`} className="px-2 text-xs ink-muted" aria-hidden="true">…</span>
        ) : (
          <button
            key={n}
            type="button"
            onClick={() => go(n)}
            aria-current={n === page ? "page" : undefined}
            className={cn(
              "num min-w-[2.25rem] rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors hairline",
              n === page ? "text-white" : "hover:border-fusion"
            )}
            style={n === page ? { background: accent, borderColor: accent } : undefined}
          >
            {n}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page === pageCount}
        className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors hairline hover:border-fusion disabled:opacity-40"
        aria-label="Next page"
      >
        Next →
      </button>
    </nav>
  );
}
