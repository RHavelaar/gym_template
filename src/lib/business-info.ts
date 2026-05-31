import type { GymBusinessInfo } from "@/config/types";

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

export type BusinessFieldPlacement = "footer" | "contactPage" | "homepageLocation";

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

export type BusinessMembershipVisibility = {
  showOnHomepage: boolean;
};

/** Legacy JSON may still use contactEmail */
type LegacyBusinessPartial = Partial<GymBusinessInfo> & {
  contactEmail?: string;
};

export const BUSINESS_LINK_PRESETS: {
  kind: Exclude<BusinessLinkKind, "custom">;
  label: string;
  placeholder: string;
}[] = [
  { kind: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourgym" },
  { kind: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourgym" },
  { kind: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@yourgym" },
  { kind: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourgym" },
  { kind: "x", label: "X (Twitter)", placeholder: "https://x.com/yourgym" },
  { kind: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/yourgym" },
  { kind: "website", label: "Website", placeholder: "https://yourgym.com" },
];

export const MAX_CUSTOM_BUSINESS_LINKS = 8;

export const DEFAULT_BUSINESS_VISIBILITY: GymBusinessInfo["visibility"] = {
  address: { showInFooter: true, showOnContactPage: true, showOnHomepageLocation: true },
  phone: { showInFooter: true, showOnContactPage: true, showOnHomepageLocation: true },
  generalEmail: { showInFooter: false, showOnContactPage: true, showOnHomepageLocation: false },
  hours: { showInFooter: false, showOnContactPage: true, showOnHomepageHours: true },
  membershipBlurb: { showOnHomepage: true },
};

const presetLabel = (kind: BusinessLinkKind): string =>
  BUSINESS_LINK_PRESETS.find((preset) => preset.kind === kind)?.label ?? "Link";

const newLinkId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `link-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const createEmptyCustomLink = (): BusinessLink => ({
  id: newLinkId(),
  kind: "custom",
  label: "",
  url: "",
  showInFooter: true,
  showOnContactPage: true,
});

export const mergeBusinessLinks = (links: BusinessLink[] | undefined): BusinessLink[] => {
  const byKind = new Map<string, BusinessLink>();
  for (const link of links ?? []) {
    if (!link.url.trim() && link.kind !== "custom") {
      byKind.set(link.kind, link);
      continue;
    }
    const key = link.kind === "custom" ? link.id : link.kind;
    byKind.set(key, {
      ...link,
      label: link.kind === "custom" ? link.label : link.label.trim() || presetLabel(link.kind),
    });
  }

  const merged: BusinessLink[] = BUSINESS_LINK_PRESETS.map((preset) => {
    const existing = byKind.get(preset.kind);
    return (
      existing ?? {
        id: preset.kind,
        kind: preset.kind,
        label: preset.label,
        url: "",
        showInFooter: true,
        showOnContactPage: true,
      }
    );
  });

  for (const link of links ?? []) {
    if (link.kind !== "custom") continue;
    merged.push({
      ...link,
      label: link.label.trim() || "Link",
    });
  }

  return merged;
};

type GymRowContact = {
  phone?: string | null;
  email?: string | null;
  address_line1?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
};

export const normalizeBusinessInfo = (
  base: GymBusinessInfo,
  overlay: LegacyBusinessPartial = {},
  gymRow?: GymRowContact | null,
): GymBusinessInfo => {
  const legacyEmail = overlay.contactEmail ?? overlay.generalEmail;
  const generalEmail =
    overlay.generalEmail?.trim() || legacyEmail?.trim() || gymRow?.email?.trim() || base.generalEmail;
  const helpEmail =
    overlay.helpEmail !== undefined ? overlay.helpEmail.trim() || generalEmail : base.helpEmail.trim() || generalEmail;

  const address = {
    ...base.address,
    line1: overlay.address?.line1 ?? gymRow?.address_line1 ?? base.address.line1,
    city: overlay.address?.city ?? gymRow?.city ?? base.address.city,
    state: overlay.address?.state ?? gymRow?.state ?? base.address.state,
    zip: overlay.address?.zip ?? gymRow?.zip ?? base.address.zip,
    line2: overlay.address?.line2 ?? base.address.line2 ?? "",
  };

  return {
    hours: overlay.hours?.length ? overlay.hours : base.hours,
    membershipBlurb: overlay.membershipBlurb ?? base.membershipBlurb,
    generalEmail,
    helpEmail,
    contactPhone: overlay.contactPhone ?? gymRow?.phone ?? base.contactPhone,
    address,
    links: mergeBusinessLinks(overlay.links ?? base.links),
    visibility: {
      address: { ...DEFAULT_BUSINESS_VISIBILITY.address, ...base.visibility?.address, ...overlay.visibility?.address },
      phone: { ...DEFAULT_BUSINESS_VISIBILITY.phone, ...base.visibility?.phone, ...overlay.visibility?.phone },
      generalEmail: {
        ...DEFAULT_BUSINESS_VISIBILITY.generalEmail,
        ...base.visibility?.generalEmail,
        ...overlay.visibility?.generalEmail,
      },
      hours: { ...DEFAULT_BUSINESS_VISIBILITY.hours, ...base.visibility?.hours, ...overlay.visibility?.hours },
      membershipBlurb: {
        ...DEFAULT_BUSINESS_VISIBILITY.membershipBlurb,
        ...base.visibility?.membershipBlurb,
        ...overlay.visibility?.membershipBlurb,
      },
    },
  };
};

export const resolveHelpEmail = (business: GymBusinessInfo): string =>
  business.helpEmail.trim() || business.generalEmail.trim();

export const isBusinessFieldVisible = (
  visibility: BusinessFieldVisibility,
  placement: BusinessFieldPlacement,
): boolean => {
  if (placement === "footer") return visibility.showInFooter;
  if (placement === "contactPage") return visibility.showOnContactPage;
  return visibility.showOnHomepageLocation;
};

export const getVisibleBusinessLinks = (
  business: GymBusinessInfo,
  placement: "footer" | "contactPage",
): BusinessLink[] =>
  business.links.filter((link) => {
    if (!link.url.trim()) return false;
    return placement === "footer" ? link.showInFooter : link.showOnContactPage;
  });

export const formatBusinessAddressLines = (business: GymBusinessInfo): string[] => {
  const { address } = business;
  const lines: string[] = [];
  if (address.line1.trim()) lines.push(address.line1.trim());
  if (address.line2?.trim()) lines.push(address.line2.trim());
  const cityLine = [address.city, address.state].filter(Boolean).join(", ");
  const zipPart = address.zip.trim();
  if (cityLine || zipPart) {
    lines.push([cityLine, zipPart].filter(Boolean).join(" "));
  }
  return lines;
};
