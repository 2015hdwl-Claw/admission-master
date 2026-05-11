'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { trackPageView, trackFeatureUsage } from '@/lib/analytics';
import DiscoveryProgress from '@/components/DiscoveryProgress';
import StepTransition from '@/components/StepTransition';

// ── 光域風格：6 步驟背景漸變 ──
const STEP_GRADIENTS = [
  'from-blue-50 via-sky-50 to-indigo-50',
  'from-purple-50 via-violet-50 to-fuchsia-50',
  'from-emerald-50 via-teal-50 to-cyan-50',
  'from-amber-50 via-yellow-50 to-orange-50',
  'from-orange-50 via-rose-50 to-red-50',
  'from-pink-50 via-rose-50 to-purple-50',
];

// ── 6 種入學管道 ──
const ADMISSION_PATHWAYS = {
  stars: { name: '繁星推薦', icon: '📚', description: '用在校成績申請，不用考統測', acceptanceRate: 18, deadline: '10/15', requirements: ['在校成績前 30%', '由學校推薦', '不用考統測'], benefits: ['不用考統測也能上科大', '壓力較小', '幫助縮短城鄉差距'] },
  selection: { name: '甄選入學', icon: '🎯', description: '統測成績 + 備審面試，展現你的特色', acceptanceRate: 12, deadline: '12/20', requirements: ['統測成績', '準備備審資料', '參加系所面試'], benefits: ['招生名額最多', '可以展現個人特色', '不只看成績'] },
  distribution: { name: '聯合登記分發', icon: '📝', description: '依統測成績填志願分發，分數決定一切', acceptanceRate: 8, deadline: '04/10', requirements: ['參加統測', '成績達到錄取標準', '依志願序分發'], benefits: ['標準最明確', '準備方式單純', '志願填越多上榜機會越高'] },
  skills: { name: '技優甄審', icon: '🏆', description: '用專業技藝成績或證照申請，免統測', acceptanceRate: 42, deadline: '03/05', requirements: ['持有乙級技術士證', '或參加技藝競賽獲獎', '繳交書審資料'], benefits: ['不用考統測', '強調技能與證照', '適合實作型學生'] },
  guarantee: { name: '技優保送', icon: '⭐', description: '技能競賽前三名直接保送科大', acceptanceRate: 91, deadline: '02/20', requirements: ['全國技能競賽前三名', '或具國手資格', '不需統測成績'], benefits: ['直接保送不用考試', '競爭者極少', '實力證明就能入學'] },
  special: { name: '特殊選才', icon: '🎓', description: '特殊才能、實作經驗的入學管道', acceptanceRate: 27, deadline: '01/15', requirements: ['特殊才能譝明', '實作經驗展現', '通過特殊選才審查'], benefits: ['不看統測成績', '肯定特殊才能', '適合有特殊專長的學生'] },
};

const GROUP_PATHWAY_MAPPING: Record<string, string[]> = {
  '餐旅群': ['stars', 'selection', 'special', 'skills', 'guarantee'],
  '機械群': ['stars', 'selection', 'skills', 'distribution', 'guarantee'],
  '電機群': ['stars', 'selection', 'skills', 'distribution', 'guarantee'],
  '電子群': ['stars', 'selection', 'skills', 'distribution', 'guarantee'],
  '資訊群': ['stars', 'selection', 'skills', 'special', 'guarantee'],
  '商管群': ['stars', 'selection', 'distribution', 'skills'],
  '設計群': ['selection', 'special', 'stars', 'skills'],
  '農業群': ['stars', 'selection', 'skills', 'special'],
  '化工群': ['stars', 'selection', 'skills', 'distribution'],
  '土木群': ['stars', 'selection', 'skills', 'distribution'],
  '海事群': ['stars', 'selection', 'skills', 'special'],
  '護理群': ['stars', 'selection', 'skills', 'distribution'],
  '家政群': ['selection', 'special', 'stars', 'skills'],
  '語文群': ['stars', 'selection', 'special'],
  '商業與管理群': ['stars', 'selection', 'distribution', 'skills'],
};

const ALL_SCHOOLS = [
  { id: 'ntust', name: '國立臺灣科技大學' },
  { id: 'ntut', name: '國立臺北科技大學' },
  { id: 'nkust', name: '國立高雄科技大學' },
  { id: 'nfcu', name: '國立虎尾科技大學' },
  { id: 'nfu', name: '國立勤益科技大學' },
  { id: 'ncnu', name: '國立暨南國際大學' },
  { id: 'nchu', name: '國立中興大學' },
  { id: 'ncyu', name: '國立嘉義大學' },
  { id: 'nutn', name: '國立臺南大學' },
  { id: 'ntou', name: '國立臺灣海洋大學' },
];

