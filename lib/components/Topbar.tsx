"use client";

import { Bell, Moon, Sun, Menu, Library } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function Topbar({ 
  onMenuToggle, 
  onTreeToggle,
  showTreeToggle 
}: { 
  onMenuToggle?: () => void; 
  onTreeToggle?: () => void;
  showTreeToggle?: boolean;
}) {
  const { themeMode, toggleTheme } = useTheme();

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-border bg-surface px-4 sm:px-8 transition-colors duration-500">
      <div className="flex items-center gap-2">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden rounded-lg p-2 text-neutral-500 hover:bg-surface-muted hover:text-primary-300 transition-all cursor-pointer"
            title="Toggle Navigation Menu"
          >
            <Menu className="size-[22px] stroke-[1.5px]" />
          </button>
        )}
        
        {showTreeToggle && onTreeToggle && (
          <button
            onClick={onTreeToggle}
            className="lg:hidden rounded-lg p-2 text-neutral-500 hover:bg-surface-muted hover:text-primary-300 transition-all cursor-pointer flex items-center gap-1.5"
            title="Toggle Access Tree"
          >
            <Library className="size-[22px] stroke-[1.5px]" />
            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline text-neutral-400">Access Tree</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="rounded-full p-2.5 text-neutral-400 hover:bg-surface-muted hover:text-primary-300 transition-all duration-300"
            title={themeMode === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {themeMode === "light" ? (
              <Moon className="size-[22px] stroke-[1.5px]" />
            ) : (
              <Sun className="size-[22px] stroke-[1.5px] text-yellow-500 fill-yellow-500/10" />
            )}
          </button>

          <button className="relative rounded-full p-2.5 text-neutral-400 hover:bg-surface-muted hover:text-primary-300 transition-all duration-300">
            <Bell className="size-[22px] stroke-[1.5px]" />
            <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-primary-300 ring-2 ring-white dark:ring-surface" />
          </button>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-200 to-secondary-300 ring-2 ring-white dark:ring-surface">
          <span className="text-[14px] font-bold text-white">JD</span>
        </div>
      </div>
    </header>
  );
}
