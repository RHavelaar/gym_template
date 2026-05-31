import type { GymConfig } from "@/config/types";
import { buildFontFamilyCss, resolveSeo } from "@/lib/brand-settings";
import { formatRgb } from "@/lib/color-utils";
import { THEME_TOKEN_META } from "@/lib/theme-token-usage";

export type BrandKitColorRow = {
  label: string;
  hex: string;
  rgb: string;
  usedFor: string;
};

export type BrandKitData = {
  name: string;
  tagline: string;
  logoUrl: string;
  exportedAt: string;
  colors: BrandKitColorRow[];
  typography: {
    heading: string;
    body: string;
    mono: string;
    fallback: string;
    scale: { label: string; value: string }[];
  };
  seo: ReturnType<typeof resolveSeo>;
};

export const buildBrandKitData = (config: GymConfig): BrandKitData => ({
  name: config.name,
  tagline: config.tagline,
  logoUrl: config.logoUrl,
  exportedAt: new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  colors: THEME_TOKEN_META.map((meta) => ({
    label: meta.label,
    hex: config.theme[meta.key],
    rgb: formatRgb(config.theme[meta.key]),
    usedFor: meta.usedFor,
  })),
  typography: {
    heading: buildFontFamilyCss(config.typography.headingFont, config.typography),
    body: buildFontFamilyCss(config.typography.bodyFont, config.typography),
    mono: buildFontFamilyCss(config.typography.monoFont, config.typography),
    fallback: config.typography.fallbackStack,
    scale: [
      { label: "xs", value: config.typography.scale.xs },
      { label: "sm", value: config.typography.scale.sm },
      { label: "base", value: config.typography.scale.base },
      { label: "lg", value: config.typography.scale.lg },
      { label: "xl", value: config.typography.scale.xl },
      { label: "2xl", value: config.typography.scale["2xl"] },
      { label: "3xl", value: config.typography.scale["3xl"] },
      { label: "4xl", value: config.typography.scale["4xl"] },
    ],
  },
  seo: resolveSeo(config),
});

export const brandKitFileName = (name: string, ext: string) =>
  `${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}-brand-kit.${ext}`;
