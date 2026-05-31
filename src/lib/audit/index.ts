import { hasSupabase } from "@/lib/env";
import { appendDemoAdminAuditEvent, appendDemoUserAuditEvent } from "@/lib/demo-audit-store";
import { capAuditMetadata } from "@/lib/audit/metadata";
import type { LogAuditEventInput } from "@/lib/audit/types";
export { actorFromAuth, systemActor } from "@/lib/audit/types";
export type { AuditActor, LogAuditEventInput } from "@/lib/audit/types";
import { createServiceClient } from "@/lib/supabase/server";
import type { AuditEventRow, AuditMetadata } from "@/types/database";

const insertEvent = async (
  table: "gym_user_audit_events" | "gym_admin_audit_events",
  input: LogAuditEventInput,
): Promise<void> => {
  const metadata: AuditMetadata = capAuditMetadata(input.metadata ?? {});

  if (!hasSupabase) {
    const row = {
      actor_profile_id: input.actor.profileId,
      actor_role: input.actor.role,
      actor_display_name: input.actor.displayName,
      action: input.action,
      resource_type: input.resourceType,
      resource_id: input.resourceId ?? null,
      summary: input.summary,
      metadata,
      gym_id: input.gymId,
    };
    if (table === "gym_user_audit_events") {
      appendDemoUserAuditEvent(row);
    } else {
      appendDemoAdminAuditEvent(row);
    }
    return;
  }

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from(table).insert({
      gym_id: input.gymId,
      actor_profile_id: input.actor.profileId,
      actor_role: input.actor.role,
      actor_display_name: input.actor.displayName,
      action: input.action,
      resource_type: input.resourceType,
      resource_id: input.resourceId ?? null,
      summary: input.summary,
      metadata,
    });

    if (error) {
      console.error(`[audit] Failed to insert into ${table}:`, error.message);
    }
  } catch (err) {
    console.error(`[audit] Insert error for ${table}:`, err);
  }
};

export const logUserAuditEvent = async (input: LogAuditEventInput): Promise<void> => {
  await insertEvent("gym_user_audit_events", input);
};

export const logAdminAuditEvent = async (input: LogAuditEventInput): Promise<void> => {
  await insertEvent("gym_admin_audit_events", input);
};

export type { AuditEventRow };
export { buildChangeSet } from "@/lib/audit/build-change-set";
export { capAuditMetadata } from "@/lib/audit/metadata";
