import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CYTRON — Intelligent Automation Platform",
  description: "Enterprise automation platform for electrical contractors",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`} style={{ backgroundColor: '#F4F6F8' }}>
        {children}
      </body>
    </html>
  );
}
