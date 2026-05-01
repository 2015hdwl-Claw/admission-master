'use client';

import { useState, useEffect, useMemo } from 'react';
import { loadFromStorage, saveToStorage, generateId } from '@/lib/storage';
import type { VocationalGroup, UnifiedExamScoreInput, OnboardingProfile } from '@/types';
import { VOCATIONAL_GROUP_LABELS } from '@/data/vocational-categories';
import { UNIFIED_EXAM_SUBJECTS, UNIFIED_EXAM_SCORE_RANGES } from '@/data/admission';
import Link from 'next/link';

const STORAGE_KEY = 'unified-exam-records';

const SUBJECT_COLORS: Record<string, string> = {
  chinese: '#6366f1',
  english: '#f59e0b',
  math: '#10b981',
  professional1: '#ef4444',
  professional2: '#3b82f6',
};

interface UnifiedExamPathwayMatch {
  name: string;
  slug: string;
  minScore: number;
  maxScore: number;
  status: 'safe' | 'reachable' | 'stretch' | 'unlikely';
}

const VOCATIONAL_PATHWAY_RANGES: UnifiedExamPathwayMatch[] = [
  { name: '四技二專甄選（頂標科系）', slug: 'selection-top', minScore: 350, maxScore: 400, status: 'safe' },
  { name: '四技二專甄選（前標科系）', slug: 'selection-high', minScore: 300, maxScore: 350, status: 'safe' },
  { name: '四技二專甄選（均標科系）', slug: 'selection-mid', minScore: 250, maxScore: 300, status: 'reachable' },
  { name: '科技校院繁星', slug: 'tech-star', minScore: 280, maxScore: 350, status: 'safe' },
  { name: '聯合登記分發（國立）', slug: 'dist-national', minScore: 200, maxScore: 300, status: 'reachable' },
  { name: '聯合登記分發（私立名校）', slug: 'dist-private-top', minScore: 150, maxScore: 250, status: 'stretch' },
  { name: '聯合登記分發（一般私立）', slug: 'dist-private', minScore: 100, maxScore: 200, status: 'unlikely' },
];

interface UnifiedExamRecord {
  id: string;
  label: string;
  date: string;
  group: VocationalGroup;
  chinese: number;
  english: number;
  math: number;
  professional1: number;
  professional2: number;
}

interface LocalAnalysisResult {
  scores: UnifiedExamScoreInput;
  total: number;
  average: number;
  percentile: number;
  recommendedPathways: Array<{ name: string; slug: string; matchScore: number; description: string }>;
  summary: string;
}

const STRATEGY_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJ2KRYxeOaors6M-0Dl8KU4Z5_HDds8nqy2ODg4qwCWLUnrKsw1ZY6O47WA8gdllBElYOvD8vWiY6jKEljahUZbKFgw4A68ete49pnMqkDQTqEnAHNmcxqQ2r9j1D79kfo7JVJEi3Qx1Nmrl5h_4MGwXBSDl79Ll71vpV12bQWy5UW2bYA3jZSfO6X0nc26rx7btURWti9avAGlacp-tc0KdG5Dxu65njfXL8n9zmOWb7GDo5n8Zm3OXWFk-sNZP9KEPEAOPW-MRSV';

function getGroupSubjectKeys(group: VocationalGroup): Array<{ key: string; label: string }> {
  const subjects = UNIFIED_EXAM_SUBJECTS[group];
  if (!subjects) return [];
  return [
    { key: 'chinese', label: subjects.common[0] },
    { key: 'english', label: subjects.common[1] },
    { key: 'math', label: subjects.common[2] },
    { key: 'professional1', label: subjects.professional[0] },
    { key: 'professional2', label: subjects.professional[1] },
  ];
}

function estimatePercentile(total: number, group: VocationalGroup): number {
  const ranges = UNIFIED_EXAM_SCORE_RANGES[group];
  if (!ranges) return 50;
  const maxTotal = 500;
  if (total >= ranges.top) return 97;
  if (total >= (ranges.top + ranges.high) / 2) return 93;
  if (total >= ranges.high) return 85;
  if (total >= (ranges.high + ranges.mid) / 2) return 72;
  if (total >= ranges.mid) return 55;
  if (total >= (ranges.mid + ranges.base) / 2) return 38;
  if (total >= ranges.base) return 22;
  return Math.max(5, Math.round((total / maxTotal) * 15));
}

