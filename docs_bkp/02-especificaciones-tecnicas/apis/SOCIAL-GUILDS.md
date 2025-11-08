# Social Features API - Guilds/Teams System

**Proyecto:** Gamilit Platform
**API:** Social Features
**Funcionalidad:** Guilds & Teams
**Archivo original:** SOCIAL-FEATURES-API.md
**Version:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Overview

Collaborative guild system where users form teams, manage members with roles, create guild challenges, compete on leaderboards, and earn collective achievements.

**Total Endpoints:** 14

---

## Endpoints

### 2.1. Create Guild

**Endpoint**: `POST /api/guilds`

**Description**: Create a new guild with the authenticated user as owner.

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "name": "string",
  "description": "string",
  "logo": "url",
  "privacy": "public|private"
}
```

**Validation**:
- `name`: Required, 3-50 characters, unique
- `description`: Optional, max 500 characters
- `logo`: Optional, valid URL
- `privacy`: Required, enum ["public", "private"]

**Response**: 201 Created
```json
{
  "guild": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "logo": "url",
    "privacy": "public",
    "owner": {
      "id": "uuid",
      "username": "string"
    },
    "memberCount": 1,
    "createdAt": "2025-10-28T10:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input or name already taken
- `409 Conflict`: User already owns a guild

---

### 2.2. Get Guild Details

**Endpoint**: `GET /api/guilds/:guildId`

**Description**: Get detailed information about a guild.

**Authentication**: Required (JWT)

**Path Parameters**:
- `guildId` (uuid): Guild ID

**Response**: 200 OK
```json
{
  "guild": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "logo": "url",
    "privacy": "public",
    "owner": { "id": "uuid", "username": "string" },
    "memberCount": 25,
    "level": 5,
    "totalXP": 15000,
    "achievements": 12,
    "createdAt": "2025-10-28T10:00:00Z"
  }
}
```

**Error Responses**:
- `404 Not Found`: Guild not found
- `403 Forbidden`: Private guild and user not a member

---

### 2.3. Update Guild

**Endpoint**: `PUT /api/guilds/:guildId`

**Description**: Update guild information (Owner or Admin only).

**Authentication**: Required (JWT)

**Authorization**: Owner or Admin role

**Path Parameters**:
- `guildId` (uuid): Guild ID

**Request Body**:
```json
{
  "name": "string",
  "description": "string",
  "logo": "url",
  "privacy": "public|private"
}
```

**Response**: 200 OK

**Error Responses**:
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Guild not found
- `409 Conflict`: Name already taken

---

### 2.4. Delete Guild

**Endpoint**: `DELETE /api/guilds/:guildId`

**Description**: Delete a guild (Owner only).

**Authentication**: Required (JWT)

**Authorization**: Owner only

**Path Parameters**:
- `guildId` (uuid): Guild ID

**Response**: 204 No Content

**Side Effects**:
- All members removed from guild
- All guild challenges deleted
- All guild activities archived

**Error Responses**:
- `403 Forbidden`: Not the guild owner
- `404 Not Found`: Guild not found

---

### 2.5. Invite Member to Guild

**Endpoint**: `POST /api/guilds/:guildId/invite`

**Description**: Invite a user to join the guild (Owner or Admin only).

**Authentication**: Required (JWT)

**Authorization**: Owner or Admin role

**Path Parameters**:
- `guildId` (uuid): Guild ID

**Request Body**:
```json
{
  "userId": "uuid",
  "message": "Join our guild!"
}
```

**Response**: 201 Created

**Side Effects**:
- User receives notification
- Invitation appears in user's guild invitations

**Error Responses**:
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Guild or user not found
- `409 Conflict`: User already member or invited

---

### 2.6. Join Guild (Accept Invitation)

**Endpoint**: `POST /api/guilds/:guildId/join`

**Description**: Accept a guild invitation and join the guild.

**Authentication**: Required (JWT)

**Path Parameters**:
- `guildId` (uuid): Guild ID

**Request Body**:
```json
{
  "invitationId": "uuid"
}
```

**Response**: 200 OK

**Side Effects**:
- User added as member
- Activity created
- Guild members notified

**Error Responses**:
- `404 Not Found`: Guild or invitation not found
- `403 Forbidden`: Invalid invitation
- `409 Conflict`: Already a member

---

### 2.7. Leave Guild

**Endpoint**: `DELETE /api/guilds/:guildId/leave`

**Description**: Leave a guild (not available for Owner).

**Authentication**: Required (JWT)

**Path Parameters**:
- `guildId` (uuid): Guild ID

**Response**: 204 No Content

**Error Responses**:
- `403 Forbidden`: Owner cannot leave (must transfer ownership first)
- `404 Not Found`: Guild not found or not a member

---

### 2.8. Remove Member from Guild

**Endpoint**: `DELETE /api/guilds/:guildId/members/:userId`

**Description**: Remove a member from the guild (Owner or Admin only).

**Authentication**: Required (JWT)

**Authorization**: Owner or Admin role

**Path Parameters**:
- `guildId` (uuid): Guild ID
- `userId` (uuid): User ID to remove

**Response**: 204 No Content

**Error Responses**:
- `403 Forbidden`: Insufficient permissions or trying to remove owner
- `404 Not Found`: Guild or member not found

---

### 2.9. Update Member Role

**Endpoint**: `PUT /api/guilds/:guildId/members/:userId/role`

**Description**: Change a member's role (Owner only).

**Authentication**: Required (JWT)

**Authorization**: Owner only

**Path Parameters**:
- `guildId` (uuid): Guild ID
- `userId` (uuid): User ID

**Request Body**:
```json
{
  "role": "admin|member"
}
```

**Response**: 200 OK

**Error Responses**:
- `403 Forbidden`: Not the guild owner
- `404 Not Found`: Guild or member not found
- `400 Bad Request`: Cannot change owner's role

---

### 2.10. Get Guild Members

**Endpoint**: `GET /api/guilds/:guildId/members?page=1&limit=20`

**Description**: Get paginated list of guild members.

**Authentication**: Required (JWT)

**Path Parameters**:
- `guildId` (uuid): Guild ID

**Query Parameters**:
- `page` (integer, default: 1): Page number
- `limit` (integer, default: 20, max: 100): Results per page

**Response**: 200 OK
```json
{
  "members": [
    {
      "id": "uuid",
      "username": "string",
      "profilePicture": "url",
      "role": "owner|admin|member",
      "level": 15,
      "contributionXP": 5000,
      "joinedAt": "2025-10-28T10:00:00Z"
    }
  ],
  "total": 25,
  "page": 1
}
```

---

### 2.11. Get Guild Leaderboard

**Endpoint**: `GET /api/guilds/:guildId/leaderboard?period=week`

**Description**: Get guild member leaderboard by XP and tasks completed.

**Authentication**: Required (JWT)

**Path Parameters**:
- `guildId` (uuid): Guild ID

**Query Parameters**:
- `period` (string, default: "week"): Time period ["week", "month", "alltime"]

**Response**: 200 OK
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user": {
        "id": "uuid",
        "username": "string",
        "profilePicture": "url"
      },
      "xp": 5000,
      "tasksCompleted": 150
    }
  ],
  "period": "week"
}
```

---

### 2.12. Create Guild Challenge

**Endpoint**: `POST /api/guilds/:guildId/challenges`

**Description**: Create a guild challenge (Owner or Admin only).

**Authentication**: Required (JWT)

**Authorization**: Owner or Admin role

**Path Parameters**:
- `guildId` (uuid): Guild ID

**Request Body**:
```json
{
  "name": "string",
  "description": "string",
  "goal": {
    "type": "tasks_completed|xp_earned|achievements_unlocked",
    "target": 100
  },
  "reward": {
    "xp": 500,
    "coins": 1000,
    "achievementId": "uuid"
  },
  "startDate": "2025-10-28T10:00:00Z",
  "endDate": "2025-11-04T10:00:00Z"
}
```

**Validation**:
- `name`: Required, 3-100 characters
- `goal.target`: Positive integer
- `endDate`: Must be after startDate

**Response**: 201 Created

**Error Responses**:
- `403 Forbidden`: Insufficient permissions
- `400 Bad Request`: Invalid input

---

### 2.13. Get Guild Challenges

**Endpoint**: `GET /api/guilds/:guildId/challenges?status=active`

**Description**: Get guild challenges filtered by status.

**Authentication**: Required (JWT)

**Path Parameters**:
- `guildId` (uuid): Guild ID

**Query Parameters**:
- `status` (string, default: "active"): Challenge status ["active", "completed", "upcoming"]

**Response**: 200 OK
```json
{
  "challenges": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "goal": { "type": "tasks_completed", "target": 100 },
      "progress": 45,
      "reward": { "xp": 500, "coins": 1000 },
      "startDate": "2025-10-28T10:00:00Z",
      "endDate": "2025-11-04T10:00:00Z",
      "status": "active"
    }
  ]
}
```

---

### 2.14. Get Guild Achievements

**Endpoint**: `GET /api/guilds/:guildId/achievements`

**Description**: Get list of guild achievements.

**Authentication**: Required (JWT)

**Path Parameters**:
- `guildId` (uuid): Guild ID

**Response**: 200 OK
```json
{
  "achievements": [
    {
      "id": "uuid",
      "name": "First 10 Members",
      "description": "Reach 10 guild members",
      "icon": "url",
      "unlockedAt": "2025-10-28T10:00:00Z"
    }
  ],
  "total": 12
}
```

**Guild Achievement Types**:
- First Guild Created
- 10/25/50/100 Guild Members
- First/10 Guild Challenges Completed
- Guild Level 5/10/15/20 Reached

---
