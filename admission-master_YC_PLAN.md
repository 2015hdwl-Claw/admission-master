# 升學大師 - YC 5-Phase 主計畫書

**專案名稱**: 升學大師 (Admission Master)
**最後更新**: 2026-05-14
**產品定位**: 武器庫導向的高職升學路徑發現引擎 → 生涯導航平台
**目標市場**: 台灣高一～高三高職生 (免費) + 家長 (付費)
**核心哲學**: 先盤點武器庫，系統推薦最有利的管道。不只看分數，還看到畢業出路。

---

## v4.0 策略升級（2026-05-14 確立）

### v3.0 已完成的成果
- ✅ 六管道獨立匹配引擎（pathway-matcher.ts）
- ✅ 年級分流體驗（高一探索/高二準備/高三衝刺）
- ✅ 精確證照/競賽名稱匹配
- ✅ first-discovery 頁面完整流程
- ✅ ability-account 頁面與 first-discovery 資料串接
- ✅ 3 個 bug 修復（重複分數/錯誤推薦/按鈕寬度）
- ✅ 36 個科系 seed data

### v4.0 的突破：從「升學工具」升級為「生涯導航」

**問題**：130-200 個電機群科系對孩子來說是天文數字。標籤只是 #PLC、#控制，家長看不懂。

**v4.0 三大升級**：
1. **資料量爆炸**：36 → ~170 個電機群科系（爬蟲自動抓取）
2. **科系画像**：從死板標籤升級為「動態職涯標籤」——畢業出路、薪資、產學合作
3. **目標反推**：孩子說「我想去台積電」→ 系統推薦有台積電產學合作的 5 個科系

**護城河**：台灣沒有任何平台同時整合入學條件 + 職涯數據 + 產學合作 + 即時新聞。

---

## Phase 1: 構思與確認 ✅ (已完成)

### 1.1 產品定位

**最終定位**: 武器庫導向的升學路徑發現引擎 → 生涯導航平台

**核心問題**: 99% 高職生不知道自己有 6 種升學管道，且不知道自己的證照/競賽就能決定入學資格

**解決方案**:
1. 學生先告知年級和職群
2. 盤點武器庫（證照、競賽、成績、專題、特殊經歷）
3. 系統推薦最有利的管道
4. 用最有利的管道瀏覽科系
5. 看到畢業出路、薪資範圍、合作企業

### 1.2 目標用戶

**主要用戶**: 台灣高職生（高一～高三，免費使用）
**付費用戶**: 家長（成長報告、AI 輔導）
**MVP 驗證用戶**: 用戶兒子（控制科二年級）

### 1.3 核心功能

1. **年級分流入口**（高一探索 / 高二準備 / 高三衝刺）
2. **武器庫盤點系統**（結構化輸入：證照清單、競賽紀錄、成績、專題）
3. **管道獨立匹配引擎**（六個管道各自計算，不混成分數）
4. **科系画像展示**（入學條件 + 畢業出路 + 產學合作 + 即時動態）
5. **目標反推**（輸入目標企業/職務 → 推薦科系 + 準備路徑）

---

## Phase 2: 規劃與設計 ✅ (已完成)

### 2.1 資料模型（已實作）

- `StudentProfile` — 年級、職群、證照、競賽、專題、特殊經歷
- `DepartmentInfo` — 科系基本資料 + 6 種管道條件
- `PathwayRequirement` — 每個管道的精確條件（證照名稱、競賽名稱、分數、權重）
- `PathwayMatch` — 管道匹配結果（符合/不符合/需準備）

### 2.2 管道匹配引擎（已實作）

- 6 個管道獨立計算：繁星/甄選/分發/技優甄審/技優保送/特殊選才
- `findBestPathway()` — tiebreaker 邏輯（錄取率優先，匹配度次之）
- `consolidateActionPlan()` — 合併行動計畫，分數去重
- `generateGradeAdvice()` — 年級分流建議

### 2.3 年級體驗設計（已實作）

- 高一（探索期）：三年養成路線圖
- 高二（準備期）：武器升級指南
- 高三（衝刺期）：最佳策略分析

### 2.4 科系画像設計（v4.0 新增）

