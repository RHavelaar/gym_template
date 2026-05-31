"use client";

import { useEffect, useRef } from "react";
import { useErrorToast } from "@/lib/errors/show-error-toast";

type FormToastState = {
  ok: boolean;
  message: string;
};

type UseOperationalFormToastOptions = {
  errorCode: string;
  /** Skip toast when message includes this (inline validation). */
  validationIncludes?: string;
  /** Show success toast in addition to any inline feedback. */
  toastSuccess?: boolean;
};

export const useOperationalFormToast = (
  state: FormToastState,
  { errorCode, validationIncludes, toastSuccess = false }: UseOperationalFormToastOptions,
) => {
  const { showError, showSuccess } = useErrorToast();
  const seenRef = useRef("");

  useEffect(() => {
    if (!state.message) return;

    const key = `${state.ok}:${state.message}`;
    if (seenRef.current === key) return;
    seenRef.current = key;

    if (validationIncludes && state.message.includes(validationIncludes)) {
      return;
    }

    if (state.ok) {
      if (toastSuccess) {
        showSuccess(state.message);
      }
      return;
    }

    showError({
      code: errorCode,
      message: state.message,
    });
  }, [state.message, state.ok, errorCode, validationIncludes, toastSuccess, showError, showSuccess]);
};

export const isValidationFormMessage = (message: string) => message.includes("Please check");
