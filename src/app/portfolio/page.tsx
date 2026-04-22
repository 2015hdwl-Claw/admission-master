'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  SKILL_CATEGORY_LABELS, SKILL_CATEGORY_ICONS,
  CERTIFICATION_LEVEL_ORDER, QUALITY_GRADE_LABELS,
} from '@/types';
import { VOCATIONAL_GROUP_LABELS } from '@/data/vocational-categories';
import { loadFromStorage, saveToStorage, generateId } from '@/lib/storage';
import type {
  SkillItem, SkillCategory, CertificationLevel,
  QualityGrade, OnboardingProfile, CapstoneStatus, CompetitionLevel,
} from '@/types';

// ── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'skill-items';

const ALL_CATEGORIES: SkillCategory[] = [
  'capstone', 'certification', 'internship', 'competition',
  'club', 'license', 'service',
];

const CAT_BG: Record<SkillCategory, string> = {
  capstone: 'bg-rose-50 border-rose-200', certification: 'bg-amber-50 border-amber-200',
  internship: 'bg-blue-50 border-blue-200', competition: 'bg-purple-50 border-purple-200',
  club: 'bg-emerald-50 border-emerald-200', license: 'bg-cyan-50 border-cyan-200',
  service: 'bg-pink-50 border-pink-200',
};

const CAT_ACTIVE: Record<SkillCategory, string> = {
  capstone: 'border-rose-400 bg-rose-100', certification: 'border-amber-400 bg-amber-100',
  internship: 'border-blue-400 bg-blue-100', competition: 'border-purple-400 bg-purple-100',
  club: 'border-emerald-400 bg-emerald-100', license: 'border-cyan-400 bg-cyan-100',
  service: 'border-pink-400 bg-pink-100',
};

