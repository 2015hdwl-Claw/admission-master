# 升學大師 v2.0 實施計畫

## 背景與問題

升學大師已完成重新定位策略規劃（PROJECT-EXECUTION-PLAN-v2.md），從「學習歷程管理平台」轉變為「高職升學路徑發現引擎」。經過深入的代碼探索分析，發現當前系統存在以下關鍵問題需要立即解決：

### 核心技術問題
1. **註冊流程缺陷**：註冊時硬編碼 `group_code: '01'`，用戶無法選擇真實職群
2. **Onboarding 斷連**：現有 5 步驟 onboarding 只使用 localStorage，不與資料庫同步
3. **角色系統未實現**：資料庫 schema 已完成，但缺少前端 UI 和流程控制
4. **產品定位混亂**：首頁和用戶旅程仍停留在 v1.0 「成績管理」思維

### 與 v2.0 重新定位的衝突
- 當前：註冊 → 能力帳戶 → 可選 onboarding
- 目標：註冊 → 職群選擇 → Pathfinder 覺醒 → 角色進化系統

## 實施策略

### 階段一：基礎修復與穩定 (Week 1)
**目標**：修復關鍵技術問題，為角色系統奠定基礎

#### 1.1 修復註冊流程中的職群選擇
**問題**：目前註冊時自動設置 `group_code: '01'`，導致用戶體驗不佳

**解決方案**：
- 在 `/login` 頁面加入職群選擇器
- 移除硬編碼的預設值
- 註冊成功後正確設置用戶職群

**關鍵檔案**：
- `src/app/login/page.tsx` (需要修改)
- `src/components/VocationalGroupSelector.tsx` (可從 onboarding/step1 重用)

**實施步驟**：
1. 分析現有 onboarding/step1 的職群選擇 UI
2. 將職群選擇器整合到註冊流程
3. 修改 Supabase 註冊邏輯，正確設置 group_code
4. 測試註冊流程的完整數據流

#### 1.2 Onboarding 與資料庫同步
**問題**：現有 onboarding 只更新 localStorage，不同步到資料庫

**解決方案**：
- 在每個 onboarding 步驟完成時同步更新資料庫
- 修改 onboarding 頁面的資料保存邏輯
- 確保與角色系統的數據一致性

**關鍵檔案**：
- `src/app/onboarding/step1-5/page.tsx` (需要修改)
- `src/lib/storage.ts` (需要增強)
- `src/lib/supabase/client.ts` (可能需要調整)

**實施步驟**：
1. 修改 onboarding 步驟頁面，加入資料庫同步
2. 更新 student_profiles 的相關欄位
3. 測試 onboarding 完成後的數據完整性
4. 建立錯誤處理和重試機制

### 階段二：角色系統前端實現 (Week 2-3)
**目標**：實現完整的 5 角色系統 UI 和流程控制

#### 2.1 角色系統核心組件開發
**新增組件**：
- `RoleBadge.tsx` - 角色徽章顯示
- `RoleProgress.tsx` - 角色進度條
- `RoleTransition.tsx` - 角色轉換動畫
- `XPSystem.tsx` - 經驗值系統 UI

**關鍵檔案**：
- `src/components/roles/` (新建目錄)

**實施步驟**：
1. 設計角色視覺系統（顏色、圖示、動畫）
2. 實現基礎角色組件
3. 建立角色狀態管理系統
4. 整合經驗值和升級邏輯

#### 2.2 Pathfinder 覺醒與訓練流程
**新增頁面**：
- `/pathfinder-awakening` - Pathfinder 覺醒頁面
- `/pathfinder-training` - Pathfinder 訓練模組
- `/first-discovery` - 第一次發現體驗

**關鍵檔案**：
- `src/app/pathfinder-awakening/page.tsx` (新建)
- `src/app/pathfinder-training/page.tsx` (新建)
- `src/app/first-discovery/page.tsx` (新建)

**實施步驟**：
1. 設計 Pathfinder 覺醒體驗流程
2. 開發 4 個訓練模組內容
3. 實現第一次發現的即時價值計算
4. 建立角色轉換的觸發條件

### 階段三：首頁與產品重新定位 (Week 4)
**目標**：實現「升學路徑發現引擎」的產品定位

#### 3.1 首頁 Explorer 主題改造
**重新定位**：
- 從「學習歷程管理」→「發現未知路徑」
- 強調 6 種升學管道的教育內容
- 加入「99% 高職生不知道」的震撼教育

**關鍵檔案**：
- `src/app/page.tsx` (需要完全重寫)
- `src/components/roles/Explorer/HeroSection.tsx` (新建)
- `src/components/roles/Explorer/PipelineShowcase.tsx` (新建)

**實施步驟**：
1. 重新設計首頁 Hero 區域
2. 加入 6 種升學管道的教育內容
3. 創建群體快速選擇器
4. 實現 A/B 測試不同版本

#### 3.2 群體專屬頁面開發
**新增頁面**：
- `/group-selector` - 群體選擇器
- `/group/[slug]` - 群體專屬頁面（如 `/group/外語群`）

