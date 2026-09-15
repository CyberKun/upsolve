# upsolve

A competitive programming practice workspace backed by Codeforces data. Track your upsolving, record what you learned, schedule reviews, and inspect your practice patterns.

The redesigned collection catalog is available at `/explore`. See the [frontend design handoff](docs/frontend-redesign.md) for palettes, components, data replacement, and validation commands.

Read the [PDF user guide](output/pdf/Upsolve-User-Guide.pdf) for setup, daily practice, notes, reviews, Insights, export, and local troubleshooting.

## Prerequisites

- Java 21 (Eclipse Temurin recommended)
- Node.js 20.19+ (or 22.12+)
- Docker and Docker Compose v2
- Maven 3.9+ (or use the included Maven Wrapper)

## Quick Start

### 1. Clone and configure

```bash
cp .env.example .env
```

Edit `.env` if you need to change database credentials or ports.

### 2. Start with Docker Compose

```bash
docker compose up -d
```

This starts PostgreSQL, the backend, and the Nginx-served frontend.

- Frontend: http://localhost
- Backend API: http://localhost:8080/api/v1

### 3. Development mode

**Database:**
```bash
docker compose up db -d
```

**Backend:**
```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Frontend dev server runs at http://localhost:5173 with API proxy to :8080.

## First Sync

1. Register an account
2. Enter your Codeforces handle (e.g., `tourist`)
3. Set your target difficulty range and preferred topics
4. The app imports your public submission history

## Running Tests

**Backend:**
```bash
cd backend
./mvnw verify
```
Requires Docker for Testcontainers.

**Frontend:**
```bash
cd frontend
npm test
npm run lint
npm run type-check
npm run build
npm audit
```

**E2E tests:**
Build the backend JAR first with `./mvnw verify` (Windows: `.\mvnw.cmd verify`). Keep Docker running and Java 21 on PATH.

```bash
cd frontend
npx playwright install chromium
npm run test:e2e
```

The runner starts a disposable PostgreSQL database, a deterministic Codeforces stub, the backend on port 18080, and Vite on port 15173. These ports must be free. It leaves the development database intact and fails on browser assertions, HTTP 5xx responses, or backend ERROR logs. Diagnostics are in `frontend/e2e-backend.log` and `frontend/test-results/`.

See [feature audit](docs/feature-audit.md) for coverage and known limits, and [API contract](docs/api-contract.md) for current endpoints.

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5433` | PostgreSQL port (host) |
| `DB_USER` | `upsolve` | Database username |
| `DB_PASS` | `upsolve` | Database password |
| `SPRING_PROFILES_ACTIVE` | `default` | Spring profiles |
| `CF_API_BASE_URL` | `https://codeforces.com/api` | Codeforces API base URL |
| `CF_RATE_LIMIT_MS` | `2500` | Minimum delay between Codeforces calls |

## Project Structure

```
/backend    — Spring Boot API (Java 21)
/frontend   — React + TypeScript + Vite
/docs       — Architecture and design documentation
/infra      — Nginx and deployment configuration
```

## Limitations

- Single tracked Codeforces handle per user (immutable after setup)
- No email verification or password reset
- No email/push notifications for reviews
- Designed for single-instance deployment
- Demo mode is read-only with seeded data

## License

MIT
