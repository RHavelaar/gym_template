"use server";

import { generateText, Output } from "ai";
import { requireOwner } from "@/lib/rbac";
import { hasAiGateway } from "@/lib/env";
import { getReviewModel } from "@/lib/ai/gateway";
import { wrapAction, type ActionResult } from "@/lib/errors/action-result";
import { ERROR_CODES } from "@/lib/errors/codes";
import { DEFAULT_MESSAGES } from "@/lib/errors/messages";
import { buildReviewPayload, formatPayloadForPrompt } from "@/lib/brand-review/build-review-payload";
import { runDeterministicChecks } from "@/lib/brand-review/deterministic-checks";
import { getStableAcceptedFields } from "@/lib/brand-review/accepted-fields";
import { mergeReviewResults } from "@/lib/brand-review/merge-results";
import { BRAND_REVIEW_SYSTEM_PROMPT, buildReviewUserPrompt } from "@/lib/brand-review/prompt";
import {
  brandReviewInputSchema,
  brandReviewResultSchema,
  llmReviewOutputSchema,
  type BrandReviewResult,
} from "@/lib/brand-review/schema";
import { BRAND_COPY_GENERATION_SYSTEM_PROMPT, formatInterviewForPrompt } from "@/lib/brand-interview/apply-generated";
import {
  brandGeneratedCopySchema,
  generateBrandCopyInputSchema,
  llmGeneratedCopySchema,
  type BrandGeneratedCopy,
} from "@/lib/brand-interview/schema";
import type { GymConfig } from "@/config/types";

const assertAiGateway = () => {
  if (!hasAiGateway) {
    throw new Error(DEFAULT_MESSAGES[ERROR_CODES.AI_UNAVAILABLE]);
  }
};

export const reviewBrandCopyAction = async (input: unknown): Promise<ActionResult<BrandReviewResult>> =>
  wrapAction(
    async () => {
      assertAiGateway();
      await requireOwner();
      const parsed = brandReviewInputSchema.safeParse(input);
      if (!parsed.success) {
        throw new Error("Invalid brand review input");
      }

      const draft = parsed.data as GymConfig;
      const stableAccepted = getStableAcceptedFields(draft, parsed.data.acceptedFields);
      const payload = buildReviewPayload(parsed.data, stableAccepted);
      const deterministic = runDeterministicChecks(draft);
      const stableKeys = stableAccepted.map((a) => a.fieldKey);

      let llmOutput = null;
      if (payload.fieldsForLlm.length > 0) {
        const { output } = await generateText({
          model: getReviewModel(),
          output: Output.object({ schema: llmReviewOutputSchema }),
          system: BRAND_REVIEW_SYSTEM_PROMPT,
          prompt: buildReviewUserPrompt(formatPayloadForPrompt(payload), payload.fieldsForLlm, stableAccepted),
        });
        llmOutput = output;
      }

      const merged = mergeReviewResults(deterministic, llmOutput, stableKeys);
      return brandReviewResultSchema.parse(merged);
    },
    { fallbackCode: ERROR_CODES.AI_GENERATION_FAILED },
  );

export const generateBrandCopyAction = async (input: unknown): Promise<ActionResult<BrandGeneratedCopy>> =>
  wrapAction(
    async () => {
      assertAiGateway();
      await requireOwner();
      const parsed = generateBrandCopyInputSchema.safeParse(input);
      if (!parsed.success) {
        throw new Error("Invalid interview answers");
      }

      const { output } = await generateText({
        model: getReviewModel(),
        output: Output.object({ schema: llmGeneratedCopySchema }),
        system: BRAND_COPY_GENERATION_SYSTEM_PROMPT,
        prompt: JSON.stringify(
          {
            interview: formatInterviewForPrompt(parsed.data.answers),
            existingDraft: parsed.data.existingDraft ?? null,
          },
          null,
          2,
        ),
      });

      return brandGeneratedCopySchema.parse(output);
    },
    { fallbackCode: ERROR_CODES.AI_GENERATION_FAILED },
  );
