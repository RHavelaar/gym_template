import type { Metadata } from "next";
import { BusinessContactDisplay } from "@/components/business/business-contact-display";
import { getResolvedGymConfig } from "@/lib/gym-config-resolver";

export const metadata: Metadata = {
  title: "Contact",
};

export default async function ContactPage() {
  const config = await getResolvedGymConfig();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Contact {config.name}</h1>
      <p className="mt-2 text-(--gym-muted)">Hours, location, and ways to reach the gym.</p>
      <div className="mt-8 rounded-xl border border-(--gym-border) bg-(--gym-surface) p-6">
        <BusinessContactDisplay config={config} placement="contactPage" />
      </div>
    </div>
  );
}
