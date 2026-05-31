import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env, getSupabasePublicKey, hasClerk, hasSupabase } from "@/lib/env";

/** Clerk session token for Supabase third-party auth (RLS reads auth.jwt()->>'sub'). */
export const getClerkSupabaseAccessToken = async (): Promise<string | null> => {
  if (!hasClerk) return null;

  const { getToken } = await auth();
  return (await getToken()) ?? null;
};

/** Supabase client authenticated with the Clerk session token for RLS. */
export const createClerkSupabaseClient = async () => {
  if (!hasSupabase) {
    throw new Error("Supabase is not configured");
  }

  const cookieStore = await cookies();
  const key = getSupabasePublicKey()!;
  const accessToken = await getClerkSupabaseAccessToken();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component — ignore
        }
      },
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
};
