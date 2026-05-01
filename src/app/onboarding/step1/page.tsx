'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import type { OnboardingGrade, OnboardingTrack, OnboardingProfile, VocationalGroup } from '@/types';
import {
  VOCATIONAL_GROUP_LABELS,
  VOCATIONAL_GROUP_COLORS,
  VOCATIONAL_GROUP_SUPER_CATEGORY,
  SUPER_CATEGORY_LABELS,
  getGroupsBySuperCategory,
} from '@/data/vocational-categories';
import type { SuperCategory } from '@/data/vocational-categories';

const GRADES: { value: OnboardingGrade; label: string; desc: string }[] = [
  { value: '高一', label: '高一', desc: '剛開始探索，時間最充裕' },
  { value: '高二', label: '高二', desc: '黃金準備期，方向漸清晰' },
  { value: '高三', label: '高三', desc: '衝刺期，需要明確目標' },
];

const SUPER_CATEGORIES: SuperCategory[] = [
  '工業類', '商業類', '設計類', '服務類', '資訊類', '農業類', '海事類', '語文類',
];

export default function Step1Page() {
  const router = useRouter();
  const [grade, setGrade] = useState<OnboardingGrade | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<VocationalGroup | null>(null);

  const groupsByCategory = useMemo(() => {
    const map = new Map<SuperCategory, VocationalGroup[]>();
    for (const cat of SUPER_CATEGORIES) {
      map.set(cat, getGroupsBySuperCategory(cat));
    }
    return map;
  }, []);

  useEffect(() => {
    const profile = loadFromStorage<OnboardingProfile | null>('onboarding-profile', null);
    if (profile) {
      setGrade(profile.grade);
    }
    const savedGroup = loadFromStorage<VocationalGroup | null>('vocational-group', null);
    if (savedGroup) {
      setSelectedGroup(savedGroup);
    }
  }, []);

  function handleNext() {
    if (!grade || !selectedGroup) return;
    const profile = loadFromStorage<OnboardingProfile | null>('onboarding-profile', null);
    const updated: OnboardingProfile = {
      grade,
      track: '高職' as OnboardingTrack,
      facts: profile?.facts ?? [],
      interestAnswers: profile?.interestAnswers ?? [],
      isInterestMode: profile?.isInterestMode ?? false,
      selectedDirections: profile?.selectedDirections ?? [],
      completedSteps: Math.max(profile?.completedSteps ?? 0, 1),
    };
    saveToStorage('onboarding-profile', updated);
    saveToStorage('vocational-group', selectedGroup);
    router.push('/onboarding/step2');
  }

  const canProceed = grade !== null && selectedGroup !== null;

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-on-background mb-2">
          你現在在哪？
        </h1>
        <p className="text-on-surface-variant">先讓我們了解你的基本背景</p>
      </div>

      <div className="space-y-8">
        {/* Grade selection */}
        <div>
          <h2 className="font-serif text-sm font-medium text-on-background mb-3">你的年級</h2>
          <div className="grid gap-3">
            {GRADES.map(g => (
              <button
                key={g.value}
                onClick={() => setGrade(g.value)}
                className={`p-4 rounded-sm border-2 text-left transition-all ${
                  grade === g.value
                    ? 'border-primary bg-primary-fixed '
                    : 'border-[#E9E5DB] bg-white hover:border-outline hover:'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-md flex items-center justify-center font-bold text-sm ${
                      grade === g.value
                        ? 'bg-primary text-white'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {g.value}
                  </div>
                  <div>
                    <div className="font-bold text-on-background">{g.label}</div>
                    <div className="text-xs text-on-surface-variant">{g.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Vocational group selection */}
        <div>
          <h2 className="font-serif text-sm font-medium text-on-background mb-3">你的科群</h2>
          <div className="space-y-5">
            {SUPER_CATEGORIES.map(cat => {
              const groups = groupsByCategory.get(cat);
              if (!groups || groups.length === 0) return null;
              return (
                <div key={cat}>
                  <h3 className="font-serif text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                    {SUPER_CATEGORY_LABELS[cat]}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {groups.map(group => {
                      const isSelected = selectedGroup === group;
                      const colorClass = VOCATIONAL_GROUP_COLORS[group];
                      return (
                        <button
                          key={group}
                          onClick={() => setSelectedGroup(group)}
                          className={`p-3 rounded-md border-2 text-left transition-all ${
                            isSelected
                              ? 'border-primary bg-primary-fixed '
                              : 'border-[#E9E5DB] bg-white hover:border-outline hover:'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full shrink-0 ${colorClass}`} />
                            <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-on-background'}`}>
                              {VOCATIONAL_GROUP_LABELS[group]}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={`w-full py-4 rounded-sm text-lg font-bold transition-all ${
            canProceed
              ? 'bg-gradient-to-r from-primary to-tertiary text-white hover:from-indigo-700 hover:to-purple-700  cursor-pointer'
              : 'bg-surface-container-high text-outline cursor-not-allowed'
          }`}
        >
          下一步
        </button>
      </div>
    </div>
  );
}
