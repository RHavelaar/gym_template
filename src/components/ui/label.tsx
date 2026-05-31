import { cn } from "@/lib/utils";
import { LabelHTMLAttributes } from "react";

export const Label = ({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("mb-2 block text-sm font-medium text-neutral-200", className)} {...props} />
);
