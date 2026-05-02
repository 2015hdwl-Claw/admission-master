#!/bin/bash

# 商管群策略 API 手動測試腳本
# 用於驗證 scoring-algorithm.ts 整合功能

API_URL="${API_URL:-http://localhost:3000}"

echo "🎯 商管群策略 API 測試"
echo "======================================"

# 測試 1: GET 端點 - 獲取科系列表
echo -e "\n📋 測試 1: 獲取商管科系列表"
curl -s -X GET "$API_URL/api/business-strategy" | jq '.success, .data.availableDepartments[0].name'

# 測試 2: 高數學能力學生
echo -e "\n🧮 測試 2: 高數學能力學生分析"
curl -s -X POST "$API_URL/api/business-strategy" \
  -H "Content-Type: application/json" \
  -d '{
    "businessProfile": {
      "mathScore": 90,
      "logicScore": 85,
      "languageScore": 70,
      "communicationScore": 65,
      "creativityScore": 60,
      "leadershipScore": 55,
      "itScore": 50,
      "globalVisionScore": 45
    },
    "grade": "高二",
    "portfolioCount": 3
  }' | jq '.data.topRecommendation'

# 測試 3: 高語文能力學生
echo -e "\n📚 測試 3: 高語文能力學生分析"
curl -s -X POST "$API_URL/api/business-strategy" \
  -H "Content-Type: application/json" \
  -d '{
    "businessProfile": {
      "mathScore": 60,
      "logicScore": 65,
      "languageScore": 90,
      "communicationScore": 85,
      "creativityScore": 75,
      "leadershipScore": 70,
      "itScore": 55,
      "globalVisionScore": 80
    },
    "grade": "高二",
    "portfolioCount": 4
  }' | jq '.data.topRecommendation'

# 測試 4: 均衡能力學生
echo -e "\n⚖️ 測試 4: 均衡能力學生分析"
curl -s -X POST "$API_URL/api/business-strategy" \
  -H "Content-Type: application/json" \
  -d '{
    "businessProfile": {
      "mathScore": 75,
      "logicScore": 75,
      "languageScore": 75,
      "communicationScore": 75,
      "creativityScore": 75,
      "leadershipScore": 75,
      "itScore": 75,
      "globalVisionScore": 75
    },
    "grade": "高二",
    "portfolioCount": 5
  }' | jq '.data.topRecommendation, .data.riskAssessment'

# 測試 5: 低分數學學生
echo -e "\n⚠️ 測試 5: 低分數學學生風險評估"
curl -s -X POST "$API_URL/api/business-strategy" \
  -H "Content-Type: application/json" \
  -d '{
    "businessProfile": {
      "mathScore": 40,
      "logicScore": 45,
      "languageScore": 70,
      "communicationScore": 65,
      "creativityScore": 60,
      "leadershipScore": 55,
      "itScore": 50,
      "globalVisionScore": 45
    },
    "grade": "高二",
    "portfolioCount": 2
  }' | jq '.data.summary'

# 測試 6: 錯誤處理 - 無效分數
echo -e "\n🚫 測試 6: 錯誤處理（無效分數）"
curl -s -X POST "$API_URL/api/business-strategy" \
  -H "Content-Type: application/json" \
  -d '{
    "businessProfile": {
      "mathScore": 150,
      "logicScore": 85,
      "languageScore": 75,
      "communicationScore": 70,
      "creativityScore": 65,
      "leadershipScore": 60,
      "itScore": 55,
      "globalVisionScore": 50
    },
    "grade": "高二",
    "portfolioCount": 3
  }' | jq '.success, .error'

# 測試 7: 錯誤處理 - 缺少資料
echo -e "\n🚫 測試 7: 錯誤處理（缺少商管資料）"
curl -s -X POST "$API_URL/api/business-strategy" \
  -H "Content-Type: application/json" \
  -d '{
    "grade": "高二",
    "portfolioCount": 3
  }' | jq '.success, .error'

echo -e "\n✅ 測試完成！"
echo "======================================"
