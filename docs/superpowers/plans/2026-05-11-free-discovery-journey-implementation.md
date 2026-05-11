# 免費發現之旅實作計畫（含光域風格重構）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 實作「以終為始」的免費發現之旅 6 步驟流程，完全遵循光域風格 UI 設計原則

**Architecture:** 
- 單頁 React 元件，無頁面跳轉，完全在 `/first-discovery` 頁面實作
- 全螢幕沉浸式體驗，沒有導覽列、沒有按鈕、一次一個問題
- 狀態完全存在 localStorage，不需要登入即可使用完整流程
- 背景顏色隨步驟漸變（6 種不同漸層色）

**Tech Stack:** Next.js 14 App Router + React + TypeScript + Tailwind CSS + Framer Motion

**UI 設計原則（光域風格）**：
1. 一次一個問題：全螢幕、沒有導覽列、90% 內容 / 10% 介面
2. 沒有按鈕：完成輸入自動前進、滑動導航、永遠看不到「送出」「下一頁」
3. 流暢過渡：淡入+滑入動畫、進度條平滑增長、背景色隨步驟漸變
4. 隨時回頭：滑回去修改、修改後自動更新下游計算
5. 沒有評斷：永遠只說「如果你想要這個，你需要做什麼」

---

## 檔案結構

| 檔案 | 用途 |
|------|------|
| `src/app/first-discovery/page.tsx` | 主頁面，6 步驟完整流程（光域風格） |
| `src/lib/department-database.ts` | 科系入學要求資料庫邏輯（已完成） |
| `src/types/department.ts` | TypeScript 型別定義（已完成） |
| `src/components/DiscoveryProgress.tsx` | 極簡進度指示器（非傳統進度條） |
| `src/components/StepTransition.tsx` | 步驟過渡動畫元件 |
| `supabase/migrations/20260511_department_requirements.sql` | 資料庫遷移（已完成） |

---

## ✅ Task 1: 建立科系入學要求資料庫結構 (已完成: eaaf8fa)

**Files:**
- Create: `supabase/migrations/20260511_department_requirements.sql`
- Create: `src/types/department.ts`

---

## ✅ Task 2: 建立科系資料庫邏輯與搜尋 API (已完成: a1b9fcf + 98977ef)

**Files:**
- Create: `src/lib/department-database.ts`
- Create: `src/app/api/departments/search/route.ts`

---

## ✅ Task 3: 前 2 步驟 UI (已完成: 6bf966d)

**Files:**
- Create: `src/components/DiscoveryProgress.tsx`
- Modify: `src/app/first-discovery/page.tsx`

---

## ✅ Task 4: 步驟 2-5 完整流程 (已完成: 4dcaef2)

**Files:**
- Modify: `src/app/first-discovery/page.tsx`

---

## ✅ Task 5: 科系資料庫擴充 (已完成: 5b0f5bb)

**Files:**
- Modify: `src/lib/department-database.ts`

---

## Task 6: 光域風格 UI 重構 - 核心框架

**Files:**
- Rewrite: `src/app/first-discovery/page.tsx`
- Rewrite: `src/components/DiscoveryProgress.tsx`
- Create: `src/components/StepTransition.tsx`

**目標**: 移除所有按鈕、導覽列，改為全螢幕沉浸式體驗

- [ ] **Step 1: 建立 StepTransition 動畫元件**

```tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface StepTransitionProps {
  children: React.ReactNode
  stepKey: number
  direction: 'forward' | 'backward'
}

export default function StepTransition({ children, stepKey, direction }: StepTransitionProps) {
  const variants = {
    enter: (direction: string) => ({
      x: direction === 'forward' ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: string) => ({
      x: direction === 'forward' ? '-100%' : '100%',
      opacity: 0,
    }),
  }

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={stepKey}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: 改寫 DiscoveryProgress 為極簡進度指示**

```tsx
'use client'

