'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { register as authRegister } from '@/lib/auth';
import { isProUser, useProCheck } from '@/lib/subscription';
import type { SkillItem, CalendarEvent, SkillCategory } from '@/types';
import { SKILL_CATEGORY_LABELS } from '@/types';
import { NATIONAL_CALENDAR_EVENTS } from '@/data/national-calendar';

const VOCATIONAL_CALENDAR = NATIONAL_CALENDAR_EVENTS.filter(e => e.vocational);

const HERO_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFT7O92qspJTIUS1S_j26Mk-jDCxwcwWH4m4gYe2WjNeUYoYw3JVezr9E9MAJFwKeZtrpt97yHCPGVTzr5ey4Y7EcONHbuNyktm73eVSf6JQ9saujmbqntjNLw2lZq-hvJ93z2Tk_9XC0p6LdJYwu1f41RQjqg1jOoYvrwN8xNHjbN1ttlRWvGy2BplBq-W-y9WlM2WYUea1vyZE5bfhCe8IPLljsKuACl-nfqVhJNukTgCfk76WHLQZ_Fa0UH2dO7XG1g91q-GS1s';
const MENTOR_PHOTO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQ_fcj9NflPbbUwAQKhYIZORaP82a4JzHk1RmsBVtZFsfBf3dnfrY9eaSbdcJNdqs8Nan_lXftKRi2NBhktppd0S8IC-Vu-DDBv-9y6VZFCRswmtRGcd7cLTYciKlUqdBZQrE9jd1rKCyRqkUh6lLFHsGwe23kbQxsFa0bEKvCkT5afLTJqbtIWQ47cFxO8wA-15e9SfkPywv2thFnKmnV5Sdfin9gQutG9r0fDtSKwA1gB0jjLe1KkLeCwsE2zLtcEV9rLnWfJSZ-';

