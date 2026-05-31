import {
  DEFAULT_HERO_PROPS,
  type BrandFontScale,
  type HeroLayout,
  type HeroLayoutDesktop,
  type HeroOverlayDirection,
  type HeroOverlayStyle,
  type HeroSectionProps,
  type HeroTextSize,
} from "@/config/types";
import type { ZodError } from "zod";
import { heroPropsSchema } from "@/lib/validation/content";

type LegacyHeroProps = Partial<
  Pick<HeroSectionProps, "headline" | "subheadline" | "ctaLabel" | "ctaHref" | "secondaryCtaLabel" | "secondaryCtaHref">
>;

const clampPercent = (value: unknown, fallback: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(100, Math.max(0, Math.round(value)));
};

const pickEnum = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  typeof value === "string" && allowed.includes(value as T) ? (value as T) : fallback;

const migrateLayout = (value: unknown): HeroLayout | undefined => {
  if (value === "panel") return "split";
  if (value === "compact") return "showcase";
  if (typeof value === "string" && ["classic", "centered", "split", "showcase"].includes(value)) {
    return value as HeroLayout;
  }
  return undefined;
};

export const mergeHeroProps = (
  stored?: Partial<HeroSectionProps> | LegacyHeroProps,
  configTagline?: string,
): HeroSectionProps => {
  const source = (stored ?? {}) as Partial<HeroSectionProps>;

  const tagline =
    typeof source.tagline === "string" && source.tagline.trim()
      ? source.tagline
      : (configTagline ?? DEFAULT_HERO_PROPS.tagline);

  return {
    tagline,
    showTagline: typeof source.showTagline === "boolean" ? source.showTagline : DEFAULT_HERO_PROPS.showTagline,
    headline: typeof source.headline === "string" && source.headline ? source.headline : DEFAULT_HERO_PROPS.headline,
    showHeadline: typeof source.showHeadline === "boolean" ? source.showHeadline : DEFAULT_HERO_PROPS.showHeadline,
    subheadline:
      typeof source.subheadline === "string" && source.subheadline
        ? source.subheadline
        : DEFAULT_HERO_PROPS.subheadline,
    showSubheadline:
      typeof source.showSubheadline === "boolean" ? source.showSubheadline : DEFAULT_HERO_PROPS.showSubheadline,
    ctaLabel: typeof source.ctaLabel === "string" && source.ctaLabel ? source.ctaLabel : DEFAULT_HERO_PROPS.ctaLabel,
    ctaHref: typeof source.ctaHref === "string" && source.ctaHref ? source.ctaHref : DEFAULT_HERO_PROPS.ctaHref,
    showPrimaryCta:
      typeof source.showPrimaryCta === "boolean" ? source.showPrimaryCta : DEFAULT_HERO_PROPS.showPrimaryCta,
    secondaryCtaLabel:
      typeof source.secondaryCtaLabel === "string" && source.secondaryCtaLabel
        ? source.secondaryCtaLabel
        : DEFAULT_HERO_PROPS.secondaryCtaLabel,
    secondaryCtaHref:
      typeof source.secondaryCtaHref === "string" && source.secondaryCtaHref
        ? source.secondaryCtaHref
        : DEFAULT_HERO_PROPS.secondaryCtaHref,
    showSecondaryCta:
      typeof source.showSecondaryCta === "boolean" ? source.showSecondaryCta : DEFAULT_HERO_PROPS.showSecondaryCta,
    headlineSize: pickEnum<HeroTextSize>(
      source.headlineSize,
      ["sm", "md", "lg", "xl"],
      DEFAULT_HERO_PROPS.headlineSize,
    ),
    subheadlineSize: pickEnum<HeroTextSize>(
      source.subheadlineSize,
      ["sm", "md", "lg", "xl"],
      DEFAULT_HERO_PROPS.subheadlineSize,
    ),
    layout:
      migrateLayout(source.layout) ??
      pickEnum<HeroLayout>(source.layout, ["classic", "centered", "split", "showcase"], DEFAULT_HERO_PROPS.layout),
    layoutDesktop: (() => {
      const migrated = migrateLayout(source.layoutDesktop);
      if (migrated) return migrated;
      if ((source.layoutDesktop as string | undefined) === "same") {
        return (
          migrateLayout(source.layout) ??
          pickEnum<HeroLayout>(source.layout, ["classic", "centered", "split", "showcase"], DEFAULT_HERO_PROPS.layout)
        );
      }
      return pickEnum<HeroLayoutDesktop>(
        source.layoutDesktop,
        ["classic", "centered", "split", "showcase"],
        DEFAULT_HERO_PROPS.layoutDesktop,
      );
    })(),
    overlayEnabled:
      typeof source.overlayEnabled === "boolean" ? source.overlayEnabled : DEFAULT_HERO_PROPS.overlayEnabled,
    imageOpacity: clampPercent(source.imageOpacity, DEFAULT_HERO_PROPS.imageOpacity),
    overlayOpacity: clampPercent(source.overlayOpacity, DEFAULT_HERO_PROPS.overlayOpacity),
    overlayDirection: pickEnum<HeroOverlayDirection>(
      source.overlayDirection,
      ["to-top", "to-bottom", "to-left", "to-right", "radial"],
      DEFAULT_HERO_PROPS.overlayDirection,
    ),
    overlayStyle: pickEnum<HeroOverlayStyle>(
      source.overlayStyle,
      ["gradient", "solid", "vignette", "frame"],
      DEFAULT_HERO_PROPS.overlayStyle,
    ),
    overlayColor: typeof source.overlayColor === "string" ? source.overlayColor : DEFAULT_HERO_PROPS.overlayColor,
    taglineColor: typeof source.taglineColor === "string" ? source.taglineColor : DEFAULT_HERO_PROPS.taglineColor,
    headlineColor: typeof source.headlineColor === "string" ? source.headlineColor : DEFAULT_HERO_PROPS.headlineColor,
    subheadlineColor:
      typeof source.subheadlineColor === "string" ? source.subheadlineColor : DEFAULT_HERO_PROPS.subheadlineColor,
    primaryCtaBg: typeof source.primaryCtaBg === "string" ? source.primaryCtaBg : DEFAULT_HERO_PROPS.primaryCtaBg,
    primaryCtaText:
      typeof source.primaryCtaText === "string" ? source.primaryCtaText : DEFAULT_HERO_PROPS.primaryCtaText,
    secondaryCtaBg:
      typeof source.secondaryCtaBg === "string" ? source.secondaryCtaBg : DEFAULT_HERO_PROPS.secondaryCtaBg,
    secondaryCtaText:
      typeof source.secondaryCtaText === "string" ? source.secondaryCtaText : DEFAULT_HERO_PROPS.secondaryCtaText,
  };
};

