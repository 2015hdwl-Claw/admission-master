'use client';

import { useState, useMemo } from 'react';
import type { VocationalGroup } from '@/types';
import {
  VOCATIONAL_GROUP_LABELS,
  VOCATIONAL_GROUP_COLORS,
  VOCATIONAL_GROUP_SUPER_CATEGORY,
  SUPER_CATEGORY_LABELS,
  getGroupsBySuperCategory,
} from '@/data/vocational-categories';
import type { SuperCategory } from '@/data/vocational-categories';

const SUPER_CATEGORIES: SuperCategory[] = [
  '工業類', '商業類', '設計類', '服務類', '資訊類', '農業類', '海事類', '語文類',
];

interface VocationalGroupSelectorProps {
  selectedGroup: VocationalGroup | null;
  onGroupSelect: (group: VocationalGroup) => void;
  disabled?: boolean;
  showLabel?: boolean;
  compact?: boolean;
}

export default function VocationalGroupSelector({
  selectedGroup,
  onGroupSelect,
  disabled = false,
  showLabel = true,
  compact = false,
}: VocationalGroupSelectorProps) {
  const groupsByCategory = useMemo(() => {
    const map = new Map<SuperCategory, VocationalGroup[]>();
    for (const cat of SUPER_CATEGORIES) {
      map.set(cat, getGroupsBySuperCategory(cat));
    }
    return map;
  }, []);

  if (compact) {
    // 緊湊模式：水平排列所有職群
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {Object.entries(VOCATIONAL_GROUP_LABELS).map(([group, label]) => {
          const isSelected = selectedGroup === group;
          const colorClass = VOCATIONAL_GROUP_COLORS[group as VocationalGroup];

          return (
            <button
              key={group}
              onClick={() => !disabled && onGroupSelect(group as VocationalGroup)}
              disabled={disabled}
              style={{
                padding: '8px 12px',
                borderRadius: '20px',
                border: '2px solid',
                background: isSelected ? '#d8e6d7' : 'white',
                borderColor: isSelected ? '#525f54' : '#E9E5DB',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: disabled ? 0.5 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    backgroundColor: colorClass.includes('bg-')
                      ? colorClass.replace('bg-', '').replace('-', ' ')
                      : colorClass,
                  }}
                />
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    color: isSelected ? '#525f54' : '#1b1c1b',
                  }}
                >
                  {label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // 完整模式：分類顯示
  return (
    <div>
      {showLabel && (
        <h2
          style={{
            fontFamily: 'serif',
            fontSize: '14px',
            fontWeight: '500',
            color: '#1b1c1b',
            marginBottom: '12px',
          }}
        >
          你的職群
        </h2>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {SUPER_CATEGORIES.map((cat) => {
          const groups = groupsByCategory.get(cat);
          if (!groups || groups.length === 0) return null;

          return (
            <div key={cat}>
              <h3
                style={{
                  fontFamily: 'serif',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#434843',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}
              >
                {SUPER_CATEGORY_LABELS[cat]}
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                }}
              >
                {groups.map((group) => {
                  const isSelected = selectedGroup === group;
                  const colorClass = VOCATIONAL_GROUP_COLORS[group];

                  return (
                    <button
                      key={group}
                      onClick={() => !disabled && onGroupSelect(group)}
                      disabled={disabled}
                      style={{
                        padding: '12px',
                        borderRadius: '6px',
                        border: '2px solid',
                        textAlign: 'left',
                        background: isSelected ? '#d8e6d7' : 'white',
                        borderColor: isSelected ? '#525f54' : '#E9E5DB',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        opacity: disabled ? 0.5 : 1,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            flexShrink: 0,
                            backgroundColor: colorClass.includes('bg-')
                              ? colorClass.replace('bg-', '').replace('-', ' ')
                              : colorClass,
                          }}
                        />
                        <span
                          style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: isSelected ? '#525f54' : '#1b1c1b',
                          }}
                        >
                          {VOCATIONAL_GROUP_LABELS[group]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}