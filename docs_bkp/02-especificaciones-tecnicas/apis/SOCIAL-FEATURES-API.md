# API Specification - Social Features

> **⚠️ DEPRECATION NOTICE - RFC-0001 VIOLATION**
>
> Este archivo tiene 3,836 líneas (9.6x el límite de 400L según RFC-0001).
>
> **POR FAVOR USA LOS ARCHIVOS MODULARES EN SU LUGAR:**
> - [SOCIAL-README.md](./SOCIAL-README.md) - Índice principal
> - [SOCIAL-FRIENDS.md](./SOCIAL-FRIENDS.md) - Friends System (11 endpoints)
> - [SOCIAL-GUILDS.md](./SOCIAL-GUILDS.md) - Guilds/Teams System (14 endpoints)
> - [SOCIAL-MISSIONS.md](./SOCIAL-MISSIONS.md) - Missions System (8 endpoints)
> - [SOCIAL-NOTIFICATIONS.md](./SOCIAL-NOTIFICATIONS.md) - Notifications (6 endpoints)
> - [SOCIAL-ACTIVITIES.md](./SOCIAL-ACTIVITIES.md) - Activities Feed (5 endpoints)
> - [SOCIAL-REALTIME.md](./SOCIAL-REALTIME.md) - WebSocket Protocol
> - [SOCIAL-SCHEMAS.md](./SOCIAL-SCHEMAS.md) - Data Models
>
> **Este archivo se mantiene solo como referencia histórica y será removido en futuras versiones.**
>
> ---

## Overview

### General Information
- **Base URL**: `/api/social` (friends, guilds, missions, activities)
- **Base URL Notifications**: `/api/notifications`
- **Base URL Users**: `/api/users/search`
- **Base URL Admin**: `/api/admin/missions`
- **Total REST Endpoints**: 43
- **WebSocket Protocol**: Socket.IO on port 3001
- **Cron Jobs**: 2 (daily missions, weekly missions)
- **Authentication**: JWT Bearer Token (all endpoints)
- **API Version**: v1.0
- **Last Updated**: 2025-10-28

### Coverage Status
- **Current Coverage**: 35%
- **Target Coverage**: 100%
- **Features Documented**: 5/5
- **Endpoints Documented**: 43/43

### Architecture
- **Protocol**: REST + WebSocket (Socket.IO)
- **Data Format**: JSON
- **WebSocket Port**: 3001
- **Authentication**: JWT Bearer Token
- **Real-time**: Socket.IO for notifications and activities
- **Batch Processing**: Cron jobs for mission renewal

---

## REST Endpoints

### 1. Friends System (11 endpoints)

Complete friend management system enabling users to connect, search for friends, manage friend lists, receive recommendations, view friend activities, and track friendship interactions.

#### 1.1. Send Friend Request

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

#### 1.2. Accept Friend Request

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

#### 1.3. Decline Friend Request

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

#### 1.4. Remove Friend

**Endpoint**: `DELETE /api/friends/:friendId`

**Description**: Remove a user from friend list.

**Authentication**: Required (JWT)

**Path Parameters**:
- `friendId` (uuid): Friend user ID

**Response**: 204 No Content

**Error Responses**:
- `404 Not Found`: Friendship not found

---

#### 1.5. Get Friend List

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

#### 1.6. Get Friendship Details

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

#### 1.7. Get Pending Friend Requests

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

#### 1.8. Get Sent Friend Requests

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

#### 1.9. Search Users

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

#### 1.10. Get Friend Recommendations

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

#### 1.11. Get Friend Activities

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

### 2. Guilds/Teams System (14 endpoints)

Collaborative guild system where users form teams, manage members with roles, create guild challenges, compete on leaderboards, and earn collective achievements.

#### 2.1. Create Guild

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

#### 2.2. Get Guild Details

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

#### 2.3. Update Guild

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

#### 2.4. Delete Guild

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

#### 2.5. Invite Member to Guild

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

#### 2.6. Join Guild (Accept Invitation)

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

#### 2.7. Leave Guild

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

#### 2.8. Remove Member from Guild

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

#### 2.9. Update Member Role

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

#### 2.10. Get Guild Members

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

#### 2.11. Get Guild Leaderboard

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

#### 2.12. Create Guild Challenge

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

#### 2.13. Get Guild Challenges

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

#### 2.14. Get Guild Achievements

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

### 3. Missions System (8 endpoints)

Dynamic mission system that generates daily and weekly missions for users, automatically renewing via cron jobs.

#### 3.1. Get Daily Missions

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

#### 3.2. Get Weekly Missions

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

#### 3.3. Get Special Event Missions

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

#### 3.4. Start Mission

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

#### 3.5. Update Mission Progress

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

#### 3.6. Complete Mission

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

#### 3.7. Get Mission History

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

#### 3.8. Create Special Mission (Admin)

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

### 4. Notifications System (6 endpoints)

Real-time notification system using WebSocket (Socket.IO) to deliver instant notifications for achievements, friend requests, guild invitations, mission completions, and system events.

#### 4.1. Get Notification History

**Endpoint**: `GET /api/notifications?page=1&limit=20&status=unread`

**Description**: Get paginated notification history with filtering.

**Authentication**: Required (JWT)

**Query Parameters**:
- `page` (integer, default: 1): Page number
- `limit` (integer, default: 20, max: 100): Results per page
- `status` (string, default: "all"): Filter by status ["all", "read", "unread"]
- `type` (string, optional): Filter by type ["achievement", "friend_request", "guild_invite", "mission", "system"]

**Response**: 200 OK
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "friend_request",
      "title": "New friend request",
      "message": "John Doe sent you a friend request",
      "data": {
        "userId": "uuid",
        "username": "johndoe",
        "profilePicture": "url"
      },
      "status": "unread",
      "createdAt": "2025-10-28T10:00:00Z"
    }
  ],
  "total": 45,
  "unreadCount": 8,
  "page": 1
}
```

**Notification Types**:
- `achievement`: Achievement unlocked/milestone
- `friend_request`: Friend request received/accepted
- `guild_invite`: Guild invitation received
- `guild_event`: Guild member joined, challenge started/completed
- `mission`: Mission completed, new missions available
- `system`: System updates, maintenance, special events

---

#### 4.2. Mark Notification as Read

**Endpoint**: `PUT /api/notifications/:notificationId/read`

**Description**: Mark a single notification as read.

**Authentication**: Required (JWT)

**Path Parameters**:
- `notificationId` (uuid): Notification ID

**Response**: 200 OK

**Side Effects**:
- Unread count decremented
- WebSocket event emitted to update UI

---

#### 4.3. Mark All Notifications as Read

**Endpoint**: `PUT /api/notifications/read-all`

**Description**: Mark all user's notifications as read.

**Authentication**: Required (JWT)

**Response**: 200 OK
```json
{
  "markedAsRead": 8
}
```

---

#### 4.4. Delete Notification

**Endpoint**: `DELETE /api/notifications/:notificationId`

**Description**: Delete a notification.

**Authentication**: Required (JWT)

**Path Parameters**:
- `notificationId` (uuid): Notification ID

**Response**: 204 No Content

---

#### 4.5. Get Notification Preferences

**Endpoint**: `GET /api/notifications/preferences`

**Description**: Get user's notification preferences.

**Authentication**: Required (JWT)

**Response**: 200 OK
```json
{
  "preferences": {
    "achievements": {
      "inApp": true,
      "email": false,
      "push": false
    },
    "friends": {
      "inApp": true,
      "email": false,
      "push": true
    },
    "guilds": {
      "inApp": true,
      "email": true,
      "push": true
    },
    "missions": {
      "inApp": true,
      "email": false,
      "push": false
    },
    "system": {
      "inApp": true,
      "email": true,
      "push": false
    },
    "quietHours": {
      "enabled": false,
      "start": "22:00",
      "end": "08:00"
    }
  }
}
```

**Delivery Channels**:
- `inApp`: Real-time notifications in application
- `email`: Email notifications (future implementation)
- `push`: Push notifications (future implementation)

---

#### 4.6. Update Notification Preferences

**Endpoint**: `PUT /api/notifications/preferences`

**Description**: Update notification preferences.

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "achievements": {
    "inApp": true,
    "email": false,
    "push": false
  },
  "quietHours": {
    "enabled": true,
    "start": "22:00",
    "end": "08:00"
  }
}
```

