import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import dynamic from "next/dynamic";
import "./globals.css";

const BackgroundScene = dynamic(() => import("@/components/BackgroundScene"), { ssr: false });

export const metadata: Metadata = {
  title: "CYTRON — Intelligent Automation Platform",
  description: "AI-powered content automation. Transform photos into cinematic marketing videos, auto-publish to social media.",
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
      <body className={`${GeistMono.className} antialiased`} style={{ backgroundColor: '#050505', color: '#ffffff' }}>
        {/* Global animated background — same lilac particles across all pages */}
        <BackgroundScene fixed opacity={0.25} particleCount={60} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
