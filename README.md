# upsolve

A competitive programming practice workspace backed by Codeforces data. Track your upsolving, record what you learned, schedule reviews, and inspect your practice patterns.

## Prerequisites

- Java 21 (Eclipse Temurin recommended)
- Node.js 20+
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
```

**E2E tests:**
```bash
cd frontend
npx playwright install
npm run test:e2e
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5433` | PostgreSQL port (host) |
| `DB_USER` | `upsolve` | Database username |
| `DB_PASS` | `upsolve` | Database password |
| `SPRING_PROFILES_ACTIVE` | `default` | Spring profiles |

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
