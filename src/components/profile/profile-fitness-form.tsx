"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { CheckCircle2, ChevronDown, CircleAlert, ClipboardList, MessageSquare, Share2, UserRound } from "lucide-react";
import { updateFitnessProfileAction, type ProfileFormState } from "@/app/actions/profile";
import { ProfileTip } from "@/components/profile/profile-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, formatHeight } from "@/lib/utils";
import { ERROR_CODES } from "@/lib/errors/codes";
import { isValidationFormMessage, useOperationalFormToast } from "@/hooks/use-operational-form-toast";
import {
  formatMeasurementDelta,
  MEASUREMENT_FIELD_MAP,
  MEASUREMENT_SECTIONS,
  type MeasurementFieldKey,
} from "@/lib/measurements";
import type { GenderDivision, Profile } from "@/types/database";

type ProfileFitnessFormProps = {
  profile: Profile;
};

const initialState: ProfileFormState = { ok: false, message: "" };

const genderOptions: { value: GenderDivision; label: string; hint: string }[] = [
  { value: "open", label: "Open", hint: "All divisions" },
  { value: "male", label: "Men's", hint: "Men's division" },
  { value: "female", label: "Women's", hint: "Women's division" },
  { value: "non_binary", label: "Non-binary", hint: "Non-binary division" },
];

const sectionIcons: Record<string, string> = {
  basics: "📏",
  torso: "🎯",
  arms: "💪",
  legs: "🦵",
};

const checkinSections = MEASUREMENT_SECTIONS.map((section) => ({
  ...section,
  fields: section.fields.filter((field) => field.key !== "height_in"),
})).filter((section) => section.fields.length > 0);

const unitSuffix: Record<string, string> = {
  lbs: "lbs",
  in: "in",
  pct: "%",
};

const getProfileFieldValue = (profile: Profile, key: MeasurementFieldKey) => {
  if (key === "weight_lbs") return profile.bodyweight_lbs;
  return profile[key];
};

type FitnessFormValues = {
  displayName: string;
  genderDivision: GenderDivision;
  bio: string;
  notes: string;
  shareToFeed: boolean;
  measurements: Record<string, string>;
};

const buildFormValues = (profile: Profile): FitnessFormValues => ({
  displayName: profile.display_name,
  genderDivision: profile.gender_division,
  bio: profile.bio ?? "",
  notes: "",
  shareToFeed: false,
  measurements: Object.fromEntries(
    MEASUREMENT_SECTIONS.flatMap((section) =>
      section.fields.map((field) => [field.formName, String(getProfileFieldValue(profile, field.key) ?? "")]),
    ),
  ),
});

