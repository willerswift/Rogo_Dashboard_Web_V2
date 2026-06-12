"use client";

import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import { KPI, CROSS_RANKING, EPI_12M, REPORTS_SENT, KpiData } from "./data";
import { Card, CardHeader, Pill, Btn, Icon, TabBar } from "./ems-ui";
import { cn } from "@/lib/utils/cn";
import { useTheme } from "@/lib/components/ThemeProvider";

const Gauge = ({
  value,
  target,
  status,
  suffix = "",
}: {
  value: number;
  target: number;
  status: string;
  suffix?: string;
}) => {
  const { themeMode } = useTheme();
  const isDark = themeMode === "dark";
  const pct = Math.min(100, Math.max(0, (value / target) * 100));
  const r = 36;
  const c = 2 * Math.PI * r;
  const arc = (pct / 100) * c * 0.75; // 3/4 arc
  
  const color =
    status === "ok"
      ? "var(--green-200)"
      : status === "warn"
      ? "var(--yellow-200)"
      : "var(--red-200)";
      
  return (
    <div className="relative w-[120px] h-[80px]">
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <path
          d="M 12 70 A 36 36 0 1 1 108 70"
          stroke={isDark ? "rgba(255,255,255,0.08)" : "#E5E9EF"}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 12 70 A 36 36 0 1 1 108 70"
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - arc}
          pathLength={c}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-1.5">
        <span className="text-[20px] font-bold text-foreground leading-none font-mono">
          {value}
          {suffix}
        </span>
        <span className="text-[10px] text-neutral-500 mt-0.5">
          / {target}
          {suffix}
        </span>
      </div>
    </div>
  );
};

const KpiGaugeCard = ({ k }: { k: KpiData }) => {
  const tone = k.status === "ok" ? "ok" : k.status === "warn" ? "warn" : "bad";
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-neutral-500">
            {k.label}
          </div>
          <div className="text-[12px] text-neutral-600 mt-0.5">
            Mục tiêu: {k.target}
          </div>
        </div>
        <Pill tone={tone} dot>
          {k.status === "ok" ? "Đạt" : k.status === "warn" ? "Chú ý" : "Vượt"}
        </Pill>
      </div>
      <div className="flex items-end justify-between">
        <Gauge
          value={k.current}
          target={k.target}
          status={k.status}
          suffix={k.suffix}
        />
        <div className="text-right">
          <div className="text-[28px] font-bold text-foreground leading-none font-mono">
            {k.value}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">{k.unit}</div>
          <div
            className={cn(
              "text-[11px] font-semibold mt-2 font-mono",
              k.delta > 0 ? "text-red-200" : "text-green-200"
            )}
          >
            {k.delta > 0 ? "▲" : "▼"} {Math.abs(k.delta)}%
          </div>
        </div>
      </div>
    </Card>
  );
};

