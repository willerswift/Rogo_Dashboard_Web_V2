"use client";

import React, { useState, useEffect } from "react";
import { Screen_Dashboard } from "./ems-dashboard";
import { Screen_Heatmap } from "./ems-heatmap";
import { Screen_Alerts } from "./ems-alerts";
import { Screen_Reports } from "./ems-reports";
import { Icon } from "./ems-ui";
import { cn } from "@/lib/utils/cn";
import { useTheme } from "@/lib/components/ThemeProvider";

interface NavItem {
  id: string;
  label: string;
  icon: string;
  group: string;
  badge?: number;
  disabled?: boolean;
}

const NAV: NavItem[] = [
  { id: "dashboard", label: "Tổng quan", icon: "dashboard", group: "Vận hành" },
  { id: "heatmap", label: "Heatmap 45 tầng", icon: "heat", group: "Vận hành" },
  {
    id: "alerts",
    label: "Trung tâm cảnh báo",
    icon: "bell",
    group: "Vận hành",
    badge: 7,
  },
  { id: "reports", label: "KPI & Báo cáo", icon: "chart", group: "Quản trị" },
];
const NAV_SECONDARY: NavItem[] = [
  {
    id: "meters",
    label: "Công tơ điện",
    icon: "bolt",
    group: "Tham chiếu",
    disabled: true,
  },
  {
    id: "floors",
    label: "Sơ đồ tầng",
    icon: "floor",
    group: "Tham chiếu",
    disabled: true,
  },
  {
    id: "tenants",
    label: "Khách thuê",
    icon: "tenant",
    group: "Tham chiếu",
    disabled: true,
  },
  {
    id: "bms",
    label: "Tích hợp BMS",
    icon: "bms",
    group: "Hệ thống",
    disabled: true,
  },
  {
    id: "settings",
    label: "Cấu hình",
    icon: "cog",
    group: "Hệ thống",
    disabled: true,
  },
];

const EmsSidebar = ({
  active,
  onNavigate,
}: {
  active: string;
  onNavigate: (id: string) => void;
}) => {
  const allItems = [...NAV, ...NAV_SECONDARY];
  const groups = Array.from(new Set(allItems.map((i) => i.group)));

  return (
    <aside className="w-[224px] shrink-0 h-screen sticky top-0 bg-surface border-r border-border flex flex-col transition-colors duration-500">
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-3">
        {groups.map((g) => (
          <div key={g} className="mb-2">
            <div className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              {g}
            </div>
            <ul>
              {allItems
                .filter((i) => i.group === g)
                .map((item) => {
                  const isActive = item.id === active;
                  return (
                    <li key={item.id} className="px-2">
                      <button
                        onClick={() => !item.disabled && onNavigate(item.id)}
                        disabled={item.disabled}
                        className={cn(
                          "w-full group flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] relative transition-all duration-300",
                          item.disabled
                            ? "text-neutral-300 cursor-not-allowed"
                            : isActive
                            ? "bg-primary-300/15 text-primary-300 font-semibold shadow-sm"
                            : "text-foreground font-normal hover:bg-surface-muted hover:text-foreground"
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-primary-300" />
                        )}
                        <Icon
                          name={item.icon}
                          className={cn(
                            "w-[18px] h-[18px]",
                            isActive
                              ? "text-primary-300"
                              : item.disabled
                              ? "text-neutral-300"
                              : "text-neutral-400"
                          )}
                        />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100/20 text-red-100 border border-red-100/20">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="m-3 p-3 rounded-lg bg-surface-muted border border-border">
        <div className="flex items-center gap-2 text-[11px] text-neutral-500 mb-1">
          <Icon name="bms" className="w-3.5 h-3.5" />
          <span>BMS Gateway</span>
        </div>
        <div className="text-[12px] font-semibold text-foreground">
          DesigoCC 5.0
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-100 animate-pulse" />{" "}
            Online
          </span>
          <span className="font-mono text-neutral-500">184/187</span>
        </div>
      </div>
    </aside>
  );
};

const EmsHeader = ({
  activeId,
  onRefresh,
}: {
  activeId: string;
  onRefresh: () => void;
}) => {
  const titles: Record<string, { t: string; sub: string }> = {
    dashboard: {
      t: "Dashboard Tổng quan",
      sub: "Ban Lãnh đạo · cập nhật mỗi 5 phút",
    },
    heatmap: { t: "Heatmap 45 tầng & Night Load", sub: "QLVH · Kỹ sư BMS" },
    alerts: { t: "Trung tâm Cảnh báo", sub: "Toàn hệ thống · 187 công tơ" },
    reports: { t: "KPI & Báo cáo", sub: "Ban Lãnh đạo · QLVH" },
  };
  const meta = titles[activeId] || titles.dashboard;

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const fmtTime = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const fmtDate = now.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <header className="h-[80px] shrink-0 bg-surface border-b border-border sticky top-0 z-30 transition-colors duration-500">
      <div className="h-full px-6 flex items-center justify-between gap-6">
        <div className="min-w-0 py-3">
          <div className="flex items-center gap-2 text-[12px] text-neutral-500 mb-0.5">
            <span>Techno Park Tower</span>
            <Icon name="chev" className="w-3 h-3" />
            <span className="text-neutral-600">{meta.t}</span>
          </div>
          <h1 className="text-[22px] font-bold text-foreground leading-tight">
            {meta.t}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 pr-3 border-r border-border">
            <div className="text-right leading-tight">
              <div className="text-[11px] text-neutral-500">{fmtDate}</div>
              <div className="text-[15px] font-semibold text-foreground tabular-nums font-mono">
                {fmtTime}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-green-100/15 border border-green-200/20">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-100 opacity-60 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-200" />
            </span>
            <span className="text-[12px] font-semibold text-green-200">
              Hệ thống Online
            </span>
            <span className="font-mono text-[11px] text-green-200/70">
              184/187
            </span>
          </div>

          <button
            onClick={onRefresh}
            className="h-9 w-9 grid place-items-center rounded-md border border-border hover:bg-surface-muted text-neutral-500 transition-all"
          >
            <Icon name="refresh" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export function TechnoParkEmsPage() {
  const [route, setRoute] = useState("dashboard");
  const [lastSync, setLastSync] = useState(new Date());

  const handleRefresh = () => {
    setLastSync(new Date());
  };

  const screens: Record<string, React.ReactNode> = {
    dashboard: <Screen_Dashboard lastSync={lastSync} />,
    heatmap: <Screen_Heatmap lastSync={lastSync} />,
    alerts: <Screen_Alerts />,
    reports: <Screen_Reports />,
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-500 overflow-hidden">
      <EmsSidebar active={route} onNavigate={setRoute} />
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden border-l border-border">
        <EmsHeader activeId={route} onRefresh={handleRefresh} />
        <main className="flex-1 min-w-0 overflow-y-auto bg-background transition-colors duration-500">
          {screens[route]}
        </main>
      </div>
    </div>
  );
}
