"use client";

import { useAuthLoading } from "@/lib/AuthLoadingContext";
import PageLoader from "@/components/PageLoader";

/**
 * AuthLoadingOverlay: Shows PageLoader during auth checks
 * 
 * This is a client component that reads AuthLoadingContext
 * and shows a full-screen PageLoader when isAuthLoading=true.
 * 
 * This must be a separate component because it uses useAuthLoading hook
 * which requires being inside AuthLoadingProvider.
 */
export default function AuthLoadingOverlay() {
  const { isAuthLoading } = useAuthLoading();
  
  // Only show loader while auth checking
  if (!isAuthLoading) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900">
      <PageLoader />
    </div>
  );
}
