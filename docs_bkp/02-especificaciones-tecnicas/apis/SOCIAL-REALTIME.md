# Social Features API - Real-time & Automation

**Proyecto:** Gamilit Platform
**API:** Social Features
**Funcionalidad:** WebSocket Protocol & Cron Jobs
**Archivo original:** SOCIAL-FEATURES-API.md
**Version:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Overview

Real-time bidirectional communication using Socket.IO and automated mission renewal via cron jobs.

**Components:**
- WebSocket Protocol (Socket.IO v4.x on port 3001)
- Daily Mission Renewal (cron: 0 0 * * *)
- Weekly Mission Renewal (cron: 0 0 * * 1)

---

## WebSocket Protocol

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

## Events: Client → Server

### 1. Authenticate

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

### 2. Subscribe to User Channel

**Event**: `subscribe:user`

**Description**: Subscribe to user-specific notifications and updates (automatic after authentication).

**Note**: This is handled automatically by the server after successful authentication. No client action required.

---

### 3. Subscribe to Guild Channel

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

### 4. Unsubscribe from Guild Channel

**Event**: `unsubscribe:guild`

**Description**: Unsubscribe from guild events.

**Payload**:
```javascript
{
  guildId: "uuid"
}
```

---

## Events: Server → Client

### 1. Notification:New

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

### 2. Notification:Read

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

### 3. Notification:Delete

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

### 4. Activity:New

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

### 5. Activity:Liked

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

### 6. Friend:Online

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

### 7. Friend:Offline

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

### 8. Guild:MemberJoined

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

### 9. Guild:ChallengeUpdated

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

### 10. Mission:Renewed

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

## Connection Lifecycle Events

### Connect

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

### Disconnect

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

### Reconnect

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

### Error

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

## Authentication Flow

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

## Scaling with Redis Adapter

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

## Rate Limiting

WebSocket connections and events are rate-limited:

| Action | Limit | Window |
|--------|-------|--------|
| Connections per user | 5 | Concurrent |
| Events emitted per user | 100 | 1 minute |
| Authentication attempts | 5 | 5 minutes |

---

## Error Handling

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

## Daily Mission Renewal

### Schedule
- **Cron Expression**: `0 0 * * *`
- **Frequency**: Every day at 00:00 (midnight)
- **Timezone**: UTC (configurable via `TZ` environment variable)

### Functionality

- Archives current daily missions
- Generates 3 new daily missions per user
- Difficulty distribution: 60% Easy, 30% Medium, 10% Hard
- Sends WebSocket notification to online users

### Configuration

```javascript
// Cron job registration
cron.schedule('0 0 * * *', renewDailyMissions, {
  scheduled: true,
  timezone: process.env.TZ || 'UTC'
});
```

### Monitoring Metrics

- **Execution Time**: Average time to complete renewal
- **Users Processed**: Total users processed
- **Success Rate**: Percentage of successful renewals
- **Error Count**: Number of errors encountered

---

## Weekly Mission Renewal

### Schedule
- **Cron Expression**: `0 0 * * 1`
- **Frequency**: Every Monday at 00:00 (midnight)
- **Timezone**: UTC (configurable via `TZ` environment variable)

### Functionality

- Archives current weekly missions
- Generates 5 new weekly missions per user
- Difficulty distribution: 40% Easy, 40% Medium, 20% Hard
- Sends WebSocket notification to online users

### Configuration

```javascript
// Cron job registration
cron.schedule('0 0 * * 1', renewWeeklyMissions, {
  scheduled: true,
  timezone: process.env.TZ || 'UTC'
});
```

---

## Distributed Locking

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

## Error Handling and Retries

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

## Monitoring and Alerts

### Metrics Collected

- **Execution Duration**: Time taken to complete renewal
- **Users Processed**: Total users processed per run
- **Success/Failure Rate**: Percentage of successful renewals
- **Lock Acquisition Failures**: Times when lock couldn't be acquired
- **Mission Generation Errors**: Errors during mission creation

### Alert Conditions

- Execution time > 10 minutes
- Success rate < 95%
- Lock acquisition failure
- More than 5 mission generation errors

---

## Manual Execution (Admin)

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
