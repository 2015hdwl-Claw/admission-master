'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import type { OnboardingProfile, DirectionResult } from '@/types';

export default function Step5Page() {
  const router = useRouter();
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [directions, setDirections] = useState<DirectionResult[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const p = loadFromStorage<OnboardingProfile | null>('onboarding-profile', null);
    if (!p) {
      router.push('/onboarding/step1');
      return;
    }

    // Detect stale academic-era profile — must re-onboard under vocational system
    if (p.track !== '高職') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('onboarding-profile');
        localStorage.removeItem('direction-results');
      }
      router.push('/onboarding/step1');
      return;
    }

    setProfile(p);

    const d = loadFromStorage<DirectionResult[]>('direction-results', []);
    setDirections(d);
    setSelected(p.selectedDirections || d.slice(0, 2).map(dir => dir.direction));
    setLoaded(true);
  }, [router]);

  function toggleDirection(dir: string) {
    setSelected(prev => {
      if (prev.includes(dir)) {
        return prev.filter(d => d !== dir);
      }
      if (prev.length >= 2) return prev;
      return [...prev, dir];
    });
  }

  function handleConfirm() {
    const updated: OnboardingProfile = {
      grade: profile?.grade ?? '高一',
      track: profile?.track ?? '未決定',
      facts: profile?.facts ?? [],
      interestAnswers: profile?.interestAnswers ?? [],
      isInterestMode: profile?.isInterestMode ?? false,
      selectedDirections: selected,
      completedSteps: 5,
    };
    saveToStorage('onboarding-profile', updated);
  }

  if (!loaded) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-on-surface-variant">載入中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-on-background mb-2">
          確認你的方向
        </h1>
        <p className="text-on-surface-variant">選擇 1-2 個你最感興趣的方向</p>
      </div>

      {/* Direction selection */}
      <div className="space-y-3 mb-8">
        {directions.map(dir => {
          const isSelected = selected.includes(dir.direction);
          return (
            <button
              key={dir.direction}
              onClick={() => toggleDirection(dir.direction)}
              className={`w-full p-4 rounded-sm border-2 text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary-fixed '
                  : 'border-[#E9E5DB] bg-white hover:border-outline'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                    isSelected ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {isSelected ? <span className="material-symbols-outlined text-[16px]">check_circle</span> : ''}
                </div>
                <div>
                  <div className="font-bold text-on-background">{dir.direction}</div>
                  <div className="text-xs text-on-surface-variant">
                    匹配度 {Math.round(dir.confidence * 100)}%
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirmation summary */}
      {selected.length > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-sm p-6 border border-primary-100 mb-8">
          <div className="text-center mb-3">
            <div className="inline-block w-14 h-14 bg-success-container rounded-full flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[24px]">check_circle</span>
            </div>
            <h3 className="font-serif font-bold text-success text-lg">導入完成！</h3>
          </div>
          <h3 className="font-serif font-bold text-on-background mb-3 text-center">你的職群方向</h3>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {selected.map(dir => (
              <span key={dir} className="px-4 py-2 bg-white text-primary rounded-full font-medium  border border-primary/30">
                {dir}
              </span>
            ))}
          </div>
          <p className="text-sm text-on-surface-variant text-center leading-relaxed">
            你選了 <strong>{selected.join('、')}</strong> 方向。
            接下來我們會根據你的年級和職群，幫你規劃個人化的升學路線圖，
            包含統測準備、技能培養、專題實作和面試練習。
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <Link
          href="/roadmap"
          onClick={handleConfirm}
          className="block w-full py-4 rounded-sm bg-gradient-to-r from-primary to-tertiary text-white text-lg font-bold hover:from-indigo-700 hover:to-purple-700  transition-all text-center"
        >
          進入我的路線圖
        </Link>
        <button
          onClick={() => router.push('/onboarding/step4')}
          className="w-full py-3 text-on-surface-variant text-sm hover:text-on-background transition-colors"
        >
          回上一步調整
        </button>
      </div>

      {/* Done message */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-success-container rounded-full text-sm text-success font-medium">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          Onboarding 完成
        </div>
        <p className="text-xs text-on-surface-variant mt-2">
          之後可以在路線圖頁面隨時重新設定
        </p>
      </div>
    </div>
  );
}
