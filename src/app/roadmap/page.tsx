'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { loadFromStorage } from '@/lib/storage';
import { isProUser } from '@/lib/subscription';
import { VOCATIONAL_GROUP_LABELS, VOCATIONAL_GROUP_COLORS, VOCATIONAL_CATEGORIES, getCategoriesByGroup } from '@/data/vocational-categories';
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
    capstone: 0,
    certification: 0,
    internship: 0,
    competition: 0,
    club: 0,
    license: 0,
    service: 0,
  };

  skillItems.forEach(item => {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  });

  const directionGroup = directions[0]?.directionGroup as VocationalGroup | undefined;
  const isIndustrialGroup = ['機械群', '電機群', '電子群', '化工群', '土木群'].includes(directionGroup || '');
  const isServiceGroup = ['餐旅群', '護理群', '家政群'].includes(directionGroup || '');
  const isInfoGroup = directionGroup === '資訊群';

  // Capstone (critical for all)
  const capstoneIdeal = grade === '高一' ? 2 : grade === '高二' ? 2 : 1;
  if (categoryCounts.capstone < capstoneIdeal) {
    gaps.push({
      category: 'capstone',
      current: categoryCounts.capstone,
      recommended: capstoneIdeal,
      description: `你需要至少 ${capstoneIdeal} 件專題實作${grade === '高三' ? '' : '，為甄選備審增加實質內容'}。`,
      priority: 'critical',
    });
  }

  // Certification (critical - need at least 丙級)
  const hasCertification = skillItems.some(
    item => item.category === 'certification' && item.certificationLevel
  );
  if (!hasCertification) {
    gaps.push({
      category: 'certification',
      current: categoryCounts.certification,
      recommended: 1,
      description: '至少需要一張丙級技術士證照，這是四技二專甄選的基本門檻。',
      priority: 'critical',
    });
  } else {
    const certItem = skillItems.find(
      item => item.category === 'certification' && item.certificationLevel
    );
    if (certItem?.certificationLevel === '丙級' && grade !== '高三') {
      gaps.push({
        category: 'certification',
        current: 1,
        recommended: 2,
        description: '已有丙級證照，建議進階考取乙級以增加競爭力。',
        priority: 'important',
      });
    }
  }

  // Internship (important for service/industrial groups)
  const internshipNeeded = isServiceGroup || isIndustrialGroup;
  if (internshipNeeded && categoryCounts.internship === 0) {
    gaps.push({
      category: 'internship',
      current: 0,
      recommended: 1,
      description: `${directionGroup}建議有實習經驗，展現職場實務能力。`,
      priority: 'important',
    });
  }

  // Competition (important for industrial/info groups)
  if ((isIndustrialGroup || isInfoGroup) && categoryCounts.competition === 0) {
    gaps.push({
      category: 'competition',
      current: 0,
      recommended: 1,
      description: `${directionGroup}有競賽經歷會是大幅加分項，建議參加技能競賽或專題競賽。`,
      priority: 'important',
    });
  }

  // Club (suggested)
  if (categoryCounts.club === 0) {
    gaps.push({
      category: 'club',
      current: 0,
      recommended: 1,
      description: '社團參與能展現團隊合作與領導力，建議至少持續參與一個社團。',
      priority: 'suggested',
    });
  }

  // Service (suggested for nursing/service groups)
  if (isServiceGroup && categoryCounts.service === 0) {
    gaps.push({
      category: 'service',
      current: 0,
      recommended: 1,
      description: `${directionGroup}看重服務精神，建議累積服務學習時數。`,
      priority: 'important',
    });
  }

  // License (suggested)
  if (categoryCounts.license === 0 && grade !== '高三') {
    gaps.push({
      category: 'license',
      current: 0,
      recommended: 1,
      description: '專業證照能展現你的學習廣度，建議考取與科系相關的證照。',
      priority: 'suggested',
    });
  }

  return gaps;
}

