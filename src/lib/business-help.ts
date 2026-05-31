export const BUSINESS_SECTION_HELP = {
  hours: {
    title: "Gym hours",
    hint: "Days and open/close times shown on your homepage, contact page, and optionally the footer.",
    recommendation: "Use ranges like Mon–Fri when hours are the same all week.",
  },
  address: {
    title: "Address",
    hint: "Street address visitors use for directions and map links.",
    recommendation: "Match what you print on invoices and Google Business Profile.",
  },
  phone: {
    title: "Phone",
    hint: "Main phone number members call for hours, billing, or front desk.",
    recommendation: "Include area code and a format your staff answers consistently.",
  },
  generalEmail: {
    title: "General email",
    hint: "Public inbox for membership questions, tours, and partnerships.",
    recommendation: "Use an address your team monitors daily — not a personal Gmail.",
  },
  helpEmail: {
    title: "Help email",
    hint: "Used when someone taps Get help on an error message. Required for accessibility reviews.",
    recommendation: "Often support@ or help@ — can match general email if you only have one inbox.",
  },
  membership: {
    title: "Membership blurb",
    hint: "Short pitch on pricing style (contracts, day passes, etc.) for the homepage membership section.",
    recommendation: "Two or three sentences; link to your pricing page for full plan details.",
  },
  social: {
    title: "Social & web links",
    hint: "Profiles and websites visitors can open in a new tab.",
    recommendation: "Paste full https links. Leave blank any platform you do not use.",
  },
  visibility: {
    title: "Where this shows",
    hint: "Choose which parts of the site display this information.",
    recommendation: "Contact page is a good home for email; footer works well for address and phone.",
  },
} as const;

export const BUSINESS_VISIBILITY_LABELS = {
  footer: "Site footer",
  contactPage: "Contact page",
  homepageLocation: "Homepage location section",
  homepageHours: "Homepage hours section",
  homepageMembership: "Homepage membership section",
} as const;