const ALL_DEPARTMENTS = [
  { id: '01', name: '餐旅群' }, { id: '02', name: '機械群' },
  { id: '03', name: '電機群' }, { id: '04', name: '電子群' },
  { id: '05', name: '資訊群' }, { id: '06', name: '商管群' },
  { id: '07', name: '設計群' }, { id: '08', name: '農業群' },
  { id: '09', name: '化工群' }, { id: '10', name: '土木群' },
  { id: '11', name: '海事群' }, { id: '12', name: '護理群' },
  { id: '13', name: '家政群' }, { id: '14', name: '語文群' },
  { id: '15', name: '商業與管理群' },
];

// ── 盤點子步驟 ──
type SubStep = 'grade' | 'percentile' | 'certificate' | 'competition' | 'project';
const SUB_STEPS: SubStep[] = ['grade', 'percentile', 'certificate', 'competition', 'project'];

const GRADE_OPTIONS = [
  { value: 10, label: '高一（十年級）' },
  { value: 11, label: '高二（十一年級）' },
  { value: 12, label: '高三（十二年級）' },
];

const PERCENTILE_OPTIONS = [
  { value: 5, label: '前 5%' }, { value: 10, label: '前 10%' },
  { value: 15, label: '前 15%' }, { value: 25, label: '前 25%' },
  { value: 30, label: '前 30%' }, { value: 50, label: '前 50%' },
  { value: 75, label: '前 75%' },
];

interface InventoryAnswers {
  grade: number;
  gradePercentile: number;
  hasCertificates: boolean;
  certificateLevel: string;
  hasCompetition: boolean;
  competitionLevel: string;
  hasProject: boolean;
}

interface GapItem {
  name: string;
  status: 'ok' | 'warning' | 'danger';
  current?: string;
  required?: string;
  daysLeft?: number;
}

interface ActionItem {
  title: string;
  deadline: string;
  daysLeft: number;
  priority: 'high' | 'medium' | 'low';
  done: boolean;
}

// ── 動畫輔助 ──
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.12, duration: 0.4 },
});

