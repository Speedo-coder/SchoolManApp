"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import MobileMenuDrawer from "@/components/MobileMenuDrawer";
import Navbar from "@/components/Navbar";

interface DashboardShellProps {
  children: React.ReactNode;
  onShowLoader?: () => void;
  lastPath?: string;
}

const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
  onShowLoader,
  lastPath = "",
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <MobileMenuDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onShowLoader={onShowLoader}
        lastPath={lastPath}
      />
      <div className="flex-1 flex flex-col h-full w-full">
        <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
        {/* Content area wrapper - scrollable on mobile/tablet, flex-1 on desktop */}
        <div className="flex-1 relative overflow-y-auto min-h-0 pb-24 lg:pb-0">
          {children}
          
          {/* Copyright footer - scrollable on desktop (lg+), fixed on mobile */}
          <div className="static bottom-0 left-0 right-0 lg:bottom-auto lg:left-auto lg:right-auto h-12 lg:h-auto flex flex-col items-center justify-center gap-0 px-4 py-1 lg:py-3 text-center pointer-events-none bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
              &copy; {new Date().getFullYear()} Smart Schooling Management. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight">
              Developed by Patrick U. Nnodu
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        :global(html) {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        :global(html::-webkit-scrollbar) {
          display: none;
        }
        :global(body) {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        :global(body::-webkit-scrollbar) {
          display: none;
        }
        :global(.overflow-y-auto::-webkit-scrollbar) {
          display: none;
        }
      `}</style>
    </>
  );
};

export default DashboardShell;
