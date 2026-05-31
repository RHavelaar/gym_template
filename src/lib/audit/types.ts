import type { AuditMetadata, MembershipRole } from "@/types/database";

export type AuditActor = {
  profileId: string | null;
  role: MembershipRole | null;
  displayName: string | null;
};

export type LogAuditEventInput = {
  gymId: string;
  actor: AuditActor;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  summary: string;
  metadata?: AuditMetadata;
};

export const actorFromAuth = (auth: {
  profileId: string | null;
  role: MembershipRole | null;
  displayName?: string | null;
}): AuditActor => ({
  profileId: auth.profileId,
  role: auth.role,
  displayName: auth.displayName ?? null,
});

export const systemActor = (): AuditActor => ({
  profileId: null,
  role: null,
  displayName: "System",
});
