import Link from "next/link";
import type { ContactPageSettings, GymConfig } from "@/config/types";
import { BusinessContactDisplay } from "@/components/business/business-contact-display";
import { ContactForm } from "@/components/contact/contact-form";
import { buildGoogleMapsDirectionsUrl } from "@/lib/business-info";

type ContactPageLayoutProps = {
  config: GymConfig;
  page: ContactPageSettings;
};

export const ContactPageLayout = ({ config, page }: ContactPageLayoutProps) => {
  const directionsUrl = buildGoogleMapsDirectionsUrl(config.business);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{page.headline}</h1>
        {page.subtitle ? <p className="mt-3 text-base text-(--gym-muted) sm:text-lg">{page.subtitle}</p> : null}
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
        {page.showForm ? (
          <section aria-labelledby="contact-form-heading" className="order-1 lg:order-none">
            <h2 id="contact-form-heading" className="text-xl font-bold">
              {page.formHeadline}
            </h2>
            {page.formSubtitle ? <p className="mt-1 text-sm text-(--gym-muted)">{page.formSubtitle}</p> : null}
            <div className="mt-6 rounded-2xl border border-(--gym-border) bg-(--gym-surface) p-5 sm:p-6">
              <ContactForm />
            </div>
          </section>
        ) : null}

        <aside className="space-y-6">
          <section aria-labelledby="contact-details-heading">
            <h2 id="contact-details-heading" className="text-xl font-bold">
              Hours & location
            </h2>
            <div className="mt-4 rounded-2xl border border-(--gym-border) bg-(--gym-surface) p-5 sm:p-6">
              <BusinessContactDisplay config={config} placement="contactPage" />
              {page.showDirectionsLink ? (
                <p className="mt-4">
                  <Link
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center text-sm font-semibold text-(--gym-accent) hover:underline"
                  >
                    Get directions on Google Maps
                  </Link>
                </p>
              ) : null}
            </div>
          </section>

          {page.faqItems.length > 0 ? (
            <section aria-labelledby="contact-faq-heading">
              <h2 id="contact-faq-heading" className="text-xl font-bold">
                Common questions
              </h2>
              <dl className="mt-4 space-y-4">
                {page.faqItems.map((item) => (
                  <div
                    key={item.question}
                    className="rounded-xl border border-(--gym-border) bg-(--gym-surface) px-4 py-4"
                  >
                    <dt className="font-semibold">{item.question}</dt>
                    <dd className="mt-2 text-sm text-(--gym-muted)">{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
};
