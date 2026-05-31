import type { GymPricingPlan } from "@/config/types";
import { PricingPlanCard } from "@/components/pricing/pricing-plan-card";
import { getVisiblePricingPlans } from "@/lib/pricing-plans";

type PricingPlanGridProps = {
  plans: GymPricingPlan[];
};

export const PricingPlanGrid = ({ plans }: PricingPlanGridProps) => {
  const visible = getVisiblePricingPlans(plans);

  if (!visible.length) {
    return (
      <p className="rounded-xl border border-(--gym-border) bg-(--gym-surface) px-6 py-10 text-center text-(--gym-muted)">
        Membership options are being updated. Contact the gym for current rates.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((plan) => (
        <PricingPlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
};
