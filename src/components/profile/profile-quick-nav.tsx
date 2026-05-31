"use client";

import Link from "next/link";
import { ClipboardList, History, Lock, Scale, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const allNavItems = [
  { href: "#stats", label: "Stats", icon: Scale },
  { href: "#goals", label: "Goals", icon: Target },
  { href: "#progress", label: "Progress", icon: TrendingUp, requiresProgress: true },
  { href: "#check-in", label: "Check-in", icon: ClipboardList },
  { href: "#history", label: "History", icon: History },
  { href: "#privacy", label: "Privacy", icon: Lock },
] as const;

type ProfileQuickNavProps = {
  showProgress?: boolean;
};

export const ProfileQuickNav = ({ showProgress = true }: ProfileQuickNavProps) => {
  const navItems = allNavItems.filter((item) => !("requiresProgress" in item && item.requiresProgress) || showProgress);

  return (
    <nav aria-label="Profile sections" className="-mx-4 mb-6 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-2 sm:flex-wrap">
        {navItems.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full border border-(--gym-border)",
                "bg-black/30 px-4 text-sm font-medium text-neutral-200 transition",
                "hover:border-(--gym-primary)/40 hover:bg-(--gym-primary)/10 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 text-(--gym-accent)" aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
