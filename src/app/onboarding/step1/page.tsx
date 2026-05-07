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
    <div style={{ maxWidth: '512px', margin: '0 auto', padding: '16px' }}>
      {/* 標題區域 */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'serif',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1b1c1b',
          marginBottom: '8px'
        }}>
          你現在在哪？
        </h1>
        <p style={{ color: '#434843' }}>
          先讓我們了解你的基本背景
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* 年級選擇 */}
        <div>
          <h2 style={{
            fontFamily: 'serif',
            fontSize: '14px',
            fontWeight: '500',
            color: '#1b1c1b',
            marginBottom: '12px'
          }}>
            你的年級
          </h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {GRADES.map(g => (
              <button
                key={g.value}
                onClick={() => setGrade(g.value)}
                style={{
                  padding: '16px',
                  borderRadius: '4px',
                  border: '2px solid',
                  textAlign: 'left',
                  background: grade === g.value ? '#d8e6d7' : 'white',
                  borderColor: grade === g.value ? '#525f54' : '#E9E5DB',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    background: grade === g.value ? '#525f54' : '#f0edeb',
                    color: grade === g.value ? 'white' : '#434843'
                  }}>
                    {g.value}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#1b1c1b' }}>{g.label}</div>
                    <div style={{ fontSize: '12px', color: '#434843' }}>{g.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 科群選擇 */}
        <div>
          <h2 style={{
            fontFamily: 'serif',
            fontSize: '14px',
            fontWeight: '500',
            color: '#1b1c1b',
            marginBottom: '12px'
          }}>
            你的科群
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {SUPER_CATEGORIES.map(cat => {
              const groups = groupsByCategory.get(cat);
              if (!groups || groups.length === 0) return null;
              return (
                <div key={cat}>
                  <h3 style={{
                    fontFamily: 'serif',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#434843',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '8px'
                  }}>
                    {SUPER_CATEGORY_LABELS[cat]}
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px'
                  }}>
                    {groups.map(group => {
                      const isSelected = selectedGroup === group;
                      const colorClass = VOCATIONAL_GROUP_COLORS[group];
                      return (
                        <button
                          key={group}
                          onClick={() => setSelectedGroup(group)}
                          style={{
                            padding: '12px',
                            borderRadius: '6px',
                            border: '2px solid',
                            textAlign: 'left',
                            background: isSelected ? '#d8e6d7' : 'white',
                            borderColor: isSelected ? '#525f54' : '#E9E5DB',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              flexShrink: 0,
                              backgroundColor: colorClass.includes('bg-')
                                ? colorClass.replace('bg-', '').replace('-', ' ')
                                : colorClass
                            }} />
                            <span style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              color: isSelected ? '#525f54' : '#1b1c1b'
                            }}>
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

        {/* 下一步按鈕 */}
        <button
          onClick={handleNext}
          disabled={!canProceed}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '4px',
            fontSize: '18px',
            fontWeight: 'bold',
            background: canProceed
              ? 'linear-gradient(to right, #525f54, #6d5659)'
              : '#e4e2e0',
            color: canProceed ? 'white' : '#747873',
            border: 'none',
            cursor: canProceed ? 'pointer' : 'not-allowed',
            opacity: canProceed ? 1 : 0.5,
            transition: 'all 0.2s'
          }}
        >
          下一步
        </button>
      </div>
    </div>
  );
}
