// Lightweight client-side auth helper for the demo app.
// This module provides a tiny API to persist a demo authentication state
// (role + authenticated flag) in localStorage so UI components (Menu, Login)
// can determine whether the user is "signed in" and route accordingly.
//
// Important: This is intentionally simple for the demo. In a real app you
// should use secure HttpOnly cookies or a proper auth solution (NextAuth,
// Passport, JWT with refresh tokens, server-side sessions, etc.).

export const AUTH_KEY = "sma_auth";

export type DemoAuth = {
  // user's role string (admin|teacher|student|parent)
  role?: string;
  // whether the user is considered authenticated in this demo
  authenticated: boolean;
};

// return the current auth state from localStorage (synchronous)
export function getAuth(): DemoAuth {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(AUTH_KEY) : null;
    if (!raw) return { authenticated: false };
    return JSON.parse(raw) as DemoAuth;
  } catch (err) {
    // if parsing fails, fall back to unauthenticated
    return { authenticated: false };
  }
}

// Persist an authenticated role in localStorage. This is used by the demo
// login flow to remember who is signed in across page refreshes.
export function setAuth(role: string) {
  const payload: DemoAuth = { role, authenticated: true };
  try {
    // Persist demo auth state
    window.localStorage.setItem(AUTH_KEY, JSON.stringify(payload));

    // Signal that auth changed so UI can react (Navbar, Menu, etc.)
    window.dispatchEvent(new Event("sma_auth_change"));

    // Also set a short-lived flag that tells the UI to show a sign-in
    // page loader the next time a protected layout renders. This allows
    // us to show a brief professional "Signing in" animation for a
    // smoother perceived transition after sign-in.
    try {
      window.localStorage.setItem("sma_show_signin_loader", "1");
      // Notify in-window listeners so the SignInLoader shows immediately
      try {
        window.dispatchEvent(new Event("sma_show_signin"));
      } catch (e) {
        // ignore
      }
    } catch (err) {
      // ignore failures setting the flag
    }
  } catch (err) {
    // noop - localStorage failures should not crash the UI in the demo
  }
}

// Clear demo auth (used for logout)
export function clearAuth() {
  try {
    window.localStorage.removeItem(AUTH_KEY);
    window.dispatchEvent(new Event("sma_auth_change"));
  } catch (err) {
    // noop
  }
}

// Convenience helpers
export function isAuthenticated(): boolean {
  return getAuth().authenticated === true;
}

export function getRole(): string | null {
  return getAuth().role ?? null;
}
