import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/Providers";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import ClarityAnalytics from "@/components/ClarityAnalytics";

const inter = Inter({ subsets: ["latin"] });
const gaId = process.env.GA_ID;

export const metadata: Metadata = {
  title: "AI Food Therapist - Tongue Diagnosis",
  description:
    "AI-powered tongue diagnosis for personalized health recommendations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          {/* 使用 npm 安裝的 Clarity 元件 */}
          <ClarityAnalytics />

          {/* 同時保留 GA4 (推薦用 next/third-parties 最快) */}
          {gaId && <GoogleAnalytics gaId={gaId} />}
        </AuthProvider>
      </body>
    </html>
  );
}
