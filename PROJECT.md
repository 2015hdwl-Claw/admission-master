# 升學大師 (Admission Master) — 專案全覽 v4

> 最後更新：2026-04-30 | 狀態：Phase 1 開發 | Version: 4.0

---

## 1. 一句話定位

**讓隱形人被看見，讓不知道路的人看見全部的路。** 台灣高職生專用自我發升學引擎 — 能力帳戶 + 選考策略。

> 來源：PLAN-v4.md §3

---

## 2. 商業策略摘要

### 核心定位

| 面向 | 說明 |
|------|------|
| 目標用戶 | 台灣高職生 15-18 歲（**只做高職，不做一般高中**） |
| 身份 | 自我發現引擎（不是工具） |
| 邏輯差異 | 工具：記錄→分析→模擬 ／ 引擎：記錄→發現路徑→解鎖機會 |
| Tagline | 讓隱形人被看見，讓不知道路的人看見全部的路 |

### 商業模型：免費旅程 + 付費裝備

像遊戲：整段旅程免費探索，打 Boss 需要好裝備。按次付費（非訂閱制），對齊升學節點。

**免費**：能力帳戶記錄、時間軸、校曆、職群探索、夥伴配對、情感支持、116 選考策略
**付費**：專題深度指導 500-1000 / 備審精修 500-1000 / 統測策略 500-1000 / 面試特訓 1001-2000 / 志願策略 500-1000（全部家長付費）

**LTV**：理想 10,000-20,000 / 現實 ARPU 400-800 NTD

### 能力帳戶（v4 核心）

**概念**：學生做的每一件事（證照、競賽、專題、實習、社團、志工）都是「存款」，存入能力帳戶。系統自動計算這些存款在升學中的「兌換價值」。

`
能力帳戶
├── 技術資產
│   ├── 證照（丙級 +5% / 乙級 +15% / 甲級 +25%）
│   ├── 技藝競賽獲獎（加分+門票）
│   └── 專業技能檢定
│
├── 學術資產
│   ├── 統測各科成績
│   ├── 課程成績
│   └── 跨考學測成績（如有）
│
├── 經歷資產
│   ├── 專題實作（B-1）
│   ├── 實習經驗
│   ├── 競賽參與（C-4）— 含外部競賽
│   ├── 社團/幹部（C-2/C-3）
│   └── 志工服務（C-6）
│
├── 軟實力標籤
│   ├── AI 自動標記：「主動學習者」「科系探索家」「實驗記錄者」
│   └── 來自經歷的推論，不是自評
│
└── 兌換價值
    ├── 即時試算：這些資產在目標校系的總分貢獻
    ├── 缺口分析：距離目標還差什麼
    └── 路徑推薦：哪條管道最適合你
`

### 三個意志的衝突

| 角色 | 想要 | 恐懼 |
|------|------|------|
| 學生 | 弄清自己的路、被認可 | 被監視、被催促 |
| 家長 | 孩子上好學校、不要落後 | 打水漂、失控感 |
| 平台 | 有人付錢、有人用、有人留下 | 做出來沒人用 |

**解法**：學生是入口，家長是出口 — 學生主動邀請家長看成果，不是家長強制加入。

### 三條營收路線

| 階段 | 路線 | 收入 | 時間 |
|------|------|------|------|
| 短期 | A. 家長付費 | \/月起步 | 現在 |
| 中期 | B. 學校 B2B2C | \/校/年 | 3-6 個月 |
| 長期 | C. 科大 B2B 招生 | 規模最大 | 1-2 年 |

> 來源：PLAN-v4.md §5

---

## 3. 技術架構

### 技術棧

| 層 | 技術 | 版本 |
|----|------|------|
| 框架 | Next.js (App Router) | 16.2.4 |
| 前端 | React + Tailwind CSS v4 | React 19.2.4 |
| 後端 | Supabase PostgreSQL | 15.0+ |
| 認證 | Supabase Auth | 內建 |
| AI（開發期） | GLM API (glm-4.7-flash) | 大陸版 endpoint |
| AI（正式） | Google Gemini 2.5 Flash | 待切換 |
| 字型 | Noto Serif TC + Manrope | Google Fonts |
| 圖示 | Material Symbols Outlined | Google CDN |
| 部署 | Vercel (frontend) + Supabase Cloud (backend) | 無 vercel.json |
| 測試 | Playwright | ^1.59.1 |

