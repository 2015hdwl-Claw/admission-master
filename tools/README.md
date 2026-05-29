# tools/ — 升學大師 資料爬蟲 Pipeline

## 概述

本目錄包含升學大師的資料爬取和 enrichment pipeline。所有腳本輸出到 `src/data/`。

## 快速開始

```bash
# 完整 pipeline
python tools/pipeline.py

# 個別步驟
python tools/pipeline.py depts      # 爬取系所資料
python tools/pipeline.py desc       # 補全系所描述
python tools/pipeline.py schedules  # 爬取考試時程
python tools/pipeline.py pathways   # 爬取管道截止日
python tools/pipeline.py exams      # 爬取證照考試
python tools/pipeline.py comps      # 爬取競賽活動
python tools/pipeline.py calendar   # 生成統一行事曆
```

## 架構圖

```
_input_                          _script_                    _output_
────────                          ──────                     ───────
jctv.ntut.edu.tw           → scrape_electrical_departments.py  → departments.json (base)
                             scrape_departments.py

techadmi.edu.tw            → enrich_techadmi.py               → departments.json (desc + YouTube)
be.guide.104.com.tw        → enrich_career_104.py              → departments.json (salary)
GLM API (open.bigmodel.cn)  → enrich_descriptions_glm.py       → departments.json (AI desc)
regex rules                 → enrich_tags.py                   → departments.json (tags)
jctv.ntut.edu.tw           → enrich_pathways.py                → departments.json (pathway quotas)

skill.tcte.edu.tw          → scrape_exam_schedules.py          → exam-schedules.json
sci-me.k12ea.gov.tw        → scrape_competition_events.py      → competition-events.json
wdasec.gov.tw
topic.tcivs.tc.edu.tw

techadmi.edu.tw            → scrape_pathway_deadlines.py       → pathway-deadlines.json

exam-schedules.json        → generate_calendar.py              → national-calendar.ts
competition-events.json
pathway-deadlines.json
```

## 環境變數

```bash
CLASSIFIER_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
CLASSIFIER_API_KEY=<your-api-key>
CLASSIFIER_MODEL=glm-4.7-flash
```

## 腳本一覽

### Orchestrator

#### `pipeline.py`
- **用途**: 主控腳本，按順序執行完整資料 pipeline
- **用法**: `python tools/pipeline.py [depts|desc|schedules|pathways|exams|comps|calendar]`
- **無參數**: 執行全部步驟
- **依賴**: 所有 scrape_*.py 和 enrich_*.py

### 爬蟲腳本

#### `scrape_electrical_departments.py`
- **用途**: 爬取電機電子群系所資料
- **輸入**: jctv.ntut.edu.tw warehouse.js
- **輸出**: `src/data/departments.json`
- **執行時間**: ~5-10 分鐘
- **備註**: 僅支援 groupCode "03"，其他群需擴展

#### `scrape_departments.py`
- **用途**: 通用系所爬取（GLM API 生成）
- **輸入**: GLM API
- **輸出**: `src/data/departments.json`
- **備註**: AI 生成的系所資料，品質依賴 prompt 和 model

#### `scrape_exam_schedules.py`
- **用途**: 爬取證照考試時程
- **來源**: https://skill.tcte.edu.tw/schedule.php
- **輸出**: `src/data/exam-schedules.json`（360 筆記錄）
- **爬取欄位**: certCode, certName, level, groupCode, batch, 報名/學科/術科/放榜日期
- **執行時間**: ~3-5 分鐘

#### `scrape_competition_events.py`
- **用途**: 爬取競賽活動
- **來源**:
  - https://sci-me.k12ea.gov.tw/（技藝競賽）
  - https://www.wdasec.gov.tw/（技能競賽）
  - https://topic.tcivs.tc.edu.tw/（專題競賽）
- **輸出**: `src/data/competition-events.json`（302 筆記錄）
- **爬取欄位**: competitionName, subCompetition, category, level, groupCodes, 報名/比賽日期, placingThreshold
- **執行時間**: ~5-10 分鐘

