# TrackIt — Anforderungs-Audit

**Branch:** `prisma` | **Datum:** 2026-04-20

---

## F-01 · Registrierung und Login

| Kriterium | Status | Befund |
|---|---|---|
| E-Mail-Validierung client- und serverseitig | PASS | Client: `type="email"` (HTML5, `RegisterPage.jsx:36`). Server: `z.string().email()` (`auth.js:13`) |
| Passwort: min. 8 Zeichen, 1 Zahl, 1 Sonderzeichen | PASS | Zod prüft alle 5 Regeln: min 8, a-z, A-Z, 0-9, Sonderzeichen (`auth.js:14–19`). Live-Stärkeanzeige im Formular. |
| JWT-Token nach Login (httpOnly Cookie) | PASS | `httpOnly: true, sameSite: 'strict'` gesetzt (`auth.js:25–30`) |
| 401 bei ungültigem Token auf geschützten Routen | PASS | `verifyToken`-Middleware wirft 401 (`middleware/auth.js:7`) |

---

## F-04 · Fortschritt eintragen

| Kriterium | Status | Befund |
|---|---|---|
| Slider (0–100 %) oder Dropdown (4 Status-Labels) | PASS | Slider mit Live-Badge und editierbarem Zahlenfeld (`SubjectPage.jsx:129–138`) |
| Jeder Eintrag mit Datum/Uhrzeit gespeichert | PASS | `Progress.createdAt @default(now())` (`schema.prisma:43`) |
| Verlauf bleibt erhalten (mehrere Einträge) | PARTIAL | Backend legt neue Einträge an (kein Überschreiben, `progress.js:43`). Frontend zeigt aber nur den letzten Eintrag (`t.progress?.[0]`) — kein Verlaufs-UI |
| Eingabe in < 3 Klicks vom Dashboard | PASS | Klick 1: Fach öffnen → Klick 2: „Eintragen" → Klick 3: „Speichern" |

---

## U-01 · Zero-Setup-Prinzip

| Kriterium | Status | Befund |
|---|---|---|
| Kein Setup-Aufwand beim ersten Login | PASS | Nach Registrierung direkt zum Dashboard (`RegisterPage.jsx:16`) |
| Onboarding in max. 3 Schritten | FAIL | Kein Onboarding-Flow. Leeres Dashboard zeigt nur grauen Text „Noch keine Fächer angelegt." — kein geführter Einstieg |
| Jede Seite in max. 3 Klicks erreichbar | PASS | App hat nur 2 Hauptseiten (Dashboard, SubjectPage) |
| Fehlermeldungen auf Deutsch mit Lösung | FAIL | Server-Fehler auf Englisch (`'Email already in use'`, `'Invalid credentials'` — `auth.js:40, 59`). Frontend-Meldungen ohne Lösungshinweis |

---

## Performance

| Kriterium | Status | Befund |
|---|---|---|
| Seitenaufbau < 2 s (Dashboard) | UNKNOWN | Technisch plausibel bei SQLite + lokalem Dev, aber kein Load-Test vorhanden |
| Charts rendern in max. 1,5 s | PASS | `recharts` installiert. `ProgressPieChart.jsx` zeigt Topic-Verteilung (4 Buckets) auf dem Dashboard. Rendert sofort bei kleinen Datensätzen. |
| Bis zu 100 gleichzeitige Nutzer | FAIL | SQLite ist ein Single-Writer-DBMS — nicht geeignet für 100 parallele Schreibzugriffe |
| Keine Verlangsamung bei 20 Fächern | UNKNOWN | Kein Pagination, aber für 20 Fächer bei SQLite unkritisch — Risiko bei echtem Last-Test |

---

## Zusammenfassung

| Priorität | Anforderung | Gap |
|---|---|---|
| ~~Hoch~~ | ~~F-01 Passwort-Regex~~ | ~~Zahl + Sonderzeichen fehlt serverseitig~~ → **Behoben** |
| ~~Hoch~~ | ~~F-04 Slider/Dropdown~~ | ~~Kein Slider, kein Status-Dropdown~~ → **Behoben** |
| ~~Hoch~~ | ~~Performance Charts~~ | ~~Keine Charting-Komponente vorhanden~~ → **Behoben** |
| Hoch | 100 concurrent users | SQLite nicht geeignet |
| Mittel | F-04 Verlaufs-UI | Daten vorhanden, kein Frontend dafür |
| Mittel | U-01 Fehlermeldungen | Englische Server-Fehler, kein Lösungshinweis |
| Mittel | U-01 Onboarding | Kein geführter Einstieg |

**Ergebnis:** 7 von 13 Kriterien bestanden · 4 nicht erfüllt · 2 nicht messbar
