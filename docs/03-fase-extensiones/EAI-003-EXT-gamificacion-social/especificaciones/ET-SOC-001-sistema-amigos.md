---
id: "ET-SOC-001"
title: "Diseno Tecnico Sistema de Amigos"
type: "Especificacion Tecnica"
status: "Especificado"
priority: "P1"
epic: "EAI-003-EXT"
module: "social_features"
labels: ["gamification", "social", "friends", "leaderboard", "technical"]
created_date: "2026-01-20"
updated_date: "2026-01-20"
related_rf: "RF-SOC-001"
---

# ET-SOC-001: Diseno Tecnico Sistema de Amigos

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | ET-SOC-001 |
| **Epic** | EAI-003-EXT - Gamificacion Social |
| **RF Relacionado** | RF-SOC-001 |
| **Prioridad** | P1 |
| **Estado** | Especificado |

---

## Alcance

Esta especificacion cubre el diseno tecnico de:
1. Sistema de amigos (solicitudes, gestion)
2. Leaderboard de amigos
3. Multiplicador de ML Coins por rango

---

## Arquitectura de Backend

### Estructura de Modulo

```
apps/backend/src/modules/
└── social/
    ├── social.module.ts
    ├── friends/
    │   ├── friends.controller.ts
    │   ├── friends.service.ts
    │   ├── friends.repository.ts
    │   ├── dto/
    │   │   ├── send-request.dto.ts
    │   │   ├── respond-request.dto.ts
    │   │   └── friend.dto.ts
    │   └── entities/
    │       ├── friendship.entity.ts
    │       └── friend-request.entity.ts
    ├── leaderboard/
    │   ├── friend-leaderboard.controller.ts
    │   ├── friend-leaderboard.service.ts
    │   └── dto/
    │       └── friend-leaderboard.dto.ts
    └── multiplier/
        ├── rank-multiplier.service.ts
        └── dto/
            └── multiplier.dto.ts
```

---

### Entidades TypeORM

#### Friendship Entity

```typescript
// apps/backend/src/modules/social/friends/entities/friendship.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ schema: 'social_features', name: 'friendships' })
export class Friendship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column('uuid', { name: 'friend_id' })
  friendId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'friend_id' })
  friend: User;
}
```

#### FriendRequest Entity

```typescript
// apps/backend/src/modules/social/friends/entities/friend-request.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum FriendRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity({ schema: 'social_features', name: 'friend_requests' })
export class FriendRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'requester_id' })
  requesterId: string;

  @Column('uuid', { name: 'recipient_id' })
  recipientId: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: FriendRequestStatus.PENDING,
  })
  status: FriendRequestStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'responded_at', type: 'timestamptz', nullable: true })
  respondedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requester_id' })
  requester: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;
}
```

---

### Servicios

#### FriendsService

```typescript
// apps/backend/src/modules/social/friends/friends.service.ts

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friendship)
    private friendshipRepo: Repository<Friendship>,
    @InjectRepository(FriendRequest)
    private requestRepo: Repository<FriendRequest>,
    private notificationsService: NotificationsService,
  ) {}

  // Buscar usuarios para agregar
  async searchUsers(userId: string, query: string): Promise<UserSearchDto[]> {
    // Excluir: usuario actual, amigos existentes, solicitudes pendientes
  }

  // Enviar solicitud de amistad
  async sendRequest(requesterId: string, recipientId: string): Promise<FriendRequest> {
    // Validar rate limiting (10/hora)
    // Validar no duplicado
    // Crear request
    // Notificar destinatario
  }

  // Responder a solicitud
  async respondToRequest(
    userId: string,
    requestId: string,
    accept: boolean
  ): Promise<void> {
    // Validar que usuario es recipient
    // Si acepta: crear friendship bidireccional
    // Notificar requester
  }

  // Obtener lista de amigos
  async getFriends(userId: string): Promise<FriendDto[]> {
    // Query optimizado con perfil basico
    // Ordenar por ultima actividad
  }

  // Eliminar amigo
  async removeFriend(userId: string, friendId: string): Promise<void> {
    // Eliminar ambas direcciones de friendship
  }

  // Obtener solicitudes pendientes
  async getPendingRequests(userId: string): Promise<{
    sent: FriendRequest[];
    received: FriendRequest[];
  }> {
    // Separar por direccion
  }
}
```

