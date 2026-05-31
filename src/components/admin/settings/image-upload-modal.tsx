"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ImageIcon, Trash2, Upload, X } from "lucide-react";
import { uploadGymAssetAction } from "@/app/actions/content";
import { MediaLibraryPanel } from "@/components/admin/settings/media-library-panel";
import { ImageUploadGuidelines } from "@/components/admin/settings/image-upload-guidelines";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useErrorToast } from "@/lib/errors/show-error-toast";
import { cn } from "@/lib/utils";
import {
  ALLOWED_GALLERY_FORMATS_LABEL,
  ALLOWED_IMAGE_FORMATS_LABEL,
  ASSET_UPLOAD_SPECS,
  getAssetTooLargeError,
  MAX_ASSET_SIZE_LABEL,
  MAX_GALLERY_VIDEO_SIZE_LABEL,
  assetFileNameWasAdjusted,
  normalizeAssetFileName,
  type GymAssetType,
} from "@/lib/validation/content";

const ACCEPT_BY_TYPE: Record<GymAssetType, string> = {
  hero: "image/jpeg,image/png,image/webp,image/svg+xml",
  logo: "image/jpeg,image/png,image/webp,image/svg+xml",
  gallery: "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime",
  og: "image/jpeg,image/png,image/webp,image/svg+xml",
  favicon: "image/jpeg,image/png,image/webp,image/svg+xml",
  font: "font/woff2,font/woff,font/ttf,application/font-woff2,application/font-woff,application/x-font-ttf",
};

type ImageUploadModalProps = {
  onClose: () => void;
  assetType: GymAssetType;
  currentUrl?: string;
  onComplete: (url: string) => void;
  onBulkComplete?: (urls: string[]) => void;
  title?: string;
  /** Open the file picker as soon as the dialog appears. */
  autoOpenFilePicker?: boolean;
  /** Allow selecting multiple files with per-file rename before upload. */
  allowMultiple?: boolean;
};

type ModalTab = "upload" | "library";

type PendingBulkFile = {
  id: string;
  file: File;
  fileName: string;
  previewUrl: string;
};

const defaultNameFromFile = (fileName: string) => normalizeAssetFileName(fileName.replace(/\.[^.]+$/, ""));

const isAcceptedFile = (file: File, accept: string) => accept.split(",").includes(file.type);

