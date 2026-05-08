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
    <aside className="flex h-screen w-[180px] flex-col border-r border-neutral-200 bg-white shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
      <div className="flex h-[72px] items-center px-4">
        <div className="flex items-center gap-2">
          <Image src="/LogoRogo.svg" alt="Rogo" width={85} height={24} className="h-auto w-auto" />
          <div className="text-[9px] font-bold leading-tight text-neutral-400 uppercase tracking-tighter">
            Partner<br/>Admin
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon as keyof typeof ICONS] || LayoutDashboard;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-all",
                isActive
                  ? "bg-[#E6E8F4] text-[#393984]"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              <Icon className={cn("mr-3 size-[18px]", isActive ? "text-[#393984]" : "text-neutral-400 group-hover:text-neutral-600")} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-neutral-100 p-3">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center rounded-lg px-3 py-2.5 text-[13px] font-semibold text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="mr-3 size-[18px] text-red-500" />
          Logout
        </button>
      </div>
    </aside>
  );
}
