"use client";

import { toast } from "sonner";
import { reportClientErrorAction } from "@/app/actions/errors";
import { GymErrorToast } from "@/components/errors/gym-error-toast";
import { useAppToastContext } from "@/components/providers/app-toast-context";
import type { AppErrorPayload } from "@/lib/errors/app-error";
import { buildErrorHelpMailto } from "@/lib/errors/mailto";
import { getErrorPersonality } from "@/lib/errors/personality";

const enrichErrorPayload = (
  error: AppErrorPayload,
  ctx: { gymName: string; helpEmail: string; route?: string },
): AppErrorPayload => {
  const personality = getErrorPersonality(error.code);
  const helpMailto =
    error.helpMailto ??
    buildErrorHelpMailto({
      helpEmail: ctx.helpEmail,
      gymName: ctx.gymName,
      code: error.code,
      message: error.message,
      route: ctx.route,
      eventId: error.eventId,
    }) ??
    undefined;

  return {
    ...error,
    quip: error.quip ?? personality.quip,
    emoji: error.emoji ?? personality.emoji,
    helpMailto: helpMailto ?? undefined,
  };
};

export const showErrorToast = (
  error: AppErrorPayload,
  ctx: {
    gymName: string;
    helpEmail: string;
    logoUrl?: string;
    route?: string;
  },
) => {
  const route = ctx.route ?? (typeof window !== "undefined" ? window.location.pathname : undefined);

  const enriched = enrichErrorPayload(error, {
    gymName: ctx.gymName,
    helpEmail: ctx.helpEmail,
    route,
  });

  toast.custom(
    () => (
      <GymErrorToast
        error={enriched}
        gymName={ctx.gymName}
        helpEmail={ctx.helpEmail}
        logoUrl={ctx.logoUrl}
        route={route}
      />
    ),
    {
      duration: 8000,
      className: "gym-toast-error",
    },
  );

  if (!error.eventId) {
    void reportClientErrorAction({
      code: enriched.code,
      message: enriched.message,
      detail: enriched.detail,
      route,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    });
  }
};

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    className: "gym-toast-success-inner",
    duration: 4000,
  });
};

export const useErrorToast = () => {
  const ctx = useAppToastContext();

  return {
    showError: (error: AppErrorPayload) =>
      showErrorToast(error, {
        gymName: ctx.gymName,
        helpEmail: ctx.helpEmail,
        logoUrl: ctx.logoUrl,
      }),
    showSuccess: showSuccessToast,
  };
};
