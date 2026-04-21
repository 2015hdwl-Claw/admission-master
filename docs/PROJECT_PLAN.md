---
name: admission-master
description: Taiwan admission platform - free for students, paid coaching for parents
type: project
---

# 升學大師 Admission Master — 完整專案計畫

> 建立：2026-04-20 | 更新：2026-04-21 | 狀態：規劃完成，待執行

---

## 一、產品定位與核心洞察

### 一句話定位
**「把你正在做的事，連結到你的未來 — 台灣高中生的升學準備連結器」**

### 產品本質：升學準備的連結器

升學大師不是分析工具、不是規劃工具、不是捕捉工具。它是一個**連結器**，連結四個維度：

```
學生的日常     ↔  升學的目標     （化學實驗 → D 代碼 → 工學群）
學校的活動     ↔  學習歷程的代碼  （校慶運動會 → 多元表現素材）
孩子的努力     ↔  家長的視野     （主動記錄 → 週報可見）
現在的累積     ↔  未來的結果     （素材進度 → 申請入學準備度）
```

**不是幫學生創造額外工作，而是讓學生看到自己正在做的事和升學的關係。**

### 連結器的四層運作

```
① 連結（Connect）  學校活動 ↔ 升學目標
   「這週化學實驗課 → 對應 D 代碼 → 對應工學群申請」

② 捕捉（Capture）  經歷 → 素材
   「記錄一下實驗心得，30 分鐘就夠」

③ 映射（Map）      素材 → 空缺
   「D 代碼已有 2 件，還缺 1 件自然探究」

④ 建議（Suggest）  空缺 → 行動（基於校曆，非憑空派任務）
   「下週生物課有戶外教學，記得記錄 → 補上 D 代碼」
```

**規劃仍然存在，但任務來源是學校行事曆和學生實際活動，不是系統憑空生成。**

### 三層策略意義

**第一層：學生 — 自我發現的遊戲**
現在的孩子越來越缺乏方向感。升學大師讓探索未來像打 RPG 一樣：
探索地圖（科系學類）→ 打怪（完成小任務）→ 升級（進度提升）→ 解鎖成就（徽章）。
過程中自然建立系統性思考，不是被說教，是在玩中理解自己要什麼。

**第二層：家長 — 看見真實孩子的窗口**
家長通常只看到成績和情緒，看不到孩子的興趣和想法。
系統讓家長看到：孩子探索了哪些科系、對什麼有反應、主動記錄了什麼。
高中是家長陪伴孩子的最後階段 — 進了大學，父母就真的只能看成績了。
不是每個家長都了解 58 個學類和 2,000+ 科系的差異，系統幫家長和孩子一起理解高等教育。

**第三層：教育銜接 — 打破資訊不對等**
銜接討論從「你以後要讀什麼」（單向壓力）變成「你最近探索了資工學類，要不要一起看 Open Day」（共同探索）。

### 核心洞察：雙邊平台邏輯

學生（免費用戶）              家長（付費用戶）
     |                           |
     | 短影音 / 分享圖卡          | 孩子的每週進度報告
     | 病毒式傳播                  | 看到孩子的探索和成長
     | 來到平台                   | 來到平台
     | 免費查升學管道              | 了解孩子對哪些科系有感覺
     | 免費分數分析               | 「原來孩子對資工這麼有興趣」
     | 免費探索科系                | 一起看 Open Day
     | 每週記錄校園活動            | → 付費：看到完整成長軌跡
     | → 分享給家長                | → 付費：AI 學習歷程審查
     +---------------------------+
            最後的陪伴
     「高中是家長陪伴孩子的最後窗口」

### 差異化定位

| 現有玩家 | 問題 | 我們的優勢 |
|---------|------|-----------|
| ColleGo! 官方 | 靜態查詢、無進度追蹤、家長看不懂 | 校曆同步 + 遊戲化 loop + 家長視角 |
| 補教業 | 教科目、一個月 8,000+、和學校脫節 | 教策略，附著在校園活動上，免費入門 |
| PTT/Dcard | 碎片化、無結構化工具 | 結構化 + 個人化 + 每週成就感 |
| 親子天下 | 泛教育、非升學專注 | 垂直深度 + 即時互動 + 親子共同探索 |
| Notion/Todoist | 通用工具、學生不知道追蹤什麼 | 升學領域預設結構 + AI 自動連結 |

