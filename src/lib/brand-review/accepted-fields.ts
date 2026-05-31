import type { BrandReviewFieldResult } from "@/lib/brand-review/schema";
import type { GymConfig } from "@/config/types";
import type { AcceptedField, BrandTextFieldKey } from "@/lib/brand-review/fields";
import { getFieldValueFromDraft } from "@/lib/brand-review/fields";

const ACCEPTED_GOOD_REASON = "You already applied our suggestion — no changes needed unless you edit this field.";

/** Upstream edits invalidate downstream fields that inherit from them. */
const INVALIDATION_DEPS: Partial<Record<BrandTextFieldKey, BrandTextFieldKey[]>> = {
  name: ["metaTitle", "ogTitle"],
  description: ["metaDescription", "ogDescription"],
  metaTitle: ["ogTitle"],
  metaDescription: ["ogDescription"],
};

export const pruneAcceptedOnFieldEdit = (
  accepted: AcceptedField[],
  editedField: BrandTextFieldKey,
): AcceptedField[] => {
  const toRemove = new Set<BrandTextFieldKey>([editedField, ...(INVALIDATION_DEPS[editedField] ?? [])]);
  return accepted.filter((a) => !toRemove.has(a.fieldKey));
};

export type StableAcceptedField = {
  fieldKey: BrandTextFieldKey;
  value: string;
};

export const getStableAcceptedFields = (
  draft: GymConfig,
  acceptedFields: AcceptedField[] = [],
): StableAcceptedField[] =>
  acceptedFields.filter((a) => {
    const current = getFieldValueFromDraft(draft, a.fieldKey);
    return current === a.value;
  });

export const getStableAcceptedFieldKeys = (
  draft: GymConfig,
  acceptedFields: AcceptedField[] = [],
): BrandTextFieldKey[] => getStableAcceptedFields(draft, acceptedFields).map((a) => a.fieldKey);

export const buildStableGoodResult = (fieldKey: BrandTextFieldKey): BrandReviewFieldResult => ({
  fieldKey,
  status: "good",
  score: 5,
  reason: ACCEPTED_GOOD_REASON,
});

export const suppressSuggestionForStableField = (
  result: BrandReviewFieldResult,
  stableKeys: BrandTextFieldKey[],
): BrandReviewFieldResult => {
  if (!stableKeys.includes(result.fieldKey as BrandTextFieldKey)) return result;
  if (result.status === "suggestion") {
    return {
      ...result,
      status: "good",
      score: 5,
      reason: ACCEPTED_GOOD_REASON,
      suggestedValue: undefined,
    };
  }
  return result;
};

export const recordAcceptedField = (
  accepted: AcceptedField[],
  fieldKey: BrandTextFieldKey,
  value: string,
): AcceptedField[] => [...accepted.filter((a) => a.fieldKey !== fieldKey), { fieldKey, value, acceptedAt: Date.now() }];

export const recordAcceptedFields = (
  accepted: AcceptedField[],
  entries: { fieldKey: BrandTextFieldKey; value: string }[],
): AcceptedField[] => {
  let next = accepted;
  for (const entry of entries) {
    next = recordAcceptedField(next, entry.fieldKey, entry.value);
  }
  return next;
};
