"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, Lock, User, ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/utils/cn";

const registerSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  fullName: z.string().min(1, "Full name is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(1, "Please confirm your password."),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Account created successfully!");
      window.location.href = "/login";
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    }
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-zinc-700" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#3B4AD0]">
              <Mail className="h-[18px] w-[18px]" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="jane@company.com"
              {...register("email")}
              className={cn(
                "block w-full h-[44px] pl-11 pr-3 bg-white rounded-lg border border-zinc-200 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-300/10 focus:border-primary-300 transition-all",
                "autofill:shadow-[0_0_0_30px_white_inset]",
                errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
              )}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Full Name Field */}
        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-zinc-700" htmlFor="fullName">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#3B4AD0]">
              <User className="h-[18px] w-[18px]" />
            </div>
            <input
              id="fullName"
              type="text"
              placeholder="Jane Doe"
              {...register("fullName")}
              className={cn(
                "block w-full h-[44px] pl-11 pr-3 bg-white rounded-lg border border-zinc-200 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-300/10 focus:border-primary-300 transition-all",
                "autofill:shadow-[0_0_0_30px_white_inset]",
                errors.fullName && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
              )}
            />
          </div>
          {errors.fullName && (
            <p className="text-xs font-medium text-red-500 mt-1">{errors.fullName.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-zinc-700" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#3B4AD0]">
              <Lock className="h-[18px] w-[18px]" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              className={cn(
                "block w-full h-[44px] pl-11 pr-11 bg-white rounded-lg border border-zinc-200 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-300/10 focus:border-primary-300 transition-all",
                "autofill:shadow-[0_0_0_30px_white_inset]",
                errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#5E618E] hover:text-[#3B4AD0] transition-colors"
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

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-zinc-700" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#3B4AD0]">
              <ShieldCheck className="h-[18px] w-[18px]" />
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("confirmPassword")}
              className={cn(
                "block w-full h-[44px] pl-11 pr-11 bg-white rounded-lg border border-zinc-200 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-300/10 focus:border-primary-300 transition-all",
                "autofill:shadow-[0_0_0_30px_white_inset]",
                errors.confirmPassword && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#5E618E] hover:text-[#3B4AD0] transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-[18px] w-[18px]" />
              ) : (
                <Eye className="h-[18px] w-[18px]" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs font-medium text-red-500 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="agreeToTerms"
          {...register("agreeToTerms")}
          className="h-4 w-4 rounded border-zinc-300 text-primary-300 focus:ring-primary-300"
        />
        <label htmlFor="agreeToTerms" className="text-[13px] text-zinc-600 cursor-pointer">
          By signing up, you agree to our Terms
        </label>
      </div>
      {errors.agreeToTerms && (
        <p className="text-xs font-medium text-red-500">{errors.agreeToTerms.message}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "w-full h-11 flex items-center justify-center rounded-full bg-primary-300 text-white text-[15px] font-bold transition-all hover:bg-[#E62E5F] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary-300/20"
        )}
      >
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
        Sign up
      </button>

      <div className="text-center">
        <p className="text-[13px] text-zinc-600">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-primary-300 hover:underline" style={{ color: '#FF356A' }}>
            Login
          </Link>
        </p>
      </div>
    </form>
  );
}
