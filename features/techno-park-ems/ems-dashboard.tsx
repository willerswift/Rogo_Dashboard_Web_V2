"use client";

import React from "react";
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
  Cell,
  LabelList,
} from "recharts";
import {
  KPI,
  TREND_30D,
  SYSTEM_USAGE,
  floorConsumption,
  ALERTS,
  KpiData,
} from "./data";
import { Card, CardHeader, Pill, Btn, Icon } from "./ems-ui";
import { useTheme } from "@/lib/components/ThemeProvider";

const DashKpiCard = ({ k }: { k: KpiData }) => {
  const isGood = (k.id === "kwh" && k.delta < 0) || k.status === "ok";
  const arrow = k.delta > 0 ? "▲" : k.delta < 0 ? "▼" : "·";
  
  const deltaTone = isGood
    ? "text-green-200"
    : k.status === "warn"
    ? "text-yellow-200"
    : "text-red-200";

  const accentBar =
    k.status === "ok"
      ? "bg-green-200"
      : k.status === "warn"
      ? "bg-yellow-200"
      : "bg-red-200";

  const pct = Math.min(
    100,
    Math.max(6, k.current && k.target ? (k.current / k.target) * 100 : 50)
  );

  return (
    <Card className="p-4 relative overflow-hidden">
      <div
        className={`absolute top-0 left-0 h-[3px] ${accentBar}`}
        style={{ width: `${pct}%` }}
      />
      <div className="flex items-start justify-between">
        <div className="text-[11px] uppercase tracking-[0.1em] text-neutral-500 font-medium">
          {k.label}
        </div>
        <Pill tone={k.status === "ok" ? "ok" : k.status === "warn" ? "warn" : "bad"} dot>
          {k.status === "ok" ? "Đạt" : k.status === "warn" ? "Chú ý" : "Vượt"}
        </Pill>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-[30px] font-bold text-foreground font-mono">
          {k.value}
        </span>
        {k.unit && (
          <span className="text-[12px] text-neutral-500 font-medium">
            {k.unit}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px]">
        <span className={`flex items-center gap-1 font-semibold ${deltaTone} font-mono`}>
          <span>{arrow}</span>
          {Math.abs(k.delta)}%
        </span>
        <span className="text-neutral-500">{k.deltaLabel}</span>
      </div>
    </Card>
  );
};

const TrendAreaChart = () => {
  const { themeMode } = useTheme();
  const isDark = themeMode === "dark";

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart
        data={TREND_30D}
        margin={{ top: 10, right: 16, left: -8, bottom: 0 }}
      >
        <defs>
          <linearGradient id="grad-cyan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.32} />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={isDark ? "rgba(255,255,255,0.08)" : "#E5E9EF"} strokeDasharray="2 4" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: isDark ? "#9CA3AF" : "#64748B" }}
          axisLine={false}
          tickLine={false}
          interval={3}
        />
        <YAxis
          tick={{ fontSize: 10, fill: isDark ? "#9CA3AF" : "#64748B" }}
          axisLine={false}
          tickLine={false}
          width={50}
          tickFormatter={(v) => v / 1000 + "k"}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E5E9EF",
            background: isDark ? "#14142F" : "#FFFFFF",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
          labelStyle={{ color: isDark ? "#9CA3AF" : "#64748B", fontSize: 11 }}
          itemStyle={{ color: isDark ? "#F1F1F3" : "#0F172A" }}
          formatter={(v: any) => [
            v.toLocaleString("vi-VN") + " kWh",
            "Tiêu thụ",
          ]}
        />
        <ReferenceLine
          y={60000}
          stroke="#F59E0B"
          strokeDasharray="4 4"
          strokeWidth={1}
        />
        <Area
          type="monotone"
          dataKey="kwh"
          stroke="#0891B2"
          strokeWidth={2}
          fill="url(#grad-cyan)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const SystemBarChart = () => {
  const { themeMode } = useTheme();
  const isDark = themeMode === "dark";

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={SYSTEM_USAGE}
        margin={{ top: 16, right: 8, left: -8, bottom: 0 }}
      >
        <CartesianGrid stroke={isDark ? "rgba(255,255,255,0.08)" : "#E5E9EF"} strokeDasharray="2 4" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: isDark ? "#9CA3AF" : "#64748B" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: isDark ? "#9CA3AF" : "#64748B" }}
          axisLine={false}
          tickLine={false}
          width={50}
          tickFormatter={(v) => v / 1000 + "k"}
        />
        <Tooltip
          cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "#F1F5F9" }}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E5E9EF",
            background: isDark ? "#14142F" : "#FFFFFF",
          }}
          labelStyle={{ color: isDark ? "#9CA3AF" : "#64748B" }}
          itemStyle={{ color: isDark ? "#F1F1F3" : "#0F172A" }}
          formatter={(v: any, _: any, p: any) => [
            v.toLocaleString("vi-VN") + " kWh (" + p.payload.pct + "%)",
            "Tiêu thụ",
          ]}
        />
        <Bar dataKey="kwh" radius={[6, 6, 0, 0]} maxBarSize={56}>
          {SYSTEM_USAGE.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
          <LabelList
            dataKey="pct"
            position="top"
            formatter={(v: any) => v + "%"}
            style={{ fontSize: 11, fill: isDark ? "#D1D5DB" : "#475569", fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

const HourlyMiniStrip = () => {
  const { themeMode } = useTheme();
  const isDark = themeMode === "dark";

  // mini "last 24h" — 24 vertical bars
  const data = Array.from({ length: 24 }, (_, h) => {
    const isNight = h >= 22 || h <= 5;
    const isPeak = (h >= 9 && h <= 11) || (h >= 14 && h <= 17);
    const v = isNight
      ? 18 + ((h * 7) % 12)
      : isPeak
      ? 76 + ((h * 13) % 18)
      : 48 + ((h * 11) % 14);
    return { h, v };
  });
  const max = 100;
  return (
    <div className="flex items-end gap-[3px] h-10">
      {data.map((d) => {
        const isPeak = (d.h >= 9 && d.h <= 11) || (d.h >= 14 && d.h <= 17);
        const isNight = (d.h >= 22 || d.h <= 5);
        return (
          <div
            key={d.h}
            className="flex-1 rounded-sm"
            style={{
              height: `${(d.v / max) * 100}%`,
              background: isPeak ? "#F59E0B" : isNight ? (isDark ? "#22D3EE" : "#A5F3FC") : "#0891B2",
              opacity: isPeak ? 0.95 : isNight ? 0.5 : 0.8,
            }}
          />
        );
      })}
    </div>
  );
};

export const Screen_Dashboard = ({ lastSync }: { lastSync: Date }) => {
  const fmtLastSync = lastSync.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });

  return (
    <div className="p-6 space-y-6 max-w-[1480px] mx-auto transition-colors duration-500">
      {/* HERO: 6 KPI cards */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 className="text-[15px] font-semibold text-foreground">
              6 chỉ số chính hôm nay
            </h2>
            <p className="text-[12px] text-neutral-500">
              Số liệu cập nhật {fmtLastSync.slice(0, 5)} · So sánh với {yesterday}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Pill tone="brand" dot>
              Realtime · 5 phút
            </Pill>
            <Btn size="sm">
              <Icon name="download" className="w-3.5 h-3.5" />
              Xuất ảnh
            </Btn>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {KPI.map((k) => (
            <DashKpiCard key={k.id} k={k} />
          ))}
        </div>
      </section>

      {/* CHARTS row */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Area chart 30 ngày */}
        <Card className="xl:col-span-2">
          <CardHeader
            title="Xu hướng tiêu thụ kWh — 30 ngày"
            subtitle="Tổng toàn tòa · đường ngưỡng cảnh báo 60.000 kWh/ngày"
            right={
              <div className="flex items-center gap-1 text-[11px]">
                <button className="h-7 px-2 rounded-md bg-primary-300/10 text-primary-300 font-semibold border border-primary-300/20">
                  30N
                </button>
                <button className="h-7 px-2 rounded-md text-neutral-500 hover:bg-surface-muted">
                  7N
                </button>
                <button className="h-7 px-2 rounded-md text-neutral-500 hover:bg-surface-muted">
                  24H
                </button>
                <button className="h-7 px-2 rounded-md text-neutral-500 hover:bg-surface-muted">
                  YTD
                </button>
              </div>
            }
          />
          <div className="px-4 pb-3">
            <div className="grid grid-cols-3 gap-3 mb-4 text-[11px]">
              <div className="flex items-center justify-between p-2.5 rounded-md bg-surface-muted">
                <span className="text-neutral-500">Trung bình ngày</span>
                <span className="font-semibold text-foreground font-mono">
                  56.214 kWh
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-md bg-surface-muted">
                <span className="text-neutral-500">Đỉnh tháng</span>
                <span className="font-semibold text-red-200 font-mono">
                  63.480 kWh
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-md bg-surface-muted">
                <span className="text-neutral-500">Min tháng</span>
                <span className="font-semibold text-green-200 font-mono">
                  41.230 kWh
                </span>
              </div>
            </div>
            <TrendAreaChart />
          </div>
        </Card>

        {/* Bar chart hệ thống */}
        <Card>
          <CardHeader
            title="Tiêu thụ theo hệ thống"
            subtitle="Hôm nay · 58.420 kWh"
            right={<Pill tone="neutral">5 hệ</Pill>}
          />
          <div className="px-4 pb-3">
            <SystemBarChart />
            <div className="mt-3 space-y-1.5">
              {SYSTEM_USAGE.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between text-[12px]"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ background: s.color }}
                    />
                    <span className="text-neutral-600">{s.name}</span>
                  </span>
                  <span className="font-medium text-foreground font-mono">
                    {s.kwh.toLocaleString("vi-VN")} kWh
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* SECONDARY row: hourly + top floors + alerts preview */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card>
          <CardHeader
            title="Tải 24h gần nhất"
            subtitle="Phân biệt giờ cao điểm · giờ đêm"
          />
          <div className="px-5 pb-5">
            <HourlyMiniStrip />
            <div className="flex items-center justify-between mt-2 text-[10px] text-neutral-500 font-mono">
              <span>00</span>
              <span>06</span>
              <span>12</span>
              <span>18</span>
              <span>24</span>
            </div>
            <div className="flex items-center gap-4 mt-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-neutral-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0891B2] opacity-80" />
                Bình thường
              </span>
              <span className="flex items-center gap-1.5 text-neutral-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]" />
                Giờ cao điểm
              </span>
              <span className="flex items-center gap-1.5 text-neutral-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#A5F3FC] dark:bg-[#22D3EE]" />
                Giờ đêm
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Top 5 tầng tiêu thụ cao" subtitle="Hôm nay · kWh tuyệt đối" />
          <div className="px-4 pb-4 space-y-2">
            {["F12", "F18", "F22", "F09", "F31"].map((id, i) => {
              const c = floorConsumption(id);
              const pct = Math.min(100, (c.kwh / 4280) * 100);
              const tone = c.pctAvg > 150 ? "bad" : c.pctAvg > 110 ? "warn" : "ok";
              const barBg =
                tone === "bad"
                  ? "var(--red-100)"
                  : tone === "warn"
                  ? "var(--yellow-100)"
                  : "var(--brand-primary)";
              return (
                <div key={id} className="group">
                  <div className="flex items-center justify-between text-[12px] mb-1">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 grid place-items-center rounded bg-surface-muted text-[10px] font-bold text-neutral-600 font-mono">
                        {i + 1}
                      </span>
                      <span className="font-medium text-foreground">
                        Tầng {id.slice(1)}
                      </span>
                      {c.pctAvg > 150 && <Pill tone="bad">+{c.pctAvg - 100}%</Pill>}
                    </span>
                    <span className="font-semibold text-foreground font-mono">
                      {c.kwh.toLocaleString("vi-VN")} kWh
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: pct + "%", background: barBg }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Cảnh báo đang mở"
            subtitle="2 khẩn cấp · 3 cảnh báo"
            right={
              <Btn size="sm" tone="ghost">
                Mở Alert Center
                <Icon name="chev" className="w-3 h-3" />
              </Btn>
            }
          />
          <div className="px-4 pb-4 space-y-1.5">
            {ALERTS.filter((a) => a.status === "open")
              .slice(0, 4)
              .map((a) => {
                const dotColor =
                  a.level === 3
                    ? "bg-red-100"
                    : a.level === 2
                    ? "bg-yellow-100"
                    : "bg-green-100";
                return (
                  <div
                    key={a.id}
                    className="flex items-start gap-2.5 p-2 rounded-md hover:bg-surface-muted cursor-pointer transition-colors"
                  >
                    <span
                      className={`mt-1 w-2 h-2 rounded-full ${dotColor} shrink-0`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-medium text-foreground truncate">
                          {a.title}
                        </span>
                        <span className="text-[10px] text-neutral-500 shrink-0 font-mono">
                          {a.time}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        {a.area} · {a.value}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      </section>

      {/* footer info */}
      <div className="flex items-center justify-between text-[11px] text-neutral-500 px-1">
        <div className="flex items-center gap-3">
          <span>Đồng bộ BMS: {fmtLastSync}</span>
          <span>·</span>
          <span>
            Nguồn:{" "}
            <span className="font-mono text-neutral-600">[API: /api/meters/realtime]</span>
          </span>
        </div>
        <div>Baseline IPMVP chính thức sẽ áp dụng từ GĐ2 (Q1/2027)</div>
      </div>
    </div>
  );
};
