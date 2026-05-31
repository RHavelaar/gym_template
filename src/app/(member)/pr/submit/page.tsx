import { getGymConfig } from "@/config";
import { PrSubmitForm } from "@/components/pr/pr-submit-form";
import { demoLifts, demoMachines } from "@/lib/demo-data";

export const metadata = { title: "Submit PR" };

export default function PrSubmitPage() {
  const config = getGymConfig();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-black uppercase">{config.labels.prSubmit}</h1>
      <p className="mt-2 text-(--gym-muted)">
        Log a machine or lift PR. Staff may review before it hits the leaderboard.
      </p>
      <div className="mt-8">
        <PrSubmitForm machines={demoMachines} lifts={demoLifts} />
      </div>
    </div>
  );
}
