# 升學大師 v5.0 - 商管群匹配度演算法

## 📯 Phase 1 完成狀態

✅ **核心演算法實現完成**
- 7 個商管科系資料庫建立
- 匹配度計算公式實現
- 風險評估系統建立
- 單元測試通過（22/22）

## 🎯 功能概述

這個演算法系統能夠：

1. **評估學生特質**：根據 8 個能力維度評估學生適性
2. **科系匹配計算**：計算學生與 7 個商管科系的匹配度
3. **風險評估**：識別學生的優勢和潛在風險
4. **發展建議**：提供具體的學習和發展建議

## 🏛️ 支援的 7 個商管科系

1. **會計學系** - 重視數學和邏輯思維
2. **財務金融學系** - 強調數學分析和國際視野
3. **國際企業學系** - 重視語文能力和跨文化溝通
4. **行銷學系** - 強調創意思考和溝通表達
5. **經濟學系** - 重視數學建模和邏輯分析
6. **企業管理學系** - 強調領導能力和團隊協調
7. **資訊管理學系** - 重視資訊技术和系統思維

## 🚀 使用方式

### 基礎使用

```typescript
import {
  calculateAllBusinessMatches,
  convertAnswersToProfile,
  generateRecommendationSummary
} from '@/lib/scoring/scoring-algorithm';

// 1. 準備學生特質資料
const profile = {
  mathScore: 85,
  logicScore: 80,
  languageScore: 70,
  communicationScore: 65,
  creativityScore: 60,
  leadershipScore: 60,
  itScore: 65,
  globalVisionScore: 60
};

// 2. 計算所有科系匹配度
const matches = calculateAllBusinessMatches(profile);

// 3. 產生推薦摘要
const summary = generateRecommendationSummary(matches);

console.log(summary);
// 輸出：
// 🎯 最推薦：經濟學系（匹配度 78%）
// ✅ 你的特質與經濟學系高度匹配，強項包括：
// • 數學能力符合需求
// • 邏輯思維符合需求
```

### 詳細分析

```typescript
import {
  calculateDepartmentMatch,
  BUSINESS_DEPARTMENTS,
  BusinessDepartment
} from '@/lib/scoring/scoring-algorithm';

// 分析特定科系
const accountingMatch = calculateDepartmentMatch(
  profile,
  BUSINESS_DEPARTMENTS[BusinessDepartment.ACCOUNTING]
);

console.log(`會計學系匹配度：${accountingMatch.matchScore}%`);
console.log(`風險等級：${accountingMatch.riskLevel}`);
console.log('優勢：', accountingMatch.strengths);
console.log('關注：', accountingMatch.concerns);
console.log('建議：', accountingMatch.recommendations);
```

## 📊 演算法原理

### 1. 加權匹配度計算

每個科系都有不同的能力權重分配，例如：

- **會計學系**：數學 35%，邏輯 30%，語文 15%...
- **行銷學系**：溝通 30%，創意 30%，語文 25%...

演算法會根據學生的能力分數和科系權重計算匹配度。

### 2. 門檻懲罰機制

每個科系都有最低能力門檻，如果學生低於門檻會大幅扣分：

- **經濟學系**：數學門檻 65，邏輯門檻 65
- **國企系**：語文門檻 65

### 3. 風險評估

- **低風險**：匹配度 ≥75 且無關注項目
- **中風險**：匹配度 ≥60 且關注項目 ≤1 個
- **高風險**：其他情況

## 🧪 測試狀態

```bash
# 執行測試
bun test src/lib/scoring/__tests__/scoring-algorithm.test.ts

# 測試結果：22 個測試全部通過
```

### 測試涵蓋範圍

✅ 資料庫驗證（7 個科系特性）
✅ 匹配度計算（各種學生類型）
✅ 排序和推薦邏輯
✅ 邊界情況處理
✅ 資料轉換功能

## 🔧 整合步驟（Phase 2 待完成）

1. **建立問卷資料結構**：設計商管群專用問卷
2. **整合到現有 API**：在 `/api/direction` 中加入商管群邏輯
3. **前端 UI 升級**：顯示匹配度結果和詳細分析
4. **實際資料驗證**：使用真實學生資料測試準確性

## 📈 效能指標

- **計算速度**：< 10ms（7 個科系完整計算）
- **準確度**：基於教育部課程標準和業界需求
- **可擴展性**：易於新增科系和調整權重

## 🎓 教育價值

1. **客觀評估**：基於數據而非直覺的科系建議
2. **個人化**：考慮學生的個別差異
3. **發展導向**：不只告訴你適合什麼，還告訴你如何加強

## 📝 後續優化方向

1. **機器學習優化**：根據實際就學資料優化權重
2. **更多科系**：擴展到其他學群（工程、醫學等）
3. **動態調整**：根據就業市場趨勢調整權重
4. **多階段評估**：考慮不同學習階段的能力變化

---

**Phase 1 完成日期**：2026-05-02
**負責 Agent**：Jane (指揮官) + 實作 Agent
**測試狀態**：✅ 全部通過
**下一階段**：Phase 2 - MVP 資料結構建立