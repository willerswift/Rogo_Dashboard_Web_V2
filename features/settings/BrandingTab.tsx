"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Panel, PrimaryButton, SecondaryButton } from "@/features/shared/ui";
import { LogoAssetUpload } from "./LogoAssetUpload";
import { ColorConfigDialog } from "./ColorConfigDialog";
import { cn } from "@/lib/utils/cn";
import { useTheme } from "@/lib/components/ThemeProvider";
import { extractColorsFromLogo, fileToBase64 } from "@/lib/utils/colors";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";

export function BrandingTab() {
  const { primaryColor: globalColor, logoUrl: globalLogo, faviconUrl: globalFavicon, setBranding } = useTheme();
  const { session } = usePartnerContext();
  const partnerId = session.activePartnerId;

  const [logo, setLogo] = useState<File | string>(globalLogo);
  const [favicon, setFavicon] = useState<File | string>(globalFavicon);
  const [primaryColor, setPrimaryColor] = useState(globalColor);
  const [isColorDialogOpen, setIsColorDialogOpen] = useState(false);
  const [recommendedColors, setRecommendedColors] = useState<string[]>([
    "#38BDF8", "#4ADE80", "#818CF8", "#FBBF24", "#FD3566"
  ]);

  const [logoPreview, setLogoPreview] = useState<string>(typeof globalLogo === "string" ? globalLogo : "");

  // Handle Logo Preview and Object URL Cleanup
  useEffect(() => {
    if (logo instanceof File) {
      const url = URL.createObjectURL(logo);
      const timer = setTimeout(() => {
        setLogoPreview(url);
      }, 0);
      return () => {
        clearTimeout(timer);
        URL.revokeObjectURL(url);
      };
    } else {
      const timer = setTimeout(() => {
        setLogoPreview(logo);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [logo]);

  // Sync local state with global state when it loads (e.g. from localStorage)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPrimaryColor(globalColor);
    }, 0);
    return () => clearTimeout(timer);
  }, [globalColor]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLogo(globalLogo);
    }, 0);
    return () => clearTimeout(timer);
  }, [globalLogo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFavicon(globalFavicon);
    }, 0);
    return () => clearTimeout(timer);
  }, [globalFavicon]);

  // Extract colors from logo whenever it changes
  useEffect(() => {
    if (logoPreview) {
      extractColorsFromLogo(logoPreview).then(colors => {
        if (colors.length > 0) {
          setRecommendedColors(colors);
        }
      });
    }
  }, [logoPreview]);

  const handleSave = async () => {
    const finalLogo = logo instanceof File ? await fileToBase64(logo) : logo;
    const finalFavicon = favicon instanceof File ? await fileToBase64(favicon) : favicon;
    setBranding(partnerId, primaryColor, finalLogo, finalFavicon);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
      <div className="space-y-8">
        <Panel title="LOGO ASSETS">
          <div className="px-6 py-4 space-y-6">
            <LogoAssetUpload
              label="Primary Logo"
              description="Recommended size: 400x100px. Used in top navigation and email headers."
              value={logo}
              onChange={setLogo}
            />
            <div className="h-[1px] bg-border" />
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
          <div className="px-6 py-4 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-neutral-800">Primary Color</h3>
              <p className="text-[13px] text-neutral-500">
                Used for primary buttons, active states, and key visual highlights.
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2 h-[56px] w-fit focus-within:border-primary-200 transition-all group">
                  <div 
                    className="h-10 w-10 rounded-lg shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95" 
                    style={{ backgroundColor: primaryColor }}
                    onClick={() => setIsColorDialogOpen(true)}
                    title="Open Color Picker"
                  />
                  <input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-[85px] text-[15px] font-medium text-neutral-700 font-mono tracking-wider outline-none bg-transparent"
                    placeholder="#000000"
                  />
                </div>
                
                <div className="flex gap-4">
                  {recommendedColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setPrimaryColor(c)}
                      className={cn(
                        "flex flex-col items-center gap-2 group transition-transform hover:scale-105",
                        primaryColor.toUpperCase() === c.toUpperCase() ? "scale-105" : ""
                      )}
                    >
                      <div 
                        className={cn(
                          "h-10 w-10 rounded-full border-2 transition-colors",
                          primaryColor.toUpperCase() === c.toUpperCase() ? "border-neutral-800" : "border-neutral-100"
                        )}
                        style={{ backgroundColor: c }}
                      />
                      <span className="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-600 uppercase tracking-wider">{c}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <div className="flex justify-end gap-3 pt-4">
          <SecondaryButton onClick={() => {
            const defaultColor = "#FD3566";
            const defaultLogo = "/Rogo logo_light.svg";
            const defaultFavicon = "/web_icon.png";
            setPrimaryColor(defaultColor);
            setLogo(defaultLogo);
            setFavicon(defaultFavicon);
            setBranding(partnerId, defaultColor, defaultLogo, defaultFavicon);
          }}>
            Reset to default
          </SecondaryButton>
          <PrimaryButton onClick={handleSave}>
            Save Changes
          </PrimaryButton>
        </div>
      </div>

      <div className="space-y-4">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Live Preview</span>
        <div className="rounded-2xl border border-border bg-primary-300/10 p-8 aspect-video flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-surface/20 backdrop-blur-[2px]" />
          
          <div className="relative w-full max-w-[480px] rounded-xl bg-surface border border-border overflow-hidden scale-90 sm:scale-100">
            {/* Mock Dashboard Top Nav */}
            <div className="h-12 border-b border-border/50 px-6 flex items-center justify-between">
              <div className="relative h-5 w-24">
                {logoPreview && (
                  <Image src={logoPreview} alt="Logo" fill className="object-contain object-left" />
                )}
              </div>
              <div className="h-6 w-6 rounded-full bg-border" />
            </div>
            
            {/* Mock Dashboard Body */}
            <div className="p-8 space-y-6 min-h-[200px] flex flex-col justify-end">
              <div className="space-y-3">
                <div className="h-3 w-2/3 bg-surface-muted rounded" />
                <div className="h-3 w-1/2 bg-surface-muted rounded" />
              </div>
              <div className="flex justify-center">
                <div 
                  className="h-8 w-32 rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-wider transition-colors"
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
        logoUrl={logoPreview}
        recommendedColors={recommendedColors}
        onSave={(c) => {
          setPrimaryColor(c);
          setIsColorDialogOpen(false);
        }}
      />
    </div>
  );
}
