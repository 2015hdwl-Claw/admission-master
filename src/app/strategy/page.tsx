'use client';

import { useState, useEffect } from 'react';
import { loadFromStorage } from '@/lib/storage';
import type { StrategyReport, OnboardingProfile } from '@/types';

export default function StrategyPage() {
  const [isPro, setIsPro] = useState(false);
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [report, setReport] = useState<StrategyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [customDirection, setCustomDirection] = useState('');
  const [customGroup, setCustomGroup] = useState('工程');
  const [customGrade, setCustomGrade] = useState('高二');
  const [customTrack, setCustomTrack] = useState('自然組');

  useEffect(() => {
    const stored = loadFromStorage<OnboardingProfile | null>('onboarding-profile', null);
    if (stored) setProfile(stored);
    const sub = loadFromStorage<{ plan: string; expiresAt: string | null }>('user-subscription', { plan: 'free', expiresAt: null });
    setIsPro(sub.plan !== 'free');
  }, []);

  async function generateReport() {
    if (!isPro) return;
    setIsLoading(true);
    setError('');

    const dir = profile?.selectedDirections[0] || customDirection;
    const grp = customGroup;
    const grade = profile?.grade || customGrade;
    const track = profile?.track || customTrack;
    const directions = profile?.selectedDirections || [customDirection];

    try {
      const res = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          direction: dir,
          directionGroup: grp,
          grade,
          track,
          selectedDirections: directions,
          portfolioCount: 0,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError('無法生成報告，請稍後再試。');
      } else {
        setReport(data);
      }
    } catch {
      setError('網路錯誤，請稍後再試。');
    }
    setIsLoading(false);
  }

  if (!isPro) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">科系策略報告</h1>
          <p className="text-gray-500">AI 為你生成個人化科系策略報告</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pro 專屬功能</h2>
          <p className="text-gray-500 mb-6">
            根據你的方向和年級，AI 生成完整的科系策略報告，包含推薦科系列表、錄取門檻、備審重點和時間規劃。
          </p>
          <a
            href="/pricing"
            className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            升級 Pro 解鎖
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">科系策略報告</h1>
        <p className="text-gray-500">AI 為你生成個人化科系策略報告</p>
      </div>

      {!report && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">報告設定</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">目標方向</label>
              <input
                type="text"
                value={customDirection}
                onChange={e => setCustomDirection(e.target.value)}
                placeholder={profile?.selectedDirections[0] || '例如：資訊工程'}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">學群</label>
              <select
                value={customGroup}
                onChange={e => setCustomGroup(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                <option value="工程">工程</option>
                <option value="醫藥衛">醫藥衛</option>
                <option value="商管">商管</option>
                <option value="人文">人文</option>
                <option value="社會">社會</option>
                <option value="自然">自然</option>
                <option value="藝術">藝術</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">年級</label>
              <select
                value={customGrade}
                onChange={e => setCustomGrade(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                <option value="高一">高一</option>
                <option value="高二">高二</option>
                <option value="高三">高三</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分組</label>
              <select
                value={customTrack}
                onChange={e => setCustomTrack(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                <option value="自然組">自然組</option>
                <option value="社會組">社會組</option>
                <option value="未決定">未決定</option>
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

          <div className="text-center">
            <button
              onClick={generateReport}
              disabled={isLoading || !customDirection.trim()}
              className={
                'px-8 py-3 rounded-xl font-bold transition-all ' +
                (customDirection.trim() && !isLoading
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed')
              }
            >
              {isLoading ? 'AI 生成中...' : '生成策略報告'}
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 mt-4">AI 正在分析並生成你的策略報告...</p>
        </div>
      )}

      {report && !isLoading && (
        <div className="space-y-6">
          {/* Overall Strategy */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">整體策略</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{report.overallStrategy}</p>
          </div>

          {/* Department List */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">推薦科系 Top 10</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">#</th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">科系</th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium hidden sm:table-cell">大學</th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium hidden md:table-cell">門檻</th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium hidden lg:table-cell">備審重點</th>
                  </tr>
                </thead>
                <tbody>
                  {report.departments.map(dept => (
                    <tr key={dept.rank} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-2 font-bold text-indigo-600">{dept.rank}</td>
                      <td className="py-3 px-2">
                        <div className="font-medium text-gray-900">{dept.name}</div>
                        <div className="text-xs text-gray-400">{dept.category}</div>
                      </td>
                      <td className="py-3 px-2 text-gray-600 hidden sm:table-cell">{dept.university}</td>
                      <td className="py-3 px-2 text-gray-600 hidden md:table-cell">{dept.scoreRange}</td>
                      <td className="py-3 px-2 text-gray-500 text-xs hidden lg:table-cell max-w-[200px]">{dept.portfolioFocus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">時間規劃</h2>
            <div className="space-y-3">
              {report.timeline.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-indigo-600">{i + 1}</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Advice */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">備審資料建議</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{report.portfolioAdvice}</p>
          </div>

          {/* Interview Advice */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">面試準備建議</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{report.interviewAdvice}</p>
          </div>

          <div className="text-center">
            <button
              onClick={() => setReport(null)}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              重新生成報告
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
