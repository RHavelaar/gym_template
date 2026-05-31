"use client";

import { Fragment, useCallback, useState } from "react";
import { ChevronDown, ChevronRight, Copy } from "lucide-react";
import type { ErrorLogRow } from "@/lib/errors/fetch-error-events";

type ErrorLogTableProps = {
  events: ErrorLogRow[];
};

const formatWhen = (iso: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));

export const ErrorLogTable = ({ events }: ErrorLogTableProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  }, []);

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-(--gym-border) bg-(--gym-surface) p-8 text-center text-(--gym-muted)">
        No errors logged yet. When members hit issues, they will show up here.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-(--gym-border)">
      <div className="overflow-x-auto">
        <table className="w-full min-w-180 text-left text-sm">
          <thead className="border-b border-(--gym-border) bg-black/30 text-(--gym-muted)">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Message</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Route</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium" aria-label="Expand row" />
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const expanded = expandedId === event.id;
              return (
                <Fragment key={event.id}>
                  <tr className="border-b border-(--gym-border)/60">
                    <td className="px-4 py-3 align-top text-(--gym-muted)">{formatWhen(event.created_at)}</td>
                    <td className="px-4 py-3 align-top">
                      <code className="rounded bg-black/40 px-1.5 py-0.5 text-xs text-(--gym-accent)">
                        {event.error_code}
                      </code>
                    </td>
                    <td className="max-w-xs px-4 py-3 align-top">{event.message}</td>
                    <td className="px-4 py-3 align-top text-(--gym-muted)">
                      {event.profile_display_name ?? "Anonymous"}
                    </td>
                    <td className="px-4 py-3 align-top font-mono text-xs text-(--gym-muted)">{event.route ?? "—"}</td>
                    <td className="px-4 py-3 align-top text-(--gym-muted) capitalize">
                      {event.source.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-label={expanded ? "Collapse details" : "Expand details"}
                        onClick={() => setExpandedId(expanded ? null : event.id)}
                        className="rounded p-1 text-(--gym-muted) hover:bg-white/10 hover:text-white"
                      >
                        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    </td>
                  </tr>
                  {expanded ? (
                    <tr key={`${event.id}-detail`} className="border-b border-(--gym-border)/60 bg-black/20">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="space-y-3 text-sm">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-(--gym-muted)">Reference ID:</span>
                            <code className="font-mono text-xs">{event.id}</code>
                            <button
                              type="button"
                              onClick={() => handleCopy(event.id)}
                              className="inline-flex items-center gap-1 text-xs text-(--gym-accent) hover:underline"
                            >
                              <Copy size={12} />
                              Copy ID
                            </button>
                          </div>
                          {event.detail ? (
                            <div>
                              <p className="mb-1 text-(--gym-muted)">Technical detail</p>
                              <pre className="overflow-x-auto rounded-lg border border-(--gym-border) bg-black/40 p-3 text-xs text-(--gym-muted)">
                                {event.detail}
                              </pre>
                            </div>
                          ) : null}
                          {event.user_agent ? (
                            <div>
                              <p className="mb-1 text-(--gym-muted)">User agent</p>
                              <p className="text-xs text-(--gym-muted)">{event.user_agent}</p>
                            </div>
                          ) : null}
                          {Object.keys(event.metadata).length > 0 ? (
                            <div>
                              <p className="mb-1 text-(--gym-muted)">Metadata</p>
                              <pre className="overflow-x-auto rounded-lg border border-(--gym-border) bg-black/40 p-3 text-xs text-(--gym-muted)">
                                {JSON.stringify(event.metadata, null, 2)}
                              </pre>
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
