# Domain Entities

All entities are defined as TypeScript interfaces in `src/domain/entities/`. They represent the core business objects of the system.

## Common Audit Fields

Every entity includes the following audit fields:

| Field       | Type              | Description                                    |
|-------------|-------------------|------------------------------------------------|
| id          | string (UUID)     | Unique identifier                              |
| created_at  | Date              | Timestamp of creation                          |
| created_by  | string (UUID) \| null | ID of the user who created the record      |
| updated_at  | Date              | Timestamp of last update                       |
| updated_by  | string (UUID) \| null | ID of the user who last updated the record |
| deleted_at  | Date \| null      | Timestamp of soft deletion (null = active)     |
| deleted_by  | string (UUID) \| null | ID of the user who deleted the record      |

## User

Represents a person who can authenticate and interact with the system.

| Field    | Type              | Description                      |
|----------|-------------------|----------------------------------|
| name     | string            | Full name of the user            |
| email    | string            | Unique email address             |
| password | string            | Bcrypt-hashed password           |
| team_id  | string (UUID) \| null | Reference to the user's team |

**Business Rules:**
- Email must be unique across all non-deleted users.
- Password is never returned in API responses.
- A user can belong to zero or one team.

## Team

Represents a group of users.

| Field | Type   | Description       |
|-------|--------|-------------------|
| name  | string | Name of the team  |

**Business Rules:**
- Team name should be non-empty.
- Deleting a team does not delete its members — their `team_id` becomes stale (application should handle nullification).

## Task

The central entity. Represents a unit of work.

| Field             | Type              | Description                             |
|-------------------|-------------------|-----------------------------------------|
| title             | string            | Short title of the task                 |
| description       | string \| null    | Detailed description                    |
| parent_task_id    | string (UUID) \| null | Reference to parent task (subtask support) |
| assignor_id       | string (UUID)     | The user who created/assigned the task  |
| current_status_id | string (UUID) \| null | The task's current status            |
| priority          | Priority \| null  | Task priority level                     |

**Relationships:**
- **Assignor**: One user (required). The person who created the task.
- **Assignees**: Many users (via `task_assignees` junction). People assigned to work on the task.
- **Statuses**: Many statuses (via `task_statuses` junction). The set of possible statuses for this task.
- **CurrentStatus**: One status (nullable). Must be one of the task's possible statuses.
- **Labels**: Many labels (via `task_labels` junction).
- **Comments**: Many comments.
- **ParentTask**: One task (nullable). Enables subtask hierarchies.

**Business Rules:**
- `current_status_id`, if set, must reference a status that exists in the task's `task_statuses` set.
- `assignor_id` is required and immutable after creation.
- A task may have zero or more assignees.

## Status

Represents a possible state a task can be in (e.g. "To Do", "In Progress", "Done").

| Field       | Type           | Description                  |
|-------------|----------------|------------------------------|
| title       | string         | Name of the status           |
| description | string \| null | Optional description         |

**Relationships:**
- A status can belong to many tasks (via `task_statuses` junction).

**Business Rules:**
- Status title should be non-empty.
- Deleting a status that is a task's `current_status_id` should be prevented or handled gracefully.

## Label

A tag that can be applied to tasks for categorization.

| Field       | Type           | Description                  |
|-------------|----------------|------------------------------|
| title       | string         | Name of the label            |
| description | string \| null | Optional description         |

**Relationships:**
- A label can be present in many tasks (via `task_labels` junction).

**Business Rules:**
- Label title should be non-empty.

## Comment

A text note attached to a task by a user.

| Field      | Type          | Description                        |
|------------|---------------|------------------------------------|
| task_id    | string (UUID) | The task this comment belongs to   |
| creator_id | string (UUID) | The user who wrote the comment     |
| content    | string        | The comment text                   |

**Business Rules:**
- Content must be non-empty.
- A comment belongs to exactly one task and one creator.
- Only the comment creator (or an admin, if roles are added later) can edit/delete a comment.

## Priority Enum

Defined in `src/domain/enums/Priority.ts`:

```typescript
enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}
```

