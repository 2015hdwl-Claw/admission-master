---
name: admission-master
description: Taiwan admission platform - free for students, paid coaching for parents
type: project
---

# 升學大師 Admission Master — 完整專案計畫（最終版）

> 建立：2026-04-20 | 狀態：規劃完成，待執行
> 核心：學生免費傳播 + 家長付費 + 透明窗口

---

## 一、產品定位與核心洞察

### 一句話定位
**「輸入分數，看見未來 — 台灣高中生和家長的升學透明窗口」**

### 核心洞察：雙邊平台邏輯

學生（免費用戶）              家長（付費用戶）
     |                           |
     | 短影音 / 分享圖卡          | 孩子分享的結果
     | 病毒式傳播                  | 口碑推薦
     | 來到平台                   | 來到平台
     | 免費查升學管道              | 看到孩子的分析結果
     | 免費分數分析               | 「原來我孩子適合走申請入學」
     | 免費查科系資料              | 想確認孩子走在對的路上
     | 想要更深入的幫助             | → 付費：學習歷程輔導
     | → 告訴家長                  | → 付費：面試準備
     |                           | → 付費：一對一諮詢
     +---------------------------+
              透明窗口
     「學生和家長都能看見未來」

**不是 SaaS，不是內容平台，是一個透明窗口。**
學生免費用、幫你傳播。家長付費、為孩子的確定感買單。

### 差異化定位

| 現有玩家 | 問題 | 我們的優勢 |
|---------|------|-----------|
| ColleGo! 官方 | UX 差、不教策略、家長看不懂 | 學生+家長雙視角，一句話結論 |
| 補教業 | 教科目、一個月 8,000+ | 教策略，免費入門，付費是補習班的 1/40 |
| PTT/Dcard | 碎片化、無法查詢 | 結構化 + 個人化分析 |
| 親子天下 | 泛教育、非升學專注 | 垂直深度 + 即時互動工具 |

### 為什麼是「透明窗口」
台灣家長很難管高中生。這個平台讓家長看見孩子的升學選項、分析結果、準備進度。不是監控，是透明。學生也能自己掌握未來，不需要完全依賴學校輔導室。

---

## 二、用戶畫像與行為路徑

### 學生行為路徑

```
發現階段              使用階段              分享階段
IG Reels 看到          輸入 5 科級分          生成精美圖卡
「你的分數能上哪裡」    AI 分析 3 秒            分享到 IG Story
↓                    推薦升學管道            同學看到圖卡
點擊連結來到平台       推薦 5 個科系            點擊連結來到平台
                     （免費完整呈現）        → 病毒循環
                     掃碼/連結告訴家長
```

### 家長行為路徑

```
認知階段              了解階段              付費階段
孩子分享圖卡          看到孩子的分析結果       想要更深入幫助孩子
「爸你看我的分析」    「原來申請入學         免費信件建立信任 3-6 週
↓                    最適合我家孩子」        學習歷程輔導 NT$599
看到平台              免費註冊查看            面試準備 NT$599
初步信任（孩子用的）   更詳細的科系資料         一對一諮詢 NT$1,500
                     學習歷程指南（免費6篇）
```

