import { requireOwner } from "@/lib/rbac";
import { createClerkSupabaseClient } from "@/lib/supabase/clerk-server";
import { hasSupabase } from "@/lib/env";
import type { CapturedErrorEvent } from "@/lib/errors/capture";

export type ErrorLogFilters = {
  code?: string;
  source?: string;
  limit?: number;
  offset?: number;
};

export type ErrorLogPage = {
  events: ErrorLogRow[];
  total: number;
};

export type ErrorLogRow = CapturedErrorEvent & {
  profile_display_name: string | null;
};

export const fetchErrorEvents = async (filters: ErrorLogFilters = {}): Promise<ErrorLogPage> => {
  await requireOwner();

  if (!hasSupabase) {
    return { events: [], total: 0 };
  }

  const limit = Math.min(filters.limit ?? 50, 100);
  const offset = filters.offset ?? 0;

  const supabase = await createClerkSupabaseClient();

  let query = supabase
    .from("app_error_events")
    .select(
      "id, gym_id, profile_id, error_code, message, detail, source, route, user_agent, metadata, created_at, profiles(display_name)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.code?.trim()) {
    query = query.eq("error_code", filters.code.trim());
  }

  if (filters.source?.trim()) {
    query = query.eq("source", filters.source.trim());
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const events: ErrorLogRow[] = (data ?? []).map((row) => {
    const profileRaw = row.profiles as { display_name: string } | { display_name: string }[] | null;
    const profile = Array.isArray(profileRaw) ? profileRaw[0] : profileRaw;
    return {
      id: row.id,
      gym_id: row.gym_id,
      profile_id: row.profile_id,
      error_code: row.error_code,
      message: row.message,
      detail: row.detail,
      source: row.source as ErrorLogRow["source"],
      route: row.route,
      user_agent: row.user_agent,
      metadata: (row.metadata as Record<string, unknown>) ?? {},
      created_at: row.created_at,
      profile_display_name: profile?.display_name ?? null,
    };
  });

  return { events, total: count ?? events.length };
};

export const fetchErrorCodes = async (): Promise<string[]> => {
  await requireOwner();

  if (!hasSupabase) {
    return [];
  }

  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase.from("app_error_events").select("error_code").order("error_code");

  if (error) {
    return [];
  }

  const codes = new Set((data ?? []).map((row) => row.error_code));
  return [...codes].sort();
};