function analyzeUnifiedExam(input: UnifiedExamScoreInput): LocalAnalysisResult {
  const { group, chinese, english, math, professional1, professional2 } = input;
  const total = chinese + english + math + professional1 + professional2;
  const average = total / 5;
  const percentile = estimatePercentile(total, group);
  const ranges = UNIFIED_EXAM_SCORE_RANGES[group];
  const subjects = UNIFIED_EXAM_SUBJECTS[group];

  let level: 'top' | 'high' | 'mid' | 'base' = 'base';
  if (ranges) {
    if (total >= ranges.top) level = 'top';
    else if (total >= ranges.high) level = 'high';
    else if (total >= ranges.mid) level = 'mid';
  }

  const pathwayDescriptions: Record<string, string> = {
    'selection-top': `頂標科系，${subjects ? subjects.professional[0] : '專業科目'}需 ${ranges ? ranges.top : 350}+`,
    'selection-high': `前標科系，適合成績優秀的學生`,
    'selection-mid': `均標科系，多數科技大學都可嘗試`,
    'tech-star': `由高中推薦，成績需達前標水準`,
    'dist-national': `國立科大分發，需穩定成績`,
    'dist-private-top': `私立名校分發，如虎科大、正修科大`,
    'dist-private': `一般私立科大，錄取機率高`,
  };

  const recommendedPathways = VOCATIONAL_PATHWAY_RANGES.map(pw => {
    let matchScore = 20;
    if (total >= pw.maxScore) matchScore = 95;
    else if (total >= (pw.minScore + pw.maxScore) / 2) matchScore = 75;
    else if (total >= pw.minScore) matchScore = 50;
    else if (total >= pw.minScore - 30) matchScore = 30;
    return {
      name: pw.name,
      slug: pw.slug,
      matchScore,
      description: pathwayDescriptions[pw.slug] || '',
    };
  }).sort((a, b) => b.matchScore - a.matchScore);

  const scoreEntries = [
    { label: subjects?.common[0] || '國文', score: chinese },
    { label: subjects?.common[1] || '英文', score: english },
    { label: subjects?.common[2] || '數學', score: math },
    { label: subjects?.professional[0] || '專一', score: professional1 },
    { label: subjects?.professional[1] || '專二', score: professional2 },
  ];
  const strengths = scoreEntries.filter(e => e.score >= 85).map(e => e.label);
  const weaknesses = scoreEntries.filter(e => e.score < 50).map(e => e.label);

  const levelMessages: Record<string, string> = {
    top: '你的統測成績非常優異！頂尖科技大學的熱門科系都在你的選擇範圍內。',
    high: '你的成績優秀，國立科技大學大多數科系都很有機會。',
    mid: '你的成績穩定，一般科技大學的主要科系都有不錯的機會。',
    base: '你的成績還有進步空間，專注提升弱科會讓你有更多選擇。',
  };

  const strengthStr = strengths.length > 0
    ? `你的強項是${strengths.join('、')}。`
    : '各科表現均衡。';
  const weaknessStr = weaknesses.length > 0
    ? `建議加強${weaknesses.join('、')}。`
    : '';

  const topPathway = recommendedPathways[0];
  const summary = `${levelMessages[level]} ${strengthStr}${weaknessStr}根據你的分數，最推薦走「${topPathway.name}」管道。繼續加油，升學路上一路順利！`;

  return { scores: input, total, average, percentile, recommendedPathways, summary };
}

