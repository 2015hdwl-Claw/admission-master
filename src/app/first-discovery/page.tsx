'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { trackPageView, trackFeatureUsage } from '@/lib/analytics';
import DiscoveryProgress from '@/components/DiscoveryProgress';

const ADMISSION_PATHWAYS = {
  stars: {
    name: '繁星推薦',
    icon: '📚',
    description: '用在校成績申請，不用考統測',
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    requirements: ['在校成績前 30%', '由學校推薦', '不用考統測'],
    benefits: ['不用考統測也能上科大', '壓力較小', '幫助縮短城鄉差距'],
    acceptanceRate: 18,
    deadline: '10/15',
  },
  selection: {
    name: '甄選入學',
    icon: '🎯',
    description: '統測成績 + 備審面試，展現你的特色',
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    requirements: ['統測成績', '準備備審資料', '參加系所面試'],
    benefits: ['招生名額最多', '可以展現個人特色', '不只看成績'],
    acceptanceRate: 12,
    deadline: '12/20',
  },
  distribution: {
    name: '聯合登記分發',
    icon: '📝',
    description: '依統測成績填志願分發，分數決定一切',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    requirements: ['參加統測', '成績達到錄取標準', '依志願序分發'],
    benefits: ['標準最明確', '準備方式單純', '志願填越多上榜機會越高'],
    acceptanceRate: 8,
    deadline: '04/10',
  },
  skills: {
    name: '技優甄審',
    icon: '🏆',
    description: '用專業技藝成績或證照申請，免統測',
    color: 'from-green-500 to-teal-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    requirements: ['持有乙級技術士證', '或參加技藝競賽獲獎', '繳交書審資料'],
    benefits: ['不用考統測', '強調技能與證照', '適合實作型學生'],
    acceptanceRate: 42,
    deadline: '03/05',
  },
  guarantee: {
    name: '技優保送',
    icon: '⭐',
    description: '技能競賽前三名直接保送科大',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    requirements: ['全國技能競賽前三名', '或具國手資格', '不需統測成績'],
    benefits: ['直接保送不用考試', '競爭者極少', '實力證明就能入學'],
    acceptanceRate: 91,
    deadline: '02/20',
  },
  special: {
    name: '特殊選才',
    icon: '🎓',
    description: '特殊才能、實作經驗的入學管道',
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    requirements: ['特殊才能證明', '實作經驗展現', '通過特殊選才審查'],
    benefits: ['不看統測成績', '肯定特殊才能', '適合有特殊專長的學生'],
    acceptanceRate: 27,
    deadline: '01/15',
  },
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
  { id: 'ncnu', name: '國立暨南國際大學' },
  { id: 'nchu', name: '國立中興大學' },
  { id: 'ncyu', name: '國立嘉義大學' },
  { id: 'nkust', name: '國立高雄科技大學' },
  { id: 'nfcu', name: '國立虎尾科技大學' },
  { id: 'nfu', name: '國立勤益科技大學' },
  { id: 'nutn', name: '國立臺南大學' },
  { id: 'ntou', name: '國立臺灣海洋大學' },
];

const ALL_DEPARTMENTS = [
  { id: '01', name: '餐旅群' },
  { id: '02', name: '機械群' },
  { id: '03', name: '電機群' },
  { id: '04', name: '電子群' },
  { id: '05', name: '資訊群' },
  { id: '06', name: '商管群' },
  { id: '07', name: '設計群' },
  { id: '08', name: '農業群' },
  { id: '09', name: '化工群' },
  { id: '10', name: '土木群' },
  { id: '11', name: '海事群' },
  { id: '12', name: '護理群' },
  { id: '13', name: '家政群' },
  { id: '14', name: '語文群' },
  { id: '15', name: '商業與管理群' },
];

interface InventoryAnswers {
  grade: number;
  gradePercentile: number;
  hasCertificates: boolean;
  certificateLevel: string;
  hasCompetition: boolean;
  competitionLevel: string;
  hasProject: boolean;
  serviceHours: number;
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

export default function FirstDiscoveryPage() {
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedDepartmentName, setSelectedDepartmentName] = useState<string>('');
  const [recommendedPathways, setRecommendedPathways] = useState<string[]>([]);
  const [selectedPathway, setSelectedPathway] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [animating, setAnimating] = useState(false);
  const router = useRouter();

