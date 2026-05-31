import dynamic from "next/dynamic";
import { loadCmsEditorData } from "@/lib/gym-config-resolver";
import { SettingsFormSkeleton } from "@/components/admin/settings/settings-form-skeleton";

const HomepageSectionEditor = dynamic(
  () => import("@/components/admin/settings/homepage-section-editor").then((m) => m.HomepageSectionEditor),
  { loading: () => <SettingsFormSkeleton /> },
);

export const metadata = { title: "Homepage settings" };

export default async function HomepageSettingsPage() {
  const { config, sections } = await loadCmsEditorData();
  return <HomepageSectionEditor initialConfig={config} initialSections={sections} />;
}
