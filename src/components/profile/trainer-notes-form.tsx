"use client";

import { useActionState } from "react";
import { addTrainerNoteAction, type ProfileFormState } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type TrainerNotesFormProps = {
  clientProfileId: string;
};

const initialState: ProfileFormState = { ok: false, message: "" };

export const TrainerNotesForm = ({ clientProfileId }: TrainerNotesFormProps) => {
  const [state, formAction, pending] = useActionState(addTrainerNoteAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="clientProfileId" value={clientProfileId} />
      <div>
        <Label htmlFor={`note-${clientProfileId}`}>Add trainer note</Label>
        <textarea
          id={`note-${clientProfileId}`}
          name="body"
          rows={3}
          required
          className="mt-2 w-full rounded-lg border border-(--gym-border) bg-black/40 px-4 py-3 text-white"
          placeholder="Coaching notes for this client..."
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-(--gym-muted)">
        <input
          type="checkbox"
          name="visibleToClient"
          value="true"
          defaultChecked
          className="h-4 w-4 accent-(--gym-primary)"
        />
        Visible to client
      </label>
      {state.message && (
        <p className={state.ok ? "text-(--gym-accent)" : "text-(--gym-danger)"} role="status">
          {state.message}
        </p>
      )}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving..." : "Save note"}
      </Button>
    </form>
  );
};
