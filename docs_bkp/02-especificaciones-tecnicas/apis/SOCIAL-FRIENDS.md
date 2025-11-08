# Social Features API - Friends System

**Proyecto:** Gamilit Platform
**API:** Social Features
**Funcionalidad:** Friends & Connections
**Archivo original:** SOCIAL-FEATURES-API.md
**Version:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Overview

Complete friend management system enabling users to connect, search for friends, manage friend lists, receive recommendations, view friend activities, and track friendship interactions.

**Total Endpoints:** 11

---

## Endpoints

### 1.1. Send Friend Request

**Endpoint**: `POST /api/friends/request`

**Description**: Send a friend request to another user.

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "userId": "uuid",
  "message": "Optional personal message"
}
```

**Response**: 201 Created
```json
{
  "requestId": "uuid",
  "status": "pending",
  "createdAt": "2025-10-28T10:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid userId or user already friend
- `404 Not Found`: User not found
- `409 Conflict`: Friend request already exists

---

### 1.2. Accept Friend Request

**Endpoint**: `POST /api/friends/accept/:requestId`

**Description**: Accept a pending friend request.

**Authentication**: Required (JWT)

**Path Parameters**:
- `requestId` (uuid): Friend request ID

**Response**: 200 OK
```json
{
  "friend": {
    "id": "uuid",
    "username": "string",
    "profilePicture": "url"
  },
  "createdAt": "2025-10-28T10:00:00Z"
}
```

**Side Effects**:
- Both users added to each other's friend list
- Both users receive notification
- Activity created in both activity feeds

**Error Responses**:
- `404 Not Found`: Friend request not found
- `403 Forbidden`: Not the recipient of the request

---

### 1.3. Decline Friend Request

**Endpoint**: `POST /api/friends/decline/:requestId`

**Description**: Decline a pending friend request.

**Authentication**: Required (JWT)

**Path Parameters**:
- `requestId` (uuid): Friend request ID

**Response**: 200 OK

**Error Responses**:
- `404 Not Found`: Friend request not found
- `403 Forbidden`: Not the recipient of the request

---

### 1.4. Remove Friend

**Endpoint**: `DELETE /api/friends/:friendId`

**Description**: Remove a user from friend list.

**Authentication**: Required (JWT)

**Path Parameters**:
- `friendId` (uuid): Friend user ID

**Response**: 204 No Content

**Error Responses**:
- `404 Not Found`: Friendship not found

---

### 1.5. Get Friend List

**Endpoint**: `GET /api/friends?page=1&limit=20`

**Description**: Get paginated list of user's friends.

**Authentication**: Required (JWT)

**Query Parameters**:
- `page` (integer, default: 1): Page number
- `limit` (integer, default: 20, max: 100): Results per page

**Response**: 200 OK
```json
{
  "friends": [
    {
      "id": "uuid",
      "username": "string",
      "profilePicture": "url",
      "level": 15,
      "onlineStatus": "online|offline|away",
      "lastSeen": "2025-10-28T10:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 5
}
```

---

### 1.6. Get Friendship Details

**Endpoint**: `GET /api/friendships/:id`

**Description**: Get detailed information about a specific friendship including interaction statistics and mutual friends count.

**Authentication**: Required (JWT)

**Path Parameters**:
- `id` (uuid): Friendship ID

**Response**: 200 OK
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "friend_id": "uuid",
  "status": "accepted",
  "created_at": "2025-10-28T10:00:00Z",
  "last_interaction": "2025-10-28T15:30:00Z",
  "mutual_friends_count": 5,
  "friend_details": {
    "id": "uuid",
    "username": "string",
    "profilePicture": "url",
    "level": 15,
    "currentRank": "batab"
  }
}
```

**Fields**:
- `id`: Unique friendship relationship ID
- `user_id`: ID of the user who initiated the friendship
- `friend_id`: ID of the friend
- `status`: Friendship status (accepted, pending, blocked)
- `created_at`: Date when friendship was established
- `last_interaction`: Date of last interaction between users (message, shared game, kudos, etc.)
- `mutual_friends_count`: Number of mutual friends between both users
- `friend_details`: Basic information about the friend

**Error Responses**:
- `404 Not Found`: Friendship not found
- `403 Forbidden`: User not authorized to view this friendship

**Notes**:
- `last_interaction` is updated automatically when users interact (send messages, play together, send kudos, etc.)
- `mutual_friends_count` is calculated dynamically based on current friendships
- Only users involved in the friendship can access these details

---

### 1.7. Get Pending Friend Requests

**Endpoint**: `GET /api/friends/requests/pending`

**Description**: Get list of pending incoming friend requests.

**Authentication**: Required (JWT)

**Response**: 200 OK
```json
{
  "requests": [
    {
      "id": "uuid",
      "from": {
        "id": "uuid",
        "username": "string",
        "profilePicture": "url"
      },
      "message": "Let's be friends!",
      "mutualFriends": 5,
      "createdAt": "2025-10-28T10:00:00Z"
    }
  ]
}
```

---

### 1.8. Get Sent Friend Requests

**Endpoint**: `GET /api/friends/requests/sent`

**Description**: Get list of outgoing friend requests.

**Authentication**: Required (JWT)

**Response**: 200 OK
```json
{
  "requests": [
    {
      "id": "uuid",
      "to": {
        "id": "uuid",
        "username": "string",
        "profilePicture": "url"
      },
      "message": "Let's be friends!",
      "status": "pending",
      "createdAt": "2025-10-28T10:00:00Z"
    }
  ]
}
```

---

### 1.9. Search Users

**Endpoint**: `GET /api/users/search?q=username&limit=20`

**Description**: Search for users by username or email.

**Authentication**: Required (JWT)

**Query Parameters**:
- `q` (string, required): Search query
- `limit` (integer, default: 20, max: 50): Results limit
- `excludeFriends` (boolean, default: false): Exclude current friends

**Response**: 200 OK
```json
{
  "users": [
    {
      "id": "uuid",
      "username": "string",
      "profilePicture": "url",
      "level": 10,
      "mutualFriends": 3,
      "friendStatus": "none|friend|pending|sent"
    }
  ]
}
```

**Search Features**:
- Fuzzy matching on username
- Email search (exact match)
- Mutual friends count calculation
- Friend status indication

---

### 1.10. Get Friend Recommendations

**Endpoint**: `GET /api/friends/recommendations?limit=10`

**Description**: Get personalized friend recommendations based on mutual connections, common achievements, and shared guilds.

**Authentication**: Required (JWT)

**Query Parameters**:
- `limit` (integer, default: 10, max: 20): Number of recommendations

**Response**: 200 OK
```json
{
  "recommendations": [
    {
      "id": "uuid",
      "username": "string",
      "profilePicture": "url",
      "reason": "5 mutual friends",
      "mutualFriends": 5,
      "commonAchievements": 8
    }
  ]
}
```

**Recommendation Algorithm**:
```
score = (mutualFriends * 0.5) + (commonAchievements * 0.3) + (sameGuild * 0.2)
```

---

### 1.11. Get Friend Activities

**Endpoint**: `GET /api/friends/:friendId/activities?page=1&limit=20`

**Description**: Get activity feed of a specific friend.

**Authentication**: Required (JWT)

**Path Parameters**:
- `friendId` (uuid): Friend user ID

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
      "createdAt": "2025-10-28T10:00:00Z"
    }
  ]
}
```

---
