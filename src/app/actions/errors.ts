"use server";

import { z } from "zod";
import { ERROR_CODES } from "@/lib/errors/codes";
import type { AppErrorPayload } from "@/lib/errors/app-error";
import { captureAppError } from "@/lib/errors/capture";

const reportSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  detail: z.string().optional(),
  route: z.string().optional(),
  userAgent: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const reportClientErrorAction = async (
  input: z.infer<typeof reportSchema>,
): Promise<{ eventId: string | null }> => {
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) {
    return { eventId: null };
  }

  const payload: AppErrorPayload = {
    code: parsed.data.code,
    message: parsed.data.message,
    detail: parsed.data.detail,
  };

  const eventId = await captureAppError({
    error: payload,
    source: "client",
    route: parsed.data.route,
    userAgent: parsed.data.userAgent,
    metadata: parsed.data.metadata,
  });

  return { eventId };
};

export const reportBoundaryErrorAction = async (input: {
  message: string;
  route?: string;
  digest?: string;
}): Promise<{ eventId: string | null }> => {
  const eventId = await captureAppError({
    error: {
      code: ERROR_CODES.SYS_BOUNDARY,
      message: input.message,
      detail: input.digest,
    },
    source: "boundary",
    route: input.route,
    metadata: input.digest ? { digest: input.digest } : undefined,
  });

  return { eventId };
};
