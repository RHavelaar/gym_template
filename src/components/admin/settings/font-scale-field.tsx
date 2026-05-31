"use client";

import type { BrandFontScale } from "@/config/types";
import type { BrandScaleMeta } from "@/lib/brand-help";
import {
  buildFontSize,
  FONT_SIZE_UNITS,
  formatFontSizeSummary,
  parseFontSize,
  type FontSizeUnit,
} from "@/lib/font-size";
import { FieldLabelWithHint, InfoHint } from "@/components/ui/info-hint";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type FontScaleFieldProps = {
  meta: BrandScaleMeta;
  value: string;
  bodyFontFamily: string;
  onChange: (value: string) => void;
  error?: string;
};

export const FontScaleField = ({ meta, value, bodyFontFamily, onChange, error }: FontScaleFieldProps) => {
  const parsed = parseFontSize(value);
  const amount = parsed?.amount ?? 1;
  const unit = parsed?.unit ?? "rem";
  const valid = parsed !== null;
  const summary = valid ? formatFontSizeSummary(value) : "Enter a size like 16px, 1rem, or 0.875em";

  const handleAmountChange = (raw: string) => {
    const next = Number.parseFloat(raw);
    if (Number.isNaN(next) || next <= 0) return;
    onChange(buildFontSize(next, unit));
  };

  const handleUnitChange = (nextUnit: FontSizeUnit) => {
    onChange(buildFontSize(amount, nextUnit));
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-(--gym-border) bg-black/20 p-3",
        (!valid && value.trim()) || error ? "border-red-500/50" : undefined,
      )}
    >
      <FieldLabelWithHint
        htmlFor={`scale-${meta.key}`}
        hint={
          <>
            {meta.hint}
            <span className="mt-1 block text-neutral-400">Used for: {meta.usedFor}</span>
          </>
        }
        hintLabel={`About ${meta.label}`}
      >
        {meta.label}
      </FieldLabelWithHint>
      <p className="mb-2 text-xs text-(--gym-muted)">
        <span className="text-neutral-400">Recommended:</span> {meta.recommendation}
      </p>

      <div className="flex gap-2">
        <Input
          id={`scale-${meta.key}`}
          type="number"
          min={0.1}
          step={0.125}
          value={Number.isFinite(amount) ? amount : ""}
          onChange={(e) => handleAmountChange(e.target.value)}
          className="h-8 font-mono text-xs"
          aria-invalid={!valid && Boolean(value.trim())}
          aria-describedby={`scale-summary-${meta.key} scale-preview-${meta.key}`}
        />
        <select
          value={unit}
          onChange={(e) => handleUnitChange(e.target.value as FontSizeUnit)}
          className="h-8 rounded-lg border border-(--gym-border) bg-(--gym-surface) px-2 text-xs text-white"
          aria-label={`Unit for ${meta.label}`}
        >
          {FONT_SIZE_UNITS.map(({ value: unitValue, label: unitLabel }) => (
            <option key={unitValue} value={unitValue}>
              {unitLabel}
            </option>
          ))}
        </select>
        <InfoHint
          content={
            <ul className="space-y-1">
              {FONT_SIZE_UNITS.map(({ label: unitLabel, hint: unitHint }) => (
                <li key={unitLabel}>
                  <span className="font-medium text-white">{unitLabel}:</span> {unitHint}
                </li>
              ))}
            </ul>
          }
          label="About font size units"
          side="top"
        />
      </div>

      <p
        id={`scale-summary-${meta.key}`}
        className={cn("mt-1.5 text-[10px]", error || !valid ? "text-red-400" : "text-(--gym-muted)")}
      >
        {error ?? summary}
      </p>

      <div
        id={`scale-preview-${meta.key}`}
        className="mt-2 rounded border border-(--gym-border)/60 bg-(--gym-bg) px-2 py-1.5"
      >
        <p
          style={{
            fontFamily: bodyFontFamily,
            fontSize: valid ? value : undefined,
          }}
          className="leading-snug text-white"
        >
          Sample at {valid ? value : "—"}
        </p>
      </div>
    </div>
  );
};

type FontScaleGridProps = {
  scale: BrandFontScale;
  scaleMeta: BrandScaleMeta[];
  bodyFontFamily: string;
  onChange: (key: keyof BrandFontScale, value: string) => void;
  fieldErrors?: Record<string, string>;
};

export const FontScaleGrid = ({ scale, scaleMeta, bodyFontFamily, onChange, fieldErrors = {} }: FontScaleGridProps) => (
  <div className="grid gap-3 sm:grid-cols-2">
    {scaleMeta.map((meta) => (
      <FontScaleField
        key={meta.key}
        meta={meta}
        value={scale[meta.key]}
        bodyFontFamily={bodyFontFamily}
        onChange={(value) => onChange(meta.key, value)}
        error={fieldErrors[`typography.scale.${meta.key}`]}
      />
    ))}
  </div>
);
