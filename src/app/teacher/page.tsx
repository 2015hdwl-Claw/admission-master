'use client';

import { useState, useEffect } from 'react';
import { loadFromStorage } from '@/lib/storage';
import type { SkillItem, SkillCategory } from '@/types';

const MOCK_PROGRESS = [
  { name: '建築設計 A 班', stage: '模型製作階段', percent: 82 },
  { name: '結構力學 B 班', stage: '期中考複習', percent: 45 },
  { name: '藝術史進階專題', stage: '論文大綱審查', percent: 95 },
];

const MOCK_TASKS = [
  { id: 1, text: '核閱王小明的作品集草稿', due: '今日 17:00' },
  { id: 2, text: '回覆家長關於面試模擬的諮詢', due: '明日' },
  { id: 3, text: '上傳下週結構力學講義', due: '週五' },
];

const MOCK_STUDENTS = [
  { id: 's1', name: '李曉華', studentId: '2023001', group: '資訊群', target: '東海大學 建築學系', status: 'A', statusLabel: '進度超前', updated: '2 小時前' },
  { id: 's2', name: '陳志明', studentId: '2023012', group: '機械群', target: '成功大學 都市規劃', status: 'C', statusLabel: '需要關注', updated: '昨天 15:40' },
  { id: 's3', name: '王小明', studentId: '2023015', group: '設計群', target: '實踐大學 工業設計', status: 'B', statusLabel: '正常進展', updated: '2026.10.22' },
];

const TEACHER_PHOTO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCesHYRkliAQ3xU2JPN6S1QumXqfee_RLYcMDVRy4CD5uVEtomXpF_qh1j8DvODtLgUw_luEG2nGwqCQUv8EEE_PwbwZ7w7Tb5Ok8L3MmtfjwqXbQgYUDjf24enY_EyA_9jtopRayAFaJnYGEvAU4LFn69nn8WCuhvNXl8KXEp9qJX6j4knTXy0ewBslJXL-oFa5e5g0g65yScGq5kInquESSqVAfOB8Nq8NEoqWuqcdyGSkt_rREjyt68EOuvG56SatE_6fxif0034';

const OFFICE_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5cFrhdnm6IVr_D2qvZ4IR7xCB68_4YN-TzImIgLguU4V6PHECJWjhmpowJ04k36q_jMThLv-zsPS6CUg-_wfyj7YnxmA9Z0jWNM3GgrHT18lBwgq1gCGkKqmVOk8yuU84CykTRbtik3khk7yhjhPjXVj9IHQy_vwamcsce2loMT5sBTbCv_a6X0LNQWGRuDcRAUUPWsPvtYAeOf_DPztnh3LVgYZzHAjlzzXIefyA8dJ5ZPPV12EXC-u4407jhpoEX3d1PfL_Q2qE';