#### FriendLeaderboardService

```typescript
// apps/backend/src/modules/social/leaderboard/friend-leaderboard.service.ts

@Injectable()
export class FriendLeaderboardService {
  constructor(
    @InjectRepository(Friendship)
    private friendshipRepo: Repository<Friendship>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async getFriendLeaderboard(
    userId: string,
    period: 'weekly' | 'monthly' | 'all_time'
  ): Promise<FriendLeaderboardDto> {
    const cacheKey = `friend_leaderboard:${userId}:${period}`;

    // Check cache (5 min TTL)
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached as FriendLeaderboardDto;

    // Query amigos con stats
    const friends = await this.getFriendsWithStats(userId, period);

    // Ordenar por XP
    const sorted = friends.sort((a, b) => b.xp - a.xp);

    // Encontrar posicion del usuario
    const userStats = await this.getUserStats(userId, period);
    const allWithUser = [...sorted, userStats].sort((a, b) => b.xp - a.xp);
    const myPosition = allWithUser.findIndex(u => u.userId === userId) + 1;

    const result = {
      friends: sorted,
      myPosition,
      total: sorted.length + 1,
      period,
    };

    // Cache result
    await this.cacheManager.set(cacheKey, result, 300); // 5 min

    return result;
  }

  private async getFriendsWithStats(
    userId: string,
    period: 'weekly' | 'monthly' | 'all_time'
  ): Promise<FriendStatDto[]> {
    // Query optimizado con JOIN a user_stats
    // Filtrar por periodo si aplica
  }
}
```

#### RankMultiplierService

```typescript
// apps/backend/src/modules/social/multiplier/rank-multiplier.service.ts

@Injectable()
export class RankMultiplierService {
  private readonly MULTIPLIERS: Record<number, number> = {
    1: 1.0,  // Semilla de Cacao
    2: 1.1,  // Recolector de Frutos
    3: 1.2,  // Artesano de Palabras
    4: 1.3,  // Escriba del Pueblo
    5: 1.4,  // Guardian de Historias
    6: 1.5,  // Sabio del Consejo
    7: 1.6,  // Chaman de las Letras
    8: 1.7,  // Senor del Conocimiento
    9: 1.8,  // Gran Sacerdote
    10: 2.0, // K'uk'ulkan
  };

  getMultiplier(rankId: number): number {
    return this.MULTIPLIERS[rankId] ?? 1.0;
  }

  applyMultiplier(baseReward: number, rankId: number): {
    finalReward: number;
    multiplier: number;
    bonus: number;
  } {
    const multiplier = this.getMultiplier(rankId);
    const finalReward = Math.floor(baseReward * multiplier);
    const bonus = finalReward - baseReward;

    return { finalReward, multiplier, bonus };
  }
}
```

---

### DTOs

#### FriendLeaderboardDto

```typescript
// apps/backend/src/modules/social/leaderboard/dto/friend-leaderboard.dto.ts

export class FriendStatDto {
  userId: string;
  displayName: string;
  avatarUrl: string;
  rankId: number;
  rankName: string;
  level: number;
  xp: number;
  lastActivityAt: Date;
}

export class FriendLeaderboardDto {
  friends: FriendStatDto[];
  myPosition: number;
  total: number;
  period: 'weekly' | 'monthly' | 'all_time';
}
```

#### MultiplierResponseDto

```typescript
// apps/backend/src/modules/social/multiplier/dto/multiplier.dto.ts

export class MultiplierResponseDto {
  rankId: number;
  rankName: string;
  multiplier: number;
  nextRankId?: number;
  nextRankName?: string;
  nextMultiplier?: number;
}
```

---

### Controllers

#### FriendsController

