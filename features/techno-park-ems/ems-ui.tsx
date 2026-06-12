"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

/* ── Icons (custom SVGs from original) ──────────────────────── */
export const Icon = ({
  name,
  className = "w-5 h-5",
  stroke = 1.6,
}: {
  name: string;
  className?: string;
  stroke?: number;
}) => {
  const p: Record<string, React.ReactNode> = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </>
    ),
    heat: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
      </>
    ),
    bell: (
      <>
        <path d="M6 8a6 6 0 1 1 12 0c0 3.5 1 5 2 6H4c1-1 2-2.5 2-6Z" />
        <path d="M10 18a2 2 0 0 0 4 0" />
      </>
    ),
    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="M7 14l4-4 3 3 5-6" />
        <circle cx="7" cy="14" r="1.2" />
        <circle cx="11" cy="10" r="1.2" />
        <circle cx="14" cy="13" r="1.2" />
        <circle cx="19" cy="7" r="1.2" />
      </>
    ),
    bolt: <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
    moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />,
    refresh: (
      <>
        <path d="M21 12a9 9 0 1 1-3-6.7" />
        <path d="M21 4v5h-5" />
      </>
    ),
    expand: (
      <>
        <path d="M4 9V4h5M20 15v5h-5M15 4h5v5M9 20H4v-5" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12" />
        <path d="m7 11 5 5 5-5" />
        <path d="M5 21h14" />
      </>
    ),
    check: <path d="m5 12 4 4L19 7" />,
    x: <path d="M6 6l12 12M18 6 6 18" />,
    chev: <path d="m9 6 6 6-6 6" />,
    chevDown: <path d="m6 9 6 6 6-6" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
    filter: <path d="M4 5h16l-6 8v6l-4-2v-4L4 5Z" />,
    cog: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.4 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.4l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1A2 2 0 1 1 19.6 7l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    bms: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 9h10M7 13h10M7 17h6" />
      </>
    ),
    floor: (
      <>
        <path d="M3 21h18" />
        <path d="M5 21V8l7-5 7 5v13" />
        <path d="M10 21v-6h4v6" />
      </>
    ),
    tenant: (
      <>
        <circle cx="9" cy="9" r="3" />
        <circle cx="17" cy="11" r="2" />
        <path d="M3 20a6 6 0 0 1 12 0M14 20a4 4 0 0 1 7 0" />
      </>
    ),
    report: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 7h6M9 11h6M9 15h4" />
      </>
    ),
    sop: (
      <>
        <path d="M9 5h10M9 12h10M9 19h10" />
        <circle cx="5" cy="5" r="1.4" />
        <circle cx="5" cy="12" r="1.4" />
        <circle cx="5" cy="19" r="1.4" />
      </>
    ),
    note: (
      <>
        <path d="M5 3h11l4 4v14H5z" />
        <path d="M14 3v6h6" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8h.01M11 12h1v5h1" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {p[name]}
    </svg>
  );
};

/* ── small UI atoms (using semantic tokens) ────────────────── */
export const Card = ({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: any;
}) => (
  <Tag
    className={cn(
      "bg-surface rounded-lg border border-border shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]",
      className
    )}
  >
    {children}
  </Tag>
);

export const CardHeader = ({
  title,
  subtitle,
  right,
  dense = false,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  dense?: boolean;
}) => (
  <div
    className={cn(
      "flex items-start justify-between gap-4",
      dense ? "px-4 pt-3 pb-2" : "px-5 pt-4 pb-3"
    )}
  >
    <div className="min-w-0">
      <h3 className="text-[14px] font-semibold text-foreground">
        {title}
      </h3>
      {subtitle && (
        <p className="text-[11px] text-neutral-500 mt-0.5">{subtitle}</p>
      )}
    </div>
    {right}
  </div>
);

export const Pill = ({
  tone = "neutral",
  children,
  dot = false,
}: {
  tone?: "neutral" | "ok" | "warn" | "bad" | "brand";
  children: React.ReactNode;
  dot?: boolean;
}) => {
  const map = {
    neutral: "bg-surface-muted text-neutral-600 border-border",
    ok: "bg-green-100/20 text-green-200 border-green-200/20",
    warn: "bg-yellow-100/20 text-yellow-200 border-yellow-200/20",
    bad: "bg-red-100/20 text-red-200 border-red-200/20",
    brand: "bg-primary-100/20 text-primary-300 border-primary-300/20",
  };
  const dotMap = {
    ok: "bg-green-200",
    warn: "bg-yellow-200",
    bad: "bg-red-200",
    neutral: "bg-neutral-500",
    brand: "bg-primary-300",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border",
        map[tone]
      )}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", dotMap[tone])} />}
      {children}
    </span>
  );
};

export const Btn = ({
  tone = "neutral",
  size = "md",
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "neutral" | "primary" | "ghost" | "bad";
  size?: "sm" | "md" | "lg";
}) => {
  const sizes = {
    sm: "h-7 px-2.5 text-[11px]",
    md: "h-9 px-3 text-[12px]",
    lg: "h-10 px-4 text-[13px]",
  };
  const tones = {
    neutral: "bg-surface border border-border text-neutral-600 hover:bg-surface-muted",
    primary:
      "bg-primary-300 text-white hover:bg-primary-400 border border-primary-300",
    ghost: "text-neutral-600 hover:bg-surface-muted",
    bad: "bg-red-100/10 text-red-100 border border-red-100/20 hover:bg-red-100/20",
  };
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 font-medium rounded-md transition",
        sizes[size],
        tones[tone],
        className
      )}
    >
      {children}
    </button>
  );
};

export const TabBar = ({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; badge?: number }[];
  active: string;
  onChange: (id: string) => void;
}) => (
  <div className="flex items-center gap-1 border-b border-border px-5">
    {tabs.map((t) => {
      const isActive = t.id === active;
      return (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "relative h-11 px-3 text-[13px] font-medium transition",
            isActive ? "text-primary-300" : "text-neutral-500 hover:text-foreground"
          )}
        >
          {t.label}
          {t.badge != null && (
            <span
              className={cn(
                "ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                isActive
                  ? "bg-primary-100/30 text-primary-300"
                  : "bg-surface-muted text-neutral-500"
              )}
            >
              {t.badge}
            </span>
          )}
          {isActive && (
            <span className="absolute left-2 right-2 -bottom-px h-[2px] bg-primary-300 rounded-full" />
          )}
        </button>
      );
    })}
  </div>
);
