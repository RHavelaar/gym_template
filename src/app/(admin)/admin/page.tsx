import { AlertTriangle, Calendar, ClipboardList, Dumbbell, Settings, Trophy, Users } from "lucide-react";
import { getGymConfig } from "@/config";
import { AdminActionCard } from "@/components/admin/admin-action-card";
import { demoPrSubmissions } from "@/lib/demo-data";
import { getAuthContext, isOwnerRole } from "@/lib/rbac";
import { hasClerk } from "@/lib/env";

export const metadata = { title: "Staff Portal" };

export default async function AdminDashboardPage() {
  const config = getGymConfig();
  const auth = await getAuthContext();
  const isOwner = isOwnerRole(auth.role) || (!hasClerk && auth.clerkUserId === "demo-admin");
  const pendingCount = demoPrSubmissions.filter((p) => p.status === "pending").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-black uppercase">{config.labels.admin}</h1>
      <p className="mt-2 text-(--gym-muted)">Simple tools for gym staff — no developer needed.</p>

      {pendingCount > 0 && (
        <p className="mt-4 rounded-lg border border-(--gym-accent)/50 bg-(--gym-accent)/10 px-4 py-3 text-(--gym-accent)">
          {pendingCount} PR{pendingCount === 1 ? "" : "s"} waiting for review
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {isOwner ? (
          <>
            <AdminActionCard
              href="/admin/settings"
              title="Site Settings"
              description="Edit website copy, images, homepage, and navigation"
              icon={Settings}
            />
            <AdminActionCard
              href="/admin/errors"
              title="Error log"
              description="Review issues members hit and error codes for support"
              icon={AlertTriangle}
            />
          </>
        ) : null}
        <AdminActionCard
          href="/admin/pr-queue"
          title="PR review queue"
          description="Approve, reject, or flag member submissions"
          icon={ClipboardList}
        />
        <AdminActionCard
          href="/admin/equipment"
          title="Machines & lifts"
          description="Add and manage equipment for PR tracking"
          icon={Dumbbell}
        />
        <AdminActionCard
          href="/admin/competitions"
          title="Competitions"
          description="Create challenges and manage standings"
          icon={Trophy}
        />
        <AdminActionCard
          href="/admin/trainers"
          title="Trainer assignments"
          description="Connect trainers with members for coaching"
          icon={Users}
        />
        <AdminActionCard
          href="/"
          title="View public site"
          description="See what members see on the homepage"
          icon={Calendar}
        />
      </div>
    </div>
  );
}
