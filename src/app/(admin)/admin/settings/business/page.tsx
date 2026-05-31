import dynamic from "next/dynamic";
import { getResolvedGymConfig } from "@/lib/gym-config-resolver";
import { SettingsFormSkeleton } from "@/components/admin/settings/settings-form-skeleton";

const BusinessSettingsForm = dynamic(
  () => import("@/components/admin/settings/business-settings-form").then((m) => m.BusinessSettingsForm),
  { loading: () => <SettingsFormSkeleton /> },
);

export const metadata = { title: "Business settings" };

export default async function BusinessSettingsPage() {
  const config = await getResolvedGymConfig();
  return <BusinessSettingsForm initialConfig={config} />;
}