**關鍵檔案**：
- `src/app/group-selector/page.tsx` (新建)
- `src/app/group/[slug]/page.tsx` (新建)

**實施步驟**：
1. 設計群體選擇器 UI
2. 建立群體專屬頁面模板
3. 整合現有的 group_knowledge 資料
4. 加入 Pathfinder 故事和成功案例

### 階段四：能力帳戶重新設計 (Week 5)
**目標**：將空的儀表板轉變為 Catalyst 的轉化實驗室

#### 4.1 能力帳戶重新定位
**重新設計**：
- 從「統計展示」→「行動指引」
- 加入資產價值評估引擎
- 整合角色進度和成就系統

**關鍵檔案**：
- `src/app/ability-account/page.tsx` (需要大幅修改)
- `src/app/ability-journal/page.tsx` (新建，重新定位)

**實施步驟**：
1. 重新設計能力帳戶的信息架構
2. 加入資產價值即時計算
3. 整合 Catalyst 角色的行動建議
4. 建立藍圖對比分析工具

## 技術架構調整

### 資料庫遷移執行
**已完成**：
- 角色管理相關表結構 (`user_roles`, `role_evolution`, `role_achievements`, `xp_history`)
- 角色升級和經驗值函數
- RLS 政策設置

**需要執行**：
- 在 Supabase Dashboard 執行 migration 腳本
- 驗證現有用戶的初始角色設置
- 測試角色升級函數的功能

### 前端路由重構
**新增路由**：
```
/pathfinder-awakening
/pathfinder-training
/first-discovery
/group-selector
/group/[slug]
/ability-journal
```

**修改路由**：
```
/ (完全重寫首頁)
/login (加入職群選擇)
/ability-account (重新設計)
```

### 狀態管理系統
**新增管理器**：
- `src/lib/role-manager.ts` - 角色狀態管理
- `src/lib/role-xp-system.ts` - 經驗值系統
- `src/lib/role-transition.ts` - 角色轉換邏輯

## 關鍵檔案修改清單

### 立即需要修改的檔案
1. `src/app/login/page.tsx` - 修復註冊流程職群選擇
2. `src/lib/storage.ts` - 加入資料庫同步邏輯
3. `src/app/page.tsx` - 首頁重新定位
4. `src/app/onboarding/step1/page.tsx` - 資料庫同步

### 需要新建的檔案
1. `src/lib/role-manager.ts` - 角色管理器
2. `src/components/roles/RoleBadge.tsx` - 角色徽章
3. `src/app/pathfinder-awakening/page.tsx` - 覺醒頁面
4. `src/app/group-selector/page.tsx` - 群體選擇器

## 風險評估與緩解

### 高風險項目
1. **註冊流程修改**
   - 風險：可能影響現有用戶註冊
   - 緩解：A/B 測試，保持向後兼容

2. **資料庫遷移**
   - 風險：可能中斷現有服務
   - 緩解：先在測試環境驗證，分階段推出

### 中風險項目
3. **角色系統複雜度**
   - 風險：用戶可能覺得過於複雜
   - 緩解：漸進式引導，可選的快速模式

4. **首頁重新設計**
   - 風險：可能影響 SEO 和現有用戶習慣
   - 緩解：保留關鍵功能，監控用戶反應

## 成功指標

### 技術指標
- 註冊流程中職群選擇率 > 80%
- Onboarding 完成後資料庫同步成功率 > 95%
- 角色系統前端無重大 bug

### 用戶體驗指標
- 新用戶註冊後完成 Pathfinder 訓練 > 60%
- 用戶能清楚說明自己目前的角色定位
- 首頁跳出率 < 50%

### 商業指標
- Explorer → Pathfinder 轉換率 > 50%
- 用戶記錄第一個經歷的比例 > 40%
- 7 日留存率提升 > 20%

## 實施時間表

### Week 1: 基礎修復
- Day 1-2: 修復註冊流程職群選擇
- Day 3-4: Onboarding 資料庫同步
- Day 5-7: 測試與驗證

### Week 2-3: 角色系統
- Week 2: 角色組件開發
- Week 3: Pathfinder 流程實現

### Week 4: 首頁改造
- Day 1-3: 首頁重新設計
- Day 4-5: 群體頁面開發
- Day 6-7: A/B 測試

### Week 5: 能力帳戶重設計
- Day 1-4: 重新設計實現
- Day 5-7: 完整流程測試

## 驗證與測試計畫

### 技術驗證
1. 單元測試：角色管理器、經驗值系統
2. 整合測試：註冊 → Onboarding → 角色轉換流程
3. E2E 測試：完整用戶旅程

### 用戶測試
1. Alpha 測試：5-10 名真實高職生
2. Beta 測試：50 名用戶 A/B 測試
3. 用戶反饋收集和迭代

## 後續擴展計畫

完成階段一至四後，將繼續實施：
- Architect 系統（藍圖設計工具）
- Catalyst 系統（行動中心）
- Trailblazer 系統（開創者平台）
- AI 分析引擎深度整合

此計畫確保升學大師能順利從 v1.0 轉型為 v2.0 的「高職升學路徑發現引擎」，同時保持系統穩定性和用戶體驗的連續性。