> 來源：DESIGN-v3-to-v4.md §2

### 專案結構

`
src
├── app/                    # Next.js App Router
│   ├── page.tsx            # 首頁（探索地圖）
│   ├── layout.tsx          # 根佈局（NavBar + Footer）
│   ├── globals.css         # Design System（Mùhé Academic + 光域 UI）
│   ├── api/                # 13 個 API Routes
│   │   ├── auth/route.ts          # Supabase Auth
│   │   ├── profile/route.ts        # 能力帳戶管理
│   │   ├── ability/route.ts        # 能力記錄 CRUD
│   │   ├── portfolio-preview/route.ts # 學習歷程預覽
│   │   ├── portfolio-export/route.ts  # PDF 生成
│   │   ├── pathway/route.ts        # 校系計分查詢
│   │   ├── strategy/route.ts       # 策略報告
│   │   ├── portfolio-suggest/route.ts # 素材建議
│   │   ├── interview/route.ts      # AI 面試模擬
│   │   ├── review/route.ts        # AI 素材審查
│   │   ├── competition/route.ts    # 外部競賽 API
│   │   ├── group-knowledge/route.ts # 類群知識 API
│   │   ├── companion/route.ts     # 夥伴系統
│   │   ├── subject-strategy/route.ts # 116 選考策略引擎
│   │   └── parent/route.ts        # 家長專區 API
│   ├── onboarding/         # 5 步入口流程（升級）
│   ├── ability-account/     # 新增：能力帳戶頁面（星圖）
│   ├── analyze/            # 統測分析
│   ├── portfolio/          # 技能記錄（升級：加入學習歷程欄位）
│   ├── portfolio-preview/    # 新增：學習歷程預覽
│   ├── portfolio/autobiography/ # 新增：學習歷程自述編輯器
│   ├── calendar/           # 校曆
│   ├── timeline/           # 時光軸
│   ├── roadmap/            # 路線圖（升級：能力帳戶整合）
│   ├── subject-strategy/    # 新增：116 選考策略頁面
│   ├── explore/            # 職群探索（升級：group-exploration）
│   ├── pathways/           # 升學管道查詢
│   ├── interview/          # 面試模擬
│   ├── strategy/           # 策略報告
│   ├── quiz/               # 職群測驗
│   ├── competitions/        # 新增：外部競賽列表
│   ├── pricing/            # 定價
│   ├── parent/             # 家長專區
│   ├── demo/               # 學校合作 Demo
│   ├── teacher/            # 教師端
│   └── results/            # 結果牆
├── components/             # 共用元件
│   ├── NavBar.tsx
│   ├── AbilityStar.tsx      # 新增：能力帳戶星圖
│   ├── TargetSelector.tsx   # 新增：目標校系選擇
│   ├── ShareCard.tsx
│   └── AnalysisResult.tsx
├── lib/                    # 核心邏輯
│   ├── supabase.ts         # Supabase 客戶
│   ├── ai-helper.ts        # AI API（retry + fallback）
│   ├── direction-engine.ts # 方向推導引擎
│   ├── analysis.ts         # 分數分析
│   └── subject-strategy-engine.ts # 新增：116 選考策略演算法
├── data/                   # 靜態資料
│   ├── group-knowledge.ts   # 20 類群知識庫
│   ├── external-competitions.ts # 外部競賽種子
│   ├── pathway-scoring.ts  # 校系計分公式種子
│   └── national-calendar.ts # 全國統一行事曆
└── types/
    └── index.ts.v4        # 新增：v4 型別定義
`

---

## 4. 後端資料庫（Supabase）

### 核心表結構

