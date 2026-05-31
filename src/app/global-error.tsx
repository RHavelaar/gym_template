"use client";

import { useEffect } from "react";
import { reportBoundaryErrorAction } from "@/app/actions/errors";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    void reportBoundaryErrorAction({
      message: error.message || "Global error",
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 text-white antialiased">
        <div className="max-w-lg text-center">
          <p className="text-4xl" aria-hidden>
            💪
          </p>
          <h1 className="mt-4 text-2xl font-black uppercase">Something went wrong</h1>
          <p className="mt-2 text-neutral-400">It is what it is — we logged this one. Refresh and try again.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:opacity-90"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
