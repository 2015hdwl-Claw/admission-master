'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { loadFromStorage } from '@/lib/storage';
import { isProUser } from '@/lib/subscription';
import { VOCATIONAL_GROUP_COLORS } from '@/data/vocational-categories';
import { NATIONAL_CALENDAR_EVENTS } from '@/data/national-calendar';
import { SKILL_CATEGORY_LABELS, SKILL_CATEGORY_ICONS } from '@/types';
import type {
  OnboardingProfile,
  DirectionResult,
  GradeLevel,
  VocationalPathway,
  VocationalGroup,
  VocationalRoadmapPhase,
  SkillGap,
  SkillItem,
  SkillCategory,
} from '@/types';

const GRADES: GradeLevel[] = ['高一', '高二', '高三'];
const PATHWAYS: VocationalPathway[] = ['四技二專甄選', '聯合登記分發', '技優保送甄保', '科技校院繁星', '各校單獨招生', '二技轉學考'];

function getMonthsUntilDeadline(): number {
  const deadline = new Date('2027-05-04');
  const now = new Date();
  return (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth());
}

function getMonthsRemaining(grade: GradeLevel): number {
  const base = getMonthsUntilDeadline();
  const offset: Record<GradeLevel, number> = { '高一': 24, '高二': 12, '高三': 0 };
  return Math.max(1, base + offset[grade]);
}

function analyzeGaps(
  directions: DirectionResult[],
  skillItems: SkillItem[],
  grade: GradeLevel
): SkillGap[] {
  const gaps: SkillGap[] = [];
  const categoryCounts: Record<SkillCategory, number> = {
    capstone: 0, certification: 0, internship: 0,
    competition: 0, club: 0, license: 0, service: 0,
  };
  skillItems.forEach(item => { categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1; });

  const directionGroup = directions[0]?.directionGroup as VocationalGroup | undefined;
  const isIndustrialGroup = ['機械群', '電機群', '電子群', '化工群', '土木群'].includes(directionGroup || '');
  const isServiceGroup = ['餐旅群', '護理群', '家政群'].includes(directionGroup || '');
  const isInfoGroup = directionGroup === '資訊群';

  const capstoneIdeal = grade === '高一' ? 2 : grade === '高二' ? 2 : 1;
  if (categoryCounts.capstone < capstoneIdeal) {
    gaps.push({ category: 'capstone', current: categoryCounts.capstone, recommended: capstoneIdeal, description: `你需要至少 ${capstoneIdeal} 件專題實作${grade === '高三' ? '' : '，為甄選備審增加實質內容'}。`, priority: 'critical' });
  }

  const hasCertification = skillItems.some(item => item.category === 'certification' && item.certificationLevel);
  if (!hasCertification) {
    gaps.push({ category: 'certification', current: categoryCounts.certification, recommended: 1, description: '至少需要一張丙級技術士證照，這是四技二專甄選的基本門檻。', priority: 'critical' });
  } else {
    const certItem = skillItems.find(item => item.category === 'certification' && item.certificationLevel);
    if (certItem?.certificationLevel === '丙級' && grade !== '高三') {
      gaps.push({ category: 'certification', current: 1, recommended: 2, description: '已有丙級證照，建議進階考取乙級以增加競爭力。', priority: 'important' });
    }
  }

  if ((isServiceGroup || isIndustrialGroup) && categoryCounts.internship === 0) {
    gaps.push({ category: 'internship', current: 0, recommended: 1, description: `${directionGroup}建議有實習經驗，展現職場實務能力。`, priority: 'important' });
  }
  if ((isIndustrialGroup || isInfoGroup) && categoryCounts.competition === 0) {
    gaps.push({ category: 'competition', current: 0, recommended: 1, description: `${directionGroup}有競賽經歷會是大幅加分項，建議參加技能競賽或專題競賽。`, priority: 'important' });
  }
  if (categoryCounts.club === 0) {
    gaps.push({ category: 'club', current: 0, recommended: 1, description: '社團參與能展現團隊合作與領導力，建議至少持續參與一個社團。', priority: 'suggested' });
  }
  if (isServiceGroup && categoryCounts.service === 0) {
    gaps.push({ category: 'service', current: 0, recommended: 1, description: `${directionGroup}看重服務精神，建議累積服務學習時數。`, priority: 'important' });
  }
  if (categoryCounts.license === 0 && grade !== '高三') {
    gaps.push({ category: 'license', current: 0, recommended: 1, description: '專業證照能展現你的學習廣度，建議考取與科系相關的證照。', priority: 'suggested' });
  }
  return gaps;
}