```
🏫 國立虎尾科技大學 - 自動化工程系

💡 系所特色標籤：#PLC控制 #機器人 #人工智慧

🏢 近期產學動態 (由爬蟲自動更新)：
  • [2024/03] 與上銀科技簽署產學合作，提供大四全學期實習
  • [2023/11] 台達電捐贈五套工業自動化設備予本系實驗室

💼 畢業出路連結：
  • 主要職稱：自動控制工程師、設備工程師
  • 市場參考起薪：36K - 42K (資料來源：104)
  • 產業分布：半導體 40%、自動化設備 30%、綠能 15%

🎯 你的配對度：85%
  (因為你具備 PLC 專題經驗，與該系近期重點發展高度吻合！)
```

---

## Phase 3: 開發執行 🔄

### 3.1 已完成的開發工作

| 項目 | 狀態 | 說明 |
|------|------|------|
| 資料模型 + types | ✅ | department.ts, certificates.ts, competitions.ts |
| 管道匹配引擎 | ✅ | pathway-matcher.ts（六管道獨立計算） |
| first-discovery 頁面 | ✅ | 年級分流 + 武器庫 + 科系選擇 |
| ability-account 頁面 | ✅ | localStorage 串接 + 分析展示 |
| Bug 修復 x3 | ✅ | 重複分數/錯誤推薦/按鈕寬度 |
| Seed data | ✅ | 36 個科系 |

### 3.2 電機群 MVP 閉環（當前進行中）

**目標**：用真實用戶（控制科二年級兒子）驗證系統，資料從 36 擴展到 ~170 個電機群科系。

#### Step 1：爬蟲抓取電機群全量科系（入學條件）

**狀態**: 待開始
**預估**: 4-6 小時

- 來源：jctv.ntut.edu.tw（甄選 HTML + 分發 PDF + 繁星 PDF + 技優 PDF）
- 輸出：~170 個科系的 schoolName, departmentName, groupCode, website + 各管道 quota/deadline/lowestScore/權重
- 工具：Python + requests + pdfplumber

#### Step 2：科系標籤 + 專題配對

**狀態**: 待開始
**預估**: 2-3 小時

- 為每個科系加技術標籤：#PLC, #控制, #電力, #IoT, #半導體, #綠能, #冷凍
- 專題關鍵字拆解 → 標籤匹配 → 科系吻合度計算

#### Step 3：護城河資料 — 畢業出路 + 產學合作

**狀態**: 待開始
**預估**: 6-8 小時

| 優先級 | 來源 | 資料 | 可爬性 |
|--------|------|------|--------|
| P0 | 教育部開放資料 data.gov.tw | 畢業生 1/3/5 年流向追蹤 CSV | 直接下載 |
| P0 | ColleGo! collego.edu.tw | 科系能力指標、課程領域 | ASP.NET MVC |
| P1 | 104升學就業地圖 guide.104.com.tw | Top10職務、薪資、必備技能、學長姐評論 | Playwright |
| P1 | 國科會產學查詢 wsts.nstc.gov.tw | 全台產學合作計畫、補助金額 | Playwright |
| P2 | 1111人才地圖 university.1111.com.tw | 學系→職務/產業關聯 | 傳統 HTML |
| P2 | 各校新聞稿 RSS | 產學合作公告、競賽成就 | RSS |

新增資料結構：
```ts
interface DepartmentProfile {
  careerOutcomes: {
    topJobs: string[]
    avgSalary: string
    industries: string[]
    furtherStudyRate: number
  }
  industryPartners: {
    companies: string[]
    projects: string[]
    lastUpdated: string
  }
}
```

#### Step 4：UI 展示護城河資料

**狀態**: 待開始
**預估**: 4-6 小時

- 科系卡片新增：畢業出路（Top5工作 + 薪資）+ 產學合作（合作企業 + 最近消息）
- 科系間出路比較
- DepartmentCard 元件

### 3.3 關鍵檔案

| 檔案 | 狀態 | 動作 |
|------|------|------|
| `src/types/department.ts` | 已有 | 加 tags, topicKeywords, careerOutcomes, industryPartners |
| `src/data/departments.json` | 36 筆 | 擴展到 ~170 筆 |
| `src/data/department-profiles.json` | 不存在 | 新建：畢業出路 + 產學合作 |
| `src/data/topic-tags.ts` | 不存在 | 新建：專題關鍵字標籤庫 |
| `src/lib/pathway-matcher.ts` | 已有 | 加專題配對邏輯 |
| `src/app/first-discovery/page.tsx` | 已有 | 專題步驟 + 科系卡片展示出路 |
| `src/components/DepartmentCard.tsx` | 不存在 | 新建：護城河資料展示元件 |
| `tools/scrape-electrical-departments.py` | 不存在 | 新建：入學條件爬蟲 |
| `tools/scrape-career-data.py` | 不存在 | 新建：畢業出路爬蟲 |
| `tools/scrape-industry-partners.py` | 不存在 | 新建：產學合作爬蟲 |

