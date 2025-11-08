# Tipos Compartidos - Notifications

**Proyecto:** Gamilit Platform
**Módulo:** Tipos TypeScript Compartidos
**Categoría:** Notifications & Real-time Updates
**Archivo original:** SHARED-TYPES-LIBRARY.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Descripción

Este archivo contiene tipos para el sistema de notificaciones:
- **Notification**: Notificación del sistema

---

### 6.8 Notification Types

#### 6.8.1 Notification

**Description**: User notification entity

**TypeScript Definition**:
```typescript
enum NotificationType {
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  RANK_UP = 'rank_up',
  FRIEND_REQUEST = 'friend_request',
  GUILD_INVITATION = 'guild_invitation',
  MISSION_COMPLETED = 'mission_completed',
  LEVEL_UP = 'level_up',
  MESSAGE_RECEIVED = 'message_received',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  ML_COINS_EARNED = 'ml_coins_earned',
  STREAK_MILESTONE = 'streak_milestone',
  EXERCISE_FEEDBACK = 'exercise_feedback',
}

interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  read: boolean;
  created_at: Date;
  updated_at: Date;
}

interface NotificationData {
  achievement_id?: string;
  achievement_name?: string;
  achievement_icon?: string;
  rank?: string;
  previous_rank?: string;
  friend_id?: string;
  friend_name?: string;
  guild_id?: string;
  guild_name?: string;
  mission_id?: string;
  mission_name?: string;
  level?: number;
  coins_amount?: number;
  current_streak?: number;
  exercise_id?: string;
  reference_url?: string;
  [key: string]: any;
}
```

**Zod Schema**:
```typescript
const notificationTypeSchema = z.enum([
  'achievement_unlocked',
  'rank_up',
  'friend_request',
  'guild_invitation',
  'mission_completed',
  'level_up',
  'message_received',
  'system_announcement',
  'ml_coins_earned',
  'streak_milestone',
  'exercise_feedback'
]);

const notificationDataSchema = z.object({
  achievement_id: z.string().uuid().optional(),
  achievement_name: z.string().optional(),
  achievement_icon: z.string().optional(),
  rank: z.string().optional(),
  previous_rank: z.string().optional(),
  friend_id: z.string().uuid().optional(),
  friend_name: z.string().optional(),
  guild_id: z.string().uuid().optional(),
  guild_name: z.string().optional(),
  mission_id: z.string().uuid().optional(),
  mission_name: z.string().optional(),
  level: z.number().int().optional(),
  coins_amount: z.number().int().optional(),
  current_streak: z.number().int().optional(),
  exercise_id: z.string().uuid().optional(),
  reference_url: z.string().url().optional()
}).passthrough();

const notificationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: notificationTypeSchema,
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  data: notificationDataSchema.optional(),
  read: z.boolean(),
  created_at: z.date(),
  updated_at: z.date()
});
```

---

