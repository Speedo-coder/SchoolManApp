"use client";
import { useEffect, useState } from "react";

export default function SignInLoader({ durationMs = 3000 }: { durationMs?: number }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timer: number | undefined;

    function showOnce() {
      setIsVisible(true);
      timer = window.setTimeout(() => {
        setIsVisible(false);
        try {
          window.localStorage.removeItem("sma_show_signin_loader");
        } catch (e) {
          // ignore
        }
      }, durationMs);
    }

    try {
      const flag = typeof window !== "undefined" ? window.localStorage.getItem("sma_show_signin_loader") : null;
      if (flag === "1") {
        showOnce();
      }
    } catch (err) {
      // ignore localStorage failures
    }

    // Also listen for a custom event so same-window writes trigger the loader
    const handler = () => showOnce();
    window.addEventListener("sma_show_signin", handler);

    return () => {
      window.removeEventListener("sma_show_signin", handler);
      if (timer) clearTimeout(timer);
    };
  }, [durationMs]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/30 overflow-hidden">
      {/* Animated background blur elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-500/10 rounded-full filter blur-3xl animate-pulse" />
      </div>

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Animated spinner SVG */}
        <div className="relative w-20 h-20">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background circle */}
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" className="text-slate-200 dark:text-slate-700" />

            {/* Animated gradient circle */}
            <defs>
              <linearGradient id="signin-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="url(#signin-gradient)"
              strokeWidth="2"
              strokeDasharray="141 282"
              strokeLinecap="round"
              className="animate-spin"
              style={{ animationDuration: "3s" }}
            />
          </svg>
        </div>

        {/* Status text */}
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-50">
            Signing you in
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Securely authenticating your credentials
          </p>
        </div>

        {/* Subtle progress indicator */}
        <div className="mt-2 w-24 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
            style={{
              animation: "pulse 3s ease-in-out infinite",
              width: "100%",
            }}
          />
        </div>
      </div>
    </div>
  );
}
