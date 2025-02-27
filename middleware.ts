import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isOnboardingRoute = createRouteMatcher(["/onboarding"]);
const isPublicRoute = createRouteMatcher(["/"]);

type SessionClaims = {
  metadata?: {
    onboardingComplete?: boolean;
  };
  created_at?: number;
};

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  const claims = sessionClaims as SessionClaims;

  // console.log("Session Claims:", claims);

  if (!userId) {
    if (!isPublicRoute(req)) {
      return redirectToSignIn({ returnBackUrl: req.nextUrl.pathname }); // Fixes looping redirect
    }
    return NextResponse.next();
  }

  const onboardingComplete = claims?.metadata?.onboardingComplete ?? false;
  const isNewUser = claims?.created_at ? Date.now() - claims.created_at * 1000 < 60000 : false;

  if (isOnboardingRoute(req)) {
    return NextResponse.next();
  }

  if (isNewUser) {
    return NextResponse.redirect(`${req.nextUrl.origin}/onboarding`);
  }

  if (!onboardingComplete) {
    return NextResponse.redirect(`${req.nextUrl.origin}/onboarding`);
  }

  return NextResponse.redirect(`${req.nextUrl.origin}/dashboard`);
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
