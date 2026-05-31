import dynamic from "next/dynamic";
import { loadCmsEditorData } from "@/lib/gym-config-resolver";
import { SettingsFormSkeleton } from "@/components/admin/settings/settings-form-skeleton";

const MediaSettingsForm = dynamic(
  () => import("@/components/admin/settings/media-settings-form").then((m) => m.MediaSettingsForm),
  { loading: () => <SettingsFormSkeleton /> },
);

export const metadata = { title: "Gallery & hero" };

export default async function MediaSettingsPage() {
  const { config, sections } = await loadCmsEditorData();
  return <MediaSettingsForm initialConfig={config} previewSections={sections} />;
}
