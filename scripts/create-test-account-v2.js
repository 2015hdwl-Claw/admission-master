// 升學大師 - 測試帳號創建腳本 v2
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nhkcondcwmizfsxkglqr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oa2NvbmRjd21pemZzeGtnbHFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUzMTIwOCwiZXhwIjoyMDkzMTA3MjA4fQ.nLouWINUqAMWwQC8FFjuAyHWocbgkS96dD7VbWu6xWY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  console.log('🧪 創建升學大師測試帳號 v2...');

  // 使用不同的時間戳確保唯一性
  const timestamp = Date.now();
  const testEmail = `test${timestamp}@gmail.com`;
  const testPassword = 'Test123456';

  const { data, error } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: {
      role: 'student'
    }
  });

  if (error) {
    console.error('❌ 創建失敗:', error.message);

    // 如果 rate limit，提供現有解決方案
    if (error.message.includes('rate limit')) {
      console.log('\n⚠️ API 達到速率限制');
      console.log('📋 立即可用的測試方案：');
      console.log('1. 手動註冊：訪問 https://admission-master-ecru.vercel.app/login');
      console.log('2. 使用任意 Email 註冊（系統會自動創建學生資料）');
      console.log('3. 密碼要求：至少 6 個字元');
      return;
    }

    return;
  }

  console.log('✅ 測試帳號創建成功！');
  console.log('📧 測試帳號資訊:');
  console.log('   Email:', testEmail);
  console.log('   Password:', testPassword);
  console.log('   User ID:', data.user.id);
  console.log('   測試網址: https://admission-master-ecru.vercel.app/login');

  // 創建學生資料
  if (data.user) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { error: profileError } = await supabase
      .from('student_profiles')
      .insert({
        user_id: data.user.id,
        group_code: '01',
        grade: 1,
        school_name: '測試高中',
        target_pathways: [],
        target_schooles: [],
        total_records: 0,
        total_bonus_percent: 0,
        partner_ids: [],
        warmth_points: 0,
        parent_ids: []
      });

    if (profileError) {
      console.error('⚠️ 建立學生資料失敗:', profileError.message);
    } else {
      console.log('✅ 學生資料建立完成');
    }
  }

  console.log('');
  console.log('🚀 現在可以使用以下資訊登入測試:');
  console.log('   📧 Email:', testEmail);
  console.log('   🔑 Password:', testPassword);
  console.log('   🔗 網址: https://admission-master-ecru.vercel.app/login');
}

createTestUser().catch(console.error);