---

## Phase 4: 成長與驗證 ⏳

### 4.1 Alpha 測試（電機群 MVP）

**驗證用戶**: 用戶兒子（控制科二年級）
**測試流程**：
1. 輸入：控制科 / 高二 / 工配丙級 / PLC自動洗車場專題
2. 系統配對：虎尾自動化工程系、勤益電機工程系（PLC+控制標籤吻合）
3. 看到出路：「畢業後多數做自動控制工程師，薪資 35-45K」
4. 看到合作：「虎尾自動化與台達電有產學合作計畫」
5. 路徑建議：甄選入學（專題是亮點）+ 行動：考工配乙級開通技優甄審

**成功標準**：
- 兒子能獨立完成整個流程（不需要爸爸解釋）
- 配對結果讓他覺得「真的有幫助」
- 至少發現 1 個他之前不知道的科系

### 4.2 Beta 測試計畫
- 10 名真實高職生（涵蓋高一、高二、高三）
- 成功指標：完成率 > 60%，理解率 > 80%

---

## Phase 5: RPG 生涯元宇宙 ⏳

### 5.1 願景：從「填表」到「角色創建」

核心心理學機制：**成就極大化，目標極小化**。不用學生思考下一步，系統直接餵微小、明確、有立即反饋的任務。

**世界觀**：電機群的「光域」— 機甲與代碼的未來城
- 電力峽谷 → 傳統電機系（台電、配電）
- 自控晶塔 → 自動化工程系（PLC、機械手臂）
- 晶片秘境 → 資工/微電子系（IC設計、韌體）

**角色創建**（取代傳統表單）：
1. 選擇出身：控制科、電機科... → 決定初始屬性
2. 天賦點數：勾選已有證照/專題 → 生成戰力雷達圖（配線/程式/硬體/學科）

### 5.2 RPG 資料模型（後端架構）

**關鍵原則**：RPG 不是前端的「皮」，是整個系統的「骨」。v4.0 的 JSON 資料結構必須相容 RPG 後端。

#### 模型 1：玩家檔案 (Player Profile)

| Table | 欄位 | 對應 v4.0 |
|-------|------|-----------|
| `players` | player_id, current_grade, origin_class, total_exp, main_quest_target | StudentProfile + 新增 exp, quest |
| `player_abilities` | ability_type (硬體配線/軟體控制/學科理論/跨域整合), ability_value | v4.0 無，需新增 |
| `player_inventory` | item_type (證照/競賽/專題), item_id, equipped_status | certificates[] + competitions[] 重構 |

#### 模型 2：公會與據點 (Guilds)

| Table | 欄位 | 對應 v4.0 |
|-------|------|-----------|
| `guilds` | guild_id, guild_name, group_code, map_region, req_abilities | DepartmentInfo + 新增 map_region |
| `guild_events` | guild_id, event_source, event_title, crawled_keywords | industryPartners + 新增 events 結構 |

#### 模型 3：任務系統 (Quest System)

| Table | 欄位 | v4.0 對應 |
|-------|------|-----------|
| `quest_definitions` | quest_id, category (主線/支線/每日), prerequisites, rewards | v4.0 無，全新系統 |
| `player_quests` | player_id, quest_id, status, progress, completed_at | v4.0 無，全新系統 |

#### 模型 4：圖鑑與成就

| Table | 欄位 | v4.0 對應 |
|-------|------|-----------|
| `codex_items` | item_id, item_name, item_rarity (普通/稀有/傳說), buff_effects | certificates.ts + competitions.ts 重構 |
| `player_achievements` | player_id, achievement_id, unlocked_at | v4.0 無，全新系統 |

#### 模型 5：冒險日誌 (Action Log)

| Table | 欄位 | 用途 |
|-------|------|------|
| `player_action_logs` | log_id, player_id, action_type, action_payload, timestamp | 記錄每個微動作，為「AI 專題精靈」存子彈 |

