'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { trackPageView, trackFeatureUsage } from '@/lib/analytics';
import DiscoveryProgress from '@/components/DiscoveryProgress';
import StepTransition from '@/components/StepTransition';
import PathwayResults from '@/components/PathwayResults';
import {
  departments,
  getDepartmentsByGroup,
  searchDepartments,
  getSchools,
} from '@/lib/department-data';
import { getCertificatesByGroup } from '@/data/certificates';
import { getCompetitionsByGroup, PLACING_OPTIONS } from '@/data/competitions';
import type { DepartmentInfo, StudentProfile, CompetitionRecord } from '@/types/department';

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
const REGIONS = ['北區', '中區', '南區', '東區', '離島'];

const GRADE_OPTIONS = [
  { value: 10 as const, label: '高一（十年級）' },
  { value: 11 as const, label: '高二（十一年級）' },
  { value: 12 as const, label: '高三（十二年級）' },
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

// ── 武器盤點子步驟（年級分流） ──
type SubStep = 'percentile' | 'certificate' | 'competition' | 'project' | 'specialExperiences';
function getSubSteps(grade: number): SubStep[] {
  const base: SubStep[] = ['percentile', 'certificate', 'competition', 'project'];
  if (grade === 12) base.push('specialExperiences');
  return base;
}

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

  // Step 0: 選職群 + 年級
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedGroupName, setSelectedGroupName] = useState('');
  const [groupConfirmed, setGroupConfirmed] = useState(false);

  // Step 1: 探索科系
  const [targetDepartments, setTargetDepartments] = useState<DepartmentInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
  const [detailModalDept, setDetailModalDept] = useState<DepartmentInfo | null>(null);

  // Step 2: 武器盤點
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [profile, setProfile] = useState<StudentProfile>({
    grade: 12,
    groupCode: '',
    gradePercentile: 0,
    certificates: [],
    competitions: [],
    hasProject: false,
  });
  // Multi-choice local state
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [compPlacings, setCompPlacings] = useState<Record<string, string>>({});
  const [specialText, setSpecialText] = useState('');

  // 觸控
  const [touchStart, setTouchStart] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);

  // Computed
  const subSteps = getSubSteps(profile.grade);
  const currentSub = subSteps[currentSubStep] || 'percentile';
  const groupCerts = selectedGroup ? getCertificatesByGroup(selectedGroup) : [];
  const groupComps = selectedGroup ? getCompetitionsByGroup(selectedGroup) : [];

  // ── Restore state ──
  useEffect(() => {
    const saved = localStorage.getItem('discovery_state_v4');
    if (saved) {
      try {
        const s = JSON.parse(saved);
        if (s.step !== undefined) setCurrentStep(s.step);
        if (s.group) setSelectedGroup(s.group);
        if (s.groupName) setSelectedGroupName(s.groupName);
        if (s.targets) setTargetDepartments(s.targets);
        if (s.profile) setProfile(s.profile);
        if (s.groupConfirmed) setGroupConfirmed(true);
      } catch { /* ignore corrupt data */ }
    }
    trackPageView('first_discovery');
    setLoading(false);
  }, []);

  // ── Save state ──
  const saveState = useCallback(() => {
    localStorage.setItem('discovery_state_v4', JSON.stringify({
      step: currentStep,
      group: selectedGroup,
      groupName: selectedGroupName,
      targets: targetDepartments,
      profile,
      groupConfirmed,
    }));
  }, [currentStep, selectedGroup, selectedGroupName, targetDepartments, profile, groupConfirmed]);

  useEffect(() => { if (!loading) saveState(); }, [currentStep, loading, saveState]);

  // ── Navigation ──
  const goToStep = (step: number) => {
    if (step === currentStep) return;
    setDirection(step > currentStep ? 'forward' : 'backward');
    if (step === 2) {
      setCurrentSubStep(0);
      setSelectedCerts(profile.certificates || []);
      setCompPlacings(
        (profile.competitions || []).reduce((acc, c) => ({ ...acc, [c.competitionId]: c.placing }), {} as Record<string, string>)
      );
      setSpecialText(profile.specialExperiences || '');
    }
    setCurrentStep(step);
  };

  const autoAdvance = (step: number) => {
    setTimeout(() => goToStep(step), 650);
  };

  // ── Touch ──
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
    setTouchStartX(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffY = touchStart - e.changedTouches[0].clientY;
    const diffX = touchStartX - e.changedTouches[0].clientX;

    // 防呆：只有垂直滑動為主、且位移超過 120px 才觸發（避免滾動誤觸）
    if (Math.abs(diffX) > Math.abs(diffY) * 0.5) return;

    // 檢查是否點擊在互動元素上（按鈕、輸入框、可滾動區域）
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'SELECT' ||
      target.tagName === 'TEXTAREA' ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('textarea') ||
      target.closest('[role="button"]') ||
      target.closest('.overflow-y-auto') // 正在滾動列表
    ) {
      return;
    }

    // 提高閾值從 60px → 120px，大幅減少誤觸
    if (diffY > 120 && currentStep < 3) goToStep(currentStep + 1);
    if (diffY < -120 && currentStep > 0) goToStep(currentStep - 1);
  };

  // ── Toggle target department ──
  const toggleTarget = (dept: DepartmentInfo) => {
    setTargetDepartments(prev => {
      const exists = prev.find(d => d.id === dept.id);
      if (exists) return prev.filter(d => d.id !== dept.id);
      if (prev.length >= 5) return prev;
      return [...prev, dept];
    });
  };

  // ── Sub-step handlers ──
  const handleSingleChoice = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    advanceSubStep();
  };

  const confirmMultiChoice = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    advanceSubStep();
  };

  const advanceSubStep = () => {
    const nextIdx = currentSubStep + 1;
    if (nextIdx < subSteps.length) {
      setTimeout(() => setCurrentSubStep(nextIdx), 600);
    } else {
      setTimeout(() => autoAdvance(3), 600);
    }
  };

  // ── Save/Share handlers ──
  const handleSave = () => {
    localStorage.setItem('saved_discovery_plan_v4', JSON.stringify({
      targets: targetDepartments,
      profile,
      createdAt: new Date().toISOString(),
    }));
    trackFeatureUsage('save_discovery_plan', {});
  };

  const handleShare = () => {
    const deptNames = targetDepartments.map(d => d.departmentName).join('、');
    const text = `我用升學大師發現，${deptNames} 都在我的能力範圍內！你也來試試：https://admission-master.vercel.app`;
    navigator.clipboard.writeText(text);
    trackFeatureUsage('share_discovery_plan', {});
  };

  // ── Available departments for Step 1 ──
  const groupDepts = selectedGroup ? getDepartmentsByGroup(selectedGroup) : [];
  const searchResults = searchQuery.length >= 1 ? searchDepartments(searchQuery) : [];

  // 地區 + 學校 雙重過濾
  let filteredDepts = groupDepts;
  if (selectedRegion) {
    filteredDepts = filteredDepts.filter(d => d.region === selectedRegion);
  }
  if (selectedSchoolId) {
    filteredDepts = departments.filter(d => d.schoolId === selectedSchoolId);
  }

  const displayDepts = searchQuery.length >= 1 ? searchResults : filteredDepts;

  // 過濾學校：先過濾地區，再過濾搜尋
  const filteredSchoolsByRegion = SCHOOLS.filter(s => {
    // 先根據選取的地區過濾
    if (selectedRegion) {
      const schoolDepts = departments.filter(d => d.schoolId === s.id);
      if (!schoolDepts.some(d => d.region === selectedRegion)) {
        return false;
      }
    }
    // 再過濾搜尋
    const q = searchQuery.toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || s.aliases.some(a => a.toLowerCase().includes(q));
  });

  const filteredSchools = filteredSchoolsByRegion;

  // ════════════════════════════════════════════════════
  // Step 0: 選職群 + 年級（兩階段）
  // ════════════════════════════════════════════════════
  const renderStep0 = () => (
    <div className="text-center w-full max-w-3xl mx-auto">
      <motion.h1 {...fadeUp} className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
        你現在念什麼？
      </motion.h1>
      <motion.p {...fadeUp} transition={{ delay: 0.15 }} className="text-xl text-gray-500 mb-10">
        {!groupConfirmed ? '選擇你的職群，開始你的發現旅程' : '你是幾年級？'}
      </motion.p>

      <AnimatePresence mode="wait">
        {!groupConfirmed ? (
          <motion.div key="groups" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -100 }}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {GROUPS.map((g, i) => (
                <motion.button
                  key={`${g.code}-${g.name}`}
                  {...stagger(i)}
                  onClick={() => {
                    setSelectedGroup(g.code);
                    setSelectedGroupName(g.name);
                    setGroupConfirmed(true);
                    trackFeatureUsage('discovery_group_selected', { group: g.code });
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
          </motion.div>
        ) : (
          <motion.div key="grades" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <p className="text-lg text-gray-500 mb-2">你選了：<span className="font-bold text-indigo-600">{selectedGroupName}</span></p>
            <div className="space-y-4 max-w-lg mx-auto">
              {GRADE_OPTIONS.map((opt, i) => (
                <motion.button key={opt.value} {...stagger(i)}
                  onClick={() => {
                    setProfile(prev => ({ ...prev, grade: opt.value, groupCode: selectedGroup }));
                    trackFeatureUsage('discovery_grade_selected', { grade: opt.value });
                    autoAdvance(1);
                  }}
                  className="w-full p-6 rounded-2xl bg-white/80 text-xl font-medium hover:bg-white shadow-sm hover:shadow-lg transition-all duration-300 whitespace-nowrap"
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
            <button onClick={() => setGroupConfirmed(false)}
              className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition"
            >
              ← 重新選擇職群
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ════════════════════════════════════════════════════
  // Step 1: 探索科系（選 1-3 個目標）
  // ════════════════════════════════════════════════════
  const renderStep1 = () => (
    <div className="w-full max-w-4xl mx-auto text-center">
      <motion.h1 {...fadeUp} className="text-4xl font-bold text-gray-900 mb-2">
        探索你感興趣的科系
      </motion.h1>
      <motion.p {...fadeUp} transition={{ delay: 0.1 }} className="text-lg text-gray-500 mb-6">
        選 1-5 個你想了解的科系（已選 {targetDepartments.length}/5）
      </motion.p>

      <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative w-full md:w-48 shrink-0">
          <button
            onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
            className="w-full px-4 py-4 text-left text-lg rounded-2xl border-0 bg-white/80 shadow-lg flex justify-between items-center"
          >
            <span className={selectedRegion ? 'text-gray-900' : 'text-gray-400'}>
              {selectedRegion || '選擇地區'}
            </span>
            <span className="text-gray-400 text-sm">{regionDropdownOpen ? '▲' : '▼'}</span>
          </button>
          <AnimatePresence>
            {regionDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl z-30 overflow-y-auto"
              >
                <button
                  onClick={() => { setSelectedRegion(''); setRegionDropdownOpen(false); }}
                  className="w-full px-4 py-3 text-left text-gray-500 hover:bg-purple-50 transition"
                >
                  全部地區
                </button>
                {REGIONS.map(r => (
                  <button
                    key={r}
                    onClick={() => { setSelectedRegion(r); setRegionDropdownOpen(false); }}
                    className={`w-full px-4 py-3 text-left hover:bg-purple-50 transition ${
                      selectedRegion === r ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative w-full md:w-48 shrink-0">
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
                {filteredSchoolsByRegion.map(s => (
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

        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜尋科系、學校簡稱（如：台科）、職涯..."
            className="w-full px-6 py-4 text-lg rounded-2xl border-0 bg-white/80 shadow-lg outline-none focus:ring-2 focus:ring-purple-300 transition"
          />
        </div>
      </motion.div>

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
                {dept.careerOutcomes && dept.careerOutcomes.avgSalary > 0 && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    isSelected ? 'bg-amber-400 text-amber-900' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {(dept.careerOutcomes.avgSalary / 1000).toFixed(1)}K/月
                  </span>
                )}
              </div>
              <button
                onClick={e => { e.stopPropagation(); setDetailModalDept(dept); }}
                onTouchEnd={e => { e.preventDefault(); e.stopPropagation(); setDetailModalDept(dept); }}
                className={`text-sm underline py-2 px-1 -mx-1 touch-manipulation ${isSelected ? 'text-purple-200' : 'text-purple-500'}`}
              >
                查看教學特色、研究、職涯 →
              </button>
            </motion.div>
          );
        })}
      </div>

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
                    <button onClick={() => toggleTarget(dept)} className="ml-1 text-purple-200 hover:text-white transition">&times;</button>
                  </span>
                ))}
              </div>
              <button
                onClick={() => {
                  trackFeatureUsage('discovery_targets_confirmed', { count: targetDepartments.length });
                  goToStep(2);
                }}
                className="px-8 py-3 bg-purple-600 text-white rounded-2xl font-medium text-lg hover:bg-purple-700 transition shadow-lg"
              >
                選好了，開始盤點我的武器 →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 科系介紹 Modal */}
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
              className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto mb-12"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{detailModalDept.departmentName}</h2>
                  <p className="text-gray-500">{detailModalDept.schoolName} · {detailModalDept.groupName}</p>
                </div>
                <button onClick={() => setDetailModalDept(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
              </div>
              <p className="text-gray-700 mb-4">{detailModalDept.fullDescription || detailModalDept.description || '暫無詳細介紹'}</p>
              <div className="flex flex-wrap gap-3 mb-6">
                {detailModalDept.website && (
                  <a href={detailModalDept.website} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 underline"
                  >
                    🌐 科系官網 ↗
                  </a>
                )}
                {detailModalDept.techadmiUrl ? (
                  <a href={detailModalDept.techadmiUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    📋 科系簡介 ↗
                  </a>
                ) : (
                  <a href={`https://www.techadmi.edu.tw/schools_detail.php?sch_id=${detailModalDept.schoolId}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    📋 科系簡介 ↗
                  </a>
                )}
                {detailModalDept.youtubeUrl && (
                  <a href={detailModalDept.youtubeUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    🎬 科系介紹影片 ↗
                  </a>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-purple-50 rounded-2xl p-5">
                  <h3 className="font-bold text-purple-700 mb-3 text-base">教學特色</h3>
                  <div className="space-y-2">
                    {detailModalDept.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-purple-400 mt-0.5 shrink-0">•</span><span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-2xl p-5">
                  <h3 className="font-bold text-blue-700 mb-3 text-base">研究方向</h3>
                  <div className="space-y-2">
                    {detailModalDept.researchAreas.slice(0, 5).map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-blue-400 mt-0.5 shrink-0">•</span><span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-green-50 rounded-2xl p-5">
                  <h3 className="font-bold text-green-700 mb-3 text-base">畢業出路</h3>
                  <div className="space-y-2">
                    {detailModalDept.careerPaths.slice(0, 5).map((c, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-400 mt-0.5 shrink-0">•</span><span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 護城河：職涯出路資料 */}
              {detailModalDept.careerOutcomes && (
                <div className="space-y-4 mb-6">
                  {/* 薪資 */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5">
                    <h3 className="font-bold text-amber-700 mb-3 text-base">薪資行情</h3>
                    <div className="flex gap-4 mb-3">
                      <div className="flex-1 text-center">
                        <div className="text-2xl font-bold text-amber-600">
                          {detailModalDept.careerOutcomes.freshAvgSalary > 0
                            ? `${(detailModalDept.careerOutcomes.freshAvgSalary / 1000).toFixed(1)}K`
                            : '--'}
                        </div>
                        <div className="text-xs text-gray-500">新鮮人月薪</div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {detailModalDept.careerOutcomes.avgSalary > 0
                            ? `${(detailModalDept.careerOutcomes.avgSalary / 1000).toFixed(1)}K`
                            : '--'}
                        </div>
                        <div className="text-xs text-gray-500">平均月薪</div>
                      </div>
                    </div>
                    {/* Top jobs */}
                    <div className="space-y-1.5">
                      {detailModalDept.careerOutcomes.topJobs.slice(0, 3).map((j, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">{j.title}</span>
                          <span className="text-amber-600 font-medium">
                            {j.avgSalary > 0 ? `${(j.avgSalary / 1000).toFixed(1)}K/月` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 工具 + 技能 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-indigo-50 rounded-2xl p-5">
                      <h3 className="font-bold text-indigo-700 mb-3 text-sm">必備工具</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {detailModalDept.careerOutcomes.requiredTools.length > 0
                          ? detailModalDept.careerOutcomes.requiredTools.map((t, i) => (
                            <span key={i} className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full">{t}</span>
                          ))
                          : <span className="text-xs text-gray-400">暫無資料</span>
                        }
                      </div>
                    </div>
                    <div className="bg-teal-50 rounded-2xl p-5">
                      <h3 className="font-bold text-teal-700 mb-3 text-sm">必備技能</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {detailModalDept.careerOutcomes.requiredSkills.slice(0, 5).map((s, i) => (
                          <span key={i} className="px-2 py-1 text-xs bg-teal-100 text-teal-700 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 熱門產業 */}
                  {detailModalDept.careerOutcomes.topIndustries.length > 0 && (
                    <div className="bg-gray-50 rounded-2xl p-5">
                      <h3 className="font-bold text-gray-700 mb-3 text-sm">主要就業產業</h3>
                      <div className="space-y-1.5">
                        {detailModalDept.careerOutcomes.topIndustries.slice(0, 4).map((ind, i) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">{ind.name}</span>
                            <span className="text-gray-500">{(ind.salary / 1000).toFixed(1)}K/月</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-400 text-right">
                    資料來源：{detailModalDept.careerOutcomes.source} · {detailModalDept.careerOutcomes.fetchedAt}
                  </p>
                </div>
              )}
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
  // Step 2: 盤點你的武器（年級分流）
  // ════════════════════════════════════════════════════
  const renderStep2 = () => {
    const subProgress = ((currentSubStep + 1) / subSteps.length) * 100;
    const gradeLabel = profile.grade === 10 ? '高一' : profile.grade === 11 ? '高二' : '高三';

    return (
      <div className="w-full max-w-2xl mx-auto text-center">
        <div className="mb-10">
          <div className="w-full h-1 bg-gray-200 rounded-full mb-6">
            <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${subProgress}%` }} />
          </div>
          <p className="text-sm text-gray-400">問題 {currentSubStep + 1} / {subSteps.length} · {gradeLabel}</p>
        </div>

        <AnimatePresence mode="wait">
          {/* ── 在校成績百分比 ── */}
          {currentSub === 'percentile' && (
            <motion.div key="percentile" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <h1 className="text-4xl font-bold text-gray-900 mb-10">在校成績大約在多少百分比？</h1>
              <div className="grid grid-cols-2 gap-3">
                {PERCENTILE_OPTIONS.map((opt, i) => (
                  <motion.button key={opt.value} {...stagger(i)}
                    onClick={() => handleSingleChoice('gradePercentile', opt.value)}
                    className="p-5 rounded-2xl bg-white/80 text-xl font-medium hover:bg-white shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── 證照（從證照資料庫載入該職群的證照） ── */}
          {currentSub === 'certificate' && (
            <motion.div key="certificate" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">你有哪些證照？</h1>
              <p className="text-gray-500 mb-8">勾選你已經取得的證照</p>

              {groupCerts.length === 0 ? (
                <div>
                  <p className="text-gray-400 mb-6">目前沒有對應的證照資料</p>
                  <button onClick={() => confirmMultiChoice('certificates', [])}
                    className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-medium hover:bg-emerald-700 transition"
                  >
                    下一步 →
                  </button>
                </div>
              ) : (
                <div>
                  <div className="space-y-6 mb-8">
                    {(['丙', '乙'] as const).map(level => {
                      const certs = groupCerts.filter(c => c.level === level);
                      if (certs.length === 0) return null;
                      return (
                        <div key={level}>
                          <div className="text-sm font-bold text-gray-400 mb-2 uppercase">{level}級證照</div>
                          <div className="space-y-2">
                            {certs.map(cert => (
                              <label key={cert.id}
                                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition ${
                                  selectedCerts.includes(cert.name)
                                    ? 'bg-emerald-100 border-2 border-emerald-400'
                                    : 'bg-white/80 hover:bg-white border-2 border-transparent'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  className="w-5 h-5 accent-emerald-600"
                                  checked={selectedCerts.includes(cert.name)}
                                  onChange={e => {
                                    if (e.target.checked) setSelectedCerts(prev => [...prev, cert.name]);
                                    else setSelectedCerts(prev => prev.filter(c => c !== cert.name));
                                  }}
                                />
                                <span className="font-medium">{cert.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => confirmMultiChoice('certificates', selectedCerts)}
                    className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-medium hover:bg-emerald-700 transition text-lg shadow-lg"
                  >
                    選好了{selectedCerts.length > 0 ? ` (${selectedCerts.length} 張)` : ''} →
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ── 競賽（高一: 簡易版；高二/高三: 詳細版） ── */}
          {currentSub === 'competition' && profile.grade === 10 && (
            <motion.div key="comp-simple" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <h1 className="text-4xl font-bold text-gray-900 mb-10">你有參加過技藝競賽嗎？</h1>
              <div className="space-y-4">
                {[
                  { value: true, label: '有參加過' },
                  { value: false, label: '還沒有' },
                ].map((opt, i) => (
                  <motion.button key={String(opt.value)} {...stagger(i)}
                    onClick={() => handleSingleChoice('competitions',
                      opt.value ? [{ competitionId: 'school-competition', placing: '' }] : []
                    )}
                    className="w-full p-6 rounded-2xl bg-white/80 text-xl font-medium hover:bg-white shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {currentSub === 'competition' && profile.grade !== 10 && (
            <motion.div key="comp-detail" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">你有參加過這些競賽嗎？</h1>
              <p className="text-gray-500 mb-8">選擇你獲得的名次，沒參加就不用選</p>

              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1 mb-8">
                {groupComps.map(comp => (
                  <div key={comp.id} className="p-4 bg-white/80 rounded-xl text-left">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{comp.name}</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          comp.level === '全國' ? 'bg-blue-100 text-blue-700' :
                          comp.level === '國際' ? 'bg-purple-100 text-purple-700' :
                          comp.level === '縣市' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>{comp.level}</span>
                      </div>
                    </div>
                    <select
                      value={compPlacings[comp.id] || ''}
                      onChange={e => setCompPlacings(prev => ({ ...prev, [comp.id]: e.target.value }))}
                      className="w-full p-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-emerald-300 outline-none"
                    >
                      <option value="">沒參加</option>
                      {PLACING_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  const records: CompetitionRecord[] = Object.entries(compPlacings)
                    .filter(([_, p]) => p !== '')
                    .map(([id, p]) => ({ competitionId: id, placing: p }));
                  confirmMultiChoice('competitions', records);
                }}
                className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-medium hover:bg-emerald-700 transition text-lg shadow-lg"
              >
                選好了{Object.values(compPlacings).filter(v => v).length > 0
                  ? ` (${Object.values(compPlacings).filter(v => v).length} 項)`
                  : ''} →
              </button>
            </motion.div>
          )}

          {/* ── 專題作品 ── */}
          {currentSub === 'project' && (
            <motion.div key="project" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <h1 className="text-4xl font-bold text-gray-900 mb-10">你有做過專題或研究嗎？</h1>
              <div className="space-y-4">
                {[
                  { value: true, label: '有，已經完成或正在進行' },
                  { value: false, label: '還沒有' },
                ].map((opt, i) => (
                  <motion.button key={String(opt.value)} {...stagger(i)}
                    onClick={() => handleSingleChoice('hasProject', opt.value)}
                    className="w-full p-6 rounded-2xl bg-white/80 text-xl font-medium hover:bg-white shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── 特殊經歷（高三限定） ── */}
          {currentSub === 'specialExperiences' && (
            <motion.div key="special" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">你有什麼特殊經歷嗎？</h1>
              <p className="text-gray-500 mb-8">例如：開源貢獻、創業經驗、特殊才藝、社會服務...</p>
              <textarea
                value={specialText}
                onChange={e => setSpecialText(e.target.value)}
                placeholder="描述你的特殊經歷（選填）"
                className="w-full p-4 rounded-2xl bg-white/80 shadow-lg border-0 outline-none focus:ring-2 focus:ring-emerald-300 text-lg min-h-[120px] resize-none mb-6"
              />
              <button onClick={() => confirmMultiChoice('specialExperiences', specialText)}
                className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-medium hover:bg-emerald-700 transition text-lg shadow-lg"
              >
                {specialText.trim() ? '完成 →' : '跳過 →'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ════════════════════════════════════════════════════
  // Step 3: PathwayResults component
  // ════════════════════════════════════════════════════
  const renderStep3 = () => (
    <PathwayResults
      targets={targetDepartments}
      profile={profile}
      onSave={handleSave}
      onShare={handleShare}
      onStartPlanning={() => {
        trackFeatureUsage('start_planning_from_discovery', {});
        router.push('/ability-account');
      }}
    />
  );

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
