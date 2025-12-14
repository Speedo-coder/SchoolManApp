/**
 * AUTHENTICATION LOADING CONTEXT
 * ============================================================================
 * 
 * Purpose:
 * This context manages the authentication and role validation loading state
 * across the entire application. It prevents content from rendering until
 * the user has been fully authenticated and their role has been validated.
 * 
 * Problem Solved:
 * Without this context, content would flash briefly while auth checks are
 * happening in the background. By centralizing the loading state, we ensure
 * nothing renders until auth is 100% complete.
 * 
 * How It Works:
 * 1. RouteProtector sets isAuthLoading=true when checking auth/role
 * 2. DashboardLayout reads isAuthLoading and shows loader if true
 * 3. RouteProtector sets isAuthLoading=false when auth/role checks complete
 * 4. DashboardLayout hides loader and shows content once isAuthLoading=false
 * 
 * ============================================================================
 */

"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

/**
 * AuthLoadingContextType: Shape of the authentication loading context
 * 
 * Fields:
 * - isAuthLoading: Boolean flag indicating if auth/role checks are in progress
 *   * true = Auth is being verified, don't show content yet
 *   * false = Auth is complete, safe to show content
 * 
 * Methods:
 * - setAuthLoading: Update the loading state (called by RouteProtector)
 */
interface AuthLoadingContextType {
  isAuthLoading: boolean;
  setAuthLoading: (loading: boolean) => void;
}

/**
 * Create the context with undefined as default
 * Using undefined as default helps detect if context is used outside provider
 */
const AuthLoadingContext = createContext<AuthLoadingContextType | undefined>(
  undefined
);

/**
 * AuthLoadingProvider: Context Provider Component
 * 
 * Wraps the entire application (in layout.tsx) to provide auth loading state
 * to all child components.
 * 
 * Initial State:
 * - isAuthLoading: true (start in loading state until auth completes)
 * - This ensures nothing renders before auth is verified
 * 
 * Usage:
 * Wrap your app layout with <AuthLoadingProvider>
 * 
 * Example:
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <AuthLoadingProvider>
 *           <RouteProtector>
 *             {children}
 *           </RouteProtector>
 *         </AuthLoadingProvider>
 *       </body>
 *     </html>
 *   )
 * }
 */
export function AuthLoadingProvider({ children }: { children: ReactNode }) {
  // Start in loading state (true) so nothing renders before auth completes
  const [isAuthLoading, setAuthLoading] = useState(true);

  const value: AuthLoadingContextType = {
    isAuthLoading,
    setAuthLoading,
  };

  return (
    <AuthLoadingContext.Provider value={value}>
      {children}
    </AuthLoadingContext.Provider>
  );
}

/**
 * useAuthLoading Hook
 * 
 * Custom hook to access the authentication loading context.
 * 
 * Returns:
 * - isAuthLoading: Boolean indicating if auth checks are in progress
 * - setAuthLoading: Function to update the loading state
 * 
 * Throws:
 * - Error if used outside AuthLoadingProvider (helpful for debugging)
 * 
 * Usage:
 * const { isAuthLoading, setAuthLoading } = useAuthLoading();
 * 
 * Example:
 * // In RouteProtector:
 * const { setAuthLoading } = useAuthLoading();
 * useEffect(() => {
 *   // ... auth checks ...
 *   setAuthLoading(false); // Signal auth is complete
 * }, []);
 * 
 * // In DashboardLayout:
 * const { isAuthLoading } = useAuthLoading();
 * if (isAuthLoading) return <PageLoader />;
 */
export function useAuthLoading() {
  const context = useContext(AuthLoadingContext);
  if (context === undefined) {
    throw new Error("useAuthLoading must be used within AuthLoadingProvider");
  }
  return context;
}
