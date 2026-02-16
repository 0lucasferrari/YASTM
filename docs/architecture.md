# Architecture

YASTM follows **Clean Architecture** with four layers. Dependencies always point inward — outer layers depend on inner layers, never the reverse.

## Layer Diagram

```
┌─────────────────────────────────────────────┐
│              Presentation                   │
│   Routes / Controllers / Middlewares / Zod  │
├─────────────────────────────────────────────┤
│              Application                    │
│         Use Cases / DTOs                    │
├─────────────────────────────────────────────┤
│              Domain (core)                  │
│  Entities / Repo Interfaces / Enums / Errors│
├─────────────────────────────────────────────┤
│              Infrastructure                 │
│  Knex Repos / DB Migrations / Providers     │
└─────────────────────────────────────────────┘
```

## Layer Responsibilities

### Domain (`src/domain/`)

The innermost layer. Contains business entities, enums, repository interfaces (abstractions), and domain errors. This layer has **zero dependencies** on any framework, library, or outer layer.

- **Entities**: TypeScript interfaces defining the shape of each business object (User, Task, Team, Status, Label, Comment).
- **Enums**: `Priority` enum (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **Repository Interfaces**: Abstract contracts (e.g. `IUserRepository`) that define data access methods without specifying implementation details.
- **Errors**: `AppError` class used across the application for consistent error handling.

### Application (`src/application/`)

Contains use case classes that orchestrate business logic. Each use case receives repository interfaces (injected via constructor) and DTOs for input/output.

- **Use Cases**: One class per operation (e.g. `CreateTaskUseCase`, `AuthenticateUserUseCase`). Each implements a generic `IUseCase<TInput, TOutput>` interface.
- **DTOs**: Data Transfer Objects for request and response payloads. Decouples the API shape from domain entities.
- **Interfaces**: The generic `IUseCase` interface.

### Infrastructure (`src/infrastructure/`)

Implements domain abstractions using concrete technologies.

- **Repositories**: Knex.js implementations of repository interfaces (e.g. `KnexUserRepository` implements `IUserRepository`).
- **Database**: Knex connection setup, migrations, and seeds.
- **Providers**: `BcryptHashProvider` for password hashing, `JwtTokenProvider` for JWT generation/verification.

### Presentation (`src/presentation/`)

Handles HTTP concerns. Translates HTTP requests into use case calls and use case results into HTTP responses.

- **Routes**: Express route definitions that map HTTP verbs/paths to controller methods.
- **Controllers**: Thin classes that extract validated data from the request, call a use case, and return the response.
- **Middlewares**: `authMiddleware` (JWT verification), `validateRequest` (Zod schema parsing), `errorHandler` (global error catcher).
- **Validators**: Zod schemas for request body, params, and query validation.

## Dependency Rules

| Layer          | Can Import From              | Cannot Import From          |
|----------------|------------------------------|-----------------------------|
| Domain         | Nothing (self-contained)     | Application, Infrastructure, Presentation |
| Application    | Domain                       | Infrastructure, Presentation |
| Infrastructure | Domain                       | Application, Presentation   |
| Presentation   | Application, Infrastructure  | Domain (only indirectly via DTOs) |

> Infrastructure depends on Domain (to implement interfaces), but Domain never depends on Infrastructure. This is the **Dependency Inversion Principle** in action.

## SOLID Mapping

| Principle | How It's Applied |
|-----------|-----------------|
| **S** - Single Responsibility | Each use case class has one job. Controllers only translate HTTP. Repositories only handle data access. |
| **O** - Open/Closed | New features are added by creating new use cases, not modifying existing ones. |
| **L** - Liskov Substitution | Any repository implementation can be swapped (e.g. Knex for an in-memory mock) without changing use cases. |
| **I** - Interface Segregation | Repository interfaces are per-entity, not a single god interface. |
| **D** - Dependency Inversion | Use cases depend on repository interfaces (domain layer), not concrete Knex implementations. |

## Composition Root

Wiring happens in `src/shared/container.ts`. This is the only place where concrete implementations are instantiated and injected into use cases. No DI framework is used — just manual constructor injection (KISS/YAGNI).

## Other Principles

- **YAGNI**: No feature is built until needed. No unnecessary abstractions.
- **KISS**: Prefer simple, readable code over clever patterns.
- **DRY**: Shared logic lives in base classes or utility functions, never copy-pasted.

