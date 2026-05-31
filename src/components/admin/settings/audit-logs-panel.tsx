"use client";

import { useState } from "react";
import { AuditLogViewer } from "@/components/admin/settings/audit-log-viewer";
import { cn } from "@/lib/utils";

type AuditTab = "user" | "admin";

const TABS: { id: AuditTab; label: string }[] = [
  { id: "user", label: "User activity" },
  { id: "admin", label: "Staff & site activity" },
];

export const AuditLogsPanel = () => {
  const [tab, setTab] = useState<AuditTab>("admin");

  return (
    <div className="space-y-6">
      <div
        className="flex flex-wrap gap-2 border-b border-(--gym-border) pb-4"
        role="tablist"
        aria-label="Audit log streams"
      >
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            aria-controls={`audit-panel-${id}`}
            id={`audit-tab-${id}`}
            onClick={() => setTab(id)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold tracking-wide uppercase transition",
              tab === id ? "bg-(--gym-primary) text-white" : "text-(--gym-muted) hover:bg-(--gym-surface)",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`audit-panel-${tab}`} aria-labelledby={`audit-tab-${tab}`}>
        <AuditLogViewer key={tab} stream={tab} />
      </div>
    </div>
  );
};
