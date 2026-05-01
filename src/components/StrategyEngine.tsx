'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type StudentProfile = Database['public']['Tables']['student_profiles']['Row']
type AbilityRecord = Database['public']['Tables']['ability_records']['Row']

interface StrategyRecommendation {
  department: string
  category: string
  matchScore: number
  reasons: string[]
  gaps: string[]
  advantages: string[]
  actionItems: string[]
}

interface StrategyEngineProps {
  profile: StudentProfile | null
  records: AbilityRecord[]
}

export default function StrategyEngine({ profile, records }: StrategyEngineProps) {
  const [recommendations, setRecommendations] = useState<StrategyRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    if (profile && records.length > 0) {
      generateRecommendations()
    }
  }, [profile, records])

  const generateRecommendations = async () => {
    setLoading(true)
    try {
      // 這裡可以接入 AI API 或使用規則引擎
      const generated = await generateStrategyRules(profile, records)
      setRecommendations(generated)
    } catch (error) {
      console.error('Error generating recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  // 116 選考策略規則引擎
  const generateStrategyRules = async (
    profile: StudentProfile | null,
    records: AbilityRecord[]
  ): Promise<StrategyRecommendation[]> => {
    // 分析學生的能力分佈
    const abilityProfile = analyzeAbilityProfile(records)

    // 116 選考科系分類
    const departments = get116Departments()

    // 匹配度評分
    const recommendations: StrategyRecommendation[] = departments.map(dept => {
      const matchScore = calculateMatchScore(abilityProfile, dept)
      const { reasons, gaps, advantages } = generateAnalysis(abilityProfile, dept, matchScore)
      const actionItems = generateActionItems(gaps, dept)

      return {
        department: dept.name,
        category: dept.category,
        matchScore,
        reasons,
        gaps,
        advantages,
        actionItems
      }
    })

    // 按匹配度排序
    return recommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8) // 取前 8 個
  }

  // 分析學生能力分佈
  const analyzeAbilityProfile = (records: AbilityRecord[]) => {
    const profile = {
      academic: 0,      // 學術能力
      technical: 0,     // 技術能力
      leadership: 0,    // 領導力
      creative: 0,      // 創意力
      service: 0,       // 服務精神
      practical: 0,     // 實作能力
      totalBonus: 0,    // 總加分
      portfolioCodes: { A: 0, B: 0, C: 0, D: 0 }  // 學習歷程分佈
    }

    records.forEach(record => {
      const bonus = (record as any).bonus_percent || 0
      profile.totalBonus += bonus
      profile.portfolioCodes[record.portfolio_code || 'D']++

      // 依類別分配能力分數
      switch (record.portfolio_code) {
        case 'A': // 專業證照
          profile.technical += bonus * 1.2
          profile.academic += bonus * 0.8
          break
        case 'B': // 競賽表現
          profile.technical += bonus * 1.0
          profile.practical += bonus * 0.7
          profile.leadership += bonus * 0.3
          break
        case 'C': // 專題製作
          profile.creative += bonus * 1.1
          profile.practical += bonus * 1.0
          profile.technical += bonus * 0.6
          profile.leadership += bonus * 0.3
          break
        case 'D': // 其他表現
          if (record.category === '服務學習' || record.category === '志工') {
            profile.service += bonus * 1.2
          } else if (record.category === '社團' || record.category === '幹部') {
            profile.leadership += bonus * 1.1
          } else {
            profile.practical += bonus * 0.5
          }
          break
      }
    })

    return profile
  }

  // 116 選考科系資料庫
  const get116Departments = () => {
    return [
      // 資訊類
      { name: '資訊工程學系', category: '資訊工程', priority: ['technical', 'academic', 'practical'] },
      { name: '資訊管理學系', category: '資訊管理', priority: ['technical', 'leadership', 'academic'] },
      { name: '資料科學學系', category: '資料科學', priority: ['academic', 'technical', 'creative'] },
      { name: '電信工程學系', category: '電信工程', priority: ['technical', 'academic', 'practical'] },

      // 工程類
      { name: '機械工程學系', category: '機械工程', priority: ['practical', 'technical', 'academic'] },
      { name: '電機工程學系', category: '電機工程', priority: ['technical', 'academic', 'practical'] },
      { name: '土木工程學系', category: '土木工程', priority: ['practical', 'academic', 'technical'] },
      { name: '化學工程學系', category: '化學工程', priority: ['academic', 'practical', 'technical'] },

      // 管理類
      { name: '企業管理學系', category: '企業管理', priority: ['leadership', 'service', 'academic'] },
      { name: '行銷學系', category: '行銷管理', priority: ['creative', 'leadership', 'service'] },
      { name: '財務金融學系', category: '財務金融', priority: ['academic', 'technical', 'leadership'] },
      { name: '會計學系', category: '會計', priority: ['academic', 'technical', 'practical'] },

      // 設計類
      { name: '工業設計學系', category: '工業設計', priority: ['creative', 'practical', 'technical'] },
      { name: '傳播學系', category: '大眾傳播', priority: ['creative', 'leadership', 'service'] },
      { name: '建築學系', category: '建築設計', priority: ['creative', 'practical', 'academic'] },

      // 其他類
      { name: '應用外語學系', category: '語言文化', priority: ['academic', 'service', 'creative'] },
      { name: '社會學系', category: '社會科學', priority: ['academic', 'service', 'leadership'] },
    ]
  }

  // 計算匹配度分數
  const calculateMatchScore = (
    profile: ReturnType<typeof analyzeAbilityProfile>,
    department: ReturnType<typeof get116Departments>[0]
  ): number => {
    let totalScore = 0
    const maxPossibleScore = department.priority.length * 100

    department.priority.forEach((priority, index) => {
      const weight = 1 - (index * 0.2) // 遞減權重
      const abilityScore = profile[priority as keyof typeof profile] as number || 0
      const normalizedScore = Math.min(100, abilityScore) // 正常化到 0-100
      totalScore += normalizedScore * weight
    })

    // 加入總加分調整
    const bonusFactor = Math.min(1.5, 1 + (profile.totalBonus / 100))

    return Math.min(100, (totalScore / maxPossibleScore) * 100 * bonusFactor)
  }

  // 生成分析內容
  const generateAnalysis = (
    profile: ReturnType<typeof analyzeAbilityProfile>,
    department: ReturnType<typeof get116Departments>[0],
    matchScore: number
  ) => {
    const reasons: string[] = []
    const gaps: string[] = []
    const advantages: string[] = []

    // 分析優勢
    department.priority.forEach(priority => {
      const score = profile[priority as keyof typeof profile] as number || 0
      if (score > 50) {
        advantages.push(`${getAbilityLabel(priority)}表現突出 (${score.toFixed(0)}分)`)
      }
    })

    // 分析不足
    department.priority.forEach(priority => {
      const score = profile[priority as keyof typeof profile] as number || 0
      if (score < 30) {
        gaps.push(`需要加強${getAbilityLabel(priority)}`)
      }
    })

    // 生成推薦理由
    if (matchScore > 70) {
      reasons.push('你的能力分佈與此科系高度匹配')
    } else if (matchScore > 50) {
      reasons.push('你的能力分佈與此科系中度匹配，仍有成長空間')
    } else {
      reasons.push('此科系為潛力探索方向，建議多了解')
    }

    // 基於學習歷程分佈的建議
    const totalRecords = Object.values(profile.portfolioCodes).reduce((sum, count) => sum + count, 0)
    if (totalRecords > 0) {
      const balance = Object.values(profile.portfolioCodes).filter(count => count > 0).length
      if (balance >= 3) {
        reasons.push('你的學習歷程多元發展，有利於適應不同領域')
      }
    }

    return { reasons, gaps, advantages }
  }

  // 生成行動建議
  const generateActionItems = (gaps: string[], department: { name: string }) => {
    const items: string[] = []

    if (gaps.length > 0) {
      items.push(`優先補強：${gaps.join('、')}`)
    }

    items.push('深入研究目標科系的課程規劃')
    items.push('參加相關科系的營隊或體驗活動')
    items.push('尋求該領域學長姊的經驗分享')
    items.push('持續累積相關的學習歷程記錄')

    return items
  }

  const getAbilityLabel = (ability: string): string => {
    const labels: Record<string, string> = {
      academic: '學術能力',
      technical: '技術能力',
      leadership: '領導力',
      creative: '創意力',
      service: '服務精神',
      practical: '實作能力'
    }
    return labels[ability] || ability
  }

  // 過濾和分類
  const categories = ['all', ...new Set(recommendations.map(r => r.category))]
  const filteredRecommendations = selectedCategory === 'all'
    ? recommendations
    : recommendations.filter(r => r.category === selectedCategory)

  return (
    <div className="space-y-6">
      {/* 分類篩選 */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg transition ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category === 'all' ? '全部科系' : category}
          </button>
        ))}
      </div>

      {/* 推薦列表 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">AI 分析中...</p>
        </div>
      ) : filteredRecommendations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <p className="text-gray-600">
            {records.length === 0
              ? '請先建立能力記錄，系統將為你生成專屬的 116 選考策略'
              : '暫無推薦結果，請增加更多能力記錄'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecommendations.map((rec, index) => (
            <div
              key={`${rec.department}-${index}`}
              className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-indigo-500"
            >
              {/* 標題區域 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{rec.department}</h3>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                      {rec.category}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-indigo-600">
                        {rec.matchScore.toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-600">匹配度分數</div>
                    </div>
                    {/* 進度條 */}
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${rec.matchScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 排名 */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-400">#{index + 1}</div>
                </div>
              </div>

              {/* 分析內容 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 推薦理由 */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">推薦理由</h4>
                  <ul className="space-y-1">
                    {rec.reasons.map((reason, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start">
                        <span className="text-indigo-600 mr-2">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 優勢分析 */}
                {rec.advantages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">你的優勢</h4>
                    <ul className="space-y-1">
                      {rec.advantages.map((advantage, idx) => (
                        <li key={idx} className="text-sm text-green-700 flex items-start">
                          <span className="mr-2">✓</span>
                          {advantage}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 需要改進 */}
                {rec.gaps.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">需要加強</h4>
                    <ul className="space-y-1">
                      {rec.gaps.map((gap, idx) => (
                        <li key={idx} className="text-sm text-orange-700 flex items-start">
                          <span className="mr-2">!</span>
                          {gap}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 行動建議 */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">下一步行動</h4>
                  <ul className="space-y-1">
                    {rec.actionItems.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start">
                        <span className="text-indigo-600 mr-2">→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
