# API Contract

## Overview
Base URL: `/api/v1`

## Endpoints

### Auth
- `POST /auth/register`: Register a new user.
- `POST /auth/login`: Authenticate and start a session.
- `POST /auth/logout`: Invalidate the current session.
- `GET /auth/me`: Get current authenticated user info.

### Sync
- `POST /sync/start`: Trigger a sync with Codeforces for the user.
- `GET /sync/status`: Check the status of an ongoing sync.

### Problems
- `GET /problems`: List problems (paginated, filterable).
- `GET /problems/{id}`: Get problem details.

### Queue
- `GET /queue`: Get current queue.
- `POST /queue/{problemId}`: Add problem to queue.
- `PUT /queue/{problemId}/status`: Update problem status in queue.

### Reviews
- `GET /reviews`: Get upcoming reviews.
- `POST /reviews/{problemId}/schedule`: Schedule a review.
