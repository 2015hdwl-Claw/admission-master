// 6 種升學管道總覽頁面 - Explorer 核心教育內容
// 目標：教育高職生了解 6 種主要升學管道的詳細資訊

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trackPageView, trackFeatureUsage } from '@/lib/analytics'

// 6 種主要升學管道的詳細資訊
const SIX_PATHWAYS = {
  stars: {
    id: 'stars',
    name: '繁星推薦',
    icon: '📚',
    shortDesc: '用校內成績申請，不用另外考試',
    fullDesc: '繁星推薦是許多高職生忽略的黃金管道！只要高一高二成績優秀，就能在校內推薦競爭中獲得資格，不用參加激烈的統一考試。',
    color: 'from-blue-500 to-indigo-500',
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50',
    quota: '佔總名額約 15%',
    suitableGroups: ['所有職群'],
    requirements: [
      '校內成績排名前 20%',
      '通過學校推薦',
      '學測成績達到校系門檻（門檻通常較低）'
    ],
    advantages: [
      '壓力較小，不用準備統一考試',
      '可以同時申請多個校系',
      '錄取後不用再參加其他指考',
      '高一高二成績就很重要，不是高三才開始'
    ],
    timeline: [
      '3月：高中內部推薦選拔',
      '3月底：統一報名',
      '4月：放榜'
    ],
    tips: [
      '跟導師和學務處保持良好關係',
      '了解校內競爭對手，評估獲推薦機會',
      '高一高二就要保持成績穩定',
      '學測成績只需達門檻，主要看在校排名'
    ],
    successStory: '陳同學（電子群）從高一起保持全班前3名，透過繁星推薦成功申請上台灣科大電機系，避開了激烈的指考競爭。'
  },
  application: {
    id: 'application',
    name: '個人申請',
    icon: '🎯',
    shortDesc: '備審資料 + 口試，展現你的特色',
    fullDesc: '個人申請是展現個人特色的最佳舞台！透過學習歷程檔案、備審資料和面試，讓學校看到你的專題實作、技能競賽和實習經驗。',
    color: 'from-indigo-500 to-purple-500',
    borderColor: 'border-indigo-200',
    bgColor: 'bg-indigo-50',
    quota: '佔總名額約 40-45%',
    suitableGroups: ['所有職群'],
    requirements: [
      '準備備審資料（學習歷程、專題成果、技能證照）',
      '參加系所口試',
      '展現你的專題實作和實習經驗'
    ],
    advantages: [
      '可以展現個人特色和專題成果',
      '不只看成績，更看重實務能力',
      '適合有特殊經歷和競賽獲獎的學生',
      '面試可以補足成績的不足'
    ],
    timeline: [
      '3月：公布招生簡章',
      '4月：第一階段報名',
      '4月底：第一階段篩選結果',
      '5月：第二階段面試',
      '6月：放榜'
    ],
    tips: [
      '專題實作是備審資料的核心',
      '技能檢定證照是加分利器',
      '面試準備 STAR-S 框架',
      '多練習 3 分鐘自我介紹'
    ],
    successStory: '林同學（設計群）用他的專題作品集和設計競賽獎項，透過個人申請成功進入實踐大學工業設計系，面試表現獲得高度評價。'
  },
  exam: {
    id: 'exam',
    name: '指考分發',
    icon: '📝',
    shortDesc: '傳統統一入學考試，分數決定一切',
    fullDesc: '指考分發是最傳統但也最直接的升學管道。統測成績就是一切，適合成績穩定、不想額外準備面試和備審資料的學生。',
    color: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-200',
    bgColor: 'bg-purple-50',
    quota: '佔總名額約 25%',
    suitableGroups: ['所有職群'],
    requirements: [
      '參加學測/統測',
      '成績達到分數標準',
      '分發依據成績排序'
    ],
    advantages: [
      '標準最明確，分數就是一切',
      '準備方式單純，專注在學科準備',
      '適合應試型學生',
      '志願序可以精確控制'
    ],
    timeline: [
      '7月：分科測驗/統測',
      '7月：填志願',
      '7月底：放榜'
    ],
    tips: [
      '統測成績要穩定，避免失手',
      '志願序非常重要，要仔細排列',
      '了解同分比序規則',
      '可以和個人申請同時準備'
    ],
    successStory: '張同學（機械群）統測成績優異，專注於學科準備，透過分發成功進入雲科大機械系，符合他穩扎穩打的升學策略。'
  },
  skills: {
    id: 'skills',
    name: '技優甄審',
    icon: '🏆',
    shortDesc: '用你的專業技藝成績申請',
    fullDesc: '技優甄審是高職生最優秀的升學捷徑！全國技藝競賽前三名可保送，無需統測成績。區賽獲獎也能參加甄選保送。',
    color: 'from-green-500 to-blue-500',
    borderColor: 'border-green-200',
    bgColor: 'bg-green-50',
    quota: '佔總名額約 2%',
    suitableGroups: ['所有職群', '特別適合技能競賽活躍的職群'],
    requirements: [
      '參加技藝競賽獲獎',
      '取得專業證照',
      '通過技能檢定'
    ],
    advantages: [
      '發揮專業長才，競爭者較少',
      '全國賽前三名可保送',
      '比賽成績比在校成績重要',
      '適合技藝突出的學生'
    ],
    timeline: [
      '3-5月：報名',
      '5月：甄試/保送審查',
      '6月：放榜'
    ],
    tips: [
      '高二就開始準備競賽，高三才能參加全國賽',
      '選擇正確的競賽職類很重要',
      '全國賽前三名可保送，免統測、免面試',
      '區賽獲獎也能參加甄選保送'
    ],
    successStory: '王同學（餐旅群）在全國餐旅技能競賽獲得金牌，透過技優保送直接進入高雄餐旅大學，完全跳過統測壓力。'
  },
  community: {
    id: 'community',
    name: '社區推甄',
    icon: '⭐',
    shortDesc: '社區高中獨特的推薦入學管道',
    fullDesc: '社區推甄是社區高中學生的專屬福利！升學機會增加，準備負擔較輕，是社區高中學生的重要升學途徑。',
    color: 'from-yellow-500 to-orange-500',
    borderColor: 'border-yellow-200',
    bgColor: 'bg-yellow-50',
    quota: '佔總名額約 8%',
    suitableGroups: ['社區高中學生', '所有職群'],
    requirements: [
      '就讀社區高中',
      '通過學校推薦',
      '參加簡單面試'
    ],
    advantages: [
      '升學機會增加，專屬名額',
      '準備負擔較輕',
      '面試相對簡單',
      '社區高中專屬福利'
    ],
    timeline: [
      '3月：報名',
      '4月：簡單面試',
      '5月：放榜'
    ],
    tips: [
      '了解學校的社區推甄配額',
      '跟導師保持良好關係',
      '面試相對簡單，不用過度緊張',
      '可以和其他管道同時準備'
    ],
    successStory: '李同學（護理群）就讀社區高中，透過社區推甄成功申請上慈濟大學護理系，享受社區高中專屬升學優勢。'
  },
  special: {
    id: 'special',
    name: '特殊選才',
    icon: '🎓',
    shortDesc: '特殊才能、實作經驗的入學管道',
    fullDesc: '特殊選才是不看傳統成績的創新管道！特殊才能證明、實作經驗展現、專題成果都能成為你的入學資格。',
    color: 'from-red-500 to-pink-500',
    borderColor: 'border-red-200',
    bgColor: 'bg-red-50',
    quota: '佔總名額約 5%',
    suitableGroups: ['所有職群', '特別適合有特殊專長的學生'],
    requirements: [
      '特殊才能證明',
      '實作經驗展現',
      '通過特殊選才審查'
    ],
    advantages: [
      '肯定特殊才能，不看傳統成績',
      '適合有特殊專長的學生',
      '各校招生時段不同，機會更多',
      '弱勢身份也有專屬名額'
    ],
    timeline: [
      '10月-1月：各校公告招生',
      '1月-3月：報名與面試',
      '3月：放榜'
    ],
    tips: [
      '競賽獎牌是最有力的證明',
      '專題實作成果也很重要',
      '弱勢身份也有專屬名額',
      '各校招生時段不同，要個別關注'
    ],
    successStory: '劉同學（資訊群）雖然成績普通，但在全國技能競賽獲獎，透過特殊選才成功進入台科大資工系，發揮他的程式設計專長。'
  }
}

