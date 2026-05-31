import { Card } from "@/components/ui/card";
import { getResolvedGymConfig } from "@/lib/gym-config-resolver";
import { requireFeatureEnabled } from "@/lib/feature-guards";

export const metadata = { title: "Achievements" };

export default async function AchievementsPage() {
  await requireFeatureEnabled("achievements");
  const config = await getResolvedGymConfig();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-black uppercase">Achievements</h1>
      <p className="mt-2 text-(--gym-muted)">Badges and progress celebrations for {config.name} members.</p>
      <Card className="mt-8">
        <p className="text-lg font-semibold">Coming soon</p>
        <p className="mt-2 text-(--gym-muted)">
          Automated badges, milestones, and profile celebrations are on the way. Keep logging PRs and updating your
          profile — your progress will count when this launches.
        </p>
      </Card>
    </div>
  );
}
