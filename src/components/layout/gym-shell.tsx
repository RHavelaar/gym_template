import { brandToCssVars } from "@/config";
import { getResolvedGymConfig } from "@/lib/gym-config-resolver";
import { hasClerk } from "@/lib/env";
import { getAuthContext, isOwnerRole, isStaffRole, isTrainerRole } from "@/lib/rbac";
import { getAccountNavItems } from "@/lib/nav-catalog";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import type { NavItem } from "@/config/types";

type GymShellProps = {
  children: React.ReactNode;
  slug?: string;
  forceStaffNav?: boolean;
};

export const GymShell = async ({ children, slug, forceStaffNav = false }: GymShellProps) => {
  const config = await getResolvedGymConfig(slug);
  const auth = await getAuthContext();

  const isAuthenticated = Boolean(auth.clerkUserId);
  const memberNav: NavItem[] = isAuthenticated ? [...config.nav.member] : [];
  const accountNav: NavItem[] = isAuthenticated ? getAccountNavItems(config) : [];

  return (
    <div className="flex min-h-full flex-col bg-(--gym-bg) text-white" style={brandToCssVars(config)}>
      <SiteHeader
        config={config}
        isAuthenticated={isAuthenticated}
        isStaff={forceStaffNav || isStaffRole(auth.role)}
        isOwner={isOwnerRole(auth.role) || (!hasClerk && auth.clerkUserId === "demo-admin")}
        isTrainer={isTrainerRole(auth.role)}
        memberNav={memberNav}
        accountNav={accountNav}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter config={config} />
    </div>
  );
};
