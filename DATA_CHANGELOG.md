# DATA_CHANGELOG.md

## 2026-05-29 — 資料治理初始化
- **範圍**: 全專案
- **變更**: 建立 `DATA_SOURCES.md`、`DATA_CHANGELOG.md`、`tools/README.md`，為所有資料檔案加入來源 metadata
- **影響檔案**: `src/data/*`（加入 `_meta` / `.meta.json` / JSDoc 標頭）
- **驗證方式**: `npm run build` 通過

## 2026-05-23 — competition-admission-map.json: 更新競賽類別
- **檔案**: `src/data/competition-admission-map.json`
- **變更**: 補充 13 種競賽類型完整對照，更新 competitionCategories 結構
- **來源**: 115 學年度四技二專技優甄審入學招生簡章 第 3-25 頁
- **驗證方式**: 與 PDF 原文交叉比對

## 2026-05-17 — 證照/考試/競賽/管道資料初始化
- **檔案**: `src/data/cert-admission-map.json`, `exam-schedules.json`, `competition-events.json`, `pathway-deadlines.json`
- **變更**: 從官方簡章 PDF 提取證照對照（38 類別 × 800+ 證照）、爬取 360 筆考試時程、302 筆競賽活動、6 個管道時程
- **來源**: 115 學年度技優甄審簡章 PDF、skill.tcte.edu.tw、sci-me.k12ea.gov.tw、wdasec.gov.tw、techadmi.edu.tw
- **驗證方式**: 爬蟲每筆記錄均有 source URL 可追溯

## 2026-05-14 — departments.json: 電機電子群系所資料初始化
- **檔案**: `src/data/departments.json`
- **變更**: 建立 181 個系所資料（僅電機與電子群 groupCode "03"），包含系所描述、研究領域、就業出路、招生管道資訊
- **來源**: jctv.ntut.edu.tw warehouse.js（基礎結構）、GLM API glm-4.7-flash（描述補全）、104 人力銀行 Career Guide API（薪資資料）
- **已知問題**: 僅有電機電子群，其他 19 群尚未擴展；fullDescription 等欄位由 AI 生成
- **驗證方式**: 人工抽驗 5 個系所資料