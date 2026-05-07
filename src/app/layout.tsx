import type { Metadata } from "next";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export const metadata: Metadata = {
  title: "升學大師 — 讓你的努力看得見",
  description: "高職生的升學助手，幫你找到適合的科系，讓努力看得見。完全免費使用。",
  keywords: ["升學大師", "高職升學", "四技二專", "科系推薦", "職群測驗", "商管科系", "升學規劃"],
  openGraph: {
    title: "升學大師 — 讓你的努力看得見",
    description: "高職生的升學助手，幫你找到適合的科系，讓努力看得見。完全免費使用。",
    type: "website",
    locale: "zh_TW",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className="antialiased">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}