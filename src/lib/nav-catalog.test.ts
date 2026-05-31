import { describe, expect, it } from "vitest";
import { getGymConfig } from "@/config";
import {
  buildFeaturesFromSiteMenu,
  buildNavFromSiteMenu,
  extractExternalLinksFromNav,
  mergeSiteMenuState,
  NAV_CATALOG,
  normalizeNavShape,
} from "@/lib/nav-catalog";

describe("normalizeNavShape", () => {
  it("splits legacy member nav into header and account menu", () => {
    const nav = normalizeNavShape({
      public: [{ label: "Home", href: "/" }],
      member: [
        { label: "Dashboard", href: "/dashboard", requiresAuth: true },
        { label: "Log PR", href: "/pr/submit", requiresAuth: true },
        { label: "Feed", href: "/feed", requiresAuth: true },
      ],
      admin: [],
    });

    expect(nav.member.map((item) => item.href)).toEqual(["/dashboard"]);
    expect(nav.account.map((item) => item.href)).toEqual(["/pr/submit", "/feed"]);
  });
});

describe("mergeSiteMenuState", () => {
  it("derives enabled pages from nav arrays and feature flags", () => {
    const config = getGymConfig();
    const state = mergeSiteMenuState(config);

    expect(state.pages.find((p) => p.id === "home")).toMatchObject({ enabled: true });
    expect(state.pages.find((p) => p.id === "leaderboards")?.enabled).toBe(true);
    expect(state.pages.find((p) => p.id === "contact")?.enabled).toBe(true);
    expect(state.pages.find((p) => p.id === "achievements")?.enabled).toBe(true);
  });

  it("marks pages disabled when absent from nav", () => {
    const config = getGymConfig();
    const state = mergeSiteMenuState({
      ...config,
      nav: {
        ...config.nav,
        public: [{ label: "Home", href: "/" }],
        member: [],
        account: [],
      },
      features: {
        ...config.features,
        leaderboards: false,
        socialFeed: false,
      },
    });

    expect(state.pages.find((p) => p.id === "leaderboards")?.enabled).toBe(false);
    expect(state.pages.find((p) => p.id === "feed")?.enabled).toBe(false);
  });

  it("extracts https external links from public nav", () => {
    const config = getGymConfig();
    const state = mergeSiteMenuState({
      ...config,
      nav: {
        ...config.nav,
        public: [...config.nav.public, { label: "Book", href: "https://example.com/book" }],
      },
    });

    expect(state.externalLinks).toEqual([{ label: "Book", href: "https://example.com/book" }]);
  });
});

describe("buildNavFromSiteMenu", () => {
  it("builds public, member header, and account nav from enabled pages only", () => {
    const base = mergeSiteMenuState(getGymConfig());
    const state = {
      pages: base.pages.map((page) =>
        page.id === "competitions" || page.id === "feed" ? { ...page, enabled: false } : page,
      ),
      externalLinks: [{ label: "Instagram", href: "https://instagram.com/gym" }],
    };

    const nav = buildNavFromSiteMenu(state);

    expect(nav.public.map((item) => item.href)).toEqual([
      "/",
      "/leaderboards",
      "/contact",
      "https://instagram.com/gym",
    ]);
    expect(nav.member.map((item) => item.href)).toEqual(["/dashboard"]);
    expect(nav.account.map((item) => item.href)).not.toContain("/feed");
    expect(nav.account.map((item) => item.href)).toContain("/achievements");
  });

  it("includes achievements in account nav when page is enabled", () => {
    const base = mergeSiteMenuState(getGymConfig());
    const nav = buildNavFromSiteMenu(base);

    expect(nav.account.map((item) => item.href)).toContain("/achievements");
    expect(nav.member.map((item) => item.href)).toEqual(["/dashboard"]);
  });

  it("always keeps home first in public nav", () => {
    const base = mergeSiteMenuState(getGymConfig());
    const nav = buildNavFromSiteMenu(base);
    expect(nav.public[0]?.href).toBe("/");
  });
});

describe("buildFeaturesFromSiteMenu", () => {
  it("syncs feature flags from page toggles", () => {
    const base = mergeSiteMenuState(getGymConfig());
    const state = {
      pages: base.pages.map((page) =>
        page.id === "leaderboards" || page.id === "achievements" ? { ...page, enabled: false } : page,
      ),
      externalLinks: [],
    };

    const features = buildFeaturesFromSiteMenu(state, getGymConfig().features);

    expect(features.leaderboards).toBe(false);
    expect(features.achievements).toBe(false);
    expect(features.competitions).toBe(true);
  });
});

describe("extractExternalLinksFromNav", () => {
  it("ignores internal catalog hrefs", () => {
    const links = extractExternalLinksFromNav([
      { label: "Home", href: "/" },
      { label: "Board", href: "/leaderboards" },
    ]);
    expect(links).toEqual([]);
  });
});

describe("NAV_CATALOG", () => {
  it("includes contact and account-menu placements", () => {
    const ids = NAV_CATALOG.map((entry) => entry.id);
    expect(ids).toContain("contact");
    expect(ids).toContain("prModeration");
    expect(NAV_CATALOG.find((e) => e.id === "prSubmit")?.placement).toBe("accountMenu");
    expect(NAV_CATALOG.find((e) => e.id === "dashboard")?.placement).toBe("memberHeader");
  });
});
