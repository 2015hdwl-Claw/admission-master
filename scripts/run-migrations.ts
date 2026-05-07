// 升學大師 v5 - 資料庫遷移執行腳本
// 用於執行 Supabase SQL 遷移檔案

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// 確保環境變數存在
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// 使用 Service Role Key 建立客戶端（繞過 RLS）
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executeSQL(sql: string, description: string) {
  console.log(`🔄 ${description}...`)

  try {
    // 使用 Supabase RPC 來執行原始 SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      throw error
    }

    console.log(`✅ ${description}完成`)
    return { success: true, data }
  } catch (error) {
    console.error(`❌ ${description}失敗:`, error)

    // 如果 RPC 方法失敗，我們提供手動執行的指示
    console.log(`📋 請手動在 Supabase SQL Editor 中執行以下 SQL:`)
    console.log('---')
    console.log(sql)
    console.log('---')

    return { success: false, error }
  }
}

async function main() {
  console.log('🚀 開始執行資料庫遷移...\n')

  try {
    // 1. 執行完整 Schema (一次性執行版本)
    console.log('📋 執行完整資料庫 Schema...')
    const schemaPath = join(process.cwd(), 'supabase', 'deploy_complete_schema.sql')
    const schemaSQL = readFileSync(schemaPath, 'utf-8')

    const schemaResult = await executeSQL(schemaSQL, '完整 Schema')

    if (!schemaResult.success) {
      console.log('⚠️ 完整 Schema 需要手動執行，請按照上面的指示操作')
    }

    // 3. 驗證資料表是否建立成功
    console.log('\n🔍 驗證資料表...')
    const tables = [
      'student_profiles',
      'ability_records',
      'learning_portfolios',
      'parent_profiles',
      'parent_reports',
      'parent_invites',
      'referral_codes',
      'referral_tracking'
    ]

    let tableCount = 0
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)

        if (!error) {
          console.log(`✅ ${table} 資料表存在`)
          tableCount++
        }
      } catch (e) {
        console.log(`❌ ${table} 資料表不存在或無權限`)
      }
    }

    console.log(`\n📊 資料表狀態: ${tableCount}/${tables.length} 個資料表已建立`)

    if (tableCount === tables.length) {
      console.log('\n🎉 所有資料庫遷移執行完成！')
    } else {
      console.log('\n⚠️ 部分資料表可能需要手動建立')
      console.log('📋 請檢查 Supabase Dashboard 中的資料庫狀態')
    }

  } catch (error) {
    console.error('\n❌ 資料庫遷移執行失敗:', error)
    process.exit(1)
  }
}

// 執行腳本
main()