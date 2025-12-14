"use client";

import { useEffect, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import LogoutLoader from "./LogoutLoader";

export default function SignOutInterceptor() {
  const { signOut } = useClerk();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [handled, setHandled] = useState(false);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (handled) return;

      const target = e.target as Element | null;
      if (!target) return;

      // Find the nearest interactive element (button, link, or menu item)
      const clickable = (target as Element).closest(
        "button, a, [role=\"menuitem\"], [role=\"menuitemcheckbox\"], [role=\"menuitemradio\"]"
      ) as Element | null;
      if (!clickable) return;

      // Look for contextual roots: menus or dialogs (Clerk confirmation modal uses dialog)
      const menuAncestor = clickable.closest('[role="menu"]');
      const dialogAncestor = clickable.closest('[role="dialog"], dialog');
      if (!menuAncestor && !dialogAncestor) return;

      const rawText = (clickable.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
      const isSignOutText =
        rawText === "sign out" ||
        rawText === "logout" ||
        rawText === "log out" ||
        rawText.startsWith("sign out");

      if (!isSignOutText) return;

      // If this is inside a dialog (confirmation modal), attempt to close the modal
      if (dialogAncestor) {
        try {
          // Prefer explicit close button
          const closeBtn = Array.from(dialogAncestor.querySelectorAll('button')).find((b) => {
            const a = (b.getAttribute('aria-label') || '').toLowerCase();
            const t = (b.textContent || '').toLowerCase();
            const title = (b.getAttribute('title') || '').toLowerCase();
            return a.includes('close') || t.includes('close') || title.includes('close') || a.includes('dismiss') || t.includes('dismiss');
          }) as HTMLElement | undefined;

          if (closeBtn) {
            closeBtn.click();
          } else {
            // Fallback: send Escape to close modal
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
          }
        } catch (err) {
          // ignore any errors closing modal
        }
      }

      if (!isSignOutText) return;

      // Ensure element is visible
      const rect = clickable.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      e.preventDefault();
      e.stopPropagation();

      // Show loader once and perform sign out after delay
      setIsLoggingOut(true);
      setHandled(true);

      // Wait 2s then sign out
      setTimeout(async () => {
        try {
          await signOut({ redirectUrl: "/sign-in" });
        } catch (err) {
          console.error("Sign-out error:", err);
          // fallback: navigate to /sign-in
          window.location.href = "/sign-in";
        }
      }, 2000);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [signOut, handled]);

  // Hide numeric countdown for interceptor-triggered signouts and use 2s duration
  return <LogoutLoader isVisible={isLoggingOut} statusText="Signing you out" countdownSeconds={2} showCountdown={false} />;
}
