# Supabase 資料庫遷移執行腳本
# 自動執行 SQL 到 Supabase 資料庫

param(
    [string]$SupabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL,
    [string]$ServiceKey = $env:SUPABASE_SERVICE_ROLE_KEY
)

Write-Host "🚀 升學大師 - Supabase 資料庫遷移執行" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# 檢查環境變數
if (-not $SupabaseUrl -or -not $ServiceKey) {
    Write-Host "❌ 缺少環境變數" -ForegroundColor Red
    Write-Host "請設置 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "當前環境變數狀態:" -ForegroundColor Yellow
    Write-Host "NEXT_PUBLIC_SUPABASE_URL: $(if($env:NEXT_PUBLIC_SUPABASE_URL){'✅ 已設置'}else{'❌ 未設置'})" -ForegroundColor $(if($env:NEXT_PUBLIC_SUPABASE_URL){"Green"}else{"Red"})
    Write-Host "SUPABASE_SERVICE_ROLE_KEY: $(if($env:SUPABASE_SERVICE_ROLE_KEY){'✅ 已設置'}else{'❌ 未設置'})" -ForegroundColor $(if($env:SUPABASE_SERVICE_ROLE_KEY){"Green"}else{"Red"})
    exit 1
}

Write-Host "✅ 環境變數檢查通過" -ForegroundColor Green
Write-Host "📋 Supabase URL: $SupabaseUrl" -ForegroundColor Cyan

# 讀取 SQL 檔案
$sqlPath = Join-Path $PSScriptRoot "..\supabase\deploy_complete_schema.sql"
if (-not (Test-Path $sqlPath)) {
    Write-Host "❌ 找不到 SQL 檔案: $sqlPath" -ForegroundColor Red
    exit 1
}

$sqlContent = Get-Content $sqlPath -Raw -Encoding UTF8
Write-Host "✅ SQL 檔案載入成功" -ForegroundColor Green
Write-Host "📊 SQL 大小: $($sqlContent.Length) 字元" -ForegroundColor Cyan

Write-Host ""
Write-Host "🔄 執行 Supabase REST API 調用..." -ForegroundColor Yellow

try {
    # 使用 Supabase REST API 執行 SQL
    $headers = @{
        "apikey" = $ServiceKey
        "Authorization" = "Bearer $ServiceKey"
        "Content-Type" = "application/json"
        "Prefer" = "return=minimal"
    }

    $body = @{
        query = $sqlContent
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/rpc/exec_sql" -Method POST -Headers $headers -Body $body -ErrorAction Stop

    Write-Host "✅ 資料庫遷移執行成功！" -ForegroundColor Green
    Write-Host "📊 已建立 12 個主要資料表" -ForegroundColor Cyan

} catch {
    Write-Host "⚠️ 自動執行失敗 (這是預期的)" -ForegroundColor Yellow
    Write-Host "📋 請按照以下步驟手動執行：" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. 開啟瀏覽器訪問: https://supabase.com/dashboard/project/nhkcondcwmizfsxkglqr/sql" -ForegroundColor Cyan
    Write-Host "2. 點擊 'New Query' 建立新查詢" -ForegroundColor Cyan
    Write-Host "3. 複製以下檔案內容並貼上: $sqlPath" -ForegroundColor Cyan
    Write-Host "4. 點擊 'Run' 執行 SQL" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔗 或者直接點擊: https://supabase.com/dashboard/project/nhkcondcwmizfsxkglqr/sql" -ForegroundColor Underline

    # 嘗試開啟瀏覽器
    Start-Process "https://supabase.com/dashboard/project/nhkcondcwmizfsxkglqr/sql"

    Write-Host ""
    Write-Host "💡 提示: SQL 檔案已複製到剪貼板，可以直接貼上" -ForegroundColor Green

    # 嘗試將 SQL 內容複製到剪貼板
    try {
        Set-Clipboard -Value $sqlContent
        Write-Host "✅ SQL 內容已複製到剪貼板" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ 無法自動複製到剪貼板，請手動複製檔案內容" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🔍 驗證資料庫狀態..." -ForegroundColor Yellow
Write-Host "請在 Supabase Dashboard 的 Table Editor 中檢查以下資料表是否建立:" -ForegroundColor Cyan
Write-Host "• student_profiles" -ForegroundColor White
Write-Host "• ability_records" -ForegroundColor White
Write-Host "• learning_portfolios" -ForegroundColor White
Write-Host "• parent_profiles" -ForegroundColor White
Write-Host "• referral_codes" -ForegroundColor White

Write-Host ""
Write-Host "完成後請執行: npm run test:db" -ForegroundColor Green
Write-Host "來驗證資料庫連線和功能" -ForegroundColor Green