"use client";

import { Bell, ChevronDown, UserCircle } from "lucide-react";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";

export function Topbar() {
  const { session } = usePartnerContext();

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-neutral-100 bg-white px-8">
      <div className="flex items-center gap-2">
        <div className="flex h-[42px] items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-2 hover:bg-neutral-50 cursor-pointer transition-all shadow-sm">
          <span className="text-[13px] font-bold text-neutral-900">Partner: {session.activePartnerId || "Rogo"}</span>
          <ChevronDown className="size-4 text-neutral-400" />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative rounded-full p-2 text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-colors">
          <Bell className="size-[22px] stroke-[1.5px]" />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#fd3566] ring-2 ring-white" />
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 overflow-hidden shadow-sm">
          <img 
            src="https://avatar.vercel.sh/admin" 
            alt="Admin" 
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
