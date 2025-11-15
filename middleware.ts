import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public route patterns (webhook + auth pages + home)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in",
  "/sign-up",
  "/api/webhooks/clerk",
]);

export default clerkMiddleware(async (auth, req) => {
  // If the route is public, skip protection
  if (isPublicRoute(req)) return;

  // Protect all other routes
  await auth.protect();
});

export const config = {
  // Only run middleware for application routes; skip Next internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sw.js).*)"],
};
