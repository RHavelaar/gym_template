import type { BrandFontScale } from "@/config/types";
import type { ThemeTokenKey } from "@/lib/theme-token-usage";

export const BRAND_IDENTITY_HELP = {
  name: {
    hint: "Your gym’s official name — shown in the header, browser tab, and sign-in screens.",
    recommendation: "Keep it short and recognizable. Match your legal business name if possible.",
  },
  tagline: {
    hint: "A short line above the homepage hero headline.",
    recommendation: "One sentence: location, vibe, or promise. Example: “Hardcore training. Real community.”",
  },
  description: {
    hint: "Longer summary used in search results and social previews when no override is set.",
    recommendation: "150–160 characters works well for Google snippets. Mention city and what makes you different.",
  },
  logo: {
    hint: "Your primary mark — header, Clerk sign-in, and brand kit export.",
    recommendation: "512×512 px recommended. SVG or PNG with transparent background. Avoid tiny text in the mark.",
    usedFor: "Site header, sign-in screen, and brand kit export",
  },
} as const;

export const BRAND_TYPOGRAPHY_HELP = {
  heading: {
    hint: "Font for headlines, page titles, and uppercase gym branding.",
    recommendation: "Display or bold sans fonts (Oswald, Bebas Neue, Montserrat) fit the gym aesthetic.",
  },
  body: {
    hint: "Font for paragraphs, labels, and most UI text.",
    recommendation: "Highly readable sans-serif at 16px base — Inter, Open Sans, or Source Sans 3.",
  },
  mono: {
    hint: "Font for stats, codes, and numeric displays.",
    recommendation: "Roboto Mono or JetBrains Mono — optional but useful for leaderboards.",
  },
  fallback: {
    hint: "System fonts used when your chosen font fails to load — required for reliability.",
    recommendation: "Always set this. system-ui, sans-serif is the safest default across browsers.",
  },
  scale: {
    hint: "Default text sizes across the site. Use pixels (px) for exact sizes, or rem/em to scale with browser settings.",
    recommendation: "Base 16px or 1rem for body text. Main headings 30–36px. Avoid below 12px for readable copy.",
  },
  customUpload: {
    hint: "Upload WOFF2, WOFF, or TTF files for licensed brand fonts.",
    recommendation: "WOFF2 preferred — smallest file size. Name the font exactly as it should appear in CSS.",
  },
} as const;

export const BRAND_SEO_FIELD_LABELS = {
  searchTitle: "Browser tab & search title",
  searchDescription: "Search result description",
  socialShareTitle: "Social share title",
  socialShareDescription: "Social share description",
  socialShareImage: "Social share image",
  twitterCard: "Twitter / X card style",
  favicon: "Favicon",
  appleTouchIcon: "Apple touch icon",
} as const;

export const BRAND_SEO_HELP = {
  metaTitle: {
    hint: "Browser tab title and default Google search title.",
    recommendation: "≤ 60 characters. Include gym name + city if space allows.",
  },
  metaDescription: {
    hint: "Snippet text under your link in search results.",
    recommendation: "150–160 characters. Action-oriented: what members get at your gym.",
  },
  ogTitle: {
    hint: "Title when someone shares your site on Facebook, LinkedIn, or iMessage.",
    recommendation: "Leave blank to use meta title. Can be punchier for social.",
  },
  ogDescription: {
    hint: "Description on social share cards.",
    recommendation: "Leave blank to use meta description.",
  },
  ogImage: {
    hint: "Large preview image on social platforms.",
    recommendation: "1200×630 px (1.91:1). Use a strong gym photo or branded graphic with logo.",
    usedFor: "Facebook, LinkedIn, iMessage, and other link previews when your site is shared",
  },
  twitterCard: {
    hint: "How Twitter/X displays your link preview.",
    recommendation: "Large image card shows your OG image big — best for gyms with strong photography.",
  },
  favicon: {
    hint: "Small icon in browser tabs and bookmarks.",
    recommendation: "32×32 PNG or SVG. Simple mark — details get lost at this size.",
    usedFor: "Browser tabs and bookmarks",
  },
  appleTouchIcon: {
    hint: "Icon when members save your site to their iPhone home screen.",
    recommendation: "180×180 PNG with solid or branded background.",
    usedFor: "iPhone and iPad home screen shortcuts",
  },
} as const;

