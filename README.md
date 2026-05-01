# Admission Master 升學大師 v5.0

> 升學準備的連結器 — 把學生正在做的事連結到升學目標，讓家長看到孩子的成長軌跡

## 🎯 產品定位

升學大師是一個**雙邊平台**：
- **學生** = 免費用戶 + 病毒傳播載體 + 每週成就感 loop
- **家長** = 付費用戶 + 收入來源 + 看見孩子成長的窗口

### v5.0 核心功能
- **Self-Discovery Engine**: 能力帳戶 + 116 選考策略
- **20 職群系統**: 高職類群完整支援
- **學習歷程代碼**: A/B/C/D 四類記錄管理
- **AI 輔助**: 學習歷程撰寫與預覽
- **家長系統**: 家長邀請 + 成長報告 + 付費功能
- **病毒傳播**: 分享卡片 + 推薦碼 + 社群整合

## 🏗️ 技術架構

- **Frontend**: Next.js 16.2.4 (App Router) + Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions + Storage)
- **AI**: GLM API (開發) → Gemini 2.5 Flash (生產)
- **Deploy**: Vercel (frontend) + Supabase Cloud (backend)
- **Build**: Turbopack (7.5s compile time)

## 📊 專案狀態

**✅ v5.0 完成** — 所有 4 個 Phase 開發完成，準備生產部署

### ✅ 已完成 (Phase 1-4)
- [x] **Phase 1**: 基礎平台 + 用戶系統 + 資料庫架構
- [x] **Phase 2**: 116 選考系統 + AI 分析引擎
- [x] **Phase 3**: 家長系統 + 付費功能
- [x] **Phase 4**: 病毒傳播系統 + 社群分享
- [x] 構建成功 ✅ (TypeScript 錯誤: 0, 頁面: 42 個)

### 🚀 部署狀態
- [x] 本地構建測試通過
- [x] 環境變數配置完成
- [x] 資料庫 Schema 準備完成
- [ ] **等待執行**: Supabase 資料庫遷移
- [ ] **等待執行**: Vercel 生產環境部署
- [ ] **等待執行**: 功能測試驗證

## 🚀 快速開始

### 1. 環境設定

```bash
# 安裝依賴
npm install

# 設定環境變數 (已配置)
# .env.local 包含所有必要的環境變數
```

### 2. Supabase 資料庫部署

#### 方法 A: 通過 Supabase Dashboard (推薦)
1. 前往 https://supabase.com/dashboard
2. 選擇專案 `nhkcondcwmizfsxkglqr`
3. 點擊 "SQL Editor"
4. 依序執行:
   - `supabase/migrations/20240430_complete_schema.sql`
   - `supabase/migrations/20240430_referral_system.sql`

#### 方法 B: 使用本地的 deploy.sh 腳本
```bash
# 執行部署腳本 (包含環境變數檢查和構建)
./deploy.sh
```

### 3. Vercel 生產部署

#### Step 1: 準備 Git Repository
```bash
# 確認代碼已推送
git status
git add .
git commit -m "準備 v5.0 生產部署"
git push origin main
```

#### Step 2: 連接 Vercel
1. 前往 https://vercel.com
2. 點擊 "Add New Project"
3. 從 GitHub 匯入 `admission-master` repository

#### Step 3: 配置環境變數
在 Vercel 專案設定中添加 (見 `.env.local`):
```bash
NEXT_PUBLIC_AI_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
NEXT_PUBLIC_AI_API_KEY=7571f91152a74a669179d3a2c67c513a.E6KUmy0NNEwTYdKK
NEXT_PUBLIC_AI_MODEL=glm-4.7-flash
CLASSIFIER_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
CLASSIFIER_API_KEY=7571f91152a74a669179d3a2c67c513a.E6KUmy0NNEwTYdKK
CLASSIFIER_MODEL=glm-4.7-flash
NEXT_PUBLIC_SUPABASE_URL=https://nhkcondcwmizfsxkglqr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable__8ShVMi7S6iAV5knC2xztw_VxYxqL9
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Step 4: 執行部署
```bash
# 使用 Vercel CLI
npm install -g vercel
vercel --prod