### 為什麼市場空白巨大

**「Duolingo 的成就感 loop + 台灣升學的領域知識 + 校園活動同步」這三個圓的交集，目前是空的。**

- Duolingo 懂 loop 但不懂台灣升學
- ColleGo! 懂台灣升學但不做 loop
- 補教業懂升學但不附著校園活動
- 通用工具可以做 loop 但沒有領域預設

---

## 二、用戶畫像與行為路徑

### 學生行為路徑

```
發現階段              使用階段              分享階段
IG Reels 看到          輸入 5 科級分          生成精美圖卡
「你的分數能上哪裡」    AI 分析 3 秒            分享到 IG Story
↓                    推薦升學管道            同學看到圖卡
點擊連結來到平台       推薦 5 個科系            點擊連結來到平台
                     探索科系學類            → 病毒循環
                     ↓
持續使用階段（核心 loop）
週一：系統同步校曆 → 推薦本週可記錄的活動
週中：完成 1-2 項小記錄（15-30 分鐘/項）
週日：收到本週進度報告 + XP + 徽章
     「原來我這週已經做了這麼多跟升學有關的事」
```

### 家長行為路徑

```
認知階段              了解階段              付費階段
孩子分享圖卡          週報看到孩子的探索       想看到完整成長軌跡
「爸你看我的分析」    「孩子這週探索了資工     免費週報建立信任 3-6 週
↓                    學類，還記錄了化學      付費：完整成長報告 NT$1,990/季
看到平台              實驗心得」              付費：AI 學習歷程審查
初步信任（孩子用的）   免費看到孩子每週動態     付費：模擬面試
                     了解孩子的真正興趣
```

### 關鍵交匯點
- **分享圖卡**：學生的分享行為 = 家長的認知入口（病毒傳播）
- **每週進度報告**：學生的日常記錄 = 家長的持續關注（留存引擎）
- **共同探索**：家長和孩子一起看科系 = 教育銜接的橋樑（付費價值）

---

## 三、信任建立策略

### 免費 → 信任 → 付費 的三階段模型

階段 1：免費價值（Day 1）
- 分數分析器（完全免費，無需註冊）
- 分享圖卡（即時生成，帶品牌水印）
- 目標：學生用完就分享，家長看到就來

階段 2：持續接觸（Week 1-6）
- Email 行銷（每週 1 封有價值的升學建議）
- 社群短影音（持續產出，強化品牌認知）
- 學習歷程免費指南（6 篇入門）
- 目標：從「知道」到「信任」

階段 3：付費轉化（Month 2+）
- 學習歷程 AI 審查（NT$599/季）
- 面試模擬（NT$599/季）
- 科系策略報告（NT$599/份）
- 一對一諮詢（NT$1,500/次）
- 目標：家長為確定感買單

### 病毒式傳播循環

```
學生 A 分數分析 → 分享 IG Story
    ↓
同學 B 看到 → 也來分析
    ↓
同學 B 分享 → 更多同學看到
    ↓
同時：家長 A 看到孩子的分享 → 來到平台 → 跟其他家長說
```

每一個免費用戶都是一個潛在的家長付費觸點。

---

## 四、知識體系架構

### 4.1 升學管道分類

```
升學管道
├── 普通型高中
│   ├── 特殊選才入學（10-3月）— 不看學測，重特殊才能
│   ├── 繁星推薦（3-4月）— 在校成績+學測，不面試
│   ├── 申請入學（3-6月）— 最主流 40-45%
│   └── 分發入學（7-8月）— 純看分科測驗
├── 技職型高中
│   ├── 四技二專甄選（5-7月）
│   ├── 聯合登記分發（7-8月）
│   ├── 技優保送/甄保（3-5月）
│   ├── 各校單獨招生
│   ├── 五專入學（國中畢業）
│   └── 二技入學
├── 特殊管道
│   ├── 軍警校院、體育、藝術
│   ├── 原住民（+25%）、離島（+25%）、身心障礙
└── 國際管道
    ├── 留學、僑生/港澳生、海外學歷採認
```

