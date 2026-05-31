import dynamic from "next/dynamic";
import { loadCmsEditorData } from "@/lib/gym-config-resolver";
import { SettingsFormSkeleton } from "@/components/admin/settings/settings-form-skeleton";

const ContactSettingsForm = dynamic(
  () => import("@/components/admin/settings/contact-settings-form").then((m) => m.ContactSettingsForm),
  { loading: () => <SettingsFormSkeleton /> },
);

export const metadata = { title: "Contact page settings" };

export default async function ContactSettingsPage() {
  const { contactPage } = await loadCmsEditorData();
  return <ContactSettingsForm initialPage={contactPage} />;
}
