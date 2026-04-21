# Admission Master 升學大師

> 輸入分數，看見未來 — 台灣高中生和家長的升學透明窗口

## What

一個免費的升學分數分析工具，幫助台灣高中生了解自己適合走哪條升學管道、推薦科系，並透過分享圖卡病毒式傳播。家長可以進一步購買學習歷程輔導、面試準備等付費服務。

## Why

- 台灣升學制度複雜（15+ 管道），資訊分散在 ColleGo!、PTT、Dcard
- 補教業教科目不教策略，一個月 8,000+
- 沒有一個平台同時服務學生（傳播者）和家長（付費者）
- 分數分析器是零門檻的入口，分享圖卡是病毒傳播的載體

## Tech

- [Next.js](https://nextjs.org/) + [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (PostgreSQL + Auth + Edge Functions)
- [GLM API](https://open.bigmodel.cn/) + OpenAI/Claude fallback
- Deployed on [Vercel](https://vercel.com/)

## Docs

- [完整專案計畫](docs/PROJECT_PLAN.md) — 產品定位、技術架構、執行計畫、商業模式

## Project Structure

```
admission-master/
├── .claude/            # Claude Code 專案設定
├── content/           # Markdown 文章（博客、指南）
├── data/              # 種子資料（管道、科系、歷年分數）
├── docs/              # 專案文件
│   └── PROJECT_PLAN.md
├── scripts/           # 工具腳本（爬蟲、數據整理）
├── src/               # Next.js 原始碼
├── CLAUDE.md          # Claude Code 專案指令
├── README.md          # 本檔
└── .gitignore
```

## Status

**Planning Complete** — 專案計畫已定稿，等待執行。
