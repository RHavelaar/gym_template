"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import type { GymAssetType } from "@/lib/validation/content";
import { ASSET_UPLOAD_SPECS, MAX_ASSET_SIZE_LABEL, MAX_GALLERY_VIDEO_SIZE_LABEL } from "@/lib/validation/content";

type ImageRequirementsDetailsModalProps = {
  assetType: GymAssetType;
  onClose: () => void;
};

const FORMAT_GUIDE = [
  {
    name: "JPEG (.jpg)",
    bestFor: "Gym photos, action shots, and busy images with lots of color.",
    notes: "Smallest file size for photos. Slight quality loss when compressed, but ideal for hero and gallery photos.",
    recommended: true,
  },
  {
    name: "WebP (.webp)",
    bestFor: "Modern web photos when you want quality and smaller files.",
    notes: "Great all-around choice for the web. Use when exporting from design tools or photo editors.",
    recommended: true,
  },
  {
    name: "PNG (.png)",
    bestFor: "Graphics with sharp edges, text overlays, or transparent backgrounds.",
    notes: "Lossless quality but larger files. Avoid for full-size gym photos unless you need transparency.",
    recommended: false,
  },
  {
    name: "SVG (.svg)",
    bestFor: "Logos and simple icons only — not photos.",
    notes: "Scales to any size without getting blurry. Perfect for logos; do not use for gallery or hero photos.",
    recommended: false,
  },
] as const;

const USAGE_TIPS: Record<GymAssetType, string[]> = {
  hero: [
    "Use a wide, high-quality photo that reads well behind white text.",
    "Avoid busy patterns in the center — that is where your headline sits.",
    "Export at least 1920 px wide so it stays sharp on large screens.",
  ],
  gallery: [
    "Pick clear, well-lit photos that show your gym floor, equipment, or community.",
    "Keep a similar style across images so the grid looks cohesive.",
    "Landscape orientation works best; images are cropped to a 4:3 frame.",
  ],
  logo: [
    "Upload a clean logo on a solid or transparent background.",
    "SVG is best if you have it; otherwise use a high-res PNG.",
    "Simple marks work better than detailed artwork at small sizes.",
  ],
  og: [
    "Use a bold image with your logo or gym photo — text in the image is optional.",
    "Keep important content centered; edges may be cropped on some platforms.",
    "1200×630 px is the standard for Facebook, LinkedIn, and iMessage previews.",
  ],
  favicon: [
    "Use a simplified version of your logo — fine details disappear at 32×32.",
    "PNG with transparency or solid background both work.",
    "Apple touch icon should be 180×180 with padding if your mark is thin.",
  ],
  font: [
    "Only upload fonts you have a license to use on the web.",
    "WOFF2 gives the best compression and broad browser support.",
    "Name the font clearly — it appears in your heading/body font pickers.",
  ],
};

export const ImageRequirementsDetailsModal = ({ assetType, onClose }: ImageRequirementsDetailsModalProps) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const spec = ASSET_UPLOAD_SPECS[assetType];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
  }, []);

  const handleClose = () => {
    dialogRef.current?.close();
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby={titleId}
      className="fixed inset-0 z-110 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-black/80"
    >
      <div className="flex min-h-full items-end justify-center p-4 sm:items-center">
        <button
          type="button"
          className="fixed inset-0 cursor-default"
          aria-label="Close details"
          onClick={handleClose}
        />

        <div
          role="document"
          className="max-h-85vh relative z-10 w-full max-w-md overflow-y-auto rounded-xl border border-(--gym-border) bg-(--gym-surface) p-5 shadow-2xl"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 id={titleId} className="text-lg font-bold text-white">
                Image guide
              </h2>
              <p className="mt-1 text-sm text-(--gym-muted)">What to upload and which format to choose.</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg p-2 text-(--gym-muted) hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <section className="mb-5 space-y-2">
            <h3 className="text-sm font-semibold text-white">For this image</h3>
            <ul className="space-y-1 text-sm text-(--gym-muted)">
              <li>
                <span className="text-neutral-400">Recommended size: </span>
                {spec.dimensions} ({spec.aspectRatio} aspect ratio)
              </li>
              <li>
                <span className="text-neutral-400">Max file size: </span>
                {assetType === "gallery"
                  ? `${MAX_ASSET_SIZE_LABEL} (photos) · ${MAX_GALLERY_VIDEO_SIZE_LABEL} (video)`
                  : MAX_ASSET_SIZE_LABEL}
              </li>
            </ul>
            <p className="text-sm text-neutral-300">{spec.hint}</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-(--gym-muted)">
              {USAGE_TIPS[assetType].map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>

          <section className="mb-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">File formats</h3>
            {FORMAT_GUIDE.map((format) => (
              <div key={format.name} className="rounded-lg border border-(--gym-border) bg-black/20 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-white">{format.name}</p>
                  {format.recommended ? (
                    <span className="rounded bg-(--gym-accent)/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-(--gym-accent) uppercase">
                      Recommended
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-neutral-300">{format.bestFor}</p>
                <p className="mt-1 text-xs text-(--gym-muted)">{format.notes}</p>
              </div>
            ))}
          </section>

          <section className="rounded-lg border border-(--gym-border) bg-black/20 p-3">
            <h3 className="text-sm font-semibold text-white">Quick checklist</h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-(--gym-muted)">
              <li>Start with the recommended dimensions — larger is fine; tiny images will look blurry.</li>
              <li>
                Name files clearly (e.g. hero-main-floor, gallery-squat-racks) so you can find them in the library.
              </li>
              <li>
                Compress photos before upload if they are over {MAX_ASSET_SIZE_LABEL} — most photo apps have an “export
                for web” option.
              </li>
              <li>When in doubt, use JPEG or WebP for photos and SVG or PNG for logos.</li>
            </ul>
          </section>
        </div>
      </div>
    </dialog>
  );
};
