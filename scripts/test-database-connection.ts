// 升學大師 v5 - 資料庫連線測試
// 測試 Supabase 資料庫連線和基本操作

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// 載入環境變數
function loadEnvFile() {
  try {
    const envPath = join(process.cwd(), '.env.production')
    const envContent = readFileSync(envPath, 'utf-8')

    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      const value = valueParts.join('=').trim()
      if (key && value && !key.startsWith('#')) {
        process.env[key.trim()] = value
      }
    })
  } catch (error) {
    console.log('⚠️ 無法載入 .env.production，使用現有環境變數')
  }
}

// 載入環境變數
loadEnvFile()

// 從環境變數獲取配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 建立客戶端
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDatabaseConnection() {
  console.log('🔍 開始測試 Supabase 資料庫連線...\n')

  const results = {
    connection: false,
    tables: {},
    queries: [],
    errors: []
  }

  try {
    // 1. 測試基本連線
    console.log('📡 測試資料庫連線...')
    console.log(`  URL: ${supabaseUrl}`)

    // 先試試簡單查詢來測試連線
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .limit(1)

    if (error) {
      if (error.code === 'PGRST116') {
        // PGRST116 = 沒有資料，這是正常的，表示連線成功
        console.log('✅ 資料庫連線成功 (無資料，正常狀態)\n')
      } else if (error.message.includes('API key')) {
        console.log('❌ API Key 錯誤，檢查環境變數\n')
        console.log('🔑 當前 Anon Key 長度:', supabaseAnonKey.length)
        console.log('🔑 正確的 Anon Key 格式應類似: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
        throw new Error(`API Key 錯誤: ${error.message}`)
      } else {
        console.log(`⚠️ 連線錯誤: ${error.message}\n`)
        throw error
      }
    } else {
      console.log('✅ 資料庫連線成功 (有資料)\n')
    }

    results.connection = true

    // 2. 測試所有資料表是否可訪問
    const tables = [
      'student_profiles',
      'ability_records',
      'learning_portfolios',
      'parent_profiles',
      'parent_reports',
      'parent_invites',
      'referral_codes',
      'referral_tracking',
      'share_analytics',
      'referrals',
      'share_tracking',
      'school_leaderboard'
    ]

    console.log('📊 測試資料表訪問...')
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)

        if (error && error.code !== 'PGRST116') { // 忽略 "沒有資料" 錯誤
          results.tables[table] = `❌ Error: ${error.message}`
          console.log(`  ❌ ${table}: ${error.message}`)
        } else {
          results.tables[table] = '✅ OK'
          console.log(`  ✅ ${table}`)
        }
      } catch (e: any) {
        results.tables[table] = `❌ Error: ${e.message}`
        console.log(`  ❌ ${table}: ${e.message}`)
      }
    }

    // 3. 測試資料庫函數
    console.log('\n🔧 測試資料庫函數...')
    try {
      // 測試生成邀請碼函數
      const { data: inviteCode, error: inviteError } = await supabase
        .rpc('generate_invite_code')

      if (inviteError) {
        console.log(`  ⚠️ generate_invite_code: ${inviteError.message} (可能需要權限)`)
      } else {
        console.log(`  ✅ generate_invite_code: ${inviteCode}`)
      }
    } catch (e: any) {
      console.log(`  ⚠️ generate_invite_code: ${e.message} (可能需要權限)`)
    }

    // 4. 測試 RLS 政策
    console.log('\n🔒 測試 RLS 政策...')
    try {
      // 嘗試插入測試資料（應該失敗，因為沒有用戶認證）
      const { data: insertData, error: insertError } = await supabase
        .from('student_profiles')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // 測試 UUID
          group_code: '01',
          grade: 1
        })
        .select()

      if (insertError) {
        console.log(`  ✅ RLS 保護正常: ${insertError.message}`)
      } else {
        console.log(`  ⚠️ RLS 可能未啟用: 插入成功`)
      }
    } catch (e: any) {
      console.log(`  ✅ RLS 保護正常: ${e.message}`)
    }

    // 5. 測試環境變數
    console.log('\n🔑 環境變數檢查...')
    console.log(`  Supabase URL: ${supabaseUrl ? '✅ 已設置' : '❌ 未設置'}`)
    console.log(`  Supabase Anon Key: ${supabaseAnonKey ? '✅ 已設置' : '❌ 未設置'}`)

    // 總結
    console.log('\n📊 測試結果總結:')
    console.log(`  連線狀態: ${results.connection ? '✅ 成功' : '❌ 失敗'}`)
    console.log(`  資料表數量: ${Object.keys(results.tables).length}/12`)
    console.log(`  成功資料表: ${Object.values(results.tables).filter(r => r === '✅ OK').length}/12`)

    if (Object.values(results.tables).filter(r => r === '✅ OK').length === tables.length) {
      console.log('\n🎉 所有資料庫測試通過！')
    } else {
      console.log('\n⚠️ 部分測試未通過，請檢查上述錯誤')
    }

  } catch (error: any) {
    console.error('\n❌ 資料庫測試失敗:', error.message)
    results.errors.push(error.message)
  }

  return results
}

// 執行測試
async function main() {
  try {
    const results = await testDatabaseConnection()
    process.exit(results.connection ? 0 : 1)
  } catch (error: any) {
    console.error('❌ 測試執行失敗:', error.message)
    process.exit(1)
  }
}

main()