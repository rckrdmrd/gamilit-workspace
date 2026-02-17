# ET-PEER-001: Matchmaking System

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-PEER-001 |
| **Modulo** | Peer Challenges |
| **Titulo** | Sistema de Matchmaking para Desafios |
| **Prioridad** | Alta |
| **Estado** | Parcialmente Implementado |
| **Completitud** | 35% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Estado de Implementacion

### Progreso General: 35%

| Componente | Estado | Completitud |
|------------|--------|-------------|
| PeerChallenge Entity | COMPLETO | 100% |
| PeerChallengesService (CRUD) | COMPLETO | 100% |
| PeerChallengesController | COMPLETO | 100% |
| Challenge Creation DTOs | PARCIAL | 60% |
| Matchmaking Algorithm | NO INICIADO | 0% |
| Matchmaking Queue | NO INICIADO | 0% |
| Skill Rating System | NO INICIADO | 0% |
| Frontend Challenge UI | NO INICIADO | 0% |
| Notifications Integration | NO INICIADO | 0% |

---

## Referencias

### Requerimiento Funcional
- RF-PEER-001: Challenge Creation and Matchmaking

### User Stories
- [US-PEER-001: Challenge Creation and Matching](../user-stories/US-PEER-001/US-PEER-001-challenge-creation.md)

---

## Descripcion Funcional

El sistema de matchmaking permite a estudiantes encontrar oponentes adecuados para desafios 1v1 o multiplayer, considerando:
- Nivel de habilidad similar (skill rating)
- Preferencias de tipo de ejercicio
- Disponibilidad en tiempo real
- Historial de enfrentamientos previos

---

## Arquitectura

### Diagrama de Componentes

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - (FALTANTE) ChallengeLobby                             |
|  - (FALTANTE) MatchmakingQueue                           |
|  - (FALTANTE) OpponentFinder                             |
|  - (FALTANTE) ChallengeCreator                           |
+-----------------------------+----------------------------+
                              | REST API + WebSocket
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - PeerChallengesController                              |
|  - PeerChallengesService                                 |
|  - (FALTANTE) MatchmakingService                         |
|  - (FALTANTE) SkillRatingService                         |
|  - (FALTANTE) MatchmakingGateway (WebSocket)             |
+-----------------------------+----------------------------+
                              | TypeORM + Redis
+-----------------------------v----------------------------+
|               DATABASE / CACHE                            |
|  - social_features.peer_challenges                       |
|  - (FALTANTE) peer_challenge_participants                |
|  - (FALTANTE) user_skill_ratings                         |
|  - Redis: matchmaking queue                              |
+----------------------------------------------------------+
```

### Flujo de Matchmaking

```
Estudiante solicita "Find Opponent"
        |
        v
MatchmakingService.joinQueue()
  - Calcula skill rating
  - Define rango de busqueda
        |
        v
Redis Queue (matchmaking:waiting)
  - Ordenado por skill rating
  - TTL: 5 minutos
        |
        v
MatchmakingWorker (cada 2 segundos)
  - Busca pares compatibles
  - Skill diff < 100 puntos
        |
        v
Match Found?
  ├── SI → Crear PeerChallenge
  │         - Notificar via WebSocket
  │         - Estado: 'full'
  │
  └── NO → Expandir rango de busqueda
            - +50 puntos cada 30 segundos
            - Max expansion: 300 puntos
```

---

## Implementacion Existente

### PeerChallenge Entity

**Ubicacion:** `apps/backend/src/modules/social/entities/peer-challenge.entity.ts`

**Estado:** COMPLETO (100%)

**Campos Relevantes para Matchmaking:**
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Primary key |
| challenge_type | TEXT | head_to_head/multiplayer/tournament/leaderboard |
| created_by | UUID | FK a profiles (creador) |
| module_id | UUID | FK a modules (opcional) |
| exercise_id | UUID | FK a exercises (opcional) |
| title | TEXT | Titulo del desafio |
| difficulty_level | ENUM | beginner/intermediate/advanced/expert |
| max_participants | INT | Maximo participantes (default: 2) |
| min_participants | INT | Minimo para iniciar (default: 2) |
| current_participants | INT | Contador actual |
| status | TEXT | open/full/in_progress/completed/cancelled/expired |
| is_public | BOOLEAN | Visible en lista publica |
| requires_approval | BOOLEAN | Requiere aprobacion del creador |

### PeerChallengesService

**Ubicacion:** `apps/backend/src/modules/social/services/peer-challenges.service.ts`

**Estado:** COMPLETO (100%)

**Metodos Implementados:**
| Metodo | Descripcion |
|--------|-------------|
| create(createdBy, data) | Crear nuevo challenge |
| findAll(filters) | Listar con filtros |
| findOpen() | Challenges abiertos |
| findActive() | Challenges en progreso |
| findById(id) | Obtener por ID |
| findByCreator(userId) | Challenges de un usuario |
| update(id, userId, data) | Actualizar challenge |
| updateStatus(id, status) | Cambiar estado |
| start(id) | Iniciar challenge |
| complete(id) | Completar challenge |
| cancel(id, userId) | Cancelar challenge |
| markExpired() | Marcar expirados |
| delete(id, userId) | Eliminar challenge |
| getStatsByType() | Stats por tipo |
| getStatsByStatus() | Stats por estado |

---

## Lo que Falta para Completar (65%)

### 1. MatchmakingService (25% de lo faltante)

```typescript
// services/matchmaking.service.ts (NUEVO)
@Injectable()
export class MatchmakingService {
  constructor(
    private readonly redisService: RedisService,
    private readonly skillRatingService: SkillRatingService,
    private readonly peerChallengesService: PeerChallengesService,
    private readonly matchmakingGateway: MatchmakingGateway,
  ) {}

