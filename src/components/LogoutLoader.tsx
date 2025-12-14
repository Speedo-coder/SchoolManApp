/**
 * LOGOUT LOADER: Professional Animated Logout Screen
 *
 * A captivating animated loader specifically for logout/sign-out process
 * Shows a countdown timer and professional message while signing out.
 *
 * Features:
 * - Full-screen professional loader
 * - Countdown timer display
 * - Animated status text
 * - Smooth animations
 * - Dark mode support
 */

import { useEffect, useState } from "react";

interface LogoutLoaderProps {
  isVisible: boolean;
  statusText?: string;
  countdownSeconds?: number;
  // When false, the numeric countdown and "seconds" label are hidden
  showCountdown?: boolean;
}

export default function LogoutLoader({
  isVisible,
  statusText = "Signing you out",
  countdownSeconds = 3.5,
  showCountdown = true,
}: LogoutLoaderProps) {
  const [countdown, setCountdown] = useState(countdownSeconds);

  useEffect(() => {
    if (!isVisible) {
      setCountdown(countdownSeconds);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, countdownSeconds]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-black dark:via-slate-900 dark:to-black">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-500/10 rounded-full filter blur-3xl animate-pulse" />
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full filter blur-3xl"
          style={{
            animation: "float 6s ease-in-out infinite",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-6">
        {/* ANIMATED LOGOUT ICON */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer rotating circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#logoutGradient1)"
              strokeWidth="2"
              strokeDasharray="282 282"
              strokeLinecap="round"
              style={{
                animation: "spin 4s linear infinite",
              }}
            />

            {/* Inner rotating circle (counter) */}
            <circle
              cx="50"
              cy="50"
              r="32"
              fill="none"
              stroke="url(#logoutGradient2)"
              strokeWidth="1.5"
              strokeDasharray="201 201"
              strokeLinecap="round"
              style={{
                animation: "spin-reverse 5s linear infinite",
              }}
            />

            {/* Logout door icon */}
            <g transform="translate(50, 50)">
              {/* Door frame */}
              <rect
                x="-12"
                y="-14"
                width="18"
                height="28"
                fill="none"
                stroke="url(#logoutGradient1)"
                strokeWidth="1.5"
                rx="2"
              />
              {/* Door */}
              <rect
                x="-10"
                y="-12"
                width="14"
                height="24"
                fill="none"
                stroke="url(#logoutGradient2)"
                strokeWidth="1.5"
                rx="1.5"
                style={{
                  animation: "doorOpen 2s ease-in-out infinite",
                  transformOrigin: "-10px 0",
                }}
              />
              {/* Door handle */}
              <circle cx="3" cy="0" r="1.5" fill="url(#logoutGradient1)" />
              {/* Exit arrow */}
              <g
                style={{
                  animation: "slideOut 2s ease-in-out infinite",
                }}
              >
                <line
                  x1="0"
                  y1="-20"
                  x2="0"
                  y2="-28"
                  stroke="url(#logoutGradient1)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <polyline
                  points="-3,-25 0,-28 3,-25"
                  fill="none"
                  stroke="url(#logoutGradient1)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </g>

            {/* GRADIENTS */}
            <defs>
              <linearGradient
                id="logoutGradient1"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
              <linearGradient
                id="logoutGradient2"
                x1="100%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* STATUS TEXT */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {statusText}
          </h2>
          <p className="text-sm sm:text-base text-gray-300">
            Securely ending your session...
          </p>
        </div>

        {/* COUNTDOWN TIMER */}
        <div className="relative w-32 h-32">
          {/* Circular progress */}
          <svg className="w-full h-full" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="3"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="url(#countdownGradient)"
              strokeWidth="3"
              strokeDasharray={`${(countdown / countdownSeconds) * 314} 314`}
              strokeDashoffset="0"
              strokeLinecap="round"
              style={{
                transform: "rotate(-90deg)",
                transformOrigin: "60px 60px",
                transition: "stroke-dasharray 1s linear",
              }}
            />
            <defs>
              <linearGradient
                id="countdownGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Countdown number (conditionally rendered) */}
          {showCountdown && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  {countdown}
                </div>
                <p className="text-xs text-gray-400 mt-1">seconds</p>
              </div>
            </div>
          )}
        </div>

        {/* ANIMATED STATUS DOTS */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">Processing</span>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"
                style={{
                  animation: `pulse 1.4s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* SECURITY MESSAGE */}
        <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
          <p className="text-xs text-gray-400 text-center">
            🔒 Your session is being securely terminated
          </p>
        </div>
      </div>

      {/* CSS ANIMATIONS */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes doorOpen {
          0% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(90deg);
          }
          100% {
            transform: rotateY(0deg);
          }
        }

        @keyframes slideOut {
          0%,
          100% {
            transform: translateY(0px);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translate(-50%, -50%) translateY(0px);
          }
          50% {
            transform: translate(-50%, -50%) translateY(-20px);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}