### 4.2 學習歷程 A-Q 代碼系統

```
A 修課紀錄（自動）
B/C/D/E 課程學習成果（至多18件，需老師認證）
  B 書面報告  C 實作作品  D 自然探究  E 社會探究
F-M 多元表現（至多30件）
  F 自主學習  G 社團  H 幹部  I 服務學習
  J 競賽  K 作品  L 檢定  M 特殊表現
  N 綜整心得（800字+3圖）
O/P/Q 學習歷程自述（PDF，學測後寫）
  O 學習歷程反思（72.92%系組參採）
  P 就讀動機（91.33%系組參採）
  Q 未來計畫與生涯規劃（80.81%系組參採）
```

**教授審查關鍵**：平均 3-6 分鐘/份，最重 100 字學習概述。
**撰寫框架**：STAR（情境→任務→行動→結果）+ ORID（客觀→感受→詮釋→決定）
**常見錯誤**：流水帳、與科系無關、罐頭開場白、自述與歷程脫節

### 4.3 六大科系學習歷程策略

| 科系 | 教授看重 | 優先成果 | 優先多元表現 |
|------|---------|---------|-------------|
| 醫學/牙醫 | 科學素養+人文關懷 | 生物/化學實驗 | 醫療志工 |
| 工程學群 | 邏輯+實作+APCS | 程式作品/數學探究 | 資訊競賽 |
| 商管學群 | 溝通+領導+數據 | 社會探究/理財報告 | 社長/幹部 |
| 設計學群 | 創造力+美感 | 藝術創作/設計專題 | 設計競賽 |
| 人文社會 | 批判思考+文字 | 小論文/閱讀報告 | 辯論/讀書會 |
| 法律 | 邏輯推理+社會正義 | 議題作文/社會探究 | 模擬法庭 |

### 4.4 面試輔導知識體系

```
面試準備
├── 面試種類：個人、小組、口試、線上
├── 問題分類：動機、經歷、情境、專業
├── 回答框架：STAR-S（Situation→Task→Action→Result→Self-reflection）
├── 自我介紹：1分鐘版 + 3分鐘版
└── 科系特色：醫學(倫理)、師範(教學演示)、設計(作品集)、外文(口說)
```

---

## 五、技術架構

### 5.1 技術棧

| 層 | 技術 | 用途 | 成本 |
|----|------|------|------|
| 前端 | Next.js 14 + Tailwind CSS | 平台 + 工具 | 免費 |
| 後端 | Supabase (PG + Auth + Edge Functions) | API + DB | 免費層 |
| AI（開發期） | GLM API (glm-4.7-flash) | Claude Code 開發、本地測試 | 免費 |
| AI（正式上線） | Google Gemini 2.5 Flash | 分數分析、學習歷程審查、面試模擬 | 免費額度 → $0.30/$2.50 per 1M tokens |
| AI（備援） | OpenAI GPT-4o-mini | Gemini 不可用時 fallback | 付費（低用量） |
| 搜尋 | Supabase pg_trgm | 全文搜尋 | 免費 |
| 圖卡 | HTML Canvas / Sharp | 分享圖卡生成 | 免費 |
| 郵件 | Resend / Supabase Edge Function | Email 行銷 | 免費層 |
| 部署 | Vercel + Supabase Cloud | 託管 | 免費層 |

### 5.1.1 AI API 分階段策略