**Response**: 200 OK

**Note**: During quiet hours, notifications are still stored but not delivered in real-time (except critical system notifications).

---

### 5. Activities Feed (5 endpoints)

Social activity feed displaying friend and guild member activities, including achievements earned, missions completed, guild events, and social interactions.

#### 5.1. Get Activity Feed

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

#### 5.2. Like Activity

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

#### 5.3. Unlike Activity

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

#### 5.4. Get Activity Likes

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

#### 5.5. Get User Activities

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

## WebSocket Protocol

### Overview

The WebSocket implementation uses Socket.IO for real-time bidirectional communication between clients and server. The primary use case is delivering instant notifications and activity updates.

### Connection Details

- **Protocol**: Socket.IO v4.x
- **Port**: 3001
- **Transport**: WebSocket (fallback to polling)
- **Namespace**: `/` (default namespace)
- **Authentication**: JWT token via auth handshake

### Server Configuration

```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Redis Adapter for horizontal scaling
const redisAdapter = require('socket.io-redis');
io.adapter(redisAdapter({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
}));
```

### Client Configuration

```javascript
const socket = io('wss://api.gamilit.com:3001', {
  auth: {
    token: jwtToken
  },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  transports: ['websocket', 'polling']
});
```

---

### Events: Client → Server

#### 1. Authenticate

**Event**: `authenticate`

**Description**: Authenticate the WebSocket connection with JWT token.

**Payload**:
```javascript
{
  token: "jwt-token-string"
}
```

**Response Events**:
- `authenticated`: Authentication successful
- `auth_error`: Authentication failed

**Example**:
```javascript
socket.emit('authenticate', { token: userToken });

socket.on('authenticated', () => {
  console.log('WebSocket authenticated successfully');
});

socket.on('auth_error', (error) => {
  console.error('Authentication failed:', error.message);
});
```

---

#### 2. Subscribe to User Channel

**Event**: `subscribe:user`

**Description**: Subscribe to user-specific notifications and updates (automatic after authentication).

**Note**: This is handled automatically by the server after successful authentication. No client action required.

---

#### 3. Subscribe to Guild Channel

**Event**: `subscribe:guild`

**Description**: Subscribe to guild-specific events.

**Payload**:
```javascript
{
  guildId: "uuid"
}
```

**Example**:
```javascript
socket.emit('subscribe:guild', { guildId: 'guild-uuid' });
```

---

#### 4. Unsubscribe from Guild Channel

**Event**: `unsubscribe:guild`

**Description**: Unsubscribe from guild events.

**Payload**:
```javascript
{
  guildId: "uuid"
}
```

---

### Events: Server → Client

#### 1. Notification:New

**Event**: `notification:new`

**Description**: New notification received.

**Payload**:
```javascript
{
  id: "uuid",
  type: "friend_request|guild_invite|achievement|mission|system",
  title: "string",
  message: "string",
  data: {
    // Type-specific data
  },
  createdAt: "2025-10-28T10:00:00Z"
}
```

**Example**:
```javascript
socket.on('notification:new', (notification) => {
  // Display toast notification
  showToast(notification.title, notification.message);

  // Update unread count
  updateNotificationBadge();

  // Play sound (optional)
  if (notification.type === 'friend_request') {
    playNotificationSound();
  }
});
```

---

#### 2. Notification:Read

**Event**: `notification:read`

**Description**: Notification marked as read (possibly from another device).

**Payload**:
```javascript
{
  notificationId: "uuid"
}
```

**Example**:
```javascript
socket.on('notification:read', ({ notificationId }) => {
  // Update UI to show notification as read
  updateNotificationStatus(notificationId, 'read');
});
```

---

#### 3. Notification:Delete

**Event**: `notification:delete`

**Description**: Notification deleted.

**Payload**:
```javascript
{
  notificationId: "uuid"
}
```

**Example**:
```javascript
socket.on('notification:delete', ({ notificationId }) => {
  // Remove notification from UI
  removeNotificationFromList(notificationId);
});
```

---

#### 4. Activity:New

**Event**: `activity:new`

**Description**: New activity from friend or guild member.

**Payload**:
```javascript
{
  id: "uuid",
  type: "achievement_earned|mission_completed|level_up|...",
  user: {
    id: "uuid",
    username: "string",
    profilePicture: "url"
  },
  data: {
    // Activity-specific data
  },
  likeCount: 0,
  isLiked: false,
  createdAt: "2025-10-28T10:00:00Z"
}
```

**Example**:
```javascript
socket.on('activity:new', (activity) => {
  // Prepend to activity feed
  prependActivityToFeed(activity);

  // Show subtle notification
  showActivityUpdate(`${activity.user.username} ${getActivityDescription(activity)}`);
});
```

---

#### 5. Activity:Liked

**Event**: `activity:liked`

**Description**: Someone liked user's activity.

**Payload**:
```javascript
{
  activityId: "uuid",
  likeCount: 6,
  user: {
    id: "uuid",
    username: "string"
  }
}
```

**Example**:
```javascript
socket.on('activity:liked', ({ activityId, likeCount, user }) => {
  // Update like count in UI
  updateActivityLikeCount(activityId, likeCount);

  // Show notification (optional)
  if (preferences.activityLikes) {
    showToast(`${user.username} liked your activity`);
  }
});
```

---

#### 6. Friend:Online

**Event**: `friend:online`

**Description**: Friend came online.

**Payload**:
```javascript
{
  friendId: "uuid",
  username: "string",
  status: "online"
}
```

**Example**:
```javascript
socket.on('friend:online', ({ friendId, username }) => {
  // Update friend status in UI
  updateFriendStatus(friendId, 'online');

  // Show notification (optional)
  if (preferences.friendOnline) {
    showToast(`${username} is now online`);
  }
});
```

