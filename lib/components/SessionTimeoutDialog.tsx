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
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">Session Expired</h2>
        <p className="text-neutral-600 mb-8">
          Your session has expired. Please log in again to continue.
        </p>
        <button
          onClick={onConfirm}
          className="h-12 w-full rounded-full bg-[#FD3566] px-10 text-base font-bold text-white shadow-md shadow-[#FD3566]/20 hover:bg-[#E62E5F] transition-all"
        >
          OK
        </button>
      </div>
    </div>
  );
}
