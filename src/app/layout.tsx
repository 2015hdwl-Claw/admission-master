import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "升學大師 v4 — 學升準備的連結器",
  description: "把學生正在做的事連結到升學目標，讓家長看到孩子的成長軌跡。學生免費使用並病毒式傳播，家長為成長報告和 AI 輔導付費。",
  keywords: ["升學大師", "高職升學", "四技二專", "能力帳戶", "學習歷程", "AI輔導", "職群探索"],
  openGraph: {
    title: "升學大師 v4 — 學升準備的連結器",
    description: "把學生正在做的事連結到升學目標，讓家長看到孩子的成長軌跡。",
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
    <html lang="zh-TW">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}