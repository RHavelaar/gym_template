"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  INTERVIEW_QUESTIONS,
  estimateMinutesRemaining,
  isInterviewStepOptional,
} from "@/lib/brand-interview/questions";
import type { InterviewAnswers } from "@/lib/brand-interview/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const emptyAnswers = (draftName: string): InterviewAnswers => ({
  gymName: draftName,
  city: "",
  differentiator: "",
  idealMember: "general",
  vibe: [],
  offerings: [],
  extras: "",
});

type BrandInterviewWizardModalProps = {
  open: boolean;
  draftName: string;
  onClose: () => void;
  onComplete: (answers: InterviewAnswers) => void;
  hasExistingCopy: boolean;
};

export const BrandInterviewWizardModal = ({
  open,
  draftName,
  onClose,
  onComplete,
  hasExistingCopy,
}: BrandInterviewWizardModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState(!hasExistingCopy);
  const [answers, setAnswers] = useState<InterviewAnswers>(() => emptyAnswers(draftName));

  const question = INTERVIEW_QUESTIONS[step];
  const progress = ((step + 1) / INTERVIEW_QUESTIONS.length) * 100;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      setStep(0);
      setAnswers(emptyAnswers(draftName));
      setConfirmed(!hasExistingCopy);
    }
    if (!open && dialog.open) dialog.close();
  }, [open, draftName, hasExistingCopy]);

  const canAdvance = useMemo(() => {
    if (!question) return false;
    switch (question.id) {
      case "gymName":
        return answers.gymName.trim().length > 0;
      case "city":
        return answers.city.trim().length > 0;
      case "differentiator":
        return answers.differentiator.trim().length > 0;
      case "idealMember":
        return answers.idealMember.length > 0;
      case "vibe":
        return answers.vibe.length > 0;
      case "offerings":
        return answers.offerings.length > 0;
      default:
        return true;
    }
  }, [answers, question]);

  const handleClose = () => onClose();

  const handleNext = () => {
    if (step >= INTERVIEW_QUESTIONS.length - 1) {
      onComplete(answers);
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const toggleChip = (field: "vibe" | "offerings", value: string) => {
    setAnswers((prev) => {
      const list = prev[field];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...prev, [field]: next };
    });
  };

  if (!question) return null;

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
          aria-label="Close interview"
          onClick={handleClose}
        />
        <div
          role="document"
          className="relative z-10 w-full max-w-lg rounded-xl border border-(--gym-border) bg-(--gym-surface) shadow-2xl"
        >
          {!confirmed ? (
            <div className="space-y-4 p-5">
              <h2 id={titleId} className="text-lg font-bold text-white">
                Rewrite your brand copy?
              </h2>
              <p className="text-sm text-(--gym-muted)">
                This interview helps generate new text. Your current copy stays until you apply the results.
              </p>
              <div className="flex gap-2">
                <Button type="button" onClick={() => setConfirmed(true)}>
                  Continue
                </Button>
                <Button type="button" variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b border-(--gym-border) p-5 pb-4">
                <p className="text-xs text-(--gym-muted)">
                  Question {step + 1} of {INTERVIEW_QUESTIONS.length} · ~{estimateMinutesRemaining(step)} min left
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/40">
                  <div className="h-full bg-(--gym-accent) transition-all" style={{ width: `${progress}%` }} />
                </div>
                <h2 id={titleId} className="mt-4 text-lg font-bold text-white">
                  {question.question}
                </h2>
                <p className="mt-1 text-sm text-(--gym-muted)">{question.hint}</p>
              </div>

              <div className="space-y-3 p-5">
                {question.type === "text" ? (
                  <Input
                    value={question.id === "gymName" ? answers.gymName : answers.city}
                    onChange={(e) =>
                      setAnswers((a) =>
                        question.id === "gymName" ? { ...a, gymName: e.target.value } : { ...a, city: e.target.value },
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && canAdvance) handleNext();
                    }}
                    aria-label={question.question}
                  />
                ) : null}

                {question.type === "textarea" || question.type === "optional-textarea" ? (
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3 py-2 text-white"
                    value={question.id === "differentiator" ? answers.differentiator : (answers.extras ?? "")}
                    onChange={(e) =>
                      setAnswers((a) =>
                        question.id === "differentiator"
                          ? { ...a, differentiator: e.target.value }
                          : { ...a, extras: e.target.value },
                      )
                    }
                    aria-label={question.question}
                  />
                ) : null}

                {question.type === "select" && question.options ? (
                  <select
                    value={answers.idealMember}
                    onChange={(e) => setAnswers((a) => ({ ...a, idealMember: e.target.value }))}
                    className="w-full rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3 py-2 text-white"
                  >
                    {question.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : null}

                {question.type === "chips" && question.chipOptions ? (
                  <div className="flex flex-wrap gap-2">
                    {question.chipOptions.map((chip) => {
                      const field = question.id === "vibe" ? "vibe" : "offerings";
                      const selected = answers[field].includes(chip.value);
                      return (
                        <button
                          key={chip.value}
                          type="button"
                          onClick={() => toggleChip(field, chip.value)}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-sm transition-colors",
                            selected
                              ? "border-(--gym-accent) bg-(--gym-accent)/20 text-white"
                              : "border-(--gym-border) text-(--gym-muted) hover:border-neutral-500",
                          )}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className="flex justify-between gap-2 border-t border-(--gym-border) p-5">
                <Button type="button" variant="secondary" disabled={step === 0} onClick={handleBack}>
                  Back
                </Button>
                <div className="flex gap-2">
                  {isInterviewStepOptional(question) ? (
                    <Button type="button" variant="secondary" onClick={handleNext}>
                      Skip
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    disabled={!canAdvance && !isInterviewStepOptional(question)}
                    onClick={handleNext}
                  >
                    {step >= INTERVIEW_QUESTIONS.length - 1 ? "Generate my copy" : "Next"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
};
