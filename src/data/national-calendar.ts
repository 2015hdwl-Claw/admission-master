import type { CalendarEvent } from '@/types';

export const NATIONAL_CALENDAR_EVENTS: CalendarEvent[] = [
  // 2026 下半年
  { id: 'nat-1', title: '學測報名截止', date: '2026-10-15', type: 'exam', isNational: true, learningCodes: [] },
  { id: 'nat-2', title: '第二次英聽報名截止', date: '2026-09-30', type: 'exam', isNational: true, learningCodes: [] },
  { id: 'nat-3', title: '第二次英聽測驗', date: '2026-10-24', type: 'exam', isNational: true, learningCodes: [] },
  { id: 'nat-4', title: '學測試務說明', date: '2026-11-01', type: 'exam', isNational: true, learningCodes: [] },

  // 2027 上半年
  { id: 'nat-5', title: '學習歷程檔案上傳截止', date: '2027-01-05', type: 'other', isNational: true, learningCodes: [] },
  { id: 'nat-6', title: '115 學測（第一天）', date: '2027-01-22', type: 'exam', isNational: true, learningCodes: [] },
  { id: 'nat-7', title: '115 學測（第二天）', date: '2027-01-23', type: 'exam', isNational: true, learningCodes: [] },
  { id: 'nat-8', title: '學測成績公布', date: '2027-02-24', type: 'exam', isNational: true, learningCodes: [] },
  { id: 'nat-9', title: '繁星推薦申請', date: '2027-03-08', type: 'activity', isNational: true, learningCodes: [] },
  { id: 'nat-10', title: '繁星推薦放榜', date: '2027-04-15', type: 'activity', isNational: true, learningCodes: [] },
  { id: 'nat-11', title: '個人申請第一階段篩選', date: '2027-04-25', type: 'activity', isNational: true, learningCodes: [] },
  { id: 'nat-12', title: '個人申請第二階段面試開始', date: '2027-05-15', type: 'activity', isNational: true, learningCodes: [] },
  { id: 'nat-13', title: '個人申請放榜', date: '2027-06-07', type: 'activity', isNational: true, learningCodes: [] },
  { id: 'nat-14', title: '分發入學登記', date: '2027-07-15', type: 'activity', isNational: true, learningCodes: [] },
  { id: 'nat-15', title: '分發入學放榜', date: '2027-07-28', type: 'activity', isNational: true, learningCodes: [] },
  { id: 'nat-16', title: '第一次英聽測驗', date: '2026-05-23', type: 'exam', isNational: true, learningCodes: [] },
  { id: 'nat-17', title: '第一次英聽報名截止', date: '2026-04-30', type: 'exam', isNational: true, learningCodes: [] },
];

export const EVENT_TYPE_LABELS: Record<string, string> = {
  exam: '考試',
  activity: '活動',
  competition: '競賽',
  other: '其他',
};

export const EVENT_TYPE_COLORS: Record<string, string> = {
  exam: 'bg-red-100 text-red-700',
  activity: 'bg-blue-100 text-blue-700',
  competition: 'bg-amber-100 text-amber-700',
  other: 'bg-gray-100 text-gray-700',
};

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
