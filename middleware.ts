import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isOnboardingRoute = createRouteMatcher(["/onboarding"]);
const isPublicRoute = createRouteMatcher(["/"]);

type SessionClaims = {
  metadata?: {
    onboardingComplete?: boolean;
  };
  created_at?: number; // Timestamp of user account creation
};

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  const claims = sessionClaims as SessionClaims;

  console.log("Session Claims:", claims); // Debugging

  if (!userId) {
    // Redirect unauthenticated users unless on a public route
    if (!isPublicRoute(req)) {
      return redirectToSignIn({ returnBackUrl: "/" });
    }
    return NextResponse.next();
  }

  const onboardingComplete = claims?.metadata?.onboardingComplete ?? false;
  const isNewUser = claims?.created_at ? Date.now() - claims.created_at * 1000 < 60000 : false; // Checks if the account was created in the last 60 seconds

  // Allow users to access onboarding
  if (isOnboardingRoute(req)) {
    return NextResponse.next();
  }

  // New users go to onboarding
  if (isNewUser) {
    return NextResponse.redirect(new URL("/onboarding", req.nextUrl.origin));
  }

  // If onboarding is NOT complete, redirect to onboarding
  if (!onboardingComplete) {
    return NextResponse.redirect(new URL("/onboarding", req.nextUrl.origin));
  }

  // Otherwise, go to dashboard
  return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
