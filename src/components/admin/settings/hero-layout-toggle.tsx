"use client";

import type { HeroLayout } from "@/config/types";
import { HERO_LAYOUT_OPTIONS } from "@/lib/hero-settings";
import { cn } from "@/lib/utils";

type HeroLayoutToggleProps = {
  value: HeroLayout;
  onChange: (layout: HeroLayout) => void;
  label: string;
  compact?: boolean;
};

export const HeroLayoutToggle = ({ value, onChange, label, compact = false }: HeroLayoutToggleProps) => (
  <div className={cn("flex min-w-0 flex-col gap-1", compact && "max-w-full")}>
    <span className="text-[10px] font-semibold tracking-widest text-(--gym-muted) uppercase">{label}</span>
    <div
      className="inline-flex flex-wrap gap-1 rounded-lg border border-(--gym-border) bg-(--gym-surface) p-1"
      role="group"
      aria-label={`${label} hero layout`}
    >
      {HERO_LAYOUT_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          title={option.hint}
          aria-pressed={value === option.value}
          className={cn(
            "rounded-md px-2 py-1 text-[10px] font-semibold tracking-wide uppercase transition sm:px-2.5 sm:text-xs",
            value === option.value
              ? "bg-(--gym-primary) text-(--gym-primary-fg)"
              : "text-(--gym-muted) hover:bg-white/5 hover:text-white",
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);
