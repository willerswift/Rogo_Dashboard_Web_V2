"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ThemeContextType {
  primaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  themeMode: "light" | "dark";
  setBranding: (partnerId: string | null, color: string, logo: string, favicon: string) => void;
  loadBrandingForPartner: (partnerId: string) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_COLOR = "#fd3566";
const DEFAULT_LOGO_LIGHT = "/Rogo logo_light.svg";
const DEFAULT_LOGO_DARK = "/LogoRogo.svg";
const DEFAULT_FAVICON = "/web_icon.png";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_COLOR);
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO_LIGHT);
  const [faviconUrl, setFaviconUrl] = useState(DEFAULT_FAVICON);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");

  const loadBrandingForPartner = (partnerId: string) => {
    const savedColor = localStorage.getItem(`rogo-primary-color-${partnerId}`) || localStorage.getItem("rogo-primary-color");
    const savedLogo = localStorage.getItem(`rogo-logo-url-${partnerId}`) || localStorage.getItem("rogo-logo-url");
    const savedFavicon = localStorage.getItem(`rogo-favicon-url-${partnerId}`) || localStorage.getItem("rogo-favicon-url");
    const savedTheme = localStorage.getItem("rogo-theme-mode") as "light" | "dark" | null;

    const currentTheme = savedTheme || "light";

    if (savedColor) {
      setPrimaryColor(savedColor);
      document.documentElement.style.setProperty("--brand-primary", savedColor);
    } else {
      setPrimaryColor(DEFAULT_COLOR);
      document.documentElement.style.setProperty("--brand-primary", DEFAULT_COLOR);
    }

    if (savedLogo) {
      setLogoUrl(savedLogo);
    } else {
      setLogoUrl(currentTheme === "dark" ? DEFAULT_LOGO_DARK : DEFAULT_LOGO_LIGHT);
    }

    if (savedFavicon) {
      setFaviconUrl(savedFavicon);
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) link.href = savedFavicon;
    } else {
      setFaviconUrl(DEFAULT_FAVICON);
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) link.href = DEFAULT_FAVICON;
    }

    if (currentTheme) {
      setThemeMode(currentTheme);
      if (currentTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  useEffect(() => {
    // Initial global load (will be overridden by PartnerSync if a partner is active)
    const savedTheme = localStorage.getItem("rogo-theme-mode") as "light" | "dark";
    if (savedTheme) {
      setThemeMode(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  const setBranding = (partnerId: string | null, color: string, logo: string, favicon: string) => {
    setPrimaryColor(color);
    setLogoUrl(logo);
    setFaviconUrl(favicon);
    document.documentElement.style.setProperty("--brand-primary", color);
    
    if (partnerId) {
      localStorage.setItem(`rogo-primary-color-${partnerId}`, color);
      localStorage.setItem(`rogo-logo-url-${partnerId}`, logo);
      localStorage.setItem(`rogo-favicon-url-${partnerId}`, favicon);
    } else {
      localStorage.setItem("rogo-primary-color", color);
      localStorage.setItem("rogo-logo-url", logo);
      localStorage.setItem("rogo-favicon-url", favicon);
    }

    // Update real favicon
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) link.href = favicon;
  };

  const toggleTheme = () => {
    const nextTheme = themeMode === "light" ? "dark" : "light";
    setThemeMode(nextTheme);
    localStorage.setItem("rogo-theme-mode", nextTheme);
    
    // Update logo based on theme (fallback if no partner specific logo is set)
    // Here we should ideally check if a partner logo exists, but for simplicity we rely on the saved URL if it exists.
    // To properly handle theme toggle for custom logos, we might need a dark-mode variant logo.
    // For now, if they haven't set a custom logo, we toggle it.
    if (logoUrl === DEFAULT_LOGO_LIGHT || logoUrl === DEFAULT_LOGO_DARK) {
      const nextLogo = nextTheme === "dark" ? DEFAULT_LOGO_DARK : DEFAULT_LOGO_LIGHT;
      setLogoUrl(nextLogo);
    }

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <ThemeContext.Provider value={{ primaryColor, logoUrl, faviconUrl, themeMode, setBranding, loadBrandingForPartner, toggleTheme }}>
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
