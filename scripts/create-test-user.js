// 升學大師 - 測試帳號創建腳本
// 使用方式：node scripts/create-test-user.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nhkcondcwmizfsxkglqr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oa2NvbmRjd21pemZzeGtnbHFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUzMTIwOCwiZXhwIjoyMDkzMTA3MjA4fQ.nLouWINUqAMWwQC8FFjuAyHWocbgkS96dD7VbWu6xWY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  console.log('🧪 創建升學大師測試帳號...');

  // 嘗試註冊測試帳號
  const { data, error } = await supabase.auth.signUp({
    email: 'testuser@gmail.com',
    password: 'Test123456',
    options: {
      data: {
        role: 'student'
      }
    }
  });

  if (error) {
    console.error('❌ 創建失敗:', error.message);

    // 如果是帳號已存在，嘗試登入
    if (error.message.includes('already') || error.message.includes('already registered')) {
      console.log('📧 帳號已存在，嘗試登入...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'testuser@gmail.com',
        password: 'Test123456'
      });

      if (signInError) {
        console.error('❌ 登入失敗:', signInError.message);
        return;
      }

      console.log('✅ 測試帳號登入成功！');
      console.log('📧 測試帳號資訊:');
      console.log('   Email: testuser@gmail.com');
      console.log('   Password: Test123456');
      console.log('   測試網址: https://admission-master-ecru.vercel.app/login');
      return;
    }

    return;
  }

  console.log('✅ 測試帳號創建成功！');
  console.log('📧 測試帳號資訊:');
  console.log('   Email: testuser@gmail.com');
  console.log('   Password: Test123456');
  console.log('   User ID:', data.user.id);
  console.log('   測試網址: https://admission-master-ecru.vercel.app/login');

  // 創建學生資料
  if (data.user) {
    await new Promise(resolve => setTimeout(resolve, 1000));

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
  console.log('   📧 Email: testuser@gmail.com');
  console.log('   🔑 Password: Test123456');
  console.log('   🔗 網址: https://admission-master-ecru.vercel.app/login');
}

createTestUser().catch(console.error);