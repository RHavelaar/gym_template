import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type AdminActionCardProps = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const AdminActionCard = ({ href, title, description, icon: Icon }: AdminActionCardProps) => (
  <Link
    href={href}
    className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--gym-accent)"
  >
    <Card className="transition hover:border-(--gym-primary)">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-(--gym-primary)/20 p-3 text-(--gym-accent)">
          <Icon size={28} aria-hidden />
        </div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
    </Card>
  </Link>
);
