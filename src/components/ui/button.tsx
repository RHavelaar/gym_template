import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-(--gym-primary) text-(--gym-primary-fg) hover:opacity-90",
  secondary: "bg-(--gym-surface) border border-(--gym-border) text-white hover:bg-neutral-800",
  ghost: "bg-transparent text-white hover:bg-white/10",
  danger: "bg-(--gym-danger) text-white hover:opacity-90",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm min-h-10",
  md: "px-5 py-3 text-base min-h-12",
  lg: "px-6 py-4 text-lg min-h-14",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--gym-accent) disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
