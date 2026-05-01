# 升學大師 v3 → v4 前後端設計調整方案

> Date: 2026-04-30 | Status: Design Phase | Based on PLAN-v3 + PLAN-v4

---

## 1. 變更總覽

`
v3 → v4 核心變更
├── 產品定位
│   ├── v3: 陪伴型升學平台（記錄→被看見→被鼓勵）
│   └── v4: 自我發現引擎（記錄→發現路徑→解鎖機會）
│
├── 核心功能
│   ├── 保留：能力記錄、時間軸、校曆、職群探索、夥伴系統、情感支持
│   ├── 新增：能力帳戶、116 選考策略引擎、外部競賽資料庫、類群知識庫
│   └── 升級：學習歷程 → 學習歷程預覽+匯出（PDF）
│
├── 技術架構
│   ├── Frontend: Next.js 14 + Tailwind CSS（不變）
│   ├── Backend: localStorage → Supabase PostgreSQL
│   ├── Auth: 假認證 → Supabase Auth
│   └── AI: GLM（開發）+ Gemini（正式）
│
├── UI 設計
│   ├── v3: Sage & Stone（安靜、穩重、自然）
│   └── v4: 光域 UI（暖光系、粒子效果、溫暖非壓力）
│
└── MVP 路線
    ├── Phase 0: 商管群 MVP（能力帳戶 + 選考引擎）
    ├── Phase 1: 工科群（證照體系完整）
    └── Phase 2: 設計群 + 外語群（結構劣勢解決）
`

---

## 2. 後端資料庫設計（Supabase PostgreSQL）

### 2.1 核心表結構

詳見完整設計（共 8 個核心表）：

1. **auth.users**（Supabase 預設，擴充 role, profile_id）
2. **student_profiles**（能力帳戶主表）
3. **ability_records**（能力記錄，含學習歷程代碼）
4. **learning_portfolios**（學習歷程自述）
5. **pathway_scoring**（校系計計分公式，116 選考用）
6. **external_competitions**（外部競賽資料庫）
7. **group_knowledge**（20 類群知識庫）
8. **subject_strategies**（116 選考策略結果）
9. **companion_matches**（夥伴配對）
10. **parent_invites**（家長邀請）

### 2.2 Row Level Security (RLS)

- 用戶只能看/改自己的資料（student_profiles, ability_records, learning_portfolios, subject_strategies）
- 夥伴配對雙向可見
- 家長只能看孩子邀請的資料

### 2.3 儲存桶（Storage）

- **portfolio-docs**：學習歷程 PDF
- **evidence-files**：證據檔案
- **profile-images**：用戶頭像

---

## 3. 後端 API 設計（Supabase Edge Functions）

### 3.1 API 端點清單

`
/api/
├── auth/                    # 已有，改用 Supabase Auth
├── profile/                  # 新增：能力帳戶管理
├── ability/                  # 升級：從 localStorage → Supabase
├── portfolio-preview/         # 新增：學習歷程預覽
├── portfolio-export/          # 新增：PDF 生成
├── pathway/                  # 新增：校系計分查詢
├── strategy/                 # 升級：改用高職資料 + 116 選考
├── portfolio-suggest/        # 升級：改用高職資料
├── interview/                # 保留：AI 面試模擬
├── review/                  # 保留：AI 素材審查
├── competition/              # 新增：外部競賽 API
├── group-knowledge/          # 新增：類群知識 API
├── companion/               # 新增：夥伴系統
├── subject-strategy/         # 新增：116 選考策略引擎
└── parent/                  # 新增：家長專區 API
`

### 3.2 核心 API 詳細設計

#### /api/ability - 能力記錄 CRUD
- POST：創建記錄，自動計算 scoring_value，更新 student_profiles 彙總
- GET：查詢用戶記錄（支援篩選 category, portfolio_code, semester, date_range）
- PUT：更新記錄
- DELETE：刪除記錄，更新彙總

#### /api/strategy - 策略報告（升級）
- 輸入：student_id, target_pathways
- 輸出：各路徑的總分計算、缺口分析、建議
- 公式：[統測×A% + 指定項目×B%] × (1+優待%)

#### /api/subject-strategy - 116 選考策略引擎
- 輸入：student_id, target_schools
- 輸出：最優考科組合、覆蓋率、風險評估、替代方案、缺口分析
- 演算法：列舉 2-5 科組合，計算覆蓋率和預期總分，找出最優解

#### /api/competition - 外部競賽 API
- GET：查詢競賽（支援篩選類群、年級、競賽類型）
- POST：管理員新增競賽（UGC）

