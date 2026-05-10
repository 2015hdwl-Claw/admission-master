'use client';

import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/pathways', label: '6種升學管道' },
  { href: '/quiz', label: '職群測驗' },
  { href: '/explore', label: '職群探索' },
  { href: '/first-discovery', label: '發現路徑' },
  { href: '/ability-account', label: '能力中心' },
  { href: '/portfolio', label: '準備材料' },
  { href: '/roadmap', label: '時間線' },
  { href: '/interview', label: '申請準備' },
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
