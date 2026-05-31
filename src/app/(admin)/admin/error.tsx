"use client";

import { RouteErrorHandler } from "@/components/errors/route-error-handler";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminErrorPage({ error, reset }: ErrorPageProps) {
  return <RouteErrorHandler error={error} reset={reset} title="Admin error" />;
}
