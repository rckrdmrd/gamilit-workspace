# Social Features API - Activities Feed

**Proyecto:** Gamilit Platform
**API:** Social Features
**Funcionalidad:** Activities & Feed
**Archivo original:** SOCIAL-FEATURES-API.md
**Version:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Overview

Social activity feed displaying friend and guild member activities, including achievements earned, missions completed, guild events, and social interactions.

**Total Endpoints:** 5

---

## Endpoints

### 5.1. Get Activity Feed

**Endpoint**: `GET /api/activities/feed?page=1&limit=20&types=achievement,mission`

**Description**: Get personalized activity feed of friends and guild members.

**Authentication**: Required (JWT)

**Query Parameters**:
- `page` (integer, default: 1): Page number
- `limit` (integer, default: 20, max: 50): Results per page
- `types` (string, optional): Comma-separated activity types to filter
- `since` (integer, optional): Unix timestamp for real-time updates

**Response**: 200 OK
```json
{
  "activities": [
    {
      "id": "uuid",
      "type": "achievement_earned",
      "user": {
        "id": "uuid",
        "username": "johndoe",
        "profilePicture": "url",
        "level": 15
      },
      "data": {
        "achievementId": "uuid",
        "achievementName": "First Steps",
        "achievementIcon": "url",
        "achievementRarity": "common"
      },
      "likeCount": 5,
      "isLiked": false,
      "createdAt": "2025-10-28T10:00:00Z"
    },
    {
      "id": "uuid",
      "type": "mission_completed",
      "user": {
        "id": "uuid",
        "username": "janedoe",
        "profilePicture": "url",
        "level": 20
      },
      "data": {
        "missionTitle": "Complete 5 tasks today",
        "difficulty": "easy",
        "reward": {
          "xp": 100,
          "coins": 50
        }
      },
      "likeCount": 2,
      "isLiked": true,
      "createdAt": "2025-10-28T09:45:00Z"
    }
  ],
  "total": 245,
  "page": 1,
  "hasMore": true
}
```

**Activity Types**:
- `achievement_earned`: User earned achievement
- `mission_completed`: User completed mission
- `friend_added`: User added new friend
- `guild_joined`: User joined guild
- `level_up`: User leveled up
- `guild_challenge_completed`: Guild completed challenge

---

### 5.2. Like Activity

**Endpoint**: `POST /api/activities/:activityId/like`

**Description**: Like an activity from feed.

**Authentication**: Required (JWT)

**Path Parameters**:
- `activityId` (uuid): Activity ID

**Response**: 200 OK
```json
{
  "activityId": "uuid",
  "likeCount": 6,
  "isLiked": true
}
```

**Side Effects**:
- Like count incremented
- Activity owner receives notification (optional based on preferences)
- WebSocket event emitted for real-time update

---

### 5.3. Unlike Activity

**Endpoint**: `DELETE /api/activities/:activityId/like`

**Description**: Remove like from an activity.

**Authentication**: Required (JWT)

**Path Parameters**:
- `activityId` (uuid): Activity ID

**Response**: 200 OK
```json
{
  "activityId": "uuid",
  "likeCount": 5,
  "isLiked": false
}
```

---

### 5.4. Get Activity Likes

**Endpoint**: `GET /api/activities/:activityId/likes?page=1&limit=20`

**Description**: Get list of users who liked an activity.

**Authentication**: Required (JWT)

**Path Parameters**:
- `activityId` (uuid): Activity ID

**Query Parameters**:
- `page` (integer, default: 1): Page number
- `limit` (integer, default: 20, max: 50): Results per page

**Response**: 200 OK
```json
{
  "likes": [
    {
      "user": {
        "id": "uuid",
        "username": "johndoe",
        "profilePicture": "url"
      },
      "likedAt": "2025-10-28T10:15:00Z"
    }
  ],
  "total": 5
}
```

---

### 5.5. Get User Activities

**Endpoint**: `GET /api/activities/user/:userId?page=1&limit=20`

**Description**: Get activity history of a specific user.

**Authentication**: Required (JWT)

**Path Parameters**:
- `userId` (uuid): User ID

**Query Parameters**:
- `page` (integer, default: 1): Page number
- `limit` (integer, default: 20, max: 50): Results per page

**Response**: 200 OK
```json
{
  "activities": [
    {
      "id": "uuid",
      "type": "achievement_earned",
      "data": {
        "achievementId": "uuid",
        "achievementName": "First Steps"
      },
      "likeCount": 5,
      "isLiked": false,
      "createdAt": "2025-10-28T10:00:00Z"
    }
  ],
  "total": 78,
  "page": 1,
  "hasMore": true
}
```

**Privacy**: Only visible activities based on user's privacy settings.

---
