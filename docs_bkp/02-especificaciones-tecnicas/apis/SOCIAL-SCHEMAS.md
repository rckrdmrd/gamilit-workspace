# Social Features API - Schemas & Technical Documentation

**Proyecto:** Gamilit Platform
**API:** Social Features
**Funcionalidad:** Data Schemas, Error Handling, Security & Performance
**Archivo original:** SOCIAL-FEATURES-API.md
**Version:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Overview

Technical documentation covering data schemas, database models, error handling patterns, security measures, rate limiting, and performance optimization strategies for the Social Features API.

---

## Data Schemas

### Friend Request Schema

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

### Friendship Schema

```typescript
interface Friendship {
  id: string; // UUID
  userId: string; // UUID
  friendId: string; // UUID
  status: 'accepted' | 'pending' | 'blocked';
  createdAt: Date;
  lastInteraction?: Date;
  mutualFriendsCount?: number;
}
```

---

### Guild Schema

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

### Guild Member Schema

```typescript
interface GuildMember {
  id: string; // UUID
  guildId: string; // UUID
  userId: string; // UUID
  role: 'owner' | 'admin' | 'member';
  contributionXP: number;
  joinedAt: Date;
}
```

---

### Guild Challenge Schema

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

### Mission Schema

```typescript
interface Mission {
  id: string; // UUID
  userId: string; // UUID
  type: 'daily' | 'weekly' | 'special';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  target: number;
  progress: number;
  reward: {
    xp: number;
    coins: number;
    achievementId?: string; // UUID (optional)
  };
  status: 'not_started' | 'in_progress' | 'completed' | 'expired' | 'archived';
  eventName?: string;
  startedAt?: Date;
  completedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Notification Schema

```typescript
interface Notification {
  id: string; // UUID
  userId: string; // UUID
  type: 'achievement' | 'friend_request' | 'guild_invite' | 'guild_event' | 'mission' | 'system';
  title: string;
  message: string;
  data: Record<string, any>;
  status: 'unread' | 'read';
  createdAt: Date;
  readAt?: Date;
}
```

---

### Notification Preferences Schema

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
    start: string; // "HH:MM"
    end: string; // "HH:MM"
  };
  updatedAt: Date;
}
```

---

### Activity Schema

```typescript
interface Activity {
  id: string; // UUID
  userId: string; // UUID
  type: 'achievement_earned' | 'mission_completed' | 'friend_added' | 'guild_joined' | 'level_up' | 'guild_challenge_completed';
  data: Record<string, any>;
  likeCount: number;
  createdAt: Date;
}
```

---

### Activity Like Schema

```typescript
interface ActivityLike {
  id: string; // UUID
  activityId: string; // UUID
  userId: string; // UUID
  createdAt: Date;
}
```

---

## Database Relationships

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

## Database Indexes

### Performance Indexes

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

---

#### Delete Endpoints (DELETE)

**Limit**: 10 requests per minute

**Applies to**:
- `DELETE /api/friends/:friendId`
- `DELETE /api/guilds/:guildId`
- `DELETE /api/guilds/:guildId/members/:userId`
- `DELETE /api/notifications/:notificationId`
- All other DELETE endpoints

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
  standardHeaders: true,
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
