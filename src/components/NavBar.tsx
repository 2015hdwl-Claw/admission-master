'use client';

import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/roadmap', label: '我的路線圖' },
  { href: '/portfolio', label: '我學會的事' },
  { href: '/calendar', label: '校曆' },
  { href: '/timeline', label: '時光軸' },
  { href: '/quiz', label: '職群測驗' },
  { href: '/analyze', label: '統測分析' },
  { href: '/interview', label: '面試模擬' },
  { href: '/strategy', label: '策略報告' },
  { href: '/pricing', label: '定價' },
  { href: '/demo', label: '學校合作' },
  { href: '/teacher', label: '教師端' },
];

const PRIMARY_NAV = NAV_ITEMS.slice(0, 6);
const SECONDARY_NAV = NAV_ITEMS.slice(6);

export default function NavBar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <>
      <div className="hidden lg:flex items-center space-x-6 overflow-x-auto">
        {PRIMARY_NAV.map(link => (
          <a
            key={link.href}
            href={link.href}
            className={`nav-link ${isActive(link.href) ? 'text-[#7D8B7E] border-b-2 border-[#7D8B7E] pb-1' : ''}`}
          >
            {link.label}
          </a>
        ))}
        {SECONDARY_NAV.map(link => (
          <a
            key={link.href}
            href={link.href}
            className={`nav-link ${isActive(link.href) ? 'text-[#7D8B7E] border-b-2 border-[#7D8B7E] pb-1' : ''}`}
          >
            {link.label}
          </a>
        ))}
      </div>
      <a href="/quiz" className="bg-[#7D8B7E] text-white px-6 py-2.5 font-label-caps text-[11px] uppercase tracking-[0.2em] transition-all hover:bg-[#525f54] shrink-0 ml-6 cursor-pointer inline-block">
        立即諮詢
      </a>
    </>
  );
}
