import { z } from "zod";
import { DEFAULT_BRAND_FONT_SCALE } from "@/config/types";

const hexColorSchema = z
  .string()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Use a valid hex color (#RGB or #RRGGBB)");

export const themeSchema = z.object({
  primary: hexColorSchema,
  primaryForeground: hexColorSchema,
  accent: hexColorSchema,
  accentForeground: hexColorSchema,
  background: hexColorSchema,
  surface: hexColorSchema,
  surfaceBorder: hexColorSchema,
  muted: hexColorSchema,
  danger: hexColorSchema,
});

const cssFontSizeSchema = z
  .string()
  .regex(/^(\d+(?:\.\d+)?)(px|rem|em)$/, "Use px, rem, or em (e.g. 16px, 1rem, 0.875em)");

export const brandFontScaleSchema = z.object({
  xs: cssFontSizeSchema,
  sm: cssFontSizeSchema,
  base: cssFontSizeSchema,
  lg: cssFontSizeSchema,
  xl: cssFontSizeSchema,
  "2xl": cssFontSizeSchema,
  "3xl": cssFontSizeSchema,
  "4xl": cssFontSizeSchema,
});

export const brandCustomFontSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80),
  url: z.string().min(1),
  format: z.enum(["woff2", "woff", "ttf"]),
});

export const brandTypographySchema = z.object({
  headingFont: z.string().min(1),
  bodyFont: z.string().min(1),
  monoFont: z.string().min(1),
  fallbackStack: z.string().min(3),
  customFonts: z.array(brandCustomFontSchema),
  scale: brandFontScaleSchema.default({ ...DEFAULT_BRAND_FONT_SCALE }),
});

export const brandSeoSchema = z.object({
  metaTitle: z.string(),
  metaDescription: z.string(),
  ogTitle: z.string(),
  ogDescription: z.string(),
  ogImageUrl: z.string(),
  twitterCard: z.enum(["summary", "summary_large_image"]),
  faviconUrl: z.string(),
  appleTouchIconUrl: z.string(),
});

export const brandSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  logoUrl: z.string().min(1),
  theme: themeSchema,
  typography: brandTypographySchema,
  seo: brandSeoSchema,
});

export const businessHourSchema = z.object({
  day: z.string().min(1),
  open: z.string().min(1),
  close: z.string().min(1),
});

const optionalEmailSchema = z.union([z.literal(""), z.string().email()]);

const businessFieldVisibilitySchema = z.object({
  showInFooter: z.boolean(),
  showOnContactPage: z.boolean(),
  showOnHomepageLocation: z.boolean(),
});

const businessHoursVisibilitySchema = z.object({
  showInFooter: z.boolean(),
  showOnContactPage: z.boolean(),
  showOnHomepageHours: z.boolean(),
});

const businessLinkSchema = z
  .object({
    id: z.string().min(1),
    kind: z.enum(["instagram", "facebook", "tiktok", "youtube", "x", "linkedin", "website", "custom"]),
    label: z.string().max(40),
    url: z.union([z.literal(""), z.string().url()]),
    showInFooter: z.boolean(),
    showOnContactPage: z.boolean(),
  })
  .superRefine((link, ctx) => {
    const url = link.url.trim();
    if (!url) return;
    if (!url.startsWith("https://")) {
      ctx.addIssue({ code: "custom", message: "Links must start with https://", path: ["url"] });
    }
    if (link.kind === "custom" && !link.label.trim()) {
      ctx.addIssue({ code: "custom", message: "Custom links need a label", path: ["label"] });
    }
  });

export const businessSchema = z.object({
  hours: z.array(businessHourSchema).min(1),
  membershipBlurb: z.string().min(1),
  generalEmail: optionalEmailSchema,
  helpEmail: z.string().email(),
  contactPhone: z.string().min(7),
  address: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(2),
    zip: z.string().min(5),
  }),
  links: z.array(businessLinkSchema).max(20),
  visibility: z.object({
    address: businessFieldVisibilitySchema,
    phone: businessFieldVisibilitySchema,
    generalEmail: businessFieldVisibilitySchema,
    hours: businessHoursVisibilitySchema,
    membershipBlurb: z.object({ showOnHomepage: z.boolean() }),
  }),
});

export const galleryCarouselSettingsSchema = z.object({
  enabled: z.boolean(),
  slidesVisible: z.union([z.literal(1), z.literal(3), z.literal(5)]).default(1),
  autoplay: z.boolean(),
  intervalSeconds: z.number().min(2).max(30),
  transitionDurationMs: z.number().min(200).max(2000),
  loop: z.boolean(),
  showDots: z.boolean(),
  showArrows: z.boolean(),
  pauseOnHover: z.boolean(),
  kenBurns: z.boolean(),
});

export const galleryMediaItemSchema = z.object({
  id: z.string().min(1),
  url: z.string().min(1),
  mediaType: z.enum(["image", "gif", "video"]),
  fileName: z.string().min(1).max(80).optional(),
});

export const mediaSchema = z.object({
  hero: z.string().min(1),
  gallery: z.array(galleryMediaItemSchema),
  carousel: galleryCarouselSettingsSchema,
});

