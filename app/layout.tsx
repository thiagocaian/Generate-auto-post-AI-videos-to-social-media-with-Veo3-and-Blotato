import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"], display: "swap" });
import dynamic from "next/dynamic";
import "./globals.css";

const BackgroundScene = dynamic(() => import("@/components/BackgroundScene"), { ssr: false });

export const metadata: Metadata = {
  title: "CYTRON — Never Lose Another Customer Enquiry",
  description: "CYTRON captures, responds, qualifies and follows up with your leads automatically, 24/7. AI-powered Lead Engine for Australian businesses.",
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
        <meta name="theme-color" content="#886cff" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.className} antialiased`} style={{ backgroundColor: '#050505', color: '#ffffff' }}>
        {/* Global animated background — same lilac particles across all pages */}
        <BackgroundScene fixed opacity={0.25} particleCount={60} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
