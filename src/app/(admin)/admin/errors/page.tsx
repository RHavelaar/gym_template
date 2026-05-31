import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { ErrorLogTable } from "@/components/admin/error-log-table";
import { fetchErrorCodes, fetchErrorEvents } from "@/lib/errors/fetch-error-events";

export const metadata = { title: "Error Log" };

type ErrorsPageProps = {
  searchParams: Promise<{
    code?: string;
    source?: string;
    page?: string;
  }>;
};

const PAGE_SIZE = 50;

export default async function AdminErrorsPage({ searchParams }: ErrorsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [{ events, total }, codes] = await Promise.all([
    fetchErrorEvents({
      code: params.code,
      source: params.source,
      limit: PAGE_SIZE,
      offset,
    }),
    fetchErrorCodes(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-(--gym-accent)" size={28} />
            <h1 className="text-3xl font-black uppercase">Error log</h1>
          </div>
          <p className="mt-2 text-(--gym-muted)">
            Issues members reported or the app logged automatically. Use error codes when following up.
          </p>
        </div>
        <Link href="/admin" className="text-sm font-medium text-(--gym-accent) hover:underline">
          ← Back to staff portal
        </Link>
      </div>

      <form className="mt-8 flex flex-wrap gap-3" method="get">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-(--gym-muted)">Error code</span>
          <select
            name="code"
            defaultValue={params.code ?? ""}
            className="min-h-10 rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3"
          >
            <option value="">All codes</option>
            {codes.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-(--gym-muted)">Source</span>
          <select
            name="source"
            defaultValue={params.source ?? ""}
            className="min-h-10 rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3"
          >
            <option value="">All sources</option>
            <option value="client">Client</option>
            <option value="server_action">Server action</option>
            <option value="api">API</option>
            <option value="boundary">Boundary</option>
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            className="min-h-10 rounded-lg bg-(--gym-primary) px-4 text-sm font-semibold text-(--gym-primary-fg)"
          >
            Filter
          </button>
        </div>
      </form>

      <div className="mt-6">
        <ErrorLogTable events={events} />
      </div>

      {totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-between text-sm text-(--gym-muted)">
          <span>
            Page {page} of {totalPages} ({total} events)
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={`/admin/errors?${new URLSearchParams({
                  ...(params.code ? { code: params.code } : {}),
                  ...(params.source ? { source: params.source } : {}),
                  page: String(page - 1),
                }).toString()}`}
                className="rounded-lg border border-(--gym-border) px-3 py-2 hover:border-(--gym-accent)"
              >
                Previous
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link
                href={`/admin/errors?${new URLSearchParams({
                  ...(params.code ? { code: params.code } : {}),
                  ...(params.source ? { source: params.source } : {}),
                  page: String(page + 1),
                }).toString()}`}
                className="rounded-lg border border-(--gym-border) px-3 py-2 hover:border-(--gym-accent)"
              >
                Next
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
