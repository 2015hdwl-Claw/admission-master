'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { trackPageView, trackFeatureUsage } from '@/lib/analytics';
import DiscoveryProgress from '@/components/DiscoveryProgress';
import StepTransition from '@/components/StepTransition';
import {
  departments,
  getDepartmentsByGroup,
  searchDepartments,
  findBestPathway,
  consolidateActionPlan,
  getSchools,
} from '@/lib/department-database';
import type { DepartmentInfo, UserProfile, ConsolidatedActionPlan } from '@/types/department';

// ── 4 步驟背景漸變 ──
const STEP_GRADIENTS = [
  'from-blue-50 via-sky-50 to-indigo-50',
  'from-purple-50 via-violet-50 to-fuchsia-50',
  'from-emerald-50 via-teal-50 to-cyan-50',
  'from-amber-50 via-yellow-50 to-orange-50',
];

// ── 職群列表 ──
const GROUPS = [
  { code: '01', name: '餐旅群', emoji: '🍽️' },
  { code: '02', name: '機械群', emoji: '⚙️' },
  { code: '03', name: '電機群', emoji: '⚡' },
  { code: '04', name: '電子群', emoji: '🔌' },
  { code: '05', name: '資訊群', emoji: '💻' },
  { code: '06', name: '商業與管理群', emoji: '📊' },
  { code: '07', name: '設計群', emoji: '🎨' },
  { code: '08', name: '農業群', emoji: '🌾' },
  { code: '09', name: '化工群', emoji: '🧪' },
  { code: '10', name: '土木群', emoji: '🏗️' },
  { code: '11', name: '海事群', emoji: '⚓' },
  { code: '12', name: '護理群', emoji: '🏥' },
  { code: '13', name: '家政群', emoji: '🏠' },
  { code: '14', name: '語文群', emoji: '🌍' },
  { code: '15', name: '商業與管理群', emoji: '💼' },
];

const SCHOOLS = getSchools();

// ── 盤點子步驟 ──
type SubStep = 'grade' | 'percentile' | 'certificate' | 'competition' | 'project';
const SUB_STEPS: SubStep[] = ['grade', 'percentile', 'certificate', 'competition', 'project'];

const GRADE_OPTIONS = [
  { value: 10, label: '高一（十年級）' },
  { value: 11, label: '高二（十一年級）' },
  { value: 12, label: '高三（十二年級）' },
];

const PERCENTILE_OPTIONS = [
  { value: 5, label: '前 5%' },
  { value: 10, label: '前 10%' },
  { value: 15, label: '前 15%' },
  { value: 25, label: '前 25%' },
  { value: 30, label: '前 30%' },
  { value: 50, label: '前 50%' },
  { value: 75, label: '前 75%' },
];

const CERTIFICATE_OPTIONS = [
  { value: '', label: '還沒有' },
  { value: '丙級技術士', label: '有丙級證照' },
  { value: '乙級技術士', label: '有乙級證照' },
  { value: '甲級技術士', label: '有甲級證照' },
];

const COMPETITION_OPTIONS = [
  { value: '', label: '沒有參加過' },
  { value: '校內比賽', label: '校內比賽' },
  { value: '區域賽', label: '區域賽' },
  { value: '全國賽', label: '全國賽' },
];

// ── 動畫 ──
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.1, duration: 0.4 },
});