### 5.3 事件觸發引擎

當玩家動作寫入時，自動觸發狀態改變：

**情境**：兒子考取工配丙級
1. `player_inventory` 新增證照
2. 觸發器：`total_exp` + 200、「硬體配線」+ 10
3. 檢查任務進度：「考取第一張丙級」→ 待提交
4. 前端跳出：「Level Up! 硬體配線能力提升！」

### 5.4 付費轉換策略

**孩子免費玩，家長付費買安心。**

| 付費點 | 功能 | 家長痛點 |
|--------|------|---------|
| AI 專題精靈 | 平時上傳的照片+碎碎念 → AI 自動生成專題報告 | 不用再為了寫報告吵架 |
| 破關路線圖 | 目標科系的評分比重 + 備審範本 + 教授偏好 | 不知道教授看重什麼 |
| 產學直通車 | 合作企業面試攻略 + 學長姐證照配置 | 不知道實習怎麼準備 |
| 成長報告 | 各年級進度追蹤 + 出路趨勢 | 不知道孩子進度在哪 |

### 5.5 開發節奏

| 階段 | 範圍 | 目標 |
|------|------|------|
| Phase 3 (當前) | 靜態配對 + 基礎資料 | JSON 檔案，純前端，電機群 MVP |
| Phase 4 | Alpha 驗證 | 兒子實際測試，確認配對準確 |
| **Phase 5a** | Supabase 後端 + RPG 資料模型 | players, guilds, codex 建表 |
| **Phase 5b** | 任務系統 + 事件觸發 | 每日任務、成就解鎖、經驗值 |
| **Phase 5c** | AI 整合 + 付費功能 | 專題精靈、破關路線圖、開始收費 |
| **Phase 5d** | 全群擴展 | 電機群 → 20 群 (2,383 科系) |

### 5.6 v4.0 → RPG 相容性清單

v4.0 開發時，以下決策必須考慮 RPG 相容：

| v4.0 決策 | RPG 相容要求 |
|-----------|-------------|
| DepartmentInfo.id | 用 UUID 或可對應 guild_id 的格式 |
| certificates.ts | 證照資料需包含 rarity (丙=普通, 乙=稀有, 甲=傳說) |
| departments.json | 科系需包含 map_region (電力峽谷/自控晶塔/晶片秘境) |
| pathway-matcher 計算結果 | 需可轉為 exp 點數和 ability 變化 |
| localStorage 資料 | 結構需可遷移至 Supabase player profile |

---

## 附錄：電機群科系數量（已驗證）

114 學年度聯合登記分發官方數據：
- 群 03（電機類）：169 個科系，68 所學校，4,125 名考生
- 群 04（資電類）：237 個科系
- 跨群招收（光電、醫工等也收電機群）：+30-50 個
- **MVP 範圍**：群 03 = ~170 個科系

---

## 技術架構

| 層 | 當前 (v4.0 MVP) | 未來 (v5.0 RPG) |
|----|-----------------|-----------------|
| 前端 | Next.js 16 + Tailwind | + Framer Motion + 2.5D 地圖 |
| 資料 | 靜態 JSON | Supabase (PostgreSQL) |
| 匹配 | pathway-matcher.ts (純前端) | 事件觸發引擎 (後端) |
| 爬蟲 | Python + pdfplumber | + Playwright + NLP |
| NLP | GLM-4.7-flash (企業提取) | + 任務生成 + 專題精靈 |
| 部署 | Vercel | Vercel + Supabase |
| 生產 | https://admission-master-ecru.vercel.app/ | 同 |

---

## 不在 MVP 範圍

- RPG UI（2.5D 地圖、NPC 對話）：Phase 5a
- 任務系統（每日任務、成就解鎖）：Phase 5b
- AI 專題精靈、付費功能：Phase 5c
- 課程地圖（大一到大四必修課）：Phase 5d
- 非電機群科系：驗證後再擴展
- Supabase 資料庫：先用 JSON 檔案

---

*此計畫書反映 v4.0「生涯導航平台」+ v5.0「RPG 生涯元宇宙」願景。v4.0 先做靜態配對+護城河資料，驗證後升級 RPG 後端。核心原則：RPG 不是皮，是骨 — v4.0 資料結構必須相容 RPG 資料模型。*
