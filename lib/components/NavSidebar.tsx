"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserCircle, Settings, LogOut } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils/cn";
import { NAV_ITEMS } from "@/lib/config/navigation";
import { logout } from "@/lib/api/auth";

const ICONS = {
  Overview: LayoutDashboard,
  Users: Users,
  Account: UserCircle,
  Settings: Settings,
};

export function NavSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <aside className="flex h-screen w-[240px] flex-col border-r border-neutral-200 bg-white shadow-[2px_0_8px_rgba(0,0,0,0.02)] p-6">
      <div className="flex items-center mb-10">
        <div className="flex items-center gap-3">
          <Image src="/Rogo logo_light.svg" alt="Rogo" width={110} height={32} className="h-auto w-auto" />
          <div className="h-8 w-[1px] bg-neutral-200 mx-1" />
          <div className="text-[10px] font-bold leading-tight text-neutral-400 uppercase tracking-wider">
            Partner<br/>Admin
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon as keyof typeof ICONS] || LayoutDashboard;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center rounded-xl px-4 py-2.5 text-[13px] font-bold transition-all overflow-hidden whitespace-nowrap",
                isActive
                  ? "bg-[#E6E8F4] text-[#393984]"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              <Icon className={cn("mr-3.5 size-[18px] shrink-0", isActive ? "text-[#393984]" : "text-neutral-400 group-hover:text-neutral-600")} />
              <span>{item.title}</span>
              {isActive && (
                <div className="absolute right-0 top-0 h-full w-1 rounded-l-full bg-[#393984]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-neutral-100">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center rounded-xl px-4 py-3 text-[14px] font-bold text-red-500 hover:bg-red-50 transition-colors whitespace-nowrap"
        >
          <LogOut className="mr-4 size-[20px] text-red-500" />
          Logout
        </button>
      </div>
    </aside>
  );
}