| 表 | 用途 | 記錄數（估） |
|----|------|--------------|
| auth.users | Supabase 預設認證表 | 用戶數 |
| student_profiles | 能力帳戶主表 | 用戶數 |
| ability_records | 能力記錄（含學習歷程） | 用戶數 × 平均 10 件 |
| learning_portfolios | 學習歷程自述 | 用戶數 × 平均 2 個版本 |
| pathway_scoring | 校系計分公式（116 年度） | 500+ 校系 × 6 管道 |
| external_competitions | 外部競賽資料庫 | 100+ |
| group_knowledge | 20 類群知識庫 | 20 |
| subject_strategies | 116 選考策略結果 | 用戶數 |
| companion_matches | 夥伴配對 | 用戶數 × 平均 2 個 |
| parent_invites | 家長邀請 | 用戶數 × 平均 1.5 個 |

> 來源：DESIGN-v3-to-v4.md §2.1

### Row Level Security (RLS)

- 用戶只能看/改自己的資料（student_profiles, ability_records, learning_portfolios, subject_strategies）
- 夥伴配對雙向可見
- 家長只能看孩子邀請的資料

> 來源：DESIGN-v3-to-v4.md §2.2

---

## 5. 型別系統

### v4 核心型別

| 型別 | 用途 |
|------|------|
| GroupCode | 20 類群代碼（01-20） |
| PathwayType | 6 條升學管道 |
| PortfolioCode | 學習歷程代碼（A/B-1/B-2/C-1~C-8/D-1~D-3） |
| CertLevel | 丙/乙/甲/單一級 |
| CompetitionLevel | 校內/區賽/全國/國際 |
| StudentProfile | 能力帳戶主體 |
| AbilityRecord | 能力記錄主體（含學習歷程欄位） |
| PathwayScoring | 校系計分公式 |
| ExternalCompetition | 外部競賽 |
| SubjectStrategy | 116 選考策略結果 |
| LearningPortfolio | 學習歷程自述 |
| CompanionMatch | 夥伴配對 |

> 來源：DESIGN-v3-to-v4.md §5

---

## 6. 設計系統

### Mùhé Academic（沐禾）+ 光域 UI（Sky 靈感）

設計語言：**建築導師制、靜奢、安靜的自信 + 溫暖探索**

### 色調

| 角色 | 色碼 | 用途 |
|------|------|------|
| Primary | #525f54 | Sage 綠 — 按鈕、標題、強調 |
| Sky Warm White | #FFF8E7 | Hero 背景起始色（光域） |
| Sky Gold | #FFD700 | 強調/慶祝光效（光域） |
| Sky Amber | #F4A460 | 漸層中段（光域） |
| Sky Rose | #E8A0BF | 溫柔的強調（光域） |
| Background | #fbf9f7 | 暖白底 |
| Surface Container Low | #f5f3f1 | 卡片背景 |
| Border | #E9E5DB | Stone 分隔線 |
| On Surface Variant | #434843 | 次要文字 |
| Secondary | #6e5b48 | 暖棕 — — 次要強調 |
| Success | #2e7d32 | 成功/完成 |
| Error | #ba1a1a | 錯誤 |

>（來源：PLAN-v4.md §4.2 + feedback_sky_design_inspiration.md）

---

## 7. 驗證計畫

**第一優先：在建設之前，先驗證。**

### 步驟

1. 找 5-10 個真實高職學生（孩子同學、親戚小孩、PTT/Dcard）
2. 用現有 localStorage 版本讓他們用
3. 每週跟一個學生通話 15 分鐘
4. **核心假設**：學生願不願意把平台內容分享給家長？
5. 有人願意付費（哪怕是紅包）→ 需求被驗證
6. 驗證通過 → 已完成 Supabase 遷移、開始 Phase 2
7. 驗證失敗 → 修正假設或停止

### Exit Criteria

6 個月後 100 個學生用了、沒有人付過一塊錢 → 重新思考。

### Phase 1 行動計畫

| 天 | 行動 | 產出 |
|----|------|------|
| Day 1-2 | 建立 Supabase 專案、設計 Schema | 可用的資料庫 |
| Day 3-4 | 建立 /api/ability API | 能力記錄 CRUD |
| Day 5-6 | 升級 /api/portfolio 頁面 | 加入學習歷程欄位 |
| Day 7-8 | 建立 /api/portfolio-preview API | 學習歷程預覽 |
| Day 9-10 | 建立 ability-account 頁面 | 能力帳戶星圖 |
| Day 11-12 | 遷移腳本（localStorage → Supabase） | 遷移腳本 |
| Day 13-14 | 測試 + Deploy | Phase 1 完成 |

