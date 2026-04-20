# TrackIt

> Lernfortschritts-App für Studierende
> HWR Berlin · WI24C · 4. Semester · SS 2025 · Gruppe 4

TrackIt ist eine Webanwendung, mit der Studierende ihre Fächer und Themen
verwalten und ihren Lernfortschritt dokumentieren können. Jedes Thema lässt
sich mit einem Fortschrittswert (0–100 %) und einer optionalen Notiz
versehen; auf dem Dashboard wird der durchschnittliche Fortschritt pro Fach
visualisiert.

---

## Tech Stack

| Schicht    | Technologie                                          |
|------------|------------------------------------------------------|
| Frontend   | React 18, Vite, React Router v6, Tailwind CSS, Axios |
| Backend    | Node.js 20, Express.js, Prisma ORM                   |
| Datenbank  | SQLite (Dev) — keine Installation nötig              |
| Auth       | JWT als HttpOnly Cookie                              |
| Deployment | Render.com (geplant)                                 |

---

## Projektstruktur

```
App/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # User · Subject · Topic · Progress (SQLite)
│   │   └── dev.db                # SQLite-Datenbankdatei (wird automatisch erstellt)
│   └── src/
│       ├── index.js              # Express-Entrypoint
│       ├── middleware/
│       │   ├── auth.js           # JWT-Verify (HttpOnly Cookie)
│       │   └── rateLimiter.js    # 20 req / 15 min auf POST /auth/*
│       └── routes/
│           ├── auth.js           # Register · Login · Logout · Me
│           ├── subjects.js       # CRUD
│           ├── topics.js         # CRUD + Rename
│           └── progress.js       # Create · Read
└── frontend/
    └── src/
        ├── api/axios.js          # withCredentials: true
        ├── context/AuthContext   # Session-Restore per Cookie
        ├── components/
        │   ├── ProtectedRoute    # Redirect zu /login wenn nicht eingeloggt
        │   ├── BottomTabBar      # Navigation: Dashboard · Fortschritt · Profil
        │   ├── LogoIcon          # Teal Rounded Square mit Waveform-SVG
        │   ├── ProgressBar       # Farbkodierter Balken (rot/gelb/grün)
        │   ├── ProgressRing      # SVG-Ringdiagramm
        │   └── MiniBarChart      # Themen-Übersicht pro Fach
        └── pages/
            ├── LoginPage         # Anmeldung
            ├── RegisterPage      # Registrierung mit Passwort-Stärke-Meter
            ├── DashboardPage     # Statistiken + Fächer-Liste + Gesamtfortschritts-Ring
            ├── SubjectPage       # Themen + Slider-Fortschritt + Rename
            ├── FortschrittPage   # Gesamtring + Fach-Breakdown + Topic-Ranking
            └── ProfilPage        # Avatar + Einstellungen + Abmelden
```

---

## Setup

### Voraussetzungen
- Node.js v20
- Kein Datenbankserver nötig — SQLite läuft als lokale Datei

### 1. Backend starten
```bash
cd App/backend
cp .env.example .env        # JWT_SECRET anpassen
npm install
npx prisma migrate dev --name init   # erstellt prisma/dev.db automatisch
npm run dev                 # → http://localhost:3001
```

### 2. Frontend starten
```bash
cd App/frontend
npm install
npm run dev                 # → http://localhost:5173
```

---

## Features

- **Registrierung & Login** mit sicherer Session-Verwaltung + Passwort-Stärke-Anzeige
- **Fächer** anlegen, löschen, auf Dashboard übersichtlich anzeigen
- **Themen** pro Fach verwalten + umbenennen
- **Fortschritt** pro Thema (0–100 %) via Slider mit optionaler Notiz
- **Dashboard-Statistik**: Anzahl Fächer, Themen, Ø-Fortschritt + Gesamtfortschritts-Ring
- **Fortschritt-Seite**: Gesamtring, Fach-Breakdown, sortiertes Topic-Ranking
- **Profil-Seite**: Nutzer-Avatar, Statistiken, Abmelden
- **Sortierung**: Fächer mit höchstem Fortschritt zuerst
- **Farbkodierung** der Balken (rot / gelb / grün via oklch)
- **Dark Theme**: GitHub-inspiriertes Design mit DM Sans, 390×844 iPhone-Frame

---

## Sicherheit

Die Architektur folgt den OWASP-Empfehlungen und dem projekteigenen
STRIDE-Threat-Model:

| Maßnahme                                   | Schutz vor                               |
|--------------------------------------------|------------------------------------------|
| JWT als HttpOnly-Cookie                    | XSS-basiertes Token-Diebstahl (Spoofing) |
| `SameSite=Strict`                          | CSRF-Angriffe                            |
| `bcrypt` mit 12 Rounds                     | Brute-Force auf Passwörter               |
| Rate Limiter auf POST `/api/auth/*`        | Credential-Stuffing (20 req / 15 min)    |
| `where: { userId }` auf allen Prisma-Queries | IDOR-Angriffe                          |
| Prisma (parametrisierte Queries)           | SQL-Injection                            |
| Zentraler Error-Handler                    | Information Disclosure via Stack-Traces  |
| Zod-Schema-Validierung                     | Tampering, ungültige Eingaben            |
| Helmet Middleware                          | Clickjacking, MIME-Sniffing u. a.        |

---

## API-Routen

Alle Routen außer `POST /api/auth/register`, `POST /api/auth/login` und
`GET /api/auth/me` erfordern ein gültiges JWT-Cookie (Default-Deny auf Router-Ebene).

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
| PATCH    | `/api/topics/:id`            | Thema umbenennen                 |
| DELETE   | `/api/topics/:id`            | Thema löschen                    |
| GET      | `/api/progress?topicId=…`    | Fortschrittsverlauf              |
| POST     | `/api/progress`              | Neuen Fortschritt eintragen      |

---

## Team

Gruppe 4 · HWR Berlin · WI24C · Software Engineering SS 2025
