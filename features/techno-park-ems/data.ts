/* ─────────────────────────────────────────────────────────────
   Techno Park Tower — sample data
   Tất cả số liệu hardcode có nghĩa, đúng nghiệp vụ.
   ───────────────────────────────────────────────────────────── */

export const BUILDING = {
  name: "Techno Park Tower",
  address: "Khu CNC Hòa Lạc, Hà Nội",
  floors: 45, // tầng nổi: 43 VP + 1 TMDV + ... (giản lược: F1..F45)
  basements: 3, // B1..B3
  area: 117000, // m²
  metersTotal: 187,
  metersOnline: 184,
  metersOffline: 3,
  bms: "Siemens DesigoCC 5.0",
  benchmarkEPI: 150, // LOTUS kWh/m²/năm
};

export interface KpiData {
  id: string;
  label: string;
  value: string;
  unit: string;
  delta: number;
  deltaLabel: string;
  status: "ok" | "warn" | "bad";
  target: number;
  current: number;
  suffix?: string;
}

/* ── KPI cards (Screen 1 + Screen 4) ───────────────────────── */
export const KPI: KpiData[] = [
  {
    id: "kwh",
    label: "Tổng kWh hôm nay",
    value: "58.420",
    unit: "kWh",
    delta: -2.4,
    deltaLabel: "so với hôm qua",
    status: "ok",
    target: 60000,
    current: 58420,
  },
  {
    id: "cost",
    label: "Chi phí tháng này",
    value: "2,1",
    unit: "tỷ VNĐ",
    delta: 3.1,
    deltaLabel: "so với T4/2026",
    status: "warn",
    target: 2.0,
    current: 2.1,
  },
  {
    id: "epi",
    label: "EPI hiện tại",
    value: "142",
    unit: "kWh/m²/năm",
    delta: -5.2,
    deltaLabel: "benchmark LOTUS 150",
    status: "ok",
    target: 150,
    current: 142,
  },
  {
    id: "pbr",
    label: "Peak-to-Base Ratio",
    value: "3.2",
    unit: "",
    delta: 0.3,
    deltaLabel: "tuần trước 2.9",
    status: "warn",
    target: 3.0,
    current: 3.2,
  },
  {
    id: "cop",
    label: "COP Chiller TB",
    value: "3.8",
    unit: "",
    delta: 0.2,
    deltaLabel: "thiết kế 4.0",
    status: "ok",
    target: 4.0,
    current: 3.8,
  },
  {
    id: "goal",
    label: "% mục tiêu tháng",
    value: "94",
    unit: "%",
    delta: 1.6,
    deltaLabel: "vs cuối T4",
    status: "ok",
    target: 100,
    current: 94,
  },
];

/* ── Xu hướng kWh 30 ngày (Area chart) ─────────────────────── */
export const TREND_30D = (() => {
  const base = 56000;
  const arr = [];
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(now.getTime() - (29 - i) * 86400000);
    // weekend dip
    const w = d.getDay();
    const weekend = w === 0 || w === 6 ? 0.78 : 1.0;
    const wave = Math.sin(i / 4.0) * 2200;
    const noise = ((i * 9301 + 49297) % 4500) - 2000;
    const v = Math.round((base + wave + noise) * weekend);
    arr.push({
      day: d.getDate(),
      label: `${String(d.getDate()).padStart(2, "0")}/${String(
        d.getMonth() + 1
      ).padStart(2, "0")}`,
      kwh: v,
    });
  }
  return arr;
})();

/* ── Tiêu thụ theo hệ thống (Bar chart) ────────────────────── */
export const SYSTEM_USAGE = [
  { name: "HVAC", kwh: 31420, pct: 53.8, color: "#06B6D4" },
  { name: "Chiếu sáng", kwh: 9870, pct: 16.9, color: "#22D3EE" },
  { name: "Thang máy", kwh: 6240, pct: 10.7, color: "#0891B2" },
  { name: "Ổ cắm VP", kwh: 7820, pct: 13.4, color: "#67E8F9" },
  { name: "Khác", kwh: 3070, pct: 5.2, color: "#A5F3FC" },
];

