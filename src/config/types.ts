export type NavItem = {
  label: string;
  href: string;
  requiresAuth?: boolean;
  staffOnly?: boolean;
  ownerOnly?: boolean;
};

export type ThemeTokens = {
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  surface: string;
  surfaceBorder: string;
  muted: string;
  danger: string;
};

export type BrandFontScale = {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
  "4xl": string;
};

export type BrandCustomFont = {
  id: string;
  name: string;
  url: string;
  format: "woff2" | "woff" | "ttf";
};

export type BrandTypography = {
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  fallbackStack: string;
  customFonts: BrandCustomFont[];
  scale: BrandFontScale;
};

export type BrandSeo = {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  twitterCard: "summary" | "summary_large_image";
  faviconUrl: string;
  appleTouchIconUrl: string;
};

export const DEFAULT_BRAND_FONT_SCALE: BrandFontScale = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
};

export const DEFAULT_BRAND_TYPOGRAPHY: BrandTypography = {
  headingFont: "Inter",
  bodyFont: "Inter",
  monoFont: "Roboto Mono",
  fallbackStack: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  customFonts: [],
  scale: { ...DEFAULT_BRAND_FONT_SCALE },
};

export const DEFAULT_BRAND_SEO: BrandSeo = {
  metaTitle: "",
  metaDescription: "",
  ogTitle: "",
  ogDescription: "",
  ogImageUrl: "",
  twitterCard: "summary_large_image",
  faviconUrl: "",
  appleTouchIconUrl: "",
};

export type HomepageSectionType = "hero" | "cta" | "hours" | "location" | "membership" | "gallery" | "announcements";

export type HeroTextSize = "sm" | "md" | "lg" | "xl";

export type HeroLayout = "classic" | "centered" | "split" | "showcase";

export type HeroLayoutDesktop = HeroLayout;

export type HeroOverlayDirection = "to-top" | "to-bottom" | "to-left" | "to-right" | "radial";

export type HeroOverlayStyle = "gradient" | "solid" | "vignette" | "frame";

export type HeroSectionProps = {
  tagline: string;
  showTagline: boolean;
  headline: string;
  showHeadline: boolean;
  subheadline: string;
  showSubheadline: boolean;
  ctaLabel: string;
  ctaHref: string;
  showPrimaryCta: boolean;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  showSecondaryCta: boolean;
  headlineSize: HeroTextSize;
  subheadlineSize: HeroTextSize;
  layout: HeroLayout;
  layoutDesktop: HeroLayoutDesktop;
  overlayEnabled: boolean;
  imageOpacity: number;
  overlayOpacity: number;
  overlayDirection: HeroOverlayDirection;
  overlayStyle: HeroOverlayStyle;
  overlayColor: string;
  taglineColor: string;
  headlineColor: string;
  subheadlineColor: string;
  primaryCtaBg: string;
  primaryCtaText: string;
  secondaryCtaBg: string;
  secondaryCtaText: string;
};

export const DEFAULT_HERO_PROPS: HeroSectionProps = {
  tagline: "",
  showTagline: true,
  headline: "Welcome",
  showHeadline: true,
  subheadline: "Your gym, your community.",
  showSubheadline: true,
  ctaLabel: "Join now",
  ctaHref: "/sign-up",
  showPrimaryCta: true,
  secondaryCtaLabel: "Learn more",
  secondaryCtaHref: "/leaderboards",
  showSecondaryCta: true,
  headlineSize: "lg",
  subheadlineSize: "md",
  layout: "classic",
  layoutDesktop: "classic",
  overlayEnabled: true,
  imageOpacity: 40,
  overlayOpacity: 70,
  overlayDirection: "to-top",
  overlayStyle: "gradient",
  overlayColor: "",
  taglineColor: "",
  headlineColor: "",
  subheadlineColor: "",
  primaryCtaBg: "",
  primaryCtaText: "",
  secondaryCtaBg: "",
  secondaryCtaText: "",
};

export type CtaSectionProps = {
  title: string;
  body: string;
};

export type TitleSectionProps = {
  title: string;
};

export type MembershipSectionProps = {
  title: string;
  ctaLabel: string;
  ctaHref: string;
};

export type GalleryMediaType = "image" | "gif" | "video";

export type GalleryMediaItem = {
  id: string;
  url: string;
  mediaType: GalleryMediaType;
  /** Library file name without extension (e.g. squat-racks). */
  fileName?: string;
};

export type GalleryCarouselSettings = {
  enabled: boolean;
  /** How many slides are visible at once (1, 3, or 5). */
  slidesVisible: 1 | 3 | 5;
  autoplay: boolean;
  intervalSeconds: number;
  transitionDurationMs: number;
  loop: boolean;
  showDots: boolean;
  showArrows: boolean;
  pauseOnHover: boolean;
  kenBurns: boolean;
};

export type GallerySectionProps = {
  title: string;
  carousel: GalleryCarouselSettings;
};

export const DEFAULT_GALLERY_CAROUSEL: GalleryCarouselSettings = {
  enabled: true,
  slidesVisible: 1,
  autoplay: true,
  intervalSeconds: 5,
  transitionDurationMs: 600,
  loop: true,
  showDots: true,
  showArrows: true,
  pauseOnHover: true,
  kenBurns: true,
};

