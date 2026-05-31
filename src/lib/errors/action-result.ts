import { ERROR_CODES, type ErrorCode } from "./codes";
import { AppError, type AppErrorPayload, toAppErrorPayload } from "./app-error";
import { DEFAULT_MESSAGES } from "./messages";
import { captureAppError, type CaptureErrorInput } from "./capture";

export type ActionResult<T = void> = { ok: true; data?: T } | { ok: false; error: AppErrorPayload };

export const actionOk = <T>(data?: T): ActionResult<T> => ({ ok: true, data });

export const actionFail = (code: ErrorCode, opts?: { message?: string; detail?: string }): ActionResult<never> => ({
  ok: false,
  error: {
    code,
    message: opts?.message ?? DEFAULT_MESSAGES[code],
    detail: opts?.detail,
  },
});

export const wrapAction = async <T>(
  fn: () => Promise<T>,
  opts: {
    fallbackCode?: ErrorCode;
    capture?: Omit<CaptureErrorInput, "error">;
  } = {},
): Promise<ActionResult<T>> => {
  const fallbackCode = opts.fallbackCode ?? ERROR_CODES.SYS_UNEXPECTED;

  try {
    const data = await fn();
    return actionOk(data);
  } catch (err) {
    const payload = toAppErrorPayload(err, fallbackCode);

    if (opts.capture) {
      const eventId = await captureAppError({
        ...opts.capture,
        error: payload,
      });
      if (eventId) {
        return { ok: false, error: { ...payload, eventId } };
      }
    }

    return { ok: false, error: payload };
  }
};

export const throwAppError = (code: ErrorCode, message?: string, detail?: string): never => {
  throw new AppError(code, message ?? DEFAULT_MESSAGES[code], detail);
};
