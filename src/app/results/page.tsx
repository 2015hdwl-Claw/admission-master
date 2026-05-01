'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadFromStorage, saveToStorage, generateId } from '@/lib/storage';
import type { AnonymousResult } from '@/types';

const STORAGE_KEY = 'anonymous-results';

export default function ResultsPage() {
  const [results, setResults] = useState<AnonymousResult[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formDepartment, setFormDepartment] = useState('');
  const [formUniversity, setFormUniversity] = useState('');
  const [formPathway, setFormPathway] = useState('');
  const [formAdvice, setFormAdvice] = useState('');

  useEffect(() => {
    const stored = loadFromStorage<AnonymousResult[]>(STORAGE_KEY, []);
    setResults(stored);
  }, []);

  function persist(newResults: AnonymousResult[]) {
    setResults(newResults);
    saveToStorage(STORAGE_KEY, newResults);
  }

  function handleSubmit() {
    if (!formDepartment.trim() || !formPathway.trim() || !formAdvice.trim()) return;

    const newResult: AnonymousResult = {
      id: generateId(),
      department: formDepartment.trim(),
      university: formUniversity.trim(),
      pathway: formPathway.trim(),
      advice: formAdvice.trim(),
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
    };

    persist([newResult, ...results]);
    setFormDepartment('');
    setFormUniversity('');
    setFormPathway('');
    setFormAdvice('');
    setShowForm(false);
  }

  function handleLike(resultId: string) {
    const updated = results.map(r => {
      if (r.id !== resultId) return r;
      if (r.likedBy.includes('current-user')) {
        return { ...r, likes: r.likes - 1, likedBy: r.likedBy.filter(u => u !== 'current-user') };
      }
      return { ...r, likes: r.likes + 1, likedBy: [...r.likedBy, 'current-user'] };
    });
    persist(updated);
  }

  const isFormValid = formDepartment.trim() && formPathway.trim() && formAdvice.trim();
  const sorted = [...results].sort((a, b) => b.likes - a.likes);

  return (
    <div className="page-container max-w-[48rem]">
      {/* Header */}
      <section className="mb-xl">
        <div className="border-l-4 border-primary pl-lg py-sm">
          <span className="font-label-caps text-primary uppercase tracking-widest block mb-xs">RESULT BOARD</span>
          <h1 className="font-h1 text-h1 text-on-surface">匿名結果牆</h1>
        </div>
        <p className="font-body-lg text-on-surface-variant mt-sm max-w-[42rem]">
          分享你的升學結果和經驗，幫助更多學生。
        </p>
      </section>

      {/* Add Button */}
      <div className="text-center mb-xxl">
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-xl py-sm font-label-caps text-label-caps tracking-widest hover:opacity-90 transition-all cursor-pointer"
        >
          + 分享我的升學結果
        </button>
      </div>

      {/* Results Grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-xxl">
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-lg">
            <span className="material-symbols-outlined text-on-surface-variant">edit_note</span>
          </div>
          <p className="font-h3 text-h3 text-on-surface-variant mb-sm">還沒有人分享結果</p>
          <p className="font-body-md text-on-surface-variant">成為第一個分享的人吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
          {sorted.map(result => {
            const isLiked = result.likedBy.includes('current-user');
            return (
              <div key={result.id} className="bg-surface-container-low border border-[#E9E5DB] p-xl hover:border-primary/30 transition-colors group">
                <div className="flex items-start justify-between mb-md">
                  <div className="min-w-0 flex-1 mr-3">
                    <h3 className="font-body-lg font-semibold text-on-surface truncate">{result.department}</h3>
                    {result.university && (
                      <p className="text-on-surface-variant text-sm mt-xs">{result.university}</p>
                    )}
                  </div>
                  <span className="bg-primary-fixed text-primary px-2.5 py-1 text-xs font-medium shrink-0">
                    {result.pathway}
                  </span>
                </div>
                <p className="font-body-md text-on-surface-variant leading-relaxed mb-lg">&ldquo;{result.advice}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleLike(result.id)}
                    className={
                      'flex items-center gap-1 transition-colors cursor-pointer ' +
                      (isLiked ? 'text-error' : 'text-on-surface-variant hover:text-red-400')
                    }
                  >
                    <span className="material-symbols-outlined text-[20px]">{isLiked ? 'favorite' : 'favorite_border'}</span>
                    <span className="text-sm">{result.likes}</span>
                  </button>
                  <span className="text-xs text-on-surface-variant">
                    {new Date(result.createdAt).toLocaleDateString('zh-TW')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Links */}
      {!showForm && (
        <div className="text-center mt-xxl space-x-4">
          <Link href="/analyze" className="text-primary text-sm font-medium cursor-pointer">分析我的成績</Link>
          <Link href="/explore" className="text-on-surface-variant hover:text-on-surface text-sm cursor-pointer">探索更多科系</Link>
          <Link href="/onboarding/step1" className="text-on-surface-variant hover:text-on-surface text-sm cursor-pointer">開始完整導入</Link>
        </div>
      )}

      {/* Submit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-low border border-[#E9E5DB] p-xl max-w-md w-full">
            <div className="flex items-center justify-between mb-lg">
              <h2 className="font-h3 text-h3 text-on-surface">分享升學結果</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-on-surface-variant hover:text-on-surface text-2xl cursor-pointer"
                aria-label="關閉"
              >
                &times;
              </button>
            </div>
            <p className="font-body-md text-on-surface-variant mb-lg">匿名分享，幫助學弟妹了解真實的升學經驗</p>
            <div className="space-y-4">
              <div>
                <label className="block font-label-caps text-label-caps text-primary mb-2 tracking-widest">錄取科系 *</label>
                <input
                  type="text"
                  value={formDepartment}
                  onChange={e => setFormDepartment(e.target.value)}
                  placeholder="例如：台大資工系"
                  className="w-full px-4 py-3 bg-white border border-[#E9E5DB] text-on-surface font-body-md outline-none focus:border-primary transition-colors rounded-sm"
                />
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-primary mb-2 tracking-widest">學校</label>
                <input
                  type="text"
                  value={formUniversity}
                  onChange={e => setFormUniversity(e.target.value)}
                  placeholder="例如：國立台灣大學"
                  className="w-full px-4 py-3 bg-white border border-[#E9E5DB] text-on-surface font-body-md outline-none focus:border-primary transition-colors rounded-sm"
                />
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-primary mb-2 tracking-widest">升學管道 *</label>
                <select
                  value={formPathway}
                  onChange={e => setFormPathway(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#E9E5DB] text-on-surface font-body-md outline-none focus:border-primary transition-colors rounded-sm cursor-pointer"
                >
                  <option value="">選擇管道</option>
                  <option value="申請入學">申請入學</option>
                  <option value="繁星推薦">繁星推薦</option>
                  <option value="分發入學">分發入學</option>
                  <option value="特殊選才">特殊選才</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-primary mb-2 tracking-widest">準備過程一句話 *</label>
                <textarea
                  value={formAdvice}
                  onChange={e => setFormAdvice(e.target.value)}
                  placeholder="用一句話分享你的準備經驗或建議..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-[#E9E5DB] text-on-surface font-body-md outline-none focus:border-primary transition-colors rounded-sm resize-none"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!isFormValid}
                className={
                  'w-full py-3 font-label-caps text-label-caps tracking-widest transition-all cursor-pointer ' +
                  (isFormValid ? 'bg-primary text-white hover:opacity-90' : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed')
                }
              >
                匿名分享
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
