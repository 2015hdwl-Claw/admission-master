// 升學大師 v4 - 遷移腳本
// 將 localStorage 中的資料遷移到 Supabase
// 使用方式：npm run migrate

import { createClient } from '@supabase/supabase-js'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

interface LocalAbilityRecord {
  id: string
  category: string
  title: string
  description?: string
  occurred_date?: string
  semester?: string
  portfolio_code?: string
  scoring_value?: any
  process_description?: string
  reflection?: string
  evidence_url?: string
  cert_level?: string
  cert_number?: string
  competition_level?: string
  competition_award?: string
  capstone_type?: string
  capstone_duration?: string
  tags: string[]
  verified: boolean
  created_at: string
  updated_at: string
}

interface LocalLearningPortfolio {
  id: string
  title: string
  content: string
  version: number
  word_count?: number
  ai_suggestions?: string[]
  quality_grade?: string
  is_final: boolean
  created_at: string
  updated_at: string
}

interface LocalStudentProfile {
  id: string
  user_id: string
  group_code: string
  grade: number
  school_name?: string
  target_pathways: string[]
  target_schooles: any[]
  total_records: number
  total_bonus_percent: number
  partner_ids: string[]
  warmth_points: number
  parent_ids: string[]
  created_at: string
  updated_at: string
}

// 確保環境變數存在
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// 使用 Service Role Key 建立客戶端（繞過 RLS）
const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)

async function migrate() {
  console.log('🚀 開始遷移 localStorage 資料到 Supabase...\n')

  try {
    // 1. 取得當前用戶（需要先登入）
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error('請先登入才能進行遷移。請在瀏覽器中執行此腳本。')
    }

    console.log(`👤 當前用戶：${user.email}`)

    // 2. 檢查是否已有學生資料
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      throw profileCheckError
    }

    if (existingProfile) {
      console.log('⚠️  發現現有學生資料，跳過建立學生資料')
    } else {
      // 3. 從 localStorage 讀取學生資料（需要在瀏覽器環境中執行）
      console.log('📖 從 localStorage 讀取資料...')
      console.log('⚠️  此腳本需要在瀏覽器控制台中執行')
      console.log('📝 請將以下程式碼複製到瀏覽器開發者工具控制台中執行：')

      const browserScript = `
// 升學大師 v4 - 瀏覽器端遷移腳本
// 請在已登入的狀態下執行

(async function() {
  try {
    // 讀取 localStorage 資料
    const localProfile = localStorage.getItem('admission_master_profile')
    const localAbilityRecords = localStorage.getItem('admission_master_ability_records')
    const localPortfolios = localStorage.getItem('admission_master_portfolios')

    if (!localProfile) {
      alert('找不到 localStorage 中的學生資料')
      return
    }

    const profile = JSON.parse(localProfile)
    const abilityRecords = localAbilityRecords ? JSON.parse(localAbilityRecords) : []
    const portfolios = localPortfolios ? JSON.parse(localPortfolios) : []

    console.log('找到以下資料：')
    console.log('- 學生資料：1 筆')
    console.log('- 能力記錄：', abilityRecords.length, '筆')
    console.log('- 學習歷程：', portfolios.length, '筆')

    // 發送到後端 API
    const response = await fetch('/api/migrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profile,
        abilityRecords,
        portfolios
      })
    })

    const result = await response.json()

    if (result.success) {
      alert('遷移成功！共遷移 ' + result.migratedRecords + ' 筆能力記錄和 ' + result.migratedPortfolios + ' 筆學習歷程')
      console.log('遷移結果：', result)
    } else {
      alert('遷移失敗：' + result.error)
    }

  } catch (error) {
    console.error('遷移錯誤：', error)
    alert('遷移失敗：' + error.message)
  }
})()
`

      console.log('\n' + '='.repeat(60))
      console.log(browserScript)
      console.log('='.repeat(60))

      return
    }

    // 如果需要直接在 Node.js 環境中執行（需要提供模擬的 localStorage 資料）
    console.log('\n📝 如果要在 Node.js 環境中執行，請提供 localStorage 資料檔案：')
    console.log('   node scripts/migrate-localstorage.js < local-data.json')

  } catch (error) {
    console.error('❌ 遷移失敗:', error)
    process.exit(1)
  }
}

// 處理命令列參數（如果有提供 JSON 檔案）
const args = process.argv.slice(2)
if (args.length > 0 && args[0] !== 'migrate') {
  console.log('📄 讀取本地資料檔案...')

  try {
    // 從 stdin 讀取 JSON 資料
    let inputData = ''
    for await (const chunk of process.stdin) {
      inputData += chunk
    }

    if (!inputData.trim()) {
      throw new Error('沒有提供輸入資料')
    }

    const data = JSON.parse(inputData)
    console.log('✅ 讀取資料成功')
    console.log('   - 學生資料：', data.profile ? '1 筆' : '無')
    console.log('   - 能力記錄：', data.abilityRecords?.length || 0, '筆')
    console.log('   - 學習歷程：', data.portfolios?.length || 0, '筆')

    // 這裡可以添加實際的遷移邏輯
    // 但需要先確保用戶已經登入

  } catch (error) {
    console.error('❌ 讀取資料檔案失敗:', error)
    process.exit(1)
  }
} else {
  // 預設執行遷移
  migrate()
}