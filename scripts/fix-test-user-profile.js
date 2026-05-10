// 修復測試用戶的學生資料
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nhkcondcwmizfsxkglqr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oa2NvbmRjd21pemZzeGtnbHFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUzMTIwOCwiZXhwIjoyMDkzMTA3MjA4fQ.nLouWINUqAMWwQC8FFjuAyHWocbgkS96dD7VbWu6xWY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUserProfile() {
  console.log('🔧 修復測試用戶學生資料...');

  const testUserId = '2c7862ba-865a-4fff-8191-c689e5783bd6'; // 剛創建的測試用戶 ID

  // 先嘗試查詢現有資料
  const { data: existingData, error: queryError } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', testUserId);

  if (queryError) {
    console.log('📋 查詢錯誤 (可能是欄位名稱問題):', queryError.message);
  } else {
    console.log('✅ 現有資料查詢成功:', existingData);
  }

  // 嘗試多種可能的欄位組合來創建學生資料
  const profileVariants = [
    // 版本 1: 使用可能的正確欄位名
    {
      user_id: testUserId,
      grade: 1,
      school_name: '測試高中'
    },
    // 版本 2: 最基本欄位
    {
      user_id: testUserId,
      grade: 1
    },
    // 版本 3: 完整欄位 (使用正確的拼字)
    {
      user_id: testUserId,
      grade: 1,
      school_name: '測試高中',
      target_pathways: [],
      target_schools: [], // 使用正確拼字
      total_records: 0,
      total_bonus_points: 0,
      partner_ids: [],
      points: 0
    }
  ];

  for (let i = 0; i < profileVariants.length; i++) {
    console.log(`\n🔄 嘗試版本 ${i + 1}...`);

    const { data, error } = await supabase
      .from('student_profiles')
      .insert(profileVariants[i])
      .select();

    if (!error) {
      console.log(`✅ 版本 ${i + 1} 成功!`);
      console.log('學生資料 ID:', data[0]?.id);
      console.log('創建的資料:', data[0]);
      return;
    } else {
      console.log(`❌ 版本 ${i + 1} 失敗:`, error.message);
    }
  }

  console.log('\n⚠️ 所有版本都失敗，可能需要檢查資料庫結構或權限');
}

fixUserProfile().catch(console.error);