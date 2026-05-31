import { ERROR_CODES, type ErrorCode } from "./codes";
import { DEFAULT_MESSAGES } from "./messages";

export type ErrorSource = "client" | "server_action" | "api" | "boundary";

export type AppErrorPayload = {
  code: ErrorCode | string;
  message: string;
  detail?: string;
  eventId?: string;
  helpMailto?: string;
  quip?: string;
  emoji?: string;
};

export class AppError extends Error {
  readonly code: ErrorCode | string;

  readonly detail?: string;

  constructor(code: ErrorCode | string, message: string, detail?: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.detail = detail;
  }

  toPayload(): AppErrorPayload {
    return {
      code: this.code,
      message: this.message,
      detail: this.detail,
    };
  }
}

export const isAppError = (value: unknown): value is AppError => value instanceof AppError;

export const toAppErrorPayload = (
  err: unknown,
  fallbackCode: ErrorCode = ERROR_CODES.SYS_UNEXPECTED,
): AppErrorPayload => {
  if (isAppError(err)) {
    return err.toPayload();
  }

  if (err instanceof Error) {
    const mapped = mapKnownErrorMessage(err.message);
    if (mapped) {
      return mapped;
    }
    return {
      code: fallbackCode,
      message: err.message || DEFAULT_MESSAGES[fallbackCode],
      detail: err.stack,
    };
  }

  return {
    code: fallbackCode,
    message: DEFAULT_MESSAGES[fallbackCode],
    detail: String(err),
  };
};

const mapKnownErrorMessage = (message: string): AppErrorPayload | null => {
  if (message === "Unauthorized") {
    return {
      code: ERROR_CODES.AUTH_UNAUTHORIZED,
      message: DEFAULT_MESSAGES[ERROR_CODES.AUTH_UNAUTHORIZED],
      detail: message,
    };
  }

  if (message.includes("Owner access") || message.includes("Staff access") || message.includes("Manager access")) {
    return {
      code: ERROR_CODES.AUTH_FORBIDDEN,
      message: DEFAULT_MESSAGES[ERROR_CODES.AUTH_FORBIDDEN],
      detail: message,
    };
  }

  if (message.startsWith("Invalid ")) {
    return {
      code: ERROR_CODES.VAL_INVALID_INPUT,
      message: message,
      detail: message,
    };
  }

  if (message === "Gym membership unavailable") {
    return {
      code: ERROR_CODES.AUTH_MEMBERSHIP,
      message: "Your gym membership is not set up yet. Contact staff for help.",
      detail: message,
    };
  }

  if (message.includes("Unsupported file type")) {
    return {
      code: ERROR_CODES.MEDIA_INVALID_TYPE,
      message: DEFAULT_MESSAGES[ERROR_CODES.MEDIA_INVALID_TYPE],
      detail: message,
    };
  }

  if (message.includes("too large") || message.includes("Too large")) {
    return {
      code: ERROR_CODES.MEDIA_TOO_LARGE,
      message: message,
      detail: message,
    };
  }

  return null;
};
