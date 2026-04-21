'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { saveToStorage, loadFromStorage } from '@/lib/storage';
import { ACADEMIC_CATEGORIES } from '@/data/academic-categories';
import type { AcademicGroup, LearningCode } from '@/types';

const GROUPS: AcademicGroup[] = ['人文', '社會', '自然', '工程', '商管', '醫藥衛', '藝術'];

const CODE_LABELS: Record<LearningCode, string> = {
  B: 'B 書面報告', C: 'C 實作作品', D: 'D 自然探究', E: 'E 社會探究',
  F: 'F 自主學習', G: 'G 社團', H: 'H 幹部', I: 'I 服務學習',
  J: 'J 競賽', K: 'K 作品', L: 'L 檢定', M: 'M 特殊表現'
};

const GROUP_COLORS: Record<AcademicGroup, string> = {
  '人文': 'bg-amber-100 text-amber-700',
  '社會': 'bg-blue-100 text-blue-700',
  '自然': 'bg-green-100 text-green-700',
  '工程': 'bg-purple-100 text-purple-700',
  '商管': 'bg-orange-100 text-orange-700',
  '醫藥衛': 'bg-red-100 text-red-700',
  '藝術': 'bg-pink-100 text-pink-700',
};

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState<AcademicGroup | null>(null);

  const filtered = useMemo(() => {
    return ACADEMIC_CATEGORIES.filter(cat => {
      const matchSearch = !search || cat.name.includes(search) || cat.description.includes(search);
      const matchGroup = !activeGroup || cat.group === activeGroup;
      return matchSearch && matchGroup;
    });
  }, [search, activeGroup]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">科系探索</h1>
        <p className="text-gray-500">探索 58 個學類，找到你感興趣的方向</p>
      </div>

      <div className="mb-8">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜尋學類名稱..."
          className="w-full max-w-md mx-auto block px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <button
          onClick={() => setActiveGroup(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !activeGroup ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        {GROUPS.map(g => (
          <button
            key={g}
            onClick={() => setActiveGroup(g)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeGroup === g ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(cat => (
          <div key={cat.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${GROUP_COLORS[cat.group]}`}>
                {cat.group}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{cat.name}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">{cat.description}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {cat.suggestedCodes.map(code => (
                <span key={code} className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded">
                  {CODE_LABELS[code]}
                </span>
              ))}
            </div>
            <div className="text-xs text-gray-400">
              相關科系：{cat.exampleDepartments.slice(0, 2).join('、')}
            </div>
            <button
              onClick={() => {
                const profile = loadFromStorage<any>('onboarding-profile', null);
                if (profile) {
                  saveToStorage('onboarding-profile', {
                    ...profile,
                    selectedDirections: [cat.name],
                  });
                }
              }}
              className="mt-3 w-full py-2 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              這是我的方向
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          找不到符合條件的學類，試試其他關鍵字
        </div>
      )}

      {/* Navigation hints */}
      <div className="text-center mt-8 space-x-4">
        <Link href="/onboarding/step1" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          完整導入流程
        </Link>
        <Link href="/roadmap" className="text-gray-500 hover:text-gray-700 text-sm">
          我的路線圖
        </Link>
      </div>
    </div>
  );
}
