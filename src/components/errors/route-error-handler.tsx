"use client";

import { useEffect } from "react";
import { reportBoundaryErrorAction } from "@/app/actions/errors";
import { Button } from "@/components/ui/button";
import { ERROR_CODES } from "@/lib/errors/codes";
import { useErrorToast } from "@/lib/errors/show-error-toast";

type RouteErrorHandlerProps = {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
};

export const RouteErrorHandler = ({ error, reset, title = "Something went wrong" }: RouteErrorHandlerProps) => {
  const { showError } = useErrorToast();

  useEffect(() => {
    const route = typeof window !== "undefined" ? window.location.pathname : undefined;

    showError({
      code: ERROR_CODES.SYS_BOUNDARY,
      message: error.message || "This page hit a snag. We logged it.",
      detail: error.digest,
    });

    void reportBoundaryErrorAction({
      message: error.message || "Route error",
      route,
      digest: error.digest,
    });
  }, [error, showError]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center">
      <p className="text-4xl" aria-hidden>
        💪
      </p>
      <h1 className="mt-4 text-2xl font-black uppercase">{title}</h1>
      <p className="mt-2 text-(--gym-muted)">
        It is what it is — we logged this one. Try again or contact your gym if it keeps happening.
      </p>
      <Button type="button" className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
};
