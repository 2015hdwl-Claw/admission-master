// 執行角色管理系統資料庫遷移
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nhkcondcwmizfsxkglqr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oa2NvbmRjd21pemZzeGtnbHFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUzMTIwOCwiZXhwIjoyMDkzMTA3MjA4fQ.nLouWINUqAMWwQC8FFjuAyHWocbgkS96dD7VbWu6xWY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyRoleMigration() {
  console.log('🚀 開始執行角色管理系統資料庫遷移...');

  try {
    // 讀取 migration SQL 檔案
    const fs = require('fs');
    const path = require('path');
    const migrationPath = path.join(__dirname, '../supabase/migrations/20260510_add_role_management.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration SQL 檔案已讀取');

    // 分割 SQL 成多個語句執行 (PostgreSQL 不支援一次執行多個語句)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`🔍 發現 ${statements.length} 個 SQL 語句需要執行`);

    let successCount = 0;
    let errorCount = 0;

    // 逐個執行語句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // 跳過純註釋語句
      if (statement.startsWith('--') || statement.startsWith('/*')) {
        continue;
      }

      try {
        // 使用 Supabase RPC 執行 SQL
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_statement: statement
        });

        if (error) {
          // 某些語句可能會有預期的錯誤 (如 IF NOT EXISTS)
          if (error.message.includes('already exists')) {
            console.log(`✅ 語句 ${i + 1}/${statements.length}: 已存在 (跳過)`);
            successCount++;
          } else {
            console.log(`⚠️ 語句 ${i + 1}/${statements.length}: ${error.message}`);
            errorCount++;
          }
        } else {
          console.log(`✅ 語句 ${i + 1}/${statements.length}: 執行成功`);
          successCount++;
        }
      } catch (err) {
        console.log(`❌ 語句 ${i + 1}/${statements.length}: 執行失敗 - ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\n📊 執行結果統計:`);
    console.log(`   ✅ 成功: ${successCount} 個語句`);
    console.log(`   ⚠️ 錯誤/跳過: ${errorCount} 個語句`);

    // 驗證遷移結果
    console.log(`\n🔍 驗證遷移結果...`);

    // 檢查新表是否創建成功
    const tables = [
      'user_roles',
      'role_evolution',
      'role_achievements',
      'xp_history'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ 表 ${table} 創建失敗: ${error.message}`);
        } else {
          console.log(`✅ 表 ${table} 創建成功`);
        }
      } catch (err) {
        console.log(`❌ 表 ${table} 驗證失敗: ${err.message}`);
      }
    }

    // 檢查現有用戶是否初始化了角色
    console.log(`\n👥 檢查現有用戶角色初始化...`);
    const { data: users, error: userError } = await supabase
      .from('user_roles')
      .select('user_id, current_role, level, experience_points');

    if (userError) {
      console.log(`❌ 無法查詢用戶角色: ${userError.message}`);
    } else {
      console.log(`✅ 找到 ${users.length} 個用戶角色記錄`);

      if (users.length > 0) {
        console.log(`📊 角色分佈統計:`);

        const roleStats = {
          explorer: 0,
          pathfinder: 0,
          architect: 0,
          catalyst: 0,
          trailblazer: 0
        };

        users.forEach(user => {
          roleStats[user.current_role] = (roleStats[user.current_role] || 0) + 1;
        });

        Object.entries(roleStats).forEach(([role, count]) => {
          if (count > 0) {
            console.log(`   ${role}: ${count} 人`);
          }
        });
      }
    }

    console.log(`\n🎉 角色管理系統資料庫遷移完成！`);

  } catch (error) {
    console.error('❌ 遷移執行失敗:', error.message);
    console.error('詳細錯誤:', error);

    // 提供手動執行建議
    console.log(`\n📋 如果自動執行失敗，請手動執行以下步驟:`);
    console.log(`1. 在 Supabase Dashboard 中執行 SQL:`);
    console.log(`2. 粘貼 supabase/migrations/20260510_add_role_management.sql 的內容`);
    console.log(`3. 執行並檢查結果`);
  }
}

// 執行遷移
applyRoleMigration().catch(console.error);