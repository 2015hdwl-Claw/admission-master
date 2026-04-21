# Admission Master — 升學大師

## Project Overview
台灣高中生和家長的升學透明窗口。學生免費使用分數分析工具並分享結果，家長為學習歷程輔導和面試準備付費。

## Core Principle: 雙邊平台
- **學生** = 免費用戶 + 病毒傳播載體
- **家長** = 付費用戶 + 收入來源
- **透明** = 讓學生和家長都能掌握升學資訊

## Tech Stack
- Frontend: Next.js 14 (App Router) + Tailwind CSS
- Backend: Supabase (PostgreSQL + Auth + Edge Functions + Storage)
- AI: GLM API (glm-4.7-flash), fallback to OpenAI/Claude
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
- GLM API for score analysis, portfolio review, interview simulation
- Always have fallback when GLM is unavailable
- Log every AI call with: user_id, input_hash, model, tokens, latency

## Free vs Paid Boundary
- **FREE**: Score analyzer, pathway info, department search, 6 portfolio guides, 10 interview questions, share cards, email newsletter
- **PAID**: AI portfolio review, mock interviews, department strategy reports, 1-on-1 consulting

## Content Strategy
- Short videos (IG/TikTok) target students for viral spread
- YouTube long-form + FB content target parents for awareness
- Email newsletter builds trust over 3-6 weeks before paid conversion
- SEO long-tail content for sustainable organic traffic
