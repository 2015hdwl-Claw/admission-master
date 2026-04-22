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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            興趣探索
          </h1>
          <p className="text-gray-500">
            還沒有太多經歷沒關係，回答幾個問題幫你找到方向
          </p>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>問題 {currentQuestion + 1} / {INTEREST_QUESTIONS.length}</span>
            <span>{Math.round(((currentQuestion + 1) / INTEREST_QUESTIONS.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / INTEREST_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">{question.question}</h2>
          <div className="space-y-3">
            {question.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleInterestAnswer(question.id, opt.value)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  answered?.answer === opt.value
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium text-gray-900">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          {currentQuestion > 0 && (
            <button
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
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
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              answered
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          你已經做了什麼？
        </h1>
        <p className="text-gray-500">勾選你已經完成的項目，填越多建議越準</p>
        {selectedCount > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-sm text-indigo-600 font-medium">
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
            <div key={cat} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-gray-900">{FACT_CATEGORY_LABELS[cat]}</h3>
                  {selectedInCat > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full font-medium">
                      {selectedInCat}
                    </span>
                  )}
                </div>
                <span className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  &#9660;
                </span>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 space-y-2">
                  {templates.map(t => {
                    const isSelected = selectedIds.has(t.id);
                    return (
                      <div key={t.id}>
                        <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleFact(t.id)}
                            className="mt-0.5 w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="flex-1">
                            <span className="font-medium text-gray-900 text-sm">{t.label}</span>
                            {isSelected && (
                              <input
                                type="text"
                                value={details[t.id] || ''}
                                onChange={e => setDetails(prev => ({ ...prev, [t.id]: e.target.value }))}
                                placeholder={t.placeholder}
                                className="mt-2 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
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
          className={`w-full py-4 rounded-2xl text-lg font-bold transition-all ${
            selectedCount > 0
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg'
          }`}
        >
          {selectedCount > 0 ? `下一步（${selectedCount} 項事實）` : '跳過，直接看結果'}
        </button>
        {selectedCount === 0 && (
          <button
            onClick={skipToInterest}
            className="w-full py-3 text-indigo-600 text-sm font-medium hover:underline"
          >
            沒什麼經歷？改用興趣探索模式
          </button>
        )}
      </div>
    </div>
  );
}
