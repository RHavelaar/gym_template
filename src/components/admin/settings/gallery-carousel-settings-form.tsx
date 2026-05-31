"use client";

import type { GalleryCarouselSettings } from "@/config/types";
import { FieldLabelWithHint, HoverHint, SettingSectionTitle } from "@/components/ui/info-hint";
import { cn } from "@/lib/utils";

type GalleryDisplaySettingsProps = {
  settings: GalleryCarouselSettings;
  onChange: (settings: GalleryCarouselSettings) => void;
};

const SLIDES_VISIBLE_OPTIONS: {
  value: 1 | 3 | 5;
  label: string;
  hint: string;
}[] = [
  {
    value: 1,
    label: "1",
    hint: "One photo at a time — best for dramatic, full-width shots.",
  },
  {
    value: 3,
    label: "3",
    hint: "Recommended default — balanced on phones and desktops.",
  },
  {
    value: 5,
    label: "5",
    hint: "Wide strip of thumbnails — use when you have many similar photos.",
  },
];

const QUICK_TOGGLES: {
  key: keyof Pick<GalleryCarouselSettings, "enabled" | "autoplay" | "showDots" | "showArrows">;
  label: string;
  hint: string;
}[] = [
  {
    key: "enabled",
    label: "Slideshow",
    hint: "Turn on to rotate photos automatically. Off shows a static grid — good when you have lots of images.",
  },
  {
    key: "autoplay",
    label: "Autoplay",
    hint: "Advance slides without visitor interaction. Pair with 5–8 second intervals for a natural pace.",
  },
  {
    key: "showArrows",
    label: "Arrows",
    hint: "Previous/next controls so visitors can browse manually. Recommended when autoplay is off.",
  },
  {
    key: "showDots",
    label: "Dots",
    hint: "Small indicators showing which slide is active. Helpful when you have more than a few photos.",
  },
];

const MORE_OPTIONS: {
  key: keyof Pick<GalleryCarouselSettings, "loop" | "pauseOnHover" | "kenBurns">;
  label: string;
  hint: string;
}[] = [
  {
    key: "loop",
    label: "Loop continuously",
    hint: "After the last slide, jump back to the first. Keeps the carousel feeling endless.",
  },
  {
    key: "pauseOnHover",
    label: "Pause on hover",
    hint: "Stops autoplay while a visitor hovers (desktop). Lets them read a photo without it changing.",
  },
  {
    key: "kenBurns",
    label: "Ken Burns zoom on photos",
    hint: "Slow zoom on still images. Works best on calm, wide shots — skip for busy action photos.",
  },
];