| 階段 | 用途 | API | 模型 | 理由 |
|------|------|-----|------|------|
| **開發期** | Claude Code 寫程式、規劃 | GLM API (z.ai) | glm-4.7-flash | 免費、已設定好、僅開發用 |
| **正式上線** | 分數分析、學習歷程審查、面試模擬 | Google Gemini API | gemini-2.5-flash | 免費額度、美國公司、台灣家長無疑慮 |
| **正式上線（複雜推理）** | 科系策略報告、深度分析 | Google Gemini API | gemini-2.5-pro | 更強推理能力，免費額度可用 |
| **正式上線（大量簡單任務）** | 管道推薦、FAQ | Google Gemini API | gemini-2.5-flash-lite | 最便宜 $0.10/$0.40 per 1M tokens |
| **Fallback** | 以上不可用時 | OpenAI API | gpt-4o-mini | 第二備援，穩定可靠 |

**實作方式**：
- AI 功能的 API endpoint、model、API key 全部設為環境變數（`.env.local`）
- 不硬編碼任何 API 資訊，隨時可切換
- 開發期用 GLM 測試邏輯，上線前改環境變數即可切到 Gemini
- OpenAI 相容格式（Gemini 和 OpenAI 都支援），切換只需改 base_url + model

### 5.2 DB Schema

```sql
CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  location TEXT,
  website TEXT
);

CREATE TABLE pathways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  timeline JSONB,
  requirements JSONB,
  target_students TEXT[],
  quota_percentage FLOAT,
  tips TEXT[],
  faqs JSONB,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  sub_category TEXT,
  admission_criteria JSONB,
  portfolio_tips JSONB,
  interview_tips JSONB,
  score_history JSONB,
  tags TEXT[],
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE score_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  exam_type TEXT NOT NULL,
  scores JSONB NOT NULL,
  results JSONB NOT NULL,
  shared_card_url TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE anonymous_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  score_range TEXT NOT NULL,
  exam_type TEXT NOT NULL,
  pathway TEXT NOT NULL,
  university TEXT,
  department TEXT,
  academic_year INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE portfolio_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  department_category TEXT,
  examples JSONB,
  common_mistakes TEXT[],
  is_premium BOOLEAN DEFAULT FALSE,
  order_index INT DEFAULT 0,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE interview_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_category TEXT,
  question_type TEXT NOT NULL,
  question TEXT NOT NULL,
  suggested_approach TEXT,
  sample_answer TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  difficulty TEXT DEFAULT 'medium',
  order_index INT DEFAULT 0,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'student',
  subscription_tier TEXT DEFAULT 'free',
  subscription_end TIMESTAMPTZ,
  parent_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT,
  is_parent BOOLEAN DEFAULT FALSE,
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  product_type TEXT NOT NULL,
  amount INT NOT NULL,
  status TEXT DEFAULT 'pending',
  provider TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 校曆與活動（連結器核心）
CREATE TABLE school_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL,
  related_portfolio_codes TEXT[],
  ai_suggestion TEXT,
  is_recorded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 學習歷程素材
CREATE TABLE portfolio_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  portfolio_code TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  source_type TEXT DEFAULT 'manual',
  source_event_id UUID REFERENCES school_calendars(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 成就系統
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  achievement_type TEXT NOT NULL,
  achievement_key TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_key)
);

CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  week_number INT NOT NULL,
  year INT NOT NULL,
  xp_earned INT DEFAULT 0,
  tasks_completed INT DEFAULT 0,
  tasks_total INT DEFAULT 0,
  streak_weeks INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week_number, year)
);
```

### 5.3 分享圖卡技術方案

```
用戶完成分數分析
    ↓
前端 Canvas 生成圖片（1280x720 IG Story 尺寸）
    ├── 學生版：「我的學測 XX 級分 → 適合走申請入學」
    ├── 帶品牌水印 + QR Code
    └── 家長入口：「家長掃碼查看完整報告」
    ↓
用戶長按儲存 → 分享到 IG Story
    ↓
同學看到 → 點擊 QR Code → 來到平台
家長看到 → 點擊 QR Code → 來到家長視角頁面
```

### 5.4 網站頁面結構