const STEP_COLORS = [
  'bg-blue-400',    // 步驟 1: 淡藍
  'bg-purple-400',  // 步驟 2: 淡紫
  'bg-emerald-400', // 步驟 3: 淡綠
  'bg-amber-400',   // 步驟 4: 淡金
  'bg-orange-400',  // 步驟 5: 淡橙
  'bg-pink-400',    // 步驟 6: 淡粉
]

export default function DiscoveryProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-gray-100">
        <div
          className={`h-full transition-all duration-700 ease-out ${STEP_COLORS[currentStep]}`}
          style={{ width: `${((currentStep + 1) / 6) * 100}%` }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 定義 6 步驟背景漸變色**

```typescript
const STEP_GRADIENTS = [
  'from-blue-50 via-sky-50 to-indigo-50',      // 步驟 1: 我想去哪裡（淡藍）
  'from-purple-50 via-violet-50 to-fuchsia-50', // 步驟 2: 目標需要什麼（淡紫）
  'from-emerald-50 via-teal-50 to-cyan-50',     // 步驟 3: 我現在有什麼（淡綠）
  'from-amber-50 via-yellow-50 to-orange-50',   // 步驟 4: 我的差距在哪裡（淡金）
  'from-orange-50 via-rose-50 to-red-50',       // 步驟 5: 我需要完成什麼（淡橙）
  'from-pink-50 via-rose-50 to-purple-50',      // 步驟 6: 我的時間表（淡粉）
]
```

- [ ] **Step 4: 改寫主頁面框架**

關鍵改動：
- 移除頂部導覽列
- 移除所有 `<button onClick={goNext}>` 形式的按鈕
- 選擇選項後自動前進（用 `setTimeout(() => goToStep(n), 600)` 延遲）
- 支援滑動手勢（觸控裝置上下滑動切換步驟）
- 背景色 `transition-all duration-700` 跟隨步驟變化
- 全螢幕 `min-h-screen` 搭配 `flex items-center justify-center`

- [ ] **Step 5: 安裝 framer-motion**

```bash
npm install framer-motion
```

- [ ] **Step 6: 驗證 build 通過**

```bash
npx next build
```

- [ ] **Step 7: Commit**

```bash
git add src/components/StepTransition.tsx src/components/DiscoveryProgress.tsx src/app/first-discovery/page.tsx package.json
git commit -m "refactor: light-domain style UI framework - remove buttons, add transitions"
```

---

## Task 7: 光域風格重構 - 步驟內容改寫

**Files:**
- Modify: `src/app/first-discovery/page.tsx`

**目標**: 每個步驟改為全螢幕、一次一個輸入、自動前進

- [ ] **Step 1: 步驟 1 改寫 - 全螢幕搜尋**

關鍵改動：
- 搜尋框佔滿畫面中央，字體 text-5xl
- 搜尋結果以浮動卡片呈現，帶淡入動畫
- 選擇 1 個科系後自動前進（600ms 延遲）
- 無任何按鈕

- [ ] **Step 2: 步驟 2 改寫 - 管道卡片滑動**

關鍵改動：
- 6 張管道卡片垂直排列，每張全螢幕寬度
- 點擊卡片展開詳情（不前進到下一步）
- 底部有細微的「向下滑動查看更多」提示
- 點擊「選擇這條路」→ 自動前進到步驟 3

- [ ] **Step 3: 步驟 3 改寫 - 全螢幕逐題**

這是光域風格最核心的改動：

關鍵改動：
- 每個問題獨立為一個全螢幕畫面
- 子步驟狀態：3a(年級) → 3b(成績) → 3c(證照) → 3d(競賽) → 3e(專題)
- 選擇選項後自動前進到下一個子問題
- 頂部進度條顯示子問題進度（5 題中的第 N 題）
- 所有子問題完成後自動前進到步驟 4

```typescript
// 子步驟狀態
type SubStep = 'grade' | 'percentile' | 'certificate' | 'competition' | 'project'

const SUB_STEP_ORDER: SubStep[] = ['grade', 'percentile', 'certificate', 'competition', 'project']

// 選擇後自動前進
const handleSubAnswer = (field: SubStep, value: any) => {
  setInventory(prev => ({ ...prev, [field]: value }))
  const nextIndex = SUB_STEP_ORDER.indexOf(field) + 1
  if (nextIndex < SUB_STEP_ORDER.length) {
    setTimeout(() => setCurrentSubStep(SUB_STEP_ORDER[nextIndex]), 600)
  } else {
    // 所有問題完成，計算差距並自動前進
    setTimeout(() => {
      calculateGap()
      goToStep(4)
    }, 600)
  }
}
```

- [ ] **Step 4: 步驟 4 改寫 - 魔法時刻**

關鍵改動：
- 機率數字以動畫從 0 跳到最終值
- ✅/🟡/🔴 項目逐個淡入（每項延遲 200ms）
- 底部「如果你完成這些 → 預估機率」帶有強調動畫
- 無按鈕，3 秒後自動出現「向下滑動查看行動計畫」提示
- 滑動自動前進到步驟 5

- [ ] **Step 5: 步驟 5 改寫 - 待辦清單**

關鍵改動：
- 待辦項目逐個浮現（每項延遲 300ms）
- 勾選帶有滿足感動畫
- 勾選所有「重要」項目後自動出現「向下滑動查看時間表」

- [ ] **Step 6: 步驟 6 獨立 - 時間表**

關鍵改動：
- 從步驟 5 拆分為獨立步驟
- 垂直時間線，每個里程碑帶倒數天數
- 底部：儲存 / 分享 / 開始完整規劃（這裡允許有行動按鈕，因為是終點）

- [ ] **Step 7: 加入滑動手勢支援**

```typescript
// 觸控滑動偵測
const [touchStart, setTouchStart] = useState(0)
const [touchEnd, setTouchEnd] = useState(0)

const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientY)
const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientY)
const handleTouchEnd = () => {
  if (touchStart - touchEnd > 75) goNext()   // 向上滑 → 下一步
  if (touchEnd - touchStart > 75) goBack()   // 向下滑 → 上一步
}
```

- [ ] **Step 8: 完整端對端測試**

```bash
npx next build
```

- [ ] **Step 9: Commit**

```bash
git add src/app/first-discovery/page.tsx
git commit -m "refactor: light-domain style - full screen, auto-advance, swipe, step-by-step questions"
```

---

## Task 8: 光域風格細節打磨

**Files:**
- Modify: `src/app/first-discovery/page.tsx`

- [ ] **Step 1: 加入返回手勢提示**
- 在每個步驟底部加入極細的「↓ 返回修改」提示
- 點擊後平滑回到對應步驟

- [ ] **Step 2: 加入進度恢復**
- 頁面載入時檢查 localStorage
- 如果有未完成的發現之旅，自動恢復到上次步驟

- [ ] **Step 3: 加入分享和儲存動畫**
- 儲存時有滿足感的動畫效果
- 分享時有飛出動畫

- [ ] **Step 4: Build 驗證**

```bash
npx next build
```

- [ ] **Step 5: Commit**

```bash
git add src/app/first-discovery/page.tsx
git commit -m "feat: light-domain polish - gestures, recovery, animations"
```

---

## Plan Self-Review ✅

1. **Spec coverage**: 完整覆蓋光域風格 5 大設計原則和 6 步驟流程
2. **Placeholder scan**: 沒有 TBD，所有步驟都有具體實作指引
3. **Type consistency**: 型別定義與之前的任務一致
4. **光域風格完整性**: 
   - ✅ 全螢幕沉浸
   - ✅ 一次一個問題（步驟 3 改為逐題）
   - ✅ 沒有按鈕（自動前進 + 滑動）
   - ✅ 流暢過渡（Framer Motion）
   - ✅ 背景色漸變（6 種色）
   - ✅ 隨時回頭（滑動手勢）
   - ✅ 沒有評斷（差距 = 機會）