> 來源：DESIGN-v3-to-v4.md §8

---

## 8. 高職升學制度研究

### 六大入學管道

| # | 管道 | 說明 | 門檻 |
|---|------|------|------|
| 1 | **甄選入學** | 統測成績 + 指定項目甄試（面試/實作/備審） | 統測成績 |
| 2 | **登記分發入學** | 純統測成績分發 | 統測成績 |
| 3 | **技優甄審** | 技藝優良不需統測，用證照/競賽成績申請 | 乙級證照或技藝競賽獲獎 |
| 4 | **技優保送** | 國際技能競賽/全國技藝競賽優勝直接保送 | 全國前三名 |
| 5 | **繁星推薦** | 校內排名 + 統測門檻 | 校排名前 30% |
| 6 | **跨考學測** | 高職生報考一般高中學測，申請一般大學 | 學測成績 |

### 甄選入學計分公式

`
總分 = [統測成績 × A% + 指定項目甄試 × B%] × (1 + 優待加分%)
`

### 優待加分體系

| 加分項目 | 加分比例 |
|----------|----------|
| 丙級技術士證照 | +5% |
| 乙級技術士證照 | +15% |
| 甲級技術士證照 | +25% |
| 技藝競賽獲獎 | 依名次 |
| 全國技能競賽獲獎 | 依名次（可保送） |

### 116 學年度（2027 入學）重大改革

- **變革一**：自選考科（2-5 科應考，可放棄弱科）
- **變革二**：分配計分（各校系自訂採計科目與加權）
- **變革三**：策略需求爆發（全新決策需求）

**產品機會：116 選考策略引擎**

> 來源：PLAN-v4.md §1

---

## 9. MVP 優先順序

### Phase 0：商管群 MVP（已完成）

**為什麼先做商管群**：
- 最大族群（12,928 人/年）
- 跨考率高（不知道自己有高職路）
- 痛點明確（證照少、資訊少、跨考多）
- 資料容易取得（商管類的科大最多）

### Phase 1：資料庫基礎 + 核心功能遷移（當前）

- [ ] 建立 Supabase 專案
- [ ] 建立 Schema（所有表）
- [ ] 設定 RLS 政策
- [ ] 建立 Storage buckets
- [ ] 接 Supabase Auth
- [ ] 執行種子資料腳本
- [ ] 建立 /api/ability API
- [ ] 升級 /api/portfolio 頁面
- [ ] 建立 /api/portfolio-preview API
- [ ] 建立 ability-account 頁面
- [ ] 遷移腳本（localStorage → Supabase）
- [ ] 測試 + Deploy

### Phase 2：v4 新功能（下一步）

- [ ] 建立 /api/subject-strategy（116 選考引擎）
- [ ] 建立 subject-strategy 頁面
- [ ] 建立 /api/competition
- [ ] 建立 competitions 頁面
- [ ] 建立 /api/portfolio-export（PDF 生成）

### Phase 3：社交與家長（1 週）

- [ ] 建立 /api/companion（夥伴系統）
- [ ] 建立 /api/parent（家長邀請）
- [ ] 建立 parent 頁面
- [ ] 升級家長視角（週報生成）

### Phase 4：UI 光域升級（1 週）

- [ ] 首頁改版（探索地圖）
- [ ] Onboarding 升級
- [ ] 全站加入光域 UI 元素
- [ ] 響應式動畫和過場

> 來源：DESIGN-v3-to-v4.md §8

---

## 附錄：技術債清理清單

| # | 技術債 | 修復方案 | 狀態 |
|---|--------|----------|------|
| 1 | localStorage 假後端 | Phase 1 遷移到 Supabase | 進行中 |
| 2 | 假認證（in-memory Map） | Phase 1 接 Supabase Auth | 進行中 |
| 3 | 策略 API 用一般高中資料 | 改為高職專用資料 | 待處理 |
| 4 | 首頁假內容 | 改為真實高職數據 | 待處理 |
| 5 | CLAUDE.md 跟 v4 策略矛盾 | 與 PLAN-v4 同步更新 | 待處理 |

---

*Project document updated for v4 migration*
*Current: Phase 1 - Database setup + Core features migration*
