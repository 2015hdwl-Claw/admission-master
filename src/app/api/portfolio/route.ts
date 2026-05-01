// 升學大師 v4 - 學習歷程 API
// GET /api/portfolio - 取得學生的學習歷程
// POST /api/portfolio - 建立新的學習歷程

import { createServerClientWrapper } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase/database.types'

type LearningPortfolio = Database['public']['Tables']['learning_portfolios']['Row']
type LearningPortfolioInsert = Database['public']['Tables']['learning_portfolios']['Insert']

// GET - 取得學生的學習歷程
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // 從 query parameters 取得篩選條件
    const searchParams = request.nextUrl.searchParams
    const isFinal = searchParams.get('is_final')

    // 取得當前用戶
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: '未授權的存取' },
        { status: 401 }
      )
    }

    // 透過 user_id 取得 student_profile.id
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: '找不到學生資料' },
        { status: 404 }
      )
    }

    // 建立查詢
    let query = supabase
      .from('learning_portfolios')
      .select('*')
      .filter('student_id', 'eq', (profile as any).id)
      .order('created_at', { ascending: false })

    // 依照篩選條件過濾
    if (isFinal === 'true') {
      query = query.eq('is_final', true)
    } else if (isFinal === 'false') {
      query = query.eq('is_final', false)
    }

    const { data: portfolios, error: portfoliosError } = await query

    if (portfoliosError) {
      console.error('Error fetching learning portfolios:', portfoliosError)
      return NextResponse.json(
        { error: '取得學習歷程失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: portfolios || [],
      count: portfolios?.length || 0
    })

  } catch (error) {
    console.error('Portfolio GET error:', error)
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}

// POST - 建立新的學習歷程
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

    // 透過 user_id 取得 student_profile.id
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: '找不到學生資料' },
        { status: 404 }
      )
    }

    // 取得請求內容
    const body: LearningPortfolioInsert = await request.json()

    // 驗證必填欄位
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: '缺少必填欄位：title, content' },
        { status: 400 }
      )
    }

    // 計算字數
    const wordCount = body.content.length

    // 建立學習歷程
    const portfolioData: LearningPortfolioInsert = {
      student_id: (profile as any).id,
      title: body.title,
      content: body.content,
      version: 1,
      word_count: wordCount,
      is_final: body.is_final || false
    }

    const { data: portfolio, error: portfolioError } = await supabase
      .from('learning_portfolios')
      .insert(portfolioData as any)
      .select()
      .single()

    if (portfolioError) {
      console.error('Error creating learning portfolio:', portfolioError)
      return NextResponse.json(
        { error: '建立學習歷程失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: portfolio,
      message: '學習歷程建立成功'
    }, { status: 201 })

  } catch (error) {
    console.error('Portfolio POST error:', error)
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}