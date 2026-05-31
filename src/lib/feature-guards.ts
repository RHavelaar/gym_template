import { redirect } from "next/navigation";
import type { GymFeatureFlags } from "@/config/types";
import { getResolvedGymConfig } from "@/lib/gym-config-resolver";

export const requireFeatureEnabled = async (feature: keyof GymFeatureFlags) => {
  const config = await getResolvedGymConfig();
  if (!config.features[feature]) {
    redirect("/");
  }
};
