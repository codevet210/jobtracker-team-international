import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JobTracker",
  description: "Multi-tenant roofing job management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-50 text-slate-900 antialiased`}
      >
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <Link href="/" className="font-semibold tracking-tight">
              JobTracker
            </Link>
            <nav className="flex gap-4 text-sm text-slate-600">
              <Link href="/" className="hover:text-slate-900">
                Story
              </Link>
              <Link href="/jobs" className="hover:text-slate-900">
                Operations
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
