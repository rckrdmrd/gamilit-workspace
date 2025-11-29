# WebSocket Leaderboard Event Flow - Technical Documentation

## Complete Event Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND (NestJS)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. User Completes Exercise                                         │
│     ↓                                                                │
│  2. UserStatsService.updateUserXP(userId, xpAmount)                │
│     ↓                                                                │
│  3. [TODO] Call WebSocketService.broadcastLeaderboardUpdate()      │
│     ↓                                                                │
│  4. LeaderboardService.getGlobalLeaderboard(100, 0)                │
│     │                                                                │
│     ├─ Query UserStats (top 100 by XP)                             │
│     ├─ Join with Profile (names, avatars)                          │
│     ├─ Build leaderboard entries array                             │
│     └─ Return { type, entries, totalEntries, lastUpdated }         │
│     ↓                                                                │
│  5. WebSocketService.broadcastLeaderboardUpdate(entries)           │
│     ↓                                                                │
│  6. NotificationsGateway.broadcast()                                │
│     │                                                                │
│     └─ server.emit('leaderboard:updated', {                        │
│          leaderboard: entries,                                      │
│          timestamp: new Date()                                      │
│        })                                                            │
│                                                                      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               │ Socket.IO Event
                               │ Event: 'leaderboard:updated'
                               │
┌──────────────────────────────┴──────────────────────────────────────┐
│                         FRONTEND (React)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  7. useLeaderboardWebSocket() receives event                        │
│     ↓                                                                │
│  8. socket.on('leaderboard:updated', handleLeaderboardUpdate)      │
│     ↓                                                                │
│  9. leaderboardStore.updateFromWebSocket(entries)                  │
│     │                                                                │
│     ├─ Validate entries (not empty)                                │
│     ├─ Merge with current state (preserve type, period)            │
│     ├─ Update lastUpdated timestamp                                │
│     ├─ Calculate userRank from entries                             │
│     └─ set({ currentLeaderboard: updatedLeaderboard })            │
│     ↓                                                                │
│  10. Zustand triggers re-render                                     │
│     ↓                                                                │
│  11. LeaderboardPage updates:                                       │
│     ├─ Shows green "En vivo" indicator                             │
│     ├─ Displays "Actualizado en tiempo real" banner (3 seconds)   │
│     ├─ Updates timestamp                                           │
│     └─ Re-renders leaderboard table with new positions             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## WebSocket Connection Lifecycle

### 1. Connection Establishment

```typescript
// Frontend: useLeaderboardWebSocket.ts
const socket = io(WEBSOCKET_URL, {
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  auth: { token: JWT_TOKEN }
});

// Backend: notifications.gateway.ts
@UseGuards(WsJwtGuard)
async handleConnection(client: AuthenticatedSocket) {
  // Validate token
  // Join user to personal room: `user:${userId}`
  // Emit authenticated event
}
```

### 2. Event Subscription

```typescript
// Frontend subscribes to leaderboard updates
socket.on('leaderboard:updated', (data: LeaderboardUpdatePayload) => {
  console.log('📊 Leaderboard update:', data);
  leaderboardStore.updateFromWebSocket(data.leaderboard);
});
```

### 3. Event Broadcast (Backend - TO IMPLEMENT)

```typescript
// Option A: After XP update
async updateUserXP(userId: string, xpAmount: number) {
  // ... update XP logic

  // Broadcast leaderboard update
  await this.broadcastLeaderboardUpdate();
}

// Option B: Scheduled task
@Cron(CronExpression.EVERY_MINUTE)
async broadcastLeaderboardUpdates() {
  const leaderboard = await this.leaderboardService.getGlobalLeaderboard(100, 0);
  this.websocketService.broadcastLeaderboardUpdate(leaderboard.entries);
}
```

### 4. Store Update

```typescript
// Frontend: leaderboardsStore.ts
updateFromWebSocket: (entries: any[]) => {
  if (!entries || entries.length === 0) return;

  const updatedLeaderboard = {
    ...currentLeaderboard,
    entries,
    totalParticipants: entries.length,
    lastUpdated: new Date(),
    userRank: entries.find(e => e.isCurrentUser)?.rank
  };

  set({ currentLeaderboard: updatedLeaderboard });
}
```

### 5. UI Update

```typescript
// Frontend: LeaderboardPage.tsx
useEffect(() => {
  if (isWebSocketConnected) {
    setShowRealtimeIndicator(true);
    const timer = setTimeout(() => setShowRealtimeIndicator(false), 3000);
    return () => clearTimeout(timer);
  }
}, [currentLeaderboard.lastUpdated, isWebSocketConnected]);
```

---

## Event Payload Structures

### Leaderboard Update Event

**Event Name:** `leaderboard:updated`

**Payload:**
```typescript
{
  leaderboard: [
    {
      rank: 1,
      userId: "uuid",
      username: "Juan Pérez",
      avatar: "https://...",
      rankBadge: "Nacom",
      score: 15000,
      xp: 15000,
      mlCoins: 5000,
      change: 2,
      changeType: "up",
      isCurrentUser: false
    },
    // ... more entries
  ],
  timestamp: "2025-11-28T18:30:00.000Z"
}
```

