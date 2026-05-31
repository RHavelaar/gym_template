"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import type { GymPricingPlan, PricingPageSettings } from "@/config/types";
import { savePricingPageSettingsAction, savePricingPlansAction } from "@/app/actions/pages";
import { ImageUploadField } from "@/components/admin/settings/image-upload-field";
import { MarketingPagePreviewFrame } from "@/components/admin/settings/marketing-page-preview-frame";
import { SettingsEditorShell } from "@/components/admin/settings/settings-editor-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldLabelWithHint, SettingSectionTitle } from "@/components/ui/info-hint";
import { Input } from "@/components/ui/input";
import { PRICING_PAGE_HELP } from "@/lib/page-help";
import { createEmptyPricingPlan, sortPricingPlans } from "@/lib/pricing-plans";
import { useAppAction } from "@/hooks/use-app-action";
import type { PricingBillingInterval } from "@/config/types";

const BILLING_OPTIONS: { value: PricingBillingInterval; label: string }[] = [
  { value: "day", label: "Per day" },
  { value: "week", label: "Per week" },
  { value: "month", label: "Per month" },
  { value: "year", label: "Per year" },
  { value: "one_time", label: "One-time" },
  { value: "custom", label: "Custom" },
];

type PricingSettingsFormProps = {
  initialPage: PricingPageSettings;
  initialPlans: GymPricingPlan[];
};

