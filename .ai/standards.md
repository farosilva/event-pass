# Coding Standards & Style Guide

## 1. Language & Typing
- **Language**: TypeScript 5+
- **Strict Mode**: `strict: true` must be enabled in `tsconfig.json` for both Frontend and Backend.
- **Prohibited**: The use of `any` is strictly prohibited. Use `unknown` or specific types.

## 2. Project Structure (Monorepo)
The root directory must remain clean.
```
/
├── frontend/         # React Application
├── backend/          # Node.js Application
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 3. Configuration & Environment
- **.env.example**: Mandatory in both `frontend/` and `backend/`. Must contain keys but NO secrets.
- **Ports**:
  - Frontend: `3000`
  - Backend API: `3001`
  - PostgreSQL: `5432`

## 4. Backend (Node.js/Express)
- **Async/Await**: Mandatory. Promise chaining (`.then()`) is prohibited.
- **Architecture Layers**:
  1. `Controllers`: Handle HTTP requests, validate input, call services.
  2. `Services`: Business logic.
  3. `Repositories/Prisma`: Database access.
- **Validation**:
  - **Zod** is mandatory for all input validation (Controllers and DTOs).
- **Error Handling**: 
  - Centralized Middleware is mandatory.
  - No `console.log` in production code; use a logger.

## 5. Frontend (React)
- **Components**: Functional Components with Hooks only.
- **Props**: Explicit typing is required via `interface Props { ... }`.
  - `React.FC` is optional but explicit props interfaces are not.
- **Styling**: 
  - **Tailwind CSS** utility classes ONLY.
  - No CSS Modules, no Styled Components, no direct CSS files (except for Tailwind setup).
- **State Management**:
  - Context API for global state.
  - Context API for global state.
  - No Redux.
- **Language**:
  - All user-facing text (UI, Toasts, Errors, Logs displayed to user) must be in **Portuguese (Brazil)**.
  - Variable names, comments, and internal code logic must remain in **English**.

## 6. Git & Commits
- **Pattern**: Conventional Commits.
  - `feat: add login endpoint`
  - `fix: validation on user registry`
  - `chore: update dependencies`
  - `docs: update readme`
