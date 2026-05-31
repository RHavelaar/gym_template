"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import type { GalleryMediaType } from "@/config/types";
import { renameGalleryAssetAction } from "@/app/actions/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GalleryItem } from "@/components/admin/settings/gallery-image-list";
import { fileExtensionFromGalleryUrl, isRenamableGalleryAssetUrl, resolveGalleryFileName } from "@/lib/gallery-media";
import { assetFileNameWasAdjusted, normalizeAssetFileName } from "@/lib/validation/content";

type GalleryManageModalProps = {
  items: GalleryItem[];
  gymSlug: string;
  onChange: (items: GalleryItem[]) => void;
  onClose: () => void;
  onReplace: (itemId: string) => void;
};

const mediaTypeLabel: Record<GalleryMediaType, string> = {
  image: "Photo",
  gif: "GIF",
  video: "Video",
};

const reorderItems = (items: GalleryItem[], fromIndex: number, toIndex: number) => {
  if (fromIndex === toIndex) return items;
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

export const GalleryManageModal = ({ items, gymSlug, onChange, onClose, onReplace }: GalleryManageModalProps) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [nameDrafts, setNameDrafts] = useState<Record<string, string>>({});
  const [nameErrors, setNameErrors] = useState<Record<string, string>>({});
  const [nameAdjusted, setNameAdjusted] = useState<Record<string, string>>({});
  const [renamingId, setRenamingId] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
  }, []);

  const handleClose = () => {
    dialogRef.current?.close();
    onClose();
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    onChange(reorderItems(items, index, target));
  };

  const handleRemove = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    onChange(next);
    if (next.length === 0) handleClose();
  };

  const getDraftName = (item: GalleryItem) => nameDrafts[item.id] ?? resolveGalleryFileName(item);

  const handleNameChange = (itemId: string, value: string) => {
    setNameDrafts((prev) => ({ ...prev, [itemId]: value }));
    setNameErrors((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
    setNameAdjusted((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const handleNameCommit = async (item: GalleryItem, index: number) => {
    const raw = getDraftName(item);
    const normalized = normalizeAssetFileName(raw);
    const current = resolveGalleryFileName(item);

    if (raw.trim() !== normalized) {
      setNameDrafts((prev) => ({ ...prev, [item.id]: normalized }));
    }

    if (assetFileNameWasAdjusted(raw, normalized)) {
      setNameAdjusted((prev) => ({
        ...prev,
        [item.id]: `Adjusted to ${normalized}`,
      }));
    }

    if (normalized === current) {
      setNameDrafts((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
      return;
    }

    if (!item.url.trim()) {
      onChange(items.map((entry, i) => (i === index ? { ...entry, fileName: normalized } : entry)));
      setNameDrafts((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
      return;
    }

    setRenamingId(item.id);
    setNameErrors((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });

    try {
      const result = await renameGalleryAssetAction({
        currentUrl: item.url,
        fileName: normalized,
      });
      if (!result.ok) {
        setNameErrors((prev) => ({
          ...prev,
          [item.id]: result.error.message,
        }));
        return;
      }
      onChange(
        items.map((entry, i) =>
          i === index
            ? {
                ...entry,
                url: result.data!.url,
                fileName: result.data!.fileName,
              }
            : entry,
        ),
      );
      setNameDrafts((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    } catch (error) {
      setNameErrors((prev) => ({
        ...prev,
        [item.id]: error instanceof Error ? error.message : "Could not rename file.",
      }));
    } finally {
      setRenamingId(null);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby={titleId}
      className="fixed inset-0 z-100 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-black/70"
    >
      <div className="flex min-h-full items-end justify-center p-4 sm:items-center">
        <button
          type="button"
          className="fixed inset-0 cursor-default"
          aria-label="Close gallery manager"
          onClick={handleClose}
        />

        <div
          role="document"
          className="max-h-90vh relative z-10 flex w-full max-w-lg flex-col rounded-xl border border-(--gym-border) bg-(--gym-surface) shadow-2xl"
        >
          <div className="shrink-0 border-b border-(--gym-border) p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id={titleId} className="text-lg font-bold text-white">
                  Arrange &amp; edit gallery
                </h2>
                <p className="mt-1 text-sm text-(--gym-muted)">
                  Reorder with arrows, rename files, replace, or remove.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-2 text-(--gym-muted) transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto p-5">
            {items.length === 0 ? (
              <p className="text-sm text-(--gym-muted)">No gallery photos yet.</p>
            ) : (
              <ul className="space-y-3">
                {items.map((item, index) => {
                  const ext = item.url ? fileExtensionFromGalleryUrl(item.url) : "jpg";
                  const canRenameInStorage = !item.url || isRenamableGalleryAssetUrl(item.url, gymSlug);
                  const isRenaming = renamingId === item.id;

                  return (
                    <li key={item.id} className="rounded-lg border border-(--gym-border) bg-black/20 p-3">
                      <div className="flex gap-3">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-(--gym-border) bg-black/40">
                          {item.url ? (
                            item.mediaType === "video" ? (
                              <video
                                src={item.url}
                                className="h-full w-full object-cover"
                                muted
                                playsInline
                                preload="metadata"
                              />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.url} alt="" className="h-full w-full object-cover" />
                            )
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-(--gym-muted)">
                              Empty
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white">
                            Photo {index + 1}
                            <span className="ml-2 text-xs font-normal text-(--gym-muted)">
                              {mediaTypeLabel[item.mediaType]}
                            </span>
                          </p>

                          <div className="mt-2">
                            <Label htmlFor={`gallery-name-${item.id}`} className="text-xs">
                              File name
                            </Label>
                            <div className="mt-1 flex items-center gap-1">
                              <Input
                                id={`gallery-name-${item.id}`}
                                value={getDraftName(item)}
                                disabled={isRenaming}
                                onChange={(event) => handleNameChange(item.id, event.target.value)}
                                onBlur={() => void handleNameCommit(item, index)}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") {
                                    event.preventDefault();
                                    void handleNameCommit(item, index);
                                  }
                                }}
                                placeholder="gym-floor-squats"
                                className="h-9"
                              />
                              {item.url ? <span className="shrink-0 text-xs text-(--gym-muted)">.{ext}</span> : null}
                            </div>
                            {nameErrors[item.id] ? (
                              <p className="mt-1 text-xs text-red-400">{nameErrors[item.id]}</p>
                            ) : nameAdjusted[item.id] ? (
                              <p className="mt-1 text-xs text-(--gym-accent)">{nameAdjusted[item.id]}</p>
                            ) : (
                              <p className="mt-1 text-xs text-(--gym-muted)">
                                {canRenameInStorage
                                  ? "Invalid characters are auto-formatted on save."
                                  : "External link — name is a label only."}
                              </p>
                            )}
                          </div>

                          <div className="mt-2 flex flex-wrap gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={index === 0}
                              onClick={() => handleMove(index, -1)}
                              aria-label={`Move photo ${index + 1} earlier`}
                            >
                              <ChevronUp className="h-4 w-4" aria-hidden />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={index === items.length - 1}
                              onClick={() => handleMove(index, 1)}
                              aria-label={`Move photo ${index + 1} later`}
                            >
                              <ChevronDown className="h-4 w-4" aria-hidden />
                            </Button>
                            <Button type="button" variant="secondary" size="sm" onClick={() => onReplace(item.id)}>
                              {item.url ? "Replace" : "Upload"}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300"
                              onClick={() => handleRemove(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="shrink-0 border-t border-(--gym-border) p-4">
            <Button type="button" className="w-full sm:w-auto" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  );
};
