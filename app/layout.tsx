import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { siteConfig } from "@/config/site";
import { createClient as createBrowserClient } from "@/utils/supabase/client";

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/eip-logo.svg",
        href: "/eip-logo.svg"
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/eip-logo-dark.svg",
        href: "/eip-logo-dark.svg"
      }
    ]
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createBrowserClient();
  const { data: proposals } = await supabase.from("proposals").select("*");

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{siteConfig.title}</title>
        <meta property="twitter:card" content="summary_large_image"></meta>
        <meta property="twitter:title" content={siteConfig.name}></meta>
        <meta property="twitter:description" content={siteConfig.description}></meta>
        <meta property="og:site_name" content={siteConfig.name}></meta>
        <meta property="og:description" content={siteConfig.description}></meta>
        <meta property="og:title" content={siteConfig.name}></meta>
        <meta property="og:url" content={siteConfig.url}></meta>
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="website-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
