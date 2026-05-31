import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ClerkSignIn } from "@/components/auth/clerk-auth-forms";
import { getGymConfig } from "@/config";
import { hasClerk } from "@/lib/env";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const config = getGymConfig();

  if (!hasClerk) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-(--gym-bg) px-4 text-white">
        <p>Clerk is not configured. Use demo mode:</p>
        <Link href="/dashboard">
          <Button>Go to dashboard (demo)</Button>
        </Link>
      </div>
    );
  }

  return (
    <AuthPageShell config={config}>
      <ClerkSignIn />
    </AuthPageShell>
  );
}
