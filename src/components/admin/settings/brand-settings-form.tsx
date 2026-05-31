"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { BrandCustomFont, GymConfig, HomepageSection } from "@/config/types";
import { refreshBrandPreviewSectionsAction, updateBrandAction, uploadGymAssetAction } from "@/app/actions/content";
import { BrandAiPanel } from "@/components/admin/settings/brand-ai-panel";
import { BrandInterviewPreviewModal } from "@/components/admin/settings/brand-interview-preview-modal";
import { BrandInterviewWizardModal } from "@/components/admin/settings/brand-interview-wizard-modal";
import { BrandKitExportPanel } from "@/components/admin/settings/brand-kit-export-panel";
import { BrandPreviewPanel } from "@/components/admin/settings/brand-preview-panel";
import { BrandReviewCallout } from "@/components/admin/settings/brand-review-callout";
import { BrandReviewScorecardModal } from "@/components/admin/settings/brand-review-scorecard-modal";
import { BrandSeoForm } from "@/components/admin/settings/brand-seo-form";
import { BrandTypographyForm, type PendingBrandFont } from "@/components/admin/settings/brand-typography-form";
import { ThemeColorsForm } from "@/components/admin/settings/theme-colors-form";
import { ImageUploadField } from "@/components/admin/settings/image-upload-field";
import { SettingsEditorShell } from "@/components/admin/settings/settings-editor-shell";
import { scrollToFirstSuggestion } from "@/lib/brand-review/draft-ai-helpers";
import type { BrandReviewFieldKey } from "@/lib/brand-review/fields";
import { BRAND_IDENTITY_HELP } from "@/lib/brand-help";
import {
  extractBrandPreviewDraft,
  extractBrandSaveDraft,
  isBrandDraftDirty,
  makeCustomFontId,
  normalizeCustomFont,
  type BrandSaveDraft,
} from "@/lib/brand-settings";
import { firstBrandErrorSection, formatBrandFieldErrors, validateBrandDraft } from "@/lib/brand-settings-validation";
import { ASSET_UPLOAD_SPECS } from "@/lib/validation/content";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldLabelWithHint, SettingSectionTitle } from "@/components/ui/info-hint";
import { Input } from "@/components/ui/input";
import { useActiveEditorSection } from "@/hooks/use-active-editor-section";
import { useBrandDraftAi } from "@/hooks/use-brand-draft-ai";
import { useAppAction } from "@/hooks/use-app-action";
import { cn } from "@/lib/utils";

type BrandSettingsFormProps = {
  initialConfig: GymConfig;
  homepageSections: HomepageSection[];
  aiEnabled: boolean;
};

const BRAND_SECTION_IDS = ["identity", "colors", "typography", "seo"] as const;

const mergePendingFont = (
  typography: GymConfig["typography"],
  pendingFont: PendingBrandFont | null,
): GymConfig["typography"] => {
  if (!pendingFont) return typography;

  const tempCustom: BrandCustomFont = {
    id: pendingFont.tempId,
    name: pendingFont.displayName,
    url: pendingFont.blobUrl,
    format: pendingFont.format,
  };

  return {
    ...typography,
    customFonts: [...typography.customFonts.filter((font) => font.id !== pendingFont.tempId), tempCustom],
  };
};