export const GalleryDisplaySettings = ({ settings, onChange }: GalleryDisplaySettingsProps) => {
  const handleToggle = (key: keyof GalleryCarouselSettings) => {
    onChange({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="space-y-5 border-t border-(--gym-border) pt-5">
      <SettingSectionTitle
        title="How it displays"
        hint="These settings control the homepage gallery section visitors see below your hero. Changes save automatically and appear in the live preview."
        description="Control slideshow behavior on your homepage gallery section."
      />

      <div className="flex flex-wrap gap-2">
        {QUICK_TOGGLES.map(({ key, label, hint }) => (
          <HoverHint key={key} content={hint} side="bottom" className="inline-flex">
            <button
              type="button"
              onClick={() => handleToggle(key)}
              disabled={key !== "enabled" && !settings.enabled}
              className={cn(
                "min-h-10 rounded-full border px-4 text-sm font-medium transition",
                settings[key]
                  ? "border-(--gym-accent) bg-(--gym-accent)/15 text-white"
                  : "border-(--gym-border) text-(--gym-muted) hover:border-(--gym-muted)",
                key !== "enabled" && !settings.enabled && "cursor-not-allowed opacity-40",
              )}
            >
              {label}
            </button>
          </HoverHint>
        ))}
      </div>

      {settings.enabled ? (
        <>
          <div>
            <FieldLabelWithHint
              hint="How many photos appear side-by-side in the carousel. Start with 3 unless you prefer a single hero-style image."
              hintLabel="About photos visible at once"
            >
              Photos visible at once
            </FieldLabelWithHint>
            <div
              className="mt-2 inline-flex rounded-lg border border-(--gym-border) p-1"
              role="group"
              aria-label="Photos visible at once"
            >
              {SLIDES_VISIBLE_OPTIONS.map(({ value, label, hint }) => (
                <HoverHint key={value} content={hint} side="bottom" className="inline-flex">
                  <button
                    type="button"
                    onClick={() => onChange({ ...settings, slidesVisible: value })}
                    className={cn(
                      "min-w-12 rounded-md px-4 py-2 text-sm font-semibold transition",
                      settings.slidesVisible === value
                        ? "bg-(--gym-primary) text-white"
                        : "text-(--gym-muted) hover:text-white",
                    )}
                  >
                    {label}
                  </button>
                </HoverHint>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabelWithHint
                htmlFor="gallery-interval"
                hint="Seconds each slide stays on screen before advancing. Recommended: 5–8 seconds for gym photos so visitors can take them in."
                hintLabel="About autoplay speed"
              >
                Autoplay speed (seconds)
              </FieldLabelWithHint>
              <input
                id="gallery-interval"
                type="range"
                min={2}
                max={30}
                step={1}
                value={settings.intervalSeconds}
                disabled={!settings.autoplay}
                onChange={(e) => onChange({ ...settings, intervalSeconds: Number(e.target.value) })}
                className="mt-2 w-full accent-(--gym-accent) disabled:opacity-40"
              />
              <p className="mt-1 text-xs text-(--gym-muted)">
                {settings.intervalSeconds}s between slides
                {!settings.autoplay ? " · enable Autoplay to use this" : ""}
              </p>
            </div>
            <div>
              <FieldLabelWithHint
                htmlFor="gallery-transition"
                hint="How long the fade between slides takes. Recommended: 400–800 ms — fast enough to feel snappy, slow enough to avoid jarring cuts."
                hintLabel="About transition speed"
              >
                Transition (ms)
              </FieldLabelWithHint>
              <input
                id="gallery-transition"
                type="range"
                min={200}
                max={2000}
                step={100}
                value={settings.transitionDurationMs}
                onChange={(e) => onChange({ ...settings, transitionDurationMs: Number(e.target.value) })}
                className="mt-2 w-full accent-(--gym-accent)"
              />
              <p className="mt-1 text-xs text-(--gym-muted)">{settings.transitionDurationMs}ms fade</p>
            </div>
          </div>

          <details className="rounded-lg border border-(--gym-border) bg-black/20">
            <HoverHint
              as="summary"
              content="Fine-tune looping, hover behavior, and motion effects. Most gyms can leave defaults here."
              side="bottom"
              className="flex cursor-pointer list-none items-center px-4 py-3 text-sm font-medium text-neutral-200 [&::-webkit-details-marker]:hidden"
            >
              More options
            </HoverHint>
            <div className="space-y-2 border-t border-(--gym-border) px-4 py-3">
              {MORE_OPTIONS.map(({ key, label, hint }) => (
                <HoverHint
                  key={key}
                  content={hint}
                  side="top"
                  className="flex w-full cursor-pointer items-start gap-2 text-sm"
                  as="label"
                >
                  <>
                    <input
                      type="checkbox"
                      checked={Boolean(settings[key])}
                      onChange={() => handleToggle(key)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-(--gym-accent)"
                    />
                    <span>{label}</span>
                  </>
                </HoverHint>
              ))}
            </div>
          </details>
        </>
      ) : (
        <p className="text-sm text-(--gym-muted)">
          Slideshow is off — gallery photos appear in a static grid on the homepage. Turn on Slideshow above for a
          rotating carousel.
        </p>
      )}
    </div>
  );
};