#### `scrape_pathway_deadlines.py`
- **用途**: 爬取升學管道里程碑日期
- **來源**: https://www.techadmi.edu.tw/edutype_list.php（6 個管道頁面）
- **輸出**: `src/data/pathway-deadlines.json`
- **爬取欄位**: pathwayType, pathwayName, milestones (name, date, description)
- **執行時間**: ~2-3 分鐘

### Enrichment 腳本（補全 `departments.json` 欄位）

#### `enrich_techadmi.py`
- **用途**: 補全系所完整描述、techadmi URL、YouTube 連結
- **來源**: https://www.techadmi.edu.tw/schools_detail.php
- **修改欄位**: `fullDescription`, `techadmiUrl`, `youtubeUrl`
- **執行時間**: ~5-10 分鐘

#### `enrich_career_104.py`
- **用途**: 補全就業薪資和技能資料
- **來源**: https://be.guide.104.com.tw（104 人力銀行 Career Guide API）
- **修改欄位**: `careerOutcomes`（salary, skills）

#### `enrich_descriptions_glm.py`
- **用途**: 用 GLM API 補全系所 AI 描述
- **來源**: GLM API（glm-4.7-flash @ open.bigmodel.cn）
- **修改欄位**: `fullDescription`, `features`, `researchAreas`, `careerPaths`
- **⚠️ 重要**: 此腳本產生的資料為 AI 生成，非官方資料，應標記 AI 來源

#### `enrich_descriptions_local.py`
- **用途**: 本地離線補全描述（不依賴外部 API）
- **備註**: 當 GLM API 不可用時的備案

#### `enrich_tags.py`
- **用途**: 用 regex 規則為系所加上分類標籤
- **修改欄位**: `tags`
- **備註**: 基於靜態 regex 規則，非 ML 分類

#### `enrich_pathways.py`
- **用途**: 補全各升學管道的招生名額資料
- **來源**: https://jctv.ntut.edu.tw（技專校院招生委員會聯合會）
- **修改欄位**: `pathways`（stars/selection/distribution/skills/guarantee/special 的名額與標準）

### 衍生資料生成

#### `generate_calendar.py`
- **用途**: 合併所有日期資料產生統一行事曆
- **輸入**: `pathway-deadlines.json` + `exam-schedules.json` + `competition-events.json`
- **輸出**: `src/data/national-calendar.ts`
- **觸發時機**: 任何上游檔案更新後必須重新執行

### 共用工具

#### `scraper_utils.py`
- **用途**: 共用 HTTP 工具函式
- **功能**:
  - 24 小時 HTTP 快取（`_cache/` 目錄）
  - 民國年 ↔ ISO 日期轉換
  - JSON/TypeScript 檔案讀寫
  - techadmi.edu.tw session 管理

### 快取與除錯

- `_cache/` — HTTP 回應快取（22 個檔案，~13 MB），加速重複爬取
- `_debug/` — HTML 快照（31 個檔案，~1.4 MB），用於除錯
- `__pycache__/` — Python bytecode 快取

## 執行前檢查清單

1. [ ] 確認目標 URL 仍可訪問（政府網站 URL 可能變更）
2. [ ] 確認是否需要更新學年度參數（每年 8 月新學年）
3. [ ] 備份當前 JSON 檔案（`cp src/data/*.json src/data/_backup/`）
4. [ ] 先用個別步驟測試（`pipeline.py exams` 而非全跑）
5. [ ] 確認 `.env` 中的 API key 有效

## 執行後驗證

1. [ ] `git diff --stat src/data/` 檢視變更範圍
2. [ ] 確認記錄筆數未異常減少（對照 `DATA_SOURCES.md` 中的筆數）
3. [ ] 人工抽驗 3-5 筆記錄的資料正確性
4. [ ] 更新 `DATA_CHANGELOG.md`
5. [ ] `npm run build` 通過