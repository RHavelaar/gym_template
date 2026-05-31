import type { BrandFontScale } from "@/config/types";

export type FontSizeUnit = "px" | "rem" | "em";

export const FONT_SIZE_UNITS: {
  value: FontSizeUnit;
  label: string;
  hint: string;
}[] = [
  {
    value: "px",
    label: "Pixels (px)",
    hint: "Exact screen size — easiest to understand. 16px is standard body text.",
  },
  {
    value: "rem",
    label: "Root em (rem)",
    hint: "Scales with browser text settings. 1rem equals 16px on most devices.",
  },
  {
    value: "em",
    label: "Em (em)",
    hint: "Relative to the parent text size. Use rem or px unless you know you need em.",
  },
];

/** Valid CSS font-size lengths: number + px, rem, or em */
export const CSS_FONT_SIZE_PATTERN = /^(\d+(?:\.\d+)?)(px|rem|em)$/;

export type ParsedFontSize = {
  amount: number;
  unit: FontSizeUnit;
};

export const parseFontSize = (value: string): ParsedFontSize | null => {
  const trimmed = value.trim();
  const match = CSS_FONT_SIZE_PATTERN.exec(trimmed);
  if (!match) return null;
  const amount = Number.parseFloat(match[1] ?? "");
  if (Number.isNaN(amount) || amount <= 0) return null;
  return { amount, unit: match[2] as FontSizeUnit };
};

export const buildFontSize = (amount: number, unit: FontSizeUnit): string => {
  const normalized = Number.isInteger(amount) ? String(amount) : String(Math.round(amount * 1000) / 1000);
  return `${normalized}${unit}`;
};

export const isValidFontSize = (value: string): boolean => parseFontSize(value) !== null;

/** Approximate pixel size assuming a 16px root (standard browser default). */
export const fontSizeToPixels = (value: string, rootPx = 16): number | null => {
  const parsed = parseFontSize(value);
  if (!parsed) return null;

  switch (parsed.unit) {
    case "px":
      return parsed.amount;
    case "rem":
      return parsed.amount * rootPx;
    case "em":
      return parsed.amount * rootPx;
    default:
      return null;
  }
};

export const formatFontSizeSummary = (value: string, rootPx = 16): string => {
  const parsed = parseFontSize(value);
  if (!parsed) return "Invalid size";

  const px = fontSizeToPixels(value, rootPx);
  const pxLabel = px !== null ? `${Math.round(px * 10) / 10}px` : null;

  if (parsed.unit === "px") {
    return `${parsed.amount}px on screen`;
  }

  if (pxLabel) {
    return `${value} ≈ ${pxLabel} on most screens`;
  }

  return value;
};

export const normalizeFontSizeInput = (raw: string, fallbackUnit: FontSizeUnit = "rem"): string => {
  const trimmed = raw.trim();
  if (!trimmed) return buildFontSize(1, fallbackUnit);

  const parsed = parseFontSize(trimmed);
  if (parsed) return buildFontSize(parsed.amount, parsed.unit);

  const numeric = Number.parseFloat(trimmed);
  if (!Number.isNaN(numeric) && numeric > 0) {
    return buildFontSize(numeric, fallbackUnit);
  }

  return trimmed;
};

export type BrandScaleKey = keyof BrandFontScale;

export const BRAND_SCALE_ORDER: BrandScaleKey[] = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"];
