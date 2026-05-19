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
  const [isHovered, setIsHovered] = useState(false);
  
  // Sidebar is collapsed by default, expands when hovered
  const isCollapsed = !isHovered;

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative flex h-screen flex-col border-r border-neutral-200 bg-white shadow-[2px_0_8px_rgba(0,0,0,0.02)] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] px-4 py-6 z-[100]",
        isCollapsed ? "w-[80px]" : "w-[260px]"
      )}
    >
      <div className={cn("flex items-center mb-10 transition-all duration-500", isCollapsed ? "px-0 justify-center" : "pl-3")}>
        <div className={cn("flex items-center overflow-hidden", isCollapsed ? "gap-0" : "gap-3")}>
          <div className={cn("relative h-8 shrink-0 transition-all duration-500", isCollapsed ? "w-8" : "w-[120px]")}>
            <Image 
              src={isCollapsed ? faviconUrl : logoUrl} 
              alt="Rogo" 
              fill 
              className={cn("object-contain transition-all duration-500", isCollapsed ? "scale-100" : "")} 
              style={{ objectPosition: isCollapsed ? 'center' : 'left' }}
              priority 
            />
          </div>
          <div className={cn("flex items-center gap-3 transition-all duration-500", isCollapsed ? "opacity-0 w-0 translate-x-10" : "opacity-100 w-auto translate-x-0")}>
            <div className="h-8 w-[1px] bg-neutral-200 mx-1" />
            <div className="text-[10px] font-bold leading-tight text-neutral-400 uppercase tracking-wider whitespace-nowrap">
              Partner<br/>Admin
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon as keyof typeof ICONS] || LayoutDashboard;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center transition-all duration-500 overflow-hidden font-sans rounded-lg",
                isCollapsed ? "justify-center px-0 py-3" : "px-3 py-2",
                isActive
                  ? "bg-primary-300/10 text-primary-300 font-semibold"
                  : "text-neutral-900 font-normal hover:bg-neutral-50 hover:text-neutral-900"
                )}
                >
                <Icon className={cn("size-[22px] shrink-0 transition-all duration-500", isCollapsed ? "mx-0" : "mr-3", isActive ? "text-primary-300" : "text-neutral-900 stroke-[1.5px]")} />
                <span className={cn(
                  "truncate whitespace-nowrap text-[14px] leading-[21px] font-sans transition-all duration-500",
                  isCollapsed ? "opacity-0 w-0 -translate-x-4" : "opacity-100 w-auto translate-x-0"
                )}>
                  {item.title}
                </span>
                {isActive && (
                  <div className="absolute right-0 top-0 h-full w-[3px] rounded-l-full bg-primary-300" />
                )}
            </Link>
          );
        })}
      </nav>

      <div className={cn("mt-auto pt-6 border-t border-neutral-100 transition-all duration-500", isCollapsed ? "px-0" : "")}>
        <button 
          onClick={handleLogout}
          className={cn(
            "flex h-10 w-full items-center rounded-lg text-red-500 hover:bg-red-50 transition-all duration-500 font-sans",
            isCollapsed ? "justify-center px-0" : "px-3"
          )}
        >
          <LogOut className={cn("size-[20px] text-red-500 shrink-0 transition-all duration-500", isCollapsed ? "" : "mr-3")} />
          <span className={cn(
            "text-[14px] font-medium font-sans transition-all duration-500 truncate whitespace-nowrap",
            isCollapsed ? "opacity-0 w-0 -translate-x-4" : "opacity-100 w-auto translate-x-0"
          )}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
