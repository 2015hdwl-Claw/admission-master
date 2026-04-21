'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { deriveDirections, deriveDirectionsWithAI } from '@/lib/direction-engine';
import { ACADEMIC_CATEGORIES, ACADEMIC_GROUP_COLORS, ACADEMIC_GROUP_LABELS } from '@/data/academic-categories';
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
    if (ruleResults.length === 0 || profile.isInterestMode) return;

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

    setIsInterestMode(profile.isInterestMode);
    setFactCount(profile.facts.length);

    const cached = loadFromStorage<DirectionResult[] | null>('direction-results', null);
    if (cached && cached.length > 0) {
      setDirections(cached);
      setLoaded(true);
      return;
    }

    const results = profile.isInterestMode
      ? loadFromStorage<DirectionResult[]>('direction-results', [])
      : deriveDirections(profile.facts);

    if (results.length > 0) {
      saveToStorage('direction-results', results);
    }
    setDirections(results);

    runAIDerivation(profile, results);
  }, [router, runAIDerivation]);

  if (!loaded || aiLoading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500">
          {aiLoading ? 'AI 正在分析你的資料，為你找到更精準的方向...' : '分析中...'}
        </p>
        {aiLoading && (
          <div className="mt-4 flex justify-center">
            <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          你的方向推導結果
        </h1>
        <p className="text-gray-500">
          {isInterestMode
            ? '根據你的興趣分析，以下方向可能適合你'
            : factCount < 3
            ? '資料不多，但仍然可以給出初步方向。建議回上一步多填一些！'
            : `根據你提供的 ${factCount} 項事實${aiUsed ? '，結合 AI 分析' : ''}，推導出以下方向`}
        </p>
      </div>

      {directions.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
          <div className="text-4xl mb-4">🤔</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">資料不足，無法推導</h2>
          <p className="text-gray-500 text-sm mb-6">
            請回上一步至少填寫 1-2 項事實，或切換到興趣探索模式。
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/onboarding/step2')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
            >
              回上一步補填
            </button>
            <button
              onClick={() => router.push('/onboarding/step2')}
              className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              興趣探索模式
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {directions.map((dir, index) => {
            const relatedCategories = ACADEMIC_CATEGORIES.filter(cat =>
              dir.relatedCategoryIds.includes(cat.id)
            );
            const groupColor = ACADEMIC_GROUP_COLORS[dir.directionGroup] || 'bg-gray-100 text-gray-700';
            const confidencePercent = Math.round(dir.confidence * 100);

            return (
              <div
                key={dir.direction}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{dir.direction}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${groupColor}`}>
                        {ACADEMIC_GROUP_LABELS[dir.directionGroup] || dir.directionGroup}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-indigo-600">{confidencePercent}%</div>
                    <div className="text-xs text-gray-400">匹配度</div>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${confidencePercent}%` }}
                  />
                </div>

                {/* Reasons */}
                <div className="mb-3">
                  <h4 className="text-xs font-medium text-gray-500 mb-1">推薦原因</h4>
                  <ul className="space-y-1">
                    {dir.reasons.map((reason, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-indigo-400 mt-0.5 flex-shrink-0">&#9679;</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Related departments preview */}
                {relatedCategories.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <h4 className="text-xs font-medium text-gray-500 mb-2">相關學類</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {relatedCategories.slice(0, 4).map(cat => (
                        <span key={cat.id} className="text-xs px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg">
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {aiUsed && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
              <p className="text-sm text-blue-700">
                結合規則引擎與 AI 分析，為你提供更精準的方向推薦。
              </p>
            </div>
          )}

          {factCount < 3 && !isInterestMode && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
              <p className="text-sm text-amber-700">
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
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all"
          >
            深入探索這些方向
          </button>
        </div>
      )}
    </div>
  );
}
