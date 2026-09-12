# Task handoff

## Current status — continuation on 12 September 2026

The previous implementation was already committed at `2597c3b` on `main`, tracking `origin/main` at the private repository `https://github.com/CyberKun/upsolve`. This continuation began by reading this handoff and confirming `git status` was clean and `git diff` empty; completed feature work was retained.

The browser locator is fixed. The duplicate session-store errors were reproduced even though browser assertions passed, then resolved with explicit authentication-strategy handling and a non-persistent security-context repository. The JDBC-backed `userId` session remains authoritative and login still rotates its ID. A new test checks 24 concurrent reads, stable cookies, and invalidation of the old cookie after login. Browser tests now fail on HTTP 5xx responses or backend ERROR logs.

The deployed route check also found that completed accounts could reopen setup. `ProtectedRoute` now redirects them to Today; browser regression checks cover normal and demo accounts. See `docs/feature-audit.md` for the feature inventory, coverage and limitations. API documentation and README testing instructions have been corrected.

The final backend/frontend images are running at `http://localhost`. Deployed desktop routes, queue details, setup redirect and loaded mobile queue passed Chromium smoke checks with no browser/server errors. The existing database was preserved. No known functional blocker remains within the tested scope; broader validation and intentional product limits are recorded in the feature audit.

## Original task/goal

Go through the Upsolve project, identify all features, make sure everything works and is in place, and verify the application end to end.

## Completed so far

- Mapped the product areas: authentication, onboarding, Codeforces handle validation and sync, problem catalog/search, queue management, notes, spaced reviews, Today view, analytics/Insights, settings, export, responsive navigation, and read-only demo mode.
- Fixed SPA CSRF handling so the frontend obtains the cookie token and sends the raw token in `X-XSRF-TOKEN` headers.
- Added session ID rotation at login. Removing the one-session limit alone did not resolve persistence conflicts; the continuation fix above does.
- Scoped submission counts/history and review operations to the authenticated user.
- Replaced mocked review-controller user IDs with the authenticated session user.
- Implemented review schedule lookup, due/overdue/today/upcoming grouping, timezone-aware dates, configurable intervals, outcome progression, snooze behavior, ownership checks, and idempotent review recording with row locking.
- Added review schedule and review-history data to JSON export.
- Added queue status/priority controls and review actions to the problem detail page.
- Added archive-aware queue filtering, active status filtering, priority sorting, table sort controls, error states, and demo-mode write protection in the frontend.
- Made notes handle an absent note as an empty editor, show API errors, respect demo mode, and invalidate related queue/analytics data after saves.
- Added validation for rating ranges, timezone values, increasing review intervals, queue enums, review outcomes, snooze limits, usernames/password byte length, and Codeforces URLs.
- Fixed catalog search to support problem IDs and tag-array matching.
- Changed sync jobs to be authenticated, queued for the scheduled worker, retried on Codeforces failures, paginated through the full submission history, refresh catalog metadata, and reconcile attempted/solved queue state.
- Fixed PostgreSQL-array analytics queries and corrected frontend solve-rate percentage rendering and activity ordering.
- Added deterministic backend integration coverage and disposable browser E2E infrastructure.
- Added frontend ESLint/Vitest configuration, API/URL unit tests, Docker ignore files, and a Docker 29/Testcontainers API-version setting.
- Updated Codeforces configuration to honor `CF_API_BASE_URL` and `CF_RATE_LIMIT_MS` environment variables.
- Updated the Maven wrapper script so a fresh Unix wrapper directory is created before downloading Maven.
- Made the legacy `gen.py` scaffolder refuse to overwrite existing project code.

## Important decisions

- Server-side sessions remain the authentication mechanism; the SPA uses the cookie-based CSRF repository with a custom handler that accepts the raw header token.
- Review dates use each user’s configured IANA timezone. The user’s interval list is authoritative and must be strictly increasing.
- A review outcome advances the interval only for an independent solve without revealed notes; a failed review resets to the first interval and a hint keeps the current interval.
- Sync is user-triggered through an authenticated endpoint and processed by a scheduled worker so the database transaction commits before asynchronous work begins.
- Synced problems without an accepted submission become `ATTEMPTED`; accepted submissions make the user’s queue item `SOLVED`.
- Browser E2E uses a disposable PostgreSQL container and a local deterministic Codeforces stub; it does not touch the developer’s running Compose database.

## Files modified

