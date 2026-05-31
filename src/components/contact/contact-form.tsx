"use client";

import { useActionState } from "react";
import { submitContactInquiryAction, type ContactFormState } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { FieldLabelWithHint } from "@/components/ui/info-hint";
import { Input } from "@/components/ui/input";
import { CONTACT_TOPICS } from "@/lib/validation/contact";
import { ERROR_CODES } from "@/lib/errors/codes";
import { useOperationalFormToast } from "@/hooks/use-operational-form-toast";
import { cn } from "@/lib/utils";

const TOPIC_OPTIONS: { value: (typeof CONTACT_TOPICS)[number]; label: string }[] = [
  { value: "membership", label: "Membership & pricing" },
  { value: "training", label: "Training & coaching" },
  { value: "billing", label: "Billing & account" },
  { value: "feedback", label: "Feedback" },
  { value: "other", label: "Something else" },
];

const initialState: ContactFormState = { ok: false, message: "" };

type ContactFormProps = {
  className?: string;
};

export const ContactForm = ({ className }: ContactFormProps) => {
  const [state, formAction, pending] = useActionState(submitContactInquiryAction, initialState);

  useOperationalFormToast(state, {
    errorCode: ERROR_CODES.CONTACT_SUBMIT_FAILED,
    validationIncludes: "Please",
    toastSuccess: true,
  });

  return (
    <form action={formAction} className={cn("space-y-5", className)}>
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <FieldLabelWithHint htmlFor="contact-name" hint="Who should we reply to?">
            Your name
          </FieldLabelWithHint>
          <Input id="contact-name" name="name" required autoComplete="name" className="mt-1" />
        </div>
        <div>
          <FieldLabelWithHint htmlFor="contact-email" hint="We only use this to respond to you.">
            Email
          </FieldLabelWithHint>
          <Input id="contact-email" name="email" type="email" required autoComplete="email" className="mt-1" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <FieldLabelWithHint htmlFor="contact-phone" hint="Optional — helpful for quick callbacks.">
            Phone
          </FieldLabelWithHint>
          <Input id="contact-phone" name="phone" type="tel" autoComplete="tel" className="mt-1" />
        </div>
        <div>
          <FieldLabelWithHint htmlFor="contact-topic" hint="Helps us route your message to the right person.">
            Topic
          </FieldLabelWithHint>
          <select
            id="contact-topic"
            name="topic"
            required
            defaultValue="membership"
            className="mt-1 min-h-12 w-full rounded-lg border border-(--gym-border) bg-black/40 px-4 text-white"
          >
            {TOPIC_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <FieldLabelWithHint
          htmlFor="contact-message"
          hint="Include goals, schedule, or questions — the more detail the better."
        >
          Message
        </FieldLabelWithHint>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          className="mt-1 w-full rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3 py-2 text-white"
          placeholder="Tell us how we can help…"
        />
      </div>

      {state.message && !state.ok ? (
        <p className="text-sm text-(--gym-danger)" role="alert">
          {state.message}
        </p>
      ) : null}

      {state.ok ? (
        <p className="rounded-lg border border-(--gym-accent)/40 bg-(--gym-accent)/10 px-4 py-3 text-sm text-(--gym-accent)">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
};
