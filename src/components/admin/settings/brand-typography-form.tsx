"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import type { BrandCustomFont, BrandTypography } from "@/config/types";
import { FontPicker } from "@/components/admin/settings/font-picker";
import { FontScaleGrid } from "@/components/admin/settings/font-scale-field";
import { BRAND_SCALE_META, BRAND_TYPOGRAPHY_HELP } from "@/lib/brand-help";
import { buildFontFamilyCss, makeCustomFontId } from "@/lib/brand-settings";
import { FALLBACK_FONT_PRESETS } from "@/lib/google-fonts-catalog";
import { FieldLabelWithHint, SettingSectionTitle } from "@/components/ui/info-hint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type PendingBrandFont = {
  file: File;
  displayName: string;
  blobUrl: string;
  tempId: string;
  format: BrandCustomFont["format"];
};

type BrandTypographyFormProps = {
  typography: BrandTypography;
  onChange: (typography: BrandTypography) => void;
  pendingFont?: PendingBrandFont | null;
  onPendingFontChange?: (pending: PendingBrandFont | null) => void;
  fieldErrors?: Record<string, string>;
};

const FONT_ROLES: {
  key: "headingFont" | "bodyFont" | "monoFont";
  label: string;
  hint: string;
  recommendation: string;
  usedFor: string;
  category?: "display" | "sans" | "mono";
}[] = [
  {
    key: "headingFont",
    label: "Heading font",
    hint: BRAND_TYPOGRAPHY_HELP.heading.hint,
    recommendation: BRAND_TYPOGRAPHY_HELP.heading.recommendation,
    usedFor: "Homepage hero, page titles, uppercase gym branding",
    category: "display",
  },
  {
    key: "bodyFont",
    label: "Body font",
    hint: BRAND_TYPOGRAPHY_HELP.body.hint,
    recommendation: BRAND_TYPOGRAPHY_HELP.body.recommendation,
    usedFor: "Paragraphs, forms, member dashboard, navigation labels",
    category: "sans",
  },
  {
    key: "monoFont",
    label: "Monospace font",
    hint: BRAND_TYPOGRAPHY_HELP.mono.hint,
    recommendation: BRAND_TYPOGRAPHY_HELP.mono.recommendation,
    usedFor: "Leaderboard stats, weights, numeric displays",
    category: "mono",
  },
];

const previewTypography = (
  typography: BrandTypography,
  pendingFont: PendingBrandFont | null | undefined,
): BrandTypography => {
  if (!pendingFont) return typography;

  const tempCustom: BrandCustomFont = {
    id: pendingFont.tempId,
    name: pendingFont.displayName,
    url: pendingFont.blobUrl,
    format: pendingFont.format,
  };

  return {
    ...typography,
    customFonts: [...typography.customFonts.filter((font) => font.id !== pendingFont.tempId), tempCustom],
  };
};

