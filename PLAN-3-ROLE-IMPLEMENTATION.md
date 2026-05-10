# 升學大師 v2.0 - 3角色系統漸進式實施計畫

## Context

升學大師已完成策略重新定位，從「學習歷程管理平台」轉變為「高職升學路徑發現引擎」。核心問題是99%的高職生不知道自己有6種升學管道。為解決這個問題，我們設計了3角色系統來引導用戶從認知空白到行動轉化：

1. **Explorer (探索者)** - 發現階段：「原來我有這些選擇？」
2. **Planner (規劃者)** - 規劃階段：「如何最大化我的升學機會？」  
3. **Guide (引路人)** - 引導階段：「幫助學弟學妹避免走彎路」

本計畫採用「方案 A - 漸進式實施」，將3角色系統分3個階段在6週內完成，每個階段都能獨立驗證價值，降低技術和商業風險。

## Recommended Approach

### Phase 1: Explorer Experience (Week 1-2)
**目標**：建立「發現」核心體驗，解決認知空白問題

**核心功能**：
1. **首頁 Explorer 主題改造** - 從成績管理思維轉向路徑發現
2. **職群快速選擇器** - 15個職群的分類顯示和選擇
3. **第一次發現頁面** - 即時計算用戶潛在升學路徑，製造驚喜感

**技術實施**：
- 完全重寫 [src/app/page.tsx](src/app/page.tsx)，採用 Explorer 視覺主題
- 整合現有 [VocationalGroupSelector.tsx](src/components/VocationalGroupSelector.tsx) 組件到註冊流程
- 新建 `src/app/first-discovery/page.tsx`，實現路徑計算邏輯
- 修改現有註冊流程，確保職群選擇正確保存到資料庫

**成功指標**：
- 新用戶註冊率 > 60%
- 「第一次發現」頁面完成率 > 80%
- 用戶反饋：「原來我還有這個選擇」 > 50%

### Phase 2: Planner Functionality (Week 3-4)
**目標**：提供規劃工具，從認知轉向行動

**核心功能**：
1. **規劃中心** - 個人化升學路徑規劃工具
2. **能力帳戶重新設計** - 從統計展示轉向行動指引
3. **經驗值系統** - 記錄用戶成長，觸發角色轉換

**技術實施**：
- 新建 `src/app/planning-center/page.tsx`，實現規劃工具
- 大幅修改 [src/app/ability-account/page.tsx](src/app/ability-account/page.tsx)，重新設計信息架構
- 實現 `src/lib/role-xp-system.ts`，建立經驗值計算和角色轉換邏輯
- 建立 [src/lib/storage.ts](src/lib/storage.ts) 資料庫同步機制

**成功指標**：
- Explorer → Planner 轉換率 > 40%
- 用戶記錄第一個經歷比例 > 30%
- 規劃工具使用率 > 60%

### Phase 3: Guide System (Week 5-6)
**目標**：建立引導機制，形成正向循環

**核心功能**：
1. **引路人中心** - 經驗分享和指導平台
2. **故事系統** - 成功案例和彎路警告
3. **指導機制** - 學長姐指導學弟學妹

**技術實施**：
- 新建 `src/app/guide-hub/page.tsx`，實現引導平台
- 建立故事分享系統和評分機制
- 實現指導匹配和溝通工具
- 完善病毒傳播機制（邀請獎勵、分享功能）

**成功指標**：
- Planner → Guide 轉換率 > 20%
- 故事分享率 > 15%
- 病毒係數 (k-factor) > 1.2

## Technical Architecture

### 資料庫架構
使用現有的 [supabase/migrations/20260510_add_role_management.sql](supabase/migrations/20260510_add_role_management.sql)：
- `user_roles` - 用戶角色和等級
- `role_evolution` - 角色轉換歷史
- `role_achievements` - 成就系統
- `xp_history` - 經驗值記錄

