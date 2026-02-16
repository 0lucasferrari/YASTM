# Coding Conventions

## Language and Runtime

- **Language**: TypeScript (strict mode enabled)
- **Runtime**: Node.js
- **Target**: ES2020+

## Naming

| Element             | Convention      | Example                      |
|---------------------|-----------------|------------------------------|
| Files (general)     | camelCase       | `taskRoutes.ts`              |
| Files (entities)    | PascalCase      | `User.ts`                    |
| Files (interfaces)  | PascalCase, `I` prefix | `IUserRepository.ts`  |
| Files (use cases)   | PascalCase      | `CreateTaskUseCase.ts`       |
| Files (controllers) | PascalCase      | `TaskController.ts`          |
| Classes             | PascalCase      | `KnexUserRepository`         |
| Interfaces          | PascalCase, `I` prefix | `IUserRepository`     |
| Functions/methods   | camelCase       | `findById()`, `createTask()` |
| Variables           | camelCase       | `userId`, `taskList`         |
| Constants           | UPPER_SNAKE     | `JWT_SECRET`, `SALT_ROUNDS`  |
| Enums               | PascalCase      | `Priority`                   |
| Enum members        | UPPER_SNAKE     | `Priority.HIGH`              |
| DB tables           | snake_case, plural | `task_assignees`          |
| DB columns          | snake_case      | `created_at`, `parent_task_id` |

## TypeScript

- Enable `strict: true` in `tsconfig.json`.
- Prefer `interface` over `type` for object shapes.
- Use explicit return types on public methods.
- Use `readonly` where appropriate.
- Avoid `any` — use `unknown` with type guards instead.

## Architecture Rules

- **Domain layer** must not import from any other layer.
- **Application layer** imports only from Domain.
- **Infrastructure layer** imports only from Domain (implements interfaces).
- **Presentation layer** imports from Application and Infrastructure (via the composition root).
- No circular dependencies between layers.

## Error Handling

- All expected errors are thrown as `AppError` instances with an HTTP status code and message.
- Unexpected errors are caught by the global `errorHandler` middleware, which logs the error and returns a generic 500 response.
- Use cases throw `AppError`; controllers do not catch — they let errors propagate to the middleware.
- Never expose stack traces in production responses.

```typescript
// Example
throw new AppError('User not found', 404);
throw new AppError('Email already in use', 409);
```

## Validation

- All incoming request data is validated using **Zod** schemas in `presentation/validators/`.
- The `validateRequest` middleware parses `req.body`, `req.params`, and/or `req.query` against a Zod schema.
- On failure, it returns a `400` response with structured validation errors.
- Zod schemas are the source of truth for request shapes — DTOs are derived from or aligned with them.

## Repository Pattern

- Each entity has an interface in `src/domain/repositories/` (e.g. `IUserRepository`).
- Each interface defines methods like `findById`, `findAll`, `create`, `update`, `softDelete`.
- Implementations in `src/infrastructure/repositories/` use Knex.js.
- All repository queries must include `WHERE deleted_at IS NULL` unless explicitly querying deleted records.

## Soft Deletes

- Never use `DELETE` SQL statements.
- Soft-delete sets `deleted_at = now()` and `deleted_by = <authenticated user id>`.
- All "find" and "list" queries filter out soft-deleted records by default.

## API Response Format

All responses use a consistent envelope:

```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: { message: string, statusCode: number } }
```

- `201` for successful creation.
- `204` for successful deletion (no body).
- `200` for successful reads and updates.
- `400` for validation errors.
- `401` for unauthenticated requests.
- `403` for unauthorized actions.
- `404` for not found.
- `409` for conflicts (e.g. duplicate email).

## Testing

- **Unit tests**: Located in `tests/unit/`. Test use cases in isolation by mocking repositories and providers.
- **Integration tests**: Located in `tests/integration/`. Test API endpoints using `supertest` against the Express app.
- Test files are named `{OriginalFile}.test.ts`.
- Use `describe` / `it` blocks with descriptive names.
- Follow the Arrange-Act-Assert pattern.

## Git

- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.
- Keep commits atomic — one logical change per commit.

## Environment Variables

All environment variables are validated at startup using Zod in `src/shared/config/env.ts`. The app fails fast if required variables are missing.

Required variables (documented in `.env.example`):

```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/yastm
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
BCRYPT_SALT_ROUNDS=10
```

