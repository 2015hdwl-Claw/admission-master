'use client';

import { useState, useEffect, useMemo } from 'react';
import { analyzeScores } from '@/lib/analysis';
import { loadFromStorage, saveToStorage, generateId } from '@/lib/storage';
import type { ScoreInput as ScoreInputType, ScoreAnalysis, ScoreRecord, PathwayMatch, OnboardingProfile } from '@/types';

const STORAGE_KEY = 'score-records';

const SUBJECT_COLORS: Record<string, string> = {
  chinese: '#6366f1',
  english: '#f59e0b',
  math: '#10b981',
  science: '#ef4444',
  social: '#3b82f6',
};

const SUBJECT_LABELS: Record<string, string> = {
  chinese: '國文',
  english: '英文',
  math: '數學',
  science: '自然',
  social: '社會',
};

const PATHWAY_RANGES: PathwayMatch[] = [
  { name: '申請入學（頂標科系）', slug: 'apply-top', minScore: 55, maxScore: 75, status: 'safe' },
  { name: '申請入學（前標科系）', slug: 'apply-high', minScore: 48, maxScore: 60, status: 'safe' },
  { name: '申請入學（均標科系）', slug: 'apply-mid', minScore: 38, maxScore: 52, status: 'reachable' },
  { name: '繁星推薦', slug: 'star', minScore: 40, maxScore: 60, status: 'safe' },
  { name: '分發入學（國立）', slug: 'dist-national', minScore: 35, maxScore: 55, status: 'reachable' },
  { name: '分發入學（私立名校）', slug: 'dist-private-top', minScore: 25, maxScore: 40, status: 'stretch' },
  { name: '分發入學（一般私立）', slug: 'dist-private', minScore: 15, maxScore: 30, status: 'unlikely' },
];

export default function AnalyzePage() {
  const [analysis, setAnalysis] = useState<ScoreAnalysis | null>(null);
  const [showShareCard, setShowShareCard] = useState(false);
  const [tab, setTab] = useState<'analyze' | 'trends'>('analyze');

  // Score trend state
  const [records, setRecords] = useState<ScoreRecord[]>([]);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [recordLabel, setRecordLabel] = useState('');
  const [recordDate, setRecordDate] = useState('');
  const [recordScores, setRecordScores] = useState({ chinese: 0, english: 0, math: 0, science: 0, social: 0 });
  const [recordTrack, setRecordTrack] = useState<'A' | 'B'>('A');
  const [isPro, setIsPro] = useState(false);
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);

  useEffect(() => {
    const stored = loadFromStorage<ScoreRecord[]>(STORAGE_KEY, []);
    setRecords(stored);
    const sub = loadFromStorage<{ plan: string; expiresAt: string | null }>('user-subscription', { plan: 'free', expiresAt: null });
    setIsPro(sub.plan !== 'free');
    const p = loadFromStorage<OnboardingProfile | null>('onboarding-profile', null);
    setProfile(p);
  }, []);

  function handleSubmit(scores: ScoreInputType) {
    const result = analyzeScores(scores);
    setAnalysis(result);
  }

  function handleAddRecord() {
    if (!recordLabel.trim() || !recordDate) return;
    const newRecord: ScoreRecord = {
      id: generateId(),
      label: recordLabel.trim(),
      date: recordDate,
      ...recordScores,
      mathTrack: recordTrack,
    };
    const updated = [...records, newRecord].sort((a, b) => a.date.localeCompare(b.date));
    setRecords(updated);
    saveToStorage(STORAGE_KEY, updated);
    setRecordLabel('');
    setRecordDate('');
    setRecordScores({ chinese: 0, english: 0, math: 0, science: 0, social: 0 });
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

  const trendData = useMemo((): TrendSubject[] | null => {
    if (records.length < 2) return null;
    const subjects = ['chinese', 'english', 'math', 'science', 'social'] as const;
    return subjects.map(subject => ({
      subject,
      label: SUBJECT_LABELS[subject],
      color: SUBJECT_COLORS[subject],
      values: records.map(r => ({ x: r.date, y: r[subject], label: r.label })),
      avg: Math.round(records.reduce((s, r) => s + r[subject], 0) / records.length),
      trend: records.length >= 2
        ? records[records.length - 1][subject] - records[0][subject]
        : 0,
    }));
  }, [records]);

  const pathwayMatches = useMemo(() => {
    if (records.length === 0) return [];
    const latestRecord = records[records.length - 1];
    const total = latestRecord.chinese + latestRecord.english + latestRecord.math + latestRecord.science + latestRecord.social;
    return PATHWAY_RANGES.map(pw => {
      let status: PathwayMatch['status'] = 'unlikely';
      if (total >= pw.maxScore) status = 'safe';
      else if (total >= pw.minScore + 5) status = 'reachable';
      else if (total >= pw.minScore) status = 'stretch';
      return { ...pw, status };
    });
  }, [records]);

  const directionContext = profile?.selectedDirections.length ? profile.selectedDirections[0] : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">學測分數分析</h1>
        <p className="text-gray-500">輸入你的學測成績，看看最適合你的升學管道和科系</p>
        {directionContext && (
          <p className="text-sm text-indigo-600 mt-1">已結合你的方向：{directionContext}</p>
        )}
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
            <ScoreInputForm onSubmit={handleSubmit} />
          ) : (
            <div className="space-y-8">
              <AnalysisResultDisplay analysis={analysis} onShare={() => setShowShareCard(true)} directionContext={directionContext} />

              {/* Pathway Match */}
              {records.length > 0 && pathwayMatches.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">模擬管道匹配</h3>
                  <p className="text-sm text-gray-500 mb-4">根據最近一次成績（總分 {records[records.length - 1].chinese + records[records.length - 1].english + records[records.length - 1].math + records[records.length - 1].science + records[records.length - 1].social}）</p>
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
          records={records}
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
          recordTrack={recordTrack}
          setRecordTrack={setRecordTrack}
          handleAddRecord={handleAddRecord}
          handleDeleteRecord={handleDeleteRecord}
        />
      )}
    </div>
  );
}

