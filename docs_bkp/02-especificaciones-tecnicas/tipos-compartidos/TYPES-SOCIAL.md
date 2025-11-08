# Tipos Compartidos - Social

**Proyecto:** Gamilit Platform
**Módulo:** Tipos TypeScript Compartidos
**Categoría:** Social Features (Friends, Guilds)
**Archivo original:** SHARED-TYPES-LIBRARY.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Descripción

Este archivo contiene tipos relacionados con características sociales:
- **Friendship**: Relación de amistad entre usuarios
- **FriendProfile**: Perfil público de amigo
- **Guild**: Gremio o grupo de usuarios
- **GuildMember**: Miembro de un gremio

---

### 6.5 Social Types

#### 6.5.1 Friendship

**Description**: Friendship relationship

**TypeScript Definition**:
```typescript
type FriendshipStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: Date;
  updated_at: Date;
  accepted_at?: Date;
}
```

**Zod Schema**:
```typescript
const friendshipStatusSchema = z.enum(['pending', 'accepted', 'declined', 'blocked']);

const friendshipSchema = z.object({
  id: z.string().uuid(),
  requester_id: z.string().uuid(),
  addressee_id: z.string().uuid(),
  status: friendshipStatusSchema,
  created_at: z.date(),
  updated_at: z.date(),
  accepted_at: z.date().optional()
});
```

---

#### 6.5.2 FriendProfile

**Description**: Friend profile information

**TypeScript Definition**:
```typescript
interface FriendProfile {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  currentRank?: MayaRank;
  totalXP?: number;
  isOnline?: boolean;
  lastSeenAt?: Date;
  friendshipId: string;
  friendsSince: Date;
}
```

**Zod Schema**:
```typescript
const friendProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  displayName: z.string(),
  avatarUrl: z.string().url().optional(),
  currentRank: mayaRankSchema.optional(),
  totalXP: z.number().int().min(0).optional(),
  isOnline: z.boolean().optional(),
  lastSeenAt: z.date().optional(),
  friendshipId: z.string().uuid(),
  friendsSince: z.date()
});
```

---

#### 6.5.3 Guild

**Description**: Team/guild entity

**TypeScript Definition**:
```typescript
type GuildRole = 'owner' | 'admin' | 'member';

interface Guild {
  id: string;
  classroom_id?: string;
  tenant_id: string;
  name: string;
  description?: string;
  motto?: string;
  color_primary: string;
  color_secondary: string;
  avatar_url?: string;
  banner_url?: string;
  badges?: any;
  creator_id: string;
  leader_id?: string;
  team_code?: string;
  max_members: number;
  current_members_count: number;
  is_public: boolean;
  allow_join_requests: boolean;
  require_approval: boolean;
  total_xp: number;
  total_ml_coins: number;
  modules_completed: number;
  achievements_earned: number;
  is_active: boolean;
  is_verified: boolean;
  founded_at: Date;
  last_activity_at?: Date;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}
```

**Zod Schema**:
```typescript
const guildRoleSchema = z.enum(['owner', 'admin', 'member']);

const guildSchema = z.object({
  id: z.string().uuid(),
  classroom_id: z.string().uuid().optional(),
  tenant_id: z.string().uuid(),
  name: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
  motto: z.string().max(100).optional(),
  color_primary: z.string().regex(/^#[0-9A-F]{6}$/i),
  color_secondary: z.string().regex(/^#[0-9A-F]{6}$/i),
  avatar_url: z.string().url().optional(),
  banner_url: z.string().url().optional(),
  badges: z.any().optional(),
  creator_id: z.string().uuid(),
  leader_id: z.string().uuid().optional(),
  team_code: z.string().optional(),
  max_members: z.number().int().positive(),
  current_members_count: z.number().int().min(0),
  is_public: z.boolean(),
  allow_join_requests: z.boolean(),
  require_approval: z.boolean(),
  total_xp: z.number().int().min(0),
  total_ml_coins: z.number().int().min(0),
  modules_completed: z.number().int().min(0),
  achievements_earned: z.number().int().min(0),
  is_active: z.boolean(),
  is_verified: z.boolean(),
  founded_at: z.date(),
  last_activity_at: z.date().optional(),
  metadata: z.any().optional(),
  created_at: z.date(),
  updated_at: z.date()
});
```

---

#### 6.5.4 GuildMember

**Description**: Guild member information

**TypeScript Definition**:
```typescript
type GuildMemberStatus = 'active' | 'inactive' | 'kicked' | 'left';

interface GuildMember {
  id: string;
  guild_id: string;
  user_id: string;
  role: GuildRole;
  status: GuildMemberStatus;
  joined_at: Date;
  left_at?: Date;
  kicked_at?: Date;
  kick_reason?: string;
  contribution_xp: number;
  contribution_coins: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

**Zod Schema**:
```typescript
const guildMemberStatusSchema = z.enum(['active', 'inactive', 'kicked', 'left']);

const guildMemberSchema = z.object({
  id: z.string().uuid(),
  guild_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: guildRoleSchema,
  status: guildMemberStatusSchema,
  joined_at: z.date(),
  left_at: z.date().optional(),
  kicked_at: z.date().optional(),
  kick_reason: z.string().optional(),
  contribution_xp: z.number().int().min(0),
  contribution_coins: z.number().int().min(0),
  is_active: z.boolean(),
  created_at: z.date(),
  updated_at: z.date()
});
```

---

