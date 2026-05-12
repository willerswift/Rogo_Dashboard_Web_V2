"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserCircle, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils/cn";
import { NAV_ITEMS } from "@/lib/config/navigation";
import { logout } from "@/lib/api/auth";
import { useTheme } from "./ThemeProvider";

const ICONS = {
  Overview: LayoutDashboard,
  Users: Users,
  Account: UserCircle,
  Settings: Settings,
};

export function NavSidebar() {
  const pathname = usePathname();
  const { logoUrl, faviconUrl } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <aside 
      className={cn(
        "relative flex h-screen flex-col border-r border-neutral-200 bg-white shadow-[2px_0_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out px-4 py-6",
        isCollapsed ? "w-[80px]" : "w-[240px]"
      )}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 z-50 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-900 shadow-sm transition-transform hover:scale-110"
      >
        {isCollapsed ? (
          <div className="flex items-center">
            <div className="h-3 w-[1.5px] bg-neutral-900 mr-[1px]" />
            <ChevronRight className="size-3" />
          </div>
        ) : (
          <div className="flex items-center">
            <ChevronLeft className="size-3" />
            <div className="h-3 w-[1.5px] bg-neutral-900 ml-[1px]" />
          </div>
        )}
      </button>

      <div className={cn("flex items-center mb-10 transition-all", isCollapsed ? "px-0 justify-center" : "px-2")}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={cn("relative h-8 shrink-0 transition-all", isCollapsed ? "w-8" : "w-[110px]")}>
            <Image 
              src={isCollapsed ? faviconUrl : logoUrl} 
              alt="Rogo" 
              fill 
              className="object-contain object-left" 
              priority 
            />
          </div>
          {!isCollapsed && (
            <>
              <div className="h-8 w-[1px] bg-neutral-200 mx-1" />
              <div className="text-[10px] font-bold leading-tight text-neutral-400 uppercase tracking-wider whitespace-nowrap">
                Partner<br/>Admin
              </div>
            </>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon as keyof typeof ICONS] || LayoutDashboard;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.title : undefined}
              className={cn(
                "group relative flex items-center transition-all overflow-hidden font-sans rounded-lg",
                isCollapsed ? "justify-center px-0 py-3" : "px-3 py-2",
                isActive
                  ? "bg-[#E6E8F4] text-[#393984] font-semibold"
                  : "text-neutral-900 font-normal hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              <Icon className={cn("size-[22px] shrink-0", isCollapsed ? "" : "mr-3", isActive ? "text-[#393984]" : "text-neutral-900 stroke-[1.5px]")} />
              {!isCollapsed && <span className="truncate whitespace-nowrap text-[14px] leading-[21px] font-heading">{item.title}</span>}
              {isActive && (
                <div className="absolute right-0 top-0 h-full w-[3px] rounded-l-full bg-[#393984]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className={cn("mt-auto pt-6 border-t border-neutral-100 transition-all", isCollapsed ? "px-0" : "")}>
        <button 
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
          className={cn(
            "flex h-10 w-full items-center rounded-lg text-red-500 hover:bg-red-50 transition-colors font-sans",
            isCollapsed ? "justify-center px-0" : "px-3"
          )}
        >
          <LogOut className={cn("size-[20px] text-red-500", isCollapsed ? "" : "mr-3")} />
          {!isCollapsed && <span className="text-[14px] font-medium font-heading">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
