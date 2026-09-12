# Feature audit — 12 September 2026

This audit continues the work recorded in `HANDOFF.md`. The repository started this continuation clean at `2597c3b` on `main`; completed implementation work was retained.

## Feature inventory and evidence

| Feature | Implemented behavior | Verification |
| --- | --- | --- |
| Accounts and sessions | Register, case-insensitive login, session cookies, CSRF protection, logout, setup gating | Backend integration tests and desktop browser workflow |
| Concurrent authentication | Requests authenticate from session `userId`; login rotates the session ID; no duplicate persisted security context | 24 concurrent authenticated reads, stable cookie, old cookie rejected after login; browser run without backend errors |
| Onboarding | Codeforces handle validation, immutable tracked handle, difficulty/topics/timezone preferences, initial sync | Backend validation tests and browser setup workflow |
| Codeforces sync | Committed job queue, progress/history, retries, paginated submissions, refreshed catalog, attempted/solved reconciliation | Integration test imports 501 submissions and repeats sync; browser sync with deterministic API stub |
| Problem catalog | Search by name/ID, rating/tag filters, add by catalog entry or validated Codeforces URL | Backend catalog queries, URL unit tests, browser catalog search/add |
| Upsolve queue | Status/priority, active/archive filtering, sorting, details, archive/unarchive, ownership and optimistic version checks | Integration tests plus browser priority, solve, archive and restore |
| Problem history | User-scoped submission list/count and queue event history | Integration ownership/count/event assertions |
| Notes | Four reflection fields, mistake categories, repeated saves, conflicts, missing-note editor | Backend save/conflict tests; browser saves twice and reveals persisted text |
| Reviews | Enable/pause, timezone-aware due groups, configurable intervals, snooze, note reveal, three outcomes, idempotent recording | Backend scheduling/outcome/scoping tests; browser enable/review/record and Reviews list |
| Today | Due reviews, queue summary and next actions | Desktop and mobile browser landing/navigation |
| Insights | Topics, difficulty bands, weekly activity, mistake patterns, corrected percentages | PostgreSQL-backed analytics assertions and browser chart-page render |
| Settings and export | Save preferences, sync history, JSON export of queue/notes/preferences/schedules/reviews, logout | Backend validation/export assertions and browser save/download/logout |
| Demo and mobile | Seeded read-only demo, responsive menu, write controls disabled | Backend demo write rejection; Chromium at 390×844 with no horizontal overflow on login/queue |
| Packaging | Maven wrapper, frontend production build, Docker Compose, Nginx SPA/API routing | Build and local deployment checks |

## Fixes in this continuation

- Scoped the revealed-note browser assertion to its review panel; the same text also exists in the editor.
- Confirmed that passing browser assertions previously concealed duplicate `SPRING_SECURITY_CONTEXT` inserts in PostgreSQL. Removed implicit session-authentication handling and persistent security-context storage. Authentication still uses the JDBC-backed `userId` session; the login controller retains session-fixation protection.
- Added a concurrency/session-rotation regression test. Browser tests now also assert no HTTP 5xx responses, and their runner fails when backend ERROR logs occur.
- Redirected completed accounts away from setup to Today, preventing an unusable onboarding form for existing and demo accounts. Both account types have browser regression coverage.
- Corrected obsolete API routes in `api-contract.md` and documented test prerequisites in the README.

## Verification results

- Backend Maven `verify`: **10 tests passed**, zero failures/errors; executable JAR packaged successfully.
- Frontend production build: **passed**. Main JS chunk is approximately 517 KB; Vite's 500 KB advisory remains. Insights is a separate approximately 390 KB chunk.
- Frontend unit tests: **7 passed**.
- ESLint and TypeScript checks: **passed**.
- `npm audit`: **0 vulnerabilities** at this audit date.
- Chromium E2E: **2 passed**, with no HTTP 5xx assertions or backend ERROR logs. Uses a fresh disposable PostgreSQL container and local Codeforces fixture server.
- Mobile E2E was rerun after strengthening its assertion to wait for loaded queue cards: **1 passed**, without backend ERROR logs.
- Docker Compose backend/frontend images: **built and running at http://localhost** with the existing database preserved. Chromium smoke checks passed for login/register, Today, queue/detail, Reviews, Insights, Settings, and the completed-account setup redirect. Loaded mobile queue content passed the overflow check; desktop Insights and mobile queue screenshots were visually inspected.

An initial session-configuration test run failed at startup because explicitly setting `IF_REQUIRED` conflicts with explicit authentication-strategy handling in this Spring Security version. Removing that redundant session-policy setting resolved the startup failure; the subsequent full integration and browser runs passed.

## Scope and known limits

These checks cover the listed workflows; they are not proof against every input, concurrency pattern, or browser. Firefox/WebKit, accessibility certification, load testing, and a complete import from a large live Codeforces account were not performed. The previous session verified live `user.info` and a one-submission `user.status` request; repeatable sync tests use fixtures.

Product limits remain: one immutable tracked handle, no email verification/password reset, no review notifications, and a single-instance deployment design. JSON export contains practice data rather than a full database backup. Demo data requires seeding a fresh database; the existing development database must not be reset or blindly reseeded. Dependency installation reports maintenance/deprecation notices for Recharts 2 and ESLint 9, although the npm vulnerability audit is clean.