/* ── Floor list F45..F1, B1..B3 ────────────────────────────── */
export const FLOORS = (() => {
  const list = [];
  // F45 -> F1 (top first reads naturally in vertical column)
  for (let i = 45; i >= 1; i--)
    list.push({
      id: `F${i}`,
      label: `Tầng ${i}`,
      kind: i === 1 ? "tmdv" : "office",
      area: 2400,
    });
  for (let i = 1; i <= 3; i++)
    list.push({
      id: `B${i}`,
      label: `Tầng hầm B${i}`,
      kind: "basement",
      area: 3800,
    });
  return list;
})();

/* ── Floor consumption (deterministic pseudo-data) ─────────── */
export function floorConsumption(floorId: string) {
  // anchor outliers
  if (floorId === "F12")
    return { kwh: 4280, pctAvg: 184, rank: 1, occupants: 142, area: 2400 };
  if (floorId === "F28")
    return {
      kwh: 2740,
      pctAvg: 118,
      rank: 8,
      occupants: 118,
      area: 2400,
      nightAnomaly: true,
    };
  if (floorId === "F31")
    return {
      kwh: 2680,
      pctAvg: 115,
      rank: 10,
      occupants: 96,
      area: 2400,
      nightAnomaly: true,
    };
  if (floorId === "B2")
    return { kwh: 860, pctAvg: 37, rank: 48, occupants: 0, area: 3800 };
  if (floorId === "B1")
    return { kwh: 1420, pctAvg: 61, rank: 44, occupants: 0, area: 3800 };
  if (floorId === "B3")
    return {
      kwh: 1180,
      pctAvg: 51,
      rank: 46,
      occupants: 0,
      area: 3800,
      offlineMeters: 3,
    };
  // procedural
  const n = parseInt(floorId.slice(1), 10);
  const seed = (((n * 9301 + 49297) % 233280) / 233280);
  const base = 2320;
  const swing = (seed - 0.5) * 1400;
  const kwh = Math.round(base + swing);
  const pctAvg = Math.round((kwh / 2320) * 100);
  return {
    kwh,
    pctAvg,
    rank: 2 + Math.round(seed * 40),
    occupants: 60 + Math.round(seed * 80),
    area: 2400,
    nightAnomaly: false,
  };
}

/* ── Night Load 45 × 24 (rows = floors top-down, cols = hours) */
export function nightLoadCell(floor: string, hour: number) {
  // baseline night load
  const isNight = hour >= 22 || hour <= 5;
  const n =
    floor === "B1"
      ? 1
      : floor === "B2"
      ? 2
      : floor === "B3"
      ? 3
      : parseInt(floor.slice(1), 10);
  const seed = ((n * 137 + hour * 23) % 100) / 100;
  let v;
  if (isNight) {
    v = 20 + seed * 60; // 20..80% of day-avg
    if (floor === "F12") v = 90 + seed * 40;
    if ((floor === "F28" || floor === "F31") && hour >= 0 && hour <= 4)
      v = 160 + seed * 50;
    if (floor === "B2") v = 5 + seed * 10;
  } else {
    v = 80 + seed * 70; // day
    if (floor === "F12") v = 150 + seed * 50;
  }
  return Math.round(v);
}

export interface AlertData {
  id: string;
  level: 1 | 2 | 3;
  status: "open" | "closed";
  time: string;
  title: string;
  area: string;
  value: string;
  detail: string;
  sop: string[];
  chart: "demand" | "nightload" | "cop" | "comm";
}

