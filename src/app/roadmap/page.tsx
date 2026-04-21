'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { loadFromStorage } from '@/lib/storage';
import { isProUser } from '@/lib/subscription';
import { ACADEMIC_GROUP_LABELS, ACADEMIC_CATEGORIES } from '@/data/academic-categories';
import { NATIONAL_CALENDAR_EVENTS } from '@/data/national-calendar';
import type {
  OnboardingProfile,
  DirectionResult,
  GradeLevel,
  TargetPathway,
  AcademicGroup,
  RoadmapPhase,
  PersonalizedRoadmapPhase,
  RoadmapGap,
  PortfolioItem,
} from '@/types';

const GRADES: GradeLevel[] = ['高一', '高二', '高三'];
const PATHWAYS: TargetPathway[] = ['申請入學', '繁星推薦', '分發入學'];
const GROUPS: AcademicGroup[] = ['人文', '社會', '自然', '工程', '商管', '醫藥衛', '藝術'];

function getMonthsUntilDeadline(): number {
  const deadline = new Date('2027-02-24');
  const now = new Date();
  return (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth());
}

function getMonthsRemaining(grade: GradeLevel): number {
  const base = getMonthsUntilDeadline();
  const offset: Record<GradeLevel, number> = { '高一': 18, '高二': 6, '高三': 0 };
  return Math.max(1, base + offset[grade]);
}

function analyzeGaps(
  directions: DirectionResult[],
  portfolioItems: PortfolioItem[],
  grade: GradeLevel
): RoadmapGap[] {
  const gaps: RoadmapGap[] = [];
  const codeCounts: Record<string, number> = {};
  portfolioItems.forEach(item => {
    codeCounts[item.code] = (codeCounts[item.code] || 0) + 1;
  });

  const totalPortfolio = portfolioItems.length;
  const idealCount = grade === '高一' ? 20 : grade === '高二' ? 12 : 8;

  if (totalPortfolio < idealCount) {
    gaps.push({
      category: '學習歷程素材',
      current: totalPortfolio,
      recommended: idealCount,
      description: `你目前有 ${totalPortfolio} 件素材，建議累積到 ${idealCount} 件。`,
    });
  }

  // Check diversity of learning codes
  const uniqueCodes = Object.keys(codeCounts).length;
  if (uniqueCodes < 4) {
    gaps.push({
      category: '代碼多樣性',
      current: uniqueCodes,
      recommended: 6,
      description: `你目前涵蓋 ${uniqueCodes} 種代碼，建議至少 6 種以展現全面性。`,
    });
  }

  // Direction-specific gaps
  const directionGroup = directions[0]?.directionGroup;
  if (directionGroup === '工程' && !codeCounts['D'] && !codeCounts['C']) {
    gaps.push({
      category: '自然探究/實作',
      current: 0,
      recommended: 2,
      description: '工程方向需要自然探究（D）和實作（C）素材。',
    });
  }
  if (directionGroup === '人文' && !codeCounts['B'] && !codeCounts['F']) {
    gaps.push({
      category: '書面報告/自主學習',
      current: 0,
      recommended: 3,
      description: '人文方向需要書面報告（B）和自主學習（F）素材。',
    });
  }
  if (directionGroup === '商管' && !codeCounts['E'] && !codeCounts['H']) {
    gaps.push({
      category: '社會探究/幹部',
      current: 0,
      recommended: 2,
      description: '商管方向看重社會探究（E）和幹部經驗（H）。',
    });
  }
  if (directionGroup === '醫藥衛' && !codeCounts['C'] && !codeCounts['I']) {
    gaps.push({
      category: '實作/服務學習',
      current: 0,
      recommended: 2,
      description: '醫藥衛生方向需要實作（C）和服務學習（I）素材。',
    });
  }
  if (directionGroup === '社會' && !codeCounts['E']) {
    gaps.push({
      category: '社會探究',
      current: 0,
      recommended: 3,
      description: '社會科學方向需要社會探究（E）素材。',
    });
  }
  if (directionGroup === '藝術' && !codeCounts['K']) {
    gaps.push({
      category: '作品集',
      current: 0,
      recommended: 3,
      description: '藝術方向需要作品（K）來展現創作能力。',
    });
  }

  // Competition gap
  if (!codeCounts['J'] && (directionGroup === '工程' || directionGroup === '自然')) {
    gaps.push({
      category: '競賽經歷',
      current: 0,
      recommended: 1,
      description: '理工方向有競賽經歷（J）會是加分項。',
    });
  }

  return gaps;
}

