"use client";

import { useActionState } from "react";
import { CheckCircle2, CircleAlert, Globe, Lock, Users } from "lucide-react";
import { updateProfilePrivacyAction, type ProfileFormState } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ERROR_CODES } from "@/lib/errors/codes";
import { isValidationFormMessage, useOperationalFormToast } from "@/hooks/use-operational-form-toast";
import type { ProfileVisibility } from "@/types/database";

type ProfilePrivacyFormProps = {
  visibility: ProfileVisibility;
};

const initialState: ProfileFormState = { ok: false, message: "" };

const visibilityOptions: {
  value: ProfileVisibility;
  label: string;
  description: string;
  icon: typeof Lock;
}[] = [
  {
    value: "private",
    label: "Just me",
    description: "Only you can see your stats and history. Recommended for most members.",
    icon: Lock,
  },
  {
    value: "trainer",
    label: "Me and my trainer",
    description: "Your assigned personal trainer can view your progress to help with programming.",
    icon: Users,
  },
  {
    value: "public",
    label: "Everyone at the gym",
    description: "Other signed-in members can see your snapshot on leaderboards and the feed.",
    icon: Globe,
  },
];

export const ProfilePrivacyForm = ({ visibility }: ProfilePrivacyFormProps) => {
  const [state, formAction, pending] = useActionState(updateProfilePrivacyAction, initialState);

  useOperationalFormToast(state, {
    errorCode: ERROR_CODES.PROFILE_SAVE_FAILED,
    validationIncludes: "Please check",
  });

  const showInlineBanner = state.message && (state.ok || isValidationFormMessage(state.message));

  return (
    <form action={formAction} className="space-y-5">
      <fieldset className="space-y-3">
        <legend className="sr-only">Who can see your profile</legend>
        {visibilityOptions.map((opt) => {
          const Icon = opt.icon;

          return (
            <label
              key={opt.value}
              className={cn(
                "flex cursor-pointer gap-3 rounded-xl border border-(--gym-border) bg-black/20 p-4 transition",
                "has-checked:border-(--gym-primary) has-checked:bg-(--gym-primary)/8",
              )}
            >
              <input
                type="radio"
                name="visibility"
                value={opt.value}
                defaultChecked={visibility === opt.value}
                className="peer sr-only"
              />
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/30 text-(--gym-muted) peer-checked:text-(--gym-primary)"
                aria-hidden
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-semibold text-white">{opt.label}</span>
                <span className="mt-1 block text-sm leading-relaxed text-(--gym-muted)">{opt.description}</span>
              </span>
              <span
                className="mt-2.5 h-5 w-5 shrink-0 rounded-full border-2 border-(--gym-border) peer-checked:border-(--gym-primary) peer-checked:bg-(--gym-primary)"
                aria-hidden
              />
            </label>
          );
        })}
      </fieldset>

      {showInlineBanner ? (
        <div
          className={cn(
            "flex gap-3 rounded-xl border px-4 py-3",
            state.ok ? "border-emerald-500/40 bg-emerald-500/10" : "border-(--gym-danger)/40 bg-(--gym-danger)/10",
          )}
          role="status"
        >
          {state.ok ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
          ) : (
            <CircleAlert className="h-5 w-5 shrink-0 text-(--gym-danger)" aria-hidden />
          )}
          <p className={cn("text-sm", state.ok ? "text-emerald-100" : "text-red-100")}>{state.message}</p>
        </div>
      ) : null}

      <Button type="submit" variant="secondary" size="lg" className="w-full sm:w-auto" disabled={pending}>
        {pending ? "Saving…" : "Save privacy choice"}
      </Button>
    </form>
  );
};