/* ── Alerts (Screen 3) ─────────────────────────────────────── */
export const ALERTS: AlertData[] = [
  {
    id: "A-2026-0526-001",
    level: 3,
    status: "open",
    time: "10:42",
    title: "Vượt ngưỡng demand charge",
    area: "Tầng 15 – 20",
    value: "92% ngưỡng peak EVN",
    detail:
      "Tổng demand 1.245 kW chạm 92% ngưỡng EVN giờ cao điểm (1.350 kW). Khả năng vượt → bậc giá phạt 1.847 đ/kWh.",
    sop: [
      "Yêu cầu Tầng 18 (Data Center) dừng test UPS",
      "Giảm 1 chiller mode COOL → ECO",
      "Thông báo BLĐ qua Zalo Group EMS",
    ],
    chart: "demand",
  },
  {
    id: "A-2026-0526-002",
    level: 3,
    status: "open",
    time: "08:15",
    title: "Night Load bất thường",
    area: "Tầng 28",
    value: "340 kWh/đêm (+185%)",
    detail:
      "Trong khoảng 00:00–04:00 tải đêm cao gấp 2.85× trung bình. Nghi máy lạnh VRV-3 và 12 màn hình PC để qua đêm.",
    sop: [
      "Cử kỹ thuật ca đêm kiểm tra phòng 28-05",
      "Liên hệ khách thuê DNT Solutions",
      "Gửi cảnh báo email tự động cho khách thuê",
    ],
    chart: "nightload",
  },
  {
    id: "A-2026-0526-003",
    level: 2,
    status: "open",
    time: "09:30",
    title: "COP Chiller suy giảm",
    area: "Chiller 02",
    value: "COP 2.9 (ngưỡng 3.2)",
    detail:
      "COP trung bình 8h gần nhất 2.9, giảm 18% so với cùng kỳ. Có thể do cáu cặn dàn ngưng hoặc thiếu môi chất.",
    sop: [
      "Lên lịch vệ sinh dàn ngưng cuối tuần",
      "Kiểm tra áp suất hút/đẩy",
      "Cân nhắc chuyển tải sang Chiller 01",
    ],
    chart: "cop",
  },
  {
    id: "A-2026-0526-004",
    level: 2,
    status: "open",
    time: "11:00",
    title: "Công tơ mất kết nối",
    area: "Tầng B3",
    value: "3 công tơ offline > 15’",
    detail:
      "M-B3-07, M-B3-09, M-B3-12 mất tín hiệu Modbus TCP từ 10:43. BMS không nhận data 17 phút.",
    sop: [
      "Kiểm tra switch tầng B3",
      "Reset gateway Modbus DC-04",
      "Tạo ticket cho ROX BMS Team",
    ],
    chart: "comm",
  },
  {
    id: "A-2026-0526-005",
    level: 2,
    status: "open",
    time: "07:48",
    title: "Power Factor thấp",
    area: "Tủ điện TĐ-12",
    value: "cosφ 0.81 (tối thiểu 0.85)",
    detail:
      "Hệ số công suất giảm xuống 0.81 từ 07:30, có thể bị tính tiền VAR EVN tháng này.",
    sop: [
      "Kiểm tra tụ bù tủ TĐ-12",
      "Đo dòng từng pha",
      "Báo kỹ thuật điện",
    ],
    chart: "cop",
  },
  {
    id: "A-2026-0526-006",
    level: 1,
    status: "open",
    time: "07:00",
    title: "Báo cáo ngày đã gửi",
    area: "Toàn tòa",
    value: "26/05/2026 06:58",
    detail:
      "Báo cáo điện năng ngày 25/05/2026 đã được gửi đến 14 người nhận theo lịch.",
    sop: ["Không cần hành động"],
    chart: "comm",
  },
  {
    id: "A-2026-0526-007",
    level: 1,
    status: "closed",
    time: "06:32",
    title: "Sync dữ liệu BMS hoàn tất",
    area: "DesigoCC",
    value: "Đồng bộ 184/187 công tơ",
    detail:
      "Sync OPC-UA hoàn tất lúc 06:32. 3 công tơ offline đã được ghi nhận.",
    sop: [],
    chart: "comm",
  },
  {
    id: "A-2026-0525-019",
    level: 2,
    status: "closed",
    time: "21:14",
    title: "Quá nhiệt phòng MMR Tầng 9",
    area: "Tầng 9 - MMR",
    value: "32.4°C (ngưỡng 28°C)",
    detail:
      "Đã xử lý: tăng setpoint chiller xuống 7°C, kích hoạt FCU dự phòng. Nhiệt độ về 26.8°C sau 22 phút.",
    sop: ["Đã đóng vào 21:36"],
    chart: "demand",
  },
];

