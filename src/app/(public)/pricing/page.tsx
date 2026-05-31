import type { Metadata } from "next";
import Link from "next/link";
import { PricingPlanGrid } from "@/components/pricing/pricing-plan-grid";
import {
  getResolvedGymConfig,
  getResolvedPricingPageSettings,
  getResolvedPricingPlans,
} from "@/lib/gym-config-resolver";

export async function generateMetadata(): Promise<Metadata> {
  const [config, page] = await Promise.all([getResolvedGymConfig(), getResolvedPricingPageSettings()]);
  const description = page.metaDescription.trim() || page.subtitle || config.tagline;
  return {
    title: page.headline,
    description,
  };
}

export default async function PricingPage() {
  const [config, page, plans] = await Promise.all([
    getResolvedGymConfig(),
    getResolvedPricingPageSettings(),
    getResolvedPricingPlans(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{page.headline}</h1>
        {page.subtitle ? <p className="mt-3 text-base text-(--gym-muted) sm:text-lg">{page.subtitle}</p> : null}
      </header>

      <div className="mt-10">
        <PricingPlanGrid plans={plans} />
      </div>

      {page.footnote ? (
        <p className="mt-10 max-w-3xl text-sm leading-relaxed text-(--gym-muted)">{page.footnote}</p>
      ) : null}

      <div className="mt-10 rounded-2xl border border-(--gym-border) bg-(--gym-surface) px-6 py-8 text-center sm:px-10">
        <p className="text-lg font-bold">Not sure which option fits?</p>
        <p className="mt-2 text-sm text-(--gym-muted)">
          Tour the gym or ask about corporate, student, and family rates.
        </p>
        <Link
          href="/contact"
          className="mt-5 inline-flex min-h-12 items-center justify-center rounded-lg bg-(--gym-primary) px-6 text-sm font-bold text-(--gym-primary-fg) hover:opacity-90"
        >
          Contact {config.name}
        </Link>
      </div>
    </div>
  );
}