```
/                        首頁（學測倒數 + 「把你正在做的事連結到未來」CTA）
/analyze                 分數分析器（核心工具，免費）
/analyze/result          分析結果 + 分享圖卡（繪馬式設計）
/dashboard               個人儀表板（每週任務 + XP + 進度總覽）
/calendar                校曆同步（輸入學校行事曆 + 活動連結）
/portfolio               學習歷程素材管理（按代碼分類 + 進度視覺化）
/explore                 科系探索（58 學類）
/pathways                 升學管道查詢（免費）
/pathways/[slug]          管道詳情
/departments              科系查詢（免費）
/departments/[id]         科系詳情
/achievements            成就牆（徽章 + 等級 + Streak）
/parent                   家長專區（每週進度報告 + 付費服務）
/parent/report           家長完整成長報告（付費）
/pricing                  付費方案
```

---

## 六、產品功能分層

### 免費功能（零門檻）

| 功能 | 學生 | 家長 | 目的 |
|------|------|------|------|
| 分數分析器（學測+統測） | 有 | 有 | 核心工具，病毒傳播 |
| 分享圖卡（IG Story） | 有 | — | 傳播載體 |
| 升學管道查詢 | 有 | 有 | 免費知識建立信任 |
| 科系探索（58 學類） | 有 | 有 | 自我發現的核心 |
| 校曆同步 + 每週活動推薦 | 有 | — | **連結器核心**：附著校園活動 |
| 每週進度追蹤 + XP + 徽章 | 有 | — | **成就感 loop**：持續使用的動力 |
| 學習歷程素材記錄（基本） | 有 | — | 把經歷變成素材 |
| 每週進度報告（家長端，免費版） | — | 有（摘要） | 家長初步看到孩子的動態 |
| 學習歷程入門指南（6篇） | 有 | 有 | 展示專業能力 |
| 學測倒數計時器 | 有 | 有 | 回訪理由 |

### 付費功能（家長付費）

| 功能 | 價格 | 購買者 | 價值 |
|------|------|--------|------|
| 完整成長報告（每週詳細版） | 含在訂閱 | 家長 | 看到孩子的探索歷程、興趣變化、主動記錄 |
| AI 學習歷程審查 | 含在訂閱 | 家長 | 上傳 → AI 回饋修改建議 |
| 面試模擬（AI 文字版） | 含在訂閱 | 家長/學生 | 5 輪模擬面試 + 回饋 |
| 科系策略報告 | 含在訂閱 | 家長 | 針對目標科系的完整策略 |
| 學習歷程素材管理（進階） | 含在訂閱 | 學生 | AI 建議補充素材、空缺分析 |
| 一對一線上諮詢 | NT$1,500/次 | 家長 | 60 分鐘專業諮詢 |
| 季節性訂閱（全包） | NT$1,990/季 | 家長 | 以上全部 + 優先 |

**付費核心價值**：家長付費不是買「工具」，是買「看見孩子成長的持續窗口」。每週報告讓家長看到的不只是分數，而是孩子的探索、興趣、主動性。

### 功能開發優先序

P0（MVP，Week 1-2）：
  1. 分數分析器（學測版）
  2. 分享圖卡生成（IG Story + 繪馬式設計，加入「我的目標」欄位）
  3. Landing page + 學測倒數

P1（核心 loop，Week 3-6）：
  4. 校曆同步（學生輸入學校行事曆，系統自動連結升學代碼）
  5. 每週活動推薦（基於校曆，非系統生成）
  6. 每週進度追蹤 + XP + Streak + 成就徽章
  7. 學習歷程素材記錄（基本版）
  8. 家長每週進度報告（免費摘要版）
  9. 科系探索（58 學類基本資料）

P2（付費產品，Week 7-10）：
  10. 付費牆 + 訂閱系統
  11. 家長完整成長報告（詳細版）
  12. AI 學習歷程審查
  13. 學習歷程素材管理（進階版：AI 建議補充、空缺分析）

P3（擴展，Week 11-16）：
  14. 面試模擬
  15. 科系策略報告
  16. MBTI 式科系測驗（病毒傳播第二引擎）
  17. 高職版（統測分析）
  18. 匿名結果牆

