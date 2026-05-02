# Admission Master — 升學大師

## Authoritative planning (最新準則)

**產品與商業策略以 `PLAN-v4.md` 為唯一準據**（高職自我發現引擎、光域 UI、116 選考、類群 MVP 順序、制度研究與驗證路線）。若與舊版文件（例如 `docs/PROJECT_PLAN.md`、`PLAN-v3.md`）或本檔歷史段落衝突，**以 `PLAN-v4.md` 為準**，並應逐步讓程式與文案對齊 v4。

## Project Overview
升學準備的連結器。把學生正在做的事連結到升學目標，讓家長看到孩子的成長軌跡。學生免費使用並病毒式傳播，家長為成長報告和 AI 輔導付費。

## Product Identity: 連結器
- **Connect** — 校園活動 ↔ 學習歷程代碼 ↔ 升學目標
- **Capture** — 學生的經歷變成可用素材（15-30 min/項）
- **Map** — 素材進度 vs 空缺可視化
- **Plan** — 以終為始的個人化路線圖（素材收集→撰寫→備審→口試，基於校曆和學校資源）
- 任務來源是學校行事曆和學生實際活動，不是 AI 憑空派任務
- 學生感受：「原來我這週已經做了這麼多跟升學有關的事」
- 家長感受：「孩子在進步，而且是他自己主動的」
- **Core feature**: Personalized roadmap (以終為始) — not a streak tracker, a backward planner

## Three Strategic Layers
1. **Student** — Self-discovery game (RPG: explore departments, complete tasks, earn XP/badges)
2. **Parent** — Window into child's real interests (last chance to accompany before college)
3. **Education Bridge** — Break information asymmetry between parents and higher education (58 departments, 2000+ programs)

## Core Principle: 雙邊平台
- **學生** = 免費用戶 + 病毒傳播載體 + 每週成就感 loop
- **家長** = 付費用戶 + 收入來源 + 看見孩子成長的窗口
- **高中是最後的陪伴窗口** — 進了大學，父母就真的只能看成績了

## Tech Stack
- Frontend: Next.js 14 (App Router) + Tailwind CSS
- Backend: Supabase (PostgreSQL + Auth + Edge Functions + Storage)
- AI: Google Gemini (gemini-2.5-flash) for production, GLM API (glm-4.7-flash) for development only, fallback to OpenAI
- Deploy: Vercel (frontend) + Supabase Cloud (backend)
- Email: Resend
- Image Gen: HTML Canvas / Sharp

## Development Rules
- Next.js App Router only (no Pages Router)
- Tailwind CSS for all styling (no CSS modules)
- All data through Supabase (no direct DB connections)
- API routes via Supabase Edge Functions
- Environment vars in `.env.local` (never commit secrets)
- Chinese (Traditional) for all user-facing content
- English for code identifiers and comments

## Key Conventions
- Components in `src/components/` organized by feature
- Supabase client in `src/lib/supabase.ts`
- API types in `src/types/`
- Content data in `data/` (JSON seed files)
- Content articles in `content/` (Markdown)

## AI Usage
- **Production**: Google Gemini 2.5 Flash (free tier), Flash-Lite (cheap bulk), Pro (complex reasoning)
- **Development only**: GLM API (glm-4.7-flash) for Claude Code and local testing
- **Fallback**: OpenAI GPT-4o-mini when Gemini is unavailable
- All AI API config (base_url, model, api_key) via environment variables — never hardcode
- OpenAI-compatible format for all providers — switching only requires changing env vars
- Log every AI call with: user_id, input_hash, model, tokens, latency

## Free vs Paid Boundary
- **FREE**: Score analyzer, share cards, school calendar sync, weekly task suggestions, progress tracking (XP/streak/badges), department exploration (58 categories), basic portfolio recording, parent weekly summary (abbreviated)
- **PAID**: Full parent growth report, AI portfolio review, mock interviews, department strategy reports, advanced portfolio gap analysis, 1-on-1 consulting

## Achievement System (鼓勵型，非壓力型)
**Design principle: 只慶祝做了什麼，不懲罰沒做什麼。**
- Monthly timeline review ("你這個月做了什麼") — NOT daily streak
- Growth summary (AI-generated positive descriptions of what student accomplished)
- Cumulative milestones ("你的素材累積了 10 件！")
- Free-form recording ("想記錄就記錄，不記錄也不會消失")
- Positive tags ("主動學習者", "科系探索家", "實驗記錄者")
- NO streak, NO leaderboard, NO daily task reminders, NO XP deduction
- Students already have enough pressure — this app should NOT add more

