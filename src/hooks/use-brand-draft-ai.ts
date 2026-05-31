"use client";

import { useCallback, useState } from "react";
import type { GymConfig } from "@/config/types";
import { generateBrandCopyAction, reviewBrandCopyAction } from "@/app/actions/brand-ai";
import { useErrorToast } from "@/lib/errors/show-error-toast";
import { applyAllBrandReviewSuggestions, applyBrandReviewSuggestion } from "@/lib/brand-review/apply-suggestions";
import { recordAcceptedField, recordAcceptedFields } from "@/lib/brand-review/accepted-fields";
import type { AcceptedField } from "@/lib/brand-review/fields";
import { buildReviewInput, hasExistingBrandCopy, patchDraftField } from "@/lib/brand-review/draft-ai-helpers";
import { pruneAcceptedOnFieldEdit } from "@/lib/brand-review/accepted-fields";
import { fieldResultsToMap } from "@/lib/brand-review/merge-results";
import type { BrandReviewFieldResult, BrandReviewResult } from "@/lib/brand-review/schema";
import type { BrandTextFieldKey } from "@/lib/brand-review/fields";
import { applyGeneratedCopy, generatedFieldsToAccepted } from "@/lib/brand-interview/apply-generated";
import type { BrandGeneratedCopy, InterviewAnswers } from "@/lib/brand-interview/schema";
import { useAppAction } from "@/hooks/use-app-action";

export const useBrandDraftAi = (initialConfig: GymConfig, aiEnabled: boolean) => {
  const [draft, setDraft] = useState(initialConfig);
  const [acceptedFields, setAcceptedFields] = useState<AcceptedField[]>([]);
  const [reviewResult, setReviewResult] = useState<BrandReviewResult | null>(null);
  const [scorecardOpen, setScorecardOpen] = useState(false);
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generatingCopy, setGeneratingCopy] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState<BrandGeneratedCopy | null>(null);
  const [copyGenerationFailed, setCopyGenerationFailed] = useState(false);
  const { runAction, pending: reviewPending } = useAppAction();
  const { showError } = useErrorToast();

  const fieldReviews = reviewResult ? fieldResultsToMap(reviewResult.fields) : undefined;

  const setTextField = useCallback((fieldKey: BrandTextFieldKey, value: string) => {
    setDraft((prev) => patchDraftField(prev, fieldKey, value));
    setAcceptedFields((prev) => pruneAcceptedOnFieldEdit(prev, fieldKey));
  }, []);

  const handleReview = async () => {
    if (!aiEnabled) return;
    const result = await runAction(() => reviewBrandCopyAction(buildReviewInput(draft, acceptedFields)), {
      successMessage: "Brand review complete.",
    });
    if (result.ok && result.data) {
      setReviewResult(result.data);
      setScorecardOpen(true);
    }
  };

  const handleApplySuggestion = (field: BrandReviewFieldResult) => {
    if (!field.suggestedValue || field.status !== "suggestion") return;
    const key = field.fieldKey as BrandTextFieldKey;
    setDraft((prev) => applyBrandReviewSuggestion(prev, key, field.suggestedValue!));
    setAcceptedFields((prev) => recordAcceptedField(prev, key, field.suggestedValue!));
    setReviewResult((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map((f) =>
          f.fieldKey === field.fieldKey
            ? {
                ...f,
                status: "good" as const,
                score: 5,
                reason: "Applied — save when ready.",
                suggestedValue: undefined,
              }
            : f,
        ),
      };
    });
  };

  const handleApplyAllSuggestions = async () => {
    if (!reviewResult) return;
    const next = applyAllBrandReviewSuggestions(draft, reviewResult.fields);
    setDraft(next);
    const entries = reviewResult.fields
      .filter((f) => f.status === "suggestion" && f.suggestedValue)
      .map((f) => ({
        fieldKey: f.fieldKey as BrandTextFieldKey,
        value: f.suggestedValue!,
      }));
    setAcceptedFields((prev) => recordAcceptedFields(prev, entries));
    setReviewResult((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map((f) =>
          f.status === "suggestion"
            ? {
                ...f,
                status: "good" as const,
                score: 5,
                reason: "Applied — save when ready.",
                suggestedValue: undefined,
              }
            : f,
        ),
      };
    });
    setScorecardOpen(false);
  };

  const handleInterviewComplete = async (answers: InterviewAnswers) => {
    setInterviewOpen(false);
    setPreviewOpen(true);
    setGeneratingCopy(true);
    setGeneratedCopy(null);
    setCopyGenerationFailed(false);

    try {
      const result = await generateBrandCopyAction({
        answers,
        existingDraft: {
          name: draft.name,
          tagline: draft.tagline,
          description: draft.description,
          hasOgImage: Boolean(draft.seo.ogImageUrl),
        },
      });

      if (result.ok && result.data) {
        setGeneratedCopy(result.data);
        return;
      }

      if (!result.ok) {
        showError(result.error);
      }
      setCopyGenerationFailed(true);
    } catch (err) {
      showError({
        code: "GYM-SYS-001",
        message: err instanceof Error ? err.message : "Something went wrong.",
        detail: err instanceof Error ? err.stack : String(err),
      });
      setCopyGenerationFailed(true);
    } finally {
      setGeneratingCopy(false);
    }
  };

  const handleApplyGenerated = (selectedKeys: BrandTextFieldKey[]) => {
    if (!generatedCopy) return;
    setDraft((prev) => applyGeneratedCopy(prev, generatedCopy, selectedKeys));
    setAcceptedFields((prev) => recordAcceptedFields(prev, generatedFieldsToAccepted(generatedCopy, selectedKeys)));
    setPreviewOpen(false);
  };

  return {
    draft,
    setDraft,
    acceptedFields,
    aiEnabled,
    fieldReviews,
    reviewResult,
    reviewPending,
    scorecardOpen,
    setScorecardOpen,
    interviewOpen,
    setInterviewOpen,
    previewOpen,
    setPreviewOpen,
    generatingCopy,
    generatedCopy,
    copyGenerationFailed,
    hasExistingCopy: hasExistingBrandCopy(draft),
    setTextField,
    handleReview,
    handleApplySuggestion,
    handleApplyAllSuggestions,
    handleInterviewComplete,
    handleApplyGenerated,
  };
};
