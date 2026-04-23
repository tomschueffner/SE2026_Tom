# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

TrackIt — a study-progress tracker. Users log in, create Subjects, add Topics under each Subject, and record Progress entries (0–100) per Topic.

## Dev Commands

**Backend** (`App/backend/`)
```
npm run dev        # nodemon watch mode, port 3001
npm start          # production start
npm run migrate    # prisma migrate dev
```

**Frontend** (`App/frontend/`)
```
npm run dev        # Vite dev server, port 5173 (proxies /api → localhost:3001)
npm run build      # production build
```

**Required `.env`** in `App/backend/`:
```
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET=<secret>
FRONTEND_URL=http://localhost:5173
PORT=3001
NODE_ENV=development
```

`App/docker-compose.yml` spins up a Postgres 15 instance (for future production use) — dev currently runs on SQLite via the `DATABASE_URL` above.

## Architecture

Two-process monolith: Express API + React SPA, run independently during development. Vite proxies all `/api` requests to the backend so there are no CORS issues locally.

### Backend (`App/backend/src/`)

- `index.js` — middleware stack order matters: `helmet → cors → cookieParser → json → authLimiter (on /auth) → verifyToken (on protected routes) → route handler → 404 → error handler`
- `middleware/auth.js` — reads JWT from the HttpOnly cookie (`req.cookies.token`), never from headers. Populates `req.user = { id, email }`. JWT expires after 15 minutes.
- `middleware/rateLimiter.js` — `authLimiter` applied only on `/api/auth`.
- `routes/` — flat route files (`auth.js`, `subjects.js`, `topics.js`, `progress.js`). Each file instantiates its own `PrismaClient` directly — there is no shared singleton or service layer. Ownership is verified inline with `findFirst({ where: { id, userId } })`.
  - `GET /api/subjects` — returns subjects with nested topics, each topic including only its latest progress entry (`take: 1, orderBy: createdAt desc`). This shape is consumed by Dashboard, Fortschritt, and SubjectPage.
  - `PATCH /api/topics/:id` — rename a topic (`{ name }`). Ownership verified via `topic.subject.userId`.
  - `GET /api/progress?topicId=` / `POST /api/progress` — ownership verified by traversing `topic → subject → userId`.

### Data model (`App/backend/prisma/schema.prisma`)

```
User → Subject → Topic → Progress
```
All relations have `onDelete: Cascade`. `Progress.value` is an integer 0–100. `Progress.note` is optional (max 500 chars).

### Frontend (`App/frontend/src/`)

**UI shell**: The app renders inside a fixed 390×844px container (`.app-shell`) styled to look like an iPhone 14. All pages use `.app-shell > .screen > .screen-scroll` layout with a sticky `.header` and `BottomTabBar` at the bottom.

**Theming**: The design system is entirely CSS custom properties defined in `index.css` (dark theme: `--bg`, `--bg2`, `--fg`, `--accent`, `--green`, `--yellow`, `--red`, etc.). Tailwind is used sparingly; prefer the existing CSS utility classes (`.card`, `.btn-primary`, `.btn-ghost`, `.input`, `.section-head`, `.stat-box`, etc.).

**Key files:**
- `api/axios.js` — single Axios instance with `baseURL: '/api'` and `withCredentials: true` (sends the HttpOnly cookie).
- `context/AuthContext.jsx` — restores session by calling `GET /api/auth/me` on mount. No token in localStorage.
- `components/ProtectedRoute.jsx` — redirects to `/login` if not authenticated.
- `components/BottomTabBar.jsx` — tab bar navigation present on all protected pages (Dashboard, Fortschritt, Profil).
- `components/ProgressPieChart.jsx` — pie chart showing topic progress distribution (4 buckets). Accepts `subjects` prop from DashboardPage.
- `components/TopicsBarChart.jsx` — bar chart showing per-topic progress for a single subject, sorted lowest → highest. Only rendered when ≥ 2 topics. Accepts `topics` prop from SubjectPage.
- `components/ProgressRing.jsx` — circular SVG ring indicator used on FortschrittPage.
- `components/ProgressBar.jsx` — horizontal bar using `.prog-track` / `.prog-fill` CSS classes.
- `components/MiniBarChart.jsx` — small inline bar chart used on DashboardPage subject cards.
- `utils/progressColor.js` — `progressColor(value)` returns a Tailwind class; `progressColorHex(value)` returns a hex string for Recharts.
- `utils/progress.js` — `avgProgress(topics)` computes mean of latest progress values (returns `null` if none); `progColor(value)` returns a CSS var string (`var(--green/yellow/red)`) for inline styles.

**Route structure:**
- `/login`, `/register` — public
- `/dashboard` — DashboardPage (subject list + charts)
- `/subjects/:id` — SubjectPage (topic list + bar chart + progress logging)
- `/fortschritt` — FortschrittPage (overall progress ring + sorted topic leaderboard)
- `/profil` — ProfilPage (user info + logout)
- Catch-all redirects to `/dashboard` (ProtectedRoute redirects to `/login` if unauthenticated)

## Known Issues

- No error handling on frontend `api.get/post` calls — 401s (JWT expires after 15 min) silently fail.
