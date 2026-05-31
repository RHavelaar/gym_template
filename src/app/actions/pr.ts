"use server";

import { revalidatePath } from "next/cache";
import { logAdminAuditEvent, logUserAuditEvent } from "@/lib/audit";
import { resolveAuditActor } from "@/lib/audit/resolve-actor";
import { requireMember } from "@/lib/rbac";
import { prSubmitSchema } from "@/lib/validation/pr";
import { ADMIN_AUDIT_ACTIONS, USER_AUDIT_ACTIONS } from "@/types/database";
import { DEMO_GYM_ID, demoPrSubmissions, demoProfiles } from "@/lib/demo-data";

export type PrFormState = { ok: boolean; message: string };

export const submitPrAction = async (_prev: PrFormState, formData: FormData): Promise<PrFormState> => {
  try {
    const ctx = await requireMember();
    const parsed = prSubmitSchema.safeParse({
      targetType: formData.get("targetType"),
      machineId: formData.get("machineId") || undefined,
      liftId: formData.get("liftId") || undefined,
      value: formData.get("value"),
      bodyweight: formData.get("bodyweight") || undefined,
      genderDivision: formData.get("genderDivision"),
      notes: formData.get("notes") || undefined,
    });

    if (!parsed.success) {
      return { ok: false, message: "Please check your entries and try again." };
    }

    const { targetType, machineId, liftId, value, bodyweight, genderDivision, notes } = parsed.data;

    if (targetType === "machine" && !machineId) {
      return { ok: false, message: "Select a machine for this PR." };
    }
    if (targetType === "lift" && !liftId) {
      return { ok: false, message: "Select a lift for this PR." };
    }

    const submissionId = `pr-${Date.now()}`;
    const gymId = ctx.gymId ?? DEMO_GYM_ID;
    demoPrSubmissions.push({
      id: submissionId,
      gym_id: gymId,
      profile_id: ctx.profileId ?? demoProfiles[1].id,
      machine_id: targetType === "machine" ? machineId! : null,
      lift_id: targetType === "lift" ? liftId! : null,
      value,
      unit: "lbs",
      bodyweight_lbs: bodyweight ?? null,
      gender_division: genderDivision,
      notes: notes ?? null,
      status: "pending",
      submitted_at: new Date().toISOString(),
    });

    const actor = await resolveAuditActor(ctx);
    await logUserAuditEvent({
      gymId,
      actor,
      action: USER_AUDIT_ACTIONS.PR_SUBMIT,
      resourceType: "pr_submissions",
      resourceId: submissionId,
      summary: `Submitted PR: ${value} lbs (${targetType})`,
      metadata: {
        targetType,
        machineId: machineId ?? null,
        liftId: liftId ?? null,
        genderDivision,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/leaderboards");
    revalidatePath("/admin/pr-queue");

    return {
      ok: true,
      message: "PR submitted! Staff will review it shortly.",
    };
  } catch {
    return { ok: false, message: "You must be signed in to submit a PR." };
  }
};

export const moderatePrAction = async (submissionId: string, status: "approved" | "rejected" | "flagged") => {
  const { requireStaff } = await import("@/lib/rbac");
  const ctx = await requireStaff();
  const submission = demoPrSubmissions.find((p) => p.id === submissionId);
  if (!submission) return;
  submission.status = status;
  const actor = await resolveAuditActor(ctx);
  const gymId = ctx.gymId ?? DEMO_GYM_ID;
  await logAdminAuditEvent({
    gymId,
    actor,
    action: ADMIN_AUDIT_ACTIONS.PR_MODERATE,
    resourceType: "pr_submissions",
    resourceId: submissionId,
    summary: `PR ${status}: ${submission.value} lbs`,
    metadata: { status, profileId: submission.profile_id },
  });
  revalidatePath("/admin/pr-queue");
  revalidatePath("/leaderboards");
};