/* ── Cross-floor ranking (Screen 4 tab 2) ──────────────────── */
export const CROSS_RANKING = FLOORS.map((f, i) => {
  const c = floorConsumption(f.id);
  const occupants = c.occupants || 1;
  return {
    floor: f.id,
    label: f.label,
    kind: f.kind,
    kwhPerM2: +(c.kwh / f.area).toFixed(2),
    kwhPerPax: occupants ? +(c.kwh / occupants).toFixed(1) : null,
    nightKwh: floorConsumption(f.id).nightAnomaly
      ? f.id === "F28"
        ? 340
        : 295
      : Math.round(c.kwh * 0.18 + (i % 5) * 7),
    rank: c.rank,
    special: f.kind === "basement" || f.kind === "tmdv",
  };
}).sort((a, b) => b.kwhPerM2 - a.kwhPerM2);

/* ── EPI 12 months ─────────────────────────────────────────── */
export const EPI_12M = [
  { m: "T6/25", actual: 158, target: 150 },
  { m: "T7/25", actual: 162, target: 150 },
  { m: "T8/25", actual: 159, target: 150 },
  { m: "T9/25", actual: 154, target: 150 },
  { m: "T10/25", actual: 151, target: 150 },
  { m: "T11/25", actual: 148, target: 150 },
  { m: "T12/25", actual: 146, target: 150 },
  { m: "T1/26", actual: 149, target: 150 },
  { m: "T2/26", actual: 147, target: 150 },
  { m: "T3/26", actual: 145, target: 150 },
  { m: "T4/26", actual: 143, target: 150 },
  { m: "T5/26", actual: 142, target: 150 },
];

/* ── Reports sent ──────────────────────────────────────────── */
export const REPORTS_SENT = [
  {
    name: "Báo cáo điện năng ngày",
    period: "25/05/2026",
    sentAt: "26/05/2026 06:58",
    recipients: "14 người",
    status: "sent",
    size: "1.2 MB",
  },
  {
    name: "Báo cáo tuần W21",
    period: "19–25/05/2026",
    sentAt: "25/05/2026 08:02",
    recipients: "22 người",
    status: "sent",
    size: "3.4 MB",
  },
  {
    name: "Báo cáo tháng 4/2026",
    period: "01–30/04/2026",
    sentAt: "03/05/2026 09:14",
    recipients: "31 người",
    status: "sent",
    size: "5.7 MB",
  },
  {
    name: "Báo cáo cảnh báo tuần",
    period: "19–25/05/2026",
    sentAt: "25/05/2026 08:10",
    recipients: "14 người",
    status: "sent",
    size: "820 KB",
  },
  {
    name: "Báo cáo Night Load",
    period: "Tuần 21/2026",
    sentAt: "25/05/2026 08:14",
    recipients: "4 người",
    status: "sent",
    size: "1.8 MB",
  },
  {
    name: "Báo cáo khách thuê F22",
    period: "01–25/05/2026",
    sentAt: "26/05/2026 07:02",
    recipients: "2 người",
    status: "sent",
    size: "640 KB",
  },
  {
    name: "Báo cáo điện năng ngày",
    period: "26/05/2026",
    sentAt: "27/05/2026 06:55",
    recipients: "14 người",
    status: "scheduled",
    size: "—",
  },
];
