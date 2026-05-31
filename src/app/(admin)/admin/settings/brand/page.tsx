import dynamic from "next/dynamic";
import { loadCmsEditorData } from "@/lib/gym-config-resolver";
import { hasAiGateway } from "@/lib/env";
import { SettingsFormSkeleton } from "@/components/admin/settings/settings-form-skeleton";

const BrandSettingsForm = dynamic(
  () => import("@/components/admin/settings/brand-settings-form").then((m) => m.BrandSettingsForm),
  { loading: () => <SettingsFormSkeleton /> },
);

export const metadata = { title: "Brand settings" };

export default async function BrandSettingsPage() {
  const { config, sections } = await loadCmsEditorData();
  return <BrandSettingsForm initialConfig={config} homepageSections={sections} aiEnabled={hasAiGateway} />;
}
