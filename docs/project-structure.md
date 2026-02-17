# Project Structure

## Root Layout

```
YASTM/
├── .cursor/
│   └── rules/              # Cursor AI context rules (.mdc files)
├── docs/                   # Technical documentation (Single Source of Truth)
│   ├── architecture.md
│   ├── database-schema.md
│   ├── api-endpoints.md
│   ├── entities.md
│   ├── authentication.md
│   ├── project-structure.md
│   └── conventions.md
├── src/
│   ├── domain/             # Core business logic (no external dependencies)
│   │   ├── entities/       # Entity interfaces
│   │   ├── enums/          # Priority enum
│   │   ├── repositories/   # Repository interface contracts
│   │   └── errors/         # AppError class
│   ├── application/        # Use cases and DTOs
│   │   ├── dtos/           # Data Transfer Objects (per entity)
│   │   ├── use-cases/      # Use case classes (per entity)
│   │   └── interfaces/     # IUseCase generic interface
│   ├── infrastructure/     # Framework and library implementations
│   │   ├── database/
│   │   │   ├── connection.ts    # Knex instance creation
│   │   │   ├── migrations/      # Knex migration files
│   │   │   └── seeds/           # Optional seed data
│   │   ├── repositories/  # Knex repository implementations
│   │   └── providers/     # BcryptHashProvider, JwtTokenProvider
│   ├── presentation/      # HTTP layer
│   │   ├── controllers/   # Express controllers
│   │   ├── middlewares/    # auth, errorHandler, validateRequest
│   │   ├── routes/        # Express route definitions
│   │   └── validators/    # Zod schemas
│   ├── shared/
│   │   ├── container.ts   # Composition root (manual DI wiring)
│   │   └── config/
│   │       └── env.ts     # Environment config validated with Zod
│   ├── app.ts             # Express app setup (middlewares, routes)
│   └── server.ts          # Entry point (starts listening)
├── tests/
│   ├── unit/              # Unit tests (use cases with mocked repos)
│   └── integration/       # Integration tests (API routes with supertest)
├── client/                 # React frontend (Vite + MUI)
│   ├── src/
│   │   ├── components/    # Reusable UI components (Layout, ProtectedRoute)
│   │   ├── hooks/         # React hooks (useAuth)
│   │   ├── pages/         # Page components (Dashboard, Tasks, Teams, etc.)
│   │   ├── services/      # API client (fetch wrapper)
│   │   ├── theme/         # MUI theme configuration
│   │   ├── types/         # TypeScript type definitions
│   │   ├── App.tsx        # Root component with routing
│   │   └── main.tsx       # Entry point (renders into DOM)
│   ├── index.html         # HTML shell
│   ├── vite.config.ts     # Vite config (dev proxy to API)
│   ├── tsconfig.json      # TypeScript config
│   └── package.json       # Client dependencies
├── .env.example           # Environment variable template
├── knexfile.ts            # Knex CLI configuration
├── tsconfig.json          # TypeScript configuration (API)
├── jest.config.ts         # Jest configuration
└── package.json           # API dependencies and scripts
```

## File Naming Conventions

| Type              | Pattern                        | Example                          |
|-------------------|--------------------------------|----------------------------------|
| Entity interface  | `{Entity}.ts`                  | `User.ts`, `Task.ts`            |
| Repository iface  | `I{Entity}Repository.ts`      | `IUserRepository.ts`            |
| Repository impl   | `Knex{Entity}Repository.ts`   | `KnexUserRepository.ts`         |
| Use case          | `{Action}{Entity}UseCase.ts`  | `CreateTaskUseCase.ts`          |
| Controller        | `{Entity}Controller.ts`       | `TaskController.ts`             |
| Route file        | `{entity}Routes.ts`           | `taskRoutes.ts`                 |
| Validator         | `{entity}Validators.ts`       | `taskValidators.ts`             |
| DTO               | `{Action}{Entity}DTO.ts`      | `CreateTaskDTO.ts`              |
| Migration         | `{timestamp}_{description}.ts`| `20260216120000_create_users.ts` |
| Test              | `{OriginalFile}.test.ts`      | `CreateTaskUseCase.test.ts`     |

## Module Organization

Each entity typically spans these files:

```
domain/entities/Task.ts               # Interface
domain/repositories/ITaskRepository.ts # Repository contract
application/dtos/task/CreateTaskDTO.ts # Input/output DTOs
application/use-cases/task/CreateTaskUseCase.ts  # Business logic
infrastructure/repositories/KnexTaskRepository.ts # DB implementation
presentation/validators/taskValidators.ts   # Zod schemas
presentation/controllers/TaskController.ts  # HTTP handler
presentation/routes/taskRoutes.ts           # Route definitions
```

## Key Files

| File                           | Purpose                                              |
|--------------------------------|------------------------------------------------------|
| `src/server.ts`                | Entry point — imports app, calls `app.listen()`      |
| `src/app.ts`                   | Creates Express app, mounts middlewares and routes    |
| `src/shared/container.ts`      | Composition root — instantiates all dependencies     |
| `src/shared/config/env.ts`     | Parses and validates env vars using Zod              |
| `knexfile.ts`                  | Knex CLI config (points to connection, migrations dir)|
| `client/src/App.tsx`           | React root — routing and auth provider               |
| `client/src/hooks/useAuth.tsx` | Auth context — login, register, logout, token mgmt   |
| `client/src/services/api.ts`   | API client — fetch wrapper with JWT auth headers     |
| `client/src/theme/theme.ts`    | MUI theme — palette, typography, component overrides |
| `client/vite.config.ts`        | Vite config — dev server proxy to Express API        |

## Scripts (package.json)

### API (root)

| Script             | Command                         | Description                    |
|--------------------|---------------------------------|--------------------------------|
| `dev`              | `nodemon src/server.ts`         | Start API dev server with reload |
| `build`            | `tsc`                           | Compile API TypeScript         |
| `start`            | `node dist/server.js`           | Start production API server    |
| `test`             | `jest`                          | Run all tests                  |
| `test:unit`        | `jest tests/unit`               | Run unit tests only            |
| `test:int`         | `jest tests/integration`        | Run integration tests only     |
| `migrate`          | `knex migrate:latest`           | Run pending migrations         |
| `migrate:rollback` | `knex migrate:rollback`         | Rollback last migration batch  |
| `seed`             | `knex seed:run`                 | Run seed files                 |
| `client:install`   | `cd client && npm install`      | Install client dependencies    |
| `client:dev`       | `cd client && npm run dev`      | Start client dev server        |
| `client:build`     | `cd client && npm run build`    | Build client for production    |
| `client:preview`   | `cd client && npm run preview`  | Preview production client build|

### Client (`client/package.json`)

| Script    | Command           | Description                          |
|-----------|-------------------|--------------------------------------|
| `dev`     | `vite`            | Start Vite dev server (port 5173)    |
| `build`   | `tsc -b && vite build` | Type-check and build for production |
| `preview` | `vite preview`    | Preview production build             |

