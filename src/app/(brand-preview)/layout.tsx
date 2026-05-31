import { redirect } from "next/navigation";
import { getAuthContext, isOwnerRole } from "@/lib/rbac";
import { hasClerk } from "@/lib/env";

const demoOwnerId = "demo-admin";

export default async function BrandPreviewRouteLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthContext();

  if (!hasClerk) {
    if (auth.clerkUserId !== demoOwnerId) {
      redirect("/admin/settings/brand");
    }
    return children;
  }

  if (!isOwnerRole(auth.role)) {
    redirect("/admin/settings/brand");
  }

  return children;
}
