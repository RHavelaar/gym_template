import { describe, expect, it } from "vitest";
import { ironAsylumDefaultPricingPlans } from "@/config/pricing-defaults";
import {
  getVisiblePricingPlans,
  mapPricingPlanRow,
  normalizePricingPlanInput,
  sortPricingPlans,
} from "@/lib/pricing-plans";
import type { GymPricingPlanRow } from "@/types/database";

const sampleRow: GymPricingPlanRow = {
  id: "plan-1",
  gym_id: "gym-1",
  sort_order: 2,
  enabled: true,
  name: "Monthly",
  tagline: "Flexible",
  description: "Unlimited access",
  price_display: "$59/mo",
  price_cents: 5900,
  compare_at_display: "",
  billing_interval: "month",
  duration_label: "Billed monthly",
  features: ["Access", "PR boards"],
  image_url: "https://example.com/a.jpg",
  badge: "Popular",
  is_featured: true,
  cta_label: "Join",
  cta_href: "/sign-up",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("pricing-plans", () => {
  it("maps database row to plan", () => {
    const plan = mapPricingPlanRow(sampleRow);
    expect(plan.name).toBe("Monthly");
    expect(plan.priceDisplay).toBe("$59/mo");
    expect(plan.features).toHaveLength(2);
  });

  it("sorts by sortOrder", () => {
    const plans = sortPricingPlans([
      normalizePricingPlanInput({ name: "B", sortOrder: 2 }, 2),
      normalizePricingPlanInput({ name: "A", sortOrder: 1 }, 1),
    ]);
    expect(plans[0].name).toBe("A");
  });

  it("returns only enabled plans for public display", () => {
    const plans = getVisiblePricingPlans([
      { ...ironAsylumDefaultPricingPlans[0], enabled: false },
      { ...ironAsylumDefaultPricingPlans[1], enabled: true },
    ]);
    expect(plans).toHaveLength(1);
    expect(plans[0].name).toBe("Monthly");
  });
});
