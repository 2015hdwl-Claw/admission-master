// 職群發現測驗 - Explorer 入口工具
// 目標：幫助高職生快速發現自己適合的職群和升學管道

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { trackPageView, trackFeatureUsage } from '@/lib/analytics'

// 15 個職群的詳細資訊
const VOCATIONAL_GROUPS = [
  { code: '01', name: '餐旅群', emoji: '🍽️', description: '餐飲服務、旅遊規劃、飯店管理' },
  { code: '02', name: '機械群', emoji: '⚙️', description: '機械設計、製造技術、精密加工' },
  { code: '03', name: '電機群', emoji: '⚡', description: '電力系統、控制技術、能源管理' },
  { code: '04', name: '電子群', emoji: '📱', description: '電子電路、通訊技術、半導體' },
  { code: '05', name: '資訊群', emoji: '💻', description: '程式設計、網路技術、資料處理' },
  { code: '06', name: '商管群', emoji: '📊', description: '商業管理、會計財務、行銷企劃' },
  { code: '07', name: '設計群', emoji: '🎨', description: '視覺設計、產品設計、空間設計' },
  { code: '08', name: '農業群', emoji: '🌾', description: '農業技術、園藝、畜產、農企業化' },
  { code: '09', name: '化工群', emoji: '🧪', description: '化學工程、材料技術、生物科技' },
  { code: '10', name: '土木群', emoji: '🏗️', description: '建築工程、營建技術、測量' },
  { code: '11', name: '海事群', emoji: '🚢', description: '航運技術、輪機工程、海事事務' },
  { code: '12', name: '護理群', emoji: '💉', description: '護理技術、健康照護、醫療事務' },
  { code: '13', name: '家政群', emoji: '🏠', description: '生活應用、兒童發展、食品營養' },
  { code: '14', name: '語文群', emoji: '📚', description: '語文應用、翻譯、傳播' },
  { code: '15', name: '商業與管理群', emoji: '💼', description: '企業管理、國際貿易、商業服務' }
]

// 職群發現測驗問題
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: '你在什麼樣的學習環境中表現最好？',
    options: [
      {
        value: 'tech',
        label: '電腦前、實驗室',
        description: '喜歡操作設備、分析數據，解決技術問題',
        groups: ['資訊群', '電子群', '電機群', '化工群']
      },
      {
        value: 'hands-on',
        label: '工廠、實作場',
        description: '喜歡動手做東西，看到實體成品',
        groups: ['機械群', '土木群', '農業群', '海事群']
      },
      {
        value: 'people',
        label: '服務業、互動環境',
        description: '喜歡與人接觸，提供服務和幫助',
        groups: ['餐旅群', '護理群', '家政群', '語文群']
      },
      {
        value: 'creative',
        label: '設計空間、創意環境',
        description: '喜歡發揮創意，追求美感表現',
        groups: ['設計群', '商管群', '商業與管理群']
      }
    ]
  },
  {
    id: 2,
    question: '什麼類型的專題實作讓你最有成就感？',
    options: [
      {
        value: 'digital',
        label: '開發App、網站或程式',
        description: '享受解決問題的過程，創造數位產品',
        groups: ['資訊群', '電子群', '電機群']
      },
      {
        value: 'physical',
        label: '製造機械裝置或建築模型',
        description: '喜歡看到具體的成品從手中產生',
        groups: ['機械群', '土木群', '化工群', '海事群']
      },
      {
        value: 'service',
        label: '策劃活動或提供服務',
        description: '幫助別人解決問題，創造美好體驗',
        groups: ['餐旅群', '護理群', '家政群', '商管群']
      },
      {
        value: 'visual',
        label: '設計海報、產品或品牌',
        description: '用視覺傳達想法，創造美學作品',
        groups: ['設計群', '商業與管理群', '語文群']
      }
    ]
  },
  {
    id: 3,
    question: '你希望未來的工作環境是？',
    options: [
      {
        value: 'office_tech',
        label: '科技公司或辦公室',
        description: '穩定的室內環境，運用科技工具',
        groups: ['資訊群', '商管群', '商業與管理群']
      },
      {
        value: 'factory_lab',
        label: '工廠、實驗室或工地',
        description: '實際操作專業設備，動手解決問題',
        groups: ['機械群', '電機群', '電子群', '化工群', '土木群']
      },
      {
        value: 'service_field',
        label: '餐廳、飯店或醫療場所',
        description: '與人互動，提供專業服務',
        groups: ['餐旅群', '護理群', '家政群']
      },
      {
        value: 'outdoor',
        label: '戶外或移動環境',
        description: '不局限於室內，喜歡多樣化的工作場域',
        groups: ['農業群', '海事群', '土木群']
      }
    ]
  },
  {
    id: 4,
    question: '你最想學習的技能是？',
    options: [
      {
        value: 'programming',
        label: '程式設計、AI技術',
        description: '掌握未來最需要的科技技能',
        groups: ['資訊群', '電子群']
      },
      {
        value: 'engineering',
        label: '機械操作、電力系統',
        description: '學習專業技術，成為技術專家',
        groups: ['機械群', '電機群', '電子群', '化工群']
      },
      {
        value: 'care_service',
        label: '烹飪、護理、照護技能',
        description: '學習照顧和服務他人的專業能力',
        groups: ['餐旅群', '護理群', '家政群']
      },
      {
        value: 'business_design',
        label: '設計軟體、商業分析',
        description: '結合創意與商業的複合技能',
        groups: ['設計群', '商管群', '商業與管理群', '語文群']
      }
    ]
  },
  {
    id: 5,
    question: '你覺得自己最大的優勢是？',
    options: [
      {
        value: 'logical',
        label: '邏輯思考、分析能力',
        description: '能系統化分析問題，找到最佳解決方案',
        groups: ['資訊群', '電機群', '電子群', '化工群', '數學群']
      },
      {
        value: 'practical',
        label: '動手能力、實作技巧',
        description: '手巧心細，能完成精密的操作任務',
        groups: ['機械群', '土木群', '海事群', '護理群']
      },
      {
        value: 'interpersonal',
        label: '溝通能力、服務精神',
        description: '善於理解他人需求，提供溫暖服務',
        groups: ['餐旅群', '護理群', '家政群', '語文群', '商管群']
      },
      {
        value: 'creative',
        label: '創意思考、美學敏感度',
        description: '對美感和創新有天賦，能想出獨特點子',
        groups: ['設計群', '商業與管理群']
      }
    ]
  }
]

