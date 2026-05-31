import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";
import { deleteProfileFromClerk, upsertProfileFromClerk } from "@/lib/profiles";
import { hasSupabase } from "@/lib/env";

const displayNameFromUser = (data: {
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
}) => {
  const full = `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim();
  if (full) return full;
  if (data.username) return data.username;
  return "Member";
};

export const POST = async (req: NextRequest) => {
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch (err) {
    console.error("[clerk webhook] verification failed", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  if (!hasSupabase) {
    console.info("[clerk webhook] skipped — Supabase not configured", evt.type);
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    if (evt.type === "user.created" || evt.type === "user.updated") {
      const { id, first_name, last_name, username, image_url } = evt.data;
      await upsertProfileFromClerk({
        clerkUserId: id,
        displayName: displayNameFromUser({ first_name, last_name, username }),
        avatarUrl: image_url ?? null,
        isNew: evt.type === "user.created",
      });
    }

    if (evt.type === "user.deleted" && evt.data.id) {
      await deleteProfileFromClerk(evt.data.id);
    }
  } catch (err) {
    console.error("[clerk webhook] handler error", evt.type, err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
};
