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
      <div style={{ textAlign: 'center', padding: '64px 16px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '4px solid #525f54',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          margin: '0 auto 16px',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ color: '#434843' }}>載入中...</p>
      </div>
    );
  }

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
          確認你的方向
        </h1>
        <p style={{ color: '#434843' }}>
          選擇 1-2 個你最感興趣的方向
        </p>
      </div>

      {/* 方向選擇區域 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {directions.map(dir => {
          const isSelected = selected.includes(dir.direction);
          return (
            <button
              key={dir.direction}
              onClick={() => toggleDirection(dir.direction)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '4px',
                border: '2px solid',
                textAlign: 'left',
                transition: 'all 0.2s',
                background: isSelected ? '#d8e6d7' : 'white',
                borderColor: isSelected ? '#525f54' : '#E9E5DB',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  background: isSelected ? '#525f54' : '#f0edeb',
                  color: isSelected ? 'white' : '#434843'
                }}>
                  {isSelected ? '✓' : ''}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#1b1c1b' }}>{dir.direction}</div>
                  <div style={{ fontSize: '12px', color: '#434843' }}>
                    匹配度 {Math.round(dir.confidence * 100)}%
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 確認摘要 */}
      {selected.length > 0 && (
        <div style={{
          background: 'linear-gradient(to right, #e8f0ed, #fadbde)',
          borderRadius: '4px',
          padding: '24px',
          border: '1px solid #d8e6d7',
          marginBottom: '32px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <div style={{
              display: 'inline-block',
              width: '56px',
              height: '56px',
              background: '#c8e6c9',
              borderRadius: '50%',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '24px' }}>✓</span>
            </div>
            <h3 style={{
              fontFamily: 'serif',
              fontWeight: 'bold',
              color: '#2e7d32',
              fontSize: '18px'
            }}>導入完成！</h3>
          </div>
          <h3 style={{
            fontFamily: 'serif',
            fontWeight: 'bold',
            color: '#1b1c1b',
            marginBottom: '12px',
            textAlign: 'center'
          }}>你的職群方向</h3>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            {selected.map(dir => (
              <span key={dir} style={{
                padding: '8px 16px',
                background: 'white',
                color: '#525f54',
                borderRadius: '9999px',
                fontWeight: '500',
                border: '1px solid rgba(82, 95, 84, 0.3)'
              }}>
                {dir}
              </span>
            ))}
          </div>
          <p style={{
            fontSize: '14px',
            color: '#434843',
            textAlign: 'center',
            lineHeight: '1.6'
          }}>
            你選了 <strong>{selected.join('、')}</strong> 方向。
            接下來我們會根據你的年級和職群，幫你規劃個人化的升學路線圖，
            包含統測準備、技能培養、專題實作和面試練習。
          </p>
        </div>
      )}

      {/* 操作按鈕 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Link
          href="/roadmap"
          onClick={handleConfirm}
          style={{
            display: 'block',
            width: '100%',
            padding: '16px',
            borderRadius: '4px',
            background: 'linear-gradient(to right, #525f54, #6d5659)',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }}
        >
          進入我的路線圖
        </Link>
        <button
          onClick={() => router.push('/onboarding/step4')}
          style={{
            width: '100%',
            padding: '12px',
            color: '#434843',
            fontSize: '14px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'color 0.2s'
          }}
        >
          回上一步調整
        </button>
      </div>

      {/* 完成訊息 */}
      <div style={{ marginTop: '48px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: '#c8e6c9',
          borderRadius: '9999px',
          fontSize: '14px',
          color: '#2e7d32',
          fontWeight: '500'
        }}>
          <span style={{ fontSize: '16px' }}>✓</span>
          Onboarding 完成
        </div>
        <p style={{ fontSize: '12px', color: '#434843', marginTop: '8px' }}>
          之後可以在路線圖頁面隨時重新設定
        </p>
      </div>
    </div>
  );
}
