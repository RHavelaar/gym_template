import { redirect } from "next/navigation";
import { ClipboardList, History, Lock, Scale, Target, TrendingUp } from "lucide-react";
import { getGymConfig } from "@/config";
import { MeasurementHistory } from "@/components/profile/measurement-history";
import { ProfileFitnessForm } from "@/components/profile/profile-fitness-form";
import { ProfileGoalsForm } from "@/components/profile/profile-goals-form";
import { ProfilePrivacyForm } from "@/components/profile/profile-privacy-form";
import { ProfileProgressDashboard } from "@/components/profile/profile-progress-dashboard";
import { ProfileQuickNav } from "@/components/profile/profile-quick-nav";
import { ProfileSection } from "@/components/profile/profile-section";
import { ProfileHeader, ProfileStatsGrid } from "@/components/profile/profile-stats-grid";
import { Card } from "@/components/ui/card";
import { buildMeasurementProgressSummary } from "@/lib/progress";
import { getAuthContext } from "@/lib/rbac";
import {
  getMeasurementGoalsForProfile,
  getMeasurementHistory,
  getProfileByClerkId,
  goalsRecordToSnapshot,
} from "@/lib/profiles";

export const metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const config = getGymConfig();
  const auth = await getAuthContext();

  if (!auth.clerkUserId) {
    redirect("/sign-in?redirect_url=/profile");
  }

  const profile = await getProfileByClerkId(auth.clerkUserId);
  if (!profile) {
    redirect("/dashboard");
  }

  const [measurements, goals] = await Promise.all([
    getMeasurementHistory(profile.id, 24),
    getMeasurementGoalsForProfile(profile.id),
  ]);

  const progressSummary = buildMeasurementProgressSummary(
    profile,
    goalsRecordToSnapshot(goals),
    measurements,
    goals?.show_progress_on_profile ?? true,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
      <ProfileHeader profile={profile} />
      <ProfileQuickNav showProgress={progressSummary.showOnProfile} />

      <div className="space-y-10 sm:space-y-12">
        <ProfileSection
          id="stats"
          icon={Scale}
          title="Your current stats"
          description="A snapshot of where you are today. These update every time you save a check-in."
        >
          <ProfileStatsGrid profile={profile} />
        </ProfileSection>

        <ProfileSection
          id="goals"
          icon={Target}
          title="Your goals"
          description="Set target numbers for the measurements that matter to you. Everything is optional — skip anything you're not comfortable tracking."
        >
          <Card className="border-(--gym-border) bg-black/15 p-4 sm:p-6">
            <ProfileGoalsForm goals={goals} />
          </Card>
        </ProfileSection>

        {progressSummary.showOnProfile && (
          <ProfileSection
            id="progress"
            icon={TrendingUp}
            title="Your progress"
            description="See how your check-ins stack up against your goals. Dashed lines mark your targets on each chart."
          >
            <ProfileProgressDashboard summary={progressSummary} />
          </ProfileSection>
        )}

        <ProfileSection
          id="check-in"
          icon={ClipboardList}
          title="Log a check-in"
          description="Update your measurements whenever you want. Only fill in what changed — we'll keep the rest."
        >
          <Card className="border-(--gym-border) bg-black/15 p-4 sm:p-6">
            <ProfileFitnessForm profile={profile} />
          </Card>
        </ProfileSection>

        <ProfileSection
          id="history"
          icon={History}
          title="Your progress over time"
          description="A private timeline of your past check-ins. Scroll through to see how far you've come."
        >
          <MeasurementHistory measurements={measurements} />
        </ProfileSection>

        <ProfileSection
          id="privacy"
          icon={Lock}
          title="Who can see this?"
          description={`Choose who at ${config.name} can view your stats and measurement history.`}
        >
          <Card className="border-(--gym-border) bg-black/15 p-4 sm:p-6">
            <ProfilePrivacyForm visibility={profile.visibility} />
          </Card>
        </ProfileSection>
      </div>
    </div>
  );
}
