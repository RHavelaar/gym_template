import { notFound } from "next/navigation";
import { demoCompetitions } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = { params: Promise<{ slug: string }> };

export default async function CompetitionDetailPage({ params }: Props) {
  const { slug } = await params;
  const competition = demoCompetitions.find((c) => c.slug === slug);
  if (!competition) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Badge>{competition.status}</Badge>
      <h1 className="mt-3 text-3xl font-black uppercase">{competition.title}</h1>
      <p className="mt-2 text-(--gym-muted)">
        {formatDate(competition.starts_at)} – {formatDate(competition.ends_at)}
      </p>
      <Card className="mt-6">
        <p className="text-neutral-200">{competition.description}</p>
        {competition.rules_summary && (
          <>
            <h2 className="mt-6 font-bold">Rules</h2>
            <p className="mt-2 text-neutral-300">{competition.rules_summary}</p>
          </>
        )}
      </Card>
      <Link href="/sign-up" className="mt-8 inline-block">
        <Button size="lg">Register as member</Button>
      </Link>
    </div>
  );
}