export const BrandTypographyForm = ({
  typography,
  onChange,
  pendingFont = null,
  onPendingFontChange,
  fieldErrors = {},
}: BrandTypographyFormProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fontName, setFontName] = useState("");
  const [uploadError, setUploadError] = useState("");

  const pickerTypography = previewTypography(typography, pendingFont);
  const bodyFontFamily = buildFontFamilyCss(pickerTypography.bodyFont, pickerTypography);

  const patch = (partial: Partial<BrandTypography>) => onChange({ ...typography, ...partial });

  const patchScale = (key: keyof BrandTypography["scale"], value: string) =>
    onChange({
      ...typography,
      scale: { ...typography.scale, [key]: value },
    });

  const handleFontSelect = (file: File) => {
    setUploadError("");
    const ext = file.name.split(".").pop()?.toLowerCase();
    const format = ext === "woff2" ? "woff2" : ext === "woff" ? "woff" : "ttf";
    const displayName = fontName.trim() || file.name.replace(/\.[^.]+$/, "");
    const tempId = makeCustomFontId();
    const blobUrl = URL.createObjectURL(file);

    if (pendingFont?.blobUrl.startsWith("blob:")) {
      URL.revokeObjectURL(pendingFont.blobUrl);
    }

    onPendingFontChange?.({
      file,
      displayName,
      blobUrl,
      tempId,
      format,
    });
    setFontName("");
  };

  return (
    <div className="space-y-6">
      <SettingSectionTitle
        title="Typography"
        size="lg"
        hint="Fonts and text sizes used across your site. Always set a fallback font so text remains readable if a web font fails to load."
        description="Choose from 100+ Google Fonts or upload licensed custom fonts. Custom font files upload when you save brand settings."
      />

      {FONT_ROLES.map((role) => (
        <FontPicker
          key={role.key}
          id={`font-${role.key}`}
          label={role.label}
          hint={role.hint}
          recommendation={role.recommendation}
          usedFor={role.usedFor}
          value={typography[role.key]}
          category={role.category}
          customFonts={pickerTypography.customFonts}
          typography={pickerTypography}
          onChange={(value) => patch({ [role.key]: value })}
        />
      ))}

      <div className="space-y-2 rounded-lg border border-(--gym-border) bg-black/20 p-4">
        <FieldLabelWithHint
          htmlFor="fallback-stack"
          hint={BRAND_TYPOGRAPHY_HELP.fallback.hint}
          hintLabel="About fallback font"
        >
          Fallback font stack
        </FieldLabelWithHint>
        <p className="text-xs text-(--gym-muted)">
          <span className="text-neutral-400">Recommended:</span> {BRAND_TYPOGRAPHY_HELP.fallback.recommendation}
        </p>
        <select
          id="fallback-stack"
          value={typography.fallbackStack}
          onChange={(e) => patch({ fallbackStack: e.target.value })}
          className="mb-2 w-full rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3 py-2 text-sm text-white"
        >
          {FALLBACK_FONT_PRESETS.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
        <Input
          value={typography.fallbackStack}
          onChange={(e) => patch({ fallbackStack: e.target.value })}
          placeholder="system-ui, sans-serif"
          aria-label="Custom fallback font stack"
        />
        <p
          style={{ fontFamily: `${bodyFontFamily}, ${typography.fallbackStack}` }}
          className="mt-2 rounded border border-dashed border-(--gym-border) px-3 py-2 text-sm text-neutral-300"
        >
          Preview with fallback — if your main font fails, members still see this style.
        </p>
      </div>

      <div className="space-y-3 rounded-lg border border-(--gym-border) bg-black/20 p-4">
        <FieldLabelWithHint hint={BRAND_TYPOGRAPHY_HELP.customUpload.hint} hintLabel="About custom fonts">
          Custom font upload
        </FieldLabelWithHint>
        <p className="text-xs text-(--gym-muted)">
          <span className="text-neutral-400">Recommended:</span> {BRAND_TYPOGRAPHY_HELP.customUpload.recommendation}
        </p>
        <Input
          value={fontName}
          onChange={(e) => setFontName(e.target.value)}
          placeholder="Font display name (e.g. Iron Asylum Bold)"
          className="text-sm"
          aria-describedby="custom-font-upload-hint"
        />
        <p id="custom-font-upload-hint" className="text-[10px] text-(--gym-muted)">
          Only upload fonts you have a license to use on the web. The file uploads when you click Save changes.
        </p>
        <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
          <Upload size={14} aria-hidden />
          Choose font file
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".woff2,.woff,.ttf,font/woff2,font/woff,font/ttf"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFontSelect(file);
            e.target.value = "";
          }}
        />
        {uploadError ? <p className="text-xs text-red-400">{uploadError}</p> : null}
        {pendingFont ? (
          <p className="text-xs text-(--gym-accent)">
            Pending upload: {pendingFont.displayName} — saves when you click Save changes
          </p>
        ) : null}
        {typography.customFonts.length ? (
          <ul className="space-y-1 text-xs text-(--gym-muted)">
            {typography.customFonts.map((font) => (
              <li key={font.id}>
                {font.name} ({font.format}) — available in font pickers above
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="space-y-3">
        <FieldLabelWithHint hint={BRAND_TYPOGRAPHY_HELP.scale.hint} hintLabel="About type scale">
          Default font sizes
        </FieldLabelWithHint>
        <p className="text-xs text-(--gym-muted)">
          <span className="text-neutral-400">Recommended:</span> {BRAND_TYPOGRAPHY_HELP.scale.recommendation}
        </p>
        <FontScaleGrid
          scale={typography.scale}
          scaleMeta={BRAND_SCALE_META}
          bodyFontFamily={bodyFontFamily}
          onChange={patchScale}
          fieldErrors={fieldErrors}
        />
      </div>
    </div>
  );
};
