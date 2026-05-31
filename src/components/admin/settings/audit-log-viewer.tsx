"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import {
  searchAdminAuditLogsAction,
  searchUserAuditLogsAction,
  type AuditLogCursor,
  type AuditLogSearchFilters,
} from "@/app/actions/audit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AuditChange, AuditEventRow } from "@/types/database";

type AuditStream = "user" | "admin";

type AuditLogViewerProps = {
  stream: AuditStream;
};

const defaultFromDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().slice(0, 10);
};

const formatWhen = (iso: string) => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

const formatRole = (role: string | null) => {
  if (!role) return "system";
  return role.replace(/_/g, " ");
};

const ChangeDetails = ({ changes }: { changes: AuditChange[] }) => (
  <ul className="mt-2 space-y-1 text-xs text-(--gym-muted)">
    {changes.map((change) => (
      <li key={change.field}>
        <span className="font-medium">{change.field}</span>: {JSON.stringify(change.old)} → {JSON.stringify(change.new)}
      </li>
    ))}
  </ul>
);

const AuditRowDetails = ({ row }: { row: AuditEventRow }) => {
  const [open, setOpen] = useState(false);
  const changes = row.metadata?.changes;
  const hasChanges = Array.isArray(changes) && changes.length > 0;
  const hasMetadata = hasChanges || (row.metadata && Object.keys(row.metadata).length > 0);

  if (!hasMetadata) return null;

  return (
    <div className="mt-1">
      <button
        type="button"
        className="text-xs font-medium text-(--gym-accent) hover:underline"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        {open ? "Hide details" : "Show details"}
      </button>
      {open ? (
        <div className="mt-2 rounded-md border border-(--gym-border) bg-black/20 p-3">
          {hasChanges ? <ChangeDetails changes={changes as AuditChange[]} /> : null}
          {!hasChanges && row.metadata ? (
            <pre className="max-h-40 overflow-auto text-xs text-(--gym-muted)">
              {JSON.stringify(row.metadata, null, 2)}
            </pre>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export const AuditLogViewer = ({ stream }: AuditLogViewerProps) => {
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState(defaultFromDate);
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<AuditEventRow[]>([]);
  const [cursor, setCursor] = useState<AuditLogCursor | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const buildFilters = useCallback(
    (nextCursor?: AuditLogCursor | null): AuditLogSearchFilters => ({
      query: query.trim() || undefined,
      from: from ? new Date(`${from}T00:00:00.000Z`).toISOString() : undefined,
      to: to ? new Date(`${to}T23:59:59.999Z`).toISOString() : undefined,
      cursor: nextCursor ?? undefined,
    }),
    [query, from, to],
  );

  const load = useCallback(
    async (append: boolean, nextCursor?: AuditLogCursor | null) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError("");
      }

      try {
        const search = stream === "user" ? searchUserAuditLogsAction : searchAdminAuditLogsAction;
        const result = await search(buildFilters(nextCursor));

        setRows((prev) => (append ? [...prev, ...result.rows] : result.rows));
        setCursor(result.nextCursor);
        setHasMore(result.hasMore);
      } catch {
        setError("Could not load audit logs.");
        if (!append) setRows([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [stream, buildFilters],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void load(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const handleLoadMore = () => {
    if (!cursor || loadingMore) return;
    void load(true, cursor);
  };

  const streamLabel = stream === "user" ? "User activity" : "Staff & site activity";

  return (
    <div className="space-y-4">
      <p className="text-sm text-(--gym-muted)">
        {streamLabel} — meaningful saves and updates from members and staff. Default view shows the last 30 days.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-(--gym-muted)"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search summary or action…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            aria-label={`Search ${streamLabel}`}
          />
        </div>
        <div>
          <Label htmlFor={`${stream}-from`} className="text-xs text-(--gym-muted)">
            From
          </Label>
          <Input
            id={`${stream}-from`}
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`${stream}-to`} className="text-xs text-(--gym-muted)">
            To
          </Label>
          <Input id={`${stream}-to`} type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1" />
        </div>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-(--gym-muted)">Loading logs…</p>
      ) : error ? (
        <p className="py-12 text-center text-sm text-red-400">{error}</p>
      ) : rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-(--gym-muted)">No events match your filters.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-(--gym-border)">
          <table className="w-full min-w-160 text-left text-sm">
            <thead>
              <tr className="border-b border-(--gym-border) bg-black/30 text-xs tracking-wide text-(--gym-muted) uppercase">
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3 font-semibold">Who</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">Summary</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={`${row.id}-${row.created_at}`}
                  className="border-b border-(--gym-border)/60 align-top last:border-0"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-(--gym-muted)">{formatWhen(row.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{row.actor_display_name ?? "System"}</span>
                    <span className="mt-0.5 block text-xs text-(--gym-muted)">{formatRole(row.actor_role)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-(--gym-accent)">{row.action}</code>
                  </td>
                  <td className="px-4 py-3">
                    <span>{row.summary}</span>
                    <AuditRowDetails row={row} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasMore && !loading ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className={cn(
              "rounded-lg border border-(--gym-border) px-4 py-2 text-sm font-medium",
              "hover:border-(--gym-primary)/50 disabled:opacity-50",
            )}
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
};
