/**
 * MIDDLEWARE: Server-side Authentication Protection with Clerk
 * ============================================================================
 * 
 * IMPORTANT NOTE ON ARCHITECTURE:
 * This middleware runs at the Edge (Vercel CDN) and has limitations:
 * - Cannot reliably connect to database
 * - Cannot use Prisma or other database queries
 * - Cannot use Node.js file system operations
 * - Must be extremely fast (milliseconds)
 * 
 * SOLUTION:
 * Middleware handles ONLY authentication (is user signed in?)
 * Role validation (does user have permission?) happens CLIENT-SIDE in RouteProtector
 * 
 * Why this approach?
 * 1. Middleware fast: Blocks at edge, prevents unauth requests
 * 2. RouteProtector reliable: Has database access, can validate roles
 * 3. No flash: AuthLoadingContext prevents content while checking role
 * 4. Secure: Defense-in-depth (server auth + client role validation)
 * 
 * ============================================================================
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * PUBLIC_ROUTES: Routes accessible without authentication
 * 
 * These routes don't need a signed-in user:
 * - "/" (landing page)
 * - "/sign-in" and "/sign-up" (auth pages)
 * - "/api/webhooks/clerk" (Clerk webhook - must be public)
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk(.*)",
]);

/**
 * PROTECTED_ROUTES: Routes that require authentication
 * 
 * These routes require user to be signed in with Clerk.
 * Role validation (which dashboard can they access) happens in RouteProtector.
 * 
 * Routes:
 * - "/admin(.*)" - Admin dashboard
 * - "/teacher(.*)" - Teacher dashboard
 * - "/student(.*)" - Student dashboard
 * - "/parent(.*)" - Parent dashboard
 * - "/list(.*)" - Data management pages
 * - "/profile(.*)" - User profile pages
 * - "/settings(.*)" - Settings pages
 * - "/logout(.*)" - Logout pages
 */
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/teacher(.*)",
  "/student(.*)",
  "/parent(.*)",
  "/list(.*)",
  "/profile(.*)",
  "/settings(.*)",
  "/logout(.*)",
]);

/**
 * Clerk Middleware Handler
 * ============================================================================
 * 
 * This middleware runs on EVERY request and does ONE simple thing:
 * Enforce authentication on protected routes.
 * 
 * What it does:
 * 1. Check if route is protected
 * 2. If protected AND user not authenticated → redirect to /sign-in
 * 3. If protected AND user authenticated → allow request to continue
 * 4. If public → allow request regardless of auth
 * 
 * What it does NOT do:
 * - Does NOT check user's role
 * - Does NOT query database
 * - Does NOT validate permissions
 * 
 * Why? Because middleware runs at the edge and:
 * - Database connections are unreliable at edge
 * - Prisma queries are too slow at edge
 * - Edge has no persistent storage
 * 
 * Role validation happens in RouteProtector component (client-side)
 * which has full database access and is more reliable.
 * 
 * @param {AuthFn} auth - Clerk authentication object
 *        - Provides methods to check auth status
 *        - NOT a simple object with properties
 *        - Must call auth.protect() to enforce auth
 * 
 * @param {NextRequest} req - The incoming HTTP request
 *        - Has pathname, headers, etc.
 *        - Can be used to check which route was requested
 */
export default clerkMiddleware((auth, req) => {
  // =========================================================================
  // STEP 1: Check if this request is trying to access a protected route
  // =========================================================================
  // createRouteMatcher returns a function that checks the request
  if (isProtectedRoute(req)) {
    // User is trying to access a protected route
    // Enforce authentication using Clerk's built-in method
    auth.protect();

    // =====================================================================
    // NOTE: auth.protect() is asynchronous
    // What it does:
    // 1. Checks if user has valid Clerk session token
    // 2. If valid: allows request to continue (code below doesn't run)
    // 3. If invalid: automatically redirects to /sign-in
    // 4. Never returns (either continues or redirects)
    // =====================================================================

    // If we reach here, user IS authenticated and can continue
    // Role validation will happen in RouteProtector component
  }

  // If route is public, this code doesn't run, request passes through
});

/**
 * MIDDLEWARE CONFIGURATION
 * ============================================================================
 * 
 * The 'matcher' array tells Next.js WHICH requests trigger this middleware.
 * This is important for performance - we only run middleware where needed.
 * 
 * Matchers:
 * 1. "/(admin|teacher|student|parent|list|profile|settings|logout|api)(.*)"
 *    → Run middleware on these routes
 *    → Protects admin/teacher/student/parent dashboards
 *    → Protects /list, /profile, /settings, /logout
 *    → Protects /api endpoints
 * 
 * 2. "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"
 *    → Skip middleware on Next.js internals and static files
 *    → Prevents running middleware on:
 *       - /_next/* (Next.js system files)
 *       - .html, .css, .js, .jpg, .png, .gif, .svg files
 *       - Images, fonts, and other assets
 * 
 * Why skip static files?
 * - Static files are public and don't need auth
 * - Middleware would just slow them down
 * - Better UX with faster asset loading
 */
export const config = {
  matcher: [
    // Run middleware on protected routes and api routes
    "/(admin|teacher|student|parent|list|profile|settings|logout|api)(.*)",
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
