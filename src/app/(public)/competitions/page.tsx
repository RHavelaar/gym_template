import { getResolvedGymConfig } from "@/lib/gym-config-resolver";
import { requireFeatureEnabled } from "@/lib/feature-guards";
import { CompetitionCard } from "@/components/competitions/competition-card";
import { demoCompetitions } from "@/lib/demo-data";

export const metadata = { title: "Competitions" };

export default async function CompetitionsPage() {
  await requireFeatureEnabled("competitions");
  const config = await getResolvedGymConfig();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-black uppercase">{config.labels.competitions}</h1>
      <p className="mt-2 max-w-2xl text-(--gym-muted)">
        Gym challenges, PR contests, and meet prep — register and track standings.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {demoCompetitions.map((c) => (
          <CompetitionCard key={c.id} competition={c} />
        ))}
      </div>
    </div>
  );
}
