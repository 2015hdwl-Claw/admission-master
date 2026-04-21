'use client';

import { useState, useEffect, useMemo } from 'react';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { register as authRegister } from '@/lib/auth';
import { isProUser, useProCheck } from '@/lib/subscription';
import type { PortfolioItem, CalendarEvent, ParentWeeklyReport } from '@/types';
import { NATIONAL_CALENDAR_EVENTS } from '@/data/national-calendar';

export default function ParentPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registered, setRegistered] = useState(false);
  const [childName, setChildName] = useState('');
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');

  const { isPro } = useProCheck();

  useEffect(() => {
    setMounted(true);
    const wasRegistered = loadFromStorage<boolean>('parent-registered', false);
    if (wasRegistered) {
      setRegistered(true);
    }
  }, []);

  const portfolioItems = useMemo(
    () => mounted ? loadFromStorage<PortfolioItem[]>('portfolio-items', []) : [],
    [mounted]
  );

  const calendarEvents = useMemo(
    () => mounted ? loadFromStorage<CalendarEvent[]>('calendar-events', NATIONAL_CALENDAR_EVENTS) : NATIONAL_CALENDAR_EVENTS,
    [mounted]
  );

  const weeklyReport = useMemo((): ParentWeeklyReport => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());

    const weekItems = portfolioItems.filter(item => {
      const d = new Date(item.date);
      return d >= weekStart;
    });

    const highlights: string[] = [];
    if (weekItems.length > 0) {
      highlights.push(`這週記錄了 ${weekItems.length} 件素材`);
    }
    if (weekItems.length === 0 && portfolioItems.length > 0) {
      highlights.push('本週沒有新增記錄，但累積的素材持續保存中');
    }
    if (portfolioItems.length >= 5) {
      highlights.push('素材累積已達 5 件以上，學習歷程正在成形');
    }
    if (highlights.length === 0) {
      highlights.push('還在開始階段，持續記錄就會看到成長');
    }

    return {
      weekStart: weekStart.toISOString().slice(0, 10),
      portfolioItems: weekItems,
      exploredCategories: [],
      highlights,
    };
  }, [portfolioItems, calendarEvents]);

  async function handleRegister() {
    setError('');

    if (!email || !childName || !password) return;

    if (password.length < 6) {
      setError('密碼至少需要 6 個字元');
      return;
    }

    try {
      authRegister(email, password, childName, 'parent');
      setRegistered(true);
      saveToStorage('parent-registered', true);
    } catch (err) {
      const message = err instanceof Error ? err.message : '註冊失敗，請稍後再試';
      setError(message);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">家長專區</h1>
        <p className="text-gray-500">看見孩子的升學準備歷程</p>
      </div>

      {!registered ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm max-w-md mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">註冊週報</h2>
          <p className="text-sm text-gray-500 text-center mb-6">每週收到孩子的升學動態摘要（免費）</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">您的 Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="parent@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">設定密碼</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="至少 6 個字元"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">孩子姓名（暱稱）</label>
              <input
                type="text"
                value={childName}
                onChange={e => setChildName(e.target.value)}
                placeholder="小明"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>
            )}
            <button
              onClick={handleRegister}
              disabled={!email || !childName || !password}
              className={`w-full py-3 rounded-xl font-bold transition-colors ${
                email && childName && password
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              註冊免費週報
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Weekly Report Preview */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-gray-900">這週的升學動態</h2>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                isPro ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {isPro ? 'Pro' : '免費版'}
              </span>
            </div>

            {weeklyReport.portfolioItems.length > 0 ? (
              <div className="space-y-3">
                {weeklyReport.portfolioItems.map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
                      {item.code}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.date} 記錄</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">
                本週暫無新記錄
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-2">亮點</h3>
              <ul className="space-y-1">
                {weeklyReport.highlights.map((h, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro paywall for full report */}
            {!isPro && (
              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">這是免費版摘要。升級後可查看完整成長報告與 AI 分析。</p>
                <a href="/pricing" className="mt-2 inline-block px-6 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
                  升級完整版 NT$1,990/季
                </a>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
              <div className="text-3xl font-bold text-indigo-600">{portfolioItems.length}</div>
              <div className="text-sm text-gray-500">累積素材</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
              <div className="text-3xl font-bold text-purple-600">
                {new Set(portfolioItems.map(p => p.code)).size}
              </div>
              <div className="text-sm text-gray-500">代碼覆蓋</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
