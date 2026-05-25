"use client";

import Image from "next/image";
import { useTheme } from "@/lib/components/ThemeProvider";

export function BrandedAuthLogo() {
  const { logoUrl } = useTheme();
  
  // Use a fallback from the global window variable if theme hasn't loaded yet
  const displayLogo = typeof window !== 'undefined' ? (logoUrl || (window as any).__ROGO_LOGO__) : logoUrl;
  
  if (!displayLogo) return null;

  return (
    <div className="flex items-center">
      <div className="relative h-9 w-[130px]">
        <Image
          src={displayLogo}
          alt="Rogo Logo"
          fill
          className="object-contain object-left"
          priority
        />
      </div>
    </div>
  );
}