  /**
   * Agrega usuario a la cola de matchmaking
   */
  async joinQueue(
    userId: string,
    preferences: MatchmakingPreferences
  ): Promise<QueuePosition>;

  /**
   * Remueve usuario de la cola
   */
  async leaveQueue(userId: string): Promise<void>;

  /**
   * Obtiene posicion en la cola
   */
  async getQueuePosition(userId: string): Promise<QueuePosition | null>;

  /**
   * Encuentra match compatible
   */
  async findMatch(
    userId: string,
    skillRating: number,
    preferences: MatchmakingPreferences
  ): Promise<MatchResult | null>;

  /**
   * Procesa la cola de matchmaking
   * (Ejecutado por cron cada 2 segundos)
   */
  @Cron('*/2 * * * * *')
  async processQueue(): Promise<void>;

  /**
   * Crea challenge para usuarios matched
   */
  async createMatchedChallenge(
    player1: string,
    player2: string,
    preferences: MatchmakingPreferences
  ): Promise<PeerChallenge>;
}

interface MatchmakingPreferences {
  challengeType: 'head_to_head' | 'multiplayer';
  difficultyLevel?: DifficultyLevelEnum;
  moduleId?: string;
  exerciseId?: string;
  maxSkillDiff?: number; // default: 100
}

interface QueuePosition {
  position: number;
  estimatedWaitTime: number; // segundos
  queuedAt: Date;
  preferences: MatchmakingPreferences;
}

interface MatchResult {
  challengeId: string;
  opponent: {
    id: string;
    displayName: string;
    skillRating: number;
  };
}
```

### 2. SkillRatingService (15% de lo faltante)

```typescript
// services/skill-rating.service.ts (NUEVO)
@Injectable()
export class SkillRatingService {

  /**
   * Obtiene skill rating de un usuario
   */
  async getSkillRating(userId: string): Promise<SkillRating>;

  /**
   * Calcula nuevo rating despues de un challenge
   * (Sistema ELO modificado)
   */
  async updateRatings(
    winnerId: string,
    loserId: string,
    challengeId: string
  ): Promise<{ winner: number; loser: number }>;

  /**
   * Calcula rating esperado (probabilidad de ganar)
   */
  calculateExpectedScore(playerRating: number, opponentRating: number): number;

  /**
   * Calcula cambio de rating
   * K-factor dinamico segun numero de juegos
   */
  calculateRatingChange(
    actualScore: number,
    expectedScore: number,
    kFactor: number
  ): number;

  /**
   * Obtiene K-factor segun experiencia del usuario
   */
  getKFactor(gamesPlayed: number): number;
}

interface SkillRating {
  userId: string;
  rating: number;           // default: 1200
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  lastUpdated: Date;
  history: RatingHistoryEntry[];
}
```

### 3. MatchmakingGateway WebSocket (15% de lo faltante)

```typescript
// gateways/matchmaking.gateway.ts (NUEVO)
@WebSocketGateway({ namespace: '/matchmaking' })
export class MatchmakingGateway {

  /**
   * Usuario se une a cola de matchmaking
   */
  @SubscribeMessage('joinQueue')
  async handleJoinQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() preferences: MatchmakingPreferences
  ): Promise<QueuePosition>;

  /**
   * Usuario sale de la cola
   */
  @SubscribeMessage('leaveQueue')
  async handleLeaveQueue(@ConnectedSocket() client: Socket): Promise<void>;

  /**
   * Notifica match encontrado
   */
  notifyMatchFound(userId: string, matchResult: MatchResult): void;

  /**
   * Notifica actualizacion de posicion en cola
   */
  notifyQueueUpdate(userId: string, position: QueuePosition): void;

  /**
   * Notifica que el matchmaking expiro
   */
  notifyMatchmakingTimeout(userId: string): void;
}
```

### 4. Entidades Adicionales (5% de lo faltante)

```typescript
// entities/challenge-participant.entity.ts (NUEVO)
@Entity({ schema: DB_SCHEMAS.SOCIAL, name: 'peer_challenge_participants' })
export class ChallengeParticipant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  challenge_id!: string;

  @Column('uuid')
  user_id!: string;

  @Column('text')
  status!: 'joined' | 'ready' | 'playing' | 'finished' | 'left';

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  score!: number | null;

  @Column('int', { nullable: true })
  rank!: number | null;

  @Column('boolean', { default: false })
  is_winner!: boolean;

  @CreateDateColumn()
  joined_at!: Date;

  @Column('timestamp with time zone', { nullable: true })
  finished_at!: Date | null;
}

