import { dark } from "@clerk/ui/themes";
import type { GymConfig } from "@/config/types";

export const clerkRouting = {
  signInUrl: "/sign-in",
  signUpUrl: "/sign-up",
  userProfileUrl: "/user-profile",
  afterSignInUrl: "/dashboard",
  afterSignUpUrl: "/dashboard",
} as const;

export const getClerkAppearance = (config: GymConfig) => ({
  theme: dark,
  variables: {
    colorPrimary: config.theme.primary,
    colorPrimaryForeground: config.theme.primaryForeground,
    colorBackground: config.theme.surface,
    colorInput: config.theme.background,
    colorInputForeground: "#fafafa",
    colorForeground: "#fafafa",
    colorMutedForeground: config.theme.muted,
    colorBorder: config.theme.surfaceBorder,
    colorDanger: config.theme.danger,
    colorRing: config.theme.accent,
    borderRadius: "0.75rem",
    fontFamily: "var(--gym-font-body), var(--gym-font-fallback)",
  },
  options: {
    logoImageUrl: config.logoUrl,
    logoLinkUrl: "/",
    socialButtonsVariant: "blockButton" as const,
  },
});

export const getUserButtonAppearance = (config: GymConfig) => ({
  ...getClerkAppearance(config),
  elements: {
    userButtonBox: "flex shrink-0 rounded-full ring-2 ring-(--gym-border) transition hover:ring-(--gym-primary)",
    userButtonTrigger:
      "rounded-full focus:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--gym-accent)",
    userButtonPopoverCard: "rounded-xl border border-(--gym-border) bg-(--gym-surface) shadow-xl shadow-black/40",
    userButtonPopoverActionButton: "rounded-lg text-neutral-200 hover:bg-white/10 hover:text-white",
    userButtonPopoverActionButtonIcon: "text-(--gym-accent)",
    userButtonPopoverActionButtonText: "font-medium",
    userButtonPopoverFooter: "hidden",
  },
});
