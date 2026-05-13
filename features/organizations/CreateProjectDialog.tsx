"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { X, ChevronDown, Plus } from "lucide-react";

import { createProject } from "@/lib/api/project";
import { listOrganizations } from "@/lib/api/organization";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import type { OrgWithOwner } from "@/lib/types/partner";
import { cn } from "@/lib/utils/cn";
import { projectEvents } from "@/lib/utils/events";
import { CreateOrganizationDialog } from "./CreateOrganizationDialog";

const projectSchema = z.object({
  name: z.string().min(1, "Enter Project Name"),
  orgId: z.string().min(1, "Organization is required."),
});

type CreateProjectValues = z.infer<typeof projectSchema>;

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialOrgId?: string;
}

export function CreateProjectDialog({ open, onClose, onSuccess, initialOrgId }: CreateProjectDialogProps) {
  const { session } = usePartnerContext();
  const partnerId = session.activePartnerId;

  const [orgs, setOrgs] = useState<OrgWithOwner[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      orgId: initialOrgId || "",
    },
  });

  const selectedOrgId = watch("orgId");
  const selectedOrg = orgs.find(o => o.orgId === selectedOrgId);

  const loadOrgs = useCallback(async () => {
    if (!partnerId) return;
    try {
      setLoadingOrgs(true);
      const data = await listOrganizations(partnerId);
      setOrgs(data);
    } catch (error) {
      console.error("Failed to load organizations", error);
    } finally {
      setLoadingOrgs(false);
    }
  }, [partnerId]);

  useEffect(() => {
    if (open) {
      void loadOrgs();
      reset({
        name: "",
        orgId: initialOrgId || "",
      });
    }
  }, [open, initialOrgId, reset, loadOrgs]);

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    if (!partnerId) {
      toast.error("No active partner found.");
      return;
    }

    try {
      await createProject({
        partnerId,
        orgId: values.orgId,
        name: values.name,
        authorizedServices: [],
      });
      toast.success("Project created successfully.");
      reset();
      onClose();
      
      // Notify components that a project was created in this organization
      projectEvents.emit("projectCreated", values.orgId);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create project.");
    }
  });

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
        <div className="relative w-full max-w-[720px] rounded-[24px] bg-white p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="mb-8 flex items-center justify-between">
            <h5 className="text-[24px] font-bold text-[#1F244A] tracking-tight font-heading">Create New Project</h5>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-neutral-400 hover:bg-neutral-50 transition-colors"
            >
              <X className="size-6" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-8">
            {/* Organization Selector */}
            <div className="flex items-center gap-4">
              <span className="text-[17px] font-medium text-neutral-500">Add project to</span>
              <div className="relative flex-1" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex h-[52px] w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 text-[15px] transition-all hover:border-neutral-300"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-neutral-500">Organization:</span>
                    <span className="font-bold text-[#1F244A]">
                      {selectedOrg ? selectedOrg.name : "No Organization"}
                    </span>
                  </div>
                  <ChevronDown className={cn("size-5 text-neutral-400 transition-transform", isDropdownOpen && "rotate-180")} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-10 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[300px] overflow-y-auto py-2">
                      <button
                        type="button"
                        onClick={() => {
                          setValue("orgId", "");
                          setIsDropdownOpen(false);
                        }}
                        className={cn(
                          "flex w-full px-5 py-3 text-left text-[15px] transition-colors hover:bg-neutral-50",
                          !selectedOrgId ? "font-bold text-[#FD3566]" : "text-neutral-700"
                        )}
                      >
                        No Organization
                      </button>
                      {orgs.map((org) => (
                        <button
                          key={org.orgId}
                          type="button"
                          onClick={() => {
                            setValue("orgId", org.orgId);
                            setIsDropdownOpen(false);
                          }}
                          className={cn(
                            "flex w-full px-5 py-3 text-left text-[15px] transition-colors hover:bg-neutral-50",
                            selectedOrgId === org.orgId ? "font-bold text-[#FD3566]" : "text-neutral-700"
                          )}
                        >
                          {org.name}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setShowCreateOrg(true);
                      }}
                      className="flex w-full items-center gap-2 border-t border-neutral-100 px-5 py-4 text-[16px] font-semibold text-[#FD3566] transition-colors hover:bg-neutral-50 font-heading"
                    >
                      <Plus className="size-4 stroke-[3px]" />
                      Create New Organization
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Project Name Input */}
            <div className="space-y-3">
              <label className="text-[15px] font-bold text-[#1F244A]">
                Project Name<span className="text-[#FD3566] ml-1">*</span>
              </label>
              <input
                {...register("name")}
                placeholder="Enter Project name"
                className={cn(
                  "h-[52px] w-full rounded-xl border bg-white px-5 text-[15px] outline-none transition-all placeholder:text-neutral-300",
                  errors.name ? "border-[#FD3566]" : "border-neutral-200 focus:border-[#FD3566]"
                )}
              />
              {errors.name && (
                <p className="text-[13px] font-bold text-[#FD3566]">{errors.name.message}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-[40px] items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-[14px] font-semibold text-[#1F244A] hover:bg-neutral-50 transition-all font-heading"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-[40px] items-center justify-center gap-2 rounded-full bg-[#FD3566] px-3 py-2 text-[14px] font-semibold text-white shadow-md shadow-[#FD3566]/20 hover:bg-[#E62E5F] transition-all disabled:opacity-50 font-heading"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

      <CreateOrganizationDialog
        open={showCreateOrg}
        onClose={() => setShowCreateOrg(false)}
        onSuccess={(newOrgId) => {
          void loadOrgs();
          setValue("orgId", newOrgId);
        }}
      />
    </>
  );
}
