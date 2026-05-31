import Link from "next/link";
import { ScrollText } from "lucide-react";
import { AuditLogsPanel } from "@/components/admin/settings/audit-logs-panel";
import { getGymConfig } from "@/config";

export const metadata = { title: "Audit Logs" };

export default function AuditLogsPage() {
  const config = getGymConfig();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ScrollText className="text-(--gym-accent)" size={28} aria-hidden />
            <h1 className="text-3xl font-black uppercase">Audit Logs</h1>
          </div>
          <p className="mt-2 text-(--gym-muted)">
            Review who changed what on {config.name} — member actions and owner/staff site changes. Owner access only.
          </p>
        </div>
        <Link href="/admin/settings" className="text-sm font-medium text-(--gym-accent) hover:underline">
          ← Site settings
        </Link>
      </div>

      <div className="mt-8">
        <AuditLogsPanel />
      </div>
    </div>
  );
}