P4（規模化，Month 5+）：
  19. 一對一諮詢排程系統
  20. LINE Bot 整合
  21. 校園大使計畫
  22. 年度提醒系統

---

## 七、內容行銷策略

### 7.1 雙受眾內容矩陣

| 內容 | 目標受眾 | 平台 | 頻率 | 目的 |
|------|---------|------|------|------|
| 「你的分數能上哪裡」短影音 | 學生 | IG/TikTok | 3-4/週 | 病毒傳播 |
| 「學習歷程 100 字這樣寫」 | 學生 | IG/Shorts | 2/週 | 專業信任 |
| 「面試官最愛問的 5 題」 | 學生+家長 | YT 長片 | 2/月 | 深度內容 |
| 「2026 升學制度改革懶人包」 | 家長 | YT/FB | 1/月 | 家長認知 |
| 「你的孩子適合走哪條路」 | 家長 | FB/LINE | 2/月 | 家長獲客 |
| 每週升學建議 Email | 學生+家長 | Email | 1/週 | 信任持續 |

### 7.2 SEO 關鍵字

高優先（立即搶占）：
- 學習歷程怎麼寫、學習歷程範例、多元升學管道
- 繁星推薦 2026、申請入學 學習歷程

長尾矩陣：
- [科系名] 學習歷程、[科系名] 面試
- 高一升學準備、高職升四技、特殊選才

### 7.3 里程碑

| 時間 | 網站 | 社群 | Email | 收入 |
|------|------|------|-------|------|
| Week 2 | 分析器上線 + 圖卡 | IG/YT 開通 | — | $0 |
| Month 1 | +10篇管道資料 | 15 支短影音 | 200 訂閱 | $0 |
| Month 2 | +20篇指南 | 30 支短影音 | 800 訂閱 | $0 |
| Month 3 | 付費功能上線 | 50 支短影音 | 1,500 訂閱 | 首筆收入 |
| Month 6 | 全功能 | 100 支+10長片 | 5,000 訂閱 | NT$60,000/月 |
| Month 12 | 數據飛輪 | 200+短+30長片 | 15,000 訂閱 | NT$200,000/月 |

---

## 八、商業模式

### 8.1 收入來源

| 來源 | 啟動時間 | 月收入預估（Month 12） |
|------|---------|----------------------|
| 付費訂閱（學習歷程+面試） | Month 3 | NT$100,000 |
| 科系策略報告（單次） | Month 4 | NT$30,000 |
| 一對一諮詢 | Month 5 | NT$45,000 |
| YouTube 廣告 | Month 6 | NT$30,000 |
| **總計** | | **NT$205,000/月** |

### 8.2 收入預估

| 時間 | 付費用戶 | 訂閱收入 | 單次+諮詢 | YT廣告 | 總月收入 |
|------|---------|---------|----------|--------|---------|
| Month 3 | 10 家長 | NT$6,000 | NT$3,000 | $0 | NT$9,000 |
| Month 6 | 50 家長 | NT$30,000 | NT$15,000 | NT$5,000 | NT$50,000 |
| Month 9 | 150 家長 | NT$90,000 | NT$30,000 | NT$15,000 | NT$135,000 |
| Month 12 | 300 家長 | NT$180,000 | NT$45,000 | NT$30,000 | NT$255,000 |

### 8.3 定價策略

為什麼是季節性訂閱而非月費：
- 學測是一年一次，升學季是 10 月到次年 8 月
- 家長的決策週期是「升學季」，不是「每個月」
- NT$1,990/季 vs NT$299/月（季 = 3 個月 = NT$897）→ 季節性定價收入更高
- 心理門檻：一次付 1,990 感覺是「對孩子的投資」，每個月 299 感覺是「訂閱費」

### 8.4 留存引擎：連結器的護城河

升學大師的留存不是靠「有用」，是靠「有習慣」。每週成就感 loop 建立的使用習慣是最大的護城河：

