import Link from "next/link";
import {
  Building2,
  CreditCard,
  ImageIcon,
  Layout,
  MapPin,
  MessageSquare,
  Navigation,
  Palette,
  ScrollText,
} from "lucide-react";
import { getGymConfig } from "@/config";

export const metadata = { title: "Site Settings" };

const SETTINGS_LINKS = [
  {
    href: "/admin/settings/brand",
    title: "Brand & identity",
    description: "Name, tagline, logo, and theme colors",
    icon: Palette,
  },
  {
    href: "/admin/settings/business",
    title: "Business info",
    description: "Hours, address, contact, and membership copy",
    icon: MapPin,
  },
  {
    href: "/admin/settings/contact",
    title: "Contact page",
    description: "Headlines, contact form, FAQs, and live preview",
    icon: MessageSquare,
  },
  {
    href: "/admin/settings/pricing",
    title: "Pricing & plans",
    description: "Membership cards with photos, prices, and sign-up links",
    icon: CreditCard,
  },
  {
    href: "/admin/settings/media",
    title: "Images & media",
    description: "Hero background, gallery photos, and slideshow display",
    icon: ImageIcon,
  },
  {
    href: "/admin/settings/homepage",
    title: "Homepage sections",
    description: "Add, remove, reorder, and edit homepage blocks",
    icon: Layout,
  },
  {
    href: "/admin/settings/navigation",
    title: "Site menu",
    description: "Choose which pages appear in your menus and rename link labels",
    icon: Navigation,
  },
  {
    href: "/admin/settings/audit",
    title: "Audit logs",
    description: "User and staff activity history with search",
    icon: ScrollText,
  },
];

export default function SettingsHubPage() {
  const config = getGymConfig();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase">Site Settings</h1>
          <p className="mt-2 text-(--gym-muted)">
            Update {config.name} website copy, images, and layout — with live previews on every page.
          </p>
        </div>
        <Link href="/admin" className="text-sm font-medium text-(--gym-accent) hover:underline">
          ← Back to staff portal
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {SETTINGS_LINKS.map(({ href, title, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-xl border border-(--gym-border) bg-(--gym-surface) p-5 transition hover:border-(--gym-primary)/50"
          >
            <Icon className="text-(--gym-accent)" size={24} />
            <h2 className="mt-3 text-lg font-bold group-hover:text-(--gym-accent)">{title}</h2>
            <p className="mt-1 text-sm text-(--gym-muted)">{description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-(--gym-border) bg-black/30 p-4">
        <div className="flex items-center gap-2 text-(--gym-muted)">
          <Building2 size={18} />
          <p className="text-sm">Owner access only. Changes save to your gym database and appear on the public site.</p>
        </div>
      </div>
    </div>
  );
}
