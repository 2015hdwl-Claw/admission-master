// 檢查現有測試帳號
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nhkcondcwmizfsxkglqr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oa2NvbmRjd21pemZzeGtnbHFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUzMTIwOCwiZXhwIjoyMDkzMTA3MjA4fQ.nLouWINUqAMWwQC8FFjuAyHWocbgkS96dD7VbWu6xWY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExistingUsers() {
  console.log('🔍 檢查現有用戶...');

  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('❌ 查詢失敗:', error.message);
    return;
  }

  console.log(`✅ 找到 ${data.users.length} 個用戶:`);
  data.users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email} - ID: ${user.id}`);
  });

  // 嘗試登入一些常見測試帳號
  const testAccounts = [
    { email: 'test@admission-master.com', password: 'Test123456' },
    { email: 'testuser@gmail.com', password: 'Test123456' },
    { email: 'admin@test.com', password: 'Admin123456' },
    { email: 'demo@test.com', password: 'Demo123456' }
  ];

  console.log('\n🔐 測試常見測試帳號...');
  for (const account of testAccounts) {
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });

      if (!signInError && signInData.user) {
        console.log(`✅ 有效測試帳號: ${account.email} / ${account.password}`);
        console.log(`   User ID: ${signInData.user.id}`);
        console.log(`   測試網址: https://admission-master-ecru.vercel.app/login`);
        return;
      }
    } catch (e) {
      // 繼續測試下一個帳號
    }
  }

  console.log('❌ 沒有找到可用的測試帳號');
}

checkExistingUsers().catch(console.error);