```typescript
// apps/backend/src/modules/social/friends/friends.controller.ts

@Controller('friends')
@UseGuards(JwtAuthGuard)
@ApiTags('Friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  @ApiOperation({ summary: 'Get friends list' })
  async getFriends(@CurrentUser() user: User): Promise<FriendDto[]> {
    return this.friendsService.getFriends(user.id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users to add' })
  async searchUsers(
    @CurrentUser() user: User,
    @Query('q') query: string,
  ): Promise<UserSearchDto[]> {
    return this.friendsService.searchUsers(user.id, query);
  }

  @Post('request')
  @ApiOperation({ summary: 'Send friend request' })
  async sendRequest(
    @CurrentUser() user: User,
    @Body() dto: SendRequestDto,
  ): Promise<FriendRequest> {
    return this.friendsService.sendRequest(user.id, dto.recipientId);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get pending requests' })
  async getPendingRequests(@CurrentUser() user: User) {
    return this.friendsService.getPendingRequests(user.id);
  }

  @Post('requests/:id/respond')
  @ApiOperation({ summary: 'Respond to friend request' })
  async respondToRequest(
    @CurrentUser() user: User,
    @Param('id') requestId: string,
    @Body() dto: RespondRequestDto,
  ): Promise<void> {
    return this.friendsService.respondToRequest(user.id, requestId, dto.accept);
  }

  @Delete(':friendId')
  @ApiOperation({ summary: 'Remove friend' })
  async removeFriend(
    @CurrentUser() user: User,
    @Param('friendId') friendId: string,
  ): Promise<void> {
    return this.friendsService.removeFriend(user.id, friendId);
  }
}
```

#### FriendLeaderboardController

```typescript
// apps/backend/src/modules/social/leaderboard/friend-leaderboard.controller.ts

@Controller('leaderboards/friends')
@UseGuards(JwtAuthGuard)
@ApiTags('Leaderboards')
export class FriendLeaderboardController {
  constructor(private readonly service: FriendLeaderboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get friend leaderboard' })
  async getFriendLeaderboard(
    @CurrentUser() user: User,
    @Query('period') period: 'weekly' | 'monthly' | 'all_time' = 'all_time',
  ): Promise<FriendLeaderboardDto> {
    return this.service.getFriendLeaderboard(user.id, period);
  }
}
```

---

## Arquitectura de Frontend

### Estructura de Componentes

```
apps/frontend/src/features/gamification/social/
├── pages/
│   └── FriendsPage.tsx
├── components/
│   ├── FriendCard.tsx
│   ├── FriendsList.tsx
│   ├── FriendSearch.tsx
│   ├── FriendRequests.tsx
│   ├── AddFriendModal.tsx
│   ├── FriendLeaderboard.tsx
│   └── MultiplierBadge.tsx
├── hooks/
│   ├── useFriends.ts
│   ├── useFriendRequests.ts
│   └── useFriendLeaderboard.ts
├── stores/
│   └── friendsStore.ts
└── api/
    └── friendsApi.ts
```

---

### Componentes Principales

#### FriendCard

```tsx
// apps/frontend/src/features/gamification/social/components/FriendCard.tsx

interface FriendCardProps {
  friend: Friend;
  onRemove?: (friendId: string) => void;
  showRemoveButton?: boolean;
}

export const FriendCard: React.FC<FriendCardProps> = ({
  friend,
  onRemove,
  showRemoveButton = false,
}) => {
  return (
    <div className="friend-card">
      <Avatar src={friend.avatarUrl} alt={friend.displayName} />
      <div className="friend-info">
        <span className="name">{friend.displayName}</span>
        <span className="rank">{friend.rankName}</span>
        <span className="level">Nivel {friend.level}</span>
      </div>
      <div className="friend-stats">
        <span className="xp">{formatNumber(friend.xp)} XP</span>
      </div>
      {showRemoveButton && (
        <Button variant="ghost" onClick={() => onRemove?.(friend.id)}>
          Eliminar
        </Button>
      )}
    </div>
  );
};
```

#### FriendLeaderboard

```tsx
// apps/frontend/src/features/gamification/social/components/FriendLeaderboard.tsx

interface FriendLeaderboardProps {
  period: 'weekly' | 'monthly' | 'all_time';
  onPeriodChange: (period: 'weekly' | 'monthly' | 'all_time') => void;
}

export const FriendLeaderboard: React.FC<FriendLeaderboardProps> = ({
  period,
  onPeriodChange,
}) => {
  const { data, isLoading, error } = useFriendLeaderboard(period);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data?.friends.length) {
    return (
      <EmptyState
        message="Agrega amigos para ver este ranking"
        action={<Link to="/friends">Buscar amigos</Link>}
      />
    );
  }

  return (
    <div className="friend-leaderboard">
      <PeriodSelector value={period} onChange={onPeriodChange} />

      <div className="my-position">
        Tu posicion: <strong>{data.myPosition}</strong> de {data.total}
      </div>

      <div className="leaderboard-list">
        {data.friends.map((friend, index) => (
          <LeaderboardRow
            key={friend.userId}
            position={index + 1}
            user={friend}
            isCurrentUser={false}
          />
        ))}
      </div>
    </div>
  );
};
```

