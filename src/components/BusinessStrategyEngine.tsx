'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

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

  const handleScoreChange = (field: keyof BusinessProfile, value: string) => {
    const score = parseInt(value) || 0
    const validatedScore = Math.max(0, Math.min(100, score))
    setProfiles(prev => ({ ...prev, [field]: validatedScore }))
  }

  const analyzeProfile = async () => {
    setLoading(true)
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
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-orange-600 bg-orange-50'
      case 'high': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return '低風險'
      case 'medium': return '中風險'
      case 'high': return '高風險'
      default: return '未知'
    }
  }

  if (showInstructions) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* 說明頁面 */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">商管群科系匹配度分析</h2>
            <p className="text-gray-600">
              評估你的商管特質，找出最適合你的科系
            </p>
          </div>

          {/* 評分說明 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">評分說明</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'mathScore', label: '數學能力', desc: '計算能力、邏輯推理、數學分析', weight: '非常重要' },
                { name: 'logicScore', label: '邏輯思維', desc: '條理思考、問題分析、決策能力', weight: '非常重要' },
                { name: 'languageScore', label: '語文能力', desc: '閱讀理解、表達能力、外語程度', weight: '重要' },
                { name: 'communicationScore', label: '溝通表達', desc: '人際互動、簡報能力、協調技巧', weight: '重要' },
                { name: 'creativityScore', label: '創意思考', desc: '創新能力、解決問題、構想發想', weight: '中等' },
                { name: 'leadershipScore', label: '領導能力', desc: '團隊帶領、決策判斷、責任感', weight: '中等' },
                { name: 'itScore', label: '資訊能力', desc: '電腦操作、數位工具、資料分析', weight: '視科系而定' },
                { name: 'globalVisionScore', label: '國際視野', desc: '全球認知、跨文化理解、語言能力', weight: '視科系而定' }
              ].map(item => (
                <div key={item.name} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{item.label}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.weight === '非常重要' ? 'bg-red-100 text-red-700' :
                      item.weight === '重要' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {item.weight}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 評分表單 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">自我評分（0-100分）</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { field: 'mathScore' as keyof BusinessProfile, label: '數學能力' },
                { field: 'logicScore' as keyof BusinessProfile, label: '邏輯思維' },
                { field: 'languageScore' as keyof BusinessProfile, label: '語文能力' },
                { field: 'communicationScore' as keyof BusinessProfile, label: '溝通表達' },
                { field: 'creativityScore' as keyof BusinessProfile, label: '創意思考' },
                { field: 'leadershipScore' as keyof BusinessProfile, label: '領導能力' },
                { field: 'itScore' as keyof BusinessProfile, label: '資訊能力' },
                { field: 'globalVisionScore' as keyof BusinessProfile, label: '國際視野' }
              ].map(item => (
                <div key={item.field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {item.label}
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={profiles[item.field]}
                      onChange={(e) => handleScoreChange(item.field, e.target.value)}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={profiles[item.field]}
                      onChange={(e) => handleScoreChange(item.field, e.target.value)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex gap-4">
            <button
              onClick={analyzeProfile}
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? '分析中...' : '開始分析'}
            </button>
            <button
              onClick={() => setShowInstructions(false)}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              查看範例結果
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 結果頁面
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-8">
        {/* 標題區域 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">商管群科系分析結果</h2>
            <p className="text-gray-600">基於你的特質評分，推薦最適合的商管科系</p>
          </div>
          <button
            onClick={() => setShowInstructions(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            重新評分
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">AI 分析中...</p>
          </div>
        ) : result && result.success && result.data ? (
          <div className="space-y-8">
            {/* 推薦摘要 */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-3">分析摘要</h3>
              <div className="text-indigo-800 whitespace-pre-line">{result.data.summary}</div>
            </div>

            {/* 頂級推薦 */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🎯</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{result.data.topRecommendation.department}</h3>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRiskColor(result.data.topRecommendation.riskLevel)}`}>
                      {getRiskLabel(result.data.topRecommendation.riskLevel)}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{result.data.topRecommendation.summary}</p>
                  <div className="flex items-center gap-2">
                    <div className="text-3xl font-bold text-green-600">{result.data.topRecommendation.matchScore}%</div>
                    <div className="text-sm text-gray-600">匹配度</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 所有科系排名 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">所有科系匹配度排名</h3>
              <div className="space-y-4">
                {result.data.allMatches.map((match, index) => (
                  <div key={`${match.department}-${index}`} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                          <h4 className="text-lg font-semibold text-gray-900">{match.department}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(match.riskLevel)}`}>
                            {getRiskLabel(match.riskLevel)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {match.strengths.length > 0 && (
                        <div className="bg-green-50 rounded-lg p-3">
                          <h5 className="text-sm font-semibold text-green-800 mb-2">優勢</h5>
                          <ul className="space-y-1">
                            {match.strengths.map((strength, idx) => (
                              <li key={idx} className="text-xs text-green-700 flex items-start">
                                <span className="mr-1">✓</span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {match.concerns.length > 0 && (
                        <div className="bg-orange-50 rounded-lg p-3">
                          <h5 className="text-sm font-semibold text-orange-800 mb-2">關注</h5>
                          <ul className="space-y-1">
                            {match.concerns.map((concern, idx) => (
                              <li key={idx} className="text-xs text-orange-700 flex items-start">
                                <span className="mr-1">!</span>
                                {concern}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {match.recommendations.length > 0 && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <h5 className="text-sm font-semibold text-blue-800 mb-2">建議</h5>
                          <ul className="space-y-1">
                            {match.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-xs text-blue-700 flex items-start">
                                <span className="mr-1">→</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 風險評估 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">風險評估分佈</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-green-800 mb-2">低風險科系</div>
                  <div className="text-2xl font-bold text-green-600">{result.data.riskAssessment.lowRisk.length}</div>
                  <div className="text-xs text-green-700 mt-2">
                    {result.data.riskAssessment.lowRisk.join('、') || '無'}
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-orange-800 mb-2">中風險科系</div>
                  <div className="text-2xl font-bold text-orange-600">{result.data.riskAssessment.mediumRisk.length}</div>
                  <div className="text-xs text-orange-700 mt-2">
                    {result.data.riskAssessment.mediumRisk.join('、') || '無'}
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-red-800 mb-2">高風險科系</div>
                  <div className="text-2xl font-bold text-red-600">{result.data.riskAssessment.highRisk.length}</div>
                  <div className="text-xs text-red-700 mt-2">
                    {result.data.riskAssessment.highRisk.join('、') || '無'}
                  </div>
                </div>
              </div>
            </div>

            {/* 發展建議 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">發展建議</h3>
              <div className="space-y-4">
                {result.data.advice.immediate.length > 0 && (
                  <div className="border-l-4 border-red-500 bg-red-50 p-4">
                    <h4 className="text-sm font-semibold text-red-800 mb-2">立即行動</h4>
                    <ul className="space-y-1">
                      {result.data.advice.immediate.map((item, idx) => (
                        <li key={idx} className="text-sm text-red-700">• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.data.advice.shortTerm.length > 0 && (
                  <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">短期目標</h4>
                    <ul className="space-y-1">
                      {result.data.advice.shortTerm.map((item, idx) => (
                        <li key={idx} className="text-sm text-blue-700">• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.data.advice.longTerm.length > 0 && (
                  <div className="border-l-4 border-green-500 bg-green-50 p-4">
                    <h4 className="text-sm font-semibold text-green-800 mb-2">長期規劃</h4>
                    <ul className="space-y-1">
                      {result.data.advice.longTerm.map((item, idx) => (
                        <li key={idx} className="text-sm text-green-700">• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : result && !result.success ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-gray-600">{result.error}</p>
            <button
              onClick={() => setShowInstructions(true)}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              重新評分
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
