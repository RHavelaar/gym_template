"use client";

import Image from "next/image";
import { useState } from "react";
import type { AppErrorPayload } from "@/lib/errors/app-error";
import { buildErrorHelpMailto } from "@/lib/errors/mailto";
import { cn } from "@/lib/utils";

type GymErrorToastProps = {
  error: AppErrorPayload;
  gymName: string;
  helpEmail: string;
  logoUrl?: string;
  route?: string;
};

export const GymErrorToast = ({ error, gymName, helpEmail, logoUrl, route }: GymErrorToastProps) => {
  const [copied, setCopied] = useState(false);

  const helpMailto =
    error.helpMailto ??
    buildErrorHelpMailto({
      helpEmail,
      gymName,
      code: error.code,
      message: error.message,
      route,
      eventId: error.eventId,
    });

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(error.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="flex gap-3">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-(--gym-border) bg-black/40 text-2xl"
        aria-hidden
      >
        {logoUrl ? (
          <Image src={logoUrl} alt="" width={32} height={32} className="h-8 w-8 object-contain" unoptimized />
        ) : (
          <span>{error.emoji ?? "💪"}</span>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        {error.quip ? (
          <p className="text-xs font-semibold tracking-wide text-(--gym-accent) uppercase">{error.quip}</p>
        ) : null}

        <p className="text-sm leading-snug text-white">{error.message}</p>

        <button
          type="button"
          onClick={handleCopyCode}
          className={cn(
            "inline-flex items-center rounded-md border border-(--gym-border) bg-black/30 px-2 py-0.5 font-mono text-xs text-(--gym-muted) transition hover:border-(--gym-accent)/50 hover:text-white",
            copied && "border-(--gym-accent) text-(--gym-accent)",
          )}
          aria-label={`Error code ${error.code}. Click to copy.`}
        >
          {copied ? "Copied!" : error.code}
        </button>

        <div className="flex flex-wrap items-center gap-3 pt-0.5">
          {helpMailto ? (
            <a
              href={helpMailto}
              className="text-xs font-semibold text-(--gym-accent) underline-offset-2 hover:underline"
            >
              Get help
            </a>
          ) : (
            <span className="text-xs text-(--gym-muted)">Contact your gym for support</span>
          )}
          {error.eventId ? (
            <span className="truncate font-mono text-[10px] text-(--gym-muted)">Ref: {error.eventId.slice(0, 8)}…</span>
          ) : null}
        </div>
      </div>
    </div>
  );
};
