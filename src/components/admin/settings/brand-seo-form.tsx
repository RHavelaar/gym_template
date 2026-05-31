"use client";

import type { BrandSeo } from "@/config/types";
import { ImageUploadField } from "@/components/admin/settings/image-upload-field";
import { BrandReviewCallout } from "@/components/admin/settings/brand-review-callout";
import { BRAND_SEO_FIELD_LABELS, BRAND_SEO_HELP } from "@/lib/brand-help";
import type { BrandReviewFieldKey, BrandTextFieldKey } from "@/lib/brand-review/fields";
import type { BrandReviewFieldResult } from "@/lib/brand-review/schema";
import { ASSET_UPLOAD_SPECS } from "@/lib/validation/content";
import { FieldLabelWithHint, SettingSectionTitle } from "@/components/ui/info-hint";
import { Input } from "@/components/ui/input";

type BrandSeoFormProps = {
  seo: BrandSeo;
  onChange: (seo: BrandSeo) => void;
  onTextFieldChange?: (fieldKey: BrandTextFieldKey, value: string) => void;
  fieldReviews?: Record<string, BrandReviewFieldResult>;
  onApplySuggestion?: (field: BrandReviewFieldResult) => void;
  fieldErrors?: Record<string, string>;
};

const renderCallout = (
  fieldKey: BrandReviewFieldKey,
  fieldReviews: BrandSeoFormProps["fieldReviews"],
  onApplySuggestion?: BrandSeoFormProps["onApplySuggestion"],
) => {
  const result = fieldReviews?.[fieldKey];
  if (!result) return null;
  return (
    <div data-brand-review-suggestion={result.status === "suggestion" ? true : undefined}>
      <BrandReviewCallout
        result={result}
        onApply={result.status === "suggestion" && onApplySuggestion ? () => onApplySuggestion(result) : undefined}
      />
    </div>
  );
};

