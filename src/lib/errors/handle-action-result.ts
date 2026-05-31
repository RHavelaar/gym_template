"use client";

import type { ActionResult } from "@/lib/errors/action-result";
import type { AppErrorPayload } from "@/lib/errors/app-error";
import { isOperationalSaveFailure, saveFailureToError, type SaveActionResult } from "@/lib/validation/action-result";

type ToastHandlers = {
  showError: (error: AppErrorPayload) => void;
  showSuccess: (message: string) => void;
};

export const handleActionResult = (result: ActionResult, handlers: ToastHandlers, successMessage?: string): boolean => {
  if (result.ok) {
    if (successMessage) {
      handlers.showSuccess(successMessage);
    }
    return true;
  }

  handlers.showError(result.error);
  return false;
};

export const handleSaveActionResult = (
  result: SaveActionResult,
  handlers: ToastHandlers,
  options?: {
    successMessage?: string;
    onFieldErrors?: (fieldErrors: Record<string, string>) => void;
  },
): boolean => {
  if (result.ok) {
    if (options?.successMessage) {
      handlers.showSuccess(options.successMessage);
    }
    return true;
  }

  if (result.fieldErrors && options?.onFieldErrors) {
    options.onFieldErrors(result.fieldErrors);
    return false;
  }

  if (isOperationalSaveFailure(result)) {
    handlers.showError(result.error);
    return false;
  }

  handlers.showError(saveFailureToError(result));
  return false;
};
