# API contract

Base URL: `/api/v1`. JSON request and response bodies unless stated otherwise. All routes require the `UPSOLVE_SESSION` cookie except health, CSRF bootstrap, registration, and login. Bootstrap with `GET /auth/csrf` and send the raw `XSRF-TOKEN` cookie value in `X-XSRF-TOKEN` for modifying requests, including login and registration. Login rotates the session ID; logout invalidates it. Demo accounts may read data and log out but cannot modify it.

## Authentication and profile

| Method and path | Body / behavior |
| --- | --- |
| `GET /health` | Health response |
| `GET /auth/csrf` | Sets CSRF cookie; also returns token/header metadata |
| `POST /auth/register` | `{username, password}`; 201 |
| `POST /auth/login` | `{username, password}`; returns current user and session cookie |
| `POST /auth/logout` | Invalidates session; 204 |
| `GET /auth/me` | Current user and setup state |
| `GET /preferences` | Handle, timezone, rating targets, topics, review intervals |
| `PATCH /preferences` | Optional `targetRatingMin`, `targetRatingMax`, `preferredTopics`, `timeZone`, `reviewIntervals` |
| `POST /tracked-handle` | `{handle}`; validates with Codeforces, completes setup and queues initial sync; handle is immutable |
| `GET /export` | Downloads JSON containing the user ID, preferences, queue, notes, schedules and review history |

Rating targets are 800–3500 with minimum no greater than maximum. Timezone must be an IANA zone. Review intervals contain 1–20 strictly increasing positive day counts, each at most 3650.

## Sync and catalog

| Method and path | Behavior |
| --- | --- |
| `POST /sync-jobs` | Queues a sync; 202 with job |
| `GET /sync-jobs` | Current user's jobs |
| `GET /sync-jobs/{id}` | Current user's job status/progress |
| `GET /problems` | Paginated catalog; `search`, `minRating`, `maxRating`, `tags`, `page`, `size`, `sort` |
| `GET /problems/{id}` | Problem details by internal numeric catalog ID |

The worker processes committed jobs, pages through submissions and retries Codeforces calls. Imported failed attempts become `ATTEMPTED`; accepted submissions make queue items `SOLVED`.

## Queue and notes

Here `{id}` is the user's queue-item UUID, not a Codeforces problem ID. Private resources belonging to another user return 404.

| Method and path | Body / behavior |
| --- | --- |
| `GET /queue` | Paginated queue; `status`, `priority`, `archived`, `search`, `minRating`, `maxRating`, `page`, `size`, `sort` |
| `POST /queue` | `{problemId}` or `{problemUrl}`, optional `priority`; 201 |
| `GET /queue/{id}` | Problem, queue state, version, note/review flags and submission count |
| `PATCH /queue/{id}` | Required current `version`; optional `status`, `priority` |
| `POST /queue/{id}/archive` | Archives item |
| `POST /queue/{id}/unarchive` | Restores item |
| `GET /queue/{id}/submissions` | User's submission history for the problem |
| `GET /queue/{id}/events` | Queue event history |
| `GET /queue/{id}/notes` | Note; 404 if none saved |
| `PUT /queue/{id}/notes` | Required `version` (0 for first save); `stuckReason`, `keyObservation`, `approachComplexity`, `whatToRemember`, `mistakeCategories` |

Statuses: `PENDING`, `ATTEMPTED`, `SOLVED`; queue filtering also accepts `ACTIVE` for unsolved items. Priorities: `LOW`, `MEDIUM`, `HIGH`. Queue and note edits use optimistic versions and return 409 on stale writes. Each note text field allows at most 10,000 characters. Pagination responses include `content`, `totalElements`, `totalPages`, `page`, and `size`.

## Reviews

| Method and path | Body / behavior |
| --- | --- |
| `GET /reviews/due` | `overdue`, `today`, `upcoming` arrays in the user's timezone |
| `GET /queue/{id}/review-schedule` | Current schedule |
| `PUT /queue/{id}/review-schedule` | `{enabled: true/false}` enables or pauses reviews |
| `POST /queue/{id}/review-schedule/snooze` | `{days}`; 1–365 |
| `POST /queue/{id}/reviews` | `outcome`, `notesRevealed`, optional `reflection`, required `idempotencyKey` |

Outcomes: `SOLVED_INDEPENDENTLY`, `NEEDED_HINT`, `COULD_NOT_SOLVE`. An independent solve without revealed notes advances the interval, a hint keeps it, and a failed review resets it. Reusing a review idempotency key does not record a second review. Schedule responses contain `queueItemId`, `intervalIndex`, `nextReviewDate`, `paused`, and `version`.

## Analytics

| Method and path | Query / behavior |
| --- | --- |
| `GET /analytics/topics` | Optional `minRating`, `maxRating`; topic performance |
| `GET /analytics/difficulty` | Difficulty bands |
| `GET /analytics/activity` | `weeks` defaults to 12; weekly activity |
| `GET /analytics/mistakes` | Mistake category counts from notes |

Errors use HTTP status codes: 400 for invalid input, 401 for missing/invalid authentication, 403 for CSRF/demo write protection, 404 for missing or foreign resources, and 409 for conflicts. The controllers and DTOs under `backend/src/main/java/dev/upsolve` are authoritative for response fields.
