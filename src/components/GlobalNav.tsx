'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/', label: '首頁', icon: '🏠' },
  { href: '/pathways', label: '6種管道', icon: '📚' },
  { href: '/quiz', label: '職群測驗', icon: '🎯' },
  { href: '/explore', label: '職群探索', icon: '🔍' },
  { href: '/first-discovery', label: '發現路徑', icon: '✨' },
  { href: '/ability-account', label: '能力中心', icon: '📊' },
  { href: '/portfolio', label: '準備材料', icon: '📋' },
  { href: '/roadmap', label: '時間線', icon: '📅' },
  { href: '/interview', label: '申請準備', icon: '📝' },
]

export default function GlobalNav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  // Don't show on login, onboarding, parent pages
  const hiddenPaths = ['/login', '/onboarding', '/parent', '/pricing']
  if (hiddenPaths.some(p => pathname.startsWith(p))) return null

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-indigo-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:inline">升學大師</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-1 overflow-x-auto">
            {NAV_ITEMS.filter(n => n.href !== '/').map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition ${
                  pathname === link.href
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-2 space-y-1">
            {NAV_ITEMS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm ${
                  pathname === link.href
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
