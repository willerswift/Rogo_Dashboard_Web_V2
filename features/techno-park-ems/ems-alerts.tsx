"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  BarChart,
  Bar,
  LineChart,
  Line,
  Cell as RechartsCell,
} from "recharts";
import { ALERTS, AlertData } from "./data";
import { Card, Pill, Btn, Icon } from "./ems-ui";
import { cn } from "@/lib/utils/cn";
import { useTheme } from "@/lib/components/ThemeProvider";

const LEVEL_META: Record<
  number,
  { label: string; tone: any; dot: string; cls: string; ring: string }
> = {
  3: {
    label: "Khẩn cấp",
    tone: "bad",
    dot: "🔴",
    cls: "text-red-200 bg-red-100/10 border-red-100/20",
    ring: "ring-red-100",
  },
  2: {
    label: "Cảnh báo",
    tone: "warn",
    dot: "🟡",
    cls: "text-yellow-200 bg-yellow-100/10 border-yellow-100/20",
    ring: "ring-yellow-100",
  },
  1: {
    label: "Thông tin",
    tone: "ok",
    dot: "🟢",
    cls: "text-green-200 bg-green-100/10 border-green-100/20",
    ring: "ring-green-100",
  },
};

const MiniChart = ({ kind }: { kind: string }) => {
  const { themeMode } = useTheme();
  const isDark = themeMode === "dark";

  if (kind === "demand") {
    const data = Array.from({ length: 24 }, (_, h) => {
      const base =
        h >= 9 && h <= 17 ? 1080 + ((h * 47) % 160) : 620 + ((h * 31) % 180);
      return { h: String(h).padStart(2, "0"), v: base };
    });
    return (
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="g-bad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--red-100)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--red-100)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke={isDark ? "rgba(255,255,255,0.08)" : "#E5E9EF"}
            strokeDasharray="2 4"
            vertical={false}
          />
          <XAxis
            dataKey="h"
            tick={{ fontSize: 9, fill: isDark ? "#9CA3AF" : "#64748B" }}
            axisLine={false}
            tickLine={false}
            interval={3}
          />
          <YAxis
            tick={{ fontSize: 9, fill: isDark ? "#9CA3AF" : "#64748B" }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <ReferenceLine
            y={1350}
            stroke="var(--red-200)"
            strokeDasharray="4 3"
            label={{
              value: "Peak EVN 1350",
              position: "insideTopRight",
              fill: "var(--red-200)",
              fontSize: 9,
            }}
          />
          <Area
            type="monotone"
            dataKey="v"
            stroke="var(--red-100)"
            strokeWidth={1.6}
            fill="url(#g-bad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }
  if (kind === "nightload") {
    const data = Array.from({ length: 7 }, (_, i) => ({
      d: `-${6 - i}đ`,
      v: 110 + ((i * 37) % 50) + (i === 5 ? 180 : 0) + (i === 6 ? 160 : 0),
    }));
    return (
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid
            stroke={isDark ? "rgba(255,255,255,0.08)" : "#E5E9EF"}
            strokeDasharray="2 4"
            vertical={false}
          />
          <XAxis
            dataKey="d"
            tick={{ fontSize: 9, fill: isDark ? "#9CA3AF" : "#64748B" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: isDark ? "#9CA3AF" : "#64748B" }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <ReferenceLine y={120} stroke="var(--yellow-100)" strokeDasharray="4 3" />
          <Bar dataKey="v" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <RechartsCell
                key={i}
                fill={d.v > 200 ? "var(--red-100)" : d.v > 120 ? "var(--yellow-100)" : "var(--brand-primary)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }
  if (kind === "cop") {
    const data = Array.from({ length: 12 }, (_, i) => ({
      t: `${i * 2}h`,
      cop: +(3.6 + Math.sin(i / 2) * 0.4 - (i > 6 ? 0.5 : 0)).toFixed(2),
    }));
    return (
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid
            stroke={isDark ? "rgba(255,255,255,0.08)" : "#E5E9EF"}
            strokeDasharray="2 4"
            vertical={false}
          />
          <XAxis
            dataKey="t"
            tick={{ fontSize: 9, fill: isDark ? "#9CA3AF" : "#64748B" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: isDark ? "#9CA3AF" : "#64748B" }}
            axisLine={false}
            tickLine={false}
            width={36}
            domain={[2, 5]}
          />
          <ReferenceLine
            y={3.2}
            stroke="var(--yellow-100)"
            strokeDasharray="4 3"
            label={{
              value: "Ngưỡng 3.2",
              position: "insideRight",
              fill: "var(--yellow-100)",
              fontSize: 9,
            }}
          />
          <Line
            type="monotone"
            dataKey="cop"
            stroke="var(--brand-primary)"
            strokeWidth={1.8}
            dot={{ r: 2, fill: "var(--brand-primary)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }
  // comm
  return (
    <div className="h-[140px] grid grid-cols-12 gap-px p-2 bg-surface-muted rounded">
      {Array.from({ length: 48 }, (_, i) => {
        const off = i % 16 === 7 || i % 16 === 9 || i % 16 === 12;
        return (
          <div
            key={i}
            className={cn(
              "rounded-sm",
              off ? "bg-red-100" : "bg-green-100/50"
            )}
          />
        );
      })}
    </div>
  );
};

const AlertRow = ({
  alert,
  selected,
  onSelect,
  onResolve,
  onIgnore,
}: {
  alert: AlertData;
  selected: boolean;
  onSelect: (id: string) => void;
  onResolve: (id: string) => void;
  onIgnore: (id: string) => void;
}) => {
  const meta = LEVEL_META[alert.level];
  const isClosed = alert.status === "closed";
  return (
    <div
      onClick={() => onSelect(alert.id)}
      className={cn(
        "group px-4 py-3 border-l-2 cursor-pointer transition flex items-start gap-3 transition-all duration-300",
        selected
          ? "bg-primary-300/10 border-primary-300 shadow-sm"
          : isClosed
          ? "border-transparent opacity-60 hover:bg-surface-muted/50"
          : alert.level === 3
          ? "border-red-100 hover:bg-red-100/5"
          : alert.level === 2
          ? "border-yellow-100 hover:bg-yellow-100/5"
          : "border-green-100 hover:bg-green-100/5"
      )}
    >
      <div className="shrink-0 text-base leading-none mt-0.5">{meta.dot}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono text-neutral-500 shrink-0">
            {alert.time}
          </span>
          <span
            className={cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded border",
              meta.cls
            )}
          >
            {meta.label}
          </span>
          {isClosed && <Pill tone="neutral">Đã xử lý</Pill>}
          <span className="text-[10px] font-mono text-neutral-400 ml-auto">
            {alert.id}
          </span>
        </div>
        <div className="text-[13px] font-semibold text-foreground leading-tight">
          {alert.title}
        </div>
        <div className="text-[11px] text-neutral-500 mt-0.5">
          {alert.area} ·{" "}
          <span className="text-neutral-600 font-medium">{alert.value}</span>
        </div>
      </div>
      {!isClosed && (
        <div className="hidden group-hover:flex items-center gap-1 shrink-0 animate-in fade-in slide-in-from-right-2">
          <Btn
            size="sm"
            tone="primary"
            onClick={(e) => {
              e.stopPropagation();
              onResolve(alert.id);
            }}
          >
            Xử lý
          </Btn>
          <Btn
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onIgnore(alert.id);
            }}
          >
            Bỏ qua
          </Btn>
        </div>
      )}
    </div>
  );
};

const AlertDetail = ({
  alert,
  onResolve,
  onIgnore,
}: {
  alert: AlertData | undefined;
  onResolve: (id: string) => void;
  onIgnore: (id: string) => void;
}) => {
  if (!alert) {
    return (
      <div className="h-full grid place-items-center text-center px-6 text-neutral-500 text-[13px]">
        <div>
          <Icon name="bell" className="w-10 h-10 mx-auto text-neutral-300 mb-3" />
          <div className="font-medium text-neutral-600">Chọn một cảnh báo</div>
          <div className="text-[12px] mt-1">
            Chi tiết, biểu đồ và đề xuất SOP sẽ hiển thị tại đây.
          </div>
        </div>
      </div>
    );
  }
  const meta = LEVEL_META[alert.level];
  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className={`px-5 py-4 border-b border-border`}>
        <div className="flex items-center gap-2 mb-2">
          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded border",
              meta.cls
            )}
          >
            Cấp {alert.level} · {meta.label}
          </span>
          <Pill tone={alert.status === "closed" ? "neutral" : "brand"}>
            {alert.status === "closed" ? "Đã xử lý" : "Đang xử lý"}
          </Pill>
          <span className="text-[10px] font-mono text-neutral-500 ml-auto">
            {alert.id}
          </span>
        </div>
        <h3 className="text-[18px] font-bold text-foreground leading-tight">
          {alert.title}
        </h3>
        <div className="flex items-center gap-3 mt-2 text-[12px] text-neutral-500">
          <span className="flex items-center gap-1.5">
            <Icon name="floor" className="w-3.5 h-3.5" />
            {alert.area}
          </span>
          <span>·</span>
          <span className="font-mono">26/05/2026 {alert.time}</span>
          <span>·</span>
          <span>Nguồn: BMS DesigoCC</span>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="p-4 rounded-lg bg-surface-muted border border-border">
          <div className="text-[11px] uppercase tracking-wider text-neutral-500 mb-1">
            Giá trị đo
          </div>
          <div className="text-[22px] font-bold text-foreground font-mono">
            {alert.value}
          </div>
        </div>

        <div>
          <div className="text-[12px] font-semibold text-foreground mb-2">
            Biểu đồ tham chiếu
          </div>
          <div className="p-2 rounded-md border border-border bg-surface">
            <MiniChart kind={alert.chart} />
          </div>
        </div>

        <div>
          <div className="text-[12px] font-semibold text-foreground mb-1.5">
            Mô tả
          </div>
          <p className="text-[12px] text-neutral-600 leading-relaxed">
            {alert.detail}
          </p>
        </div>

        {alert.sop.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Icon name="sop" className="w-3.5 h-3.5 text-primary-300" />
              <span className="text-[12px] font-semibold text-foreground">
                Đề xuất hành động (SOP)
              </span>
            </div>
            <ol className="space-y-1.5">
              {alert.sop.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-[12px] text-neutral-600 p-2 rounded-md hover:bg-surface-muted/50 transition-colors"
                >
                  <span className="shrink-0 w-5 h-5 rounded-full bg-primary-100/20 text-primary-300 grid place-items-center text-[10px] font-bold font-mono border border-primary-300/10">
                    {i + 1}
                  </span>
                  <span className="flex-1">{s}</span>
                  <button className="text-[10px] text-primary-300 hover:underline opacity-0 hover:opacity-100 transition-all">
                    Xong
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Icon name="note" className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-[12px] font-semibold text-foreground">
              Ghi chú xử lý
            </span>
          </div>
          <textarea
            placeholder="Ghi chú cho ca tiếp theo…"
            className="w-full text-[12px] p-3 rounded-md border border-border bg-surface resize-none focus:outline-none focus:ring-1 focus:ring-primary-300 transition-all"
            rows={3}
          />
        </div>

        <div className="text-[11px] text-neutral-500 border-t border-border pt-3 space-y-1">
          <div className="flex justify-between">
            <span>Tạo bởi</span>
            <span className="text-neutral-600 font-medium">Hệ thống BMS (tự động)</span>
          </div>
          <div className="flex justify-between">
            <span>Assignee</span>
            <span className="text-neutral-600 font-medium">Trần Văn Đức</span>
          </div>
          <div className="flex justify-between">
            <span>SLA xử lý</span>
            <span className="text-neutral-600 font-medium">15 phút</span>
          </div>
        </div>

        {alert.status !== "closed" && (
          <div className="flex gap-2 sticky bottom-0 bg-surface pt-2 -mx-5 px-5 border-t border-border transition-colors duration-500">
            <Btn
              tone="primary"
              size="lg"
              className="flex-1 shadow-md"
              onClick={() => onResolve(alert.id)}
            >
              <Icon name="check" className="w-4 h-4" />
              Đã xử lý
            </Btn>
            <Btn size="lg" onClick={() => onIgnore(alert.id)}>
              Bỏ qua
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
};

const FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "3", label: "Cấp 1 — Khẩn cấp" },
  { id: "2", label: "Cấp 2 — Cảnh báo" },
  { id: "1", label: "Cấp 3 — Thông tin" },
  { id: "open", label: "Chưa xử lý" },
  { id: "closed", label: "Đã xử lý" },
];

export const Screen_Alerts = () => {
  const [alerts, setAlerts] = useState(ALERTS);
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(ALERTS[0].id);

  const filtered = alerts.filter((a) => {
    if (filter === "all") return true;
    if (filter === "open") return a.status === "open";
    if (filter === "closed") return a.status === "closed";
    return String(a.level) === filter;
  });
  const selected = filtered.find((a) => a.id === selectedId) || filtered[0];

  const counts = {
    crit: alerts.filter((a) => a.level === 3 && a.status === "open").length,
    warn: alerts.filter((a) => a.level === 2 && a.status === "open").length,
    info: alerts.filter((a) => a.level === 1).length,
  };

  const onResolve = (id: string) =>
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "closed" } : a))
    );
  const onIgnore = (id: string) =>
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "closed" } : a))
    );

  return (
    <div className="p-6 max-w-[1600px] mx-auto transition-colors duration-500">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card className="p-4 border-l-[3px] border-l-red-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500">
              Khẩn cấp
            </span>
            <span>🔴</span>
          </div>
          <div className="text-[28px] font-bold text-red-200 mt-1 leading-none font-mono">
            {counts.crit}
          </div>
        </Card>
        <Card className="p-4 border-l-[3px] border-l-yellow-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500">
              Cảnh báo
            </span>
            <span>🟡</span>
          </div>
          <div className="text-[28px] font-bold text-yellow-200 mt-1 leading-none font-mono">
            {counts.warn}
          </div>
        </Card>
        <Card className="p-4 border-l-[3px] border-l-green-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500">
              Thông tin
            </span>
            <span>🟢</span>
          </div>
          <div className="text-[28px] font-bold text-green-200 mt-1 leading-none font-mono">
            {counts.info}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-surface transition-colors duration-500">
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
            {FILTERS.map((f) => {
              const isActive = filter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "h-8 px-3 rounded-md text-[12px] font-medium whitespace-nowrap transition-all border",
                    isActive
                      ? "bg-foreground text-surface border-foreground shadow-sm"
                      : "text-neutral-600 border-border hover:bg-surface-muted"
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Icon
                name="search"
                className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2"
              />
              <input
                placeholder="Tìm kiếm..."
                className="h-8 pl-8 pr-3 text-[12px] w-56 rounded-md border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary-300 transition-all"
              />
            </div>
            <Btn size="sm">
              <Icon name="filter" className="w-3.5 h-3.5" />
              Lọc
            </Btn>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] min-h-[640px]">
          <div className="divide-y divide-border overflow-y-auto custom-scrollbar max-h-[800px] bg-surface transition-colors duration-500">
            {filtered.map((a) => (
              <AlertRow
                key={a.id}
                alert={a}
                selected={selected && selected.id === a.id}
                onSelect={setSelectedId}
                onResolve={onResolve}
                onIgnore={onIgnore}
              />
            ))}
            {filtered.length === 0 && (
              <div className="p-10 text-center text-[12px] text-neutral-500">
                Không có cảnh báo.
              </div>
            )}
          </div>
          <div className="border-l border-border bg-surface-muted/30 transition-colors duration-500">
            <AlertDetail
              alert={selected}
              onResolve={onResolve}
              onIgnore={onIgnore}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
