"use server";

import { revalidatePath } from "next/cache";
import { buildChangeSet, logAdminAuditEvent } from "@/lib/audit";
import { resolveAuditActor } from "@/lib/audit/resolve-actor";
import { updateDemoContactPage, updateDemoPricingPage, updateDemoPricingPlans } from "@/lib/demo-content-store";
import { hasSupabase } from "@/lib/env";
import { ensureGymPage, resolveOwnerGymId } from "@/lib/pricing-pages";
import { mapPricingPlanToRow } from "@/lib/pricing-plans";
import { requireOwner } from "@/lib/rbac";
import { createServiceClient } from "@/lib/supabase/server";
import { ERROR_CODES } from "@/lib/errors/codes";
import { wrapAction, type ActionResult } from "@/lib/errors/action-result";
import type { SaveActionResult } from "@/lib/validation/action-result";
import { contactPageSettingsSchema, pricingPageSettingsSchema, pricingPlansSchema } from "@/lib/validation/content";
import type { ContactPageSettings, GymPricingPlan, PricingPageSettings } from "@/config/types";
import { ADMIN_AUDIT_ACTIONS } from "@/types/database";

const REVALIDATE_PATHS = [
  "/",
  "/contact",
  "/pricing",
  "/admin/settings",
  "/admin/settings/contact",
  "/admin/settings/pricing",
];

const revalidateMarketingPages = () => {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
};

const saveFail = (message: string): SaveActionResult => ({
  ok: false,
  message,
  error: { code: ERROR_CODES.CMS_SAVE_FAILED, message },
});

export const saveContactPageSettingsAction = async (input: unknown): Promise<SaveActionResult> => {
  const parsed = contactPageSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return saveFail(parsed.error.issues[0]?.message ?? "Invalid contact page settings.");
  }

  try {
    const auth = await requireOwner();
    const actor = await resolveAuditActor(auth);
    const { gymId, slug } = await resolveOwnerGymId();
    const data: ContactPageSettings = parsed.data;

    if (!hasSupabase) {
      updateDemoContactPage(data);
      revalidateMarketingPages();
      return { ok: true };
    }

    const pageId = await ensureGymPage(gymId, "contact", "Contact");
    const supabase = createServiceClient();
    const { error } = await supabase.from("gym_pages").update({ settings: data }).eq("id", pageId);

    if (error) return saveFail(error.message);

    await logAdminAuditEvent({
      gymId,
      actor,
      action: ADMIN_AUDIT_ACTIONS.CMS_CONTACT_PAGE_UPDATE,
      resourceType: "gym_pages",
      resourceId: pageId,
      summary: "Updated contact page copy and form settings",
      metadata: { slug },
    });

    revalidateMarketingPages();
    return { ok: true };
  } catch {
    return saveFail("Could not save contact page settings.");
  }
};

export const savePricingPageSettingsAction = async (input: unknown): Promise<SaveActionResult> => {
  const parsed = pricingPageSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return saveFail(parsed.error.issues[0]?.message ?? "Invalid pricing page settings.");
  }

  try {
    const auth = await requireOwner();
    const actor = await resolveAuditActor(auth);
    const { gymId, slug } = await resolveOwnerGymId();
    const data: PricingPageSettings = parsed.data;

    if (!hasSupabase) {
      updateDemoPricingPage(data);
      revalidateMarketingPages();
      return { ok: true };
    }

    const pageId = await ensureGymPage(gymId, "pricing", "Pricing");
    const supabase = createServiceClient();
    const { error } = await supabase.from("gym_pages").update({ settings: data }).eq("id", pageId);

    if (error) return saveFail(error.message);

    await logAdminAuditEvent({
      gymId,
      actor,
      action: ADMIN_AUDIT_ACTIONS.CMS_PRICING_PAGE_UPDATE,
      resourceType: "gym_pages",
      resourceId: pageId,
      summary: "Updated pricing page copy",
      metadata: { slug },
    });

    revalidateMarketingPages();
    return { ok: true };
  } catch {
    return saveFail("Could not save pricing page settings.");
  }
};

export const savePricingPlansAction = async (input: unknown): Promise<SaveActionResult> => {
  const parsed = pricingPlansSchema.safeParse(input);
  if (!parsed.success) {
    return saveFail(parsed.error.issues[0]?.message ?? "Invalid pricing plans.");
  }

  try {
    const auth = await requireOwner();
    const actor = await resolveAuditActor(auth);
    const { gymId } = await resolveOwnerGymId();
    const plans: GymPricingPlan[] = parsed.data;

    if (!hasSupabase) {
      updateDemoPricingPlans(plans);
      revalidateMarketingPages();
      return { ok: true };
    }

    await ensureGymPage(gymId, "pricing", "Pricing");
    const supabase = createServiceClient();

    const { data: existingRows } = await supabase.from("gym_pricing_plans").select("id").eq("gym_id", gymId);
    const existingIds = ((existingRows ?? []) as { id: string }[]).map((row) => row.id);
    const incomingIds = new Set(plans.map((plan) => plan.id));

    const toDelete = existingIds.filter((id) => !incomingIds.has(id));
    if (toDelete.length) {
      const { error: deleteError } = await supabase.from("gym_pricing_plans").delete().in("id", toDelete);
      if (deleteError) return saveFail(deleteError.message);
    }

    if (plans.length) {
      const rows = plans.map((plan) => ({
        ...mapPricingPlanToRow(gymId, plan),
        updated_at: new Date().toISOString(),
      }));
      const { error: upsertError } = await supabase.from("gym_pricing_plans").upsert(rows, { onConflict: "id" });
      if (upsertError) return saveFail(upsertError.message);
    }

    await logAdminAuditEvent({
      gymId,
      actor,
      action: ADMIN_AUDIT_ACTIONS.CMS_PRICING_PLANS_SAVE,
      resourceType: "gym_pricing_plans",
      summary: `Saved ${plans.length} pricing plan${plans.length === 1 ? "" : "s"}`,
      metadata: {
        changes: buildChangeSet({ count: existingIds.length }, { count: plans.length }, ["count"]),
      },
    });

    revalidateMarketingPages();
    return { ok: true };
  } catch {
    return saveFail("Could not save pricing plans.");
  }
};

export const archiveContactInquiryAction = async (inquiryId: string): Promise<ActionResult> =>
  wrapAction(async () => {
    const auth = await requireOwner();
    if (!auth.gymId) throw new Error("No gym access");

    if (!hasSupabase) {
      const { listContactInquiriesForGym } = await import("@/lib/contact-inquiries");
      const rows = await listContactInquiriesForGym(auth.gymId);
      const row = rows.find((item) => item.id === inquiryId);
      if (row) row.status = "archived";
      revalidatePath("/admin/inbox");
      return;
    }

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("contact_inquiries")
      .update({ status: "archived" })
      .eq("id", inquiryId)
      .eq("gym_id", auth.gymId);

    if (error) throw new Error(error.message);
    revalidatePath("/admin/inbox");
  });