function generatePersonalizedRoadmap(grade: GradeLevel, pathway: VocationalPathway, directions: DirectionResult[], skillCount: number, gaps: SkillGap[]): VocationalRoadmapPhase[] {
  const phases: VocationalRoadmapPhase[] = [];
  const directionNames = directions.map(d => d.direction).join('、');

  if (grade === '高三') {
    phases.push(
      { id: 'p1', name: '專題實作收尾 + 統測衝刺', period: '第 1-4 週', deadline: '2027-04-20', description: '完成專題實作的最終修改，同時全力衝刺統測準備。', tasks: [...gaps.filter(g => g.priority === 'critical').slice(0, 2).map(g => `「${SKILL_CATEGORY_LABELS[g.category]}」：${g.description}`), '完成專題實作報告的最終版本（含摘要、圖表、結論）', '每日統測複習 — 國文、英文、數學為主，專業科目加強弱項', '整理過去模擬考的錯題本，針對性加強'], skillGaps: gaps.filter(g => g.priority === 'critical').slice(0, 2), isCurrent: true, isPast: false },
      { id: 'p2', name: '四技二專甄選準備', period: '第 4-8 週', deadline: '2027-05-10', description: `準備${directionNames}相關的備審資料，展現你的專題實作成果與技能實力。`, tasks: ['撰寫備審資料 — 聚焦專題實作過程與學習心得（800-1200 字）', '整理技能檢定證照清單，附上成績單影本', '準備專題實作作品的詳細說明（含照片/影片連結）', '撰寫學習動機 — 為什麼選擇' + directionNames + '方向', '請專題指導老師幫忙審閱備審資料'], skillGaps: [], isCurrent: false, isPast: false },
      { id: 'p3', name: '面試準備', period: '第 8-10 週', deadline: '2027-06-10', description: pathway === '聯合登記分發' ? '聯合分發不需要面試，但需要研究各校系錄取分數和填報策略。' : `準備${directionNames}相關的面試問題，展現你的專業素養。`, tasks: pathway === '聯合登記分發' ? ['研究各校系近年統測錄取分數', '根據統測成績排好志願序', '了解聯合分發填誌策略與落點分析'] : [`準備「為什麼選${directionNames}」的回答`, '用 STAR-S 框架準備 3 個專題實作相關的故事', '準備技能檢定過程的分享（考了什麼、怎麼準備、學到什麼）', '找同學互相模擬面試至少 2 次', '準備 1 分鐘自我介紹'], skillGaps: [], isCurrent: false, isPast: false },
      { id: 'p4', name: '聯合分發志願填報', period: '放榜後', deadline: '2027-07-15', description: '根據甄選結果與統測成績，完成聯合登記分發志願填報。', tasks: ['確認甄選結果，決定是否放棄遞補', '研究各校系統測錄取分數與名額', '根據自身成績與志願排好志願序', '了解聯合分發機制（志願序、同分比序）', '完成志願填報並確認'], skillGaps: [], isCurrent: false, isPast: false },
    );
  } else if (grade === '高二') {
    phases.push(
      { id: 'p1', name: '技能深化期', period: '現在 ~ 6 個月後', deadline: '2026-10-01', description: `深入發展${directionNames}方向的核心技能，考取證照並開始專題。`, tasks: [...gaps.filter(g => g.priority === 'critical').slice(0, 2).map(g => `「${SKILL_CATEGORY_LABELS[g.category]}」：${g.description}`), `在${directionNames}領域選定專題實作題目，開始執行`, '報名並準備丙級（或乙級）技術士技能檢定', '每週記錄技能學習進度'], skillGaps: gaps.filter(g => g.priority === 'critical').slice(0, 3), isCurrent: true, isPast: false },
      { id: 'p2', name: '競賽與實習', period: '6-12 個月後', deadline: '2027-04-01', description: '參加技能競賽或校內專題競賽，爭取實習機會累積實務經驗。', tasks: [`參加至少 1 項與${directionNames}相關的技能競賽`, '尋找暑期或週末實習機會', '持續推進專題實作，完成中期報告', '與專題指導老師定期討論進度'], skillGaps: gaps.filter(g => g.priority === 'important').slice(0, 2), isCurrent: false, isPast: false },
      { id: 'p3', name: '專題實作完成', period: '12-15 個月後', deadline: '2027-07-01', description: '完成專題實作的最終版本，開始整理備審資料。', tasks: ['完成專題實作報告（含摘要、方法、結果、討論）', '拍攝專題成果照片或影片', '開始構思備審資料大綱', '整理所有技能檢定與競賽成果'], skillGaps: [], isCurrent: false, isPast: false },
      { id: 'p4', name: '統測準備 + 甄選備審', period: '15-18 個月後', deadline: '2027-10-01', description: '開始統測準備，同時撰寫甄選備審資料。', tasks: ['制定統測讀書計畫（每日定額複習）', '撰寫備審資料初稿', '請老師與同學提供回饋', '至少修改備審資料 3 次'], skillGaps: [], isCurrent: false, isPast: false },
    );
  } else {
    phases.push(
      { id: 'p1', name: '技能基礎期', period: '現在 ~ 12 個月後', deadline: '2027-04-01', description: '探索各職群技能，找到自己的興趣方向。', tasks: [...gaps.filter(g => g.priority === 'critical').slice(0, 2).map(g => `「${SKILL_CATEGORY_LABELS[g.category]}」：${g.description}`), '嘗試不同技能領域（實作課程、工作坊、體驗活動）', `深入了解${directionNames}相關的職群（用職群探索功能）`, '參加至少 1 個與技能相關的社團', '每週記錄技能學習心得'], skillGaps: gaps.filter(g => g.priority === 'critical').slice(0, 3), isCurrent: true, isPast: false },
      { id: 'p2', name: '技能深化期', period: '12-24 個月後', deadline: '2028-04-01', description: `選定${directionNames}方向，考取丙級證照，開始專題構想。`, tasks: ['報名並通過丙級技術士技能檢定', `在${directionNames}領域構思專題實作題目`, '參加校內技能競賽累積經驗', '持續參與社團，爭取幹部職位'], skillGaps: gaps.filter(g => g.priority === 'important').slice(0, 2), isCurrent: false, isPast: false },
      { id: 'p3', name: '專題與競賽', period: '24-30 個月後', deadline: '2028-10-01', description: '正式開始專題實作，參加對外競賽展現實力。', tasks: ['正式執行專題實作，完成初步成果', '參加全國技能競賽或專題競賽', '尋求實習機會累積實務經驗', '考取更高級別的技能檢定（乙級）'], skillGaps: [], isCurrent: false, isPast: false },
      { id: 'p4', name: '甄選準備期', period: '30-36 個月後', deadline: '2029-04-01', description: '完成專題實作，開始準備備審資料與統測。', tasks: ['完成專題實作的最終報告', '撰寫備審資料初稿', '制定統測讀書計畫', '研究目標四技二專校系的招生資訊'], skillGaps: [], isCurrent: false, isPast: false },
    );
  }
  return phases;
}

