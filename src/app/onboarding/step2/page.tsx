'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadFromStorage, saveToStorage, generateId } from '@/lib/storage';
import type { VocationalUserFact, VocationalFactCategory, OnboardingProfile, InterestAnswer, InterestQuestion } from '@/types';
import { INTEREST_QUESTIONS, deriveFromInterests } from '@/lib/direction-engine';
import { VOCATIONAL_FACT_TEMPLATES, FACT_CATEGORY_LABELS, FACT_CATEGORY_ORDER } from '@/data/vocational-direction-rules';
import type { VocationalFactTemplate } from '@/data/vocational-direction-rules';

export default function Step2Page() {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [details, setDetails] = useState<Record<string, string>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<VocationalFactCategory>>(
    new Set(FACT_CATEGORY_ORDER)
  );
  const [isInterestMode, setIsInterestMode] = useState(false);
  const [interestAnswers, setInterestAnswers] = useState<InterestAnswer[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    const profile = loadFromStorage<OnboardingProfile | null>('onboarding-profile', null);
    if (profile) {
      setSelectedIds(new Set(profile.facts.map(f => f.id)));
      const detailMap: Record<string, string> = {};
      profile.facts.forEach(f => { detailMap[f.id] = f.detail; });
      setDetails(detailMap);
      setIsInterestMode(profile.isInterestMode);
      setInterestAnswers(profile.interestAnswers);
    }
  }, []);

  function toggleFact(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleCategory(cat: VocationalFactCategory) {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function handleInterestAnswer(questionId: number, answer: string) {
    const newAnswer: InterestAnswer = { questionId, answer };
    setInterestAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== questionId);
      return [...filtered, newAnswer];
    });
  }

  function handleNext() {
    if (isInterestMode) {
      const profile = loadFromStorage<OnboardingProfile | null>('onboarding-profile', null);
      const updated: OnboardingProfile = {
        grade: profile?.grade ?? '高一',
        track: profile?.track ?? '未決定',
        facts: [],
        interestAnswers,
        isInterestMode: true,
        selectedDirections: profile?.selectedDirections ?? [],
        completedSteps: Math.max(profile?.completedSteps ?? 0, 2),
      };
      saveToStorage('onboarding-profile', updated);

      const directions = deriveFromInterests(interestAnswers);
      saveToStorage('direction-results', directions);
      router.push('/onboarding/step3');
      return;
    }

    const facts: VocationalUserFact[] = [];
    for (const template of VOCATIONAL_FACT_TEMPLATES) {
      if (!selectedIds.has(template.id)) continue;
      facts.push({
        id: template.id,
        category: template.category,
        label: template.label,
        detail: details[template.id] || template.label,
      });
    }

    const profile = loadFromStorage<OnboardingProfile | null>('onboarding-profile', null);
    const updated: OnboardingProfile = {
      grade: profile?.grade ?? '高一',
      track: profile?.track ?? '未決定',
      facts: facts as OnboardingProfile['facts'],
      interestAnswers: profile?.interestAnswers ?? [],
      isInterestMode: false,
      selectedDirections: profile?.selectedDirections ?? [],
      completedSteps: Math.max(profile?.completedSteps ?? 0, 2),
    };
    saveToStorage('onboarding-profile', updated);

    if (facts.length === 0) {
      setIsInterestMode(true);
      return;
    }

    router.push('/onboarding/step3');
  }

  function skipToInterest() {
    setIsInterestMode(true);
  }

  const selectedCount = selectedIds.size;

  if (isInterestMode) {
    const question = INTEREST_QUESTIONS[currentQuestion];
    const isLast = currentQuestion === INTEREST_QUESTIONS.length - 1;
    const answered = interestAnswers.find(a => a.questionId === question.id);

    return (
      <div style={{ maxWidth: '512px', margin: '0 auto', padding: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontFamily: 'serif',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1b1c1b',
            marginBottom: '8px'
          }}>
            興趣探索
          </h1>
          <p style={{ color: '#434843' }}>
            還沒有太多經歷沒關係，回答幾個問題幫你找到方向
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#434843', marginBottom: '8px' }}>
            <span>問題 {currentQuestion + 1} / {INTEREST_QUESTIONS.length}</span>
            <span>{Math.round(((currentQuestion + 1) / INTEREST_QUESTIONS.length) * 100)}%</span>
          </div>
          <div style={{ height: '8px', background: '#e4e2e0', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                background: '#525f54',
                borderRadius: '9999px',
                transition: 'all 0.3s',
                width: `${((currentQuestion + 1) / INTEREST_QUESTIONS.length) * 100}%`
              }}
            />
          </div>
        </div>

        <div style={{
          background: '#f5f3f1',
          border: '1px solid #E9E5DB',
          padding: '24px'
        }}>
          <h2 style={{
            fontFamily: 'serif',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1b1c1b',
            marginBottom: '24px'
          }}>{question.question}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {question.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleInterestAnswer(question.id, opt.value)}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '2px solid',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  background: answered?.answer === opt.value ? '#d8e6d7' : 'white',
                  borderColor: answered?.answer === opt.value ? '#525f54' : '#E9E5DB',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontWeight: '500', color: '#1b1c1b' }}>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          {currentQuestion > 0 && (
            <button
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #E9E5DB',
                color: '#434843',
                fontWeight: '500',
                background: 'white',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              上一題
            </button>
          )}
          <button
            onClick={() => {
              if (isLast) {
                handleNext();
              } else {
                setCurrentQuestion(prev => prev + 1);
              }
            }}
            disabled={!answered}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '6px',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              background: answered ? 'linear-gradient(to right, #525f54, #6d5659)' : '#e4e2e0',
              color: answered ? 'white' : '#747873',
              border: 'none',
              cursor: answered ? 'pointer' : 'not-allowed',
              opacity: answered ? 1 : 0.5
            }}
          >
            {isLast ? '查看結果' : '下一題'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '672px', margin: '0 auto', padding: '16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'serif',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1b1c1b',
          marginBottom: '8px'
        }}>
          你已經做了什麼？
        </h1>
        <p style={{ color: '#434843' }}>勾選你已經完成的項目，填越多建議越準</p>
        {selectedCount > 0 && (
          <div style={{
            marginTop: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#d8e6d7',
            borderRadius: '9999px',
            fontSize: '14px',
            color: '#525f54',
            fontWeight: '500'
          }}>
            已選 {selectedCount} 項
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {FACT_CATEGORY_ORDER.map(cat => {
          const templates = VOCATIONAL_FACT_TEMPLATES.filter(t => t.category === cat);
          const isExpanded = expandedCategories.has(cat);
          const selectedInCat = templates.filter(t => selectedIds.has(t.id)).length;

          return (
            <div key={cat} style={{
              background: 'white',
              borderRadius: '4px',
              border: '1px solid #E9E5DB',
              overflow: 'hidden'
            }}>
              <button
                onClick={() => toggleCategory(cat)}
                style={{
                  width: '100%',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 style={{ fontFamily: 'serif', fontWeight: 'bold', color: '#1b1c1b' }}>
                    {FACT_CATEGORY_LABELS[cat]}
                  </h3>
                  {selectedInCat > 0 && (
                    <span style={{
                      fontSize: '12px',
                      padding: '2px 8px',
                      background: '#e8f0ed',
                      color: '#525f54',
                      borderRadius: '9999px',
                      fontWeight: '500'
                    }}>
                      {selectedInCat}
                    </span>
                  )}
                </div>
                <span style={{
                  color: '#747873',
                  transition: 'transform 0.2s',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </button>
              {isExpanded && (
                <div style={{ padding: '16px', paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {templates.map(t => {
                    const isSelected = selectedIds.has(t.id);
                    return (
                      <div key={t.id}>
                        <label style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleFact(t.id)}
                            style={{
                              marginTop: '2px',
                              width: '20px',
                              height: '20px',
                              borderRadius: '4px',
                              border: '1px solid #747873',
                              cursor: 'pointer'
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <span style={{ fontWeight: '500', color: '#1b1c1b', fontSize: '14px' }}>
                              {t.label}
                            </span>
                            {isSelected && (
                              <input
                                type="text"
                                value={details[t.id] || ''}
                                onChange={e => setDetails(prev => ({ ...prev, [t.id]: e.target.value }))}
                                placeholder={t.placeholder}
                                style={{
                                  marginTop: '8px',
                                  width: '100%',
                                  padding: '8px 16px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '4px',
                                  fontSize: '14px',
                                  outline: 'none'
                                }}
                                onClick={e => e.stopPropagation()}
                              />
                            )}
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={handleNext}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '4px',
            fontSize: '18px',
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #525f54, #6d5659)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {selectedCount > 0 ? `下一步（${selectedCount} 項事實）` : '跳過，直接看結果'}
        </button>
        {selectedCount === 0 && (
          <button
            onClick={skipToInterest}
            style={{
              width: '100%',
              padding: '12px',
              color: '#525f54',
              fontSize: '14px',
              fontWeight: '500',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            沒什麼經歷？改用興趣探索模式
          </button>
        )}
      </div>
    </div>
  );
}
