import { getGymConfig } from "@/config";
import {
  ironAsylumContactPageSettings,
  ironAsylumDefaultPricingPlans,
  ironAsylumPricingPageSettings,
} from "@/config/pricing-defaults";
import type { ContactPageSettings, GymPricingPlan, PricingPageSettings } from "@/config/types";
import { DEFAULT_CONTACT_PAGE_SETTINGS, DEFAULT_PRICING_PAGE_SETTINGS } from "@/config/types";
import { sortPricingPlans } from "@/lib/pricing-plans";

const FILE_DEFAULTS: Record<
  string,
  { contact: ContactPageSettings; pricing: PricingPageSettings; plans: GymPricingPlan[] }
> = {
  "iron-asylum": {
    contact: ironAsylumContactPageSettings,
    pricing: ironAsylumPricingPageSettings,
    plans: ironAsylumDefaultPricingPlans,
  },
};

export const getFileDefaultContactPageSettings = (slug?: string): ContactPageSettings => {
  const key = slug ?? getGymConfig().slug;
  return FILE_DEFAULTS[key]?.contact ?? DEFAULT_CONTACT_PAGE_SETTINGS;
};

export const getFileDefaultPricingPageSettings = (slug?: string): PricingPageSettings => {
  const key = slug ?? getGymConfig().slug;
  return FILE_DEFAULTS[key]?.pricing ?? DEFAULT_PRICING_PAGE_SETTINGS;
};

export const getFileDefaultPricingPlans = (slug?: string): GymPricingPlan[] => {
  const key = slug ?? getGymConfig().slug;
  return sortPricingPlans(FILE_DEFAULTS[key]?.plans ?? []);
};

export const mergePricingPageSettings = (
  base: PricingPageSettings,
  overlay?: Partial<PricingPageSettings> | Record<string, unknown> | null,
): PricingPageSettings => {
  if (!overlay || typeof overlay !== "object") return base;
  const partial = overlay as Partial<PricingPageSettings>;
  return {
    headline: partial.headline?.trim() || base.headline,
    subtitle: partial.subtitle?.trim() ?? base.subtitle,
    footnote: partial.footnote?.trim() ?? base.footnote,
    metaDescription: partial.metaDescription?.trim() ?? base.metaDescription,
  };
};

export const normalizePricingPageSettings = (
  overlay?: Partial<PricingPageSettings> | Record<string, unknown> | null,
): PricingPageSettings => mergePricingPageSettings(DEFAULT_PRICING_PAGE_SETTINGS, overlay);
