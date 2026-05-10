// 使用正確的欄位創建學生資料
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nhkcondcwmizfsxkglqr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oa2NvbmRjd21pemZzeGtnbHFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUzMTIwOCwiZXhwIjoyMDkzMTA3MjA4fQ.nLouWINUqAMWwQC8FFjuAyHWocbgkS96dD7VbWu6xWY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createCorrectProfile() {
  console.log('🔧 使用正確欄位創建學生資料...');

  const testUserId = '2c7862ba-865a-4fff-8191-c689e5783bd6';

  // 使用包含 group_code 的正確資料
  const profileData = {
    user_id: testUserId,
    group_code: '01',  // 這是必填欄位
    grade: 1,
    school_name: '測試高中',
    target_pathways: [],
    target_schools: [],  // 使用正確拼字
    total_records: 0,
    total_bonus_points: 0,  // 修正欄位名稱
    partner_ids: [],
    warmth_points: 0,
    parent_ids: []
  };

  const { data, error } = await supabase
    .from('student_profiles')
    .insert(profileData)
    .select();

  if (error) {
    console.error('❌ 創建失敗:', error.message);
    console.log('錯誤詳情:', error);

    // 嘗試最小化版本
    console.log('\n🔄 嘗試最小化版本...');
    const minimalProfile = {
      user_id: testUserId,
      group_code: '01',
      grade: 1
    };

    const { data: minData, error: minError } = await supabase
      .from('student_profiles')
      .insert(minimalProfile)
      .select();

    if (minError) {
      console.error('❌ 最小化版本也失敗:', minError.message);
    } else {
      console.log('✅ 最小化版本成功!');
      console.log('創建的資料:', minData[0]);
    }
  } else {
    console.log('✅ 學生資料創建成功!');
    console.log('資料 ID:', data[0]?.id);
    console.log('完整資料:', data[0]);
    console.log('\n🚀 測試帳號現已完全可用！');
  }
}

createCorrectProfile().catch(console.error);