export const galleryPropsSchema = z.object({
  title: z.string().min(1),
  carousel: galleryCarouselSettingsSchema,
});

export const featuresSchema = z.object({
  socialFeed: z.boolean(),
  competitions: z.boolean(),
  achievements: z.boolean(),
  prModeration: z.boolean(),
  leaderboards: z.boolean(),
});

const httpsUrlSchema = z
  .string()
  .min(1)
  .refine((value) => value.startsWith("https://"), {
    message: "Link must start with https://",
  });

export const siteMenuPageSchema = z.object({
  id: z.string().min(1),
  enabled: z.boolean(),
  label: z.string().min(1),
});

export const siteMenuExternalLinkSchema = z.object({
  label: z.string().min(1),
  href: httpsUrlSchema,
});

export const siteMenuSchema = z.object({
  pages: z.array(siteMenuPageSchema),
  externalLinks: z.array(siteMenuExternalLinkSchema).max(2),
});

const heroTextSizeSchema = z.enum(["sm", "md", "lg", "xl"]);
const heroLayoutSchema = z.enum(["classic", "centered", "split", "showcase"]);
const heroLayoutDesktopSchema = z.enum(["classic", "centered", "split", "showcase"]);
const heroOverlayDirectionSchema = z.enum(["to-top", "to-bottom", "to-left", "to-right", "radial"]);
const heroOverlayStyleSchema = z.enum(["gradient", "solid", "vignette", "frame"]);
const optionalColorSchema = z.string();

export const heroPropsSchema = z
  .object({
    tagline: z.string(),
    showTagline: z.boolean(),
    headline: z.string(),
    showHeadline: z.boolean(),
    subheadline: z.string(),
    showSubheadline: z.boolean(),
    ctaLabel: z.string(),
    ctaHref: z.string(),
    showPrimaryCta: z.boolean(),
    secondaryCtaLabel: z.string(),
    secondaryCtaHref: z.string(),
    showSecondaryCta: z.boolean(),
    headlineSize: heroTextSizeSchema,
    subheadlineSize: heroTextSizeSchema,
    layout: heroLayoutSchema,
    layoutDesktop: heroLayoutDesktopSchema,
    overlayEnabled: z.boolean(),
    imageOpacity: z.number().min(0).max(100),
    overlayOpacity: z.number().min(0).max(100),
    overlayDirection: heroOverlayDirectionSchema,
    overlayStyle: heroOverlayStyleSchema,
    overlayColor: optionalColorSchema,
    taglineColor: optionalColorSchema,
    headlineColor: optionalColorSchema,
    subheadlineColor: optionalColorSchema,
    primaryCtaBg: optionalColorSchema,
    primaryCtaText: optionalColorSchema,
    secondaryCtaBg: optionalColorSchema,
    secondaryCtaText: optionalColorSchema,
  })
  .superRefine((data, ctx) => {
    if (data.showTagline && !data.tagline.trim()) {
      ctx.addIssue({ code: "custom", path: ["tagline"], message: "Tagline is required when shown" });
    }
    if (data.showHeadline && !data.headline.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["headline"],
        message: "Headline is required when shown",
      });
    }
    if (data.showSubheadline && !data.subheadline.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["subheadline"],
        message: "Description is required when shown",
      });
    }
    if (data.showPrimaryCta) {
      if (!data.ctaLabel.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["ctaLabel"],
          message: "Primary button label is required when shown",
        });
      }
      if (!data.ctaHref.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["ctaHref"],
          message: "Primary button link is required when shown",
        });
      }
    }
    if (data.showSecondaryCta) {
      if (!data.secondaryCtaLabel.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["secondaryCtaLabel"],
          message: "Secondary button label is required when shown",
        });
      }
      if (!data.secondaryCtaHref.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["secondaryCtaHref"],
          message: "Secondary button link is required when shown",
        });
      }
    }
  });

export const ctaPropsSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
});

export const titlePropsSchema = z.object({
  title: z.string().min(1),
});

export const membershipPropsSchema = z.object({
  title: z.string().min(1),
  ctaLabel: z.string().min(1),
  ctaHref: z.string().min(1),
});

export const announcementsPropsSchema = z.object({
  title: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
});

export const homepageSectionSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string().min(1),
    type: z.literal("hero"),
    enabled: z.boolean(),
    order: z.number().int().positive(),
    props: heroPropsSchema,
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("cta"),
    enabled: z.boolean(),
    order: z.number().int().positive(),
    props: ctaPropsSchema,
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("hours"),
    enabled: z.boolean(),
    order: z.number().int().positive(),
    props: titlePropsSchema,
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("location"),
    enabled: z.boolean(),
    order: z.number().int().positive(),
    props: titlePropsSchema,
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("membership"),
    enabled: z.boolean(),
    order: z.number().int().positive(),
    props: membershipPropsSchema,
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("gallery"),
    enabled: z.boolean(),
    order: z.number().int().positive(),
    props: galleryPropsSchema,
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("announcements"),
    enabled: z.boolean(),
    order: z.number().int().positive(),
    props: announcementsPropsSchema,
  }),
]);

