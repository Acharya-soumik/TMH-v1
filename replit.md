# The Middle East Hustle Platform

## Overview

Full-stack polling and opinion platform for the Middle East. Users vote on daily high-signal questions across business, culture, technology, and identity. Features curated profiles of regional voices, rankings, and a weekly editorial digest.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (Tailwind CSS, Framer Motion, shadcn/ui, Wouter routing)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle for API)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port 8080, served at /api)
│   └── tmh-platform/       # React + Vite frontend (served at /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/seed.ts         # Database seeding script
└── ...
```

## Features

### Pages
- **Home** (`/`) — Hero featured poll with voting, trending polls strip, featured voices, category browser, rankings snapshot, weekly pulse preview
- **Polls** (`/polls`) — Full poll browser with filter tabs (Latest/Trending/Most Voted/Ending Soon/Editor's Picks) and category sidebar
- **Poll Detail** (`/polls/:id`) — Full poll with context, voting UI, animated result reveal, share CTA, related polls
- **Profiles** (`/profiles`) — Searchable directory with country/sector/role filters
- **Profile Detail** (`/profiles/:id`) — Portrait, headline, story, lessons, quote, associated polls, similar voices
- **Rankings** (`/rankings`) — Top Voices, Top Founders, Women Leaders, Hottest Sectors, Rising Cities, Debated Topics
- **Weekly Pulse** (`/weekly-pulse`) — Editorial digest of biggest votes, surprises, sector sentiment
- **About** (`/about`) — Platform manifesto

### Database Schema
- `polls` — Poll questions with category, type, and metadata
- `poll_options` — Answer options with vote counts
- `votes` — Vote records keyed by voterToken (localStorage UUID)
- `profiles` — Curated regional voices with full editorial profiles

### API Endpoints
- `GET /api/polls` — List polls (with filter/category query params)
- `GET /api/polls/featured` — Get featured hero poll
- `GET /api/polls/:id` — Get single poll
- `POST /api/polls/:id/vote` — Cast a vote
- `GET /api/profiles` — List profiles (with search/country/sector filters)
- `GET /api/profiles/:id` — Get profile detail
- `GET /api/rankings` — Get rankings (type: profiles/founders/women_leaders/sectors/cities/topics)
- `GET /api/categories` — List all categories with poll counts
- `GET /api/weekly-pulse` — Weekly editorial digest

## Design System
- Dark mode by default (charcoal soft-black background, warm ivory text)
- Muted gold primary accent (`#C9921F` approx)
- Deep olive/teal secondary accent
- DM Sans for UI, Playfair Display for editorial headings
- Light mode toggle in navbar

## Running Locally

```bash
# Start API server
pnpm --filter @workspace/api-server run dev

# Start frontend
pnpm --filter @workspace/tmh-platform run dev

# Seed database
pnpm --filter @workspace/scripts run seed

# Run codegen after OpenAPI changes
pnpm --filter @workspace/api-spec run codegen

# Push DB schema changes
pnpm --filter @workspace/db run push
```
