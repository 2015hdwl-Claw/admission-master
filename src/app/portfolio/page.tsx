'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  SKILL_CATEGORY_LABELS, SKILL_CATEGORY_ICONS,
  CERTIFICATION_LEVEL_ORDER, QUALITY_GRADE_LABELS,
} from '@/types';
import { VOCATIONAL_GROUP_LABELS } from '@/data/vocational-categories';
import { CAPSTONE_TEMPLATES } from '@/data/capstone-templates';
import type { CapstoneTemplate } from '@/data/capstone-templates';
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

const STATUS_LABELS: Record<CapstoneStatus, string> = { planning: '籌備中', 'in-progress': '進行中', completed: '已完成', awarded: '獲獎' };
const STATUS_COLORS: Record<CapstoneStatus, string> = { planning: 'bg-surface-container text-on-surface-variant', 'in-progress': 'bg-primary-fixed text-primary', completed: 'bg-success-container text-success', awarded: 'bg-warning-container text-warning' };
const COMP_COLORS: Record<CompetitionLevel, string> = { '校內': 'bg-surface-container text-on-surface-variant', '區賽': 'bg-primary-fixed text-primary', '全國': 'bg-tertiary-fixed text-tertiary', '國際': 'bg-warning-container text-warning' };
const GRADE_COLORS: Record<QualityGrade, string> = { A: 'bg-success-container text-success', B: 'bg-primary-fixed text-primary', C: 'bg-warning-container text-warning', D: 'bg-error-container text-error' };
const CERT_COLORS: Record<CertificationLevel, string> = { '丙級': 'bg-success-container text-success', '乙級': 'bg-primary-fixed text-primary', '甲級': 'bg-tertiary-fixed text-tertiary', '單一級': 'bg-warning-container text-warning' };

// ── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_PORTFOLIO = {
  featuredImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3BN6aV75K_Rb0vgoCm6wOOleYbv8PMNCFS4Rvv8YZ7WD4AljHJe9ppXNbvL0VwWM4ZJ_blmROYR_jY5ZgI1urRxuax-vAipAwCom6Uh2CH8Od8yjKU6cI-bMxcqZWkL8W4W8Bn5mLbXA24bwawoTitVN8x8z3dRLShWdY81RfRKOPSOhsi56ZnrlcsHoRld7Lj8H7TP56HSehCWpfAyZ1IqtLXD1YIULCuzJJpbJ1PCB24LAGDQfu26HugFOR1bwWe4IOsFcWwnQj',
  workspaceImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0jm5ri4psK3XFU8n870Iq_JpwarI8YeTSUdxfLRnGZIcf5tTE8cMZ1UvWDcxITBxiGcExr9Ccez7HiLJLMef-iPc52gQ21y5Hz1wNnS0w0tqRvdxyVP7gD9jEm26Y4EqcdEBW0HiouhbmNmJY6FiCOT35_AVwD9gIK74xX5QUZqGN3o9o_NzrCQsSC5CH6KAxwJOb-8i3EHoKwMj5_USysASCKxb5rofSHPvX1-GvxbFo-ePj5Ybce31334UCi504PA2JV-CMUwec',
};

// ── Data-driven badge definitions for CategoryDetail ────────────────────────

type BadgeDef = { key: keyof SkillItem; colorCls?: string; fallback?: string; format?: (v: unknown) => string };

const CATEGORY_BADGES: Record<SkillCategory, BadgeDef[]> = {
  capstone: [
    { key: 'capstoneTopic' },
    { key: 'capstoneRole', colorCls: 'bg-surface-container text-on-surface-variant' },
    { key: 'capstoneStatus', colorCls: '', format: (v) => STATUS_LABELS[v as CapstoneStatus] },
  ],
  certification: [
    { key: 'certificationName' },
    { key: 'certificationLevel', colorCls: '', format: (v) => v as string },
    { key: 'certificationScore', colorCls: 'bg-surface-container text-on-surface-variant', format: (v) => `${v} 分` },
  ],
  competition: [
    { key: 'competitionName' },
    { key: 'competitionLevel', colorCls: '', format: (v) => v as string },
    { key: 'competitionResult', colorCls: 'bg-success-container text-success' },
  ],
  internship: [
    { key: 'internshipCompany' },
    { key: 'internshipDuration', colorCls: 'bg-surface-container text-on-surface-variant' },
    { key: 'internshipRole', colorCls: 'bg-primary-fixed text-primary' },
  ],
  club: [{ key: 'clubRole', colorCls: 'bg-success-container text-success' }],
  license: [
    { key: 'licenseName' },
    { key: 'licenseIssuer', colorCls: 'bg-primary-fixed text-primary' },
  ],
  service: [
    { key: 'serviceHours', colorCls: 'bg-secondary-container text-secondary', format: (v) => `${v} 小時` },
    { key: 'serviceOrganization', colorCls: 'bg-surface-container text-on-surface-variant' },
  ],
};

