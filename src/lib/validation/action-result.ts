import type { AppErrorPayload } from "@/lib/errors/app-error";

export type SaveActionResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string>;
      error?: AppErrorPayload;
    };

export const isOperationalSaveFailure = (
  result: SaveActionResult,
): result is Extract<SaveActionResult, { ok: false }> & { error: AppErrorPayload } =>
  !result.ok && Boolean(result.error);

export const saveFailureToError = (result: Extract<SaveActionResult, { ok: false }>): AppErrorPayload =>
  result.error ?? {
    code: "GYM-CMS-002",
    message: result.message,
  };
