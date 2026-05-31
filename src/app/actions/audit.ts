"use server";

import { getGymConfig } from "@/config";
import {
  searchDemoAdminAuditEvents,
  searchDemoUserAuditEvents,
  type DemoAuditSearchFilters,
} from "@/lib/demo-audit-store";
import { hasSupabase } from "@/lib/env";
import { getGymIdBySlug } from "@/lib/profiles";
import { requireOwner } from "@/lib/rbac";
import { createClerkSupabaseClient } from "@/lib/supabase/clerk-server";
import type { AuditEventRow } from "@/types/database";

export type AuditLogCursor = { createdAt: string; id: string };

export type AuditLogSearchFilters = {
  query?: string;
  actorProfileId?: string;
  actionPrefix?: string;
  resourceType?: string;
  from?: string;
  to?: string;
  cursor?: AuditLogCursor;
  limit?: number;
};

export type AuditLogSearchResult = {
  rows: AuditEventRow[];
  nextCursor: AuditLogCursor | null;
  hasMore: boolean;
};

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

const normalizeFilters = (filters: AuditLogSearchFilters): DemoAuditSearchFilters => ({
  query: filters.query?.trim() || undefined,
  actorProfileId: filters.actorProfileId,
  actionPrefix: filters.actionPrefix,
  resourceType: filters.resourceType,
  from: filters.from,
  to: filters.to,
  cursor: filters.cursor,
  limit: Math.min(filters.limit ?? DEFAULT_LIMIT, MAX_LIMIT),
});

const applyKeysetFilter = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  cursor: AuditLogCursor,
) => query.or(`created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`);

const searchSupabaseAudit = async (
  table: "gym_user_audit_events" | "gym_admin_audit_events",
  gymId: string,
  filters: DemoAuditSearchFilters,
): Promise<AuditLogSearchResult> => {
  const limit = filters.limit ?? DEFAULT_LIMIT;
  const supabase = await createClerkSupabaseClient();

  let query = supabase
    .from(table)
    .select("*")
    .eq("gym_id", gymId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  if (filters.cursor) {
    query = applyKeysetFilter(query, filters.cursor);
  }
  if (filters.actorProfileId) {
    query = query.eq("actor_profile_id", filters.actorProfileId);
  }
  if (filters.actionPrefix) {
    query = query.like("action", `${filters.actionPrefix}%`);
  }
  if (filters.resourceType) {
    query = query.eq("resource_type", filters.resourceType);
  }
  if (filters.from) {
    query = query.gte("created_at", filters.from);
  }
  if (filters.to) {
    query = query.lte("created_at", filters.to);
  }
  if (filters.query) {
    const pattern = `%${filters.query.replace(/%/g, "\\%")}%`;
    query = query.or(`summary.ilike.${pattern},action.ilike.${pattern}`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as AuditEventRow[];
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const last = page[page.length - 1];

  return {
    rows: page,
    nextCursor: last ? { createdAt: last.created_at, id: last.id } : null,
    hasMore,
  };
};

const resolveGymId = async (authGymId: string | null): Promise<string> => {
  if (authGymId) return authGymId;
  const config = getGymConfig();
  const gymId = await getGymIdBySlug(config.slug);
  if (!gymId) throw new Error("Gym not found");
  return gymId;
};

export const searchUserAuditLogsAction = async (filters: AuditLogSearchFilters = {}): Promise<AuditLogSearchResult> => {
  const auth = await requireOwner();
  const gymId = await resolveGymId(auth.gymId);
  const normalized = normalizeFilters(filters);

  if (!hasSupabase) {
    return searchDemoUserAuditEvents(normalized);
  }

  return searchSupabaseAudit("gym_user_audit_events", gymId, normalized);
};

export const searchAdminAuditLogsAction = async (
  filters: AuditLogSearchFilters = {},
): Promise<AuditLogSearchResult> => {
  const auth = await requireOwner();
  const gymId = await resolveGymId(auth.gymId);
  const normalized = normalizeFilters(filters);

  if (!hasSupabase) {
    return searchDemoAdminAuditEvents(normalized);
  }

  return searchSupabaseAudit("gym_admin_audit_events", gymId, normalized);
};
