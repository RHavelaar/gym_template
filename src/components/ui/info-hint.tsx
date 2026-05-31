"use client";

import { useId, useState, type ElementType, type ReactNode } from "react";
import { CircleHelp } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const tooltipPositionClass = (side: "top" | "bottom") =>
  side === "top" ? "bottom-[calc(100%+0.35rem)]" : "top-[calc(100%+0.35rem)]";

const tooltipSurfaceClass =
  "absolute left-1/2 z-50 w-[min(17rem,calc(100vw-3rem))] -translate-x-1/2 rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3 py-2 text-xs leading-relaxed text-neutral-300 shadow-xl shadow-black/50 pointer-events-none opacity-0 transition-opacity duration-150";

export type InfoHintProps = {
  content: ReactNode;
  label?: string;
  className?: string;
  side?: "top" | "bottom";
};

export const InfoHint = ({ content, label = "More information", className, side = "top" }: InfoHintProps) => {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span
      className={cn("group/hint relative inline-flex shrink-0 align-middle", className)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="rounded-full p-0.5 text-(--gym-muted) transition hover:bg-white/10 hover:text-(--gym-accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--gym-accent)"
        aria-label={label}
      >
        <CircleHelp className="h-3.5 w-3.5" aria-hidden />
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className={cn(
          tooltipSurfaceClass,
          tooltipPositionClass(side),
          open && "opacity-100",
          "group-focus-within/hint:opacity-100 group-hover/hint:opacity-100",
        )}
      >
        {content}
      </span>
    </span>
  );
};

type HoverHintProps = {
  content: ReactNode;
  children: ReactNode;
  className?: string;
  side?: "top" | "bottom";
  as?: ElementType;
};

/** Tooltip on hover/focus of the wrapped element — no info icon. */
export const HoverHint = ({ content, children, className, side = "top", as: Tag = "span" }: HoverHintProps) => {
  const tooltipId = useId();

  return (
    <Tag className={cn("group/hoverhint relative", className)} aria-describedby={tooltipId}>
      {children}
      <span
        id={tooltipId}
        role="tooltip"
        className={cn(
          tooltipSurfaceClass,
          tooltipPositionClass(side),
          "group-focus-within/hoverhint:opacity-100 group-hover/hoverhint:opacity-100",
        )}
      >
        {content}
      </span>
    </Tag>
  );
};

type FieldLabelWithHintProps = {
  htmlFor?: string;
  children: ReactNode;
  hint: ReactNode;
  hintLabel?: string;
  className?: string;
};

export const FieldLabelWithHint = ({ htmlFor, children, hint, hintLabel, className }: FieldLabelWithHintProps) => (
  <div className={cn("mb-2 flex items-center gap-1.5", className)}>
    <Label htmlFor={htmlFor} className="mb-0">
      {children}
    </Label>
    <InfoHint content={hint} label={hintLabel} side="top" />
  </div>
);

type SettingSectionTitleProps = {
  title: string;
  hint?: ReactNode;
  hintLabel?: string;
  description?: ReactNode;
  size?: "md" | "lg";
};

export const SettingSectionTitle = ({ title, hint, hintLabel, description, size = "md" }: SettingSectionTitleProps) => (
  <div>
    <div className="flex items-center gap-2">
      <p className={cn("font-semibold text-white", size === "lg" ? "text-lg" : "text-base")}>{title}</p>
      {hint ? <InfoHint content={hint} label={hintLabel ?? `About ${title}`} /> : null}
    </div>
    {description ? <p className="mt-1 max-w-xl text-sm text-(--gym-muted)">{description}</p> : null}
  </div>
);
