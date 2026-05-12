"use client";

import { cn } from "@/lib/utils/cn";

const TABS = [
  { id: "branding", label: "Branding" },
  { id: "domain", label: "Domain" },
  { id: "email", label: "Email Templates" },
];

export function SettingsTabs({ activeTab, onChange }: { activeTab: string; onChange: (id: string) => void }) {
  return (
    <div className="flex border-b border-neutral-200 mb-8">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-6 py-4 text-[16px] font-semibold transition-all relative font-heading",
            activeTab === tab.id
              ? "text-primary-300"
              : "text-neutral-500 hover:text-neutral-700"
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
