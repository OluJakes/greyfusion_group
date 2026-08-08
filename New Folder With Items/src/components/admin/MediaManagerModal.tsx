"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/components/Reveal";
import { cn } from "@/lib/utils";
import type { MediaDTO } from "@/lib/gallery";
import {
  addEntityMedia,
  deleteEntityMedia,
  reorderEntityMedia,
  setMainMedia,
} from "@/app/admin/gallery/actions";

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const ACCEPT_EXT = /\.(jpe?g|png|webp|avif)$/i;
const MAX_BYTES = 10_485_760; // 10MB per photo

/* ── Inline icons (no icon dependency in this project) ── */
function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"
      fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.6 1.1 6.5L12 17.9 6.1 21l1.1-6.5L2.5 9.9l6.5-.95L12 2.5z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-9 0l1 13a1 1 0 001 1h6a1 1 0 001-1l1-13" />
    </svg>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export function MediaManagerModal({
  entityType,
  entityId,
  label,
  images,
  onImagesChange,
  onClose,
}: {
  entityType: string;
  entityId: string;
  label: string;
  images: MediaDTO[];
  onImagesChange: (next: MediaDTO[]) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [urlDraft, setUrlDraft] = useState("");
  const [altDraft, setAltDraft] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const run = useCallback(
    async (fn: () => Promise<MediaDTO[]>) => {
      setBusy(true);
      setError("");
      try {
        const next = await fn();
        onImagesChange(next);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setBusy(false);
      }
    },
    [onImagesChange]
  );

  const ingestFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;
      setError("");
      const payload: { url: string; altText: string }[] = [];
      for (const f of list) {
        if (!f.type.startsWith("image/") && !ACCEPT_EXT.test(f.name)) {
          setError(`${f.name}: only JPG, PNG, WEBP or AVIF images are accepted`);
          return;
        }
        if (f.size > MAX_BYTES) {
          setError(`${f.name} is ${(f.size / 1_048_576).toFixed(1)}MB — over the 10MB per-photo limit`);
          return;
        }
        payload.push({ url: await readFileAsDataUrl(f), altText: `${label} — ${f.name.replace(ACCEPT_EXT, "")}` });
      }
      await run(() => addEntityMedia(entityType, entityId, payload));
      if (fileInput.current) fileInput.current.value = "";
    },
    [entityType, entityId, label, run]
  );

  const addUrl = useCallback(async () => {
    const url = urlDraft.trim();
    if (!url) { setError("Paste an image URL first"); return; }
    await run(() => addEntityMedia(entityType, entityId, [{ url, altText: altDraft.trim() || `${label} media` }]));
    setUrlDraft("");
    setAltDraft("");
  }, [urlDraft, altDraft, entityType, entityId, label, run]);

  const move = useCallback(
    async (index: number, dir: -1 | 1) => {
      const target = index + dir;
      if (target < 0 || target >= images.length) return;
      const reordered = [...images];
      [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
      const orders = reordered.map((m, i) => ({ id: m.id, displayOrder: i }));
      // optimistic reflow so the strip animates before the server confirms
      onImagesChange(reordered.map((m, i) => ({ ...m, displayOrder: i })));
      await run(() => reorderEntityMedia(orders));
    },
    [images, onImagesChange, run]
  );

  const mainCount = images.filter((i) => i.isMain).length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center bg-graphite/70 p-4 backdrop-blur-sm"
        onClick={onClose} role="dialog" aria-modal="true" aria-label={`Manage gallery — ${label}`}
      >
        <motion.div
          initial={{ y: 24, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 16, opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="card flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden p-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b p-5 hairline">
            <div>
              <h2 className="font-display text-lg font-semibold">Gallery manager</h2>
              <p className="mt-0.5 text-sm ink-muted">
                {label} · {images.length} image{images.length === 1 ? "" : "s"}
                {mainCount === 1 ? " · cover set" : mainCount === 0 ? " · no cover yet" : ""}
              </p>
            </div>
            <button type="button" aria-label="Close" onClick={onClose} className="ink-muted hover:text-fusion">✕</button>
          </div>

          {/* Add controls */}
          <div className="border-b p-5 hairline">
            <div className="flex gap-2" role="tablist" aria-label="Add media">
              {(["upload", "url"] as const).map((t) => (
                <button
                  key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => { setTab(t); setError(""); }}
                  className={cn(
                    "rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-colors hairline",
                    tab === t ? "bg-fusion text-white" : "hover:border-fusion"
                  )}
                >
                  {t === "upload" ? "Upload files" : "Paste CDN URL"}
                </button>
              ))}
            </div>

            {tab === "upload" ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); void ingestFiles(e.dataTransfer.files); }}
                onClick={() => fileInput.current?.click()}
                role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInput.current?.click(); }}
                className={cn(
                  "mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
                  dragOver ? "border-fusion bg-fusion/5" : "hairline hover:border-fusion"
                )}
              >
                <p className="text-sm font-semibold">Drag &amp; drop images here</p>
                <p className="mt-1 text-xs ink-muted">or click to browse · JPG · PNG · WEBP · AVIF · up to 10MB each</p>
                <input
                  ref={fileInput} type="file" accept={ACCEPT} multiple className="hidden"
                  onChange={(e) => e.target.files && void ingestFiles(e.target.files)}
                />
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                <input
                  type="url" value={urlDraft} onChange={(e) => setUrlDraft(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-… (or any CDN / S3 / Cloudinary URL)"
                  className="input-gf w-full"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void addUrl(); } }}
                />
                <div className="flex gap-2">
                  <input
                    type="text" value={altDraft} onChange={(e) => setAltDraft(e.target.value)}
                    placeholder="Alt text (optional)" className="input-gf w-full"
                  />
                  <button type="button" onClick={() => void addUrl()} disabled={busy} className="btn-primary shrink-0 !py-2 text-xs disabled:opacity-50">
                    Add image
                  </button>
                </div>
              </div>
            )}

            {error && <p className="mt-3 text-xs font-semibold text-fusion">{error}</p>}
          </div>

          {/* Live asset matrix */}
          <div className="flex-1 overflow-y-auto p-5">
            {images.length === 0 ? (
              <p className="py-10 text-center text-sm ink-muted">
                No media yet — add a cover and gallery shots above. The first image you add becomes the main cover automatically.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((img, i) => (
                  <div
                    key={img.id}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border-2 transition-all",
                      img.isMain ? "border-fusion shadow-md shadow-fusion/20" : "hairline"
                    )}
                  >
                    <div className="relative aspect-[4/3] w-full bg-[var(--surface-2)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.altText} className="h-full w-full object-cover" loading="lazy" />
                      {img.isMain && (
                        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-fusion px-1.5 py-0.5 text-[10px] font-bold text-white">
                          <StarIcon filled /> Main
                        </span>
                      )}
                      <span className="num absolute right-2 top-2 rounded bg-graphite/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        #{i + 1}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1 p-2">
                      <div className="flex gap-1">
                        <button
                          type="button" onClick={() => void move(i, -1)} disabled={busy || i === 0}
                          aria-label="Move up" title="Move earlier"
                          className="rounded-md border px-1.5 py-1 text-xs hairline disabled:opacity-30"
                        >▲</button>
                        <button
                          type="button" onClick={() => void move(i, 1)} disabled={busy || i === images.length - 1}
                          aria-label="Move down" title="Move later"
                          className="rounded-md border px-1.5 py-1 text-xs hairline disabled:opacity-30"
                        >▼</button>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button" onClick={() => void run(() => setMainMedia(entityType, entityId, img.id))}
                          disabled={busy || img.isMain} title={img.isMain ? "This is the main cover" : "Set as main cover"}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors hairline",
                            img.isMain ? "text-fusion" : "hover:border-fusion hover:text-fusion disabled:opacity-30"
                          )}
                        >
                          <StarIcon filled={img.isMain} /> {img.isMain ? "Main" : "Set main"}
                        </button>
                        <button
                          type="button" onClick={() => void run(() => deleteEntityMedia(img.id))} disabled={busy}
                          aria-label="Delete image" title="Delete"
                          className="rounded-md border px-2 py-1 text-fusion transition-colors hairline hover:bg-fusion hover:text-white disabled:opacity-30"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t p-4 hairline">
            <span className="text-xs ink-muted">{busy ? "Saving…" : "Changes save instantly and sync to the public site."}</span>
            <button type="button" onClick={onClose} className="btn-secondary !py-2 text-xs">Done</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
