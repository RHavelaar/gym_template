"use client";

import { SignIn, SignUp, UserProfile } from "@clerk/nextjs";
import { clerkRouting } from "@/lib/clerk/appearance";

export const ClerkSignIn = () => (
  <div className="min-h-112 w-full">
    <SignIn
      routing="path"
      path={clerkRouting.signInUrl}
      signUpUrl={clerkRouting.signUpUrl}
      forceRedirectUrl={clerkRouting.afterSignInUrl}
    />
  </div>
);

export const ClerkSignUp = () => (
  <div className="min-h-112 w-full">
    <SignUp
      routing="path"
      path={clerkRouting.signUpUrl}
      signInUrl={clerkRouting.signInUrl}
      forceRedirectUrl={clerkRouting.afterSignUpUrl}
    />
  </div>
);

export const ClerkUserProfile = () => (
  <div className="min-h-112 w-full">
    <UserProfile routing="path" path={clerkRouting.userProfileUrl} />
  </div>
);
