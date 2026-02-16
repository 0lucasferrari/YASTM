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
├── .env.example           # Environment variable template
├── knexfile.ts            # Knex CLI configuration
├── tsconfig.json          # TypeScript configuration
├── jest.config.ts         # Jest configuration
└── package.json           # Dependencies and scripts
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

| File                        | Purpose                                              |
|-----------------------------|------------------------------------------------------|
| `src/server.ts`             | Entry point — imports app, calls `app.listen()`      |
| `src/app.ts`                | Creates Express app, mounts middlewares and routes    |
| `src/shared/container.ts`   | Composition root — instantiates all dependencies     |
| `src/shared/config/env.ts`  | Parses and validates env vars using Zod              |
| `knexfile.ts`               | Knex CLI config (points to connection, migrations dir)|

## Scripts (package.json)

| Script          | Command                         | Description                    |
|-----------------|---------------------------------|--------------------------------|
| `dev`           | `nodemon src/server.ts`         | Start dev server with reload   |
| `build`         | `tsc`                           | Compile TypeScript             |
| `start`         | `node dist/server.js`           | Start production server        |
| `test`          | `jest`                          | Run all tests                  |
| `test:unit`     | `jest tests/unit`               | Run unit tests only            |
| `test:int`      | `jest tests/integration`        | Run integration tests only     |
| `migrate`       | `knex migrate:latest`           | Run pending migrations         |
| `migrate:rollback` | `knex migrate:rollback`      | Rollback last migration batch  |
| `seed`          | `knex seed:run`                 | Run seed files                 |

