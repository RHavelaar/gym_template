import { moderatePrAction } from "@/app/actions/pr";
import { demoPrSubmissions, demoProfiles, demoMachines, demoLifts } from "@/lib/demo-data";
import { formatDate, formatWeight } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "PR Queue" };

export default function PrQueuePage() {
  const pending = demoPrSubmissions.filter((p) => p.status === "pending" || p.status === "flagged");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-black uppercase">PR review</h1>
      <p className="mt-2 text-(--gym-muted)">Approve PRs to publish them on leaderboards.</p>

      <div className="mt-8 space-y-4">
        {pending.length === 0 ? (
          <p className="text-(--gym-muted)">Queue is clear.</p>
        ) : (
          pending.map((pr) => {
            const profile = demoProfiles.find((p) => p.id === pr.profile_id);
            const target =
              demoMachines.find((m) => m.id === pr.machine_id)?.name ??
              demoLifts.find((l) => l.id === pr.lift_id)?.name ??
              "PR";
            return (
              <Card key={pr.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <CardTitle>{profile?.display_name}</CardTitle>
                    <p className="mt-1 text-lg font-bold">
                      {formatWeight(pr.value, pr.unit)} — {target}
                    </p>
                    <p className="text-sm text-(--gym-muted)">{formatDate(pr.submitted_at)}</p>
                    {pr.notes && <p className="mt-2 text-sm">{pr.notes}</p>}
                  </div>
                  <Badge>{pr.status}</Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await moderatePrAction(pr.id, "approved");
                    }}
                  >
                    <Button type="submit" size="sm">
                      Approve
                    </Button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await moderatePrAction(pr.id, "rejected");
                    }}
                  >
                    <Button type="submit" variant="danger" size="sm">
                      Reject
                    </Button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await moderatePrAction(pr.id, "flagged");
                    }}
                  >
                    <Button type="submit" variant="secondary" size="sm">
                      Flag
                    </Button>
                  </form>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
