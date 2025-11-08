# Social Features API - Overview

**Proyecto:** Gamilit Platform
**API:** Social Features
**Version:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## General Information

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

---

## Architecture

- **Protocol**: REST + WebSocket (Socket.IO)
- **Data Format**: JSON
- **WebSocket Port**: 3001
- **Authentication**: JWT Bearer Token
- **Real-time**: Socket.IO for notifications and activities
- **Batch Processing**: Cron jobs for mission renewal

---

## Modular Documentation Structure

La documentacion completa de la Social Features API ha sido modularizada en los siguientes archivos:

### 1. Friends System
**Archivo:** `SOCIAL-FRIENDS.md`
- 11 endpoints
- Friend requests (send, accept, decline)
- Friend management (list, remove, details)
- User search and recommendations
- Friend activities

### 2. Guilds/Teams System
**Archivo:** `SOCIAL-GUILDS.md`
- 14 endpoints
- Guild CRUD operations
- Member management with roles (owner, admin, member)
- Guild challenges and achievements
- Guild leaderboards

### 3. Missions System
**Archivo:** `SOCIAL-MISSIONS.md`
- 8 endpoints
- Daily missions (3 per day)
- Weekly missions (5 per week)
- Special event missions
- Mission history and statistics
- Admin mission creation

### 4. Notifications System
**Archivo:** `SOCIAL-NOTIFICATIONS.md`
- 6 endpoints
- Real-time notification delivery
- Notification history and filtering
- Notification preferences (in-app, email, push)
- Quiet hours configuration

### 5. Activities Feed
**Archivo:** `SOCIAL-ACTIVITIES.md`
- 5 endpoints
- Personalized activity feed
- Activity likes and interactions
- User activity history
- Real-time activity updates

### 6. Real-time & Automation
**Archivo:** `SOCIAL-REALTIME.md`
- WebSocket Protocol (Socket.IO v4.x)
- Client and server event definitions
- Connection lifecycle management
- Cron jobs for mission renewal
- Distributed locking and error handling

### 7. Schemas & Technical Documentation
**Archivo:** `SOCIAL-SCHEMAS.md`
- TypeScript data schemas
- Database relationships and indexes
- Rate limiting configuration
- Error handling patterns
- Security and performance optimization
- Monitoring and logging

---

## Quick Reference

### Endpoints Summary

| Module | Endpoints | Description |
|--------|-----------|-------------|
| Friends | 11 | Friend requests, connections, search, recommendations |
| Guilds | 14 | Guild management, members, challenges, leaderboards |
| Missions | 8 | Daily/weekly/special missions, history, admin creation |
| Notifications | 6 | Notification history, preferences, management |
| Activities | 5 | Activity feed, likes, user activities |
| **Total** | **43** | Complete social features API |

---

## WebSocket Events Summary

### Client → Server Events
- `authenticate`: JWT authentication
- `subscribe:user`: Auto-subscribe to user notifications
- `subscribe:guild`: Subscribe to guild events
- `unsubscribe:guild`: Unsubscribe from guild

### Server → Client Events
- `notification:new`: New notification received
- `notification:read`: Notification marked as read
- `notification:delete`: Notification deleted
- `activity:new`: New friend/guild activity
- `activity:liked`: Someone liked your activity
- `friend:online`: Friend came online
- `friend:offline`: Friend went offline
- `guild:member_joined`: New guild member
- `guild:challenge_updated`: Guild challenge progress
- `mission:renewed`: Daily/weekly missions renewed

---

## Cron Jobs

### Daily Mission Renewal
- **Schedule**: `0 0 * * *` (midnight UTC)
- **Frequency**: Every day
- **Function**: Generates 3 new daily missions per user
- **Difficulty**: 60% Easy, 30% Medium, 10% Hard

### Weekly Mission Renewal
- **Schedule**: `0 0 * * 1` (Monday midnight UTC)
- **Frequency**: Every Monday
- **Function**: Generates 5 new weekly missions per user
- **Difficulty**: 40% Easy, 40% Medium, 20% Hard

