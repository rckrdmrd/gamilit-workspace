# WebSocket API Documentation

## Overview

The backend provides real-time communication via WebSocket using Socket.IO 4.6+. This enables instant notifications for achievements, missions, leaderboard updates, and more.

## Connection

### Endpoint
```
ws://localhost:3006/socket.io/
```

### Configuration
- **Transports**: `websocket`, `polling` (fallback)
- **Path**: `/socket.io/`
- **CORS**: Configured for `localhost:3005` and `localhost:5173`

### Authentication

WebSocket connections require JWT authentication. Provide the token via:

**Option 1: Auth object (recommended)**
```javascript
const socket = io('http://localhost:3006', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

**Option 2: Query parameter**
```javascript
const socket = io('http://localhost:3006', {
  query: {
    token: 'your-jwt-token'
  }
});
```

### Connection Events

#### `authenticated`
Emitted when connection is successfully authenticated.

**Payload:**
```typescript
{
  success: true,
  userId: string,
  email: string,
  socketId: string
}
```

**Example:**
```javascript
socket.on('authenticated', (data) => {
  console.log(`Connected as ${data.email}`);
});
```

#### `error`
Emitted when an error occurs.

**Payload:**
```typescript
{
  message: string
}
```

---

## Event Types

### Notification Events

#### `notification:new`
A new notification has been created for the user.

**Payload:**
```typescript
{
  notification: {
    id: string,
    userId: string,
    type: 'achievement' | 'mission' | 'reward' | 'system' | 'social' | 'educational',
    title: string,
    message: string,
    data: object | null,
    read: boolean,
    createdAt: string,
    updatedAt: string
  },
  timestamp: string
}
```

**Client Example:**
```javascript
socket.on('notification:new', (data) => {
  // Display notification to user
  showNotification(data.notification);
});
```

---

#### `notification:unread_count`
The user's unread notification count has been updated.

**Payload:**
```typescript
{
  unreadCount: number,
  timestamp: string
}
```

**Client Example:**
```javascript
socket.on('notification:unread_count', (data) => {
  // Update badge count
  updateBadge(data.unreadCount);
});
```

---

#### `notification:deleted`
A notification has been deleted.

**Payload:**
```typescript
{
  notificationId: string,
  timestamp: string
}
```

---

#### `notification:mark_read` (Client → Server)
Mark a notification as read.

**Emit:**
```javascript
socket.emit('notification:mark_read', {
  notificationId: 'uuid-here'
});
```

**Response Event:** `notification:read`
```typescript
{
  notificationId: string,
  success: boolean
}
```

---

### Gamification Events

#### `achievement:unlocked`
User unlocked a new achievement.

**Payload:**
```typescript
{
  achievementId: string,
  title: string,
  description: string,
  icon: string,
  timestamp: string
}
```

**Client Example:**
```javascript
socket.on('achievement:unlocked', (achievement) => {
  showAchievementModal(achievement);
});
```

---

#### `rank:updated`
User's rank has changed.

**Payload:**
```typescript
{
  newRank: string,        // e.g., "Explorador", "Guerrero"
  oldRank: string,
  xpRequired?: number,    // XP needed for next rank
  timestamp: string
}
```

---

#### `xp:gained`
User gained experience points.

**Payload:**
```typescript
{
  amount: number,         // XP gained
  source: string,         // e.g., "exercise_completed", "mission_done"
  totalXp: number,        // User's total XP
  timestamp: string
}
```

---

### Mission Events

#### `mission:completed`
User completed a mission.

**Payload:**
```typescript
{
  missionId: string,
  title: string,
  xpReward: number,
  pointsReward: number,
  timestamp: string
}
```

---

#### `mission:progress`
User made progress on a mission.

**Payload:**
```typescript
{
  missionId: string,
  currentProgress: number,    // e.g., 3
  targetProgress: number,     // e.g., 5
  percentage: number,         // e.g., 60
  timestamp: string
}
```

---

### Leaderboard Events

#### `leaderboard:updated`
Leaderboard has been updated (broadcast to all users).

**Payload:**
```typescript
{
  leaderboard: Array<{
    userId: string,
    displayName: string,
    totalXp: number,
    rank: string,
    position: number
  }>,
  timestamp: string
}
```

---

## Server-Side Usage

### Emitting to Specific Users

```typescript
import { WebSocketService } from './modules/websocket/websocket.service';

@Injectable()
export class SomeService {
  constructor(private readonly webSocketService: WebSocketService) {}

