"use client";

import { useState } from "react";
import Image from "next/image";
import { Panel, PrimaryButton, SecondaryButton } from "@/features/shared/ui";
import { LogoAssetUpload } from "./LogoAssetUpload";
import { ColorConfigDialog } from "./ColorConfigDialog";
import { cn } from "@/lib/utils/cn";
import { useTheme } from "@/lib/components/ThemeProvider";

export function BrandingTab() {
  const { primaryColor: globalColor, logoUrl: globalLogo, faviconUrl: globalFavicon, setBranding } = useTheme();
  const [logo, setLogo] = useState<File | string>(globalLogo);
  const [favicon, setFavicon] = useState<File | string>(globalFavicon);
  const [primaryColor, setPrimaryColor] = useState(globalColor);
  const [isColorDialogOpen, setIsColorDialogOpen] = useState(false);

  const logoPreview = logo instanceof File ? URL.createObjectURL(logo) : logo;

  const handleSave = () => {
    const finalLogo = logo instanceof File ? URL.createObjectURL(logo) : logo;
    const finalFavicon = favicon instanceof File ? URL.createObjectURL(favicon) : favicon;
    setBranding(primaryColor, finalLogo, finalFavicon);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
      <div className="space-y-8">
        <Panel title="LOGO ASSETS">
          <div className="space-y-6">
            <LogoAssetUpload
              label="Primary Logo"
              description="Recommended size: 400x100px. Used in top navigation and email headers."
              value={logo}
              onChange={setLogo}
            />
            <div className="h-[1px] bg-neutral-100" />
            <LogoAssetUpload
              label="Favicon"
              description="Used in browser tabs. Must be a square PNG or SVG, min32x32px."
              value={favicon}
              onChange={setFavicon}
              accept="image/png, image/svg+xml"
              icon="image"
            />
          </div>
        </Panel>

        <Panel title="BRAND COLORS">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-sm font-bold text-neutral-800">Primary Color</span>
              <p className="text-[13px] text-neutral-500">
                Used for primary buttons, active states, and key visual highlights.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsColorDialogOpen(true)}
                className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white px-4 py-3 transition-all hover:border-primary-200"
              >
                <div 
                  className="h-8 w-8 rounded-lg shadow-sm" 
                  style={{ backgroundColor: primaryColor }} 
                />
                <span className="text-[15px] font-medium text-neutral-700 font-mono tracking-wider">
                  {primaryColor.toUpperCase()}
                </span>
              </button>
              
              <div className="flex gap-2">
                {["#38BDF8", "#4ADE80", "#818CF8", "#FBBF24", "#FD3566"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setPrimaryColor(c)}
                    className={cn(
                      "h-8 w-8 rounded-full border-2 transition-transform hover:scale-110",
                      primaryColor === c ? "border-neutral-800" : "border-transparent"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </Panel>

        <div className="flex justify-end gap-3 pt-4">
          <SecondaryButton onClick={() => {
            const defaultColor = "#FD3566";
            const defaultLogo = "/Rogo logo_light.svg";
            const defaultFavicon = "/favicon.ico";
            setPrimaryColor(defaultColor);
            setLogo(defaultLogo);
            setFavicon(defaultFavicon);
            setBranding(defaultColor, defaultLogo, defaultFavicon);
          }}>
            Reset to default
          </SecondaryButton>
          <PrimaryButton onClick={handleSave}>
            Save Changes
          </PrimaryButton>
        </div>
      </div>

      <div className="space-y-4">
        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Live Preview</span>
        <div className="rounded-2xl border border-neutral-200 bg-[#FFF1F4] p-8 aspect-video flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
          
          <div className="relative w-full max-w-[480px] rounded-xl bg-white shadow-2xl border border-neutral-100 overflow-hidden scale-90 sm:scale-100">
            {/* Mock Dashboard Top Nav */}
            <div className="h-12 border-b border-neutral-50 px-6 flex items-center justify-between">
              <div className="relative h-5 w-24">
                {logoPreview && (
                  <Image src={logoPreview} alt="Logo" fill className="object-contain object-left" />
                )}
              </div>
              <div className="h-6 w-6 rounded-full bg-neutral-100" />
            </div>
            
            {/* Mock Dashboard Body */}
            <div className="p-8 space-y-6 min-h-[200px] flex flex-col justify-end">
              <div className="space-y-3">
                <div className="h-3 w-2/3 bg-neutral-50 rounded" />
                <div className="h-3 w-1/2 bg-neutral-50 rounded" />
              </div>
              <div className="flex justify-center">
                <div 
                  className="h-8 w-32 rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-wider shadow-sm transition-colors"
                  style={{ backgroundColor: primaryColor }}
                >
                  Preview Render
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ColorConfigDialog
        open={isColorDialogOpen}
        onClose={() => setIsColorDialogOpen(false)}
        initialColor={primaryColor}
        onSave={(c) => {
          setPrimaryColor(c);
          setIsColorDialogOpen(false);
        }}
      />
    </div>
  );
}
