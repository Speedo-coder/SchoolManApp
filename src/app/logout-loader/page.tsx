"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LogoutLoader from "@/components/LogoutLoader";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Wait 2 seconds then redirect home
    const timer = setTimeout(() => {
      router.push("/");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <LogoutLoader isVisible={true} statusText="Signing you out" countdownSeconds={2} />
    </div>
  );
}
