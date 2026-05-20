"use client";

import { useSearchParams } from "next/navigation";
import { OrganizationOverview } from "@/features/organizations/organization-overview";
import { PartnerOverview } from "@/features/organizations/partner-overview";
import { ProjectOverview } from "@/features/projects/project-overview";
import { Sparkles, Rocket, ArrowRight } from "lucide-react";
import { Suspense } from "react";

export default function OverviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OverviewContent />
    </Suspense>
  );
}

function OverviewContent() {
  const searchParams = useSearchParams();
  const orgId = searchParams.get("orgId");
  const projectId = searchParams.get("projectId");
  const view = searchParams.get("view");

  if (view === "partner") {
    return <PartnerOverview />;
  }

  if (orgId && !projectId) {
    return <OrganizationOverview orgId={orgId} />;
  }

  if (projectId) {
    return <ProjectOverview projectId={projectId} />;
  }

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center p-6 font-sans transition-colors duration-500">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-surface p-12 text-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-border animate-in fade-in zoom-in-95 duration-1000 ease-out">
        {/* Decorative background glows */}
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-primary-100/20 blur-3xl animate-pulse-once" />
        <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-primary-100/20 blur-3xl animate-pulse-once" />
        
        <div className="relative space-y-10">
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-6 rounded-full bg-primary-100/30 blur-2xl animate-pulse-once group-hover:bg-primary-200/30 transition-colors duration-500" />
              <div className="relative flex size-28 items-center justify-center rounded-3xl bg-primary-300 text-white shadow-2xl shadow-primary-300/40 -rotate-2 group-hover:rotate-0 transition-transform duration-500 ease-out">
                <Rocket className="size-14 animate-bounce-once" />
              </div>
              <div className="absolute -right-5 -top-5 flex size-12 items-center justify-center rounded-full bg-surface text-primary-300 shadow-lg animate-bounce-once [animation-delay:300ms] border border-border">
                <Sparkles className="size-6" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-[28px] font-bold font-heading tracking-tight text-foreground">
              Welcome to <span className="text-primary-300">Rogo</span>
            </h2>
            <p className="mx-auto max-w-lg text-[15px] text-neutral-500 font-medium leading-relaxed">
              Your intelligent dashboard for seamless organization management and deep project insights.
            </p>
          </div>

          <div className="flex flex-col items-center gap-6 pt-6">
            <div className="flex items-center gap-4 rounded-full bg-surface-muted px-8 py-3.5 border border-border shadow-sm animate-in slide-in-from-bottom-6 fade-in duration-1000 delay-500">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary-100/20 text-primary-300">
                <ArrowRight className="size-4 animate-pulse-once" />
              </div>
              <span className="text-[14px] font-semibold text-neutral-500 font-heading">Select an entity from the sidebar to begin</span>
            </div>
            
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="h-2 w-2 rounded-full bg-primary-300/40 animate-pulse-once" 
                  style={{ animationDelay: `${i * 300}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 flex items-center gap-6 text-neutral-500 animate-in fade-in duration-1000 delay-1000">
        <span className="text-[11px] font-bold tracking-[0.2em] uppercase opacity-60">Next-Gen Admin Panel</span>
        <div className="h-1 w-1 rounded-full bg-border" />
        <span className="text-[11px] font-bold tracking-[0.2em] uppercase opacity-60">Real-time Insights</span>
      </div>
    </div>
  );
}
