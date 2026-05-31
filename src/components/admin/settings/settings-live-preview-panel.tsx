"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Maximize2, X } from "lucide-react";
import type { HeroViewport } from "@/components/homepage/hero-banner";
import { PreviewDeviceFrame } from "@/components/admin/settings/preview-device-frame";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SettingsPreviewDevice = HeroViewport;

type SettingsLivePreviewPanelProps = {
  title?: string;
  helperText?: string;
  device: SettingsPreviewDevice;
  onDeviceChange: (device: SettingsPreviewDevice) => void;
  showDeviceToggle?: boolean;
  toolbar?: ReactNode;
  headerActions?: ReactNode;
  preview: ReactNode;
  fullscreenPreview?: ReactNode;
  showFullscreen?: boolean;
  useMobileFrame?: boolean;
  previewContainerClassName?: string;
  fullscreenTitle?: string;
  fullscreenDescription?: string;
};

export const SettingsLivePreviewPanel = ({
  title = "Live preview",
  helperText,
  device,
  onDeviceChange,
  showDeviceToggle = true,
  toolbar,
  headerActions,
  preview,
  fullscreenPreview,
  showFullscreen = true,
  useMobileFrame = true,
  previewContainerClassName,
  fullscreenTitle,
  fullscreenDescription,
}: SettingsLivePreviewPanelProps) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (fullscreenOpen && !dialog.open) dialog.showModal();
    if (!fullscreenOpen && dialog.open) dialog.close();
  }, [fullscreenOpen]);

  const handleCloseFullscreen = () => setFullscreenOpen(false);

  const resolvedFullscreen = fullscreenPreview ?? preview;
  const resolvedFullscreenTitle = fullscreenTitle ?? `${title} — ${device}`;
  const resolvedFullscreenDescription = fullscreenDescription ?? "Full-size preview with unsaved changes applied";

  const previewBody =
    device === "mobile" && useMobileFrame ? (
      <PreviewDeviceFrame
        label="Mobile preview"
        variant="mobile"
        expandLabel="Open full-size mobile preview"
        onExpand={showFullscreen ? () => setFullscreenOpen(true) : undefined}
      >
        <div className="h-full w-full">{preview}</div>
      </PreviewDeviceFrame>
    ) : (
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-(--gym-border) bg-black",
          previewContainerClassName ?? "aspect-16/10 lg:aspect-4/3",
        )}
      >
        {preview}
      </div>
    );

  return (
    <>
      <div className="space-y-3 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold tracking-widest text-(--gym-muted) uppercase">{title}</p>
          <div className="flex flex-wrap items-center gap-2">
            {headerActions}
            {showFullscreen ? (
              <button
                type="button"
                onClick={() => setFullscreenOpen(true)}
                className="rounded-md border border-white/15 bg-black/50 p-1.5 text-white transition hover:bg-black/70"
                aria-label="Open full-size preview"
              >
                <Maximize2 className="h-3.5 w-3.5" aria-hidden />
              </button>
            ) : null}
          </div>
        </div>

        {showDeviceToggle || toolbar ? (
          <div className="flex flex-wrap gap-2">
            {showDeviceToggle ? (
              <div
                className="inline-flex rounded-lg border border-(--gym-border) p-0.5"
                role="group"
                aria-label="Preview device"
              >
                {(["desktop", "mobile"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onDeviceChange(option)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase transition",
                      device === option
                        ? "bg-(--gym-accent) text-(--gym-accent-fg)"
                        : "text-(--gym-muted) hover:text-white",
                    )}
                    aria-pressed={device === option}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : null}
            {toolbar}
          </div>
        ) : null}

        {helperText ? <p className="text-[10px] text-(--gym-muted)">{helperText}</p> : null}

        {previewBody}
      </div>

      {showFullscreen ? (
        <dialog
          ref={dialogRef}
          onClose={handleCloseFullscreen}
          aria-labelledby={titleId}
          className="fixed inset-0 z-100 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-black/85"
        >
          <div className="flex min-h-full flex-col bg-(--gym-bg)">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-(--gym-border) bg-(--gym-surface) px-4 py-3 sm:px-6">
              <div>
                <h2 id={titleId} className="text-sm font-bold tracking-wide text-white uppercase">
                  {resolvedFullscreenTitle}
                </h2>
                <p className="text-xs text-(--gym-muted)">{resolvedFullscreenDescription}</p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={handleCloseFullscreen}>
                <X className="mr-1.5 h-4 w-4" aria-hidden />
                Close
              </Button>
            </div>
            <div className="flex flex-1 justify-center overflow-hidden p-4">
              {device === "mobile" ? (
                <div className="w-full max-w-[430px]">{resolvedFullscreen}</div>
              ) : (
                <div className="h-80vh w-full max-w-6xl">{resolvedFullscreen}</div>
              )}
            </div>
          </div>
        </dialog>
      ) : null}
    </>
  );
};

/** Re-export iframe live preview — same route/postMessage channel as brand settings. */
export { BrandLivePreviewFrame as SettingsLivePreviewFrame } from "@/components/admin/settings/brand-live-preview-frame";
