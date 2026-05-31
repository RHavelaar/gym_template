import Link from "next/link";
import { redirect } from "next/navigation";
import { TrainerNotesForm } from "@/components/profile/trainer-notes-form";
import { ProfileStatsGrid } from "@/components/profile/profile-stats-grid";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { getTrainerAssignmentsForTrainer, getTrainerNotesForClient } from "@/lib/profiles";
import { getAuthContext, isTrainerRole } from "@/lib/rbac";

export const metadata = { title: "My Clients" };

export default async function TrainerClientsPage() {
  const auth = await getAuthContext();

  if (!auth.clerkUserId || !auth.profileId || !isTrainerRole(auth.role)) {
    redirect("/dashboard");
  }

  const gymId = auth.gymId;
  if (!gymId) {
    redirect("/dashboard");
  }

  const assignments = await getTrainerAssignmentsForTrainer(auth.profileId, gymId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-black uppercase">My clients</h1>
      <p className="mt-2 text-(--gym-muted)">View assigned members and add coaching notes.</p>

      {assignments.length === 0 ? (
        <Card className="mt-8">
          <CardTitle>No clients assigned</CardTitle>
          <CardDescription>
            Ask a manager to assign clients from the{" "}
            <Link href="/admin/trainers" className="text-(--gym-accent) hover:underline">
              trainer admin
            </Link>{" "}
            page.
          </CardDescription>
        </Card>
      ) : (
        <div className="mt-8 space-y-8">
          {await Promise.all(
            assignments.map(async (assignment) => {
              const notes = await getTrainerNotesForClient(gymId, assignment.client_profile_id);

              return (
                <Card key={assignment.id}>
                  <div>
                    <CardTitle>{assignment.client.display_name}</CardTitle>
                    <CardDescription>Assigned {formatDate(assignment.assigned_at)}</CardDescription>
                  </div>

                  <div className="mt-4">
                    <ProfileStatsGrid profile={assignment.client} />
                  </div>

                  {notes.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <h3 className="text-sm font-bold uppercase">Notes</h3>
                      {notes.map((note) => (
                        <div key={note.id} className="rounded-lg border border-(--gym-border) bg-black/20 p-3 text-sm">
                          <p className="text-xs text-(--gym-muted)">
                            {note.trainer_name} · {formatDate(note.created_at)}
                          </p>
                          <p className="mt-1 text-neutral-200">{note.body}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 border-t border-(--gym-border) pt-6">
                    <TrainerNotesForm clientProfileId={assignment.client_profile_id} />
                  </div>
                </Card>
              );
            }),
          )}
        </div>
      )}
    </div>
  );
}
