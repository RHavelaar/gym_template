"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Film } from "lucide-react";
import type { GalleryCarouselSettings, GalleryMediaItem } from "@/config/types";
import { cn } from "@/lib/utils";

type GalleryCarouselProps = {
  items: GalleryMediaItem[];
  settings: GalleryCarouselSettings;
  /** Admin previews use native img/video for faster bundles. */
  variant?: "public" | "admin";
};

const SWIPE_THRESHOLD = 48;
const SLIDE_ASPECT = "aspect-16/10 sm:aspect-video";

const getMaxStartIndex = (count: number, slidesVisible: number, loop: boolean) => {
  if (count <= slidesVisible) return 0;
  if (loop) return count - 1;
  return count - slidesVisible;
};

const getVisibleIndices = (activeIndex: number, count: number, slidesVisible: number, loop: boolean): number[] => {
  if (count === 0) return [];

  if (slidesVisible === 1) {
    return [((activeIndex % count) + count) % count];
  }

  const indices: number[] = [];
  for (let offset = 0; offset < slidesVisible; offset += 1) {
    const index = activeIndex + offset;
    if (index < count) {
      indices.push(index);
    } else if (loop) {
      indices.push(index % count);
    }
  }
  return indices;
};

const getPageCount = (count: number, slidesVisible: number, loop: boolean) => {
  if (count <= 1) return count;
  if (slidesVisible === 1) return count;
  if (loop) return count;
  return Math.max(1, count - slidesVisible + 1);
};

