import type { Metadata } from "next";
import "./globals.css";

import NextAuthProvider from "@/providers/NextAuthProvider";
import TanstackQueryProvider from "@/providers/TanstackQueryProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "react-hot-toast";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = "https://www.corbantechnologies.org";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | Corban Technologies LTD",
    default: "Corban Technologies LTD | Enterprise Software & Cloud Platforms",
  },
  description:
    "Corban Technologies LTD designs, builds, and cloud-hosts mission-critical enterprise software across East Africa: SACCO core banking platforms, double-entry SME accounting, omnichannel retail POS, marketing telecom engines, and digital event ticketing.",
  keywords: [
    "Corban Technologies",
    "Corban Technologies LTD",
    "SACCO Core Banking Kenya",
    "Wananchi Mali SACCO",
    "Manna Books Accounting",
    "SME General Ledger Kenya",
    "eTIMS POS Thermal Printing",
    "GearHouse Africa Retail",
    "Clate Cosmetics E-Commerce",
    "LJK Marketing Agency",
    "Alphanumeric Bulk SMS Kenya",
    "CT Drive Logistics",
    "Sherehe Tickets Kenya",
    "FedhaHub Dividend Calculator",
    "Mombasa Software Engineering",
    "Kenyan Fintech Solutions",
    "East Africa Cloud Hosting",
  ],
  authors: [{ name: "Corban Technologies LTD", url: siteUrl }],
  creator: "Corban Technologies LTD",
  publisher: "Corban Technologies LTD",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: siteUrl,
    title: "Corban Technologies LTD | Enterprise Software & Cloud Platforms",
    description:
      "Enterprise software engineering and cloud infrastructure powering SACCOs, SME finance, retail POS, telecom messaging, and event ticketing across East Africa.",
    siteName: "Corban Technologies LTD",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Corban Technologies LTD — Enterprise Systems & Cloud Hosting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Corban Technologies LTD | Enterprise Software & Cloud Platforms",
    description:
      "Enterprise software engineering and cloud infrastructure powering SACCOs, SME finance, retail POS, telecom messaging, and event ticketing across East Africa.",
    creator: "@corbantechltd",
    site: "@corbantechltd",
    images: [`${siteUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLdOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Corban Technologies LTD",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description:
      "Enterprise software development company based in Mombasa, Kenya, engineering mission-critical platforms for SACCOs, SME finance, retail POS, telecom marketing, logistics, and digital event ticketing.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mombasa",
      addressCountry: "KE",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+254768978865",
      contactType: "customer service",
      areaServed: ["KE", "UG", "TZ", "RW"],
      availableLanguage: ["English", "Swahili"],
    },
    sameAs: [
      "https://twitter.com/corbantechltd",
      "https://www.linkedin.com/company/corban-technologies",
      "https://github.com/corbantechnologies",
    ],
    knowsAbout: [
      "SACCO Core Banking Systems",
      "Double-Entry SME Accounting Software",
      "eTIMS Compliant Point-of-Sale Systems",
      "Bulk SMS & Telecom Marketing Platforms",
      "Freight & Waybill Logistics Operating Systems",
      "Anti-Counterfeit QR Event Ticketing",
    ],
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 selection:bg-corporate-primary selection:text-white antialiased`}
      >
        <Toaster position="top-center" />
        <NextAuthProvider>
          <TanstackQueryProvider>
            <main className="relative">{children}</main>
          </TanstackQueryProvider>
        </NextAuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
