# 商管群策略 API 手動測試腳本 (PowerShell)
# 用於驗證 scoring-algorithm.ts 整合功能

$API_URL = if ($env:API_URL) { $env:API_URL } else { "http://localhost:3000" }

Write-Host "🎯 商管群策略 API 測試" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# 測試 1: GET 端點 - 獲取科系列表
Write-Host "`n📋 測試 1: 獲取商管科系列表" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/business-strategy" -Method Get
    Write-Host "✅ 成功: $($response.data.availableDepartments[0].name)" -ForegroundColor Green
    Write-Host "可用科系數量: $($response.data.availableDepartments.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ 失敗: $_" -ForegroundColor Red
}

# 測試 2: 高數學能力學生
Write-Host "`n🧮 測試 2: 高數學能力學生分析" -ForegroundColor Green
try {
    $body = @{
        businessProfile = @{
            mathScore = 90
            logicScore = 85
            languageScore = 70
            communicationScore = 65
            creativityScore = 60
            leadershipScore = 55
            itScore = 50
            globalVisionScore = 45
        }
        grade = "高二"
        portfolioCount = 3
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$API_URL/api/business-strategy" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ 推薦: $($response.data.topRecommendation.department) (匹配度: $($response.data.topRecommendation.matchScore)%)" -ForegroundColor Green
} catch {
    Write-Host "❌ 失敗: $_" -ForegroundColor Red
}

# 測試 3: 高語文能力學生
Write-Host "`n📚 測試 3: 高語文能力學生分析" -ForegroundColor Green
try {
    $body = @{
        businessProfile = @{
            mathScore = 60
            logicScore = 65
            languageScore = 90
            communicationScore = 85
            creativityScore = 75
            leadershipScore = 70
            itScore = 55
            globalVisionScore = 80
        }
        grade = "高二"
        portfolioCount = 4
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$API_URL/api/business-strategy" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ 推薦: $($response.data.topRecommendation.department) (匹配度: $($response.data.topRecommendation.matchScore)%)" -ForegroundColor Green
} catch {
    Write-Host "❌ 失敗: $_" -ForegroundColor Red
}

# 測試 4: 均衡能力學生
Write-Host "`n⚖️ 測試 4: 均衡能力學生分析" -ForegroundColor Green
try {
    $body = @{
        businessProfile = @{
            mathScore = 75
            logicScore = 75
            languageScore = 75
            communicationScore = 75
            creativityScore = 75
            leadershipScore = 75
            itScore = 75
            globalVisionScore = 75
        }
        grade = "高二"
        portfolioCount = 5
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$API_URL/api/business-strategy" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ 推薦: $($response.data.topRecommendation.department) (風險: $($response.data.topRecommendation.riskLevel))" -ForegroundColor Green
    Write-Host "風險分佈 - 低: $($response.data.riskAssessment.lowRisk.Count), 中: $($response.data.riskAssessment.mediumRisk.Count), 高: $($response.data.riskAssessment.highRisk.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ 失敗: $_" -ForegroundColor Red
}

# 測試 5: 錯誤處理 - 無效分數
Write-Host "`n🚫 測試 5: 錯誤處理（無效分數）" -ForegroundColor Yellow
try {
    $body = @{
        businessProfile = @{
            mathScore = 150  # 超過100
            logicScore = 85
            languageScore = 75
            communicationScore = 70
            creativityScore = 65
            leadershipScore = 60
            itScore = 55
            globalVisionScore = 50
        }
        grade = "高二"
        portfolioCount = 3
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$API_URL/api/business-strategy" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "❌ 應該拒絕但沒有: $($response.success)" -ForegroundColor Red
} catch {
    Write-Host "✅ 正確拒絕無效分數" -ForegroundColor Green
}

# 測試 6: 錯誤處理 - 缺少資料
Write-Host "`n🚫 測試 6: 錯誤處理（缺少商管資料）" -ForegroundColor Yellow
try {
    $body = @{
        grade = "高二"
        portfolioCount = 3
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$API_URL/api/business-strategy" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "❌ 應該拒絕但沒有: $($response.success)" -ForegroundColor Red
} catch {
    Write-Host "✅ 正確拒絕缺少資料的請求" -ForegroundColor Green
}

Write-Host "`n✅ 測試完成！" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
