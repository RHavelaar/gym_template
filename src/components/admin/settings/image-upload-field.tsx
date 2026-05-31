"use client";

import { useState, type ReactNode } from "react";
import { ImageIcon } from "lucide-react";
import { ImageUploadModal } from "@/components/admin/settings/image-upload-modal";
import { Button } from "@/components/ui/button";
import { FieldLabelWithHint, HoverHint } from "@/components/ui/info-hint";
import { Label } from "@/components/ui/label";
import type { GymAssetType } from "@/lib/validation/content";
import { cn } from "@/lib/utils";

type ImageUploadFieldProps = {
  label: string;
  assetType: GymAssetType;
  currentUrl?: string;
  onUploaded: (url: string) => void;
  /** Visible field guidance (preferred over hover-only) */
  hint?: ReactNode;
  recommendation?: ReactNode;
  usedFor?: string;
  /** Shown when hovering the preview/upload area */
  hoverHint?: ReactNode;
  /** Compact layout for gallery grids */
  compact?: boolean;
  /** Show the inline image preview above the upload button (default true) */
  showPreview?: boolean;
  /** Override button label when an image is already set */
  replaceLabel?: string;
  /** Override button label when no image is set */
  uploadLabel?: string;
  /** Open the upload dialog immediately when mounted. */
  defaultOpen?: boolean;
  onModalClose?: () => void;
};

export const ImageUploadField = ({
  label,
  assetType,
  currentUrl,
  onUploaded,
  hint,
  recommendation,
  usedFor,
  hoverHint,
  compact = false,
  showPreview = true,
  replaceLabel = "Replace image",
  uploadLabel = "Upload image",
  defaultOpen = false,
  onModalClose,
}: ImageUploadFieldProps) => {
  const [modalOpen, setModalOpen] = useState(defaultOpen);

  const handleCloseModal = () => {
    setModalOpen(false);
    onModalClose?.();
  };

  const buttonLabel = currentUrl ? replaceLabel : uploadLabel;

  const uploadButton = (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className={showPreview ? "w-full sm:w-auto" : undefined}
      onClick={() => setModalOpen(true)}
    >
      {buttonLabel}
    </Button>
  );

  const uploadBody = showPreview ? (
    <>
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-(--gym-border) bg-black/30",
          compact ? "aspect-4/3" : "aspect-video",
        )}
      >
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentUrl} alt={`${label} preview`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-(--gym-muted)">
            <ImageIcon size={compact ? 24 : 32} aria-hidden />
            <span className="text-xs">No image set</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">{uploadButton}</div>
    </>
  ) : (
    uploadButton
  );

  const wrappedUploadBody =
    hoverHint && !hint ? (
      <HoverHint content={hoverHint} side="bottom" className={showPreview ? "block w-full" : "inline-flex"}>
        {showPreview ? <div className="space-y-3">{uploadBody}</div> : uploadBody}
      </HoverHint>
    ) : (
      uploadBody
    );

  return (
    <>
      <div className={cn("space-y-3", compact && "space-y-2", !showPreview && "space-y-0")}>
        {hint ? (
          <FieldLabelWithHint hint={hint} hintLabel={`About ${label}`}>
            {label}
          </FieldLabelWithHint>
        ) : (
          <Label className={showPreview ? undefined : "sr-only"}>{label}</Label>
        )}

        {usedFor ? (
          <p className="text-xs text-(--gym-muted)">
            <span className="text-neutral-400">Shows on:</span> {usedFor}
          </p>
        ) : null}

        {recommendation ? (
          <p className="text-xs text-(--gym-muted)">
            <span className="text-neutral-400">Recommended:</span> {recommendation}
          </p>
        ) : null}

        {wrappedUploadBody}
      </div>

      {modalOpen ? (
        <ImageUploadModal
          onClose={handleCloseModal}
          assetType={assetType}
          currentUrl={currentUrl}
          title={currentUrl ? `Replace ${label.toLowerCase()}` : `Upload ${label.toLowerCase()}`}
          autoOpenFilePicker={!currentUrl}
          onComplete={(url) => {
            onUploaded(url);
            handleCloseModal();
          }}
        />
      ) : null}
    </>
  );
};
