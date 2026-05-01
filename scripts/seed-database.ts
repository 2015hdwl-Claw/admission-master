// 升學大師 v4 - 種子資料執行腳本
// 用於初始化 Supabase 資料庫

import { createClient } from '@supabase/supabase-js'
import { groupKnowledgeSeed } from '../data/seed/group-knowledge'
import { externalCompetitionsSeed } from '../data/seed/external-competitions'

// 確保環境變數存在
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// 使用 Service Role Key 建立客戶端（繞過 RLS）
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  console.log('🌱 開始執行種子資料腳本...\n')

  try {
    // 1. 插入 group_knowledge 資料
    console.log('📚 正在插入 20 個類群知識庫資料...')

    const { data: existingGroups, error: fetchError } = await supabase
      .from('group_knowledge')
      .select('group_code')

    if (fetchError) {
      console.error('❌ 檢查現有類群資料時發生錯誤:', fetchError)
      throw fetchError
    }

    const existingGroupCodes = existingGroups?.map(g => g.group_code) || []
    const newGroups = groupKnowledgeSeed.filter(g => !existingGroupCodes.includes(g.group_code))

    if (newGroups.length > 0) {
      const { data: groupsData, error: groupsError } = await supabase
        .from('group_knowledge')
        .insert(newGroups)
        .select()

      if (groupsError) {
        console.error('❌ 插入類群知識庫資料時發生錯誤:', groupsError)
        throw groupsError
      }

      console.log(`✅ 成功插入 ${newGroups.length} 個類群知識庫資料`)
    } else {
      console.log('ℹ️  類群知識庫資料已存在，跳過插入')
    }

    // 2. 插入 external_competitions 資料
    console.log('\n🏆 正在插入外部競賽資料...')

    const { data: existingCompetitions, error: fetchCompetitionsError } = await supabase
      .from('external_competitions')
      .select('name')

    if (fetchCompetitionsError) {
      console.error('❌ 檢查現有競賽資料時發生錯誤:', fetchCompetitionsError)
      throw fetchCompetitionsError
    }

    const existingCompetitionNames = existingCompetitions?.map(c => c.name) || []
    const newCompetitions = externalCompetitionsSeed.filter(c => !existingCompetitionNames.includes(c.name))

    if (newCompetitions.length > 0) {
      const { data: competitionsData, error: competitionsError } = await supabase
        .from('external_competitions')
        .insert(newCompetitions)
        .select()

      if (competitionsError) {
        console.error('❌ 插入外部競賽資料時發生錯誤:', competitionsError)
        throw competitionsError
      }

      console.log(`✅ 成功插入 ${newCompetitions.length} 個外部競賽資料`)
    } else {
      console.log('ℹ️  外部競賽資料已存在，跳過插入')
    }

    // 3. 顯示統計資訊
    console.log('\n📊 種子資料統計:')
    console.log(`   - 類群知識庫: ${existingGroupCodes.length + (newGroups.length || 0)} / 20`)
    console.log(`   - 外部競賽: ${existingCompetitionNames.length + (newCompetitions.length || 0)} 項`)

    console.log('\n🎉 種子資料腳本執行完成！')

  } catch (error) {
    console.error('\n❌ 種子資料腳本執行失敗:', error)
    process.exit(1)
  }
}

// 執行腳本
main()