export const homepageSectionsSchema = z.array(homepageSectionSchema).min(1);

export const assetTypeSchema = z.enum(["hero", "gallery", "logo", "og", "favicon", "font"]);

export const assetFileNameSchema = z
  .string()
  .min(1, "File name is required")
  .max(80)
  .regex(/^[a-z0-9-]+$/, "Use letters, numbers, and hyphens only");

export const sanitizeAssetFileName = (input: string) => {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return base || "image";
};

/** User-facing alias — always returns a storage-safe base name. */
export const normalizeAssetFileName = (input: string) => sanitizeAssetFileName(input);

export const assetFileNameWasAdjusted = (raw: string, normalized = normalizeAssetFileName(raw)) => {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  const stripped = trimmed.toLowerCase().replace(/\.[^/.]+$/, "");
  return stripped !== normalized;
};

export const MAX_ASSET_BYTES = 5 * 1024 * 1024;

export const MAX_ASSET_SIZE_LABEL = "5 MB";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"] as const;

export const ALLOWED_GALLERY_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export const ALLOWED_GALLERY_FORMATS_LABEL = "JPEG, PNG, WebP, GIF, MP4, WebM";

export const MAX_GALLERY_VIDEO_BYTES = 50 * 1024 * 1024;

export const MAX_GALLERY_VIDEO_SIZE_LABEL = "50 MB";

export const MAX_FONT_BYTES = 2 * 1024 * 1024;

export const MAX_FONT_SIZE_LABEL = "2 MB";

export const ALLOWED_FONT_TYPES = [
  "font/woff2",
  "font/woff",
  "font/ttf",
  "application/font-woff2",
  "application/font-woff",
  "application/x-font-ttf",
] as const;

export const ALLOWED_FONT_FORMATS_LABEL = "WOFF2, WOFF, TTF";

export const getMaxAssetBytes = (file: File, assetType: GymAssetType): number => {
  if (assetType === "font") return MAX_FONT_BYTES;
  if (assetType === "gallery" && file.type.startsWith("video/")) {
    return MAX_GALLERY_VIDEO_BYTES;
  }
  return MAX_ASSET_BYTES;
};

export const resolveUniqueAssetBaseName = (baseName: string, isTaken: (candidate: string) => boolean): string => {
  if (!isTaken(baseName)) return baseName;
  for (let suffix = 2; suffix <= 999; suffix += 1) {
    const candidate = `${baseName}-${suffix}`;
    if (!isTaken(candidate)) return candidate;
  }
  return `${baseName}-${Date.now()}`;
};

export const getAssetTooLargeError = (file: File, assetType: GymAssetType): string | null => {
  const maxBytes = getMaxAssetBytes(file, assetType);
  if (file.size <= maxBytes) return null;

  if (assetType === "font") {
    return `This font file is too large (max ${MAX_FONT_SIZE_LABEL}). Try converting to WOFF2 for a smaller file.`;
  }

  if (file.type.startsWith("video/")) {
    return [
      `This video is too large (max ${MAX_GALLERY_VIDEO_SIZE_LABEL}).`,
      "Long or high-resolution clips take longer to load on mobile.",
      "Try trimming to about 30 seconds, or re-export at 1080p from your phone or video app.",
    ].join(" ");
  }

  return [
    `This image is too large (max ${MAX_ASSET_SIZE_LABEL}).`,
    "Large photos make your site load slower, especially for visitors on phones or slower connections.",
    "Resize to about 1200–1920 px wide and save as JPEG or WebP — most photo apps have “Export for web”, or try a free tool like squoosh.app.",
  ].join(" ");
};

export const ALLOWED_IMAGE_FORMATS_LABEL = "JPEG, PNG, WebP, SVG";

export type GymAssetType = z.infer<typeof assetTypeSchema>;

export const ASSET_UPLOAD_SPECS: Record<GymAssetType, { dimensions: string; hint: string; aspectRatio: string }> = {
  hero: {
    dimensions: "1920 × 1080 px recommended",
    hint: "Wide landscape image; displays full-width behind the homepage headline.",
    aspectRatio: "16:9",
  },
  gallery: {
    dimensions: "1200 × 900 px recommended (images); up to 30s for video",
    hint: "Photos, GIFs, or short clips in the homepage carousel. Landscape works best.",
    aspectRatio: "4:3",
  },
  logo: {
    dimensions: "512 × 512 px recommended",
    hint: "Square or horizontal mark; SVG works best for sharp scaling.",
    aspectRatio: "1:1",
  },
  og: {
    dimensions: "1200 × 630 px recommended",
    hint: "Social share preview image for Facebook, LinkedIn, and iMessage.",
    aspectRatio: "1.91:1",
  },
  favicon: {
    dimensions: "32 × 32 px (favicon) or 180 × 180 px (Apple touch)",
    hint: "Simple mark — fine details disappear at small sizes.",
    aspectRatio: "1:1",
  },
  font: {
    dimensions: "WOFF2 preferred (under 2 MB)",
    hint: "Licensed brand font for headings or body text.",
    aspectRatio: "N/A",
  },
};
