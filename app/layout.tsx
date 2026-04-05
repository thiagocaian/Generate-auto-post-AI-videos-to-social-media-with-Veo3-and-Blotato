import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "CYTRON — Intelligent Automation Platform",
  description: "Enterprise automation platform for electrical contractors",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${GeistMono.className} antialiased`} style={{ backgroundColor: '#FFFFFF', color: '#0a0a0a' }}>
        {children}
      </body>
    </html>
  );
}
