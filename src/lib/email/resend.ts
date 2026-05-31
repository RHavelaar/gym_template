import { Resend } from "resend";
import { env } from "@/lib/env";
import type { ContactTopic } from "@/lib/validation/contact";

export type ContactEmailPayload = {
  gymName: string;
  to: string;
  replyTo: string;
  name: string;
  senderEmail: string;
  phone?: string;
  topic: ContactTopic;
  message: string;
  inquiryId: string;
};

const TOPIC_LABELS: Record<ContactTopic, string> = {
  membership: "Membership",
  training: "Training & coaching",
  billing: "Billing",
  feedback: "Feedback",
  other: "General question",
};

export const hasResend = Boolean(env.RESEND_API_KEY);

const getFromAddress = (gymName: string) => {
  const configured = env.RESEND_FROM_EMAIL?.trim();
  if (configured) return configured;
  return `${gymName} <onboarding@resend.dev>`;
};

export const sendContactInquiryEmail = async (
  payload: ContactEmailPayload,
): Promise<{ ok: true } | { ok: false; error: string; skipped?: boolean }> => {
  if (!hasResend) {
    return { ok: false, error: "Email provider not configured", skipped: true };
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const topicLabel = TOPIC_LABELS[payload.topic];
  const subject = `[${payload.gymName}] New contact: ${topicLabel}`;

  const textLines = [
    `New message from your website contact form`,
    ``,
    `From: ${payload.name} <${payload.senderEmail}>`,
    payload.phone ? `Phone: ${payload.phone}` : null,
    `Topic: ${topicLabel}`,
    `Reference: ${payload.inquiryId}`,
    ``,
    payload.message,
    ``,
    `Reply directly to this person at ${payload.senderEmail}.`,
  ].filter((line): line is string => line !== null);

  const { error } = await resend.emails.send({
    from: getFromAddress(payload.gymName),
    to: [payload.to],
    replyTo: payload.replyTo,
    subject,
    text: textLines.join("\n"),
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
};
