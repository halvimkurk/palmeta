import type { Metadata } from "next";
import { M_PLUS_1 } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { AppShell } from "@/components/layout/AppShell";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/seo";
import { websiteJsonLd } from "@/lib/seo/schema";
import "./globals.css";

/** Same family as Pocketpair’s Palworld site headlines. */
const sans = M_PLUS_1({
  variable: "--font-mplus",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Palworld 1.0 tier list, breeding & teams`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Palworld",
    "Palworld 1.0",
    "Palworld tier list",
    "Palworld breeding calculator",
    "Palworld team builder",
    "Paldeck",
    "Palworld meta teams",
    "Palworld best pals",
    "Paldex",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "games",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    title: `${SITE_NAME} — Palworld 1.0 tier list, breeding & teams`,
    description: SITE_TAGLINE,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Palworld 1.0 tier list, breeding & teams`,
    description: SITE_TAGLINE,
  },
  other: {
    "game:title": "Palworld",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${sans.className} antialiased`}>
        <JsonLd data={websiteJsonLd()} />
        <AppShell>{children}</AppShell>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