function generateDemoData(): SkillItem[] {
  return [
    { id: 'demo-1', category: 'capstone' as SkillCategory, title: '智慧溫室自動灌溢系統', description: '使用 ESP32 搭配土壤濕度感測器', date: '2026-03-15', createdAt: '2026-03-15T10:00:00Z', qualityGrade: 'A' as const, capstoneTopic: '智慧溫室自動灌溢系統', capstoneRole: '組長', capstoneStatus: 'completed' as const },
    { id: 'demo-2', category: 'certification' as SkillCategory, title: '電腦軟體應用丙級技術士', description: '順利通過丙級檢定', date: '2026-02-20', createdAt: '2026-02-20T10:00:00Z', qualityGrade: 'B' as const, certificationName: '電腦軟體應用', certificationLevel: '丙級' as const, certificationScore: 82 },
    { id: 'demo-3', category: 'competition' as SkillCategory, title: '全國技能競賽區賽', description: '參加資訊網路應用組', date: '2026-04-10', createdAt: '2026-04-10T10:00:00Z', qualityGrade: 'A' as const, competitionName: '全國技能競賽', competitionLevel: '區賽' as const, competitionResult: '第三名' },
    { id: 'demo-4', category: 'internship' as SkillCategory, title: '台積電暑期實習', description: '在製程工程部門實習兩個月', date: '2025-07-01', createdAt: '2025-07-01T10:00:00Z', qualityGrade: 'B' as const, internshipCompany: '台積電', internshipDuration: '2025/7 - 2025/8', internshipRole: '實習生' },
    { id: 'demo-5', category: 'club' as SkillCategory, title: '電腦社', description: '參與社團活動，擔任社長', date: '2025-09-01', createdAt: '2025-09-01T10:00:00Z', qualityGrade: 'B' as const, clubRole: '社長' },
    { id: 'demo-6', category: 'service' as SkillCategory, title: '社區電腦教學志工', description: '教長者使用智慧型手機', date: '2026-01-15', createdAt: '2026-01-15T10:00:00Z', qualityGrade: 'C' as const, serviceHours: 24, serviceOrganization: '社區關懷協會' },
    { id: 'demo-7', category: 'capstone' as SkillCategory, title: '校園 APP 開發', description: '使用 React Native 開發校園訂餐系統', date: '2026-04-01', createdAt: '2026-04-01T10:00:00Z', qualityGrade: 'A' as const, capstoneTopic: '校園訂餐系統', capstoneRole: '程式開發', capstoneStatus: 'in-progress' as const },
    { id: 'demo-8', category: 'license' as SkillCategory, title: 'TOEIC 測驗', description: '多益英語能力測驗', date: '2025-12-10', createdAt: '2025-12-10T10:00:00Z', qualityGrade: 'B' as const, licenseName: 'TOEIC', licenseIssuer: 'ETS' },
  ];
}

function getStatusStyle(status: string) {
  if (status === 'A') return 'bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 text-xs font-label-caps';
  if (status === 'B') return 'bg-surface-container text-stone-500 px-3 py-1 text-xs font-label-caps';
  return 'bg-secondary-container text-on-secondary-fixed-variant px-3 py-1 text-xs font-label-caps';
}

