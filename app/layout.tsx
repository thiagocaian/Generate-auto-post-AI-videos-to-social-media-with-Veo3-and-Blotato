import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import AppBackground from "@/components/marketing/app-background";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const title = "CYTRON — Business automation for Gold Coast small businesses";
const description = "Cytron automates enquiries, missed calls, bookings, reminders, quotes and invoices for Gold Coast trades, clinics, property, hospitality and retail. Free automation audit, read-only pilot first.";

export const metadata: Metadata = {
  metadataBase: new URL("https://cytronai.com"),
  title,
  description,
  alternates: { canonical: "https://cytronai.com" },
  openGraph: {
    type: "website",
    url: "https://cytronai.com",
    siteName: "CYTRON",
    title,
    description,
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#5b5cf6" />
      </head>
      <body className={`${inter.className} antialiased`} style={{ backgroundColor: "#ffffff", color: "#0f172a" }}>
        <AppBackground />
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