  async someMethod() {
    // Send notification to one user
    this.webSocketService.emitNotificationToUser(userId, notification);

    // Send XP gained event
    this.webSocketService.emitXpGained(userId, {
      amount: 100,
      source: 'exercise_completed',
      totalXp: 1500
    });

    // Broadcast to all connected users
    this.webSocketService.broadcastLeaderboardUpdate(leaderboard);
  }
}
```

### WebSocketService Methods

| Method | Description |
|--------|-------------|
| `emitNotificationToUser(userId, notification)` | Send notification to user |
| `emitNotificationToUsers(userIds[], notification)` | Send to multiple users |
| `emitUnreadCountUpdate(userId, count)` | Update unread count |
| `emitNotificationDeleted(userId, notificationId)` | Notify deletion |
| `emitAchievementUnlocked(userId, achievement)` | Achievement unlocked |
| `emitRankUpdated(userId, rankData)` | Rank change |
| `emitXpGained(userId, xpData)` | XP gained |
| `emitMissionCompleted(userId, missionData)` | Mission completed |
| `emitMissionProgress(userId, progressData)` | Mission progress |
| `broadcastLeaderboardUpdate(leaderboard)` | Broadcast to all |
| `isUserConnected(userId)` | Check if user is online |
| `getConnectedUsersCount()` | Get total connected users |
| `getUserSocketCount(userId)` | Get user's device count |

---

## Client Integration Examples

### React/TypeScript Client

```typescript
import { io, Socket } from 'socket.io-client';

class WebSocketClient {
  private socket: Socket;

  connect(token: string) {
    this.socket = io('http://localhost:3006', {
      auth: { token }
    });

    this.socket.on('authenticated', (data) => {
      console.log('Connected:', data);
    });

    this.socket.on('notification:new', (data) => {
      // Handle new notification
      this.showNotification(data.notification);
    });

    this.socket.on('achievement:unlocked', (achievement) => {
      // Show achievement animation
      this.showAchievement(achievement);
    });

    this.socket.on('xp:gained', (xpData) => {
      // Update XP display with animation
      this.animateXpGain(xpData.amount);
    });
  }

  markAsRead(notificationId: string) {
    this.socket.emit('notification:mark_read', { notificationId });
  }

  disconnect() {
    this.socket.disconnect();
  }
}
```

### Vue Client

```javascript
export default {
  data() {
    return {
      socket: null,
      unreadCount: 0
    }
  },
  mounted() {
    this.socket = io('http://localhost:3006', {
      auth: { token: this.$store.state.token }
    });

    this.socket.on('notification:new', (data) => {
      this.$store.commit('addNotification', data.notification);
    });

    this.socket.on('notification:unread_count', (data) => {
      this.unreadCount = data.unreadCount;
    });
  },
  beforeUnmount() {
    this.socket?.disconnect();
  }
}
```

---

## Room Architecture

Users are automatically joined to their personal room: `user:${userId}`

This enables:
- **Targeted messaging**: Messages sent only to specific users
- **Multi-device support**: All user devices receive the same events
- **Efficient broadcasting**: No need to iterate through all sockets

---

## Error Handling

### Authentication Failures

If authentication fails:
1. Socket connection is rejected
2. Client receives `connect_error` event
3. Socket automatically disconnects

```javascript
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error.message);
  // Redirect to login or refresh token
});
```

### General Errors

```javascript
socket.on('error', (error) => {
  console.error('WebSocket error:', error.message);
  // Handle error (show toast, retry, etc.)
});
```

---

## Best Practices

1. **Reconnection**: Socket.IO handles reconnection automatically
2. **Token Refresh**: Update token when refreshed:
   ```javascript
   socket.auth.token = newToken;
   socket.disconnect().connect();
   ```
3. **Cleanup**: Always disconnect on component unmount
4. **Event Naming**: Follow pattern `category:action` (e.g., `notification:new`)
5. **Payload Size**: Keep payloads small for performance

---

## Testing WebSocket

### Using Postman/Insomnia
1. Create WebSocket request to `ws://localhost:3006/socket.io/`
2. Add query param: `?token=your-jwt-token`
3. Listen for events
4. Emit test events

### Using Browser Console
```javascript
const socket = io('http://localhost:3006', {
  auth: { token: 'your-jwt-token' }
});

socket.on('authenticated', console.log);
socket.on('notification:new', console.log);
```

---

## Performance Considerations

- **Connected Users Tracking**: Uses efficient Map data structure
- **Room-based Messaging**: O(1) lookup for user rooms
- **Multi-device Support**: Set data structure prevents duplicates
- **Event Throttling**: Consider throttling high-frequency events (XP updates)

---

## Security

- **JWT Verification**: All connections authenticated via JWT
- **User Isolation**: Users only receive their own events via rooms
- **CORS Configuration**: Restricts origins in production
- **Token Expiration**: Tokens expire per JWT configuration (7 days)

---

## Migration from Express

Changes from original Express implementation:
1. ✅ `socket.auth.middleware` → `WsJwtGuard`
2. ✅ Manual socket.io setup → NestJS `@WebSocketGateway` decorator
3. ✅ Direct socket.io methods → `WebSocketService` abstraction
4. ✅ Event names unchanged → Full backward compatibility
5. ✅ Room logic preserved → Same `user:${userId}` pattern

---

## Troubleshooting

### Connection Rejected
- Verify JWT token is valid and not expired
- Check token is passed correctly (auth or query)
- Ensure CORS origin is allowed

### Events Not Received
- Verify user is authenticated (check `authenticated` event)
- Check if user's room was joined: `user:${userId}`
- Verify WebSocketService is injected correctly

### Multiple Connections
- This is normal for multi-device/multi-tab scenarios
- Each device gets its own socket but same room
- Events are delivered to all user's sockets

---

**Last Updated**: Phase 1.1 - WebSocket Implementation
**Socket.IO Version**: 4.6+
**NestJS Version**: 11.x
