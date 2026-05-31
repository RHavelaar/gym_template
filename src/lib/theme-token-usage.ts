import type { ThemeTokens } from "@/config/types";

export type ThemeTokenKey = keyof ThemeTokens;

export type ThemeTokenMeta = {
  key: ThemeTokenKey;
  label: string;
  hint: string;
  usedFor: string;
  recommendation?: string;
};

export const THEME_TOKEN_META: ThemeTokenMeta[] = [
  {
    key: "primary",
    label: "Primary",
    hint: "Your main brand color — the one members should associate with your gym.",
    usedFor: "Primary buttons, active navigation, key CTAs, Clerk sign-in accent",
    recommendation: "Use a bold, high-contrast color that reads well on dark backgrounds.",
  },
  {
    key: "primaryForeground",
    label: "Primary text",
    hint: "Text and icons sitting on top of the primary color.",
    usedFor: "Button labels, icons on primary buttons",
    recommendation: "White or near-black depending on primary brightness — aim for WCAG AA contrast.",
  },
  {
    key: "accent",
    label: "Accent",
    hint: "Secondary highlight color for emphasis without overpowering primary.",
    usedFor: "Links, focus rings, hero highlights, info icons, hover accents",
    recommendation: "Gold, amber, or electric hues work well against dark gym aesthetics.",
  },
  {
    key: "accentForeground",
    label: "Accent text",
    hint: "Text on accent-colored backgrounds.",
    usedFor: "Labels on accent chips and badges",
    recommendation: "Dark text on light accents; light text on saturated accents.",
  },
  {
    key: "background",
    label: "Background",
    hint: "The main page canvas behind all content.",
    usedFor: "Page background, Clerk auth backdrop areas",
    recommendation: "Deep charcoal or true black for the hardcore gym look.",
  },
  {
    key: "surface",
    label: "Surface",
    hint: "Elevated panels that sit above the background.",
    usedFor: "Cards, modals, input fields, dropdown menus",
    recommendation: "Slightly lighter than background — e.g. #141414 on #0a0a0a.",
  },
  {
    key: "surfaceBorder",
    label: "Border",
    hint: "Lines separating UI regions.",
    usedFor: "Card borders, dividers, input outlines, navigation separators",
    recommendation: "Subtle — one step lighter than surface, not pure white.",
  },
  {
    key: "muted",
    label: "Muted text",
    hint: "De-emphasized copy that supports primary content.",
    usedFor: "Helper text, timestamps, secondary labels, placeholders",
    recommendation: "Mid-gray (#a3a3a3) keeps hierarchy clear on dark surfaces.",
  },
  {
    key: "danger",
    label: "Danger",
    hint: "Signals errors and destructive actions.",
    usedFor: "Validation errors, delete buttons, rejection states",
    recommendation: "Standard red (#ef4444) — keep distinct from primary brand red if possible.",
  },
];

export const THEME_PRESET_PALETTES: { name: string; theme: ThemeTokens }[] = [
  {
    name: "Iron & fire",
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
  },
  {
    name: "Midnight navy",
    theme: {
      primary: "#2563eb",
      primaryForeground: "#ffffff",
      accent: "#eab308",
      accentForeground: "#0a0a0a",
      background: "#0c1222",
      surface: "#151d2e",
      surfaceBorder: "#1e293b",
      muted: "#94a3b8",
      danger: "#f87171",
    },
  },
  {
    name: "Forest steel",
    theme: {
      primary: "#16a34a",
      primaryForeground: "#ffffff",
      accent: "#84cc16",
      accentForeground: "#0a0a0a",
      background: "#0a0f0a",
      surface: "#121a12",
      surfaceBorder: "#1f2e1f",
      muted: "#9ca3af",
      danger: "#ef4444",
    },
  },
  {
    name: "Purple power",
    theme: {
      primary: "#9333ea",
      primaryForeground: "#ffffff",
      accent: "#ec4899",
      accentForeground: "#ffffff",
      background: "#0f0a14",
      surface: "#1a1220",
      surfaceBorder: "#2e1f3d",
      muted: "#a78bfa",
      danger: "#f87171",
    },
  },
  {
    name: "Clean light",
    theme: {
      primary: "#18181b",
      primaryForeground: "#ffffff",
      accent: "#dc2626",
      accentForeground: "#ffffff",
      background: "#fafafa",
      surface: "#ffffff",
      surfaceBorder: "#e4e4e7",
      muted: "#71717a",
      danger: "#dc2626",
    },
  },
];
