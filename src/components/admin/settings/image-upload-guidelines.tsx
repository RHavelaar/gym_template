"use client";

import { useState } from "react";
import { CircleHelp } from "lucide-react";
import { ImageRequirementsDetailsModal } from "@/components/admin/settings/image-requirements-details-modal";
import type { GymAssetType } from "@/lib/validation/content";
import {
  ALLOWED_GALLERY_FORMATS_LABEL,
  ALLOWED_IMAGE_FORMATS_LABEL,
  ASSET_UPLOAD_SPECS,
  MAX_ASSET_SIZE_LABEL,
  MAX_GALLERY_VIDEO_SIZE_LABEL,
} from "@/lib/validation/content";
import { cn } from "@/lib/utils";

type ImageUploadGuidelinesProps = {
  assetType: GymAssetType;
  className?: string;
};

export const ImageUploadGuidelines = ({ assetType, className }: ImageUploadGuidelinesProps) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const spec = ASSET_UPLOAD_SPECS[assetType];

  return (
    <>
      <div className={cn("rounded-lg border border-(--gym-border) bg-black/20 p-3", className)}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-neutral-300">Image requirements</p>
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-(--gym-accent) transition hover:bg-(--gym-accent)/10"
            aria-label="View detailed image requirements"
          >
            <CircleHelp size={14} aria-hidden />
            Details
          </button>
        </div>
        <ul className="mt-1.5 space-y-0.5 text-xs text-(--gym-muted)">
          <li>
            <span className="text-neutral-400">Max size: </span>
            {assetType === "gallery"
              ? `${MAX_ASSET_SIZE_LABEL} photos · ${MAX_GALLERY_VIDEO_SIZE_LABEL} video`
              : MAX_ASSET_SIZE_LABEL}
          </li>
          {assetType === "gallery" ? (
            <li>
              <span className="text-neutral-400">Formats: </span>
              {ALLOWED_GALLERY_FORMATS_LABEL}
            </li>
          ) : (
            <li>
              <span className="text-neutral-400">Formats: </span>
              {ALLOWED_IMAGE_FORMATS_LABEL}
            </li>
          )}
          <li>
            <span className="text-neutral-400">Dimensions: </span>
            {spec.dimensions}
            <span className="text-(--gym-muted)"> · {spec.aspectRatio} aspect</span>
          </li>
        </ul>
      </div>

      {detailsOpen ? (
        <ImageRequirementsDetailsModal assetType={assetType} onClose={() => setDetailsOpen(false)} />
      ) : null}
    </>
  );
};
