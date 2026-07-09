# OSAMA/>Dev – Project Memory

## Developer Identity
- Name: Osama Kreishan
- Instagram: @osamakreishan
- WhatsApp: +962776815613
- Email: osamakreshan352@gmail.com
- Portfolio: https://osamakreishan.pages.dev/

## Project Goal
Streaming platform with 4 interfaces (Netflix, Shahid, Disney+, Crunchyroll), full authentication, automated scraping (80+ sites), Telegram alerts, Cloudflare Workers deployment.

## Tech Stack
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + Shadcn/ui
- **Auth**: Firebase Auth (Email/Password, Google, Phone)
- **Databases**: Supabase (users/content) + MongoDB Atlas (scraping data)
- **Backend**: Node.js + Express + TypeScript
- **Scrapers**: Python + Playwright (80+ sites)
- **Notifications**: Telegram Bot + Resend (emails)
- **AI**: DeepSeek API (content classification)
- **Deployment**: Cloudflare Workers (via @opennextjs/cloudflare)
- **Analytics**: PostHog
- **Error Tracking**: Sentry

## Development Rules
1. **All code must be production-ready** – no TODOs, no placeholders, no hardcoded test data.
2. **Arabic responses only** – communicate with me in Arabic.
3. **Pure code & commands** – no explanations unless I ask. Just write the code and run the commands.
4. **File-by-file delivery** – build one file at a time, run checks, then move to the next.
5. **Commit frequently** – after each working feature.
6. **No comments in production code** – unless the logic is non-obvious.
7. **Full error handling** – every API call, DB query, and scrape must have try/catch + logging.
8. **Security first** – validate all inputs, sanitize data, never expose secrets.

## Environment Variables

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` – Publishable URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Anon key
- `SUPABASE_SERVICE_KEY` – Service role key (server-side only)

### Firebase
- Firebase config stored in `backend/firebase-service-account.json`

### MongoDB
- `MONGODB_URI` – Atlas connection string

### Resend (Emails)
- `RESEND_API_KEY` – `re_it6jg38M_7mvdMF43nfqVFz9F8f9Q552Q`

### PostHog (Analytics)
- `NEXT_PUBLIC_POSTHOG_KEY` – `phx_zhu5ineDuWJ8QHcHRytnsuu9maStcxtB6tAA3Zt3j9p3xg8j`

### Sentry (Error Tracking)
- `SENTRY_DSN` – DSN URL

### ExchangeRate (Currency Conversion)
- `EXCHANGE_RATE_API_KEY` – `b4905ea858601abd0565baa117b69b24`

### DeepSeek (AI)
- `DEEPSEEK_API_KEY` – `sk-2005ad64c9d54249ae56ee1c2417a7c5`

### Telegram
- `TELEGRAM_BOT_TOKEN` – `8523313590:AAHtdiTZ3XcZbPQ7AROIts2_ZFfhVqugpS4`
- `TELEGRAM_CHAT_ID` – `6328505405`

### TMDB (Movie Data)
- `TMDB_API_KEY` – `b4905ea858601abd0565baa117b69b24`

### Admin & Contact
- `NEXT_PUBLIC_ADMIN_PASSWORD` – `osama123`
- `NEXT_PUBLIC_WHATSAPP` – `+962776815613`

## Project Structure

```
osamap2/
├── AGENTS.md                    ← Project memory (this file)
├── opencode.json                ← opencode config
├── .env.local                   ← Frontend env vars
├── .env                         ← Backend env vars
│
├── frontend/                    ← Next.js 15 App
│   ├── app/
│   │   ├── (auth)/              ← Login, Register, Verify
│   │   ├── (main)/              ← Main app (requires auth)
│   │   │   ├── netflix/         ← Netflix-style UI
│   │   │   ├── shahid/          ← Shahid-style UI
│   │   │   ├── disney/          ← Disney+-style UI
│   │   │   └── crunchyroll/     ← Crunchyroll-style UI
│   │   ├── api/                 ← Next.js API routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                  ← Shadcn components
│   │   ├── shared/              ← Shared UI components
│   │   ├── netflix/
│   │   ├── shahid/
│   │   ├── disney/
│   │   └── crunchyroll/
│   ├── lib/
│   │   ├── supabase/            ← Supabase client & helpers
│   │   ├── firebase/            ← Firebase config & auth
│   │   └── utils.ts
│   ├── hooks/                   ← Custom React hooks
│   ├── types/                   ← TypeScript types
│   └── package.json
│
├── backend/                     ← Node.js + Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── index.ts
│   ├── firebase-service-account.json
│   └── package.json
│
├── scrapers/                    ← Python + Playwright
│   ├── sites/                   ← Individual site scrapers
│   ├── core/                    ← Shared scraper logic
│   ├── requirements.txt
│   └── run.py
│
├── workers/                     ← Cloudflare Workers
│   ├── api-worker/              ← API gateway
│   ├── media-worker/            ← Media proxy
│   └── wrangler.toml
│
└── scripts/                     ← Utility scripts
    ├── deploy.sh
    └── seed.ts
