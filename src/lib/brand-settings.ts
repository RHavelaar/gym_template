import type { BrandSeo, BrandTypography, BrandCustomFont, GymConfig } from "@/config/types";
import { normalizeNavShape } from "@/lib/nav-catalog";
import { DEFAULT_BRAND_SEO, DEFAULT_BRAND_TYPOGRAPHY, DEFAULT_BRAND_FONT_SCALE } from "@/config/types";

export type ResolvedSeo = {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  twitterCard: BrandSeo["twitterCard"];
  faviconUrl: string;
  appleTouchIconUrl: string;
};

export const mergeTypography = (base: BrandTypography, overlay: Partial<BrandTypography>): BrandTypography => ({
  headingFont: overlay.headingFont ?? base.headingFont,
  bodyFont: overlay.bodyFont ?? base.bodyFont,
  monoFont: overlay.monoFont ?? base.monoFont,
  fallbackStack: overlay.fallbackStack ?? base.fallbackStack,
  customFonts: overlay.customFonts?.length ? overlay.customFonts : base.customFonts,
  scale: { ...base.scale, ...overlay.scale },
});

export const mergeSeo = (base: BrandSeo, overlay: Partial<BrandSeo>): BrandSeo => ({
  metaTitle: overlay.metaTitle ?? base.metaTitle,
  metaDescription: overlay.metaDescription ?? base.metaDescription,
  ogTitle: overlay.ogTitle ?? base.ogTitle,
  ogDescription: overlay.ogDescription ?? base.ogDescription,
  ogImageUrl: overlay.ogImageUrl ?? base.ogImageUrl,
  twitterCard: overlay.twitterCard ?? base.twitterCard,
  faviconUrl: overlay.faviconUrl ?? base.faviconUrl,
  appleTouchIconUrl: overlay.appleTouchIconUrl ?? base.appleTouchIconUrl,
});

export const resolveSeo = (config: GymConfig): ResolvedSeo => {
  const seo = config.seo ?? DEFAULT_BRAND_SEO;
  const metaTitle = seo.metaTitle.trim() || config.name;
  const metaDescription = seo.metaDescription.trim() || config.description;
  const ogTitle = seo.ogTitle.trim() || metaTitle;
  const ogDescription = seo.ogDescription.trim() || metaDescription;
  const ogImageUrl = seo.ogImageUrl.trim() || config.images.hero || config.logoUrl;
  const faviconUrl = seo.faviconUrl.trim() || config.logoUrl;
  const appleTouchIconUrl = seo.appleTouchIconUrl.trim() || seo.faviconUrl.trim() || config.logoUrl;

  return {
    metaTitle,
    metaDescription,
    ogTitle,
    ogDescription,
    ogImageUrl,
    twitterCard: seo.twitterCard,
    faviconUrl,
    appleTouchIconUrl,
  };
};

export const isCustomFontRef = (value: string) => value.startsWith("custom:");

export const customFontId = (value: string) => value.replace(/^custom:/, "");

export const resolveFontFamily = (fontRef: string, typography: BrandTypography): string => {
  if (isCustomFontRef(fontRef)) {
    const id = customFontId(fontRef);
    const custom = typography.customFonts.find((f) => f.id === id);
    if (custom) return `"${custom.name}"`;
  }
  if (fontRef.trim()) return `"${fontRef}"`;
  return "inherit";
};

export const buildFontFamilyCss = (fontRef: string, typography: BrandTypography): string => {
  const family = resolveFontFamily(fontRef, typography);
  return `${family}, ${typography.fallbackStack}`;
};

export const mergeTypographyFromPartial = (
  partial: Partial<BrandTypography> | undefined,
  base = DEFAULT_BRAND_TYPOGRAPHY,
): BrandTypography => mergeTypography(base, partial ?? {});

export const mergeSeoFromPartial = (partial: Partial<BrandSeo> | undefined, base = DEFAULT_BRAND_SEO): BrandSeo =>
  mergeSeo(base, partial ?? {});

export const emptyBrandTypography = (): BrandTypography => ({
  ...DEFAULT_BRAND_TYPOGRAPHY,
  customFonts: [],
  scale: { ...DEFAULT_BRAND_FONT_SCALE },
});

export const emptyBrandSeo = (): BrandSeo => ({ ...DEFAULT_BRAND_SEO });

export const makeCustomFontId = () => `font-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export type BrandCustomFontInput = Omit<BrandCustomFont, "id"> & { id?: string };

export const normalizeCustomFont = (input: BrandCustomFontInput): BrandCustomFont => ({
  id: input.id ?? makeCustomFontId(),
  name: input.name,
  url: input.url,
  format: input.format,
});

export type BrandPreviewDraft = Pick<
  GymConfig,
  "name" | "tagline" | "description" | "logoUrl" | "theme" | "typography" | "seo" | "slug" | "images"
>;

export type BrandSaveDraft = Pick<
  GymConfig,
  "name" | "tagline" | "description" | "logoUrl" | "theme" | "typography" | "seo"
>;

export const extractBrandPreviewDraft = (config: GymConfig): BrandPreviewDraft => ({
  name: config.name,
  tagline: config.tagline,
  description: config.description,
  logoUrl: config.logoUrl,
  theme: config.theme,
  typography: config.typography,
  seo: config.seo,
  slug: config.slug,
  images: config.images,
});

export const extractBrandSaveDraft = (config: GymConfig): BrandSaveDraft => ({
  name: config.name,
  tagline: config.tagline,
  description: config.description,
  logoUrl: config.logoUrl,
  theme: config.theme,
  typography: config.typography,
  seo: config.seo,
});

export const buildBrandPreviewConfig = (base: GymConfig, draft: BrandPreviewDraft): GymConfig => ({
  ...base,
  ...draft,
  theme: draft.theme,
  typography: draft.typography,
  seo: draft.seo,
  images: { ...base.images, ...draft.images },
});

export const applySitePreviewOverrides = (
  config: GymConfig,
  site?: {
    nav?: GymConfig["nav"];
    features?: GymConfig["features"];
  },
): GymConfig => {
  if (!site?.nav && !site?.features) return config;

  return {
    ...config,
    ...(site.nav ? { nav: normalizeNavShape({ ...config.nav, ...site.nav }) } : {}),
    ...(site.features ? { features: site.features } : {}),
  };
};

export const isBrandDraftDirty = (baseline: BrandSaveDraft, draft: BrandSaveDraft): boolean =>
  JSON.stringify(baseline) !== JSON.stringify(draft);

export const previewSiteOrigin = (slug: string) => `https://${slug}.gym`;
