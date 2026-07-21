"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MediaDTO } from "@/lib/gallery";
import { MediaManagerModal } from "@/components/admin/MediaManagerModal";

/**
 * Admin table cell: the "Gallery (N)" trigger that opens the universal
 * MediaManagerModal for a single vehicle / property / product / project row.
 * Holds the row's media in local state so the count and cover update live, and
 * refreshes the route on close so sibling cells and the public site re-read.
 */
export function GalleryCell({
  entityType,
  entityId,
  label,
  initial,
}: {
  entityType: string;
  entityId: string;
  label: string;
  initial: MediaDTO[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<MediaDTO[]>(initial);

  const close = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold transition-colors hairline hover:border-fusion hover:text-fusion"
        title={`Manage images for ${label}`}
      >
        <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        Gallery ({images.length})
      </button>

      {open && (
        <MediaManagerModal
          entityType={entityType}
          entityId={entityId}
          label={label}
          images={images}
          onImagesChange={setImages}
          onClose={close}
        />
      )}
    </>
  );
}