const STATUS_LABELS: Record<CapstoneStatus, string> = { planning: '籌備中', 'in-progress': '進行中', completed: '已完成', awarded: '獲獎' };
const STATUS_COLORS: Record<CapstoneStatus, string> = { planning: 'bg-gray-100 text-gray-600', 'in-progress': 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700', awarded: 'bg-yellow-100 text-yellow-700' };
const COMP_COLORS: Record<CompetitionLevel, string> = { '校內': 'bg-gray-100 text-gray-600', '區賽': 'bg-blue-100 text-blue-700', '全國': 'bg-purple-100 text-purple-700', '國際': 'bg-amber-100 text-amber-700' };
const GRADE_COLORS: Record<QualityGrade, string> = { A: 'bg-green-100 text-green-700', B: 'bg-blue-100 text-blue-700', C: 'bg-yellow-100 text-yellow-700', D: 'bg-red-100 text-red-700' };
const CERT_COLORS: Record<CertificationLevel, string> = { '丙級': 'bg-green-100 text-green-700', '乙級': 'bg-blue-100 text-blue-700', '甲級': 'bg-purple-100 text-purple-700', '單一級': 'bg-amber-100 text-amber-700' };

// ── Data-driven badge definitions for CategoryDetail ────────────────────────

type BadgeDef = { key: keyof SkillItem; colorCls?: string; fallback?: string; format?: (v: unknown) => string };

const CATEGORY_BADGES: Record<SkillCategory, BadgeDef[]> = {
  capstone: [
    { key: 'capstoneTopic' },
    { key: 'capstoneRole', colorCls: 'bg-gray-100 text-gray-500' },
    { key: 'capstoneStatus', colorCls: '', format: (v) => STATUS_LABELS[v as CapstoneStatus] },
  ],
  certification: [
    { key: 'certificationName' },
    { key: 'certificationLevel', colorCls: '', format: (v) => v as string },
    { key: 'certificationScore', colorCls: 'bg-gray-100 text-gray-500', format: (v) => `${v} 分` },
  ],
  competition: [
    { key: 'competitionName' },
    { key: 'competitionLevel', colorCls: '', format: (v) => v as string },
    { key: 'competitionResult', colorCls: 'bg-green-50 text-green-700' },
  ],
  internship: [
    { key: 'internshipCompany' },
    { key: 'internshipDuration', colorCls: 'bg-gray-100 text-gray-500' },
    { key: 'internshipRole', colorCls: 'bg-blue-50 text-blue-600' },
  ],
  club: [{ key: 'clubRole', colorCls: 'bg-emerald-50 text-emerald-600' }],
  license: [
    { key: 'licenseName' },
    { key: 'licenseIssuer', colorCls: 'bg-cyan-50 text-cyan-600' },
  ],
  service: [
    { key: 'serviceHours', colorCls: 'bg-pink-50 text-pink-600', format: (v) => `${v} 小時` },
    { key: 'serviceOrganization', colorCls: 'bg-gray-100 text-gray-500' },
  ],
};

function getBadgeColor(key: keyof SkillItem, value: unknown): string {
  if (key === 'capstoneStatus') return STATUS_COLORS[value as CapstoneStatus] || 'bg-gray-100 text-gray-600';
  if (key === 'certificationLevel') return CERT_COLORS[value as CertificationLevel] || 'bg-gray-100 text-gray-600';
  if (key === 'competitionLevel') return COMP_COLORS[value as CompetitionLevel] || 'bg-gray-100 text-gray-600';
  return 'bg-gray-100 text-gray-600';
}

// ── Data-driven form field definitions ───────────────────────────────────────

type FieldDef = { key: keyof SkillItem; label: string; placeholder?: string; type?: 'text' | 'number' | 'select'; options?: { value: string; label: string }[] };

const CATEGORY_FIELDS: Record<SkillCategory, FieldDef[]> = {
  capstone: [
    { key: 'capstoneTopic', label: '專題主題', placeholder: '例如：智慧溫室自動灌溉系統' },
    { key: 'capstoneRole', label: '擔任角色', placeholder: '例如：組長、程式開發' },
    { key: 'capstoneStatus', label: '目前狀態', type: 'select', options: [
      { value: 'planning', label: '籌備中' }, { value: 'in-progress', label: '進行中' },
      { value: 'completed', label: '已完成' }, { value: 'awarded', label: '獲獎' },
    ]},
  ],
  certification: [
    { key: 'certificationName', label: '檢定名稱', placeholder: '例如：電腦軟體應用、機械加工' },
    { key: 'certificationLevel', label: '等級', type: 'select', options: CERTIFICATION_LEVEL_ORDER.map(l => ({ value: l, label: l })) },
    { key: 'certificationScore', label: '分數（選填）', type: 'number', placeholder: '例如：85' },
  ],
  competition: [
    { key: 'competitionName', label: '競賽名稱', placeholder: '例如：全國技能競賽' },
    { key: 'competitionLevel', label: '級別', type: 'select', options: [
      { value: '校內', label: '校內' }, { value: '區賽', label: '區賽' },
      { value: '全國', label: '全國' }, { value: '國際', label: '國際' },
    ]},
    { key: 'competitionResult', label: '成績 / 結果', placeholder: '例如：第三名、佳作' },
  ],
  internship: [
    { key: 'internshipCompany', label: '實習公司 / 機構', placeholder: '例如：台積電、鴻海' },
    { key: 'internshipDuration', label: '實習期間', placeholder: '例如：2025/7 - 2025/8（兩個月）' },
    { key: 'internshipRole', label: '實習職位', placeholder: '例如：助理工程師' },
  ],
  club: [{ key: 'clubRole', label: '社團中擔任角色', placeholder: '例如：社長、副社長、幹部' }],
  license: [
    { key: 'licenseName', label: '證照名稱', placeholder: '例如：TOEIC、日文檢定 N3' },
    { key: 'licenseIssuer', label: '發證機構', placeholder: '例如：ETS、日本國際交流基金會' },
  ],
  service: [
    { key: 'serviceHours', label: '服務時數', type: 'number', placeholder: '例如：24' },
    { key: 'serviceOrganization', label: '服務機構', placeholder: '例如：社區關懷協會' },
  ],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function createEmptyItem(category: SkillCategory): SkillItem {
  return { id: '', category, title: '', description: '', date: '', createdAt: '' };
}

function generateDraft(item: SkillItem, profile: OnboardingProfile | null): string {
  const group = profile
    ? (VOCATIONAL_GROUP_LABELS[profile.selectedDirections[0] as keyof typeof VOCATIONAL_GROUP_LABELS] || '相關科')
    : '相關科';

  const templates: Record<SkillCategory, () => string[]> = {
    capstone: () => [
      `【情境】在${profile?.selectedDirections[0] || '本校'}就讀期間，我參與了「${item.capstoneTopic || item.title}」專題實作，這是一個與${group}領域相關的專案。`,
      `【任務】我在團隊中擔任${item.capstoneRole || '組員'}，負責協助專題的規劃與執行。`,
      `【行動】${item.description || '我積極參與討論、分工合作，將課堂所學應用於實際問題的解決。'}`,
      `【結果】最終專題${STATUS_LABELS[item.capstoneStatus || 'completed']}，讓我深刻體會到團隊合作與實作能力的重要性。`,
    ],
    certification: () => [
      `【情境】為了提升${group}領域的專業能力，我決定參加技能檢定。`,
      `【任務】我報名參加${item.certificationLevel || ''}${item.certificationName || item.title}技能檢定，目標是取得技術士證照。`,
      `【行動】我利用課餘時間加強實作練習，熟悉檢定項目與評分標準，反覆演練至熟練為止。`,
      `【結果】順利通過檢定，取得${item.certificationLevel || ''}技術士證照${item.certificationScore ? `，分數${item.certificationScore}分` : ''}。`,
    ],
    competition: () => [
      `【情境】為了挑戰自我、展現${group}領域的實力，我參加了${item.competitionName || item.title}競賽。`,
      `【任務】這是一項${item.competitionLevel || ''}級別的競賽，我需要充分準備才能脫穎而出。`,
      `【行動】${item.description || '我投入大量時間練習與準備，針對比賽項目進行系統性的訓練。'}`,
      `【結果】最終${item.competitionResult || '完成比賽'}，這段經歷讓我學到了許多課堂外的知識與技能。`,
    ],
    internship: () => [
      `【情境】為了提早接觸職場環境，我在${item.internshipCompany || '業界'}進行了${item.internshipDuration || '一段時間'}的實習。`,
      `【任務】我在實習中擔任${item.internshipRole || '實習生'}，負責協助日常工作並學習實務操作。`,
      `【行動】${item.description || '我認真學習每一項工作流程，主動請教前輩，將學校所學與實務結合。'}`,
      `【結果】實習經驗讓我更清楚${group}領域的職場生態，也確認了自己未來的發展方向。`,
    ],
    club: () => [
      `【情境】在高中期間，我參與了${item.title}社團，展現對課外活動的熱忱。`,
      `【任務】我在社團中擔任${item.clubRole || '社員'}，參與各項活動的策劃與執行。`,
      `【行動】${item.description || '我積極參與社團活動，與夥伴們一起完成多項任務，培養了領導力與團隊合作能力。'}`,
      `【結果】社團經驗讓我成長許多，學到了課堂外的軟實力，也結交了志同道合的朋友。`,
    ],
    license: () => [
      `【情境】為了擴展自己的專業能力，我考取了${item.licenseName || item.title}證照。`,
      `【任務】此證照由${item.licenseIssuer || '相關機構'}發行，需要通過專業考試或訓練才能取得。`,
      `【行動】${item.description || '我利用課餘時間準備考試，系統性地學習相關知識。'}`,
      `【結果】成功取得證照，這項專業資格為我的學習歷程增添了客觀的能力證明。`,
    ],
    service: () => [
      `【情境】我參與了由${item.serviceOrganization || '學校'}舉辦的服務學習活動，累積了${item.serviceHours || 0}小時的服務時數。`,
      `【任務】透過服務學習，我希望回饋社會並培養公民責任感。`,
      `【行動】${item.description || '我認真投入每一次服務活動，從中學習如何與不同背景的人互動合作。'}`,
      `【結果】服務經驗讓我更加了解社會需求，也培養了同理心和奉獻精神。`,
    ],
  };

  return (templates[item.category]?.() || []).join('\n');
}

// ── Shared UI helpers ────────────────────────────────────────────────────────

const INPUT_CLS = 'w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm';
const LABEL_CLS = 'block text-sm font-medium text-gray-700 mb-1';
const BADGE_CLS = 'text-xs px-2 py-0.5 rounded-md';

function BadgeList({ item }: { item: SkillItem }) {
  const badges = CATEGORY_BADGES[item.category];
  if (!badges) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map(def => {
        const val = item[def.key];
        if (val == null || val === '') return null;
        const text = def.format ? def.format(val) : String(val);
        const color = def.colorCls || getBadgeColor(def.key, val);
        return <span key={def.key} className={`${BADGE_CLS} ${color}`}>{text}</span>;
      })}
    </div>
  );
}

