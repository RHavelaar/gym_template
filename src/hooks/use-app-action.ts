"use client";

import { useCallback, useState } from "react";
import type { ActionResult } from "@/lib/errors/action-result";
import type { AppErrorPayload } from "@/lib/errors/app-error";
import { useErrorToast } from "@/lib/errors/show-error-toast";

type RunActionOptions = {
  successMessage?: string;
  onSuccess?: () => void;
  onError?: (error: AppErrorPayload) => void;
};

export const useAppAction = () => {
  const { showError, showSuccess } = useErrorToast();
  const [pending, setPending] = useState(false);

  const runAction = useCallback(
    async <T>(
      action: () => Promise<ActionResult<T> | T | void>,
      options: RunActionOptions = {},
    ): Promise<ActionResult<T>> => {
      setPending(true);
      try {
        const result = await action();

        if (result && typeof result === "object" && "ok" in result) {
          const actionResult = result as ActionResult<T>;
          if (!actionResult.ok) {
            showError(actionResult.error);
            options.onError?.(actionResult.error);
            return actionResult;
          }

          if (options.successMessage) {
            showSuccess(options.successMessage);
          }
          options.onSuccess?.();
          return actionResult;
        }

        if (options.successMessage) {
          showSuccess(options.successMessage);
        }
        options.onSuccess?.();
        return { ok: true, data: result as T };
      } catch (err) {
        const payload: AppErrorPayload = {
          code: "GYM-SYS-001",
          message: err instanceof Error ? err.message : "Something went wrong.",
          detail: err instanceof Error ? err.stack : String(err),
        };
        showError(payload);
        options.onError?.(payload);
        return { ok: false, error: payload };
      } finally {
        setPending(false);
      }
    },
    [showError, showSuccess],
  );

  return { runAction, pending };
};
