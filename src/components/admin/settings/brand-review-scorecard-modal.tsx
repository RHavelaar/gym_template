"use client";

import { useEffect, useId, useRef } from "react";
import type { BrandReviewFieldResult, BrandReviewResult } from "@/lib/brand-review/schema";
import { BRAND_FIELD_LABELS } from "@/lib/brand-review/fields";
import { getApplicableSuggestions } from "@/lib/brand-review/apply-suggestions";
import { Button } from "@/components/ui/button";
import { SpotterModalHeader } from "@/components/admin/settings/spotter-modal-header";
import { cn } from "@/lib/utils";

type BrandReviewScorecardModalProps = {
  open: boolean;
  result: BrandReviewResult;
  onClose: () => void;
  onApplyAll: () => void;
  onScrollToFirstSuggestion: () => void;
};

const labelForScore = (score: number) => {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs work";
  return "Weak";
};

const FieldRow = ({ field }: { field: BrandReviewFieldResult }) => (
  <li className="rounded-lg border border-(--gym-border) bg-black/20 p-3">
    <div className="flex items-center justify-between gap-2">
      <span className="font-medium text-white">{BRAND_FIELD_LABELS[field.fieldKey]}</span>
      <span
        className={cn(
          "text-xs tracking-wide uppercase",
          field.status === "good" && "text-emerald-400",
          field.status === "suggestion" && "text-(--gym-accent)",
          field.status === "info" && "text-neutral-400",
        )}
      >
        {field.status}
      </span>
    </div>
    <p className="mt-1 text-sm text-(--gym-muted)">
      <span className="text-neutral-400">Why:</span> {field.reason}
    </p>
    {field.suggestedValue ? <p className="mt-2 text-sm text-white">{field.suggestedValue}</p> : null}
  </li>
);

export const BrandReviewScorecardModal = ({
  open,
  result,
  onClose,
  onApplyAll,
  onScrollToFirstSuggestion,
}: BrandReviewScorecardModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const suggestions = getApplicableSuggestions(result.fields);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleClose = () => onClose();

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      aria-labelledby={titleId}
      className="fixed inset-0 z-100 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-black/70"
    >
      <div className="flex min-h-full items-end justify-center p-4 sm:items-center">
        <button
          type="button"
          className="fixed inset-0 cursor-default"
          aria-label="Close review results"
          onClick={handleClose}
        />
        <div
          role="document"
          className="max-h-90vh relative z-10 flex w-full max-w-2xl flex-col rounded-xl border border-(--gym-border) bg-(--gym-surface) shadow-2xl"
        >
          <div className="shrink-0 border-b border-(--gym-border) p-5">
            <SpotterModalHeader titleId={titleId} title="Brand copy review">
              <div className="mt-3 flex items-center gap-3">
                <span className="text-3xl font-bold text-white">{result.overallScore}</span>
                <div>
                  <p className="text-sm font-medium text-(--gym-accent)">{labelForScore(result.overallScore)}</p>
                  <p className="text-sm text-(--gym-muted)">{result.summary}</p>
                </div>
              </div>
            </SpotterModalHeader>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              {result.categories.map((cat) => (
                <div key={cat.id} className="rounded-lg border border-(--gym-border) bg-black/20 p-3">
                  <p className="text-xs font-semibold tracking-widest text-(--gym-muted) uppercase">{cat.label}</p>
                  <p className="mt-1 text-xl font-bold text-white">{cat.score}</p>
                  <p className="mt-1 text-xs text-(--gym-muted)">{cat.summary}</p>
                </div>
              ))}
            </div>

            {suggestions.length > 0 ? (
              <p className="text-sm text-(--gym-muted)">
                {suggestions.length} suggestion{suggestions.length === 1 ? "" : "s"} ready to apply
              </p>
            ) : null}

            <ul className="space-y-2">
              {result.fields.map((field) => (
                <FieldRow key={field.fieldKey} field={field} />
              ))}
            </ul>
          </div>

          <div className="flex shrink-0 flex-col gap-2 border-t border-(--gym-border) p-5 sm:flex-row sm:justify-end">
            {suggestions.length > 0 ? (
              <>
                <Button type="button" onClick={onApplyAll}>
                  Apply all improvements
                </Button>
                <Button type="button" variant="secondary" onClick={onScrollToFirstSuggestion}>
                  Jump to first suggestion
                </Button>
              </>
            ) : null}
            <Button type="button" variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  );
};
