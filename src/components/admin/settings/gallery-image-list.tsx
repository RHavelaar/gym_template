"use client";

import { useRef, useState } from "react";
import { ArrowUpDown, Film, ImageIcon, Plus, Upload, X } from "lucide-react";
import type { GalleryMediaType } from "@/config/types";
import { GalleryManageModal } from "@/components/admin/settings/gallery-manage-modal";
import { ImageUploadModal } from "@/components/admin/settings/image-upload-modal";
import { Button } from "@/components/ui/button";
import { HoverHint } from "@/components/ui/info-hint";
import { inferGalleryMediaType, fileNameFromGalleryUrl } from "@/lib/gallery-media";
import { cn } from "@/lib/utils";

export type GalleryItem = {
  id: string;
  url: string;
  mediaType: GalleryMediaType;
  fileName?: string;
};

type GalleryImageListProps = {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
  gymSlug: string;
};

type UploadMode = { type: "single"; itemId: string; autoOpen: boolean } | { type: "bulk" } | null;

const reorderItems = (items: GalleryItem[], fromIndex: number, toIndex: number) => {
  if (fromIndex === toIndex) return items;
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

export const GalleryImageList = ({ items, onChange, gymSlug }: GalleryImageListProps) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [uploadMode, setUploadMode] = useState<UploadMode>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const suppressClickRef = useRef(false);

  const openUploadForItem = (itemId: string, autoOpen = true) => {
    setUploadMode({ type: "single", itemId, autoOpen });
  };

  const handleAddPhoto = () => {
    const item = createGalleryItem();
    onChange([...items, item]);
    openUploadForItem(item.id, true);
  };

  const handleBulkUpload = () => {
    setUploadMode({ type: "bulk" });
  };

  const handleUploadModalClose = (itemId?: string) => {
    if (itemId) {
      const item = items.find((entry) => entry.id === itemId);
      if (item && !item.url.trim()) {
        onChange(items.filter((entry) => entry.id !== itemId));
      }
    }
    setUploadMode(null);
  };

  const handleDragStart = (index: number) => (event: React.DragEvent<HTMLDivElement>) => {
    suppressClickRef.current = true;
    setDragIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  };

  const handleDragOver = (index: number) => (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dragIndex !== null && index !== dragIndex) {
      setOverIndex(index);
    }
  };

  const handleDrop = (index: number) => (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (dragIndex === null) return;
    onChange(reorderItems(items, dragIndex, index));
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleTileClick = (item: GalleryItem) => {
    if (suppressClickRef.current) return;
    if (!item.url.trim()) {
      openUploadForItem(item.id, true);
    }
  };

  const handleUrlUpdate = (index: number, url: string) => {
    onChange(
      items.map((entry, i) =>
        i === index
          ? {
              ...entry,
              url,
              mediaType: inferGalleryMediaType(url),
              fileName: fileNameFromGalleryUrl(url) || entry.fileName,
            }
          : entry,
      ),
    );
  };

  const handleBulkComplete = (urls: string[]) => {
    const newItems = urls.map((url) => createGalleryItem(url));
    onChange([...items, ...newItems]);
    setUploadMode(null);
  };

  const handleRemove = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(items.filter((_, i) => i !== index));
  };

  const handleReplaceFromManage = (itemId: string) => {
    openUploadForItem(itemId, true);
  };

  const singleUploadItemId = uploadMode?.type === "single" ? uploadMode.itemId : null;
  const singleUploadIndex = singleUploadItemId ? items.findIndex((item) => item.id === singleUploadItemId) : -1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <HoverHint
            content="Adds one gallery slot and opens the upload dialog. Photos appear in homepage order — first slot shows first."
            side="bottom"
            className="inline-flex"
          >
            <Button type="button" variant="secondary" size="sm" onClick={handleAddPhoto}>
              <Plus className="mr-1.5 h-4 w-4" aria-hidden />
              Add photo
            </Button>
          </HoverHint>
          <HoverHint
            content="Pick several files at once and rename each before uploading. Fastest way to populate a new gallery."
            side="bottom"
            className="inline-flex"
          >
            <Button type="button" variant="secondary" size="sm" onClick={handleBulkUpload}>
              <Upload className="mr-1.5 h-4 w-4" aria-hidden />
              Upload multiple
            </Button>
          </HoverHint>
          {items.length > 0 ? (
            <HoverHint
              content="Rename files, replace images, reorder with arrows, or remove items in one focused view."
              side="bottom"
              className="inline-flex"
            >
              <Button type="button" variant="ghost" size="sm" onClick={() => setManageOpen(true)}>
                <ArrowUpDown className="mr-1.5 h-4 w-4" aria-hidden />
                Arrange &amp; edit
              </Button>
            </HoverHint>
          ) : null}
        </div>
        {items.length > 0 ? (
          <HoverHint
            content="Drag thumbnails to change homepage order. You can also reorder inside Arrange & edit."
            side="bottom"
            className="inline-flex text-xs text-(--gym-muted)"
          >
            <span>
              {items.length} item{items.length === 1 ? "" : "s"} · drag to reorder
            </span>
          </HoverHint>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-(--gym-border) px-4 py-10 text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-(--gym-muted)" aria-hidden />
          <p className="mt-2 text-sm text-(--gym-muted)">
            No gallery photos yet. Add one photo or upload several at once.
          </p>
        </div>
      ) : (
        <div className="max-h-[min(420px,50vh)] overflow-y-auto rounded-xl border border-(--gym-border) bg-black/20 p-2 sm:p-3">
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {items.map((item, index) => (
              <li key={item.id}>
                <div
                  draggable
                  onDragStart={handleDragStart(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver(index)}
                  onDrop={handleDrop(index)}
                  onClick={() => handleTileClick(item)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleTileClick(item);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Gallery item ${index + 1}${item.url ? "" : ", upload photo"}`}
                  className={cn(
                    "group relative aspect-square cursor-grab overflow-hidden rounded-lg border border-(--gym-border) transition hover:border-(--gym-muted) active:cursor-grabbing",
                    dragIndex === index && "opacity-40",
                    overIndex === index && dragIndex !== index && "border-(--gym-accent)",
                  )}
                >
                  {item.url ? (
                    item.mediaType === "video" ? (
                      <video
                        src={item.url}
                        className="pointer-events-none h-full w-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                        draggable={false}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt=""
                        className="pointer-events-none h-full w-full object-cover"
                        draggable={false}
                      />
                    )
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-1 bg-black/40 text-(--gym-muted)">
                      <Upload className="h-5 w-5" aria-hidden />
                      <span className="text-[10px] font-medium">Upload</span>
                    </div>
                  )}

                  <span className="pointer-events-none absolute top-1 left-1 z-10 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {index + 1}
                  </span>

                  <button
                    type="button"
                    onClick={(event) => handleRemove(index, event)}
                    className="absolute top-1 right-1 z-20 rounded-full bg-black/70 p-0.5 text-white opacity-100 transition hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label={`Remove gallery item ${index + 1}`}
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>

                  {item.mediaType === "video" && item.url ? (
                    <Film
                      className="pointer-events-none absolute right-1 bottom-1 z-10 h-3.5 w-3.5 text-white drop-shadow"
                      aria-hidden
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {manageOpen ? (
        <GalleryManageModal
          items={items}
          gymSlug={gymSlug}
          onChange={onChange}
          onClose={() => setManageOpen(false)}
          onReplace={handleReplaceFromManage}
        />
      ) : null}

      {uploadMode?.type === "single" && singleUploadIndex >= 0 ? (
        <ImageUploadModal
          assetType="gallery"
          title={
            items[singleUploadIndex]?.url
              ? `Replace gallery photo ${singleUploadIndex + 1}`
              : `Upload gallery photo ${singleUploadIndex + 1}`
          }
          autoOpenFilePicker={uploadMode.autoOpen}
          onClose={() => handleUploadModalClose(uploadMode.itemId)}
          onComplete={(url) => {
            handleUrlUpdate(singleUploadIndex, url);
            setUploadMode(null);
          }}
        />
      ) : null}

      {uploadMode?.type === "bulk" ? (
        <ImageUploadModal
          assetType="gallery"
          title="Upload multiple gallery photos"
          allowMultiple
          autoOpenFilePicker
          onClose={() => setUploadMode(null)}
          onComplete={(url) => handleBulkComplete([url])}
          onBulkComplete={handleBulkComplete}
        />
      ) : null}
    </div>
  );
};

export const createGalleryItem = (url = "", fileName?: string): GalleryItem => ({
  id: crypto.randomUUID(),
  url,
  mediaType: url ? inferGalleryMediaType(url) : "image",
  fileName: fileName ?? (url ? fileNameFromGalleryUrl(url) : undefined),
});

export const galleryItemsFromConfig = (
  items: { id: string; url: string; mediaType?: GalleryMediaType; fileName?: string }[],
): GalleryItem[] =>
  items.map((item) => ({
    id: item.id,
    url: item.url,
    mediaType: item.mediaType ?? inferGalleryMediaType(item.url),
    fileName: item.fileName ?? (fileNameFromGalleryUrl(item.url) || undefined),
  }));