// --- Sub-components ---

function ScoreInputForm({ onSubmit }: { onSubmit: (s: ScoreInputType) => void }) {
  const [scores, setScores] = useState<ScoreInputType>({ chinese: 0, english: 0, math: 0, science: 0, social: 0, mathTrack: 'A' });
  const subjects = [
    { key: 'chinese' as const, label: '國文' },
    { key: 'english' as const, label: '英文' },
    { key: 'math' as const, label: '數學' },
    { key: 'science' as const, label: '自然' },
    { key: 'social' as const, label: '社會' },
  ];

  function clamp(v: number) {
    return Math.max(0, Math.min(15, Math.round(v)));
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl mx-auto">
      <h2 className="text-lg font-bold text-gray-900 mb-6">輸入學測成績</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">數學選修</label>
        <div className="flex gap-3">
          <button
            onClick={() => setScores({ ...scores, mathTrack: 'A' })}
            className={'px-4 py-2 rounded-lg text-sm font-bold transition-colors ' + (scores.mathTrack === 'A' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600')}
          >
            數 A
          </button>
          <button
            onClick={() => setScores({ ...scores, mathTrack: 'B' })}
            className={'px-4 py-2 rounded-lg text-sm font-bold transition-colors ' + (scores.mathTrack === 'B' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600')}
          >
            數 B
          </button>
        </div>
      </div>
      <div className="space-y-4 mb-6">
        {subjects.map(s => (
          <div key={s.key} className="flex items-center gap-4">
            <label className="w-12 text-sm font-medium text-gray-700">{s.label}</label>
            <input
              type="range"
              min={0}
              max={15}
              value={scores[s.key]}
              onChange={e => setScores({ ...scores, [s.key]: clamp(parseInt(e.target.value)) })}
              className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
            />
            <input
              type="number"
              min={0}
              max={15}
              value={scores[s.key]}
              onChange={e => setScores({ ...scores, [s.key]: clamp(parseInt(e.target.value) || 0) })}
              className="w-16 text-center border border-gray-200 rounded-lg py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
        ))}
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-400 mb-4">
          總分：{scores.chinese + scores.english + scores.math + scores.science + scores.social} / 75
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

function AnalysisResultDisplay({ analysis, onShare, directionContext }: { analysis: ScoreAnalysis; onShare: () => void; directionContext: string | null }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-indigo-50 rounded-xl">
            <p className="text-3xl font-bold text-indigo-600">{analysis.total}</p>
            <p className="text-sm text-gray-500">總級分</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-3xl font-bold text-green-600">{analysis.average.toFixed(1)}</p>
            <p className="text-sm text-gray-500">平均級分</p>
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
          <h3 className="text-sm font-bold text-gray-700 mb-2">各科級分</h3>
          <div className="space-y-2">
            {(['chinese', 'english', 'math', 'science', 'social'] as const).map(subject => (
              <div key={subject} className="flex items-center gap-3">
                <span className="w-10 text-sm text-gray-500">{SUBJECT_LABELS[subject]}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(analysis.scores[subject] / 15) * 100}%`, backgroundColor: SUBJECT_COLORS[subject] }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-bold text-gray-700">{analysis.scores[subject]}</span>
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
          {analysis.recommendedPathways.map(pw => (
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

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">推薦科系</h3>
        <div className="space-y-3">
          {analysis.recommendedDepartments.map((dept, i) => (
            <div key={i} className="p-3 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{dept.university} {dept.department}</p>
                  <p className="text-xs text-gray-400">{dept.category} - {dept.note}</p>
                </div>
                <span className="text-lg font-bold text-indigo-600">{dept.matchScore}%</span>
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
  recordTrack,
  setRecordTrack,
  handleAddRecord,
  handleDeleteRecord,
}: {
  records: ScoreRecord[];
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
  recordScores: { chinese: number; english: number; math: number; science: number; social: number };
  setRecordScores: (v: { chinese: number; english: number; math: number; science: number; social: number }) => void;
  recordTrack: 'A' | 'B';
  setRecordTrack: (v: 'A' | 'B') => void;
  handleAddRecord: () => void;
  handleDeleteRecord: (id: string) => void;
}) {
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
        <p className="text-sm text-gray-500">已記錄 {records.length} 次成績</p>
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
                <th className="text-center py-2 px-2 text-gray-500 font-medium">國</th>
                <th className="text-center py-2 px-2 text-gray-500 font-medium">英</th>
                <th className="text-center py-2 px-2 text-gray-500 font-medium">數</th>
                <th className="text-center py-2 px-2 text-gray-500 font-medium">自</th>
                <th className="text-center py-2 px-2 text-gray-500 font-medium">社</th>
                <th className="text-center py-2 px-2 text-gray-500 font-medium">總分</th>
                <th className="py-2 px-1"></th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => {
                const total = r.chinese + r.english + r.math + r.science + r.social;
                return (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 px-2 font-medium text-gray-900">{r.label}</td>
                    <td className="py-2.5 px-2 text-gray-400 hidden sm:table-cell">{r.date}</td>
                    <td className="py-2.5 px-2 text-center">{r.chinese}</td>
                    <td className="py-2.5 px-2 text-center">{r.english}</td>
                    <td className="py-2.5 px-2 text-center">{r.math}</td>
                    <td className="py-2.5 px-2 text-center">{r.science}</td>
                    <td className="py-2.5 px-2 text-center">{r.social}</td>
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
                      style={{ height: `${(v.y / 15) * 100}%`, backgroundColor: subject.color, opacity: 0.4 + (i / subject.values.length) * 0.6 }}
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
                  placeholder="例如：高二下段考"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">數學選修</label>
                <div className="flex gap-3">
                  <button onClick={() => setRecordTrack('A')} className={'px-4 py-2 rounded-lg text-sm font-bold transition-colors ' + (recordTrack === 'A' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600')}>數 A</button>
                  <button onClick={() => setRecordTrack('B')} className={'px-4 py-2 rounded-lg text-sm font-bold transition-colors ' + (recordTrack === 'B' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600')}>數 B</button>
                </div>
              </div>
              {(['chinese', 'english', 'math', 'science', 'social'] as const).map(s => (
                <div key={s}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{SUBJECT_LABELS[s]}</label>
                  <input
                    type="number"
                    min={0}
                    max={15}
                    value={recordScores[s]}
                    onChange={e => setRecordScores({ ...recordScores, [s]: Math.max(0, Math.min(15, parseInt(e.target.value) || 0)) })}
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
