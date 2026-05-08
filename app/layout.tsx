import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";

import { Providers } from "@/lib/components/providers";
import { EMPTY_PARTNER_SESSION } from "@/lib/config/session";
import { getSessionCookie } from "@/lib/server/session";

import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Rogo Partner Dashboard",
    template: "%s · Rogo Partner Dashboard",
  },
  description: "Reference partner dashboard shell for the Next.js admin app.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = (await getSessionCookie()) ?? EMPTY_PARTNER_SESSION;

  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-neutral-900">
        <Providers initialSession={session}>{children}</Providers>
      </body>
    </html>
  );
}
