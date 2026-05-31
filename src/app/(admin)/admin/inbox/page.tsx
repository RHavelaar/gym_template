import Link from "next/link";
import { Inbox } from "lucide-react";
import { ContactInboxPanel } from "@/components/admin/contact-inbox-panel";
import { getGymConfig } from "@/config";
import { listContactInquiriesForGym } from "@/lib/contact-inquiries";
import { requireManager } from "@/lib/rbac";

export const metadata = { title: "Contact inbox" };

export default async function ContactInboxPage() {
  const config = getGymConfig();
  const ctx = await requireManager();
  const inquiries = ctx.gymId ? await listContactInquiriesForGym(ctx.gymId) : [];
  const newCount = inquiries.filter((row) => row.status === "new").length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="h-8 w-8 text-(--gym-accent)" aria-hidden />
            <h1 className="text-3xl font-black uppercase">Contact inbox</h1>
          </div>
          <p className="mt-2 text-(--gym-muted)">
            Messages from your website contact form at {config.name}. Replies go to your general email.
          </p>
          {newCount > 0 ? (
            <p className="mt-3 rounded-lg border border-(--gym-accent)/50 bg-(--gym-accent)/10 px-4 py-2 text-sm text-(--gym-accent)">
              {newCount} new message{newCount === 1 ? "" : "s"} waiting
            </p>
          ) : null}
        </div>
        <Link href="/admin" className="text-sm font-medium text-(--gym-accent) hover:underline">
          ← Staff portal
        </Link>
      </div>

      <div className="mt-8">
        <ContactInboxPanel inquiries={inquiries} />
      </div>
    </div>
  );
}