function generatePersonalizedRoadmap(
  grade: GradeLevel,
  pathway: TargetPathway,
  directions: DirectionResult[],
  portfolioCount: number,
  gaps: RoadmapGap[]
): PersonalizedRoadmapPhase[] {
  const monthsLeft = getMonthsRemaining(grade);
  const phases: PersonalizedRoadmapPhase[] = [];
  const directionNames = directions.map(d => d.direction).join('、');

  if (grade === '高三') {
    phases.push(
      {
        id: 'p1',
        name: '缺口補齊',
        period: '第 1-2 週',
        deadline: '2026-05-01',
        description: `針對${directionNames}方向，快速補齊關鍵素材。`,
        tasks: gaps.length > 0
          ? gaps.map(g => `補齊「${g.category}」：${g.description}`).slice(0, 4)
          : ['檢視現有素材，確認完整性', '針對目標科系補充 1-2 件相關作品', '整理學習歷程自述（P）大綱'],
        gaps: gaps.slice(0, 3),
        isCurrent: true,
        isPast: false,
      },
      {
        id: 'p2',
        name: '備審資料撰寫',
        period: '第 2-4 週',
        deadline: '2026-05-15',
        description: `撰寫針對${directionNames}的備審資料，展現你的連結。`,
        tasks: [
          '撰寫學習歷程自述（P）- 1200 字，聚焦你為什麼選這個方向',
          '整理動機信，具體說明你與目標方向的連結',
          '準備 2-3 件代表性作品的詳細說明',
          '請導師或老師幫忙看一遍',
        ],
        gaps: [],
        isCurrent: false,
        isPast: false,
      },
      {
        id: 'p3',
        name: '面試準備',
        period: '第 4-6 週',
        deadline: '2026-06-01',
        description: pathway === '分發入學' ? '分發入學不需要面試，但你仍需準備志願序。' : `準備${directionNames}相關的面試問題。`,
        tasks: pathway === '分發入學'
          ? ['研究各校系分發錄取分數', '排好志願序', '了解分發填誌策略']
          : [
              `準備「為什麼選${directionNames}」的回答`,
              '用 STAR-S 框架準備 3 個與方向相關的故事',
              '找同學互相模擬面試',
              '準備 1 分鐘自我介紹',
            ],
        gaps: [],
        isCurrent: false,
        isPast: false,
      },
      {
        id: 'p4',
        name: '最後衝刺',
        period: '面試前 1 週',
        deadline: '2027-01-15',
        description: '放鬆心情，做最後確認。',
        tasks: [
          '確認所有文件齊全',
          '熟悉面試地點與交通',
          '充足睡眠，保持好狀態',
          '相信自己，你準備好了！',
        ],
        gaps: [],
        isCurrent: false,
        isPast: false,
      },
    );
  } else if (grade === '高二') {
    phases.push(
      {
        id: 'p1',
        name: '方向深化期',
        period: '現在 ~ 6 個月後',
        deadline: '2026-10-01',
        description: `深入探索${directionNames}方向，累積相關素材。`,
        tasks: [
          ...gaps.slice(0, 2).map(g => `「${g.category}」：${g.description}`),
          `選修或自學與${directionNames}相關的課程`,
          '每週至少記錄 1 件學習歷程素材',
          '關注目標校系的招生資訊',
        ],
        gaps: gaps.slice(0, 3),
        isCurrent: true,
        isPast: false,
      },
      {
        id: 'p2',
        name: '競賽與深化',
        period: '6-12 個月後',
        deadline: '2027-01-01',
        description: '參加與方向相關的競賽或活動，深化專業能力。',
        tasks: [
          `參加至少 1 項與${directionNames}相關的競賽`,
          '完成至少 1 件深度探究報告',
          '開始構思學習歷程自述（P）',
          '與導師討論升學方向和策略',
        ],
        gaps: [],
        isCurrent: false,
        isPast: false,
      },
      {
        id: 'p3',
        name: '備審撰寫期',
        period: '12-16 個月後',
        deadline: '2027-04-01',
        description: '正式撰寫備審資料與學習歷程自述。',
        tasks: [
          '撰寫學習歷程自述（P）- 1200 字',
          '準備備審資料（動機信、作品集說明）',
          '請老師與同學提供回饋',
          '至少修改 3 次',
        ],
        gaps: [],
        isCurrent: false,
        isPast: false,
      },
      {
        id: 'p4',
        name: '面試準備期',
        period: '16-18 個月後',
        deadline: '2027-06-01',
        description: pathway === '分發入學' ? '最後確認志願序與分發策略。' : '全面準備面試。',
        tasks: pathway === '分發入學'
          ? ['研究各校系分發錄取分數', '排好志願序', '了解分發填誌策略']
          : [
              `用 STAR-S 準備 5 個與${directionNames}相關的故事`,
              '模擬面試至少 5 次',
              '準備 1 分鐘自我介紹',
              '研究目標校系的面試風格',
            ],
        gaps: [],
        isCurrent: false,
        isPast: false,
      },
    );
  } else {
    // 高一
    phases.push(
      {
        id: 'p1',
        name: '探索與嘗試期',
        period: '現在 ~ 12 個月後',
        deadline: '2027-04-01',
        description: `多方嘗試，特別是${directionNames}相關的活動。`,
        tasks: [
          ...gaps.slice(0, 2).map(g => `「${g.category}」：${g.description}`),
          '嘗試不同類型的活動（社團、競賽、服務學習）',
          `深入探索${directionNames}相關的學類（用科系探索功能）`,
          '保持良好的在校成績（繁星推薦需要）',
          '每週記錄 1 件學習歷程素材',
        ],
        gaps: gaps.slice(0, 3),
        isCurrent: true,
        isPast: false,
      },
      {
        id: 'p2',
        name: '深度投入期',
        period: '12-24 個月後',
        deadline: '2028-04-01',
        description: `選定${directionNames}方向，深入發展。`,
        tasks: [
          `在${directionNames}領域完成至少 2 件深度作品`,
          '擔任社團幹部或活動負責人',
          '參加至少 1 次校際競賽',
          '累積至少 10 件學習歷程素材',
        ],
        gaps: [],
        isCurrent: false,
        isPast: false,
      },
      {
        id: 'p3',
        name: '素材整理期',
        period: '24-30 個月後',
        deadline: '2028-10-01',
        description: '整理素材，準備撰寫備審資料。',
        tasks: [
          '回顧所有素材，選出最精華的 8-10 件',
          '為每件作品撰寫詳細反思',
          '開始構思學習歷程自述（P）',
          '參加校內升學講座',
        ],
        gaps: [],
        isCurrent: false,
        isPast: false,
      },
      {
        id: 'p4',
        name: '衝刺準備期',
        period: '30-36 個月後',
        deadline: '2029-01-01',
        description: '全力衝刺學測，同時完成備審資料。',
        tasks: [
          '完成學習歷程自述（P）',
          '準備備審資料與面試',
          '學測衝刺（每日複習計畫）',
          '保持自信，相信自己的準備',
        ],
        gaps: [],
        isCurrent: false,
        isPast: false,
      },
    );
  }

  return phases;
}

