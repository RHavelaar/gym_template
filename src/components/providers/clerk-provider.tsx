"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ui } from "@clerk/ui";
import type { GymConfig } from "@/config/types";
import { clerkRouting, getClerkAppearance } from "@/lib/clerk/appearance";
import { hasClerk } from "@/lib/env";

type Props = {
  children: React.ReactNode;
  config: GymConfig;
};

export const AppClerkProvider = ({ children, config }: Props) => {
  if (!hasClerk) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      ui={ui}
      prefetchUI={false}
      appearance={getClerkAppearance(config)}
      signInUrl={clerkRouting.signInUrl}
      signUpUrl={clerkRouting.signUpUrl}
      signInFallbackRedirectUrl={clerkRouting.afterSignInUrl}
      signUpFallbackRedirectUrl={clerkRouting.afterSignUpUrl}
    >
      {children}
    </ClerkProvider>
  );
};