export const BrandSettingsForm = ({
  initialConfig,
  homepageSections: initialSections,
  aiEnabled,
}: BrandSettingsFormProps) => {
  const ai = useBrandDraftAi(initialConfig, aiEnabled);
  const { runAction, pending: saving } = useAppAction();

  const [homepageSections, setHomepageSections] = useState(initialSections);
  const [savedSnapshot, setSavedSnapshot] = useState<BrandSaveDraft>(() => extractBrandSaveDraft(initialConfig));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pendingFont, setPendingFont] = useState<PendingBrandFont | null>(null);
  const [refreshingSections, setRefreshingSections] = useState(false);
  const pendingFontRef = useRef<PendingBrandFont | null>(null);

  const activeSectionId = useActiveEditorSection({ sectionIds: [...BRAND_SECTION_IDS] });

  const saveDraft = extractBrandSaveDraft(ai.draft);
  const isDirty = isBrandDraftDirty(savedSnapshot, saveDraft) || pendingFont !== null;

  const previewDraft = useMemo(
    () =>
      extractBrandPreviewDraft({
        ...ai.draft,
        typography: mergePendingFont(ai.draft.typography, pendingFont),
      }),
    [ai.draft, pendingFont],
  );

  useEffect(() => {
    pendingFontRef.current = pendingFont;
  }, [pendingFont]);

  useEffect(() => {
    return () => {
      const pending = pendingFontRef.current;
      if (pending?.blobUrl.startsWith("blob:")) {
        URL.revokeObjectURL(pending.blobUrl);
      }
    };
  }, []);

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const renderReviewCallout = (fieldKey: BrandReviewFieldKey) => {
    const result = ai.fieldReviews?.[fieldKey];
    if (!result) return null;
    return (
      <div data-brand-review-suggestion={result.status === "suggestion" ? true : undefined}>
        <BrandReviewCallout
          result={result}
          onApply={result.status === "suggestion" ? () => ai.handleApplySuggestion(result) : undefined}
        />
      </div>
    );
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(`edit-${sectionId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleRefreshSections = async () => {
    setRefreshingSections(true);
    const result = await runAction(() => refreshBrandPreviewSectionsAction(), {
      successMessage: "Homepage preview content refreshed.",
    });
    setRefreshingSections(false);
    if (result.ok && result.data?.sections) {
      setHomepageSections(result.data.sections);
    }
  };

  const uploadPendingFont = async (): Promise<GymConfig["typography"] | null> => {
    if (!pendingFont) return ai.draft.typography;

    const formData = new FormData();
    formData.set("assetType", "font");
    formData.set("file", pendingFont.file);
    formData.set("fileName", pendingFont.displayName);

    const result = await uploadGymAssetAction(formData);
    if (!result.ok) return null;

    const custom = normalizeCustomFont({
      id: makeCustomFontId(),
      name: pendingFont.displayName,
      url: result.data!.url,
      format: pendingFont.format,
    });

    if (pendingFont.blobUrl.startsWith("blob:")) {
      URL.revokeObjectURL(pendingFont.blobUrl);
    }

    return {
      ...ai.draft.typography,
      customFonts: [...ai.draft.typography.customFonts, custom],
    };
  };

  const handleSave = async () => {
    setFieldErrors({});

    let typography = ai.draft.typography;
    if (pendingFont) {
      const uploadedTypography = await uploadPendingFont();
      if (!uploadedTypography) return;
      typography = uploadedTypography;
    }

    const payload = {
      name: ai.draft.name,
      tagline: ai.draft.tagline,
      description: ai.draft.description,
      logoUrl: ai.draft.logoUrl,
      theme: ai.draft.theme,
      typography,
      seo: ai.draft.seo,
    };

    const parsed = validateBrandDraft(payload);
    if (!parsed.success) {
      const errors = formatBrandFieldErrors(parsed.error);
      setFieldErrors(errors);
      const sectionId = firstBrandErrorSection(errors, [...BRAND_SECTION_IDS]);
      if (sectionId) scrollToSection(sectionId);
      return;
    }

    await runAction(() => updateBrandAction(payload), {
      successMessage: "Brand settings saved.",
      onSuccess: () => {
        const nextDraft = { ...ai.draft, typography };
        ai.setDraft(nextDraft);
        setSavedSnapshot(extractBrandSaveDraft(nextDraft));
        setPendingFont(null);
      },
    });
  };

  return (
    <>
      <SettingsEditorShell
        title="Brand & identity"
        description="Your full brand kit — name, logo, theme colors, typography, search & social sharing, and shareable exports. One live preview shows your real homepage with unsaved changes applied."
        header={
          <BrandAiPanel
            aiEnabled={aiEnabled}
            reviewPending={ai.reviewPending}
            onWriteCopy={() => ai.setInterviewOpen(true)}
            onReviewCopy={ai.handleReview}
          />
        }
        stickyPreview={{
          preview: (
            <BrandPreviewPanel
              baseConfig={initialConfig}
              draft={previewDraft}
              sections={homepageSections}
              activeSectionId={activeSectionId}
              onRefreshSections={handleRefreshSections}
              refreshing={refreshingSections}
            />
          ),
          editorBlocks: [
            {
              id: "identity",
              editorLabel: "Identity",
              editor: (
                <Card id="edit-identity" className="scroll-mt-24 space-y-5 p-4 transition-shadow sm:p-5 lg:w-full">
                  <SettingSectionTitle
                    title="Identity"
                    size="lg"
                    hint="Core gym identity shown in the header, homepage hero tagline, and search previews."
                    description="Set your official name, tagline, site description, and logo."
                  />

                  <div>
                    <FieldLabelWithHint htmlFor="name" hint={BRAND_IDENTITY_HELP.name.hint} hintLabel="About gym name">
                      Gym name
                    </FieldLabelWithHint>
                    <p className="mb-2 text-xs text-(--gym-muted)">
                      <span className="text-neutral-400">Recommended:</span> {BRAND_IDENTITY_HELP.name.recommendation}
                    </p>
                    <Input
                      id="name"
                      value={ai.draft.name}
                      aria-invalid={Boolean(fieldErrors.name)}
                      onChange={(e) => ai.setTextField("name", e.target.value)}
                    />
                    {fieldErrors.name ? <p className="mt-1 text-xs text-red-400">{fieldErrors.name}</p> : null}
                    {renderReviewCallout("name")}
                  </div>

                  <div>
                    <FieldLabelWithHint
                      htmlFor="tagline"
                      hint={BRAND_IDENTITY_HELP.tagline.hint}
                      hintLabel="About tagline"
                    >
                      Tagline
                    </FieldLabelWithHint>
                    <p className="mb-2 text-xs text-(--gym-muted)">
                      <span className="text-neutral-400">Recommended:</span>{" "}
                      {BRAND_IDENTITY_HELP.tagline.recommendation}
                    </p>
                    <Input
                      id="tagline"
                      value={ai.draft.tagline}
                      aria-invalid={Boolean(fieldErrors.tagline)}
                      onChange={(e) => ai.setTextField("tagline", e.target.value)}
                    />
                    {fieldErrors.tagline ? <p className="mt-1 text-xs text-red-400">{fieldErrors.tagline}</p> : null}
                    {renderReviewCallout("tagline")}
                  </div>

                  <div>
                    <FieldLabelWithHint
                      htmlFor="description"
                      hint={BRAND_IDENTITY_HELP.description.hint}
                      hintLabel="About site description"
                    >
                      Site description
                    </FieldLabelWithHint>
                    <p className="mb-2 text-xs text-(--gym-muted)">
                      <span className="text-neutral-400">Recommended:</span>{" "}
                      {BRAND_IDENTITY_HELP.description.recommendation}
                    </p>
                    <textarea
                      id="description"
                      rows={3}
                      className={cn(
                        "w-full rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3 py-2 text-white",
                        fieldErrors.description && "border-red-500/50",
                      )}
                      value={ai.draft.description}
                      aria-invalid={Boolean(fieldErrors.description)}
                      onChange={(e) => ai.setTextField("description", e.target.value)}
                    />
                    {fieldErrors.description ? (
                      <p className="mt-1 text-xs text-red-400">{fieldErrors.description}</p>
                    ) : null}
                    {renderReviewCallout("description")}
                  </div>

                  <div>
                    <ImageUploadField
                      label="Logo"
                      assetType="logo"
                      currentUrl={ai.draft.logoUrl}
                      onUploaded={(url) => ai.setDraft({ ...ai.draft, logoUrl: url })}
                      hint={BRAND_IDENTITY_HELP.logo.hint}
                      recommendation={`${ASSET_UPLOAD_SPECS.logo.dimensions} (${ASSET_UPLOAD_SPECS.logo.aspectRatio}). ${BRAND_IDENTITY_HELP.logo.recommendation}`}
                      usedFor={BRAND_IDENTITY_HELP.logo.usedFor}
                    />
                    {fieldErrors.logoUrl ? <p className="mt-1 text-xs text-red-400">{fieldErrors.logoUrl}</p> : null}
                    {renderReviewCallout("logoUrl")}
                  </div>
                </Card>
              ),
            },
            {
              id: "colors",
              editorLabel: "Theme colors",
              editor: (
                <Card id="edit-colors" className="scroll-mt-24 space-y-4 p-4 transition-shadow sm:p-5 lg:w-full">
                  <ThemeColorsForm
                    theme={ai.draft.theme}
                    onChange={(theme) => ai.setDraft({ ...ai.draft, theme })}
                    fieldErrors={fieldErrors}
                  />
                </Card>
              ),
            },
            {
              id: "typography",
              editorLabel: "Typography",
              editor: (
                <Card id="edit-typography" className="scroll-mt-24 space-y-4 p-4 transition-shadow sm:p-5 lg:w-full">
                  <BrandTypographyForm
                    typography={ai.draft.typography}
                    onChange={(typography) => ai.setDraft({ ...ai.draft, typography })}
                    pendingFont={pendingFont}
                    onPendingFontChange={setPendingFont}
                    fieldErrors={fieldErrors}
                  />
                </Card>
              ),
            },
            {
              id: "seo",
              editorLabel: "Search & social",
              editor: (
                <Card id="edit-seo" className="scroll-mt-24 space-y-4 p-4 transition-shadow sm:p-5 lg:w-full">
                  <BrandSeoForm
                    seo={ai.draft.seo}
                    onChange={(seo) => ai.setDraft({ ...ai.draft, seo })}
                    onTextFieldChange={ai.setTextField}
                    fieldReviews={ai.fieldReviews}
                    onApplySuggestion={ai.handleApplySuggestion}
                    fieldErrors={fieldErrors}
                  />
                </Card>
              ),
            },
          ],
        }}
        footer={
          <div className="space-y-6">
            <Card className="space-y-4 p-4 sm:p-5">
              <BrandKitExportPanel config={ai.draft} />
            </Card>

            {isDirty ? <p className="text-center text-xs text-(--gym-muted)">Unsaved changes</p> : null}

            <Button type="button" size="lg" className="w-full" disabled={saving} onClick={handleSave}>
              {saving ? "Saving…" : isDirty ? "Save changes*" : "Save changes"}
            </Button>
          </div>
        }
      />

      {ai.reviewResult && ai.scorecardOpen ? (
        <BrandReviewScorecardModal
          open={ai.scorecardOpen}
          result={ai.reviewResult}
          onClose={() => ai.setScorecardOpen(false)}
          onApplyAll={ai.handleApplyAllSuggestions}
          onScrollToFirstSuggestion={scrollToFirstSuggestion}
        />
      ) : null}

      <BrandInterviewWizardModal
        open={ai.interviewOpen}
        draftName={ai.draft.name}
        hasExistingCopy={ai.hasExistingCopy}
        onClose={() => ai.setInterviewOpen(false)}
        onComplete={ai.handleInterviewComplete}
      />

      <BrandInterviewPreviewModal
        open={ai.previewOpen}
        generated={ai.generatedCopy}
        generating={ai.generatingCopy}
        generationFailed={ai.copyGenerationFailed}
        onClose={() => ai.setPreviewOpen(false)}
        onApply={ai.handleApplyGenerated}
        onStartOver={() => {
          ai.setPreviewOpen(false);
          ai.setInterviewOpen(true);
        }}
      />
    </>
  );
};