export type AnnouncementsSectionProps = {
  title: string;
  items: string[];
};

export type SectionPropsByType = {
  hero: HeroSectionProps;
  cta: CtaSectionProps;
  hours: TitleSectionProps;
  location: TitleSectionProps;
  membership: MembershipSectionProps;
  gallery: GallerySectionProps;
  announcements: AnnouncementsSectionProps;
};

export type HomepageSection = {
  [K in HomepageSectionType]: {
    id: string;
    type: K;
    enabled: boolean;
    order: number;
    props: SectionPropsByType[K];
  };
}[HomepageSectionType];

export type GymFeatureFlags = {
  socialFeed: boolean;
  competitions: boolean;
  achievements: boolean;
  prModeration: boolean;
  leaderboards: boolean;
};

export type GymLabels = {
  prSubmit: string;
  leaderboard: string;
  competitions: string;
  feed: string;
  dashboard: string;
  admin: string;
  profile: string;
  account: string;
  progressCelebrations: string[];
};

export type BusinessLinkKind =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "x"
  | "linkedin"
  | "website"
  | "custom";

export type BusinessLink = {
  id: string;
  kind: BusinessLinkKind;
  label: string;
  url: string;
  showInFooter: boolean;
  showOnContactPage: boolean;
};

export type BusinessFieldVisibility = {
  showInFooter: boolean;
  showOnContactPage: boolean;
  showOnHomepageLocation: boolean;
};

export type BusinessHoursVisibility = {
  showInFooter: boolean;
  showOnContactPage: boolean;
  showOnHomepageHours: boolean;
};

export type GymBusinessInfo = {
  hours: { day: string; open: string; close: string }[];
  membershipBlurb: string;
  /** Public inbox for tours, billing, and general questions */
  generalEmail: string;
  /** Used for accessibility "Get help" links on errors — not shown on the public site by default */
  helpEmail: string;
  contactPhone: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
  };
  links: BusinessLink[];
  visibility: {
    address: BusinessFieldVisibility;
    phone: BusinessFieldVisibility;
    generalEmail: BusinessFieldVisibility;
    hours: BusinessHoursVisibility;
    membershipBlurb: { showOnHomepage: boolean };
  };
};

export type ContactPageFaqItem = {
  question: string;
  answer: string;
};

export type ContactPageSettings = {
  headline: string;
  subtitle: string;
  formHeadline: string;
  formSubtitle: string;
  showForm: boolean;
  showDirectionsLink: boolean;
  faqItems: ContactPageFaqItem[];
  metaDescription: string;
};

export const DEFAULT_CONTACT_PAGE_SETTINGS: ContactPageSettings = {
  headline: "Contact us",
  subtitle: "Questions about membership, coaching, or your first visit? Send a message or use the details below.",
  formHeadline: "Send a message",
  formSubtitle: "We reply by email. Your message is also saved in the gym inbox for staff.",
  showForm: true,
  showDirectionsLink: true,
  faqItems: [],
  metaDescription: "",
};

export type PricingPageSettings = {
  headline: string;
  subtitle: string;
  footnote: string;
  metaDescription: string;
};

export const DEFAULT_PRICING_PAGE_SETTINGS: PricingPageSettings = {
  headline: "Membership & pricing",
  subtitle: "Straightforward options for day visitors, monthly members, and committed lifters.",
  footnote: "",
  metaDescription: "",
};

export type PricingBillingInterval = "day" | "week" | "month" | "year" | "one_time" | "custom";

export type GymPricingPlan = {
  id: string;
  sortOrder: number;
  enabled: boolean;
  name: string;
  tagline: string;
  description: string;
  priceDisplay: string;
  priceCents: number | null;
  compareAtDisplay: string;
  billingInterval: PricingBillingInterval;
  durationLabel: string;
  features: string[];
  imageUrl: string;
  badge: string;
  isFeatured: boolean;
  ctaLabel: string;
  ctaHref: string;
};

export type GymConfig = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  logoUrl: string;
  theme: ThemeTokens;
  typography: BrandTypography;
  seo: BrandSeo;
  labels: GymLabels;
  features: GymFeatureFlags;
  nav: {
    public: NavItem[];
    /** Signed-in header links (typically dashboard only) */
    member: NavItem[];
    /** Profile menu links (log PR, feed, achievements, etc.) */
    account: NavItem[];
    admin: NavItem[];
  };
  business: GymBusinessInfo;
  images: {
    hero: string;
    gallery: GalleryMediaItem[];
  };
  homepageSections: HomepageSection[];
};

export const DEFAULT_SECTION_PROPS: SectionPropsByType = {
  hero: { ...DEFAULT_HERO_PROPS },
  cta: {
    title: "Get started today",
    body: "Track progress, compete, and connect with your gym community.",
  },
  hours: { title: "Gym Hours" },
  location: { title: "Location" },
  membership: {
    title: "Membership",
    ctaLabel: "View pricing",
    ctaHref: "/pricing",
  },
  gallery: {
    title: "Gallery",
    carousel: DEFAULT_GALLERY_CAROUSEL,
  },
  announcements: {
    title: "Announcements",
    items: ["Check back for updates."],
  },
};
