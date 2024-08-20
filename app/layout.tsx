import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SearchCommand } from "@/components/search-command";
import { siteConfig } from "@/config/site";
import { ProposalProvider } from "@/contexts/ProposalContext";

export const metadata = {
  metadataBase: new URL(siteConfig.url),
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="website-theme"
        >
          <ProposalProvider>
            <SearchCommand />
            {children}
          </ProposalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
