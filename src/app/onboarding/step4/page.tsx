'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { deriveDirections } from '@/lib/direction-engine';
import { VOCATIONAL_CATEGORIES, VOCATIONAL_GROUP_LABELS, VOCATIONAL_GROUP_COLORS } from '@/data/vocational-categories';
import type { OnboardingProfile, DirectionResult } from '@/types';

type Feedback = 'like' | 'unsure' | 'dislike';

export default function Step4Page() {
  const router = useRouter();
  const [directions, setDirections] = useState<DirectionResult[]>([]);
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({});
  const [expandedDir, setExpandedDir] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const filteredDirections = useMemo(() => {
    return directions.filter(d => feedback[d.direction] !== 'dislike');
  }, [directions, feedback]);

  const likedDirections = useMemo(() => {
    return directions.filter(d => feedback[d.direction] === 'like');
  }, [directions, feedback]);

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

    const VOCATIONAL_GROUPS = ['餐旅群','機械群','電機群','電子群','資訊群','商管群','設計群','農業群','化工群','土木群','海事群','護理群','家政群','語文群','商業與管理群'];
    const cached = loadFromStorage<DirectionResult[] | null>('direction-results', null);
    const isStale = cached && cached.length > 0 && cached.some(d => !VOCATIONAL_GROUPS.includes(d.directionGroup as string));
    if (cached && cached.length > 0 && !isStale) {
      setDirections(cached);
    } else {
      const results = profile.isInterestMode
        ? []
        : deriveDirections(profile.facts as any);
      setDirections(results);
    }
    setLoaded(true);
  }, [router]);

  function handleFeedback(direction: string, value: Feedback) {
    setFeedback(prev => ({ ...prev, [direction]: value }));
  }

  function handleNext() {
    const profile = loadFromStorage<OnboardingProfile | null>('onboarding-profile', null);
    const liked = Object.entries(feedback)
      .filter(([, v]) => v === 'like')
      .map(([k]) => k);
    const updated: OnboardingProfile = {
      grade: profile?.grade ?? '高一',
      track: profile?.track ?? '未決定',
      facts: profile?.facts ?? [],
      interestAnswers: profile?.interestAnswers ?? [],
      isInterestMode: profile?.isInterestMode ?? false,
      selectedDirections: liked.length > 0 ? liked : filteredDirections.slice(0, 2).map(d => d.direction),
      completedSteps: Math.max(profile?.completedSteps ?? 0, 4),
    };
    saveToStorage('onboarding-profile', updated);
    router.push('/onboarding/step5');
  }

  if (!loaded) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500">載入中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          探索推薦方向
        </h1>
        <p className="text-gray-500">
          展開每個方向，看看相關職群和科系。告訴我們你的感受，幫助調整推薦。
        </p>
      </div>

      <div className="space-y-4">
        {filteredDirections.map((dir, index) => {
          const relatedCategories = VOCATIONAL_CATEGORIES.filter(cat =>
            dir.relatedCategoryIds.includes(cat.id)
          );
          const groupColor = VOCATIONAL_GROUP_COLORS[dir.directionGroup as keyof typeof VOCATIONAL_GROUP_COLORS] || 'bg-gray-100 text-gray-700';
          const groupLabel = VOCATIONAL_GROUP_LABELS[dir.directionGroup as keyof typeof VOCATIONAL_GROUP_LABELS] || dir.directionGroup;
          const isExpanded = expandedDir === dir.direction;
          const currentFeedback = feedback[dir.direction];

          return (
            <div
              key={dir.direction}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setExpandedDir(isExpanded ? null : dir.direction)}
                className="w-full p-5 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{dir.direction}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${groupColor}`}>
                        {groupLabel}
                      </span>
                    </div>
                  </div>
                  <span className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    &#9660;
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  {/* Reasons */}
                  <div className="mt-4 mb-4">
                    <h4 className="text-xs font-medium text-gray-500 mb-2">為什麼推薦</h4>
                    {dir.reasons.map((reason, i) => (
                      <p key={i} className="text-sm text-gray-700 mb-1">{reason}</p>
                    ))}
                  </div>

                  {/* Related categories */}
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-500 mb-3">相關職群</h4>
                    <div className="space-y-3">
                      {relatedCategories.map(cat => {
                        const catGroupColor = VOCATIONAL_GROUP_COLORS[cat.group as keyof typeof VOCATIONAL_GROUP_COLORS] || 'bg-gray-100 text-gray-700';
                        const catGroupLabel = VOCATIONAL_GROUP_LABELS[cat.group as keyof typeof VOCATIONAL_GROUP_LABELS] || cat.group;
                        return (
                          <div key={cat.id} className="p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 text-sm">{cat.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catGroupColor}`}>
                                {catGroupLabel}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed mb-2">{cat.description}</p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {cat.exampleDepartments.slice(0, 3).map(dept => (
                                <span key={dept} className="text-xs px-2 py-0.5 bg-white text-gray-600 rounded border border-gray-200">
                                  {dept}
                                </span>
                              ))}
                            </div>
                            {cat.exampleTechSchools && cat.exampleTechSchools.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {cat.exampleTechSchools.slice(0, 2).map(school => (
                                  <span key={school} className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 font-medium">
                                    目標科大：{school}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Feedback buttons */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-2">這個方向你覺得？</h4>
                    <div className="flex gap-2">
                      {([
                        { value: 'like' as Feedback, label: '喜歡', color: 'bg-green-100 text-green-700 border-green-300' },
                        { value: 'unsure' as Feedback, label: '不確定', color: 'bg-amber-100 text-amber-700 border-amber-300' },
                        { value: 'dislike' as Feedback, label: '不感興趣', color: 'bg-red-100 text-red-700 border-red-300' },
                      ]).map(btn => (
                        <button
                          key={btn.value}
                          onClick={() => handleFeedback(dir.direction, btn.value)}
                          className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                            currentFeedback === btn.value
                              ? btn.color
                              : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Summary of liked */}
        {likedDirections.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <h4 className="text-sm font-bold text-green-800 mb-2">
              你喜歡 {likedDirections.length} 個方向
            </h4>
            <div className="flex flex-wrap gap-2">
              {likedDirections.map(d => (
                <span key={d.direction} className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                  {d.direction}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all"
        >
          下一步：確認你的方向
        </button>
      </div>
    </div>
  );
}
