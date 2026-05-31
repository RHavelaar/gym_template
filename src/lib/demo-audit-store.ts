import type { AuditEventRow } from "@/types/database";
import { DEMO_GYM_ID } from "@/lib/demo-data";

const MAX_EVENTS = 500;

const userEvents: AuditEventRow[] = [];
const adminEvents: AuditEventRow[] = [];

const pushEvent = (stream: AuditEventRow[], event: AuditEventRow) => {
  stream.unshift(event);
  if (stream.length > MAX_EVENTS) {
    stream.length = MAX_EVENTS;
  }
};

export const appendDemoUserAuditEvent = (
  event: Omit<AuditEventRow, "id" | "gym_id" | "created_at"> & {
    gym_id?: string;
    created_at?: string;
  },
): AuditEventRow => {
  const row: AuditEventRow = {
    id: `audit-user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    gym_id: event.gym_id ?? DEMO_GYM_ID,
    created_at: event.created_at ?? new Date().toISOString(),
    ...event,
  };
  pushEvent(userEvents, row);
  return row;
};

export const appendDemoAdminAuditEvent = (
  event: Omit<AuditEventRow, "id" | "gym_id" | "created_at"> & {
    gym_id?: string;
    created_at?: string;
  },
): AuditEventRow => {
  const row: AuditEventRow = {
    id: `audit-admin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    gym_id: event.gym_id ?? DEMO_GYM_ID,
    created_at: event.created_at ?? new Date().toISOString(),
    ...event,
  };
  pushEvent(adminEvents, row);
  return row;
};

export type DemoAuditSearchFilters = {
  query?: string;
  actorProfileId?: string;
  actionPrefix?: string;
  resourceType?: string;
  from?: string;
  to?: string;
  cursor?: { createdAt: string; id: string };
  limit?: number;
};

const matchesFilters = (row: AuditEventRow, filters: DemoAuditSearchFilters): boolean => {
  if (filters.actorProfileId && row.actor_profile_id !== filters.actorProfileId) {
    return false;
  }
  if (filters.actionPrefix && !row.action.startsWith(filters.actionPrefix)) {
    return false;
  }
  if (filters.resourceType && row.resource_type !== filters.resourceType) {
    return false;
  }
  if (filters.from && row.created_at < filters.from) return false;
  if (filters.to && row.created_at > filters.to) return false;
  if (filters.query) {
    const q = filters.query.toLowerCase();
    const haystack = `${row.summary} ${row.action} ${row.actor_display_name ?? ""}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
};

const searchStream = (stream: AuditEventRow[], filters: DemoAuditSearchFilters) => {
  const limit = Math.min(filters.limit ?? 50, 100);
  const filtered = stream.filter((row) => matchesFilters(row, filters));

  let startIdx = 0;
  if (filters.cursor) {
    const cursorIdx = filtered.findIndex(
      (row) => row.created_at === filters.cursor!.createdAt && row.id === filters.cursor!.id,
    );
    if (cursorIdx >= 0) startIdx = cursorIdx + 1;
  }

  const page = filtered.slice(startIdx, startIdx + limit);
  const last = page[page.length - 1];
  const hasMore = startIdx + limit < filtered.length;

  return {
    rows: page,
    nextCursor: last ? { createdAt: last.created_at, id: last.id } : null,
    hasMore,
  };
};

export const searchDemoUserAuditEvents = (filters: DemoAuditSearchFilters) => searchStream(userEvents, filters);

export const searchDemoAdminAuditEvents = (filters: DemoAuditSearchFilters) => searchStream(adminEvents, filters);
