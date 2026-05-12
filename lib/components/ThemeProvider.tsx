"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ThemeContextType {
  primaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  setBranding: (color: string, logo: string, favicon: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [primaryColor, setPrimaryColor] = useState("#fd3566");
  const [logoUrl, setLogoUrl] = useState("/Rogo logo_light.svg");
  const [faviconUrl, setFaviconUrl] = useState("/favicon.ico");

  useEffect(() => {
    const run = async () => {
      await Promise.resolve();
      // Load from localStorage on mount
      const savedColor = localStorage.getItem("rogo-primary-color");
      const savedLogo = localStorage.getItem("rogo-logo-url");
      const savedFavicon = localStorage.getItem("rogo-favicon-url");
      
      if (savedColor) {
        setPrimaryColor(savedColor);
        document.documentElement.style.setProperty("--brand-primary", savedColor);
      }
      if (savedLogo) {
        setLogoUrl(savedLogo);
      }
      if (savedFavicon) {
        setFaviconUrl(savedFavicon);
        // Update real favicon
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (link) link.href = savedFavicon;
      }
    };
    void run();
  }, []);

  const setBranding = (color: string, logo: string, favicon: string) => {
    setPrimaryColor(color);
    setLogoUrl(logo);
    setFaviconUrl(favicon);
    document.documentElement.style.setProperty("--brand-primary", color);
    localStorage.setItem("rogo-primary-color", color);
    localStorage.setItem("rogo-logo-url", logo);
    localStorage.setItem("rogo-favicon-url", favicon);

    // Update real favicon
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) link.href = favicon;
  };

  return (
    <ThemeContext.Provider value={{ primaryColor, logoUrl, faviconUrl, setBranding }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