function generatePersonalizedRoadmap(
  grade: GradeLevel,
  pathway: VocationalPathway,
  directions: DirectionResult[],
  skillCount: number,
  gaps: SkillGap[]
): VocationalRoadmapPhase[] {
  const monthsLeft = getMonthsRemaining(grade);
  const phases: VocationalRoadmapPhase[] = [];
  const directionNames = directions.map(d => d.direction).join('、');
  const directionGroup = directions[0]?.directionGroup as VocationalGroup | undefined;

  if (grade === '高三') {
    phases.push(
      {
        id: 'p1',
        name: '專題實作收尾 + 統測衝刺',
        period: '第 1-4 週',
        deadline: '2027-04-20',
        description: '完成專題實作的最終修改，同時全力衝刺統測準備。',
        tasks: [
          ...gaps.filter(g => g.priority === 'critical').slice(0, 2).map(g => `「${SKILL_CATEGORY_LABELS[g.category]}」：${g.description}`),
          '完成專題實作報告的最終版本（含摘要、圖表、結論）',
          '每日統測複習 — 國文、英文、數學為主，專業科目加強弱項',
          '整理過去模擬考的錯題本，針對性加強',
        ],
        skillGaps: gaps.filter(g => g.priority === 'critical').slice(0, 2),
        isCurrent: true,
        isPast: false,
      },
      {
        id: 'p2',
        name: '四技二專甄選準備',
        period: '第 4-8 週',
        deadline: '2027-05-10',
        description: `準備${directionNames}相關的備審資料，展現你的專題實作成果與技能實力。`,
        tasks: [
          '撰寫備審資料 — 聚焦專題實作過程與學習心得（800-1200 字）',
          '整理技能檢定證照清單，附上成績單影本',
          '準備專題實作作品的詳細說明（含照片/影片連結）',
          '撰寫學習動機 — 為什麼選擇${directionNames}方向',
          '請專題指導老師幫忙審閱備審資料',
        ],
        skillGaps: [],
        isCurrent: false,
        isPast: false,
      },
      {
        id: 'p3',
        name: '面試準備',
        period: '第 8-10 週',
        deadline: '2027-06-10',
        description: pathway === '聯合登記分發'
          ? '聯合分發不需要面試，但需要研究各校系錄取分數和填報策略。'
          : `準備${directionNames}相關的面試問題，展現你的專業素養。`,
        tasks: pathway === '聯合登記分發'
          ? ['研究各校系近年統測錄取分數', '根據統測成績排好志願序', '了解聯合分發填誌策略與落點分析']
          : [
              `準備「為什麼選${directionNames}」的回答`,
              '用 STAR-S 框架準備 3 個專題實作相關的故事',
              '準備技能檢定過程的分享（考了什麼、怎麼準備、學到什麼）',
              '找同學互相模擬面試至少 2 次',
              '準備 1 分鐘自我介紹',
            ],
        skillGaps: [],
        isCurrent: false,
        isPast: false,
      },
      {
        id: 'p4',
        name: '聯合分發志願填報',
        period: '放榜後',
        deadline: '2027-07-15',
        description: '根據甄選結果與統測成績，完成聯合登記分發志願填報。',
        tasks: [
          '確認甄選結果，決定是否放棄遞補',
          '研究各校系統測錄取分數與名額',
          '根據自身成績與志願排好志願序',
          '了解聯合分發機制（志願序、同分比序）',
          '完成志願填報並確認',
        ],
        skillGaps: [],
        isCurrent: false,
        isPast: false,
      },
    );
  } else if (grade === '高二') {
    phases.push(
      {
        id: 'p1',
        name: '技能深化期',
        period: '現在 ~ 6 個月後',
        deadline: '2026-10-01',
        description: `深入發展${directionNames}方向的核心技能，考取證照並開始專題。`,
        tasks: [
          ...gaps.filter(g => g.priority === 'critical').slice(0, 2).map(g => `「${SKILL_CATEGORY_LABELS[g.category]}」：${g.description}`),
          `在${directionNames}領域選定專題實作題目，開始執行`,
          '報名並準備丙級（或乙級）技術士技能檢定',
          '每週記錄技能學習進度',
        ],
        skillGaps: gaps.filter(g => g.priority === 'critical').slice(0, 3),
        isCurrent: true,
        isPast: false,
      },
      {
        id: 'p2',
        name: '競賽與實習',
        period: '6-12 個月後',
        deadline: '2027-04-01',
        description: '參加技能競賽或校內專題競賽，爭取實習機會累積實務經驗。',
        tasks: [
          `參加至少 1 項與${directionNames}相關的技能競賽`,
          '尋找暑期或週末實習機會',
          '持續推進專題實作，完成中期報告',
          '與專題指導老師定期討論進度',
        ],
        skillGaps: gaps.filter(g => g.priority === 'important').slice(0, 2),
        isCurrent: false,
        isPast: false,
      },
      {
        id: 'p3',
        name: '專題實作完成',
        period: '12-15 個月後',
        deadline: '2027-07-01',
        description: '完成專題實作的最終版本，開始整理備審資料。',
        tasks: [
          '完成專題實作報告（含摘要、方法、結果、討論）',
          '拍攝專題成果照片或影片',
          '開始構思備審資料大綱',
          '整理所有技能檢定與競賽成果',
        ],
        skillGaps: [],
        isCurrent: false,
        isPast: false,
      },
      {
        id: 'p4',
        name: '統測準備 + 甄選備審',
        period: '15-18 個月後',
        deadline: '2027-10-01',
        description: '開始統測準備，同時撰寫甄選備審資料。',
        tasks: [
          '制定統測讀書計畫（每日定額複習）',
          '撰寫備審資料初稿',
          '請老師與同學提供回饋',
          '至少修改備審資料 3 次',
        ],
        skillGaps: [],
        isCurrent: false,
        isPast: false,
      },
    );
  } else {
    // 高一
    phases.push(
      {
        id: 'p1',
        name: '技能基礎期',
        period: '現在 ~ 12 個月後',
        deadline: '2027-04-01',
        description: '探索各職群技能，找到自己的興趣方向。',
        tasks: [
          ...gaps.filter(g => g.priority === 'critical').slice(0, 2).map(g => `「${SKILL_CATEGORY_LABELS[g.category]}」：${g.description}`),
          '嘗試不同技能領域（實作課程、工作坊、體驗活動）',
          `深入了解${directionNames}相關的職群（用職群探索功能）`,
          '參加至少 1 個與技能相關的社團',
          '每週記錄技能學習心得',
        ],
        skillGaps: gaps.filter(g => g.priority === 'critical').slice(0, 3),
        isCurrent: true,
        isPast: false,
      },
      {
        id: 'p2',
        name: '技能深化期',
        period: '12-24 個月後',
        deadline: '2028-04-01',
        description: `選定${directionNames}方向，考取丙級證照，開始專題構想。`,
        tasks: [
          '報名並通過丙級技術士技能檢定',
          `在${directionNames}領域構思專題實作題目`,
          '參加校內技能競賽累積經驗',
          '持續參與社團，爭取幹部職位',
        ],
        skillGaps: gaps.filter(g => g.priority === 'important').slice(0, 2),
        isCurrent: false,
        isPast: false,
      },
      {
        id: 'p3',
        name: '專題與競賽',
        period: '24-30 個月後',
        deadline: '2028-10-01',
        description: '正式開始專題實作，參加對外競賽展現實力。',
        tasks: [
          '正式執行專題實作，完成初步成果',
          '參加全國技能競賽或專題競賽',
          '尋求實習機會累積實務經驗',
          '考取更高級別的技能檢定（乙級）',
        ],
        skillGaps: [],
        isCurrent: false,
        isPast: false,
      },
      {
        id: 'p4',
        name: '甄選準備期',
        period: '30-36 個月後',
        deadline: '2029-04-01',
        description: '完成專題實作，開始準備備審資料與統測。',
        tasks: [
          '完成專題實作的最終報告',
          '撰寫備審資料初稿',
          '制定統測讀書計畫',
          '研究目標四技二專校系的招生資訊',
        ],
        skillGaps: [],
        isCurrent: false,
        isPast: false,
      },
    );
  }

  return phases;
}