function FormFields({ category, form, update }: { category: SkillCategory; form: SkillItem; update: (p: Partial<SkillItem>) => void }) {
  const fields = CATEGORY_FIELDS[category];
  if (!fields) return null;
  return (
    <>
      {fields.map(f => (
        <div key={f.key}>
          <label className={LABEL_CLS}>{f.label}</label>
          {f.type === 'select' ? (
            <select
              value={(form[f.key] as string) || (f.options?.[0]?.value ?? '')}
              onChange={e => update({ [f.key]: e.target.value })}
              className={INPUT_CLS}
            >
              {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : (
            <input
              type={f.type || 'text'}
              value={f.type === 'number' ? (form[f.key] as number | undefined ?? '') : (form[f.key] as string) || ''}
              onChange={e => update({ [f.key]: f.type === 'number' ? (e.target.value ? Number(e.target.value) : undefined) : e.target.value })}
              placeholder={f.placeholder}
              className={INPUT_CLS}
            />
          )}
        </div>
      ))}
    </>
  );
}

function DraftDisplay({ draft }: { draft: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <button onClick={() => setOpen(v => !v)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
        {open ? '收起備審素材' : '展開備審素材'}
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && <pre className="mt-2 text-xs text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap leading-relaxed">{draft}</pre>}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function SkillJourneyPage() {
  const [items, setItems] = useState<SkillItem[]>([]);
  const [filterCat, setFilterCat] = useState<SkillCategory | 'ALL'>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [formCat, setFormCat] = useState<SkillCategory>('capstone');
  const [form, setForm] = useState<SkillItem>(createEmptyItem('capstone'));
  const [toast, setToast] = useState('');

  const [isPro, setIsPro] = useState(false);
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [suggestion, setSuggestion] = useState<{ missingCategories: SkillCategory[]; suggestions: string[]; priority: string } | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);

  useEffect(() => {
    setItems(loadFromStorage<SkillItem[]>(STORAGE_KEY, []));
    const sub = loadFromStorage<{ plan: string }>('user-subscription', { plan: 'free' });
    setIsPro(sub.plan !== 'free');
    setProfile(loadFromStorage<OnboardingProfile | null>('onboarding-profile', null));
  }, []);

  const persist = (next: SkillItem[]) => { setItems(next); saveToStorage(STORAGE_KEY, next); };
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };
  const updateForm = (patch: Partial<SkillItem>) => setForm(prev => ({ ...prev, ...patch }));

  function handleAdd() {
    if (!form.title.trim() || !form.date) return;
    persist([...items, { ...form, id: generateId(), createdAt: new Date().toISOString() }]);
    setForm(createEmptyItem(formCat));
    setShowForm(false);
  }

  function handleGenerateDraft(item: SkillItem) {
    const draft = generateDraft(item, profile);
    persist(items.map(i => i.id === item.id ? { ...i, generatedDraft: draft } : i));
    showToast('已生成備審素材草稿');
  }

  async function fetchSuggestion() {
    if (!isPro) return;
    setLoadingSuggestion(true);
    const dir = profile?.selectedDirections[0] || '未指定';
    try {
      const res = await fetch('/api/portfolio-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction: dir, directionGroup: dir, skillItems: items.map(i => ({ category: i.category, title: i.title, description: i.description })) }),
      });
      const data = await res.json();
      setSuggestion(data.error ? null : { missingCategories: data.missingCategories || [], suggestions: data.suggestions || [], priority: data.priority || '' });
    } catch { setSuggestion(null); }
    setLoadingSuggestion(false);
    setShowSuggestion(true);
  }

  const filtered = useMemo(() => {
    const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));
    return filterCat === 'ALL' ? sorted : sorted.filter(i => i.category === filterCat);
  }, [items, filterCat]);

  const catCounts = useMemo(() => {
    const c: Record<string, number> = {};
    ALL_CATEGORIES.forEach(k => { c[k] = 0; });
    items.forEach(i => { c[i.category] = (c[i.category] || 0) + 1; });
    return c as Record<SkillCategory, number>;
  }, [items]);

  const covered = ALL_CATEGORIES.filter(c => catCounts[c] > 0).length;
  const pct = Math.round((covered / ALL_CATEGORIES.length) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-xl shadow-lg animate-pulse">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">技能旅程</h1>
        <p className="text-gray-500">追蹤你的專題實作、技能檢定、實習和競賽</p>
      </div>

      {/* Coverage Overview */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">技能覆蓋率</h3>
          <div className="text-right">
            <span className="text-2xl font-bold text-indigo-600">{pct}%</span>
            <span className="text-sm text-gray-400 ml-1">({covered}/{ALL_CATEGORIES.length})</span>
          </div>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all" style={{ width: pct + '%' }} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {ALL_CATEGORIES.map(cat => {
            const count = catCounts[cat];
            const active = filterCat === cat;
            const has = count > 0;
            return (
              <button key={cat} onClick={() => setFilterCat(active ? 'ALL' : cat)}
                className={'p-3 rounded-xl border text-left transition-colors ' + (active ? CAT_ACTIVE[cat] : has ? CAT_BG[cat] : 'border-gray-100 hover:border-gray-200')}>
                <div className="text-lg mb-1">{SKILL_CATEGORY_ICONS[cat]}</div>
                <div className="text-xs font-medium text-gray-700 mb-1.5">{SKILL_CATEGORY_LABELS[cat]}</div>
                <div className="flex items-center justify-between">
                  <span className={'text-xs font-bold ' + (has ? 'text-green-600' : 'text-gray-300')}>{count}</span>
                  {has && <span className="text-green-500 text-xs">✓</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Suggestion */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">AI 技能建議</h3>
            <p className="text-sm text-gray-500">根據你的科別和已有技能，建議下一步該補什麼</p>
          </div>
          {!isPro ? (
            <div className="flex items-center gap-2">
              <button onClick={() => {
                setShowSuggestion(true);
                setSuggestion({
                  missingCategories: ALL_CATEGORIES.filter(c => catCounts[c] === 0),
                  suggestions: [
                    '專題實作是高職申請入學的核心，建議盡早確定專題方向並開始規劃。',
                    '技能檢定是客觀的能力證明，丙級是基礎，建議挑戰乙級以提升競爭力。',
                    '實習經驗能展現你的實務能力，建議在暑假安排業界實習。',
                    '競賽經驗在備審資料中非常有說服力，從校內比賽開始累積。',
                    '社團參與能展現你的多元能力與領導力。',
                    '證照（如 TOEIC、電腦技能）是加分項目，建議提早準備。',
                    '服務學習能展現你的社會關懷，建議每學期至少參與一次。',
                  ],
                  priority: '先從專題實作和技能檢定開始，這兩類技能在四技二專甄選中最受重視。',
                });
              }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors">
                取得基本建議
              </button>
              <Link href="/pricing" className="text-xs text-gray-400 hover:text-indigo-600">或升級 Pro</Link>
            </div>
          ) : (
            <button onClick={fetchSuggestion} disabled={loadingSuggestion}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {loadingSuggestion ? '分析中...' : '取得建議'}
            </button>
          )}
        </div>

        {showSuggestion && suggestion && (
          <div className="mt-4 space-y-3">
            {suggestion.missingCategories.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">尚未涵蓋的技能類別：</p>
                <div className="flex flex-wrap gap-2">
                  {suggestion.missingCategories.map(c => (
                    <span key={c} className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
                      {SKILL_CATEGORY_ICONS[c]} {SKILL_CATEGORY_LABELS[c]}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {suggestion.priority && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <p className="text-sm font-bold text-indigo-700 mb-1">最優先補充</p>
                <p className="text-sm text-indigo-800">{suggestion.priority}</p>
              </div>
            )}
            {suggestion.suggestions.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">具體建議：</p>
                <ul className="space-y-1.5">
                  {suggestion.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-indigo-400 mt-1">•</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {showSuggestion && !suggestion && !loadingSuggestion && (
          <p className="text-sm text-gray-400 mt-4">無法取得建議，請確認已設定科別方向。</p>
        )}
      </div>

      {/* Add Button + Filter */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {filterCat === 'ALL' ? '全部' : SKILL_CATEGORY_LABELS[filterCat]} ({filtered.length})
          </span>
          {filterCat !== 'ALL' && (
            <button onClick={() => setFilterCat('ALL')} className="text-xs text-indigo-600 hover:underline">顯示全部</button>
          )}
        </div>
        <button onClick={() => { setForm(createEmptyItem(formCat)); setShowForm(true); }}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg">
          + 新增技能紀錄
        </button>
      </div>

      {/* Items List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>還沒有技能紀錄</p>
          <p className="text-sm mt-1">點擊「新增技能紀錄」開始累積你的技能旅程</p>
          <div className="flex justify-center gap-3 mt-4">
            <Link href="/calendar" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">從校曆匯入</Link>
            <Link href="/timeline" className="text-gray-500 hover:text-gray-700 text-sm">查看成就時光軸</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item.id} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{SKILL_CATEGORY_ICONS[item.category]}</span>
                  <span className="text-xs font-medium text-gray-500">{SKILL_CATEGORY_LABELS[item.category]}</span>
                  <span className="text-xs text-gray-400">{item.date}</span>
                  {item.qualityGrade && (
                    <span className={`${BADGE_CLS} font-medium ${GRADE_COLORS[item.qualityGrade]}`}>{item.qualityGrade}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleGenerateDraft(item)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap">
                    一鍵轉備審素材
                  </button>
                  <button onClick={() => persist(items.filter(i => i.id !== item.id))} className="text-gray-400 hover:text-red-500 text-sm">刪除</button>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
              {item.description && <p className="text-sm text-gray-600 leading-relaxed mb-2">{item.description}</p>}
              <BadgeList item={item} />
              {item.generatedDraft && <DraftDisplay draft={item.generatedDraft} />}
            </div>
          ))}
        </div>
      )}

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">新增技能紀錄</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="space-y-4">
              {/* Category selector */}
              <div>
                <label className={LABEL_CLS}>技能類別</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {ALL_CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => { setFormCat(cat); setForm(createEmptyItem(cat)); }}
                      className={'px-2 py-2 rounded-lg text-xs font-medium transition-colors text-center ' + (formCat === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                      {SKILL_CATEGORY_ICONS[cat]} {SKILL_CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Common fields */}
              <div>
                <label className={LABEL_CLS}>標題</label>
                <input type="text" value={form.title} onChange={e => updateForm({ title: e.target.value })}
                  placeholder="例如：智慧溫室自動灌溉系統專題" className={INPUT_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>描述</label>
                <textarea value={form.description} onChange={e => updateForm({ description: e.target.value })}
                  placeholder="記錄你的過程、收穫、心得..." rows={3}
                  className={INPUT_CLS + ' resize-none'} />
              </div>
              <div>
                <label className={LABEL_CLS}>日期</label>
                <input type="date" value={form.date} onChange={e => updateForm({ date: e.target.value })} className={INPUT_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>品質等級（選填）</label>
                <select value={form.qualityGrade || ''}
                  onChange={e => updateForm({ qualityGrade: (e.target.value || undefined) as QualityGrade | undefined })} className={INPUT_CLS}>
                  <option value="">不設定</option>
                  {(Object.entries(QUALITY_GRADE_LABELS) as [QualityGrade, string][]).map(([g, l]) => (
                    <option key={g} value={g}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Category-specific fields */}
              <FormFields category={formCat} form={form} update={updateForm} />

              <button onClick={handleAdd} disabled={!form.title.trim() || !form.date}
                className={'w-full py-3 rounded-xl font-bold transition-all ' + (form.title.trim() && form.date ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed')}>
                新增技能紀錄
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation hints */}
      <div className="text-center mt-8 space-x-4">
        <Link href="/calendar" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">從校曆匯入</Link>
        <Link href="/timeline" className="text-gray-500 hover:text-gray-700 text-sm">成就時光軸</Link>
        <Link href="/roadmap" className="text-gray-500 hover:text-gray-700 text-sm">回到路線圖</Link>
      </div>
    </div>
  );
}