function getBadgeColor(key: keyof SkillItem, value: unknown): string {
  if (key === 'capstoneStatus') return STATUS_COLORS[value as CapstoneStatus] || 'bg-surface-container text-on-surface-variant';
  if (key === 'certificationLevel') return CERT_COLORS[value as CertificationLevel] || 'bg-surface-container text-on-surface-variant';
  if (key === 'competitionLevel') return COMP_COLORS[value as CompetitionLevel] || 'bg-surface-container text-on-surface-variant';
  return 'bg-surface-container text-on-surface-variant';
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
          <label className="block font-label-caps text-label-caps text-primary mb-2 tracking-widest">{f.label}</label>
          {f.type === 'select' ? (
            <select
              value={(form[f.key] as string) || (f.options?.[0]?.value ?? '')}
              onChange={e => update({ [f.key]: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-[#E9E5DB] text-on-surface font-body-md outline-none focus:border-primary transition-colors rounded-sm"
            >
              {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : (
            <input
              type={f.type || 'text'}
              value={f.type === 'number' ? (form[f.key] as number | undefined ?? '') : (form[f.key] as string) || ''}
              onChange={e => update({ [f.key]: f.type === 'number' ? (e.target.value ? Number(e.target.value) : undefined) : e.target.value })}
              placeholder={f.placeholder}
              className="w-full px-4 py-3 bg-white border border-[#E9E5DB] text-on-surface font-body-md outline-none focus:border-primary transition-colors rounded-sm"
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
    <div className="mt-3 border-t border-[#E9E5DB] pt-3">
      <button onClick={() => setOpen(v => !v)} className="text-xs text-primary hover:text-primary font-medium flex items-center gap-1 cursor-pointer">
        {open ? '收起備審素材' : '展開備審素材'}
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && <pre className="mt-2 text-xs text-on-surface bg-surface-container-low p-3 whitespace-pre-wrap leading-relaxed rounded-sm">{draft}</pre>}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function SkillJourneyPage() {
  const [mode, setMode] = useState<'demo' | 'live'>('demo');
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

  // E1: AI Review state
  const [reviewItem, setReviewItem] = useState<SkillItem | null>(null);
  const [reviewResult, setReviewResult] = useState<{
    overallScore: number;
    dimensions: { name: string; score: number; feedback: string; suggestions: string[] }[];
    summary: string;
    improved: string;
    usedAI: boolean;
  } | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  // E2: Template library state
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CapstoneTemplate | null>(null);

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

  async function handleReview(item: SkillItem) {
    setReviewItem(item);
    setReviewResult(null);
    setReviewLoading(true);
    const dir = profile?.selectedDirections[0] || '';
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: item.description || item.title,
          category: item.category,
          directionGroup: dir,
          useAI: isPro,
        }),
      });
      const data = await res.json();
      setReviewResult(data.error ? null : data);
    } catch {
      setReviewResult(null);
    }
    setReviewLoading(false);
  }

  function handleUseTemplate(tpl: CapstoneTemplate) {
    const draft = [
      `【情境】${tpl.situation}`,
      `【任務】${tpl.task}`,
      `【行動】${tpl.action.map(a => a).join('\n')}`,
      `【結果】${tpl.result}`,
    ].join('\n');
    setForm({
      ...createEmptyItem('capstone'),
      title: tpl.title,
      description: draft,
      category: 'capstone',
      capstoneTopic: tpl.title,
      capstoneStatus: 'planning',
    });
    setFormCat('capstone');
    setShowTemplates(false);
    setSelectedTemplate(null);
    setShowForm(true);
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

  // ── Demo View ────────────────────────────────────────────────────────────

  if (mode === 'demo') {
    return (
      <div className="page-container">
        {/* Demo Banner */}
        <div className="bg-primary-fixed border border-primary/20 px-lg py-sm mb-xl flex items-center justify-between">
          <p className="text-sm text-on-primary-fixed-variant">此為範例作品集。完成 onboarding 並記錄技能後，將顯示你的個人學習歷程。</p>
          <button onClick={() => setMode('live')} className="bg-primary text-white px-6 py-2 font-label-caps text-label-caps tracking-widest hover:opacity-90 transition-all cursor-pointer shrink-0">
            查看我的作品集
          </button>
        </div>

        {/* Hero Title Section */}
        <section className="mb-xxl text-center md:text-left">
          <div className="inline-block border-l-4 border-primary pl-lg mb-md">
            <span className="font-label-caps text-primary tracking-[0.2em] uppercase block">Portfolio 2024</span>
          </div>
          <h2 className="font-h1 text-h1 text-on-surface mb-md serif-tracking">我學會的事</h2>
          <p className="font-body-lg text-on-surface-variant max-w-[42rem]">
            這是一段關於建築、邏輯與美學的探索旅程。透過每一項專題實作與技能檢定，我不僅磨練了技術，更建立了對未來空間設計的深刻見解。
          </p>
        </section>

        {/* Bento Grid Portfolio */}
        <div className="grid grid-cols-12 gap-gutter">
          {/* Featured Project: Asymmetric Large Card */}
          <div className="col-span-12 md:col-span-8 bg-surface-container-low border border-[#E9E5DB] relative group overflow-hidden">
            <div className="flex flex-col h-full">
              <div className="w-full aspect-[16/9] overflow-hidden">
                <img
                  alt="專題實作"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={DEMO_PORTFOLIO.featuredImage}
                />
              </div>
              <div className="p-xl">
                <div className="flex items-center gap-4 mb-4">
                  <span className="font-h3 text-primary">01</span>
                  <span className="h-px w-12 bg-outline-variant" />
                  <span className="font-label-caps text-on-surface-variant">專題實作</span>
                </div>
                <h3 className="font-h2 text-h2 mb-4">幾何共生：永續社區模型研究</h3>
                <p className="font-body-md text-on-surface-variant mb-6">
                  探討垂直綠化與都市高密度住宅的平衡點。運用 Rhino 建模與 3D 列印技術，完成比例 1:100 的模組化住宅原型，並獲得校內優等獎。
                </p>
                <button className="bg-primary text-white font-label-caps px-6 py-3 tracking-widest hover:opacity-90 transition-opacity cursor-pointer">
                  查看完整專題
                </button>
              </div>
            </div>
          </div>

          {/* Side Card: Skills */}
          <div className="col-span-12 md:col-span-4 flex flex-col gap-gutter">
            <div className="bg-primary-fixed p-xl flex-1 border border-[#E9E5DB]">
              <span className="font-label-caps text-on-primary-fixed-variant mb-gutter block">技能檢定</span>
              <h3 className="font-h3 text-h3 text-on-primary-fixed mb-4">AutoCAD 室內設計乙級</h3>
              <p className="font-body-md text-on-primary-fixed-variant mb-gutter">
                精通二維製圖與空間佈局，具備精確標註與圖層管理專業能力。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/50 text-primary text-xs font-bold rounded-sm">2023 取得</span>
                <span className="px-3 py-1 bg-white/50 text-primary text-xs font-bold rounded-sm">高分合格</span>
              </div>
            </div>
            <div className="bg-surface-container-highest p-xl flex-1 border border-[#E9E5DB]">
              <span className="font-label-caps text-secondary mb-gutter block">學術成就</span>
              <h3 className="font-h3 text-h3 text-on-surface mb-4">建築史專題論文</h3>
              <p className="font-body-md text-on-surface-variant">
                論現代主義在東亞建築中的轉譯：從材料到精神空間的轉變。
              </p>
            </div>
          </div>

          {/* Bento Bottom Row */}
          <div className="col-span-12 md:col-span-5 bg-surface-container border border-[#E9E5DB] p-xl">
            <div className="flex items-start gap-4 mb-gutter">
              <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
              <div>
                <h4 className="font-h3 text-h3 mb-2">職群測驗分析</h4>
                <p className="font-body-md text-on-surface-variant">
                  測驗結果顯示於「藝術」與「研究」型人格具有高度適配性，並能同時兼顧美感與工程邏輯。
                </p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-[#E9E5DB]">
              <div className="flex justify-between items-center mb-2">
                <span className="font-label-caps text-on-surface">空間設計能力</span>
                <span className="font-body-md text-primary">95%</span>
              </div>
              <div className="w-full h-1 bg-surface-container-highest">
                <div className="h-full bg-primary" style={{ width: '95%' }} />
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-7 relative overflow-hidden aspect-[16/10] md:aspect-auto min-h-[300px]">
            <img
              alt="學習歷程記錄"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              src={DEMO_PORTFOLIO.workspaceImage}
            />
            <div className="absolute bottom-0 right-0 bg-[#fbf9f7] p-md border-t-l border-l border-[#E9E5DB]">
              <p className="font-display-italic italic text-primary">&ldquo;建築是凝固的音樂，而我是譜曲的人。&rdquo;</p>
            </div>
          </div>
        </div>

        {/* Quote Section */}
        <section className="py-xxl mt-xxl border-t border-[#E9E5DB]">
          <div className="max-w-[48rem]">
            <div className="flex gap-4 mb-4">
              <span className="material-symbols-outlined text-primary text-4xl opacity-30">format_quote</span>
            </div>
            <blockquote className="font-h2 text-h2 italic text-on-surface leading-relaxed mb-gutter">
              在沐禾的學習時光，讓我學會的不只是工具的使用，而是如何透過建築的眼光，去觀察這個世界的細微變化與結構。
            </blockquote>
            <div className="flex items-center gap-4">
              <span className="w-12 h-0.5 bg-primary" />
              <cite className="font-label-caps not-italic text-on-surface-variant uppercase tracking-widest">追求卓越的建築師 · 李慕白</cite>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ── Live View ────────────────────────────────────────────────────────────

  return (
    <div className="page-container">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-md animate-pulse">
          {toast}
        </div>
      )}

      {/* Back to demo */}
      <button
        onClick={() => setMode('demo')}
        className="mb-lg text-primary hover:underline font-label-caps text-label-caps cursor-pointer"
      >
        &larr; 返回範例作品集
      </button>

      {/* Header */}
      <section className="mb-xl">
        <div className="border-l-4 border-primary pl-lg py-sm">
          <span className="font-label-caps text-primary uppercase tracking-widest block mb-xs">PORTFOLIO</span>
          <h1 className="font-h1 text-h1 text-on-surface">我學會的事</h1>
        </div>
      </section>

      {/* Coverage Overview */}
      <div className="bg-surface-container-low border border-[#E9E5DB] p-xl mb-xxl">
        <div className="flex items-center justify-between mb-lg">
          <h3 className="font-h3 text-h3 text-on-surface">你已經累積的技能</h3>
          <div className="text-right">
            <span className="font-h2 text-h2 text-primary">{pct}%</span>
            <span className="text-sm text-on-surface-variant ml-1">({covered}/{ALL_CATEGORIES.length})</span>
          </div>
        </div>
        <div className="h-3 bg-surface-container rounded-full overflow-hidden mb-lg">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: pct + '%' }} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {ALL_CATEGORIES.map(cat => {
            const count = catCounts[cat];
            const active = filterCat === cat;
            const has = count > 0;
            return (
              <button key={cat} onClick={() => setFilterCat(active ? 'ALL' : cat)}
                className={'p-3 rounded-sm border text-left transition-colors cursor-pointer ' + (active ? 'border-primary bg-primary-fixed text-primary' : has ? 'border-[#E9E5DB] bg-surface-container hover:border-primary/30' : 'border-[#E9E5DB] hover:border-[#E9E5DB]')}>
                <div className="text-lg mb-1">{SKILL_CATEGORY_ICONS[cat]}</div>
                <div className="text-xs font-medium text-on-surface mb-1.5">{SKILL_CATEGORY_LABELS[cat]}</div>
                <div className="flex items-center justify-between">
                  <span className={'text-xs font-bold ' + (has ? 'text-primary' : 'text-outline')}>{count}</span>
                  {has && <span className="text-primary text-xs">✓</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Suggestion */}
      <div className="bg-surface-container-low border border-[#E9E5DB] p-xl mb-xxl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-h3 text-h3 text-on-surface">AI 建議下一步</h3>
            <p className="text-sm text-on-surface-variant">看看你還缺什麼，下一步可以做什麼</p>
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
              }} className="bg-primary text-white px-6 py-3 font-label-caps text-label-caps tracking-widest hover:opacity-90 transition-all cursor-pointer">
                取得基本建議
              </button>
              <Link href="/pricing" className="text-xs text-on-surface-variant hover:text-primary">或升級 Pro</Link>
            </div>
          ) : (
            <button onClick={fetchSuggestion} disabled={loadingSuggestion}
              className="bg-primary text-white px-6 py-3 font-label-caps text-label-caps tracking-widest hover:opacity-90 transition-all cursor-pointer disabled:opacity-50">
              {loadingSuggestion ? '分析中...' : '取得建議'}
            </button>
          )}
        </div>

        {showSuggestion && suggestion && (
          <div className="mt-4 space-y-3">
            {suggestion.missingCategories.length > 0 && (
              <div>
                <p className="text-sm font-medium text-on-surface mb-2">尚未涵蓋的技能類別：</p>
                <div className="flex flex-wrap gap-2">
                  {suggestion.missingCategories.map(c => (
                    <span key={c} className="px-2.5 py-1 bg-warning-container text-warning rounded-sm text-xs font-medium">
                      {SKILL_CATEGORY_ICONS[c]} {SKILL_CATEGORY_LABELS[c]}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {suggestion.priority && (
              <div className="bg-primary-fixed border border-primary/30 p-4">
                <p className="text-sm font-bold text-primary mb-1">最優先補充</p>
                <p className="text-sm text-primary">{suggestion.priority}</p>
              </div>
            )}
            {suggestion.suggestions.length > 0 && (
              <div>
                <p className="text-sm font-medium text-on-surface mb-2">具體建議：</p>
                <ul className="space-y-1.5">
                  {suggestion.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-on-surface-variant flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {showSuggestion && !suggestion && !loadingSuggestion && (
          <p className="text-sm text-outline mt-4">無法取得建議，請確認已設定科別方向。</p>
        )}
      </div>

      {/* Add Button + Filter */}
      <div className="flex items-center justify-between mb-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-on-surface-variant">
            {filterCat === 'ALL' ? '全部' : SKILL_CATEGORY_LABELS[filterCat]} ({filtered.length})
          </span>
          {filterCat !== 'ALL' && (
            <button onClick={() => setFilterCat('ALL')} className="text-xs text-primary hover:underline cursor-pointer">顯示全部</button>
          )}
        </div>
        <button onClick={() => { setForm(createEmptyItem(formCat)); setShowForm(true); }}
          className="bg-primary text-white px-xl py-sm font-label-caps text-label-caps tracking-widest hover:opacity-90 transition-all cursor-pointer">
          <span className="material-symbols-outlined text-sm align-middle mr-2">add</span>
          新增技能紀錄
        </button>
      </div>

      {/* Items List */}
      {filtered.length === 0 ? (
        <div className="text-center py-xxl text-outline">
          <span className="material-symbols-outlined text-5xl text-outline mb-lg block">folder_open</span>
          <p className="font-h3 text-h3 text-on-surface-variant">還沒有技能紀錄</p>
          <p className="font-body-md mt-sm">
            點擊「新增技能紀錄」開始累積你的技能旅程
          </p>
          <div className="flex justify-center gap-3 mt-lg">
            <button onClick={() => setShowTemplates(true)} className="text-primary hover:text-primary text-sm font-medium px-2 py-1.5 cursor-pointer">參考範本庫</button>
            <Link href="/calendar" className="text-primary hover:text-primary text-sm font-medium px-2 py-1.5">從校曆匯入</Link>
            <Link href="/timeline" className="text-on-surface-variant hover:text-on-background text-sm px-2 py-1.5">查看成就時光軸</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item.id} className="bg-surface-container-low border border-[#E9E5DB] p-xl group hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{SKILL_CATEGORY_ICONS[item.category]}</span>
                  <span className="text-xs font-medium text-on-surface-variant">{SKILL_CATEGORY_LABELS[item.category]}</span>
                  <span className="text-xs text-outline">{item.date}</span>
                  {item.qualityGrade && (
                    <span className={`${BADGE_CLS} font-medium ${GRADE_COLORS[item.qualityGrade]}`}>{item.qualityGrade}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleReview(item)} className="text-xs text-tertiary hover:text-tertiary font-medium whitespace-nowrap px-2 py-1.5 min-h-[36px] cursor-pointer">
                    AI 幫忙改
                  </button>
                  <button onClick={() => handleGenerateDraft(item)} className="text-xs text-primary hover:text-primary font-medium whitespace-nowrap px-2 py-1.5 min-h-[36px] cursor-pointer">
                    一鍵轉自傳草稿
                  </button>
                  <button onClick={() => persist(items.filter(i => i.id !== item.id))} className="text-outline hover:text-error text-sm cursor-pointer">刪除</button>
                </div>
              </div>
              <h4 className="font-body-lg font-semibold text-on-surface mb-1">{item.title}</h4>
              {item.description && <p className="text-sm text-on-surface-variant leading-relaxed mb-2">{item.description}</p>}
              <BadgeList item={item} />
              {item.generatedDraft && <DraftDisplay draft={item.generatedDraft} />}
            </div>
          ))}
        </div>
      )}

      {/* Navigation hints */}
      <div className="text-center mt-8 space-x-4">
        <button onClick={() => setShowTemplates(true)} className="text-primary hover:text-primary text-sm font-medium px-2 py-1.5 cursor-pointer">專題範本庫</button>
        <Link href="/calendar" className="text-primary hover:text-primary text-sm font-medium px-2 py-1.5">從校曆匯入</Link>
        <Link href="/timeline" className="text-on-surface-variant hover:text-on-background text-sm px-2 py-1.5">成就時光軸</Link>
        <Link href="/roadmap" className="text-on-surface-variant hover:text-on-background text-sm px-2 py-1.5">回到路線圖</Link>
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-low border border-[#E9E5DB] p-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-lg">
              <h2 className="font-h3 text-h3 text-on-surface">新增技能紀錄</h2>
              <button onClick={() => setShowForm(false)} className="text-on-surface-variant hover:text-on-surface text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer" aria-label="關閉">&times;</button>
            </div>
            <div className="space-y-4">
              {/* Category selector */}
              <div>
                <label className="block font-label-caps text-label-caps text-primary mb-2 tracking-widest">技能類別</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {ALL_CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => { setFormCat(cat); setForm(createEmptyItem(cat)); }}
                      className={'px-2 py-2 rounded-sm text-xs font-medium transition-colors text-center cursor-pointer ' + (formCat === cat ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high')}>
                      {SKILL_CATEGORY_ICONS[cat]} {SKILL_CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Common fields */}
              <div>
                <label className="block font-label-caps text-label-caps text-primary mb-2 tracking-widest">標題</label>
                <input type="text" value={form.title} onChange={e => updateForm({ title: e.target.value })}
                  placeholder="例如：智慧溫室自動灌溉系統專題"
                  className="w-full px-4 py-3 bg-white border border-[#E9E5DB] text-on-surface font-body-md outline-none focus:border-primary transition-colors rounded-sm" />
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-primary mb-2 tracking-widest">描述</label>
                <textarea value={form.description} onChange={e => updateForm({ description: e.target.value })}
                  placeholder="記錄你的過程、收穫、心得..." rows={3}
                  className="w-full px-4 py-3 bg-white border border-[#E9E5DB] text-on-surface font-body-md outline-none focus:border-primary transition-colors rounded-sm resize-none" />
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-primary mb-2 tracking-widest">日期</label>
                <input type="date" value={form.date} onChange={e => updateForm({ date: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-[#E9E5DB] text-on-surface font-body-md outline-none focus:border-primary transition-colors rounded-sm" />
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-primary mb-2 tracking-widest">品質等級（選填）</label>
                <select value={form.qualityGrade || ''}
                  onChange={e => updateForm({ qualityGrade: (e.target.value || undefined) as QualityGrade | undefined })}
                  className="w-full px-4 py-3 bg-white border border-[#E9E5DB] text-on-surface font-body-md outline-none focus:border-primary transition-colors rounded-sm">
                  <option value="">不設定</option>
                  {(Object.entries(QUALITY_GRADE_LABELS) as [QualityGrade, string][]).map(([g, l]) => (
                    <option key={g} value={g}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Category-specific fields */}
              <FormFields category={formCat} form={form} update={updateForm} />

              <button onClick={handleAdd} disabled={!form.title.trim() || !form.date}
                className={form.title.trim() && form.date
                  ? 'w-full py-3 bg-primary text-white font-label-caps text-label-caps tracking-widest hover:opacity-90 transition-all cursor-pointer rounded-sm'
                  : 'w-full py-3 font-label-caps text-label-caps tracking-widest bg-surface-container-high text-outline cursor-not-allowed rounded-sm'}>
                新增技能紀錄
              </button>
            </div>
          </div>
        </div>
      )}

      {/* E1: AI Review Modal */}
      {reviewItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-low border border-[#E9E5DB] p-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-lg">
              <h2 className="font-h3 text-h3 text-on-surface">AI 幫你改</h2>
              <button onClick={() => { setReviewItem(null); setReviewResult(null); }} className="text-on-surface-variant hover:text-on-surface text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer" aria-label="關閉">&times;</button>
            </div>
            <div className="mb-3">
              <span className="text-xs text-on-surface-variant">{SKILL_CATEGORY_LABELS[reviewItem.category]}</span>
              <h3 className="font-body-lg font-semibold text-on-surface">{reviewItem.title}</h3>
              <p className="text-sm text-on-surface-variant mt-1">{reviewItem.description || '（無描述）'}</p>
            </div>
            {reviewLoading && <div className="text-center py-8 text-outline">分析中...</div>}
            {reviewResult && !reviewLoading && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold ${
                    reviewResult.overallScore >= 8 ? 'bg-primary' :
                    reviewResult.overallScore >= 6 ? 'bg-primary-fixed' :
                    reviewResult.overallScore >= 4 ? 'bg-warning-container' : 'bg-error-container'
                  }`}>
                    {reviewResult.overallScore}
                  </div>
                  <div>
                    <div className="font-bold text-on-surface">總分</div>
                    <div className="text-sm text-on-surface-variant">{reviewResult.summary}</div>
                  </div>
                </div>
                {reviewResult.dimensions.map(dim => (
                  <div key={dim.name} className="bg-surface-container rounded-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-on-surface text-sm">{dim.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        dim.score >= 8 ? 'bg-success-container text-success' :
                        dim.score >= 6 ? 'bg-primary-fixed text-primary' :
                        dim.score >= 4 ? 'bg-warning-container text-warning' : 'bg-error-container text-error'
                      }`}>{dim.score}/10</span>
                    </div>
                    <p className="text-sm text-on-surface-variant mb-2">{dim.feedback}</p>
                    {dim.suggestions.length > 0 && (
                      <ul className="space-y-1">
                        {dim.suggestions.map((s, i) => (
                          <li key={i} className="text-xs text-on-surface-variant flex items-start gap-1">
                            <span className="text-primary mt-0.5">•</span>{s}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                {reviewResult.improved && (
                  <div className="bg-primary-fixed border border-primary/30 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-body-lg font-semibold text-primary text-sm">AI 改寫建議</h4>
                      {!isPro && <span className="text-xs px-2 py-0.5 bg-primary text-white rounded-full">Pro</span>}
                    </div>
                    <pre className="text-xs text-on-surface whitespace-pre-wrap leading-relaxed">{reviewResult.improved}</pre>
                  </div>
                )}
                {!isPro && (
                  <p className="text-xs text-outline text-center">
                    升級 <Link href="/pricing" className="text-primary">Pro</Link> 讓 AI 幫你改寫成更完整的版本
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* E2: Template Library Modal */}
      {showTemplates && !selectedTemplate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-low border border-[#E9E5DB] p-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-lg">
              <h2 className="font-h3 text-h3 text-on-surface">專題實作範本庫</h2>
              <button onClick={() => setShowTemplates(false)} className="text-on-surface-variant hover:text-on-surface text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer" aria-label="關閉">&times;</button>
            </div>
            <p className="text-sm text-on-surface-variant mb-lg">參考範例，快速開始你的專題實作。點擊「使用範本」將自動填入 STAR 結構草稿。</p>
            <div className="space-y-3">
              {CAPSTONE_TEMPLATES.map(tpl => (
                <div key={tpl.id} className="border border-[#E9E5DB] p-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-body-lg font-semibold text-on-surface text-sm">{tpl.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      tpl.difficulty === '入門' ? 'bg-success-container text-success' :
                      tpl.difficulty === '進階' ? 'bg-primary-fixed text-primary' : 'bg-tertiary-fixed text-tertiary'
                    }`}>{tpl.difficulty}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-2">{tpl.description}</p>
                  <div className="flex items-center gap-3 text-xs text-outline">
                    <span>{tpl.group}</span>
                    <span>{tpl.duration}</span>
                    <span>{tpl.teamSize}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setSelectedTemplate(tpl)} className="text-xs text-primary hover:text-primary font-medium px-2 py-1.5 min-h-[36px] cursor-pointer">查看詳情</button>
                    <button onClick={() => handleUseTemplate(tpl)} className="text-xs text-tertiary hover:text-tertiary font-medium px-2 py-1.5 min-h-[36px] cursor-pointer">使用範本</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-low border border-[#E9E5DB] p-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-lg">
              <h2 className="font-h3 text-h3 text-on-surface">{selectedTemplate.title}</h2>
              <button onClick={() => setSelectedTemplate(null)} className="text-on-surface-variant hover:text-on-surface text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer" aria-label="關閉">&times;</button>
            </div>
            <div className="flex flex-wrap gap-2 mb-lg">
              <span className="text-xs px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-full">{selectedTemplate.group}</span>
              <span className="text-xs px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-full">{selectedTemplate.duration}</span>
              <span className="text-xs px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-full">{selectedTemplate.teamSize}</span>
            </div>
            <p className="text-sm text-on-surface-variant mb-lg">{selectedTemplate.description}</p>
            <div className="space-y-3 mb-lg">
              <div className="bg-primary-fixed p-3">
                <h4 className="text-xs font-bold text-primary mb-1">S — 情境</h4>
                <p className="text-sm text-on-surface">{selectedTemplate.situation}</p>
              </div>
              <div className="bg-success-container p-3">
                <h4 className="text-xs font-bold text-success mb-1">T — 任務</h4>
                <p className="text-sm text-on-surface">{selectedTemplate.task}</p>
              </div>
              <div className="bg-warning-container p-3">
                <h4 className="text-xs font-bold text-warning mb-1">A — 行動</h4>
                <ul className="space-y-1">
                  {selectedTemplate.action.map((a, i) => (
                    <li key={i} className="text-sm text-on-surface flex items-start gap-1">
                      <span className="text-warning mt-0.5">•</span>{a}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-tertiary-fixed p-3">
                <h4 className="text-xs font-bold text-tertiary mb-1">R — 結果</h4>
                <p className="text-sm text-on-surface">{selectedTemplate.result}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-lg">
              {selectedTemplate.skills.map(s => (
                <span key={s} className="text-xs px-2 py-0.5 bg-primary-fixed text-primary rounded-full">{s}</span>
              ))}
            </div>
            <button onClick={() => handleUseTemplate(selectedTemplate)}
              className="w-full py-3 bg-primary text-white font-label-caps text-label-caps tracking-widest hover:opacity-90 transition-all cursor-pointer rounded-sm">
              使用此範本
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
