import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export const Badge = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full bg-(--gym-primary)/20 px-3 py-1 text-xs font-semibold tracking-wide text-(--gym-accent) uppercase",
      className,
    )}
    {...props}
  />
);
