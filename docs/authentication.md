# Authentication

YASTM uses **JSON Web Tokens (JWT)** for stateless authentication.

## Flow

```
1. User registers   →  POST /api/auth/register  →  User created (password hashed with bcrypt)
2. User logs in     →  POST /api/auth/login      →  Credentials verified, JWT returned
3. Subsequent calls →  Authorization: Bearer <token>  →  Middleware verifies token
```

## Token Structure

The JWT payload contains:

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "iat": 1700000000,
  "exp": 1700086400
}
```

- `sub`: The user's UUID (used to identify the authenticated user).
- `email`: User's email address.
- `iat`: Issued-at timestamp.
- `exp`: Expiration timestamp.

## Token Configuration

| Setting        | Value         | Env Variable     |
|----------------|---------------|------------------|
| Algorithm      | HS256         | —                |
| Secret         | (env config)  | `JWT_SECRET`     |
| Expiration     | 24 hours      | `JWT_EXPIRES_IN` |

## Password Hashing

- Library: `bcrypt`
- Salt rounds: 10 (configurable via `BCRYPT_SALT_ROUNDS` env variable)
- Passwords are hashed before being stored and are **never** returned in any API response.

## Auth Middleware (`authMiddleware`)

Located at `src/presentation/middlewares/authMiddleware.ts`.

**Behavior:**
1. Extract the `Authorization` header from the request.
2. Verify it starts with `Bearer `.
3. Extract the token string.
4. Verify the token using `JwtTokenProvider.verify(token)`.
5. If valid, attach the decoded payload to `req.user` (containing `sub` and `email`).
6. If invalid or missing, respond with `401 Unauthorized`.

**TypeScript augmentation:**

The Express `Request` type is augmented to include:

```typescript
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      email: string;
    };
  }
}
```

## Providers

### BcryptHashProvider (`src/infrastructure/providers/BcryptHashProvider.ts`)

Implements a `IHashProvider` interface:

```typescript
interface IHashProvider {
  hash(plainText: string): Promise<string>;
  compare(plainText: string, hashed: string): Promise<boolean>;
}
```

### JwtTokenProvider (`src/infrastructure/providers/JwtTokenProvider.ts`)

Implements a `ITokenProvider` interface:

```typescript
interface ITokenProvider {
  generate(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}
```

## Protected Routes

All routes except the following require authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`

The `authMiddleware` is applied globally and these routes are explicitly excluded (or the middleware is not applied to the auth router).

## Audit Trail

When a request passes through `authMiddleware`, the authenticated user's ID (`req.user.id`) is used to populate:

- `created_by` — on resource creation
- `updated_by` — on resource update
- `deleted_by` — on resource soft-deletion

