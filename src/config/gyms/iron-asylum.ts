import { baseGymConfig } from "../base";
import { DEFAULT_GALLERY_CAROUSEL, DEFAULT_HERO_PROPS } from "../types";
import type { GymConfig } from "../types";
import { DEFAULT_BUSINESS_VISIBILITY, mergeBusinessLinks } from "@/lib/business-info";
import { normalizeGalleryItems } from "@/lib/gallery-media";

export const ironAsylumConfig: GymConfig = {
  ...baseGymConfig,
  slug: "iron-asylum",
  name: "Iron Asylum",
  tagline: "Hardcore training. Real community. Longview, TX.",
  description:
    "Iron Asylum is a local hardcore gym for serious lifters, bodybuilders, powerlifters, and everyday members who want to train with intent.",
  business: {
    hours: [
      { day: "Mon–Fri", open: "5:00 AM", close: "10:00 PM" },
      { day: "Saturday", open: "6:00 AM", close: "8:00 PM" },
      { day: "Sunday", open: "8:00 AM", close: "6:00 PM" },
    ],
    membershipBlurb:
      "No contracts. No fluff. Day passes, monthly memberships, and annual options for committed lifters.",
    generalEmail: "info@ironasylumgym.example",
    helpEmail: "help@ironasylumgym.example",
    contactPhone: "(903) 555-0199",
    address: {
      line1: "1200 Industrial Blvd",
      line2: "",
      city: "Longview",
      state: "TX",
      zip: "75601",
    },
    links: mergeBusinessLinks([]),
    visibility: DEFAULT_BUSINESS_VISIBILITY,
  },
  images: {
    hero: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80",
    gallery: normalizeGalleryItems([
      "https://images.unsplash.com/photo-1583454110551-21f2ffc2a61d?w=800&q=80",
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    ]),
  },
  homepageSections: [
    {
      id: "hero",
      type: "hero",
      enabled: true,
      order: 1,
      props: {
        ...DEFAULT_HERO_PROPS,
        tagline: "Hardcore training. Real community. Longview, TX.",
        headline: "Train Like You Mean It",
        subheadline: "PR boards, competitions, and a community that pushes you — built for Iron Asylum members.",
        ctaLabel: "Join the Asylum",
        ctaHref: "/sign-up",
        secondaryCtaLabel: "View Leaderboards",
        secondaryCtaHref: "/leaderboards",
      },
    },
    {
      id: "cta",
      type: "cta",
      enabled: true,
      order: 2,
      props: {
        title: "Log PRs. Climb Boards. Win Challenges.",
        body: "Submit machine and lift PRs, react to wins, and compete in monthly gym challenges.",
      },
    },
    {
      id: "hours",
      type: "hours",
      enabled: true,
      order: 3,
      props: { title: "Gym Hours" },
    },
    {
      id: "location",
      type: "location",
      enabled: true,
      order: 4,
      props: { title: "Find Us in Longview" },
    },
    {
      id: "membership",
      type: "membership",
      enabled: true,
      order: 5,
      props: {
        title: "Membership",
        ctaLabel: "Get started",
        ctaHref: "/sign-up",
      },
    },
    {
      id: "gallery",
      type: "gallery",
      enabled: true,
      order: 6,
      props: { title: "On the Floor", carousel: DEFAULT_GALLERY_CAROUSEL },
    },
    {
      id: "announcements",
      type: "announcements",
      enabled: true,
      order: 7,
      props: {
        title: "Announcements",
        items: [
          "March PR Board Challenge — top 3 per division win merch.",
          "Saturday open gym meet prep — sign up in Competitions.",
        ],
      },
    },
  ],
};
