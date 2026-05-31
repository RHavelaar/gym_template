import { getGymConfig } from "@/config";
import { hasSupabase } from "@/lib/env";
import { getGymIdBySlug } from "@/lib/profiles";
import { getAuthContext } from "@/lib/rbac";
import { createClerkSupabaseClient } from "@/lib/supabase/clerk-server";
import type { AppErrorPayload, ErrorSource } from "./app-error";

export type CaptureErrorInput = {
  error: AppErrorPayload;
  source: ErrorSource;
  route?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
};

export type CapturedErrorEvent = {
  id: string;
  gym_id: string;
  profile_id: string | null;
  error_code: string;
  message: string;
  detail: string | null;
  source: ErrorSource;
  route: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

const logStructured = (payload: Record<string, unknown>) => {
  console.error(JSON.stringify({ level: "error", ...payload }));
};

export const captureAppError = async (input: CaptureErrorInput): Promise<string | null> => {
  const { error, source, route, userAgent, metadata = {} } = input;

  const config = getGymConfig();
  let gymId: string | null = null;
  let profileId: string | null = null;

  try {
    const auth = await getAuthContext();
    profileId = auth.profileId;
    gymId = auth.gymId ?? (await getGymIdBySlug(config.slug));
  } catch {
    gymId = await getGymIdBySlug(config.slug);
  }

  if (!gymId) {
    logStructured({
      code: error.code,
      message: error.message,
      detail: error.detail,
      source,
      route,
      note: "skipped_db_no_gym_id",
    });
    return null;
  }

  if (!hasSupabase) {
    logStructured({
      code: error.code,
      message: error.message,
      detail: error.detail,
      gymId,
      profileId,
      source,
      route,
      metadata,
      note: "demo_mode_no_db",
    });
    return null;
  }

  try {
    const supabase = await createClerkSupabaseClient();
    const { data, error: insertError } = await supabase
      .from("app_error_events")
      .insert({
        gym_id: gymId,
        profile_id: profileId,
        error_code: error.code,
        message: error.message,
        detail: error.detail ?? null,
        source,
        route: route ?? null,
        user_agent: userAgent ?? null,
        metadata,
      })
      .select("id")
      .single();

    if (insertError) {
      logStructured({
        code: error.code,
        message: error.message,
        insertError: insertError.message,
        source,
      });
      return null;
    }

    const eventId = data?.id ?? null;
    logStructured({
      code: error.code,
      eventId,
      gymId,
      profileId,
      route,
      source,
      detail: error.detail,
    });

    return eventId;
  } catch (err) {
    logStructured({
      code: error.code,
      message: error.message,
      captureFailed: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
};
