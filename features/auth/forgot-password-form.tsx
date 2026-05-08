"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";

import { cn } from "@/lib/utils/cn";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isSent, setIsSent] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Reset link sent to your email.");
      setIsSent(true);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  });

  if (isSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
          <Mail className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#111827]">Check your email</h2>
          <p className="text-sm text-zinc-500">
            We've sent a password reset link to your email address.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-bold hover:opacity-80 transition-opacity"
          style={{ color: '#393984' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-7" onSubmit={onSubmit}>
      <div className="space-y-5">
        <div className="space-y-2.5">
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
              placeholder="name@company.com"
              {...register("email")}
              className={cn(
                "block w-full h-[46px] pl-11 pr-3 bg-white rounded-lg border border-zinc-200 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rogo-pink/10 focus:border-rogo-pink transition-all",
                "autofill:shadow-[0_0_0_30px_white_inset]",
                errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
              )}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "w-full h-12 flex items-center justify-center rounded-full bg-rogo-pink text-white text-[15px] font-bold transition-all hover:bg-[#E62E5F] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-rogo-pink/20"
        )}
      >
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
        Send Reset Link
      </button>

      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-bold hover:opacity-70 transition-opacity"
          style={{ color: '#393984' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </div>
    </form>
  );
}
