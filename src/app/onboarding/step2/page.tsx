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
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-on-background mb-2">
            興趣探索
          </h1>
          <p className="text-on-surface-variant">
            還沒有太多經歷沒關係，回答幾個問題幫你找到方向
          </p>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-on-surface-variant mb-2">
            <span>問題 {currentQuestion + 1} / {INTEREST_QUESTIONS.length}</span>
            <span>{Math.round(((currentQuestion + 1) / INTEREST_QUESTIONS.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / INTEREST_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-surface-container-low border border-[#E9E5DB] p-xl">
          <h2 className="font-serif text-lg font-bold text-on-background mb-6">{question.question}</h2>
          <div className="space-y-3">
            {question.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleInterestAnswer(question.id, opt.value)}
                className={`w-full p-4 rounded-md border-2 text-left transition-all ${
                  answered?.answer === opt.value
                    ? 'border-primary bg-primary-fixed'
                    : 'border-[#E9E5DB] hover:border-outline hover:bg-surface-container-low'
                }`}
              >
                <span className="font-medium text-on-background">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          {currentQuestion > 0 && (
            <button
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              className="flex-1 py-3 rounded-md border border-[#E9E5DB] text-on-surface-variant font-medium hover:bg-surface-container-low transition-colors cursor-pointer"
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
            className={`flex-1 py-3 rounded-md font-bold transition-all ${
              answered
                ? 'bg-gradient-to-r from-primary to-tertiary text-white hover:from-indigo-700 hover:to-purple-700  cursor-pointer'
                : 'bg-surface-container-high text-outline cursor-not-allowed'
            }`}
          >
            {isLast ? '查看結果' : '下一題'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-on-background mb-2">
          你已經做了什麼？
        </h1>
        <p className="text-on-surface-variant">勾選你已經完成的項目，填越多建議越準</p>
        {selectedCount > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-primary-fixed rounded-full text-sm text-primary font-medium">
            已選 {selectedCount} 項
          </div>
        )}
      </div>

      <div className="space-y-4">
        {FACT_CATEGORY_ORDER.map(cat => {
          const templates = VOCATIONAL_FACT_TEMPLATES.filter(t => t.category === cat);
          const isExpanded = expandedCategories.has(cat);
          const selectedInCat = templates.filter(t => selectedIds.has(t.id)).length;

          return (
            <div key={cat} className="bg-white rounded-sm border border-[#E9E5DB]  overflow-hidden">
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <h3 className="font-serif font-bold text-on-background">{FACT_CATEGORY_LABELS[cat]}</h3>
                  {selectedInCat > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary rounded-full font-medium">
                      {selectedInCat}
                    </span>
                  )}
                </div>
                <span className={`text-outline transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  &#9660;
                </span>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 space-y-2">
                  {templates.map(t => {
                    const isSelected = selectedIds.has(t.id);
                    return (
                      <div key={t.id}>
                        <label className="flex items-start gap-3 p-3 rounded-md hover:bg-surface-container-low cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleFact(t.id)}
                            className="mt-0.5 w-5 h-5 rounded border-outline text-primary focus:ring-primary"
                          />
                          <div className="flex-1">
                            <span className="font-medium text-on-background text-sm">{t.label}</span>
                            {isSelected && (
                              <input
                                type="text"
                                value={details[t.id] || ''}
                                onChange={e => setDetails(prev => ({ ...prev, [t.id]: e.target.value }))}
                                placeholder={t.placeholder}
                                className="mt-2 input text-sm"
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

      <div className="mt-8 space-y-3">
        <button
          onClick={handleNext}
          className={`w-full py-4 rounded-sm text-lg font-bold transition-all ${
            selectedCount > 0
              ? 'bg-gradient-to-r from-primary to-tertiary text-white hover:from-indigo-700 hover:to-purple-700  cursor-pointer'
              : 'bg-gradient-to-r from-primary to-tertiary text-white hover:from-indigo-700 hover:to-purple-700  cursor-pointer'
          }`}
        >
          {selectedCount > 0 ? `下一步（${selectedCount} 項事實）` : '跳過，直接看結果'}
        </button>
        {selectedCount === 0 && (
          <button
            onClick={skipToInterest}
            className="w-full py-3 text-primary text-sm font-medium hover:underline cursor-pointer"
          >
            沒什麼經歷？改用興趣探索模式
          </button>
        )}
      </div>
    </div>
  );
}
