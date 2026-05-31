import Link from "next/link";
import { createCompetitionAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = { title: "New competition" };

export default function NewCompetitionPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link href="/admin/competitions" className="text-sm text-(--gym-muted) hover:text-white">
        ← Back
      </Link>
      <h1 className="mt-4 text-3xl font-black uppercase">New competition</h1>

      <Card className="mt-8">
        <CardTitle>Details</CardTitle>
        <form action={createCompetitionAction} className="mt-4 space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div>
            <Label htmlFor="slug">URL slug</Label>
            <Input id="slug" name="slug" required placeholder="april-pr-challenge" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" />
          </div>
          <div>
            <Label htmlFor="startsAt">Start date</Label>
            <Input id="startsAt" name="startsAt" type="date" required />
          </div>
          <div>
            <Label htmlFor="endsAt">End date</Label>
            <Input id="endsAt" name="endsAt" type="date" required />
          </div>
          <div>
            <Label htmlFor="rulesSummary">Rules summary</Label>
            <Input id="rulesSummary" name="rulesSummary" />
          </div>
          <Button type="submit" size="lg" className="w-full">
            Create
          </Button>
        </form>
      </Card>
    </div>
  );
}
