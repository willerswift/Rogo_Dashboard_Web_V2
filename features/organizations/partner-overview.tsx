"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Building2, LayoutDashboard, Users, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { listOrganizations, listOrganizationUsers } from "@/lib/api/organization";
import { listProjects } from "@/lib/api/project";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import type { OrgWithOwner, Project, OrganizationMember } from "@/lib/types/partner";
import { LoadingBlock, SearchInput } from "@/features/shared/ui";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";

type OrgSummary = OrgWithOwner & {
  projectCount: number;
  memberCount: number;
};

export function PartnerOverview() {
  const { session } = usePartnerContext();
  const partnerId = session.activePartnerId;
  const router = useRouter();

  const [orgSummaries, setOrgSummaries] = useState<OrgSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const load = useCallback(async () => {
    if (!partnerId) return;
    try {
      setLoading(true);
      
      // 1. Fetch organizations and all partner projects
      const [orgs, allProjects] = await Promise.all([
        listOrganizations(partnerId),
        listProjects(partnerId),
      ]);

      // 2. Fetch member counts for each organization in parallel
      // (This is okay because typically there aren't hundreds of orgs)
      const summaries = await Promise.all(
        orgs.map(async (org) => {
          try {
            const members = await listOrganizationUsers(partnerId, org.orgId);
            const orgProjects = allProjects.filter(p => p.orgId === org.orgId);
            return {
              ...org,
              projectCount: orgProjects.length,
              memberCount: members.length,
            };
          } catch (error) {
            console.error(`Failed to fetch users for org ${org.orgId}`, error);
            const orgProjects = allProjects.filter(p => p.orgId === org.orgId);
            return {
              ...org,
              projectCount: orgProjects.length,
              memberCount: 0,
            };
          }
        })
      );

      setOrgSummaries(summaries);
    } catch (error) {
      console.error("Failed to load partner overview", error);
      toast.error("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredOrgs = orgSummaries.filter((org) => {
    const query = searchQuery.toLowerCase();
    return (
      org.name.toLowerCase().includes(query) ||
      org.orgId.toLowerCase().includes(query)
    );
  });

  if (loading) return <LoadingBlock label="Loading organizations..." />;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-[28px] font-bold font-heading text-foreground tracking-tight">Partner Overview</h1>
          <div className="flex items-center h-6 px-2.5 rounded-lg bg-primary-100/20 text-[11px] font-bold text-primary-300 uppercase">
            {session.activePartnerId || "ROGO"}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center h-7 px-3 rounded-full bg-surface-muted border border-border text-[12px] font-bold text-neutral-500 gap-1.5">
            <Building2 className="size-3" />
            {orgSummaries.length} Organizations
          </div>
        </div>
      </div>

      {/* Organizations Table Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold font-heading text-foreground tracking-tight">All Organizations</h3>
          <SearchInput
            placeholder="Search organization name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[300px]"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-surface-muted/50 border-b border-border text-[12px] font-bold uppercase tracking-wider text-neutral-500 font-sans">
                <th className="px-6 py-4">Organization Name</th>
                <th className="px-6 py-4">Organization ID</th>
                <th className="px-6 py-4">Projects</th>
                <th className="px-6 py-4">Members</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4">Updated Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-neutral-400 font-medium">
                    {searchQuery ? "No organizations found matching your search." : "No organizations found."}
                  </td>
                </tr>
              ) : (
                filteredOrgs.map((org, idx) => (
                  <tr 
                    key={org.orgId} 
                    onClick={() => router.push(`/overview?orgId=${org.orgId}`)}
                    className={cn(
                      "group transition-colors cursor-pointer",
                      idx % 2 === 1 ? "bg-surface-muted/30" : "bg-surface",
                      "hover:bg-primary-300/5"
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary-100/20 text-primary-300">
                          <Building2 className="size-4" />
                        </div>
                        <span className="font-bold text-foreground group-hover:text-primary-300 transition-colors">
                          {org.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-[12px] font-bold text-neutral-400 uppercase tracking-tight">
                        {org.orgId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-neutral-600 font-semibold">
                        <LayoutDashboard className="size-3.5 text-neutral-400" />
                        {org.projectCount}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-neutral-600 font-semibold">
                        <Users className="size-3.5 text-neutral-400" />
                        {org.memberCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-neutral-500">
                      {org.createdDate ? formatDate(org.createdDate) : "—"}
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-neutral-500">
                      {/* Assuming createdDate as fallback if updatedAt not available */}
                      {org.createdDate ? formatDate(org.createdDate) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          <div className="flex items-center justify-between bg-surface border-t border-border px-6 py-4">
            <div className="text-[13px] font-medium text-neutral-500">
              Showing <span className="text-foreground font-bold">{filteredOrgs.length > 0 ? 1 : 0}</span> to <span className="text-foreground font-bold">{filteredOrgs.length}</span> of <span className="text-foreground font-bold">{filteredOrgs.length}</span> entries
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
