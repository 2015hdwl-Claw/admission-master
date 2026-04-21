'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import type { OnboardingGrade, OnboardingTrack, OnboardingProfile } from '@/types';

const GRADES: { value: OnboardingGrade; label: string; desc: string }[] = [
  { value: '高一', label: '高一', desc: '剛開始探索，時間最充裕' },
  { value: '高二', label: '高二', desc: '黃金準備期，方向漸清晰' },
  { value: '高三', label: '高三', desc: '衝刺期，需要明確目標' },
];

const TRACKS: { value: OnboardingTrack; label: string; desc: string }[] = [
  { value: '自然組', label: '自然組', desc: '數學、物理、化學、生物' },
  { value: '社會組', label: '社會組', desc: '歷史、地理、公民' },
  { value: '未決定', label: '未決定', desc: '還在考慮中' },
];

export default function Step1Page() {
  const router = useRouter();
  const [grade, setGrade] = useState<OnboardingGrade | null>(null);
  const [track, setTrack] = useState<OnboardingTrack | null>(null);

  useEffect(() => {
    const profile = loadFromStorage<OnboardingProfile | null>('onboarding-profile', null);
    if (profile) {
      setGrade(profile.grade);
      setTrack(profile.track);
    }
  }, []);

  function handleNext() {
    if (!grade || !track) return;
    const profile = loadFromStorage<OnboardingProfile | null>('onboarding-profile', null);
    const updated: OnboardingProfile = {
      grade,
      track,
      facts: profile?.facts ?? [],
      interestAnswers: profile?.interestAnswers ?? [],
      isInterestMode: profile?.isInterestMode ?? false,
      selectedDirections: profile?.selectedDirections ?? [],
      completedSteps: Math.max(profile?.completedSteps ?? 0, 1),
    };
    saveToStorage('onboarding-profile', updated);
    router.push('/onboarding/step2');
  }

  const canProceed = grade !== null && track !== null;

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          你現在在哪？
        </h1>
        <p className="text-gray-500">先讓我們了解你的基本背景</p>
      </div>

      <div className="space-y-8">
        {/* Grade selection */}
        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-3">你的年級</h2>
          <div className="grid gap-3">
            {GRADES.map(g => (
              <button
                key={g.value}
                onClick={() => setGrade(g.value)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  grade === g.value
                    ? 'border-indigo-600 bg-indigo-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      grade === g.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {g.value}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{g.label}</div>
                    <div className="text-xs text-gray-500">{g.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Track selection */}
        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-3">你選哪一組？</h2>
          <div className="grid gap-3">
            {TRACKS.map(t => (
              <button
                key={t.value}
                onClick={() => setTrack(t.value)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  track === t.value
                    ? 'border-indigo-600 bg-indigo-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      track === t.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {t.value === '自然組' ? 'N' : t.value === '社會組' ? 'S' : '?'}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{t.label}</div>
                    <div className="text-xs text-gray-500">{t.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={`w-full py-4 rounded-2xl text-lg font-bold transition-all ${
            canProceed
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          下一步
        </button>
      </div>
    </div>
  );
}
