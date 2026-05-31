"use client";

import type { HeroSectionProps } from "@/config/types";
import {
  HERO_LAYOUT_OPTIONS,
  HERO_OVERLAY_DIRECTION_OPTIONS,
  HERO_OVERLAY_STYLE_OPTIONS,
  HERO_TEXT_SIZE_OPTIONS,
} from "@/lib/hero-settings";
import { ASSET_UPLOAD_SPECS } from "@/lib/validation/content";
import { ImageUploadField } from "@/components/admin/settings/image-upload-field";
import { HeroLayoutToggle } from "@/components/admin/settings/hero-layout-toggle";
import { HoverHint, SettingSectionTitle } from "@/components/ui/info-hint";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type HeroOverlaySettingsFormProps = {
  value: HeroSectionProps;
  onChange: (next: HeroSectionProps) => void;
  heroImageUrl?: string;
  onHeroImageUploaded?: (url: string) => void;
  onEditTextButtons?: () => void;
  saveError?: string;
};

const ToggleRow = ({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <label htmlFor={id} className="flex items-center justify-between gap-3 text-sm">
    <span>{label}</span>
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="h-4 w-4 rounded border-(--gym-border)"
    />
  </label>
);

const SliderRow = ({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between gap-3 text-sm">
      <Label htmlFor={id}>{label}</Label>
      <span className="text-(--gym-muted)">{value}%</span>
    </div>
    <input
      id={id}
      type="range"
      min={0}
      max={100}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full accent-(--gym-accent)"
    />
  </div>
);

export const HeroOverlaySettingsForm = ({
  value,
  onChange,
  heroImageUrl,
  onHeroImageUploaded,
  onEditTextButtons,
  saveError,
}: HeroOverlaySettingsFormProps) => {
  const patch = (partial: Partial<HeroSectionProps>) => onChange({ ...value, ...partial });

  const mobileLayoutHint = HERO_LAYOUT_OPTIONS.find((option) => option.value === value.layout)?.hint ?? "";
  const desktopLayoutHint = HERO_LAYOUT_OPTIONS.find((option) => option.value === value.layoutDesktop)?.hint ?? "";

  return (
    <div className="space-y-6">
      <SettingSectionTitle
        title="Hero layout"
        size="md"
        hint="Background photo, layout, headline sizes, and optional overlay — use the live preview to see changes as you go."
      />

      {saveError ? (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{saveError}</p>
      ) : null}

      {onHeroImageUploaded || onEditTextButtons ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-(--gym-border) pb-5">
          {onHeroImageUploaded ? (
            <ImageUploadField
              label="Hero background image"
              assetType="hero"
              currentUrl={heroImageUrl}
              onUploaded={onHeroImageUploaded}
              showPreview={false}
              replaceLabel="Replace background"
              uploadLabel="Upload background"
              hoverHint={
                <>
                  {ASSET_UPLOAD_SPECS.hero.hint}{" "}
                  <span className="text-neutral-400">
                    Recommended: {ASSET_UPLOAD_SPECS.hero.dimensions} ({ASSET_UPLOAD_SPECS.hero.aspectRatio}).
                  </span>
                </>
              }
            />
          ) : null}
          {onEditTextButtons ? (
            <Button type="button" variant="secondary" size="sm" onClick={onEditTextButtons}>
              Edit text &amp; buttons
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-5">
        <HeroLayoutToggle label="Mobile layout" value={value.layout} onChange={(layout) => patch({ layout })} />
        {mobileLayoutHint ? <p className="-mt-3 text-xs text-(--gym-muted)">{mobileLayoutHint}</p> : null}

        <HeroLayoutToggle
          label="Desktop layout"
          value={value.layoutDesktop}
          onChange={(layoutDesktop) => patch({ layoutDesktop })}
        />
        {desktopLayoutHint ? <p className="-mt-3 text-xs text-(--gym-muted)">{desktopLayoutHint}</p> : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="hero-headline-size">Headline size</Label>
            <select
              id="hero-headline-size"
              value={value.headlineSize}
              onChange={(event) => patch({ headlineSize: event.target.value as HeroSectionProps["headlineSize"] })}
              className="w-full rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3 py-2 text-sm text-white"
            >
              {HERO_TEXT_SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-subheadline-size">Description size</Label>
            <select
              id="hero-subheadline-size"
              value={value.subheadlineSize}
              onChange={(event) =>
                patch({
                  subheadlineSize: event.target.value as HeroSectionProps["subheadlineSize"],
                })
              }
              className="w-full rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3 py-2 text-sm text-white"
            >
              {HERO_TEXT_SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <details className="rounded-lg border border-(--gym-border) bg-(--gym-bg)/40">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold tracking-wide text-white uppercase [&::-webkit-details-marker]:hidden">
          <HoverHint
            content="Optional darkening over your photo so text stays readable."
            side="bottom"
            className="inline-flex"
          >
            <span>Overlay &amp; film</span>
          </HoverHint>
        </summary>
        <div className="space-y-4 border-t border-(--gym-border) px-4 py-4">
          <ToggleRow
            id="hero-overlay-enabled"
            label="Overlay / film enabled"
            checked={value.overlayEnabled}
            onChange={(overlayEnabled) => patch({ overlayEnabled })}
          />

          <SliderRow
            id="hero-image-opacity"
            label="Background image opacity"
            value={value.imageOpacity}
            onChange={(imageOpacity) => patch({ imageOpacity })}
          />

          {value.overlayEnabled ? (
            <>
              <SliderRow
                id="hero-overlay-opacity"
                label="Overlay strength"
                value={value.overlayOpacity}
                onChange={(overlayOpacity) => patch({ overlayOpacity })}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hero-overlay-direction">Overlay direction</Label>
                  <select
                    id="hero-overlay-direction"
                    value={value.overlayDirection}
                    onChange={(event) =>
                      patch({
                        overlayDirection: event.target.value as HeroSectionProps["overlayDirection"],
                      })
                    }
                    className="w-full rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3 py-2 text-sm text-white"
                  >
                    {HERO_OVERLAY_DIRECTION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero-overlay-style">Overlay style</Label>
                  <select
                    id="hero-overlay-style"
                    value={value.overlayStyle}
                    onChange={(event) =>
                      patch({
                        overlayStyle: event.target.value as HeroSectionProps["overlayStyle"],
                      })
                    }
                    className="w-full rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3 py-2 text-sm text-white"
                  >
                    {HERO_OVERLAY_STYLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero-overlay-color">Overlay color (optional)</Label>
                <div className="flex items-center gap-3">
                  <input
                    id="hero-overlay-color"
                    type="color"
                    value={value.overlayColor.trim() || "#0a0a0a"}
                    onChange={(event) => patch({ overlayColor: event.target.value })}
                    className="h-10 w-14 cursor-pointer rounded border border-(--gym-border) bg-transparent"
                  />
                  <button
                    type="button"
                    className="text-xs text-(--gym-muted) underline hover:text-white"
                    onClick={() => patch({ overlayColor: "" })}
                  >
                    Reset to theme
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </details>
    </div>
  );
};
