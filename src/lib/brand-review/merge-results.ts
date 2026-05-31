import type { BrandReviewFieldResult, LlmReviewOutput } from "@/lib/brand-review/schema";
import type { BrandTextFieldKey } from "@/lib/brand-review/fields";
import { buildStableGoodResult, suppressSuggestionForStableField } from "@/lib/brand-review/accepted-fields";

const fieldPriority = (status: BrandReviewFieldResult["status"]) => {
  if (status === "suggestion") return 3;
  if (status === "info") return 2;
  return 1;
};

export const mergeFieldResults = (
  deterministic: BrandReviewFieldResult[],
  llmFields: LlmReviewOutput["fields"],
  stableKeys: BrandTextFieldKey[],
): BrandReviewFieldResult[] => {
  const byKey = new Map<string, BrandReviewFieldResult>();

  for (const key of stableKeys) {
    byKey.set(key, buildStableGoodResult(key));
  }

  for (const d of deterministic) {
    const existing = byKey.get(d.fieldKey);
    if (!existing || fieldPriority(d.status) >= fieldPriority(existing.status)) {
      byKey.set(d.fieldKey, d);
    }
  }

  for (const llm of llmFields) {
    if (stableKeys.includes(llm.fieldKey)) {
      byKey.set(llm.fieldKey, buildStableGoodResult(llm.fieldKey));
      continue;
    }
    const existing = byKey.get(llm.fieldKey);
    const merged: BrandReviewFieldResult = {
      fieldKey: llm.fieldKey,
      status: llm.status,
      score: llm.score,
      reason: llm.reason,
      suggestedValue: llm.suggestedValue,
    };
    const suppressed = suppressSuggestionForStableField(merged, stableKeys);
    if (!existing || fieldPriority(suppressed.status) >= fieldPriority(existing.status)) {
      byKey.set(llm.fieldKey, suppressed);
    }
  }

  return Array.from(byKey.values());
};

export const mergeReviewResults = (
  deterministic: BrandReviewFieldResult[],
  llm: LlmReviewOutput | null,
  stableKeys: BrandTextFieldKey[],
): {
  overallScore: number;
  overallLabel: LlmReviewOutput["overallLabel"];
  summary: string;
  categories: LlmReviewOutput["categories"];
  fields: BrandReviewFieldResult[];
} => {
  const fields = mergeFieldResults(deterministic, llm?.fields ?? [], stableKeys);

  if (llm) {
    return {
      overallScore: llm.overallScore,
      overallLabel: llm.overallLabel,
      summary: llm.summary,
      categories: llm.categories,
      fields,
    };
  }

  const suggestionCount = fields.filter((f) => f.status === "suggestion").length;
  const overallScore = Math.max(40, 100 - suggestionCount * 12);

  return {
    overallScore,
    overallLabel: suggestionCount === 0 ? "good" : "needs_work",
    summary:
      suggestionCount === 0
        ? "Your brand copy looks solid based on our checks."
        : `We found ${suggestionCount} area${suggestionCount === 1 ? "" : "s"} that could be stronger.`,
    categories: [
      {
        id: "search",
        label: "Search visibility",
        score: overallScore,
        summary: "Based on title and description length and clarity.",
      },
      {
        id: "social",
        label: "Social sharing",
        score: overallScore,
        summary: "Based on social fields and share image presence.",
      },
      {
        id: "voice",
        label: "Brand voice",
        score: overallScore,
        summary: "Based on name, tagline, and site description.",
      },
    ],
    fields,
  };
};

export const fieldResultsToMap = (fields: BrandReviewFieldResult[]): Record<string, BrandReviewFieldResult> =>
  Object.fromEntries(fields.map((f) => [f.fieldKey, f]));
