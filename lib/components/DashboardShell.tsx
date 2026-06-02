"use client";

import { type ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { NavSidebar } from "@/lib/components/NavSidebar";
import { AccessTreeSidebar } from "@/lib/components/AccessTreeSidebar";
import { Topbar } from "@/lib/components/Topbar";

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileTreeOpen, setIsMobileTreeOpen] = useState(false);
  
  // Tree sidebar only shows on Overview and Users & Permissions tabs based on BA spec
  const showAccessTree = pathname.startsWith("/overview") || pathname.startsWith("/users");

  // Close sidebars on route changes
  useEffect(() => {
    setIsMobileNavOpen(false);
    setIsMobileTreeOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden transition-colors duration-500 relative">
      {/* --- DESKTOP VIEW FLOW --- */}
      {/* 1. Primary Navigation Sidebar */}
      <NavSidebar className="hidden md:flex shrink-0" />

      {/* 2. Access Tree Sidebar (Conditional) */}
      {showAccessTree && <AccessTreeSidebar className="hidden lg:flex shrink-0" />}

      {/* --- MOBILE DRAWERS --- */}
      {/* Mobile Nav Sidebar Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileNavOpen(false)}
          />
          {/* Drawer body */}
          <div className="relative flex flex-col w-[260px] max-w-[85vw] h-full bg-surface shadow-2xl animate-in slide-in-from-left duration-300">
            <NavSidebar className="w-full h-full border-r-0" />
          </div>
        </div>
      )}

      {/* Mobile Access Tree Sidebar Drawer */}
      {showAccessTree && isMobileTreeOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileTreeOpen(false)}
          />
          {/* Drawer body */}
          <div className="relative flex flex-col w-[280px] max-w-[85vw] h-full bg-surface shadow-2xl animate-in slide-in-from-left duration-300">
            <AccessTreeSidebar className="w-full h-full border-r-0" />
          </div>
        </div>
      )}

      {/* 3. Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Topbar 
          onMenuToggle={() => setIsMobileNavOpen(true)}
          onTreeToggle={() => setIsMobileTreeOpen(true)}
          showTreeToggle={showAccessTree}
        />
        <main className="flex flex-col flex-1 items-start self-stretch pt-6 px-4 sm:px-8 pb-[56.83px] overflow-y-auto w-full animate-fade-in">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
