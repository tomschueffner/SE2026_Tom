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
```

## Architecture

Two-process monolith: Express API + React SPA, run independently during development. Vite proxies all `/api` requests to the backend so there are no CORS issues locally.

### Backend (`App/backend/src/`)

- `index.js` — middleware stack order matters: `helmet → cors → cookieParser → json → authLimiter (on /auth) → verifyToken (on protected routes) → route handler → 404 → error handler`
- `middleware/auth.js` — reads JWT from the HttpOnly cookie (`req.cookies.token`), never from headers. Populates `req.user = { id, email }`.
- `middleware/rateLimiter.js` — `authLimiter` applied only on `/api/auth`.
- `routes/` — flat route files (`auth.js`, `subjects.js`, `topics.js`, `progress.js`). Each file instantiates its own `PrismaClient` directly — there is currently no shared singleton or service layer. Ownership is verified inline with `findFirst({ where: { id, userId } })`.

### Data model (`App/backend/prisma/schema.prisma`)

```
User → Subject → Topic → Progress
```
All relations have `onDelete: Cascade`. `Progress.value` is an integer 0–100.

### Frontend (`App/frontend/src/`)

- `api/axios.js` — single Axios instance with `baseURL: '/api'` and `withCredentials: true` (sends the HttpOnly cookie).
- `context/AuthContext.jsx` — restores session by calling `GET /api/auth/me` on mount. No token in localStorage.
- `components/ProtectedRoute.jsx` — redirects to `/login` if not authenticated.
- `components/ProgressPieChart.jsx` — pie chart showing topic progress distribution (4 buckets: Erste Schritte / Auf Kurs! / Meisterhaft! / Kein Fortschritt). Accepts `subjects` prop from DashboardPage.
- `utils/progressColor.js` — shared color helpers: `progressColor(value)` returns a Tailwind class, `progressColorHex(value)` returns a hex string for Recharts.
- Route structure: `/` (Dashboard), `/subjects/:id` (SubjectPage), `/login`, `/register`.

## Known Issues (prisma branch)

- The original migration `20260415124207_init/migration.sql` was deleted while `20260417121503_init/` exists only as an untracked directory. Resolve before merging: either add the new migration files or squash to a clean baseline with `prisma migrate dev --name init`.
- No error handling on frontend `api.get/post` calls — 401s (JWT expires after 15 min) silently fail.
