import type { GymConfig } from "@/config/types";

export type LinkablePage = {
  label: string;
  href: string;
  group: "core" | "public" | "member" | "feature";
};

const isAdminRoute = (href: string) => href === "/admin" || href.startsWith("/admin/");

const dedupePages = (pages: LinkablePage[]): LinkablePage[] => {
  const seen = new Set<string>();
  return pages.filter((page) => {
    if (seen.has(page.href)) return false;
    seen.add(page.href);
    return true;
  });
};

export const getLinkablePages = (config: GymConfig): LinkablePage[] => {
  const pages: LinkablePage[] = [
    { label: "Home", href: "/", group: "core" },
    { label: "Sign up", href: "/sign-up", group: "core" },
    { label: "Sign in", href: "/sign-in", group: "core" },
    { label: "Contact", href: "/contact", group: "core" },
  ];

  for (const item of config.nav.public) {
    if (isAdminRoute(item.href)) continue;
    pages.push({ label: item.label, href: item.href, group: "public" });
  }

  for (const item of config.nav.member) {
    if (isAdminRoute(item.href)) continue;
    pages.push({ label: item.label, href: item.href, group: "member" });
  }

  for (const item of config.nav.account ?? []) {
    if (isAdminRoute(item.href)) continue;
    pages.push({ label: item.label, href: item.href, group: "member" });
  }

  const featureRoutes: { enabled: boolean; label: string; href: string }[] = [
    { enabled: config.features.leaderboards, label: config.labels.leaderboard, href: "/leaderboards" },
    { enabled: config.features.competitions, label: config.labels.competitions, href: "/competitions" },
    { enabled: config.features.socialFeed, label: config.labels.feed, href: "/feed" },
  ];

  for (const route of featureRoutes) {
    if (!route.enabled || isAdminRoute(route.href)) continue;
    pages.push({ label: route.label, href: route.href, group: "feature" });
  }

  pages.push(
    { label: config.labels.dashboard, href: "/dashboard", group: "member" },
    { label: config.labels.prSubmit, href: "/pr/submit", group: "member" },
    { label: config.labels.profile, href: "/profile", group: "member" },
  );

  return dedupePages(pages).filter((page) => !isAdminRoute(page.href));
};

export const filterLinkablePages = (pages: LinkablePage[], query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return pages;
  return pages.filter(
    (page) => page.label.toLowerCase().includes(normalized) || page.href.toLowerCase().includes(normalized),
  );
};

export const findLinkablePageLabel = (pages: LinkablePage[], href: string) =>
  pages.find((page) => page.href === href)?.label;