// ── 主頁面 ──
export default function FirstDiscoveryPage() {
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const router = useRouter();

  // Step 0: 選職群
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedGroupName, setSelectedGroupName] = useState('');

  // Step 1: 探索科系
  const [targetDepartments, setTargetDepartments] = useState<DepartmentInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
  const [detailModalDept, setDetailModalDept] = useState<DepartmentInfo | null>(null);

  // Step 2: 盤點現況
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    grade: 0,
    gradePercentile: 0,
    certificates: [],
    competitions: [],
    hasProject: false,
  });

  // Step 3: 結果
  const [actionPlan, setActionPlan] = useState<ConsolidatedActionPlan | null>(null);
  const [animatedProbs, setAnimatedProbs] = useState<Record<string, { current: number; potential: number }>>({});

  // 觸控
  const [touchStart, setTouchStart] = useState(0);

  // ── Restore state ──
  useEffect(() => {
    const saved = localStorage.getItem('discovery_state_v3');
    if (saved) {
      try {
        const s = JSON.parse(saved);
        if (s.step !== undefined) setCurrentStep(s.step);
        if (s.group) setSelectedGroup(s.group);
        if (s.groupName) setSelectedGroupName(s.groupName);
        if (s.targets) setTargetDepartments(s.targets);
        if (s.profile) setProfile(s.profile);
      } catch { /* ignore corrupt data */ }
    }
    trackPageView('first_discovery');
    setLoading(false);
  }, []);

  // ── Save state ──
  const saveState = useCallback(() => {
    localStorage.setItem('discovery_state_v3', JSON.stringify({
      step: currentStep,
      group: selectedGroup,
      groupName: selectedGroupName,
      targets: targetDepartments,
      profile,
    }));
  }, [currentStep, selectedGroup, selectedGroupName, targetDepartments, profile]);

  useEffect(() => { if (!loading) saveState(); }, [currentStep, loading, saveState]);

  // ── Navigation ──
  const goToStep = (step: number) => {
    if (step === currentStep) return;
    setDirection(step > currentStep ? 'forward' : 'backward');
    setCurrentStep(step);
  };

  const autoAdvance = (step: number) => {
    setTimeout(() => goToStep(step), 650);
  };

  // ── Touch ──
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientY);
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart - e.changedTouches[0].clientY;
    if (diff > 60 && currentStep < 3) goToStep(currentStep + 1);
    if (diff < -60 && currentStep > 0) goToStep(currentStep - 1);
  };

  // ── Toggle target department ──
  const toggleTarget = (dept: DepartmentInfo) => {
    setTargetDepartments(prev => {
      const exists = prev.find(d => d.id === dept.id);
      if (exists) return prev.filter(d => d.id !== dept.id);
      if (prev.length >= 3) return prev;
      return [...prev, dept];
    });
  };

  // ── Sub-step answer ──
  const handleSubAnswer = (field: keyof UserProfile, value: any) => {
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    const nextIndex = currentSubStep + 1;
    if (nextIndex < SUB_STEPS.length) {
      setTimeout(() => setCurrentSubStep(nextIndex), 600);
    } else {
      // All sub-steps done → calculate and go to Step 3
      setTimeout(() => {
        const targets = targetDepartments.map(dept => {
          const best = findBestPathway(dept, updated);
          return best ? { dept, analysis: best.analysis } : null;
        }).filter(Boolean) as { dept: DepartmentInfo; analysis: import('@/types/department').GapAnalysis }[];

        const plan = consolidateActionPlan(targets);
        setActionPlan(plan);
        setAnimatedProbs(Object.fromEntries(plan.targets.map(t => [t.departmentName, { current: 0, potential: 0 }])));
        autoAdvance(3);
      }, 600);
    }
  };

  // ── Probability animation ──
  useEffect(() => {
    if (currentStep !== 3 || !actionPlan) return;
    const timer = setInterval(() => {
      setAnimatedProbs(prev => {
        let changed = false;
        const next = { ...prev };
        for (const t of actionPlan.targets) {
          const key = t.departmentName;
          const cur = next[key] || { current: 0, potential: 0 };
          if (cur.current < t.currentProbability || cur.potential < t.potentialProbability) {
            next[key] = {
              current: Math.min(cur.current + 2, t.currentProbability),
              potential: Math.min(cur.potential + 2, t.potentialProbability),
            };
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 25);
    return () => clearInterval(timer);
  }, [currentStep, actionPlan]);

  // ── Available departments for Step 1 ──
  const groupDepts = selectedGroup ? getDepartmentsByGroup(selectedGroup) : [];
  const searchResults = searchQuery.length >= 1 ? searchDepartments(searchQuery) : [];
  const schoolFiltered = selectedSchoolId ? departments.filter(d => d.schoolId === selectedSchoolId) : groupDepts;
  const displayDepts = searchQuery.length >= 1 ? searchResults : schoolFiltered;
  const filteredSchools = SCHOOLS.filter(s => {
    const q = searchQuery.toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || s.aliases.some(a => a.toLowerCase().includes(q));
  });

  // ════════════════════════════════════════════════════
  // Step 0: 你現在念什麼？（選職群）
  // ════════════════════════════════════════════════════
  const renderStep0 = () => (
    <div className="text-center w-full max-w-3xl mx-auto">
      <motion.h1 {...fadeUp} className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
        你現在念什麼？
      </motion.h1>
      <motion.p {...fadeUp} transition={{ delay: 0.15 }} className="text-xl text-gray-500 mb-10">
        選擇你的職群，開始你的發現旅程
      </motion.p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {GROUPS.map((g, i) => (
          <motion.button
            key={`${g.code}-${g.name}`}
            {...stagger(i)}
            onClick={() => {
              setSelectedGroup(g.code);
              setSelectedGroupName(g.name);
              trackFeatureUsage('discovery_group_selected', { group: g.code });
              autoAdvance(1);
            }}
            className={`p-5 rounded-2xl text-center transition-all duration-300 ${
              selectedGroup === g.code
                ? 'bg-blue-600 text-white shadow-lg scale-[1.02]'
                : 'bg-white/70 hover:bg-white shadow-sm hover:shadow'
            }`}
          >
            <span className="text-2xl block mb-1">{g.emoji}</span>
            <span className="text-lg font-medium">{g.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════
  // Step 1: 探索科系（可跨群探索，選 1-3 個目標）
  // ════════════════════════════════════════════════════
  const renderStep1 = () => (
    <div className="w-full max-w-4xl mx-auto text-center">
      <motion.h1 {...fadeUp} className="text-4xl font-bold text-gray-900 mb-2">
        探索你感興趣的科系
      </motion.h1>
      <motion.p {...fadeUp} transition={{ delay: 0.1 }} className="text-lg text-gray-500 mb-6">
        選 1-3 個你想了解的科系（已選 {targetDepartments.length}/3）
      </motion.p>

      {/* School dropdown + keyword search */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="flex gap-3 mb-6">
        {/* School dropdown */}
        <div className="relative w-64 shrink-0">
          <button
            onClick={() => setSchoolDropdownOpen(!schoolDropdownOpen)}
            className="w-full px-4 py-4 text-left text-lg rounded-2xl border-0 bg-white/80 shadow-lg flex justify-between items-center"
          >
            <span className={selectedSchoolId ? 'text-gray-900' : 'text-gray-400'}>
              {selectedSchoolId ? SCHOOLS.find(s => s.id === selectedSchoolId)?.name : '選擇學校'}
            </span>
            <span className="text-gray-400 text-sm">{schoolDropdownOpen ? '▲' : '▼'}</span>
          </button>
          <AnimatePresence>
            {schoolDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl z-30 max-h-60 overflow-y-auto"
              >
                <button
                  onClick={() => { setSelectedSchoolId(''); setSchoolDropdownOpen(false); }}
                  className="w-full px-4 py-3 text-left text-gray-500 hover:bg-purple-50 transition"
                >
                  全部學校
                </button>
                {SCHOOLS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedSchoolId(s.id); setSchoolDropdownOpen(false); }}
                    className={`w-full px-4 py-3 text-left hover:bg-purple-50 transition ${
                      selectedSchoolId === s.id ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-700'
                    }`}
                  >
                    <div>{s.name}</div>
                    {s.aliases.length > 0 && (
                      <div className="text-xs text-gray-400">{s.aliases.slice(0, 3).join('、')}</div>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Keyword search */}
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜尋科系、學校簡稱（如：台科）、職涯..."
            className="w-full px-6 py-4 text-lg rounded-2xl border-0 bg-white/80 shadow-lg outline-none focus:ring-2 focus:ring-purple-300 transition"
          />
        </div>
      </motion.div>

      {/* Department cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[35vh] overflow-y-auto pr-1">
        {displayDepts.map((dept, i) => {
          const isSelected = targetDepartments.some(d => d.id === dept.id);
          return (
            <motion.div
              key={dept.id}
              {...stagger(i)}
              className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 text-left ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-lg scale-[1.02] ring-2 ring-purple-300'
                  : 'bg-white/80 hover:bg-white shadow-sm hover:shadow'
              }`}
              onClick={() => toggleTarget(dept)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-lg">{dept.departmentName}</div>
                  <div className={`text-sm ${isSelected ? 'text-purple-100' : 'text-gray-500'}`}>
                    {dept.schoolName}
                  </div>
                </div>
                {isSelected && <span className="text-white text-xl">✓</span>}
              </div>
              <p className={`text-sm mb-3 ${isSelected ? 'text-purple-100' : 'text-gray-600'}`}>
                {dept.description}
              </p>
              <div className="flex flex-wrap gap-1 mb-2">
                {dept.features.slice(0, 2).map((f, j) => (
                  <span key={j} className={`px-2 py-0.5 text-xs rounded-full ${
                    isSelected ? 'bg-purple-500 text-purple-100' : 'bg-purple-100 text-purple-700'
                  }`}>{f}</span>
                ))}
              </div>
              <button
                onClick={e => { e.stopPropagation(); setDetailModalDept(dept); }}
                className={`text-xs underline ${isSelected ? 'text-purple-200' : 'text-purple-500'}`}
              >
                查看教學特色、研究、職涯 →
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* ── 已選目標展示區（固定在下方） ── */}
      <AnimatePresence>
        {targetDepartments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6"
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
              <p className="text-sm text-gray-500 mb-3">已選目標科系：</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {targetDepartments.map(dept => (
                  <span key={dept.id} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-medium">
                    {dept.departmentName}
                    <button
                      onClick={() => toggleTarget(dept)}
                      className="ml-1 text-purple-200 hover:text-white transition"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <button
                onClick={() => {
                  trackFeatureUsage('discovery_targets_confirmed', { count: targetDepartments.length });
                  setCurrentSubStep(0);
                  autoAdvance(2);
                }}
                className="px-8 py-3 bg-purple-600 text-white rounded-2xl font-medium text-lg hover:bg-purple-700 transition shadow-lg"
              >
                選好了，開始盤點我的條件 →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 科系介紹 Modal（橫式三欄） ── */}
      <AnimatePresence>
        {detailModalDept && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6"
            onClick={() => setDetailModalDept(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{detailModalDept.departmentName}</h2>
                  <p className="text-gray-500">{detailModalDept.schoolName} · {detailModalDept.groupName}</p>
                </div>
                <button onClick={() => setDetailModalDept(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
              </div>
              <p className="text-gray-700 mb-4">{detailModalDept.description}</p>
              {detailModalDept.website && (
                <a
                  href={detailModalDept.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 underline mb-6"
                >
                  前往科系官網 ↗
                </a>
              )}

              {/* Three columns: 教學特色 | 研究方向 | 畢業出路 */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="bg-purple-50 rounded-2xl p-5">
                  <h3 className="font-bold text-purple-700 mb-3 text-base">教學特色</h3>
                  <div className="space-y-2">
                    {detailModalDept.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-purple-400 mt-0.5 shrink-0">•</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-2xl p-5">
                  <h3 className="font-bold text-blue-700 mb-3 text-base">研究方向</h3>
                  <div className="space-y-2">
                    {detailModalDept.researchAreas.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-blue-400 mt-0.5 shrink-0">•</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-green-50 rounded-2xl p-5">
                  <h3 className="font-bold text-green-700 mb-3 text-base">畢業出路</h3>
                  <div className="space-y-2">
                    {detailModalDept.careerPaths.map((c, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-400 mt-0.5 shrink-0">•</span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => { toggleTarget(detailModalDept); setDetailModalDept(null); }}
                className={`w-full py-3 rounded-2xl font-medium text-lg transition ${
                  targetDepartments.some(d => d.id === detailModalDept.id)
                    ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {targetDepartments.some(d => d.id === detailModalDept.id) ? '取消選擇' : '加入我的目標'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ════════════════════════════════════════════════════
  // Step 2: 盤點現況（5 子步驟全螢幕逐題，自動前進）
  // ════════════════════════════════════════════════════
  const renderStep2 = () => {
    const sub = SUB_STEPS[currentSubStep];
    const subProgress = ((currentSubStep + 1) / SUB_STEPS.length) * 100;

    return (
      <div className="w-full max-w-2xl mx-auto text-center">
        <div className="mb-10">
          <div className="w-full h-1 bg-gray-200 rounded-full mb-6">
            <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${subProgress}%` }} />
          </div>
          <p className="text-sm text-gray-400">問題 {currentSubStep + 1} / {SUB_STEPS.length}</p>
        </div>

        <AnimatePresence mode="wait">
          {sub === 'grade' && (
            <motion.div key="grade" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <h1 className="text-4xl font-bold text-gray-900 mb-10">你的年級？</h1>
              <div className="space-y-4">
                {GRADE_OPTIONS.map((opt, i) => (
                  <motion.button key={opt.value} {...stagger(i)}
                    onClick={() => handleSubAnswer('grade', opt.value)}
                    className="w-full p-6 rounded-2xl bg-white/80 text-xl font-medium hover:bg-white shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {sub === 'percentile' && (
            <motion.div key="percentile" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <h1 className="text-4xl font-bold text-gray-900 mb-10">在校成績大約在多少百分比？</h1>
              <div className="grid grid-cols-2 gap-3">
                {PERCENTILE_OPTIONS.map((opt, i) => (
                  <motion.button key={opt.value} {...stagger(i)}
                    onClick={() => handleSubAnswer('gradePercentile', opt.value)}
                    className="p-5 rounded-2xl bg-white/80 text-xl font-medium hover:bg-white shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {sub === 'certificate' && (
            <motion.div key="certificate" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <h1 className="text-4xl font-bold text-gray-900 mb-10">你有技術士證照嗎？</h1>
              <div className="space-y-4">
                {CERTIFICATE_OPTIONS.map((opt, i) => (
                  <motion.button key={opt.value} {...stagger(i)}
                    onClick={() => handleSubAnswer('certificates', opt.value ? [opt.value] : [])}
                    className="w-full p-6 rounded-2xl bg-white/80 text-xl font-medium hover:bg-white shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {sub === 'competition' && (
            <motion.div key="competition" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <h1 className="text-4xl font-bold text-gray-900 mb-10">你有參加過技藝競賽嗎？</h1>
              <div className="space-y-4">
                {COMPETITION_OPTIONS.map((opt, i) => (
                  <motion.button key={opt.value} {...stagger(i)}
                    onClick={() => handleSubAnswer('competitions', opt.value ? [opt.value] : [])}
                    className="w-full p-6 rounded-2xl bg-white/80 text-xl font-medium hover:bg-white shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {sub === 'project' && (
            <motion.div key="project" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <h1 className="text-4xl font-bold text-gray-900 mb-10">你有做過專題或研究嗎？</h1>
              <div className="space-y-4">
                {[
                  { value: true, label: '有，已經完成或正在進行' },
                  { value: false, label: '還沒有' },
                ].map((opt, i) => (
                  <motion.button key={String(opt.value)} {...stagger(i)}
                    onClick={() => handleSubAnswer('hasProject', opt.value)}
                    className="w-full p-6 rounded-2xl bg-white/80 text-xl font-medium hover:bg-white shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ════════════════════════════════════════════════════
  // Step 3: 發現結果 + 行動計畫（合併）
  // ════════════════════════════════════════════════════
  const renderStep3 = () => {
    if (!actionPlan) return null;

    return (
      <div className="w-full max-w-3xl mx-auto text-center">
        <motion.h1 {...fadeUp} className="text-4xl font-bold text-gray-900 mb-2">
          你的發現結果
        </motion.h1>
        <motion.p {...fadeUp} transition={{ delay: 0.1 }} className="text-lg text-gray-500 mb-8">
          每個目標科系各自算機率，合併行動計畫一次搞定
        </motion.p>

        {/* Multi-target probability cards */}
        <div className="space-y-4 mb-8">
          {actionPlan.targets.map((t, i) => {
            const anim = animatedProbs[t.departmentName] || { current: 0, potential: 0 };
            return (
              <motion.div key={t.departmentName} {...stagger(i)}
                className="bg-white/80 rounded-2xl p-5 shadow-sm text-left"
              >
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="font-bold text-lg">{t.departmentName}</div>
                    <div className="text-sm text-gray-500">{t.schoolName} · {t.bestPathway}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-xl bg-gray-50">
                    <div className="text-sm text-gray-500 mb-1">目前錄取機率</div>
                    <div className="text-3xl font-bold text-indigo-600">{anim.current}%</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    <div className="text-sm opacity-80 mb-1">如果你完成這些</div>
                    <div className="text-3xl font-bold">{anim.potential}%</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Consolidated action plan */}
        <motion.div {...fadeUp} transition={{ delay: 0.8 }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-left">你的行動計畫</h2>
          <div className="space-y-3 mb-8">
            {actionPlan.actionItems.map((item, i) => (
              <motion.div key={i} {...stagger(i + 3)}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white/80 shadow-sm text-left"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold ${
                  item.priority === 'high' ? 'bg-red-400' : item.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-lg">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.deadline}（還有 {item.daysLeft} 天）</div>
                  {item.forDepartments.length > 1 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.forDepartments.map(d => (
                        <span key={d} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">{d}</span>
                      ))}
                    </div>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${
                  item.priority === 'high' ? 'bg-red-100 text-red-700' :
                  item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                }`}>
                  {item.priority === 'high' ? '重要' : item.priority === 'medium' ? '中等' : '一般'}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Encouragement */}
        <motion.div {...fadeUp} transition={{ delay: 1.5 }}
          className="rounded-2xl p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-center mb-8"
        >
          <p className="text-lg font-medium">
            {actionPlan.targets.some(t => t.currentProbability < 30)
              ? '別擔心！一步一步完成上面的行動計畫，你會越來越接近目標。'
              : '你的條件已經不錯了！完成行動計畫讓你更有把握。'
            }
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div {...fadeUp} transition={{ delay: 2 }} className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              localStorage.setItem('saved_discovery_plan', JSON.stringify({
                ...actionPlan,
                createdAt: new Date().toISOString(),
              }));
              trackFeatureUsage('save_discovery_plan', {});
            }}
            className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-medium hover:bg-indigo-700 transition text-lg"
          >
            儲存我的計畫
          </button>
          <button
            onClick={() => {
              const deptNames = actionPlan.targets.map(t => t.departmentName).join('、');
              const text = `我用升學大師發現，${deptNames} 都在我的能力範圍內！完成準備後錄取機率可以大幅提升。你也來試試：https://admission-master.vercel.app`;
              navigator.clipboard.writeText(text);
              trackFeatureUsage('share_discovery_plan', {});
            }}
            className="px-6 py-4 bg-green-600 text-white rounded-2xl font-medium hover:bg-green-700 transition text-lg"
          >
            分享給朋友
          </button>
          <button
            onClick={() => { trackFeatureUsage('start_planning_from_discovery', {}); router.push('/ability-account'); }}
            className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-medium hover:from-blue-700 hover:to-indigo-700 transition text-lg"
          >
            開始完整規劃 →
          </button>
        </motion.div>
      </div>
    );
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${STEP_GRADIENTS[0]} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${STEP_GRADIENTS[currentStep]} transition-all duration-700 ease-out flex flex-col`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <DiscoveryProgress currentStep={currentStep} />

      <main className="flex-1 flex flex-col items-center justify-center py-16 px-4">
        <StepTransition stepKey={currentStep} direction={direction}>
          {currentStep === 0 ? renderStep0() :
           currentStep === 1 ? renderStep1() :
           currentStep === 2 ? renderStep2() :
           renderStep3()
          }
        </StepTransition>
      </main>

      {/* Back button */}
      {currentStep > 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="fixed bottom-6 left-0 right-0 text-center z-40"
        >
          <button
            onClick={() => goToStep(currentStep - 1)}
            className="text-sm text-gray-400 hover:text-gray-600 transition px-4 py-2"
          >
            ← 返回上一步
          </button>
        </motion.div>
      )}
    </div>
  );
}
