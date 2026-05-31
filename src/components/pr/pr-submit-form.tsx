"use client";

import { useActionState } from "react";
import { submitPrAction, type PrFormState } from "@/app/actions/pr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ERROR_CODES } from "@/lib/errors/codes";
import { isValidationFormMessage, useOperationalFormToast } from "@/hooks/use-operational-form-toast";
import type { Lift, Machine } from "@/types/database";

type PrSubmitFormProps = {
  machines: Machine[];
  lifts: Lift[];
};

const initialState: PrFormState = { ok: false, message: "" };

export const PrSubmitForm = ({ machines, lifts }: PrSubmitFormProps) => {
  const [state, formAction, pending] = useActionState(submitPrAction, initialState);

  useOperationalFormToast(state, {
    errorCode: ERROR_CODES.PR_SUBMIT_FAILED,
    validationIncludes: "Please check",
    toastSuccess: true,
  });

  const showInlineMessage = state.message && isValidationFormMessage(state.message);

  return (
    <form action={formAction} className="mx-auto max-w-lg space-y-5">
      <div>
        <Label htmlFor="targetType">PR type</Label>
        <select
          id="targetType"
          name="targetType"
          required
          className="min-h-12 w-full rounded-lg border border-(--gym-border) bg-black/40 px-4 text-white"
          defaultValue="machine"
        >
          <option value="machine">Machine</option>
          <option value="lift">Lift</option>
        </select>
      </div>

      <div>
        <Label htmlFor="machineId">Machine</Label>
        <select
          id="machineId"
          name="machineId"
          className="min-h-12 w-full rounded-lg border border-(--gym-border) bg-black/40 px-4 text-white"
        >
          <option value="">— Select machine —</option>
          {machines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="liftId">Lift</Label>
        <select
          id="liftId"
          name="liftId"
          className="min-h-12 w-full rounded-lg border border-(--gym-border) bg-black/40 px-4 text-white"
        >
          <option value="">— Select lift —</option>
          {lifts.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="value">Weight / result</Label>
        <Input id="value" name="value" type="number" min={1} step="0.5" required placeholder="e.g. 405" />
      </div>

      <div>
        <Label htmlFor="bodyweight">Bodyweight (lbs)</Label>
        <Input id="bodyweight" name="bodyweight" type="number" min={50} placeholder="Optional" />
      </div>

      <div>
        <Label htmlFor="genderDivision">Division</Label>
        <select
          id="genderDivision"
          name="genderDivision"
          className="min-h-12 w-full rounded-lg border border-(--gym-border) bg-black/40 px-4 text-white"
          defaultValue="open"
        >
          <option value="open">Open</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="non_binary">Non-binary</option>
        </select>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" placeholder="Optional context" />
      </div>

      {showInlineMessage ? (
        <p className="text-(--gym-danger)" role="status">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Submitting…" : "Submit PR"}
      </Button>
    </form>
  );
};