function getEncouragement(grade: GradeLevel, skillCount: number, directions: DirectionResult[]): string {
  const dirStr = directions.length > 0 ? directions.map(d => d.direction).join('、') : '你的目標方向';
  const hasEnough = skillCount >= 5;
  if (grade === '高一') return `你才高一，時間非常充裕！${dirStr}是很好的目標方向。現在開始探索技能、參加社團、累積專題實作經驗，高三時你會感謝現在的自己。`;
  if (grade === '高二') {
    if (hasEnough) return `高二是黃金時期，你已經累積了不少技能紀錄。專注深化${dirStr}方向，完成專題實作並考取證照，你一定可以進入理想的四技二專！`;
    return `高二開始準備完全來得及！從今天開始記錄技能學習、報名技能檢定、構思專題實作題目，一年後你就會有豐富的備審素材。`;
  }
  if (hasEnough) return `高三了但技能準備得不錯！專注備審資料的品質，把專題實作和技能檢定的成果好好呈現，展現你對${dirStr}的熱情，你一定可以！`;
  return `雖然高三了，但全力衝刺還來得及！集中精力完成專題實作的最終版本，備審資料的質量比數量更重要。`;
}

const PRIORITY_STYLES: Record<string, string> = {
  critical: 'bg-error-container border-red-200 text-red-800',
  important: 'bg-warning-container border-warning-container text-amber-800',
  suggested: 'bg-primary-fixed border-primary/20 text-blue-800',
};

const PRIORITY_LABELS: Record<string, string> = { critical: '重要', important: '建議', suggested: '參考' };

// ── Demo Images ─────────────────────────────────────────────────────────────

