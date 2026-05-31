"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import type { GymConfig, HeroSectionProps } from "@/config/types";
import { PageLinkPicker } from "@/components/admin/settings/page-link-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type HeroTextButtonsModalProps = {
  open: boolean;
  config: GymConfig;
  value: HeroSectionProps;
  fieldErrors?: Record<string, string>;
  onChange: (next: HeroSectionProps) => void;
  onClose: () => void;
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

const ColorField = ({
  id,
  label,
  value,
  fallback,
  onChange,
  onReset,
}: {
  id: string;
  label: string;
  value: string;
  fallback: string;
  onChange: (value: string) => void;
  onReset: () => void;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="color"
        value={value.trim() || fallback}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-12 cursor-pointer rounded border border-(--gym-border) bg-transparent"
      />
      <button type="button" className="text-xs text-(--gym-muted) underline hover:text-white" onClick={onReset}>
        Theme
      </button>
    </div>
  </div>
);

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="mt-1 text-xs text-red-400">{message}</p> : null;

export const HeroTextButtonsModal = ({
  open,
  config,
  value,
  fieldErrors = {},
  onChange,
  onClose,
}: HeroTextButtonsModalProps) => {
  const dialogTitleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleClose = () => {
    dialogRef.current?.close();
    onClose();
  };

  const patch = (partial: Partial<HeroSectionProps>) => onChange({ ...value, ...partial });

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={dialogTitleId}
      className="fixed inset-0 z-100 m-0 flex max-h-none w-full max-w-none flex-col items-center justify-end bg-transparent p-0 backdrop:bg-black/85 open:flex sm:justify-center"
      onClose={handleClose}
    >
      <div className="max-h-90vh flex w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-(--gym-border) bg-(--gym-surface) shadow-xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-(--gym-border) bg-(--gym-surface) px-4 py-3 sm:px-6">
          <div>
            <h2 id={dialogTitleId} className="text-lg font-bold uppercase">
              Edit text &amp; buttons
            </h2>
            <p className="text-sm text-(--gym-muted)">Headline, description, CTAs, and colors</p>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" aria-hidden />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {hasFieldErrors ? (
          <div className="border-b border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 sm:px-6">
            Fix the highlighted fields before your changes can save.
          </div>
        ) : null}

        <div className="space-y-6 overflow-y-auto px-4 py-5 sm:px-6">
          <section className="space-y-3">
            <h3 className="text-xs font-semibold tracking-widest text-(--gym-muted) uppercase">Copy</h3>
            <ToggleRow
              id="hero-show-tagline"
              label="Show tagline"
              checked={value.showTagline}
              onChange={(showTagline) => patch({ showTagline })}
            />
            {value.showTagline ? (
              <div>
                <Label htmlFor="hero-tagline">Tagline</Label>
                <Input
                  id="hero-tagline"
                  value={value.tagline}
                  onChange={(event) => patch({ tagline: event.target.value })}
                  placeholder={config.tagline}
                  aria-invalid={Boolean(fieldErrors.tagline)}
                  className={cn(fieldErrors.tagline && "border-red-500")}
                />
                <FieldError message={fieldErrors.tagline} />
              </div>
            ) : null}

            <ToggleRow
              id="hero-show-headline"
              label="Show headline"
              checked={value.showHeadline}
              onChange={(showHeadline) => patch({ showHeadline })}
            />
            {value.showHeadline ? (
              <div>
                <Label htmlFor="hero-headline">Headline</Label>
                <Input
                  id="hero-headline"
                  value={value.headline}
                  onChange={(event) => patch({ headline: event.target.value })}
                  aria-invalid={Boolean(fieldErrors.headline)}
                  className={cn(fieldErrors.headline && "border-red-500")}
                />
                <FieldError message={fieldErrors.headline} />
              </div>
            ) : null}

            <ToggleRow
              id="hero-show-subheadline"
              label="Show description"
              checked={value.showSubheadline}
              onChange={(showSubheadline) => patch({ showSubheadline })}
            />
            {value.showSubheadline ? (
              <div>
                <Label htmlFor="hero-subheadline">Description</Label>
                <textarea
                  id="hero-subheadline"
                  rows={3}
                  value={value.subheadline}
                  onChange={(event) => patch({ subheadline: event.target.value })}
                  aria-invalid={Boolean(fieldErrors.subheadline)}
                  className={cn(
                    "w-full rounded-lg border border-(--gym-border) bg-(--gym-bg) px-3 py-2 text-white",
                    fieldErrors.subheadline && "border-red-500",
                  )}
                />
                <FieldError message={fieldErrors.subheadline} />
              </div>
            ) : null}
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold tracking-widest text-(--gym-muted) uppercase">Primary button</h3>
            <ToggleRow
              id="hero-show-primary"
              label="Show primary button"
              checked={value.showPrimaryCta}
              onChange={(showPrimaryCta) => patch({ showPrimaryCta })}
            />
            {value.showPrimaryCta ? (
              <>
                <div>
                  <Label htmlFor="hero-primary-label">Button label</Label>
                  <Input
                    id="hero-primary-label"
                    value={value.ctaLabel}
                    onChange={(event) => patch({ ctaLabel: event.target.value })}
                    aria-invalid={Boolean(fieldErrors.ctaLabel)}
                    className={cn(fieldErrors.ctaLabel && "border-red-500")}
                  />
                  <FieldError message={fieldErrors.ctaLabel} />
                </div>
                <div>
                  <PageLinkPicker
                    id="hero-primary"
                    label="Link to page"
                    value={value.ctaHref}
                    config={config}
                    onChange={(ctaHref) => patch({ ctaHref })}
                  />
                  <FieldError message={fieldErrors.ctaHref} />
                </div>
              </>
            ) : null}
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold tracking-widest text-(--gym-muted) uppercase">Secondary button</h3>
            <ToggleRow
              id="hero-show-secondary"
              label="Show secondary button"
              checked={value.showSecondaryCta}
              onChange={(showSecondaryCta) => patch({ showSecondaryCta })}
            />
            {value.showSecondaryCta ? (
              <>
                <div>
                  <Label htmlFor="hero-secondary-label">Button label</Label>
                  <Input
                    id="hero-secondary-label"
                    value={value.secondaryCtaLabel}
                    onChange={(event) => patch({ secondaryCtaLabel: event.target.value })}
                    aria-invalid={Boolean(fieldErrors.secondaryCtaLabel)}
                    className={cn(fieldErrors.secondaryCtaLabel && "border-red-500")}
                  />
                  <FieldError message={fieldErrors.secondaryCtaLabel} />
                </div>
                <div>
                  <PageLinkPicker
                    id="hero-secondary"
                    label="Link to page"
                    value={value.secondaryCtaHref}
                    config={config}
                    onChange={(secondaryCtaHref) => patch({ secondaryCtaHref })}
                  />
                  <FieldError message={fieldErrors.secondaryCtaHref} />
                </div>
              </>
            ) : null}
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold tracking-widest text-(--gym-muted) uppercase">Colors</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField
                id="hero-tagline-color"
                label="Tagline"
                value={value.taglineColor}
                fallback={config.theme.accent}
                onChange={(taglineColor) => patch({ taglineColor })}
                onReset={() => patch({ taglineColor: "" })}
              />
              <ColorField
                id="hero-headline-color"
                label="Headline"
                value={value.headlineColor}
                fallback="#ffffff"
                onChange={(headlineColor) => patch({ headlineColor })}
                onReset={() => patch({ headlineColor: "" })}
              />
              <ColorField
                id="hero-subheadline-color"
                label="Description"
                value={value.subheadlineColor}
                fallback="#d4d4d4"
                onChange={(subheadlineColor) => patch({ subheadlineColor })}
                onReset={() => patch({ subheadlineColor: "" })}
              />
              <ColorField
                id="hero-primary-bg"
                label="Primary button bg"
                value={value.primaryCtaBg}
                fallback={config.theme.primary}
                onChange={(primaryCtaBg) => patch({ primaryCtaBg })}
                onReset={() => patch({ primaryCtaBg: "" })}
              />
              <ColorField
                id="hero-primary-text"
                label="Primary button text"
                value={value.primaryCtaText}
                fallback={config.theme.primaryForeground}
                onChange={(primaryCtaText) => patch({ primaryCtaText })}
                onReset={() => patch({ primaryCtaText: "" })}
              />
              <ColorField
                id="hero-secondary-bg"
                label="Secondary button bg"
                value={value.secondaryCtaBg}
                fallback={config.theme.surface}
                onChange={(secondaryCtaBg) => patch({ secondaryCtaBg })}
                onReset={() => patch({ secondaryCtaBg: "" })}
              />
              <ColorField
                id="hero-secondary-text"
                label="Secondary button text"
                value={value.secondaryCtaText}
                fallback="#ffffff"
                onChange={(secondaryCtaText) => patch({ secondaryCtaText })}
                onReset={() => patch({ secondaryCtaText: "" })}
              />
            </div>
          </section>
        </div>

        <div className="border-t border-(--gym-border) px-4 py-3 sm:px-6">
          <Button type="button" className="w-full sm:w-auto" onClick={handleClose}>
            Done
          </Button>
        </div>
      </div>
    </dialog>
  );
};
