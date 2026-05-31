import { redirect } from "next/navigation";
import { GymShell } from "@/components/layout/gym-shell";
import { getAuthContext, isStaffRole } from "@/lib/rbac";
import { hasClerk } from "@/lib/env";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthContext();
  if (hasClerk && !isStaffRole(auth.role)) {
    redirect("/dashboard");
  }

  return <GymShell forceStaffNav>{children}</GymShell>;
}
