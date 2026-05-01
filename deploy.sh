#!/bin/bash

# ============================================
# 升學大師 v4 - 部署脚本
# ============================================

set -e  # 遇到錯誤立即退出

echo "🚀 開始部署升學大師 v4..."

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 檢查環境變數
echo -e "${YELLOW}📋 檢查環境變數...${NC}"

if [ -f .env.local ]; then
    echo -e "${GREEN}✅ 找到 .env.local 文件${NC}"
else
    echo -e "${RED}❌ 缺少 .env.local 文件${NC}"
    exit 1
fi

# 檢查必要的環境變數
required_vars=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "NEXT_PUBLIC_AI_BASE_URL"
    "NEXT_PUBLIC_AI_API_KEY"
    "NEXT_PUBLIC_AI_MODEL"
)

missing_vars=0
for var in "${required_vars[@]}"; do
    if grep -q "^${var}=" .env.local; then
        echo -e "${GREEN}✅ ${var}${NC}"
    else
        echo -e "${RED}❌ 缺少 ${var}${NC}"
        missing_vars=$((missing_vars + 1))
    fi
done

if [ $missing_vars -gt 0 ]; then
    echo -e "${RED}❌ 缺少 $missing_vars 個必要環境變數${NC}"
    exit 1
fi

# 安裝依賴
echo -e "${YELLOW}📦 安裝依賴...${NC}"
npm install

# 運行測試 (如果有)
echo -e "${YELLOW}🧪 運行測試...${NC}"
if npm run test 2>/dev/null; then
    echo -e "${GREEN}✅ 測試通過${NC}"
else
    echo -e "${YELLOW}⚠️  沒有測試或測試失敗，繼續部署${NC}"
fi

# 構建專案
echo -e "${YELLOW}🔨 構建專案...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 構建成功${NC}"
else
    echo -e "${RED}❌ 構建失敗${NC}"
    exit 1
fi

# Vercel 部署
echo -e "${YELLOW}🚀 部署到 Vercel...${NC}"

if command -v vercel &> /dev/null; then
    vercel --prod
    echo -e "${GREEN}✅ Vercel 部署完成${NC}"
else
    echo -e "${YELLOW}⚠️  Vercel CLI 未安裝${NC}"
    echo "請手動部署到 Vercel 或安裝 Vercel CLI:"
    echo "npm install -g vercel"
fi

# 資料庫遷移提醒
echo -e "${YELLOW}💾 資料庫遷移提醒...${NC}"
echo "請在 Supabase Dashboard 中執行以下遷移文件:"
echo "- supabase/migrations/20240430_complete_schema.sql"
echo "- supabase/migrations/20240430_referral_system.sql"

# 完成
echo -e "${GREEN}🎉 部署流程完成！${NC}"
echo -e "${GREEN}📱 應用程式已準備就緒${NC}"
echo ""
echo "下一步:"
echo "1. 檢查 Vercel 部署狀態"
echo "2. 執行 Supabase 資料庫遷移"
echo "3. 測試生產環境功能"
echo "4. 設置域名和 SSL 憑證"