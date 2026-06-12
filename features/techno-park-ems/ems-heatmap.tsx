"use client";

import React, { useState } from "react";
import {
  floorConsumption,
  nightLoadCell,
} from "./data";
import { Card, CardHeader, Pill, Btn, Icon } from "./ems-ui";
import { cn } from "@/lib/utils/cn";
import { useTheme } from "@/lib/components/ThemeProvider";

const HEATMAP_ORDER = (() => {
  const items = [];
  for (let i = 45; i >= 1; i--) items.push(`F${i}`);
  items.push("B1", "B2", "B3");
  return items;
})();

function pctToHeatColor(pct: number) {
  if (pct < 60) return { bg: "#10B981", fg: "#fff" }; // ok deep
  if (pct < 90) return { bg: "#86EFAC", fg: "#065F46" }; // ok
  if (pct < 110) return { bg: "#FDE68A", fg: "#92400E" }; // warn
  if (pct < 140) return { bg: "#FB923C", fg: "#7C2D12" }; // hot
  if (pct < 170) return { bg: "#EF4444", fg: "#fff" }; // very hot
  return { bg: "#B91C1C", fg: "#fff" }; // critical
}

function nightCellColor(v: number, isDark: boolean) {
  if (v < 50) return isDark ? "#1E3A8A" : "#DBEAFE";
  if (v < 90) return isDark ? "#1D4ED8" : "#93C5FD";
  if (v < 120) return isDark ? "#92400E" : "#FBBF24";
  if (v < 160) return isDark ? "#9A3412" : "#F97316";
  return isDark ? "#991B1B" : "#DC2626";
}

const HeatmapCell = ({
  floorId,
  onClick,
  selected,
}: {
  floorId: string;
  onClick: (id: string) => void;
  selected: boolean;
}) => {
  const c = floorConsumption(floorId);
  const isBasement = floorId.startsWith("B");
  const isTopFloor = floorId === "F1";
  const color = pctToHeatColor(c.pctAvg);
  const num = isBasement ? floorId : floorId.slice(1);
  return (
    <button
      onClick={() => onClick(floorId)}
      className={cn(
        "relative aspect-[5/3] rounded-md transition-all p-2 flex flex-col items-start justify-between text-left",
        selected
          ? "ring-2 ring-foreground ring-offset-2 bg-surface z-10"
          : "hover:ring-2 hover:ring-neutral-400 hover:ring-offset-1"
      )}
      style={{ background: color.bg, color: color.fg }}
      title={`${floorId} · ${c.kwh.toLocaleString("vi-VN")} kWh · ${
        c.pctAvg
      }% trung bình`}
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-[11px] font-bold font-mono">{num}</span>
        {c.pctAvg > 150 && <span className="text-[9px] leading-none">▲</span>}
        {c.pctAvg < 50 && <span className="text-[9px] leading-none">▼</span>}
        {isTopFloor && (
          <span className="text-[8px] font-semibold uppercase opacity-80">
            TMDV
          </span>
        )}
      </div>
      <div>
        <div className="text-[11px] font-semibold leading-none font-mono">
          {c.pctAvg}%
        </div>
        <div className="text-[9px] leading-tight opacity-80 font-mono">
          {(c.kwh / 1000).toFixed(1)}k kWh
        </div>
      </div>
    </button>
  );
};

const HeatmapLegend = () => {
  const stops = [
    { c: "#10B981", l: "<60%" },
    { c: "#86EFAC", l: "60-90%" },
    { c: "#FDE68A", l: "90-110%" },
    { c: "#FB923C", l: "110-140%" },
    { c: "#EF4444", l: "140-170%" },
    { c: "#B91C1C", l: ">170%" },
  ];
  return (
    <div className="flex items-center gap-3 text-[10px] text-neutral-500">
      <span className="font-medium text-neutral-600">Thấp</span>
      <div className="flex gap-px rounded overflow-hidden">
        {stops.map((s, i) => (
          <div
            key={i}
            className="w-6 h-3"
            style={{ background: s.c }}
            title={s.l}
          />
        ))}
      </div>
      <span className="font-medium text-neutral-600">Cao</span>
      <span className="ml-2 font-mono">% so với trung bình toà</span>
    </div>
  );
};