- 學生每週回來看進度、記錄活動、賺 XP、維持 Streak → 3 年使用週期
- 家長每週收到孩子的進度報告 → 不會取消訂閱（怕看不到孩子動態）
- 校曆同步讓系統附著在學校活動上 → 不是額外負擔，是日常的一部分
- 成就系統的損失規避（Streak 中斷的遺憾）→ 強制留存

**預期留存**：目標 30 日留存 60%+（對標 Duolingo 的 70%，考慮教育場景稍低）

---

## 九、階段性執行計畫

### Phase 1：MVP — 分數分析器（Week 1-2）

目標：學生能輸入分數、看結果、分享圖卡

- [ ] Day 1-2：Next.js + Supabase 初始化
- [ ] Day 1-2：DB Schema + 種子數據（10 所大學、50 個科系的歷年分數）
- [ ] Day 2-4：分數分析器核心邏輯
  - [ ] 學測 5 科輸入介面（數學選 A/B）
  - [ ] Gemini API 分析（推薦管道 + 推薦科系）
  - [ ] 結果頁面（免費完整呈現）
- [ ] Day 3-5：分享圖卡生成（Canvas → PNG → 下載）
  - [ ] 繪馬式設計：加入「我的目標」欄位（承諾裝置）
  - [ ] 預設匿名選項（台灣「匿名熱、公開冷」）
  - [ ] 正向框架（強調可能性而非限制）
  - [ ] QR Code 指向家長專區
- [ ] Day 5-7：Landing page + 學測倒數
- [ ] Day 7-10：RWD 手機版 + Vercel 部署
- [ ] Day 10-14：GA4 + Search Console + Open Graph

交付物：可用的分數分析器 + 繪馬式分享圖卡 + 學測倒數

### Phase 2：核心 Loop — 連結器上線（Week 3-6）

目標：學生開始每週使用、家長開始看到進度

- [ ] Week 3：校曆同步系統
  - [ ] 學生輸入學校行事曆（手動 + 上傳校曆截圖）
  - [ ] 系統自動將校園活動連結到學習歷程代碼
  - [ ] 全國統一行事曆（學測、英聽、申請入學等固定日期）
- [ ] Week 3：每週活動推薦
  - [ ] 週一生成本週可記錄的活動清單（基於校曆）
  - [ ] 每項活動標注對應的學習歷程代碼
  - [ ] 輕量記錄介面（文字 + 圖片，15-30 分鐘/項）
- [ ] Week 3-4：成就系統
  - [ ] XP 經驗值（不同任務不同 XP）
  - [ ] 週 Streak（連續每週有記錄）
  - [ ] 等級系統（升學新手 → 升學大師，7 級）
  - [ ] 成就徽章（初探者、連續 4 週、跨領域探索等）
  - [ ] 每月 1 次「任務延期卡」（寬容機制）
- [ ] Week 4-5：每週進度報告
  - [ ] 週日晚間推送（學生端：本週成就 + 下週建議）
  - [ ] 週日晚間推送（家長端：孩子的探索 + 進度摘要）
- [ ] Week 4-5：學習歷程素材記錄（基本版）
  - [ ] 按代碼分類（B/C/D/E/F-M）
  - [ ] 進度視覺化（各代碼完成度）
- [ ] Week 5-6：科系探索（58 學類基本資料）
- [ ] Week 6：家長註冊 + 免費週報

交付物：核心成就感 loop 上線、學生每週使用、家長開始看到進度

### Phase 3：付費產品上線（Week 7-10）

目標：首筆家長付費

- [ ] Week 7：Supabase Auth + 用戶系統
- [ ] Week 7：付費牆（Stripe / LINE Pay）
- [ ] Week 7-8：家長完整成長報告
  - [ ] 每週詳細版（孩子的探索歷程、興趣變化、主動記錄）
  - [ ] 成長亮點（AI 自動摘要孩子的正面表現）
  - [ ] 親子共同探索建議（基於孩子興趣的 Open Day、科系推薦）
