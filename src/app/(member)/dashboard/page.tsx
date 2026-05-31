import Link from "next/link";
import { getGymConfig } from "@/config";
import { getAuthContext } from "@/lib/rbac";
import { demoCompetitions, demoPrSubmissions, demoProfiles } from "@/lib/demo-data";
import { formatDate, formatWeight } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const config = getGymConfig();
  const auth = await getAuthContext();
  const profile = demoProfiles.find((p) => p.id === auth.profileId) ?? demoProfiles[1];
  const myPrs = demoPrSubmissions.filter((p) => p.profile_id === profile.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-black uppercase">Welcome, {profile.display_name}</h1>
      <p className="mt-2 text-(--gym-muted)">{config.tagline}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/pr/submit">
          <Button size="lg" className="h-full w-full">
            {config.labels.prSubmit}
          </Button>
        </Link>
        <Link href="/leaderboards">
          <Button variant="secondary" size="lg" className="h-full w-full">
            {config.labels.leaderboard}
          </Button>
        </Link>
        <Link href="/feed">
          <Button variant="secondary" size="lg" className="h-full w-full">
            {config.labels.feed}
          </Button>
        </Link>
        <Link href="/competitions">
          <Button variant="secondary" size="lg" className="h-full w-full">
            {config.labels.competitions}
          </Button>
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Your recent PRs</h2>
        <div className="mt-4 space-y-3">
          {myPrs.length === 0 ? (
            <p className="text-(--gym-muted)">No PRs yet — log your first one.</p>
          ) : (
            myPrs.map((pr) => (
              <Card key={pr.id} className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>{formatWeight(pr.value, pr.unit)}</CardTitle>
                  <CardDescription>{formatDate(pr.submitted_at)}</CardDescription>
                </div>
                <Badge>{pr.status}</Badge>
              </Card>
            ))
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Open competitions</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {demoCompetitions
            .filter((c) => c.status === "open")
            .map((c) => (
              <Card key={c.id}>
                <CardTitle>{c.title}</CardTitle>
                <CardDescription>{c.description}</CardDescription>
              </Card>
            ))}
        </div>
      </section>
    </div>
  );
}
