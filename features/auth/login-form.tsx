"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

import { login, updateActivePartner } from "@/lib/api/auth";
import { cn } from "@/lib/utils/cn";
import { CheckboxInput } from "@/features/shared/ui";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Load remembered credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rogo-remember-email");
    const savedPassword = localStorage.getItem("rogo-remember-password");
    const savedRememberMe = localStorage.getItem("rogo-remember-me") === "true";

    if (savedRememberMe && savedEmail) {
      setValue("email", savedEmail);
      if (savedPassword) setValue("password", savedPassword);
      setValue("rememberMe", true);
    }
  }, [setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const { session } = await login(values);
      
      // Handle Remember Me
      if (values.rememberMe) {
        localStorage.setItem("rogo-remember-email", values.email);
        localStorage.setItem("rogo-remember-password", values.password);
        localStorage.setItem("rogo-remember-me", "true");
      } else {
        localStorage.removeItem("rogo-remember-email");
        localStorage.removeItem("rogo-remember-password");
        localStorage.removeItem("rogo-remember-me");
      }

      // Restore last active partner if it belongs to this user
      const lastPartner = localStorage.getItem("rogo-last-active-partner");
      if (lastPartner && session.partnerIds.includes(lastPartner) && session.activePartnerId !== lastPartner) {
        try {
          await updateActivePartner(lastPartner);
        } catch (e) {
          console.warn("Failed to restore last active partner", e);
        }
      }

      toast.success("Signed in successfully.");
      window.location.href = "/";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed.";
      toast.error(message);
    }
  });

  return (
    <form className="space-y-7" onSubmit={onSubmit}>
      <div className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2.5">
          <label className="text-[13px] font-semibold text-foreground" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-primary-300">
              <Mail className="h-[18px] w-[18px]" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              {...register("email")}
              className={cn(
                "block w-full h-10 pl-11 pr-3 bg-surface rounded-[6px] border border-border text-sm placeholder:text-neutral-500 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300/10 focus:border-primary-300 transition-all",
                " autofill:text-fill-foreground",
                errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
              )}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2.5">
          <label className="text-[13px] font-semibold text-foreground" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-primary-300">
              <Lock className="h-[18px] w-[18px]" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              className={cn(
                "block w-full h-10 pl-11 pr-11 bg-surface rounded-[6px] border border-border text-sm placeholder:text-neutral-500 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300/10 focus:border-primary-300 transition-all",
                " autofill:text-fill-foreground",
                errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400 hover:text-primary-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-[18px] w-[18px]" />
              ) : (
                <Eye className="h-[18px] w-[18px]" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer group">
          <CheckboxInput
            {...register("rememberMe")}
          />
          <span className="text-[13px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">Remember me</span>
        </label>
        <Link
          href="/forgot-password"
          className="text-[14px] font-semibold hover:opacity-80 transition-opacity font-heading"
          style={{ color: 'var(--brand-primary)' }}
        >
          Forgot password?
        </Link>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "w-full inline-flex h-[40px] px-3 py-2 gap-2 items-center justify-center rounded-full bg-primary-300 text-white text-[14px] font-semibold transition-all hover:bg-primary-400 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed font-heading"
        )}
      >
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
        Login
      </button>

      <div className="pt-4 text-center">
        <p className="text-[13px] text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/register" className="text-[14px] font-semibold hover:underline font-heading" style={{ color: 'var(--brand-primary)' }}>
            Register
          </Link>
        </p>
      </div>
    </form>
  );
}