// entities/user-skill-rating.entity.ts (NUEVO)
@Entity({ schema: DB_SCHEMAS.SOCIAL, name: 'user_skill_ratings' })
export class UserSkillRating {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { unique: true })
  user_id!: string;

  @Column('int', { default: 1200 })
  rating!: number;

  @Column('int', { default: 0 })
  games_played!: number;

  @Column('int', { default: 0 })
  wins!: number;

  @Column('int', { default: 0 })
  losses!: number;

  @Column('int', { default: 0 })
  draws!: number;

  @Column('int', { default: 0 })
  current_streak!: number;

  @Column('int', { default: 0 })
  best_streak!: number;

  @UpdateDateColumn()
  updated_at!: Date;
}
```

### 5. Frontend Components (5% de lo faltante)

**Componentes Faltantes:**
| Componente | Descripcion |
|------------|-------------|
| ChallengeLobby | Lobby principal de desafios |
| MatchmakingButton | Boton "Find Opponent" |
| MatchmakingQueue | Vista de cola con animacion |
| MatchFoundModal | Modal cuando se encuentra match |
| OpponentCard | Card con info del oponente |
| ChallengeInviteModal | Modal para invitar amigos |

---

## API REST Endpoints (A Implementar)

| Metodo | Ruta | Descripcion | Roles |
|--------|------|-------------|-------|
| POST | `/matchmaking/queue` | Unirse a cola | STUDENT |
| DELETE | `/matchmaking/queue` | Salir de cola | STUDENT |
| GET | `/matchmaking/queue/status` | Estado de cola | STUDENT |
| GET | `/matchmaking/skill-rating` | Mi skill rating | STUDENT |
| GET | `/matchmaking/skill-rating/:userId` | Rating de otro usuario | STUDENT |
| GET | `/matchmaking/leaderboard` | Top players | PUBLIC |

### WebSocket Events

| Evento | Direccion | Descripcion |
|--------|-----------|-------------|
| `joinQueue` | Client -> Server | Unirse a matchmaking |
| `leaveQueue` | Client -> Server | Salir de matchmaking |
| `queueUpdate` | Server -> Client | Actualizacion de posicion |
| `matchFound` | Server -> Client | Match encontrado |
| `matchmakingTimeout` | Server -> Client | Timeout (5 min) |

---

## Algoritmo de Matchmaking

### ELO-Based Matching

```
1. Usuario entra a cola con skill_rating R
2. Rango inicial de busqueda: R ± 100
3. Cada 30 segundos sin match:
   - Expandir rango en 50 puntos
   - Max expansion: R ± 300
4. Match encontrado cuando:
   - Ambos usuarios en cola
   - |R1 - R2| <= rango_actual
   - Preferencias compatibles (modulo, dificultad)
5. Prioridad de match:
   - Menor diferencia de rating
   - Mayor tiempo en cola
```

### K-Factor Dinamico

| Games Played | K-Factor |
|--------------|----------|
| 0-30 | 40 |
| 31-100 | 20 |
| 101+ | 10 |

---

## Criterios de Aceptacion

### Funcionales
- [ ] Usuario puede buscar oponente automaticamente
- [ ] Match considera skill rating similar (±100 inicial)
- [ ] Rango de busqueda se expande si no hay match
- [ ] Notificacion en tiempo real cuando se encuentra match
- [ ] Usuario puede cancelar busqueda en cualquier momento
- [ ] Skill rating se actualiza despues de cada challenge

### No Funcionales
- [ ] Tiempo promedio de matchmaking < 30 segundos
- [ ] WebSocket latency < 100ms
- [ ] Cola soporta 1000+ usuarios concurrentes

### Seguridad
- [ ] Solo usuarios autenticados pueden hacer matchmaking
- [ ] Validacion de que usuario no esta en otra cola
- [ ] Rate limiting: max 5 joins/min

---

## Dependencias

### Bloqueado Por
- PeerChallenge Entity (COMPLETO)
- PeerChallengesService (COMPLETO)
- WebSocket Infrastructure (COMPLETO)
- Redis (COMPLETO)

### Bloquea
- Realtime Battles (ET-PEER-002)
- Challenge Leaderboards
- Tournament System

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| MatchmakingService | 10h |
| SkillRatingService | 6h |
| MatchmakingGateway | 6h |
| Entidades adicionales | 4h |
| Frontend Components | 10h |
| Tests | 4h |
| **Total** | **40h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-PEER-001-matchmaking.md*
*Generado: 2026-01-27*