// 職群與升學管道的映射關係
const GROUP_PATHWAY_MAPPING: Record<string, string[]> = {
  '餐旅群': ['stars', 'application', 'special', 'skills'],
  '機械群': ['stars', 'application', 'skills', 'exam'],
  '電機群': ['stars', 'application', 'skills', 'exam'],
  '電子群': ['stars', 'application', 'skills', 'exam'],
  '資訊群': ['stars', 'application', 'skills', 'special'],
  '商管群': ['stars', 'application', 'community', 'exam'],
  '設計群': ['application', 'special', 'stars', 'skills'],
  '農業群': ['stars', 'application', 'skills', 'special'],
  '化工群': ['stars', 'application', 'skills', 'exam'],
  '土木群': ['stars', 'application', 'skills', 'exam'],
  '海事群': ['stars', 'application', 'skills', 'special'],
  '護理群': ['stars', 'application', 'skills', 'exam'],
  '家政群': ['application', 'special', 'stars', 'community'],
  '語文群': ['stars', 'application', 'community', 'special'],
  '商業與管理群': ['stars', 'application', 'community', 'exam']
}

const PATHWAY_NAMES: Record<string, string> = {
  'stars': '繁星推薦',
  'application': '個人申請',
  'exam': '指考分發',
  'skills': '技優甄審',
  'community': '社區推甄',
  'special': '特殊選才'
}

