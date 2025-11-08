# Social Features API - Notifications System

**Proyecto:** Gamilit Platform
**API:** Social Features
**Funcionalidad:** Notifications & Alerts
**Archivo original:** SOCIAL-FEATURES-API.md
**Version:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Overview

Real-time notification system using WebSocket (Socket.IO) to deliver instant notifications for achievements, friend requests, guild invitations, mission completions, and system events.

**Total Endpoints:** 6

---

## Endpoints

### 4.1. Get Notification History

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

### 4.2. Mark Notification as Read

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

### 4.3. Mark All Notifications as Read

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

### 4.4. Delete Notification

**Endpoint**: `DELETE /api/notifications/:notificationId`

**Description**: Delete a notification.

**Authentication**: Required (JWT)

**Path Parameters**:
- `notificationId` (uuid): Notification ID

**Response**: 204 No Content

---

### 4.5. Get Notification Preferences

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

### 4.6. Update Notification Preferences

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
