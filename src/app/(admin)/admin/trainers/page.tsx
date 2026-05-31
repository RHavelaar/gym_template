import Link from "next/link";
import { listGymProfilesForAdmin } from "@/app/actions/profile";
import { AssignTrainerForm } from "@/components/admin/assign-trainer-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Trainer Assignments" };

export default async function AdminTrainersPage() {
  const profiles = await listGymProfilesForAdmin();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/admin" className="text-sm text-(--gym-muted) hover:text-white">
        ← Staff home
      </Link>
      <h1 className="mt-4 text-3xl font-black uppercase">Trainer assignments</h1>
      <p className="mt-2 text-(--gym-muted)">
        Connect personal trainers with members so they can view stats and add notes.
      </p>

      <Card className="mt-8">
        <CardTitle>Assign trainer</CardTitle>
        <CardDescription className="mt-1">
          Trainers gain read access to assigned clients&apos; private fitness data.
        </CardDescription>
        <div className="mt-6">
          <AssignTrainerForm profiles={profiles} />
        </div>
      </Card>
    </div>
  );
}
