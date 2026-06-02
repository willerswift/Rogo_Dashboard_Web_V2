"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbHeaderProps {
  items: BreadcrumbItem[];
  backHref?: string;
  onBack?: () => void;
  children?: React.ReactNode;
  breadcrumbAddon?: React.ReactNode;
}

export function BreadcrumbHeader({ items, backHref, onBack, children, breadcrumbAddon }: BreadcrumbHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full mb-6 sm:mb-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto">
        <button
          onClick={handleBack}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-secondary-400 hover:bg-surface-muted hover:text-primary-300 transition-all group shrink-0"
          title="Go back"
        >
          <ChevronLeft className="size-5 transition-transform group-hover:-translate-x-0.5" />
        </button>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
          <nav className="flex flex-wrap items-center gap-1.5 sm:gap-3 min-w-0">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5 sm:gap-3">
                {index > 0 && (
                  <span className="text-[16px] sm:text-[24px] font-bold font-heading text-neutral-600 leading-[24px] sm:leading-[36px]">/</span>
                )}
                {item.href && !item.active ? (
                  <button
                    onClick={() => router.push(item.href!)}
                    className="text-[16px] sm:text-[24px] font-bold font-heading text-neutral-600 hover:text-primary-300 transition-colors whitespace-nowrap outline-none leading-[24px] sm:leading-[36px]"
                  >
                    {item.label}
                  </button>
                ) : (
                  <span
                    className={cn(
                      "text-[16px] sm:text-[24px] font-bold font-heading whitespace-nowrap leading-[24px] sm:leading-[36px]",
                      item.active ? "text-primary-300" : "text-neutral-600"
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </div>
            ))}
          </nav>
          
          {breadcrumbAddon && (
            <div className="shrink-0 flex items-center ml-1">
              {breadcrumbAddon}
            </div>
          )}
        </div>
      </div>

      {children && (
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto pl-11 sm:pl-0">
          {children}
        </div>
      )}
    </div>
  );
}
