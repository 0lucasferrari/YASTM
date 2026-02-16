# YASTM

**Yet Another Simple Task Manager** — A RESTful Task Manager API built with Node.js, TypeScript, Express, and PostgreSQL.

## Tech Stack

- **Runtime:** Node.js + TypeScript (strict mode)
- **Framework:** Express 5
- **Database:** PostgreSQL via Knex.js
- **Auth:** JWT + bcrypt
- **Validation:** Zod
- **Testing:** Jest + supertest

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) 14+
- npm or yarn

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/0lucasferrari/YASTM.git
cd YASTM
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/yastm
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
BCRYPT_SALT_ROUNDS=10
```

### 4. Create the database

```bash
createdb yastm
```

### 5. Run migrations

```bash
npm run migrate
```

### 6. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

## Available Scripts

| Script                | Description                          |
|-----------------------|--------------------------------------|
| `npm run dev`         | Start dev server with auto-reload    |
| `npm run build`       | Compile TypeScript to `dist/`        |
| `npm start`           | Run compiled production server       |
| `npm test`            | Run all tests                        |
| `npm run test:unit`   | Run unit tests only                  |
| `npm run test:integration` | Run integration tests only      |
| `npm run lint`        | Lint source and test files           |
| `npm run migrate`     | Run pending database migrations      |
| `npm run migrate:rollback` | Rollback last migration batch   |
| `npm run seed`        | Run database seed files              |

## API Overview

All endpoints (except auth) require a JWT token in the `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint             | Description         |
|--------|----------------------|---------------------|
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login`    | Login, returns JWT  |

### Resources (CRUD)

| Resource   | Base Path        | Operations                  |
|------------|------------------|-----------------------------|
| Users      | `/api/users`     | GET (list, by id), PUT, DELETE |
| Teams      | `/api/teams`     | POST, GET, PUT, DELETE      |
| Tasks      | `/api/tasks`     | POST, GET, PUT, DELETE      |
| Statuses   | `/api/statuses`  | POST, GET, PUT, DELETE      |
| Labels     | `/api/labels`    | POST, GET, PUT, DELETE      |
| Comments   | `/api/comments`  | GET, PUT, DELETE            |

### Task Relationships

| Method | Endpoint                              | Description             |
|--------|---------------------------------------|-------------------------|
| POST   | `/api/tasks/:id/assignees`            | Add assignee            |
| DELETE | `/api/tasks/:id/assignees/:userId`    | Remove assignee         |
| POST   | `/api/tasks/:id/statuses`             | Add possible status     |
| PUT    | `/api/tasks/:id/current-status`       | Set current status      |
| POST   | `/api/tasks/:id/labels`               | Add label               |
| DELETE | `/api/tasks/:id/labels/:labelId`      | Remove label            |
| POST   | `/api/tasks/:id/comments`             | Add comment             |

> For full request/response details, see [`docs/api-endpoints.md`](docs/api-endpoints.md).

## Project Structure

```
src/
  domain/          # Entities, enums, repository interfaces, errors
  application/     # Use cases, DTOs, IUseCase interface
  infrastructure/  # Knex repos, DB migrations, providers (bcrypt, JWT)
  presentation/    # Express routes, controllers, validators, middlewares
  shared/          # Composition root (DI), env config
  app.ts           # Express app setup
  server.ts        # Entry point
tests/
  unit/            # Use case tests with mocked dependencies
  integration/     # API route tests with supertest
docs/              # Technical documentation (Single Source of Truth)
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
