import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isOnboardingRoute = createRouteMatcher(["/onboarding"]);
const isPublicRoute = createRouteMatcher(["/"]);

type SessionClaims = {
  metadata?: {
    onboardingComplete?: boolean;
  };
};
export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  // Allow access to onboarding
  if (userId && isOnboardingRoute(req)) {
    return NextResponse.next();
  }
  const claims = sessionClaims as SessionClaims

  // Redirect to sign-in if not authenticated
  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: "/" });
  }
  const onboardingComplete = claims?.metadata?.onboardingComplete ?? false;
  // Redirect user directly to /onboarding if not completed
  if (userId && onboardingComplete) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
