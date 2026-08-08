"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/components/Reveal";

export interface SearchItem {
  group: string;
  title: string;
  sub: string;
  href: string;
}

function score(query: string, item: SearchItem): number {
  const q = query.toLowerCase().trim();
  if (!q) return 1;
  const hay = (item.title + " " + item.sub + " " + item.group).toLowerCase();
  if (hay.includes(q)) return 100 - hay.indexOf(q);
  // fuzzy subsequence
  let qi = 0;
  for (let i = 0; i < hay.length && qi < q.length; i++) {
    if (hay[i] === q[qi]) qi++;
  }
  return qi === q.length ? 10 : -1;
}

export function CommandBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const loaded = useRef(false);
  const router = useRouter();

  const load = useCallback(async () => {
    if (loaded.current) return;
    loaded.current = true;
    try {
      const res = await fetch("/api/search-index");
      const data = (await res.json()) as SearchItem[];
      setItems(data);
    } catch {
      loaded.current = false;
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        void load();
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        setOpen(true);
        void load();
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = () => {
      setOpen(true);
      void load();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("gf:cmdk", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("gf:cmdk", onOpen);
    };
  }, [load]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const results = useMemo(() => {
    const scored = items
      .map((item) => ({ item, s: score(query, item) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 24)
      .map((r) => r.item);
    const groups = new Map<string, SearchItem[]>();
    for (const item of scored) {
      const arr = groups.get(item.group) ?? [];
      arr.push(item);
      groups.set(item.group, arr);
    }
    return { flat: scored, groups: Array.from(groups.entries()) };
  }, [items, query]);

  const go = (item: SearchItem) => {
    setOpen(false);
    router.push(item.href);
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results.flat[active]) {
      e.preventDefault();
      go(results.flat[active]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] bg-graphite/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Command bar"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="card mx-auto mt-[12vh] w-[min(92vw,640px)] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b px-4 hairline">
              <span aria-hidden="true" className="text-fusion">⌘</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onInputKey}
                placeholder="Search divisions, vehicles, properties, products, insights…"
                className="w-full bg-transparent py-4 text-sm outline-none placeholder:ink-muted"
                aria-label="Search"
              />
              <kbd className="rounded border px-1.5 py-0.5 text-[10px] hairline ink-muted">esc</kbd>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {results.flat.length === 0 && (
                <p className="px-3 py-8 text-center text-sm ink-muted">
                  {items.length === 0 ? "Loading index…" : "No matches. Try a division, product or vehicle name."}
                </p>
              )}
              {results.groups.map(([group, groupItems]) => (
                <div key={group} className="mb-1">
                  <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-widest ink-muted">{group}</p>
                  {groupItems.map((item) => {
                    const idx = results.flat.indexOf(item);
                    return (
                      <button
                        key={item.href + item.title}
                        type="button"
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => go(item)}
                        className={
                          "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors " +
                          (idx === active ? "bg-[var(--surface-2)] text-fusion" : "")
                        }
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{item.title}</span>
                          <span className="block truncate text-xs ink-muted">{item.sub}</span>
                        </span>
                        <span aria-hidden="true" className="ml-3 text-xs ink-muted">↵</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