#### /api/portfolio-preview - 學習歷程預覽
- GET：按代碼分組顯示完整度、教授視角評語
- 輸出：summary, preview_by_code, autobiographies

#### /api/portfolio-export - PDF 生成
- POST：生成 PDF、上傳到 Supabase Storage、返回下載連結

#### /api/companion/match - 夥伴配對
- 輸入：student_id, preferences
- 輸出：真人夥伴 or AI 夥伴（冷啟動）

#### /api/parent/invite - 家長邀請
- POST：生成邀請碼、設定權限
- GET：查看孩子資料（權限檢查）、生成長報告

---

## 4. 前端組件設計調整

### 4.1 新增頁面（v4 獨有）

- **ability-account**：能力帳戶頁面（星圖視覺化）
- **subject-strategy**：116 選考策略頁面
- **portfolio-preview**：學習歷程預覽頁面
- **portfolio/autobiography**：學習歷程自述編輯器
- **competitions**：外部競賽列表頁面
- **group-exploration**：類群探索頁面

### 4.2 升級現有頁面

- **page.tsx**（首頁）：重寫為探索地圖（光域 UI）
- **portfolio**：新增學習歷程相關欄位（portfolio_code, process_description, reflection）
- **onboarding**：移除高中詞彙、加入類群選擇
- **roadmap**：加入能力帳戶里程碑、缺口分析

### 4.3 核心組件設計

- **AbilityStar**：能力帳戶星圖組件（光點視覺化）
- **TargetSelector**：目標校系選擇器
- **RecordForm**：升級的記錄表單（加入學習歷程欄位）

---

## 5. 型別定義升級

新增型別：
- GroupCode（20 類群代碼）
- PathwayType（6 條升學管道）
- PortfolioCode（A/B/C/D 代碼）
- CertLevel, CompetitionLevel
- StudentProfile, AbilityRecord, PathwayScoring
- ExternalCompetition, SubjectStrategy
- LearningPortfolio, CompanionMatch

---

## 6. 種子資料設計

### 6.1 類群知識庫種子
- 20 個類群的完整資料（證照、競賽、職涯、結構分析）

### 6.2 外部競賽種子
- 全國高中職創意行銷競賽
- 專題及創意製作競賽
- 全國技藝競賽
- 各類黑客松/創業競賽

---

## 7. 遷移計畫

### 7.1 localStorage → Supabase 遷移腳本
- 讀取 localStorage 舊資料
- 創建 Supabase user
- 創建 student_profile
- 遷移 ability_records
- 清空 localStorage（保留備份）

### 7.2 資料種子腳本
- 種子類群知識庫
- 種子外部競賽
- 種子校系計分公式

---

## 8. 實施優先級

### Phase 0：資料庫基礎（1 週）
- [ ] 建立 Supabase 專案
- [ ] 建立 Schema（所有表）
- [ ] 設定 RLS 政策
- [ ] 建立 Storage buckets
- [ ] 接 Supabase Auth
- [ ] 執行種子資料腳本

### Phase 1：核心功能遷移（2 週）
- [ ] 建立 /api/ability API
- [ ]) 升級 /api/portfolio 頁面
- [ ] 建立 /api/portfolio-preview API
- [ ] 建立 ability-account 頁面
- [ ] 遷移腳本

### Phase 2：v4 新功能（2 週）
- [ ] 建立 /api/subject-strategy
- [ ] 建立 subject-strategy 頁面
- [ ] 建立 /api/competition
- [ ] 建立 competitions 頁面
- [ ] 建立 /api/portfolio-export

### Phase 3：社交與家長（1 週）
- [ ] 建立 /api/companion
- [ ] 建立 /api/parent
- [ ] 建立 parent 頁面
- [ ] 升級家長視角

### Phase 4：UI 光域升級（1 週）
- [ ] 首頁改版
- [ ] Onboarding 升級
- [ ] 全站加入光域 UI 元素
- [ ] 響應式動畫

---

## 9. 測試策略

### 9.1 單元測試
- 選考策略演算法測試
- 能力帳戶計分邏輯測試
- 學習歷程分組邏輯測試

### 9.2 整合測試
- 遷移腳本端對端測試
- API RLS 政策測試
- PDF 生成測試

### 9.3 E2E 測試
- 註冊 → Onboarding → 第一筆記錄 → 能力帳戶
- 116 選考策略完整流程
- 學習歷程預覽 → 匯出 PDF
- 家長邀請 → 查看 → 週報

---

*Design document generated for v3 → v4 migration*
*Next: Phase 0 implementation - Supabase setup and database schema*
