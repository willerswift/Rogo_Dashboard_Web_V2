"use client";

import { useState } from "react";
import { SettingsTabs } from "@/features/settings/SettingsTabs";
import { BrandingTab } from "@/features/settings/BrandingTab";
import { PermissionGate } from "@/lib/components/PermissionGate";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("branding");

  return (
    <PermissionGate action="projectMgmt:*">
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-[32px] font-bold text-secondary-500">Settings</h1>
          <p className="text-[14px] text-neutral-500">
            Manage your organization&apos;s preferences, branding, and security configurations.
          </p>
        </header>

        <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />
        
        {activeTab === "branding" && <BrandingTab />}
        
        {activeTab === "domain" && (
          <div className="py-20 text-center text-neutral-400">
            Domain settings coming soon.
          </div>
        )}
        
        {activeTab === "email" && (
          <div className="py-20 text-center text-neutral-400">
            Email template settings coming soon.
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