---

#### 7. Friend:Offline

**Event**: `friend:offline`

**Description**: Friend went offline.

**Payload**:
```javascript
{
  friendId: "uuid",
  username: "string",
  status: "offline",
  lastSeen: "2025-10-28T10:00:00Z"
}
```

---

#### 8. Guild:MemberJoined

**Event**: `guild:member_joined`

**Description**: New member joined guild.

**Payload**:
```javascript
{
  guildId: "uuid",
  member: {
    id: "uuid",
    username: "string",
    profilePicture: "url"
  }
}
```

**Example**:
```javascript
socket.on('guild:member_joined', ({ member, guildId }) => {
  // Update guild member count
  updateGuildMemberCount(guildId);

  // Show notification
  showToast(`${member.username} joined the guild!`);
});
```

---

#### 9. Guild:ChallengeUpdated

**Event**: `guild:challenge_updated`

**Description**: Guild challenge progress updated.

**Payload**:
```javascript
{
  guildId: "uuid",
  challengeId: "uuid",
  progress: 55,
  target: 100,
  status: "active|completed"
}
```

**Example**:
```javascript
socket.on('guild:challenge_updated', ({ challengeId, progress, target, status }) => {
  // Update challenge progress bar
  updateChallengeProgress(challengeId, progress, target);

  // Show completion celebration if completed
  if (status === 'completed') {
    showChallengeCompletionModal(challengeId);
  }
});
```

---

#### 10. Mission:Renewed

**Event**: `mission:renewed`

**Description**: Daily or weekly missions renewed.

**Payload**:
```javascript
{
  type: "daily|weekly",
  missions: [
    {
      id: "uuid",
      title: "string",
      description: "string",
      difficulty: "easy|medium|hard",
      target: 5,
      reward: { xp: 100, coins: 50 }
    }
  ]
}
```

**Example**:
```javascript
socket.on('mission:renewed', ({ type, missions }) => {
  // Update missions in UI
  updateMissionsList(missions);

  // Show notification
  showToast(`New ${type} missions available!`);
});
```

---

### Connection Lifecycle Events

#### Connect

**Event**: `connect`

**Description**: WebSocket connection established.

**Example**:
```javascript
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
  console.log('Socket ID:', socket.id);

  // Authenticate if not already done
  if (!socket.authenticated) {
    socket.emit('authenticate', { token: userToken });
  }
});
```

---

#### Disconnect

**Event**: `disconnect`

**Description**: WebSocket connection lost.

**Payload**:
```javascript
{
  reason: "transport close|client disconnect|server disconnect|..."
}
```

**Example**:
```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);

  // Show offline indicator
  showOfflineIndicator();

  // Automatic reconnection handled by Socket.IO
});
```

---

#### Reconnect

**Event**: `reconnect`

**Description**: Successfully reconnected after disconnect.

**Payload**:
```javascript
{
  attemptNumber: 3
}
```

**Example**:
```javascript
socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');

  // Hide offline indicator
  hideOfflineIndicator();

  // Sync data
  syncNotifications();
  syncActivities();
});
```

---

#### Error

**Event**: `error`

**Description**: WebSocket error occurred.

**Example**:
```javascript
socket.on('error', (error) => {
  console.error('WebSocket error:', error);

  // Show error message to user
  showErrorNotification('Connection error. Please try again.');
});
```

---

### Authentication Flow

```javascript
// 1. Create socket connection
const socket = io(SOCKET_URL, {
  auth: { token: jwtToken },
  autoConnect: false
});

// 2. Set up event listeners
socket.on('connect', () => {
  console.log('Connected');
});

socket.on('authenticated', () => {
  console.log('Authenticated');
  // Start receiving notifications
});

socket.on('auth_error', (error) => {
  console.error('Auth failed:', error);
  socket.disconnect();
  // Redirect to login
});

socket.on('notification:new', (notification) => {
  handleNotification(notification);
});

// 3. Connect
socket.connect();
```

---

### Scaling with Redis Adapter

For horizontal scaling across multiple server instances:

```javascript
// Server-side
const io = require('socket.io')(server);
const redisAdapter = require('socket.io-redis');

io.adapter(redisAdapter({
  host: 'localhost',
  port: 6379
}));

// Emit to specific user across all servers
io.to(`user:${userId}`).emit('notification:new', notification);

// Emit to guild channel across all servers
io.to(`guild:${guildId}`).emit('guild:challenge_updated', data);
```

---

### Rate Limiting

WebSocket connections and events are rate-limited:

| Action | Limit | Window |
|--------|-------|--------|
| Connections per user | 5 | Concurrent |
| Events emitted per user | 100 | 1 minute |
| Authentication attempts | 5 | 5 minutes |

---

### Error Handling

**Error Events**:

```javascript
socket.on('error:rate_limit', ({ limit, window }) => {
  showError(`Too many requests. Please wait ${window} seconds.`);
});

socket.on('error:invalid_data', ({ message }) => {
  console.error('Invalid data sent:', message);
});

socket.on('error:unauthorized', ({ message }) => {
  console.error('Unauthorized:', message);
  socket.disconnect();
  redirectToLogin();
});
```

---

## Cron Jobs

### Overview

Two cron jobs handle automatic mission renewal:
1. **Daily Mission Renewal**: Runs every day at midnight
2. **Weekly Mission Renewal**: Runs every Monday at midnight

### Technology Stack

- **Scheduler**: Node.js `node-cron` or `bull` (Redis-backed job queue)
- **Locking**: Redis distributed locks to prevent duplicate execution
- **Monitoring**: Job execution logs and metrics

---

### 1. Daily Mission Renewal

#### Schedule
- **Cron Expression**: `0 0 * * *`
- **Frequency**: Every day at 00:00 (midnight)
- **Timezone**: UTC (configurable via `TZ` environment variable)

#### Functionality

