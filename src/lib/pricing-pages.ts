import { getGymConfig } from "@/config";
import { hasSupabase } from "@/lib/env";
import { getGymIdBySlug } from "@/lib/profiles";
import { createServiceClient } from "@/lib/supabase/server";

export const ensureGymPage = async (gymId: string, slug: string, title: string): Promise<string> => {
  if (!hasSupabase) return `demo-${slug}-page`;

  const supabase = createServiceClient();
  const { data: existing } = await supabase
    .from("gym_pages")
    .select("id")
    .eq("gym_id", gymId)
    .eq("slug", slug)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data, error } = await supabase
    .from("gym_pages")
    .insert({ gym_id: gymId, slug, title, is_published: true, settings: {} })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? `Failed to create ${slug} page`);
  return data.id;
};

export const resolveOwnerGymId = async (): Promise<{ gymId: string; slug: string }> => {
  const slug = getGymConfig().slug;
  if (!hasSupabase) {
    const { DEMO_GYM_ID } = await import("@/lib/demo-data");
    return { gymId: DEMO_GYM_ID, slug };
  }
  const gymId = await getGymIdBySlug(slug);
  if (!gymId) throw new Error("Gym not found");
  return { gymId, slug };
};
