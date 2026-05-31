import { z } from "zod";

export const CONTACT_TOPICS = ["membership", "training", "billing", "feedback", "other"] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export const contactInquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((value) => value || undefined),
  topic: z.enum(CONTACT_TOPICS),
  message: z.string().trim().min(10, "Tell us a bit more — at least 10 characters.").max(4000),
  /** Honeypot — must be empty */
  company: z
    .string()
    .optional()
    .transform((value) => value?.trim() ?? "")
    .refine((value) => value.length === 0, "Submission rejected."),
});

export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;