```javascript
// Pseudo-code for daily mission renewal
async function renewDailyMissions() {
  const lockKey = 'cron:daily-mission-renewal';
  const lockTTL = 10 * 60 * 1000; // 10 minutes

  // Acquire distributed lock
  const lock = await acquireLock(lockKey, lockTTL);
  if (!lock) {
    logger.warn('Another instance is running daily mission renewal');
    return;
  }

  try {
    logger.info('Starting daily mission renewal');

    // 1. Get all active users
    const users = await User.findAll({ where: { active: true } });

    // 2. Process in batches
    const batchSize = 100;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);

      await Promise.all(batch.map(async (user) => {
        // Archive current daily missions
        await Mission.update(
          { status: 'archived' },
          { where: { userId: user.id, type: 'daily', status: 'in_progress' } }
        );

        // Generate 3 new daily missions
        const newMissions = await generateDailyMissions(user);

        // Create mission records
        await Mission.bulkCreate(newMissions);

        // Send notification via WebSocket
        if (user.isOnline) {
          io.to(`user:${user.id}`).emit('mission:renewed', {
            type: 'daily',
            missions: newMissions
          });
        }
      }));
    }

    logger.info(`Daily mission renewal completed for ${users.length} users`);

  } catch (error) {
    logger.error('Daily mission renewal failed:', error);
    // Send alert to monitoring system
    await sendAlert('daily-mission-renewal-failed', error);

  } finally {
    // Release lock
    await releaseLock(lockKey);
  }
}

// Mission generation logic
async function generateDailyMissions(user) {
  const missions = [];

  // Get user's recent missions to avoid duplicates
  const recentMissions = await Mission.findAll({
    where: {
      userId: user.id,
      type: 'daily',
      createdAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }
  });

  const recentTypes = recentMissions.map(m => m.missionTypeId);

  // Difficulty distribution: 60% Easy, 30% Medium, 10% Hard
  const difficulties = ['easy', 'easy', 'medium'];

  for (const difficulty of difficulties) {
    const missionTemplate = await selectRandomMission(
      'daily',
      difficulty,
      user.level,
      recentTypes
    );

    missions.push({
      userId: user.id,
      type: 'daily',
      title: missionTemplate.title,
      description: missionTemplate.description,
      difficulty: difficulty,
      target: missionTemplate.target,
      progress: 0,
      reward: missionTemplate.reward,
      status: 'not_started',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
  }

  return missions;
}
```

#### Configuration

```javascript
// Cron job registration
cron.schedule('0 0 * * *', renewDailyMissions, {
  scheduled: true,
  timezone: process.env.TZ || 'UTC'
});
```

#### Monitoring Metrics

- **Execution Time**: Average time to complete renewal
- **Users Processed**: Total users processed
- **Success Rate**: Percentage of successful renewals
- **Error Count**: Number of errors encountered

---

### 2. Weekly Mission Renewal

#### Schedule
- **Cron Expression**: `0 0 * * 1`
- **Frequency**: Every Monday at 00:00 (midnight)
- **Timezone**: UTC (configurable via `TZ` environment variable)

#### Functionality

```javascript
// Pseudo-code for weekly mission renewal
async function renewWeeklyMissions() {
  const lockKey = 'cron:weekly-mission-renewal';
  const lockTTL = 15 * 60 * 1000; // 15 minutes

  // Acquire distributed lock
  const lock = await acquireLock(lockKey, lockTTL);
  if (!lock) {
    logger.warn('Another instance is running weekly mission renewal');
    return;
  }

  try {
    logger.info('Starting weekly mission renewal');

    // 1. Get all active users
    const users = await User.findAll({ where: { active: true } });

    // 2. Process in batches
    const batchSize = 100;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);

      await Promise.all(batch.map(async (user) => {
        // Archive current weekly missions
        await Mission.update(
          { status: 'archived' },
          { where: { userId: user.id, type: 'weekly', status: 'in_progress' } }
        );

        // Generate 5 new weekly missions
        const newMissions = await generateWeeklyMissions(user);

        // Create mission records
        await Mission.bulkCreate(newMissions);

        // Send notification via WebSocket
        if (user.isOnline) {
          io.to(`user:${user.id}`).emit('mission:renewed', {
            type: 'weekly',
            missions: newMissions
          });
        }
      }));
    }

    logger.info(`Weekly mission renewal completed for ${users.length} users`);

  } catch (error) {
    logger.error('Weekly mission renewal failed:', error);
    await sendAlert('weekly-mission-renewal-failed', error);

  } finally {
    await releaseLock(lockKey);
  }
}

// Weekly mission generation logic
async function generateWeeklyMissions(user) {
  const missions = [];

  // Get user's recent missions to avoid duplicates
  const recentMissions = await Mission.findAll({
    where: {
      userId: user.id,
      type: 'weekly',
      createdAt: { [Op.gte]: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) }
    }
  });

  const recentTypes = recentMissions.map(m => m.missionTypeId);

  // Difficulty distribution: 40% Easy, 40% Medium, 20% Hard
  const difficulties = ['easy', 'easy', 'medium', 'medium', 'hard'];

  for (const difficulty of difficulties) {
    const missionTemplate = await selectRandomMission(
      'weekly',
      difficulty,
      user.level,
      recentTypes
    );

    missions.push({
      userId: user.id,
      type: 'weekly',
      title: missionTemplate.title,
      description: missionTemplate.description,
      difficulty: difficulty,
      target: missionTemplate.target,
      progress: 0,
      reward: missionTemplate.reward,
      status: 'not_started',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
  }

  return missions;
}
```

#### Configuration

```javascript
// Cron job registration
cron.schedule('0 0 * * 1', renewWeeklyMissions, {
  scheduled: true,
  timezone: process.env.TZ || 'UTC'
});
```

---

### Distributed Locking

To prevent duplicate execution across multiple server instances:

```javascript
// Redis-based distributed lock
async function acquireLock(key, ttl) {
  const result = await redis.set(key, process.pid, 'PX', ttl, 'NX');
  return result === 'OK';
}

async function releaseLock(key) {
  await redis.del(key);
}
```

---

### Error Handling and Retries

```javascript
// Retry logic for failed renewals
async function renewMissionsWithRetry(renewalFunc, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await renewalFunc();
      return;
    } catch (error) {
      logger.error(`Renewal attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        // Final attempt failed, send alert
        await sendAlert('mission-renewal-failed-all-retries', error);
        throw error;
      }

      // Exponential backoff
      await sleep(Math.pow(2, attempt) * 1000);
    }
  }
}
```

---

### Monitoring and Alerts

#### Metrics Collected

- **Execution Duration**: Time taken to complete renewal
- **Users Processed**: Total users processed per run
- **Success/Failure Rate**: Percentage of successful renewals
- **Lock Acquisition Failures**: Times when lock couldn't be acquired
- **Mission Generation Errors**: Errors during mission creation

#### Alert Conditions

- Execution time > 10 minutes
- Success rate < 95%
- Lock acquisition failure
- More than 5 mission generation errors

---

### Manual Execution (Admin)

Admins can manually trigger mission renewal:

```bash
# Trigger daily mission renewal
POST /api/admin/cron/trigger
{
  "job": "daily-mission-renewal"
}