  // Inventory state
  const [inventory, setInventory] = useState<InventoryAnswers>({
    grade: 12,
    gradePercentile: 0,
    hasCertificates: false,
    certificateLevel: '',
    hasCompetition: false,
    competitionLevel: '',
    hasProject: false,
    serviceHours: 0,
  });

  // Gap analysis result
  const [gapItems, setGapItems] = useState<GapItem[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [currentProbability, setCurrentProbability] = useState(0);
  const [potentialProbability, setPotentialProbability] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('discovery_state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.step) setCurrentStep(state.step);
        if (state.school) setSelectedSchool(state.school);
        if (state.department) setSelectedDepartment(state.department);
        if (state.departmentName) setSelectedDepartmentName(state.departmentName);
        if (state.pathways) setRecommendedPathways(state.pathways);
        if (state.pathway) setSelectedPathway(state.pathway);
        if (state.inventory) setInventory(state.inventory);
      } catch {}
    }
    trackPageView('first_discovery');
    setLoading(false);
  }, []);

  const saveState = useCallback(() => {
    localStorage.setItem('discovery_state', JSON.stringify({
      step: currentStep,
      school: selectedSchool,
      department: selectedDepartment,
      departmentName: selectedDepartmentName,
      pathways: recommendedPathways,
      pathway: selectedPathway,
      inventory,
    }));
  }, [currentStep, selectedSchool, selectedDepartment, selectedDepartmentName, recommendedPathways, selectedPathway, inventory]);

  useEffect(() => {
    if (!loading) saveState();
  }, [currentStep, selectedPathway, inventory, loading, saveState]);

  const goToStep = (step: number) => {
    if (step === currentStep || animating) return;
    setAnimating(true);
    setCurrentStep(step);
    setTimeout(() => setAnimating(false), 400);
  };

  const filteredSchools = ALL_SCHOOLS.filter(school =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSchoolSelect = (schoolId: string) => {
    setSelectedSchool(schoolId);
    trackFeatureUsage('discovery_school_selected', { school_id: schoolId });
  };

  const handleDepartmentSelect = (departmentId: string, departmentName: string) => {
    setSelectedDepartment(departmentId);
    setSelectedDepartmentName(departmentName);
    trackFeatureUsage('discovery_department_selected', { department_id: departmentId });
    const pathways = GROUP_PATHWAY_MAPPING[departmentName] || ['stars', 'selection', 'distribution'];
    setRecommendedPathways(pathways);
  };

  const handlePathwaySelect = (pathwayKey: string) => {
    setSelectedPathway(pathwayKey);
    trackFeatureUsage('discovery_pathway_selected', { pathway: pathwayKey });
    goToStep(3);
  };

  const handleInventoryChange = (field: keyof InventoryAnswers, value: any) => {
    setInventory(prev => ({ ...prev, [field]: value }));
  };

  const calculateGap = () => {
    const pathway = ADMISSION_PATHWAYS[selectedPathway as keyof typeof ADMISSION_PATHWAYS];
    if (!pathway) return;

    const items: GapItem[] = [];
    const actions: ActionItem[] = [];
    let currentScore = 0;
    let potentialGain = 0;
    const today = new Date();

    // Grade check
    if (pathway.requirements.some(r => r.includes('在校成績'))) {
      if (inventory.gradePercentile > 0 && inventory.gradePercentile <= 30) {
        items.push({ name: '在校成績', status: 'ok' });
        currentScore += 35;
      } else if (inventory.gradePercentile > 30 && inventory.gradePercentile <= 50) {
        items.push({ name: '在校成績', status: 'warning', current: `前 ${inventory.gradePercentile}%`, required: '前 30%', daysLeft: 180 });
        currentScore += 15;
        potentialGain += 20;
        actions.push({ title: '提升在校成績至前 30%', deadline: '下次段考前', daysLeft: 60, priority: 'high', done: false });
      } else {
        items.push({ name: '在校成績', status: 'danger', required: '前 30%', daysLeft: 180 });
        potentialGain += 35;
        actions.push({ title: '擬定成績提升計畫', deadline: '本學期結束前', daysLeft: 90, priority: 'high', done: false });
      }
    }

    // Certificate check
    if (pathway.requirements.some(r => r.includes('證照') || r.includes('技術士'))) {
      if (inventory.hasCertificates) {
        items.push({ name: '技術士證照', status: 'ok' });
        currentScore += 30;
      } else {
        items.push({ name: '乙級技術士證照', status: 'danger', required: '乙級證照', daysLeft: 90 });
        potentialGain += 30;
        actions.push({ title: '報名並準備乙級技術士考試', deadline: '下次考試日期', daysLeft: 72, priority: 'high', done: false });
      }
    }

    // Competition check
    if (pathway.requirements.some(r => r.includes('競賽'))) {
      if (inventory.hasCompetition) {
        items.push({ name: '技藝競賽經驗', status: 'ok' });
        currentScore += 25;
      } else {
        items.push({ name: '技藝競賽', status: 'warning', current: '尚未參加', required: '競賽前三名', daysLeft: 120 });
        currentScore += 5;
        potentialGain += 20;
        actions.push({ title: '了解並報名技藝競賽', deadline: '校內初選前', daysLeft: 45, priority: 'medium', done: false });
      }
    }

    // Project check
    if (inventory.hasProject) {
      items.push({ name: '專題作品', status: 'ok' });
      currentScore += 10;
    } else {
      items.push({ name: '專題作品', status: 'warning', current: '尚未準備', required: '需要實作專題', daysLeft: 150 });
      potentialGain += 10;
      actions.push({ title: '開始準備專題作品', deadline: '申請前完成', daysLeft: 120, priority: 'medium', done: false });
    }

    // Documents / portfolio
    items.push({ name: '備審資料 / 讀書計畫', status: 'warning', current: '尚未準備', required: '讀書計畫 + 備審資料', daysLeft: 60 });
    actions.push({ title: '完成讀書計畫初稿', deadline: '申請截止前 30 天', daysLeft: 30, priority: 'low', done: false });

    // Service hours
    if (inventory.serviceHours >= 40) {
      items.push({ name: '服務學習時數', status: 'ok' });
      currentScore += 5;
    } else {
      items.push({ name: '服務學習時數', status: 'warning', current: `${inventory.serviceHours} 小時`, required: '40 小時', daysLeft: 200 });
      potentialGain += 5;
    }

    // Sort actions by priority then deadline
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    setGapItems(items);
    setActionItems(actions);
    setCurrentProbability(Math.min(95, currentScore));
    setPotentialProbability(Math.min(95, currentScore + potentialGain));

    goToStep(4);
  };

  const isInventoryComplete = () => {
    return inventory.gradePercentile > 0;
  };

  const schoolName = ALL_SCHOOLS.find(s => s.id === selectedSchool)?.name || '';
  const pathwayInfo = selectedPathway ? ADMISSION_PATHWAYS[selectedPathway as keyof typeof ADMISSION_PATHWAYS] : null;

  // Step 0: School Search
  const renderStep0 = () => (
    <div className={`transition-all duration-400 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-block p-4 bg-blue-100 rounded-full mb-6">
            <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">選擇你想申請的學校</h1>
          <p className="text-lg text-gray-600 mb-8">輸入學校名稱或從下方列表選擇</p>
        </div>

        <div className="max-w-xl mx-auto">
          <input
            type="text"
            placeholder="搜尋學校..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition mb-6"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
            {filteredSchools.map((school) => (
              <button
                key={school.id}
                onClick={() => handleSchoolSelect(school.id)}
                className={`p-4 rounded-xl text-left transition ${
                  selectedSchool === school.id
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="font-medium">{school.name}</div>
              </button>
            ))}
          </div>

          {selectedSchool && (
            <div className="mt-8">
              <button
                onClick={() => goToStep(1)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg text-lg"
              >
                繼續下一步 →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Step 1: Department/Vocational Group Selection
  const renderStep1 = () => (
    <div className={`transition-all duration-400 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-block p-4 bg-indigo-100 rounded-full mb-6">
            <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">選擇你就讀的職群</h1>
          <p className="text-lg text-gray-600 mb-2">這將幫助我們為你推薦最適合的升學管道</p>
          <p className="text-sm text-indigo-600 font-medium">{schoolName}</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ALL_DEPARTMENTS.map((dept) => (
              <button
                key={dept.id}
                onClick={() => handleDepartmentSelect(dept.id, dept.name)}
                className={`p-4 rounded-xl text-center transition ${
                  selectedDepartment === dept.id
                    ? 'bg-indigo-600 text-white border-indigo-700'
                    : 'bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                <div className="font-medium">{dept.name}</div>
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => goToStep(0)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              ← 上一步
            </button>
            {selectedDepartment && (
              <button
                onClick={() => goToStep(2)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
              >
                看看你的升學路徑 →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Step 2: Pathway Map - Show all available admission pathways
  const renderStep2 = () => (
    <div className={`transition-all duration-400 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎯 {selectedDepartmentName}有 {recommendedPathways.length} 種不同的升學路徑
        </h1>
        <p className="text-lg text-gray-600">
          每一條路都可以通往你想去的學校。選擇一條你想了解的。
        </p>
      </div>

      <div className="space-y-4 max-w-3xl mx-auto">
        {recommendedPathways.map((key) => {
          const pathway = ADMISSION_PATHWAYS[key as keyof typeof ADMISSION_PATHWAYS];
          if (!pathway) return null;
          const isSelected = selectedPathway === key;
          return (
            <button
              key={key}
              onClick={() => handlePathwaySelect(key)}
              className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 ${
                isSelected
                  ? `border-indigo-500 bg-indigo-50 shadow-lg scale-[1.02]`
                  : `border-gray-100 bg-white hover:border-indigo-300 hover:shadow-md`
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{pathway.icon}</span>
                    <div>
                      <div className="font-bold text-xl">{pathway.name}</div>
                      <div className="text-gray-600 text-sm">{pathway.description}</div>
                    </div>
                  </div>
                  <div className="ml-12 flex flex-wrap gap-2 mt-3">
                    {pathway.benefits.map((b, i) => (
                      <span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right ml-4 shrink-0">
                  <div className="text-sm text-gray-500">去年錄取率</div>
                  <div className="font-bold text-2xl text-indigo-600">{pathway.acceptanceRate}%</div>
                  <div className="text-xs text-gray-500 mt-1">截止 {pathway.deadline}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => goToStep(1)}
          className="text-gray-600 hover:text-gray-800 transition"
        >
          ← 返回選擇其他職群
        </button>
      </div>
    </div>
  );

  // Step 3: Inventory Form
  const renderStep3 = () => (
    <div className={`transition-all duration-400 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">盤點你現在的條件</h1>
        <p className="text-lg text-gray-600">
          讓我們了解你目前的狀況，這樣才能告訴你接下來該做什麼
        </p>
        {pathwayInfo && (
          <p className="text-sm text-indigo-600 font-medium mt-2">
            目標：{schoolName} / {selectedDepartmentName} / {pathwayInfo.icon} {pathwayInfo.name}
          </p>
        )}
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Grade */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">1. 你的年級？</h3>
          <div className="flex flex-wrap gap-3">
            {GRADE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleInventoryChange('grade', opt.value)}
                className={`px-5 py-3 rounded-xl font-medium transition ${
                  inventory.grade === opt.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grade Percentile */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">2. 你的在校成績大約在多少百分比？</h3>
          <div className="flex flex-wrap gap-3">
            {PERCENTILE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleInventoryChange('gradePercentile', opt.value)}
                className={`px-5 py-3 rounded-xl font-medium transition ${
                  inventory.gradePercentile === opt.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Certificates */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">3. 你有技術士證照嗎？</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'none', label: '還沒有' },
              { value: '丙級', label: '有丙級證照' },
              { value: '乙級', label: '有乙級證照' },
              { value: '甲級', label: '有甲級證照' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  handleInventoryChange('hasCertificates', opt.value !== 'none');
                  handleInventoryChange('certificateLevel', opt.value !== 'none' ? opt.value : '');
                }}
                className={`px-5 py-3 rounded-xl font-medium transition ${
                  (!inventory.hasCertificates && opt.value === 'none') ||
                  (inventory.certificateLevel === opt.value && opt.value !== 'none')
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Competition */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">4. 你有參加過技藝競賽嗎？</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'none', label: '沒有參加過' },
              { value: '校內', label: '校內比賽' },
              { value: '區域', label: '區域賽' },
              { value: '全國', label: '全國賽' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  handleInventoryChange('hasCompetition', opt.value !== 'none');
                  handleInventoryChange('competitionLevel', opt.value !== 'none' ? opt.value : '');
                }}
                className={`px-5 py-3 rounded-xl font-medium transition ${
                  (!inventory.hasCompetition && opt.value === 'none') ||
                  (inventory.competitionLevel === opt.value && opt.value !== 'none')
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Project */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">5. 你有做過專題或研究嗎？</h3>
          <div className="flex gap-3">
            {[
              { value: true, label: '有，已經完成或正在進行' },
              { value: false, label: '還沒有' },
            ].map(opt => (
              <button
                key={String(opt.value)}
                onClick={() => handleInventoryChange('hasProject', opt.value)}
                className={`px-5 py-3 rounded-xl font-medium transition ${
                  inventory.hasProject === opt.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-center gap-4">
        <button
          onClick={() => goToStep(2)}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
        >
          ← 返回
        </button>
        <button
          onClick={calculateGap}
          disabled={!isInventoryComplete()}
          className={`px-8 py-3 rounded-lg font-semibold transition shadow-lg text-lg ${
            isInventoryComplete()
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          看看我的差距分析 ✨
        </button>
      </div>
    </div>
  );

  // Step 4: Gap Analysis - The Magic Moment
  const renderStep4 = () => (
    <div className={`transition-all duration-400 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">✨ 你的差距分析</h1>
        <p className="text-lg text-gray-600">
          你離目標還有多遠？讓我們一起看看。
        </p>
        {pathwayInfo && (
          <p className="text-sm text-indigo-600 font-medium mt-2">
            🎯 目標：{schoolName} / {selectedDepartmentName} / {pathwayInfo.icon} {pathwayInfo.name}
          </p>
        )}
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Probability Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
            <div className="text-sm text-gray-500 mb-2">目前錄取機率</div>
            <div className="text-5xl font-bold text-indigo-600">{currentProbability}%</div>
            <div className="text-xs text-gray-400 mt-2">根據你現在的條件</div>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-center text-white shadow-lg">
            <div className="text-sm opacity-80 mb-2">如果你完成以下項目</div>
            <div className="text-5xl font-bold">{potentialProbability}%</div>
            <div className="text-xs opacity-70 mt-2">預估錄取機率</div>
          </div>
        </div>

        {/* Gap Items */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">你的條件盤點</h3>
          <div className="space-y-3">
            {gapItems.map((item, i) => (
              <div key={i} className={`flex items-center justify-between p-4 rounded-xl ${
                item.status === 'ok' ? 'bg-green-50' :
                item.status === 'warning' ? 'bg-yellow-50' :
                'bg-red-50'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {item.status === 'ok' ? '✅' : item.status === 'warning' ? '🟡' : '🔴'}
                  </span>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    {item.status === 'warning' && item.current && (
                      <div className="text-sm text-yellow-700">
                        目前：{item.current} → 需要：{item.required}
                      </div>
                    )}
                    {item.status === 'danger' && item.required && (
                      <div className="text-sm text-red-700">
                        需要：{item.required}
                      </div>
                    )}
                  </div>
                </div>
                {item.status === 'ok' && (
                  <span className="text-green-600 font-medium text-sm">已具備</span>
                )}
                {item.daysLeft && item.status !== 'ok' && (
                  <span className={`text-sm font-medium ${
                    item.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    還有 {item.daysLeft} 天
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Motivational message */}
        {currentProbability < 50 && (
          <div className="bg-blue-50 rounded-2xl p-6 text-center">
            <p className="text-lg text-blue-800 font-medium">
              💡 別擔心！如果你完成接下來的行動計畫，你的錄取機率可以提升到 {potentialProbability}%
            </p>
          </div>
        )}
        {currentProbability >= 50 && (
          <div className="bg-green-50 rounded-2xl p-6 text-center">
            <p className="text-lg text-green-800 font-medium">
              🎉 你的條件已經很不錯了！完成行動計畫可以讓你更有把握。
            </p>
          </div>
        )}
      </div>

      <div className="mt-10 flex justify-center gap-4">
        <button
          onClick={() => goToStep(3)}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
        >
          ← 修改我的答案
        </button>
        <button
          onClick={() => goToStep(5)}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg text-lg"
        >
          看看我的行動計畫 🚀
        </button>
      </div>
    </div>
  );

  // Step 5: Action Plan
  const renderStep5 = () => (
    <div className={`transition-all duration-400 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🚀 你的行動計畫</h1>
        <p className="text-lg text-gray-600">
          接下來你需要做的事，一步一步來就好
        </p>
        {pathwayInfo && (
          <p className="text-sm text-indigo-600 font-medium mt-2">
            目標：{schoolName} / {selectedDepartmentName} / {pathwayInfo.icon} {pathwayInfo.name}
          </p>
        )}
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Action items */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">
            接下來你需要完成的事：
          </h3>
          <div className="space-y-3">
            {actionItems.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-indigo-50 transition">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => {
                    const updated = [...actionItems];
                    updated[i] = { ...updated[i], done: !updated[i].done };
                    setActionItems(updated);
                  }}
                  className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <div className={`font-medium ${item.done ? 'line-through text-gray-400' : ''}`}>
                    {item.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    截止：{item.deadline}（還有 {item.daysLeft} 天）
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.priority === 'high' ? 'bg-red-100 text-red-700' :
                  item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {item.priority === 'high' ? '重要' : item.priority === 'medium' ? '中等' : '一般'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline summary */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
          <h3 className="font-semibold text-lg mb-3">📊 你的旅程總結</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold">{currentProbability}%</div>
              <div className="text-sm opacity-80">目前機率</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{potentialProbability}%</div>
              <div className="text-sm opacity-80">完成後機率</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{actionItems.length}</div>
              <div className="text-sm opacity-80">待完成項目</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{recommendedPathways.length}</div>
              <div className="text-sm opacity-80">可選升學管道</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">下一步</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                const plan = {
                  school: schoolName,
                  department: selectedDepartmentName,
                  pathway: pathwayInfo?.name,
                  currentProbability,
                  potentialProbability,
                  actions: actionItems,
                  createdAt: new Date().toISOString(),
                };
                localStorage.setItem('saved_discovery_plan', JSON.stringify(plan));
                trackFeatureUsage('save_discovery_plan', { pathway: selectedPathway });
                alert('✅ 計畫已儲存！下次回來可以繼續查看。');
              }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
            >
              💾 儲存我的計畫
            </button>
            <button
              onClick={() => {
                const text = `🎓 我用升學大師發現，${schoolName} ${selectedDepartmentName}有 ${recommendedPathways.length} 種升學管道！\n\n我選擇了${pathwayInfo?.name}，目前錄取機率 ${currentProbability}%，完成準備後可達 ${potentialProbability}%！\n\n你也來試試：https://admission-master.vercel.app`;
                navigator.clipboard.writeText(text);
                trackFeatureUsage('share_discovery_plan', { pathway: selectedPathway });
                alert('📋 分享文字已複製到剪貼簿！');
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
            >
              📤 分享給朋友
            </button>
            <button
              onClick={() => goToStep(2)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
            >
              🔄 看看其他管道
            </button>
            <button
              onClick={() => {
                trackFeatureUsage('start_planning_from_discovery', { pathway: selectedPathway });
                router.push('/ability-account');
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition"
            >
              開始完整規劃 →
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => goToStep(4)}
          className="text-gray-600 hover:text-gray-800 transition"
        >
          ← 返回差距分析
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-white/90 border-b border-indigo-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <p className="text-indigo-600 font-semibold text-sm">升學路徑發現</p>
          <button onClick={() => router.push('/ability-account')} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
            我的能力帳戶
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <DiscoveryProgress currentStep={currentStep} totalSteps={6} />

        {currentStep === 0 && renderStep0()}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>&copy; 2026 升學大師 v2.0 &bull; 讓每個高職生都找到最適合的升學路徑</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