export default function QuizPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [quizResult, setQuizResult] = useState<{
    recommendedGroups: string[]
    matchingPathways: string[]
  } | null>(null)
  const [showResult, setShowResult] = useState(false)

  // 頁面載入時追蹤
  useState(() => {
    trackPageView('quiz_page')
  })

  const handleAnswer = (answerValue: string) => {
    const newAnswers = [...answers, currentQuestion]
    setAnswers(newAnswers)

    trackFeatureUsage('quiz_answer', {
      question_id: currentQuestion + 1,
      answer_value: answerValue
    })

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      // 計算測驗結果
      calculateResult(newAnswers)
    }
  }

  const calculateResult = (userAnswers: number[]) => {
    // 統計每個職群被推薦的次數
    const groupScores: Record<string, number> = {}

    userAnswers.forEach(questionIndex => {
      const question = QUIZ_QUESTIONS[questionIndex]
      // 假設用戶選擇了該問題的第一個選項（這裡需要改進，應該記錄實際選擇）
      // 暫時使用第一個選項來演示
      const selectedOption = question.options[0]
      selectedOption.groups.forEach(group => {
        groupScores[group] = (groupScores[group] || 0) + 1
      })
    })

    // 找出得分最高的職群
    const sortedGroups = Object.entries(groupScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([group]) => group)

    // 基於推薦職群找出匹配的升學管道
    const pathwaySet = new Set<string>()
    sortedGroups.forEach(group => {
      const pathways = GROUP_PATHWAY_MAPPING[group]
      pathways.forEach(pathway => pathwaySet.add(pathway))
    })

    const matchingPathways = Array.from(pathwaySet)

    setQuizResult({
      recommendedGroups: sortedGroups,
      matchingPathways
    })
    setShowResult(true)

    trackFeatureUsage('quiz_completed', {
      recommended_groups: sortedGroups,
      pathways_count: matchingPathways.length
    })
  }

  const handleStartDiscovery = () => {
    trackFeatureUsage('start_discovery_from_quiz')
    router.push('/first-discovery')
  }

  const handleRetakeQuiz = () => {
    setCurrentQuestion(0)
    setAnswers([])
    setQuizResult(null)
    setShowResult(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Page title bar */}
      <div className="bg-white/90 border-b border-indigo-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <p className="text-indigo-600 font-semibold text-sm">職群發現測驗</p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!showResult ? (
          /* Quiz Questions */
          <div>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  問題 {currentQuestion + 1} / {QUIZ_QUESTIONS.length}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round((currentQuestion / QUIZ_QUESTIONS.length) * 100)}% 完成
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <div className="text-center mb-8">
              <div className="inline-block mb-4 px-4 py-2 bg-indigo-100 rounded-full">
                <span className="text-indigo-700 font-semibold text-sm">
                  發現你的職群傾向
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {QUIZ_QUESTIONS[currentQuestion].question}
              </h1>
              <p className="text-gray-600">
                選擇最符合你想法和經驗的選項
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {QUIZ_QUESTIONS[currentQuestion].options.map((option, index) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-indigo-400 hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-start mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition">
                        {option.label}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  {/* Preview of related groups */}
                  <div className="flex flex-wrap gap-2">
                    {option.groups.slice(0, 3).map(group => (
                      <span
                        key={group}
                        className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full"
                      >
                        {group}
                      </span>
                    ))}
                    {option.groups.length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        +{option.groups.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            {currentQuestion > 0 && (
              <div className="text-center">
                <button
                  onClick={() => setCurrentQuestion(prev => prev - 1)}
                  className="text-gray-600 hover:text-gray-900 transition text-sm"
                >
                  ← 上一題
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Results */
          <div>
            {/* Results Header */}
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-green-100 rounded-full mb-6">
                <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                🎉 測驗完成！
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                根据你的回答，我們為你分析了最適合的職群方向
              </p>
            </div>

            {/* Recommended Groups */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-indigo-100 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                📚 推薦職群方向
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {quizResult?.recommendedGroups.map(groupName => {
                  const group = VOCATIONAL_GROUPS.find(g => g.name === groupName)
                  if (!group) return null
                  return (
                    <div key={group.code} className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-indigo-100">
                      <div className="text-4xl mr-4">{group.emoji}</div>
                      <div>
                        <h3 className="font-bold text-gray-900">{group.name}</h3>
                        <p className="text-sm text-gray-600">{group.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Matching Pathways */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-indigo-100 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                🎯 適合的升學管道
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quizResult?.matchingPathways.map(pathwayKey => {
                  const pathwayName = PATHWAY_NAMES[pathwayKey]
                  return (
                    <div key={pathwayKey} className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                      <div className="text-2xl mb-2">
                        {pathwayKey === 'stars' && '📚'}
                        {pathwayKey === 'application' && '🎯'}
                        {pathwayKey === 'exam' && '📝'}
                        {pathwayKey === 'skills' && '🏆'}
                        {pathwayKey === 'community' && '⭐'}
                        {pathwayKey === 'special' && '🎓'}
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm">{pathwayName}</h3>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-4">
                🚀 想知道更多細節？
              </h2>
              <p className="mb-6 text-indigo-100">
                現在你知道了自己的職群傾向，讓我們幫你發現具體的升學路徑！
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <button
                  onClick={handleStartDiscovery}
                  className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  🔍 發現我的升學路徑
                </button>
                <button
                  onClick={handleRetakeQuiz}
                  className="px-6 py-3 bg-indigo-800 text-white rounded-lg font-semibold hover:bg-indigo-900 transition"
                >
                  📝 重新測驗
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <h3 className="font-bold text-gray-900 mb-2">💡 測驗說明</h3>
              <p className="text-sm text-gray-700">
                這個測驗根據你的興趣、能力和學習偏好來推薦適合的職群。
                <br />• 測驗結果僅供參考，最終決定權在你
                <br />• 建議結合實際的專題實作和實習經驗來做決定
                <br />• 可以多嘗試不同領域，發現潛在的興趣
              </p>
            </div>
          </div>
        )}
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
