# YASTM

**Yet Another Simple Task Manager** — A full-stack Task Manager application with a RESTful API backend and a React frontend.

## Tech Stack

### Backend (API)

- **Runtime:** Node.js + TypeScript (strict mode)
- **Framework:** Express 5
- **Database:** PostgreSQL or MySQL 8 via Knex.js (configurable)
- **Auth:** JWT + bcrypt
- **Validation:** Zod
- **Testing:** Jest + supertest

### Frontend (Client)

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 7
- **Design System:** [Material UI (MUI) 7](https://mui.com/material-ui/)
- **Charts:** MUI X Charts
- **Routing:** React Router 7
- **i18n:** react-i18next (Brazilian Portuguese)
- **Export:** jsPDF + jspdf-autotable (PDF), SheetJS (XLSX)

## Features

- **Task Management** — Create, edit, delete, and clone tasks with subtasks (unlimited nesting)
- **Status Workflow** — Define possible statuses per task and set the current status
- **Assignees & Labels** — Assign users and tag tasks with labels
- **Comments** — Add comments to any task
- **Activity Log** — Full audit trail of every change, with date range filtering and recursive subtask inclusion
- **Reports** — Per-task reports with status distribution charts, completion graphs, and exportable tables (PDF/XLSX)
- **Public Reports** — Shareable report links that don't require authentication
- **Internationalization** — UI fully translated to Brazilian Portuguese

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- **One of the following databases:**
  - [PostgreSQL](https://www.postgresql.org/) 14+ *(default)*
  - [MySQL](https://www.mysql.com/) 8+
- npm (ships with Node.js)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/0lucasferrari/YASTM.git
cd YASTM
```

### 2. Install dependencies

```bash
# Backend (API) dependencies
npm install

# Frontend (Client) dependencies
npm run client:install
```

> **Alternatively**, install the client directly:
> ```bash
> cd client && npm install && cd ..
> ```

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

**PostgreSQL** (default):

```env
NODE_ENV=development
PORT=3000
DB_CLIENT=pg
DATABASE_URL=postgresql://user:password@localhost:5432/yastm
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
BCRYPT_SALT_ROUNDS=10
```

**MySQL 8:**

```env
NODE_ENV=development
PORT=3000
DB_CLIENT=mysql2
DATABASE_URL=mysql://user:password@localhost:3306/yastm
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
BCRYPT_SALT_ROUNDS=10
```

| Variable             | Description                                       | Default     |
|----------------------|---------------------------------------------------|-------------|
| `NODE_ENV`           | Environment mode (`development` / `production`)   | —           |
| `PORT`               | Port for the API server                           | `3000`      |
| `DB_CLIENT`          | Database driver (`pg` or `mysql2`)                | `pg`        |
| `DATABASE_URL`       | Database connection string                        | —           |
| `JWT_SECRET`         | Secret key for signing JWT tokens                 | —           |
| `JWT_EXPIRES_IN`     | Token expiration (e.g. `24h`, `7d`)               | `24h`       |
| `BCRYPT_SALT_ROUNDS` | Number of bcrypt hashing rounds                   | `10`        |

### 4. Create the database

**PostgreSQL:**

```bash
createdb yastm
```

**MySQL:**

```sql
CREATE DATABASE yastm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Run migrations

```bash
npm run migrate
```

This creates all required tables: `users`, `teams`, `tasks`, `statuses`, `labels`, `comments`, join tables, and `task_activity_logs`.

### 6. Start the development servers

Open **two terminals**:

```bash
# Terminal 1 — API server (http://localhost:3000)
npm run dev
```

```bash
# Terminal 2 — Client dev server (http://localhost:5173)
npm run client:dev
```

Open **http://localhost:5173** in your browser. The Vite dev server automatically proxies all `/api` requests to the backend on port 3000.

### 7. Create your first account

1. Navigate to `http://localhost:5173`
2. Click **"Cadastrar"** (Register)
3. Fill in your name, email, and password
4. You'll be redirected to the dashboard after registration

## Available Scripts

### API (from project root)

| Script                     | Description                                |
|----------------------------|--------------------------------------------|
| `npm run dev`              | Start API dev server with auto-reload      |
| `npm run build`            | Compile TypeScript to `dist/`              |
| `npm start`                | Run compiled production server             |
| `npm test`                 | Run all tests                              |
| `npm run test:unit`        | Run unit tests only                        |
| `npm run test:integration` | Run integration tests only                 |
| `npm run lint`             | Lint source and test files                 |
| `npm run migrate`          | Run pending database migrations            |
| `npm run migrate:rollback` | Rollback last migration batch              |
| `npm run seed`             | Run database seed files                    |

### Client (convenience scripts from project root)

| Script                     | Description                                |
|----------------------------|--------------------------------------------|
| `npm run client:install`   | Install client dependencies                |
| `npm run client:dev`       | Start Vite dev server (port 5173)          |
| `npm run client:build`     | Build client for production                |
| `npm run client:preview`   | Preview production client build            |

### Client (from `client/` directory)

| Script             | Description                                      |
|--------------------|--------------------------------------------------|
| `npm run dev`      | Start Vite dev server                            |
| `npm run build`    | Type-check and build for production              |
| `npm run lint`     | Lint frontend source files                       |
| `npm run preview`  | Preview production build locally                 |

## API Overview

All endpoints (except auth and public reports) require a JWT token in the `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint             | Description         |
|--------|----------------------|---------------------|
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login`    | Login, returns JWT  |

### Resources (CRUD)

| Resource   | Base Path        | Operations                     |
|------------|------------------|--------------------------------|
| Users      | `/api/users`     | GET (list, by id), PUT, DELETE |
| Teams      | `/api/teams`     | POST, GET, PUT, DELETE         |
| Tasks      | `/api/tasks`     | POST, GET, PUT, DELETE         |
| Statuses   | `/api/statuses`  | POST, GET, PUT, DELETE         |
| Labels     | `/api/labels`    | POST, GET, PUT, DELETE         |
| Comments   | `/api/comments`  | GET, PUT, DELETE               |

### Task Relationships

| Method | Endpoint                              | Description             |
|--------|---------------------------------------|-------------------------|
| POST   | `/api/tasks/:id/assignees`            | Add assignee            |
| DELETE | `/api/tasks/:id/assignees/:userId`    | Remove assignee         |
| POST   | `/api/tasks/:id/statuses`             | Add possible status     |
| DELETE | `/api/tasks/:id/statuses/:statusId`   | Remove possible status  |
| PUT    | `/api/tasks/:id/current-status`       | Set current status      |
| POST   | `/api/tasks/:id/labels`               | Add label               |
| DELETE | `/api/tasks/:id/labels/:labelId`      | Remove label            |
| POST   | `/api/tasks/:id/comments`             | Add comment             |
| POST   | `/api/tasks/:id/clone`                | Clone task structure    |

### Activity Logs & Reports

| Method | Endpoint                              | Description                              |
|--------|---------------------------------------|------------------------------------------|
| GET    | `/api/tasks/:id/activity-logs`        | Get activity logs (paginated, filterable)|
| GET    | `/api/reports/tasks/:id`              | Public task report (no auth required)    |

> For full request/response details, see [`docs/api-endpoints.md`](docs/api-endpoints.md).

## Client Pages

| Page               | Route                            | Description                                                  |
|--------------------|----------------------------------|--------------------------------------------------------------|
| Login              | `/login`                         | Sign in with email and password                              |
| Register           | `/register`                      | Create a new account                                         |
| Dashboard          | `/`                              | Overview with quick-access cards                             |
| Tasks              | `/tasks`                         | List, create, and manage tasks                               |
| Task Detail        | *(modal)*                        | View/edit task, subtasks, comments, statuses, assignees      |
| Task Report        | *(modal)*                        | Charts and exportable table for a task and its subtasks      |
| Activity Log       | `/tasks/:taskId/activity-log`    | Paginated audit trail with date filtering and subtask toggle |
| Public Report      | `/reports/tasks/:taskId`         | Shareable read-only task report                              |
| Teams              | `/teams`                         | Manage teams                                                 |
| Users              | `/users`                         | View and manage users                                        |
| Statuses           | `/statuses`                      | Create and manage statuses                                   |
| Labels             | `/labels`                        | Create and manage labels                                     |

## Project Structure

```
src/                     # Express API (Clean Architecture)
  domain/                # Entities, enums, repository interfaces, errors
  application/           # Use cases, DTOs, IUseCase interface
  infrastructure/        # Knex repos, DB migrations, providers (bcrypt, JWT)
  presentation/          # Express routes, controllers, validators, middlewares
  shared/                # Composition root (DI), env config
  app.ts                 # Express app setup
  server.ts              # Entry point
client/                  # React frontend (Vite + MUI)
  src/
    components/          # Layout, ProtectedRoute, TaskDetailModal, TaskReportModal
    hooks/               # useAuth (JWT context)
    i18n/                # Internationalization (pt-BR)
    pages/               # All page components
    services/            # API client (fetch wrapper)
    theme/               # MUI theme configuration
    types/               # TypeScript type definitions
tests/
  unit/                  # Use case tests with mocked dependencies
  integration/           # API route tests with supertest
docs/                    # Technical documentation (Single Source of Truth)
```

> For the full directory layout and naming conventions, see [`docs/project-structure.md`](docs/project-structure.md).

## Documentation

All technical specifications live in the `docs/` folder:

- [`architecture.md`](docs/architecture.md) — Clean architecture layers and dependency rules
- [`database-schema.md`](docs/database-schema.md) — Table definitions, relationships, migration order
- [`api-endpoints.md`](docs/api-endpoints.md) — Every REST endpoint with request/response formats
- [`entities.md`](docs/entities.md) — Domain entities, attributes, and business rules
- [`authentication.md`](docs/authentication.md) — JWT flow, middleware, provider interfaces
- [`project-structure.md`](docs/project-structure.md) — Directory layout and file naming conventions
- [`conventions.md`](docs/conventions.md) — Coding standards, error handling, response format

## License

ISC
