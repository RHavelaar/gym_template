import Link from "next/link";
import type { Competition } from "@/types/database";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type CompetitionCardProps = {
  competition: Competition;
};

export const CompetitionCard = ({ competition }: CompetitionCardProps) => (
  <Card>
    <div className="flex items-start justify-between gap-2">
      <CardTitle>{competition.title}</CardTitle>
      <Badge>{competition.status}</Badge>
    </div>
    <CardDescription className="line-clamp-2">{competition.description}</CardDescription>
    <p className="mt-3 text-sm text-(--gym-muted)">
      {formatDate(competition.starts_at)} – {formatDate(competition.ends_at)}
    </p>
    <Link href={`/competitions/${competition.slug}`} className="mt-4 inline-block">
      <Button variant="secondary" size="sm">
        View details
      </Button>
    </Link>
  </Card>
);
