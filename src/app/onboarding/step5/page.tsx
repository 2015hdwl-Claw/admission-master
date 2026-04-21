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
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500">載入中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          確認你的方向
        </h1>
        <p className="text-gray-500">選擇 1-2 個你最感興趣的方向</p>
      </div>

      {/* Direction selection */}
      <div className="space-y-3 mb-8">
        {directions.map(dir => {
          const isSelected = selected.includes(dir.direction);
          return (
            <button
              key={dir.direction}
              onClick={() => toggleDirection(dir.direction)}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isSelected ? '✓' : ''}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{dir.direction}</div>
                  <div className="text-xs text-gray-500">
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
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 mb-8">
          <h3 className="font-bold text-gray-900 mb-3 text-center">你的升學方向</h3>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {selected.map(dir => (
              <span key={dir} className="px-4 py-2 bg-white text-indigo-600 rounded-full font-medium shadow-sm border border-indigo-200">
                {dir}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center leading-relaxed">
            你選了 <strong>{selected.join('、')}</strong> 方向。
            接下來我們會根據你的年級和方向，幫你規劃個人化的升學路線圖，
            包含時間軸、缺口分析和可執行的建議。
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <Link
          href="/roadmap"
          onClick={handleConfirm}
          className="block w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all text-center"
        >
          進入我的路線圖
        </Link>
        <button
          onClick={() => router.push('/onboarding/step4')}
          className="w-full py-3 text-gray-500 text-sm hover:text-gray-700 transition-colors"
        >
          回上一步調整
        </button>
      </div>

      {/* Done message */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full text-sm text-green-700 font-medium">
          <span>&#10003;</span>
          Onboarding 完成
        </div>
        <p className="text-xs text-gray-400 mt-2">
          之後可以在路線圖頁面隨時重新設定
        </p>
      </div>
    </div>
  );
}