export default function TeacherPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'graduated'>('active');

  useEffect(() => {
    const stored = loadFromStorage<SkillItem[]>('skill-items', []);
    if (stored.length === 0) {
      localStorage.setItem('skill-items', JSON.stringify(generateDemoData()));
    }
  }, []);

  return (
    <div className="page-container">
      {/* Welcome Section */}
      <section className="mb-xl flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-label-caps text-primary uppercase tracking-widest block mb-2">01 每日概覽</span>
          <h1 className="font-h1 text-h1 text-on-surface">教師管理終端</h1>
          <p className="text-on-surface-variant font-body-lg mt-2 opacity-70">歡迎回來，今天有 {MOCK_TASKS.length} 個待辦事項需要您的關注。</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-primary text-white px-6 py-3 font-label-caps transition-all hover:opacity-90 flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-sm">add</span>
            新增班級進度
          </button>
        </div>
      </section>

      {/* Bento Grid: Overview & Tasks */}
      <div className="grid grid-cols-12 gap-gutter mb-xxl">
        {/* Active Progress (8 cols) */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-low border border-outline-variant p-xl">
          <div className="flex justify-between items-center mb-xl">
            <h3 className="font-h3 text-h3 text-primary">班級學習進度</h3>
            <span className="material-symbols-outlined text-outline-variant">analytics</span>
          </div>
          <div className="space-y-8">
            {MOCK_PROGRESS.map(item => (
              <div key={item.name} className="relative">
                <div className="flex justify-between mb-3 items-end">
                  <span className="font-serif text-lg">{item.name} <span className="text-sm text-stone-400 ml-2">{item.stage}</span></span>
                  <span className="font-label-caps text-primary">{item.percent}%</span>
                </div>
                <div className="w-full h-[2px] bg-outline-variant">
                  <div className="bg-primary h-full" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks (4 cols) */}
        <div className="col-span-12 lg:col-span-4 bg-primary text-white p-xl flex flex-col">
          <div className="flex justify-between items-center mb-xl">
            <h3 className="font-h3 text-h3 text-primary-fixed">即時待辦</h3>
            <span className="material-symbols-outlined text-primary-fixed opacity-50">assignment_late</span>
          </div>
          <div className="space-y-6 flex-grow">
            {MOCK_TASKS.map((task, i) => (
              <div key={task.id} className="flex gap-4 items-start border-b border-primary-container pb-4">
                <span className="font-serif text-primary-fixed text-lg">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p className="font-body-md leading-snug">{task.text}</p>
                  <span className="text-xs text-primary-fixed opacity-60">截止時間：{task.due}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-xl border border-primary-fixed text-primary-fixed w-full py-3 font-label-caps hover:bg-primary-container transition-colors cursor-pointer">
            查看所有任務
          </button>
        </div>
      </div>

      {/* Student Records */}
      <section className="mb-xxl">
        <div className="flex justify-between items-center mb-lg">
          <div>
            <span className="font-label-caps text-primary uppercase tracking-widest block mb-2">02 人才管理</span>
            <h2 className="font-h2 text-h2 text-on-surface">學生學習紀錄</h2>
          </div>
          <div className="flex border-b border-outline-variant">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 font-label-caps cursor-pointer transition-colors ${activeTab === 'active' ? 'text-primary border-b-2 border-primary' : 'text-stone-400'}`}
            >
              活躍中
            </button>
            <button
              onClick={() => setActiveTab('graduated')}
              className={`px-4 py-2 font-label-caps cursor-pointer transition-colors ${activeTab === 'graduated' ? 'text-primary border-b-2 border-primary' : 'text-stone-400'}`}
            >
              已結業
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-outline-variant bg-surface-bright">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high border-b border-outline-variant">
                <th className="px-6 py-4 font-label-caps text-primary">學生姓名</th>
                <th className="px-6 py-4 font-label-caps text-primary">當前目標</th>
                <th className="px-6 py-4 font-label-caps text-primary">學習狀況</th>
                <th className="px-6 py-4 font-label-caps text-primary">最後更新</th>
                <th className="px-6 py-4 font-label-caps text-primary text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {MOCK_STUDENTS.map(student => (
                <tr key={student.id} className="hover:bg-surface-container transition-colors">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 flex items-center justify-center ${student.status === 'A' ? 'bg-secondary-container' : 'bg-surface-container-highest'}`}>
                        <span className={`material-symbols-outlined ${student.status === 'A' ? 'text-secondary' : 'text-stone-600'}`}>person</span>
                      </div>
                      <div>
                        <div className="font-serif text-lg">{student.name}</div>
                        <div className="text-xs text-stone-400">學號: {student.studentId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 font-body-md text-on-surface-variant">{student.target}</td>
                  <td className="px-6 py-6">
                    <span className={getStatusStyle(student.status)}>{student.statusLabel}</span>
                  </td>
                  <td className="px-6 py-6 font-body-md text-stone-500">{student.updated}</td>
                  <td className="px-6 py-6 text-right">
                    <button className="text-primary hover:underline font-label-caps cursor-pointer">查看詳情</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quotes + Meeting Card */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-xxl">
        <div className="bg-surface-container-low border-l-4 border-primary p-xl">
          <span className="material-symbols-outlined text-primary text-4xl mb-4">format_quote</span>
          <p className="font-display-italic text-h3 text-on-surface leading-relaxed italic">
            &ldquo;教育不是注滿一桶水，而是點燃一把火。&rdquo;
          </p>
          <p className="mt-4 font-label-caps text-stone-400">&mdash; 威廉·巴特勒·葉芝</p>
        </div>
        <div className="relative min-h-[200px] hidden md:block border border-outline-variant">
          <img
            alt="教師辦公室"
            className="absolute inset-0 w-full h-full object-cover grayscale opacity-50"
            src={OFFICE_IMAGE}
          />
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm p-6 text-center">
              <span className="font-label-caps text-primary tracking-widest">下一次班級會議</span>
              <h4 className="font-serif text-xl mt-2">10月27日 (五) 10:00</h4>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
