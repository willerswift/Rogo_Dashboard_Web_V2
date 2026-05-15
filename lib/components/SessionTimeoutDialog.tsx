"use client";

interface SessionTimeoutDialogProps {
  open: boolean;
  onConfirm: () => void;
}

export function SessionTimeoutDialog({ open, onConfirm }: SessionTimeoutDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-[var(--Radius-6,12px)] bg-white border border-dialog-border shadow-dialog p-8 text-center overflow-hidden">
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">Session Expired</h2>
        <p className="text-neutral-600 mb-8">
          Your session has expired. Please log in again to continue.
        </p>
        <button
          onClick={onConfirm}
          className="h-12 w-full rounded-full bg-[var(--brand-primary)] px-10 text-base font-bold text-white shadow-md shadow-[var(--brand-primary)]/20 hover:bg-[var(--brand-primary-hover)] transition-all"
        >
          OK
        </button>
      </div>
    </div>
  );
}
