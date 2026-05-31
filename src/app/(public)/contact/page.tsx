import type { Metadata } from "next";
import { ContactPageLayout } from "@/components/business/contact-page-layout";
import { getResolvedContactPageSettings, getResolvedGymConfig } from "@/lib/gym-config-resolver";

export async function generateMetadata(): Promise<Metadata> {
  const [config, page] = await Promise.all([getResolvedGymConfig(), getResolvedContactPageSettings()]);
  const description = page.metaDescription.trim() || page.subtitle || config.tagline;
  return {
    title: page.headline,
    description,
  };
}

export default async function ContactPage() {
  const [config, page] = await Promise.all([getResolvedGymConfig(), getResolvedContactPageSettings()]);

  return <ContactPageLayout config={config} page={page} />;
}
