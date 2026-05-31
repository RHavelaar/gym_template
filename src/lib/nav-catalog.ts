import type { GymConfig, GymFeatureFlags, GymLabels, NavItem } from "@/config/types";

export type NavCatalogAudience = "public" | "member" | "module";

/** Where an enabled page appears in the UI */
export type NavPlacement = "publicHeader" | "memberHeader" | "accountMenu" | "moduleOnly";

export type NavCatalogEntry = {
  id: string;
  audience: NavCatalogAudience;
  placement: NavPlacement;
  href?: string;
  featureKey?: keyof GymFeatureFlags;
  canDisable: boolean;
  defaultLabelKey?: keyof GymLabels;
  defaultLabel?: string;
  requiresAuth?: boolean;
};

export type SiteMenuPageState = {
  id: string;
  enabled: boolean;
  label: string;
};

export type SiteMenuExternalLink = {
  label: string;
  href: string;
};

export type SiteMenuState = {
  pages: SiteMenuPageState[];
  externalLinks: SiteMenuExternalLink[];
};

export const MAX_EXTERNAL_LINKS = 2;

/** Member routes stored in legacy `nav.member` before account menu split */
export const ACCOUNT_MENU_HREFS = new Set(["/pr/submit", "/feed", "/achievements"]);

export const NAV_CATALOG: NavCatalogEntry[] = [
  {
    id: "home",
    audience: "public",
    placement: "publicHeader",
    href: "/",
    canDisable: false,
    defaultLabel: "Home",
  },
  {
    id: "leaderboards",
    audience: "public",
    placement: "publicHeader",
    href: "/leaderboards",
    featureKey: "leaderboards",
    canDisable: true,
    defaultLabelKey: "leaderboard",
  },
  {
    id: "competitions",
    audience: "public",
    placement: "publicHeader",
    href: "/competitions",
    featureKey: "competitions",
    canDisable: true,
    defaultLabelKey: "competitions",
  },
  {
    id: "contact",
    audience: "public",
    placement: "publicHeader",
    href: "/contact",
    canDisable: true,
    defaultLabel: "Contact",
  },
  {
    id: "pricing",
    audience: "public",
    placement: "publicHeader",
    href: "/pricing",
    canDisable: true,
    defaultLabel: "Pricing",
  },
  {
    id: "dashboard",
    audience: "member",
    placement: "memberHeader",
    href: "/dashboard",
    canDisable: true,
    defaultLabelKey: "dashboard",
    requiresAuth: true,
  },
  {
    id: "prSubmit",
    audience: "member",
    placement: "accountMenu",
    href: "/pr/submit",
    canDisable: true,
    defaultLabelKey: "prSubmit",
    requiresAuth: true,
  },
  {
    id: "feed",
    audience: "member",
    placement: "accountMenu",
    href: "/feed",
    featureKey: "socialFeed",
    canDisable: true,
    defaultLabelKey: "feed",
    requiresAuth: true,
  },
  {
    id: "achievements",
    audience: "member",
    placement: "accountMenu",
    href: "/achievements",
    featureKey: "achievements",
    canDisable: true,
    defaultLabel: "Achievements",
    requiresAuth: true,
  },
  {
    id: "prModeration",
    audience: "module",
    placement: "moduleOnly",
    featureKey: "prModeration",
    canDisable: true,
    defaultLabel: "PR moderation",
  },
];

const CATALOG_HREFS = new Set(NAV_CATALOG.filter((entry) => entry.href).map((entry) => entry.href));

export const isExternalNavHref = (href: string) => href.startsWith("https://");

const resolveDefaultLabel = (entry: NavCatalogEntry, config: GymConfig): string => {
  if (entry.defaultLabelKey) {
    const value = config.labels[entry.defaultLabelKey];
    if (typeof value === "string") return value;
  }
  return entry.defaultLabel ?? entry.id;
};

const findNavLabel = (items: NavItem[], href: string): string | undefined =>
  items.find((item) => item.href === href)?.label;

export const getAccountNavItems = (config: GymConfig): NavItem[] => {
  if (config.nav.account?.length) return config.nav.account;
  return config.nav.member.filter((item) => ACCOUNT_MENU_HREFS.has(item.href));
};

export const getMemberHeaderNavItems = (config: GymConfig): NavItem[] =>
  config.nav.member.filter((item) => !ACCOUNT_MENU_HREFS.has(item.href));

