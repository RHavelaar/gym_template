export type NavHelpCopy = {
  label: string;
  hint: string;
  recommendation: string;
};

export const SITE_MENU_SECTIONS = {
  public: {
    title: "Public menu",
    hint: "Links visitors see before they sign in — shown in the site header.",
    description:
      "Turn pages on or off and rename how they appear in the menu. Page addresses stay fixed so links never break.",
  },
  memberHeader: {
    title: "Signed-in header",
    hint: "Links in the main menu bar after someone signs in — keep this short.",
    description: "Most gyms only show Dashboard here. Members open everything else from their profile menu.",
  },
  accountMenu: {
    title: "Profile menu",
    hint: "Links inside the account menu (avatar) — Log PR, Feed, Achievements, and similar.",
    description:
      "Good for tools members use often but do not need in the top bar. Turning off a page here also hides it from the profile menu.",
  },
  modules: {
    title: "Other gym modules",
    hint: "These settings do not add menu links but change what members and staff can do on the site.",
    description: "Turn off features you do not use yet. Existing data is kept.",
  },
  external: {
    title: "External links",
    hint: "Optional links that open another website — booking systems, social profiles, or your Google listing.",
    description: "Add up to two links. They appear at the end of your public menu and open in a new tab.",
  },
  staffNote: "Staff menu links are managed by your platform team and are not editable here.",
} as const;

export const SITE_MENU_PAGE_HELP: Record<string, NavHelpCopy> = {
  home: {
    label: "Home label",
    hint: "The text for your homepage link in the menu.",
    recommendation: "Keep it short — “Home” works for most gyms.",
  },
  leaderboards: {
    label: "Leaderboards label",
    hint: "Public page where approved PRs are ranked.",
    recommendation: "Try “PR Board” or “Records” if that fits your gym better.",
  },
  competitions: {
    label: "Competitions label",
    hint: "Public pages for in-house or sanctioned events.",
    recommendation: "Enable when you run comps; hide it during the off-season.",
  },
  contact: {
    label: "Contact label",
    hint: "Public contact page with hours, address, and links you enabled in Business settings.",
    recommendation: "Turn on so visitors can find directions and your help email.",
  },
  dashboard: {
    label: "Dashboard label",
    hint: "The main link signed-in members use in the header — their home base in the app.",
    recommendation: "Keep enabled. “My Dashboard” or “Member Hub” are common labels.",
  },
  prSubmit: {
    label: "Log PR label",
    hint: "Where members submit new personal records.",
    recommendation: "Most gyms leave this on — it drives leaderboard engagement.",
  },
  feed: {
    label: "Gym Feed label",
    hint: "Member social feed for posts, reactions, and gym updates.",
    recommendation: "Turn on if you want members sharing PRs and culture in-app.",
  },
  achievements: {
    label: "Achievements",
    hint: "Badges and progress celebrations on member profiles.",
    recommendation: "Great for retention — pairs well with leaderboards.",
  },
  prModeration: {
    label: "PR moderation",
    hint: "Staff review queue before PRs appear on leaderboards.",
    recommendation: "Keep on if you verify lifts; turn off for honor-system gyms.",
  },
};

export const EXTERNAL_LINK_HELP = {
  label: {
    label: "Link label",
    hint: "Menu text visitors will see — e.g. “Book a class” or “Follow us”.",
    recommendation: "Keep it under 20 characters so it fits on mobile.",
  },
  href: {
    label: "Website address",
    hint: "Must start with https:// — opens in a new tab when clicked.",
    recommendation: "Paste the full link from your booking or social profile page.",
  },
} as const;
