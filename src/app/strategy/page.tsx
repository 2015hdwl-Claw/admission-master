'use client';

import { useState, useEffect } from 'react';
import { loadFromStorage } from '@/lib/storage';
import { VOCATIONAL_GROUP_LABELS } from '@/data/vocational-categories';
import type { StrategyReport, OnboardingProfile, VocationalGroup } from '@/types';

const ACTION_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBgp52NXDX46RyykBXB_nV78H5kvfEx30kVU4qWl8DogSq18Uei3YgfcsaN-JGJk0KKHCoPkA7nkCSX38NldpBBknqHj2Q2jr3LRNqwE6SkK1uYvh2dXpcNyhGSjjSozQuRBSXjF9FHCFwo2DtRG00wQH_2UeM14taEBzb5YHzp-LjMdvMngvWzAeEwtCxgl64MmzRzvPlnAcs3FFe8x5_VotriyNukIYGygpLM3Iupl4_59M5AT3LbjorNnxJhbQuXEpCjfreIPtc8',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBqeOiRWexTC_8sl1Nq6O5z-jFRy0Vwr7nEaUbbJhlhqONbDr_wvta4Q_gNBWxEVLL_vx3S2rnaOswcEdWLfrtVRPDIbaoZPLz5bCRwhS3_f-tSfax4hhw5gAKn1zncyxH5aobERCEG_5rzT0hhIlQglkAwtJyVyERv_7ChS9bm5sepxTtes2BSd8O03SG8wvUSMc69nMhQKXE6AYjDjPpKRfBqkbZZ6j-SSBoDK2OWykxS7ZSNyqc4TjmZ_ar-1zX-b2Rs7IPja3yo',
];

const CONSULTANT_PHOTO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFviAHDlpSYJsMLFMhRwxjlr3tkfTaAxDafh472oStPU8GVF4FOq1CS8JBrjweoPRmd25JBobNfx0oLXhmA5tbtorwQBGvK6YjEnXp-cXbdzCwEiUWA61xD0VR2lDS2TVDKZTfUOMRwlfdjdNBeOw6DJjHhjxywy0NyFXdmxhkMZS966_FaOAJjIgDWpinCkkGewubFcv0PvtWwEHN3HZqsgbruNdGa8Qv-uTrPD4M05H-KxtFBhcO3LJdgzroY6exk4RWbWyYwwY5';

const DEMO_REPORT: StrategyReport = {
  direction: '建築與設計學系',
  directionGroup: '設計群',
  grade: '高二',
  departments: [
    { rank: 1, name: '建築學系', university: '國立成功大學', category: '四技二專', scoreRange: '錄取機率：72%', keyRequirement: '作品集+面試', portfolioFocus: '作品集需展現空間感知與永續設計思維，至少 3 件完整作品。' },
    { rank: 2, name: '建築學系', university: '東海大學', category: '四技二專', scoreRange: '錄取機率：88%', keyRequirement: '備審資料', portfolioFocus: '備審需包含手繪作品集與設計過程紀錄。' },
    { rank: 3, name: '建築研究所學士班', university: '國立陽明交通大學', category: '四技二專', scoreRange: '錄取機率：45%', keyRequirement: '面試+作品集', portfolioFocus: '作品集需展現跨領域整合能力，面試準備需涵蓋結構與美學。' },
    { rank: 4, name: '室內設計系', university: '國立雲林科技大學', category: '四技二專', scoreRange: '門檻 350+', keyRequirement: '技能檢定+備審', portfolioFocus: '室內設計相關丙級證照可加分，備審需展現空間規劃能力。' },
    { rank: 5, name: '空間設計系', university: '國立台北科技大學', category: '四技二專', scoreRange: '門檻 360+', keyRequirement: '統測+面試', portfolioFocus: '統測成績需達前標，面試著重設計理念表達。' },
  ],
  timeline: [
    '作品集深化階段：整合高二至今的設計草圖，將重點放在「問題解決的過程」而非僅是最終成果。建議加入 1-2 件關於永續建築的探究專題。',
    '英文門檻突破：密集訓練多益聽力與閱讀，目標鎖定 850 分。這將在面試中提供顯著的加分項，並增加挑戰頂尖校系的底氣。',
    '面試模擬準備：針對目標校系的面試題型進行系統性練習，準備 STAR 法則結構化回答，並練習作品集口頭簡報。',
  ],
  portfolioAdvice: '建築不只是空間的構築，更是思維的具象化。你的優勢在於理性的邏輯與感性的筆觸，這正是頂尖建築系所青睞的人格特質。',
  interviewAdvice: '面試時保持冷靜，用結構化的方式回答問題。準備 3-5 個能展現你設計思維的案例，並練習在 5 分鐘內完整呈現一件作品。',
  overallStrategy: '具備卓越的空間感知能力與人文關懷，在數學邏輯與美學表現間取得高度平衡，屬於「思辨型設計者」。建議強化永續設計相關作品，並提升英語能力以增加國際競爭力。',
};

