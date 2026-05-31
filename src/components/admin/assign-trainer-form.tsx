"use client";

import { useActionState } from "react";
import { assignTrainerAction, type ProfileFormState } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type AssignTrainerFormProps = {
  profiles: { id: string; display_name: string; role: string }[];
};

const initialState: ProfileFormState = { ok: false, message: "" };

export const AssignTrainerForm = ({ profiles }: AssignTrainerFormProps) => {
  const [state, formAction, pending] = useActionState(assignTrainerAction, initialState);

  const trainers = profiles.filter((p) => p.role === "personal_trainer" || p.role === "manager" || p.role === "owner");
  const clients = profiles.filter((p) => p.role === "user");

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="trainerProfileId">Trainer</Label>
        <select
          id="trainerProfileId"
          name="trainerProfileId"
          required
          className="min-h-12 w-full rounded-lg border border-(--gym-border) bg-black/40 px-4 text-white"
        >
          <option value="">— Select trainer —</option>
          {trainers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.display_name} ({p.role.replace("_", " ")})
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="clientProfileId">Client</Label>
        <select
          id="clientProfileId"
          name="clientProfileId"
          required
          className="min-h-12 w-full rounded-lg border border-(--gym-border) bg-black/40 px-4 text-white"
        >
          <option value="">— Select member —</option>
          {clients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.display_name}
            </option>
          ))}
        </select>
      </div>
      {state.message && (
        <p className={state.ok ? "text-(--gym-accent)" : "text-(--gym-danger)"} role="status">
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Assigning..." : "Assign trainer to client"}
      </Button>
    </form>
  );
};