export const ProfileFitnessForm = ({ profile }: ProfileFitnessFormProps) => {
  const [state, formAction, pending] = useActionState(updateFitnessProfileAction, initialState);

  useOperationalFormToast(state, {
    errorCode: ERROR_CODES.PROFILE_SAVE_FAILED,
    validationIncludes: "Please check",
  });

  const showInlineBanner = state.message && (state.ok || isValidationFormMessage(state.message));
  const [values, setValues] = useState(() => buildFormValues(profile));
  const [syncedProfileAt, setSyncedProfileAt] = useState(profile.updated_at);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basics: true,
    torso: false,
    arms: false,
    legs: false,
  });

  if (profile.updated_at !== syncedProfileAt) {
    setSyncedProfileAt(profile.updated_at);
    setValues(buildFormValues(profile));
  }

  const handleMeasurementChange = (formName: string, value: string) => {
    setValues((current) => ({
      ...current,
      measurements: { ...current.measurements, [formName]: value },
    }));
  };

  const handleToggleSection = (sectionId: string) => {
    setOpenSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  };

  return (
    <>
      <form action={formAction} className="space-y-6">
        <ProfileTip>
          <strong className="font-semibold text-white">Tip:</strong> You only need to fill in what changed today. Leave
          any field blank and we&apos;ll keep your last saved number.
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
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
            ) : (
              <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-(--gym-danger)" aria-hidden />
            )}
            <p className={cn("text-sm leading-relaxed sm:text-base", state.ok ? "text-emerald-100" : "text-red-100")}>
              {state.message}
            </p>
          </div>
        ) : null}

        {state.deltas && Object.keys(state.deltas).length > 0 && (
          <div className="rounded-xl border border-(--gym-border) bg-black/25 p-4 sm:p-5">
            <p className="flex items-center gap-2 font-semibold text-white">
              <ClipboardList className="h-4 w-4 text-(--gym-accent)" aria-hidden />
              What changed since your last check-in
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {Object.entries(state.deltas).map(([key, delta]) => (
                <li key={key} className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-2.5">
                  <span className="text-sm text-(--gym-muted)">
                    {MEASUREMENT_FIELD_MAP[key as MeasurementFieldKey]?.label ?? key.replace(/_/g, " ")}
                  </span>
                  <span className="text-sm font-bold text-white">
                    {formatMeasurementDelta(key as MeasurementFieldKey, delta)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* About you */}
        <div className="rounded-2xl border border-(--gym-border) bg-black/20 p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <UserRound className="h-5 w-5 text-(--gym-accent)" aria-hidden />
            <h3 className="font-semibold text-white">About you</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="displayName">Name shown at the gym</Label>
              <Input
                id="displayName"
                name="displayName"
                value={values.displayName}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    displayName: event.target.value,
                  }))
                }
                placeholder="How should we call you?"
                required
                autoComplete="nickname"
              />
            </div>

            <div>
              <Label htmlFor="genderDivision">Division for competitions</Label>
              <p className="mb-2 text-xs text-(--gym-muted)">Used for leaderboards and gym challenges only.</p>
              <select
                id="genderDivision"
                name="genderDivision"
                value={values.genderDivision}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    genderDivision: event.target.value as GenderDivision,
                  }))
                }
                className="min-h-12 w-full rounded-lg border border-(--gym-border) bg-black/40 px-4 text-base text-white focus:border-(--gym-primary) focus:ring-2 focus:ring-(--gym-primary)/30 focus:outline-none"
              >
                {genderOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} — {opt.hint}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="bio">Short bio (optional)</Label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={values.bio}
                onChange={(event) => setValues((current) => ({ ...current, bio: event.target.value }))}
                className="w-full rounded-lg border border-(--gym-border) bg-black/40 px-4 py-3 text-base text-white placeholder:text-neutral-500 focus:border-(--gym-primary) focus:ring-2 focus:ring-(--gym-primary)/30 focus:outline-none"
                placeholder="A sentence about your goals or training style…"
              />
            </div>
          </div>
        </div>

        {/* Measurements */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-neutral-300">Body measurements</p>
          {profile.height_in != null && (
            <div className="rounded-xl border border-(--gym-border)/80 bg-black/15 px-4 py-3">
              <p className="text-xs font-medium text-(--gym-muted)">Your height</p>
              <p className="mt-0.5 text-base font-semibold text-white">{formatHeight(profile.height_in)}</p>
              <p className="mt-1 text-xs text-(--gym-muted)">
                Height stays on your profile — update it by asking gym staff if needed.
              </p>
            </div>
          )}
          {checkinSections.map((section) => {
            const isOpen = openSections[section.id] ?? false;

            return (
              <div key={section.id} className="overflow-hidden rounded-2xl border border-(--gym-border) bg-black/20">
                <button
                  type="button"
                  onClick={() => handleToggleSection(section.id)}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left sm:px-5"
                  aria-expanded={isOpen}
                  aria-controls={`section-${section.id}`}
                >
                  <span className="text-xl" aria-hidden>
                    {sectionIcons[section.id] ?? "📋"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-white">{section.title}</span>
                    <span className="mt-0.5 block text-sm text-(--gym-muted)">{section.description}</span>
                  </span>
                  <ChevronDown
                    className={cn("h-5 w-5 shrink-0 text-(--gym-accent) transition-transform", isOpen && "rotate-180")}
                    aria-hidden
                  />
                </button>

                {isOpen && (
                  <div id={`section-${section.id}`} className="border-t border-(--gym-border) px-4 pt-4 pb-5 sm:px-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {section.fields.map((field) => (
                        <div key={field.key} className="min-w-0">
                          <Label htmlFor={field.formName}>{field.label}</Label>
                          <div className="relative">
                            <Input
                              id={field.formName}
                              name={field.formName}
                              type="number"
                              step={field.step}
                              min={field.min}
                              max={field.max}
                              value={values.measurements[field.formName] ?? ""}
                              onChange={(event) => handleMeasurementChange(field.formName, event.target.value)}
                              placeholder={field.placeholder ?? "—"}
                              inputMode="decimal"
                              className={cn(field.unit !== "pct" && "pr-12", field.unit === "pct" && "pr-8")}
                            />
                            <span
                              className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm font-medium text-(--gym-muted)"
                              aria-hidden
                            >
                              {unitSuffix[field.unit]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Note & share */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="notes" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-(--gym-muted)" aria-hidden />
              How are you feeling? (optional)
            </Label>
            <Input
              id="notes"
              name="notes"
              value={values.notes}
              onChange={(event) => setValues((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Great session, feeling strong…"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-(--gym-border) bg-black/20 p-4 transition has-checked:border-(--gym-primary)/50 has-checked:bg-(--gym-primary)/5">
            <input
              type="checkbox"
              name="shareToFeed"
              value="true"
              checked={values.shareToFeed}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  shareToFeed: event.target.checked,
                }))
              }
              className="mt-1 h-5 w-5 shrink-0 accent-(--gym-primary)"
            />
            <span>
              <span className="flex items-center gap-2 font-semibold text-white">
                <Share2 className="h-4 w-4 text-(--gym-accent)" aria-hidden />
                Share my progress on the gym feed
              </span>
              <span className="mt-1.5 block text-sm leading-relaxed text-(--gym-muted)">
                Only the numbers you changed today — never your full private profile.
              </span>
            </span>
          </label>
        </div>

        <div className="sticky bottom-0 -mx-4 border-t border-(--gym-border) bg-(--gym-bg)/95 px-4 py-4 backdrop-blur-md sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <Button
            type="submit"
            size="lg"
            className="w-full shadow-(--gym-primary)/20 shadow-lg sm:w-auto sm:min-w-50 sm:shadow-none"
            disabled={pending}
          >
            {pending ? "Saving your check-in…" : "Save check-in"}
          </Button>
          <p className="mt-4 hidden text-sm text-(--gym-muted) sm:block">
            Email and password are managed in{" "}
            <Link href="/user-profile" className="font-medium text-(--gym-accent) hover:underline">
              Account settings
            </Link>
            .
          </p>
        </div>
      </form>
    </>
  );
};
