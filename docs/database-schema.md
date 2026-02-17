# Database Schema

YASTM supports **PostgreSQL** and **MySQL 8** via **Knex.js** as the query builder. The database driver is selected through the `DB_CLIENT` environment variable (`pg` or `mysql2`). All schema changes are managed through Knex migrations that are dialect-aware.

## General Conventions

- All primary keys are **UUIDs** (generated application-side using the `uuid` package).
- All entity tables include **audit columns**: `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`.
- **Soft deletes**: Records are never physically removed. Instead, `deleted_at` is set to the current timestamp and `deleted_by` to the user who performed the deletion. All repository queries must filter `WHERE deleted_at IS NULL` by default.
- Timestamps use `timestamp with time zone` (`timestamptz` on PostgreSQL, `timestamp` on MySQL).
- Foreign keys referencing users (audit columns) do not have cascade deletes — they preserve the audit trail.

## ER Diagram

```
users ||--o| teams           : "belongs to (team_id)"
tasks }o--|| users           : "assignor (assignor_id)"
task_assignees }o--|| users  : "assignee (user_id)"
task_assignees }o--|| tasks  : "task (task_id)"
task_statuses }o--|| tasks   : "task (task_id)"
task_statuses }o--|| statuses: "status (status_id)"
tasks ||--o| statuses        : "currentStatus (current_status_id)"
tasks ||--o| tasks           : "parentTask (parent_task_id)"
task_labels }o--|| tasks     : "task (task_id)"
task_labels }o--|| labels    : "label (label_id)"
comments }o--|| tasks        : "task (task_id)"
comments }o--|| users        : "creator (creator_id)"
```

## Priority Enum

**PostgreSQL:** A custom enum type named `task_priority`:

```sql
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
```

**MySQL 8:** Uses an inline `ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')` column definition on the `tasks` table. No separate type is needed.

## Table Definitions

### teams

| Column      | Type         | Constraints                |
|-------------|--------------|----------------------------|
| id          | uuid         | PK, NOT NULL               |
| name        | varchar(255) | NOT NULL                   |
| created_at  | timestamptz  | NOT NULL, DEFAULT now()    |
| created_by  | uuid         | FK → users(id), nullable (first user bootstraps) |
| updated_at  | timestamptz  | NOT NULL, DEFAULT now()    |
| updated_by  | uuid         | FK → users(id), nullable   |
| deleted_at  | timestamptz  | nullable                   |
| deleted_by  | uuid         | FK → users(id), nullable   |

### users

| Column      | Type         | Constraints                |
|-------------|--------------|----------------------------|
| id          | uuid         | PK, NOT NULL               |
| name        | varchar(255) | NOT NULL                   |
| email       | varchar(255) | NOT NULL, UNIQUE           |
| password    | varchar(255) | NOT NULL (bcrypt hash)      |
| team_id     | uuid         | FK → teams(id), nullable   |
| created_at  | timestamptz  | NOT NULL, DEFAULT now()    |
| created_by  | uuid         | FK → users(id), nullable   |
| updated_at  | timestamptz  | NOT NULL, DEFAULT now()    |
| updated_by  | uuid         | FK → users(id), nullable   |
| deleted_at  | timestamptz  | nullable                   |
| deleted_by  | uuid         | FK → users(id), nullable   |

### statuses

| Column      | Type         | Constraints                |
|-------------|--------------|----------------------------|
| id          | uuid         | PK, NOT NULL               |
| title       | varchar(255) | NOT NULL                   |
| description | text         | nullable                   |
| created_at  | timestamptz  | NOT NULL, DEFAULT now()    |
| created_by  | uuid         | FK → users(id), nullable   |
| updated_at  | timestamptz  | NOT NULL, DEFAULT now()    |
| updated_by  | uuid         | FK → users(id), nullable   |
| deleted_at  | timestamptz  | nullable                   |
| deleted_by  | uuid         | FK → users(id), nullable   |

### labels

| Column      | Type         | Constraints                |
|-------------|--------------|----------------------------|
| id          | uuid         | PK, NOT NULL               |
| title       | varchar(255) | NOT NULL                   |
| description | text         | nullable                   |
| created_at  | timestamptz  | NOT NULL, DEFAULT now()    |
| created_by  | uuid         | FK → users(id), nullable   |
| updated_at  | timestamptz  | NOT NULL, DEFAULT now()    |
| updated_by  | uuid         | FK → users(id), nullable   |
| deleted_at  | timestamptz  | nullable                   |
| deleted_by  | uuid         | FK → users(id), nullable   |

