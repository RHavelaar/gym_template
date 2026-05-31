"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, CircleAlert, Target } from "lucide-react";
import { updateMeasurementGoalsAction, type ProfileFormState } from "@/app/actions/profile";
import { ProfileTip } from "@/components/profile/profile-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ERROR_CODES } from "@/lib/errors/codes";
import { isValidationFormMessage, useOperationalFormToast } from "@/hooks/use-operational-form-toast";
import { GOAL_TRACKABLE_FIELDS, MEASUREMENT_SECTIONS, type GoalTrackableFieldKey } from "@/lib/measurements";
import type { ProfileMeasurementGoals } from "@/types/database";

type ProfileGoalsFormProps = {
  goals: ProfileMeasurementGoals | null;
};

const initialState: ProfileFormState = { ok: false, message: "" };

const unitSuffix: Record<string, string> = {
  lbs: "lbs",
  in: "in",
  pct: "%",
};

const goalSections = MEASUREMENT_SECTIONS.map((section) => ({
  ...section,
  fields: section.fields.filter((f) => f.key !== "height_in"),
})).filter((section) => section.fields.length > 0);

const buildGoalValues = (goals: ProfileMeasurementGoals | null) =>
  Object.fromEntries(
    GOAL_TRACKABLE_FIELDS.map((field) => [
      field.formName,
      goals?.[field.key as GoalTrackableFieldKey] != null ? String(goals[field.key as GoalTrackableFieldKey]) : "",
    ]),
  ) as Record<string, string>;

export const ProfileGoalsForm = ({ goals }: ProfileGoalsFormProps) => {
  const [state, formAction, pending] = useActionState(updateMeasurementGoalsAction, initialState);

  useOperationalFormToast(state, {
    errorCode: ERROR_CODES.PROFILE_SAVE_FAILED,
    validationIncludes: "Please check",
  });

  const showInlineBanner = state.message && (state.ok || isValidationFormMessage(state.message));

  const [values, setValues] = useState(() => buildGoalValues(goals));
  const [showOnProfile, setShowOnProfile] = useState(goals?.show_progress_on_profile ?? true);
  const [syncedAt, setSyncedAt] = useState(goals?.updated_at ?? "");

  if (goals?.updated_at && goals.updated_at !== syncedAt) {
    setSyncedAt(goals.updated_at);
    setValues(buildGoalValues(goals));
    setShowOnProfile(goals.show_progress_on_profile);
  }

  const handleFieldChange = (formName: string, value: string) => {
    setValues((current) => ({ ...current, [formName]: value }));
  };

  return (
    <form action={formAction} className="space-y-6">
      <ProfileTip>
        <strong className="font-semibold text-white">Your goals, your choice.</strong> Only fill in what you want to
        work toward — leave anything blank that you don&apos;t want to track. Height isn&apos;t included because it
        stays the same.
      </ProfileTip>

      {showInlineBanner ? (
        <div
          className={cn(
            "flex gap-3 rounded-xl border px-4 py-3.5",
            state.ok ? "border-emerald-500/40 bg-emerald-500/10" : "border-(--gym-danger)/40 bg-(--gym-danger)/10",
          )}
          role="status"
          aria-live="polite"
        >
          {state.ok ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
          ) : (
            <CircleAlert className="h-5 w-5 shrink-0 text-(--gym-danger)" aria-hidden />
          )}
          <p className={cn("text-sm leading-relaxed", state.ok ? "text-emerald-100" : "text-red-100")}>
            {state.message}
          </p>
        </div>
      ) : null}

      <div className="space-y-5">
        {goalSections.map((section) => (
          <div key={section.id} className="rounded-2xl border border-(--gym-border) bg-black/20 p-4 sm:p-5">
            <h3 className="font-semibold text-white">{section.title}</h3>
            <p className="mt-0.5 text-sm text-(--gym-muted)">{section.description}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {section.fields.map((field) => (
                <div key={field.key}>
                  <Label htmlFor={`goal-${field.formName}`}>Target {field.label.toLowerCase()}</Label>
                  <div className="relative">
                    <Input
                      id={`goal-${field.formName}`}
                      name={field.formName}
                      type="number"
                      step={field.step}
                      min={field.min}
                      max={field.max}
                      value={values[field.formName] ?? ""}
                      onChange={(event) => handleFieldChange(field.formName, event.target.value)}
                      placeholder="Optional"
                      inputMode="decimal"
                      className={cn(field.unit !== "pct" && "pr-12", field.unit === "pct" && "pr-8")}
                    />
                    <span
                      className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-(--gym-muted)"
                      aria-hidden
                    >
                      {unitSuffix[field.unit]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-(--gym-border) bg-black/20 p-4 has-checked:border-(--gym-primary)/50">
        <input
          type="checkbox"
          name="showProgressOnProfile"
          value="true"
          checked={showOnProfile}
          onChange={(event) => setShowOnProfile(event.target.checked)}
          className="mt-1 h-5 w-5 accent-(--gym-primary)"
        />
        <span>
          <span className="flex items-center gap-2 font-semibold text-white">
            <Target className="h-4 w-4 text-(--gym-accent)" aria-hidden />
            Show progress charts on my profile
          </span>
          <span className="mt-1.5 block text-sm text-(--gym-muted)">
            When enabled, your goal progress and trend graphs appear in the progress section below. Still respects your
            privacy settings.
          </span>
        </span>
      </label>

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>
        {pending ? "Saving goals…" : "Save my goals"}
      </Button>
    </form>
  );
};