/** Split legacy nav JSON into member header + account menu arrays */
export const normalizeNavShape = (nav: GymConfig["nav"]): GymConfig["nav"] => {
  if (nav.account?.length) {
    return {
      public: nav.public,
      member: nav.member.filter((item) => !ACCOUNT_MENU_HREFS.has(item.href)),
      account: nav.account,
      admin: nav.admin,
    };
  }

  const member = nav.member ?? [];
  return {
    public: nav.public,
    member: member.filter((item) => !ACCOUNT_MENU_HREFS.has(item.href)),
    account: member.filter((item) => ACCOUNT_MENU_HREFS.has(item.href)),
    admin: nav.admin,
  };
};

const isPageEnabled = (entry: NavCatalogEntry, config: GymConfig): boolean => {
  if (!entry.canDisable) return true;

  if (entry.placement === "moduleOnly" && entry.featureKey) {
    return config.features[entry.featureKey];
  }

  if (!entry.href) return false;

  if (entry.placement === "publicHeader") {
    return config.nav.public.some((item) => item.href === entry.href);
  }

  if (entry.placement === "memberHeader") {
    return getMemberHeaderNavItems(config).some((item) => item.href === entry.href);
  }

  if (entry.placement === "accountMenu") {
    return getAccountNavItems(config).some((item) => item.href === entry.href);
  }

  return false;
};

export const extractExternalLinksFromNav = (publicNav: NavItem[]): SiteMenuExternalLink[] =>
  publicNav
    .filter((item) => isExternalNavHref(item.href) && !CATALOG_HREFS.has(item.href))
    .slice(0, MAX_EXTERNAL_LINKS)
    .map(({ label, href }) => ({ label, href }));

export const mergeSiteMenuState = (config: GymConfig): SiteMenuState => {
  const normalized = normalizeNavShape(config.nav);
  const normalizedConfig = { ...config, nav: normalized };

  const pages: SiteMenuPageState[] = NAV_CATALOG.map((entry) => {
    const enabled = isPageEnabled(entry, normalizedConfig);
    let label = resolveDefaultLabel(entry, normalizedConfig);

    if (entry.href) {
      const fromPublic = findNavLabel(normalized.public, entry.href);
      const fromMember = findNavLabel(normalized.member, entry.href);
      const fromAccount = findNavLabel(normalized.account, entry.href);
      if (fromPublic) label = fromPublic;
      else if (fromMember) label = fromMember;
      else if (fromAccount) label = fromAccount;
    }

    return { id: entry.id, enabled, label };
  });

  return {
    pages,
    externalLinks: extractExternalLinksFromNav(normalized.public),
  };
};

const getCatalogEntry = (id: string) => NAV_CATALOG.find((entry) => entry.id === id);

export const buildNavFromSiteMenu = (state: SiteMenuState): Pick<GymConfig["nav"], "public" | "member" | "account"> => {
  const publicItems: NavItem[] = [];
  const memberItems: NavItem[] = [];
  const accountItems: NavItem[] = [];

  for (const page of state.pages) {
    const entry = getCatalogEntry(page.id);
    if (!entry?.href || !page.enabled) continue;

    const item: NavItem = {
      label: page.label.trim(),
      href: entry.href,
      ...(entry.requiresAuth ? { requiresAuth: true } : {}),
    };

    if (entry.placement === "publicHeader") {
      publicItems.push(item);
    } else if (entry.placement === "memberHeader") {
      memberItems.push(item);
    } else if (entry.placement === "accountMenu") {
      accountItems.push(item);
    }
  }

  const homeIndex = publicItems.findIndex((item) => item.href === "/");
  if (homeIndex > 0) {
    const [home] = publicItems.splice(homeIndex, 1);
    publicItems.unshift(home);
  }

  for (const link of state.externalLinks) {
    const label = link.label.trim();
    const href = link.href.trim();
    if (!label || !href) continue;
    publicItems.push({ label, href });
  }

  return { public: publicItems, member: memberItems, account: accountItems };
};

export const buildFeaturesFromSiteMenu = (state: SiteMenuState, baseFeatures: GymFeatureFlags): GymFeatureFlags => {
  const features = { ...baseFeatures };

  for (const page of state.pages) {
    const entry = getCatalogEntry(page.id);
    if (!entry?.featureKey) continue;
    features[entry.featureKey] = page.enabled;
  }

  return features;
};

export const getCatalogEntriesByAudience = (audience: NavCatalogAudience) =>
  NAV_CATALOG.filter((entry) => entry.audience === audience);

export const getCatalogEntriesByPlacement = (placement: NavPlacement) =>
  NAV_CATALOG.filter((entry) => entry.placement === placement);

export const getCatalogEntryById = (id: string) => getCatalogEntry(id);
