import dynamic from "next/dynamic";
import { loadCmsEditorData } from "@/lib/gym-config-resolver";
import { SettingsFormSkeleton } from "@/components/admin/settings/settings-form-skeleton";

const NavSettingsForm = dynamic(
  () => import("@/components/admin/settings/nav-settings-form").then((m) => m.NavSettingsForm),
  { loading: () => <SettingsFormSkeleton /> },
);

export const metadata = { title: "Site menu settings" };

export default async function NavigationSettingsPage() {
  const { config, sections } = await loadCmsEditorData();
  return <NavSettingsForm initialConfig={config} homepageSections={sections} />;
}