export const PricingSettingsForm = ({ initialPage, initialPlans }: PricingSettingsFormProps) => {
  const [pageDraft, setPageDraft] = useState<PricingPageSettings>(initialPage);
  const [plansDraft, setPlansDraft] = useState<GymPricingPlan[]>(sortPricingPlans(initialPlans));
  const { runAction, pending: saving } = useAppAction();

  const setPage = (patch: Partial<PricingPageSettings>) => {
    setPageDraft((prev) => ({ ...prev, ...patch }));
  };

  const updatePlan = (id: string, patch: Partial<GymPricingPlan>) => {
    setPlansDraft((prev) => prev.map((plan) => (plan.id === id ? { ...plan, ...patch } : plan)));
  };

  const handleMovePlan = (id: string, direction: "up" | "down") => {
    setPlansDraft((prev) => {
      const sorted = sortPricingPlans(prev);
      const index = sorted.findIndex((plan) => plan.id === id);
      if (index < 0) return prev;
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= sorted.length) return prev;
      const next = [...sorted];
      const currentOrder = next[index].sortOrder;
      next[index] = { ...next[index], sortOrder: next[swapIndex].sortOrder };
      next[swapIndex] = { ...next[swapIndex], sortOrder: currentOrder };
      return sortPricingPlans(next);
    });
  };

  const handleAddPlan = () => {
    if (plansDraft.length >= 12) return;
    const maxOrder = plansDraft.reduce((max, plan) => Math.max(max, plan.sortOrder), 0);
    setPlansDraft((prev) => [...prev, createEmptyPricingPlan(maxOrder + 1)]);
  };

  const handleRemovePlan = (id: string) => {
    setPlansDraft((prev) => prev.filter((plan) => plan.id !== id));
  };

  const handleFeatureChange = (planId: string, index: number, value: string) => {
    setPlansDraft((prev) =>
      prev.map((plan) => {
        if (plan.id !== planId) return plan;
        const features = [...plan.features];
        features[index] = value;
        return { ...plan, features };
      }),
    );
  };

  const handleAddFeature = (planId: string) => {
    setPlansDraft((prev) =>
      prev.map((plan) => (plan.id === planId ? { ...plan, features: [...plan.features, ""] } : plan)),
    );
  };

  const handleRemoveFeature = (planId: string, index: number) => {
    setPlansDraft((prev) =>
      prev.map((plan) => {
        if (plan.id !== planId) return plan;
        return { ...plan, features: plan.features.filter((_, i) => i !== index) };
      }),
    );
  };

  const handleSavePage = async () => {
    await runAction(() => savePricingPageSettingsAction(pageDraft), {
      successMessage: "Pricing page copy saved.",
    });
  };

  const handleSavePlans = async () => {
    const normalized = sortPricingPlans(plansDraft).map((plan, index) => ({
      ...plan,
      sortOrder: index + 1,
      features: plan.features.map((f) => f.trim()).filter(Boolean),
    }));
    await runAction(() => savePricingPlansAction(normalized), {
      successMessage: "Pricing plans saved.",
    });
  };

  const sortedPlans = sortPricingPlans(plansDraft);

  return (
    <SettingsEditorShell
      title="Pricing & plans"
      description="Build membership cards with photos, prices, and sign-up links. Page copy and plan cards appear on your public pricing page."
      stickyPreview={{
        preview: <MarketingPagePreviewFrame path="/pricing" />,
        editorBlocks: [
          {
            id: "copy",
            editorLabel: "Page copy",
            editor: (
              <Card id="edit-copy" className="scroll-mt-24 space-y-5">
                <SettingSectionTitle title="Page copy" />
                <div>
                  <FieldLabelWithHint htmlFor="pricing-headline" hint={PRICING_PAGE_HELP.headline.hint}>
                    Headline
                  </FieldLabelWithHint>
                  <Input
                    id="pricing-headline"
                    value={pageDraft.headline}
                    onChange={(e) => setPage({ headline: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <FieldLabelWithHint htmlFor="pricing-subtitle" hint={PRICING_PAGE_HELP.subtitle.hint}>
                    Subtitle
                  </FieldLabelWithHint>
                  <textarea
                    id="pricing-subtitle"
                    value={pageDraft.subtitle}
                    onChange={(e) => setPage({ subtitle: e.target.value })}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <FieldLabelWithHint htmlFor="pricing-footnote" hint={PRICING_PAGE_HELP.footnote.hint}>
                    Footnote
                  </FieldLabelWithHint>
                  <textarea
                    id="pricing-footnote"
                    value={pageDraft.footnote}
                    onChange={(e) => setPage({ footnote: e.target.value })}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3 py-2 text-white"
                  />
                </div>
                <Button type="button" onClick={handleSavePage} disabled={saving} variant="secondary">
                  Save page copy
                </Button>
              </Card>
            ),
          },
          {
            id: "plans",
            editorLabel: "Plans",
            editor: (
              <Card id="edit-plans" className="scroll-mt-24 space-y-6">
                <SettingSectionTitle title="Membership plans" />
                <p className="text-xs text-(--gym-muted)">{PRICING_PAGE_HELP.priceDisplay.recommendation}</p>
                {sortedPlans.map((plan, index) => (
                  <div key={plan.id} className="space-y-4 rounded-xl border border-(--gym-border) p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-bold">{plan.name || `Plan ${index + 1}`}</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={index === 0}
                          onClick={() => handleMovePlan(plan.id, "up")}
                          aria-label="Move plan up"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={index === sortedPlans.length - 1}
                          onClick={() => handleMovePlan(plan.id, "down")}
                          aria-label="Move plan down"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="secondary" size="sm" onClick={() => handleRemovePlan(plan.id)}>
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </Button>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={plan.enabled}
                        onChange={(e) => updatePlan(plan.id, { enabled: e.target.checked })}
                      />
                      Show on pricing page
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={plan.isFeatured}
                        onChange={(e) => updatePlan(plan.id, { isFeatured: e.target.checked })}
                      />
                      Featured plan (highlighted card)
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <FieldLabelWithHint htmlFor={`plan-name-${plan.id}`} hint={PRICING_PAGE_HELP.planName.hint}>
                          Plan name
                        </FieldLabelWithHint>
                        <Input
                          id={`plan-name-${plan.id}`}
                          value={plan.name}
                          onChange={(e) => updatePlan(plan.id, { name: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <FieldLabelWithHint htmlFor={`plan-badge-${plan.id}`} hint="Optional label on the photo.">
                          Badge
                        </FieldLabelWithHint>
                        <Input
                          id={`plan-badge-${plan.id}`}
                          value={plan.badge}
                          onChange={(e) => updatePlan(plan.id, { badge: e.target.value })}
                          placeholder="Most popular"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <FieldLabelWithHint htmlFor={`plan-tagline-${plan.id}`}>Short tagline</FieldLabelWithHint>
                      <Input
                        id={`plan-tagline-${plan.id}`}
                        value={plan.tagline}
                        onChange={(e) => updatePlan(plan.id, { tagline: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <FieldLabelWithHint htmlFor={`plan-desc-${plan.id}`}>Description</FieldLabelWithHint>
                      <textarea
                        id={`plan-desc-${plan.id}`}
                        value={plan.description}
                        onChange={(e) => updatePlan(plan.id, { description: e.target.value })}
                        rows={2}
                        className="mt-1 w-full rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3 py-2 text-white"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <FieldLabelWithHint
                          htmlFor={`plan-price-${plan.id}`}
                          hint={PRICING_PAGE_HELP.priceDisplay.hint}
                        >
                          Price display
                        </FieldLabelWithHint>
                        <Input
                          id={`plan-price-${plan.id}`}
                          value={plan.priceDisplay}
                          onChange={(e) => updatePlan(plan.id, { priceDisplay: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <FieldLabelWithHint htmlFor={`plan-compare-${plan.id}`} hint="Optional strikethrough price.">
                          Compare-at
                        </FieldLabelWithHint>
                        <Input
                          id={`plan-compare-${plan.id}`}
                          value={plan.compareAtDisplay}
                          onChange={(e) => updatePlan(plan.id, { compareAtDisplay: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <FieldLabelWithHint
                          htmlFor={`plan-duration-${plan.id}`}
                          hint={PRICING_PAGE_HELP.durationLabel.hint}
                        >
                          Duration label
                        </FieldLabelWithHint>
                        <Input
                          id={`plan-duration-${plan.id}`}
                          value={plan.durationLabel}
                          onChange={(e) => updatePlan(plan.id, { durationLabel: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <FieldLabelWithHint htmlFor={`plan-interval-${plan.id}`}>Billing interval</FieldLabelWithHint>
                      <select
                        id={`plan-interval-${plan.id}`}
                        value={plan.billingInterval}
                        onChange={(e) =>
                          updatePlan(plan.id, { billingInterval: e.target.value as PricingBillingInterval })
                        }
                        className="mt-1 min-h-12 w-full rounded-lg border border-(--gym-border) bg-black/40 px-4 text-white"
                      >
                        {BILLING_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <ImageUploadField
                      label="Plan photo"
                      assetType="gallery"
                      currentUrl={plan.imageUrl || undefined}
                      onUploaded={(url) => updatePlan(plan.id, { imageUrl: url })}
                      hint={PRICING_PAGE_HELP.planImage.hint}
                      recommendation={PRICING_PAGE_HELP.planImage.recommendation}
                      usedFor="Pricing plan card"
                    />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Features</p>
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex gap-2">
                          <Input
                            value={feature}
                            onChange={(e) => handleFeatureChange(plan.id, featureIndex, e.target.value)}
                            placeholder="Unlimited access"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRemoveFeature(plan.id, featureIndex)}
                            aria-label="Remove feature"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="secondary" size="sm" onClick={() => handleAddFeature(plan.id)}>
                        <Plus className="mr-1 h-4 w-4" aria-hidden />
                        Add feature
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <FieldLabelWithHint htmlFor={`plan-cta-label-${plan.id}`}>Button label</FieldLabelWithHint>
                        <Input
                          id={`plan-cta-label-${plan.id}`}
                          value={plan.ctaLabel}
                          onChange={(e) => updatePlan(plan.id, { ctaLabel: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <FieldLabelWithHint htmlFor={`plan-cta-href-${plan.id}`} hint="/sign-up or /contact">
                          Button link
                        </FieldLabelWithHint>
                        <Input
                          id={`plan-cta-href-${plan.id}`}
                          value={plan.ctaHref}
                          onChange={(e) => updatePlan(plan.id, { ctaHref: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={handleAddPlan} disabled={plansDraft.length >= 12}>
                  <Plus className="mr-1 h-4 w-4" aria-hidden />
                  Add plan
                </Button>
                <Button type="button" onClick={handleSavePlans} disabled={saving}>
                  {saving ? "Saving…" : "Save all plans"}
                </Button>
              </Card>
            ),
          },
        ],
      }}
    />
  );
};
