"use server";

import { revalidatePath } from "next/cache";
import { getResolvedGymConfig } from "@/lib/gym-config-resolver";
import { logAdminAuditEvent, systemActor } from "@/lib/audit";
import { resolveAuditActor } from "@/lib/audit/resolve-actor";
import {
  createContactInquiry,
  markContactInquiryEmailResult,
  markContactInquiryRead,
  resolveCurrentGymId,
} from "@/lib/contact-inquiries";
import { sendContactInquiryEmail } from "@/lib/email/resend";
import { resolveHelpEmail } from "@/lib/business-info";
import { getAuthContext, requireManager } from "@/lib/rbac";
import { contactInquirySchema } from "@/lib/validation/contact";
import { ADMIN_AUDIT_ACTIONS } from "@/types/database";

export type ContactFormState = { ok: boolean; message: string };

const successMessage = "Thanks — we got your message. Someone from the gym will follow up soon.";

export const submitContactInquiryAction = async (
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> => {
  try {
    const parsed = contactInquirySchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      topic: formData.get("topic"),
      message: formData.get("message"),
      company: formData.get("company"),
    });

    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Please check your entries and try again.";
      return { ok: false, message: first };
    }

    const config = await getResolvedGymConfig();
    const gymId = await resolveCurrentGymId();
    const auth = await getAuthContext();

    const inquiry = await createContactInquiry({
      gymId,
      profileId: auth.profileId,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      topic: parsed.data.topic,
      message: parsed.data.message,
    });

    const notifyEmail = config.business.generalEmail.trim() || resolveHelpEmail(config.business);

    if (notifyEmail) {
      const emailResult = await sendContactInquiryEmail({
        gymName: config.name,
        to: notifyEmail,
        replyTo: parsed.data.email,
        name: parsed.data.name,
        senderEmail: parsed.data.email,
        phone: parsed.data.phone,
        topic: parsed.data.topic,
        message: parsed.data.message,
        inquiryId: inquiry.id,
      });

      await markContactInquiryEmailResult(inquiry.id, {
        sent: emailResult.ok,
        error: emailResult.ok ? undefined : emailResult.error,
      });
    }

    await logAdminAuditEvent({
      gymId,
      actor: systemActor(),
      action: ADMIN_AUDIT_ACTIONS.CONTACT_INQUIRY_RECEIVED,
      resourceType: "contact_inquiries",
      resourceId: inquiry.id,
      summary: `Contact form: ${parsed.data.topic} from ${parsed.data.name}`,
      metadata: { topic: parsed.data.topic, email: parsed.data.email },
    });

    revalidatePath("/admin/inbox");
    return { ok: true, message: successMessage };
  } catch {
    return {
      ok: false,
      message: "We could not send your message right now. Please try again or call the gym.",
    };
  }
};

export const markContactInquiryReadAction = async (inquiryId: string): Promise<ContactFormState> => {
  try {
    const ctx = await requireManager();
    if (!ctx.gymId) {
      return { ok: false, message: "You do not have access to this inbox." };
    }

    await markContactInquiryRead(inquiryId, ctx.gymId);

    const actor = await resolveAuditActor(ctx);
    await logAdminAuditEvent({
      gymId: ctx.gymId,
      actor,
      action: ADMIN_AUDIT_ACTIONS.CONTACT_INQUIRY_READ,
      resourceType: "contact_inquiries",
      resourceId: inquiryId,
      summary: "Marked contact message as read",
    });

    revalidatePath("/admin/inbox");
    return { ok: true, message: "Marked as read." };
  } catch {
    return { ok: false, message: "Could not update this message." };
  }
};