```

## App Interfaces (4 Skins)

### 1. Netflix
- Dark red/black theme
- Hero banner with auto-play
- Rows: Continue Watching, Trending, My List, Genres
- Bottom sheet player

### 2. Shahid
- Dark purple/gold theme
- Grid layout with Arabic typography
- Ramadan/Premium sections
- Sidebar navigation

### 3. Disney+
- Dark blue theme
- Hero carousel
- Collections/Studio rows
- Immersive detail page

### 4. Crunchyroll
- Dark orange theme
- Anime grid with seasonal tags
- Episode list with simulcast badges
- Watchlist + continue watching

## Database Schema

### Supabase Tables

#### users
- `id` UUID PK
- `email` TEXT UNIQUE
- `display_name` TEXT
- `avatar_url` TEXT
- `provider` TEXT (email/google/phone)
- `firebase_uid` TEXT UNIQUE
- `created_at` TIMESTAMP
- `preferences` JSONB

#### subscriptions
- `id` UUID PK
- `user_id` UUID FK → users
- `plan` TEXT (free/monthly/yearly)
- `status` TEXT (active/cancelled/expired)
- `start_date` TIMESTAMP
- `end_date` TIMESTAMP

#### watch_history
- `id` UUID PK
- `user_id` UUID FK → users
- `content_id` TEXT
- `content_type` TEXT (movie/series/episode)
- `progress` FLOAT (0-100)
- `watched_at` TIMESTAMP

#### my_list
- `id` UUID PK
- `user_id` UUID FK → users
- `content_id` TEXT
- `content_type` TEXT
- `added_at` TIMESTAMP

### MongoDB Collections

#### scraped_content
- `source_id` TEXT
- `source_name` TEXT
- `title` TEXT
- `description` TEXT
- `thumbnail` TEXT
- `video_url` TEXT
- `quality` TEXT
- `language` TEXT
- `genre` TEXT[]
- `category` TEXT (movie/series/anime)
- `episodes` ARRAY (for series)
- `scraped_at` TIMESTAMP
- `ai_classification` OBJECT (from DeepSeek)

## Scrapers (80+ Sites)
Each scraper in `scrapers/sites/<site_name>.py` must:
1. Launch Playwright browser
2. Navigate to site
3. Extract content metadata + video URLs
4. Save to MongoDB
5. Handle anti-bot measures (stealth mode, rotating UAs)
6. Log results
7. Send Telegram notification on failure

## AI Classification (DeepSeek)
After scraping, each piece of content is classified:
- Language detection
- Genre tagging
- Content maturity rating
- Duplicate detection (same movie from multiple sources)

## Deployment
- **Frontend + API Backend**: Cloudflare Workers via `@opennextjs/cloudflare`
- **MongoDB**: MongoDB Atlas
- **Supabase**: Managed cloud
- **Firebase**: Managed cloud
- **Scrapers**: Run locally or on a VPS

## Communication
- Build commands in English
- All other communication: **Arabic (العربية)**

---

## Completed Tasks Log

### PART 1 – Project Setup ✅
- [x] Git init + .gitignore (commit `a303756`)
- [x] Next.js 15 + TypeScript + Tailwind CSS + App Router
- [x] Shadcn/ui components: button, card, badge, sheet, drawer, dialog, sonner, input, label, textarea, separator, skeleton, tabs, select, avatar, dropdown-menu
- [x] Libraries: framer-motion, zustand, @tanstack/react-query, axios, react-player, firebase, @supabase/supabase-js, @supabase/ssr, resend, @sentry/nextjs, posthog-js
- [x] Backend: Express 5 + Mongoose + Firebase Admin + Playwright + Resend + TypeScript
- [x] Scrapers: Python 3.11 venv + requirements.txt
- [x] .env files (frontend/backend/scrapers)
- [x] Intro videos copied (netflix, shahid, disney, crunchyroll)
- [x] Profile image copied
- [x] Frontend build — no errors
- [x] opencode.json with Playwright MCP + AGENTS.md instructions
- [x] AGENTS.md (project memory)

### PART 2 – Firebase Auth + Frontend Auth Pages ✅
- [x] Firebase service account saved (`backend/firebase-service-account.json`)
- [x] Firebase web SDK config in `.env.local`
- [x] `src/lib/firebase/client.ts` – Firebase init + Google provider
- [x] `src/lib/resend.ts` – Resend email client
- [x] `src/app/(auth)/login/page.tsx` – Login/Register with Email/Password + Google
- [x] `src/app/(auth)/verify/page.tsx` – 6-digit verification code input
- [x] `src/app/(auth)/username/page.tsx` – Username selection
- [x] Frontend build — no errors (commit)
