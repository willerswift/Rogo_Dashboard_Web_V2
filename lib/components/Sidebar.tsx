"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Box, Building2, FolderKanban, ShieldCheck, Users } from "lucide-react";

import { Badge } from "@/lib/components/ui/badge";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import { cn } from "@/lib/utils/cn";
import { getAccessibleNavItems } from "@/lib/utils/permissions";

const ICONS: Record<string, LucideIcon> = {
  "/overview": Building2,
  "/organizations": Building2,
  "/projects": FolderKanban,
  "/products": Box,
  "/users": Users,
  "/permissions": ShieldCheck,
};

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarLink({
  href,
  title,
  icon: Icon,
  active,
  compact,
}: {
  href: string;
  title: string;
  icon: LucideIcon;
  active: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group inline-flex items-center gap-3 rounded-md text-sm font-medium transition-colors",
        compact
          ? "min-h-10 whitespace-nowrap border border-border/80 px-3 py-2"
          : "w-full px-3 py-2.5",
        active
          ? "border-accent/20 bg-accent/10 text-accent"
          : "text-muted-foreground hover:border-border hover:bg-surface-subtle hover:text-foreground",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      <span>{title}</span>
    </Link>
  );
}

export function Sidebar({ mode = "desktop" }: { mode?: "desktop" | "mobile" }) {
  const pathname = usePathname();
  const { session } = usePartnerContext();
  const items = getAccessibleNavItems(session);

  if (mode === "mobile") {
    return (
      <nav aria-label="Primary navigation" className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {items.length > 0 ? (
          items.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              title={item.title}
              icon={ICONS[item.href]}
              active={isActivePath(pathname, item.href)}
              compact
            />
          ))
        ) : (
          <div className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
            No accessible sections yet.
          </div>
        )}
      </nav>
    );
  }

  return (
    <aside className="hidden w-72 shrink-0 border-r border-border/80 bg-surface lg:sticky lg:top-0 lg:flex lg:h-dvh lg:self-start lg:flex-col lg:overflow-hidden">
      <div className="flex h-full min-h-0 flex-col px-5 py-6">
        <div className="shrink-0 space-y-4 border-b border-border/80 pb-6">
          <div className="space-y-2">
            <Badge variant="accent" className="w-fit">Partner dashboard</Badge>
            <div>
              <p className="text-xl font-semibold tracking-tight text-foreground">Rogo reference</p>
              <p className="text-sm leading-6 text-muted-foreground">
                Minimal workspace shell for partner operations.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-border/80 bg-surface-subtle/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Active partner
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {session.activePartnerId ?? "No partner selected"}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{session.email || "No active session"}</p>
          </div>
        </div>

        <nav aria-label="Primary navigation" className="mt-6 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1">
          {items.length > 0 ? (
            items.map((item) => (
              <SidebarLink
                key={item.href}
                href={item.href}
                title={item.title}
                icon={ICONS[item.href]}
                active={isActivePath(pathname, item.href)}
              />
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-border px-4 py-5 text-sm leading-6 text-muted-foreground">
              This session does not currently expose any navigation entries.
            </div>
          )}
        </nav>

        <div className="shrink-0 border-t border-border/80 pt-5 text-xs leading-5 text-muted-foreground">
          Navigation is filtered directly from the ABAC action strings already present in the session.
        </div>
      </div>
    </aside>
  );
}
