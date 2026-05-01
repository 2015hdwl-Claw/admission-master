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
      <div className="page-container max-w-3xl text-center">
        <h1 className="font-h2 text-h2 text-on-surface mb-lg">找不到此管道</h1>
        <Link href="/pathways" className="text-primary underline cursor-pointer">回到管道列表</Link>
      </div>
    );
  }

  const hasScores = pathway.scoreRanges.top.total > 0;

  return (
    <div className="page-container max-w-3xl">
      <Link href="/pathways" className="text-sm text-on-surface-variant hover:text-primary mb-6 inline-block cursor-pointer">
        &larr; 返回升學管道
      </Link>

      <div className="mb-8">
        <span className="text-xs px-2 py-1 bg-primary-fixed text-primary rounded-full font-medium">
          {pathway.category}
        </span>
        <h1 className="font-h2 text-h2 text-on-surface mt-sm mb-sm">{pathway.name}</h1>
        <p className="text-on-surface-variant leading-relaxed">{pathway.description}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 mb-8">
        <div className="bg-white rounded-sm p-5 border border-[#E9E5DB] ">
          <h3 className="font-body-lg font-semibold text-on-surface mb-sm">適合對象</h3>
          <p className="text-sm text-on-surface-variant">{pathway.targetStudents}</p>
        </div>
        <div className="bg-white rounded-sm p-5 border border-[#E9E5DB] ">
          <h3 className="font-body-lg font-semibold text-on-surface mb-sm">名額佔比</h3>
          <div className="text-3xl font-bold text-primary">~{pathway.quotaPercentage}%</div>
          <p className="text-xs text-on-surface-variant mt-1">佔總招生名額比例</p>
        </div>
      </div>

      {/* Timeline */}
      {pathway.timeline.length > 0 && (
        <div className="bg-surface-container-low border border-[#E9E5DB] p-xl mb-xxl">
          <h3 className="font-body-lg font-semibold text-on-surface mb-lg">重要時程</h3>
          <div className="relative pl-6 border-l-2 border-primary/30 space-y-4">
            {pathway.timeline.map((step, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[29px] w-4 h-4 bg-primary-fixed0 rounded-full border-2 border-white" />
                <p className="text-sm text-on-background">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requirements */}
      <div className="bg-surface-container-low border border-[#E9E5DB] p-xl mb-xxl">
        <h3 className="font-body-lg font-semibold text-on-surface mb-lg">申請條件</h3>
        <ul className="space-y-2">
          {pathway.requirements.map((req, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
              <span className="text-primary mt-0.5">&#9679;</span>
              {req}
            </li>
          ))}
        </ul>
      </div>

      {/* Score Ranges */}
      {hasScores && (
        <div className="bg-surface-container-low border border-[#E9E5DB] p-xl mb-xxl">
          <h3 className="font-body-lg font-semibold text-on-surface mb-lg">參考分數</h3>
          <div className="space-y-3">
            {(['top', 'high', 'mid', 'base'] as const).map(level => (
              <div key={level} className="flex items-center gap-4">
                <div className={`w-20 text-center py-2 rounded-lg text-sm font-bold ${
                  level === 'top' ? 'bg-success-container text-success' :
                  level === 'high' ? 'bg-primary-fixed text-primary' :
                  level === 'mid' ? 'bg-warning-container text-warning' :
                  'bg-surface-container text-on-surface-variant'
                }`}>
                  {level === 'top' ? '頂標' : level === 'high' ? '前標' : level === 'mid' ? '均標' : '後標'}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-on-background">{pathway.scoreRanges[level].total} 級分以上</div>
                  <div className="text-xs text-on-surface-variant">{pathway.scoreRanges[level].description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-surface-container-low border border-[#E9E5DB] p-xl mb-xxl">
        <h3 className="font-body-lg font-semibold text-on-surface mb-lg">準備建議</h3>
        <ul className="space-y-2">
          {pathway.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
              <span className="text-primary mt-0.5">&#10003;</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* FAQs */}
      {pathway.faqs.length > 0 && (
        <div className="bg-surface-container-low border border-[#E9E5DB] p-xl mb-xxl">
          <h3 className="font-body-lg font-semibold text-on-surface mb-lg">常見問題</h3>
          <div className="space-y-4">
            {pathway.faqs.map((faq, i) => (
              <div key={i}>
                <p className="font-medium text-sm text-on-background mb-1">Q: {faq.q}</p>
                <p className="text-sm text-on-surface-variant">A: {faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center">
        <Link
          href="/analyze"
          className="inline-block px-8 py-3 bg-primary text-white font-label-caps text-label-caps tracking-widest hover:opacity-90 transition-all cursor-pointer"
        >
          分析我的成績適合哪個管道
        </Link>
      </div>
    </div>
  );
}