The lists below record the earlier implementation already in `2597c3b`. Files changed during this continuation are `HANDOFF.md`, `README.md`, `docs/api-contract.md`, the new `docs/feature-audit.md`, `backend/src/main/java/dev/upsolve/auth/SecurityConfig.java`, `backend/src/test/java/dev/upsolve/FeatureIntegrationTest.java`, `frontend/src/features/auth/ProtectedRoute.tsx`, `frontend/e2e/features.spec.ts`, and `frontend/e2e/run.mjs`. Continuation changes are not committed or pushed.

Backend:

- `backend/src/main/java/dev/upsolve/auth/SpaCsrfTokenRequestHandler.java`
- `backend/src/main/java/dev/upsolve/auth/SecurityConfig.java`
- `backend/src/main/java/dev/upsolve/auth/AuthController.java`
- `backend/src/main/java/dev/upsolve/auth/AuthService.java`
- `backend/src/main/java/dev/upsolve/common/GlobalExceptionHandler.java`
- `backend/src/main/java/dev/upsolve/profile/PreferencesService.java`
- `backend/src/main/java/dev/upsolve/profile/UserPreferencesRepository.java`
- `backend/src/main/java/dev/upsolve/problems/ProblemController.java`
- `backend/src/main/java/dev/upsolve/problems/ProblemRepository.java`
- `backend/src/main/java/dev/upsolve/problems/ProblemService.java`
- `backend/src/main/java/dev/upsolve/problems/SubmissionRepository.java`
- `backend/src/main/java/dev/upsolve/queue/QueueItem.java`
- `backend/src/main/java/dev/upsolve/queue/QueueItemSpecs.java`
- `backend/src/main/java/dev/upsolve/queue/QueueService.java`
- `backend/src/main/java/dev/upsolve/queue/QueueController.java`
- `backend/src/main/java/dev/upsolve/queue/dto/AddToQueueRequest.java`
- `backend/src/main/java/dev/upsolve/queue/dto/UpdateQueueItemRequest.java`
- `backend/src/main/java/dev/upsolve/notes/NotesService.java`
- `backend/src/main/java/dev/upsolve/reviews/ReviewController.java`
- `backend/src/main/java/dev/upsolve/reviews/ReviewSchedule.java`
- `backend/src/main/java/dev/upsolve/reviews/ReviewScheduleRepository.java`
- `backend/src/main/java/dev/upsolve/reviews/ReviewService.java`
- `backend/src/main/java/dev/upsolve/reviews/dto/RecordReviewRequest.java`
- `backend/src/main/java/dev/upsolve/reviews/dto/SnoozeRequest.java`
- `backend/src/main/java/dev/upsolve/export/ExportService.java`
- `backend/src/main/java/dev/upsolve/export/dto/ExportData.java`
- `backend/src/main/java/dev/upsolve/sync/AsyncConfig.java`
- `backend/src/main/java/dev/upsolve/sync/SyncController.java`
- `backend/src/main/java/dev/upsolve/sync/SyncJob.java`
- `backend/src/main/java/dev/upsolve/sync/SyncJobRunner.java`
- `backend/src/main/java/dev/upsolve/sync/SyncService.java`
- `backend/src/main/resources/application.yml`
- `backend/src/test/java/dev/upsolve/FeatureIntegrationTest.java`
- `backend/src/test/resources/docker-java.properties`
- `backend/.dockerignore`
- `backend/mvnw`

Frontend:

