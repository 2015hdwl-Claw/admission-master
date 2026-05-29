# DATA_SOURCES.md — 升學大師 資料來源索引

> 最後更新：2026-05-29 | 維護者：升學大師團隊

## 快速參考表

| 檔案 | 大小 | 筆數 | 品質分級 | 主要來源 | 最後取得 | 更新頻率 |
|------|------|------|----------|----------|----------|----------|
| `cert-admission-map.json` | 33 KB | 38 類別 × 800+ 證照 | Tier 1 | 115 學年度技優甄審招生簡章 | 2026-05-17 | 每學年（12 月新簡章發布） |
| `competition-admission-map.json` | 68 KB | 38 類別 × 13 競賽類型 | Tier 1 | 115 學年度技優甄審招生簡章 | 2026-05-23 | 每學年（12 月新簡章發布） |
| `bonus-table.ts` | 16 KB | 證照 + 競賽加分表 | Tier 1 | 115 學年度技優甄審招生簡章 表1 | 2026-05-17 | 每學年（12 月新簡章發布） |
| `exam-schedules.json` | 173 KB | 360 筆 | Tier 2 | skill.tcte.edu.tw（技能檢定中心） | 2026-05-17 | 每年 3 次（1/4/8 月梯次公告） |
| `competition-events.json` | 188 KB | 302 筆 | Tier 2 | sci-me.k12ea.gov.tw + wdasec.gov.tw | 2026-05-17 | 每學年（10 月新學年行事曆） |
| `pathway-deadlines.json` | 10 KB | 6 管道 | Tier 2 | techadmi.edu.tw（技專招生委員會） | 2026-05-17 | 每學年（12 月新簡章發布） |
| `national-calendar.ts` | 71 KB | 衍生資料 | Tier 2 | 以上三個檔案的聚合（自動生成） | 2026-05-17 | 上游任一檔案更新後重新生成 |
| `departments.json` | 940 KB | 181 系所 | Tier 3 | jctv.ntut.edu.tw + GLM API + 104 人力銀行 | 2026-05-14 | 每學年（12 月新年度資料） |
| `admission.ts` | 26 KB | 6 管道 | **Tier 4** | ⚠️ 普通高中體系，非高職 | 手寫 | 需重寫為高職版本 |
| `academic-categories.ts` | 13 KB | 58 學群 | **Tier 4** | ⚠️ 普通大學學群，非高職 20 群 | 手寫 | 需重寫為高職版本 |
| `certificates.ts` | 12 KB | 15 群 × N 證照 | Tier 4 | 勞動部技能檢定中心（手動整理） | 手寫 | 視需要 |
| `competitions.ts` | 13 KB | 30+ 競賽 | Tier 4 | wdasec.gov.tw 等官方網站（手動整理） | 手寫 | 視需要 |
| `capstone-templates.ts` | 20 KB | 多組範本 | Tier 4 | 104Campus 啟發（手寫） | 手寫 | 視需要 |
| `direction-rules.ts` | 10 KB | 25+ 規則 | Tier 4 | 開發者領域知識（手寫） | 手寫 | 視需要 |
| `vocational-categories.ts` | 16 KB | 15 群 | Tier 4 | 高職群科手動整理 | 手寫 | 視需要 |
| `vocational-direction-rules.ts` | 18 KB | 多組規則 | Tier 4 | 開發者領域知識（手寫） | 手寫 | 視需要 |

## 資料品質分級定義

| Tier | 名稱 | 定義 | 可信度 |
|------|------|------|--------|
| **1** | 官方來源 | 直接從官方 PDF/文件提取，可完整追溯到單一官方文件 | 高 — 資料等於官方文件內容 |
| **2** | 爬蟲取得 | 從官方網站爬取，每筆記錄有 source URL 可追溯 | 中高 — 爬蟲可能有誤差，但來源可驗證 |
| **3** | 混合來源 | 基礎資料來自官方，但部分欄位由 AI 或 regex 補全 | 中 — 核心資料可信，補充欄位需標記 AI 來源 |
| **4** | 手寫無來源 | 開發者基於領域知識手寫，無正式文件可對照驗證 | 需驗證 — 可能正確但無法證明 |

