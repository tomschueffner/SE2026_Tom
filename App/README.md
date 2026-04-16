# TrackIt

> Lernfortschritts-App für Studierende

TrackIt ist eine Webanwendung, mit der Studierende ihre Fächer und Themen
verwalten und ihren Lernfortschritt dokumentieren können. Jedes Thema lässt
sich mit einem Fortschrittswert (0–100 %) und einer optionalen Notiz
versehen; auf dem Dashboard wird der durchschnittliche Fortschritt pro Fach
visualisiert.

---

## Tech Stack

| Schicht    | Technologie                                    |
|------------|------------------------------------------------|
| Frontend   | React 18, Vite, React Router v6, Tailwind CSS, Axios |
| Backend    | Node.js 20, Express.js, Prisma ORM             |
| Datenbank  | PostgreSQL 15                                  |
| Auth       | JWT als HttpOnly Cookie                        |
| Deployment | Render.com (geplant)                           |

---

## Projektstruktur

```
App/
├── backend/
│   ├── prisma/schema.prisma      # User · Subject · Topic · Progress
│   └── src/
│       ├── index.js              # Express-Entrypoint
│       ├── middleware/
│       │   ├── auth.js           # JWT-Verify (HttpOnly Cookie)
│       │   └── rateLimiter.js    # 5 req / 15 min auf /auth/*
│       └── routes/
│           ├── auth.js           # Register · Login · Logout · Me
│           ├── subjects.js       # CRUD
│           ├── topics.js         # CRUD
│           └── progress.js       # Create · Read
└── frontend/
    └── src/
        ├── api/axios.js          # withCredentials: true
        ├── context/AuthContext   # Session-Restore per Cookie
        ├── components/ProtectedRoute
        └── pages/
            ├── LoginPage
            ├── RegisterPage
            ├── DashboardPage     # Statistiken + Fächer-Liste
            └── SubjectPage       # Themen + Fortschritt
```

---

## Setup

### Voraussetzungen
- Node.js v20
- PostgreSQL 15 (`brew install postgresql@15`)

### 1. Datenbank vorbereiten
```bash
brew services start postgresql@15
psql postgres -c "CREATE USER trackit WITH PASSWORD 'trackit';"
psql postgres -c "CREATE DATABASE trackit OWNER trackit;"
psql postgres -c "ALTER USER trackit CREATEDB;"
```

### 2. Backend starten
```bash
cd App/backend
cp .env.example .env             # JWT_SECRET setzen!
npm install
npx prisma migrate dev --name init
npm run dev                      # → http://localhost:3001
```

### 3. Frontend starten
```bash
cd App/frontend
npm install
npm run dev                      # → http://localhost:5173
```

---

## Features

- **Registrierung & Login** mit sicherer Session-Verwaltung
- **Fächer** anlegen, löschen, auf Dashboard übersichtlich anzeigen
- **Themen** pro Fach verwalten
- **Fortschritt** pro Thema (0–100 %) mit optionaler Notiz
- **Dashboard-Statistik**: Anzahl Fächer, Themen, Ø-Fortschritt
- **Sortierung**: Fächer mit höchstem Fortschritt zuerst
- **Farbkodierung** der Balken (rot / gelb / grün)

---

## Sicherheit

Die Architektur folgt den OWASP-Empfehlungen und dem projekteigenen
STRIDE-Threat-Model:

| Maßnahme                         | Schutz vor                                    |
|----------------------------------|-----------------------------------------------|
| JWT als HttpOnly-Cookie          | XSS-basiertes Token-Diebstahl (Spoofing)      |
| `SameSite=Strict`                | CSRF-Angriffe                                 |
| `bcrypt` mit 12 Rounds           | Brute-Force auf Passwörter                    |
| Rate Limiter auf `/api/auth/*`   | Credential-Stuffing (5 req / 15 min)          |
| `where: { userId }` auf allen Prisma-Queries | IDOR-Angriffe                     |
| Prisma (parametrisierte Queries) | SQL-Injection                                 |
| Zentraler Error-Handler          | Information Disclosure via Stack-Traces       |
| Zod-Schema-Validierung           | Tampering, ungültige Eingaben                 |
| Helmet Middleware                | Clickjacking, MIME-Sniffing u. a.             |

---

## API-Routen

Alle Routen außer `/api/auth/*` erfordern ein gültiges JWT-Cookie
(Default-Deny auf Router-Ebene).

| Methode  | Pfad                         | Beschreibung                     |
|----------|------------------------------|----------------------------------|
| POST     | `/api/auth/register`         | Neuen Nutzer anlegen             |
| POST     | `/api/auth/login`            | Einloggen                        |
| POST     | `/api/auth/logout`           | Cookie löschen                   |
| GET      | `/api/auth/me`               | Aktuellen Nutzer abrufen         |
| GET      | `/api/subjects`              | Alle Fächer (mit Topics+Progress)|
| POST     | `/api/subjects`              | Fach anlegen                     |
| DELETE   | `/api/subjects/:id`          | Fach löschen                     |
| GET      | `/api/topics?subjectId=…`    | Themen eines Fachs               |
| POST     | `/api/topics`                | Thema anlegen                    |
| DELETE   | `/api/topics/:id`            | Thema löschen                    |
| GET      | `/api/progress?topicId=…`    | Fortschrittsverlauf              |
| POST     | `/api/progress`              | Neuen Fortschritt eintragen      |
