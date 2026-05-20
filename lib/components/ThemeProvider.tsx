"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ThemeContextType {
  primaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  themeMode: "light" | "dark";
  setBranding: (color: string, logo: string, favicon: string) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [primaryColor, setPrimaryColor] = useState("#fd3566");
  const [logoUrl, setLogoUrl] = useState("/Rogo logo_light.svg");
  const [faviconUrl, setFaviconUrl] = useState("/web_icon.png");
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Load from localStorage on mount
    const savedColor = localStorage.getItem("rogo-primary-color");
    const savedLogo = localStorage.getItem("rogo-logo-url");
    const savedFavicon = localStorage.getItem("rogo-favicon-url");
    const savedTheme = localStorage.getItem("rogo-theme-mode") as "light" | "dark";
    
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
    if (savedTheme) {
      setThemeMode(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
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

  const toggleTheme = () => {
    const nextTheme = themeMode === "light" ? "dark" : "light";
    setThemeMode(nextTheme);
    localStorage.setItem("rogo-theme-mode", nextTheme);
    
    // Update logo based on theme
    const nextLogo = nextTheme === "dark" ? "/LogoRogo.svg" : "/Rogo logo_light.svg";
    setLogoUrl(nextLogo);
    localStorage.setItem("rogo-logo-url", nextLogo);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <ThemeContext.Provider value={{ primaryColor, logoUrl, faviconUrl, themeMode, setBranding, toggleTheme }}>
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