## 各檔案詳細說明

### Tier 1 — 官方來源

#### `cert-admission-map.json`
- **來源**: 115 學年度 科技校院四年制及專科學校二年制招收技藝技能優良學生甄審入學招生簡章
- **來源文件**: 招生類別代碼及名稱、適合甄審之技術士職種/類及專技普考類科對照表（簡章 Category2.pdf + 主簡章第 3-25 頁）
- **取得方式**: 從官方 PDF 手動提取
- **取得日期**: 2026-05-17
- **資料內容**: 38 個招生類別，每個類別下的證照分為高/中/低相關度三級，共 800+ 筆證照對照
- **備註**: 甲級證照不分相關度一律 +25%，乙級依相關度區分

#### `competition-admission-map.json`
- **來源**: 115 學年度四技二專技優甄審入學招生簡章 第 3-25 頁
- **取得方式**: 從官方 PDF 手動提取
- **更新日期**: 2026-05-23
- **資料內容**: 38 個招生類別 × 13 種競賽類型（國際技能競賽、亞洲技能競賽、全國技能競賽、全國高級中等學校技藝競賽、分區技能競賽、專題實作、科展、智慧鐵人、電腦鼠、美術/舞蹈/音樂比賽）
- **備註**: 每個競賽類型下再細分具體職類/競賽項目

#### `bonus-table.ts`
- **來源**: 115 學年度技優甄審招生簡章「表1 競賽優勝名次或證照等級及其優待加分標準表」
- **取得方式**: 從官方 PDF 手動提取為程式碼
- **資料內容**: 競賽名次對應加分百分比（第一名 25-30% → 佳作 5-10%）、證照等級對應加分（甲級 25%、乙級 4-15%、丙級 0%）

### Tier 2 — 爬蟲取得

#### `exam-schedules.json`
- **來源**: https://skill.tcte.edu.tw/schedule.php（勞動部勞動力發展署技能檢定中心）
- **取得方式**: `tools/scrape_exam_schedules.py` 爬蟲
- **取得日期**: 2026-05-17
- **資料內容**: 360 筆證照考試時程（乙級/甲級，三個梯次，含報名/學科/術科/放榜日期）
- **每筆記錄包含**: `source` URL、`fetchedAt` 時間戳

#### `competition-events.json`
- **來源**:
  - https://sci-me.k12ea.gov.tw/（全國高級中等學校學生技藝競賽）
  - https://www.wdasec.gov.tw/（全國技能競賽）
  - https://topic.tcivs.tc.edu.tw/（專題暨創意製作競賽）
- **取得方式**: `tools/scrape_competition_events.py` 爬蟲
- **取得日期**: 2026-05-17
- **資料內容**: 302 筆競賽活動（含報名時間、比賽日期、職類、等級）
- **每筆記錄包含**: `source` URL、`fetchedAt` 時間戳

#### `pathway-deadlines.json`
- **來源**: https://www.techadmi.edu.tw/edutype_list.php（技專校院招生委員會聯合會）
- **取得方式**: `tools/scrape_pathway_deadlines.py` 爬蟲
- **取得日期**: 2026-05-17
- **資料內容**: 6 個升學管道（甄選入學、登記分發、技優甄審、技優保送、繁星、特殊選才）的里程碑日期
- **每筆記錄包含**: `source` URL、`fetchedAt` 時間戳

#### `national-calendar.ts`
- **來源**: 衍生資料 — 由 `tools/generate_calendar.py` 從上述三個檔案自動聚合產生
- **生成日期**: 2026-05-17
- **資料內容**: 合併所有考試、競賽、管道截止日的統一行事曆

### Tier 3 — 混合來源

