import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n";
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
  title: "MedRelay - Rural Health Network & Emergency AI Triage",
  description: "MedRelay: Intelligent rural healthcare coordination, ABDM ABHA integration, emergency dispatch, and multilingual voice triage platform.",
  icons: {
    icon: "/medrelay-icon.svg",
    shortcut: "/medrelay-icon.svg",
    apple: "/medrelay-icon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/medrelay-icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/medrelay-icon.svg" />
      </head>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
