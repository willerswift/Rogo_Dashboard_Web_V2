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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var color = localStorage.getItem('rogo-primary-color');
                  var theme = localStorage.getItem('rogo-theme-mode');
                  var logo = localStorage.getItem('rogo-logo-url');
                  var favicon = localStorage.getItem('rogo-favicon-url');
                  
                  if (color) {
                    document.documentElement.style.setProperty('--brand-primary', color);
                  }
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                  if (favicon) {
                    var link = document.querySelector("link[rel~='icon']");
                    if (link) link.href = favicon;
                  }
                  // Store logo in a global for client components to access before mount if needed
                  window.__ROGO_LOGO__ = logo;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full" suppressHydrationWarning>
        <Providers initialSession={session}>{children}</Providers>
      </body>
    </html>
  );
}