- `frontend/src/app/App.tsx`
- `frontend/src/features/auth/AuthContext.tsx`
- `frontend/src/features/auth/AuthProvider.tsx`
- `frontend/src/features/auth/LoginPage.tsx`
- `frontend/src/features/auth/RegisterPage.tsx`
- `frontend/src/features/insights/InsightsPage.tsx`
- `frontend/src/features/insights/hooks.ts`
- `frontend/src/features/notes/NotesEditor.tsx`
- `frontend/src/features/notes/hooks.ts`
- `frontend/src/features/onboarding/SetupPage.tsx`
- `frontend/src/features/queue/AddProblemDialog.tsx`
- `frontend/src/features/queue/ProblemActions.tsx`
- `frontend/src/features/queue/ProblemDetailPage.tsx`
- `frontend/src/features/queue/QueuePage.tsx`
- `frontend/src/features/queue/QueueTable.tsx`
- `frontend/src/features/queue/hooks.ts`
- `frontend/src/features/reviews/ReviewSession.tsx`
- `frontend/src/features/settings/SettingsPage.tsx`
- `frontend/src/features/settings/hooks.ts`
- `frontend/src/features/today/TodayPage.tsx`
- `frontend/src/features/today/hooks.ts`
- `frontend/src/shared/api/client.ts`
- `frontend/src/shared/api/client.test.ts`
- `frontend/src/shared/api/problemUrl.ts`
- `frontend/src/shared/api/types.ts`
- `frontend/src/shared/ui/SyncIndicator.tsx`
- `frontend/src/test/setup.ts`
- `frontend/eslint.config.js`
- `frontend/vitest.config.ts`
- `frontend/playwright.config.ts`
- `frontend/e2e/run.mjs`
- `frontend/e2e/features.spec.ts`
- `frontend/.dockerignore`
- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/vite.config.ts`

Project/configuration:

- `.env.example`
- `.gitignore`
- `compose.yaml`
- `gen.py`

## Current errors or blockers

- The original browser locator failure and duplicate `SPRING_SECURITY_CONTEXT` inserts are resolved. An intermediate security configuration failed at startup because explicit `IF_REQUIRED` conflicts with explicit authentication-strategy handling; removing the redundant policy fixed it. Subsequent backend and browser checks passed.
- `docker compose` is already running in the workspace (`upsolver-db-1`, `upsolver-backend-1`, `upsolver-frontend-1`). Do not reset or truncate that database; the integration/E2E harness uses disposable databases.
- `npm audit` is clean after upgrading Vitest to `4.1.11`. The production bundle still emits a non-failing chunk-size warning for the main chunk.

## Tests/builds already run

- Backend `cd backend; .\mvnw.cmd verify -B -ntp`: passed on the final backend source. `FeatureIntegrationTest` reports 10 tests, 0 failures, 0 errors. It covers auth/CSRF/logout, concurrent authentication/session rotation, setup validation, queue CRUD/version conflicts/archive, notes conflicts, review scheduling/idempotency/export, user scoping, analytics/search/submission isolation, and 501-submission sync pagination/repeatability.
- Frontend `npm run build`: passed. Vite emitted only the existing non-failing chunk-size warning; after lazy-loading Insights the generated Insights chunk is split out.
- Frontend `npm test`: passed. 1 test file, 7 tests passed.
- Frontend `npm run lint`: run after adding ESLint 9 flat config; no lint errors were emitted in the completed run.
- Frontend `npm run type-check`: passed in the completed run.
- Frontend `npm audit`: passed with 0 vulnerabilities.
- Direct live Codeforces checks for `user.info?handles=tourist` and `user.status?handle=tourist&from=1&count=1`: both returned HTTP 200 and `status: OK`.
- Frontend `npm run test:e2e`: both Chromium tests passed, including the new completed-account setup redirects. No HTTP 5xx assertion failures or backend ERROR logs. The runner cleaned up its disposable database and backend.
- Mobile E2E rerun after waiting for loaded queue cards before checking overflow: 1 passed, no backend ERROR logs.
- Docker Compose builds and deployed browser smoke checks: passed. Backend/frontend were recreated without restarting, truncating or reseeding the existing database. Desktop Insights and loaded mobile queue screenshots were visually inspected. Build logs and browser artifacts are ignored by Git.

## What remains unfinished

No required implementation or verification step from this audit remains. Continuation changes are uncommitted and unpushed. Optional future work includes broader browser/accessibility/load coverage, large live imports, and the documented product limitations; none should be described as already verified.

## Exact next steps for the next Codex session

1. Read this current status and `docs/feature-audit.md`, then inspect `git status` and `git diff`. Preserve the uncommitted continuation fixes; do not repeat the completed audit.
2. If asked to commit/push, review the nine continuation files listed above, run `git diff --check`, then commit and push to the existing `origin/main`. No new repository is needed.
3. If changing backend behavior, run `cd backend; .\mvnw.cmd verify -B -ntp`, then run `cd ../frontend; npm run test:e2e` against the newly packaged JAR. Frontend-only changes require relevant build/lint/browser checks.
4. Treat cross-browser coverage, load testing, dependency major-version upgrades and large live Codeforces imports as additional work, not unresolved failures from this audit. Product limitations are documented in README and the feature audit.
5. Preserve `upsolver-db-1` and its volume. Tests use disposable databases; never truncate or reseed the existing database to rerun verification.
