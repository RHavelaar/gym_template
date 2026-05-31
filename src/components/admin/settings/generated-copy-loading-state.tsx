"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { BRAND_FIELD_LABELS, BRAND_TEXT_FIELD_KEYS } from "@/lib/brand-review/fields";
import { cn } from "@/lib/utils";

export const GENERATION_STATUS_STEPS = [
  "Reading your answers…",
  "Writing gym name and tagline…",
  "Drafting your site description…",
  "Building search and social previews…",
  "Almost done…",
] as const;

const SkeletonLine = ({ className }: { className?: string }) => (
  <div className={cn("h-3 animate-pulse rounded bg-neutral-800/90", className)} aria-hidden />
);

export const GeneratedCopyLoadingState = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStep((current) => Math.min(current + 1, GENERATION_STATUS_STEPS.length - 1));
    }, 2200);

    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="space-y-4" aria-busy="true">
      <div
        className="flex items-center gap-2 rounded-lg border border-(--gym-border) bg-black/20 px-3 py-2.5"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-(--gym-accent)" aria-hidden />
        <p className="text-sm text-(--gym-muted)">
          <span className="text-(--gym-accent)">{GENERATION_STATUS_STEPS[step]}</span>
          {" · "}
          This usually takes 10–30 seconds.
        </p>
      </div>

      <ul className="space-y-3">
        {BRAND_TEXT_FIELD_KEYS.map((fieldKey) => (
          <li key={fieldKey} className="rounded-lg border border-(--gym-border) bg-black/20 p-3">
            <div className="flex items-start gap-2">
              <div
                className="mt-1 h-4 w-4 shrink-0 animate-pulse rounded border border-(--gym-border) bg-black/40"
                aria-hidden
              />
              <div className="min-w-0 flex-1 space-y-2">
                <span className="font-medium text-white">{BRAND_FIELD_LABELS[fieldKey]}</span>
                <SkeletonLine className="w-4/5 max-w-sm" />
                <SkeletonLine className="w-2/3 max-w-xs" />
                <SkeletonLine className="mt-1 h-4 w-full" />
                <SkeletonLine className="h-4 w-11/12" />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2 pt-2" aria-hidden>
        <div className="h-10 w-44 animate-pulse rounded-md bg-neutral-800/80" />
        <div className="h-10 w-28 animate-pulse rounded-md bg-neutral-800/80" />
      </div>
    </div>
  );
};
