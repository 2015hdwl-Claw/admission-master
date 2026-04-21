'use client';

import { useState, useEffect } from 'react';
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

  const sorted = [...results].sort((a, b) => b.likes - a.likes);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">匿名結果牆</h1>
        <p className="text-gray-500">分享你的升學結果和經驗，幫助更多學生</p>
      </div>

      {/* Add Button */}
      <div className="text-center mb-8">
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg"
        >
          + 分享我的升學結果
        </button>
      </div>

      {/* Results Grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-gray-400 mb-1">還沒有人分享結果</p>
          <p className="text-sm text-gray-400">成為第一個分享的人吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sorted.map(result => (
            <div key={result.id} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{result.department}</h3>
                  {result.university && (
                    <p className="text-xs text-gray-400">{result.university}</p>
                  )}
                </div>
                <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium">
                  {result.pathway}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">&ldquo;{result.advice}&rdquo;</p>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleLike(result.id)}
                  className={
                    'flex items-center gap-1 text-sm transition-colors ' +
                    (result.likedBy.includes('current-user')
                      ? 'text-red-500'
                      : 'text-gray-400 hover:text-red-400')
                  }
                >
                  <span>{result.likedBy.includes('current-user') ? '❤️' : '🤍'}</span>
                  <span>{result.likes}</span>
                </button>
                <span className="text-xs text-gray-300">
                  {new Date(result.createdAt).toLocaleDateString('zh-TW')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">分享升學結果</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <p className="text-sm text-gray-500 mb-4">匿名分享，幫助學弟妹了解真實的升學經驗</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">錄取科系 *</label>
                <input
                  type="text"
                  value={formDepartment}
                  onChange={e => setFormDepartment(e.target.value)}
                  placeholder="例如：台大資工系"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">學校</label>
                <input
                  type="text"
                  value={formUniversity}
                  onChange={e => setFormUniversity(e.target.value)}
                  placeholder="例如：國立台灣大學"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">升學管道 *</label>
                <select
                  value={formPathway}
                  onChange={e => setFormPathway(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">準備過程一句話 *</label>
                <textarea
                  value={formAdvice}
                  onChange={e => setFormAdvice(e.target.value)}
                  placeholder="用一句話分享你的準備經驗或建議..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!formDepartment.trim() || !formPathway.trim() || !formAdvice.trim()}
                className={
                  'w-full py-3 rounded-xl font-bold transition-all ' +
                  (formDepartment.trim() && formPathway.trim() && formAdvice.trim()
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed')
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
