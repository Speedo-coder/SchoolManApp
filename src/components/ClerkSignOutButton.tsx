"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { FaSignOutAlt } from "react-icons/fa";
import LogoutLoader from "./LogoutLoader";

/**
 * ClerkSignOutButton: Handles Clerk sign-out with professional loader animation
 * When clicked, shows a 10-second countdown loader before signing out
 */
const ClerkSignOutButton = () => {
  const { signOut } = useClerk();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      // Show logout loader for 10 seconds
      setIsLoggingOut(true);

      // Wait 10 seconds before signing out
      await new Promise((resolve) => setTimeout(resolve, 10000));

      // Sign out from Clerk
      await signOut();
      // Redirect to sign-in page
      router.push("/sign-in");
    } catch (error) {
      console.error("Sign-out error:", error);
      // Redirect anyway in case of error
      setIsLoggingOut(false);
      router.push("/sign-in");
    }
  };

  return (
    <>
      {/* Logout Loader Overlay */}
      <LogoutLoader isVisible={isLoggingOut} statusText="Signing you out" />

      {/* Sign Out Button */}
      <button
        onClick={handleSignOut}
        disabled={isLoggingOut}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaSignOutAlt size={16} />
        <span>{isLoggingOut ? "Logging out..." : "Sign Out"}</span>
      </button>
    </>
  );
};

export default ClerkSignOutButton;