// ── 主頁面 ──
export default function FirstDiscoveryPage() {
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDepartmentName, setSelectedDepartmentName] = useState('');
  const [recommendedPathways, setRecommendedPathways] = useState<string[]>([]);
  const [selectedPathway, setSelectedPathway] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // 盤點子步驟
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [inventory, setInventory] = useState<InventoryAnswers>({
    grade: 0, gradePercentile: 0, hasCertificates: false,
    certificateLevel: '', hasCompetition: false, competitionLevel: '', hasProject: false,
  });

  // 差距分析
  const [gapItems, setGapItems] = useState<GapItem[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [currentProbability, setCurrentProbability] = useState(0);
  const [potentialProbability, setPotentialProbability] = useState(0);
  const [animatedProbability, setAnimatedProbability] = useState(0);
  const [animatedPotential, setAnimatedPotential] = useState(0);

  // 觸控滑動
  const [touchStart, setTouchStart] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('discovery_state_v2');
    if (saved) {
      try {
        const s = JSON.parse(saved);
        if (s.step !== undefined) setCurrentStep(s.step);
        if (s.school) setSelectedSchool(s.school);
        if (s.department) setSelectedDepartment(s.department);
        if (s.departmentName) setSelectedDepartmentName(s.departmentName);
        if (s.pathways) setRecommendedPathways(s.pathways);
        if (s.pathway) setSelectedPathway(s.pathway);
        if (s.inventory) setInventory(s.inventory);
        if (s.gapItems) setGapItems(s.gapItems);
        if (s.actionItems) setActionItems(s.actionItems);
        if (s.currentProbability) setCurrentProbability(s.currentProbability);
        if (s.potentialProbability) setPotentialProbability(s.potentialProbability);
      } catch {}
    }
    trackPageView('first_discovery');
    setLoading(false);
  }, []);

  // 機率動畫
  useEffect(() => {
    if (currentStep === 3 && currentProbability > 0) {
      const timer = setTimeout(() => {
        setAnimatedProbability(prev => {
          if (prev < currentProbability) return Math.min(prev + 2, currentProbability);
          return prev;
        });
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [currentStep, currentProbability, animatedProbability]);

  useEffect(() => {
    if (currentStep === 3 && potentialProbability > 0) {
      const timer = setTimeout(() => {
        setAnimatedPotential(prev => {
          if (prev < potentialProbability) return Math.min(prev + 2, potentialProbability);
          return prev;
        });
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [currentStep, potentialProbability, animatedPotential]);

  const saveState = useCallback(() => {
    localStorage.setItem('discovery_state_v2', JSON.stringify({
      step: currentStep, school: selectedSchool, department: selectedDepartment,
      departmentName: selectedDepartmentName, pathways: recommendedPathways,
      pathway: selectedPathway, inventory, gapItems, actionItems,
      currentProbability, potentialProbability,
    }));
  }, [currentStep, selectedSchool, selectedDepartment, selectedDepartmentName,
      recommendedPathways, selectedPathway, inventory, gapItems, actionItems,
      currentProbability, potentialProbability]);

  useEffect(() => { if (!loading) saveState(); }, [currentStep, selectedPathway, inventory, loading, saveState]);

  const goToStep = (step: number) => {
    if (step === currentStep) return;
    setDirection(step > currentStep ? 'forward' : 'backward');
    setCurrentStep(step);
  };

  const autoAdvance = (step: number) => {
    setTimeout(() => goToStep(step), 650);
  };

  // 觸控滑動
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientY);
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart - e.changedTouches[0].clientY;
    if (diff > 60 && currentStep < 5) goToStep(currentStep + 1);
    if (diff < -60 && currentStep > 0) goToStep(currentStep - 1);
  };

  const schoolName = ALL_SCHOOLS.find(s => s.id === selectedSchool)?.name || '';
  const pathwayInfo = selectedPathway ? ADMISSION_PATHWAYS[selectedPathway as keyof typeof ADMISSION_PATHWAYS] : null;

  const calculateGap = () => {
    const pathway = ADMISSION_PATHWAYS[selectedPathway as keyof typeof ADMISSION_PATHWAYS];
    if (!pathway) return;
    const items: GapItem[] = [];
    const actions: ActionItem[] = [];
    let score = 0;
    let gain = 0;

    if (pathway.requirements.some(r => r.includes('在校成績') || r.includes('成績'))) {
      if (inventory.gradePercentile > 0 && inventory.gradePercentile <= 30) {
        items.push({ name: '在校成績', status: 'ok' }); score += 35;
      } else if (inventory.gradePercentile > 30 && inventory.gradePercentile <= 50) {
        items.push({ name: '在校成績', status: 'warning', current: `前 ${inventory.gradePercentile}%`, required: '前 30%', daysLeft: 180 });
        score += 15; gain += 20;
        actions.push({ title: '提升在校成績至前 30%', deadline: '下次段考前', daysLeft: 60, priority: 'high', done: false });
      } else if (inventory.gradePercentile > 50) {
        items.push({ name: '在校成績', status: 'danger', required: '前 30%', daysLeft: 180 });
        gain += 35;
        actions.push({ title: '擬定成績提升計畫', deadline: '本學期結束前', daysLeft: 90, priority: 'high', done: false });
      }
    }

    if (pathway.requirements.some(r => r.includes('證照') || r.includes('技術士'))) {
      if (inventory.hasCertificates) {
        items.push({ name: '技術士證照', status: 'ok' }); score += 30;
      } else {
        items.push({ name: '乙級技術士證照', status: 'danger', required: '乙級證照', daysLeft: 90 });
        gain += 30;
        actions.push({ title: '報名並準備乙級技術士考試', deadline: '下次考試日期', daysLeft: 72, priority: 'high', done: false });
      }
    }

    if (pathway.requirements.some(r => r.includes('競賽'))) {
      if (inventory.hasCompetition) {
        items.push({ name: '技藝競賽經驗', status: 'ok' }); score += 25;
      } else {
        items.push({ name: '技藝競賽', status: 'warning', current: '尚未參加', required: '競賽前三名', daysLeft: 120 });
        score += 5; gain += 20;
        actions.push({ title: '了解並報名技藝競賽', deadline: '校內初選前', daysLeft: 45, priority: 'medium', done: false });
      }
    }

    if (inventory.hasProject) {
      items.push({ name: '專題作品', status: 'ok' }); score += 10;
    } else {
      items.push({ name: '專題作品', status: 'warning', current: '尚未準備', required: '需要實作專題', daysLeft: 150 });
      gain += 10;
      actions.push({ title: '開始準備專題作品', deadline: '申請前完成', daysLeft: 120, priority: 'medium', done: false });
    }

    items.push({ name: '備審資料 / 讀書計畫', status: 'warning', current: '尚未準備', required: '讀書計畫 + 備審資料', daysLeft: 60 });
    actions.push({ title: '完成讀書計畫初稿', deadline: '申請截止前 30 天', daysLeft: 30, priority: 'low', done: false });

    const prioOrder = { high: 0, medium: 1, low: 2 };
    actions.sort((a, b) => prioOrder[a.priority] - prioOrder[b.priority]);

    setGapItems(items);
    setActionItems(actions);
    setCurrentProbability(Math.min(95, score));
    setPotentialProbability(Math.min(95, score + gain));
    setAnimatedProbability(0);
    setAnimatedPotential(0);
  };

  // 子步驟回答
  const handleSubAnswer = (field: string, value: any) => {
    const updated = { ...inventory, [field]: value };
    setInventory(updated);
    const nextIndex = currentSubStep + 1;
    if (nextIndex < SUB_STEPS.length) {
      setTimeout(() => setCurrentSubStep(nextIndex), 600);
    } else {
      setTimeout(() => {
        // 計算差距
        const pathway = ADMISSION_PATHWAYS[selectedPathway as keyof typeof ADMISSION_PATHWAYS];
        if (!pathway) return;
        const items: GapItem[] = [];
        const actions: ActionItem[] = [];
        let score = 0;
        let gain = 0;

        if (pathway.requirements.some((r: string) => r.includes('在校成績') || r.includes('成績'))) {
          if (updated.gradePercentile > 0 && updated.gradePercentile <= 30) { items.push({ name: '在校成績', status: 'ok' }); score += 35; }
          else if (updated.gradePercentile > 30 && updated.gradePercentile <= 50) { items.push({ name: '在校成績', status: 'warning', current: `前 ${updated.gradePercentile}%`, required: '前 30%', daysLeft: 180 }); score += 15; gain += 20; actions.push({ title: '提升在校成績至前 30%', deadline: '下次段考前', daysLeft: 60, priority: 'high', done: false }); }
          else if (updated.gradePercentile > 50) { items.push({ name: '在校成績', status: 'danger', required: '前 30%', daysLeft: 180 }); gain += 35; actions.push({ title: '擬定成績提升計畫', deadline: '本學期結束前', daysLeft: 90, priority: 'high', done: false }); }
        }
        if (pathway.requirements.some((r: string) => r.includes('證照') || r.includes('技術士'))) {
          if (updated.hasCertificates) { items.push({ name: '技術士證照', status: 'ok' }); score += 30; }
          else { items.push({ name: '乙級技術士證照', status: 'danger', required: '乙級證照', daysLeft: 90 }); gain += 30; actions.push({ title: '報名並準備乙級技術士考試', deadline: '下次考試日期', daysLeft: 72, priority: 'high', done: false }); }
        }
        if (pathway.requirements.some((r: string) => r.includes('競賽'))) {
          if (updated.hasCompetition) { items.push({ name: '技藝競賽經驗', status: 'ok' }); score += 25; }
          else { items.push({ name: '技藝競賽', status: 'warning', current: '尚未參加', required: '競賽前三名', daysLeft: 120 }); score += 5; gain += 20; actions.push({ title: '了解並報名技藝競賽', deadline: '校內初選前', daysLeft: 45, priority: 'medium', done: false }); }
        }
        if (updated.hasProject) { items.push({ name: '專題作品', status: 'ok' }); score += 10; }
        else { items.push({ name: '專題作品', status: 'warning', current: '尚未準備', required: '需要實作專題', daysLeft: 150 }); gain += 10; actions.push({ title: '開始準備專題作品', deadline: '申請前完成', daysLeft: 120, priority: 'medium', done: false }); }
        items.push({ name: '備審資料 / 讀書計畫', status: 'warning', current: '尚未準備', required: '讀書計畫 + 備審資料', daysLeft: 60 });
        actions.push({ title: '完成讀書計畫初稿', deadline: '申請截止前 30 天', daysLeft: 30, priority: 'low', done: false });
        const prioOrder = { high: 0, medium: 1, low: 2 };
        actions.sort((a, b) => prioOrder[a.priority] - prioOrder[b.priority]);

        setGapItems(items);
        setActionItems(actions);
        setCurrentProbability(Math.min(95, score));
        setPotentialProbability(Math.min(95, score + gain));
        setAnimatedProbability(0);
        setAnimatedPotential(0);
        goToStep(3);
      }, 600);
    }
  };

  const filteredSchools = ALL_SCHOOLS.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // ── 步驟 1: 我想上哪裡？ ──
  const renderStep1 = () => (
    <div className="text-center w-full max-w-2xl mx-auto">
      <motion.h1 {...fadeUp} className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
        你想要上哪個科系？
      </motion.h1>
      <motion.p {...fadeUp} transition={{ delay: 0.15 }} className="text-xl text-gray-500 mb-10">
        輸入學校名稱，開始你的發現旅程
      </motion.p>

      <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="mb-8">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="例如：台灣科技大學"
          className="w-full px-8 py-5 text-2xl rounded-2xl border-0 bg-white/80 shadow-lg outline-none focus:ring-2 focus:ring-blue-300 transition"
          autoFocus
        />
      </motion.div>

      {searchQuery.length >= 1 && (
        <div className="space-y-3 max-h-[50vh] overflow-y-auto">
          {filteredSchools.map((school, i) => (
            <motion.button
              key={school.id} {...stagger(i)}
              onClick={() => { setSelectedSchool(school.id); trackFeatureUsage('discovery_school_selected', { school_id: school.id }); }}
              className={`w-full p-5 rounded-2xl text-left text-xl transition-all duration-300 ${
                selectedSchool === school.id
                  ? 'bg-blue-600 text-white shadow-lg scale-[1.02]'
                  : 'bg-white/70 hover:bg-white shadow-sm hover:shadow'
              }`}
            >
              {school.name}
            </motion.button>
          ))}
        </div>
      )}

      {selectedSchool && filteredSchools.map(s => s.id).includes(selectedSchool) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6">
          <p className="text-sm text-gray-400 animate-pulse">已選擇 {schoolName}，向下滑動繼續 ↓</p>
        </motion.div>
      )}
    </div>
  );

  // ── 步驟 1b: 選擇職群（步驟 1 的延伸） ──
  const renderStep1b = () => (
    <div className="text-center w-full max-w-3xl mx-auto">
      <motion.h1 {...fadeUp} className="text-4xl font-bold text-gray-900 mb-4">
        {schoolName}
      </motion.h1>
      <motion.p {...fadeUp} transition={{ delay: 0.1 }} className="text-xl text-gray-500 mb-10">
        選擇你就讀的職群
      </motion.p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {ALL_DEPARTMENTS.map((dept, i) => (
          <motion.button
            key={dept.id} {...stagger(i)}
            onClick={() => {
              setSelectedDepartment(dept.id);
              setSelectedDepartmentName(dept.name);
              trackFeatureUsage('discovery_department_selected', { department_id: dept.id });
              const pathways = GROUP_PATHWAY_MAPPING[dept.name] || ['stars', 'selection', 'distribution'];
              setRecommendedPathways(pathways);
              autoAdvance(1);
            }}
            className={`p-5 rounded-2xl text-center text-lg font-medium transition-all duration-300 ${
              selectedDepartment === dept.id
                ? 'bg-purple-600 text-white shadow-lg scale-[1.02]'
                : 'bg-white/70 hover:bg-white shadow-sm hover:shadow'
            }`}
          >
            {dept.name}
          </motion.button>
        ))}
      </div>
    </div>
  );

  // ── 步驟 2: 這個目標需要什麼？ ──
  const renderStep2 = () => (
    <div className="w-full max-w-3xl mx-auto text-center">
      <motion.h1 {...fadeUp} className="text-4xl font-bold text-gray-900 mb-3">
        {selectedDepartmentName}有 {recommendedPathways.length} 種不同的升學路徑
      </motion.h1>
      <motion.p {...fadeUp} transition={{ delay: 0.1 }} className="text-lg text-gray-500 mb-8">
        每一條路都可以通往你想去的學校。點擊一條你想走的路。
      </motion.p>

      <div className="space-y-4">
        {recommendedPathways.map((key, i) => {
          const p = ADMISSION_PATHWAYS[key as keyof typeof ADMISSION_PATHWAYS];
          if (!p) return null;
          return (
            <motion.button
              key={key} {...stagger(i)}
              onClick={() => {
                setSelectedPathway(key);
                trackFeatureUsage('discovery_pathway_selected', { pathway: key });
                setCurrentSubStep(0);
                autoAdvance(2);
              }}
              className={`w-full text-left p-6 rounded-2xl transition-all duration-300 ${
                selectedPathway === key
                  ? 'bg-purple-600 text-white shadow-xl scale-[1.02]'
                  : 'bg-white/80 hover:bg-white shadow hover:shadow-lg'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{p.icon}</span>
                    <div>
                      <div className="font-bold text-xl">{p.name}</div>
                      <div className={`text-sm ${selectedPathway === key ? 'text-purple-100' : 'text-gray-500'}`}>{p.description}</div>
                    </div>
                  </div>
                  <div className="ml-12 flex flex-wrap gap-2 mt-2">
                    {p.benefits.map((b, j) => (
                      <span key={j} className={`px-2 py-1 text-xs rounded-full ${selectedPathway === key ? 'bg-purple-500 text-purple-100' : 'bg-green-100 text-green-700'}`}>
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right ml-4 shrink-0">
                  <div className={`text-sm ${selectedPathway === key ? 'text-purple-100' : 'text-gray-400'}`}>去年錄取率</div>
                  <div className={`font-bold text-3xl ${selectedPathway === key ? 'text-white' : 'text-purple-600'}`}>{p.acceptanceRate}%</div>
                  <div className={`text-xs ${selectedPathway === key ? 'text-purple-100' : 'text-gray-400'}`}>截止 {p.deadline}</div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  // ── 步驟 3: 我現在有什麼？（全螢幕逐題） ──
  const renderStep3 = () => {
    const sub = SUB_STEPS[currentSubStep];
    const subProgress = ((currentSubStep + 1) / SUB_STEPS.length) * 100;

    return (
      <div className="w-full max-w-2xl mx-auto text-center">
        <div className="mb-10">
          <div className="w-full h-1 bg-gray-200 rounded-full mb-8">
            <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${subProgress}%` }} />
          </div>
          <p className="text-sm text-gray-400 mb-2">問題 {currentSubStep + 1} / {SUB_STEPS.length}</p>
        </div>

        {sub === 'grade' && (
          <>
            <motion.h1 key="grade-q" {...fadeUp} className="text-4xl font-bold text-gray-900 mb-10">你的年級？</motion.h1>
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
          </>
        )}

        {sub === 'percentile' && (
          <>
            <motion.h1 key="perc-q" {...fadeUp} className="text-4xl font-bold text-gray-900 mb-10">在校成績大約在多少百分比？</motion.h1>
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
          </>
        )}

        {sub === 'certificate' && (
          <>
            <motion.h1 key="cert-q" {...fadeUp} className="text-4xl font-bold text-gray-900 mb-10">你有技術士證照嗎？</motion.h1>
            <div className="space-y-4">
              {[
                { value: 'none', label: '還沒有', field: 'hasCertificates', fieldVal: false },
                { value: '丙級', label: '有丙級證照', field: 'hasCertificates', fieldVal: true },
                { value: '乙級', label: '有乙級證照', field: 'hasCertificates', fieldVal: true },
                { value: '甲級', label: '有甲級證照', field: 'hasCertificates', fieldVal: true },
              ].map((opt, i) => (
                <motion.button key={opt.value} {...stagger(i)}
                  onClick={() => { handleSubAnswer('hasCertificates', opt.fieldVal); handleSubAnswer('certificateLevel', opt.value === 'none' ? '' : opt.value); }}
                  className="w-full p-6 rounded-2xl bg-white/80 text-xl font-medium hover:bg-white shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </>
        )}

        {sub === 'competition' && (
          <>
            <motion.h1 key="comp-q" {...fadeUp} className="text-4xl font-bold text-gray-900 mb-10">你有參加過技藝競賽嗎？</motion.h1>
            <div className="space-y-4">
              {[
                { value: 'none', label: '沒有參加過' },
                { value: '校內', label: '校內比賽' },
                { value: '區域', label: '區域賽' },
                { value: '全國', label: '全國賽' },
              ].map((opt, i) => (
                <motion.button key={opt.value} {...stagger(i)}
                  onClick={() => { handleSubAnswer('hasCompetition', opt.value !== 'none'); handleSubAnswer('competitionLevel', opt.value === 'none' ? '' : opt.value); }}
                  className="w-full p-6 rounded-2xl bg-white/80 text-xl font-medium hover:bg-white shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </>
        )}

        {sub === 'project' && (
          <>
            <motion.h1 key="proj-q" {...fadeUp} className="text-4xl font-bold text-gray-900 mb-10">你有做過專題或研究嗎？</motion.h1>
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
          </>
        )}
      </div>
    );
  };

  // ── 步驟 4: 我的差距在哪裡？ ✨ 魔法時刻 ──
  const renderStep4 = () => (
    <div className="w-full max-w-3xl mx-auto text-center">
      <motion.h1 {...fadeUp} className="text-4xl font-bold text-gray-900 mb-2">✨ 你的差距分析</motion.h1>
      <motion.p {...fadeUp} transition={{ delay: 0.1 }} className="text-lg text-gray-500 mb-8">
        🎯 目標：{schoolName} / {selectedDepartmentName} / {pathwayInfo?.icon} {pathwayInfo?.name}
      </motion.p>

      {/* 機率卡片 */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/80 rounded-2xl p-6 shadow-sm text-center">
          <div className="text-sm text-gray-500 mb-1">目前錄取機率</div>
          <div className="text-6xl font-bold text-indigo-600">{animatedProbability}%</div>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-center text-white shadow-lg">
          <div className="text-sm opacity-80 mb-1">如果你完成這些</div>
          <div className="text-6xl font-bold">{animatedPotential}%</div>
        </div>
      </motion.div>

      {/* 差距項目 */}
      <div className="space-y-3 mb-8">
        {gapItems.map((item, i) => (
          <motion.div key={i} {...stagger(i + 3)}
            className={`flex items-center justify-between p-5 rounded-2xl ${
              item.status === 'ok' ? 'bg-green-50' : item.status === 'warning' ? 'bg-yellow-50' : 'bg-red-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.status === 'ok' ? '✅' : item.status === 'warning' ? '🟡' : '🔴'}</span>
              <div className="text-left">
                <div className="font-medium text-lg">{item.name}</div>
                {item.status === 'warning' && item.current && (
                  <div className="text-sm text-yellow-700">目前：{item.current} → 需要：{item.required}</div>
                )}
                {item.status === 'danger' && item.required && (
                  <div className="text-sm text-red-700">需要：{item.required}</div>
                )}
              </div>
            </div>
            {item.status === 'ok' && <span className="text-green-600 font-medium">已具備</span>}
            {item.daysLeft && item.status !== 'ok' && (
              <span className={`text-sm font-medium ${item.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                還有 {item.daysLeft} 天
              </span>
            )}
          </motion.div>
        ))}
      </div>

      <motion.div {...fadeUp} transition={{ delay: 1.5 }}
        className={`rounded-2xl p-6 ${currentProbability < 50 ? 'bg-blue-50' : 'bg-green-50'}`}
      >
        <p className={`text-lg font-medium ${currentProbability < 50 ? 'text-blue-800' : 'text-green-800'}`}>
          {currentProbability < 50
            ? `💡 別擔心！如果你完成接下來的行動計畫，錄取機率可以提升到 ${potentialProbability}%`
            : `🎉 你的條件已經很不錯了！完成行動計畫可以讓你更有把握。`
          }
        </p>
      </motion.div>

      <motion.p {...fadeUp} transition={{ delay: 2.5 }} className="mt-6 text-sm text-gray-400 animate-pulse">
        向下滑動查看你的行動計畫 ↓
      </motion.p>
    </div>
  );

  // ── 步驟 5: 我需要完成什麼？ ──
  const renderStep5 = () => (
    <div className="w-full max-w-3xl mx-auto text-center">
      <motion.h1 {...fadeUp} className="text-4xl font-bold text-gray-900 mb-2">🚀 你的行動計畫</motion.h1>
      <motion.p {...fadeUp} transition={{ delay: 0.1 }} className="text-lg text-gray-500 mb-8">
        一步一步來就好
      </motion.p>

      <div className="space-y-3 mb-8">
        {actionItems.map((item, i) => (
          <motion.div key={i} {...stagger(i)}
            className="flex items-center gap-4 p-5 rounded-2xl bg-white/80 shadow-sm"
          >
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => {
                const updated = [...actionItems];
                updated[i] = { ...updated[i], done: !updated[i].done };
                setActionItems(updated);
              }}
              className="w-6 h-6 rounded-lg border-gray-300 text-orange-500 focus:ring-orange-400"
            />
            <div className="flex-1 text-left">
              <div className={`font-medium text-lg ${item.done ? 'line-through text-gray-400' : ''}`}>{item.title}</div>
              <div className="text-sm text-gray-500">截止：{item.deadline}（還有 {item.daysLeft} 天）</div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              item.priority === 'high' ? 'bg-red-100 text-red-700' :
              item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
            }`}>
              {item.priority === 'high' ? '重要' : item.priority === 'medium' ? '中等' : '一般'}
            </span>
          </motion.div>
        ))}
      </div>

      {/* 摘要 */}
      <motion.div {...fadeUp} transition={{ delay: 1 }}
        className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white text-center mb-8"
      >
        <div className="grid grid-cols-3 gap-4">
          <div><div className="text-3xl font-bold">{currentProbability}%</div><div className="text-xs opacity-80">目前機率</div></div>
          <div><div className="text-3xl font-bold">{potentialProbability}%</div><div className="text-xs opacity-80">完成後</div></div>
          <div><div className="text-3xl font-bold">{recommendedPathways.length}</div><div className="text-xs opacity-80">可選管道</div></div>
        </div>
      </motion.div>

      <motion.p {...fadeUp} transition={{ delay: 1.5 }} className="text-sm text-gray-400 animate-pulse">
        向下滑動查看你的時間表 ↓
      </motion.p>
    </div>
  );

  // ── 步驟 6: 我的時間表 ──
  const renderStep6 = () => (
    <div className="w-full max-w-3xl mx-auto text-center">
      <motion.h1 {...fadeUp} className="text-4xl font-bold text-gray-900 mb-2">⏰ 你的時間表</motion.h1>
      <motion.p {...fadeUp} transition={{ delay: 0.1 }} className="text-lg text-gray-500 mb-8">
        倒數計時的行動計畫
      </motion.p>

      {/* 時間線 */}
      <div className="relative mb-10">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-pink-200" />
        <div className="space-y-6">
          {actionItems.map((item, i) => (
            <motion.div key={i} {...stagger(i)} className="flex items-start gap-5 pl-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                item.done ? 'bg-green-400 text-white' : item.priority === 'high' ? 'bg-red-400 text-white' : 'bg-gray-300 text-white'
              }`}>
                {item.done ? '✓' : i + 1}
              </div>
              <div className={`text-left flex-1 p-4 rounded-2xl ${item.done ? 'bg-green-50' : 'bg-white/80'}`}>
                <div className={`font-medium text-lg ${item.done ? 'line-through text-gray-400' : ''}`}>{item.title}</div>
                <div className="text-sm text-gray-500">{item.deadline}（還有 {item.daysLeft} 天）</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 終點行動按鈕（允許在終點有按鈕） */}
      <motion.div {...fadeUp} transition={{ delay: 1.5 }} className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => {
            const plan = { school: schoolName, department: selectedDepartmentName, pathway: pathwayInfo?.name,
              currentProbability, potentialProbability, actions: actionItems, createdAt: new Date().toISOString() };
            localStorage.setItem('saved_discovery_plan', JSON.stringify(plan));
            trackFeatureUsage('save_discovery_plan', { pathway: selectedPathway });
          }}
          className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-medium hover:bg-indigo-700 transition text-lg"
        >
          💾 儲存我的計畫
        </button>
        <button
          onClick={() => {
            const text = `🎓 我用升學大師發現，${schoolName} ${selectedDepartmentName}有 ${recommendedPathways.length} 種升學管道！\n\n我選擇了${pathwayInfo?.name}，目前錄取機率 ${currentProbability}%，完成準備後可達 ${potentialProbability}%！\n\n你也來試試：https://admission-master.vercel.app`;
            navigator.clipboard.writeText(text);
            trackFeatureUsage('share_discovery_plan', { pathway: selectedPathway });
          }}
          className="px-6 py-4 bg-green-600 text-white rounded-2xl font-medium hover:bg-green-700 transition text-lg"
        >
          📤 分享給朋友
        </button>
        <button
          onClick={() => { trackFeatureUsage('start_planning_from_discovery', { pathway: selectedPathway }); router.push('/ability-account'); }}
          className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-medium hover:from-blue-700 hover:to-indigo-700 transition text-lg"
        >
          開始完整規劃 →
        </button>
      </motion.div>
    </div>
  );

  // ── Loading ──
  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${STEP_GRADIENTS[0]} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // ── 決定顯示哪個步驟 ──
  // 步驟 0 = 選學校, 步驟 0.5 = 選職群
  const effectiveStep = currentStep;
  const isStep1b = currentStep === 0 && selectedSchool !== '' && selectedDepartment === '';

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${STEP_GRADIENTS[effectiveStep]} transition-all duration-700 ease-out flex flex-col`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <DiscoveryProgress currentStep={effectiveStep} />

      <main className="flex-1 flex flex-col items-center justify-center py-16 px-4">
        <StepTransition stepKey={effectiveStep} direction={direction}>
          {isStep1b ? renderStep1b() :
           effectiveStep === 0 ? renderStep1() :
           effectiveStep === 1 ? renderStep2() :
           effectiveStep === 2 ? renderStep3() :
           effectiveStep === 3 ? renderStep4() :
           effectiveStep === 4 ? renderStep5() :
           renderStep6()
          }
        </StepTransition>
      </main>

      {/* 極簡返回提示 */}
      {effectiveStep > 0 && !isStep1b && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="fixed bottom-6 left-0 right-0 text-center z-40"
        >
          <button
            onClick={() => goToStep(effectiveStep - 1)}
            className="text-sm text-gray-400 hover:text-gray-600 transition px-4 py-2"
          >
            ← 返回上一步
          </button>
        </motion.div>
      )}
    </div>
  );
}
