'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { saveToStorage, loadFromStorage } from '@/lib/storage';
import {
  VOCATIONAL_CATEGORIES,
  VOCATIONAL_GROUP_COLORS,
  VOCATIONAL_GROUP_SUPER_CATEGORY,
  SUPER_CATEGORY_LABELS,
  getCategoriesByGroup,
} from '@/data/vocational-categories';
import type { SuperCategory } from '@/data/vocational-categories';
import type { VocationalGroup } from '@/types';
import { SKILL_CATEGORY_LABELS } from '@/types';

const SUPER_CATEGORIES: SuperCategory[] = [
  '工業類', '商業類', '設計類', '服務類', '資訊類', '農業類', '海事類', '語文類',
];

const SUPER_CATEGORY_COLORS: Record<SuperCategory, string> = {
  '工業類': 'bg-slate-100 text-slate-700',
  '商業類': 'bg-emerald-100 text-emerald-700',
  '設計類': 'bg-pink-100 text-pink-700',
  '服務類': 'bg-orange-100 text-orange-700',
  '資訊類': 'bg-blue-100 text-blue-700',
  '農業類': 'bg-green-100 text-green-700',
  '海事類': 'bg-indigo-100 text-indigo-700',
  '語文類': 'bg-teal-100 text-teal-700',
};

function getGroupsForSuperCategory(superCat: SuperCategory): VocationalGroup[] {
  const entries = Object.entries(VOCATIONAL_GROUP_SUPER_CATEGORY);
  return entries
    .filter(([, v]) => v === superCat)
    .map(([k]) => k as VocationalGroup);
}

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [activeSuperCategory, setActiveSuperCategory] = useState<SuperCategory | null>(null);

  const filtered = useMemo(() => {
    const groups =
      activeSuperCategory
        ? getGroupsForSuperCategory(activeSuperCategory)
        : null;

    return VOCATIONAL_CATEGORIES.filter(cat => {
      const matchSearch =
        !search ||
        cat.name.includes(search) ||
        cat.description.includes(search) ||
        cat.group.includes(search);
      const matchGroup = !groups || groups.includes(cat.group);
      return matchSearch && matchGroup;
    });
  }, [search, activeSuperCategory]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">職群探索</h1>
        <p className="text-gray-500">探索 15 個職群，找到適合你的方向</p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜尋科類名稱、描述或職群..."
          className="w-full max-w-md mx-auto block px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
      </div>

      {/* SuperCategory filter buttons */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <button
          onClick={() => setActiveSuperCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !activeSuperCategory
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        {SUPER_CATEGORIES.map(sc => (
          <button
            key={sc}
            onClick={() => setActiveSuperCategory(sc)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeSuperCategory === sc
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {sc}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(cat => {
          const groupColor = VOCATIONAL_GROUP_COLORS[cat.group];
          const superCat = VOCATIONAL_GROUP_SUPER_CATEGORY[cat.group];
          const superCatColor = SUPER_CATEGORY_COLORS[superCat];

          return (
            <div
              key={cat.id}
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Badges */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium text-white ${groupColor}`}
                >
                  {cat.group}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${superCatColor}`}
                >
                  {superCat}
                </span>
              </div>

              {/* Name & Description */}
              <h3 className="font-bold text-gray-900 mb-2">{cat.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">
                {cat.description}
              </p>

              {/* Required Skills */}
              <div className="flex flex-wrap gap-1 mb-3">
                {cat.requiredSkills.map(skill => (
                  <span
                    key={skill}
                    className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded"
                  >
                    {SKILL_CATEGORY_LABELS[skill]}
                  </span>
                ))}
              </div>

              {/* Example Departments */}
              <div className="text-xs text-gray-400 mb-1">
                相關科系：{cat.exampleDepartments.slice(0, 3).join('、')}
              </div>

              {/* Example Tech Schools */}
              <div className="text-xs text-gray-400 mb-1">
                <span className="font-medium text-gray-500">推薦科技大學：</span>
                {cat.exampleTechSchools.slice(0, 3).join('、')}
              </div>

              {/* Career Outlook */}
              {cat.careerOutlook && (
                <div className="text-xs text-gray-400 mb-1">
                  <span className="font-medium text-gray-500">職涯展望：</span>
                  {cat.careerOutlook}
                </div>
              )}

              {/* Starting Salary */}
              {cat.startingSalary && (
                <div className="text-xs text-gray-400 mb-3">
                  <span className="font-medium text-gray-500">起薪：</span>
                  {cat.startingSalary}
                </div>
              )}

              {/* Spacer to push button to bottom */}
              <div className="flex-1" />

              {/* CTA Button */}
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
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          找不到符合條件的科類，試試其他關鍵字
        </div>
      )}

      {/* Navigation hints */}
      <div className="text-center mt-8 space-x-4">
        <Link
          href="/onboarding/step1"
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          完整導入流程
        </Link>
        <Link
          href="/roadmap"
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          我的路線圖
        </Link>
      </div>
    </div>
  );
}