#### `departments.json`
- **⚠️ 已知問題**: 所有 181 個系所均為 `groupCode: "03"`（電機與電子群），尚未擴展到其他 19 個職群
- **基礎資料來源**: jctv.ntut.edu.tw 的 warehouse.js（技專校院招生委員會聯合會資料倉儲）
- **AI 補全欄位**: `fullDescription`、`features`、`researchAreas`、`careerPaths` 部分由 GLM API（glm-4.7-flash）生成
- **外部資料補全**: `careerOutcomes`（薪資、技能）來自 104 人力銀行 Career Guide API（be.guide.104.com.tw）
- **Regex 補全**: `tags` 欄位由 `tools/enrich_tags.py` 以 regex 規則分類
- **取得方式**:
  - `tools/scrape_electrical_departments.py` → 基礎系所資料
  - `tools/enrich_techadmi.py` → 系所完整描述 + YouTube 連結
  - `tools/enrich_career_104.py` → 就業薪資資料
  - `tools/enrich_descriptions_glm.py` → AI 補全描述
  - `tools/enrich_tags.py` → Regex 標籤分類
  - `tools/enrich_pathways.py` → 各管道招生名額
- **取得日期**: 2026-05-14

### Tier 4 — 手寫無來源

#### `admission.ts` ⚠️ 高風險
- **⚠️ 此檔案內容為普通高中升學體系**（學測/申請入學/分發），**不是高職體系**（統測/甄選入學/技優甄審）
- **內容**: 6 個管道描述、時程、需求、提示、FAQ、分數範圍
- **影響**: 若被高職使用者看到，會提供錯誤的升學資訊
- **建議**: 標記為 deprecated，或重寫為高職 6 管道版本

#### `academic-categories.ts` ⚠️ 高風險
- **⚠️ 此檔案為普通大學學群分類**（58 個學群），**不是高職 20 群體系**
- **內容**: 58 個學術領域分類與描述
- **影響**: 高職使用者適用的是 20 群（機械群、電機電子群…），不是 58 學群
- **建議**: 應改用高職 20 群體系

#### `certificates.ts`
- **宣稱來源**: 勞動部勞動力發展署技能檢定中心
- **實際狀況**: 手動整理，無具體 URL、無取得日期、無驗證記錄
- **內容**: 15 個職群對應的證照清單（丙/乙/甲級）
- **建議**: 與 Tier 1 的 `cert-admission-map.json` 交叉驗證

#### `competitions.ts`
- **來源**: wdasec.gov.tw 等官方網站
- **實際狀況**: 手動整理，部分競賽有 `officialUrl` 但無系統性驗證
- **內容**: 30+ 競賽定義（含官方分類、等級、加分）

#### 其他 Tier 4 檔案
- `capstone-templates.ts` — 啟發自 104Campus，手寫 STAR 範本
- `direction-rules.ts` — 手寫規則引擎，信心分數（0.75-0.95）無實證基礎
- `vocational-categories.ts` — 15 個高職群科描述，缺少部分群科
- `vocational-direction-rules.ts` — 手寫規則引擎，信心分數無實證基礎

## 更新行事曆

| 月份 | 更新項目 | 影響檔案 | 更新方式 |
|------|----------|----------|----------|
| 1 月 | 第一梯次證照考試時程公告 | `exam-schedules.json` | 爬蟲 |
| 4 月 | 第二梯次證照考試時程公告 | `exam-schedules.json` | 爬蟲 |
| 8 月 | 第三梯次證照考試時程公告 | `exam-schedules.json` | 爬蟲 |
| 10 月 | 新學年競賽行事曆公布 | `competition-events.json` | 爬蟲 |
| 12 月 | 新年度技優甄審簡章發布 | `cert-admission-map.json`, `competition-admission-map.json`, `bonus-table.ts` | 手動 PDF 提取 |
| 12 月 | 新年度管道時程公布 | `pathway-deadlines.json` | 爬蟲 |
| 12 月 | 新年度系所資料更新 | `departments.json` | 爬蟲 + enrichment |
| 上游更新後 | 重新生成統一行事曆 | `national-calendar.ts` | `python tools/generate_calendar.py` |

## Pipeline 文件

詳細的爬蟲 pipeline 文件請參閱 [`tools/README.md`](tools/README.md)。

## 資料變更記錄

所有資料變更記錄在 [`DATA_CHANGELOG.md`](DATA_CHANGELOG.md)。