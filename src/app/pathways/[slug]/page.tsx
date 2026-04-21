'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ADMISSION_PATHWAYS } from '@/data/admission';

export default function PathwayDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const pathway = useMemo(
    () => ADMISSION_PATHWAYS.find(p => p.slug === slug),
    [slug]
  );

  if (!pathway) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">找不到此管道</h1>
        <Link href="/pathways" className="text-indigo-600 underline">回到管道列表</Link>
      </div>
    );
  }

  const hasScores = pathway.scoreRanges.top.total > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/pathways" className="text-sm text-gray-500 hover:text-indigo-600 mb-6 inline-block">
        &larr; 返回升學管道
      </Link>

      <div className="mb-8">
        <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full font-medium">
          {pathway.category}
        </span>
        <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-2">{pathway.name}</h1>
        <p className="text-gray-500 leading-relaxed">{pathway.description}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-2">適合對象</h3>
          <p className="text-sm text-gray-600">{pathway.targetStudents}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-2">名額佔比</h3>
          <div className="text-3xl font-bold text-indigo-600">~{pathway.quotaPercentage}%</div>
          <p className="text-xs text-gray-400 mt-1">佔總招生名額比例</p>
        </div>
      </div>

      {/* Timeline */}
      {pathway.timeline.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
          <h3 className="font-bold text-gray-900 mb-4">重要時程</h3>
          <div className="relative pl-6 border-l-2 border-indigo-200 space-y-4">
            {pathway.timeline.map((step, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[29px] w-4 h-4 bg-indigo-500 rounded-full border-2 border-white" />
                <p className="text-sm text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requirements */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
        <h3 className="font-bold text-gray-900 mb-4">申請條件</h3>
        <ul className="space-y-2">
          {pathway.requirements.map((req, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-indigo-500 mt-0.5">&#9679;</span>
              {req}
            </li>
          ))}
        </ul>
      </div>

      {/* Score Ranges */}
      {hasScores && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
          <h3 className="font-bold text-gray-900 mb-4">參考分數</h3>
          <div className="space-y-3">
            {(['top', 'high', 'mid', 'base'] as const).map(level => (
              <div key={level} className="flex items-center gap-4">
                <div className={`w-20 text-center py-2 rounded-lg text-sm font-bold ${
                  level === 'top' ? 'bg-green-100 text-green-700' :
                  level === 'high' ? 'bg-blue-100 text-blue-700' :
                  level === 'mid' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {level === 'top' ? '頂標' : level === 'high' ? '前標' : level === 'mid' ? '均標' : '後標'}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{pathway.scoreRanges[level].total} 級分以上</div>
                  <div className="text-xs text-gray-500">{pathway.scoreRanges[level].description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
        <h3 className="font-bold text-gray-900 mb-4">準備建議</h3>
        <ul className="space-y-2">
          {pathway.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-indigo-500 mt-0.5">&#10003;</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* FAQs */}
      {pathway.faqs.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
          <h3 className="font-bold text-gray-900 mb-4">常見問題</h3>
          <div className="space-y-4">
            {pathway.faqs.map((faq, i) => (
              <div key={i}>
                <p className="font-medium text-sm text-gray-900 mb-1">Q: {faq.q}</p>
                <p className="text-sm text-gray-600">A: {faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center">
        <Link
          href="/analyze"
          className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
        >
          分析我的成績適合哪個管道
        </Link>
      </div>
    </div>
  );
}
