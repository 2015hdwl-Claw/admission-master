# 升學大師 v4.0 - 標準化開發檢核表

**專案代碼**: admission-master
**最後更新**: 2026-05-14
**當前階段**: Phase 3 電機群 MVP 閉環完成 → Phase 4 真實用戶驗證
**整體進度**: 90%
**核心策略**: 以終為始 - 先選擇目標科系，再顯示達成路徑與差距
**最新版本**: v4.0.0-electrical-mvp (commit: c09186e)

---

## Phase 1: 構思與確認 ✅

- ✅ **產品定位**: 以終為始的升學路徑發現引擎
- ✅ **核心哲學**: 不管你現在在哪裡，6 種路都可以抵達。不說「你不行」。
- ✅ **目標用戶**: 高職生（免費）+ 家長（付費）
- ✅ **核心問題**: 99% 高職生不知道自己有 6 種升學管道
- ✅ **功能融合策略**: 保留 9 個頁面重新定位，刪除 9 個無用頁面
- ✅ **市場分析**: 高職升學資訊不對稱，差異化 = 以終為始

---

## Phase 2: 規劃與設計 ✅

- ✅ **6 步驟發現流程設計**: 我想去哪裡 → 目標需要什麼 → 我現在有什麼 → 差距在哪裡 → 需要完成什麼 → 時間表
- ✅ **光域風格 UI 原則**: 全螢幕、一次一問題、沒按鈕、流暢過渡、隨時回頭、沒有評斷
- ✅ **科系入學要求資料庫設計**: department_requirements 資料表 + TypeScript 型別
- ✅ **差距分析演算法**: 門檻過濾 → 適合度評分 → 差距分析 → 機率預測
- ✅ **3 角色系統設計**: Explorer → Planner → Guide
- ✅ **技術架構**: Next.js 14 + Supabase + Vercel

---

## Phase 3: 開發執行 🔄 (90%)

### Week 1-3 ✅ 已完成

- ✅ Week 1: Explorer 首頁 + 職群選擇器 + 發現頁面
- ✅ Week 2: 刪除 9 個無用頁面 + 高/中優先級頁面改造
- ✅ Week 3: 低優先級改造 + XP 系統 + 資料庫同步 + 以終為始設計

### Week 4: 電機群 MVP 閉環 ✅ 已完成

#### ✅ Step 1: 爬蟲抓取 (tools/scrape_electrical_departments.py)
- ✅ warehouse.js 解析 — 181 電機群科系、68 校
- ✅ publicPrivate/region 正確：62 公立 / 119 私立，5 區全覆蓋
- ✅ Bug fix: college.get(school_code, {}) 雙層 lookup → 直接 key access

#### ✅ Step 2: 科系標籤 (tools/enrich_tags.py)
- ✅ 50+ regex 規則 — 電機/電子/資訊/通訊/半導體/機器人/自動化/機械/車輛/航空/能源/冷凍/環境/消防/材料/生醫/物聯網
- ✅ 181/181 科系標記：20 features, 167 researchAreas, 89 careerPaths

#### ✅ Step 3: 職涯出路 (tools/enrich_career_104.py)
- ✅ 104 be.guide.104.com.tw 公開 API — 免認證
- ✅ 181/181 careerOutcomes, 180/181 薪資資料
- ✅ 平均新鮮人薪資 57,363 NTD/month
- ✅ 快取系統：40 unique job codes, 89 career tags mapped

#### ✅ Step 4: UI 展示 (src/app/first-discovery/page.tsx)
- ✅ 科系列表卡片：薪資標籤（54.1K/月）
- ✅ 科系詳情 Modal：薪資行情、必備工具、必備技能、主要就業產業
- ✅ TypeScript types 更新：DepartmentInfo 加 careerOutcomes
- ✅ Build 通過，dev server 正常

#### ✅ Pipeline 工具鏈
- ✅ `tools/scrape_electrical_departments.py --year 114 --group 03`
- ✅ `tools/enrich_tags.py`
- ✅ `tools/enrich_career_104.py`（用 cache，秒完成）
- ✅ `tools/test_pipeline.py`（一鍵全跑 + 驗證）

### 待完成
- 🔴 真實用戶測試（用戶兒子 — 控制科二年級）
- 🟡 其他 19 群科系資料擴展
- 🟡 光域風格 UI 重構（待定）

---

## Phase 4: 成長與驗證 ⏳

### Alpha 測試
- ⏳ 用戶兒子（控制科二年級）實際測試
- ⏳ 重點測試：免費發現之旅完整 6 步驟 + 職涯薪資展示
- ⏳ 目標：完成率 > 60%、儲存率 > 30%、7 日回訪 > 25%

### 成功指標
- ⏳ 發現之旅完成率 > 60%
- ⏳ 計畫儲存率 > 30%
- ⏳ NPS > 50
- ⏳ 病毒係數 > 1.2

---

## Phase 5: 擴展與規模 ⏳

- ⏳ 電機群 → 全部 20 群 (2,383 科系)
- ⏳ RPG 生涯元宇宙 (v5.0)
- ⏳ 病毒傳播：發現結果分享、職群測驗分享
- ⏳ 家長付費轉化（後期啟用）

---

## 當前狀態 (2026-05-14)

### ✅ 已完成
- 以終為始的產品設計和哲學確立
- 6 步驟發現之旅 MVP 功能實作
- 181 電機群科系完整資料（入學條件 + 職涯薪資）
- 差距分析演算法（永遠不說「你不行」）
- 104 API 職涯出路資料整合
- Pipeline 工具鏈（爬蟲→標籤→職涯→驗證）
- 生產環境部署 (commit: c09186e)

### 📊 資料規模
- 科系：181（電機群完整）
- 學校：68
- 公/私立：62/119
- 職涯資料覆蓋：100%
- 薪資資料覆蓋：99.4%
- 平均新鮮人薪資：57,363 NTD/month

### 🔴 下一步
1. 真實用戶測試 — 用戶兒子走完 first-discovery
2. 根據反饋迭代 UI/UX
3. 擴展其他 19 群科系

---

*此檔案反映升學大師 v4.0「電機群 MVP 閉環」版本。181 科系完整資料 + 104 職涯薪資 + UI 展示。下一步：真實用戶驗證。*
