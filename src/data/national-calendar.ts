import type { CalendarEvent } from '@/types';

// 114 學年度（2025-2026）— 已過的事件，供參考
// 115 學年度（2026-2027）— 即將到來的事件
// 日期為合理推估，正式日期以技專校院招生委員會公告為準

export const NATIONAL_CALENDAR_EVENTS: CalendarEvent[] = [
  // ═══════════════════════════════════════════════
  // 2026 年上半年 — 114 學年度事件（已過）
  // ═══════════════════════════════════════════════

  // 統測（114 學年度）
  { id: 'voc-a1', title: '114 統測報名截止', date: '2026-02-27', type: 'exam', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-a2', title: '114 統一入學測驗（統測）第一天', date: '2026-04-25', type: 'exam', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-a3', title: '114 統一入學測驗（統測）第二天', date: '2026-04-26', type: 'exam', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-a4', title: '114 統測成績公布', date: '2026-05-20', type: 'exam', isNational: true, learningCodes: [], vocational: true },

  // 四技二專甄選（114 學年度）
  { id: 'voc-a5', title: '114 四技二專甄選報名截止', date: '2026-06-10', type: 'activity', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-a6', title: '114 四技二專甄選第一階段篩選', date: '2026-06-25', type: 'activity', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-a7', title: '114 四技二專甄選第二階段（備審/面試）', date: '2026-07-05', type: 'activity', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-a8', title: '114 四技二專甄選放榜', date: '2026-07-20', type: 'activity', isNational: true, learningCodes: [], vocational: true },

  // 聯合登記分發（114 學年度）
  { id: 'voc-a9', title: '114 聯合登記分發志願填報', date: '2026-07-25', type: 'activity', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-a10', title: '114 聯合登記分發放榜', date: '2026-08-05', type: 'activity', isNational: true, learningCodes: [], vocational: true },

  // 技優保送/甄保（114 學年度）
  { id: 'voc-a11', title: '114 技優保送/甄保報名截止', date: '2026-03-20', type: 'activity', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-a12', title: '114 技優保送/甄保放榜', date: '2026-05-15', type: 'activity', isNational: true, learningCodes: [], vocational: true },

  // 科技校院繁星（114 學年度）
  { id: 'voc-a13', title: '114 科技校院繁星計畫報名', date: '2026-03-01', type: 'activity', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-a14', title: '114 科技校院繁星計畫放榜', date: '2026-04-10', type: 'activity', isNational: true, learningCodes: [], vocational: true },

  // 全國技能競賽（114 學年度）
  { id: 'voc-a15', title: '全國技能競賽區賽（各縣市）', date: '2026-02-15', type: 'competition', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-a16', title: '全國技能競賽決賽', date: '2026-04-20', type: 'competition', isNational: true, learningCodes: [], vocational: true },

  // ═══════════════════════════════════════════════
  // 2026 年下半年 — 115 學年度準備期
  // ═══════════════════════════════════════════════

  // 技能檢定（丙級）
  { id: 'voc-b1', title: '丙級技術士技能檢定（第一梯次）', date: '2026-06-06', type: 'certification', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-b2', title: '丙級技術士技能檢定（第二梯次）', date: '2026-08-15', type: 'certification', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-b3', title: '丙級技術士技能檢定（第三梯次）', date: '2026-11-07', type: 'certification', isNational: true, learningCodes: [], vocational: true },

  // 技能檢定（乙級）
  { id: 'voc-b4', title: '乙級技術士技能檢定（第一梯次）', date: '2026-07-04', type: 'certification', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-b5', title: '乙級技術士技能檢定（第二梯次）', date: '2026-10-17', type: 'certification', isNational: true, learningCodes: [], vocational: true },

  // 專題實作
  { id: 'voc-b6', title: '校內專題實作競賽（建議完成期限）', date: '2026-11-30', type: 'capstone', isNational: false, learningCodes: [], vocational: true },
  { id: 'voc-b7', title: '全國專題實作競賽報名', date: '2026-12-01', type: 'capstone', isNational: true, learningCodes: [], vocational: true },

  // ═══════════════════════════════════════════════
  // 2027 年上半年 — 115 學年度升學關鍵期
  // 日期為合理推估，正式日期以技專校院招生委員會公告為準
  // ═══════════════════════════════════════════════

  // 科技校院繁星（115 學年度）
  { id: 'voc-c1', title: '115 科技校院繁星計畫報名（推估）', date: '2027-02-15', type: 'activity', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-c2', title: '115 科技校院繁星計畫放榜（推估）', date: '2027-03-25', type: 'activity', isNational: true, learningCodes: [], vocational: true },

  // 技優保送/甄保（115 學年度）
  { id: 'voc-c3', title: '115 技優保送/甄保報名（推估）', date: '2027-02-28', type: 'activity', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-c4', title: '115 技優保送/甄保放榜（推估）', date: '2027-04-20', type: 'activity', isNational: true, learningCodes: [], vocational: true },

  // 技能檢定（上半年）
  { id: 'voc-c5', title: '丙級技術士技能檢定（第四梯次）', date: '2027-01-10', type: 'certification', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-c6', title: '乙級技術士技能檢定（第三梯次）', date: '2027-02-15', type: 'certification', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-c7', title: '甲級技術士技能檢定', date: '2027-03-20', type: 'certification', isNational: true, learningCodes: [], vocational: true },

  // 全國技能競賽（115 學年度）
  { id: 'voc-c8', title: '115 全國技能競賽區賽（各縣市）', date: '2027-03-01', type: 'competition', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-c9', title: '115 全國技能競賽決賽（推估）', date: '2027-05-10', type: 'competition', isNational: true, learningCodes: [], vocational: true },

  // 統測（115 學年度）— 最重要
  { id: 'voc-c10', title: '115 統測試務說明公告（推估）', date: '2027-02-01', type: 'exam', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-c11', title: '115 統測報名截止（推估）', date: '2027-03-01', type: 'exam', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-c12', title: '115 統一入學測驗（統測）第一天（推估）', date: '2027-04-24', type: 'exam', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-c13', title: '115 統一入學測驗（統測）第二天（推估）', date: '2027-04-25', type: 'exam', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-c14', title: '115 統測成績公布（推估）', date: '2027-05-20', type: 'exam', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-c15', title: '115 統測成績複查申請截止（推估）', date: '2027-05-25', type: 'exam', isNational: true, learningCodes: [], vocational: true },

  // 四技二專甄選（115 學年度）
  { id: 'voc-c16', title: '115 四技二專甄選報名截止（推估）', date: '2027-06-05', type: 'activity', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-c17', title: '115 四技二專甄選第一階段篩選（推估）', date: '2027-06-20', type: 'activity', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-c18', title: '115 四技二專甄選第二階段備審資料繳交（推估）', date: '2027-06-25', type: 'activity', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-c19', title: '115 四技二專甄選面試開始（推估）', date: '2027-07-01', type: 'activity', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-c20', title: '115 四技二專甄選放榜（推估）', date: '2027-07-18', type: 'activity', isNational: true, learningCodes: [], vocational: true },

  // 聯合登記分發（115 學年度）
  { id: 'voc-c21', title: '115 聯合登記分發志願填報（推估）', date: '2027-07-22', type: 'activity', isNational: true, learningCodes: [], vocational: true },
  { id: 'voc-c22', title: '115 聯合登記分發放榜（推估）', date: '2027-08-01', type: 'activity', isNational: true, learningCodes: [], vocational: true },
];

export const EVENT_TYPE_LABELS: Record<string, string> = {
  exam: '考試',
  activity: '活動',
  competition: '競賽',
  certification: '技能檢定',
  capstone: '專題實作',
  other: '其他',
};

export const EVENT_TYPE_COLORS: Record<string, string> = {
  exam: 'bg-red-100 text-red-700',
  activity: 'bg-blue-100 text-blue-700',
  competition: 'bg-amber-100 text-amber-700',
  certification: 'bg-green-100 text-green-700',
  capstone: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-700',
};

// Legacy B-M learning code labels — retained for backward compatibility
export const LEARNING_CODE_LABELS: Record<string, string> = {
  B: 'B 書面報告',
  C: 'C 實作',
  D: 'D 自然探究',
  E: 'E 社會探究',
  F: 'F 自主學習',
  G: 'G 社團',
  H: 'H 幹部',
  I: 'I 服務學習',
  J: 'J 競賽',
  K: 'K 作品',
  L: 'L 檢定',
  M: 'M 特殊表現',
};

export const LEARNING_CODE_COLORS: Record<string, string> = {
  B: 'bg-blue-500',
  C: 'bg-green-500',
  D: 'bg-teal-500',
  E: 'bg-orange-500',
  F: 'bg-purple-500',
  G: 'bg-pink-500',
  H: 'bg-indigo-500',
  I: 'bg-cyan-500',
  J: 'bg-amber-500',
  K: 'bg-rose-500',
  L: 'bg-lime-500',
  M: 'bg-fuchsia-500',
};
