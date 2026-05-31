import { createBrowserClient } from "@supabase/ssr";
import { env, getSupabasePublicKey, hasSupabase } from "@/lib/env";

export const createClient = () => {
  if (!hasSupabase) {
    throw new Error("Supabase is not configured");
  }
  const key = getSupabasePublicKey()!;
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL!, key);
};
