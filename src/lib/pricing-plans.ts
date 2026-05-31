import type { GymPricingPlan, PricingBillingInterval } from "@/config/types";
import type { GymPricingPlanRow } from "@/types/database";

const BILLING_INTERVALS: PricingBillingInterval[] = ["day", "week", "month", "year", "one_time", "custom"];

const normalizeBillingInterval = (value: unknown): PricingBillingInterval => {
  if (typeof value === "string" && BILLING_INTERVALS.includes(value as PricingBillingInterval)) {
    return value as PricingBillingInterval;
  }
  return "month";
};

const normalizeFeatures = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean);
};

export const mapPricingPlanRow = (row: GymPricingPlanRow): GymPricingPlan => ({
  id: row.id,
  sortOrder: row.sort_order,
  enabled: row.enabled,
  name: row.name,
  tagline: row.tagline ?? "",
  description: row.description ?? "",
  priceDisplay: row.price_display,
  priceCents: row.price_cents,
  compareAtDisplay: row.compare_at_display ?? "",
  billingInterval: normalizeBillingInterval(row.billing_interval),
  durationLabel: row.duration_label ?? "",
  features: normalizeFeatures(row.features),
  imageUrl: row.image_url ?? "",
  badge: row.badge ?? "",
  isFeatured: row.is_featured,
  ctaLabel: row.cta_label || "Get started",
  ctaHref: row.cta_href || "/sign-up",
});

export const mapPricingPlanToRow = (
  gymId: string,
  plan: GymPricingPlan,
): Omit<GymPricingPlanRow, "created_at" | "updated_at"> => ({
  id: plan.id,
  gym_id: gymId,
  sort_order: plan.sortOrder,
  enabled: plan.enabled,
  name: plan.name,
  tagline: plan.tagline,
  description: plan.description,
  price_display: plan.priceDisplay,
  price_cents: plan.priceCents,
  compare_at_display: plan.compareAtDisplay,
  billing_interval: plan.billingInterval,
  duration_label: plan.durationLabel,
  features: plan.features,
  image_url: plan.imageUrl,
  badge: plan.badge,
  is_featured: plan.isFeatured,
  cta_label: plan.ctaLabel,
  cta_href: plan.ctaHref,
});

export const sortPricingPlans = (plans: GymPricingPlan[]): GymPricingPlan[] =>
  [...plans].sort((a, b) => a.sortOrder - b.sortOrder);

export const normalizePricingPlanInput = (
  input: Partial<GymPricingPlan> & { id?: string },
  sortOrder: number,
): GymPricingPlan => ({
  id: input.id?.trim() || crypto.randomUUID(),
  sortOrder: input.sortOrder ?? sortOrder,
  enabled: input.enabled ?? true,
  name: input.name?.trim() || "New plan",
  tagline: input.tagline?.trim() ?? "",
  description: input.description?.trim() ?? "",
  priceDisplay: input.priceDisplay?.trim() || "Contact us",
  priceCents: typeof input.priceCents === "number" ? input.priceCents : null,
  compareAtDisplay: input.compareAtDisplay?.trim() ?? "",
  billingInterval: normalizeBillingInterval(input.billingInterval),
  durationLabel: input.durationLabel?.trim() ?? "",
  features: normalizeFeatures(input.features),
  imageUrl: input.imageUrl?.trim() ?? "",
  badge: input.badge?.trim() ?? "",
  isFeatured: input.isFeatured ?? false,
  ctaLabel: input.ctaLabel?.trim() || "Get started",
  ctaHref: input.ctaHref?.trim() || "/sign-up",
});

export const getVisiblePricingPlans = (plans: GymPricingPlan[]): GymPricingPlan[] =>
  sortPricingPlans(plans).filter((plan) => plan.enabled);

export const createEmptyPricingPlan = (sortOrder: number): GymPricingPlan =>
  normalizePricingPlanInput({ name: "New plan", priceDisplay: "$0" }, sortOrder);