function getEncouragement(grade: GradeLevel, skillCount: number, directions: DirectionResult[]): string {
  const dirStr = directions.length > 0 ? directions.map(d => d.direction).join('、') : '你的目標方向';
  const hasEnough = skillCount >= 5;

  if (grade === '高一') {
    return `你才高一，時間非常充裕！${dirStr}是很好的目標方向。現在開始探索技能、參加社團、累積專題實作經驗，高三時你會感謝現在的自己。`;
  }
  if (grade === '高二') {
    if (hasEnough) return `高二是黃金時期，你已經累積了不少技能紀錄。專注深化${dirStr}方向，完成專題實作並考取證照，你一定可以進入理想的四技二專！`;
    return `高二開始準備完全來得及！從今天開始記錄技能學習、報名技能檢定、構思專題實作題目，一年後你就會有豐富的備審素材。`;
  }
  if (hasEnough) return `高三了但技能準備得不錯！專注備審資料的品質，把專題實作和技能檢定的成果好好呈現，展現你對${dirStr}的熱情，你一定可以！`;
  return `雖然高三了，但全力衝刺還來得及！集中精力完成專題實作的最終版本，備審資料的質量比數量更重要。`;
}

const PRIORITY_STYLES: Record<string, string> = {
  critical: 'bg-red-50 border-red-200 text-red-800',
  important: 'bg-amber-50 border-amber-200 text-amber-800',
  suggested: 'bg-blue-50 border-blue-200 text-blue-800',
};