### tasks

| Column            | Type           | Constraints                |
|-------------------|----------------|----------------------------|
| id                | uuid           | PK, NOT NULL               |
| title             | varchar(255)   | NOT NULL                   |
| description       | text           | nullable                   |
| parent_task_id    | uuid           | FK → tasks(id), nullable   |
| assignor_id       | uuid           | FK → users(id), NOT NULL   |
| current_status_id | uuid           | FK → statuses(id), nullable|
| priority          | task_priority  | nullable                   |
| predicted_finish_date | timestamptz | nullable                  |
| created_at        | timestamptz    | NOT NULL, DEFAULT now()    |
| created_by        | uuid           | FK → users(id), nullable   |
| updated_at        | timestamptz    | NOT NULL, DEFAULT now()    |
| updated_by        | uuid           | FK → users(id), nullable   |
| deleted_at        | timestamptz    | nullable                   |
| deleted_by        | uuid           | FK → users(id), nullable   |

### comments

| Column      | Type         | Constraints                |
|-------------|--------------|----------------------------|
| id          | uuid         | PK, NOT NULL               |
| task_id     | uuid         | FK → tasks(id), NOT NULL   |
| creator_id  | uuid         | FK → users(id), NOT NULL   |
| content     | text         | NOT NULL                   |
| created_at  | timestamptz  | NOT NULL, DEFAULT now()    |
| created_by  | uuid         | FK → users(id), nullable   |
| updated_at  | timestamptz  | NOT NULL, DEFAULT now()    |
| updated_by  | uuid         | FK → users(id), nullable   |
| deleted_at  | timestamptz  | nullable                   |
| deleted_by  | uuid         | FK → users(id), nullable   |

### task_assignees (junction)

| Column  | Type | Constraints                          |
|---------|------|--------------------------------------|
| task_id | uuid | FK → tasks(id), NOT NULL, PK (composite) |
| user_id | uuid | FK → users(id), NOT NULL, PK (composite) |

### task_statuses (junction)

| Column    | Type | Constraints                            |
|-----------|------|----------------------------------------|
| task_id   | uuid | FK → tasks(id), NOT NULL, PK (composite)   |
| status_id | uuid | FK → statuses(id), NOT NULL, PK (composite)|

### task_labels (junction)

| Column   | Type | Constraints                           |
|----------|------|---------------------------------------|
| task_id  | uuid | FK → tasks(id), NOT NULL, PK (composite)  |
| label_id | uuid | FK → labels(id), NOT NULL, PK (composite) |

### task_activity_logs

Immutable audit log capturing every change made to a task. No soft-delete or update columns.

| Column     | Type         | Constraints                    |
|------------|--------------|--------------------------------|
| id         | uuid         | PK, NOT NULL                   |
| task_id    | uuid         | FK → tasks(id), NOT NULL       |
| user_id    | uuid         | FK → users(id), NOT NULL       |
| action     | varchar(50)  | NOT NULL                       |
| field      | varchar(100) | nullable                       |
| old_value  | text         | nullable                       |
| new_value  | text         | nullable                       |
| created_at | timestamptz  | NOT NULL, DEFAULT now()        |

## Indexes

- `users.email` — unique index (enforced by UNIQUE constraint).
- `tasks.assignor_id` — index for looking up tasks by assignor.
- `tasks.parent_task_id` — index for looking up subtasks.
- `tasks.current_status_id` — index for filtering by current status.
- `comments.task_id` — index for looking up comments by task.
- `comments.creator_id` — index for looking up comments by creator.
- All junction table composite PKs automatically create indexes.
- `task_activity_logs(task_id, created_at DESC)` — composite index for paginated log queries.

## Migration Order

Migrations must be created in this order to respect foreign key dependencies:

1. Create `task_priority` enum type
2. Create `teams` table
3. Create `users` table (references `teams`)
4. Create `statuses` table (references `users` for audit)
5. Create `labels` table (references `users` for audit)
6. Create `tasks` table (references `users`, `statuses`, self-referencing)
7. Create `comments` table (references `tasks`, `users`)
8. Create `task_assignees` junction table
9. Create `task_statuses` junction table
10. Create `task_labels` junction table
11. Create `task_activity_logs` table (references `tasks`, `users`)

