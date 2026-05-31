import Link from "next/link";
import type { GymBusinessInfo, GymConfig } from "@/config/types";
import { formatBusinessAddressLines, getVisibleBusinessLinks, isBusinessFieldVisible } from "@/lib/business-info";
import { cn } from "@/lib/utils";

type BusinessPlacement = "footer" | "contactPage" | "homepageLocation" | "homepageHours";

type BusinessContactDisplayProps = {
  config: GymConfig;
  placement: BusinessPlacement;
  className?: string;
  /** Footer uses centered compact layout */
  variant?: "default" | "footer";
};

const BusinessLinksList = ({
  business,
  placement,
  className,
}: {
  business: GymBusinessInfo;
  placement: "footer" | "contactPage";
  className?: string;
}) => {
  const links = getVisibleBusinessLinks(business, placement);
  if (!links.length) return null;

  return (
    <ul className={cn("flex flex-wrap gap-3", className)}>
      {links.map((link) => (
        <li key={link.id}>
          <Link
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-(--gym-accent) underline-offset-2 hover:underline"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export const BusinessContactDisplay = ({
  config,
  placement,
  className,
  variant = "default",
}: BusinessContactDisplayProps) => {
  const { business } = config;
  const isFooter = variant === "footer";
  const showAddress =
    placement === "homepageLocation"
      ? isBusinessFieldVisible(business.visibility.address, "homepageLocation")
      : placement === "footer"
        ? business.visibility.address.showInFooter
        : placement === "contactPage"
          ? business.visibility.address.showOnContactPage
          : false;

  const showPhone =
    placement === "homepageLocation"
      ? isBusinessFieldVisible(business.visibility.phone, "homepageLocation")
      : placement === "footer"
        ? business.visibility.phone.showInFooter
        : placement === "contactPage"
          ? business.visibility.phone.showOnContactPage
          : false;

  const showEmail =
    placement === "homepageLocation"
      ? isBusinessFieldVisible(business.visibility.generalEmail, "homepageLocation")
      : placement === "footer"
        ? business.visibility.generalEmail.showInFooter
        : placement === "contactPage"
          ? business.visibility.generalEmail.showOnContactPage
          : false;

  const showHours =
    placement === "homepageHours"
      ? business.visibility.hours.showOnHomepageHours
      : placement === "footer"
        ? business.visibility.hours.showInFooter
        : placement === "contactPage"
          ? business.visibility.hours.showOnContactPage
          : false;

  const addressLines = formatBusinessAddressLines(business);
  const hasAddress = showAddress && addressLines.length > 0;
  const hasPhone = showPhone && business.contactPhone.trim();
  const hasEmail = showEmail && business.generalEmail.trim();
  const linkPlacement = placement === "footer" || placement === "contactPage" ? placement : null;

  if (placement === "homepageHours" && !showHours) {
    return (
      <p className={cn("text-sm text-(--gym-muted)", className)}>
        Hours are hidden on the homepage — enable them in Business settings.
      </p>
    );
  }

  if (!hasAddress && !hasPhone && !hasEmail && !showHours && !linkPlacement) {
    return null;
  }

  return (
    <div className={cn(isFooter ? "space-y-2 text-sm" : "space-y-4", className)}>
      {showHours ? (
        <ul className={cn("space-y-2", isFooter && "text-(--gym-muted)")}>
          {business.hours.map((row) => (
            <li
              key={row.day}
              className={cn(
                !isFooter &&
                  "flex justify-between rounded-lg border border-(--gym-border) bg-(--gym-surface) px-4 py-3",
                isFooter && "flex justify-center gap-2",
              )}
            >
              <span className={cn(!isFooter && "font-medium")}>{row.day}</span>
              <span className="text-(--gym-muted)">
                {row.open} – {row.close}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {hasAddress ? (
        <address className={cn(isFooter ? "text-(--gym-muted) not-italic" : "not-italic")}>
          {addressLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </address>
      ) : null}

      {hasPhone ? (
        <p>
          <a href={`tel:${business.contactPhone.replace(/\s/g, "")}`} className="text-(--gym-accent) hover:underline">
            {business.contactPhone}
          </a>
        </p>
      ) : null}

      {hasEmail ? (
        <p>
          <a href={`mailto:${business.generalEmail}`} className="text-(--gym-accent) hover:underline">
            {business.generalEmail}
          </a>
        </p>
      ) : null}

      {linkPlacement ? <BusinessLinksList business={business} placement={linkPlacement} /> : null}
    </div>
  );
};