#### MultiplierBadge

```tsx
// apps/frontend/src/features/gamification/social/components/MultiplierBadge.tsx

interface MultiplierBadgeProps {
  multiplier: number;
  rankName: string;
  showTooltip?: boolean;
}

export const MultiplierBadge: React.FC<MultiplierBadgeProps> = ({
  multiplier,
  rankName,
  showTooltip = true,
}) => {
  return (
    <Tooltip
      content={`Multiplicador x${multiplier} por ser ${rankName}`}
      disabled={!showTooltip}
    >
      <span className="multiplier-badge">
        x{multiplier.toFixed(1)}
      </span>
    </Tooltip>
  );
};
```

---

### Hooks

#### useFriendLeaderboard

```typescript
// apps/frontend/src/features/gamification/social/hooks/useFriendLeaderboard.ts

export const useFriendLeaderboard = (
  period: 'weekly' | 'monthly' | 'all_time'
) => {
  return useQuery({
    queryKey: ['friend-leaderboard', period],
    queryFn: () => friendsApi.getLeaderboard(period),
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
};
```

---

## Estrategia de Cache

### Cache de Leaderboard

```
Clave: friend_leaderboard:{userId}:{period}
TTL: 300 segundos (5 minutos)
Invalidacion: Manual cuando hay cambios significativos
```

### Consideraciones de Performance

1. **Query optimizado**: JOIN con user_stats, indices apropiados
2. **Paginacion**: Limite de 100 amigos mostrados
3. **Cache Redis**: Evitar queries repetitivos
4. **Batch loading**: Cargar perfiles en batch

---

## Integracion con ExerciseRewardsService

### Modificacion para Multiplicador

```typescript
// apps/backend/src/modules/gamification/exercise-rewards.service.ts

@Injectable()
export class ExerciseRewardsService {
  constructor(
    private readonly rankMultiplierService: RankMultiplierService,
    // ... otros deps
  ) {}

  async claimRewards(userId: string, exerciseId: string): Promise<RewardResult> {
    // Obtener rango del usuario
    const userStats = await this.userStatsService.getStats(userId);

    // Calcular recompensa base
    const baseReward = await this.calculateBaseReward(exerciseId);

    // Aplicar multiplicador
    const { finalReward, multiplier, bonus } =
      this.rankMultiplierService.applyMultiplier(baseReward, userStats.currentRank);

    // Registrar transaccion con multiplicador
    await this.mlCoinsService.addCoins(userId, {
      amount: finalReward,
      reason: 'exercise_completion',
      metadata: {
        exerciseId,
        baseReward,
        multiplier,
        bonus,
      },
    });

    return {
      mlCoins: finalReward,
      multiplier,
      bonus,
      message: `+${finalReward} ML Coins (x${multiplier} bonus por rango)`,
    };
  }
}
```

---

## Tests Requeridos

### Unit Tests

```typescript
// friends.service.spec.ts
describe('FriendsService', () => {
  it('should send friend request', async () => {});
  it('should not allow duplicate request', async () => {});
  it('should accept request and create friendship', async () => {});
  it('should reject request', async () => {});
  it('should remove friend bidirectionally', async () => {});
  it('should enforce rate limiting', async () => {});
});

// rank-multiplier.service.spec.ts
describe('RankMultiplierService', () => {
  it.each([
    [1, 1.0],
    [5, 1.4],
    [10, 2.0],
  ])('should return correct multiplier for rank %i', (rank, expected) => {});

  it('should calculate bonus correctly', () => {});
  it('should return 1.0 for unknown rank', () => {});
});
```

### Integration Tests

```typescript
// friends.e2e-spec.ts
describe('Friends API', () => {
  it('GET /friends should return friends list', async () => {});
  it('POST /friends/request should create pending request', async () => {});
  it('GET /leaderboards/friends should return sorted list', async () => {});
});
```

---

## Referencias

- RF-SOC-001: Requerimiento funcional relacionado
- US-GAM-010, US-GAM-011, US-GAM-012: User stories
- Documento de Diseno v6.1: Tabla de multiplicadores

---

**Creado:** 2026-01-20
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
