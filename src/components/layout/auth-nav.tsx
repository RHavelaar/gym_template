"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { LayoutDashboard, Medal, MessageSquare, Trophy, UserRound, Users, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clerkRouting, getUserButtonAppearance } from "@/lib/clerk/appearance";
import { hasClerk } from "@/lib/env";
import type { GymConfig, NavItem } from "@/config/types";
import { cn } from "@/lib/utils";

type AuthNavProps = {
  config: GymConfig;
  accountNav?: NavItem[];
  isStaff?: boolean;
  isTrainer?: boolean;
  layout?: "inline" | "stacked";
};

const iconClassName = "size-4 shrink-0 text-(--gym-accent)";

const ACCOUNT_LINK_ICONS: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/pr/submit": Trophy,
  "/feed": MessageSquare,
  "/achievements": Medal,
};

const resolveAccountIcon = (href: string) => ACCOUNT_LINK_ICONS[href] ?? LayoutDashboard;

const AccountMenuLinks = ({
  items,
  layout,
  onNavigate,
}: {
  items: NavItem[];
  layout: "inline" | "stacked";
  onNavigate?: () => void;
}) => {
  if (!items.length) return null;

  return (
    <div className={cn(layout === "stacked" ? "flex flex-col gap-1" : "hidden")}>
      {items.map((item) => {
        const Icon = resolveAccountIcon(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-white transition hover:bg-white/10"
          >
            <Icon className="h-4 w-4 text-(--gym-accent)" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
};

const DemoAuthNav = ({
  config,
  accountNav = [],
  layout = "inline",
  onNavigate,
}: Pick<AuthNavProps, "config" | "accountNav" | "layout"> & { onNavigate?: () => void }) => {
  const stackClass = layout === "stacked" ? "flex w-full flex-col gap-2" : "flex items-center gap-2";

  return (
    <div className={stackClass}>
      <Link href="/dashboard" className={layout === "stacked" ? "w-full" : undefined} onClick={onNavigate}>
        <Button variant="secondary" size="sm" className={layout === "stacked" ? "w-full" : undefined}>
          {config.labels.dashboard}
        </Button>
      </Link>
      <AccountMenuLinks items={accountNav} layout={layout} onNavigate={onNavigate} />
      <Link href="/admin" className={layout === "stacked" ? "w-full" : undefined} onClick={onNavigate}>
        <Button variant="ghost" size="sm" className={layout === "stacked" ? "w-full" : undefined}>
          Staff
        </Button>
      </Link>
    </div>
  );
};

const ClerkAuthNav = ({ config, accountNav = [], isTrainer = false, layout = "inline" }: AuthNavProps) => {
  const { isSignedIn } = useAuth();
  const stackClass = layout === "stacked" ? "flex w-full flex-col gap-2" : "flex items-center gap-2";

  if (!isSignedIn) {
    return (
      <div className={stackClass}>
        <SignInButton mode="redirect" forceRedirectUrl={clerkRouting.afterSignInUrl}>
          <Button variant="ghost" size="sm" className={layout === "stacked" ? "w-full" : undefined}>
            Sign in
          </Button>
        </SignInButton>
        <SignUpButton mode="redirect" forceRedirectUrl={clerkRouting.afterSignUpUrl}>
          <Button size="sm" className={layout === "stacked" ? "w-full" : undefined}>
            Join
          </Button>
        </SignUpButton>
      </div>
    );
  }

  return (
    <div className={stackClass}>
      {layout === "stacked" ? <AccountMenuLinks items={accountNav} layout="stacked" /> : null}
      <UserButton
        appearance={getUserButtonAppearance(config)}
        userProfileUrl={clerkRouting.userProfileUrl}
        userProfileMode="navigation"
        showName={false}
      >
        <UserButton.MenuItems>
          {accountNav.map((item) => {
            const Icon = resolveAccountIcon(item.href);
            return (
              <UserButton.Link
                key={item.href}
                label={item.label}
                labelIcon={<Icon className={iconClassName} aria-hidden />}
                href={item.href}
              />
            );
          })}
          <UserButton.Link
            label={config.labels.profile}
            labelIcon={<UserRound className={iconClassName} aria-hidden />}
            href="/profile"
          />
          {isTrainer ? (
            <UserButton.Link
              label="My Clients"
              labelIcon={<Users className={iconClassName} aria-hidden />}
              href="/trainer/clients"
            />
          ) : null}
          <UserButton.Action label="manageAccount" />
          <UserButton.Action label="signOut" />
        </UserButton.MenuItems>
      </UserButton>
    </div>
  );
};

export const AuthNav = ({
  config,
  accountNav = [],
  isStaff = false,
  isTrainer = false,
  layout = "inline",
}: AuthNavProps) =>
  hasClerk ? (
    <ClerkAuthNav config={config} accountNav={accountNav} isStaff={isStaff} isTrainer={isTrainer} layout={layout} />
  ) : (
    <DemoAuthNav config={config} accountNav={accountNav} layout={layout} />
  );
