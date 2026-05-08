"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, MoreVertical } from "lucide-react";
import Link from "next/link";

import { getOrganization, listOrganizationUsers } from "@/lib/api/organization";
import { listProjects } from "@/lib/api/project";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import type { OrgWithOwner, Project, OrganizationMember } from "@/lib/types/partner";
import { LoadingBlock, EmptyState, PrimaryButton } from "@/features/shared/ui";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";

export function OrganizationOverview({ orgId }: { orgId: string }) {
  const { session } = usePartnerContext();
  const partnerId = session.activePartnerId;

  const [org, setOrg] = useState<OrgWithOwner | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!partnerId || !orgId) return;
      try {
        setLoading(true);
        const [nextOrg, nextProjects, nextMembers] = await Promise.all([
          getOrganization(partnerId, orgId),
          listProjects(partnerId, orgId),
          listOrganizationUsers(partnerId, orgId),
        ]);
        setOrg(nextOrg);
        setProjects(nextProjects);
        setMembers(nextMembers);
      } catch (error) {
        toast.error("Failed to load organization details");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [partnerId, orgId]);

  if (loading) return <LoadingBlock label="Loading organization..." />;
  if (!org) return <EmptyState title="Not found" description="Select an organization from the tree." />;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-[32px] font-bold font-heading text-neutral-1000 tracking-tight">{org.name}</h1>
          <div className="flex items-center h-6 px-2.5 rounded-lg bg-[#E6E8F4] text-[11px] font-bold text-[#393984] uppercase">
            ID: {org.orgId}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center h-7 px-3 rounded-full bg-[#FFEBF0] text-[10px] font-bold text-[#FD3566] uppercase tracking-wider">
            ORG
          </div>
          <div className="flex items-center h-7 px-3 rounded-full bg-neutral-100 text-[12px] font-bold text-neutral-600 gap-1.5">
            <Users className="size-3" />
            {members.length} Members
          </div>
          <div className="flex items-center h-7 px-3 rounded-full bg-neutral-100 text-[12px] font-bold text-neutral-600 gap-1.5">
            <LayoutDashboard className="size-3" />
            {projects.length} Projects
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold font-heading text-neutral-900 tracking-tight">Project in Organization</h3>
          <PrimaryButton className="h-10 rounded-full px-5 bg-[#FD3566] hover:bg-[#EA023B] text-[13px] font-bold shadow-md shadow-[#FD3566]/20 transition-all">
            <Plus className="mr-2 size-4 stroke-[3px]" />
            Create Project
          </PrimaryButton>
        </div>
        
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-neutral-100 text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-400">
                <th className="px-8 py-5">Name</th>
                <th className="px-8 py-5">Project ID</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Created</th>
                <th className="px-8 py-5">Created By</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-neutral-400 font-medium">
                    No projects found in this organization.
                  </td>
                </tr>
              ) : (
                projects.map((project, idx) => (
                  <tr key={project.uuid} className={cn(
                    "group transition-colors",
                    idx % 2 === 1 ? "bg-neutral-50/30" : "bg-white",
                    "hover:bg-[#FFEBF0]/30"
                  )}>
                    <td className="px-8 py-5">
                      <Link 
                        href={`/overview?orgId=${orgId}&projectId=${project.uuid}`}
                        className="font-bold text-[#FD3566] hover:underline transition-all"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-mono text-[12px] font-bold text-neutral-400 tracking-tight uppercase">
                        {project.uuid.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1FC16B] uppercase tracking-wide">
                        <div className="h-2 w-2 rounded-full bg-[#1FC16B]" />
                        Active
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[13px] font-medium text-neutral-500">{formatDate(project.createdDate)}</td>
                    <td className="px-8 py-5 text-[13px] font-medium text-neutral-500">{formatDate(project.updatedDate)}</td>
                    <td className="px-8 py-5 text-right">
                      <button className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-all">
                        <MoreVertical className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          <div className="flex items-center justify-between bg-white border-t border-neutral-100 px-8 py-5">
            <div className="text-[13px] font-medium text-neutral-400">
              Showing <span className="text-neutral-900 font-bold">1</span> to <span className="text-neutral-900 font-bold">{projects.length}</span> of <span className="text-neutral-900 font-bold">{projects.length}</span> entries
            </div>
            <div className="flex gap-2">
              <button disabled className="h-9 px-4 rounded-lg border border-neutral-200 bg-white text-[13px] font-bold text-neutral-400 hover:bg-neutral-50 disabled:opacity-30 transition-all">Previous</button>
              <button disabled className="h-9 px-4 rounded-lg border border-neutral-200 bg-white text-[13px] font-bold text-neutral-400 hover:bg-neutral-50 disabled:opacity-30 transition-all">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Users, LayoutDashboard } from "lucide-react";
