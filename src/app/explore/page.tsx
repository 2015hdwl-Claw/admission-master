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
  '商業類': 'bg-success-container text-success',
  '設計類': 'bg-secondary-container text-secondary',
  '服務類': 'bg-orange-100 text-orange-700',
  '資訊類': 'bg-primary-fixed text-primary',
  '農業類': 'bg-success-container text-success',
  '海事類': 'bg-primary-fixed text-primary',
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
    const groups = activeSuperCategory ? getGroupsForSuperCategory(activeSuperCategory) : null;
    return VOCATIONAL_CATEGORIES.filter(cat => {
      const matchSearch = !search || cat.name.includes(search) || cat.description.includes(search) || cat.group.includes(search);
      const matchGroup = !groups || groups.includes(cat.group);
      return matchSearch && matchGroup;
    });
  }, [search, activeSuperCategory]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach(cat => {
      const key = cat.group;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(cat);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="page-container">
      {/* Header */}
      <section className="mb-xl">
        <div className="border-l-4 border-primary pl-lg py-sm">
          <span className="font-label-caps text-primary uppercase tracking-widest block mb-xs">EXPLORE</span>
          <h1 className="font-h1 text-h1 text-on-surface">看看各個方向</h1>
        </div>
        <p className="font-body-lg text-on-surface-variant mt-sm max-w-[42rem]">
          15 個職群、多個科別，找到最適合你的方向。點擊「這是我的方向」將更新你的升學路線圖。
        </p>
      </section>

      {/* Search */}
      <div className="mb-xxl">
        <div className="relative max-w-[32rem]">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜尋科類名稱、描述或職群..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#E9E5DB] text-on-surface font-body-md outline-none focus:border-primary transition-colors rounded-sm"
          />
        </div>
      </div>

      {/* SuperCategory filter */}
      <div className="flex flex-wrap gap-2 mb-xxl">
        <button
          onClick={() => setActiveSuperCategory(null)}
          className={`px-lg py-sm text-sm font-label-caps tracking-widest transition-colors cursor-pointer ${
            !activeSuperCategory
              ? 'bg-primary text-white'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-[#E9E5DB]'
          }`}
        >
          全部
        </button>
        {SUPER_CATEGORIES.map(sc => (
          <button
            key={sc}
            onClick={() => setActiveSuperCategory(sc)}
            className={`px-lg py-sm text-sm font-label-caps tracking-widest transition-colors cursor-pointer ${
              activeSuperCategory === sc
                ? 'bg-primary text-white'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-[#E9E5DB]'
            }`}
          >
            {sc}
          </button>
        ))}
      </div>

      {/* Grouped Cards */}
      <div className="space-y-xxl">
        {grouped.map(([group, cats]) => {
          const groupColor = VOCATIONAL_GROUP_COLORS[group as VocationalGroup] || 'bg-primary text-white';
          const categories = getCategoriesByGroup(group as VocationalGroup);
          return (
            <div key={group}>
              {/* Group Header */}
              <div className="flex items-center gap-4 mb-gutter">
                <span className={`text-xs px-3 py-1 font-label-caps tracking-widest text-white ${groupColor}`}>{group}</span>
                <div className="h-px flex-1 bg-outline-variant" />
                <span className="text-xs text-on-surface-variant font-label-caps">{cats.length} 個科別</span>
              </div>

              {/* Category Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                {cats.map(cat => {
                  const superCat = VOCATIONAL_GROUP_SUPER_CATEGORY[cat.group];
                  const superCatColor = SUPER_CATEGORY_COLORS[superCat];
                  return (
                    <div key={cat.id} className="bg-surface-container-low border border-[#E9E5DB] p-xl flex flex-col hover:border-primary/30 transition-colors group">
                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <span className={`text-xs px-2.5 py-1 font-medium text-white ${groupColor}`}>{cat.group}</span>
                        <span className={`text-xs px-2 py-0.5 font-medium ${superCatColor}`}>{superCat}</span>
                      </div>

                      {/* Name & Description */}
                      <h3 className="font-body-lg font-semibold text-on-surface mb-2 group-hover:text-primary transition-colors">{cat.name}</h3>
                      <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{cat.description}</p>

                      {/* Required Skills */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {cat.requiredSkills.map(skill => (
                          <span key={skill} className="text-xs px-2 py-0.5 bg-primary-fixed text-primary font-medium">
                            {SKILL_CATEGORY_LABELS[skill]}
                          </span>
                        ))}
                      </div>

                      {/* Details */}
                      <div className="text-xs text-on-surface-variant space-y-1 mb-4">
                        <p>相關科系：{cat.exampleDepartments.slice(0, 3).join('、')}</p>
                        <p><span className="font-medium">推薦科技大學：</span>{cat.exampleTechSchools.slice(0, 3).join('、')}</p>
                        {cat.careerOutlook && <p><span className="font-medium">職涯展望：</span>{cat.careerOutlook}</p>}
                        {cat.startingSalary && <p><span className="font-medium">起薪：</span>{cat.startingSalary}</p>}
                      </div>

                      {/* Spacer */}
                      <div className="flex-1" />

                      {/* CTA */}
                      <button
                        onClick={() => {
                          const profile = loadFromStorage<any>('onboarding-profile', null);
                          if (profile) {
                            saveToStorage('onboarding-profile', { ...profile, selectedDirections: [cat.name] });
                          }
                        }}
                        className="mt-sm w-full py-3 bg-primary text-white font-label-caps text-label-caps tracking-widest hover:opacity-90 transition-all cursor-pointer"
                      >
                        這是我的方向
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-xxl text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl text-outline mb-lg block">search_off</span>
          <p className="font-h3 text-h3 text-on-surface-variant mb-sm">找不到符合條件的科類</p>
          <p className="font-body-md">試試其他關鍵字或篩選條件</p>
        </div>
      )}

      {/* Navigation */}
      <div className="text-center mt-xxl space-x-4">
        <Link href="/onboarding/step1" className="text-primary hover:text-primary text-sm font-medium cursor-pointer">完整導入流程</Link>
        <Link href="/roadmap" className="text-on-surface-variant hover:text-on-surface text-sm cursor-pointer">我的路線圖</Link>
      </div>
    </div>
  );
}
