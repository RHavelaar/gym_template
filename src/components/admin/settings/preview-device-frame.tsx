"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type PreviewDesktopFrame = "wide" | "content";

type PreviewDeviceFrameProps = {
  label: string;
  children: ReactNode;
  onExpand?: () => void;
  expandLabel: string;
  variant: "desktop" | "mobile";
  desktopFrame?: PreviewDesktopFrame;
  className?: string;
};

export const PreviewDeviceFrame = ({
  label,
  children,
  onExpand,
  expandLabel,
  variant,
  desktopFrame = "wide",
  className,
}: PreviewDeviceFrameProps) => (
  <div className={cn("flex w-full min-w-0 flex-col", className)}>
    <div className="mb-2 flex items-center justify-between gap-2">
      <p className="text-[10px] font-semibold tracking-widest text-(--gym-muted) uppercase">{label}</p>
      {onExpand ? (
        <button
          type="button"
          onClick={onExpand}
          className="rounded-md border border-white/15 bg-black/50 p-1 text-white transition hover:bg-black/70"
          aria-label={expandLabel}
        >
          <Maximize2 className="h-3.5 w-3.5" aria-hidden />
        </button>
      ) : null}
    </div>

    {variant === "mobile" ? (
      <div className="mx-auto w-full max-w-60">
        <div className="rounded-7 border-3 border-neutral-700 bg-neutral-900 p-1.5 shadow-xl">
          <div className="relative overflow-hidden rounded-[1.35rem] bg-black">
            <div className="pointer-events-none absolute top-1.5 left-1/2 z-20 h-4 w-16 -translate-x-1/2 rounded-full bg-black/90" />
            <div className="aspect-430/932 w-full overflow-hidden">
              <div className="h-full w-full">{children}</div>
            </div>
          </div>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-(--gym-muted)">iPhone 16 Pro Max</p>
      </div>
    ) : (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-lg border border-(--gym-border) bg-black",
          desktopFrame === "wide" ? "aspect-video" : "max-h-80 overflow-y-auto",
        )}
      >
        {children}
      </div>
    )}
  </div>
);

type DualDevicePreviewPane = {
  label: string;
  expandLabel: string;
  fullscreenTitle: string;
  fullscreenDescription: string;
  inline: ReactNode;
  fullscreen: ReactNode;
  desktopFrame?: PreviewDesktopFrame;
};

type DualDeviceSectionPreviewProps = {
  desktop: DualDevicePreviewPane;
  mobile: DualDevicePreviewPane;
};

export const DualDeviceSectionPreview = ({ desktop, mobile }: DualDeviceSectionPreviewProps) => {
  const [fullscreenMode, setFullscreenMode] = useState<"desktop" | "mobile" | null>(null);
  const desktopTitleId = useId();
  const mobileTitleId = useId();
  const desktopDialogRef = useRef<HTMLDialogElement>(null);
  const mobileDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const desktopDialog = desktopDialogRef.current;
    if (desktopDialog) {
      if (fullscreenMode === "desktop" && !desktopDialog.open) desktopDialog.showModal();
      if (fullscreenMode !== "desktop" && desktopDialog.open) desktopDialog.close();
    }
    const mobileDialog = mobileDialogRef.current;
    if (mobileDialog) {
      if (fullscreenMode === "mobile" && !mobileDialog.open) mobileDialog.showModal();
      if (fullscreenMode !== "mobile" && mobileDialog.open) mobileDialog.close();
    }
  }, [fullscreenMode]);

  const handleCloseFullscreen = () => setFullscreenMode(null);

  return (
    <>
      <div className="flex w-full flex-col gap-6">
        <PreviewDeviceFrame
          label={desktop.label}
          variant="desktop"
          desktopFrame={desktop.desktopFrame ?? "wide"}
          expandLabel={desktop.expandLabel}
          onExpand={() => setFullscreenMode("desktop")}
        >
          {desktop.inline}
        </PreviewDeviceFrame>

        <PreviewDeviceFrame
          label={mobile.label}
          variant="mobile"
          expandLabel={mobile.expandLabel}
          onExpand={() => setFullscreenMode("mobile")}
        >
          {mobile.inline}
        </PreviewDeviceFrame>
      </div>

      <dialog
        ref={desktopDialogRef}
        onClose={handleCloseFullscreen}
        aria-labelledby={desktopTitleId}
        className="fixed inset-0 z-100 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-black/85"
      >
        <div className="flex min-h-full flex-col bg-(--gym-bg)">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-(--gym-border) bg-(--gym-surface) px-4 py-3 sm:px-6">
            <div>
              <h2 id={desktopTitleId} className="text-sm font-bold tracking-wide text-white uppercase">
                {desktop.fullscreenTitle}
              </h2>
              <p className="text-xs text-(--gym-muted)">{desktop.fullscreenDescription}</p>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={handleCloseFullscreen}>
              <X className="mr-1.5 h-4 w-4" aria-hidden />
              Close
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">{desktop.fullscreen}</div>
        </div>
      </dialog>

      <dialog
        ref={mobileDialogRef}
        onClose={handleCloseFullscreen}
        aria-labelledby={mobileTitleId}
        className="fixed inset-0 z-100 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-black/85"
      >
        <div className="flex min-h-full flex-col bg-(--gym-bg)">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-(--gym-border) bg-(--gym-surface) px-4 py-3 sm:px-6">
            <div>
              <h2 id={mobileTitleId} className="text-sm font-bold tracking-wide text-white uppercase">
                {mobile.fullscreenTitle}
              </h2>
              <p className="text-xs text-(--gym-muted)">{mobile.fullscreenDescription}</p>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={handleCloseFullscreen}>
              <X className="mr-1.5 h-4 w-4" aria-hidden />
              Close
            </Button>
          </div>
          <div className="flex flex-1 justify-center overflow-y-auto px-4 py-6">
            <div className="w-full max-w-[430px]">{mobile.fullscreen}</div>
          </div>
        </div>
      </dialog>
    </>
  );
};
