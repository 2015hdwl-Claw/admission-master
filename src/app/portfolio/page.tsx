'use client';

import { useState, useEffect, useMemo } from 'react';
import { LEARNING_CODE_LABELS, LEARNING_CODE_COLORS } from '@/data/national-calendar';
import { loadFromStorage, saveToStorage, generateId } from '@/lib/storage';
import type { PortfolioItem, LearningCode, PortfolioSuggestion, OnboardingProfile } from '@/types';

const ALL_CODES: LearningCode[] = ['B','C','D','E','F','G','H','I','J','K','L','M'];
const STORAGE_KEY = 'portfolio-items';

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [filterCode, setFilterCode] = useState<LearningCode | 'ALL'>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCode, setFormCode] = useState<LearningCode>('B');
  const [formDate, setFormDate] = useState('');

  const [isPro, setIsPro] = useState(false);
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [suggestion, setSuggestion] = useState<PortfolioSuggestion | null>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);

  useEffect(() => {
    const stored = loadFromStorage<PortfolioItem[]>(STORAGE_KEY, []);
    setItems(stored);
    const sub = loadFromStorage<{ plan: string; expiresAt: string | null }>('user-subscription', { plan: 'free', expiresAt: null });
    setIsPro(sub.plan !== 'free');
    const profileStored = loadFromStorage<OnboardingProfile | null>('onboarding-profile', null);
    setProfile(profileStored);
  }, []);

  function persist(newItems: PortfolioItem[]) {
    setItems(newItems);
    saveToStorage(STORAGE_KEY, newItems);
  }

  function handleAdd() {
    if (!formTitle.trim() || !formContent.trim() || !formDate) return;
    const newItem: PortfolioItem = {
      id: generateId(),
      title: formTitle.trim(),
      content: formContent.trim(),
      code: formCode,
      date: formDate,
      createdAt: new Date().toISOString(),
    };
    persist([...items, newItem]);
    setFormTitle('');
    setFormContent('');
    setFormDate('');
    setShowForm(false);
  }

  function handleDelete(id: string) {
    persist(items.filter(i => i.id !== id));
  }

  async function fetchSuggestion() {
    if (!isPro) return;
    setIsLoadingSuggestion(true);

    const direction = profile?.selectedDirections[0] || '未指定';
    const directionGroup = profile ? (profile.track === '自然組' ? '工程' : profile.track === '社會組' ? '社會' : '工程') : '工程';

    try {
      const res = await fetch('/api/portfolio-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          direction,
          directionGroup,
          portfolioItems: items.map(i => ({ code: i.code, title: i.title, content: i.content })),
        }),
      });

      const data = await res.json();
      if (data.error) {
        setSuggestion(null);
      } else {
        setSuggestion({
          missingCodes: data.missingCodes || [],
          suggestions: data.suggestions || [],
          priority: data.priority || '',
        });
      }
    } catch {
      setSuggestion(null);
    }
    setIsLoadingSuggestion(false);
    setShowSuggestion(true);
  }

  const filtered = useMemo(() => {
    const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));
    if (filterCode === 'ALL') return sorted;
    return sorted.filter(i => i.code === filterCode);
  }, [items, filterCode]);

  const codeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_CODES.forEach(c => counts[c] = 0);
    items.forEach(i => { counts[i.code] = (counts[i.code] || 0) + 1; });
    return counts;
  }, [items]);

  const totalItems = items.length;
  const coveredCodes = ALL_CODES.filter(c => codeCounts[c] > 0).length;
  const coveragePct = Math.round((coveredCodes / ALL_CODES.length) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">素材記錄</h1>
        <p className="text-gray-500">輕量記錄你的學習歷程素材，按代碼分類管理</p>
      </div>

      {/* Coverage Overview */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">代碼覆蓋率</h3>
          <div className="text-right">
            <span className="text-2xl font-bold text-indigo-600">{coveragePct}%</span>
            <span className="text-sm text-gray-400 ml-1">({coveredCodes}/{ALL_CODES.length})</span>
          </div>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all"
            style={{ width: coveragePct + '%' }}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {ALL_CODES.map(code => {
            const count = codeCounts[code];
            return (
              <button
                key={code}
                onClick={() => setFilterCode(filterCode === code ? 'ALL' : code)}
                className={'p-3 rounded-xl border text-left transition-colors ' + (filterCode === code ? 'border-indigo-300 bg-indigo-50' : count > 0 ? 'border-green-200 bg-green-50' : 'border-gray-100 hover:border-gray-200')}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-700">{LEARNING_CODE_LABELS[code]}</span>
                  <span className={'text-xs font-bold ' + (count > 0 ? 'text-green-600' : 'text-gray-300')}>{count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={'h-full rounded-full transition-all ' + (count > 0 ? LEARNING_CODE_COLORS[code] : 'bg-gray-200')}
                    style={{ width: count > 0 ? '100%' : '0%' }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Suggestion */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">AI 素材建議</h3>
            <p className="text-sm text-gray-500">根據你的方向和已有素材，建議下一步該補什麼</p>
          </div>
          {!isPro ? (
            <a href="/pricing" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors">
              Pro 解鎖
            </a>
          ) : (
            <button
              onClick={fetchSuggestion}
              disabled={isLoadingSuggestion}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isLoadingSuggestion ? '分析中...' : '取得建議'}
            </button>
          )}
        </div>

        {showSuggestion && suggestion && (
          <div className="mt-4 space-y-3">
            {suggestion.missingCodes.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">缺少的代碼：</p>
                <div className="flex flex-wrap gap-2">
                  {suggestion.missingCodes.map(code => (
                    <span key={code} className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
                      {LEARNING_CODE_LABELS[code as LearningCode] || code}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {suggestion.priority && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <p className="text-sm font-bold text-indigo-700 mb-1">最優先補充</p>
                <p className="text-sm text-indigo-800">{suggestion.priority}</p>
              </div>
            )}
            {suggestion.suggestions.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">具體建議：</p>
                <ul className="space-y-1.5">
                  {suggestion.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-indigo-400 mt-1">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {showSuggestion && !suggestion && !isLoadingSuggestion && (
          <p className="text-sm text-gray-400 mt-4">無法取得建議，請確認已設定升學方向。</p>
        )}
      </div>

      {/* Add Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {filterCode === 'ALL' ? '全部' : LEARNING_CODE_LABELS[filterCode]} ({filtered.length})
          </span>
          {filterCode !== 'ALL' && (
            <button onClick={() => setFilterCode('ALL')} className="text-xs text-indigo-600 hover:underline">
              顯示全部
            </button>
          )}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg"
        >
          + 新增素材
        </button>
      </div>

      {/* Items List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>還沒有素材記錄</p>
          <p className="text-sm mt-1">點擊「新增素材」開始累積你的學習歷程</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item.id} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={'inline-block w-3 h-3 rounded-full ' + LEARNING_CODE_COLORS[item.code]} />
                  <span className="text-xs font-medium text-gray-500">{LEARNING_CODE_LABELS[item.code]}</span>
                  <span className="text-xs text-gray-400">{item.date}</span>
                </div>
                <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500 text-sm">
                  刪除
                </button>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{item.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">新增素材</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">標題</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="例如：閱讀《人間失格》心得"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">內容</label>
                <textarea
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  placeholder="記錄你的心得、過程、收穫..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">學習歷程代碼</label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_CODES.map(code => (
                    <button
                      key={code}
                      onClick={() => setFormCode(code)}
                      className={'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ' + (formCode === code ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
                    >
                      {LEARNING_CODE_LABELS[code]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <button
                onClick={handleAdd}
                disabled={!formTitle.trim() || !formContent.trim() || !formDate}
                className={'w-full py-3 rounded-xl font-bold transition-all ' + (formTitle.trim() && formContent.trim() && formDate ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed')}
              >
                新增素材
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
