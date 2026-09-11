# Architecture

## System Overview
Upsolve is built using a classic three-tier architecture:
1. **Frontend**: React Single Page Application served by Nginx.
2. **Backend**: Spring Boot Java 21 REST API.
3. **Database**: PostgreSQL relational database.

## Component Diagram
```mermaid
flowchart TD
    User([User Browser])
    CF([Codeforces API])
    
    subgraph Docker Compose
        Nginx[Nginx Web Server\n(Frontend)]
        API[Spring Boot REST API\n(Backend)]
        DB[(PostgreSQL)]
    end
    
    User <-->|HTTP/HTTPS| Nginx
    Nginx <-->|Proxy API requests| API
    API <-->|Read/Write| DB
    API <-->|Sync Submissions| CF
```

## Data Flow: Import & Sync
1. The user requests a sync via the UI.
2. The backend enqueues a background job to fetch data.
3. Spring Boot calls the Codeforces API respecting a rate limit of 1 request per 2.5 seconds.
4. The system updates the local database with missing submissions and problem definitions.
5. The frontend polls or listens for completion to refresh the view.

## Screenshots
*(Add screenshots of the application here)*
