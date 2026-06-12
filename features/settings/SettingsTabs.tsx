"use client";

import { cn } from "@/lib/utils/cn";

const TABS = [
  { id: "branding", label: "Branding" },
  { id: "domain", label: "Domain" },
  { id: "email", label: "Email Templates" },
];

export function SettingsTabs({ activeTab, onChange }: { activeTab: string; onChange: (id: string) => void }) {
  return (
    <div className="flex border-b border-border mb-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] whitespace-nowrap">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-6 py-4 text-[14px] font-semibold transition-all relative font-heading shrink-0",
            activeTab === tab.id
              ? "text-primary-300"
              : "text-neutral-500 hover:text-foreground"
          )}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-300" />
          )}
        </button>
      ))}
    </div>
  );
}
