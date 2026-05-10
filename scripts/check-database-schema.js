// 檢查資料庫表結構
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nhkcondcwmizfsxkglqr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oa2NvbmRjd21pemZzeGtnbHFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUzMTIwOCwiZXhwIjoyMDkzMTA3MjA4fQ.nLouWINUqAMWwQC8FFjuAyHWocbgkS96dD7VbWu6xWY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 檢查 student_profiles 表結構...');

  // 查詢表結構
  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ 查詢失敗:', error.message);
    console.log('錯誤詳情:', error);
    return;
  }

  console.log('✅ 表結構查詢成功');
  if (data && data.length > 0) {
    console.log('現有資料欄位:', Object.keys(data[0]));
  } else {
    console.log('表中沒有資料，查詢空結構...');
    // 嘗試插入一條測試資料來看欄位
    const { data: insertData, error: insertError } = await supabase
      .from('student_profiles')
      .select('*')
      .limit(0);

    if (!insertError) {
      console.log('可以查詢表，但沒有資料');
    }
  }
}

checkSchema().catch(console.error);