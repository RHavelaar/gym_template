import { addEquipmentAction } from "@/app/actions/admin";
import { demoLifts, demoMachines } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = { title: "Equipment" };

export default function EquipmentPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-black uppercase">Machines & lifts</h1>

      <Card className="mt-8">
        <CardTitle>Add equipment</CardTitle>
        <form action={addEquipmentAction} className="mt-4 space-y-4">
          <div>
            <Label htmlFor="kind">Type</Label>
            <select
              id="kind"
              name="kind"
              className="min-h-12 w-full rounded-lg border border-(--gym-border) bg-black/40 px-4 text-white"
              defaultValue="machine"
            >
              <option value="machine">Machine</option>
              <option value="lift">Lift</option>
            </select>
          </div>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder="e.g. Belt Squat" />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" required placeholder="belt-squat" />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" required defaultValue="general" />
          </div>
          <Button type="submit">Add</Button>
        </form>
      </Card>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Machines</h2>
        <ul className="mt-3 space-y-2">
          {demoMachines.map((m) => (
            <li key={m.id} className="rounded-lg border border-(--gym-border) px-4 py-3">
              {m.name} <span className="text-(--gym-muted)">({m.category})</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold">Lifts</h2>
        <ul className="mt-3 space-y-2">
          {demoLifts.map((l) => (
            <li key={l.id} className="rounded-lg border border-(--gym-border) px-4 py-3">
              {l.name} <span className="text-(--gym-muted)">({l.category})</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
