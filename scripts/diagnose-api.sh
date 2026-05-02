#!/bin/bash
# API 錯誤診斷腳本

echo "🔍 Admission Master API 診斷工具"
echo "=================================="
echo ""

# 檢查環境變數
echo "📋 檢查環境變數..."
if [ -f .env.local ]; then
    echo "✅ .env.local 檔案存在"

    # 檢查關鍵變數
    if grep -q "NEXT_PUBLIC_AI_API_KEY=" .env.local; then
        echo "✅ AI_API_KEY 已設定"
    else
        echo "❌ AI_API_KEY 未設定"
    fi

    if grep -q "NEXT_PUBLIC_SUPABASE_URL=" .env.local; then
        echo "✅ SUPABASE_URL 已設定"
    else
        echo "❌ SUPABASE_URL 未設定"
    fi
else
    echo "❌ .env.local 檔案不存在"
fi

echo ""

# 檢查關鍵檔案
echo "📁 檢查關鍵檔案..."
FILES=(
    "src/lib/ai-helper.ts"
    "src/app/api/review/route.ts"
    "src/app/api/ability-analysis/route.ts"
    "next.config.ts"
    "vercel.json"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (遺失)"
    fi
done

echo ""

# 檢查 timeout 設定
echo "⏱️ 檀查 timeout 設定..."
if grep -q "REQUEST_TIMEOUT_MS = 8000" src/lib/ai-helper.ts; then
    echo "✅ AI timeout 已優化為 8000ms"
else
    echo "⚠️ AI timeout 可能需要調整"
fi

if grep -q "MAX_RETRIES = 2" src/lib/ai-helper.ts; then
    echo "✅ 重試次數已增加為 2 次"
else
    echo "⚠️ 重試次數可能需要調整"
fi

echo ""

# 檢查錯誤處理
echo "🛡️ 檢查錯誤處理機制..."
if grep -q "socket.*connection.*ECONNRESET" src/lib/ai-helper.ts; then
    echo "✅ 已加入 socket closure 錯誤處理"
else
    echo "❌ 缺少 socket closure 錯誤處理"
fi

if grep -q "Graceful.*Degradation" src/app/api/review/route.ts || grep -q "ruleBasedReview" src/app/api/review/route.ts; then
    echo "✅ Review API 已有 fallback 機制"
else
    echo "⚠️ Review API 可能缺少 fallback 機制"
fi

echo ""

# 檢查 Vercel 配置
echo "🚀 檢查 Vercel 配置..."
if [ -f vercel.json ]; then
    if grep -q "hkg1" vercel.json; then
        echo "✅ 部署區域: 香江 (hkg1)"
    else
        echo "⚠️ 部署區域可能需要調整"
    fi
else
    echo "❌ vercel.json 不存在"
fi

echo ""
echo "🔧 建議修復步驟:"
echo "1. 確認所有環境變數正確設定"
echo "2. 執行 npm install 確保依賴完整"
echo "3. 執行 npm run build 測試建置"
echo "4. 執行 node scripts/test-ai-api.js 測試 API 連接"
echo "5. 如果持續出現錯誤，考慮切換到其他 API 端點"
echo ""

echo "💡 如需更多診斷資訊，請檢查:"
echo "- Vercel 部署日誌"
echo "- 瀏覽器開發者工具 Console"
echo "- Supabase 日誌 (如果使用 Edge Functions)"
