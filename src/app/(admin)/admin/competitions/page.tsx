import Link from "next/link";
import { demoCompetitions } from "@/lib/demo-data";
import { CompetitionCard } from "@/components/competitions/competition-card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Manage competitions" };

export default function AdminCompetitionsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-black uppercase">Competitions</h1>
        <Link href="/admin/competitions/new">
          <Button>Create competition</Button>
        </Link>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {demoCompetitions.map((c) => (
          <CompetitionCard key={c.id} competition={c} />
        ))}
      </div>
    </div>
  );
}