const HeatmapPanel = ({
  selectedFloor,
  setSelectedFloor,
  lastSync,
}: {
  selectedFloor: string | null;
  setSelectedFloor: (id: string) => void;
  lastSync: Date;
}) => {
  const fmtLastSync = lastSync.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <Card className="flex-1 flex flex-col min-h-0">
      <CardHeader
        title="Heatmap tiêu thụ 48 tầng/hầm"
        subtitle="Bố trí thẳng đứng · F45 trên cùng → B3 dưới cùng · Click ô để xem chi tiết"
        right={
          <div className="flex items-center gap-2">
            <Pill tone="bad" dot>
              1 tầng vượt 180%
            </Pill>
            <Btn size="sm">
              <Icon name="download" className="w-3.5 h-3.5" />
              PNG
            </Btn>
          </div>
        }
      />
      <div className="px-5 pb-3 flex items-center justify-between border-b border-border">
        <HeatmapLegend />
        <div className="text-[11px] text-neutral-500">
          Đơn vị: <span className="font-mono">kWh / tầng / ngày</span>
        </div>
      </div>
      <div className="flex-1 p-5 overflow-auto custom-scrollbar">
        <div className="mx-auto max-w-[640px]">
          <div className="h-3 mx-4 rounded-t-md bg-surface-muted" />
          <div className="border-x-2 border-border p-3 bg-surface">
            <div className="grid grid-cols-8 gap-1.5">
              {HEATMAP_ORDER.map((id) => (
                <HeatmapCell
                  key={id}
                  floorId={id}
                  onClick={setSelectedFloor}
                  selected={selectedFloor === id}
                />
              ))}
            </div>
          </div>
          <div className="h-2 mx-2 rounded-b bg-neutral-400" />
          <div className="mt-2 flex justify-between text-[10px] font-mono text-neutral-500 px-1">
            <span>117.000 m² · 187 công tơ</span>
            <span>Cập nhật {fmtLastSync} · BMS DesigoCC</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

const NightLoadPanel = () => {
  const { themeMode } = useTheme();
  const isDark = themeMode === "dark";
  const floors = [];
  for (let i = 45; i >= 1; i--) floors.push(`F${i}`);

  return (
    <Card className="flex-1 flex flex-col min-h-0">
      <CardHeader
        title="Night Load Monitor"
        subtitle="Tải đêm 7 đêm gần nhất · trục Y = tầng · trục X = giờ trong ngày (22h–6h là vùng đêm)"
        right={
          <div className="flex items-center gap-2">
            <Pill tone="warn" dot>
              ⚠ 3 tầng có Night Load bất thường
            </Pill>
            <select className="text-[11px] h-7 px-2 rounded-md border border-border bg-surface text-foreground focus:outline-none">
              <option>7 đêm gần nhất</option>
              <option>30 đêm</option>
            </select>
          </div>
        }
      />

      <div className="px-5 pb-2 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-4 text-[10px] text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm"
              style={{ background: isDark ? "#1E3A8A" : "#DBEAFE" }}
            />
            Yên tĩnh
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm"
              style={{ background: isDark ? "#1D4ED8" : "#93C5FD" }}
            />
            Bình thường
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm"
              style={{ background: isDark ? "#92400E" : "#FBBF24" }}
            />
            Hơi cao
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm"
              style={{ background: isDark ? "#9A3412" : "#F97316" }}
            />
            Bất thường
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm"
              style={{ background: isDark ? "#991B1B" : "#DC2626" }}
            />
            Khẩn cấp
          </span>
        </div>
        <div className="text-[10px] font-mono text-neutral-500">
          Vùng đêm = 22h → 06h
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-4">
        <div className="inline-block min-w-full">
          <div className="flex sticky top-0 bg-surface z-10 pb-1 transition-colors">
            <div className="w-9 shrink-0" />
            <div className="flex gap-px">
              {Array.from({ length: 24 }, (_, h) => (
                <div
                  key={h}
                  className={cn(
                    "w-[18px] text-center text-[9px] font-mono",
                    h >= 22 || h <= 5
                      ? "text-primary-300 font-semibold"
                      : "text-neutral-500"
                  )}
                >
                  {h % 3 === 0 ? String(h).padStart(2, "0") : "·"}
                </div>
              ))}
            </div>
          </div>
          {floors.map((f) => {
            const flagged = f === "F28" || f === "F31" || f === "F12";
            return (
              <div key={f} className="flex items-center group">
                <div
                  className={cn(
                    "w-9 shrink-0 text-right pr-2 text-[10px] font-mono",
                    flagged ? "text-red-200 font-bold" : "text-neutral-500"
                  )}
                >
                  {f.slice(1)}
                </div>
                <div className="flex gap-px">
                  {Array.from({ length: 24 }, (_, h) => {
                    const v = nightLoadCell(f, h);
                    const isNight = h >= 22 || h <= 5;
                    const bg = nightCellColor(v, isDark);
                    const isAnomaly =
                      (f === "F28" || f === "F31") && h >= 0 && h <= 4;
                    return (
                      <div
                        key={h}
                        className={cn(
                          "w-[18px] h-[10px]",
                          isAnomaly ? "ring-1 ring-red-100" : ""
                        )}
                        style={{
                          background: bg,
                          outline: isNight
                            ? (isDark ? "1px dotted rgba(34,211,238,0.18)" : "1px dotted rgba(8,145,178,0.18)")
                            : "none",
                          outlineOffset: "-1px",
                        }}
                        title={`${f} · ${String(h).padStart(
                          2,
                          "0"
                        )}:00 · ${v}% trung bình`}
                      />
                    );
                  })}
                </div>
                {flagged && (
                  <div className="ml-2 text-[10px]">
                    {f === "F12" && <Pill tone="bad">+180% ngày</Pill>}
                    {(f === "F28" || f === "F31") && (
                      <Pill tone="warn">⚠ 0h-4h</Pill>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-5 py-3 border-t border-border flex items-center justify-between text-[11px] text-neutral-500">
        <span>
          Tải đêm trung bình toà:{" "}
          <span className="font-semibold text-foreground font-mono">
            3.840 kWh/đêm
          </span>
        </span>
        <span>
          3 tầng bất thường ={" "}
          <span className="font-semibold text-red-200 font-mono">
            ~960 kWh/đêm
          </span>{" "}
          có thể tối ưu (~25% tải đêm)
        </span>
      </div>
    </Card>
  );
};

const FloorDetailDrawer = ({
  floorId,
  onClose,
}: {
  floorId: string | null;
  onClose: () => void;
}) => {
  const { themeMode } = useTheme();
  const isDark = themeMode === "dark";
  if (!floorId) return null;
  const c = floorConsumption(floorId);
  const isBasement = floorId.startsWith("B");

  const hourly = Array.from({ length: 24 }, (_, h) => ({
    h,
    v: Math.round(20 + Math.sin(h / 4) * 15 + ((h * 9) % 17)),
  }));

  return (
    <div className="fixed inset-0 z-40 flex transition-colors duration-500" onClick={onClose}>
      <div className="flex-1 bg-black/40 backdrop-blur-xs" />
      <aside
        className="w-[420px] h-full bg-surface border-l border-border shadow-2xl overflow-y-auto custom-scrollbar transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-border flex items-start justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
              {isBasement ? "Tầng hầm" : "Tầng nổi"}
            </div>
            <h3 className="text-[20px] font-bold text-foreground">
              Tầng {floorId}
            </h3>
            <p className="text-[12px] text-neutral-500 mt-0.5">
              {c.area.toLocaleString("vi-VN")} m² · {c.occupants || "0"} người
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 grid place-items-center rounded-md hover:bg-surface-muted transition-colors"
          >
            <Icon name="x" className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-4 rounded-lg border border-border bg-surface-muted">
            <div className="text-[11px] uppercase tracking-wider text-neutral-500 mb-1">
              Tiêu thụ hôm nay
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[28px] font-bold text-foreground font-mono">
                {c.kwh.toLocaleString("vi-VN")}
              </span>
              <span className="text-[13px] text-neutral-500">kWh</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[12px]">
              <Pill
                tone={c.pctAvg > 150 ? "bad" : c.pctAvg > 110 ? "warn" : "ok"}
                dot
              >
                {c.pctAvg}% trung bình toà
              </Pill>
              <span className="text-neutral-500">
                Xếp hạng{" "}
                <span className="font-semibold text-foreground">
                  #{c.rank}/48
                </span>
              </span>
            </div>
          </div>

          <div>
            <div className="text-[12px] font-semibold text-foreground mb-2">
              Tải 24h hôm nay
            </div>
            <div className="flex items-end gap-[2px] h-16 bg-surface-muted rounded-md p-2">
              {hourly.map((d, i) => {
                const isNight = d.h >= 22 || d.h <= 5;
                const isAnomaly =
                  (floorId === "F28" || floorId === "F31") && d.h >= 0 && d.h <= 4;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${(d.v / 45) * 100}%`,
                      background: isAnomaly
                        ? "var(--red-100)"
                        : isNight
                        ? "var(--secondary-100)"
                        : "var(--brand-primary)",
                      opacity: 0.9,
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[12px]">
            {[
              { l: "kWh/m²", v: (c.kwh / c.area).toFixed(2) },
              {
                l: "kWh/người",
                v: c.occupants ? (c.kwh / c.occupants).toFixed(1) : "—",
              },
              { l: "Night Load", v: (c.kwh * 0.18).toFixed(0) + " kWh" },
              { l: "Công tơ", v: isBasement ? "4 · 1 offline" : "3 · OK" },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded-md border border-border">
                <div className="text-[11px] text-neutral-500">{s.l}</div>
                <div className="text-[15px] font-semibold text-foreground font-mono">
                  {s.v}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg border border-border">
            <div className="text-[12px] font-semibold text-foreground mb-2">
              Khách thuê / sử dụng
            </div>
            <div className="space-y-1.5 text-[12px]">
              {isBasement ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Bãi đỗ xe + chiếu sáng</span>
                    <span className="font-mono text-neutral-500">62%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Bơm nước + PCCC</span>
                    <span className="font-mono text-neutral-500">23%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">HVAC tầng hầm</span>
                    <span className="font-mono text-neutral-500">15%</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">
                      {floorId === "F12"
                        ? "DNT Solutions (84%)"
                        : "Khách thuê A"}
                    </span>
                    <span className="font-mono text-neutral-500">1.620 m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">
                      {floorId === "F12"
                        ? "Phòng server backup"
                        : "Khách thuê B"}
                    </span>
                    <span className="font-mono text-neutral-500">780 m²</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {floorId === "F12" && (
            <div className="p-3 rounded-md bg-red-100/10 border border-red-100/20 text-[12px]">
              <div className="flex items-center gap-1.5 text-red-100 font-semibold mb-1">
                <Icon name="bell" className="w-3.5 h-3.5" /> Cảnh báo đang mở
              </div>
              <p className="text-red-100/90">
                Tầng vượt 180% trung bình. Nghi server room hoạt động ngoài giờ
                và setpoint chiller setpoint quá thấp (4°C).
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Btn tone="primary" size="md" className="flex-1">
              Xem báo cáo tầng
            </Btn>
            <Btn size="md">
              <Icon name="download" className="w-3.5 h-3.5" />
              CSV
            </Btn>
          </div>
        </div>
      </aside>
    </div>
  );
};

export const Screen_Heatmap = ({ lastSync }: { lastSync: Date }) => {
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);

  return (
    <div className="p-6 max-w-[1600px] mx-auto transition-colors duration-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {[
          { l: "Tầng đang vượt 110%", v: "7 / 48", tone: "warn" },
          { l: "Tầng vượt 170%", v: "1 / 48", tone: "bad", sub: "Tầng 12 · 184%" },
          {
            l: "Night Load bất thường",
            v: "3 đêm",
            tone: "warn",
            sub: "F12 · F28 · F31",
          },
          { l: "Tầng tiết kiệm tốt", v: "8 / 48", tone: "ok", sub: "<60% trung bình" },
        ].map((s, i) => (
          <Card key={i} className="p-4">
            <div className="text-[11px] uppercase tracking-wider text-neutral-500">
              {s.l}
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={cn(
                  "text-[22px] font-bold font-mono",
                  s.tone === "bad"
                    ? "text-red-200"
                    : s.tone === "warn"
                    ? "text-yellow-200"
                    : "text-green-200"
                )}
              >
                {s.v}
              </span>
            </div>
            {s.sub && (
              <div className="text-[11px] text-neutral-500 mt-1">{s.sub}</div>
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 min-h-[640px]">
        <div className="xl:col-span-2 flex">
          <HeatmapPanel
            selectedFloor={selectedFloor}
            setSelectedFloor={setSelectedFloor}
            lastSync={lastSync}
          />
        </div>
        <div className="xl:col-span-3 flex">
          <NightLoadPanel />
        </div>
      </div>

      <FloorDetailDrawer
        floorId={selectedFloor}
        onClose={() => setSelectedFloor(null)}
      />
    </div>
  );
};
