"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Mail, MailOpen } from "lucide-react";
import { markContactInquiryReadAction } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ContactInquiry, ContactInquiryTopic } from "@/types/database";
import { cn } from "@/lib/utils";

const TOPIC_LABELS: Record<ContactInquiryTopic, string> = {
  membership: "Membership",
  training: "Training",
  billing: "Billing",
  feedback: "Feedback",
  other: "General",
};

type ContactInboxPanelProps = {
  inquiries: ContactInquiry[];
};

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const ContactInboxPanel = ({ inquiries }: ContactInboxPanelProps) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      await markContactInquiryReadAction(id);
      router.refresh();
    });
  };

  if (!inquiries.length) {
    return (
      <Card className="p-8 text-center">
        <Mail className="mx-auto h-10 w-10 text-(--gym-muted)" aria-hidden />
        <p className="mt-4 font-medium text-white">No messages yet</p>
        <p className="mt-2 text-sm text-(--gym-muted)">
          When someone uses the contact form on your site, messages appear here and email goes to your general inbox.
        </p>
      </Card>
    );
  }

  return (
    <ul className="space-y-4">
      {inquiries.map((inquiry) => {
        const isNew = inquiry.status === "new";
        return (
          <li key={inquiry.id}>
            <Card className={cn("p-5 transition", isNew && "border-(--gym-accent)/50 bg-(--gym-accent)/5")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-white">{inquiry.name}</p>
                    {isNew ? (
                      <span className="rounded-full bg-(--gym-primary) px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                        New
                      </span>
                    ) : null}
                    <span className="text-xs text-(--gym-muted)">{TOPIC_LABELS[inquiry.topic]}</span>
                  </div>
                  <p className="mt-1 text-sm text-(--gym-accent)">
                    <a href={`mailto:${inquiry.email}`} className="hover:underline">
                      {inquiry.email}
                    </a>
                    {inquiry.phone ? <span className="text-(--gym-muted)"> · {inquiry.phone}</span> : null}
                  </p>
                  <p className="mt-1 text-xs text-(--gym-muted)">{formatWhen(inquiry.created_at)}</p>
                </div>
                {isNew ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={pending}
                    onClick={() => handleMarkRead(inquiry.id)}
                  >
                    <MailOpen className="mr-1 h-4 w-4" aria-hidden />
                    Mark read
                  </Button>
                ) : null}
              </div>
              <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap text-neutral-200">{inquiry.message}</p>
              {inquiry.email_error && !inquiry.email_sent_at ? (
                <p className="mt-3 text-xs text-(--gym-muted)">
                  Email notification failed ({inquiry.email_error}). Message is still saved here.
                </p>
              ) : null}
            </Card>
          </li>
        );
      })}
    </ul>
  );
};
