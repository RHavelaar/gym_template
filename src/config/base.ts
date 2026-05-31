import { DEFAULT_BRAND_SEO, DEFAULT_BRAND_TYPOGRAPHY, type GymConfig } from "./types";

export const baseGymConfig: Omit<
  GymConfig,
  "slug" | "name" | "tagline" | "description" | "business" | "images" | "homepageSections"
> = {
  logoUrl: "/logo-placeholder.svg",
  typography: { ...DEFAULT_BRAND_TYPOGRAPHY },
  seo: { ...DEFAULT_BRAND_SEO },
  theme: {
    primary: "#dc2626",
    primaryForeground: "#ffffff",
    accent: "#f59e0b",
    accentForeground: "#0a0a0a",
    background: "#0a0a0a",
    surface: "#141414",
    surfaceBorder: "#262626",
    muted: "#a3a3a3",
    danger: "#ef4444",
  },
  labels: {
    prSubmit: "Log PR",
    leaderboard: "Leaderboards",
    competitions: "Competitions",
    feed: "Gym Feed",
    dashboard: "My Dashboard",
    admin: "Staff Portal",
    profile: "My Profile",
    account: "Account",
    progressCelebrations: [
      "Crushing it, {name}! {changes} — keep stacking wins.",
      "Beast mode, {name}! {changes}. The work is showing.",
      "Respect, {name} — {changes}. Iron Asylum sees you.",
      "That's dedication, {name}! {changes}. Stay on the gas.",
    ],
  },
  features: {
    socialFeed: true,
    competitions: true,
    achievements: true,
    prModeration: true,
    leaderboards: true,
  },
  nav: {
    public: [
      { label: "Home", href: "/" },
      { label: "Leaderboards", href: "/leaderboards" },
      { label: "Competitions", href: "/competitions" },
      { label: "Contact", href: "/contact" },
    ],
    member: [{ label: "My Dashboard", href: "/dashboard", requiresAuth: true }],
    account: [
      { label: "Log PR", href: "/pr/submit", requiresAuth: true },
      { label: "Gym Feed", href: "/feed", requiresAuth: true },
      { label: "Achievements", href: "/achievements", requiresAuth: true },
    ],
    admin: [
      { label: "Staff Home", href: "/admin", staffOnly: true },
      { label: "Site Settings", href: "/admin/settings", staffOnly: true, ownerOnly: true },
      { label: "PR Queue", href: "/admin/pr-queue", staffOnly: true },
      { label: "Machines & Lifts", href: "/admin/equipment", staffOnly: true },
      { label: "Competitions", href: "/admin/competitions", staffOnly: true },
      { label: "Trainers", href: "/admin/trainers", staffOnly: true },
    ],
  },
};
