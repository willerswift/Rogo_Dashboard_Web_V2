import Image from "next/image";

import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-white">
      {/* Left side: Background and Branding (Consistent with Login) */}
      <div className="relative hidden w-full lg:flex lg:w-[40%] xl:w-[33%] overflow-hidden bg-[#0F172A]">
        <Image
          src="/BackgroundLogin.png"
          alt="Login background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-blue-900/10" />

        <div className="relative z-10 flex h-full w-full flex-col justify-between p-14 text-white">
          <div className="space-y-16">
            <div className="flex items-center">
              <Image
                src="/LogoRogo.svg"
                alt="Rogo Logo"
                width={130}
                height={36}
                className="h-auto w-auto"
              />
            </div>

            <div className="max-w-md space-y-7">
              <h1 className="text-[40px] font-bold leading-[1.1] tracking-tight text-white">
                Manage your partner ecosystem with precision.
              </h1>
              <p className="text-[17px] text-[#8E92B2] leading-relaxed font-normal">
                A high-performance command center for unified data, streamlined permissions, and scalable growth.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase">
            <span>© 2026 ROGO PLATFORM</span>
            <div className="flex gap-4 ml-auto items-center">
              <Image src="/icon1.svg" alt="Icon 1" width={16} height={16} className="opacity-60" />
              <Image src="/icon2.svg" alt="Icon 2" width={18} height={18} className="opacity-60" />
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Forgot Password Form */}
      <div className="flex flex-1 items-center justify-center bg-white p-6 sm:p-12 lg:p-24">
        <div className="w-full max-w-[420px] space-y-12">
          <div className="space-y-3">
            <h2 className="text-[36px] font-bold tracking-tight text-[#111827]">Forgot Password?</h2>
            <p className="text-[15px] text-zinc-500 font-medium">
              Enter your email to receive a reset link.
            </p>
          </div>

          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