const EpiChart = () => {
  const { themeMode } = useTheme();
  const isDark = themeMode === "dark";

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart
        data={EPI_12M}
        margin={{ top: 16, right: 24, left: 0, bottom: 0 }}
      >
        <CartesianGrid stroke={isDark ? "rgba(255,255,255,0.08)" : "#E5E9EF"} strokeDasharray="2 4" vertical={false} />
        <XAxis
          dataKey="m"
          tick={{ fontSize: 11, fill: isDark ? "#9CA3AF" : "#64748B" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: isDark ? "#9CA3AF" : "#64748B" }}
          axisLine={false}
          tickLine={false}
          domain={[130, 170]}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E5E9EF",
            background: isDark ? "#14142F" : "#FFFFFF",
          }}
          labelStyle={{ color: isDark ? "#9CA3AF" : "#64748B" }}
          itemStyle={{ color: isDark ? "#F1F1F3" : "#0F172A" }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: isDark ? "#D1D5DB" : "#475569" }} />
        <ReferenceLine
          y={150}
          stroke="#F59E0B"
          strokeDasharray="6 4"
          label={{
            value: "LOTUS 150",
            position: "right",
            fill: "#F59E0B",
            fontSize: 11,
            fontWeight: 600,
          }}
        />
        <Line
          type="monotone"
          dataKey="actual"
          name="EPI thực tế"
          stroke="#0891B2"
          strokeWidth={2.4}
          dot={{ r: 3, fill: "#0891B2" }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="target"
          name="LOTUS Benchmark"
          stroke="#F59E0B"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const KpiTab = () => (
  <div className="p-5 space-y-5">
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {KPI.map((k) => (
        <KpiGaugeCard key={k.id} k={k} />
      ))}
    </div>

    <Card>
      <CardHeader
        title="Xu hướng EPI 12 tháng"
        subtitle="kWh / m² / năm · LOTUS benchmark 150"
        right={
          <div className="flex items-center gap-2">
            <Btn size="sm">
              <Icon name="download" className="w-3.5 h-3.5" />
              PNG
            </Btn>
          </div>
        }
      />
      <div className="px-4 pb-5">
        <EpiChart />
      </div>
    </Card>

    <div className="flex items-start gap-3 p-4 rounded-lg bg-primary-100/10 border border-primary-300/10 text-[12px] text-primary-300">
      <Icon name="info" className="w-4 h-4 mt-0.5 shrink-0" />
      <div>
        <div className="font-semibold mb-1">Lưu ý phương pháp luận</div>
        <p className="opacity-90 leading-relaxed">
          Baseline IPMVP chính thức sẽ có từ <strong>GĐ2 (Q1/2027)</strong>. 
          Số liệu hiện tại sử dụng baseline ước lượng dựa trên dữ liệu BMS 12 tháng gần nhất.
        </p>
      </div>
    </div>
  </div>
);

const RankingTab = () => {
  const [sortBy, setSortBy] = useState("kwhPerM2");
  const sorted = [...CROSS_RANKING].sort((a: any, b: any) => b[sortBy] - a[sortBy]);
  const top5 = sorted.slice(-5).map((r) => r.floor);
  const bottom5 = sorted.slice(0, 5).map((r) => r.floor);

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-md bg-surface-muted border border-border">
          {[
            { id: "kwhPerM2", l: "kWh / m² / tháng" },
            { id: "kwhPerPax", l: "kWh / người / tháng" },
            { id: "nightKwh", l: "Night Load kWh/đêm" },
          ].map((o) => (
            <button
              key={o.id}
              onClick={() => setSortBy(o.id)}
              className={cn(
                "h-8 px-3 rounded text-[12px] font-medium transition-all",
                sortBy === o.id
                  ? "bg-surface shadow-sm text-foreground"
                  : "text-neutral-500 hover:text-foreground"
              )}
            >
              {o.l}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Btn size="sm">
            <Icon name="download" className="w-3.5 h-3.5" />
            CSV
          </Btn>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left bg-surface-muted/50 text-[11px] uppercase tracking-wider text-neutral-500 border-b border-border">
                <th className="px-4 py-3 font-semibold w-16">#</th>
                <th className="px-4 py-3 font-semibold">Tầng</th>
                <th className="px-4 py-3 font-semibold">Loại sử dụng</th>
                <th className="px-3 py-3 font-semibold text-right">kWh/m²</th>
                <th className="px-3 py-3 font-semibold text-right">kWh/pax</th>
                <th className="px-3 py-3 font-semibold text-right">Night Load</th>
                <th className="px-3 py-3 font-semibold text-center">Trạng thái</th>
                <th className="px-3 py-3 font-semibold w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map((r, idx) => {
                const isTop = top5.includes(r.floor);
                const isBottom = bottom5.includes(r.floor);
                return (
                  <tr
                    key={r.floor}
                    className={cn(
                      "hover:bg-surface-muted/30 transition-colors",
                      isBottom ? "bg-red-100/5" : isTop ? "bg-green-100/5" : ""
                    )}
                  >
                    <td className="px-4 py-2.5 font-mono text-neutral-400">{idx + 1}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 grid place-items-center rounded font-mono text-[11px] font-bold bg-surface-muted text-neutral-600">
                          {r.floor}
                        </span>
                        <span className="font-medium text-foreground">{r.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-neutral-600">{r.kind}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold text-foreground">{r.kwhPerM2}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-neutral-500">{r.kwhPerPax ?? "—"}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-neutral-500">{r.nightKwh}</td>
                    <td className="px-3 py-2.5 text-center">
                      {isBottom && <Pill tone="bad">Bottom 5</Pill>}
                      {isTop && <Pill tone="ok">Top 5</Pill>}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button className="text-[11px] text-primary-300 hover:underline">Chi tiết</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const ReportsTab = () => {
  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-foreground">Báo cáo đã gửi</h3>
        <Btn size="sm">Lọc</Btn>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-left bg-surface-muted/50 text-[11px] uppercase tracking-wider text-neutral-500 border-b border-border">
              <th className="px-4 py-3 font-semibold">Tên báo cáo</th>
              <th className="px-4 py-3 font-semibold">Kỳ</th>
              <th className="px-4 py-3 font-semibold">Ngày gửi</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3 font-semibold w-32"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {REPORTS_SENT.map((r, i) => (
              <tr key={i} className="hover:bg-surface-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Icon name="report" className="w-4 h-4 text-primary-300" />
                    <span className="font-medium text-foreground">{r.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-neutral-500">{r.period}</td>
                <td className="px-4 py-3 font-mono text-neutral-500">{r.sentAt}</td>
                <td className="px-4 py-3">
                  <Pill tone={r.status === "sent" ? "ok" : "warn"} dot>
                    {r.status === "sent" ? "Đã gửi" : "Đang chờ"}
                  </Pill>
                </td>
                <td className="px-4 py-3">
                  {r.status === "sent" && (
                    <Btn size="sm">PDF</Btn>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export const Screen_Reports = () => {
  const [tab, setTab] = useState("kpi");
  const REPORT_TABS = [
    { id: "kpi", label: "KPI Dashboard" },
    { id: "ranking", label: "Cross-floor Ranking", badge: 48 },
    { id: "reports", label: "Báo cáo Tự động", badge: 3 },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto transition-colors duration-500">
      <Card className="overflow-hidden">
        <TabBar tabs={REPORT_TABS} active={tab} onChange={setTab} />
        {tab === "kpi" && <KpiTab />}
        {tab === "ranking" && <RankingTab />}
        {tab === "reports" && <ReportsTab />}
      </Card>
    </div>
  );
};
