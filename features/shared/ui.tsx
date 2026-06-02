"use client";

import { useEffect, useState } from "react";
import { Loader2, X, Check, Search, Eye, EyeOff, Lock } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
  headerExtra,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
  headerExtra?: React.ReactNode;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-500">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-h-[90vh] bg-white border border-[#F3F4F6] animate-in fade-in zoom-in-95 duration-200",
          "rounded-[var(--Radius-6,12px)] flex flex-col overflow-hidden shadow-xl",
          wide ? "max-w-3xl" : "max-w-lg",
        )}
      >
        <div className="px-8 pt-6 pb-4 shrink-0 border-b border-neutral-100/60">
          <div className="flex justify-between items-start self-stretch">
            <h5 className="text-[20px] font-bold text-foreground tracking-tight font-heading truncate">{title}</h5>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-1 text-neutral-400 transition hover:bg-surface-muted hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {headerExtra}
        </div>
        <div className="px-8 py-6 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
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
    <section className={cn("rounded-xl border border-border bg-surface overflow-hidden transition-colors duration-500", className)}>
      <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-border-muted">
        <div className="space-y-1">
          <h2 className="text-[18px] font-bold text-foreground">{title}</h2>
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
  footer,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-neutral-500">{label}</span>
      {children}
      <div className="flex flex-col gap-1">
        {hint ? <span className="text-xs font-normal text-neutral-500">{hint}</span> : null}
        {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
      </div>
      {footer}
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
        "h-10 rounded-[6px] border border-border bg-surface px-[var(--Spacing-2,8px)] text-[14px] text-foreground outline-none transition placeholder:text-neutral-400 focus:border-primary-300 focus:ring-4 focus:ring-primary-100/20",
        "autofill:text-fill-foreground",
        invalid && "border-red-200 focus:border-red-200 focus:ring-red-100/20",
        className,
      )}
    />
  );
}

export function SearchInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  const { className, ...inputProps } = props;

  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-neutral-400" />
      </div>
      <input
        {...inputProps}
        className={cn(
          "h-10 w-full rounded-[6px] border border-border bg-surface pl-9 pr-[var(--Spacing-2,8px)] text-[14px] text-foreground outline-none transition placeholder:text-neutral-400 focus:border-primary-300 focus:ring-4 focus:ring-primary-100/20",
          "autofill:text-fill-foreground"
        )}
      />
    </div>
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
        "min-h-28 rounded-[6px] border border-border bg-surface px-[var(--Spacing-2,8px)] py-[var(--Spacing-2,8px)] text-[14px] text-foreground outline-none transition placeholder:text-neutral-400 focus:border-primary-300 focus:ring-4 focus:ring-primary-100/20",
        "autofill:text-fill-foreground",
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
        "h-10 rounded-[6px] border border-border bg-surface px-[var(--Spacing-2,8px)] text-[14px] text-foreground outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100/20",
        "autofill:text-fill-foreground",
        invalid && "border-red-200 focus:border-red-200 focus:ring-red-100/20",
        className,
      )}
    />
  );
}

export function PasswordInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean },
) {
  const { invalid, className, ...inputProps } = props;
  const [show, setShow] = useState(false);

  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-primary-300 transition-colors">
        <Lock className="size-4" />
      </div>
      <input
        {...inputProps}
        type={show ? "text" : "password"}
        className={cn(
          "h-10 w-full rounded-[6px] border border-border bg-surface pl-10 pr-10 text-[14px] text-foreground outline-none transition placeholder:text-neutral-400 focus:border-primary-300 focus:ring-4 focus:ring-primary-100/20",
          "autofill:text-fill-foreground",
          invalid && "border-red-200 focus:border-red-200 focus:ring-red-100/20",
          className,
        )}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function CheckboxInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...inputProps } = props;
  return (
    <div className={cn("relative size-5 shrink-0", className)}>
      <input
        {...inputProps}
        type="checkbox"
        className="peer size-full appearance-none rounded-[6px] border border-neutral-400 dark:border-neutral-600 bg-surface-muted transition-all checked:bg-primary-300 checked:border-primary-300 cursor-pointer"
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white opacity-0 peer-checked:opacity-100 transition-opacity">
        <Check className="size-[70%]" strokeWidth={4} />
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
        "inline-flex h-[40px] items-center justify-center gap-2 rounded-full bg-primary-300 px-3 py-2 text-[14px] font-semibold text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-neutral-400 font-heading",
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
        "inline-flex h-[40px] items-center justify-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-[14px] font-semibold text-foreground transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60 font-heading",
        props.className,
      )}
    />
  );
}

export function InlineCode({ value }: { value: string }) {
  return <code className="rounded bg-surface-muted border border-border px-2 py-1 text-xs text-foreground font-mono">{value}</code>;
}

export function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="overflow-x-auto rounded-2xl bg-secondary-500 p-6 text-[13px] leading-6 text-white font-mono">
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
        : "border-primary-100 bg-primary-100/10 text-foreground";

  return <div className={cn("rounded-xl border px-4 py-3 text-sm flex gap-3", toneClass)}>{children}</div>;
}

export function LoadingBlock({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-surface-muted px-4 py-8 text-sm text-neutral-400 justify-center">
      <Loader2 className="h-5 w-5 animate-spin text-primary-300" />
      <span className="font-medium">{label}</span>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface-muted px-4 py-12 text-center">
      <h3 className="font-bold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-neutral-500 max-w-sm mx-auto">{description}</p>
    </div>
  );
}

export function StatusBadge({ value, variant = "default" }: { value: string; variant?: "default" | "permission" | "entity" }) {
  let colorClass = "bg-neutral-100";
  
  if (variant === "permission" || value === "ACTIVE" || value === "released") {
    colorClass = "bg-[hsla(148,72%,44%,0.1)]"; // Green tint
  } else if (variant === "entity" || value === "PARTNER" || value === "ORG" || value.startsWith("ID:")) {
    colorClass = "bg-[hsla(241,100%,90%,1)]"; // Blue/Lavender tint
  } else if (value === "DISABLED" || value === "DEACTIVATED") {
    colorClass = "bg-red-100";
  }

  return (
    <span className={cn(
      "inline-flex h-[28px] items-center justify-center rounded-full px-3 py-0.5 gap-2 text-[12px] font-bold leading-[18px] text-[#4A4A4A] font-sans transition-colors whitespace-nowrap",
      colorClass
    )}>
      {value}
    </span>
  );
}