# Trigger weekly mission renewal
POST /api/admin/cron/trigger
{
  "job": "weekly-mission-renewal"
}
```

---

## Schemas

### Data Models

#### Friend Request Schema

```typescript
interface FriendRequest {
  id: string; // UUID
  fromUserId: string; // UUID
  toUserId: string; // UUID
  message?: string; // Optional personal message
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  updatedAt: Date;
}
```

---

#### Friendship Schema

```typescript
interface Friendship {
  id: string; // UUID
  userId: string; // UUID
  friendId: string; // UUID
  status: 'accepted' | 'pending' | 'blocked'; // Estado de la amistad
  createdAt: Date;
  lastInteraction?: Date; // Fecha de última interacción (mensaje, juego compartido, kudos, etc.)
  mutualFriendsCount?: number; // Cantidad de amigos en común
}
```

---

#### Guild Schema

```typescript
interface Guild {
  id: string; // UUID
  name: string; // Unique, 3-50 characters
  description?: string; // Max 500 characters
  logo?: string; // URL
  privacy: 'public' | 'private';
  ownerId: string; // UUID
  memberCount: number;
  level: number; // Guild level (1-100)
  totalXP: number; // Collective XP
  achievementCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

#### Guild Member Schema

```typescript
interface GuildMember {
  id: string; // UUID
  guildId: string; // UUID
  userId: string; // UUID
  role: 'owner' | 'admin' | 'member';
  contributionXP: number; // XP contributed by this member
  joinedAt: Date;
}
```

---

#### Guild Challenge Schema

```typescript
interface GuildChallenge {
  id: string; // UUID
  guildId: string; // UUID
  name: string;
  description: string;
  goal: {
    type: 'tasks_completed' | 'xp_earned' | 'achievements_unlocked';
    target: number;
  };
  progress: number;
  reward: {
    xp: number;
    coins: number;
    achievementId?: string; // UUID (optional)
  };
  status: 'upcoming' | 'active' | 'completed' | 'failed';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

#### Mission Schema

```typescript
interface Mission {
  id: string; // UUID
  userId: string; // UUID
  type: 'daily' | 'weekly' | 'special';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  target: number; // Goal to achieve
  progress: number; // Current progress
  reward: {
    xp: number;
    coins: number;
    achievementId?: string; // UUID (optional)
  };
  status: 'not_started' | 'in_progress' | 'completed' | 'expired' | 'archived';
  eventName?: string; // For special missions
  startedAt?: Date;
  completedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

#### Notification Schema

```typescript
interface Notification {
  id: string; // UUID
  userId: string; // UUID
  type: 'achievement' | 'friend_request' | 'guild_invite' | 'guild_event' | 'mission' | 'system';
  title: string;
  message: string;
  data: Record<string, any>; // Type-specific data (JSON)
  status: 'unread' | 'read';
  createdAt: Date;
  readAt?: Date;
}
```

---

#### Notification Preferences Schema

```typescript
interface NotificationPreferences {
  id: string; // UUID
  userId: string; // UUID
  achievements: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
  friends: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
  guilds: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
  missions: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
  system: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // Time format "HH:MM"
    end: string; // Time format "HH:MM"
  };
  updatedAt: Date;
}
```

---

#### Activity Schema

```typescript
interface Activity {
  id: string; // UUID
  userId: string; // UUID (who performed the activity)
  type: 'achievement_earned' | 'mission_completed' | 'friend_added' | 'guild_joined' | 'level_up' | 'guild_challenge_completed';
  data: Record<string, any>; // Activity-specific data (JSON)
  likeCount: number;
  createdAt: Date;
}
```

---

#### Activity Like Schema

```typescript
interface ActivityLike {
  id: string; // UUID
  activityId: string; // UUID
  userId: string; // UUID (who liked)
  createdAt: Date;
}
```

---

### Database Relationships

```
User (1) ----< (N) FriendRequest (fromUser)
User (1) ----< (N) FriendRequest (toUser)
User (1) ----< (N) Friendship
User (1) ----< (N) Guild (owner)
User (1) ----< (N) GuildMember
Guild (1) ----< (N) GuildMember
Guild (1) ----< (N) GuildChallenge
User (1) ----< (N) Mission
User (1) ----< (N) Notification
User (1) ----< (1) NotificationPreferences
User (1) ----< (N) Activity
Activity (1) ----< (N) ActivityLike
User (1) ----< (N) ActivityLike
```

---

### Database Indexes

#### Performance Indexes

```sql
-- Friends
CREATE INDEX idx_friend_request_to_user ON friend_requests(to_user_id, status);
CREATE INDEX idx_friend_request_from_user ON friend_requests(from_user_id, status);
CREATE INDEX idx_friendship_user ON friendships(user_id);
CREATE INDEX idx_friendship_friend ON friendships(friend_id);
CREATE UNIQUE INDEX idx_friendship_unique ON friendships(user_id, friend_id);

-- Guilds
CREATE INDEX idx_guild_name ON guilds(name);
CREATE INDEX idx_guild_owner ON guilds(owner_id);
CREATE INDEX idx_guild_member_guild ON guild_members(guild_id);
CREATE INDEX idx_guild_member_user ON guild_members(user_id);
CREATE INDEX idx_guild_challenge_guild ON guild_challenges(guild_id, status);

-- Missions
CREATE INDEX idx_mission_user_type ON missions(user_id, type, status);
CREATE INDEX idx_mission_expires ON missions(expires_at);
CREATE INDEX idx_mission_status ON missions(status);

-- Notifications
CREATE INDEX idx_notification_user_status ON notifications(user_id, status);
CREATE INDEX idx_notification_created ON notifications(created_at);
CREATE INDEX idx_notification_type ON notifications(type);

-- Activities
CREATE INDEX idx_activity_user ON activities(user_id);
CREATE INDEX idx_activity_created ON activities(created_at);
CREATE INDEX idx_activity_type ON activities(type);
CREATE INDEX idx_activity_like_activity ON activity_likes(activity_id);
CREATE INDEX idx_activity_like_user ON activity_likes(user_id);
CREATE UNIQUE INDEX idx_activity_like_unique ON activity_likes(activity_id, user_id);
```

---

## Rate Limiting

### Overview

Rate limiting is implemented per-user and per-endpoint to prevent abuse and ensure fair usage.

### Implementation

- **Library**: `express-rate-limit` + Redis store
- **Storage**: Redis (shared across instances)
- **Headers**: Standard rate limit headers included in responses

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698497280
Retry-After: 60 (only if rate limit exceeded)
```

---

### Rate Limits by Endpoint Type

#### Read Endpoints (GET)

**Limit**: 100 requests per minute

**Applies to**:
- `GET /api/friends`
- `GET /api/guilds/:guildId`
- `GET /api/missions/daily`
- `GET /api/notifications`
- `GET /api/activities/feed`
- All other GET endpoints

**Response when exceeded**: 429 Too Many Requests
```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again in 60 seconds.",
  "retryAfter": 60
}
```

---

#### Write Endpoints (POST, PUT)

**Limit**: 30 requests per minute

**Applies to**:
- `POST /api/friends/request`
- `POST /api/guilds`
- `POST /api/guilds/:guildId/challenges`
- `PUT /api/guilds/:guildId`
- `PUT /api/notifications/preferences`
- All other POST/PUT endpoints

**Response when exceeded**: 429 Too Many Requests

---

#### Delete Endpoints (DELETE)

**Limit**: 10 requests per minute

**Applies to**:
- `DELETE /api/friends/:friendId`
- `DELETE /api/guilds/:guildId`
- `DELETE /api/guilds/:guildId/members/:userId`
- `DELETE /api/notifications/:notificationId`
- All other DELETE endpoints

**Response when exceeded**: 429 Too Many Requests

---

#### Search Endpoints

**Limit**: 20 requests per minute

**Applies to**:
- `GET /api/users/search`
- `GET /api/friends/recommendations`

**Rationale**: Search operations are more expensive, so lower limit.

---

#### WebSocket Connections

**Limit**: 5 concurrent connections per user

**Rationale**: Prevent connection hoarding across multiple devices/tabs.

**Behavior**: Oldest connection automatically closed when limit exceeded.

---

#### WebSocket Events

**Limit**: 100 events emitted per minute per user

**Applies to**: All client-to-server events

**Response when exceeded**: `error:rate_limit` event

---

### Special Rate Limits

#### Friend Requests

**Limit**: 10 friend requests per day

**Endpoint**: `POST /api/friends/request`

**Rationale**: Prevent spam and abuse.

---

#### Guild Invitations

**Limit**: 20 invitations per guild per day

**Endpoint**: `POST /api/guilds/:guildId/invite`

**Rationale**: Prevent spam invitations.

---

### Bypass for Premium Users (Future)

Premium users may receive higher rate limits:

| Endpoint Type | Standard | Premium |
|---------------|----------|---------|
| Read (GET) | 100/min | 200/min |
| Write (POST/PUT) | 30/min | 60/min |
| Delete (DELETE) | 10/min | 20/min |
| Search | 20/min | 50/min |

---

### Configuration

```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit per window
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Apply to all routes
app.use('/api/', limiter);
```

---

## Examples

### Example 1: Complete Friend Flow

#### Step 1: Search for User

**Request**:
```http
GET /api/users/search?q=johndoe&limit=10
Authorization: Bearer <jwt-token>
```

**Response**:
```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "username": "johndoe",
      "profilePicture": "https://cdn.gamilit.com/avatars/johndoe.jpg",
      "level": 15,
      "mutualFriends": 3,
      "friendStatus": "none"
    }
  ]
}
```

---

#### Step 2: Send Friend Request

**Request**:
```http
POST /api/friends/request
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "message": "Hey! Let's be friends and compete together!"
}
```

**Response**:
```json
{
  "requestId": "650e8400-e29b-41d4-a716-446655440002",
  "status": "pending",
  "createdAt": "2025-10-28T10:30:00Z"
}
```

**WebSocket Event (Recipient)**:
```javascript
// johndoe receives real-time notification
socket.on('notification:new', {
  id: "750e8400-e29b-41d4-a716-446655440003",
  type: "friend_request",
  title: "New friend request",
  message: "janedoe sent you a friend request",
  data: {
    requestId: "650e8400-e29b-41d4-a716-446655440002",
    userId: "550e8400-e29b-41d4-a716-446655440000",
    username: "janedoe",
    profilePicture: "https://cdn.gamilit.com/avatars/janedoe.jpg",
    message: "Hey! Let's be friends and compete together!"
  },
  status: "unread",
  createdAt: "2025-10-28T10:30:01Z"
});
```

---

#### Step 3: View Pending Requests (Recipient)

**Request**:
```http
GET /api/friends/requests/pending
Authorization: Bearer <johndoe-jwt-token>
```

**Response**:
```json
{
  "requests": [
    {
      "id": "650e8400-e29b-41d4-a716-446655440002",
      "from": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "janedoe",
        "profilePicture": "https://cdn.gamilit.com/avatars/janedoe.jpg"
      },
      "message": "Hey! Let's be friends and compete together!",
      "mutualFriends": 3,
      "createdAt": "2025-10-28T10:30:00Z"
    }
  ]
}
```

---

#### Step 4: Accept Friend Request

**Request**:
```http
POST /api/friends/accept/650e8400-e29b-41d4-a716-446655440002
Authorization: Bearer <johndoe-jwt-token>
```

**Response**:
```json
{
  "friend": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "janedoe",
    "profilePicture": "https://cdn.gamilit.com/avatars/janedoe.jpg"
  },
  "createdAt": "2025-10-28T10:35:00Z"
}
```

**WebSocket Events**:

Both users receive notifications:

```javascript
// janedoe (original sender) receives
socket.on('notification:new', {
  type: "friend_request_accepted",
  title: "Friend request accepted",
  message: "johndoe accepted your friend request"
});

