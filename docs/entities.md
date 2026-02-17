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
| predicted_finish_date | Date \| null | Expected completion date (nullable)     |

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

## TaskActivityLog

An immutable audit log entry recording a change made to a task. Does **not** include the common audit fields — log entries are never updated or deleted.

| Field      | Type              | Description                                      |
|------------|-------------------|--------------------------------------------------|
| id         | string (UUID)     | Unique identifier                                |
| task_id    | string (UUID)     | The task that was changed                        |
| user_id    | string (UUID)     | The user who performed the change                |
| action     | TaskAction        | Type of change (see TaskAction enum below)       |
| field      | string \| null    | Which field changed (for TASK_UPDATED actions)   |
| old_value  | string \| null    | Previous value (serialized as text)              |
| new_value  | string \| null    | New value (serialized as text)                   |
| created_at | Date              | When the change occurred                         |

**Business Rules:**
- Log entries are immutable — they are never updated or soft-deleted.
- One log entry per changed field on update operations.
- For non-update actions (ASSIGNEE_ADDED, LABEL_REMOVED, etc.), `old_value` / `new_value` carry the relevant entity ID.

## TaskAction Enum

Defined in `src/domain/enums/TaskAction.ts`:

```typescript
enum TaskAction {
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_DELETED = 'TASK_DELETED',
  ASSIGNEE_ADDED = 'ASSIGNEE_ADDED',
  ASSIGNEE_REMOVED = 'ASSIGNEE_REMOVED',
  STATUS_ADDED = 'STATUS_ADDED',
  STATUS_REMOVED = 'STATUS_REMOVED',
  CURRENT_STATUS_CHANGED = 'CURRENT_STATUS_CHANGED',
  LABEL_ADDED = 'LABEL_ADDED',
  LABEL_REMOVED = 'LABEL_REMOVED',
  TASK_CLONED = 'TASK_CLONED',
  COMMENT_ADDED = 'COMMENT_ADDED',
}
```

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