export default function AnalyzePage() {
  const [mode, setMode] = useState<'demo' | 'input' | 'result'>('demo');
  const [selectedGroup, setSelectedGroup] = useState<VocationalGroup>('資訊群');
  const [analysis, setAnalysis] = useState<LocalAnalysisResult | null>(null);
  const [records, setRecords] = useState<UnifiedExamRecord[]>([]);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [recordLabel, setRecordLabel] = useState('');
  const [recordDate, setRecordDate] = useState('');
  const [recordScores, setRecordScores] = useState({
    chinese: 0, english: 0, math: 0, professional1: 0, professional2: 0,
  });
  const [isPro, setIsPro] = useState(false);
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);

  useEffect(() => {
    const stored = loadFromStorage<UnifiedExamRecord[]>(STORAGE_KEY, []);
    setRecords(stored);
    const sub = loadFromStorage<{ plan: string; expiresAt: string | null }>('user-subscription', { plan: 'free', expiresAt: null });
    setIsPro(sub.plan !== 'free');
    const p = loadFromStorage<OnboardingProfile | null>('onboarding-profile', null);
    setProfile(p);
  }, []);

  function handleSubmit(scores: UnifiedExamScoreInput) {
    const result = analyzeUnifiedExam(scores);
    setAnalysis(result);
    setMode('result');
  }

  function handleAddRecord() {
    if (!recordLabel.trim() || !recordDate) return;
    const newRecord: UnifiedExamRecord = {
      id: generateId(),
      label: recordLabel.trim(),
      date: recordDate,
      group: selectedGroup,
      ...recordScores,
    };
    const updated = [...records, newRecord].sort((a, b) => a.date.localeCompare(b.date));
    setRecords(updated);
    saveToStorage(STORAGE_KEY, updated);
    setRecordLabel('');
    setRecordDate('');
    setRecordScores({ chinese: 0, english: 0, math: 0, professional1: 0, professional2: 0 });
    setShowRecordForm(false);
  }

  function handleDeleteRecord(id: string) {
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    saveToStorage(STORAGE_KEY, updated);
  }

  const filteredRecords = useMemo(
    () => records.filter(r => r.group === selectedGroup),
    [records, selectedGroup],
  );

  const groupOptions = Object.entries(VOCATIONAL_GROUP_LABELS) as [VocationalGroup, string][];

  if (mode === 'demo') {
    return (
      <div className="page-container">
        {/* Demo Banner */}
        <div className="bg-primary-fixed border border-primary/20 px-lg py-sm mb-xl flex items-center justify-between">
          <p className="text-sm text-on-primary-fixed-variant">此為範例分析。點擊「開始分析」輸入你的統測成績，獲取專屬報告。</p>
          <div className="flex gap-3">
            <button onClick={() => setMode('input')} className="bg-primary text-white px-6 py-2 font-label-caps text-label-caps tracking-widest hover:opacity-90 transition-all cursor-pointer">
              開始分析
            </button>
          </div>
        </div>

        {/* Header Section */}
        <header className="mb-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-h3 text-h3 text-primary">03</span>
            <div className="h-[1px] w-12 bg-outline-variant" />
          </div>
          <h1 className="font-h1 text-h1 text-on-surface mb-4">統測分析</h1>
          <p className="font-body-lg text-on-surface-variant max-w-[42rem]">
            基於學術表現的精密建模，我們為您梳理出核心優勢與關鍵突破點，以建築學般的精確度建構您的升學藍圖。
          </p>
        </header>

        {/* Bento Grid Analysis Sections */}
        <section className="grid grid-cols-12 gap-gutter mb-xxl">
          {/* Summary Card (8 cols) */}
          <div className="col-span-12 lg:col-span-8 bg-surface-container-low border border-[#E9E5DB] p-xl flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-h3 text-h3 text-primary mb-md">學科綜合趨勢</h3>
              <div className="h-64 flex items-end justify-between gap-4 mt-8">
                <div className="flex-1 h-full relative border-l border-b border-outline-variant/30">
                  <div className="absolute inset-0 flex items-center justify-around opacity-20">
                    <div className="w-[1px] h-full bg-outline" />
                    <div className="w-[1px] h-full bg-outline" />
                    <div className="w-[1px] h-full bg-outline" />
                  </div>
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 200">
                    <path d="M0,180 Q100,160 200,80 T400,20" fill="none" stroke="#7D8B7E" strokeWidth="2" />
                    <circle cx="0" cy="180" fill="#7D8B7E" r="4" />
                    <circle cx="200" cy="80" fill="#7D8B7E" r="4" />
                    <circle cx="400" cy="20" fill="#7D8B7E" r="4" />
                  </svg>
                </div>
              </div>
              <div className="flex justify-between mt-gutter text-label-caps font-label-caps text-on-surface-variant">
                <span>基礎測驗</span>
                <span>期中評量</span>
                <span>目前狀態</span>
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary-fixed rounded-full blur-[80px] opacity-20" />
          </div>

          {/* Subject Breakdown (4 cols) */}
          <div className="col-span-12 lg:col-span-4 bg-surface-container border border-[#E9E5DB] p-xl flex flex-col">
            <h3 className="font-h3 text-h3 text-primary mb-md">學群權重</h3>
            <div className="space-y-6 flex-grow">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-label-caps text-label-caps text-on-surface">專業科目 (一)</span>
                  <span className="font-label-caps text-label-caps text-primary">88%</span>
                </div>
                <div className="h-1 bg-surface-container-high w-full overflow-hidden">
                  <div className="h-full bg-primary w-[88%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-label-caps text-label-caps text-on-surface">專業科目 (二)</span>
                  <span className="font-label-caps text-label-caps text-primary">92%</span>
                </div>
                <div className="h-1 bg-surface-container-high w-full overflow-hidden">
                  <div className="h-full bg-primary w-[92%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-label-caps text-label-caps text-on-surface">共同科目</span>
                  <span className="font-label-caps text-label-caps text-primary">74%</span>
                </div>
                <div className="h-1 bg-surface-container-high w-full overflow-hidden">
                  <div className="h-full bg-primary w-[74%]" />
                </div>
              </div>
            </div>
            <div className="mt-xl pt-md border-t border-outline-variant/30">
              <p className="text-label-caps font-label-caps text-on-secondary-container">強項建議：建築設計原理</p>
            </div>
          </div>

          {/* Detailed Insight (5 cols) */}
          <div className="col-span-12 lg:col-span-5 bg-tertiary-container/5 border border-tertiary-container/10 p-xl relative overflow-hidden">
            <h3 className="font-h3 text-h3 text-tertiary mb-md">弱點結構</h3>
            <p className="font-body-md text-on-surface-variant mb-xl leading-relaxed">
              在工程力學與微積分交集領域呈現細微波動。這些波動顯示了在複雜模型推演時的邏輯連貫性需要更多結構化的練習。
            </p>
            <div className="flex items-center gap-4 p-md bg-white/50 border border-white">
              <span className="material-symbols-outlined text-tertiary">error</span>
              <div>
                <span className="block font-label-caps text-label-caps font-bold text-tertiary">關鍵弱點</span>
                <span className="text-label-caps font-label-caps text-on-surface">結構靜力學穩定性分析</span>
              </div>
            </div>
          </div>

          {/* Strategy Report Preview (7 cols) */}
          <div className="col-span-12 lg:col-span-7 border border-[#E9E5DB] p-0 flex overflow-hidden group">
            <div className="w-1/2 p-xl flex flex-col justify-center">
              <h3 className="font-h3 text-h3 text-primary mb-md">策略指導</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-sm mt-1">check_circle</span>
                  <span className="font-body-md text-on-surface-variant">每日 20 分鐘專注於弱項題庫之基礎概念複習。</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-sm mt-1">check_circle</span>
                  <span className="font-body-md text-on-surface-variant">導入「空間思考」筆記法，將力學公式圖像化。</span>
                </li>
              </ul>
              <Link href="/strategy" className="mt-xl self-start px-8 py-3 bg-primary text-white font-label-caps text-label-caps tracking-widest hover:opacity-90 transition-all duration-300">
                下載完整策略報告
              </Link>
            </div>
            <div className="w-1/2 h-full relative overflow-hidden hidden sm:block">
              <img
                alt="建築製圖板"
                className="w-full h-full object-cover grayscale opacity-60 group-hover:scale-105 transition-transform duration-700"
                src={STRATEGY_IMAGE}
              />
            </div>
          </div>
        </section>

        {/* Academic Mentorship Quote */}
        <section className="mt-xxl border-l-4 border-primary pl-xl max-w-[48rem]">
          <blockquote className="italic font-display-italic text-h2 text-primary-container leading-snug">
            &ldquo;真正的建築不僅是堆砌磚石，而是理解每一份重量的去向。學習亦然，分析是為了更好的結構。&rdquo;
          </blockquote>
          <cite className="block mt-md font-label-caps text-label-caps text-on-surface-variant">&mdash; 學術導師 艾德華．林</cite>
        </section>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="text-center mb-10">
        <h1 className="font-h1 text-h1 text-on-surface mb-2">統測分數分析</h1>
        <p className="font-body-lg text-on-surface-variant">輸入你的統測成績，看看最適合你的升學管道和科技大學</p>
      </div>

      <button
        onClick={() => setMode('demo')}
        className="mb-8 text-primary hover:underline font-label-caps text-label-caps cursor-pointer"
      >
        &larr; 返回範例分析
      </button>

      {/* Group Selector */}
      <div className="max-w-[42rem] mx-auto mb-8">
        <label className="block font-label-caps text-label-caps text-primary mb-2 tracking-widest">選擇職群</label>
        <select
          value={selectedGroup}
          onChange={e => {
            const newGroup = e.target.value as VocationalGroup;
            setSelectedGroup(newGroup);
            setAnalysis(null);
          }}
          className="w-full px-4 py-3 bg-surface-container-low border border-[#E9E5DB] text-on-surface font-body-md outline-none focus:border-primary transition-colors"
        >
          {groupOptions.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {!analysis ? (
        <ScoreInputForm group={selectedGroup} onSubmit={handleSubmit} />
      ) : (
        <div className="space-y-8">
          <AnalysisResultDisplay
            analysis={analysis}
            group={selectedGroup}
          />

          {/* Pathway Match */}
          {filteredRecords.length > 0 && (
            <PathwayMatchSection filteredRecords={filteredRecords} selectedGroup={selectedGroup} />
          )}

          <div className="text-center">
            <button
              onClick={() => setAnalysis(null)}
              className="text-on-surface-variant hover:text-on-background text-sm underline cursor-pointer"
            >
              重新輸入成績
            </button>
          </div>
        </div>
      )}

      {/* Trend Section */}
      {isPro && filteredRecords.length > 0 && (
        <div className="mt-xxl">
          <h2 className="font-h2 text-h2 text-on-surface mb-lg">成績趨勢追蹤</h2>
          <TrendDisplay group={selectedGroup} records={filteredRecords} />
          <div className="flex items-center justify-between mt-lg">
            <p className="text-sm text-on-surface-variant">已記錄 {filteredRecords.length} 次成績</p>
            <button
              onClick={() => setShowRecordForm(true)}
              className="bg-primary text-white px-6 py-3 font-label-caps text-label-caps tracking-widest hover:opacity-90 transition-all cursor-pointer"
            >
              新增成績
            </button>
          </div>
        </div>
      )}

      {!isPro && (
        <div className="mt-xxl bg-surface-container-low border border-[#E9E5DB] p-xl text-center">
          <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">trending_up</span>
          </div>
          <h3 className="font-h3 text-h3 text-on-surface mb-2">Pro 專屬功能</h3>
          <p className="text-on-surface-variant mb-6 font-body-md">
            追蹤你的成績趨勢，看見進步軌跡。輸入多次考試成績，視覺化你的成長曲線。
          </p>
          <Link href="/pricing" className="bg-primary text-white px-8 py-3 font-label-caps text-label-caps tracking-widest hover:opacity-90 transition-all cursor-pointer inline-block">
            升級 Pro 解鎖
          </Link>
        </div>
      )}

      {/* Add Record Modal */}
      {showRecordForm && (
        <AddRecordModal
          group={selectedGroup}
          recordLabel={recordLabel}
          setRecordLabel={setRecordLabel}
          recordDate={recordDate}
          setRecordDate={setRecordDate}
          recordScores={recordScores}
          setRecordScores={setRecordScores}
          onAdd={handleAddRecord}
          onClose={() => setShowRecordForm(false)}
        />
      )}
    </div>
  );
}

// --- Sub-components ---

function ScoreInputForm({ group, onSubmit }: { group: VocationalGroup; onSubmit: (s: UnifiedExamScoreInput) => void }) {
  const [scores, setScores] = useState<UnifiedExamScoreInput>({
    chinese: 0, english: 0, math: 0, professional1: 0, professional2: 0, group,
  });

  const subjects = getGroupSubjectKeys(group);

  function clamp(v: number) {
    return Math.max(0, Math.min(100, Math.round(v)));
  }

  function updateScore(key: keyof UnifiedExamScoreInput, value: number) {
    setScores(prev => ({ ...prev, [key]: clamp(value) }));
  }

  const total = scores.chinese + scores.english + scores.math + scores.professional1 + scores.professional2;

  return (
    <div className="bg-surface-container-low border border-[#E9E5DB] p-xl max-w-[42rem] mx-auto">
      <h2 className="font-h3 text-h3 text-on-surface mb-lg">輸入統測成績</h2>
      <div className="space-y-4 mb-lg">
        {subjects.map(s => (
          <div key={s.key} className="flex items-center gap-4">
            <label className="w-28 text-sm font-medium text-on-background text-right">{s.label}</label>
            <input
              type="range"
              min={0}
              max={100}
              value={scores[s.key as keyof UnifiedExamScoreInput] as number}
              onChange={e => updateScore(s.key as keyof UnifiedExamScoreInput, parseInt(e.target.value))}
              className="flex-1 h-2 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-[#7D8B7E]"
            />
            <input
              type="number"
              min={0}
              max={100}
              value={scores[s.key as keyof UnifiedExamScoreInput] as number}
              onChange={e => updateScore(s.key as keyof UnifiedExamScoreInput, parseInt(e.target.value) || 0)}
              className="w-20 text-center border border-[#E9E5DB] rounded-md py-2 text-sm font-bold bg-white text-on-surface outline-none focus:border-primary"
            />
          </div>
        ))}
      </div>
      <div className="text-center">
        <p className="text-sm text-on-surface-variant mb-4">總分：{total} / 500</p>
        <button
          onClick={() => onSubmit(scores)}
          className="bg-primary text-white px-8 py-3 font-label-caps text-label-caps tracking-widest hover:opacity-90 transition-all cursor-pointer"
        >
          開始分析
        </button>
      </div>
    </div>
  );
}

function AnalysisResultDisplay({
  analysis,
  group,
}: {
  analysis: LocalAnalysisResult;
  group: VocationalGroup;
}) {
  const subjects = getGroupSubjectKeys(group);
  const scoreEntries = subjects.map(s => ({
    key: s.key,
    label: s.label,
    value: analysis.scores[s.key as keyof UnifiedExamScoreInput] as number,
  }));

  return (
    <div className="space-y-lg">
      <div className="bg-surface-container-low border border-[#E9E5DB] p-xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-lg">
          <div className="text-center p-4 bg-primary-fixed rounded-md">
            <p className="font-h3 text-h3 text-primary">{analysis.total}</p>
            <p className="text-sm text-on-surface-variant">總分</p>
          </div>
          <div className="text-center p-4 bg-success-container rounded-md">
            <p className="font-h3 text-h3 text-success">{analysis.average.toFixed(1)}</p>
            <p className="text-sm text-on-surface-variant">平均分數</p>
          </div>
          <div className="text-center p-4 bg-warning-container rounded-md">
            <p className="font-h3 text-h3 text-warning">{analysis.percentile.toFixed(1)}%</p>
            <p className="text-sm text-on-surface-variant">百分位</p>
          </div>
          <div className="text-center p-4 bg-tertiary-fixed rounded-md">
            <p className="text-lg font-bold text-tertiary">{analysis.recommendedPathways[0]?.name}</p>
            <p className="text-sm text-on-surface-variant">最推薦管道</p>
          </div>
        </div>

        <div className="mb-lg">
          <h3 className="font-h3 text-h3 text-on-surface mb-md">各科成績</h3>
          <div className="space-y-4">
            {scoreEntries.map(entry => (
              <div key={entry.key} className="flex items-center gap-4">
                <span className="w-28 text-sm text-on-surface-variant text-right font-body-md">{entry.label}</span>
                <div className="flex-1 h-1 bg-surface-container-high w-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${(entry.value / 100) * 100}%` }}
                  />
                </div>
                <span className="w-10 text-right text-sm font-bold text-on-surface">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="font-body-md text-on-surface-variant leading-relaxed">{analysis.summary}</p>
      </div>

      <div className="bg-surface-container-low border border-[#E9E5DB] p-xl">
        <h3 className="font-h3 text-h3 text-on-surface mb-lg">推薦升學管道</h3>
        <div className="space-y-md">
          {analysis.recommendedPathways.slice(0, 5).map(pw => (
            <div key={pw.slug} className="flex items-center justify-between p-md rounded-md border border-[#E9E5DB]">
              <div>
                <p className="font-medium text-on-surface text-sm">{pw.name}</p>
                <p className="text-xs text-on-surface-variant">{pw.description}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">{pw.matchScore}%</p>
                <p className="text-xs text-on-surface-variant">匹配度</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PathwayMatchSection({ filteredRecords, selectedGroup }: { filteredRecords: UnifiedExamRecord[]; selectedGroup: VocationalGroup }) {
  const latestRecord = filteredRecords[filteredRecords.length - 1];
  const total = latestRecord.chinese + latestRecord.english + latestRecord.math + latestRecord.professional1 + latestRecord.professional2;

  const pathwayMatches = VOCATIONAL_PATHWAY_RANGES.map(pw => {
    let status: UnifiedExamPathwayMatch['status'] = 'unlikely';
    if (total >= pw.maxScore) status = 'safe';
    else if (total >= pw.minScore + 30) status = 'reachable';
    else if (total >= pw.minScore) status = 'stretch';
    return { ...pw, status };
  });

  return (
    <div className="bg-surface-container-low border border-[#E9E5DB] p-xl">
      <h3 className="font-h3 text-h3 text-on-surface mb-lg">模擬管道匹配</h3>
      <p className="text-sm text-on-surface-variant mb-lg">根據最近一次成績（總分 {total}）</p>
      <div className="space-y-md">
        {pathwayMatches.map(pw => (
          <div key={pw.slug} className="flex items-center justify-between p-md rounded-md border border-[#E9E5DB]">
            <span className="text-sm font-medium text-on-surface">{pw.name}</span>
            <span className={
              'px-3 py-1 rounded-full text-xs font-bold ' +
              (pw.status === 'safe' ? 'bg-success-container text-success' :
               pw.status === 'reachable' ? 'bg-primary-fixed text-primary' :
               pw.status === 'stretch' ? 'bg-warning-container text-warning' :
               'bg-surface-container text-on-surface-variant')
            }>
              {pw.status === 'safe' ? '可衝刺' : pw.status === 'reachable' ? '有機會' : pw.status === 'stretch' ? '需要努力' : '較困難'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TrendSubject {
  subject: string;
  label: string;
  color: string;
  values: Array<{ x: string; y: number; label: string }>;
  avg: number;
  trend: number;
}

function TrendDisplay({ group, records }: { group: VocationalGroup; records: UnifiedExamRecord[] }) {
  const subjectKeys = ['chinese', 'english', 'math', 'professional1', 'professional2'] as const;
  const subjectLabels = getGroupSubjectKeys(group);

  const trendData: TrendSubject[] = subjectKeys.map((subject, idx) => ({
    subject,
    label: subjectLabels[idx]?.label || subject,
    color: SUBJECT_COLORS[subject] || '#6b7280',
    values: records.map(r => ({
      x: r.date,
      y: r[subject],
      label: r.label,
    })),
    avg: Math.round(records.reduce((s, r) => s + r[subject], 0) / records.length),
    trend: records.length >= 2
      ? records[records.length - 1][subject] - records[0][subject]
      : 0,
  }));

  return (
    <div className="bg-surface-container-low border border-[#E9E5DB] p-xl">
      <h3 className="font-h3 text-h3 text-on-surface mb-lg">成績趨勢</h3>
      <div className="space-y-lg">
        {trendData.map(subject => (
          <div key={subject.subject}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-on-surface">{subject.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-on-surface-variant">均 {subject.avg}</span>
                <span className={'text-xs font-bold px-2 py-0.5 rounded-full ' + (subject.trend > 0 ? 'bg-success-container text-success' : subject.trend < 0 ? 'bg-error-container text-error' : 'bg-surface-container text-on-surface-variant')}>
                  {subject.trend > 0 ? '+' : ''}{subject.trend}
                </span>
              </div>
            </div>
            <div className="flex items-end gap-1 h-8">
              {subject.values.map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm transition-all"
                  style={{ height: `${(v.y / 100) * 100}%`, backgroundColor: subject.color, opacity: 0.4 + (i / subject.values.length) * 0.6 }}
                  title={`${v.label}: ${v.y}`}
                />
              ))}
            </div>
            <div className="flex gap-1 mt-0.5">
              {subject.values.map((v, i) => (
                <span key={i} className="flex-1 text-center text-[10px] text-on-surface-variant truncate">
                  {i === 0 || i === subject.values.length - 1 ? v.label : ''}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddRecordModal({
  group,
  recordLabel,
  setRecordLabel,
  recordDate,
  setRecordDate,
  recordScores,
  setRecordScores,
  onAdd,
  onClose,
}: {
  group: VocationalGroup;
  recordLabel: string;
  setRecordLabel: (v: string) => void;
  recordDate: string;
  setRecordDate: (v: string) => void;
  recordScores: { chinese: number; english: number; math: number; professional1: number; professional2: number };
  setRecordScores: (v: { chinese: number; english: number; math: number; professional1: number; professional2: number }) => void;
  onAdd: () => void;
  onClose: () => void;
}) {
  const subjects = getGroupSubjectKeys(group);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-low border border-[#E9E5DB] max-w-md w-full p-xl">
        <div className="flex items-center justify-between mb-lg">
          <h2 className="font-h3 text-h3 text-on-surface">新增成績</h2>
          <button onClick={onClose} className="text-outline hover:text-on-surface-variant text-2xl cursor-pointer" aria-label="關閉">&times;</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block font-label-caps text-label-caps text-primary mb-2 tracking-widest">考試名稱</label>
            <input
              type="text"
              value={recordLabel}
              onChange={e => setRecordLabel(e.target.value)}
              placeholder="例如：第一次模擬考"
              className="w-full px-4 py-3 bg-white border border-[#E9E5DB] text-on-surface font-body-md outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block font-label-caps text-label-caps text-primary mb-2 tracking-widest">日期</label>
            <input
              type="date"
              value={recordDate}
              onChange={e => setRecordDate(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#E9E5DB] text-on-surface font-body-md outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant mb-2">職群：{VOCATIONAL_GROUP_LABELS[group]}</p>
          </div>
          {subjects.map(s => (
            <div key={s.key}>
              <label className="block font-label-caps text-label-caps text-primary mb-2 tracking-widest">{s.label}</label>
              <input
                type="number"
                min={0}
                max={100}
                value={recordScores[s.key as keyof typeof recordScores] ?? 0}
                onChange={e => setRecordScores({
                  ...recordScores,
                  [s.key]: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)),
                })}
                className="w-full px-4 py-3 bg-white border border-[#E9E5DB] text-on-surface font-body-md outline-none focus:border-primary transition-colors"
              />
            </div>
          ))}
          <button
            onClick={onAdd}
            disabled={!recordLabel.trim() || !recordDate}
            className={'w-full py-3 rounded-md font-label-caps text-label-caps tracking-widest transition-all cursor-pointer ' + (recordLabel.trim() && recordDate ? 'bg-primary text-white hover:opacity-90' : 'bg-surface-container-high text-outline cursor-not-allowed')}
          >
            新增成績
          </button>
        </div>
      </div>
    </div>
  );
}
