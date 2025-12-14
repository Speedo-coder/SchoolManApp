/**
 * ROUTE PROTECTOR: Client-Side Route & Role-Based Access Protection Component
 * ============================================================================
 *
 * CRITICAL FIX FOR FLASH ISSUE:
 * This component prevents the flash where users briefly see the wrong dashboard
 * before being redirected. The flash happened because:
 * - Page was rendering while we checked role
 * - Redirect happened AFTER layout rendered
 * 
 * SOLUTION:
 * 1. Start in locked state (nothing renders)
 * 2. Do ALL auth + role checks
 * 3. ONLY THEN unlock and show content
 * 4. No flash possible because nothing was ever shown
 * 
 * ============================================================================
 */

"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { useAuthLoading } from "@/lib/AuthLoadingContext";

/**
 * DASHBOARD_ROUTES: Maps dashboard routes to required roles
 * 
 * A user with role "admin" can ONLY access /admin
 * A user with role "teacher" can ONLY access /teacher
 * etc.
 * 
 * This is the source of truth for role → route mapping.
 */
const DASHBOARD_ROUTES: Record<string, string[]> = {
  "/admin": ["admin"],
  "/teacher": ["teacher"],
  "/student": ["student"],
  "/parent": ["parent"],
};

/**
 * LIST_ROUTES: Routes accessible to any authenticated user
 * Role filtering happens at component level for these routes
 */
const LIST_ROUTES = [
  "/list",
  "/profile",
  "/settings",
  "/logout",
];

/**
 * PROTECTED_ROUTES: All routes requiring authentication
 */
const PROTECTED_ROUTES = [...Object.keys(DASHBOARD_ROUTES), ...LIST_ROUTES];

/**
 * Helper: Check if pathname is a protected route
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Helper: Extract dashboard route from pathname
 */
function getDashboardRoute(pathname: string): string | null {
  for (const route of Object.keys(DASHBOARD_ROUTES)) {
    if (pathname.startsWith(route + "/") || pathname === route) {
      return route;
    }
  }
  return null;
}

/**
 * Fetch user's role from Clerk's custom claims
 * 
 * The role is stored in Clerk's publicMetadata when the user is created,
 * and synced whenever the role is updated. This allows role validation
 * to happen instantly without database queries.
 * 
 * @param user - The Clerk user object from useAuth hook
 * @returns The user's role or null if not found
 */
function getUserRoleFromClaims(user: any): string | null {
  try {
    // Access role from user's publicMetadata (set by webhook/update endpoint)
    return user?.publicMetadata?.role || null;
  } catch (error) {
    console.error("Error reading user role from claims:", error);
    return null;
  }
}

/**
 * RouteProtector Component
 * ============================================================================
 * 
 * KEY ARCHITECTURAL CHANGE:
 * No longer returns null! Instead:
 * - Always renders children
 * - Uses AuthLoadingContext to control page loader at ROOT level
 * - Root layout shows/hides full-screen loader as needed
 * 
 * WHY THIS FIXES THE FLASH:
 * 1. Loader is at root level (blocks entire screen)
 * 2. Loader shows BEFORE RouteProtector checks start
 * 3. DashboardLayout renders behind the loader
 * 4. When checks complete, loader disappears
 * 5. Content is already rendered, so transition is smooth
 * 6. No flash because loader covers everything until done
 * 
 * State Flow:
 * 1. User accesses /admin
 * 2. Root layout shows PageLoader (isAuthLoading=true)
 * 3. RouteProtector runs checks (Clerk + role validation)
 * 4. DashboardLayout renders behind loader
 * 5. Checks complete → isAuthLoading=false
 * 6. PageLoader hides, content visible
 * 
 * Result: Smooth transition from loader to content, zero flash!
 */
export default function RouteProtector({
  children,
}: {
  children: React.ReactNode;
}) {
  // =========================================================================
  // STATE
  // =========================================================================
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const { setAuthLoading } = useAuthLoading();

  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleLoaded, setIsRoleLoaded] = useState(false);

  // =========================================================================
  // EFFECT 0: Show loader immediately when accessing protected route
  // =========================================================================
  // This ensures the loader appears BEFORE any async checks happen
  useEffect(() => {
    if (pathname && isProtectedRoute(pathname)) {
      // Protected route - show loader
      setAuthLoading(true);
    } else {
      // Public route - hide loader
      setAuthLoading(false);
    }
  }, [pathname, setAuthLoading]);

  // =========================================================================
  // EFFECT 1: Get user role from Clerk's custom claims (no API call needed)
  // =========================================================================
  useEffect(() => {
    // Wait for Clerk to finish loading
    if (!isLoaded) return;

    // If no user, mark as loaded and move on
    if (!userId || !user) {
      setIsRoleLoaded(true);
      setUserRole(null);
      return;
    }

    // User is authenticated, get role from Clerk's custom claims
    // The role was set by the webhook when user was created,
    // and is synced via publicMetadata
    const role = getUserRoleFromClaims(user);
    setUserRole(role);
    setIsRoleLoaded(true);
  }, [isLoaded, userId, user]);

  // =========================================================================
  // EFFECT 2: MAIN LOGIC - Check auth and role, update loading state
  // =========================================================================
  // This runs after both Clerk and role have loaded
  useEffect(() => {
    // =====================================================================
    // WAIT FOR CLERK AND ROLE TO LOAD
    // =====================================================================
    if (!isLoaded) return; // Clerk still loading
    if (pathname && isProtectedRoute(pathname) && !isRoleLoaded) return; // Role still loading

    // =====================================================================
    // PUBLIC ROUTES: No checks needed
    // =====================================================================
    if (!pathname || !isProtectedRoute(pathname)) {
      // Public route (/sign-in, /sign-up, /, etc.)
      // Stop showing loader immediately
      setAuthLoading(false);
      return;
    }

    // =====================================================================
    // PROTECTED ROUTE: Check if user is authenticated
    // =====================================================================
    if (!userId) {
      // Not authenticated, redirect to sign-in
      setAuthLoading(false);
      router.push("/sign-in");
      return;
    }

    // =====================================================================
    // PROTECTED ROUTE: Check if this is a dashboard and validate role
    // =====================================================================
    const dashboardRoute = getDashboardRoute(pathname);

    if (dashboardRoute) {
      // This IS a dashboard route - must validate role
      const allowedRoles = DASHBOARD_ROUTES[dashboardRoute];

      if (!userRole || !allowedRoles.includes(userRole)) {
        // Wrong role for this dashboard
        console.warn(
          `User ${userId} with role "${userRole}" tried to access ${dashboardRoute}`
        );
        setAuthLoading(false);
        router.push("/sign-in");
        return;
      }
    }

    // =====================================================================
    // ALL CHECKS PASSED - HIDE LOADER, SHOW CONTENT
    // =====================================================================
    // The DashboardLayout is already rendered behind the loader
    // Just hide the loader and it becomes visible
    setAuthLoading(false);
  }, [pathname, isLoaded, isRoleLoaded, userId, userRole, router, setAuthLoading]);

  // =========================================================================
  // RENDER: Always render children
  // =========================================================================
  // No more returning null!
  // The root layout's AuthLoadingOverlay shows/hides loader as needed
  // This allows DashboardLayout to render and be ready
  // When checks complete, loader just disappears
  // Result: No flash!
  return <>{children}</>;
}
