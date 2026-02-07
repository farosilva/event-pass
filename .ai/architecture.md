# Architecture & Decisions

## 1. Architectural Pattern
- **Style**: Modular Monolith in 3 Layers (Controller, Service, Repository).
- **Justification**: Reduces complexity for the initial phase while maintaining separation of concerns.

## 2. Infrastructure (Full Docker)
- **Requirement**: The entire stack must run via `docker-compose up`.
- **Services**:
  - `frontend` (Vite)
  - `backend` (Node/Express)
  - `postgres` (Database)
- **Persistence**: PostgreSQL data must be persisted via Docker Volumes.

## 3. Database
- **Engine**: PostgreSQL.
- **ORM**: Prisma.

## 4. Authentication
- **Mechanism**: Stateless JWT (JSON Web Tokens).
- **Flow**: Login -> Token -> Headers (Authorization: Bearer).

## 5. Concurrency & Data Integrity
- **Critical Path**: Event Booking / Ticket Issuance.
- **Mechanism**: **Database Transactions** (Prisma Interactive Transactions).
- **Rule**: Checking availability and decrementing the seat count must happen within the SAME transaction to prevent overbooking.

## 6. Architectural Decision Records (ADR)

### ADR-001: Monolithic Structure
- **Decision**: The project will NOT be implemented as Microservices.
- **Context**: Low initial scale, small team (agents), reduced operational complexity.
- **Consequence**: Tighter coupling but faster development and simpler deployment.

### ADR-002: Validation Logic
- **Decision**: QR Code JWT Signature Validation occurs on the Backend.
- **Context**: Preventing client-side spoofing of valid tickets.
- **Consequence**: Backend must share/know the signing secret used to generate the QR content.