export default function StrategyPage() {
  const [isPro, setIsPro] = useState(false);
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [report, setReport] = useState<StrategyReport | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFallback, setIsFallback] = useState(false);
  const [aiError, setAiError] = useState('');

  const [customDirection, setCustomDirection] = useState('');
  const [customGroup, setCustomGroup] = useState<VocationalGroup>('資訊群');
  const [customGrade, setCustomGrade] = useState('高二');
  const [customTrack, setCustomTrack] = useState('高職');

  const displayReport = report || DEMO_REPORT;
  const displayGroup = report?.directionGroup || DEMO_REPORT.directionGroup;
  const displayGrade = report?.grade || DEMO_REPORT.grade;
  const displayDirection = report?.direction || DEMO_REPORT.direction;
  const isDemo = !report;

  useEffect(() => {
    const stored = loadFromStorage<OnboardingProfile | null>('onboarding-profile', null);
    if (stored) setProfile(stored);
    const sub = loadFromStorage<{ plan: string; expiresAt: string | null }>('user-subscription', { plan: 'free', expiresAt: null });
    setIsPro(sub.plan !== 'free');
  }, []);

  async function generateReport() {
    setIsLoading(true);
    setError('');
    setIsFallback(false);
    setAiError('');

    const dir = profile?.selectedDirections[0] || customDirection;
    const grp = customGroup;
    const grade = profile?.grade || customGrade;
    const track = profile?.track || customTrack;
    const directions = profile?.selectedDirections || [customDirection];

    try {
      const res = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          direction: dir,
          directionGroup: grp,
          grade,
          track,
          selectedDirections: directions,
          portfolioCount: 0,
        }),
      });

      const data = await res.json();
      if (data.error) {
        if (res.status === 429 || data.error.includes('頻繁') || data.error.includes('rate')) {
          setError('AI 請求太頻繁，請稍等 1-2 分鐘再試。');
        } else {
          setError(data.error || '無法生成報告，請稍後再試。');
        }
      } else {
        setReport(data);
        setShowCustom(false);
        if (data._fallback) {
          setIsFallback(true);
          setAiError(data._aiError || 'AI 服務暫時不可用，顯示的是基本報告。');
        }
      }
    } catch {
      setError('網路錯誤，請檢查網路連線後再試。');
    }
    setIsLoading(false);
  }

  // ── Loading State ──
  if (isLoading) {
    return (
      <div className="page-container flex flex-col items-center justify-center py-xxl">
        <div className="w-16 h-16 border-4 border-primary-fixed border-t-primary rounded-full animate-spin mb-lg" />
        <p className="font-body-lg text-on-surface-variant">AI 正在分析並生成你的策略報告...</p>
      </div>
    );
  }

  // ── Custom Report Config Form ──
  if (showCustom) {
    return (
      <div className="page-container">
        <section className="mb-xxl text-center md:text-left">
          <div className="inline-block px-3 py-1 bg-primary-fixed text-on-primary-fixed font-label-caps mb-md">
            {isPro ? 'PRO FEATURE' : 'BASIC REPORT'}
          </div>
          <h1 className="font-h1 text-on-background mb-sm">生成個人化報告</h1>
          <p className="font-body-lg text-on-surface-variant max-w-[42rem]">
            輸入你的資訊，AI 將根據你的學習歷程與職群方向，規劃最佳升學策略。
          </p>
        </section>

        <div className="max-w-[56rem] mx-auto bg-surface-container-low border border-[#E9E5DB] p-xl mb-xl">
          <h3 className="font-h3 text-primary mb-lg">報告設定</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md mb-lg">
            <div>
              <label className="font-label-caps text-primary uppercase tracking-widest block mb-sm">目標方向</label>
              <input
                type="text"
                value={customDirection}
                onChange={e => setCustomDirection(e.target.value)}
                placeholder={profile?.selectedDirections[0] || '例如：資訊軟體應用'}
                className="w-full px-md py-3 bg-surface-container-lowest border border-[#E9E5DB] focus:border-primary focus:ring-1 focus:ring-primary font-body-md outline-none"
              />
            </div>
            <div>
              <label className="font-label-caps text-primary uppercase tracking-widest block mb-sm">職群</label>
              <select
                value={customGroup}
                onChange={e => setCustomGroup(e.target.value as VocationalGroup)}
                className="w-full px-md py-3 bg-surface-container-lowest border border-[#E9E5DB] focus:border-primary focus:ring-1 focus:ring-primary font-body-md outline-none cursor-pointer"
              >
                {Object.entries(VOCATIONAL_GROUP_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-label-caps text-primary uppercase tracking-widest block mb-sm">年級</label>
              <select
                value={customGrade}
                onChange={e => setCustomGrade(e.target.value)}
                className="w-full px-md py-3 bg-surface-container-lowest border border-[#E9E5DB] focus:border-primary focus:ring-1 focus:ring-primary font-body-md outline-none cursor-pointer"
              >
                <option value="高一">高一</option>
                <option value="高二">高二</option>
                <option value="高三">高三</option>
              </select>
            </div>
            <div>
              <label className="font-label-caps text-primary uppercase tracking-widest block mb-sm">分組</label>
              <select
                value={customTrack}
                onChange={e => setCustomTrack(e.target.value)}
                className="w-full px-md py-3 bg-surface-container-lowest border border-[#E9E5DB] focus:border-primary focus:ring-1 focus:ring-primary font-body-md outline-none cursor-pointer"
              >
                <option value="高職">高職</option>
                <option value="未決定">未決定</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-error-container border border-error/20 p-md mb-lg">
              <p className="font-body-md text-on-error-container mb-sm">{error}</p>
              <button onClick={generateReport} disabled={isLoading} className="text-sm text-error underline hover:text-error cursor-pointer">
                重試
              </button>
            </div>
          )}

          <div className="flex justify-center gap-md">
            <button
              onClick={generateReport}
              disabled={isLoading || !customDirection.trim()}
              className={
                'bg-primary text-white px-xl py-3 font-label-caps transition-all cursor-pointer ' +
                (customDirection.trim() && !isLoading ? 'hover:opacity-90' : 'opacity-50 cursor-not-allowed')
              }
            >
              {isPro ? 'AI 生成策略報告' : '免費基本報告'}
            </button>
            <button
              onClick={() => setShowCustom(false)}
              className="border border-primary text-primary px-xl py-3 font-label-caps hover:bg-primary-fixed transition-all cursor-pointer"
            >
              返回範例報告
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Report Display (Demo or AI-generated) ──
  return (
    <div className="page-container">
      {/* Demo banner */}
      {isDemo && (
        <div className="bg-primary-fixed/20 border border-primary/20 p-md mb-xxl flex items-center justify-between">
          <p className="font-body-md text-on-surface-variant">此為範例報告。點擊「生成個人化報告」可獲取 AI 專屬分析。</p>
          <button
            onClick={() => setShowCustom(true)}
            className="bg-primary text-white px-lg py-2 font-label-caps hover:opacity-90 transition-all cursor-pointer shrink-0"
          >
            生成個人化報告
          </button>
        </div>
      )}

      {/* AI fallback notice */}
      {isFallback && !isDemo && (
        <div className="bg-primary-fixed/20 border border-primary/20 p-md mb-xxl">
          <p className="font-body-md text-on-surface-variant">{aiError}</p>
        </div>
      )}

      {/* Report Header */}
      <section className="mb-xxl text-center md:text-left">
        <div className="inline-block px-3 py-1 bg-primary-fixed text-on-primary-fixed font-label-caps mb-md">
          {isDemo ? 'CONFIDENTIAL STRATEGY REPORT 2024' : isFallback ? 'BASIC STRATEGY REPORT' : 'AI-POWERED STRATEGY REPORT'}
        </div>
        <h1 className="font-h1 text-on-background mb-sm">個人升學戰略分析報告</h1>
        <p className="font-body-lg text-on-surface-variant max-w-[42rem]">
          專為 <span className="font-bold text-primary">{isDemo ? '林嘉誠' : displayDirection}</span> 同學量身打造。基於近三年的學習歷程、模考數據與職業適性測驗，規劃之{displayGroup}升學錄取策略。
        </p>
      </section>

      {/* Executive Summary Bento Grid */}
      <div className="grid grid-cols-12 gap-gutter mb-xxl">
        {/* Priority Schools (8 cols) */}
        <div className="col-span-12 md:col-span-8 bg-surface-container-low p-xl border border-outline-variant relative overflow-hidden">
          <div className="absolute top-0 right-0 p-lg opacity-10 font-h1 text-8xl pointer-events-none select-none">01</div>
          <h3 className="font-h3 text-primary mb-lg">首選目標校系</h3>
          <div className="space-y-md">
            {displayReport.departments.slice(0, 5).map((dept, i) => (
              <div key={dept.rank} className="flex justify-between items-end border-b border-outline-variant pb-xs">
                <div>
                  <p className="font-label-caps text-on-surface-variant">{i === 0 ? '第一志願' : i === 1 ? '第二志願' : i === 2 ? '挑戰志願' : `第${dept.rank}志願`}</p>
                  <p className="font-h3 text-xl">{dept.name}</p>
                  <p className="text-sm text-on-surface-variant">{dept.university} · {dept.category}</p>
                </div>
                <p className={`font-semibold ${i === 0 ? 'text-primary' : i === 2 ? 'text-secondary' : 'text-primary'}`}>
                  {dept.scoreRange}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Summary (4 cols) */}
        <div className="col-span-12 md:col-span-4 bg-primary text-on-primary p-xl flex flex-col justify-between">
          <div>
            <h3 className="font-h3 mb-md">人才畫像</h3>
            <p className="opacity-90 leading-relaxed font-body-md">{displayReport.overallStrategy.slice(0, 120)}...</p>
          </div>
          <div className="mt-xl">
            <div className="text-sm opacity-70 mb-xs">主要優勢標籤</div>
            <div className="flex flex-wrap gap-2">
              {isDemo ? (
                <>
                  <span className="bg-white/10 px-2 py-1 text-xs">空間邏輯 A+</span>
                  <span className="bg-white/10 px-2 py-1 text-xs">手繪表現 A</span>
                  <span className="bg-white/10 px-2 py-1 text-xs">數位工具 B+</span>
                </>
              ) : (
                <>
                  <span className="bg-white/10 px-2 py-1 text-xs">{displayGroup}專業</span>
                  <span className="bg-white/10 px-2 py-1 text-xs">{displayGrade}學生</span>
                  <span className="bg-white/10 px-2 py-1 text-xs">策略規劃</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SWOT Analysis */}
      <section className="mb-xxl">
        <div className="flex items-center gap-gutter mb-xl">
          <h2 className="font-h2 text-on-background shrink-0">競爭優劣勢分析</h2>
          <div className="h-[1px] w-full bg-outline-variant" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {/* Strengths */}
          <div className="border-l-4 border-primary bg-surface-container-lowest p-lg shadow-[0_4px_30px_rgba(125,139,126,0.05)]">
            <div className="flex items-center gap-sm mb-md text-primary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
              <span className="font-label-caps">核心優勢 (Strengths)</span>
            </div>
            <ul className="space-y-md text-on-surface-variant">
              {displayReport.timeline.slice(0, 2).map((item, i) => (
                <li key={i} className="flex gap-sm">
                  <span className="text-primary font-bold">{String(i + 1).padStart(2, '0')}</span>
                  <p className="font-body-md">{item.includes('：') ? item.split('：').slice(1).join('：') : item}</p>
                </li>
              ))}
            </ul>
          </div>
          {/* Weaknesses */}
          <div className="border-l-4 border-tertiary-container bg-surface-container-lowest p-lg shadow-[0_4px_30px_rgba(125,139,126,0.05)]">
            <div className="flex items-center gap-sm mb-md text-tertiary-container">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>trending_down</span>
              <span className="font-label-caps">潛在弱點 (Weaknesses)</span>
            </div>
            <ul className="space-y-md text-on-surface-variant">
              {displayReport.departments.slice(3, 5).map((dept, i) => (
                <li key={dept.rank} className="flex gap-sm">
                  <span className="text-tertiary-container font-bold">{String(i + 1).padStart(2, '0')}</span>
                  <p className="font-body-md">{dept.portfolioFocus}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Quote Block */}
      <section className="mb-xxl p-xl bg-[#F4F1EA] border-l-4 border-[#7D8B7E]">
        <div className="flex gap-md">
          <span className="material-symbols-outlined text-primary text-4xl">format_quote</span>
          <p className="font-h3 text-xl italic leading-relaxed text-primary">
            {displayReport.portfolioAdvice}
          </p>
        </div>
        <div className="mt-lg flex items-center justify-end gap-md">
          <div className="text-right">
            <p className="font-bold text-on-surface">{isDemo ? '張慕白 顧問' : '升學大師 AI 顧問'}</p>
            <p className="text-sm text-on-surface-variant italic">{isDemo ? '前任哈佛建築研究所客座導師' : `${displayGroup} · 職群策略分析`}</p>
          </div>
          <div className="w-12 h-12 rounded-full overflow-hidden bg-stone-300">
            <img
              alt="顧問"
              className="w-full h-full object-cover"
              src={CONSULTANT_PHOTO}
            />
          </div>
        </div>
      </section>

      {/* Action Plan / Timeline */}
      <section className="mb-xxl">
        <h2 className="font-h2 text-on-background mb-xl text-center">關鍵行動藍圖</h2>
        <div className="space-y-gutter">
          {displayReport.timeline.map((item, i) => (
            <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-xl bg-white p-lg border border-outline-variant`}>
              <div className="w-full md:w-1/3 aspect-video overflow-hidden">
                <img
                  alt={`行動階段 ${i + 1}`}
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  src={ACTION_IMAGES[i % ACTION_IMAGES.length]}
                />
              </div>
              <div className="flex-1">
                <div className="text-primary font-h3 mb-sm">{String(i + 1).padStart(2, '0')}. {item.split('：')[0] || `階段 ${i + 1}`}</div>
                <p className="text-on-surface-variant font-body-md mb-md">{item.includes('：') ? item.split('：').slice(1).join('：') : item}</p>
                <button className="font-label-caps text-primary border-b border-primary pb-1 hover:text-on-primary-fixed-variant transition-colors cursor-pointer">
                  {i === 0 ? '下載作品集檢核清單' : i === 1 ? '預約英文診斷測試' : '查看面試準備指南'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface-container p-xl text-center">
        <h3 className="font-h3 text-on-background mb-md">準備好執行你的藍圖了嗎？</h3>
        <p className="text-on-surface-variant font-body-md mb-lg max-w-[36rem] mx-auto">
          我們的顧問團隊將伴隨你完成每一個節點。若對報告內容有任何疑問，請隨時安排諮詢會議。
        </p>
        <div className="flex flex-wrap justify-center gap-md">
          {isDemo ? (
            <button
              onClick={() => setShowCustom(true)}
              className="bg-[#7D8B7E] text-white px-lg py-md font-label-caps hover:bg-primary transition-colors cursor-pointer"
            >
              生成個人化報告
            </button>
          ) : (
            <button
              onClick={() => { setReport(null); setIsFallback(false); setAiError(''); }}
              className="bg-[#7D8B7E] text-white px-lg py-md font-label-caps hover:bg-primary transition-colors cursor-pointer"
            >
              重新生成報告
            </button>
          )}
          <a href="/interview" className="border border-[#7D8B7E] text-[#7D8B7E] px-lg py-md font-label-caps hover:bg-surface-container-high transition-colors cursor-pointer">
            開始面試模擬
          </a>
        </div>
      </section>
    </div>
  );
}
