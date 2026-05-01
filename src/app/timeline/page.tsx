'use client';

import { useState, useEffect, useMemo } from 'react';
import { loadFromStorage } from '@/lib/storage';
import { isProUser } from '@/lib/subscription';
import type { SkillItem, CalendarEvent, MonthlyReview } from '@/types';
import { SKILL_CATEGORY_LABELS } from '@/types';
import { NATIONAL_CALENDAR_EVENTS, EVENT_TYPE_LABELS } from '@/data/national-calendar';

const DEMO_TIMELINE = [
  {
    num: '01',
    date: '2023年 09月 15日',
    title: '初探：啟航的指南針',
    description: '完成了首次的職群測驗，確定了建築與空間設計的熱情所在。這不僅是一次選擇，更是對未來願景的初步描摹。',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAt4eDmqV8ul_V6kBlma1L2Z_y2TnE89eahC9O88iZLAF2TjrUETmMha_lGAMVOP1-Tq8iS574gc-xVFfB2z0LnaTp9pVIff_NYB35L8BGyHRkBobiBz9rKzSp4WaM2Mi1cOkCiaOHLFBKeYRXMUyTfoUb_bRk_KsYKGV-6-w5Ilbq73lAyJ43FK5co69S7Ci9vRwPx5ZGg2ssY-uqHFgevnZqkVfHJKrA0TWX3qEsfamQPbyWCssd_EZ-lYm1BBKn6TGZ5YFTCWQU9',
    imageOnRight: true,
  },
  {
    num: '02',
    date: '2023年 11月 02日',
    title: '對話：大師的指引',
    description: '與資深建築師進行了職涯訪談。從專業視角理解建築不僅是藝術，更是社會責任與空間邏輯的結合。',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkbh4Tccs12gPXpj4xyJf6ojIIaVuN9q15kznIU8KY8iioKjrjU20VB05ke_vh3TfZBZIlNrGj_oJy3-xu9_2CBukZ719Ct_AEAM_VIs8zqJVj3aUv4uX3Juibh5EiQmMTq2qpTuUj0ekDM19uxDkCo0SEMUnZtQdJLJkoPiYBFMiTQuEtsTs4CH1jNPQ9FV6Z-q7FZuiXP_pe9j62scVb0Df-zr9pjJR1N-ZI8ffA9LQEePAWgn1DR4ogyztJQd6ejq7QkBeNO1AO',
    imageOnRight: false,
  },
  {
    num: '03',
    date: '2024年 01月 20日',
    title: '實踐：模型構築夢想',
    description: '完成了首件個人空間模型作品「光影的容器」。這是一次對材料與結構的探索，也是學習歷程中的重要里程碑。',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGf5Sw4_Y9G3CEyL-aBbrTQRtSaucfcrhNwktFucy0s14SjlZlHgMRUm5m7k_NANE0HDR7h5IGl-w-Oo_XPkhuRabnGmHAVOHMhPKz1lIe5A_jA2SSSQFvirn9HLkYv3l4-c6i0oS9AtcQAdTEL60Qiu5mNmL0vQ5kRHZF9qd0AdTGpBrZgLL0CY76up-aUMBzDC9vC9ewLQ_0wp2ZMgEqze31QcfxSQEdY3KDq_v8BPQLzURx4nN6jVBflTpG7nuxq47hYWJ40mS-',
    imageOnRight: true,
  },
  {
    num: '04',
    date: '2024年 03月 12日',
    title: '省思：彙整與定位',
    description: '完成學習歷程檔案的初稿編修。透過系統性的回顧，更清晰地看到了自己在設計思維上的成長軌跡。',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEPX5ueGIUHR_KyOb-d4vB6FKYlEJuaIBbi5f-yQdSov8qANUi44ru8zrgdzkJxYdO2mDIL_HfrgoEWHAhp6CaUQbE41HTFtX4-06uJQCaWN9X5Nq8u5BKy57Y8618iClBlgQGsAOcgC720mpH-yNbPQrn25eiMO009Q7vXszbNVoQmTQSNkh2r9Z_3L0e_Gp8bpBF7DzC8p6TFj5h7pPv9JBIVvnssJ25YF892Raudj-P5klIF_bTSrFrpW51MVfQyH2iZiz7jdhL',
    imageOnRight: false,
  },
];

