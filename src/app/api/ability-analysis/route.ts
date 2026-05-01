/**
 * AI 學習歷程分析 API
 * 使用 AI 分析學生的能力記錄，提供深度洞察和建議
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClientWrapper } from '@/lib/supabase/server'
import { callAI, parseAIJson } from '@/lib/ai-helper'

interface AnalysisRequest {
  studentProfile?: {
    group_code?: string
    grade?: string
    total_bonus_percent?: number
  }
  abilityRecords: Array<{
    title: string
    category: string
    portfolio_code: string
    description?: string
    bonus_percent?: number
    occurred_date?: string
  }>
}

interface AnalysisResponse {
  success: boolean
  analysis?: {
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
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClientWrapper()

    // 檢查用戶身份
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '未授權的存取' },
        { status: 401 }
      )
    }

    // 解析請求
    const body: AnalysisRequest = await request.json()

    if (!body.abilityRecords || body.abilityRecords.length === 0) {
      return NextResponse.json(
        { success: false, error: '缺少能力記錄資料' },
        { status: 400 }
      )
    }

    // 建構 AI 分析提示
    const systemPrompt = `你是一位專業的台灣升學輔導顧問，專精於分析高中生的學習歷程和能力發展。
    你的任務是基於學生的學習歷程記錄，提供深入且建設性的分析和建議。
    分析應該具體、正面，並且可執行。`

    const userPrompt = buildAnalysisPrompt(body)

    // 呼叫 AI API
    const aiResult = await callAI({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      timeoutMs: 15000
    })

    if (!aiResult.ok || !aiResult.content) {
      return NextResponse.json(
        {
          success: false,
          error: aiResult.error || 'AI 分析服務暫時無法使用'
        },
        { status: 500 }
      )
    }

    // 解析 AI 回應
    const parsedAnalysis = parseAIJson<any>(aiResult.content)

    if (!parsedAnalysis) {
      return NextResponse.json(
        { success: false, error: 'AI 回應格式錯誤' },
        { status: 500 }
      )
    }

    // 記錄分析日誌
    await logAnalysis(supabase, user.id, body, parsedAnalysis)

    return NextResponse.json({
      success: true,
      analysis: parsedAnalysis
    })

  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '分析服務發生錯誤'
      },
      { status: 500 }
    )
  }
}

function buildAnalysisPrompt(data: AnalysisRequest): string {
  const { studentProfile, abilityRecords } = data

  // 建立記錄摘要
  const recordsSummary = abilityRecords.map((record, index) => {
    return `[${index + 1}] ${record.title}
    - 類別：${record.category}
    - 學習歷程代碼：${record.portfolio_code}類
    - 描述：${record.description || '無'}
    - 加分百分比：${record.bonus_percent || 0}%
    - 發生日期：${record.occurred_date || '未知'}`
  }).join('\n\n')

  // 統計資料
  const codeDistribution = {
    A: abilityRecords.filter(r => r.portfolio_code === 'A').length,
    B: abilityRecords.filter(r => r.portfolio_code === 'B').length,
    C: abilityRecords.filter(r => r.portfolio_code === 'C').length,
    D: abilityRecords.filter(r => r.portfolio_code === 'D').length
  }

  const totalBonus = abilityRecords.reduce((sum, r) => sum + (r.bonus_percent || 0), 0)

  return `請分析以下高中生的學習歷程記錄，提供專業的升學建議：

## 學生基本資料
- 類群代碼：${studentProfile?.group_code || '未知'}
- 年級：${studentProfile?.grade || '未知'}
- 總加分百分比：${studentProfile?.total_bonus_percent || totalBonus}%

## 學習歷程記錄（共 ${abilityRecords.length} 筆）
${recordsSummary}

## 學習歷程代碼分佈
- A類（專業證照）：${codeDistribution.A} 筆
- B類（競賽表現）：${codeDistribution.B} 筆
- C類（專題製作）：${codeDistribution.C} 筆
- D類（其他表現）：${codeDistribution.D} 筆

請提供 JSON 格式的分析回應：
{
  "overallSummary": "整體評估摘要（2-3 句話，強調學生的特色和優勢）",
  "strengths": ["優勢1", "優勢2", "優勢3"],
  "improvementAreas": ["可改進的地方1", "可改進的地方2"],
  "portfolioAnalysis": {
    "codeDistribution": "學習歷程代碼分佈分析",
    "recommendations": ["基於分佈的具體建議1", "建議2"]
  },
  "developmentTimeline": [
    {
      "phase": "階段名稱（如：短期目標）",
      "timeframe": "時間範圍（如：接下來 3 個月）",
      "goals": ["具體目標1", "目標2"]
    }
  ],
  "aiInsights": {
    "highlights": ["特別亮點1", "亮點2"],
    "patterns": ["發現的模式1", "模式2"],
    "suggestions": ["AI 洞察建議1", "建議2"]
  }
}

分析準則：
1. overallSummary 要正面且具體，避免泛泛而談
2. strengths 要基於實際記錄內容分析
3. improvementAreas 要建設性，提供可執行的建議
4. portfolioAnalysis 要考慮學習歷程代碼的平衡性和發展性
5. developmentTimeline 要分為短期（3個月）、中期（1學期）、長期（1年）
6. aiInsights 要提供獨特視角，發現學生可能忽略的模式或機會`
}

async function logAnalysis(
  supabase: any,
  userId: string,
  requestData: AnalysisRequest,
  analysisData: any
): Promise<void> {
  try {
    // 記錄分析歷史（可選，用於後續改進和統計）
    const { error } = await supabase
      .from('analysis_logs')
      .insert({
        user_id: userId,
        request_data: requestData,
        analysis_result: analysisData,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Failed to log analysis:', error)
    }
  } catch (error) {
    console.error('Error logging analysis:', error)
  }
}