### 前端組件架構
```
src/
├── app/
│   ├── page.tsx (Explorer 主題首頁)
│   ├── first-discovery/page.tsx (第一次發現體驗)
│   ├── planning-center/page.tsx (規劃中心)
│   ├── guide-hub/page.tsx (引路人平台)
│   └── ability-account/page.tsx (重新設計為能力帳戶)
├── components/
│   ├── VocationalGroupSelector.tsx (現有，重用)
│   └── roles/ (新建角色系統組件)
│       ├── RoleBadge.tsx
│       ├── RoleProgress.tsx
│       └── RoleTransition.tsx
└── lib/
    ├── role-xp-system.ts (經驗值系統)
    ├── role-transition.ts (角色轉換邏輯)
    └── storage.ts (增強資料庫同步)
```

### 用戶旅程設計
1. **註冊** → 選擇職群 → Explorer 覺醒
2. **第一次發現** → 了解6種管道 → 激發規劃動機
3. **規劃中心** → 記錄經歷 → 累積經驗值 → Planner 角色轉換
4. **能力帳戶** → 查看成長 → 分享經驗 → Guide 覺醒
5. **引路人平台** → 指導他人 → 病毒傳播

## Critical Files & Priorities

### 立即修改 (Phase 1)
1. **[src/app/page.tsx](src/app/page.tsx)** - 最高優先級，首頁 Explorer 主題改造
2. **src/app/first-discovery/page.tsx** - 新建，第一次發現體驗
3. **[src/app/login/page.tsx](src/app/login/page.tsx)** - 已完成職群選擇器整合，需驗證

### 中期修改 (Phase 2)
1. **[src/app/ability-account/page.tsx](src/app/ability-account/page.tsx)** - 重新設計為行動指引
2. **src/app/planning-center/page.tsx** - 新建規劃中心
3. **[src/lib/storage.ts](src/lib/storage.ts)** - 增強資料庫同步邏輯
4. **src/lib/role-xp-system.ts** - 新建經驗值系統

### 長期修改 (Phase 3)
1. **src/app/guide-hub/page.tsx** - 新建引導平台
2. **src/lib/role-transition.ts** - 新建角色轉換邏輯
3. 病毒傳播機制實現

## Risk Control & Validation

### 技術風險控制
- **漸進式部署**：每個 Phase 獨立驗證，避免全盤失敗
- **向後兼容**：保留現有功能，新功能採用 additive 方式
- **資料庫遷移**：使用已準備好的 migration 腳本，分階段執行
- **A/B 測試**：關鍵頁面提供不同版本，監控用戶反應

### 商業風險控制
- **用戶驗證**：每個 Phase 設計明確的成功指標
- **快速迭代**：2週一個週期，快速調整方向
- **成本控制**：使用現有 Supabase 基礎設施，避免額外投資
- **監控機制**：建立完整的用戶行為追蹤

### 驗證策略
1. **Alpha 測試** (Phase 1) - 5-10名真實高職生
2. **Beta 測試** (Phase 2) - 50名用戶 A/B 測試  
3. **完整驗證** (Phase 3) - 100名用戶病毒傳播測試

## Implementation Timeline

### Week 1-2: Explorer Experience
- Day 1-3: 首頁 Explorer 主題改造
- Day 4-5: 第一次發現頁面開發
- Day 6-7: Alpha 測試和調整

### Week 3-4: Planner Functionality  
- Day 1-3: 規劃中心開發
- Day 4-5: 能力帳戶重新設計
- Day 6-7: Beta 測試和優化

### Week 5-6: Guide System
- Day 1-3: 引導平台開發
- Day 4-5: 病毒傳播機制
- Day 6-7: 完整驗證和發布

## Success Metrics

### 技術指標
- 每個 Phase 按時完成率 > 90%
- 系統穩定性 > 99%
- 頁面載入速度 < 2秒

### 用戶體驗指標  
- 新用戶註冊率 > 60%
- Explorer → Planner 轉換率 > 40%
- Planner → Guide 轉換率 > 20%

### 商業指標
- 病毒係數 > 1.2
- 7日留存率 > 40%
- 用戶滿意度 > 4.0/5.0

這個計畫確保升學大師能順利轉型為「高職升學路徑發現引擎」，同時保持系統穩定性和用戶體驗的連續性。漸進式實施讓我們能在每個階段驗證假設、調整方向，最終建立可持續成長的用戶生態系統。