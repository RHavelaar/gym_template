"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import type { GymConfig, NavItem } from "@/config/types";
import { AuthNav } from "./auth-nav";
import { NavDropdown } from "./nav-dropdown";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  config: GymConfig;
  isAuthenticated?: boolean;
  isStaff?: boolean;
  isOwner?: boolean;
  isTrainer?: boolean;
  memberNav?: NavItem[];
  accountNav?: NavItem[];
};

const filterAdminNav = (items: NavItem[], isOwner: boolean) => items.filter((item) => !item.ownerOnly || isOwner);

const dedupeNav = (items: NavItem[]) => {
  const seenHrefs = new Set<string>();
  return items.filter((item) => {
    if (seenHrefs.has(item.href)) return false;
    seenHrefs.add(item.href);
    return true;
  });
};

const NavLink = ({
  item,
  onNavigate,
  mobile = false,
}: {
  item: NavItem;
  onNavigate?: () => void;
  mobile?: boolean;
}) => {
  const className = cn(
    mobile
      ? "rounded-lg px-3 py-3 text-base font-medium text-white transition hover:bg-white/10"
      : "text-sm font-medium text-neutral-300 transition hover:text-white",
  );

  if (item.href.startsWith("https://")) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className} onClick={onNavigate}>
        {item.label}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className} onClick={onNavigate}>
      {item.label}
    </Link>
  );
};

export const SiteHeader = ({
  config,
  isAuthenticated = false,
  isStaff = false,
  isOwner = false,
  isTrainer = false,
  memberNav = [],
  accountNav = [],
}: SiteHeaderProps) => {
  const [open, setOpen] = useState(false);

  const publicNav = config.nav.public;
  const memberLinks = isAuthenticated ? dedupeNav(memberNav) : [];
  const staffNav = isStaff ? filterAdminNav(config.nav.admin, isOwner) : [];
  const primaryNav = dedupeNav([...publicNav, ...memberLinks]);

  const handleToggle = () => setOpen((value) => !value);
  const handleClose = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-(--gym-border) bg-black/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label={`${config.name} home`}>
          {config.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={config.logoUrl} alt="" className="h-8 w-8 rounded object-contain sm:h-10 sm:w-10" />
          ) : null}
          <span className="text-xl font-black tracking-tight text-white uppercase">{config.name}</span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-5 lg:flex xl:gap-6" aria-label="Main">
          {primaryNav.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
          {staffNav.length > 0 ? <NavDropdown label="Staff" items={staffNav} /> : null}
        </nav>

        <div className="hidden shrink-0 items-center lg:flex">
          <AuthNav config={config} accountNav={accountNav} isStaff={isStaff} isTrainer={isTrainer} />
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-white lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={handleToggle}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className={cn("border-t border-(--gym-border) lg:hidden", open ? "block" : "hidden")}>
        <nav className="flex flex-col gap-6 px-4 py-4" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            <p className="px-3 text-xs font-semibold tracking-widest text-(--gym-muted) uppercase">Explore</p>
            {publicNav.map((item) => (
              <NavLink key={item.href} item={item} mobile onNavigate={handleClose} />
            ))}
          </div>

          {memberLinks.length > 0 ? (
            <div className="flex flex-col gap-1">
              <p className="px-3 text-xs font-semibold tracking-widest text-(--gym-muted) uppercase">My gym</p>
              {memberLinks.map((item) => (
                <NavLink key={item.href} item={item} mobile onNavigate={handleClose} />
              ))}
            </div>
          ) : null}

          {staffNav.length > 0 ? (
            <div className="flex flex-col gap-1">
              <p className="px-3 text-xs font-semibold tracking-widest text-(--gym-muted) uppercase">Staff</p>
              {staffNav.map((item) => (
                <NavLink key={item.href} item={item} mobile onNavigate={handleClose} />
              ))}
            </div>
          ) : null}

          <div className="border-t border-(--gym-border) pt-4">
            <p className="mb-2 px-3 text-xs font-semibold tracking-widest text-(--gym-muted) uppercase">Account</p>
            <AuthNav config={config} accountNav={accountNav} isStaff={isStaff} isTrainer={isTrainer} layout="stacked" />
          </div>
        </nav>
      </div>
    </header>
  );
};
