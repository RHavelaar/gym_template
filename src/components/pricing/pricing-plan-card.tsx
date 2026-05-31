import Image from "next/image";
import Link from "next/link";
import type { GymPricingPlan } from "@/config/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PricingPlanCardProps = {
  plan: GymPricingPlan;
};

export const PricingPlanCard = ({ plan }: PricingPlanCardProps) => {
  const isExternal = plan.ctaHref.startsWith("http");

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border bg-(--gym-surface) transition",
        plan.isFeatured ? "border-(--gym-primary) shadow-[0_0_0_1px_var(--gym-primary)]" : "border-(--gym-border)",
      )}
    >
      {plan.imageUrl ? (
        <div className="relative aspect-16/10 w-full overflow-hidden bg-black/40">
          <Image
            src={plan.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
            unoptimized={plan.imageUrl.startsWith("data:")}
          />
          {plan.badge ? (
            <span className="absolute top-3 left-3 rounded-full bg-(--gym-primary) px-3 py-1 text-xs font-bold tracking-wide text-(--gym-primary-fg) uppercase">
              {plan.badge}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold">{plan.name}</h3>
          {plan.tagline ? <p className="text-sm text-(--gym-muted)">{plan.tagline}</p> : null}
        </div>

        <div className="mt-4 flex flex-wrap items-baseline gap-2">
          <p className="text-3xl font-black tracking-tight text-(--gym-accent)">{plan.priceDisplay}</p>
          {plan.compareAtDisplay ? (
            <p className="text-sm text-(--gym-muted) line-through">{plan.compareAtDisplay}</p>
          ) : null}
        </div>
        {plan.durationLabel ? (
          <p className="mt-1 text-xs font-medium tracking-wide text-(--gym-muted) uppercase">{plan.durationLabel}</p>
        ) : null}

        {plan.description ? (
          <p className="mt-4 text-sm leading-relaxed text-(--gym-muted)">{plan.description}</p>
        ) : null}

        {plan.features.length > 0 ? (
          <ul className="mt-4 flex-1 space-y-2 text-sm">
            {plan.features.map((feature) => (
              <li key={feature} className="flex gap-2">
                <span className="text-(--gym-accent)" aria-hidden>
                  ✓
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex-1" />
        )}

        <div className="mt-6">
          {isExternal ? (
            <a href={plan.ctaHref} target="_blank" rel="noopener noreferrer" className="block">
              <Button size="lg" className="min-h-12 w-full">
                {plan.ctaLabel}
              </Button>
            </a>
          ) : (
            <Link href={plan.ctaHref} className="block">
              <Button size="lg" variant={plan.isFeatured ? "default" : "secondary"} className="min-h-12 w-full">
                {plan.ctaLabel}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};