export const ImageUploadModal = ({
  onClose,
  assetType,
  currentUrl,
  onComplete,
  onBulkComplete,
  title = "Upload image",
  autoOpenFilePicker = false,
  allowMultiple = false,
}: ImageUploadModalProps) => {
  const spec = ASSET_UPLOAD_SPECS[assetType];
  const accept = ACCEPT_BY_TYPE[assetType];
  const formatsLabel = assetType === "gallery" ? ALLOWED_GALLERY_FORMATS_LABEL : ALLOWED_IMAGE_FORMATS_LABEL;
  const maxSizeLabel =
    assetType === "gallery"
      ? `${MAX_ASSET_SIZE_LABEL} images · ${MAX_GALLERY_VIDEO_SIZE_LABEL} video`
      : MAX_ASSET_SIZE_LABEL;
  const dialogTitleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const autoOpenedRef = useRef(false);

  const [tab, setTab] = useState<ModalTab>("upload");
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [bulkQueue, setBulkQueue] = useState<PendingBulkFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState("");
  const { showError } = useErrorToast();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
  }, []);

  useEffect(() => {
    if (!autoOpenFilePicker || autoOpenedRef.current || tab !== "upload") return;
    if (pendingFile || bulkQueue.length > 0) return;

    autoOpenedRef.current = true;
    const timer = window.setTimeout(() => fileInputRef.current?.click(), 100);
    return () => window.clearTimeout(timer);
  }, [autoOpenFilePicker, tab, pendingFile, bulkQueue.length]);

  const handleClose = () => {
    for (const entry of bulkQueue) {
      if (entry.previewUrl.startsWith("blob:")) URL.revokeObjectURL(entry.previewUrl);
    }
    dialogRef.current?.close();
    onClose();
  };

  const handleSelectLibraryAsset = (url: string) => {
    onComplete(url);
    handleClose();
  };

  const invalidTypeMessage =
    assetType === "gallery" ? "Use JPEG, PNG, WebP, GIF, MP4, or WebM." : "Use JPEG, PNG, WebP, or SVG.";

  const handlePickFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const validFiles = fileArray.filter((file) => isAcceptedFile(file, accept));
    if (validFiles.length === 0) {
      setError(invalidTypeMessage);
      return;
    }

    for (const file of validFiles) {
      const sizeError = getAssetTooLargeError(file, assetType);
      if (sizeError) {
        setError(sizeError);
        return;
      }
    }

    if (validFiles.length < fileArray.length) {
      setError(`Skipped ${fileArray.length - validFiles.length} unsupported file(s).`);
    } else {
      setError("");
    }

    if (allowMultiple && validFiles.length > 1) {
      setPendingFile(null);
      setFileName("");
      setBulkQueue((prev) => [
        ...prev,
        ...validFiles.map((file) => ({
          id: crypto.randomUUID(),
          file,
          fileName: defaultNameFromFile(file.name),
          previewUrl: URL.createObjectURL(file),
        })),
      ]);
      return;
    }

    const file = validFiles[0];
    if (!file) return;

    if (allowMultiple) {
      setPendingFile(null);
      setFileName("");
      setBulkQueue((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          file,
          fileName: defaultNameFromFile(file.name),
          previewUrl: URL.createObjectURL(file),
        },
      ]);
      return;
    }

    setBulkQueue([]);
    setPendingFile(file);
    setFileName(defaultNameFromFile(file.name));
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSingleFileNameBlur = () => {
    const normalized = normalizeAssetFileName(fileName);
    if (fileName !== normalized) setFileName(normalized);
  };

  const handleBulkFileNameBlur = (id: string) => {
    setBulkQueue((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;
        const normalized = normalizeAssetFileName(entry.fileName);
        return normalized === entry.fileName ? entry : { ...entry, fileName: normalized };
      }),
    );
  };

  const handleConfirmUpload = async () => {
    if (!pendingFile) return;

    const safeName = normalizeAssetFileName(fileName);
    if (fileName !== safeName) setFileName(safeName);

    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.set("assetType", assetType);
      formData.set("file", pendingFile);
      formData.set("fileName", safeName);
      const result = await uploadGymAssetAction(formData);
      if (!result.ok) {
        showError(result.error);
        setError(result.error.message);
        return;
      }
      onComplete(result.data!.url);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmBulkUpload = async () => {
    if (bulkQueue.length === 0) return;

    const normalizedQueue = bulkQueue.map((entry) => ({
      ...entry,
      fileName: normalizeAssetFileName(entry.fileName),
    }));
    setBulkQueue(normalizedQueue);

    setUploading(true);
    setError("");
    const urls: string[] = [];

    try {
      for (let index = 0; index < normalizedQueue.length; index += 1) {
        const entry = normalizedQueue[index];
        setUploadProgress(`Uploading ${index + 1} of ${normalizedQueue.length}…`);

        const formData = new FormData();
        formData.set("assetType", assetType);
        formData.set("file", entry.file);
        formData.set("fileName", entry.fileName);
        const result = await uploadGymAssetAction(formData);
        if (!result.ok) {
          showError(result.error);
          setError(result.error.message);
          return;
        }
        urls.push(result.data!.url);
      }

      if (urls.length === 1) {
        onComplete(urls[0]);
      } else {
        onBulkComplete?.(urls);
      }
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const handleCancelPending = () => {
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPendingFile(null);
    setFileName("");
    setPreviewUrl(currentUrl ?? null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveBulkEntry = (id: string) => {
    setBulkQueue((prev) => {
      const entry = prev.find((item) => item.id === id);
      if (entry?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(entry.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleBulkFileNameChange = (id: string, value: string) => {
    setBulkQueue((prev) => prev.map((entry) => (entry.id === id ? { ...entry, fileName: value } : entry)));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files?.length) handlePickFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const files = event.dataTransfer.files;
    if (files?.length) handlePickFiles(files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
  };

  const handleBrowse = () => fileInputRef.current?.click();

  const showBulkQueue = allowMultiple && bulkQueue.length > 0;
  const bulkTitle =
    allowMultiple && !currentUrl ? (title.includes("multiple") ? title : "Upload multiple photos") : title;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby={dialogTitleId}
      className="fixed inset-0 z-100 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-black/70"
    >
      <div className="flex min-h-full items-end justify-center p-4 sm:items-center">
        <button
          type="button"
          className="fixed inset-0 cursor-default"
          aria-label="Close upload dialog"
          onClick={handleClose}
        />

        <div
          role="document"
          className="max-h-90vh relative z-10 flex w-full max-w-lg flex-col rounded-xl border border-(--gym-border) bg-(--gym-surface) shadow-2xl"
        >
          <div className="shrink-0 border-b border-(--gym-border) p-5 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id={dialogTitleId} className="text-lg font-bold text-white">
                  {bulkTitle}
                </h2>
                <p className="mt-1 text-sm text-(--gym-muted)">
                  {allowMultiple
                    ? "Add one or many files, rename each, then upload to your library."
                    : "Upload a new file or pick from your media library."}
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

            {!allowMultiple ? (
              <div className="mt-4 flex gap-2">
                {(
                  [
                    ["upload", "Upload new"],
                    ["library", "Media library"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setTab(key);
                      setError("");
                    }}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium transition",
                      tab === key
                        ? "bg-(--gym-primary) text-(--gym-primary-fg)"
                        : "bg-black/30 text-(--gym-muted) hover:text-white",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null}

            <ImageUploadGuidelines assetType={assetType} className="mt-4" />
          </div>

          <div className="overflow-y-auto p-5">
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple={allowMultiple}
              className="hidden"
              onChange={handleFileChange}
            />

            {tab === "library" && !allowMultiple ? (
              <MediaLibraryPanel selectedUrl={previewUrl ?? undefined} onSelect={handleSelectLibraryAsset} />
            ) : showBulkQueue ? (
              <div className="space-y-4">
                <p className="text-sm text-(--gym-muted)">
                  {bulkQueue.length} file{bulkQueue.length === 1 ? "" : "s"} ready — rename before uploading.
                </p>
                <ul className="max-h-[min(360px,45vh)] space-y-3 overflow-y-auto pr-1">
                  {bulkQueue.map((entry, index) => (
                    <li key={entry.id} className="flex gap-3 rounded-lg border border-(--gym-border) bg-black/20 p-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-(--gym-border) bg-black/40">
                        {entry.file.type.startsWith("video/") ? (
                          <video
                            src={entry.previewUrl}
                            className="h-full w-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={entry.previewUrl} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <Label htmlFor={`bulk-name-${entry.id}`} className="text-xs">
                          Photo {index + 1} name
                        </Label>
                        <Input
                          id={`bulk-name-${entry.id}`}
                          value={entry.fileName}
                          disabled={uploading}
                          onChange={(e) => handleBulkFileNameChange(entry.id, e.target.value)}
                          onBlur={() => handleBulkFileNameBlur(entry.id)}
                          placeholder="gym-floor-lift"
                        />
                        <p className="truncate text-xs text-(--gym-muted)">{entry.file.name}</p>
                      </div>
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => handleRemoveBulkEntry(entry.id)}
                        className="shrink-0 self-start rounded p-2 text-(--gym-muted) transition hover:bg-white/10 hover:text-red-400"
                        aria-label={`Remove ${entry.file.name}`}
                      >
                        <Trash2 size={16} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" disabled={uploading} onClick={handleConfirmBulkUpload}>
                    {uploading
                      ? uploadProgress || "Uploading…"
                      : `Upload ${bulkQueue.length} file${bulkQueue.length === 1 ? "" : "s"}`}
                  </Button>
                  <Button type="button" variant="secondary" size="sm" disabled={uploading} onClick={handleBrowse}>
                    Add more files
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {previewUrl && !allowMultiple ? (
                  <div className="mb-4 overflow-hidden rounded-lg border border-(--gym-border) bg-black/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Selected preview"
                      className="max-h-40 w-full object-contain"
                      onError={() => setError("Could not load image preview.")}
                    />
                  </div>
                ) : !allowMultiple ? (
                  <div className="mb-4 flex h-28 items-center justify-center rounded-lg border border-dashed border-(--gym-border) bg-black/20 text-(--gym-muted)">
                    <ImageIcon size={32} aria-hidden />
                  </div>
                ) : null}

                {pendingFile && !allowMultiple ? (
                  <div className="space-y-4 rounded-lg border border-(--gym-border) bg-black/20 p-4">
                    <div>
                      <Label htmlFor="asset-file-name">File name</Label>
                      <Input
                        id="asset-file-name"
                        value={fileName}
                        disabled={uploading}
                        onChange={(e) => setFileName(e.target.value)}
                        onBlur={handleSingleFileNameBlur}
                        placeholder="hero-gym-floor"
                        className="mt-1"
                      />
                      <p className="mt-1 text-xs text-(--gym-muted)">
                        {assetFileNameWasAdjusted(fileName) ? (
                          <>
                            Adjusted to{" "}
                            <span className="text-white">
                              {normalizeAssetFileName(fileName)}.{pendingFile.name.split(".").pop()}
                            </span>
                          </>
                        ) : (
                          <>
                            Saved as{" "}
                            <span className="text-white">
                              {normalizeAssetFileName(fileName)}.{pendingFile.name.split(".").pop()}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" disabled={uploading} onClick={handleConfirmUpload}>
                        {uploading ? "Uploading…" : "Save to library"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={uploading}
                        onClick={handleCancelPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={cn(
                      "rounded-lg border-2 border-dashed p-6 text-center transition",
                      dragging ? "border-(--gym-accent) bg-(--gym-accent)/10" : "border-(--gym-border) bg-black/20",
                    )}
                  >
                    <Upload className="mx-auto text-(--gym-muted)" size={28} aria-hidden />
                    <p className="mt-2 text-sm font-medium text-white">
                      {allowMultiple ? "Drag and drop photos here" : "Drag and drop an image here"}
                    </p>
                    <p className="mt-1 text-xs text-(--gym-muted)">
                      {formatsLabel} · max {maxSizeLabel} · {spec.dimensions}
                    </p>
                    <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={handleBrowse}>
                      {allowMultiple ? "Choose files" : "Choose from file manager"}
                    </Button>
                  </div>
                )}
              </>
            )}

            {error ? <p className="mt-3 text-sm leading-relaxed text-red-400">{error}</p> : null}
          </div>
        </div>
      </div>
    </dialog>
  );
};