- [ ] Week 8-9：AI 學習歷程審查
  - [ ] 上傳學習歷程 → Gemini 分析 → 修改建議
  - [ ] 按科系分類的建議
  - [ ] 素材空缺分析（還缺什麼代碼）
- [ ] Week 9-10：付費流程優化
  - [ ] 產品介紹頁
  - [ ] 付費方案頁
  - [ ] 試用體驗（首次免費審查）
- [ ] Week 10：付費用戶數據追蹤 + 轉化漏斗分析

交付物：付費系統上線、首筆收入

### Phase 4：擴展（Week 11-16）

目標：付費用戶 50+、月收入 NT$50,000

- [ ] Week 11-12：面試模擬（AI 文字版 5 輪）
- [ ] Week 12-13：MBTI 式科系測驗（病毒傳播第二引擎）
- [ ] Week 13-14：高職版（統測分數分析）
- [ ] Week 14-15：匿名結果牆（社會證明 + 比較動機）
- [ ] Week 15-16：付費功能持續優化 + 用戶回饋迭代

交付物：4 個付費功能、高職版、病毒測驗

### Phase 5：規模化（Month 5+）

目標：月收入 NT$200,000+

- [ ] 匿名結果數據收集 + 展示
- [ ] 年度學測季提醒系統
- [ ] 一對一諮詢排程系統
- [ ] 校園合作（到校演講）
- [ ] 口碑推薦機制（邀請碼）
- [ ] 手機 App（選項）

---

## 十、風險與應對

| 風險 | 可能性 | 影響 | 應對 |
|------|--------|------|------|
| GLM API 不穩定/下線 | 低 | 低 | GLM 僅用於開發期，正式上線用 Gemini，無影響 |
| Gemini API 額度用盡 | 中 | 中 | Flash 免費額度 + Lite 低成本 + OpenAI fallback 三層備援 |
| 免費用戶不轉付費 | 中 | 中 | Email 行銷持續建立信任，家長是不同決策者 |
| 短影音沒有爆發 | 中 | 中 | 同時做 SEO 長尾內容，不依賴單一渠道 |
| 信任建立太慢 | 中 | 高 | 優化分享圖卡的病毒傳播，降低信任門檻 |
| 補教業競爭 | 低 | 低 | 差異化：策略指導而非科目教學，價格是 1/40 |
| 制度年度改變 | 高 | 低 | 管道數據每年 9-10 月更新 |
| 付費家長太少 | 中 | 高 | 免費工具持續獲客，拉長信任建立週期 |
| 內容不夠專業 | 中 | 高 | 找有經驗的升學輔導老師做顧問審核 |
| 政治風險（API 資料流向） | 低 | 高 | **已消除**：開發期用 GLM（不接觸用戶資料），正式上線用 Google Gemini（美國公司、台灣家長無疑慮）。所有 AI API 設為環境變數，可隨時切換 |
| 遊戲化變質 | 中 | 中 | 任務本身要有實質價值，不能讓學生「為了 streak 而做任務」。校曆同步確保任務來自真實活動 |
| 校曆同步門檻 | 中 | 中 | 初期手動輸入，中期支援截圖辨識，長期與學校系統整合 |

---

## 附錄：年度時間軸

```
高二下學期：
  10月：英聽測驗、特殊選才公告
  12月：英聽測驗
  10-3月：特殊選才報名/甄試/放榜

高三上學期：
  1月：學測 ← 分數分析器最熱的時刻
  3月：繁星推薦（3-4月放榜）
  3-4月：申請入學報名
  4-5月：申請入學一階篩選
  5-6月：申請入學二階甄試 → 6月放榜

高三下學期：
  5月：統測
  7月：分科測驗
  7-8月：分發入學、四技分發

→ 分數分析器在 1 月（學測後）和 7 月（分科後）有兩個流量高峰
→ 付費產品在 3-6 月（申請入學季）最活躍
→ Email 行銷：全年持續，10-12 月加強推送（學測季即將到來）
→ 短影音：全年持續，1 月和 6-8 月加大產出
```
