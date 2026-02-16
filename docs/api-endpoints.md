# API Endpoints

Base path: `/api`

All endpoints (except auth) require a valid JWT in the `Authorization: Bearer <token>` header.

All responses follow a consistent envelope:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "statusCode": 400
  }
}
```

---

## Authentication

### POST /api/auth/register

Register a new user. No authentication required.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2026-01-01T00:00:00.000Z"
  }
}
```

**Errors:** 409 (email already exists), 400 (validation failure)

### POST /api/auth/login

Authenticate and receive a JWT. No authentication required.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Errors:** 401 (invalid credentials), 400 (validation failure)

---

## Users

### GET /api/users

List all active (non-deleted) users.

**Query Params:** none (pagination can be added later)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "team_id": "uuid | null",
      "created_at": "..."
    }
  ]
}
```

### GET /api/users/:id

Get a single user by ID.

**Response (200):** Single user object.

**Errors:** 404 (not found)

### PUT /api/users/:id

Update a user's profile.

**Request Body (partial):**
```json
{
  "name": "Jane Doe",
  "team_id": "uuid | null"
}
```

**Response (200):** Updated user object.

**Errors:** 404, 400

### DELETE /api/users/:id

Soft-delete a user.

**Response (204):** No content.

**Errors:** 404

---

## Teams

### POST /api/teams

Create a new team.

**Request Body:**
```json
{
  "name": "Backend Team"
}
```

**Response (201):** Created team object.

### GET /api/teams

List all active teams.

**Response (200):** Array of team objects.

### GET /api/teams/:id

Get a single team by ID.

**Response (200):** Single team object.

**Errors:** 404

### PUT /api/teams/:id

Update a team.

**Request Body:**
```json
{
  "name": "Updated Team Name"
}
```

**Response (200):** Updated team object.

**Errors:** 404, 400

### DELETE /api/teams/:id

Soft-delete a team.

**Response (204):** No content.

**Errors:** 404

---

## Tasks

### POST /api/tasks

Create a new task. The authenticated user is automatically set as the assignor.

**Request Body:**
```json
{
  "title": "Implement login page",
  "description": "Build the login form with validation",
  "parent_task_id": "uuid | null",
  "priority": "HIGH | null"
}
```

**Response (201):** Created task object.

### GET /api/tasks

List all active tasks.

**Response (200):** Array of task objects (with nested current_status, assignees, labels).

### GET /api/tasks/:id

Get a single task with all relationships (assignees, statuses, labels, comments).

**Response (200):** Full task object.

**Errors:** 404

### PUT /api/tasks/:id

Update task fields.

**Request Body (partial):**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "CRITICAL"
}
```

**Response (200):** Updated task object.

**Errors:** 404, 400

### DELETE /api/tasks/:id

Soft-delete a task.

**Response (204):** No content.

**Errors:** 404

### POST /api/tasks/:id/assignees

Add an assignee to the task.

**Request Body:**
```json
{
  "user_id": "uuid"
}
```

**Response (201):** Updated assignees list.

**Errors:** 404 (task or user not found), 409 (already assigned)

### DELETE /api/tasks/:id/assignees/:userId

Remove an assignee from the task.

**Response (204):** No content.

**Errors:** 404

### POST /api/tasks/:id/statuses

Add a possible status to the task.

**Request Body:**
```json
{
  "status_id": "uuid"
}
```

**Response (201):** Updated statuses list.

**Errors:** 404, 409 (already added)

### PUT /api/tasks/:id/current-status

Set the current status of a task. The status must be in the task's possible statuses.

**Request Body:**
```json
{
  "status_id": "uuid"
}
```

**Response (200):** Updated task object.

**Errors:** 404, 400 (status not in task's possible statuses)

### POST /api/tasks/:id/labels

Add a label to the task.

**Request Body:**
```json
{
  "label_id": "uuid"
}
```

**Response (201):** Updated labels list.

**Errors:** 404, 409

### DELETE /api/tasks/:id/labels/:labelId

Remove a label from the task.

**Response (204):** No content.

**Errors:** 404

### POST /api/tasks/:id/comments

Add a comment to the task. The authenticated user is the creator.

**Request Body:**
```json
{
  "content": "This is a comment on the task."
}
```

**Response (201):** Created comment object.

**Errors:** 404 (task not found), 400

---

## Statuses

### POST /api/statuses

Create a new status.

**Request Body:**
```json
{
  "title": "In Progress",
  "description": "Task is currently being worked on"
}
```

**Response (201):** Created status object.

### GET /api/statuses

List all active statuses.

**Response (200):** Array of status objects.

### GET /api/statuses/:id

Get a single status by ID.

**Response (200):** Single status object.

**Errors:** 404

### PUT /api/statuses/:id

Update a status.

**Response (200):** Updated status object.

**Errors:** 404, 400

### DELETE /api/statuses/:id

Soft-delete a status.

**Response (204):** No content.

**Errors:** 404

---

## Labels

### POST /api/labels

Create a new label.

**Request Body:**
```json
{
  "title": "Bug",
  "description": "Something is broken"
}
```

**Response (201):** Created label object.

### GET /api/labels

List all active labels.

**Response (200):** Array of label objects.

### GET /api/labels/:id

Get a single label by ID.

**Response (200):** Single label object.

**Errors:** 404

### PUT /api/labels/:id

Update a label.

**Response (200):** Updated label object.

**Errors:** 404, 400

### DELETE /api/labels/:id

Soft-delete a label.

**Response (204):** No content.

**Errors:** 404

---

## Comments

### GET /api/comments/:id

Get a single comment by ID.

**Response (200):** Single comment object.

**Errors:** 404

### PUT /api/comments/:id

Update a comment. Only the creator can update.

**Request Body:**
```json
{
  "content": "Updated comment text"
}
```

**Response (200):** Updated comment object.

**Errors:** 404, 403 (not the creator), 400

### DELETE /api/comments/:id

Soft-delete a comment. Only the creator can delete.

**Response (204):** No content.

**Errors:** 404, 403