export const BRAND_COLOR_PICKER_HELP = {
  eyedropper:
    "Pick a color from anywhere on your screen (works in Chrome and Edge). Great for matching partner brand guidelines.",
  imageExtract: "Upload a logo, photo, or brand guideline image — we sample the dominant colors for your palette.",
  import: "Paste hex codes separated by commas or new lines (e.g. #dc2626, #f59e0b).",
  urlNote:
    "Pulling colors directly from other websites is unreliable due to browser security. Use the eyedropper or upload an image instead.",
} as const;

export const BRAND_EXPORT_HELP = {
  description:
    "Download a shareable brand kit with your logo, colors (HEX + RGB), typography, and type scale — ready for partners, designers, or print.",
  png: "High-resolution PNG poster — instant download, works everywhere.",
  pdf: "Print-ready PDF with the same content — ideal for email attachments and vendor packets.",
} as const;

export type BrandScaleMeta = {
  key: keyof BrandFontScale;
  label: string;
  hint: string;
  usedFor: string;
  recommendation: string;
};

export const BRAND_SCALE_META: BrandScaleMeta[] = [
  {
    key: "xs",
    label: "Extra small",
    hint: "Fine print and compact labels.",
    usedFor: "Timestamps, footnotes, dense table headers",
    recommendation: "12px (0.75rem) — do not use for long paragraphs.",
  },
  {
    key: "sm",
    label: "Small",
    hint: "Secondary labels and compact UI text.",
    usedFor: "Form hints, badge text, secondary nav items",
    recommendation: "14px (0.875rem) works well on mobile and desktop.",
  },
  {
    key: "base",
    label: "Base (body)",
    hint: "Default reading size for most site copy.",
    usedFor: "Paragraphs, form inputs, member dashboard body text",
    recommendation: "16px or 1rem — the web standard for comfortable reading.",
  },
  {
    key: "lg",
    label: "Large",
    hint: "Emphasized body text or small subheadings.",
    usedFor: "Lead paragraphs, card titles, callout text",
    recommendation: "18px (1.125rem) adds emphasis without shouting.",
  },
  {
    key: "xl",
    label: "Extra large",
    hint: "Section subheadings and prominent labels.",
    usedFor: "Homepage section titles, modal headings",
    recommendation: "20px (1.25rem) — pair with bold weight for hierarchy.",
  },
  {
    key: "2xl",
    label: "Heading 2",
    hint: "Secondary page headings.",
    usedFor: "Page section headers, admin panel titles",
    recommendation: "24px (1.5rem) — clear step below your main headline.",
  },
  {
    key: "3xl",
    label: "Heading 1",
    hint: "Primary page and hero headlines.",
    usedFor: "Homepage hero headline, major page titles",
    recommendation: "30px (1.875rem) — uppercase display fonts can go larger.",
  },
  {
    key: "4xl",
    label: "Display",
    hint: "Largest marketing headline size.",
    usedFor: "Hero impact text, landing page display type",
    recommendation: "36px (2.25rem) max on mobile-friendly layouts.",
  },
];

export const THEME_TOKEN_HINT = (key: ThemeTokenKey): string => {
  const map: Record<ThemeTokenKey, string> = {
    primary: BRAND_IDENTITY_HELP.name.hint,
    primaryForeground: "Text on primary-colored buttons and badges.",
    accent: "Highlights, links, and focus states across the site.",
    accentForeground: "Text on accent-colored surfaces.",
    background: "Main page canvas behind all content.",
    surface: "Cards, modals, and input backgrounds.",
    surfaceBorder: "Borders and dividers between UI regions.",
    muted: "Secondary and helper text.",
    danger: "Errors and destructive actions.",
  };
  return map[key];
};
