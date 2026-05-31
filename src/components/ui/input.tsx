import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "min-h-12 w-full rounded-lg border border-(--gym-border) bg-black/40 px-4 text-base text-white placeholder:text-neutral-500 focus:border-(--gym-primary) focus:ring-2 focus:ring-(--gym-primary)/30 focus:outline-none",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
