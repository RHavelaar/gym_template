import dynamic from "next/dynamic";
import { loadCmsEditorData } from "@/lib/gym-config-resolver";
import { SettingsFormSkeleton } from "@/components/admin/settings/settings-form-skeleton";

const PricingSettingsForm = dynamic(
  () => import("@/components/admin/settings/pricing-settings-form").then((m) => m.PricingSettingsForm),
  { loading: () => <SettingsFormSkeleton /> },
);

export const metadata = { title: "Pricing settings" };

export default async function PricingSettingsPage() {
  const { pricingPage, pricingPlans } = await loadCmsEditorData();
  return <PricingSettingsForm initialPage={pricingPage} initialPlans={pricingPlans} />;
}
