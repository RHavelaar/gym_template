import { getResolvedGymConfig } from "@/lib/gym-config-resolver";
import { requireFeatureEnabled } from "@/lib/feature-guards";
import { LeaderboardTable } from "@/components/leaderboards/leaderboard-table";
import { getLeaderboardRows } from "@/lib/demo-data";

export const metadata = { title: "Leaderboards" };

export default async function LeaderboardsPage() {
  await requireFeatureEnabled("leaderboards");
  const config = await getResolvedGymConfig();
  const rows = getLeaderboardRows();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-black uppercase">{config.labels.leaderboard}</h1>
      <p className="mt-2 text-(--gym-muted)">
        All-time approved PRs. Filter by machine, lift, and division (more filters coming).
      </p>
      <div className="mt-8">
        <LeaderboardTable rows={rows} />
      </div>
    </div>
  );
}
