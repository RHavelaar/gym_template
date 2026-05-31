import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/session";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/leaderboards(.*)",
  "/competitions(.*)",
  "/api/webhooks(.*)",
]);

const clerkProtected = clerkMiddleware(async (auth, req) => {
  const supabaseResponse = await updateSession(req);

  if (isPublicRoute(req)) {
    return supabaseResponse;
  }

  const { userId } = await auth();
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return supabaseResponse;
});

export default hasClerk ? clerkProtected : async (req: Parameters<typeof updateSession>[0]) => updateSession(req);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