export const GalleryCarousel = ({ items, settings, variant = "public" }: GalleryCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const count = items.length;
  const slidesVisible = settings.slidesVisible ?? 1;
  const maxStartIndex = getMaxStartIndex(count, slidesVisible, settings.loop);
  const effectiveIndex = Math.min(activeIndex, maxStartIndex);
  const isMultiSlide = slidesVisible > 1;

  const visibleIndices = useMemo(
    () => getVisibleIndices(effectiveIndex, count, slidesVisible, settings.loop),
    [effectiveIndex, count, slidesVisible, settings.loop],
  );

  const pageCount = getPageCount(count, slidesVisible, settings.loop);

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      if (settings.loop && slidesVisible === 1) {
        setActiveIndex(((index % count) + count) % count);
        return;
      }
      setActiveIndex(Math.max(0, Math.min(maxStartIndex, index)));
    },
    [count, maxStartIndex, settings.loop, slidesVisible],
  );

  const goNext = useCallback(() => {
    if (count <= slidesVisible && !settings.loop) return;
    if (effectiveIndex >= maxStartIndex) {
      if (settings.loop) goTo(0);
      return;
    }
    goTo(effectiveIndex + 1);
  }, [count, effectiveIndex, goTo, maxStartIndex, settings.loop, slidesVisible]);

  const goPrev = useCallback(() => {
    if (effectiveIndex <= 0) {
      if (settings.loop) goTo(maxStartIndex);
      return;
    }
    goTo(effectiveIndex - 1);
  }, [effectiveIndex, goTo, maxStartIndex, settings.loop]);

  useEffect(() => {
    if (!settings.autoplay || count <= slidesVisible || paused) return;
    const timer = window.setInterval(goNext, settings.intervalSeconds * 1000);
    return () => window.clearInterval(timer);
  }, [settings.autoplay, settings.intervalSeconds, count, slidesVisible, paused, goNext]);

  useEffect(() => {
    const activeRefKeys = new Set(
      visibleIndices.map((itemIndex, slotIndex) => `slot-${slotIndex}-${items[itemIndex]?.id}`),
    );

    for (const [refKey, video] of videoRefs.current) {
      if (!activeRefKeys.has(refKey)) {
        video.pause();
        video.currentTime = 0;
      }
    }

    for (const [refKey, video] of videoRefs.current) {
      if (activeRefKeys.has(refKey)) {
        void video.play().catch(() => undefined);
      }
    }
  }, [visibleIndices, items]);

  const handleTouchStart = (event: React.TouchEvent) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
    setTouchStartX(null);
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) goNext();
    else goPrev();
  };

  if (count === 0) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-(--gym-border) px-4 py-8 text-center text-sm text-(--gym-muted)">
        Add photos in Site Settings → Gallery to populate this section.
      </p>
    );
  }

  const transitionMs = settings.transitionDurationMs;
  const canNavigate = count > slidesVisible || (settings.loop && count > 1);

  const renderMedia = (item: GalleryMediaItem, isPrimary: boolean, refKey: string) => {
    const kenBurnsClass = settings.kenBurns && isPrimary && item.mediaType !== "video" ? "animate-ken-burns" : "";

    if (item.mediaType === "video") {
      return (
        <video
          ref={(node) => {
            if (node) videoRefs.current.set(refKey, node);
            else videoRefs.current.delete(refKey);
          }}
          src={item.url}
          className={cn("h-full w-full object-cover", kenBurnsClass)}
          muted
          playsInline
          loop
          preload="metadata"
        />
      );
    }

    if (variant === "admin") {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.url} alt="" className={cn("h-full w-full object-cover", kenBurnsClass)} />
      );
    }

    return (
      <Image
        src={item.url}
        alt=""
        fill
        className={cn("object-cover", kenBurnsClass)}
        unoptimized={item.url.startsWith("data:") || item.mediaType === "gif"}
      />
    );
  };

  return (
    <div
      className="relative mt-4"
      onMouseEnter={() => settings.pauseOnHover && setPaused(true)}
      onMouseLeave={() => settings.pauseOnHover && setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="Homepage gallery"
    >
      <div className="relative">
        <div
          className={cn(
            "flex items-stretch transition-opacity ease-in-out",
            isMultiSlide ? "gap-2 sm:gap-3 md:gap-4" : "gap-0",
          )}
          style={{ transitionDuration: `${transitionMs}ms` }}
        >
          {visibleIndices.map((itemIndex, slotIndex) => {
            const item = items[itemIndex];
            if (!item) return null;
            const isPrimary = slotIndex === 0;
            const refKey = `slot-${slotIndex}-${item.id}`;

            return (
              <div
                key={refKey}
                className={cn(
                  "relative min-w-0 overflow-hidden rounded-xl border border-(--gym-border) bg-black shadow-sm",
                  isMultiSlide ? cn("flex-1", SLIDE_ASPECT) : cn("w-full", SLIDE_ASPECT),
                )}
                aria-hidden={!isPrimary && !isMultiSlide}
              >
                {renderMedia(item, isPrimary, refKey)}
                {item.mediaType === "video" && (
                  <span className="absolute right-2 bottom-2 rounded bg-black/60 p-1 text-white">
                    <Film className="h-3.5 w-3.5" aria-hidden />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {settings.showArrows && canNavigate ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              disabled={!settings.loop && effectiveIndex === 0}
              className="absolute top-1/2 -left-1 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2 text-white backdrop-blur transition hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-30 sm:left-2"
              aria-label="Previous"
            >
              <ChevronLeft size={22} aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!settings.loop && effectiveIndex >= maxStartIndex}
              className="absolute top-1/2 -right-1 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2 text-white backdrop-blur transition hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-30 sm:right-2"
              aria-label="Next"
            >
              <ChevronRight size={22} aria-hidden />
            </button>
          </>
        ) : null}
      </div>

      {settings.showDots && canNavigate ? (
        <div className="mt-3 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Gallery navigation">
          {Array.from({ length: pageCount }, (_, pageIndex) => (
            <button
              key={pageIndex}
              type="button"
              role="tab"
              aria-selected={pageIndex === effectiveIndex}
              aria-label={`Go to position ${pageIndex + 1}`}
              onClick={() => goTo(pageIndex)}
              className={cn(
                "h-2.5 rounded-full transition-all",
                pageIndex === effectiveIndex
                  ? "w-8 bg-(--gym-accent)"
                  : "w-2.5 bg-(--gym-border) hover:bg-(--gym-muted)",
              )}
            />
          ))}
        </div>
      ) : null}

      <p className="mt-2 text-center text-xs text-(--gym-muted)">
        {isMultiSlide ? `Showing ${visibleIndices.length} of ${count}` : `${effectiveIndex + 1} / ${count}`}
      </p>
    </div>
  );
};
