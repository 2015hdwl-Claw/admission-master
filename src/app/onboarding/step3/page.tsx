'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { deriveDirections, deriveDirectionsWithAI } from '@/lib/direction-engine';
import { VOCATIONAL_CATEGORIES, VOCATIONAL_GROUP_LABELS, VOCATIONAL_GROUP_COLORS } from '@/data/vocational-categories';
import type { OnboardingProfile, DirectionResult } from '@/types';

export default function Step3Page() {
  const router = useRouter();
  const [directions, setDirections] = useState<DirectionResult[]>([]);
  const [isInterestMode, setIsInterestMode] = useState(false);
  const [factCount, setFactCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);

  const runAIDerivation = useCallback(async (profile: OnboardingProfile, ruleResults: DirectionResult[]) => {
    if (profile.isInterestMode) {
      setLoaded(true);
      return;
    }

    const maxConfidence = ruleResults[0]?.confidence ?? 0;
    const shouldUseAI = maxConfidence < 0.6 || profile.facts.length > 5;

    if (!shouldUseAI) {
      setLoaded(true);
      return;
    }

    setAiLoading(true);
    try {
      const result = await deriveDirectionsWithAI(profile, ruleResults);
      setDirections(result.directions);
      setAiUsed(result.usedAI);
      if (result.directions.length > 0) {
        saveToStorage('direction-results', result.directions);
      }
    } catch {
      // AI failed, keep rule results
    } finally {
      setAiLoading(false);
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    const profile = loadFromStorage<OnboardingProfile | null>('onboarding-profile', null);
    if (!profile) {
      router.push('/onboarding/step1');
      return;
    }

    // Detect stale academic-era profile — must re-onboard under vocational system
    if (profile.track !== '高職') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('onboarding-profile');
        localStorage.removeItem('direction-results');
      }
      router.push('/onboarding/step1');
      return;
    }

    setIsInterestMode(profile.isInterestMode);
    setFactCount(profile.facts.length);

    const VOCATIONAL_GROUPS = ['餐旅群','機械群','電機群','電子群','資訊群','商管群','設計群','農業群','化工群','土木群','海事群','護理群','家政群','語文群','商業與管理群'];
    const cached = loadFromStorage<DirectionResult[] | null>('direction-results', null);
    const isStale = cached && cached.length > 0 && cached.some(d => !VOCATIONAL_GROUPS.includes(d.directionGroup as string));
    if (cached && cached.length > 0 && !isStale) {
      setDirections(cached);
      setLoaded(true);
      return;
    }

    const results = profile.isInterestMode
      ? loadFromStorage<DirectionResult[]>('direction-results', [])
      : deriveDirections(profile.facts as any);

    if (results.length > 0 && (results[0]?.confidence ?? 0) >= 0.5) {
      saveToStorage('direction-results', results);
    }
    setDirections(results);
    setLoaded(true);

    runAIDerivation(profile, results);
  }, [router, runAIDerivation]);

  if (!loaded || aiLoading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-on-surface-variant">
          {aiLoading ? 'AI 正在分析你的資料，為你找到更精準的方向...' : '分析中...'}
        </p>
        {aiLoading && (
          <div className="mt-4 flex justify-center">
            <div className="w-48 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-fixed0 to-tertiary rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-on-background mb-2">
          你的方向推導結果
        </h1>
        <p className="text-on-surface-variant">
          {isInterestMode
            ? '根據你的興趣分析，以下方向可能適合你'
            : factCount < 3
            ? '資料不多，但仍然可以給出初步方向。建議回上一步多填一些！'
            : `根據你提供的 ${factCount} 項事實${aiUsed ? '，結合 AI 分析' : ''}，推導出以下方向`}
        </p>
      </div>

      {directions.length === 0 ? (
        <div className="bg-surface-container-low border border-[#E9E5DB] p-xl text-center">
          <div className="mb-4"><span className="material-symbols-outlined text-[32px]">help</span></div>
          <h2 className="font-serif text-lg font-bold text-on-background mb-2">資料不足，無法推導</h2>
          <p className="text-on-surface-variant text-sm mb-6">
            {factCount > 0
              ? `你已填寫 ${factCount} 項事實，但需要更具体的內容。請回到上一步，在每個項目旁的文字框中填寫具体技能名稱、專題主題等細節。`
              : '請回上一步至少填寫 1-2 項事實，或切換到興趣探索模式。'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/onboarding/step2')}
              className="px-6 py-3 bg-primary text-white font-label-caps text-label-caps tracking-widest hover:opacity-90 transition-all cursor-pointer"
            >
              回上一步補填
            </button>
            <button
              onClick={() => router.push('/onboarding/step2')}
              className="px-6 py-3 border border-[#E9E5DB] text-on-surface-variant rounded-md font-medium hover:bg-surface-container-low transition-colors"
            >
              興趣探索模式
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {directions.map((dir, index) => {
            const relatedCategories = VOCATIONAL_CATEGORIES.filter(cat =>
              dir.relatedCategoryIds.includes(cat.id)
            );
            const groupColor = VOCATIONAL_GROUP_COLORS[dir.directionGroup as keyof typeof VOCATIONAL_GROUP_COLORS] || 'bg-surface-container text-on-background';
            const groupLabel = VOCATIONAL_GROUP_LABELS[dir.directionGroup as keyof typeof VOCATIONAL_GROUP_LABELS] || dir.directionGroup;
            const confidencePercent = Math.round(dir.confidence * 100);

            return (
              <div
                key={dir.direction}
                className="bg-surface-container-low border border-[#E9E5DB] p-xl hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-primary-100 text-primary flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-on-background">{dir.direction}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${groupColor}`}>
                        {groupLabel}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{confidencePercent}%</div>
                    <div className="text-xs text-on-surface-variant">匹配度</div>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="h-2 bg-surface-container rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-primary-fixed0 to-tertiary rounded-full transition-all duration-500"
                    style={{ width: `${confidencePercent}%` }}
                  />
                </div>

                {/* Reasons */}
                <div className="mb-3">
                  <h4 className="font-serif text-xs font-medium text-on-surface-variant mb-1">推薦原因</h4>
                  <ul className="space-y-1">
                    {dir.reasons.map((reason, i) => (
                      <li key={i} className="text-sm text-on-background flex items-start gap-2">
                        <span className="text-primary mt-0.5 flex-shrink-0">&#9679;</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Related vocational categories preview */}
                {relatedCategories.length > 0 && (
                  <div className="pt-3 border-t border-[#E9E5DB]">
                    <h4 className="font-serif text-xs font-medium text-on-surface-variant mb-2">相關職群</h4>
                    <div className="space-y-2">
                      {relatedCategories.slice(0, 4).map(cat => {
                        const catGroupColor = VOCATIONAL_GROUP_COLORS[cat.group as keyof typeof VOCATIONAL_GROUP_COLORS] || 'bg-surface-container text-on-background';
                        const catGroupLabel = VOCATIONAL_GROUP_LABELS[cat.group as keyof typeof VOCATIONAL_GROUP_LABELS] || cat.group;
                        return (
                          <div key={cat.id} className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-medium text-on-background px-2 py-1 bg-surface-container-low rounded-lg">
                              {cat.name}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catGroupColor}`}>
                              {catGroupLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {aiUsed && (
            <div className="bg-primary-fixed border border-primary/20 rounded-sm p-4 text-center">
              <p className="text-sm text-primary">
                結合規則引擎與 AI 分析，為你提供更精準的方向推薦。
              </p>
            </div>
          )}

          {factCount < 3 && !isInterestMode && (
            <div className="bg-warning-container border border-warning-container rounded-sm p-4 text-center">
              <p className="text-sm text-warning">
                填寫更多事實可以讓推薦更準確。
                <button
                  onClick={() => router.push('/onboarding/step2')}
                  className="font-medium underline ml-1"
                >
                  回去補填
                </button>
              </p>
            </div>
          )}

          <button
            onClick={() => router.push('/onboarding/step4')}
            className="w-full py-4 rounded-sm bg-gradient-to-r from-primary to-tertiary text-white text-lg font-bold hover:from-indigo-700 hover:to-purple-700  transition-all"
          >
            深入探索這些方向
          </button>
        </div>
      )}
    </div>
  );
}
