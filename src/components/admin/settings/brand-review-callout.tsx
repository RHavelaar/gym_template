"use client";

import { CheckCircle2, Info, Lightbulb } from "lucide-react";
import type { BrandReviewFieldResult } from "@/lib/brand-review/schema";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BrandReviewCalloutProps = {
  result: BrandReviewFieldResult;
  onApply?: () => void;
  applyLabel?: string;
};

export const BrandReviewCallout = ({ result, onApply, applyLabel = "Apply suggestion" }: BrandReviewCalloutProps) => {
  const isGood = result.status === "good";
  const isSuggestion = result.status === "suggestion";
  const isInfo = result.status === "info";

  return (
    <div
      className={cn(
        "mt-2 rounded-lg border px-3 py-2.5 text-sm",
        isGood && "border-emerald-500/30 bg-emerald-500/5",
        isSuggestion && "border-(--gym-accent)/50 bg-(--gym-accent)/5",
        isInfo && "border-(--gym-border) bg-black/20",
      )}
      role="note"
    >
      <div className="flex items-start gap-2">
        {isGood ? (
          <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" size={16} aria-hidden />
        ) : isSuggestion ? (
          <Lightbulb className="mt-0.5 shrink-0 text-(--gym-accent)" size={16} aria-hidden />
        ) : (
          <Info className="mt-0.5 shrink-0 text-(--gym-muted)" size={16} aria-hidden />
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-(--gym-muted)">
            <span className="font-medium text-neutral-300">Why:</span> {result.reason}
          </p>
          {isSuggestion && result.suggestedValue ? (
            <p className="rounded-md border border-(--gym-border) bg-black/30 px-2 py-1.5 text-white">
              {result.suggestedValue}
            </p>
          ) : null}
          {isSuggestion && onApply ? (
            <Button type="button" size="sm" onClick={onApply}>
              {applyLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
