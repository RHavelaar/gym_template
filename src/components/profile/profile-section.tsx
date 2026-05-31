import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ProfileSectionProps = {
  id?: string;
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

export const ProfileSection = ({ id, icon: Icon, title, description, children, className }: ProfileSectionProps) => (
  <section id={id} className={cn("scroll-mt-24", className)}>
    <div className="mb-5 flex gap-3 sm:mb-6">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--gym-primary)/15 text-(--gym-primary)"
        aria-hidden
      >
        <Icon className="h-5 w-5" strokeWidth={2.25} />
      </div>
      <div className="min-w-0">
        <h2 className="text-xl leading-tight font-bold text-white sm:text-2xl">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-(--gym-muted) sm:text-base">{description}</p>
      </div>
    </div>
    {children}
  </section>
);

type ProfileTipProps = {
  children: ReactNode;
  variant?: "info" | "success" | "warning";
};

export const ProfileTip = ({ children, variant = "info" }: ProfileTipProps) => {
  const styles = {
    info: "border-(--gym-accent)/30 bg-(--gym-accent)/8 text-(--gym-muted)",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100/90",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-100/90",
  };

  return (
    <div
      className={cn("rounded-xl border px-4 py-3 text-sm leading-relaxed sm:text-[15px]", styles[variant])}
      role="note"
    >
      {children}
    </div>
  );
};
