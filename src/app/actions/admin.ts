"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAdminAuditEvent } from "@/lib/audit";
import { resolveAuditActor } from "@/lib/audit/resolve-actor";
import { requireStaff } from "@/lib/rbac";
import { ADMIN_AUDIT_ACTIONS } from "@/types/database";
import { DEMO_GYM_ID, demoCompetitions, demoLifts, demoMachines } from "@/lib/demo-data";

const equipmentSchema = z.object({
  kind: z.enum(["machine", "lift"]),
  name: z.string().min(2),
  slug: z.string().min(2),
  category: z.string().min(1),
});

export const addEquipmentAction = async (formData: FormData): Promise<void> => {
  const ctx = await requireStaff();
  const parsed = equipmentSchema.safeParse({
    kind: formData.get("kind"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    category: formData.get("category"),
  });
  if (!parsed.success) return;

  const { kind, name, slug, category } = parsed.data;
  if (kind === "machine") {
    demoMachines.push({
      id: `machine-${slug}`,
      gym_id: DEMO_GYM_ID,
      name,
      slug,
      category,
      description: null,
      is_active: true,
    });
  } else {
    demoLifts.push({
      id: `lift-${slug}`,
      gym_id: DEMO_GYM_ID,
      name,
      slug,
      category,
      unit: "lbs",
      is_active: true,
    });
  }
  const actor = await resolveAuditActor(ctx);
  const gymId = ctx.gymId ?? DEMO_GYM_ID;
  await logAdminAuditEvent({
    gymId,
    actor,
    action: ADMIN_AUDIT_ACTIONS.EQUIPMENT_ADD,
    resourceType: kind === "machine" ? "machines" : "lifts",
    resourceId: slug,
    summary: `Added ${kind}: ${name}`,
    metadata: { category, slug },
  });
  revalidatePath("/admin/equipment");
  revalidatePath("/pr/submit");
};

const competitionSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(2),
  description: z.string().optional(),
  startsAt: z.string(),
  endsAt: z.string(),
  rulesSummary: z.string().optional(),
});

export const createCompetitionAction = async (formData: FormData): Promise<void> => {
  const ctx = await requireStaff();
  const parsed = competitionSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    rulesSummary: formData.get("rulesSummary"),
  });
  if (!parsed.success) return;

  const d = parsed.data;
  demoCompetitions.push({
    id: `comp-${Date.now()}`,
    gym_id: DEMO_GYM_ID,
    title: d.title,
    slug: d.slug,
    description: d.description ?? null,
    status: "draft",
    starts_at: new Date(d.startsAt).toISOString(),
    ends_at: new Date(d.endsAt).toISOString(),
    rules_summary: d.rulesSummary ?? null,
    scoring_method: "best_single",
  });
  const actor = await resolveAuditActor(ctx);
  const gymId = ctx.gymId ?? DEMO_GYM_ID;
  await logAdminAuditEvent({
    gymId,
    actor,
    action: ADMIN_AUDIT_ACTIONS.COMPETITION_CREATE,
    resourceType: "competitions",
    resourceId: d.slug,
    summary: `Created competition: ${d.title}`,
    metadata: { startsAt: d.startsAt, endsAt: d.endsAt },
  });
  revalidatePath("/admin/competitions");
  revalidatePath("/competitions");
};
