# Social Features API - Missions System

**Proyecto:** Gamilit Platform
**API:** Social Features
**Funcionalidad:** Missions & Challenges
**Archivo original:** SOCIAL-FEATURES-API.md
**Version:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Overview

Dynamic mission system that generates daily and weekly missions for users, automatically renewing via cron jobs.

**Total Endpoints:** 8

---

## Endpoints

### 3.1. Get Daily Missions

**Endpoint**: `GET /api/missions/daily`

**Description**: Get user's current daily missions (3 per day).

**Authentication**: Required (JWT)

**Response**: 200 OK
```json
{
  "missions": [
    {
      "id": "uuid",
      "type": "daily",
      "title": "Complete 5 tasks today",
      "description": "Complete any 5 tasks to earn rewards",
      "difficulty": "easy",
      "progress": 2,
      "target": 5,
      "reward": {
        "xp": 100,
        "coins": 50
      },
      "status": "in_progress",
      "expiresAt": "2025-10-29T00:00:00Z"
    }
  ],
  "nextRenewal": "2025-10-29T00:00:00Z"
}
```

**Mission Status**:
- `not_started`: Mission available but not started
- `in_progress`: Mission active
- `completed`: Mission completed
- `expired`: Mission expired without completion

---

### 3.2. Get Weekly Missions

**Endpoint**: `GET /api/missions/weekly`

**Description**: Get user's current weekly missions (5 per week).

**Authentication**: Required (JWT)

**Response**: 200 OK
```json
{
  "missions": [
    {
      "id": "uuid",
      "type": "weekly",
      "title": "Complete 30 tasks this week",
      "description": "Complete any 30 tasks to earn rewards",
      "difficulty": "medium",
      "progress": 15,
      "target": 30,
      "reward": {
        "xp": 300,
        "coins": 200
      },
      "status": "in_progress",
      "expiresAt": "2025-11-04T00:00:00Z"
    }
  ],
  "nextRenewal": "2025-11-04T00:00:00Z"
}
```

---

### 3.3. Get Special Event Missions

**Endpoint**: `GET /api/missions/special`

**Description**: Get active special event missions.

**Authentication**: Required (JWT)

**Response**: 200 OK
```json
{
  "missions": [
    {
      "id": "uuid",
      "type": "special",
      "title": "Halloween Challenge",
      "description": "Complete 10 spooky tasks",
      "difficulty": "hard",
      "progress": 5,
      "target": 10,
      "reward": {
        "xp": 500,
        "coins": 300,
        "achievementId": "uuid"
      },
      "status": "in_progress",
      "eventName": "Halloween 2025",
      "expiresAt": "2025-10-31T23:59:59Z"
    }
  ]
}
```

---

### 3.4. Start Mission

**Endpoint**: `POST /api/missions/:missionId/start`

**Description**: Explicitly start a mission (optional, missions auto-start on progress).

**Authentication**: Required (JWT)

**Path Parameters**:
- `missionId` (uuid): Mission ID

**Response**: 200 OK
```json
{
  "mission": {
    "id": "uuid",
    "status": "in_progress",
    "startedAt": "2025-10-28T10:00:00Z"
  }
}
```

---

### 3.5. Update Mission Progress

**Endpoint**: `PUT /api/missions/:missionId/progress`

**Description**: Update mission progress (usually called automatically by system events).

**Authentication**: Required (JWT)

**Path Parameters**:
- `missionId` (uuid): Mission ID

**Request Body**:
```json
{
  "progress": 3
}
```

**Response**: 200 OK

**Note**: This endpoint is typically called by internal services when relevant events occur (e.g., task completion, achievement unlocked).

---

### 3.6. Complete Mission

**Endpoint**: `POST /api/missions/:missionId/complete`

**Description**: Mark mission as completed and distribute rewards.

**Authentication**: Required (JWT)

**Path Parameters**:
- `missionId` (uuid): Mission ID

**Response**: 200 OK
```json
{
  "mission": {
    "id": "uuid",
    "status": "completed",
    "completedAt": "2025-10-28T10:00:00Z"
  },
  "rewards": {
    "xp": 100,
    "coins": 50,
    "achievement": null
  }
}
```

**Side Effects**:
- Rewards added to user's account
- Activity created in feed
- Notification sent to user

---

### 3.7. Get Mission History

**Endpoint**: `GET /api/missions/history?page=1&limit=20`

**Description**: Get user's mission completion history with statistics.

**Authentication**: Required (JWT)

**Query Parameters**:
- `page` (integer, default: 1): Page number
- `limit` (integer, default: 20, max: 50): Results per page

**Response**: 200 OK
```json
{
  "history": [
    {
      "id": "uuid",
      "title": "Complete 5 tasks today",
      "difficulty": "easy",
      "status": "completed",
      "completedAt": "2025-10-27T15:30:00Z",
      "reward": { "xp": 100, "coins": 50 }
    }
  ],
  "stats": {
    "totalCompleted": 45,
    "completionRate": 0.75,
    "totalXPEarned": 4500
  }
}
```

---

### 3.8. Create Special Mission (Admin)

**Endpoint**: `POST /api/admin/missions`

**Description**: Create a special event mission (Admin only).

**Authentication**: Required (JWT)

**Authorization**: Admin role required

**Request Body**:
```json
{
  "type": "special",
  "title": "string",
  "description": "string",
  "difficulty": "easy|medium|hard",
  "target": 10,
  "reward": {
    "xp": 500,
    "coins": 300,
    "achievementId": "uuid"
  },
  "eventName": "Halloween 2025",
  "startDate": "2025-10-28T00:00:00Z",
  "endDate": "2025-10-31T23:59:59Z"
}
```

**Response**: 201 Created

**Error Responses**:
- `403 Forbidden`: Not an admin
- `400 Bad Request`: Invalid input

---