const DEMO_IMAGES = {
  library: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcnCniBBZOmu5R5g0ro2Iq9KbJbSRYpSGW4L7-_eD5sCAun_bWiMtgWzz-Fedgn2GSzmcrzMVXO4HOZADfUV8gDJUJk63f69QvvwHBWEICgYrc6CfC4kLJ-QPnLIgaWAHU3_lIJDpEiF-2r6KsX_1BJt2UBrLdfhHdveQPKgR_R_6G3XzqgnY9N0s4L-hp-VP5C_wZonkCd-8EyYYql0ZO97pPbA9PPif0DyHMR8PYXRZ9yMB24ZJeHbX5ImsqGJuDBaA9AR-L8mML',
  drafting: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1bQeRFDCAJQYh7eNiRBO0DTiculgk5dpyyNGF5fkdtMzQ5gIakX8KNZrOp5w5Hy8Yf3-xIzAmZPOoAB2LM_9An7Isl1HgOz57L6YHlKYz2-HfXDpCg7KVb_k5tlUh2aWCFG3edFt05wzsFJ8I4mMCu5QTK58laFU3D6y30g6PBA-FPRLgwQJL81KKayv4DCsJDRF_91S8FrsdOf6GxBgruQceEaoq4sT6K_sNcHgmnMOhMZe0SxgDxrqNs_fRp_WHctyGCBsHoOny',
  university: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDw5NX_tqSsM3Y_O2COoPGYlraUS5mZg8D2sYNM_r35PRRRd3LxtiAKZl1dV95JzlVAYzYOzWvVmvFO8LOdnko9Xl1Lzdx_upET6wT4B_T1pD1yyUtW42dhIP5DCv1nrRnPOMivcgl0HkI1DlM8cci5q1gZvi9EJTu_S9Er3NxSISa2XYYy9l-ZF01ST4AbM0ePjNW3-4YKog4JYP_9hL0XVXgBmKvxM0R0rXyjBXyshISnIzHggUo8YbDNbYH1iKUlhKhHWRZH-fZ7',
  student: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCal0MYbTJWwtvgXvtfw8176cFZ3rmCHnPwcn27okKEnJi_IbnpViu6MHmRuY6AiC18mBrRx0Mz8z9EFCmW94OPv_1yUKI-lVosLXTtUZCjnXY81C480oQIR8CB3iTImAF4Lvw5MyQQ8KARF8Qwjc0QIzmax134pfkHPKRXuRR1hTsudibz_HZGkRUm6cWZqFXgwWEyGnsiQCstJTA2nIH4DfGpUSimN4xLqVlApsG_TXOKbie4AfhNnjKUSj5riKbu6OGRArSRYnpA',
};

