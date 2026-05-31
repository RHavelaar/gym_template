import type { AuthContext } from "@/lib/rbac";
import { getProfileById } from "@/lib/profiles";
import { actorFromAuth, type AuditActor } from "@/lib/audit/types";

export const resolveAuditActor = async (auth: AuthContext): Promise<AuditActor> => {
  if (!auth.profileId) {
    return actorFromAuth({ profileId: null, role: auth.role, displayName: null });
  }
  const profile = await getProfileById(auth.profileId);
  return actorFromAuth({
    profileId: auth.profileId,
    role: auth.role,
    displayName: profile?.display_name ?? null,
  });
};
