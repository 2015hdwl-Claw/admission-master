'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { trackPageView, trackFeatureUsage } from '@/lib/analytics';
import DiscoveryProgress from '@/components/DiscoveryProgress';

// 高職四技二專 6 種入學管道
const ADMISSION_PATHWAYS = {
  stars: {
    name: '繁星推薦',
    icon: '📚',
    description: '用在校成績申請，不用考統測',
    color: 'from-blue-500 to-indigo-500',
    borderColor: 'border-blue-200',
    requirements: ['在校成績前 30%', '由學校推薦', '不用考統測'],
    benefits: ['不用考統測也能上科大', '壓力較小', '幫助縮短城鄉差距']
  },
  selection: {
    name: '甄選入學',
    icon: '🎯',
    description: '統測成績 + 備審面試，展現你的特色',
    color: 'from-indigo-500 to-purple-500',
    borderColor: 'border-indigo-200',
    requirements: ['統測成績', '準備備審資料', '參加系所面試'],
    benefits: ['招生名額最多', '可以展現個人特色', '不只看成績']
  },
  distribution: {
    name: '聯合登記分發',
    icon: '📝',
    description: '依統測成績填志願分發，分數決定一切',
    color: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-200',
    requirements: ['參加統測', '成績達到錄取標準', '依志願序分發'],
    benefits: ['標準最明確', '準備方式單純', '志願填越多上榜機會越高']
  },
  skills: {
    name: '技優甄審',
    icon: '🏆',
    description: '用專業技藝成績或證照申請，免統測',
    color: 'from-green-500 to-blue-500',
    borderColor: 'border-green-200',
    requirements: ['持有乙級技術士證', '或參加技藝競賽獲獎', '繳交書審資料'],
    benefits: ['不用考統測', '強調技能與證照', '適合實作型學生']
  },
  guarantee: {
    name: '技優保送',
    icon: '⭐',
    description: '技能競賽前三名直接保送科大',
    color: 'from-yellow-500 to-orange-500',
    borderColor: 'border-yellow-200',
    requirements: ['全國技能競賽前三名', '或具國手資格', '不需統測成績'],
    benefits: ['直接保送不用考試', '競爭者極少', '實力證明就能入學']
  },
  special: {
    name: '特殊選才',
    icon: '🎓',
    description: '特殊才能、實作經驗的入學管道',
    color: 'from-red-500 to-pink-500',
    borderColor: 'border-red-200',
    requirements: ['特殊才能證明', '實作經驗展現', '通過特殊選才審查'],
    benefits: ['不看統測成績', '肯定特殊才能', '適合有特殊專長的學生']
  }
};

// 職群與適合升學管道的映射
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
  '商業與管理群': ['stars', 'selection', 'distribution', 'skills']
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

export default function FirstDiscoveryPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [recommendedPathways, setRecommendedPathways] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadUserData();
    trackPageView('first_discovery');
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
    } catch (error) {
      console.error('Error in loadUserData:', error);
    } finally {
      setLoading(false);
    }
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
    trackFeatureUsage('discovery_department_selected', { department_id: departmentId });

    // 計算推薦的升學管道
    const pathways = GROUP_PATHWAY_MAPPING[departmentName] || ['stars', 'selection', 'distribution'];
    setRecommendedPathways(pathways);
  };

  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartPlanning = () => {
    trackFeatureUsage('start_planning_from_discovery', {
      department_id: selectedDepartment,
      pathways_discovered: recommendedPathways.length
    });
    router.push('/ability-account');
  };

  const handleShareDiscovery = () => {
    trackFeatureUsage('share_discovery', {
      department_id: selectedDepartment,
      pathways_count: recommendedPathways.length
    });

    const deptName = ALL_DEPARTMENTS.find(d => d.id === selectedDepartment)?.name || '';
    const shareText = `🎓 我用升學大師發現，原來${deptName}有 ${recommendedPathways.length} 種升學管道可以選！你也來測測看吧：https://admission-master.vercel.app`;
    navigator.clipboard.writeText(shareText);
    alert('分享文字已複製到剪貼簿！\n\n' + shareText);
  };

  // Step 0: School Search
  const renderStep0 = () => (
    <div className="text-center">
      <div className="mb-8">
        <div className="inline-block p-4 bg-blue-100 rounded-full mb-6">
          <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          選擇你想申請的學校
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          輸入學校名稱或從下方列表選擇
        </p>
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
              onClick={handleNextStep}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg text-lg"
            >
              繼續下一步 →
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Step 1: Department Selection
  const renderStep1 = () => (
    <div className="text-center">
      <div className="mb-8">
        <div className="inline-block p-4 bg-indigo-100 rounded-full mb-6">
          <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          選擇你就讀的職群
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          這將幫助我們為你推薦最適合的升學管道
        </p>
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
            onClick={handlePrevStep}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
          >
            ← 上一步
          </button>
          {selectedDepartment && (
            <button
              onClick={handleNextStep}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
            >
              繼續下一步 →
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Step Placeholders (will be implemented in subsequent tasks)
  const renderStepPlaceholder = (stepNumber: number, stepTitle: string) => (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-400">Step {stepNumber}: {stepTitle}</h2>
      <p className="text-gray-400 mt-4">即將推出</p>
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
      {/* Page title bar */}
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
        {currentStep === 2 && renderStepPlaceholder(3, '選擇學程')}
        {currentStep === 3 && renderStepPlaceholder(4, '填寫成績')}
        {currentStep === 4 && renderStepPlaceholder(5, '分析結果')}
        {currentStep === 5 && renderStepPlaceholder(6, '完成')}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>© 2026 升學大師 v2.0 • 讓每個高職生都找到最適合的升學路徑</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
