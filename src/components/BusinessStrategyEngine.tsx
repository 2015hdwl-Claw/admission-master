'use client'

import React, { useState } from 'react'
import StudentFeedback from './StudentFeedback'

interface BusinessProfile {
  mathScore: number
  logicScore: number
  languageScore: number
  communicationScore: number
  creativityScore: number
  leadershipScore: number
  itScore: number
  globalVisionScore: number
}

interface DepartmentMatch {
  department: string
  matchScore: number
  riskLevel: 'low' | 'medium' | 'high'
  strengths: string[]
  concerns: string[]
  recommendations: string[]
}

interface BusinessStrategyResponse {
  success: boolean
  data?: {
    allMatches: DepartmentMatch[]
    topRecommendation: {
      department: string
      matchScore: number
      riskLevel: string
      summary: string
    }
    riskAssessment: {
      lowRisk: string[]
      mediumRisk: string[]
      highRisk: string[]
    }
    advice: {
      immediate: string[]
      shortTerm: string[]
      longTerm: string[]
    }
    summary: string
  }
  error?: string
}

interface BusinessStrategyEngineProps {
  grade?: string
  portfolioCount?: number
}

// 評分參考說明
const SCORE_GUIDES = {
  mathScore: {
    label: '數學能力',
    emoji: '📐',
    question: '你的數學成績大概在班上的什麼位置？',
    examples: [
      { score: 20, label: '數學一直很吃力' },
      { score: 50, label: '數學成績中等' },
      { score: 80, label: '數學成績不錯，常在前面' }
    ]
  },
  logicScore: {
    label: '邏輯思考',
    emoji: '🧩',
    question: '解決問題時，你通常會怎麼做？',
    examples: [
      { score: 30, label: '比較直覺，憑感覺做決定' },
      { score: 60, label: '會有步驟地思考，但有時會混亂' },
      { score: 90, label: '很有條理，一步步分析問題' }
    ]
  },
  languageScore: {
    label: '語文能力',
    emoji: '📚',
    question: '你的國文和英文成績如何？',
    examples: [
      { score: 30, label: '語文科目比較弱' },
      { score: 60, label: '語文成績中等' },
      { score: 85, label: '語文成績很好，喜歡閱讀' }
    ]
  },
  communicationScore: {
    label: '溝通表達',
    emoji: '💬',
    question: '你在人群中的表現如何？',
    examples: [
      { score: 25, label: '比較害羞，不習慣發言' },
      { score: 55, label: '跟熟人聊得很來，陌生人有點緊張' },
      { score: 80, label: '很健談，很容易跟人打成一片' }
    ]
  },
  creativityScore: {
    label: '創意思考',
    emoji: '💡',
    question: '你想像力豐富嗎？喜歡嘗試新方法嗎？',
    examples: [
      { score: 30, label: '喜歡按規矩做，不太想新點子' },
      { score: 60, label: '有時會有新想法，但不是很多' },
      { score: 85, label: '經常有很多創意點子，喜歡創新' }
    ]
  },
  leadershipScore: {
    label: '領導能力',
    emoji: '👥',
    question: '在小組活動或團隊中，你通常扮演什麼角色？',
    examples: [
      { score: 25, label: '通常聽從別人安排，負責執行' },
      { score: 55, label: '有時會主動協調，但不是主導者' },
      { score: 80, label: '經常帶領團隊，喜歡負責規劃' }
    ]
  },
  itScore: {
    label: '電腦能力',
    emoji: '💻',
    question: '你的電腦和數位工具操作能力如何？',
    examples: [
      { score: 35, label: '基本操作，偶爾需要幫忙' },
      { score: 65, label: '操作不錯，會用很多軟體' },
      { score: 90, label: '很強，會寫程式或處理複雜問題' }
    ]
  },
  globalVisionScore: {
    label: '國際視野',
    emoji: '🌍',
    question: '你對國際事務或外國文化的興趣如何？',
    examples: [
      { score: 30, label: '比較關注國內，對國際不太瞭解' },
      { score: 60, label: '有興趣，偶爾看國際新聞' },
      { score: 85, label: '很有興趣，希望將來能夠出國工作' }
    ]
  }
}

