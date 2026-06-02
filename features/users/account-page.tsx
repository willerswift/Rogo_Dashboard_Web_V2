"use client";

import { useState, useMemo } from "react";
import { Shield, Mail } from "lucide-react";
import { toast } from "sonner";

import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import {
  Panel,
  Field,
  TextInput,
  PasswordInput,
  PrimaryButton,
  SecondaryButton,
} from "@/features/shared/ui";
import { cn } from "@/lib/utils/cn";

export function AccountPage() {
  const { session } = usePartnerContext();
  const displayName = session.email.split("@")[0];
  const [username, setUsername] = useState(displayName);
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveAccountInfo = () => {
    toast.success("Account information updated successfully.");
  };

  const handleSaveSecurity = () => {
    toast.success("Password updated successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Password Strength Logic
  const strengthInfo = useMemo(() => {
    if (!newPassword) return { score: 0, label: "", color: "bg-neutral-100" };
    
    let score = 0;
    // 1. Length >= 8
    if (newPassword.length >= 8) score += 1;
    // 2. Contains uppercase
    if (/[A-Z]/.test(newPassword)) score += 1;
    // 3. Contains number
    if (/[0-9]/.test(newPassword)) score += 1;
    // 4. Contains special character
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 1) return { score: 1, label: "WEAK", color: "bg-red-400" };
    if (score === 2) return { score: 2, label: "MEDIUM", color: "bg-yellow-500" };
    if (score === 3) return { score: 3, label: "MEDIUM", color: "bg-yellow-500" };
    return { score: 4, label: "STRONG", color: "bg-green-500" };
  }, [newPassword]);

  const isPasswordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isLengthInvalid = newPassword.length > 0 && newPassword.length < 8;
  const isFormFilled = currentPassword.length > 0 && newPassword.length > 0 && confirmPassword.length > 0;
  const isFormValid = isFormFilled && !isPasswordMismatch && !isLengthInvalid && strengthInfo.score >= 2;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left Column */}
      <div className="space-y-6 font-sans">
        {/* Account Information Card */}
        <Panel
          title="Account Information"
          action={<span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">ID: RO-8829-X</span>}
        >
          <div className="px-6 py-4">
            <div className="flex flex-col gap-8 md:flex-row md:items-start">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-surface text-2xl font-bold text-neutral-400 border border-border">
                JD
              </div>

              <div className="flex-1 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Username">
                    <TextInput
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full"
                    />
                  </Field>
                  <Field label="Email Address">
                    <div className="relative">
                      <TextInput
                        value={session.email}
                        readOnly
                        className="w-full bg-surface-muted pr-10 text-neutral-500 cursor-not-allowed border-dashed"
                      />
                      <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
                    </div>
                  </Field>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <PrimaryButton onClick={handleSaveAccountInfo}>
                Save Changes
              </PrimaryButton>
            </div>
          </div>
        </Panel>

        {/* Account Details Card */}
        <Panel
          title="Account Details"
          action={
            <div className="flex items-center gap-2 rounded-full bg-green-100/10 px-3 py-1 text-[10px] font-bold text-green-500 border border-green-500/20">
              <span className="size-2 rounded-full bg-green-500 animate-pulse" />
              ACTIVE
            </div>
          }
        >
          <div className="px-6 py-4 flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Partner Agency</p>
              <p className="mt-1.5 text-[14px] font-bold text-foreground">Rogo Global</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Member Since</p>
              <p className="mt-1.5 text-[14px] font-bold text-foreground">Oct 12, 2022</p>
            </div>
          </div>
        </Panel>
      </div>

      {/* Right Column - Security */}
      <div className="space-y-6 font-sans">
        <Panel
          title="Change Password"
          action={<Shield className="size-5 text-neutral-500" />}
        >
          <div className="px-6 py-4 space-y-5">
            <Field label="Current Password">
              <PasswordInput
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full"
              />
            </Field>

            <div className="space-y-3">
              <Field 
                label="New Password"
                error={isLengthInvalid ? "Password must be at least 8 characters." : undefined}
                footer={
                  <div className="mt-2 space-y-3">
                    {/* Strength Factors Description - Single Line (Moved UP) */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <div className={cn("flex items-center gap-1.5 transition-colors", newPassword.length >= 8 ? "text-primary-300" : "text-neutral-400")}>
                        <div className={cn("size-1 rounded-full", newPassword.length >= 8 ? "bg-primary-300" : "bg-neutral-300")} />
                        <span className="text-[12px] font-medium font-sans">8 characters</span>
                      </div>
                      <div className={cn("flex items-center gap-1.5 transition-colors", /[A-Z]/.test(newPassword) ? "text-primary-300" : "text-neutral-400")}>
                        <div className={cn("size-1 rounded-full", /[A-Z]/.test(newPassword) ? "bg-primary-300" : "bg-neutral-300")} />
                        <span className="text-[12px] font-medium font-sans">1 uppercase</span>
                      </div>
                      <div className={cn("flex items-center gap-1.5 transition-colors", /[0-9]/.test(newPassword) ? "text-primary-300" : "text-neutral-400")}>
                        <div className={cn("size-1 rounded-full", /[0-9]/.test(newPassword) ? "bg-primary-300" : "bg-neutral-300")} />
                        <span className="text-[12px] font-medium font-sans">Numbers</span>
                      </div>
                      <div className={cn("flex items-center gap-1.5 transition-colors", /[^A-Za-z0-9]/.test(newPassword) ? "text-primary-300" : "text-neutral-400")}>
                        <div className={cn("size-1 rounded-full", /[^A-Za-z0-9]/.test(newPassword) ? "bg-primary-300" : "bg-neutral-300")} />
                        <span className="text-[12px] font-medium font-sans">Special characters</span>
                      </div>
                    </div>

                    {/* Multi-segment Strength Meter (Moved DOWN) */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1 flex gap-1.5 h-1.5">
                        {[1, 2, 3, 4].map((seg) => (
                          <div
                            key={seg}
                            className={cn(
                              "flex-1 rounded-full transition-all duration-300",
                              seg <= strengthInfo.score ? strengthInfo.color : "bg-neutral-100"
                            )}
                          />
                        ))}
                      </div>
                      {strengthInfo.label && (
                        <span className={cn("text-[10px] font-bold tracking-widest uppercase shrink-0", 
                          strengthInfo.score === 1 ? "text-red-400" : 
                          strengthInfo.score === 2 || strengthInfo.score === 3 ? "text-yellow-500" : "text-green-500"
                        )}>
                          {strengthInfo.label}
                        </span>
                      )}
                    </div>
                  </div>
                }
              >
                <PasswordInput
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  invalid={isLengthInvalid}
                  className="w-full"
                />
              </Field>
            </div>

            <Field 
              label="Confirm New Password" 
              error={isPasswordMismatch ? "Passwords do not match." : undefined}
            >
              <PasswordInput
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                invalid={isPasswordMismatch}
                className="w-full"
              />
            </Field>

            <div className="mt-10 pt-6 border-t border-border flex justify-end">
              <PrimaryButton
                onClick={handleSaveSecurity}
                disabled={!isFormFilled}
                className={cn(!isFormValid && isFormFilled && "opacity-50 cursor-not-allowed")}
              >
                Save Changes
              </PrimaryButton>
            </div>
          </div>
        </Panel>
      </div>

      {/* Bottom Banner */}
      <div className="lg:col-span-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between rounded-xl border border-primary-300/20 bg-primary-100/10 p-4 pl-0 gap-4 overflow-hidden">
          <div className="flex items-start gap-3 sm:gap-5">
            <div className="w-1.5 bg-primary-300 rounded-r-full self-stretch min-h-[80px]" />
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface mt-2 sm:mt-1">
              <Shield className="size-5 text-primary-300" />
            </div>
            <div className="space-y-1 py-1 pr-4 sm:pr-0">
              <h4 className="text-[14px] font-bold text-primary-300">Administrative Permission Management</h4>
              <p className="text-[13px] leading-relaxed text-neutral-500 max-w-4xl">
                Your account is currently governed by the Enterprise Security Policy. Some profile settings, including organizational mapping and core authentication methods, are locked by your administrator. If you believe your access level or profile data is incorrect, please contact the Rogo Solutions internal support desk.
              </p>
            </div>
          </div>
          <div className="pl-6 md:pl-0 pr-6 shrink-0 pb-2 md:pb-0">
            <SecondaryButton className="border-primary-300 text-primary-300 hover:bg-primary-300 hover:text-white transition-all w-full md:w-auto">
              Request access change
            </SecondaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
