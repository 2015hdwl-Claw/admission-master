'use client';

import { useState, useEffect, useMemo } from 'react';
import { loadFromStorage } from '@/lib/storage';
import { isProUser } from '@/lib/subscription';
import type { SkillItem, CalendarEvent, MonthlyReview } from '@/types';
import { SKILL_CATEGORY_LABELS } from '@/types';
import { NATIONAL_CALENDAR_EVENTS } from '@/data/national-calendar';

const MILESTONES = [
  { count: 1, label: '第一步', desc: '記錄了第一件技能！很好的開始。' },
  { count: 3, label: '起步者', desc: '已累積 3 件技能紀錄，升學故事正在成形。' },
  { count: 5, label: '技能探索家', desc: '5 件技能紀錄，涵蓋了多個技能類別。' },
  { count: 10, label: '專題達人', desc: '10 件技能紀錄！你的專題和檤定成果令人印象深刻。' },
  { count: 15, label: '職群候選人', desc: '15 件技能紀錄，你的技能旅程非常完整。' },
  { count: 20, label: '技能大師', desc: '20 件技能紀錄，這是一份令人印象深刻的升學準備。' },
];

export default function TimelinePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const skillItems = useMemo(
    () => mounted ? loadFromStorage<SkillItem[]>('skill-items', []) : [],
    [mounted]
  );

  const calendarEvents = useMemo(
    () => mounted ? loadFromStorage<CalendarEvent[]>('calendar-events', NATIONAL_CALENDAR_EVENTS) : NATIONAL_CALENDAR_EVENTS,
    [mounted]
  );

  const monthlyReviews = useMemo((): MonthlyReview[] => {
    const allItems: { date: string; type: 'portfolio' | 'explore' | 'calendar'; title: string; detail: string }[] = [];

    skillItems.forEach(item => {
      allItems.push({ date: item.date, type: 'portfolio', title: item.title, detail: SKILL_CATEGORY_LABELS[item.category] });
    });

    calendarEvents.forEach(event => {
      allItems.push({ date: event.date, type: 'calendar', title: event.title, detail: event.isNational ? '全國重要日期' : '校園活動' });
    });

    allItems.sort((a, b) => b.date.localeCompare(a.date));

    const grouped = new Map<string, MonthlyReview>();
    allItems.forEach(item => {
      const month = item.date.slice(0, 7);
      if (!grouped.has(month)) {
        grouped.set(month, { month, entries: [], portfolioCount: 0, exploreCount: 0, summary: '' });
      }
      const review = grouped.get(month)!;
      review.entries.push(item);
      if (item.type === 'portfolio') review.portfolioCount++;
      if (item.type === 'explore') review.exploreCount++;
    });

    grouped.forEach(review => {
      const parts: string[] = [];
      if (review.portfolioCount > 0) parts.push(`累積了 ${review.portfolioCount} 件技能紀錄`);
      if (review.exploreCount > 0) parts.push(`探索了 ${review.exploreCount} 個學類`);
      review.summary = parts.length > 0
        ? `這個月你${parts.join('，')}。你正在建立自己的升學故事。`
        : '這個月還沒有記錄，想記錄的時候隨時可以開始。';
    });

    return Array.from(grouped.values()).sort((a, b) => b.month.localeCompare(a.month));
  }, [skillItems, calendarEvents]);

  const totalSkill = skillItems.length;
  const currentMilestone = MILESTONES.filter(m => totalSkill >= m.count).pop();
  const nextMilestone = MILESTONES.find(m => m.count > totalSkill);
  const isPro = isProUser();

  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    skillItems.forEach(item => {
      const label = SKILL_CATEGORY_LABELS[item.category];
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [skillItems]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">成就時光軸</h1>
        <p className="text-gray-500">回顧你已經完成的每一步</p>
      </div>

      {/* Milestone */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {totalSkill}
          </div>
          <div>
            <div className="font-bold text-gray-900">累積技能紀錄</div>
            <div className="text-sm text-gray-500">
              {currentMilestone ? `${currentMilestone.label} — ${currentMilestone.desc}` : '還沒有記錄，從今天開始！'}
            </div>
          </div>
        </div>
        {nextMilestone && (
          <div className="text-sm text-indigo-600">
            再 {nextMilestone.count - totalSkill} 件就能解鎖「{nextMilestone.label}」
          </div>
        )}
        {categoryDistribution.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {categoryDistribution.map(([label, count]) => (
              <span key={label} className="text-xs px-2 py-1 bg-white rounded-full text-gray-600">
                {label} × {count}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* AI Growth Summary - Pro feature */}
      {!isPro && totalSkill >= 3 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-gray-900">AI 成長摘要</h3>
            <span className="text-xs px-2 py-0.5 bg-indigo-600 text-white rounded-full font-medium">Pro</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            讓 AI 分析你的學習歷程，自動生成每月成長摘要與下一步建議。
          </p>
          <a href="/pricing" className="inline-block px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
            解鎖 AI 成長摘要
          </a>
        </div>
      )}

      {isPro && totalSkill >= 3 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-gray-900">AI 成長摘要</h3>
            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Pro</span>
          </div>
          <p className="text-sm text-gray-600">
            你已累積 {totalSkill} 件技能紀錄，涵蓋 {categoryDistribution.length} 種技能類別。持續保持記錄習慣，你的學習歷程會越來越完整。
          </p>
        </div>
      )}

      {/* Monthly Timeline */}
      <div className="space-y-6">
        {monthlyReviews.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-4">🌱</div>
            <p>還沒有記錄</p>
            <p className="text-sm mt-1">去<a href="/portfolio" className="text-indigo-600 underline">記錄技能</a>或<a href="/calendar" className="text-indigo-600 underline">同步校曆</a>，你的時光軸就會開始生長</p>
          </div>
        )}
        {monthlyReviews.map(review => (
          <div key={review.month} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-gray-900">{review.month}</h2>
              <div className="flex gap-3 text-sm text-gray-500">
                {review.portfolioCount > 0 && <span>技能 {review.portfolioCount} 件</span>}
              </div>
            </div>
            <div className="space-y-3">
              {review.entries.slice(0, 10).map((entry, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    entry.type === 'portfolio' ? 'bg-indigo-500' :
                    entry.type === 'explore' ? 'bg-purple-500' :
                    'bg-gray-300'
                  }`} />
                  <div>
                    <div className="text-sm text-gray-400">{entry.date}</div>
                    <div className="font-medium text-gray-900 text-sm">{entry.title}</div>
                    <div className="text-xs text-gray-500">{entry.detail}</div>
                  </div>
                </div>
              ))}
              {review.entries.length > 10 && (
                <div className="text-xs text-gray-400 pl-5">還有 {review.entries.length - 10} 筆記錄</div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 italic">{review.summary}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
