"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Menu from "@/components/Menu";
import LogoLink from "@/components/LogoLink";
import DashboardShell from "@/components/DashboardShell";
import PageLoader from "@/components/PageLoader";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * DASHBOARD LAYOUT: Main layout for authenticated dashboard routes
 * ============================================================================
 * 
 * Purpose:
 * This is the root layout for all dashboard pages (/admin, /teacher, /student, /parent).
 * It provides:
 * 1. Sidebar navigation menu
 * 2. Top navbar with responsive drawer menu for mobile
 * 3. Page content area
 * 4. Loading indicator for page transitions
 * 5. Analytics integration
 * 
 * Auth Flow Integration:
 * This layout works with AuthLoadingContext to prevent content flash:
 * - RouteProtector sets isAuthLoading=true while checking auth/role
 * - DashboardLayout checks isAuthLoading and shows PageLoader if true
 * - RouteProtector sets isAuthLoading=false when auth checks complete
 * - DashboardLayout hides PageLoader and shows content
 * 
 * This ensures nothing renders until auth is 100% verified.
 * 
 * ============================================================================
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // =========================================================================
  // STEP 1: Get External State & Hooks
  // =========================================================================
  
  /**
   * Get current pathname for route change detection
   * 
   * Used to:
   * - Know which page user is on
   * - Detect when user navigates to a different page
   * - Reset loading state on navigation
   */
  const pathname = usePathname();

  // =========================================================================
  // STEP 2: Declare Local State Variables
  // =========================================================================

  /**
   * isLoading: Whether we should show the page transition loader
   * 
   * This is separate from isAuthLoading:
   * - isAuthLoading: Auth/role validation in progress
   * - isLoading: Page transition/navigation in progress
   * 
   * When user navigates between pages, we show PageLoader briefly
   * while Next.js fetches and renders the new page.
   */
  const [isLoading, setIsLoading] = useState(false);

  /**
   * lastPath: Tracks which path user was previously on
   * 
   * Purpose:
   * When user navigates to a NEW path:
   * 1. Detect pathname changed (pathname !== lastPath)
   * 2. Start showing PageLoader (setIsLoading(true))
   * 3. Wait briefly for page to load
   * 4. Stop showing PageLoader (setIsLoading(false))
   * 
   * If user is on same path: Don't show loader (unnecessary)
   */
  const [lastPath, setLastPath] = useState<string>("");

  // =========================================================================
  // STEP 3: Effect - Handle Page Navigation Loading
  // =========================================================================
  /**
   * This effect runs when pathname changes (user navigates to new page)
   * 
   * Purpose:
   * Show page transition loader when navigating to different routes
   * Hide loader once new page has rendered
   * 
   * Flow:
   * 1. User clicks menu item to navigate
   * 2. pathname changes
   * 3. This effect runs
   * 4. If new path !== old path: hide loader (page is loading)
   * 5. Update lastPath to current path
   * 6. Next render: loader is hidden, new page content shows
   * 
   * Note:
   * We hide immediately because Next.js App Router is very fast.
   * If you want a longer loader visible, increase the delay or use
   * startTransition hook from React 18.
   */
  useEffect(() => {
    // Check if pathname changed (user navigated to different page)
    if (pathname && pathname !== lastPath) {
      // Hide the page transition loader (new page is ready)
      setIsLoading(false);
      // Update lastPath so we can detect next navigation
      setLastPath(pathname);
    }
  }, [pathname, lastPath]);

  /**
   * handleShowLoader: Called by Menu component when user clicks navigation
   * 
   * Purpose:
   * When user clicks a menu item, we show PageLoader while the new page loads.
   * 
   * Only shows loader if:
   * - User is navigating to a DIFFERENT page (not clicking same page twice)
   * - This is checked in Menu component before calling this
   * 
   * Usage:
   * Menu.tsx calls: onShowLoader() when user clicks navigation
   */
  const handleShowLoader = () => {
    // Only show loader if we're not already on the same page
    // This will be checked in Menu component before calling this
    setIsLoading(true);
  };

  // =========================================================================
  // STEP 4: Render Logic
  // =========================================================================
  /**
   * RENDER DECISION TREE:
   * 
   * 1. If isAuthLoading is true (RouteProtector checking auth):
   *    → Show PageLoader (full screen)
   *    → Hide sidebar/navbar (keep interface clean)
   * 
   * 2. If isAuthLoading is false (auth checks complete):
   *    → Show sidebar (on large screens)
   *    → Show navbar + mobile menu (all screens)
   *    → Show page content OR page transition loader
   *
   * Note: The full-screen auth loader is now handled by AuthLoadingOverlay
   * at the root layout level, so we don't need to check isAuthLoading here.
   */

  // Auth is complete, render the full dashboard layout
  return (
    <div className="flex h-full">
      {/* 
        SIDEBAR SECTION: Left navigation panel
        
        Display:
        - Hidden on small screens (sm, md)
        - Visible on large+ screens (lg, xl)
        
        Purpose:
        - Shows main navigation menu
        - Shows app logo
        - Provides quick access to all dashboard routes
        
        Note:
        When isAuthLoading=true, this doesn't render (see above)
      */}
      <div className="hidden lg:w-[16%] xl:w-[14%] lg:block lg:p-4 bg-white dark:bg-gray-900">
        {/* App Logo/Brand */}
        <LogoLink />
        {/* Main Navigation Menu */}
        {/* 
          onShowLoader: Called when user clicks a menu item
          lastPath: Current page path (used to check if navigating)
        */}
        <Menu onShowLoader={handleShowLoader} lastPath={lastPath} />
      </div>

      {/* 
        DASHBOARD SHELL: Right content area
        
        Contains:
        - Mobile drawer menu (for small screens)
        - Top navbar (all screens)
        - Page content area
        - Loading indicator during navigation
        
        The DashboardShell component handles responsive layout
        and mobile navigation drawer.
        
        Note:
        When isAuthLoading=true, this doesn't render (see above)
      */}
      <DashboardShell onShowLoader={handleShowLoader} lastPath={lastPath}>
        {/* Show page loader overlay during navigation */}
        {isLoading && <PageLoader />}
        
        {/* Show page content when not loading */}
        {!isLoading && children}
      </DashboardShell>

      {/* ANALYTICS: Vercel Analytics integration for performance tracking */}
      <Analytics />
      
      {/* SPEED INSIGHTS: Vercel Speed Insights for web vitals monitoring */}
      <SpeedInsights />
    </div>
  );
}