function getEncouragement(grade: GradeLevel, portfolioCount: number, directions: DirectionResult[]): string {
  const dirStr = directions.length > 0 ? directions.map(d => d.direction).join('、') : '你的目標方向';
  const hasEnough = portfolioCount >= 8;

  if (grade === '高一') {
    return `你才高一，時間非常充裕！${dirStr}是很好的目標。現在開始累積，高三時你會感謝現在的自己。`;
  }
  if (grade === '高二') {
    if (hasEnough) return `高二是黃金時期，你已經累積了不少素材。專注深化${dirStr}方向，你一定可以找到最適合的科系！`;
    return `高二開始準備完全來得及！從今天開始，每週記錄 1 件與${dirStr}相關的素材，半年後你就會有豐富的學習歷程。`;
  }
  if (hasEnough) return `高三了但素材已經準備得不錯！專注備審資料的品質，展現你對${dirStr}的熱情，你一定可以！`;
  return `雖然高三了，但全力衝刺還來得及！集中精力完成與${dirStr}相關的重要素材，質量比數量更重要。`;
}

export default function RoadmapPage() {
  const [showSetup, setShowSetup] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const profile = useMemo(
    () => mounted ? loadFromStorage<OnboardingProfile | null>('onboarding-profile', null) : null,
    [mounted]
  );

  const directions = useMemo(
    () => mounted ? loadFromStorage<DirectionResult[]>('direction-results', []) : [],
    [mounted]
  );

  const portfolioItems = useMemo(
    () => mounted ? loadFromStorage<PortfolioItem[]>('portfolio-items', []) : [],
    [mounted]
  );

  const hasOnboarding = profile && profile.completedSteps >= 5 && directions.length > 0;

  // Manual setup state
  const [grade, setGrade] = useState<GradeLevel>('高二');
  const [pathway, setPathway] = useState<TargetPathway>('申請入學');

  const activeGrade = profile?.grade || grade;
  const activeDirections = directions.length > 0 ? directions : [{ direction: '工程', directionGroup: '工程' as AcademicGroup, confidence: 0.5, reasons: ['預設方向'], relatedCategoryIds: ['computer-science'], factCount: 0 }];
  const activePortfolioCount = portfolioItems.length;

  const gaps = useMemo(
    () => analyzeGaps(activeDirections, portfolioItems, activeGrade),
    [activeDirections, portfolioItems, activeGrade]
  );

  const roadmap = useMemo(
    () => generatePersonalizedRoadmap(activeGrade, pathway, activeDirections, activePortfolioCount, gaps),
    [activeGrade, pathway, activeDirections, activePortfolioCount, gaps]
  );

  const encouragement = useMemo(
    () => getEncouragement(activeGrade, activePortfolioCount, activeDirections),
    [activeGrade, activePortfolioCount, activeDirections]
  );

  const monthsLeft = getMonthsRemaining(activeGrade);
  const isPro = isProUser();

  // Upcoming calendar events
  const upcomingEvents = useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    return NATIONAL_CALENDAR_EVENTS
      .filter(e => e.date >= now)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">個人化路線圖</h1>
        <p className="text-gray-500">
          {hasOnboarding
            ? `根據你的 ${profile?.grade} 背景和選定方向，為你量身打造`
            : '以終為始，為你量身打造的升學準備計畫'}
        </p>
      </div>

      {/* Onboarding prompt for users without profile */}
      {!hasOnboarding && !showSetup && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 mb-8 text-center">
          <h2 className="font-bold text-indigo-900 mb-2">還沒完成導入流程？</h2>
          <p className="text-sm text-indigo-700 mb-4">
            完成 5 步導入，我們能給你更精準的路線圖和缺口分析。
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/onboarding/step1"
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
            >
              開始導入
            </Link>
            <button
              onClick={() => setShowSetup(true)}
              className="px-6 py-3 border border-indigo-300 text-indigo-600 rounded-xl font-medium hover:bg-indigo-100 transition-colors"
            >
              手動設定
            </button>
          </div>
        </div>
      )}

      {/* Manual setup (if no onboarding) */}
      {!hasOnboarding && showSetup && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 max-w-lg mx-auto">
          <h2 className="font-bold text-gray-900 mb-4">基本設定</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">你的年級</label>
              <div className="flex gap-2">
                {GRADES.map(g => (
                  <button
                    key={g}
                    onClick={() => setGrade(g)}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${grade === g ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">目標管道</label>
              <div className="flex gap-2">
                {PATHWAYS.map(p => (
                  <button
                    key={p}
                    onClick={() => setPathway(p)}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${pathway === p ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direction badge */}
      {hasOnboarding && (
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {activeDirections.map(d => (
            <span key={d.direction} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full font-medium text-sm border border-indigo-200">
              {d.direction}
              <span className="ml-1 text-xs text-indigo-400">({Math.round(d.confidence * 100)}%)</span>
            </span>
          ))}
        </div>
      )}

      {/* Encouragement */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 mb-8">
        <p className="text-gray-800 leading-relaxed text-center">{encouragement}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
          <div className="text-3xl font-bold text-indigo-600">{monthsLeft}</div>
          <div className="text-sm text-gray-500">剩餘月數</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
          <div className="text-3xl font-bold text-purple-600">{activePortfolioCount}</div>
          <div className="text-sm text-gray-500">累積素材</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
          <div className="text-3xl font-bold text-amber-600">{gaps.length}</div>
          <div className="text-sm text-gray-500">待補缺口</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
          <div className="text-3xl font-bold text-green-600">{activeDirections.length}</div>
          <div className="text-sm text-gray-500">目標方向</div>
        </div>
      </div>

      {/* Gap analysis */}
      {gaps.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-amber-500">&#9888;</span>
            缺口分析
          </h2>
          <div className="space-y-3">
            {gaps.map((gap, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {gap.current}/{gap.recommended}
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{gap.category}</div>
                  <div className="text-xs text-gray-600">{gap.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4 mb-8">
        <h2 className="font-bold text-gray-900 text-lg">升學時間線</h2>
        {roadmap.map((phase, i) => (
          <div key={phase.id} className="relative">
            {i < roadmap.length - 1 && (
              <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
            )}
            <div className={`p-5 rounded-2xl border ${phase.isCurrent ? 'bg-white border-indigo-200 shadow-md' : 'bg-gray-50 border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${phase.isCurrent ? 'bg-indigo-600' : 'bg-gray-400'}`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{phase.name}</h3>
                  <span className="text-xs text-gray-500">{phase.period}</span>
                </div>
                {phase.isCurrent && (
                  <span className="text-xs px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full font-medium">進行中</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{phase.description}</p>
              <ul className="space-y-1.5">
                {phase.tasks.map((task, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-indigo-400 mt-0.5">&#10003;</span>
                    {task}
                  </li>
                ))}
              </ul>
              {/* Phase-level gaps */}
              {phase.gaps.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-amber-600 font-medium mb-1">此階段需補齊</div>
                  {phase.gaps.map((g, j) => (
                    <div key={j} className="text-xs text-gray-600">{g.category}: {g.description}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming events */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <h2 className="font-bold text-gray-900 mb-4">近期重要日期</h2>
        <div className="space-y-3">
          {upcomingEvents.map(ev => (
            <div key={ev.id} className="flex items-center gap-3">
              <div className="text-sm text-gray-400 w-20 flex-shrink-0">{ev.date}</div>
              <div className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                ev.type === 'exam' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {ev.type === 'exam' ? '考試' : '活動'}
              </div>
              <div className="font-medium text-gray-900 text-sm">{ev.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* School Resource Map - Pro feature */}
      {!isPro && hasOnboarding && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-gray-900">學校資源地圖</h3>
            <span className="text-xs px-2 py-0.5 bg-indigo-600 text-white rounded-full font-medium">Pro</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            根據你的方向和成績，查看目標校系的詳細資訊、錄取分數和備審建議。
          </p>
          <a href="/pricing" className="inline-block px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
            解鎖學校資源地圖
          </a>
        </div>
      )}

      {/* CTA */}
      {hasOnboarding && (
        <div className="text-center">
          <Link
            href="/onboarding/step1"
            className="text-gray-400 hover:text-gray-600 text-sm underline"
          >
            重新進行導入流程
          </Link>
        </div>
      )}
    </div>
  );
}