### Connection Events

**Event:** `authenticated`
```typescript
{
  success: true,
  userId: "uuid",
  email: "user@example.com",
  socketId: "socket-id"
}
```

**Event:** `error`
```typescript
{
  message: "Error description"
}
```

---

## Error Handling

### Frontend Error Scenarios

1. **No Token Available**
   - Skip connection
   - Log info message
   - Graceful degradation (manual refresh still works)

2. **Token Expired**
   - Attempt automatic refresh
   - Retry connection with new token
   - If refresh fails, skip connection

3. **Connection Error**
   - Auto-retry with exponential backoff
   - Max 5 reconnection attempts
   - Log errors to console

4. **Invalid Event Data**
   - Validate entries array not empty
   - Warn in console
   - Don't update store

### Backend Error Scenarios

1. **Broadcast Failure**
   - Log error
   - Continue normal operation
   - Don't block main flow

2. **Leaderboard Query Error**
   - Catch exception
   - Skip broadcast
   - Log error

---

## Performance Considerations

### Frontend

- **Connection Pooling:** Single WebSocket connection shared across app
- **Selective Updates:** Only update visible leaderboard
- **Debounced Re-renders:** React batches state updates
- **Memory Management:** Clean up on unmount

### Backend (Recommendations)

- **Broadcast Throttling:** Max 1 broadcast per 10-30 seconds
- **Caching:** Use existing 60-second cache for leaderboard data
- **Conditional Broadcast:** Only if users are connected
- **Room-based:** Future - send updates only to users on leaderboard page

---

## Testing Checklist

### Manual Testing

- [ ] Open LeaderboardPage in Browser 1
- [ ] Open LeaderboardPage in Browser 2
- [ ] Complete exercise in Browser 1
- [ ] Verify Browser 2 updates automatically
- [ ] Check "En vivo" indicator appears
- [ ] Check update banner shows for 3 seconds
- [ ] Verify timestamp updates
- [ ] Test with 0 connected users (no errors)
- [ ] Test with network disconnect/reconnect

### Automated Testing

```typescript
describe('Leaderboard WebSocket', () => {
  it('should connect on mount', () => {
    // Test WebSocket connection
  });

  it('should update store on leaderboard:updated', () => {
    // Mock socket event
    // Verify store updated
  });

  it('should handle disconnection gracefully', () => {
    // Disconnect socket
    // Verify no errors
  });

  it('should show visual indicators', () => {
    // Render component
    // Verify indicators appear
  });
});
```

---

## Monitoring & Debugging

### Console Logs

The implementation includes comprehensive logging:

```
✅ Leaderboard WebSocket connected: socket-id
✅ Leaderboard WebSocket authenticated
📊 Leaderboard update received via WebSocket: { entriesCount: 100, timestamp: '...' }
🔄 Updating leaderboard from WebSocket: 100 entries
❌ Leaderboard WebSocket disconnected: transport close
```

### Chrome DevTools

1. Open DevTools → Network → WS tab
2. Select socket.io connection
3. View Messages tab for events
4. Monitor connection status

### Backend Logs

```typescript
// In WebSocketService
this.logger.debug(`Broadcasted leaderboard:updated to ${connectedUsers} users`);
```

---

## Security Considerations

1. **Authentication Required:** All WebSocket connections require valid JWT
2. **Token Validation:** Backend validates token on connection
3. **Auto-refresh:** Frontend refreshes expired tokens automatically
4. **Rate Limiting:** Backend can implement rate limits on broadcasts
5. **Data Validation:** Frontend validates event payloads

---

## Future Enhancements

1. **Room-based Updates:**
   ```typescript
   // Join specific leaderboard rooms
   socket.emit('join_leaderboard', { type: 'global' });
   socket.emit('leave_leaderboard', { type: 'school' });
   ```

2. **Differential Updates:**
   ```typescript
   // Send only changed positions
   {
     type: 'position_change',
     changes: [
       { userId: 'uuid', oldRank: 5, newRank: 3 }
     ]
   }
   ```

3. **Personal Notifications:**
   ```typescript
   // Notify user of rank changes
   socket.emit('rank_changed', {
     userId: 'uuid',
     oldRank: 10,
     newRank: 7,
     pointsGained: 500
   });
   ```

4. **Compression:**
   - Use MessagePack for payload compression
   - Reduce bandwidth for large leaderboards

---

## References

- **Backend Gateway:** `/apps/backend/src/modules/websocket/notifications.gateway.ts`
- **Backend Service:** `/apps/backend/src/modules/websocket/websocket.service.ts`
- **Backend Types:** `/apps/backend/src/modules/websocket/types/websocket.types.ts`
- **Frontend Hook:** `/apps/frontend/src/features/gamification/social/hooks/useLeaderboardWebSocket.ts`
- **Frontend Store:** `/apps/frontend/src/features/gamification/social/store/leaderboardsStore.ts`
- **Frontend Page:** `/apps/frontend/src/apps/student/pages/LeaderboardPage.tsx`

---

**Last Updated:** 2025-11-28
**Implementation Status:** Frontend Complete, Backend Pending Integration