const PRIORITY_LABELS: Record<string, string> = {
  critical: '重要',
  important: '建議',
  suggested: '參考',
};

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

  const skillItems = useMemo(
    () => mounted ? loadFromStorage<SkillItem[]>('skill-items', []) : [],
    [mounted]
  );

  const hasOnboarding = profile && profile.completedSteps >= 5 && directions.length > 0;

  // Manual setup state
  const [grade, setGrade] = useState<GradeLevel>('高二');
  const [pathway, setPathway] = useState<VocationalPathway>('四技二專甄選');

  const activeGrade = profile?.grade || grade;
  const activeDirections = directions.length > 0 ? directions : [{ direction: '資訊軟體應用', directionGroup: '資訊群' as VocationalGroup, confidence: 0.5, reasons: ['預設方向'], relatedCategoryIds: ['info-software'], factCount: 0 }];
  const activeSkillCount = skillItems.length;

  const gaps = useMemo(
    () => analyzeGaps(activeDirections, skillItems, activeGrade),
    [activeDirections, skillItems, activeGrade]
  );

  const roadmap = useMemo(
    () => generatePersonalizedRoadmap(activeGrade, pathway, activeDirections, activeSkillCount, gaps),
    [activeGrade, pathway, activeDirections, activeSkillCount, gaps]
  );

  const encouragement = useMemo(
    () => getEncouragement(activeGrade, activeSkillCount, activeDirections),
    [activeGrade, activeSkillCount, activeDirections]
  );

  const monthsLeft = getMonthsRemaining(activeGrade);
  const isPro = isProUser();

  // Upcoming calendar events (filter for vocational)
  const upcomingEvents = useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    const vocationalEvents = NATIONAL_CALENDAR_EVENTS.filter(e => e.vocational);
    return vocationalEvents
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
            : '以終為始，為你量身打造的高職升學準備計畫'}
        </p>
      </div>

      {/* Onboarding prompt for users without profile */}
      {!hasOnboarding && !showSetup && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 mb-8 text-center">
          <h2 className="font-bold text-indigo-900 mb-2">還沒完成導入流程？</h2>
          <p className="text-sm text-indigo-700 mb-4">
            完成 5 步導入，我們能給你更精準的路線圖和技能缺口分析。
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
              <div className="grid grid-cols-3 gap-2">
                {PATHWAYS.map(p => (
                  <button
                    key={p}
                    onClick={() => setPathway(p)}
                    className={`py-3 px-2 rounded-xl text-xs font-medium transition-colors text-center ${pathway === p ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
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
          {activeDirections.map(d => {
            const groupKey = d.directionGroup as VocationalGroup;
            const colorClass = VOCATIONAL_GROUP_COLORS[groupKey] || 'bg-gray-500';
            return (
              <span
                key={d.direction}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full font-medium text-sm border border-indigo-200"
              >
                {d.direction}
                <span className="ml-1 text-xs text-indigo-400">({Math.round(d.confidence * 100)}%)</span>
              </span>
            );
          })}
        </div>
      )}

      {/* Encouragement */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 mb-8">
        <p className="text-gray-800 leading-relaxed text-center">{encouragement}</p>
      </div>

      {/* Stats row with action links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href="/portfolio" className="bg-white rounded-2xl shadow-sm p-5 text-center hover:shadow-md transition-shadow group">
          <div className="text-3xl font-bold text-purple-600">{activeSkillCount}</div>
          <div className="text-sm text-gray-500 group-hover:text-indigo-600">技能紀錄 → 記錄</div>
        </Link>
        <Link href="/calendar" className="bg-white rounded-2xl shadow-sm p-5 text-center hover:shadow-md transition-shadow group">
          <div className="text-3xl font-bold text-blue-600">{upcomingEvents.length}</div>
          <div className="text-sm text-gray-500 group-hover:text-indigo-600">近期活動 → 校曆</div>
        </Link>
        <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
          <div className="text-3xl font-bold text-amber-600">{gaps.length}</div>
          <div className="text-sm text-gray-500">待補缺口</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
          <div className="text-3xl font-bold text-green-600">{monthsLeft}</div>
          <div className="text-sm text-gray-500">剩餘月數</div>
        </div>
      </div>

      {/* Quick actions */}
      {hasOnboarding && (
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <Link href="/portfolio" className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors">
            + 記錄技能
          </Link>
          <Link href="/calendar" className="px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors">
            查看校曆
          </Link>
          <Link href="/timeline" className="px-5 py-2.5 bg-green-50 text-green-700 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors">
            成就時光軸
          </Link>
        </div>
      )}

      {/* Gap analysis */}
      {gaps.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-amber-500">&#9888;</span>
            技能缺口分析
          </h2>
          <div className="space-y-3">
            {gaps.map((gap, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${PRIORITY_STYLES[gap.priority]}`}>
                <div className="w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center text-lg flex-shrink-0">
                  {SKILL_CATEGORY_ICONS[gap.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{SKILL_CATEGORY_LABELS[gap.category]}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      gap.priority === 'critical' ? 'bg-red-200 text-red-800' :
                      gap.priority === 'important' ? 'bg-amber-200 text-amber-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {PRIORITY_LABELS[gap.priority]}
                    </span>
                  </div>
                  <div className="text-xs mt-0.5 opacity-80">{gap.description}</div>
                  <div className="text-xs mt-1 font-medium">
                    目前 {gap.current} 件 / 建議 {gap.recommended} 件
                  </div>
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
              {/* Phase-level gaps and actions */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                {phase.skillGaps.length > 0 && (
                  <>
                    <div className="text-xs text-amber-600 font-medium mb-1">此階段需補齊</div>
                    {phase.skillGaps.map((g, j) => (
                      <div key={j} className="text-xs text-gray-600">
                        {SKILL_CATEGORY_ICONS[g.category]} {SKILL_CATEGORY_LABELS[g.category]}：{g.description}
                      </div>
                    ))}
                  </>
                )}
                {phase.isCurrent && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Link href="/portfolio" className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors">
                      記錄技能
                    </Link>
                    <Link href="/calendar" className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                      查看校曆
                    </Link>
                    {phase.name.includes('面試') && (
                      <Link href="/interview" className="text-xs px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100 transition-colors">
                        面試練習
                      </Link>
                    )}
                    {phase.name.includes('備審') && (
                      <Link href="/strategy" className="text-xs px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg font-medium hover:bg-amber-100 transition-colors">
                        策略報告
                      </Link>
                    )}
                  </div>
                )}
              </div>
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
                ev.type === 'exam' ? 'bg-red-100 text-red-700' :
                ev.type === 'competition' ? 'bg-amber-100 text-amber-700' :
                ev.type === 'certification' ? 'bg-emerald-100 text-emerald-700' :
                ev.type === 'capstone' ? 'bg-purple-100 text-purple-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {ev.type === 'exam' ? '考試' :
                 ev.type === 'competition' ? '競賽' :
                 ev.type === 'certification' ? '技能檢定' :
                 ev.type === 'capstone' ? '專題' :
                 '活動'}
              </div>
              <div className="font-medium text-gray-900 text-sm">{ev.title}</div>
            </div>
          ))}
          {upcomingEvents.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">目前沒有近期的高職相關活動</p>
          )}
        </div>
      </div>

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
