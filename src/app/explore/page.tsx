// 職群探索頁面 - Explorer 發現工具
// 目標：讓高職生深入探索 15 個職群，發現自己的興趣和方向

'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { trackPageView, trackFeatureUsage } from '@/lib/analytics'

// 15 個職群的詳細資訊
const VOCATIONAL_GROUPS = [
  {
    code: '01',
    name: '餐旅群',
    emoji: '🍽️',
    description: '餐飲服務、旅遊規劃、飯店管理',
    fullDescription: '餐旅群培養餐飲服務、旅遊規劃與飯店管理的專業人才。適合喜歡與人互動、提供服務、對美食和旅遊有興趣的學生。',
    color: 'from-orange-500 to-red-500',
    borderColor: 'border-orange-200',
    bgColor: 'bg-orange-50',
    pathways: ['繁星推薦', '個人申請', '技優甄審', '特殊選才'],
    skills: ['烹飪技術', '服務管理', '外語能力', '溝通技巧'],
    careers: ['廚師', '餐飲經理', '旅遊規劃師', '飯店管理'],
    techSchools: ['高雄餐旅大學', '台中科技大學', '國立澎湖科技大學']
  },
  {
    code: '02',
    name: '機械群',
    emoji: '⚙️',
    description: '機械設計、製造技術、精密加工',
    fullDescription: '機械群培養機械設計、製造技術與精密加工的專業人才。適合喜歡動手操作、對機械結構有興趣、擅長空間思考的學生。',
    color: 'from-gray-500 to-slate-500',
    borderColor: 'border-gray-200',
    bgColor: 'bg-gray-50',
    pathways: ['繁星推薦', '個人申請', '指考分發', '技優甄審'],
    skills: ['機械製圖', 'CAD 設計', 'CNC 加工', '機械維修'],
    careers: ['機械工程師', '製造技術員', '維修工程師', 'CNC 操作員'],
    techSchools: ['台北科技大學', '雲林科技大學', '勤益科技大學']
  },
  {
    code: '03',
    name: '電機群',
    emoji: '⚡',
    description: '電力系統、控制技術、能源管理',
    fullDescription: '電機群培養電力系統、控制技術與能源管理的專業人才。適合對電學原理有興趣、喜歡實作電路、擅長邏輯思考的學生。',
    color: 'from-yellow-500 to-orange-500',
    borderColor: 'border-yellow-200',
    bgColor: 'bg-yellow-50',
    pathways: ['繁星推薦', '個人申請', '指考分發', '技優甄審'],
    skills: ['電路設計', '電力系統', '控制工程', '能源管理'],
    careers: ['電機工程師', '電力技術員', '控制工程師', '維修技師'],
    techSchools: ['台北科技大學', '雲林科技大學', '高雄科技大學']
  },
  {
    code: '04',
    name: '電子群',
    emoji: '📱',
    description: '電子電路、通訊技術、半導體',
    fullDescription: '電子群培養電子電路、通訊技術與半導體的專業人才。適合對電子產品有興趣、喜歡實驗室操作、關注科技趨勢的學生。',
    color: 'from-blue-500 to-cyan-500',
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50',
    pathways: ['繁星推薦', '個人申請', '指考分發', '技優甄審'],
    skills: ['電路設計', '通訊技術', '半導體製程', '嵌入式系統'],
    careers: ['電子工程師', 'IC 設計師', '通訊工程師', '研發工程師'],
    techSchools: ['台北科技大學', '雲林科技大學', '台應大']
  },
  {
    code: '05',
    name: '資訊群',
    emoji: '💻',
    description: '程式設計、網路技術、資料處理',
    fullDescription: '資訊群培養程式設計、網路技術與資料處理的專業人才。適合喜歡電腦、對軟體開發有興趣、擅長邏輯思考的學生。',
    color: 'from-indigo-500 to-purple-500',
    borderColor: 'border-indigo-200',
    bgColor: 'bg-indigo-50',
    pathways: ['繁星推薦', '個人申請', '技優甄審', '特殊選才'],
    skills: ['程式設計', '系統開發', '網路管理', '資料庫'],
    careers: ['軟體工程師', '系統分析師', '網路工程師', '資料工程師'],
    techSchools: ['台北科技大學', '台科大', '雲科大']
  },
  {
    code: '06',
    name: '商管群',
    emoji: '📊',
    description: '商業管理、會計財務、行銷企劃',
    fullDescription: '商管群培養商業管理、會計財務與行銷企劃的專業人才。適合對商業活動有興趣、擅長數理分析、喜歡與人互動的學生。',
    color: 'from-green-500 to-emerald-500',
    borderColor: 'border-green-200',
    bgColor: 'bg-green-50',
    pathways: ['繁星推薦', '個人申請', '社區推甄', '指考分發'],
    skills: ['會計財務', '商業分析', '行銷管理', '企業經營'],
    careers: ['會計師', '行銷經理', '企業管理', '財務分析'],
    techSchools: ['台北商業大學', '台灣體大', '國立澎湖科技大學']
  },
  {
    code: '07',
    name: '設計群',
    emoji: '🎨',
    description: '視覺設計、產品設計、空間設計',
    fullDescription: '設計群培養視覺設計、產品設計與空間設計的專業人才。適合有美學敏感度、喜歡創作、對視覺表現有興趣的學生。',
    color: 'from-pink-500 to-rose-500',
    borderColor: 'border-pink-200',
    bgColor: 'bg-pink-50',
    pathways: ['個人申請', '特殊選才', '繁星推薦', '技優甄審'],
    skills: ['視覺設計', '產品設計', '空間設計', '美學素養'],
    careers: ['平面設計師', '產品設計師', '室內設計師', '藝術總監'],
    techSchools: ['台北科技大學', '雲林科技大學', '實踐大學']
  },
  {
    code: '08',
    name: '農業群',
    emoji: '🌾',
    description: '農業技術、園藝、畜產、農企業化',
    fullDescription: '農業群培養農業技術、園藝、畜產與農企業化的專業人才。適合喜歡自然、對生物科技有興趣、關注環保議題的學生。',
    color: 'from-lime-500 to-green-500',
    borderColor: 'border-lime-200',
    bgColor: 'bg-lime-50',
    pathways: ['繁星推薦', '個人申請', '技優甄審', '特殊選才'],
    skills: ['農業技術', '園藝技術', '畜產管理', '生物科技'],
    careers: ['農業技師', '園藝工程師', '畜牧管理師', '農企業經營'],
    techSchools: ['屏東科技大學', '嘉義大學', '宜蘭大學']
  },
  {
    code: '09',
    name: '化工群',
    emoji: '🧪',
    description: '化學工程、材料技術、生物科技',
    fullDescription: '化工群培養化學工程、材料技術與生物科技的專業人才。適合喜歡實驗室操作、對化學反應有興趣、擅長科學思考的學生。',
    color: 'from-teal-500 to-cyan-500',
    borderColor: 'border-teal-200',
    bgColor: 'bg-teal-50',
    pathways: ['繁星推薦', '個人申請', '指考分發', '技優甄審'],
    skills: ['化學工程', '材料技術', '程序控制', '化學分析'],
    careers: ['化學工程師', '材料工程師', '製程工程師', '研發科長'],
    techSchools: ['台北科技大學', '雲林科技大學', '高雄科技大學']
  },
  {
    code: '10',
    name: '土木群',
    emoji: '🏗️',
    description: '建築工程、營建技術、測量',
    fullDescription: '土木群培養建築工程、營建技術與測量的專業人才。適合喜歡戶外工作、對建築結構有興趣、擅長空間思考的學生。',
    color: 'from-amber-500 to-yellow-500',
    borderColor: 'border-amber-200',
    bgColor: 'bg-amber-50',
    pathways: ['繁星推薦', '個人申請', '指考分發', '技優甄審'],
    skills: ['建築結構', '營建技術', '工程測量', '施工管理'],
    careers: ['建築師', '營建工程師', '測量師', '專案經理'],
    techSchools: ['台北科技大學', '中華大學', '高雄科技大學']
  },
  {
    code: '11',
    name: '海事群',
    emoji: '🚢',
    description: '航運技術、輪機工程、海事事務',
    fullDescription: '海事群培養航運技術、輪機工程與海事事務的專業人才。適合喜歡海洋、對國際貿易有興趣、適應海外工作的學生。',
    color: 'from-blue-600 to-blue-800',
    borderColor: 'border-blue-300',
    bgColor: 'bg-blue-50',
    pathways: ['繁星推薦', '個人申請', '技優甄審', '特殊選才'],
    skills: ['航運技術', '輪機工程', '海事事務', '國際貿易'],
    careers: ['船長', '輪機長', '海事事務員', '航運經理'],
    techSchools: ['海洋大學', '高雄海洋科技大學', '國立澎湖科技大學']
  },
  {
    code: '12',
    name: '護理群',
    emoji: '💉',
    description: '護理技術、健康照護、醫療事務',
    fullDescription: '護理群培養護理技術、健康照護與醫療事務的專業人才。適合喜歡幫助他人、對醫療有興趣、有耐心和愛心的學生。',
    color: 'from-rose-500 to-pink-500',
    borderColor: 'border-rose-200',
    bgColor: 'bg-rose-50',
    pathways: ['繁星推薦', '個人申請', '指考分發', '技優甄審'],
    skills: ['護理技術', '健康照護', '醫學知識', '溝通技巧'],
    careers: ['護理師', '醫檢師', '照護服務員', '醫事行政'],
    techSchools: ['台北醫學大學', '國立陽明大學', '長庚大學']
  },
  {
    code: '13',
    name: '家政群',
    emoji: '🏠',
    description: '生活應用、兒童發展、食品營養',
    fullDescription: '家政群培養生活應用、兒童發展與食品營養的專業人才。適合關注生活品質、喜歡與家庭相關的工作、有耐心的學生。',
    color: 'from-purple-500 to-fuchsia-500',
    borderColor: 'border-purple-200',
    bgColor: 'bg-purple-50',
    pathways: ['個人申請', '特殊選才', '繁星推薦', '社區推甄'],
    skills: ['生活應用', '兒童發展', '食品營養', '家庭管理'],
    careers: ['幼教老師', '營養師', '家庭教育師', '生活服務員'],
    techSchools: ['實踐大學', '樹德科技大學', '慈濟大學']
  },
  {
    code: '14',
    name: '語文群',
    emoji: '📚',
    description: '語文應用、翻譯、傳播',
    fullDescription: '語文群培養語文應用、翻譯與傳播的專業人才。適合對語言有興趣、喜歡閱讀寫作、擅長表達的學生。',
    color: 'from-violet-500 to-purple-500',
    borderColor: 'border-violet-200',
    bgColor: 'bg-violet-50',
    pathways: ['繁星推薦', '個人申請', '社區推甄', '特殊選才'],
    skills: ['語文應用', '翻譯技巧', '傳播能力', '國際視野'],
    careers: ['翻譯員', '記者', '編輯', '廣播人員'],
    techSchools: ['文藻外語大學', '淡江大學', '世新大學']
  },
  {
    code: '15',
    name: '商業與管理群',
    emoji: '💼',
    description: '企業管理、國際貿易、商業服務',
    fullDescription: '商業與管理群培養企業管理、國際貿易與商業服務的專業人才。適合對商業有興趣、希望能創業、有商業頭腦的學生。',
    color: 'from-emerald-500 to-teal-500',
    borderColor: 'border-emerald-200',
    bgColor: 'bg-emerald-50',
    pathways: ['繁星推薦', '個人申請', '社區推甄', '指考分發'],
    skills: ['企業管理', '國際貿易', '商業服務', '創新創業'],
    careers: ['企業經理', '貿易商', '創業家', '顧問'],
    techSchools: ['台北商業大學', '實踐大學', '逢甲大學']
  }
]