# 或在 Vercel Dashboard 中點擊 "Deploy"
```

### 4. 部署後驗證

訪問您的 Vercel URL 並測試:
- [ ] 首頁正常載入
- [ ] 用戶註冊/登入功能
- [ ] 能力帳戶功能
- [ ] 116 選考系統
- [ ] AI 分析引擎
- [ ] 家長系統功能
- [ ] 分享功能正常

## 📁 專案結構

```
admission-master/
├── .claude/                 # Claude Code 專案設定
├── content/                # Markdown 文章（博客、指南）
├── data/
│   └── seed/              # 種子資料
│       ├── group-knowledge.ts      # 20 類群知識庫
│       └── external-competitions.ts # 外部競賽資料
├── docs/                   # 專案文件
│   ├── DESIGN-v3-to-v4.md  # v4 設計文件
│   └── PROJECT.md          # 專案概覽
├── scripts/
│   ├── seed-database.ts    # 種子資料腳本
│   └── migrate-localstorage.ts # 資料遷移腳本
├── supabase/
│   ├── 01-tables.sql       # 資料表建立
│   ├── 02-rls.sql          # RLS 策略
│   └── 03-storage.sql      # Storage 設定
├── src/
│   ├── app/
│   │   ├── api/           # API 路由
│   │   │   ├── ability/   # 能力帳戶 API
│   │   │   ├── portfolio/ # 學習歷程 API
│   │   │   ├── portfolio-preview/ # AI 預覽 API
│   │   │   └── migrate/   # 資料遷移 API
│   │   └── ability-account/ # 能力帳戶頁面
│   ├── components/        # React 組件
│   ├── lib/
│   │   └── supabase/      # Supabase 客戶端
│   │       ├── client.ts  # 客戶端函式
│   │       ├── server.ts  # 伺服器端函式
│   │       ├── storage.ts # Storage 輔助
│   │       └── database.types.ts # 類型定義
│   └── types/             # TypeScript 類型
│       └── v4.ts          # v4 類型定義
├── CLAUDE.md              # Claude Code 專案指令
├── PROJECT.md             # 專案概覽
├── .env.local             # 環境變數（不提交）
└── package.json           # 專案配置
```

## 🔑 環境變數

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://nhkcondcwmizfsxkglqr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI API (開發用 - GLM)
CLASSIFIER_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
CLASSIFIER_API_KEY=your_glm_api_key
CLASSIFIER_MODEL=glm-4.7-flash

# AI API (生產用 - Gemini)
# NEXT_PUBLIC_AI_BASE_URL=https://generativelanguage.googleapis.com/
# NEXT_PUBLIC_AI_API_KEY=your_gemini_api_key
# NEXT_PUBLIC_AI_MODEL=gemini-2.5-flash
```

## 📚 API 文件

### 能力帳戶 API
- `GET /api/ability` - 取得學生的能力記錄
- `POST /api/ability` - 建立新的能力記錄
- `PUT /api/ability/[id]` - 更新能力記錄
- `DELETE /api/ability/[id]` - 刪除能力記錄

### 學習歷程 API
- `GET /api/portfolio` - 取得學生的學習歷程
- `POST /api/portfolio` - 建立新的學習歷程
- `PUT /api/portfolio/[id]` - 更新學習歷程
- `DELETE /api/portfolio/[id]` - 刪除學習歷程

### AI 預覽 API
- `POST /api/portfolio-preview` - 使用 AI 生成學習歷程預覽

### 資料遷移 API
- `POST /api/migrate` - 將 localStorage 資料遷移到 Supabase

## 🎨 設計理念

### UI 設計
- **靈感來源**: Sky: Children of the Light
- **設計原則**: 溫暖、極簡、以人為本
- **色彩系統**: 漸層藍紫色系，營造夢幻感
- **互動體驗**: 流暢動畫，正向回饋

### 功能設計
- **成就系統**: 只慶祝做了什麼，不懲罰沒做什麼
- **每月回顧**: 代替每日打卡
- **正向標籤**: "主動學習者"、"科系探索家"
- **免壓力記錄**: 想記錄就記錄，不記錄也不會消失

## 📖 相關文件

- [DESIGN-v3-to-v4.md](docs/DESIGN-v3-to-v4.md) — v4 設計文件
- [PROJECT.md](PROJECT.md) — 專案概覽
- [CLAUDE.md](CLAUDE.md) — Claude Code 專案指令

## 🤝 貢獻指南

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

MIT License - 詳見 [LICENSE](LICENSE) 檔案

---

**最後更新**: 2026-05-01
**版本**: v5.0.0
**狀態**: ✅ 所有 Phase 完成，準備生產部署

**📋 重要文件**:
- [PROJECT_COMPLETION_REPORT.md](PROJECT_COMPLETION_REPORT.md) — v5.0 完成報告
- [CLAUDE.md](CLAUDE.md) — 專案設計與開發指南
- [PROJECT.md](PROJECT.md) — 專案概覽與架構
