"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { BrandGeneratedCopy } from "@/lib/brand-interview/schema";
import { BRAND_FIELD_LABELS, type BrandTextFieldKey } from "@/lib/brand-review/fields";
import { Button } from "@/components/ui/button";
import { SpotterModalHeader } from "@/components/admin/settings/spotter-modal-header";
import { GeneratedCopyLoadingState } from "@/components/admin/settings/generated-copy-loading-state";

type BrandInterviewPreviewModalProps = {
  open: boolean;
  generated: BrandGeneratedCopy | null;
  generating: boolean;
  generationFailed?: boolean;
  onClose: () => void;
  onApply: (selectedKeys: BrandTextFieldKey[]) => void;
  onStartOver: () => void;
};

const buildInitialSelection = (generated: BrandGeneratedCopy) => {
  const initial: Record<string, boolean> = {};
  for (const field of generated.fields) {
    if (field.value.trim()) initial[field.fieldKey] = true;
  }
  return initial;
};

const generatedSelectionKey = (generated: BrandGeneratedCopy) =>
  generated.fields.map((field) => `${field.fieldKey}:${field.value}`).join("|");

const GeneratedCopySelection = ({
  generated,
  onApply,
  onStartOver,
}: {
  generated: BrandGeneratedCopy;
  onApply: (selectedKeys: BrandTextFieldKey[]) => void;
  onStartOver: () => void;
}) => {
  const [selected, setSelected] = useState(() => buildInitialSelection(generated));

  const handleApply = () => {
    const keys = generated.fields
      .filter((field) => selected[field.fieldKey] && field.value.trim())
      .map((field) => field.fieldKey as BrandTextFieldKey);
    onApply(keys);
  };

  return (
    <>
      <ul className="space-y-3">
        {generated.fields.map((field) => (
          <li key={field.fieldKey} className="rounded-lg border border-(--gym-border) bg-black/20 p-3">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-1"
                checked={selected[field.fieldKey] ?? false}
                onChange={(e) =>
                  setSelected((prev) => ({
                    ...prev,
                    [field.fieldKey]: e.target.checked,
                  }))
                }
                disabled={!field.value.trim()}
              />
              <span className="min-w-0 flex-1">
                <span className="font-medium text-white">
                  {BRAND_FIELD_LABELS[field.fieldKey as BrandTextFieldKey]}
                </span>
                <p className="mt-1 text-sm text-(--gym-muted)">
                  <span className="text-neutral-400">Why:</span> {field.reason}
                </p>
                {field.value.trim() ? (
                  <p className="mt-2 text-sm text-white">{field.value}</p>
                ) : (
                  <p className="mt-2 text-sm text-neutral-500 italic">(Leave blank — inherits from other fields)</p>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleApply}>
          Apply selected to draft
        </Button>
        <Button type="button" variant="secondary" onClick={onStartOver}>
          Start over
        </Button>
      </div>
    </>
  );
};

export const BrandInterviewPreviewModal = ({
  open,
  generated,
  generating,
  generationFailed = false,
  onClose,
  onApply,
  onStartOver,
}: BrandInterviewPreviewModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleClose = () => {
    if (generating) return;
    onClose();
  };

  const title = generating
    ? "Generating your brand copy…"
    : generationFailed
      ? "Copy generation failed"
      : "Preview generated copy";

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      aria-labelledby={titleId}
      aria-busy={generating}
      className="fixed inset-0 z-100 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-black/70"
    >
      <div className="flex min-h-full items-end justify-center p-4 sm:items-center">
        <button
          type="button"
          className="fixed inset-0 cursor-default"
          aria-label="Close preview"
          onClick={handleClose}
          disabled={generating}
          tabIndex={generating ? -1 : 0}
        />
        <div
          role="document"
          className="max-h-90vh relative z-10 flex w-full max-w-2xl flex-col rounded-xl border border-(--gym-border) bg-(--gym-surface) shadow-2xl"
        >
          <div className="shrink-0 border-b border-(--gym-border) p-5">
            <SpotterModalHeader titleId={titleId} title={title}>
              {generated ? (
                <p className="mt-1 text-sm text-(--gym-muted)">{generated.summary}</p>
              ) : generationFailed ? (
                <p className="mt-1 text-sm text-(--gym-muted)">
                  Spotter hit a snag. You can try the interview again or close and retry later.
                </p>
              ) : null}
            </SpotterModalHeader>
          </div>

          <div className="min-h-112 flex-1 overflow-y-auto p-5">
            {generating ? (
              <GeneratedCopyLoadingState />
            ) : generationFailed ? (
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={onStartOver}>
                  Try again
                </Button>
                <Button type="button" variant="secondary" onClick={handleClose}>
                  Close
                </Button>
              </div>
            ) : generated ? (
              <GeneratedCopySelection
                key={generatedSelectionKey(generated)}
                generated={generated}
                onApply={onApply}
                onStartOver={onStartOver}
              />
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 border-t border-(--gym-border) p-5">
            <Button type="button" variant="secondary" disabled={generating} onClick={handleClose}>
              {generating ? "Generating…" : "Cancel"}
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  );
};
