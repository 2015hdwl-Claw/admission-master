'use client'

import React, { useState, useEffect } from 'react'
import type { Database } from '@/lib/supabase/database.types'
type AbilityRecord = Database['public']['Tables']['ability_records']['Row']

interface AIAnalysisEngineProps {
  records: AbilityRecord[]
  profile?: {
    group_code?: string
    grade?: string
    total_bonus_percent?: number
  }
}

interface AIAnalysis {
  overallSummary: string
  strengths: string[]
  improvementAreas: string[]
  portfolioAnalysis: {
    codeDistribution: string
    recommendations: string[]
  }
  developmentTimeline: Array<{
    phase: string
    timeframe: string
    goals: string[]
  }>
  aiInsights: {
    highlights: string[]
    patterns: string[]
    suggestions: string[]
  }
}

export default function AIAnalysisEngine({ records, profile }: AIAnalysisEngineProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<string>('overview')

  useEffect(() => {
    if (records.length > 0) {
      generateAnalysis()
    }
  }, [records, profile])

  const generateAnalysis = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ability-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentProfile: profile,
          abilityRecords: records
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || '分析失敗')
      }

      setAnalysis(data.analysis)
    } catch (err) {
      console.error('Analysis generation error:', err)
      setError(err instanceof Error ? err.message : '生成分析時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-full animate-ping"></div>
          </div>
          <p className="text-gray-600 font-medium">AI 正在分析你的學習歷程...</p>
          <p className="text-sm text-gray-500 mt-2">這可能需要幾秒鐘時間</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">分析生成失敗</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={generateAnalysis}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          重試
        </button>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🤖</div>
        <p className="text-gray-600 mb-4">
          {records.length === 0
            ? '請先建立能力記錄，AI 將為你生成深度分析'
            : '準備開始 AI 分析'
          }
        </p>
        {records.length > 0 && (
          <button
            onClick={generateAnalysis}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            開始 AI 分析
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 導航標籤 */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap -mb-px">
            <button
              onClick={() => setSelectedSection('overview')}
              className={`py-3 px-4 text-sm font-medium transition ${
                selectedSection === 'overview'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              整體分析
            </button>
            <button
              onClick={() => setSelectedSection('strengths')}
              className={`py-3 px-4 text-sm font-medium transition ${
                selectedSection === 'strengths'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              優勢與改進
            </button>
            <button
              onClick={() => setSelectedSection('timeline')}
              className={`py-3 px-4 text-sm font-medium transition ${
                selectedSection === 'timeline'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              發展計畫
            </button>
            <button
              onClick={() => setSelectedSection('insights')}
              className={`py-3 px-4 text-sm font-medium transition ${
                selectedSection === 'insights'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              AI 洞察
            </button>
          </nav>
        </div>
      </div>

      {/* 內容區域 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {selectedSection === 'overview' && (
          <div className="space-y-6">
            {/* 整體摘要 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
                整體評估
              </h3>
              <p className="text-gray-700 leading-relaxed bg-indigo-50 p-4 rounded-lg">
                {analysis.overallSummary}
              </p>
            </div>

            {/* 學習歷程分析 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                學習歷程分析
              </h3>
              <p className="text-gray-700 mb-3">{analysis.portfolioAnalysis.codeDistribution}</p>
              <div className="space-y-2">
                {analysis.portfolioAnalysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">✓</span>
                    <span className="text-gray-700">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedSection === 'strengths' && (
          <div className="space-y-6">
            {/* 優勢 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                你的優勢
              </h3>
              <div className="space-y-3">
                {analysis.strengths.map((strength, index) => (
                  <div key={index} className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <p className="text-gray-700">{strength}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 改進區域 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span className="w-2 h-2 bg-orange-600 rounded-full mr-2"></span>
                成長空間
              </h3>
              <div className="space-y-3">
                {analysis.improvementAreas.map((area, index) => (
                  <div key={index} className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                    <p className="text-gray-700">{area}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedSection === 'timeline' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
              個人化發展計畫
            </h3>
            <div className="space-y-4">
              {analysis.developmentTimeline.map((phase, index) => (
                <div key={index} className="relative">
                  {index > 0 && (
                    <div className="absolute left-4 -top-4 w-0.5 h-4 bg-gray-300"></div>
                  )}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-sm">{index + 1}</span>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-base font-semibold text-gray-900">{phase.phase}</h4>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {phase.timeframe}
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {phase.goals.map((goal, goalIndex) => (
                          <li key={goalIndex} className="text-sm text-gray-600 flex items-start">
                            <span className="text-purple-600 mr-2">•</span>
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedSection === 'insights' && (
          <div className="space-y-6">
            {/* AI 亮點 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span className="w-2 h-2 bg-yellow-600 rounded-full mr-2"></span>
                特別亮點
              </h3>
              <div className="space-y-2">
                {analysis.aiInsights.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-yellow-600 mr-2">⭐</span>
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 發現模式 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                AI 發現的模式
              </h3>
              <div className="space-y-2">
                {analysis.aiInsights.patterns.map((pattern, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">🔍</span>
                    <span className="text-gray-700">{pattern}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI 建議 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
                智能建議
              </h3>
              <div className="space-y-2">
                {analysis.aiInsights.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-indigo-600 mr-2">💡</span>
                    <span className="text-gray-700">{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 重新分析按鈕 */}
      <div className="text-center">
        <button
          onClick={generateAnalysis}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
        >
          重新生成分析
        </button>
      </div>
    </div>
  )
}
