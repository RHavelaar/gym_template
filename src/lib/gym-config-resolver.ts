import { cache } from "react";
import type {
  GallerySectionProps,
  GymBusinessInfo,
  GymConfig,
  GymFeatureFlags,
  GymLabels,
  HomepageSection,
  HomepageSectionType,
  BrandSeo,
  BrandTypography,
  ThemeTokens,
} from "@/config/types";
import { getGymConfig, mergeHomepageSections } from "@/config";
import { normalizeNavShape } from "@/lib/nav-catalog";
import { normalizeBusinessInfo } from "@/lib/business-info";
import { mergeBrandingImages, mergeGallerySectionProps } from "@/lib/gallery-media";
import { mergeSeo, mergeTypography } from "@/lib/brand-settings";
import { getDemoContentOverride, setDemoContentOverride } from "@/lib/demo-content-store";
import { hasSupabase } from "@/lib/env";
import { getGymIdBySlug } from "@/lib/profiles";
import { createServiceClient } from "@/lib/supabase/server";

type GymRow = {
  name: string;
  tagline: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
};

type BrandingRow = {
  logo_url: string | null;
  theme: Partial<ThemeTokens>;
  typography: Partial<BrandTypography>;
  seo: Partial<BrandSeo>;
  labels: Partial<GymLabels>;
  feature_flags: Partial<GymFeatureFlags>;
  images: Partial<GymConfig["images"]>;
  nav: Partial<GymConfig["nav"]>;
  business: Partial<GymBusinessInfo>;
};

type SectionRow = {
  section_key: string;
  section_type: HomepageSectionType;
  sort_order: number;
  enabled: boolean;
  props: Record<string, unknown>;
};

type CmsSnapshot = {
  configOverlay: Partial<GymConfig>;
  sections: HomepageSection[] | null;
};

const mergeTheme = (base: ThemeTokens, overlay: Partial<ThemeTokens>): ThemeTokens => ({
  ...base,
  ...overlay,
});

const mergeLabels = (base: GymLabels, overlay: Partial<GymLabels>): GymLabels => ({
  ...base,
  ...overlay,
  progressCelebrations: overlay.progressCelebrations?.length ? overlay.progressCelebrations : base.progressCelebrations,
});

const mergeFeatures = (base: GymFeatureFlags, overlay: Partial<GymFeatureFlags>): GymFeatureFlags => ({
  ...base,
  ...overlay,
});

const mergeBusiness = (
  base: GymBusinessInfo,
  overlay: Partial<GymBusinessInfo>,
  gymRow: GymRow | null,
): GymBusinessInfo => {
  return normalizeBusinessInfo(base, overlay, gymRow);
};

const mergeNav = (base: GymConfig["nav"], overlay: Partial<GymConfig["nav"]>): GymConfig["nav"] =>
  normalizeNavShape({
    public: overlay.public?.length ? overlay.public : base.public,
    member: overlay.member?.length ? overlay.member : base.member,
    account: overlay.account?.length ? overlay.account : base.account,
    admin: overlay.admin?.length ? overlay.admin : base.admin,
  });

const mapSectionRow = (row: SectionRow): HomepageSection => {
  const section = {
    id: row.section_key,
    type: row.section_type,
    enabled: row.enabled,
    order: row.sort_order,
    props: row.props,
  } as HomepageSection;

  if (section.type === "gallery") {
    return {
      ...section,
      props: mergeGallerySectionProps(section.props as Partial<GallerySectionProps>),
    } as HomepageSection;
  }

  return section;
};

const buildConfigOverlay = (
  slug: string,
  gymRow: GymRow | null,
  brandingRow: BrandingRow | null,
): Partial<GymConfig> => {
  const base = getGymConfig(slug);
  const configOverlay: Partial<GymConfig> = {};

  if (gymRow) {
    if (gymRow.name) configOverlay.name = gymRow.name;
    if (gymRow.tagline) configOverlay.tagline = gymRow.tagline;
    if (gymRow.description) configOverlay.description = gymRow.description;
  }

  if (brandingRow) {
    if (brandingRow.logo_url) configOverlay.logoUrl = brandingRow.logo_url;
    if (Object.keys(brandingRow.theme ?? {}).length) {
      configOverlay.theme = mergeTheme(base.theme, brandingRow.theme);
    }
    if (Object.keys(brandingRow.typography ?? {}).length) {
      configOverlay.typography = mergeTypography(base.typography, brandingRow.typography);
    }
    if (Object.keys(brandingRow.seo ?? {}).length) {
      configOverlay.seo = mergeSeo(base.seo, brandingRow.seo);
    }
    if (Object.keys(brandingRow.labels ?? {}).length) {
      configOverlay.labels = mergeLabels(base.labels, brandingRow.labels);
    }
    if (Object.keys(brandingRow.feature_flags ?? {}).length) {
      configOverlay.features = mergeFeatures(base.features, brandingRow.feature_flags);
    }
    if (brandingRow.images) {
      const mergedImages = mergeBrandingImages(base.images, brandingRow.images);
      if (mergedImages) configOverlay.images = mergedImages;
    }
    if (Object.keys(brandingRow.nav ?? {}).length) {
      configOverlay.nav = mergeNav(base.nav, brandingRow.nav);
    }
    if (Object.keys(brandingRow.business ?? {}).length || gymRow) {
      configOverlay.business = mergeBusiness(base.business, brandingRow.business ?? {}, gymRow);
    }
  } else if (gymRow) {
    configOverlay.business = mergeBusiness(base.business, {}, gymRow);
  }

  return configOverlay;
};