export const BrandSeoForm = ({
  seo,
  onChange,
  onTextFieldChange,
  fieldReviews,
  onApplySuggestion,
  fieldErrors = {},
}: BrandSeoFormProps) => {
  const patch = (partial: Partial<BrandSeo>) => onChange({ ...seo, ...partial });

  const handleMetaTitle = (value: string) => {
    patch({ metaTitle: value });
    onTextFieldChange?.("metaTitle", value);
  };

  const handleMetaDescription = (value: string) => {
    patch({ metaDescription: value });
    onTextFieldChange?.("metaDescription", value);
  };

  const handleOgTitle = (value: string) => {
    patch({ ogTitle: value });
    onTextFieldChange?.("ogTitle", value);
  };

  const handleOgDescription = (value: string) => {
    patch({ ogDescription: value });
    onTextFieldChange?.("ogDescription", value);
  };

  const handleTwitterCard = (value: BrandSeo["twitterCard"]) => {
    patch({ twitterCard: value });
    onTextFieldChange?.("twitterCard", value);
  };

  return (
    <div className="space-y-6">
      <SettingSectionTitle
        title="Search & social sharing"
        size="lg"
        hint="Control how your gym appears in Google search, browser tabs, and when members share your link on social media."
        description="Leave title and description blank to use your gym name and site description from Identity above."
      />

      <div className="space-y-2">
        <FieldLabelWithHint
          htmlFor="meta-title"
          hint={BRAND_SEO_HELP.metaTitle.hint}
          hintLabel={`About ${BRAND_SEO_FIELD_LABELS.searchTitle}`}
        >
          {BRAND_SEO_FIELD_LABELS.searchTitle}
        </FieldLabelWithHint>
        <p className="text-xs text-(--gym-muted)">
          <span className="text-neutral-400">Recommended:</span> {BRAND_SEO_HELP.metaTitle.recommendation}
        </p>
        <Input
          id="meta-title"
          value={seo.metaTitle}
          aria-invalid={Boolean(fieldErrors["seo.metaTitle"])}
          onChange={(e) => handleMetaTitle(e.target.value)}
          placeholder="Defaults to gym name"
        />
        {fieldErrors["seo.metaTitle"] ? <p className="text-xs text-red-400">{fieldErrors["seo.metaTitle"]}</p> : null}
        <p className="text-xs text-neutral-500">{seo.metaTitle.length}/60 characters</p>
        {renderCallout("metaTitle", fieldReviews, onApplySuggestion)}
      </div>

      <div className="space-y-2">
        <FieldLabelWithHint
          htmlFor="meta-description"
          hint={BRAND_SEO_HELP.metaDescription.hint}
          hintLabel={`About ${BRAND_SEO_FIELD_LABELS.searchDescription}`}
        >
          {BRAND_SEO_FIELD_LABELS.searchDescription}
        </FieldLabelWithHint>
        <p className="text-xs text-(--gym-muted)">
          <span className="text-neutral-400">Recommended:</span> {BRAND_SEO_HELP.metaDescription.recommendation}
        </p>
        <textarea
          id="meta-description"
          rows={3}
          className="w-full rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3 py-2 text-white"
          value={seo.metaDescription}
          onChange={(e) => handleMetaDescription(e.target.value)}
          placeholder="Defaults to site description"
        />
        <p className="text-xs text-neutral-500">{seo.metaDescription.length}/160 characters</p>
        {renderCallout("metaDescription", fieldReviews, onApplySuggestion)}
      </div>

      <div className="space-y-2">
        <FieldLabelWithHint
          htmlFor="og-title"
          hint={BRAND_SEO_HELP.ogTitle.hint}
          hintLabel={`About ${BRAND_SEO_FIELD_LABELS.socialShareTitle}`}
        >
          {BRAND_SEO_FIELD_LABELS.socialShareTitle}
        </FieldLabelWithHint>
        <p className="text-xs text-(--gym-muted)">
          <span className="text-neutral-400">Recommended:</span> {BRAND_SEO_HELP.ogTitle.recommendation}
        </p>
        <Input
          id="og-title"
          value={seo.ogTitle}
          onChange={(e) => handleOgTitle(e.target.value)}
          placeholder="Defaults to browser tab & search title"
        />
        {renderCallout("ogTitle", fieldReviews, onApplySuggestion)}
      </div>

      <div className="space-y-2">
        <FieldLabelWithHint
          htmlFor="og-description"
          hint={BRAND_SEO_HELP.ogDescription.hint}
          hintLabel={`About ${BRAND_SEO_FIELD_LABELS.socialShareDescription}`}
        >
          {BRAND_SEO_FIELD_LABELS.socialShareDescription}
        </FieldLabelWithHint>
        <p className="text-xs text-(--gym-muted)">
          <span className="text-neutral-400">Recommended:</span> {BRAND_SEO_HELP.ogDescription.recommendation}
        </p>
        <textarea
          id="og-description"
          rows={2}
          className="w-full rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3 py-2 text-white"
          value={seo.ogDescription}
          onChange={(e) => handleOgDescription(e.target.value)}
          placeholder="Defaults to search result description"
        />
        {renderCallout("ogDescription", fieldReviews, onApplySuggestion)}
      </div>

      <div>
        <ImageUploadField
          label={BRAND_SEO_FIELD_LABELS.socialShareImage}
          assetType="og"
          currentUrl={seo.ogImageUrl || undefined}
          onUploaded={(url) => patch({ ogImageUrl: url })}
          hint={BRAND_SEO_HELP.ogImage.hint}
          recommendation={`${ASSET_UPLOAD_SPECS.og.dimensions} (${ASSET_UPLOAD_SPECS.og.aspectRatio}). ${BRAND_SEO_HELP.ogImage.recommendation}`}
          usedFor={BRAND_SEO_HELP.ogImage.usedFor}
        />
        {renderCallout("ogImageUrl", fieldReviews, onApplySuggestion)}
      </div>

      <div className="space-y-2">
        <FieldLabelWithHint
          hint={BRAND_SEO_HELP.twitterCard.hint}
          hintLabel={`About ${BRAND_SEO_FIELD_LABELS.twitterCard}`}
        >
          {BRAND_SEO_FIELD_LABELS.twitterCard}
        </FieldLabelWithHint>
        <p className="text-xs text-(--gym-muted)">
          <span className="text-neutral-400">Recommended:</span> {BRAND_SEO_HELP.twitterCard.recommendation}
        </p>
        <select
          value={seo.twitterCard}
          onChange={(e) => handleTwitterCard(e.target.value as BrandSeo["twitterCard"])}
          className="w-full rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3 py-2 text-sm text-white"
        >
          <option value="summary_large_image">Large image (recommended)</option>
          <option value="summary">Summary (small)</option>
        </select>
        {renderCallout("twitterCard", fieldReviews, onApplySuggestion)}
      </div>

      <div>
        <ImageUploadField
          label={BRAND_SEO_FIELD_LABELS.favicon}
          assetType="favicon"
          currentUrl={seo.faviconUrl || undefined}
          onUploaded={(url) => patch({ faviconUrl: url })}
          hint={BRAND_SEO_HELP.favicon.hint}
          recommendation={BRAND_SEO_HELP.favicon.recommendation}
          usedFor={BRAND_SEO_HELP.favicon.usedFor}
        />
        {renderCallout("faviconUrl", fieldReviews, onApplySuggestion)}
      </div>

      <div>
        <ImageUploadField
          label={BRAND_SEO_FIELD_LABELS.appleTouchIcon}
          assetType="favicon"
          currentUrl={seo.appleTouchIconUrl || undefined}
          onUploaded={(url) => patch({ appleTouchIconUrl: url })}
          hint={BRAND_SEO_HELP.appleTouchIcon.hint}
          recommendation={BRAND_SEO_HELP.appleTouchIcon.recommendation}
          usedFor={BRAND_SEO_HELP.appleTouchIcon.usedFor}
        />
        {renderCallout("appleTouchIconUrl", fieldReviews, onApplySuggestion)}
      </div>
    </div>
  );
};