const SKILL_BARS: { category: SkillCategory; label: string }[] = [
  { category: 'capstone', label: '專題研究' },
  { category: 'certification', label: '技能檢定' },
  { category: 'competition', label: '競賽參與' },
  { category: 'internship', label: '實習經歷' },
  { category: 'club', label: '社團活動' },
  { category: 'service', label: '服務學習' },
  { category: 'license', label: '證照取得' },
];

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function getWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function formatDateShort(d: Date): string {
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function ParentPage() {
  const [mode, setMode] = useState<'demo' | 'live'>('demo');
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
    if (wasRegistered) setRegistered(true);
  }, []);

  const skillItems = useMemo(
    () => mounted ? loadFromStorage<SkillItem[]>('skill-items', []) : [],
    [mounted],
  );

  const calendarEvents = useMemo(
    () => mounted ? loadFromStorage<CalendarEvent[]>('calendar-events', VOCATIONAL_CALENDAR) : VOCATIONAL_CALENDAR,
    [mounted],
  );

  const stats = useMemo(() => {
    const categories = new Set(skillItems.map(i => i.category));
    const capstones = skillItems.filter(i => i.category === 'capstone');
    const certs = skillItems.filter(i => i.category === 'certification');
    const competitions = skillItems.filter(i => i.category === 'competition');
    const hasAdvancedCert = certs.some(c => c.certificationLevel === '乙級' || c.certificationLevel === '甲級');
    const hasNationalCompetition = competitions.some(c => c.competitionLevel === '全國' || c.competitionLevel === '國際');
    const avgGrade = (() => {
      const graded = skillItems.filter(i => i.qualityGrade);
      if (graded.length === 0) return null;
      const gradeMap: Record<string, number> = { A: 4, B: 3, C: 2, D: 1 };
      const sum = graded.reduce((s, i) => s + (gradeMap[i.qualityGrade!] || 0), 0);
      return sum / graded.length;
    })();

    return { totalSkills: skillItems.length, categoryCount: categories.size, capstones, certs, competitions, hasAdvancedCert, hasNationalCompetition, avgGrade };
  }, [skillItems]);

  const weeklyReport = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());

    const weekItems = skillItems.filter(item => {
      const d = new Date(item.date);
      return d >= weekStart;
    });

    const highlights: string[] = [];
    if (weekItems.length > 0) {
      const weekCategories = [...new Set(weekItems.map(i => SKILL_CATEGORY_LABELS[i.category]))];
      highlights.push(`這週記錄了 ${weekItems.length} 件技能（${weekCategories.join('、')}）`);
    }
    if (stats.capstones.length > 0) {
      const inProgress = stats.capstones.filter(c => c.capstoneStatus === 'in-progress');
      if (inProgress.length > 0) highlights.push(`${inProgress.length} 個專題實作進行中`);
      const completed = stats.capstones.filter(c => c.capstoneStatus === 'completed');
      if (completed.length > 0) highlights.push(`${completed.length} 個專題實作已完成`);
    }
    if (stats.certs.length > 0) {
      highlights.push(`已取得 ${stats.certs.length} 張技能檢定${stats.hasAdvancedCert ? '（含乙級以上）' : ''}`);
    }
    if (stats.hasNationalCompetition) {
      highlights.push('有全國級競賽經驗，甄選加分優勢');
    }
    if (stats.avgGrade && stats.avgGrade >= 3) {
      highlights.push(`素材品質平均 ${stats.avgGrade >= 3.5 ? '優秀' : '良好'}（建議維持）`);
    }
    if (highlights.length === 0) {
      highlights.push('還在開始階段，持續記錄就會看到成長軌跡');
    }

    return { weekItems, highlights };
  }, [skillItems, stats]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const twoWeeksLater = new Date(now);
    twoWeeksLater.setDate(now.getDate() + 14);
    return calendarEvents
      .filter(e => {
        const d = new Date(e.date);
        return d >= now && d <= twoWeeksLater;
      })
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4);
  }, [calendarEvents]);

  const skillDistribution = useMemo(() => {
    const maxPossible = 5;
    return SKILL_BARS.map(bar => {
      const count = skillItems.filter(i => i.category === bar.category).length;
      const percent = Math.min(100, Math.round((count / maxPossible) * 100));
      return { ...bar, count, percent };
    });
  }, [skillItems]);

  const completionRate = useMemo(() => {
    const totalCategories = SKILL_BARS.length;
    const touched = skillDistribution.filter(s => s.count > 0).length;
    return totalCategories > 0 ? Math.round((touched / totalCategories) * 100) : 0;
  }, [skillDistribution]);

  const week = getWeekRange();

  async function handleRegister() {
    setError('');
    if (!email || !childName || !password) return;
    if (password.length < 6) { setError('密碼至少需要 6 個字元'); return; }
    try {
      authRegister(email, password, childName, 'parent');
      setRegistered(true);
      saveToStorage('parent-registered', true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '註冊失敗，請稍後再試');
    }
  }

  // ── Registration Form ──
  if (!registered) {
    return (
      <div className="page-container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-xxl items-center min-h-[calc(100vh-160px)]">
          <div className="md:col-span-7 space-y-md">
            <span className="font-label-caps text-primary uppercase tracking-widest">PARENT PORTAL</span>
            <h1 className="font-h1 text-h1 text-on-surface">家長週報</h1>
            <div className="border-l-4 border-primary pl-lg py-sm">
              <p className="font-h3 text-on-surface italic leading-relaxed">
                每週收到孩子的升學動態摘要，掌握專題實作進度、技能檢定時程、競賽成果與面試準備狀況。
              </p>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="bg-surface-container-low border border-[#E9E5DB] p-xl">
              <h2 className="font-h3 text-h3 text-on-surface mb-sm text-center">註冊週報</h2>
              <p className="text-sm text-on-surface-variant text-center mb-lg">每週收到孩子的升學動態摘要（免費）</p>
              <div className="space-y-4">
                <div>
                  <label className="block font-label-caps text-label-caps text-primary mb-2 tracking-widest">您的 Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="parent@example.com"
                    className="w-full px-4 py-3 bg-white border border-[#E9E5DB] text-on-surface font-body-md outline-none focus:border-primary transition-colors rounded-sm" />
                </div>
                <div>
                  <label className="block font-label-caps text-label-caps text-primary mb-2 tracking-widest">設定密碼</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="至少 6 個字元"
                    className="w-full px-4 py-3 bg-white border border-[#E9E5DB] text-on-surface font-body-md outline-none focus:border-primary transition-colors rounded-sm" />
                </div>
                <div>
                  <label className="block font-label-caps text-label-caps text-primary mb-2 tracking-widest">孩子姓名（暱稱）</label>
                  <input type="text" value={childName} onChange={e => setChildName(e.target.value)} placeholder="小明"
                    className="w-full px-4 py-3 bg-white border border-[#E9E5DB] text-on-surface font-body-md outline-none focus:border-primary transition-colors rounded-sm" />
                </div>
                {error && <p className="text-sm text-error bg-error-container rounded-sm p-3">{error}</p>}
                <button
                  onClick={handleRegister}
                  disabled={!email || !childName || !password}
                  className={`w-full py-3 font-label-caps text-label-caps tracking-widest transition-all cursor-pointer ${
                    email && childName && password ? 'bg-primary text-white hover:opacity-90' : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'
                  }`}
                >
                  註冊免費週報
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Dashboard (Demo or Live) ──
  const displayName = '你的孩子';
  const displayData = mode === 'demo' ? {
    totalSkills: 12,
    categoryCount: 5,
    weekItems: [],
    highlights: ['專題實作「智慧溫室系統」進入最終驗收階段', '通過電腦軟體應用丙級檢定', '校際技能競賽區賽獲第三名', '社團活動出席率 95%'],
    skillDistribution: SKILL_BARS.map(bar => ({
      ...bar,
      count: bar.category === 'capstone' ? 4 : bar.category === 'certification' ? 3 : bar.category === 'competition' ? 2 : bar.category === 'club' ? 4 : bar.category === 'service' ? 2 : 1,
      percent: bar.category === 'capstone' ? 85 : bar.category === 'certification' ? 70 : bar.category === 'competition' ? 60 : bar.category === 'club' ? 95 : bar.category === 'service' ? 55 : 40,
    })),
    completionRate: 71,
    upcomingEvents: VOCATIONAL_CALENDAR.slice(0, 4),
  } : {
    totalSkills: stats.totalSkills,
    categoryCount: stats.categoryCount,
    weekItems: weeklyReport.weekItems,
    highlights: weeklyReport.highlights,
    skillDistribution,
    completionRate,
    upcomingEvents,
  };

  const circumference = 2 * Math.PI * 70;
  const dashOffset = circumference - (circumference * displayData.completionRate / 100);

  return (
    <div className="page-container">
      {/* Mode toggle */}
      <div className="flex justify-end mb-md">
        <button
          onClick={() => setMode(mode === 'demo' ? 'live' : 'demo')}
          className="text-xs font-label-caps text-on-surface-variant tracking-widest hover:text-primary transition-colors cursor-pointer border border-[#E9E5DB] px-3 py-1.5"
        >
          {mode === 'demo' ? '切換至即時資料' : '查看範例'}
        </button>
      </div>

      {/* Hero: Weekly Summary */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center mb-xxl">
        <div className="md:col-span-7 space-y-md">
          <span className="font-label-caps text-primary uppercase tracking-widest">
            Weekly Digest &bull; {formatDateShort(week.start)} &ndash; {formatDateShort(week.end)}
          </span>
          <h2 className="font-h1 text-h1 text-on-surface">本週學習亮點</h2>
          <div className="border-l-4 border-primary pl-lg py-sm">
            <p className="font-h3 italic text-on-surface leading-relaxed">
              {mode === 'demo'
                ? '「孩子在本週的專題討論中展現了卓越的領導力，不僅主動協調組員分工，更在資料彙整中發現了創新的視角。這是一場關於自信與邏輯的優雅綻放。」'
                : displayData.highlights.length > 0
                  ? displayData.highlights[0]
                  : '本週暫無新記錄，鼓勵孩子持續記錄學習成果。'}
            </p>
          </div>
        </div>
        <div className="md:col-span-5 h-[400px] overflow-hidden rounded-lg shadow-[0_20px_40px_rgba(125,139,126,0.08)]">
          <img
            alt="孩子學習"
            className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700"
            src={HERO_IMAGE}
          />
        </div>
      </section>

      {/* Bento Grid: Analytics */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-xxl">
        {/* Time Invested */}
        <div className="md:col-span-4 bg-[#F4F1EA] border border-[#E9E5DB] p-xl flex flex-col justify-between">
          <div>
            <h3 className="font-h3 text-primary mb-4">技能紀錄</h3>
            <div className="flex items-baseline gap-sm">
              <span className="text-6xl font-serif text-on-surface">{displayData.totalSkills}</span>
              <span className="font-body-lg text-primary">項</span>
            </div>
          </div>
          <div className="mt-lg pt-lg border-t border-outline-variant">
            <div className="flex justify-between items-center font-label-caps text-on-surface-variant">
              <span>覆蓋領域</span>
              <span className="text-primary">{displayData.categoryCount} / 7</span>
            </div>
            <div className="w-full bg-outline-variant h-1 mt-2">
              <div className="bg-primary h-1" style={{ width: `${Math.round((displayData.categoryCount / 7) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Task Completion */}
        <div className="md:col-span-4 bg-[#F4F1EA] border border-[#E9E5DB] p-xl">
          <h3 className="font-h3 text-primary mb-lg">領域覆蓋率</h3>
          <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle className="text-outline-variant opacity-20" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="8" />
              <circle className="text-primary" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeDasharray={String(circumference)} strokeDashoffset={String(dashOffset)} strokeWidth="8" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-serif">{displayData.completionRate}%</span>
              <span className="text-xs font-label-caps text-on-surface-variant">COMPLETED</span>
            </div>
          </div>
          <div className="mt-lg text-center font-body-md text-on-surface-variant">
            觸及 {displayData.categoryCount} / 7 個技能領域
          </div>
        </div>

        {/* Skill Distribution */}
        <div className="md:col-span-4 bg-[#F4F1EA] border border-[#E9E5DB] p-xl">
          <h3 className="font-h3 text-primary mb-lg">領域成長分布</h3>
          <div className="space-y-4">
            {displayData.skillDistribution.map(bar => (
              <div key={bar.category} className="space-y-1">
                <div className="flex justify-between font-body-md">
                  <span className="text-on-surface">{bar.label}</span>
                  <span className="text-primary">{bar.percent}%</span>
                </div>
                <div className="h-2 bg-surface-container-highest overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${bar.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Strength Indicators (Live only) */}
      {mode === 'live' && (stats.hasAdvancedCert || stats.hasNationalCompetition) && (
        <div className="bg-success-container border border-success/30 rounded-sm p-lg mb-xxl">
          <h3 className="font-label-caps text-label-caps text-success mb-sm">競爭力亮點</h3>
          <div className="flex flex-wrap gap-2">
            {stats.hasAdvancedCert && <span className="text-xs px-2.5 py-1 bg-success-container text-success font-medium">乙級以上證照</span>}
            {stats.hasNationalCompetition && <span className="text-xs px-2.5 py-1 bg-success-container text-success font-medium">全國競賽經驗</span>}
          </div>
        </div>
      )}

      {/* Mentor Quote */}
      <section className="bg-surface-container-low p-xl border border-outline-variant flex flex-col md:flex-row gap-xl items-center mb-xxl">
        <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 border-2 border-primary">
          <img alt="導師" className="w-full h-full object-cover" src={MENTOR_PHOTO} />
        </div>
        <div className="space-y-md">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
            <h3 className="font-h3 text-on-surface">導師的話</h3>
          </div>
          <p className="font-body-lg text-on-surface-variant leading-relaxed">
            {mode === 'demo'
              ? '孩子目前正處於能量爆發的階段，他在社團活動中展現出的共情能力讓我印象深刻。下週的統測模擬是個檢視基礎的好機會，建議家長多給予情感支持，而非僅關注分數。'
              : displayData.highlights.length >= 2
                ? displayData.highlights[1]
                : '持續鼓勵孩子探索不同領域，建立多元能力。'}
          </p>
          <p className="font-label-caps text-primary tracking-widest">— 導師 林沐辰</p>
        </div>
      </section>

      {/* Weekly Items (Live only) */}
      {mode === 'live' && (
        <div className="bg-surface-container-low border border-[#E9E5DB] p-xl mb-xxl">
          <div className="flex items-center justify-between mb-lg">
            <h2 className="font-h3 text-h3 text-on-surface">這週的升學動態</h2>
            <span className={`text-xs px-2.5 py-1 font-label-caps tracking-widest ${
              isPro ? 'bg-primary-fixed text-primary' : 'bg-surface-container text-on-surface-variant'
            }`}>
              {isPro ? 'PRO' : 'FREE'}
            </span>
          </div>
          {displayData.weekItems.length > 0 ? (
            <div className="space-y-2">
              {displayData.weekItems.slice(0, 8).map(item => (
                <div key={item.id} className="flex items-start gap-md p-sm bg-surface-container-lowest rounded-sm">
                  <div className="w-7 h-7 bg-primary-fixed rounded-full flex items-center justify-center text-primary text-xs font-bold shrink-0">
                    {SKILL_CATEGORY_LABELS[item.category]?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-body-md text-on-surface truncate">{item.title}</div>
                    <div className="text-xs text-on-surface-variant">{SKILL_CATEGORY_LABELS[item.category]} · {item.date}</div>
                  </div>
                  {item.qualityGrade && (
                    <span className={`text-xs px-1.5 py-0.5 font-bold ${
                      item.qualityGrade === 'A' ? 'bg-success-container text-success' :
                      item.qualityGrade === 'B' ? 'bg-primary-fixed text-primary' :
                      'bg-surface-container text-on-surface-variant'
                    }`}>{item.qualityGrade}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-lg text-on-surface-variant font-body-md">本週暫無新記錄</div>
          )}
          <div className="mt-lg pt-lg border-t border-[#E9E5DB]">
            <h3 className="font-label-caps text-label-caps text-primary mb-sm">亮點</h3>
            <ul className="space-y-1">
              {displayData.highlights.map((h, i) => (
                <li key={i} className="text-sm text-on-surface-variant flex items-start gap-2">
                  <span className="text-primary mt-0.5">&#8226;</span>{h}
                </li>
              ))}
            </ul>
          </div>
          {!isPro && (
            <div className="mt-lg pt-lg border-t border-[#E9E5DB] text-center">
              <p className="text-xs text-on-surface-variant mb-sm">升級 Pro 可查看 AI 成長分析與詳細進度報告</p>
              <Link href="/pricing" className="bg-primary text-white px-xl py-sm font-label-caps text-label-caps tracking-widest hover:opacity-90 transition-all cursor-pointer inline-block">
                升級完整版 NT$1,990/季
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Next Week Preview */}
      <section className="space-y-lg mb-xxl">
        <h2 className="font-h2 text-h2 text-on-surface flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">event_upcoming</span>
          下週預告
        </h2>
        {displayData.upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {displayData.upcomingEvents.map(ev => {
              const evDate = new Date(ev.date);
              const dayName = WEEKDAYS[evDate.getDay()];
              const dayNum = evDate.getDate();
              return (
                <div key={ev.id} className="flex gap-lg p-lg bg-white border border-[#E9E5DB] hover:border-primary/30 transition-colors">
                  <div className="text-center shrink-0 border-r border-[#E9E5DB] pr-lg min-w-[5rem]">
                    <span className="block font-label-caps text-on-surface-variant">{dayName}</span>
                    <span className="text-3xl font-serif text-primary">{dayNum}</span>
                  </div>
                  <div>
                    <h4 className="font-body-lg font-semibold text-on-surface">{ev.title}</h4>
                    <p className="font-body-md text-on-surface-variant mt-xs">
                      {ev.isNational ? '全國性活動' : '請提前準備相關事項'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-xxl text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl text-outline mb-lg block">event_busy</span>
            <p className="font-body-md">近兩週沒有重要活動</p>
          </div>
        )}
      </section>

      {/* Navigation */}
      <div className="border-t border-[#E9E5DB] pt-xxl mt-xxl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-lg text-center">
          <Link href="/roadmap" className="text-on-surface-variant hover:text-primary text-sm font-medium cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-2xl text-primary block mb-xs">map</span>
            我的路線圖
          </Link>
          <Link href="/portfolio" className="text-on-surface-variant hover:text-primary text-sm font-medium cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-2xl text-primary block mb-xs">auto_stories</span>
            技能旅程
          </Link>
          <Link href="/calendar" className="text-on-surface-variant hover:text-primary text-sm font-medium cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-2xl text-primary block mb-xs">calendar_month</span>
            校曆行程
          </Link>
          <Link href="/analyze" className="text-on-surface-variant hover:text-primary text-sm font-medium cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-2xl text-primary block mb-xs">analytics</span>
            統測分析
          </Link>
        </div>
      </div>
    </div>
  );
}
