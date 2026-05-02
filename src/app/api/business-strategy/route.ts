/**
 * 商管群科系策略 API
 * 使用新的 scoring-algorithm.ts 為商管群學生提供精準的科系推薦
 */

import { NextRequest, NextResponse } from 'next/server'
import { calculateAllBusinessMatches, convertAnswersToProfile, generateRecommendationSummary } from '@/lib/scoring/scoring-algorithm'

interface BusinessStrategyRequest {
  // 使用者商管群特質評分
  businessProfile: {
    mathScore: number          // 數學能力 0-100
    logicScore: number         // 邏輯思維 0-100
    languageScore: number      // 語文能力 0-100
    communicationScore: number // 溝通表達 0-100
    creativityScore: number    // 創意思考 0-100
    leadershipScore: number    // 領導能力 0-100
    itScore: number           // 資訊能力 0-100
    globalVisionScore: number  // 國際視野 0-100
  }
  // 其他背景資訊
  grade?: string
  portfolioCount?: number
}

interface BusinessStrategyResponse {
  success: boolean
  data?: {
    allMatches: Array<{
      department: string
      matchScore: number
      riskLevel: 'low' | 'medium' | 'high'
      strengths: string[]
      concerns: string[]
      recommendations: string[]
    }>
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

export async function POST(request: NextRequest) {
  try {
    const body: BusinessStrategyRequest = await request.json()

    // 驗證輸入資料
    if (!body.businessProfile) {
      return NextResponse.json(
        { success: false, error: '缺少商管特質評分資料' },
        { status: 400 }
      )
    }

    // 驗證評分範圍
    const scores = body.businessProfile
    const scoreFields = ['mathScore', 'logicScore', 'languageScore', 'communicationScore',
                         'creativityScore', 'leadershipScore', 'itScore', 'globalVisionScore']

    for (const field of scoreFields) {
      const value = scores[field as keyof typeof scores]
      if (typeof value !== 'number' || value < 0 || value > 100) {
        return NextResponse.json(
          { success: false, error: `${field} 必須介於 0-100 之間` },
          { status: 400 }
        )
      }
    }

    // 轉換並計算匹配度
    const profile = convertAnswersToProfile(scores)
    const allMatches = calculateAllBusinessMatches(profile)

    if (allMatches.length === 0) {
      return NextResponse.json(
        { success: false, error: '無法計算科系匹配度' },
        { status: 500 }
      )
    }

    // 取得推薦摘要
    const summary = generateRecommendationSummary(allMatches)

    // 分類風險等級
    const riskAssessment = {
      lowRisk: allMatches.filter(m => m.riskLevel === 'low').map(m => m.name),
      mediumRisk: allMatches.filter(m => m.riskLevel === 'medium').map(m => m.name),
      highRisk: allMatches.filter(m => m.riskLevel === 'high').map(m => m.name)
    }

    // 生成建議
    const topMatch = allMatches[0]
    const advice = generateAdvice(topMatch, body.grade, body.portfolioCount)

    return NextResponse.json({
      success: true,
      data: {
        allMatches: allMatches.map(match => ({
          department: match.name,
          matchScore: match.matchScore,
          riskLevel: match.riskLevel,
          strengths: match.strengths,
          concerns: match.concerns,
          recommendations: match.recommendations
        })),
        topRecommendation: {
          department: topMatch.name,
          matchScore: topMatch.matchScore,
          riskLevel: topMatch.riskLevel,
          summary: `${topMatch.name}（匹配度 ${topMatch.matchScore}%，風險等級：${topMatch.riskLevel === 'low' ? '低' : topMatch.riskLevel === 'medium' ? '中' : '高'}）`
        },
        riskAssessment,
        advice,
        summary
      }
    })

  } catch (error) {
    console.error('Business strategy error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '商管策略分析發生錯誤'
      },
      { status: 500 }
    )
  }
}

function generateAdvice(
  topMatch: any,
  grade?: string,
  portfolioCount?: number
): { immediate: string[]; shortTerm: string[]; longTerm: string[] } {
  const immediate: string[] = []
  const shortTerm: string[] = []
  const longTerm: string[] = []

  // 基於風險等級的建議
  if (topMatch.riskLevel === 'high') {
    immediate.push('優先加強門檻能力項目（數學、邏輯、語文）')
    immediate.push('重新評估科系選擇，考慮其他匹配度更高的選項')
  } else if (topMatch.riskLevel === 'medium') {
    immediate.push(`關注並改善 ${topMatch.concerns[0] || '相關能力'}`)
    immediate.push('持續累積相關學習歷程')
  } else {
    immediate.push(`持續發揮 ${topMatch.strengths[0] || '既有優勢'}`)
    immediate.push('開始準備該科系的備審資料')
  }

  // 基於年級的建議
  if (grade === '高一') {
    shortTerm.push('廣泛參與商管相關活動，驗證興趣')
    shortTerm.push('建立良好的數學與邏輯基礎')
    longTerm.push('高二確定具體科系目標')
    longTerm.push('累積至少 3 件相關學習歷程')
  } else if (grade === '高二') {
    shortTerm.push('參加商業競賽或企劃比賽')
    shortTerm.push('修習相關選修課程')
    longTerm.push('準備備審資料初稿')
    longTerm.push('參加大學營隊深入了解科系')
  } else if (grade === '高三') {
    shortTerm.push('完成備審資料')
    shortTerm.push('準備面試，強調自身優勢')
    longTerm.push('衝刺學測成績')
    longTerm.push('準備申請入學')
  }

  // 基於素材數量的建議
  if (portfolioCount === 0) {
    immediate.push('立即開始第一件學習歷程紀錄')
    shortTerm.push('優先選擇 B 類（書面報告）或 C 類（實作作品）')
  } else if (portfolioCount && portfolioCount < 3) {
    shortTerm.push('補充不同類型的學習歷程')
  } else {
    immediate.push('整理既有素材，準備備審')
  }

  // 確保每個陣列至少有一個建議
  if (immediate.length === 0) immediate.push('持續了解目標科系的最新資訊')
  if (shortTerm.length === 0) shortTerm.push('參加相關營隊或活動')
  if (longTerm.length === 0) longTerm.push('建立完整的升學準備時程')

  return { immediate, shortTerm, longTerm }
}

// GET 端點提供商管科系列表資訊
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      availableDepartments: [
        { code: 'accounting', name: '會計學系', description: '專注於會計處理、財務分析、審計思維' },
        { code: 'finance', name: '財務金融學系', description: '專注於投資分析、風險計算、金融科技' },
        { code: 'intl-business', name: '國際企業學系', description: '專注於外語能力、跨文化溝通、全球視野' },
        { code: 'marketing', name: '行銷學系', description: '專注於對外溝通、行銷創意、數位行銷' },
        { code: 'economics', name: '經濟學系', description: '專注於計量經濟、經濟理論、政策分析' },
        { code: 'management', name: '企業管理學系', description: '專注於管理決策、團隊領導、組織協調' },
        { code: 'info-mgmt', name: '資訊管理學系', description: '專注於系統設計、資料分析、專案管理' }
      ],
      scoringInstructions: {
        title: '商管群特質評分說明',
        dimensions: [
          { name: '數學能力', description: '計算能力、邏輯推理、數學分析', weight: '非常重要' },
          { name: '邏輯思維', description: '條理思考、問題分析、決策能力', weight: '非常重要' },
          { name: '語文能力', description: '閱讀理解、表達能力、外語程度', weight: '重要' },
          { name: '溝通表達', description: '人際互動、簡報能力、協調技巧', weight: '重要' },
          { name: '創意思考', description: '創新能力、解決問題、構想發想', weight: '中等' },
          { name: '領導能力', description: '團隊帶領、決策判斷、責任感', weight: '中等' },
          { name: '資訊能力', description: '電腦操作、數位工具、資料分析', weight: '視科系而定' },
          { name: '國際視野', description: '全球認知、跨文化理解、語言能力', weight: '視科系而定' }
        ],
        scoringGuide: '請根據自己的實際能力評分（0-100分），越自信的分數越高'
      }
    }
  })
}
