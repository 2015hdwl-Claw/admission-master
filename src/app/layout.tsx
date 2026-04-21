import type { Metadata } from "next";
import { Geist } from "next/font/google";
import MobileMenuButton from "@/components/MobileMenuButton";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "升學大師 — 把你正在做的事，連結到你的未來",
  description: "台灣高中生的升學準備連結器。免費分數分析、分享圖卡、探索科系，讓升學路不再迷茫。",
  openGraph: {
    title: "升學大師 — 台灣高中生升學準備連結器",
    description: "免費學測分數分析，生成你的專屬升學圖卡",
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
    <html lang="zh-TW" className={`${geistSans.variable} antialiased`}>
      <body className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="font-bold text-lg text-indigo-600">升學大師</a>
            <div className="hidden lg:flex items-center gap-5 text-sm">
              <a href="/roadmap" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">我的路線圖</a>
              <a href="/portfolio" className="text-gray-600 hover:text-indigo-600 transition-colors">素材記錄</a>
              <a href="/calendar" className="text-gray-600 hover:text-indigo-600 transition-colors">校曆</a>
              <a href="/timeline" className="text-gray-600 hover:text-indigo-600 transition-colors">時光軸</a>
              <span className="w-px h-5 bg-gray-200" />
              <a href="/quiz" className="text-gray-500 hover:text-indigo-600 transition-colors">科系測驗</a>
              <a href="/analyze" className="text-gray-500 hover:text-indigo-600 transition-colors">分數分析</a>
              <a href="/interview" className="text-gray-500 hover:text-indigo-600 transition-colors">面試模擬</a>
              <a href="/strategy" className="text-gray-500 hover:text-indigo-600 transition-colors">策略報告</a>
              <a href="/pricing" className="text-gray-500 hover:text-indigo-600 transition-colors">定價</a>
            </div>
            <MobileMenuButton />
          </nav>
          <div id="mobile-menu" className="hidden lg:hidden border-t border-gray-100 bg-white">
            <div className="max-w-5xl mx-auto px-4 py-3 grid grid-cols-2 gap-1 text-sm">
              <a href="/roadmap" className="px-3 py-2 rounded-lg text-indigo-600 font-medium">我的路線圖</a>
              <a href="/portfolio" className="px-3 py-2 rounded-lg text-gray-600">素材記錄</a>
              <a href="/calendar" className="px-3 py-2 rounded-lg text-gray-600">校曆</a>
              <a href="/timeline" className="px-3 py-2 rounded-lg text-gray-600">時光軸</a>
              <a href="/quiz" className="px-3 py-2 rounded-lg text-gray-400">科系測驗</a>
              <a href="/analyze" className="px-3 py-2 rounded-lg text-gray-400">分數分析</a>
              <a href="/interview" className="px-3 py-2 rounded-lg text-gray-400">面試模擬</a>
              <a href="/strategy" className="px-3 py-2 rounded-lg text-gray-400">策略報告</a>
              <a href="/pricing" className="px-3 py-2 rounded-lg text-gray-400">定價</a>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-white border-t border-gray-100 py-8">
          <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-400">
            <p>&copy; 2026 升學大師 Admission Master. 把你正在做的事，連結到你的未來。</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
