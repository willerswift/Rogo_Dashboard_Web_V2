"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { logout } from "@/lib/api/auth";
import { Button } from "@/lib/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleLogout() {
    try {
      setSubmitting(true);
      await logout();
      toast.success("Signed out.");
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign out.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={() => void handleLogout()} disabled={submitting}>
      <LogOut className="size-4" />
      Logout
    </Button>
  );
}