export default function ExplorePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<typeof VOCATIONAL_GROUPS[0] | null>(null)
  const [filteredGroups, setFilteredGroups] = useState(VOCATIONAL_GROUPS)

  // 頁面載入時追蹤
  useState(() => {
    trackPageView('explore_page')
  })

  // 搜尋和篩選功能
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const filtered = VOCATIONAL_GROUPS.filter(group => {
      const searchLower = query.toLowerCase()
      return (
        group.name.toLowerCase().includes(searchLower) ||
        group.description.toLowerCase().includes(searchLower) ||
        group.skills.some(skill => skill.toLowerCase().includes(searchLower)) ||
        group.careers.some(career => career.toLowerCase().includes(searchLower))
      )
    })
    setFilteredGroups(filtered)
  }

  const handleGroupClick = (group: typeof VOCATIONAL_GROUPS[0]) => {
    trackFeatureUsage('explore_group_detail', { group_name: group.name })
    setSelectedGroup(group)
  }

  const handleStartPathway = (groupCode: string) => {
    trackFeatureUsage('explore_start_pathway', { group_code: groupCode })
    router.push('/pathways')
  }

  const handleStartDiscovery = () => {
    trackFeatureUsage('explore_start_discovery')
    router.push('/first-discovery')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Page title bar */}
      <div className="bg-white/90 border-b border-indigo-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <p className="text-indigo-600 font-semibold text-sm">職群探索</p>
          <button onClick={handleStartDiscovery} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
            發現我的路徑
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-8 px-4 py-2 bg-indigo-100 rounded-full">
            <p className="text-indigo-700 font-semibold text-sm">
              🧭 探索 15 個職群，找到你的方向
            </p>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            發現你的<br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              職群興趣
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            每個職群都有不同的專業領域和升學途徑。
            <br />
            <strong>探索這些選擇，找到最適合你的方向！</strong>
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="搜尋職群名稱、技能、職涯..."
                className="w-full px-6 py-4 pl-14 bg-white border-2 border-indigo-200 rounded-xl focus:border-indigo-400 focus:outline-none transition text-lg"
              />
              <svg className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredGroups.map((group) => (
            <div
              key={group.code}
              onClick={() => handleGroupClick(group)}
              className={`bg-white rounded-xl p-6 shadow-sm border-2 ${group.borderColor} hover:shadow-md transition transform hover:scale-105 cursor-pointer`}
            >
              {/* Group Header */}
              <div className="flex items-center mb-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${group.color} rounded-xl flex items-center justify-center text-3xl mr-4 flex-shrink-0`}>
                  {group.emoji}
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-600">{group.description}</p>
                </div>
              </div>

              {/* Pathways */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">🎯 適合升學管道</h4>
                <div className="flex flex-wrap gap-2">
                  {group.pathways.map(pathway => (
                    <span key={pathway} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
                      {pathway}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills Preview */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">💡 核心技能</h4>
                <div className="flex flex-wrap gap-2">
                  {group.skills.slice(0, 3).map(skill => (
                    <span key={skill} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                  {group.skills.length > 3 && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      +{group.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleStartPathway(group.code)
                }}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                查看相關升學管道
              </button>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            🚀 準備好探索你的升學路徑了嗎？
          </h2>
          <p className="mb-6 text-indigo-100">
            現在你了解了各個職群的特色，讓我們幫你發現最適合的升學管道！
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={handleStartDiscovery}
              className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              🔍 發現我的升學路徑
            </button>
            <button
              onClick={() => router.push('/quiz')}
              className="px-6 py-3 bg-indigo-800 text-white rounded-lg font-semibold hover:bg-indigo-900 transition"
            >
              📝 職群發現測驗
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">15</div>
            <div className="text-gray-600 text-sm">職群類別</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">6</div>
            <div className="text-gray-600 text-sm">升學管道</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">100+</div>
            <div className="text-gray-600 text-sm">相關科系</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">100%</div>
            <div className="text-gray-600 text-sm">免費探索</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>© 2026 升學大師 v2.0 • 讓每個高職生都找到最適合的升學路徑</p>
          </div>
        </div>
      </footer>

      {/* Group Detail Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-20 h-20 bg-gradient-to-br ${selectedGroup.color} rounded-xl flex items-center justify-center text-4xl`}>
                    {selectedGroup.emoji}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{selectedGroup.name}</h2>
                    <p className="text-indigo-600 font-medium">{selectedGroup.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                >
                  ✕
                </button>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">📖 職群介紹</h3>
                <p className="text-gray-700 leading-relaxed">{selectedGroup.fullDescription}</p>
              </div>

              {/* Pathways */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">🎯 適合升學管道</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedGroup.pathways.map(pathway => (
                    <div key={pathway} className={`p-3 rounded-lg border-2 ${selectedGroup.borderColor} bg-white`}>
                      <div className="text-sm font-medium text-gray-900">{pathway}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">💡 專業技能</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedGroup.skills.map(skill => (
                    <div key={skill} className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-gray-700">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Careers */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">💼 職涯方向</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedGroup.careers.map(career => (
                    <span key={career} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                      {career}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tech Schools */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">🏫 推薦科技大學</h3>
                <div className="space-y-2">
                  {selectedGroup.techSchools.map(school => (
                    <div key={school} className="text-gray-700 flex items-start">
                      <span className="text-indigo-600 mr-2">•</span>
                      {school}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  關閉
                </button>
                <button
                  onClick={() => {
                  setSelectedGroup(null)
                  handleStartPathway(selectedGroup.code)
                }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  查看升學管道
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
