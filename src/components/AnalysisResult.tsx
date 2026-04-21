'use client';

import type { ScoreAnalysis } from '@/types';

interface Props {
  analysis: ScoreAnalysis;
  onShare: () => void;
}

export default function AnalysisResult({ analysis, onShare }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <div className="text-6xl font-bold text-indigo-600">{analysis.total}</div>
        <div className="text-gray-500 mt-1">總級分 / 75</div>
        <div className="text-sm text-gray-400 mt-1">超越全國 {analysis.percentile}% 的學生</div>
      </div>

      <div className="bg-indigo-50 rounded-2xl p-6">
        <p className="text-gray-800 leading-relaxed">{analysis.summary}</p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">推薦升學管道</h3>
        <div className="space-y-3">
          {analysis.recommendedPathways.map(p => (
            <div key={p.slug} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                p.matchScore >= 80 ? 'bg-green-500' : p.matchScore >= 60 ? 'bg-yellow-500' : 'bg-gray-400'
              }`}>
                {p.matchScore}%
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{p.name}</div>
                <div className="text-sm text-gray-500">{p.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">推薦科系</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {analysis.recommendedDepartments.map((d, i) => (
            <div key={i} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full font-medium">
                  {d.category}
                </span>
                <span className="text-xs text-gray-400">匹配 {d.matchScore}%</span>
              </div>
              <div className="font-medium text-gray-900 text-sm">{d.university}</div>
              <div className="text-gray-600 text-sm">{d.department}</div>
              <div className="text-xs text-gray-400 mt-1">{d.note}</div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onShare}
        className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-lg font-bold hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all"
      >
        生成我的升學圖卡
      </button>
    </div>
  );
}
