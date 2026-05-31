import { ClerkUserProfile } from "@/components/auth/clerk-auth-forms";
import { getGymConfig } from "@/config";
import { hasClerk } from "@/lib/env";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Account" };

export default function UserProfilePage() {
  if (!hasClerk) {
    redirect("/dashboard");
  }

  const config = getGymConfig();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold tracking-widest text-(--gym-accent) uppercase">{config.name}</p>
        <h1 className="mt-2 text-3xl font-black uppercase">Account settings</h1>
        <p className="mt-2 text-(--gym-muted)">Manage your profile, security, and connected accounts.</p>
      </div>

      <ClerkUserProfile />

      <div className="mt-8">
        <Link href="/dashboard">
          <Button variant="secondary" size="sm">
            Back to dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
