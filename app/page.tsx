import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import ClientIndex from "@/components/client-index";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/og-image.png`,
        width: 1200,
        height: 630
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    creator: "@velvet_shark",
    images: [`${siteConfig.url}/og-image.png`]
  }
};

export default function Index() {
  return <ClientIndex />;
}