// Both users receive activity
socket.on('activity:new', {
  id: "850e8400-e29b-41d4-a716-446655440004",
  type: "friend_added",
  user: {
    id: "550e8400-e29b-41d4-a716-446655440001",
    username: "johndoe"
  },
  data: {
    friendId: "550e8400-e29b-41d4-a716-446655440000",
    friendUsername: "janedoe"
  },
  likeCount: 0,
  createdAt: "2025-10-28T10:35:00Z"
});
```

---

#### Step 5: View Friend List

**Request**:
```http
GET /api/friends?page=1&limit=20
Authorization: Bearer <johndoe-jwt-token>
```

**Response**:
```json
{
  "friends": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "janedoe",
      "profilePicture": "https://cdn.gamilit.com/avatars/janedoe.jpg",
      "level": 18,
      "onlineStatus": "online",
      "lastSeen": "2025-10-28T10:35:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

---

### Example 2: Create Guild and Invite Members

#### Step 1: Create Guild

**Request**:
```http
POST /api/guilds
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Code Warriors",
  "description": "Guild for passionate developers who love to compete and collaborate",
  "logo": "https://cdn.gamilit.com/guild-logos/code-warriors.png",
  "privacy": "public"
}
```

**Response**:
```json
{
  "guild": {
    "id": "950e8400-e29b-41d4-a716-446655440005",
    "name": "Code Warriors",
    "description": "Guild for passionate developers who love to compete and collaborate",
    "logo": "https://cdn.gamilit.com/guild-logos/code-warriors.png",
    "privacy": "public",
    "owner": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "janedoe"
    },
    "memberCount": 1,
    "createdAt": "2025-10-28T11:00:00Z"
  }
}
```

---

#### Step 2: Invite Member

**Request**:
```http
POST /api/guilds/950e8400-e29b-41d4-a716-446655440005/invite
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "message": "Join our awesome guild!"
}
```

**Response**:
```http
HTTP/1.1 201 Created
```

**WebSocket Event (Invitee)**:
```javascript
socket.on('notification:new', {
  id: "a50e8400-e29b-41d4-a716-446655440006",
  type: "guild_invite",
  title: "Guild invitation",
  message: "janedoe invited you to join Code Warriors",
  data: {
    guildId: "950e8400-e29b-41d4-a716-446655440005",
    guildName: "Code Warriors",
    guildLogo: "https://cdn.gamilit.com/guild-logos/code-warriors.png",
    inviterUsername: "janedoe",
    message: "Join our awesome guild!"
  },
  status: "unread",
  createdAt: "2025-10-28T11:05:00Z"
});
```

---

#### Step 3: Accept Invitation

**Request**:
```http
POST /api/guilds/950e8400-e29b-41d4-a716-446655440005/join
Authorization: Bearer <johndoe-jwt-token>
Content-Type: application/json

{
  "invitationId": "a50e8400-e29b-41d4-a716-446655440006"
}
```

**Response**:
```http
HTTP/1.1 200 OK
```

**WebSocket Events (All Guild Members)**:
```javascript
socket.on('guild:member_joined', {
  guildId: "950e8400-e29b-41d4-a716-446655440005",
  member: {
    id: "550e8400-e29b-41d4-a716-446655440001",
    username: "johndoe",
    profilePicture: "https://cdn.gamilit.com/avatars/johndoe.jpg"
  }
});
```

---

#### Step 4: Create Guild Challenge

**Request**:
```http
POST /api/guilds/950e8400-e29b-41d4-a716-446655440005/challenges
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "100 Tasks Challenge",
  "description": "Complete 100 tasks together as a guild this week",
  "goal": {
    "type": "tasks_completed",
    "target": 100
  },
  "reward": {
    "xp": 1000,
    "coins": 500,
    "achievementId": "b50e8400-e29b-41d4-a716-446655440007"
  },
  "startDate": "2025-10-28T12:00:00Z",
  "endDate": "2025-11-04T12:00:00Z"
}
```

**Response**:
```http
HTTP/1.1 201 Created
```

**WebSocket Events (All Guild Members)**:
```javascript
socket.on('notification:new', {
  type: "guild_event",
  title: "New guild challenge",
  message: "100 Tasks Challenge started in Code Warriors"
});
```

---

#### Step 5: View Guild Leaderboard

**Request**:
```http
GET /api/guilds/950e8400-e29b-41d4-a716-446655440005/leaderboard?period=week
Authorization: Bearer <jwt-token>
```

**Response**:
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "janedoe",
        "profilePicture": "https://cdn.gamilit.com/avatars/janedoe.jpg"
      },
      "xp": 2500,
      "tasksCompleted": 45
    },
    {
      "rank": 2,
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "username": "johndoe",
        "profilePicture": "https://cdn.gamilit.com/avatars/johndoe.jpg"
      },
      "xp": 2100,
      "tasksCompleted": 38
    }
  ],
  "period": "week"
}
```

---

### Example 3: Daily Missions Flow

#### Step 1: Get Daily Missions

**Request**:
```http
GET /api/missions/daily
Authorization: Bearer <jwt-token>
```

**Response**:
```json
{
  "missions": [
    {
      "id": "c50e8400-e29b-41d4-a716-446655440008",
      "type": "daily",
      "title": "Complete 5 tasks today",
      "description": "Complete any 5 tasks to earn rewards",
      "difficulty": "easy",
      "progress": 0,
      "target": 5,
      "reward": {
        "xp": 100,
        "coins": 50
      },
      "status": "not_started",
      "expiresAt": "2025-10-29T00:00:00Z"
    },
    {
      "id": "c50e8400-e29b-41d4-a716-446655440009",
      "type": "daily",
      "title": "Send 3 kudos to friends",
      "description": "Spread positivity by sending kudos",
      "difficulty": "easy",
      "progress": 0,
      "target": 3,
      "reward": {
        "xp": 80,
        "coins": 40
      },
      "status": "not_started",
      "expiresAt": "2025-10-29T00:00:00Z"
    },
    {
      "id": "c50e8400-e29b-41d4-a716-446655440010",
      "type": "daily",
      "title": "Earn 500 XP today",
      "description": "Gain experience through activities",
      "difficulty": "medium",
      "progress": 0,
      "target": 500,
      "reward": {
        "xp": 200,
        "coins": 100
      },
      "status": "not_started",
      "expiresAt": "2025-10-29T00:00:00Z"
    }
  ],
  "nextRenewal": "2025-10-29T00:00:00Z"
}
```

---

#### Step 2: Mission Progress Updates (Automatic)

As user completes tasks, the mission progress updates automatically via backend event listeners:

**Internal Event**:
```javascript
// When user completes a task
eventBus.on('task:completed', async (taskData) => {
  // Update relevant mission progress
  await updateMissionProgress(taskData.userId, 'tasks_completed', 1);
});
```

**WebSocket Event**:
```javascript
socket.on('mission:progress_updated', {
  missionId: "c50e8400-e29b-41d4-a716-446655440008",
  progress: 3,
  target: 5,
  status: "in_progress"
});
```

---

#### Step 3: Mission Completion

**Automatic Completion** when progress reaches target:

**WebSocket Event**:
```javascript
socket.on('mission:completed', {
  missionId: "c50e8400-e29b-41d4-a716-446655440008",
  status: "completed",
  completedAt: "2025-10-28T15:30:00Z",
  rewards: {
    xp: 100,
    coins: 50
  }
});