---

## Rate Limiting

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Read (GET) | 100 requests | 1 minute |
| Write (POST/PUT) | 30 requests | 1 minute |
| Delete (DELETE) | 10 requests | 1 minute |
| Search | 20 requests | 1 minute |
| Friend Requests | 10 requests | 1 day |
| Guild Invitations | 20 requests/guild | 1 day |
| WebSocket Connections | 5 concurrent | per user |
| WebSocket Events | 100 events | 1 minute |

---

## Authentication

All endpoints require JWT authentication via Bearer token:

```http
Authorization: Bearer <jwt-token>
```

**Token Details:**
- **Expiration**: 24 hours
- **Refresh Token**: 30 days
- **Payload**: Contains user ID and roles

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "ErrorType",
  "message": "Human-readable error message",
  "details": {},
  "timestamp": "2025-10-28T10:00:00Z",
  "path": "/api/endpoint"
}
```

**HTTP Status Codes:**
- `200 OK`: Successful GET/PUT
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing/invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate entry
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## Performance & Caching

### Caching Strategy
- **Redis Cache**: Activity feed, friend lists
- **TTL**: 5 minutes
- **Cache Invalidation**: On write operations

### Database Optimization
- **Indexes**: On frequently queried fields
- **Connection Pooling**: Max 20 connections
- **Query Optimization**: Avoid N+1 queries

### Pagination
- **Default Page Size**: 20
- **Max Page Size**: 100

---

## Development Roadmap

### Current Status (v1.0)
- 43 REST endpoints implemented
- WebSocket real-time notifications
- Daily and weekly mission renewal
- Rate limiting configured

### Future Enhancements (v2.0)
- Push notifications (mobile)
- Email notifications
- Cursor-based pagination for activity feed
- Premium user rate limit bypass
- Advanced friend recommendations algorithm
- Guild alliance system

---

## Getting Started

### 1. Read Module Documentation
Start with the module you're implementing:
- Friends: `SOCIAL-FRIENDS.md`
- Guilds: `SOCIAL-GUILDS.md`
- Missions: `SOCIAL-MISSIONS.md`
- Notifications: `SOCIAL-NOTIFICATIONS.md`
- Activities: `SOCIAL-ACTIVITIES.md`

### 2. WebSocket Integration
Refer to `SOCIAL-REALTIME.md` for:
- WebSocket connection setup
- Event handling patterns
- Authentication flow

### 3. Technical Reference
Consult `SOCIAL-SCHEMAS.md` for:
- Data schemas and TypeScript interfaces
- Database indexes
- Rate limiting configuration
- Error handling patterns
- Security best practices

---

## API Examples

### Example 1: Send Friend Request
```http
POST /api/friends/request
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "userId": "uuid",
  "message": "Let's be friends!"
}
```

### Example 2: Create Guild
```http
POST /api/guilds
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Code Warriors",
  "description": "Guild for developers",
  "privacy": "public"
}
```

### Example 3: Get Daily Missions
```http
GET /api/missions/daily
Authorization: Bearer <jwt-token>
```

### Example 4: Get Notifications
```http
GET /api/notifications?status=unread&limit=20
Authorization: Bearer <jwt-token>
```

### Example 5: Get Activity Feed
```http
GET /api/activities/feed?page=1&limit=20
Authorization: Bearer <jwt-token>
```

---

## Support

For API support or questions, contact:
- **Technical Support**: tech-support@gamilit.com
- **API Documentation**: https://docs.gamilit.com/api/social
- **Status Page**: https://status.gamilit.com

---

## Related Documentation

- **Main API Spec (Original)**: `SOCIAL-FEATURES-API.md.backup`
- **Gamification API**: `GAMIFICATION-API.md`
- **User Management API**: `USER-API.md`
- **Task Management API**: `TASK-API.md`

---

**Document Version**: 2.0 (Modularizado)
**Last Updated**: 2025-11-01
**RFC**: RFC-0001 (Micro-microciclo 1-3)
