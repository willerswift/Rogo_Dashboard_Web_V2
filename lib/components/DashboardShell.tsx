"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { NavSidebar } from "@/lib/components/NavSidebar";
import { AccessTreeSidebar } from "@/lib/components/AccessTreeSidebar";
import { Topbar } from "@/lib/components/Topbar";

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Tree sidebar only shows on Overview and Users & Permissions tabs based on BA spec
  const showAccessTree = pathname.startsWith("/overview") || pathname.startsWith("/users");

  return (
    <div className="flex h-screen w-full bg-[#F9F9F9] overflow-hidden">
      {/* 1. Primary Navigation Sidebar */}
      <NavSidebar />

      {/* 2. Access Tree Sidebar (Conditional) */}
      {showAccessTree && <AccessTreeSidebar />}

      {/* 3. Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex flex-col flex-1 items-start self-stretch pt-8 px-8 pb-[56.83px] overflow-y-auto w-full">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
