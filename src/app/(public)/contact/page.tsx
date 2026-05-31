import type { Metadata } from "next";
import { BusinessContactDisplay } from "@/components/business/business-contact-display";
import { ContactForm } from "@/components/contact/contact-form";
import { getResolvedGymConfig } from "@/lib/gym-config-resolver";

export const metadata: Metadata = {
  title: "Contact",
};

export default async function ContactPage() {
  const config = await getResolvedGymConfig();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Contact {config.name}</h1>
      <p className="mt-2 text-(--gym-muted)">
        Send us a message, find our hours and location, or reach out using the details below.
      </p>

      <section className="mt-10" aria-labelledby="contact-form-heading">
        <h2 id="contact-form-heading" className="text-xl font-bold">
          Send a message
        </h2>
        <p className="mt-1 text-sm text-(--gym-muted)">
          We reply by email. Your message is also saved in the gym inbox for staff.
        </p>
        <div className="mt-6 rounded-xl border border-(--gym-border) bg-(--gym-surface) p-6">
          <ContactForm />
        </div>
      </section>

      <section className="mt-10" aria-labelledby="contact-details-heading">
        <h2 id="contact-details-heading" className="text-xl font-bold">
          Hours & location
        </h2>
        <div className="mt-4 rounded-xl border border-(--gym-border) bg-(--gym-surface) p-6">
          <BusinessContactDisplay config={config} placement="contactPage" />
        </div>
      </section>
    </div>
  );
}
