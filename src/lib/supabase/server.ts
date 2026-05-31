import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env, getSupabasePublicKey, getSupabaseSecretKey, hasSupabase } from "@/lib/env";

export const createClient = async () => {
  if (!hasSupabase) {
    throw new Error("Supabase is not configured");
  }
  const cookieStore = await cookies();
  const key = getSupabasePublicKey()!;
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component — ignore; middleware refreshes sessions
        }
      },
    },
  });
};

/** Trusted server client — uses Supabase secret key (`sb_secret_...`). Webhooks only. */
export const createServiceClient = () => {
  const secretKey = getSupabaseSecretKey();
  if (!hasSupabase || !secretKey) {
    throw new Error("Supabase secret key is not configured (SUPABASE_SECRET_KEY)");
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
  return createSupabaseClient(env.NEXT_PUBLIC_SUPABASE_URL!, secretKey, { auth: { persistSession: false } });
};
