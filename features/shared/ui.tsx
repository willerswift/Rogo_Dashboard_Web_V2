"use client";

import { useEffect } from "react";
import { Loader2, X, Check } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-10">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 mx-4 w-full rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200",
          wide ? "max-w-2xl" : "max-w-lg",
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h5 className="text-[24px] font-bold text-[#1F244A] tracking-tight font-heading">{title}</h5>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-neutral-400 transition hover:bg-neutral-50 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Panel({
  title,
  description,
  children,
  className,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden", className)}>
      <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-neutral-100">
        <div className="space-y-1">
          <h2 className="text-[18px] font-bold text-neutral-900">{title}</h2>
          {description ? <p className="text-sm text-neutral-500">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div>
        {children}
      </div>
    </section>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-neutral-700">{label}</span>
      {children}
      {hint ? <span className="text-xs font-normal text-neutral-500">{hint}</span> : null}
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </div>
  );
}

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean },
) {
  const { invalid, className, ...inputProps } = props;

  return (
    <input
      {...inputProps}
      className={cn(
        "h-10 rounded-[6px] border border-[#E5E7EB] bg-white px-[var(--Spacing-2,8px)] text-[14px] text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-300 focus:ring-4 focus:ring-primary-100/20",
        invalid && "border-red-200 focus:border-red-200 focus:ring-red-100/20",
        className,
      )}
    />
  );
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean },
) {
  const { invalid, className, ...textareaProps } = props;

  return (
    <textarea
      {...textareaProps}
      className={cn(
        "min-h-28 rounded-[6px] border border-[#E5E7EB] bg-white px-[var(--Spacing-2,8px)] py-[var(--Spacing-2,8px)] text-[14px] text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-300 focus:ring-4 focus:ring-primary-100/20",
        invalid && "border-red-200 focus:border-red-200 focus:ring-red-100/20",
        className,
      )}
    />
  );
}

export function SelectInput(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean },
) {
  const { invalid, className, ...selectProps } = props;

  return (
    <select
      {...selectProps}
      className={cn(
        "h-10 rounded-[6px] border border-[#E5E7EB] bg-white px-[var(--Spacing-2,8px)] text-[14px] text-neutral-900 outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100/20",
        invalid && "border-red-200 focus:border-red-200 focus:ring-red-100/20",
        className,
      )}
    />
  );
}

export function CheckboxInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...inputProps } = props;
  return (
    <div className={cn("relative size-6 shrink-0", className)}>
      <input
        {...inputProps}
        type="checkbox"
        className="peer size-6 appearance-none rounded-[8px] border border-neutral-500 bg-neutral-100 transition-all checked:bg-primary-300 checked:border-primary-300 cursor-pointer"
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white opacity-0 peer-checked:opacity-100 transition-opacity">
        <div className="flex size-[22px] flex-col items-center justify-center">
          <Check className="size-3.5" strokeWidth={4} />
        </div>
      </div>
    </div>
  );
}

export function PrimaryButton({
  loading,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={cn(
        "inline-flex h-[40px] items-center justify-center gap-2 rounded-full bg-primary-300 px-3 py-2 text-[14px] font-semibold text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-300 font-heading",
        className,
      )}
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function SecondaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-[40px] items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-[14px] font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60 font-heading",
        props.className,
      )}
    />
  );
}

export function InlineCode({ value }: { value: string }) {
  return <code className="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-700 font-mono">{value}</code>;
}

export function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="overflow-x-auto rounded-2xl bg-secondary-500 p-6 text-[13px] leading-6 text-neutral-100 font-mono shadow-inner">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export function Notice({ tone = "default", children }: { tone?: "default" | "error" | "warn"; children: React.ReactNode }) {
  const toneClass =
    tone === "error"
      ? "border-red-100 bg-red-100/10 text-red-700"
      : tone === "warn"
        ? "border-yellow-100 bg-yellow-100/10 text-yellow-700"
        : "border-primary-100 bg-primary-100/10 text-neutral-700";

  return <div className={cn("rounded-xl border px-4 py-3 text-sm flex gap-3", toneClass)}>{children}</div>;
}

export function LoadingBlock({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-8 text-sm text-neutral-500 justify-center">
      <Loader2 className="h-5 w-5 animate-spin text-primary-300" />
      <span className="font-medium">{label}</span>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-12 text-center">
      <h3 className="font-bold text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm text-neutral-500 max-w-sm mx-auto">{description}</p>
    </div>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const colorClass =
    value === "ACTIVE" || value === "released"
      ? "bg-green-100 text-green-700"
      : value === "DISABLED" || value === "DEACTIVATED"
        ? "bg-red-100 text-red-700"
        : "bg-neutral-100 text-neutral-600";

  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider", colorClass)}>
      {value}
    </span>
  );
}
