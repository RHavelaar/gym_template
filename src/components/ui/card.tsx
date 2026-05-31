import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("rounded-xl border border-(--gym-border) bg-(--gym-surface) p-5 shadow-lg", className)}
    {...props}
  />
);

export const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-lg font-bold text-white", className)} {...props} />
);

export const CardDescription = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("mt-1 text-sm text-(--gym-muted)", className)} {...props} />
);