socket.on('notification:new', {
  type: "mission",
  title: "Mission completed!",
  message: "You completed 'Complete 5 tasks today' and earned 100 XP + 50 coins"
});
```

---

#### Step 4: Mission Renewal (Automatic at Midnight)

**Cron Job Executes at 00:00 UTC**:

**WebSocket Event**:
```javascript
socket.on('mission:renewed', {
  type: "daily",
  missions: [
    {
      id: "d50e8400-e29b-41d4-a716-446655440011",
      title: "Complete 7 tasks today",
      difficulty: "easy",
      target: 7,
      reward: { xp: 120, coins: 60 }
    },
    {
      id: "d50e8400-e29b-41d4-a716-446655440012",
      title: "Add 1 new friend",
      difficulty: "easy",
      target: 1,
      reward: { xp: 100, coins: 50 }
    },
    {
      id: "d50e8400-e29b-41d4-a716-446655440013",
      title: "Complete 10 tasks",
      difficulty: "medium",
      target: 10,
      reward: { xp: 250, coins: 150 }
    }
  ]
});

socket.on('notification:new', {
  type: "mission",
  title: "New daily missions available!",
  message: "3 new daily missions are ready for you"
});
```

---

### Example 4: Activity Feed Interaction

#### Step 1: View Activity Feed

**Request**:
```http
GET /api/activities/feed?page=1&limit=20
Authorization: Bearer <jwt-token>
```

**Response**:
```json
{
  "activities": [
    {
      "id": "e50e8400-e29b-41d4-a716-446655440014",
      "type": "achievement_earned",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "username": "johndoe",
        "profilePicture": "https://cdn.gamilit.com/avatars/johndoe.jpg",
        "level": 15
      },
      "data": {
        "achievementId": "f50e8400-e29b-41d4-a716-446655440015",
        "achievementName": "Task Master",
        "achievementIcon": "https://cdn.gamilit.com/achievements/task-master.png",
        "achievementRarity": "rare"
      },
      "likeCount": 12,
      "isLiked": false,
      "createdAt": "2025-10-28T14:30:00Z"
    },
    {
      "id": "e50e8400-e29b-41d4-a716-446655440016",
      "type": "level_up",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "janedoe",
        "profilePicture": "https://cdn.gamilit.com/avatars/janedoe.jpg",
        "level": 20
      },
      "data": {
        "newLevel": 20,
        "previousLevel": 19
      },
      "likeCount": 25,
      "isLiked": true,
      "createdAt": "2025-10-28T13:15:00Z"
    }
  ],
  "total": 245,
  "page": 1,
  "hasMore": true
}
```

---

#### Step 2: Like Activity

**Request**:
```http
POST /api/activities/e50e8400-e29b-41d4-a716-446655440014/like
Authorization: Bearer <jwt-token>
```

**Response**:
```json
{
  "activityId": "e50e8400-e29b-41d4-a716-446655440014",
  "likeCount": 13,
  "isLiked": true
}
```

**WebSocket Event (Activity Owner)**:
```javascript
socket.on('activity:liked', {
  activityId: "e50e8400-e29b-41d4-a716-446655440014",
  likeCount: 13,
  user: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    username: "janedoe"
  }
});
```

---

#### Step 3: Real-time Activity Updates

**WebSocket Event (New Activity)**:
```javascript
socket.on('activity:new', {
  id: "e50e8400-e29b-41d4-a716-446655440017",
  type: "guild_challenge_completed",
  user: {
    id: "550e8400-e29b-41d4-a716-446655440001",
    username: "johndoe"
  },
  data: {
    guildName: "Code Warriors",
    challengeName: "100 Tasks Challenge",
    reward: {
      xp: 1000,
      coins: 500
    }
  },
  likeCount: 0,
  isLiked: false,
  createdAt: "2025-10-28T16:00:00Z"
});
```

---

## Error Handling

### Standard Error Response Format

All API errors follow a consistent format:

```json
{
  "error": "ErrorType",
  "message": "Human-readable error message",
  "details": {
    // Optional: Additional error details
  },
  "timestamp": "2025-10-28T10:00:00Z",
  "path": "/api/endpoint"
}
```

---

### HTTP Status Codes

| Status Code | Description | Use Case |
|-------------|-------------|----------|
| 200 OK | Success | Successful GET, PUT request |
| 201 Created | Resource created | Successful POST request |
| 204 No Content | Success, no response body | Successful DELETE request |
| 400 Bad Request | Invalid input | Validation error, malformed request |
| 401 Unauthorized | Authentication required | Missing or invalid JWT token |
| 403 Forbidden | Insufficient permissions | User lacks required role/permissions |
| 404 Not Found | Resource not found | Entity doesn't exist |
| 409 Conflict | Resource conflict | Duplicate entry, constraint violation |
| 429 Too Many Requests | Rate limit exceeded | User exceeded rate limit |
| 500 Internal Server Error | Server error | Unexpected error on server |
| 503 Service Unavailable | Service temporarily unavailable | Maintenance, database down |

---

### Common Error Examples

#### 400 Bad Request - Validation Error

```json
{
  "error": "ValidationError",
  "message": "Invalid input data",
  "details": {
    "fields": {
      "name": "Guild name must be between 3 and 50 characters",
      "privacy": "Privacy must be 'public' or 'private'"
    }
  },
  "timestamp": "2025-10-28T10:00:00Z",
  "path": "/api/guilds"
}
```

---

#### 401 Unauthorized - Missing Token

```json
{
  "error": "Unauthorized",
  "message": "Authentication required. Please provide a valid JWT token.",
  "timestamp": "2025-10-28T10:00:00Z",
  "path": "/api/friends"
}
```

---

#### 403 Forbidden - Insufficient Permissions

```json
{
  "error": "Forbidden",
  "message": "You don't have permission to delete this guild. Only the guild owner can delete it.",
  "timestamp": "2025-10-28T10:00:00Z",
  "path": "/api/guilds/950e8400-e29b-41d4-a716-446655440005"
}
```

---

#### 404 Not Found - Resource Not Found

```json
{
  "error": "NotFound",
  "message": "Guild not found with ID: 950e8400-e29b-41d4-a716-446655440005",
  "timestamp": "2025-10-28T10:00:00Z",
  "path": "/api/guilds/950e8400-e29b-41d4-a716-446655440005"
}
```

---

#### 409 Conflict - Duplicate Entry

```json
{
  "error": "Conflict",
  "message": "A guild with the name 'Code Warriors' already exists. Please choose a different name.",
  "timestamp": "2025-10-28T10:00:00Z",
  "path": "/api/guilds"
}
```

---

#### 429 Too Many Requests - Rate Limit Exceeded

```json
{
  "error": "TooManyRequests",
  "message": "Rate limit exceeded. Please try again in 45 seconds.",
  "retryAfter": 45,
  "timestamp": "2025-10-28T10:00:00Z",
  "path": "/api/friends/request"
}
```

---

#### 500 Internal Server Error

```json
{
  "error": "InternalServerError",
  "message": "An unexpected error occurred. Please try again later.",
  "errorId": "err_a1b2c3d4",
  "timestamp": "2025-10-28T10:00:00Z",
  "path": "/api/guilds"
}
```

**Note**: `errorId` can be used to track the error in server logs.

---

## Security

### Authentication

- **Method**: JWT (JSON Web Token)
- **Header**: `Authorization: Bearer <token>`
- **Token Expiration**: 24 hours
- **Refresh Token**: 30 days

### Authorization

- **Role-Based Access Control (RBAC)**: Guild owner, admin, member roles
- **Permission Checks**: Enforced at API level
- **User Context**: JWT payload contains user ID and roles

### Data Privacy

- **Private Guilds**: Content only visible to members
- **Activity Privacy**: User-configurable privacy settings
- **Friend Visibility**: Respects privacy preferences

### Input Validation

- **Request Body**: Validated against schemas
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: Output encoding, Content Security Policy

### WebSocket Security

- **Authentication**: JWT token required for connection
- **Authorization**: Channel subscriptions validated
- **Rate Limiting**: Applied to prevent abuse

---

## Performance Optimization

### Caching Strategy

- **Redis Cache**: Activity feed, friend lists (5-minute TTL)
- **Cache Invalidation**: On write operations
- **Cache Keys**: `activities:feed:{userId}:page:{page}`

### Database Optimization

- **Indexes**: On frequently queried fields
- **Connection Pooling**: Max 20 connections
- **Query Optimization**: Avoid N+1 queries

### Pagination

- **Default Page Size**: 20
- **Max Page Size**: 100
- **Cursor-Based Pagination**: For activity feed (future)

---

## Monitoring and Logging

### Metrics

- **API Response Time**: P50, P95, P99 latency
- **Error Rate**: 4xx and 5xx errors per endpoint
- **WebSocket Connections**: Active connections count
- **Cron Job Success Rate**: Daily/weekly mission renewal

### Logging

- **Request Logs**: All API requests with user ID
- **Error Logs**: Stack traces with context
- **Audit Logs**: Sensitive operations (guild deletion, role changes)

---

## Changelog

### Version 1.0 (2025-10-28)

- Initial API specification
- 43 REST endpoints documented
- WebSocket protocol defined
- Cron jobs specified
- Rate limiting configured

---

## Support

For API support or questions, contact:
- **Technical Support**: tech-support@gamilit.com
- **API Documentation**: https://docs.gamilit.com/api/social
- **Status Page**: https://status.gamilit.com

---

**Document Version**: 1.0
**Last Updated**: 2025-10-28
**Maintained By**: Backend Team - EPIC-008
