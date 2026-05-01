// 升學大師 v4 - 學習歷程預覽 API
// POST /api/portfolio-preview - 使用 AI 生成學習歷程預覽和建議

import { createServerClientWrapper } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server'

interface PreviewRequest {
  content: string
  title: string
  targetAudience?: 'student' | 'parent' | 'teacher'
}

interface AIAnalysis {
  summary: string
  strengths: string[]
  improvements: string[]
  suggestions: string[]
  qualityGrade: 'A' | 'B' | 'C' | 'D'
  wordCount: number
  readabilityScore: number
}

// POST - 生成學習歷程預覽
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // 取得當前用戶
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: '未授權的存取' },
        { status: 401 }
      )
    }

    // 取得請求內容
    const body: PreviewRequest = await request.json()

    // 驗證必填欄位
    if (!body.content || !body.title) {
      return NextResponse.json(
        { error: '缺少必填欄位：content, title' },
        { status: 400 }
      )
    }

    // 計算基本統計
    const wordCount = body.content.length
    const paragraphCount = body.content.split('\n\n').filter(p => p.trim().length > 0).length
    const sentenceCount = body.content.split(/[。！？]/).filter(s => s.trim().length > 0).length

    // 簡單的可讀性分數計算
    const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0
    const readabilityScore = Math.min(100, Math.max(0, 100 - (avgSentenceLength * 2)))

    // 調用 AI 分析（使用環境變數中的 CLASSIFIER API）
    const aiAnalysis = await analyzePortfolioWithAI(body, {
      wordCount,
      paragraphCount,
      sentenceCount,
      readabilityScore
    })

    return NextResponse.json({
      success: true,
      data: {
        ...aiAnalysis,
        wordCount,
        paragraphCount,
        sentenceCount
      },
      message: '學習歷程預覽生成成功'
    })

  } catch (error) {
    console.error('Portfolio preview POST error:', error)
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}

// 使用 AI 分析學習歷程
async function analyzePortfolioWithAI(
  portfolio: PreviewRequest,
  stats: {
    wordCount: number
    paragraphCount: number
    sentenceCount: number
    readabilityScore: number
  }
): Promise<AIAnalysis> {
  const classifierBaseUrl = process.env.CLASSIFIER_BASE_URL
  const classifierApiKey = process.env.CLASSIFIER_API_KEY
  const classifierModel = process.env.CLASSIFIER_MODEL

  if (!classifierBaseUrl || !classifierApiKey) {
    // 如果沒有設定 AI API，返回基於規則的分析
    return ruleBasedAnalysis(portfolio, stats)
  }

  try {
    const prompt = `請分析以下學習歷程文章，提供詳細的回饋建議：

標題：${portfolio.title}
內容：
${portfolio.content}

請以 JSON 格式回覆，包含以下欄位：
{
  "summary": "文章摘要（2-3句話）",
  "strengths": ["優點1", "優點2", "優點3"],
  "improvements": ["改進建議1", "改進建議2", "改進建議3"],
  "suggestions": ["具體建議1", "具體建議2", "具體建議3"],
  "qualityGrade": "A/B/C/D"
}

評分標準：
- A級：內容豐富，結構完整，表達清晰，具備深度思考
- B級：內容完整，結構基本完整，表達清楚
- C級：內容簡單，結構待加強，表達一般
- D級：內容不足，結構鬆散，需要大幅修改`

    const response = await fetch(`${classifierBaseUrl}chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${classifierApiKey}`
      },
      body: JSON.stringify({
        model: classifierModel,
        messages: [
          {
            role: 'system',
            content: '你是一位專業的教育評估專家，擅長分析學習歷程文章並提供建設性的回饋。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`)
    }

    const result = await response.json()
    const analysis = JSON.parse(result.choices[0].message.content)

    return {
      summary: analysis.summary || '內容分析完成',
      strengths: analysis.strengths || [],
      improvements: analysis.improvements || [],
      suggestions: analysis.suggestions || [],
      qualityGrade: analysis.qualityGrade || 'C',
      wordCount: stats.wordCount,
      readabilityScore: stats.readabilityScore
    }

  } catch (error) {
    console.error('AI analysis error:', error)
    // 如果 AI 調用失敗，返回基於規則的分析
    return ruleBasedAnalysis(portfolio, stats)
  }
}

// 基於規則的簡單分析（當 AI 不可用時）
function ruleBasedAnalysis(
  portfolio: PreviewRequest,
  stats: {
    wordCount: number
    paragraphCount: number
    sentenceCount: number
    readabilityScore: number
  }
): AIAnalysis {
  const { wordCount, paragraphCount, readabilityScore } = stats

  // 基於統計資料的簡單評分
  let qualityGrade: AIAnalysis['qualityGrade'] = 'C'

  if (wordCount >= 800 && paragraphCount >= 5 && readabilityScore >= 60) {
    qualityGrade = 'A'
  } else if (wordCount >= 500 && paragraphCount >= 3 && readabilityScore >= 50) {
    qualityGrade = 'B'
  } else if (wordCount < 200 || paragraphCount < 2) {
    qualityGrade = 'D'
  }

  // 生成基於規則的建議
  const suggestions: string[] = []
  const improvements: string[] = []
  const strengths: string[] = []

  if (wordCount < 300) {
    improvements.push('內容篇幅較短，可以增加更多細節描述')
    suggestions.push('建議補充更多個人經歷和反思')
  } else if (wordCount > 1500) {
    improvements.push('內容篇幅較長，考慮精簡重點')
    suggestions.push('可以刪減重複描述，突出核心訊息')
  } else {
    strengths.push('內容篇幅適中')
  }

  if (paragraphCount < 3) {
    improvements.push('段落結構可以更明確')
    suggestions.push('建議使用分段來組織不同主題')
  } else {
    strengths.push('段落結構清晰')
  }

  if (readabilityScore < 50) {
    improvements.push('句子複雜度較高，可能影響理解')
    suggestions.push('建議簡化長句，使用更直白的表達')
  } else {
    strengths.push('表達清晰易讀')
  }

  return {
    summary: `這篇學習歷程共 ${wordCount} 字，分為 ${paragraphCount} 個段落。${strengths.length > 0 ? '整體表現' + strengths.join('，') : '需要進一步改進。'}`,
    strengths,
    improvements,
    suggestions,
    qualityGrade,
    wordCount,
    readabilityScore
  }
}