export default function BusinessStrategyEngine({ grade = '高二', portfolioCount = 0 }: BusinessStrategyEngineProps) {
  const [profiles, setProfiles] = useState<BusinessProfile>({
    mathScore: 50,
    logicScore: 50,
    languageScore: 50,
    communicationScore: 50,
    creativityScore: 50,
    leadershipScore: 50,
    itScore: 50,
    globalVisionScore: 50
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BusinessStrategyResponse | null>(null)
  const [showInstructions, setShowInstructions] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)

  const steps = [
    { title: '開始評估', description: '回答 8 個簡單問題' },
    { title: '分析中', description: 'AI 計算你的匹配度' },
    { title: '獲得推薦', description: '查看專屬科系建議' }
  ]

  const handleScoreChange = (field: keyof BusinessProfile, value: string) => {
    const score = parseInt(value) || 0
    const validatedScore = Math.max(0, Math.min(100, score))
    setProfiles(prev => ({ ...prev, [field]: validatedScore }))
  }

  const analyzeProfile = async () => {
    setLoading(true)
    setCurrentStep(1)
    try {
      const response = await fetch('/api/business-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessProfile: profiles,
          grade,
          portfolioCount
        })
      })

      const data: BusinessStrategyResponse = await response.json()
      setCurrentStep(2)
      setResult(data)
      setShowInstructions(false)
    } catch (error) {
      console.error('Error analyzing business profile:', error)
      setResult({
        success: false,
        error: '分析服務暫時無法使用，請稍後再試'
      })
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800 border-green-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'high': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getRiskEmoji = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return '✅'
      case 'medium': return '⚠️'
      case 'high': return '⚡'
      default: return '❓'
    }
  }

  if (showInstructions) {
    return (
      <div className="max-w-3xl mx-auto">
        {/* 進度條 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                  index <= currentStep ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < currentStep ? '✓' : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${index < currentStep ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-gray-600 mt-2">
            {steps[currentStep].title} - {steps[currentStep].description}
          </div>
        </div>

        {/* 歡迎訊息 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🎓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              找出適合你的商管科系
            </h2>
            <p className="text-gray-600">
              跟著問題回答，不需要思考太久，憑直覺選擇最接近你的答案就好！
            </p>
          </div>

          {/* 科系介紹 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">📊 你可以探索這些科系</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {['會計學系', '財務金融', '國際企業', '行銷學系', '經濟學系', '企業管理', '資訊管理'].map(dept => (
                <div key={dept} className="bg-white rounded px-3 py-2 text-center text-gray-700">
                  {dept}
                </div>
              ))}
            </div>
          </div>

          {/* 開始按鈕 */}
          <button
            onClick={() => {
              setCurrentStep(0)
              const scrollContainer = document.getElementById('questions-container')
              scrollContainer?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition"
          >
            開始評估 →
          </button>
        </div>

        {/* 問卷區域 */}
        <div id="questions-container" className="space-y-4">
          {Object.entries(SCORE_GUIDES).map(([key, guide], index) => (
            <div key={key} className="bg-white rounded-lg shadow-sm p-5 border-2 border-transparent hover:border-indigo-300 transition">
              {/* 標題 */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{guide.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{guide.label}</h3>
                  <p className="text-sm text-gray-600">{guide.question}</p>
                </div>
              </div>

              {/* 評分選項 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {guide.examples.map(example => (
                  <button
                    key={example.score}
                    onClick={() => handleScoreChange(key as keyof BusinessProfile, example.score.toString())}
                    className={`text-left p-3 rounded-lg border-2 transition ${
                      profiles[key as keyof BusinessProfile] === example.score
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm text-gray-700">{example.label}</div>
                  </button>
                ))}
              </div>

              {/* 自訂分數 */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">想自己調整：</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={profiles[key as keyof BusinessProfile]}
                  onChange={(e) => handleScoreChange(key as keyof BusinessProfile, e.target.value)}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={profiles[key as keyof BusinessProfile]}
                  onChange={(e) => handleScoreChange(key as keyof BusinessProfile, e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold"
                />
                <span className="text-sm text-gray-600">分</span>
              </div>
            </div>
          ))}

          {/* 提交按鈕 */}
          <button
            onClick={analyzeProfile}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '分析中...' : '查看我的推薦結果 🎯'}
          </button>

          <p className="text-center text-sm text-gray-500">
            ⏱️ 預計需要 30 秒，請稍候
          </p>
        </div>
      </div>
    )
  }

  // 結果頁面
  return (
    <div className="max-w-4xl mx-auto">
      {/* 成功標題 */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="text-5xl">🎉</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              分析完成！找到最適合你的科系
            </h2>
            <p className="text-gray-600">
              根據你的特質分析，我們為你推薦以下商管科系
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">正在分析你的特質...</p>
          <p className="text-sm text-gray-500 mt-2">這需要幾秒鐘</p>
        </div>
      ) : result && result.success && result.data ? (
        <div className="space-y-6">
          {/* 頂級推薦 */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="text-5xl">🏆</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold">{result.data.topRecommendation.department}</h3>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    匹配度 {result.data.topRecommendation.matchScore}%
                  </span>
                </div>
                <p className="text-white/90 mb-4">{result.data.topRecommendation.summary}</p>
                <div className="flex items-center gap-2">
                  <span className="text-white/70">風險等級：</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    result.data.topRecommendation.riskLevel === 'low' ? 'bg-green-400 text-green-900' :
                    result.data.topRecommendation.riskLevel === 'medium' ? 'bg-yellow-400 text-yellow-900' :
                    'bg-red-400 text-red-900'
                  }`}>
                    {result.data.topRecommendation.riskLevel === 'low' ? '✅ 低風險' :
                     result.data.topRecommendation.riskLevel === 'medium' ? '⚠️ 中風險' : '⚡ 高風險'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 所有科系排名 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📊 完整科系排名</h3>
            <div className="space-y-3">
              {result.data.allMatches.map((match, index) => (
                <div key={`${match.department}-${index}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-2xl font-bold text-indigo-600">#{index + 1}</div>
                        <h4 className="text-lg font-semibold text-gray-900">{match.department}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskColor(match.riskLevel)}`}>
                          {getRiskEmoji(match.riskLevel)} {match.riskLevel === 'low' ? '低風險' : match.riskLevel === 'medium' ? '中風險' : '高風險'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-indigo-600">{match.matchScore}%</div>
                        <div className="text-sm text-gray-600">匹配度</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${match.matchScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 分析細節 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {match.strengths.length > 0 && (
                      <div className="bg-green-50 rounded-lg p-3">
                        <h5 className="text-sm font-semibold text-green-800 mb-2">✅ 優勢</h5>
                        <ul className="space-y-1">
                          {match.strengths.map((strength, idx) => (
                            <li key={idx} className="text-xs text-green-700">{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {match.concerns.length > 0 && (
                      <div className="bg-orange-50 rounded-lg p-3">
                        <h5 className="text-sm font-semibold text-orange-800 mb-2">⚠️ 需要注意</h5>
                        <ul className="space-y-1">
                          {match.concerns.map((concern, idx) => (
                            <li key={idx} className="text-xs text-orange-700">{concern}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {match.recommendations.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h5 className="text-sm font-semibold text-blue-800 mb-2">💡 建議</h5>
                        <ul className="space-y-1">
                          {match.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-xs text-blue-700">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 發展建議 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 下一步建議</h3>
            <div className="space-y-4">
              {result.data.advice.immediate.length > 0 && (
                <div className="border-l-4 border-red-500 bg-red-50 p-4">
                  <h4 className="font-semibold text-red-800 mb-2">🔥 立即行動</h4>
                  <ul className="space-y-2">
                    {result.data.advice.immediate.map((item, idx) => (
                      <li key={idx} className="text-red-700">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.data.advice.shortTerm.length > 0 && (
                <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">📅 短期目標</h4>
                  <ul className="space-y-2">
                    {result.data.advice.shortTerm.map((item, idx) => (
                      <li key={idx} className="text-blue-700">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.data.advice.longTerm.length > 0 && (
                <div className="border-l-4 border-green-500 bg-green-50 p-4">
                  <h4 className="font-semibold text-green-800 mb-2">🌟 長期規劃</h4>
                  <ul className="space-y-2">
                    {result.data.advice.longTerm.map((item, idx) => (
                      <li key={idx} className="text-green-700">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* 重新評估 */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowInstructions(true)
                setResult(null)
                setCurrentStep(0)
              }}
              className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              🔄 重新評估
            </button>
            <button
              onClick={() => setShowFeedback(true)}
              className="flex-1 border border-green-600 text-green-600 py-3 px-6 rounded-lg font-medium hover:bg-green-50 transition"
            >
              💬 提供反饋
            </button>
          </div>

          {/* 反饋彈窗 */}
          {showFeedback && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-lg">
                <StudentFeedback
                  type="business-strategy"
                  onClose={() => setShowFeedback(false)}
                />
              </div>
            </div>
          )}
        </div>
      ) : result && !result.success ? (
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">😢</div>
          <p className="text-gray-600 mb-4">{result.error}</p>
          <button
            onClick={() => setShowInstructions(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            重新評估
          </button>
        </div>
      ) : null}
    </div>
  )
}