import type { Metadata } from "next";

import { Providers } from "@/lib/components/providers";
import { EMPTY_PARTNER_SESSION } from "@/lib/config/session";
import { getSessionCookie } from "@/lib/server/session";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Rogo Partner Dashboard",
    template: "%s · Rogo Partner Dashboard",
  },
  description: "Reference partner dashboard shell for the Next.js admin app.",
  icons: {
    icon: "/web_icon.png",
  },
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
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full bg-white text-neutral-900" suppressHydrationWarning>
        <Providers initialSession={session}>{children}</Providers>
      </body>
    </html>
  );
}
