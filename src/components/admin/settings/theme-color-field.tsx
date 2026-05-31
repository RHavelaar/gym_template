"use client";

import { useId, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Droplets, ImagePlus, Pipette } from "lucide-react";
import {
  colorInputValue,
  extractColorsFromImage,
  formatHsl,
  formatRgb,
  hexToHsl,
  hexToRgb,
  hslToHex,
  normalizeHex,
  parseHexList,
  rgbToHex,
} from "@/lib/color-utils";
import { BRAND_COLOR_PICKER_HELP } from "@/lib/brand-help";
import { THEME_PRESET_PALETTES } from "@/lib/theme-token-usage";
import type { ThemeTokens } from "@/config/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InfoHint } from "@/components/ui/info-hint";
import { cn } from "@/lib/utils";

type ThemeColorFieldProps = {
  id: string;
  label: string;
  hint?: React.ReactNode;
  usedFor?: string;
  value: string;
  onChange: (value: string) => void;
  surfaceColor?: string;
  backgroundColor?: string;
};

export const ThemeColorField = ({
  id,
  label,
  hint,
  usedFor,
  value,
  onChange,
  surfaceColor = "#141414",
  backgroundColor = "#0a0a0a",
}: ThemeColorFieldProps) => {
  const [open, setOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [extracted, setExtracted] = useState<string[]>([]);
  const [eyedropperError, setEyedropperError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelId = useId();

  const normalized = normalizeHex(value) ?? "#000000";
  const rgb = hexToRgb(normalized);
  const hsl = hexToHsl(normalized);

  const handleHexChange = (next: string) => {
    const hex = normalizeHex(next);
    if (hex) onChange(hex);
  };

  const handleRgbChange = (channel: "r" | "g" | "b", raw: string) => {
    if (!rgb) return;
    const num = Number.parseInt(raw, 10);
    if (Number.isNaN(num)) return;
    onChange(rgbToHex({ ...rgb, [channel]: num }));
  };

  const handleHslChange = (channel: "h" | "s" | "l", raw: string) => {
    if (!hsl) return;
    const num = Number.parseFloat(raw);
    if (Number.isNaN(num)) return;
    onChange(hslToHex({ ...hsl, [channel]: num }));
  };

  const handleEyedropper = async () => {
    setEyedropperError("");
    if (!("EyeDropper" in window)) {
      setEyedropperError("Eyedropper works in Chrome and Edge. Use image extract or paste hex codes elsewhere.");
      return;
    }
    try {
      // @ts-expect-error EyeDropper is not in TS lib yet
      const dropper = new window.EyeDropper();
      const result = await dropper.open();
      const hex = normalizeHex(result.sRGBHex);
      if (hex) onChange(hex);
    } catch {
      /* user cancelled */
    }
  };

  const handleImageExtract = async (file: File) => {
    const colors = await extractColorsFromImage(file);
    setExtracted(colors);
    if (colors[0]) onChange(colors[0]);
  };

  const handleImport = () => {
    const colors = parseHexList(importText);
    if (colors[0]) onChange(colors[0]);
    setExtracted(colors);
  };

  return (
    <div className="rounded-lg border border-(--gym-border) bg-black/20 p-3">
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-lg ring-2 ring-(--gym-border) transition hover:ring-(--gym-accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--gym-accent)"
          style={{ backgroundColor: normalized }}
          aria-label={`Edit ${label} color`}
        >
          <span className="absolute inset-x-0 bottom-0 h-1/2" style={{ backgroundColor: surfaceColor }} aria-hidden />
          <span
            className="absolute inset-y-0 right-0 w-1/2 opacity-40"
            style={{ backgroundColor: backgroundColor }}
            aria-hidden
          />
        </button>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-1.5">
            <Label htmlFor={id} className="mb-0 font-medium text-white">
              {label}
            </Label>
            {hint ? <InfoHint content={hint} label={`About ${label}`} /> : null}
          </div>
          {usedFor ? (
            <p className="text-xs leading-relaxed text-(--gym-muted)">
              <span className="text-neutral-400">Used for: </span>
              {usedFor}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Input
              id={id}
              value={value}
              onChange={(e) => handleHexChange(e.target.value)}
              className="h-8 max-w-28 font-mono text-xs"
              aria-label={`${label} hex value`}
            />
            <span className="hidden text-xs text-neutral-500 sm:inline">{formatRgb(normalized)}</span>
          </div>
        </div>

        <Button type="button" variant="secondary" size="sm" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {open ? "Close" : "Edit"}
        </Button>
      </div>

      {open ? (
        <div id={panelId} className="mt-4 space-y-4 border-t border-(--gym-border) pt-4">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="shrink-0 [&_.react-colorful]:h-48 [&_.react-colorful]:w-full [&_.react-colorful]:max-w-55 [&_.react-colorful]:rounded-lg">
              <HexColorPicker color={colorInputValue(value, "#dc2626")} onChange={handleHexChange} />
            </div>
            <div className="grid flex-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs text-neutral-400">RGB</Label>
                {rgb ? (
                  <div className="flex gap-1">
                    {(["r", "g", "b"] as const).map((ch) => (
                      <Input
                        key={ch}
                        value={rgb[ch]}
                        onChange={(e) => handleRgbChange(ch, e.target.value)}
                        className="h-8 font-mono text-xs"
                        aria-label={`${label} ${ch}`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-neutral-400">HSL</Label>
                {hsl ? (
                  <div className="flex gap-1">
                    {(["h", "s", "l"] as const).map((ch) => (
                      <Input
                        key={ch}
                        value={Math.round(hsl[ch])}
                        onChange={(e) => handleHslChange(ch, e.target.value)}
                        className="h-8 font-mono text-xs"
                        aria-label={`${label} ${ch}`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-neutral-400">Formats</Label>
                <p className="text-xs text-(--gym-muted)">{formatRgb(normalized)}</p>
                <p className="text-xs text-(--gym-muted)">{formatHsl(normalized)}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={handleEyedropper}>
              <Pipette size={14} aria-hidden />
              Eyedropper
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              <ImagePlus size={14} aria-hidden />
              From image
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImageExtract(file);
                e.target.value = "";
              }}
            />
          </div>

          {eyedropperError ? <p className="text-xs text-amber-400">{eyedropperError}</p> : null}

          <p className="text-xs text-(--gym-muted)">{BRAND_COLOR_PICKER_HELP.urlNote}</p>

          <div className="space-y-2">
            <Label className="text-xs text-neutral-400">Import hex palette</Label>
            <div className="flex gap-2">
              <Input
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="#dc2626, #f59e0b"
                className="h-8 text-xs"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleImport}>
                <Droplets size={14} aria-hidden />
                Import
              </Button>
            </div>
          </div>

          {extracted.length ? (
            <div className="flex flex-wrap gap-2">
              {extracted.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => onChange(hex)}
                  className={cn(
                    "h-8 w-8 rounded-md ring-2 transition hover:scale-110",
                    hex === normalized ? "ring-(--gym-accent)" : "ring-transparent",
                  )}
                  style={{ backgroundColor: hex }}
                  aria-label={`Use color ${hex}`}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export type ThemePaletteToolsProps = {
  onApplyPalette: (theme: ThemeTokens) => void;
};

export const ThemePaletteTools = ({ onApplyPalette }: ThemePaletteToolsProps) => (
  <div className="space-y-2">
    <p className="text-sm font-medium text-white">Starter palettes</p>
    <div className="flex flex-wrap gap-2">
      {THEME_PRESET_PALETTES.map((preset) => (
        <button
          key={preset.name}
          type="button"
          onClick={() => onApplyPalette(preset.theme)}
          className="flex items-center gap-2 rounded-lg border border-(--gym-border) px-3 py-2 text-xs text-neutral-300 transition hover:border-(--gym-accent) hover:text-white"
        >
          <span className="flex gap-0.5">
            {[preset.theme.primary, preset.theme.accent, preset.theme.background].map((c) => (
              <span key={c} className="h-4 w-4 rounded-sm" style={{ backgroundColor: c }} aria-hidden />
            ))}
          </span>
          {preset.name}
        </button>
      ))}
    </div>
  </div>
);
