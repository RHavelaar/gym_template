"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ArrowDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

type MobileGalleryPreviewHintProps = {
  visible: boolean;
  onDismiss: () => void;
  previewId?: string;
};

const subscribe = () => () => {};

const useIsClient = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

const scrollToPreview = (previewId: string) => {
  const target = document.getElementById(previewId);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  target.classList.add("ring-2", "ring-(--gym-accent)");
  window.setTimeout(() => {
    target.classList.remove("ring-2", "ring-(--gym-accent)");
  }, 1600);
};

export const MobileGalleryPreviewHint = ({
  visible,
  onDismiss,
  previewId = "preview-gallery",
}: MobileGalleryPreviewHintProps) => {
  const isClient = useIsClient();

  const handleScroll = () => {
    scrollToPreview(previewId);
    onDismiss();
  };

  const handleHideForSession = () => {
    suppressGalleryPreviewHintForSession();
    onDismiss();
  };

  if (!isClient) return null;

  return createPortal(
    <div
      className={cn(
        "fixed right-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-90 flex flex-col items-end gap-3 lg:hidden",
        "transition-[opacity,transform] duration-500 ease-out",
        visible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
      aria-hidden={!visible}
    >
      <div
        className={cn(
          "relative w-[min(13rem,calc(100vw-2rem))] rounded-xl border border-(--gym-border) bg-(--gym-surface) p-3 shadow-2xl shadow-black/60",
          visible && "animate-[gallery-hint-glow_2.4s_ease-in-out_infinite]",
        )}
      >
        <button
          type="button"
          onClick={onDismiss}
          tabIndex={visible ? 0 : -1}
          className="absolute top-2 right-2 rounded-md p-1 text-(--gym-muted) transition hover:bg-white/10 hover:text-white"
          aria-label="Dismiss preview hint"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>

        <p className="pr-6 text-[11px] font-bold tracking-[0.14em] text-(--gym-accent) uppercase">Live preview</p>
        <p className="mt-1 pr-2 text-xs leading-snug text-(--gym-muted)">
          Tap the arrow to scroll down and see your slideshow changes.
        </p>

        <button
          type="button"
          onClick={handleHideForSession}
          tabIndex={visible ? 0 : -1}
          className="mt-2.5 w-full rounded-md border border-(--gym-border) bg-black/25 px-2 py-1.5 text-[11px] font-medium text-(--gym-muted) transition hover:border-(--gym-muted) hover:text-white"
        >
          Don&apos;t show again this session
        </button>

        <span
          className="absolute right-6 -bottom-1.5 h-3 w-3 rotate-45 border-r border-b border-(--gym-border) bg-(--gym-surface)"
          aria-hidden
        />
      </div>

      <button
        type="button"
        onClick={handleScroll}
        tabIndex={visible ? 0 : -1}
        aria-label="Scroll to gallery live preview"
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-full",
          "border border-(--gym-accent)/60 bg-linear-to-b from-[#1a1a1a] to-(--gym-surface)",
          "shadow-lg shadow-black/50",
          visible && "animate-[gallery-hint-bob_1.6s_ease-in-out_infinite]",
        )}
      >
        <span className="absolute inset-0 animate-ping rounded-full border border-(--gym-accent)/30" aria-hidden />
        <span className="absolute inset-1 rounded-full bg-(--gym-accent)/10" aria-hidden />
        <ArrowDown className="relative h-7 w-7 text-(--gym-accent)" strokeWidth={2.75} aria-hidden />
      </button>
    </div>,
    document.body,
  );
};

export const isGalleryPreviewOnScreen = (previewId = "preview-gallery") => {
  if (typeof window === "undefined") return true;
  const target = document.getElementById(previewId);
  if (!target) return false;
  const rect = target.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.85 && rect.bottom > window.innerHeight * 0.15;
};

export const isMobileLayout = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 1023px)").matches;
};

/** How long the floating preview hint stays visible (ms). */
export const GALLERY_PREVIEW_HINT_DURATION_MS = 6500;

const GALLERY_PREVIEW_HINT_SESSION_KEY = "gym-gallery-preview-hint-hidden";

export const isGalleryPreviewHintSuppressed = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(GALLERY_PREVIEW_HINT_SESSION_KEY) === "1";
  } catch {
    return false;
  }
};

export const suppressGalleryPreviewHintForSession = (): void => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(GALLERY_PREVIEW_HINT_SESSION_KEY, "1");
  } catch {
    // sessionStorage unavailable — skip
  }
};
