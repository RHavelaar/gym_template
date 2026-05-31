import type { ContactPageSettings, GymPricingPlan, PricingPageSettings } from "./types";
import { DEFAULT_CONTACT_PAGE_SETTINGS, DEFAULT_PRICING_PAGE_SETTINGS } from "./types";

export const ironAsylumContactPageSettings: ContactPageSettings = {
  ...DEFAULT_CONTACT_PAGE_SETTINGS,
  headline: "Contact Iron Asylum",
  subtitle: "Questions about membership, coaching, or your first visit? Send a message or use the details below.",
  faqItems: [
    {
      question: "Do you offer day passes?",
      answer: "Yes — see our pricing page for drop-in and membership options.",
    },
    {
      question: "Can I tour the gym first?",
      answer: "Absolutely. Use the form to request a visit and we will follow up with available times.",
    },
  ],
};

export const ironAsylumPricingPageSettings: PricingPageSettings = {
  ...DEFAULT_PRICING_PAGE_SETTINGS,
  headline: "Membership & pricing",
  subtitle: "Straightforward options for day visitors, monthly members, and committed lifters. No hidden fees.",
  footnote:
    "Prices may vary for corporate or student discounts. Ask at the front desk or contact us before you sign up.",
};

export const ironAsylumDefaultPricingPlans: GymPricingPlan[] = [
  {
    id: "plan-day-pass",
    sortOrder: 1,
    enabled: true,
    name: "Day pass",
    tagline: "Try the floor for a day",
    description: "Full access to machines, free weights, and cardio for one visit.",
    priceDisplay: "$15",
    priceCents: 1500,
    compareAtDisplay: "",
    billingInterval: "one_time",
    durationLabel: "Single visit",
    features: ["One full day of access", "No contract", "Great for travelers"],
    imageUrl: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80",
    badge: "",
    isFeatured: false,
    ctaLabel: "Visit today",
    ctaHref: "/contact",
  },
  {
    id: "plan-monthly",
    sortOrder: 2,
    enabled: true,
    name: "Monthly",
    tagline: "Train on your schedule",
    description: "Unlimited access with month-to-month flexibility.",
    priceDisplay: "$59/mo",
    priceCents: 5900,
    compareAtDisplay: "",
    billingInterval: "month",
    durationLabel: "Billed monthly",
    features: ["Unlimited gym access", "PR boards & competitions", "Member community feed"],
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    badge: "Most popular",
    isFeatured: true,
    ctaLabel: "Join now",
    ctaHref: "/sign-up",
  },
  {
    id: "plan-annual",
    sortOrder: 3,
    enabled: true,
    name: "Annual",
    tagline: "Best value for regulars",
    description: "Twelve months of access for lifters who know this is their home gym.",
    priceDisplay: "$599/yr",
    priceCents: 59900,
    compareAtDisplay: "$708",
    billingInterval: "year",
    durationLabel: "12-month commitment",
    features: ["Everything in Monthly", "Priority event sign-ups", "Annual merch credit"],
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    badge: "Best value",
    isFeatured: false,
    ctaLabel: "Commit & save",
    ctaHref: "/sign-up",
  },
];