export default function RoadmapPage() {
  const [mode, setMode] = useState<'demo' | 'live'>('demo');
  const [showSetup, setShowSetup] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const profile = useMemo(() => mounted ? loadFromStorage<OnboardingProfile | null>('onboarding-profile', null) : null, [mounted]);
  const directions = useMemo(() => mounted ? loadFromStorage<DirectionResult[]>('direction-results', []) : [], [mounted]);
  const skillItems = useMemo(() => mounted ? loadFromStorage<SkillItem[]>('skill-items', []) : [], [mounted]);

  const hasOnboarding = profile && profile.completedSteps >= 5 && directions.length > 0;
  const [grade, setGrade] = useState<GradeLevel>('高二');
  const [pathway, setPathway] = useState<VocationalPathway>('四技二專甄選');

  const activeGrade = profile?.grade || grade;
  const activeDirections = directions.length > 0 ? directions : [{ direction: '資訊軟體應用', directionGroup: '資訊群' as VocationalGroup, confidence: 0.5, reasons: ['預設方向'], relatedCategoryIds: ['info-software'], factCount: 0 }];
  const activeSkillCount = skillItems.length;

  const gaps = useMemo(() => analyzeGaps(activeDirections, skillItems, activeGrade), [activeDirections, skillItems, activeGrade]);
  const roadmap = useMemo(() => generatePersonalizedRoadmap(activeGrade, pathway, activeDirections, activeSkillCount, gaps), [activeGrade, pathway, activeDirections, activeSkillCount, gaps]);
  const encouragement = useMemo(() => getEncouragement(activeGrade, activeSkillCount, activeDirections), [activeGrade, activeSkillCount, activeDirections]);
  const monthsLeft = getMonthsRemaining(activeGrade);
  const isPro = isProUser();

  const upcomingEvents = useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    return NATIONAL_CALENDAR_EVENTS.filter(e => e.vocational).filter(e => e.date >= now).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  }, []);

  // ── Demo View ────────────────────────────────────────────────────────────

  if (mode === 'demo') {
    return (
      <div className="page-container">
        {/* Demo Banner */}
        <div className="bg-primary-fixed border border-primary/20 px-lg py-sm mb-xl flex items-center justify-between">
          <p className="text-sm text-on-primary-fixed-variant">此為範例路線圖。完成 onboarding 並設定方向後，將顯示你的個人化路線圖。</p>
          <button onClick={() => setMode('live')} className="bg-primary text-white px-6 py-2 font-label-caps text-label-caps tracking-widest hover:opacity-90 transition-all cursor-pointer shrink-0">
            查看我的路線圖
          </button>
        </div>

        {/* Hero Section */}
        <section className="py-xl md:py-xxl flex flex-col items-center text-center mb-xl">
          <span className="font-label-caps text-primary tracking-[0.2em] mb-4 block">PERSONALIZED ACADEMIC PATH</span>
          <h1 className="font-h1 text-h1 text-primary mb-md">我的路線圖</h1>
          <p className="font-body-lg text-outline max-w-[42rem]">從起點到彼岸，我們為您規劃了每一步的精彩。這是一場關於成長與探索的旅程，讓教育回歸本質。</p>
        </section>

        {/* Grade 1 Section */}
        <section className="relative mb-xxl">
          <div className="flex flex-col md:flex-row gap-gutter">
            <div className="md:w-5/12 flex flex-col justify-center">
              <span className="font-h1 text-[120px] leading-none text-primary/10 select-none">01</span>
              <h2 className="font-h2 text-h2 text-primary -mt-12 mb-lg">探索與定錨 <br /><span className="text-secondary italic">高一：奠定基石</span></h2>
              <p className="font-body-md text-on-surface-variant mb-xxl leading-relaxed">
                這是一段自我發現的旅程。在充滿可能性的第一年，我們鼓勵學生廣泛探索學術興趣，建立紮實的學科基礎，並開始構建個人獨特的學習檔案。
              </p>
              <div className="border-l-4 border-primary pl-lg py-sm bg-surface-container-low">
                <p className="font-display-italic italic text-primary">&ldquo;教育不是灌輸，而是點燃火焰。&rdquo;</p>
              </div>
            </div>
            <div className="md:w-7/12 relative">
              <div className="aspect-[4/5] bg-surface-container overflow-hidden">
                <img className="w-full h-full object-cover" alt="圖書館" src={DEMO_IMAGES.library} />
              </div>
              <div className="absolute -bottom-10 -left-10 hidden md:block w-64 p-xl bg-background border border-outline-variant">
                <span className="font-label-caps text-secondary block mb-2">重點任務</span>
                <ul className="font-body-md space-y-2">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full" />性向測驗</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full" />基礎社團參與</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full" />自主學習計畫</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-outline-variant/30 mb-xxl" />

        {/* Grade 2 Section */}
        <section className="relative mb-xxl">
          <div className="flex flex-col md:flex-row-reverse gap-gutter">
            <div className="md:w-5/12 flex flex-col justify-center">
              <span className="font-h1 text-[120px] leading-none text-secondary/10 select-none md:text-left">02</span>
              <h2 className="font-h2 text-h2 text-primary -mt-12 mb-lg">深化與精準 <br /><span className="text-secondary italic">高二：拓展視野</span></h2>
              <p className="font-body-md text-on-surface-variant mb-xxl leading-relaxed">
                進入第二年，重點在於深耕專業領域。我們協助學生選擇適合的職群與班群，參與更具影響力的學科競賽或社會實踐，讓個人檔案展現出具備深度的思考者特質。
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-xl bg-secondary-container/30 border border-secondary/10">
                  <h3 className="font-h3 text-primary mb-2">32+</h3>
                  <p className="text-xs font-label-caps text-secondary">推薦職群</p>
                </div>
                <div className="p-xl bg-primary-fixed/30 border border-primary/10">
                  <h3 className="font-h3 text-primary mb-2">150+</h3>
                  <p className="text-xs font-label-caps text-secondary">合作導師</p>
                </div>
              </div>
            </div>
            <div className="md:w-7/12 relative">
              <div className="aspect-video bg-surface-container overflow-hidden">
                <img className="w-full h-full object-cover" alt="製圖工具" src={DEMO_IMAGES.drafting} />
              </div>
              <div className="absolute top-1/2 -right-12 -translate-y-1/2 hidden md:flex flex-col gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-outline-variant text-primary">
                  <span className="material-symbols-outlined">psychology</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-outline-variant text-primary">
                  <span className="material-symbols-outlined">analytics</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-outline-variant/30 mb-xxl" />

        {/* Grade 3 Section */}
        <section className="relative mb-xxl">
          <div className="flex flex-col md:flex-row gap-gutter">
            <div className="md:w-4/12 flex flex-col justify-center bg-[#F4F1EA] p-xl rounded-sm">
              <span className="font-h1 text-[120px] leading-none text-primary/10 select-none">03</span>
              <h2 className="font-h2 text-h2 text-primary -mt-12 mb-lg">衝刺與收穫 <br /><span className="text-secondary italic">高三：成就夢想</span></h2>
              <p className="font-body-md text-on-surface-variant mb-xxl leading-relaxed">
                最後一里路，是勇氣與策略的考驗。從模擬考分析到精準的校系選填，我們陪伴學生在繁星、申請或分發中做出最有利的決策，將三年的積累轉化為通往理想學府的門票。
              </p>
              <button className="bg-primary text-white font-label-caps py-4 px-xl self-start hover:opacity-90 transition-all cursor-pointer">
                立即預約面談
              </button>
            </div>
            <div className="md:w-8/12 grid grid-cols-2 gap-4">
              <div className="aspect-square bg-surface-container overflow-hidden">
                <img className="w-full h-full object-cover" alt="大學建築" src={DEMO_IMAGES.university} />
              </div>
              <div className="aspect-square bg-surface-container flex flex-col justify-end p-xl text-white relative overflow-hidden">
                <img className="absolute inset-0 w-full h-full object-cover" alt="學生" src={DEMO_IMAGES.student} />
                <div className="absolute inset-0 bg-primary/40" />
                <div className="relative z-10">
                  <span className="font-label-caps tracking-widest block mb-2">FINAL STAGE</span>
                  <h3 className="font-h3">精準落點分析</h3>
                </div>
              </div>
              <div className="col-span-2 p-xl border border-outline-variant bg-white flex justify-between items-center cursor-pointer hover:bg-surface-container-low transition-colors">
                <div>
                  <h4 className="font-h3 text-primary mb-1">面試模擬專案</h4>
                  <p className="font-body-md text-outline">由專業顧問提供的一對一真人模擬面談</p>
                </div>
                <span className="material-symbols-outlined text-primary text-3xl">arrow_forward_ios</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ── Live View ────────────────────────────────────────────────────────────

  return (
    <div className="page-container">
      {/* Back to demo */}
      <button onClick={() => setMode('demo')} className="mb-lg text-primary hover:underline font-label-caps text-label-caps cursor-pointer">
        &larr; 返回範例路線圖
      </button>

      {/* Header */}
      <section className="mb-xl">
        <div className="border-l-4 border-primary pl-lg py-sm">
          <span className="font-label-caps text-primary uppercase tracking-widest block mb-xs">PERSONALIZED ACADEMIC PATH</span>
          <h1 className="font-h1 text-h1 text-on-surface">我的路線圖</h1>
        </div>
      </section>

      {/* Onboarding prompt */}
      {!hasOnboarding && !showSetup && (
        <div className="bg-primary-fixed border border-primary/30 p-xl mb-xxl text-center">
          <h2 className="font-h3 text-h3 text-on-surface mb-sm">還沒完成導入流程？</h2>
          <p className="text-sm text-on-surface-variant mb-lg">
            完成 5 步導入，我們能給你更精準的路線圖和技能缺口分析。
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/onboarding/step1" className="bg-primary text-white px-xl py-sm font-label-caps text-label-caps tracking-widest hover:opacity-90 transition-all cursor-pointer">開始導入</Link>
            <button onClick={() => setShowSetup(true)} className="px-xl py-sm border border-primary/40 text-primary font-label-caps text-label-caps tracking-widest hover:bg-primary-fixed transition-colors cursor-pointer">手動設定</button>
          </div>
        </div>
      )}

      {/* Manual setup */}
      {!hasOnboarding && showSetup && (
        <div className="bg-surface-container-low border border-[#E9E5DB] p-xl mb-xxl max-w-lg mx-auto">
          <h2 className="font-h3 text-h3 text-on-surface mb-lg">基本設定</h2>
          <div className="space-y-4">
            <div>
              <label className="block font-label-caps text-label-caps text-primary mb-2 tracking-widest">你的年級</label>
              <div className="flex gap-2">
                {GRADES.map(g => (
                  <button key={g} onClick={() => setGrade(g)} className={`flex-1 py-3 text-sm font-medium transition-colors cursor-pointer ${grade === g ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>{g}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block font-label-caps text-label-caps text-primary mb-2 tracking-widest">目標管道</label>
              <div className="grid grid-cols-3 gap-2">
                {PATHWAYS.map(p => (
                  <button key={p} onClick={() => setPathway(p)} className={`py-3 px-2 text-xs font-medium transition-colors text-center cursor-pointer ${pathway === p ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>{p}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direction badges */}
      {hasOnboarding && (
        <div className="flex flex-wrap gap-2 justify-center mb-xxl">
          {activeDirections.map(d => {
            const groupKey = d.directionGroup as VocationalGroup;
            return (
              <span key={d.direction} className="px-4 py-2 bg-primary-fixed text-primary text-sm font-medium border border-primary/30">
                {d.direction}
                <span className="ml-1 text-xs text-primary">({Math.round(d.confidence * 100)}%)</span>
              </span>
            );
          })}
        </div>
      )}

      {/* Encouragement */}
      <div className="bg-primary-fixed p-xl border border-primary/20 mb-xxl">
        <p className="text-on-surface leading-relaxed text-center">{encouragement}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-xxl">
        <Link href="/portfolio" className="bg-surface-container-low border border-[#E9E5DB] p-xl text-center group cursor-pointer hover:border-primary/30 transition-colors">
          <div className="font-h2 text-h2 text-tertiary">{activeSkillCount}</div>
          <div className="text-sm text-on-surface-variant group-hover:text-primary">技能紀錄 → 記錄</div>
        </Link>
        <Link href="/calendar" className="bg-surface-container-low border border-[#E9E5DB] p-xl text-center group cursor-pointer hover:border-primary/30 transition-colors">
          <div className="font-h2 text-h2 text-primary">{upcomingEvents.length}</div>
          <div className="text-sm text-on-surface-variant group-hover:text-primary">近期活動 → 校曆</div>
        </Link>
        <div className="bg-surface-container-low border border-[#E9E5DB] p-xl text-center">
          <div className="font-h2 text-h2 text-warning">{gaps.length}</div>
          <div className="text-sm text-on-surface-variant">待補缺口</div>
        </div>
        <div className="bg-surface-container-low border border-[#E9E5DB] p-xl text-center">
          <div className="font-h2 text-h2 text-success">{monthsLeft}</div>
          <div className="text-sm text-on-surface-variant">剩餘月數</div>
        </div>
      </div>

      {/* Quick actions */}
      {hasOnboarding && (
        <div className="flex flex-wrap gap-3 justify-center mb-xxl">
          <Link href="/portfolio" className="px-lg py-sm bg-primary-fixed text-primary text-sm font-medium hover:bg-primary-fixed transition-colors cursor-pointer">+ 記錄技能</Link>
          <Link href="/calendar" className="px-lg py-sm bg-primary-fixed text-primary text-sm font-medium hover:bg-primary-fixed transition-colors cursor-pointer">查看校曆</Link>
          <Link href="/timeline" className="px-lg py-sm bg-success-container text-success text-sm font-medium hover:bg-success-container transition-colors cursor-pointer">成就時光軸</Link>
        </div>
      )}

      {/* Gap analysis */}
      {gaps.length > 0 && (
        <div className="bg-surface-container-low border border-[#E9E5DB] p-xl mb-xxl">
          <h2 className="font-h3 text-h3 text-on-surface mb-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-base">warning</span>
            技能缺口分析
          </h2>
          <div className="space-y-3">
            {gaps.map((gap, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 border ${PRIORITY_STYLES[gap.priority]}`}>
                <div className="w-10 h-10 bg-white/60 flex items-center justify-center text-lg flex-shrink-0">
                  {SKILL_CATEGORY_ICONS[gap.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{SKILL_CATEGORY_LABELS[gap.category]}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${gap.priority === 'critical' ? 'bg-red-200 text-red-800' : gap.priority === 'important' ? 'bg-amber-200 text-amber-800' : 'bg-blue-200 text-blue-800'}`}>
                      {PRIORITY_LABELS[gap.priority]}
                    </span>
                  </div>
                  <div className="text-xs mt-0.5 opacity-80">{gap.description}</div>
                  <div className="text-xs mt-1 font-medium">目前 {gap.current} 件 / 建議 {gap.recommended} 件</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4 mb-xxl">
        <h2 className="font-h3 text-h3 text-on-surface">升學時間線</h2>
        {roadmap.map((phase, i) => (
          <div key={phase.id} className="relative">
            {i < roadmap.length - 1 && <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-surface-container-high" />}
            <div className={`p-xl border ${phase.isCurrent ? 'bg-white border-primary/30' : 'bg-surface-container-low border-[#E9E5DB]'}`}>
              <div className="flex items-center gap-3 mb-sm">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${phase.isCurrent ? 'bg-primary' : 'bg-surface-dim'}`}>{i + 1}</div>
                <div className="flex-1">
                  <h3 className="font-body-lg font-semibold text-on-surface">{phase.name}</h3>
                  <span className="text-xs text-on-surface-variant">{phase.period}</span>
                </div>
                {phase.isCurrent && <span className="text-xs px-3 py-1 bg-primary-fixed text-primary font-medium">進行中</span>}
              </div>
              <p className="text-sm text-on-surface-variant mb-sm">{phase.description}</p>
              <ul className="space-y-1.5">
                {phase.tasks.map((task, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-on-surface">
                    <span className="material-symbols-outlined text-base">check_circle</span>{task}
                  </li>
                ))}
              </ul>
              <div className="mt-sm pt-sm border-t border-[#E9E5DB]">
                {phase.skillGaps.length > 0 && (
                  <>
                    <div className="text-xs text-warning font-medium mb-1">此階段需補齊</div>
                    {phase.skillGaps.map((g, j) => (
                      <div key={j} className="text-xs text-on-surface-variant">
                        {SKILL_CATEGORY_ICONS[g.category]} {SKILL_CATEGORY_LABELS[g.category]}：{g.description}
                      </div>
                    ))}
                  </>
                )}
                {phase.isCurrent && (
                  <div className="flex flex-wrap gap-2 mt-sm">
                    <Link href="/portfolio" className="text-xs px-3 py-1.5 bg-primary-fixed text-primary font-medium hover:bg-primary-fixed transition-colors cursor-pointer">記錄技能</Link>
                    <Link href="/calendar" className="text-xs px-3 py-1.5 bg-primary-fixed text-primary font-medium hover:bg-primary-fixed transition-colors cursor-pointer">查看校曆</Link>
                    {phase.name.includes('面試') && <Link href="/interview" className="text-xs px-3 py-1.5 bg-tertiary-fixed text-tertiary font-medium hover:bg-tertiary-fixed transition-colors cursor-pointer">面試練習</Link>}
                    {phase.name.includes('備審') && <Link href="/strategy" className="text-xs px-3 py-1.5 bg-warning-container text-warning font-medium hover:bg-warning-container transition-colors cursor-pointer">策略報告</Link>}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming events */}
      <div className="bg-surface-container-low border border-[#E9E5DB] p-xl mb-xxl">
        <h2 className="font-h3 text-h3 text-on-surface mb-lg">近期重要日期</h2>
        <div className="space-y-3">
          {upcomingEvents.map(ev => (
            <div key={ev.id} className="flex items-center gap-3">
              <div className="text-sm text-on-surface-variant w-20 flex-shrink-0">{ev.date}</div>
              <div className={`text-xs px-2 py-0.5 font-medium ${ev.type === 'exam' ? 'bg-error-container text-error' : ev.type === 'competition' ? 'bg-warning-container text-warning' : ev.type === 'certification' ? 'bg-success-container text-success' : ev.type === 'capstone' ? 'bg-tertiary-fixed text-tertiary' : 'bg-primary-fixed text-primary'}`}>
                {ev.type === 'exam' ? '考試' : ev.type === 'competition' ? '競賽' : ev.type === 'certification' ? '技能檢定' : ev.type === 'capstone' ? '專題' : '活動'}
              </div>
              <div className="font-medium text-on-surface text-sm">{ev.title}</div>
            </div>
          ))}
          {upcomingEvents.length === 0 && <p className="text-sm text-on-surface-variant text-center py-lg">目前沒有近期的高職相關活動</p>}
        </div>
      </div>

      {/* CTA */}
      {hasOnboarding && (
        <div className="text-center">
          <Link href="/onboarding/step1" className="text-on-surface-variant hover:text-on-surface text-sm underline cursor-pointer">重新進行導入流程</Link>
        </div>
      )}
    </div>
  );
}
