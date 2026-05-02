/**
 * AI API 連接測試腳本
 * 用於測試修復後的 API 是否能正確處理 socket closure 錯誤
 */

// 讀取 .env.local 檔案
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        const value = valueParts.join('=').trim();
        if (key && value) {
          process.env[key] = value;
        }
      }
    });
  }
}

loadEnv();

const testCases = [
  {
    name: '正常 API 呼叫',
    timeout: 8000,
    shouldSucceed: true
  },
  {
    name: '超時測試 (模擬 Vercel 限制)',
    timeout: 12000,
    shouldSucceed: false
  },
  {
    name: '極短 timeout 測試',
    timeout: 1000,
    shouldSucceed: false
  }
];

async function testAIConnection() {
  console.log('🧪 開始測試 AI API 連接...\n');

  const AI_API_BASE = process.env.NEXT_PUBLIC_AI_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4/';
  const AI_API_KEY = process.env.NEXT_PUBLIC_AI_API_KEY || '';
  const AI_MODEL = process.env.NEXT_PUBLIC_AI_MODEL || 'glm-4.7-flash';

  if (!AI_API_KEY) {
    console.error('❌ 未設定 AI_API_KEY 環境變數');
    return;
  }

  let passedTests = 0;
  let failedTests = 0;

  for (const testCase of testCases) {
    console.log(`📋 測試: ${testCase.name}`);
    console.log(`   Timeout: ${testCase.timeout}ms`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), testCase.timeout);

      const startTime = Date.now();
      const response = await fetch(`${AI_API_BASE}chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            { role: 'system', content: '你是一個測試助理' },
            { role: 'user', content: '請用 JSON 格式回應: {"status": "ok"}' }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (content) {
          console.log(`   ✅ 成功 (${responseTime}ms)`);
          console.log(`   回應: ${content.substring(0, 50)}...`);

          if (testCase.shouldSucceed) {
            passedTests++;
          } else {
            console.log(`   ⚠️ 預期失敗但成功了`);
            failedTests++;
          }
        } else {
          console.log(`   ❌ 空回應`);
          if (!testCase.shouldSucceed) {
            passedTests++;
          } else {
            failedTests++;
          }
        }
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.log(`   ❌ HTTP ${response.status}: ${errorText.substring(0, 100)}`);

        if (!testCase.shouldSucceed) {
          passedTests++;
        } else {
          failedTests++;
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.log(`   ❌ 錯誤: ${errorMsg}`);

      if (!testCase.shouldSucceed) {
        passedTests++;
      } else {
        failedTests++;
      }
    }

    console.log('');
  }

  console.log('📊 測試結果摘要:');
  console.log(`   通過: ${passedTests}/${testCases.length}`);
  console.log(`   失敗: ${failedTests}/${testCases.length}`);

  if (failedTests === 0) {
    console.log('\n🎉 所有測試通過！');
  } else {
    console.log('\n⚠️ 有測試失敗，請檢查配置');
  }
}

// 執行測試
testAIConnection().catch(console.error);