/** One DB round-trip per request — deduped via React cache(). */
export const fetchGymCmsFromDb = cache(async (slug: string): Promise<CmsSnapshot | null> => {
  if (!hasSupabase) return null;

  const supabase = createServiceClient();
  const gymId = await getGymIdBySlug(slug);
  if (!gymId) return null;

  const [{ data: gym }, { data: branding }, { data: page }] = await Promise.all([
    supabase
      .from("gyms")
      .select("name, tagline, description, phone, email, address_line1, city, state, zip")
      .eq("id", gymId)
      .maybeSingle(),
    supabase
      .from("gym_branding")
      .select("logo_url, theme, typography, seo, labels, feature_flags, images, nav, business")
      .eq("gym_id", gymId)
      .maybeSingle(),
    supabase.from("gym_pages").select("id").eq("gym_id", gymId).eq("slug", "home").maybeSingle(),
  ]);

  let sections: HomepageSection[] | null = null;
  if (page) {
    const { data: sectionRows } = await supabase
      .from("gym_page_sections")
      .select("section_key, section_type, sort_order, enabled, props")
      .eq("page_id", page.id)
      .order("sort_order", { ascending: true });

    if (sectionRows?.length) {
      sections = (sectionRows as SectionRow[]).map(mapSectionRow);
    }
  }

  return {
    configOverlay: buildConfigOverlay(slug, gym as GymRow | null, branding as BrandingRow | null),
    sections,
  };
});

export const applyConfigOverlay = (base: GymConfig, overlay: Partial<GymConfig>): GymConfig => ({
  ...base,
  ...overlay,
  theme: overlay.theme ?? base.theme,
  typography: overlay.typography ?? base.typography,
  seo: overlay.seo ?? base.seo,
  labels: overlay.labels ?? base.labels,
  features: overlay.features ?? base.features,
  business: overlay.business ?? base.business,
  images: overlay.images ? (mergeBrandingImages(base.images, overlay.images) ?? base.images) : base.images,
  nav: overlay.nav ?? base.nav,
});

export const getResolvedGymConfig = cache(async (slug?: string): Promise<GymConfig> => {
  const key = slug ?? getGymConfig().slug;
  const base = getGymConfig(key);
  const demoOverride = getDemoContentOverride();

  if (!hasSupabase) {
    if (!demoOverride) return base;
    return applyConfigOverlay(base, {
      ...demoOverride.config,
      theme: { ...base.theme, ...demoOverride.config.theme },
      typography: demoOverride.config.typography
        ? mergeTypography(base.typography, demoOverride.config.typography)
        : base.typography,
      seo: demoOverride.config.seo ? mergeSeo(base.seo, demoOverride.config.seo) : base.seo,
      labels: { ...base.labels, ...demoOverride.config.labels },
      features: { ...base.features, ...demoOverride.config.features },
      business: { ...base.business, ...demoOverride.config.business },
      images: { ...base.images, ...demoOverride.config.images },
      nav: demoOverride.config.nav ? mergeNav(base.nav, demoOverride.config.nav) : base.nav,
    });
  }

  const cms = await fetchGymCmsFromDb(key);
  if (!cms) return base;
  return applyConfigOverlay(base, cms.configOverlay);
});

export const getResolvedHomepageSections = cache(async (slug?: string): Promise<HomepageSection[]> => {
  const key = slug ?? getGymConfig().slug;
  const base = getGymConfig(key);
  const demoOverride = getDemoContentOverride();

  if (!hasSupabase) {
    return mergeHomepageSections(base.homepageSections, demoOverride?.sections ?? null);
  }

  const cms = await fetchGymCmsFromDb(key);
  return mergeHomepageSections(base.homepageSections, cms?.sections);
});

/** Config + sections from a single cached CMS fetch. */
export const loadCmsEditorData = cache(async (slug?: string) => {
  const config = await getResolvedGymConfig(slug);
  const sections = await getResolvedHomepageSections(slug);
  return { config, sections };
});

export const getHomePageId = cache(async (slug: string): Promise<string | null> => {
  if (!hasSupabase) return "demo-home-page";
  const gymId = await getGymIdBySlug(slug);
  if (!gymId) return null;
  const supabase = createServiceClient();
  const { data } = await supabase.from("gym_pages").select("id").eq("gym_id", gymId).eq("slug", "home").maybeSingle();
  return data?.id ?? null;
});

export { setDemoContentOverride };