export const HERO_LAYOUT_OPTIONS: { value: HeroLayout; label: string; hint: string }[] = [
  { value: "classic", label: "Classic", hint: "Full-bleed photo with text anchored bottom-left" },
  { value: "centered", label: "Centered", hint: "Full-bleed photo with centered headline stack" },
  { value: "split", label: "Split", hint: "Image and copy in side-by-side panels" },
  { value: "showcase", label: "Showcase", hint: "Featured image card with gallery accents" },
];

export const HERO_TEXT_SIZE_OPTIONS: { value: HeroTextSize; label: string }[] = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra large" },
];

export const HERO_OVERLAY_DIRECTION_OPTIONS: {
  value: HeroOverlayDirection;
  label: string;
}[] = [
  { value: "to-top", label: "Bottom to top" },
  { value: "to-bottom", label: "Top to bottom" },
  { value: "to-left", label: "Right to left" },
  { value: "to-right", label: "Left to right" },
  { value: "radial", label: "Radial" },
];

export const HERO_OVERLAY_STYLE_OPTIONS: { value: HeroOverlayStyle; label: string }[] = [
  { value: "gradient", label: "Gradient" },
  { value: "solid", label: "Solid film" },
  { value: "vignette", label: "Vignette" },
  { value: "frame", label: "Frame" },
];

export const formatHeroFieldErrors = (error: ZodError): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
};

export const validateHeroProps = (input: unknown) => heroPropsSchema.safeParse(input);

export const HERO_HEADLINE_SCALE_KEY: Record<HeroTextSize, keyof BrandFontScale> = {
  sm: "lg",
  md: "xl",
  lg: "2xl",
  xl: "3xl",
};

export const HERO_SUBHEADLINE_SCALE_KEY: Record<HeroTextSize, keyof BrandFontScale> = {
  sm: "sm",
  md: "base",
  lg: "lg",
  xl: "xl",
};

export const heroHeadlineFontSize = (size: HeroTextSize, scale: BrandFontScale): string =>
  scale[HERO_HEADLINE_SCALE_KEY[size]];

export const heroSubheadlineFontSize = (size: HeroTextSize, scale: BrandFontScale): string =>
  scale[HERO_SUBHEADLINE_SCALE_KEY[size]];
