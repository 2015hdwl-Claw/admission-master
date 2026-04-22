'use client';

import { useState, useEffect, useMemo } from 'react';
import { loadFromStorage, saveToStorage, generateId } from '@/lib/storage';
import type { VocationalGroup, UnifiedExamScoreInput, OnboardingProfile } from '@/types';
import { VOCATIONAL_GROUP_LABELS } from '@/data/vocational-categories';
import { UNIFIED_EXAM_SUBJECTS, UNIFIED_EXAM_SCORE_RANGES } from '@/data/admission';

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

  // Determine level
  let level: 'top' | 'high' | 'mid' | 'base' = 'base';
  if (ranges) {
    if (total >= ranges.top) level = 'top';
    else if (total >= ranges.high) level = 'high';
    else if (total >= ranges.mid) level = 'mid';
  }

  // Pathway matching
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

  // Strengths
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
  const [selectedGroup, setSelectedGroup] = useState<VocationalGroup>('資訊群');
  const [analysis, setAnalysis] = useState<LocalAnalysisResult | null>(null);
  const [showShareCard, setShowShareCard] = useState(false);
  const [tab, setTab] = useState<'analyze' | 'trends'>('analyze');

  // Score trend state
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

  interface TrendSubject {
    subject: string;
    label: string;
    color: string;
    values: Array<{ x: string; y: number; label: string }>;
    avg: number;
    trend: number;
  }

  const filteredRecords = useMemo(
    () => records.filter(r => r.group === selectedGroup),
    [records, selectedGroup],
  );

  const trendData = useMemo((): TrendSubject[] | null => {
    if (filteredRecords.length < 2) return null;
    const subjectKeys = ['chinese', 'english', 'math', 'professional1', 'professional2'] as const;
    const subjectLabels = getGroupSubjectKeys(selectedGroup);
    return subjectKeys.map((subject, idx) => ({
      subject,
      label: subjectLabels[idx]?.label || subject,
      color: SUBJECT_COLORS[subject] || '#6b7280',
      values: filteredRecords.map(r => ({
        x: r.date,
        y: r[subject],
        label: r.label,
      })),
      avg: Math.round(filteredRecords.reduce((s, r) => s + r[subject], 0) / filteredRecords.length),
      trend: filteredRecords.length >= 2
        ? filteredRecords[filteredRecords.length - 1][subject] - filteredRecords[0][subject]
        : 0,
    }));
  }, [filteredRecords, selectedGroup]);

  const pathwayMatches = useMemo(() => {
    if (filteredRecords.length === 0) return [];
    const latestRecord = filteredRecords[filteredRecords.length - 1];
    const total = latestRecord.chinese + latestRecord.english + latestRecord.math + latestRecord.professional1 + latestRecord.professional2;
    return VOCATIONAL_PATHWAY_RANGES.map(pw => {
      let status: UnifiedExamPathwayMatch['status'] = 'unlikely';
      if (total >= pw.maxScore) status = 'safe';
      else if (total >= pw.minScore + 30) status = 'reachable';
      else if (total >= pw.minScore) status = 'stretch';
      return { ...pw, status };
    });
  }, [filteredRecords]);

  const directionContext = profile?.selectedDirections.length ? profile.selectedDirections[0] : null;

  const groupOptions = Object.entries(VOCATIONAL_GROUP_LABELS) as [VocationalGroup, string][];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">統測分數分析</h1>
        <p className="text-gray-500">輸入你的統測成績，看看最適合你的升學管道和科技大學</p>
        {directionContext && (
          <p className="text-sm text-indigo-600 mt-1">已結合你的方向：{directionContext}</p>
        )}
      </div>

      {/* Group Selector */}
      <div className="max-w-2xl mx-auto mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">選擇職群</label>
        <select
          value={selectedGroup}
          onChange={e => {
            const newGroup = e.target.value as VocationalGroup;
            setSelectedGroup(newGroup);
            setAnalysis(null);
          }}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white text-gray-900"
        >
          {groupOptions.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setTab('analyze')}
            className={'px-6 py-2 rounded-lg text-sm font-bold transition-colors ' + (tab === 'analyze' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}
          >
            分數分析
          </button>
          <button
            onClick={() => setTab('trends')}
            className={'px-6 py-2 rounded-lg text-sm font-bold transition-colors ' + (tab === 'trends' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}
          >
            趨勢追蹤{isPro ? '' : ' (Pro)'}
          </button>
        </div>
      </div>

      {tab === 'analyze' && (
        <>
          {!analysis ? (
            <ScoreInputForm group={selectedGroup} onSubmit={handleSubmit} />
          ) : (
            <div className="space-y-8">
              <AnalysisResultDisplay
                analysis={analysis}
                group={selectedGroup}
                onShare={() => setShowShareCard(true)}
                directionContext={directionContext}
              />

              {/* Pathway Match */}
              {filteredRecords.length > 0 && pathwayMatches.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">模擬管道匹配</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    根據最近一次成績（總分 {
                      filteredRecords[filteredRecords.length - 1].chinese
                      + filteredRecords[filteredRecords.length - 1].english
                      + filteredRecords[filteredRecords.length - 1].math
                      + filteredRecords[filteredRecords.length - 1].professional1
                      + filteredRecords[filteredRecords.length - 1].professional2
                    }）
                  </p>
                  <div className="space-y-2">
                    {pathwayMatches.map(pw => (
                      <div key={pw.slug} className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
                        <span className="text-sm font-medium text-gray-700">{pw.name}</span>
                        <span className={
                          'px-3 py-1 rounded-full text-xs font-bold ' +
                          (pw.status === 'safe' ? 'bg-green-100 text-green-700' :
                           pw.status === 'reachable' ? 'bg-blue-100 text-blue-700' :
                           pw.status === 'stretch' ? 'bg-amber-100 text-amber-700' :
                           'bg-gray-100 text-gray-500')
                        }>
                          {pw.status === 'safe' ? '可衝刺' : pw.status === 'reachable' ? '有機會' : pw.status === 'stretch' ? '需要努力' : '較困難'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={() => setAnalysis(null)}
                  className="text-gray-500 hover:text-gray-700 text-sm underline"
                >
                  重新輸入成績
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'trends' && (
        <TrendTab
          group={selectedGroup}
          records={filteredRecords}
          allRecords={records}
          trendData={trendData}
          isPro={isPro}
          showRecordForm={showRecordForm}
          setShowRecordForm={setShowRecordForm}
          recordLabel={recordLabel}
          setRecordLabel={setRecordLabel}
          recordDate={recordDate}
          setRecordDate={setRecordDate}
          recordScores={recordScores}
          setRecordScores={setRecordScores}
          handleAddRecord={handleAddRecord}
          handleDeleteRecord={handleDeleteRecord}
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
    <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl mx-auto">
      <h2 className="text-lg font-bold text-gray-900 mb-6">輸入統測成績</h2>
      <div className="space-y-4 mb-6">
        {subjects.map(s => (
          <div key={s.key} className="flex items-center gap-4">
            <label className="w-28 text-sm font-medium text-gray-700 text-right">{s.label}</label>
            <input
              type="range"
              min={0}
              max={100}
              value={scores[s.key as keyof UnifiedExamScoreInput] as number}
              onChange={e => updateScore(s.key as keyof UnifiedExamScoreInput, parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
            />
            <input
              type="number"
              min={0}
              max={100}
              value={scores[s.key as keyof UnifiedExamScoreInput] as number}
              onChange={e => updateScore(s.key as keyof UnifiedExamScoreInput, parseInt(e.target.value) || 0)}
              className="w-20 text-center border border-gray-200 rounded-lg py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
        ))}
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-400 mb-4">
          總分：{total} / 500
        </p>
        <button
          onClick={() => onSubmit(scores)}
          className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg"
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
  onShare,
  directionContext,
}: {
  analysis: LocalAnalysisResult;
  group: VocationalGroup;
  onShare: () => void;
  directionContext: string | null;
}) {
  const subjects = getGroupSubjectKeys(group);
  const scoreEntries = subjects.map(s => ({
    key: s.key,
    label: s.label,
    value: analysis.scores[s.key as keyof UnifiedExamScoreInput] as number,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-indigo-50 rounded-xl">
            <p className="text-3xl font-bold text-indigo-600">{analysis.total}</p>
            <p className="text-sm text-gray-500">總分</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-3xl font-bold text-green-600">{analysis.average.toFixed(1)}</p>
            <p className="text-sm text-gray-500">平均分數</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-xl">
            <p className="text-3xl font-bold text-amber-600">{analysis.percentile.toFixed(1)}%</p>
            <p className="text-sm text-gray-500">百分位</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <p className="text-lg font-bold text-purple-600">{analysis.recommendedPathways[0]?.name}</p>
            <p className="text-sm text-gray-500">最推薦管道</p>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-700 mb-2">各科成績</h3>
          <div className="space-y-2">
            {scoreEntries.map(entry => (
              <div key={entry.key} className="flex items-center gap-3">
                <span className="w-28 text-sm text-gray-500 text-right">{entry.label}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(entry.value / 100) * 100}%`,
                      backgroundColor: SUBJECT_COLORS[entry.key] || '#6b7280',
                    }}
                  />
                </div>
                <span className="w-10 text-right text-sm font-bold text-gray-700">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">{analysis.summary}</p>

        {directionContext && (
          <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <p className="text-sm text-indigo-700">
              <span className="font-bold">方向建議：</span>
              根據你選擇的「{directionContext}」方向，建議優先關注相關科系的申請門檻和備審要求。可以在「素材記錄」中針對性補充相關學習歷程。
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">推薦升學管道</h3>
        <div className="space-y-3">
          {analysis.recommendedPathways.slice(0, 5).map(pw => (
            <div key={pw.slug} className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
              <div>
                <p className="font-medium text-gray-900 text-sm">{pw.name}</p>
                <p className="text-xs text-gray-500">{pw.description}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-indigo-600">{pw.matchScore}%</p>
                <p className="text-xs text-gray-400">匹配度</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onShare}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
        >
          分享分析結果
        </button>
      </div>
    </div>
  );
}

function TrendTab({
  group,
  records,
  trendData,
  isPro,
  showRecordForm,
  setShowRecordForm,
  recordLabel,
  setRecordLabel,
  recordDate,
  setRecordDate,
  recordScores,
  setRecordScores,
  handleAddRecord,
  handleDeleteRecord,
}: {
  group: VocationalGroup;
  records: UnifiedExamRecord[];
  allRecords: UnifiedExamRecord[];
  trendData: Array<{
    subject: string;
    label: string;
    color: string;
    values: Array<{ x: string; y: number; label: string }>;
    avg: number;
    trend: number;
  }> | null;
  isPro: boolean;
  showRecordForm: boolean;
  setShowRecordForm: (v: boolean) => void;
  recordLabel: string;
  setRecordLabel: (v: string) => void;
  recordDate: string;
  setRecordDate: (v: string) => void;
  recordScores: { chinese: number; english: number; math: number; professional1: number; professional2: number };
  setRecordScores: (v: { chinese: number; english: number; math: number; professional1: number; professional2: number }) => void;
  handleAddRecord: () => void;
  handleDeleteRecord: (id: string) => void;
}) {
  const subjects = getGroupSubjectKeys(group);

  if (!isPro) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📈</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Pro 專屬功能</h2>
        <p className="text-gray-500 mb-6">
          追蹤你的成績趨勢，看見進步軌跡。輸入多次考試成績，視覺化你的成長曲線。
        </p>
        <a href="/pricing" className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
          升級 Pro 解鎖
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Record */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          已記錄 {records.length} 次成績
          {records.length === 0 && (
            <span className="text-gray-400">（目前職群：{VOCATIONAL_GROUP_LABELS[group]}）</span>
          )}
        </p>
        <button
          onClick={() => setShowRecordForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
        >
          + 新增成績
        </button>
      </div>

      {/* Records Table */}
      {records.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-2 text-gray-500 font-medium">名稱</th>
                <th className="text-left py-2 px-2 text-gray-500 font-medium hidden sm:table-cell">日期</th>
                {subjects.map(s => (
                  <th key={s.key} className="text-center py-2 px-2 text-gray-500 font-medium">
                    {s.label.length > 4 ? s.label.slice(0, 4) : s.label}
                  </th>
                ))}
                <th className="text-center py-2 px-2 text-gray-500 font-medium">總分</th>
                <th className="py-2 px-1"></th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => {
                const total = r.chinese + r.english + r.math + r.professional1 + r.professional2;
                return (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 px-2 font-medium text-gray-900">{r.label}</td>
                    <td className="py-2.5 px-2 text-gray-400 hidden sm:table-cell">{r.date}</td>
                    <td className="py-2.5 px-2 text-center">{r.chinese}</td>
                    <td className="py-2.5 px-2 text-center">{r.english}</td>
                    <td className="py-2.5 px-2 text-center">{r.math}</td>
                    <td className="py-2.5 px-2 text-center">{r.professional1}</td>
                    <td className="py-2.5 px-2 text-center">{r.professional2}</td>
                    <td className="py-2.5 px-2 text-center font-bold text-indigo-600">{total}</td>
                    <td className="py-2.5 px-1">
                      <button onClick={() => handleDeleteRecord(r.id)} className="text-gray-300 hover:text-red-500 text-xs">x</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Trend Visualization */}
      {trendData && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">成績趨勢</h3>
          <div className="space-y-4">
            {trendData.map(subject => (
              <div key={subject.subject}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{subject.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">均 {subject.avg}</span>
                    <span className={'text-xs font-bold px-2 py-0.5 rounded-full ' + (subject.trend > 0 ? 'bg-green-100 text-green-700' : subject.trend < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500')}>
                      {subject.trend > 0 ? '+' : ''}{subject.trend}
                    </span>
                  </div>
                </div>
                {/* Simple bar chart */}
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
                    <span key={i} className="flex-1 text-center text-[10px] text-gray-400 truncate">
                      {i === 0 || i === subject.values.length - 1 ? v.label : ''}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {records.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>還沒有成績記錄</p>
          <p className="text-sm mt-1">點擊「新增成績」開始追蹤你的進步</p>
        </div>
      )}

      {/* Add Record Modal */}
      {showRecordForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">新增成績</h2>
              <button onClick={() => setShowRecordForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">考試名稱</label>
                <input
                  type="text"
                  value={recordLabel}
                  onChange={e => setRecordLabel(e.target.value)}
                  placeholder="例如：第一次模擬考"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                <input
                  type="date"
                  value={recordDate}
                  onChange={e => setRecordDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">
                  職群：{VOCATIONAL_GROUP_LABELS[group]}
                </p>
              </div>
              {subjects.map(s => (
                <div key={s.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{s.label}</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={recordScores[s.key as keyof typeof recordScores] ?? 0}
                    onChange={e => setRecordScores({
                      ...recordScores,
                      [s.key]: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)),
                    })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
              ))}
              <button
                onClick={handleAddRecord}
                disabled={!recordLabel.trim() || !recordDate}
                className={'w-full py-3 rounded-xl font-bold transition-all ' + (recordLabel.trim() && recordDate ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed')}
              >
                新增成績
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
