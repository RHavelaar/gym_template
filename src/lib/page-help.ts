export const CONTACT_PAGE_HELP = {
  headline: {
    hint: "Main title visitors see at the top of your contact page.",
    recommendation: "Keep it short — gym name or “Contact us” works well.",
  },
  subtitle: {
    hint: "One or two sentences under the headline.",
    recommendation: "Mention tours, membership questions, or how fast you reply.",
  },
  formHeadline: {
    hint: "Title above the contact form.",
    recommendation: "“Send a message” is clear and friendly.",
  },
  showForm: {
    hint: "Turn off if you only want phone, email, and address on this page.",
    recommendation: "Leave on so visitors can reach you without opening their email app.",
  },
  showDirections: {
    hint: "Adds a Google Maps directions link under your address.",
    recommendation: "Helpful for first-time visitors on mobile.",
  },
  faq: {
    hint: "Short questions and answers below your contact details.",
    recommendation: "Cover day passes, tours, and parking — saves repeat emails.",
  },
  generalEmailNote: {
    hint: "Form submissions email your general address from Business info.",
    recommendation: "Set general email under Business info so notifications arrive in the right inbox.",
  },
} as const;

export const PRICING_PAGE_HELP = {
  headline: {
    hint: "Main title on your pricing page.",
    recommendation: "“Membership & pricing” or “Plans” — avoid internal jargon.",
  },
  subtitle: {
    hint: "Sets expectations about contracts, passes, and who each plan is for.",
    recommendation: "Mention if you offer day passes or no long-term contracts.",
  },
  footnote: {
    hint: "Fine print about discounts, freezes, or cancellation.",
    recommendation: "One short paragraph is enough for most gyms.",
  },
  planName: {
    hint: "What members call this option on the floor.",
    recommendation: "“Monthly”, “Day pass”, or “Annual” — match how staff talks.",
  },
  priceDisplay: {
    hint: "What visitors see on the card — not a payment processor amount.",
    recommendation: "Use “$49/mo” or “Call for pricing” when rates vary.",
  },
  durationLabel: {
    hint: "Billing or commitment detail under the price.",
    recommendation: "Examples: “Billed monthly”, “12-month commitment”, “Single visit”.",
  },
  planImage: {
    hint: "Photo on the plan card — use the media library or upload.",
    recommendation: "Action shots of your space work better than stock gym photos.",
  },
  featured: {
    hint: "Highlights one plan with a stronger border on the pricing page.",
    recommendation: "Usually your most popular monthly membership.",
  },
} as const;
