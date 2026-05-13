"use client";

import { useState, useMemo } from "react";
import { Shield, Mail } from "lucide-react";
import { toast } from "sonner";

import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import {
  Panel,
  Field,
  TextInput,
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
    if (newPassword.length >= 8) score += 1;
    if (newPassword.length >= 12) score += 1;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 1) return { score: 1, label: "WEAK", color: "bg-red-400" };
    if (score === 2) return { score: 2, label: "MEDIUM", color: "bg-yellow-500" };
    if (score === 3) return { score: 3, label: "MEDIUM", color: "bg-yellow-500" };
    return { score: 4, label: "STRONG", color: "bg-green-500" };
  }, [newPassword]);

  const isPasswordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isLengthInvalid = newPassword.length > 0 && newPassword.length < 12;
  const isFormFilled = currentPassword.length > 0 && newPassword.length > 0 && confirmPassword.length > 0;
  const isFormValid = isFormFilled && !isPasswordMismatch && !isLengthInvalid && strengthInfo.score >= 2;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left Column */}
      <div className="space-y-6 font-sans">
        {/* Account Information Card */}
        <Panel
          title="Account Information"
          action={<span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">ID: RO-8829-X</span>}
        >
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-neutral-300 border border-neutral-100 shadow-sm">
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
                      className="w-full bg-neutral-50 pr-10 text-neutral-400 cursor-not-allowed border-dashed"
                    />
                    <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
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
        </Panel>

        {/* Account Details Card */}
        <Panel
          title="Account Details"
          action={
            <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold text-green-600 border border-green-100">
              <span className="size-2 rounded-full bg-green-500 animate-pulse" />
              ACTIVE
            </div>
          }
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Partner Agency</p>
              <p className="mt-1.5 text-[14px] font-bold text-neutral-900">Rogo Global</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Member Since</p>
              <p className="mt-1.5 text-[14px] font-bold text-neutral-900">Oct 12, 2022</p>
            </div>
          </div>
        </Panel>
      </div>

      {/* Right Column - Security */}
      <div className="space-y-6 font-sans">
        <Panel
          title="Security"
          action={<Shield className="size-5 text-neutral-300" />}
        >
          <div className="space-y-5">
            <Field label="Current Password">
              <TextInput
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full"
              />
            </Field>

            <div className="space-y-3">
              <Field 
                label="New Password"
                error={isLengthInvalid ? "Password must be at least 12 characters." : undefined}
              >
                <TextInput
                  type="password"
                  placeholder="Minimum 12 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  invalid={isLengthInvalid}
                  className="w-full"
                />
              </Field>
              
              {/* Multi-segment Strength Meter */}
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

            <Field 
              label="Confirm New Password" 
              error={isPasswordMismatch ? "Passwords do not match." : undefined}
            >
              <TextInput
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                invalid={isPasswordMismatch}
                className="w-full"
              />
            </Field>
          </div>

          <div className="mt-10 pt-6 border-t border-neutral-100 flex justify-end">
            <PrimaryButton
              onClick={handleSaveSecurity}
              disabled={!isFormFilled}
              className={cn(!isFormValid && isFormFilled && "opacity-50 cursor-not-allowed shadow-none")}
            >
              Save Changes
            </PrimaryButton>
          </div>
        </Panel>
      </div>

      {/* Bottom Banner */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between rounded-xl border border-primary-100 bg-primary-100/5 p-4 pl-0 overflow-hidden shadow-sm">
          <div className="flex items-center gap-5">
            <div className="h-20 w-1.5 bg-primary-300 rounded-r-full" />
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-primary-100 bg-white shadow-sm">
              <Shield className="size-5 text-primary-300" />
            </div>
            <div className="space-y-1">
              <h4 className="text-[14px] font-bold text-primary-400">Administrative Permission Management</h4>
              <p className="text-[13px] leading-relaxed text-neutral-500 max-w-4xl">
                Your account is currently governed by the Enterprise Security Policy. Some profile settings, including organizational mapping and core authentication methods, are locked by your administrator. If you believe your access level or profile data is incorrect, please contact the Rogo Solutions internal support desk.
              </p>
            </div>
          </div>
          <div className="pr-6">
            <SecondaryButton className="border-primary-300 text-primary-300 hover:bg-primary-300 hover:text-white transition-all shadow-sm">
              Request access change
            </SecondaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