## Share Card Design (繪馬式)
- 1280x720 IG Story format
- Include "我的目標" field (commitment device)
- Default anonymous (Taiwan students prefer anonymous sharing)
- Positive framing (emphasize possibilities, not limitations)
- QR Code linking to parent view

## Content Strategy
- Short videos (IG/TikTok) target students for viral spread
- YouTube long-form + FB content target parents for awareness
- Email weekly reports build retention and parent trust
- SEO long-tail content for sustainable organic traffic

## Skill routing — V1 (minimal, generic)

When a request matches an available skill, invoke it before acting. Keep this routing minimal and practical.

Core routing rules:
- Product ideas / feature exploration -> `/brainstorming`
- New feature or major change without clear spec -> `/spec-driven-development`
- Have requirements, need executable tasks -> `/planning-and-task-breakdown`
- Implementing product code -> `/incremental-implementation`
- Bug reports / unexpected behavior / runtime errors -> `/investigate`
- Tests failing or bugfix implementation -> `/test-driven-development`
- UI components / pages / interaction polish -> `/frontend-ui-engineering`
- Security-sensitive flows (auth, user input, payments, secrets) -> `/security-and-hardening`
- Ready for QA / "does this work?" -> `/qa`
- Ready to ship / create PR / deploy -> `/ship`

Execution notes:
- If multiple skills apply, use process-first order: investigate/plan -> implementation -> verify -> ship.
- User instruction has highest priority; routing defines HOW, not WHAT.

## Skill routing — 升學大師強化版 (V2)

Use this section when the task touches Admission Master product shape (student/parent, roadmap, Supabase, paid boundary, content, or AI). Prefer V2 over the generic list above when both could apply.

**Precedence:** User message > V2 rules > V1 minimal list > default assistant behavior.

### Product & scope
- Vague product ideas, viral/content angles, parent messaging -> `/brainstorming` (then `/spec-driven-development` if it becomes buildable scope)
- CEO-level tradeoffs (pricing, free/paid boundary, roadmap bets) -> `/plan-ceo-review` or `/office-hours` when installed
- Engineering/architecture decisions (Supabase schema, Edge boundaries, multi-tenant) -> `/plan-eng-review` or `/planning-and-task-breakdown` after spec exists

### Data & backend (Supabase)
- New tables, columns, RLS policies, Storage buckets, or Edge Functions -> `/spec-driven-development` -> `/api-and-interface-design` -> `/incremental-implementation`
- Migrations affecting existing users -> add `/test-driven-development` and `/security-and-hardening` before merge
- Auth/session, parent-student linking, role checks -> `/security-and-hardening` (must not leak paid-only data to free routes)

### Free vs paid boundary
- Any change to entitlements, gating, or "what parents see" -> `/security-and-hardening` + `/test-driven-development` (assert both student and parent paths)
- AI features that differ by tier -> same as above; verify logging does not store raw PII beyond policy

### Student experience (connector, not pressure)
- Roadmap, calendar sync, portfolio capture, progress/map UI -> `/frontend-ui-engineering` + `/incremental-implementation`
- Achievement/progress features -> `/brainstorming` or `/code-review-and-quality` to enforce **encouragement-only** rules (no streak punishment, no leaderboard pressure); then `/frontend-ui-engineering`

### Share cards & growth surfaces
- 1280x720 share flows, Canvas/Sharp, QR to parent view, anonymous defaults -> `/frontend-ui-engineering` -> `/qa` (visual + console + mobile viewport)

### AI pipeline
- New prompts, model switches, provider fallback, logging fields -> `/api-and-interface-design` (contracts) -> `/incremental-implementation` -> `/security-and-hardening` (secrets, data minimization)

### Content & SEO
- `content/` Markdown, `data/` JSON seeds, long-tail pages -> `/incremental-implementation`; large IA changes -> `/spec-driven-development` first
- Copy tone: user-facing must stay **Traditional Chinese**; code identifiers **English**

### Email (Resend)
- Templates, triggers, unsubscribe, parent reports -> `/incremental-implementation` + `/security-and-hardening` (secrets, PII in logs)

### Verify & ship
- Before merge: `/qa` for user-visible flows; `/code-review-and-quality` for risky diffs
- Release: `/ship` (or `/land-and-deploy` if using gstack deploy flow)
- Long sessions or handoff: `/context-save`; resume: `/context-restore`

### gstack slash names (when Skill tool maps to these)
If your environment exposes gstack commands, these are equivalent hooks: bugs `/investigate`; QA `/qa` or `/qa-only`; review `/review`; ship `/ship` or `/land-and-deploy`; full planning pipeline `/autoplan`.