export default function TimelinePage() {
  const [mode, setMode] = useState<'demo' | 'live'>('demo');
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
      const typeLabel = EVENT_TYPE_LABELS[event.type] || '其他';
      allItems.push({ date: event.date, type: 'calendar', title: event.title, detail: typeLabel });
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
  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    skillItems.forEach(item => {
      const label = SKILL_CATEGORY_LABELS[item.category];
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [skillItems]);

  if (mode === 'demo') {
    return (
      <div className="page-container">
        {/* Demo Banner */}
        <div className="bg-primary-fixed border border-primary/20 px-lg py-sm mb-xl flex items-center justify-between">
          <p className="text-sm text-on-primary-fixed-variant">此為範例時光軸。完成 onboarding 並記錄技能後，將顯示你的個人學習歷程。</p>
          <button onClick={() => setMode('live')} className="bg-primary text-white px-6 py-2 font-label-caps text-label-caps tracking-widest hover:opacity-90 transition-all cursor-pointer shrink-0">
            查看我的時光軸
          </button>
        </div>

        {/* Hero Title Section */}
        <section className="mb-xl text-center md:text-left">
          <span className="font-label-caps text-primary tracking-[0.2em] mb-sm block">TIMELINE OF GROWTH</span>
          <h2 className="font-h1 text-h1 text-on-surface mb-md">時光軸</h2>
          <p className="font-body-lg text-on-surface-variant max-w-[42rem]">
            每一段旅程都值得被銘記。這裡記錄了你從探索到實踐的每一個關鍵瞬間，構築出屬於你的學術導航圖。
          </p>
        </section>

        {/* Timeline Container */}
        <div className="relative mt-xxl">
          {/* Vertical Line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-outline-variant hidden md:block" />
          <div className="space-y-xxl relative">
            {DEMO_TIMELINE.map((item, index) => (
              <div key={item.num} className="flex flex-col md:flex-row items-center justify-between gap-xl">
                {/* Left side: text or image */}
                <div className={`md:w-5/12 w-full ${item.imageOnRight ? 'order-2 md:order-1 text-right' : 'order-3 md:order-1'}`}>
                  {item.imageOnRight ? (
                    <div className="space-y-xs">
                      <span className="font-h3 text-h3 text-primary block">{item.num}</span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant block mb-sm">{item.date}</span>
                      <h3 className="font-h2 text-h2 mb-md">{item.title}</h3>
                      <p className="font-body-md text-on-surface-variant leading-relaxed">{item.description}</p>
                    </div>
                  ) : (
                    <div className="aspect-[4/3] overflow-hidden bg-surface-container border border-outline-variant group">
                      <img
                        alt="時光軸縮圖"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        src={item.image}
                      />
                    </div>
                  )}
                </div>

                {/* Center dot */}
                <div className="z-10 md:w-2/12 flex justify-center order-1 md:order-2">
                  <div className="w-4 h-4 rounded-full bg-primary ring-8 ring-background border border-outline-variant" />
                </div>

                {/* Right side: image or text */}
                <div className={`md:w-5/12 w-full ${item.imageOnRight ? 'order-3' : 'order-2 md:order-3'}`}>
                  {item.imageOnRight ? (
                    <div className="aspect-[4/3] overflow-hidden bg-surface-container border border-outline-variant group">
                      <img
                        alt="時光軸縮圖"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        src={item.image}
                      />
                    </div>
                  ) : (
                    <div className="space-y-xs">
                      <span className="font-h3 text-h3 text-primary block">{item.num}</span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant block mb-sm">{item.date}</span>
                      <h3 className="font-h2 text-h2 mb-md">{item.title}</h3>
                      <p className="font-body-md text-on-surface-variant leading-relaxed">{item.description}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Quote Section */}
        <section className="mt-xxl pt-xxl border-t border-outline-variant">
          <div className="max-w-[48rem] mx-auto text-center">
            <blockquote className="font-display-italic text-h2 italic text-primary leading-relaxed px-md">
              &ldquo;成長並非一蹴而就，而是一連串細微步伐的積累，最終構築成通往未來的橋樑。&rdquo;
            </blockquote>
            <div className="mt-md h-1 w-12 bg-primary mx-auto" />
          </div>
        </section>
      </div>
    );
  }

  const isPro = isProUser();

  return (
    <div className="page-container">
      {/* Back to demo */}
      <button
        onClick={() => setMode('demo')}
        className="mb-lg text-primary hover:underline font-label-caps text-label-caps cursor-pointer"
      >
        &larr; 返回範例時光軸
      </button>

      {/* Header */}
      <section className="mb-xl">
        <div className="border-l-4 border-primary pl-lg py-sm">
          <span className="font-label-caps text-primary uppercase tracking-widest block mb-xs">ACHIEVEMENT TIMELINE</span>
          <h1 className="font-h1 text-h1 text-on-surface">成就時光軸</h1>
        </div>
      </section>

      {/* Milestone Card */}
      <div className="bg-surface-container-low border border-[#E9E5DB] p-xl mb-xxl">
        <div className="flex items-center gap-lg mb-lg">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-h2 text-h2 text-on-primary">
            {totalSkill}
          </div>
          <div>
            <div className="font-bold text-on-surface font-body-lg">累積技能紀錄</div>
            <div className="text-on-surface-variant font-body-md">
              {totalSkill > 0 ? `已記錄 ${totalSkill} 件技能` : '還沒有記錄，從今天開始！'}
            </div>
          </div>
        </div>
        {categoryDistribution.length > 0 && (
          <div className="flex flex-wrap gap-sm">
            {categoryDistribution.map(([label, count]) => (
              <span key={label} className="font-label-caps text-xs px-2 py-1 bg-primary-fixed text-on-primary-fixed-variant">
                {label} &times; {count}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* AI Growth Summary */}
      {totalSkill >= 3 && (
        <div className="bg-primary-fixed/20 border border-primary/20 p-xl mb-xxl">
          <div className="flex items-center gap-sm mb-md">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            <h3 className="font-h3 text-h3 text-on-surface">AI 成長摘要</h3>
            {isPro ? (
              <span className="font-label-caps text-xs px-2 py-0.5 bg-success text-on-primary">Pro</span>
            ) : (
              <span className="font-label-caps text-xs px-2 py-0.5 bg-primary text-on-primary">Pro</span>
            )}
          </div>
          {isPro ? (
            <p className="font-body-md text-on-surface-variant">
              你已累積 {totalSkill} 件技能紀錄，涵蓋 {categoryDistribution.length} 種技能類別。持續保持記錄習慣，你的學習歷程會越來越完整。
            </p>
          ) : (
            <>
              <p className="font-body-md text-on-surface-variant mb-md">
                讓 AI 分析你的學習歷程，自動生成每月成長摘要與下一步建議。
              </p>
              <a href="/pricing" className="bg-primary text-white px-lg py-2 font-label-caps hover:opacity-90 transition-all cursor-pointer">
                解鎖 AI 成長摘要
              </a>
            </>
          )}
        </div>
      )}

      {/* Monthly Timeline */}
      <div className="space-y-gutter">
        {monthlyReviews.length === 0 && (
          <div className="text-center py-xxl text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl text-outline mb-lg block">timeline</span>
            <p className="font-h3 text-h3 text-on-surface-variant">還沒有記錄</p>
            <p className="font-body-md mt-sm">
              去<a href="/portfolio" className="text-primary underline hover:opacity-70">記錄技能</a>或<a href="/calendar" className="text-primary underline hover:opacity-70">同步校曆</a>，你的時光軸就會開始生長
            </p>
          </div>
        )}

        {monthlyReviews.map((review, reviewIndex) => (
          <div key={review.month} className="relative">
            <div className="flex items-start gap-gutter">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-4 h-4 bg-primary ring-8 ring-background rounded-full" />
                {reviewIndex < monthlyReviews.length - 1 && (
                  <div className="w-[2px] flex-1 bg-outline-variant mt-sm" />
                )}
              </div>

              <div className="flex-1 bg-surface-container-low border border-[#E9E5DB] p-xl mb-gutter">
                <div className="flex items-center justify-between mb-lg">
                  <div>
                    <span className="font-label-caps text-primary uppercase tracking-widest block mb-xs">{review.month}</span>
                    <div className="flex gap-sm">
                      {review.portfolioCount > 0 && (
                        <span className="font-label-caps text-xs px-2 py-1 bg-primary-fixed text-on-primary-fixed-variant">
                          技能 {review.portfolioCount} 件
                        </span>
                      )}
                      {review.exploreCount > 0 && (
                        <span className="font-label-caps text-xs px-2 py-1 bg-secondary-container text-on-secondary-container">
                          探索 {review.exploreCount} 件
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant">calendar_month</span>
                </div>

                <div className="space-y-md">
                  {review.entries.slice(0, 10).map((entry, i) => (
                    <div key={i} className="flex items-start gap-md group cursor-pointer">
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                        entry.type === 'portfolio' ? 'bg-primary' :
                        entry.type === 'explore' ? 'bg-secondary' :
                        'bg-outline-variant'
                      }`} />
                      <div className="flex-1">
                        <div className="text-xs text-outline font-label-caps">{entry.date}</div>
                        <div className="font-body-md text-on-surface group-hover:text-primary transition-colors">{entry.title}</div>
                        <div className="text-xs text-on-surface-variant">{entry.detail}</div>
                      </div>
                    </div>
                  ))}
                  {review.entries.length > 10 && (
                    <div className="text-xs text-on-surface-variant pl-5">還有 {review.entries.length - 10} 筆記錄</div>
                  )}
                </div>

                <div className="mt-lg pt-lg border-t border-outline-variant">
                  <p className="font-body-md text-on-surface-variant italic">{review.summary}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