export default function PathwaysPage() {
  const router = useRouter()
  const [selectedPathway, setSelectedPathway] = useState<string | null>(null)
  const [showComparison, setShowComparison] = useState(false)

  // 按鈕點擊追蹤
  const handlePathwayClick = (pathwayId: string) => {
    trackFeatureUsage('view_pathway_detail', { pathway_id: pathwayId })
    setSelectedPathway(pathwayId)
  }

  const handleStartDiscovery = () => {
    trackFeatureUsage('start_discovery_from_pathways')
    router.push('/first-discovery')
  }

  const handleQuizStart = () => {
    trackFeatureUsage('start_quiz_from_pathways')
    router.push('/quiz')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">升學大師 v2.0</span>
                <p className="text-xs text-indigo-600 font-medium">6 種升學管道總覽</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleStartDiscovery}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                發現我的路徑
              </button>
              <button
                onClick={() => router.push('/ability-account')}
                className="px-4 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition text-sm font-medium"
              >
                我的能力中心
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-8 px-4 py-2 bg-indigo-100 rounded-full">
            <p className="text-indigo-700 font-semibold text-sm">
              🎓 99% 的高職生不知道的 6 種升學管道
            </p>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            你不知道的<br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              升學選擇
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            多數高職生只知道聯考和推甄，錯過了其他 4 種升學管道。
            <br />
            <strong>了解這 6 種管道，找到最適合你的升學路徑。</strong>
          </p>
        </div>

        {/* 6 Pathways Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {Object.values(SIX_PATHWAYS).map((pathway) => (
            <div
              key={pathway.id}
              onClick={() => handlePathwayClick(pathway.id)}
              className={`bg-white rounded-xl shadow-sm border-2 ${pathway.borderColor} hover:shadow-md transition cursor-pointer transform hover:scale-105`}
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${pathway.color} rounded-xl flex items-center justify-center text-3xl`}>
                    {pathway.icon}
                  </div>
                  <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    {pathway.quota}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{pathway.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{pathway.shortDesc}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{pathway.fullDesc}</p>
              </div>

              {/* Card Body - Quick Info */}
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">📋 申請條件</h4>
                  <ul className="space-y-1">
                    {pathway.requirements.slice(0, 2).map((req, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-start">
                        <span className="text-indigo-600 mr-2">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">✨ 優勢特色</h4>
                  <ul className="space-y-1">
                    {pathway.advantages.slice(0, 2).map((adv, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        {adv}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-xs text-gray-500 italic">
                  "{pathway.successStory}"
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePathwayClick(pathway.id)
                  }}
                  className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                >
                  查看詳細資訊
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Modal */}
        {selectedPathway && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {(() => {
                const pathway = Object.values(SIX_PATHWAYS).find(p => p.id === selectedPathway)
                if (!pathway) return null

                return (
                  <div className="p-8">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className={`w-20 h-20 bg-gradient-to-br ${pathway.color} rounded-xl flex items-center justify-center text-4xl`}>
                          {pathway.icon}
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900">{pathway.name}</h2>
                          <p className="text-indigo-600 font-medium">{pathway.quota}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedPathway(null)}
                        className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                      <p className="text-lg text-gray-700 leading-relaxed">{pathway.fullDesc}</p>
                    </div>

                    {/* Requirements */}
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">📋 申請條件</h3>
                      <ul className="space-y-2">
                        {pathway.requirements.map((req, i) => (
                          <li key={i} className="text-gray-700 flex items-start">
                            <span className="text-indigo-600 mr-3 text-xl">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Advantages */}
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">✨ 優勢特色</h3>
                      <ul className="space-y-2">
                        {pathway.advantages.map((adv, i) => (
                          <li key={i} className="text-gray-700 flex items-start">
                            <span className="text-green-600 mr-3 text-xl">✓</span>
                            {adv}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Timeline */}
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">📅 重要時間點</h3>
                      <div className="space-y-2">
                        {pathway.timeline.map((item, i) => (
                          <div key={i} className="flex items-center">
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${pathway.color} mr-3`}></div>
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tips */}
                    <div className={`mb-6 p-4 rounded-xl ${pathway.bgColor}`}>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">💡 成功秘訣</h3>
                      <ul className="space-y-2">
                        {pathway.tips.map((tip, i) => (
                          <li key={i} className="text-gray-700 flex items-start text-sm">
                            <span className="text-indigo-600 mr-2">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Success Story */}
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">🎓 成功案例</h3>
                      <p className="text-gray-700 italic">"{pathway.successStory}"</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end space-x-4">
                      <button
                        onClick={() => setSelectedPathway(null)}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        關閉
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPathway(null)
                          handleStartDiscovery()
                        }}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        開始發現我的路徑
                      </button>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {/* Comparison Tool */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-indigo-100 mb-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🔍 管道比較工具</h2>
            <p className="text-gray-600">不確定哪個管道適合你？比較不同管道的特色，找到最適合的選擇。</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-indigo-50">
                  <th className="p-3 text-left font-semibold text-gray-900">比較項目</th>
                  <th className="p-3 text-center font-semibold text-gray-900">繁星推薦</th>
                  <th className="p-3 text-center font-semibold text-gray-900">個人申請</th>
                  <th className="p-3 text-center font-semibold text-gray-900">指考分發</th>
                  <th className="p-3 text-center font-semibold text-gray-900">技優甄審</th>
                  <th className="p-3 text-center font-semibold text-gray-900">社區推甄</th>
                  <th className="p-3 text-center font-semibold text-gray-900">特殊選才</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-medium">主要評估標準</td>
                  <td className="p-3 text-center">校內成績</td>
                  <td className="p-3 text-center">備審+面試</td>
                  <td className="p-3 text-center">統測成績</td>
                  <td className="p-3 text-center">競賽成績</td>
                  <td className="p-3 text-center">推薦+面試</td>
                  <td className="p-3 text-center">特殊才能</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-3 font-medium">準備負擔</td>
                  <td className="p-3 text-center">輕</td>
                  <td className="p-3 text-center">中</td>
                  <td className="p-3 text-center">重</td>
                  <td className="p-3 text-center">重（競賽）</td>
                  <td className="p-3 text-center">輕</td>
                  <td className="p-3 text-center">中</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">競爭激烈度</td>
                  <td className="p-3 text-center">中</td>
                  <td className="p-3 text-center">高</td>
                  <td className="p-3 text-center">高</td>
                  <td className="p-3 text-center">低</td>
                  <td className="p-3 text-center">低</td>
                  <td className="p-3 text-center">中</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-3 font-medium">適合學生類型</td>
                  <td className="p-3 text-center">成績穩定</td>
                  <td className="p-3 text-center">有特色成果</td>
                  <td className="p-3 text-center">應試型</td>
                  <td className="p-3 text-center">技藝突出</td>
                  <td className="p-3 text-center">社區高中</td>
                  <td className="p-3 text-center">特殊專長</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-3 font-medium">時間投入</td>
                  <td className="p-3 text-center">早期（高一高二）</td>
                  <td className="p-3 text-center">中期（備審準備）</td>
                  <td className="p-3 text-center">晚期（考前衝刺）</td>
                  <td className="p-3 text-center">長期（競賽準備）</td>
                  <td className="p-3 text-center">短期</td>
                  <td className="p-3 text-center">個人時程</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">🚀 準備好發現適合你的升學管道了嗎？</h2>
          <p className="mb-6 text-indigo-100">
            現在你知道有這麼多選擇了，該如何找到最適合你的路徑呢？
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={handleStartDiscovery}
              className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              🔍 發現我的升學路徑
            </button>
            <button
              onClick={handleQuizStart}
              className="px-6 py-3 bg-indigo-800 text-white rounded-lg font-semibold hover:bg-indigo-900 transition"
            >
              📝 職群發現測驗
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <h3 className="font-bold text-gray-900 mb-2">💡 重要提醒</h3>
          <p className="text-sm text-gray-700">
            每種升學管道都有不同的申請時間和準備要求。建議你：
            <br />1. <strong>深入了解</strong>每個管道的申請條件和時間點
            <br />2. <strong>準備相關材料</strong>（專題成果、技能證照、實習紀錄等）
            <br />3. <strong>規劃時間表</strong>，避免錯過申請期限
            <br />4. <strong>多管道準備</strong>，增加錄取機會
          </p>
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
    </div>
  )
}