### 關鍵交匯點
- **分享圖卡**：學生的分享行為 = 家長的認知入口
- **分析結果頁**：同時對學生（你該走哪條路）和家長（你孩子適合什麼）說話
- **免費郵件**：持續接觸，從「知道」到「信任」到「付費」

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
| AI 主力 | GLM API (glm-4.7-flash) | 分數分析、學習歷程審查 | 免費 |
| AI 備援 | OpenAI / Claude API | GLM 不可用時的 fallback | 付費（低用量） |
| 搜尋 | Supabase pg_trgm | 全文搜尋 | 免費 |
| 圖卡 | HTML Canvas / Sharp | 分享圖卡生成 | 免費 |
| 郵件 | Resend / Supabase Edge Function | Email 行銷 | 免費層 |
| 部署 | Vercel + Supabase Cloud | 託管 | 免費層 |

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
/                        首頁（學測倒數 + 「輸入分數看見未來」CTA）
/analyze                 分數分析器（核心工具，免費）
/analyze/result          分析結果 + 分享圖卡
/pathways                 升學管道查詢（免費）
/pathways/[slug]          管道詳情
/departments              科系查詢（免費）
/departments/[id]         科系詳情
/portfolio                學習歷程指南（6篇免費 + 付費深度內容）
/portfolio/[code]         各代碼指南
/interview                面試準備（基礎免費 + 付費模擬面試）
/parent                   家長專區（解釋升學制度 + 付費服務介紹）
/pricing                  付費方案
/email                    Email 訂閱入口（首頁彈窗）
```

---

## 六、產品功能分層

### 免費功能（零門檻）

| 功能 | 學生 | 家長 | 目的 |
|------|------|------|------|
| 分數分析器（學測+統測） | 有 | 有 | 核心工具，病毒傳播 |
| 分享圖卡（IG Story） | 有 | 有 | 傳播載體 |
| 升學管道查詢 | 有 | 有 | 免費知識建立信任 |
| 科系基本資訊+歷年分數 | 有 | 有 | 有用但不需要付費 |
| 學習歷程入門指南（6篇） | 有 | 有 | 展示專業能力 |
| 面試基礎題庫（10題） | 有 | 有 | 免費試用 |
| 學測倒數計時器 | 有 | 有 | 回訪理由 |
| Email 訂閱（每週建議） | 有 | 有 | 信任持續建立 |

### 付費功能（家長付費）

| 功能 | 價格 | 購買者 | 價值 |
|------|------|--------|------|
| 學習歷程 AI 審查 | NT$599/季 | 家長 | 上傳 → AI 回饋修改建議 |
| 面試模擬（AI 文字版） | NT$599/季 | 家長/學生 | 5 輪模擬面試 + 回饋 |
| 科系策略報告 | NT$599/份 | 家長 | 針對目標科系的完整策略 |
| 一對一線上諮詢 | NT$1,500/次 | 家長 | 60 分鐘專業諮詢 |
| 季節性訂閱（全包） | NT$1,990/季 | 家長 | 以上全部 + 優先 |

### 功能開發優先序

P0（MVP，Week 1-2）：
  1. 分數分析器（學測版）
  2. 分享圖卡生成
  3. Landing page + 學測倒數

P1（信任建立，Week 3-6）：
  4. Email 訂閱 + 行銷自動化
  5. 升學管道資料頁（15+ 管道）
  6. 短影音量產（每週 3-4 支）

P2（付費產品，Week 7-10）：
  7. 付費牆 + 訂閱系統
  8. 學習歷程 AI 審查
  9. 家長專區頁面

P3（擴展，Week 11-16）：
  10. 面試模擬
  11. 科系策略報告
  12. 高職版（統測分析）
  13. LINE Bot 整合

P4（規模化，Month 5+）：
  14. 一對一諮詢排程系統
  15. 匿名結果數據
  16. 年度提醒系統

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

---

## 九、階段性執行計畫

### Phase 1：MVP — 分數分析器（Week 1-2）

目標：學生能輸入分數、看結果、分享圖卡

- [ ] Day 1-2：Next.js + Supabase 初始化
- [ ] Day 1-2：DB Schema + 種子數據（10 所大學、50 個科系的歷年分數）
- [ ] Day 2-4：分數分析器核心邏輯
  - [ ] 學測 5 科輸入介面（數學選 A/B）
  - [ ] GLM API 分析（推薦管道 + 推薦科系）
  - [ ] 結果頁面（免費完整呈現）
- [ ] Day 3-5：分享圖卡生成（Canvas → PNG → 下載）
  - [ ] 學生版圖卡
  - [ ] QR Code 指向家長專區
- [ ] Day 5-7：Landing page + 學測倒數
- [ ] Day 6-8：手動整理 15 個升學管道資料
- [ ] Day 7-10：RWD 手機版 + Vercel 部署
- [ ] Day 10-14：GA4 + Search Console + Open Graph

交付物：可用的分數分析器 + 分享圖卡 + 學測倒數

### Phase 2：信任建立（Week 3-6）

目標：Email 1,000+、短影音 30+、家長開始來

- [ ] Week 3：Email 訂閱系統
- [ ] Week 3：家長專區頁面（制度解釋 + 服務介紹）
- [ ] Week 3-4：升學管道資料頁（15+ 管道完整資料）
- [ ] Week 3-4：短影音量產開始（每週 3-4 支 IG Reels）
- [ ] Week 4-5：學習歷程免費指南（6 篇入門）
- [ ] Week 5-6：科系查詢功能（搜尋 + 學群篩選）
- [ ] Week 5-6：面試基礎題庫（10 題免費）
- [ ] Week 6：Email 行銷自動化（每週 1 封有價值郵件）

交付物：Email 1,000+、30+ 短影音、完整管道資料、家長開始註冊

### Phase 3：付費產品上線（Week 7-10）

目標：首筆家長付費

- [ ] Week 7：Supabase Auth + 用戶系統
- [ ] Week 7：付費牆（Stripe / LINE Pay）
- [ ] Week 7-8：學習歷程 AI 審查功能
  - [ ] 上傳學習歷程 → GLM 分析 → 修改建議
  - [ ] 按科系分類的建議
- [ ] Week 8-9：家長付費流程優化
  - [ ] 產品介紹頁
  - [ ] 付費方案頁
  - [ ] 試用體驗（首次免費審查）
- [ ] Week 9-10：科系策略報告功能
- [ ] Week 10：付費用戶數據追蹤 + 轉化漏斗分析

交付物：付費系統上線、首筆收入

### Phase 4：擴展（Week 11-16）

目標：付費用戶 50+、月收入 NT$50,000

- [ ] Week 11-12：面試模擬（AI 文字版 5 輪）
- [ ] Week 12-13：高職版（統測分數分析）
- [ ] Week 13-14：LINE Bot（查詢分析結果）
- [ ] Week 14-15：YouTube 長影片（每月 2 支深度內容）
- [ ] Week 15-16：付費功能持續優化 + 用戶回饋迭代

交付物：4 個付費功能、高職版、LINE Bot

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
| GLM API 不穩定/下線 | 中 | 高 | 備援 OpenAI/Claude API，分數分析邏輯本地化 |
| 免費用戶不轉付費 | 中 | 中 | Email 行銷持續建立信任，家長是不同決策者 |
| 短影音沒有爆發 | 中 | 中 | 同時做 SEO 長尾內容，不依賴單一渠道 |
| 信任建立太慢 | 中 | 高 | 優化分享圖卡的病毒傳播，降低信任門檻 |
| 補教業競爭 | 低 | 低 | 差異化：策略指導而非科目教學，價格是 1/40 |
| 制度年度改變 | 高 | 低 | 管道數據每年 9-10 月更新 |
| 付費家長太少 | 中 | 高 | 免費工具持續獲客，拉長信任建立週期 |
| 內容不夠專業 | 中 | 高 | 找有經驗的升學輔導老師做顧問審核 |
| 政治風險（API） | 低 | 高 | 使用多個 API 來源，本地化關鍵邏輯 |

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
