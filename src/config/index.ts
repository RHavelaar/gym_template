import { env } from "@/lib/env";
import { buildFontFamilyCss } from "@/lib/brand-settings";
import { baseGymConfig } from "./base";
import { ironAsylumConfig } from "./gyms/iron-asylum";
import type { GallerySectionProps, GymConfig, HomepageSection } from "./types";
import { mergeGallerySectionProps } from "@/lib/gallery-media";

const gymRegistry: Record<string, GymConfig> = {
  "iron-asylum": ironAsylumConfig,
};

export const getGymSlug = () => env.NEXT_PUBLIC_GYM_SLUG;

export const getGymConfig = (slug?: string): GymConfig => {
  const key = slug ?? getGymSlug();
  return gymRegistry[key] ?? ironAsylumConfig;
};

export const listGymSlugs = () => Object.keys(gymRegistry);

export const mergeHomepageSections = (
  fileSections: HomepageSection[],
  dbSections: HomepageSection[] | null | undefined,
): HomepageSection[] => {
  if (!dbSections?.length) {
    return [...fileSections].sort((a, b) => a.order - b.order);
  }
  const byId = new Map(fileSections.map((s) => [s.id, s]));
  for (const section of dbSections) {
    if (section.type === "gallery") {
      const merged = {
        ...byId.get(section.id),
        ...section,
        props: mergeGallerySectionProps({
          ...(byId.get(section.id)?.type === "gallery"
            ? (byId.get(section.id)!.props as Partial<GallerySectionProps>)
            : {}),
          ...(section.props as Partial<GallerySectionProps>),
        }),
      };
      byId.set(section.id, merged as HomepageSection);
      continue;
    }
    byId.set(section.id, { ...byId.get(section.id), ...section });
  }
  return [...byId.values()].sort((a, b) => a.order - b.order);
};

export const themeToCssVars = (config: GymConfig) =>
  ({
    "--gym-primary": config.theme.primary,
    "--gym-primary-fg": config.theme.primaryForeground,
    "--gym-accent": config.theme.accent,
    "--gym-accent-fg": config.theme.accentForeground,
    "--gym-bg": config.theme.background,
    "--gym-surface": config.theme.surface,
    "--gym-border": config.theme.surfaceBorder,
    "--gym-muted": config.theme.muted,
    "--gym-danger": config.theme.danger,
  }) as Record<string, string>;

export const typographyToCssVars = (config: GymConfig): Record<string, string> => {
  const { typography } = config;
  return {
    "--gym-font-heading": buildFontFamilyCss(typography.headingFont, typography),
    "--gym-font-body": buildFontFamilyCss(typography.bodyFont, typography),
    "--gym-font-mono": buildFontFamilyCss(typography.monoFont, typography),
    "--gym-font-fallback": typography.fallbackStack,
    "--gym-text-xs": typography.scale.xs,
    "--gym-text-sm": typography.scale.sm,
    "--gym-text-base": typography.scale.base,
    "--gym-text-lg": typography.scale.lg,
    "--gym-text-xl": typography.scale.xl,
    "--gym-text-2xl": typography.scale["2xl"],
    "--gym-text-3xl": typography.scale["3xl"],
    "--gym-text-4xl": typography.scale["4xl"],
  };
};

export const brandToCssVars = (config: GymConfig): Record<string, string> => ({
  ...themeToCssVars(config),
  ...typographyToCssVars(config),
});

export { baseGymConfig };
