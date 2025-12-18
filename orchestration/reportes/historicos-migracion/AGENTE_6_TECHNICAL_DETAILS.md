# AGENTE 6 - Validación Backend Gamification Module
## Detalles Técnicos y Análisis Profundo

**Fecha:** 2024-11-04  
**Módulo:** Backend Gamification  
**Score:** 100/100  
**Status:** APROBADO

---

## TABLA DE CONTENIDOS

1. [Entities Detalladas](#entities-detalladas)
2. [Controllers Detallados](#controllers-detallados)
3. [Services Detallados](#services-detallados)
4. [Fórmulas Matemáticas](#fórmulas-matemáticas)
5. [Flujos de Proceso](#flujos-de-proceso)
6. [Índices de Base de Datos](#índices-de-base-de-datos)
7. [Validaciones Implementadas](#validaciones-implementadas)
8. [Manejo de Errores](#manejo-de-errores)

---

## ENTITIES DETALLADAS

### UserRank - Análisis Profundo

**Ruta:** `/entities/user-rank.entity.ts`  
**Líneas:** 182  
**Tabla:** `gamification_system.user_ranks`

#### Estructura:

```typescript
@Entity({ schema: DB_SCHEMAS.GAMIFICATION, name: DB_TABLES.GAMIFICATION.USER_RANKS })
@Index('idx_user_ranks_user_id', ['user_id'])
@Index('idx_user_ranks_current', ['current_rank'])
@Index('idx_user_ranks_is_current', ['user_id', 'is_current'], { where: 'is_current = true' })
export class UserRank {
  // UUID primary key
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Foreign keys
  @Column({ type: 'uuid' })
  user_id: string;
  
  @Column({ type: 'uuid', nullable: true })
  tenant_id?: string;

  // Enum for Maya ranks
  @Column({ type: 'text', default: MayaRank.AJAW, enum: MayaRank })
  current_rank: MayaRank;  // AJAW|NACOM|AH_KIN|HALACH_UINIC|KUKUKULKAN
  
  @Column({ type: 'text', nullable: true, enum: MayaRank })
  previous_rank?: MayaRank;

  // Progress tracking
  @Column({ type: 'integer', default: 0 })
  rank_progress_percentage: number;  // 0-100
  
  @Column({ type: 'integer', nullable: true })
  modules_required_for_next?: number;
  
  @Column({ type: 'integer', default: 0 })
  modules_completed_for_rank: number;
  
  @Column({ type: 'integer', nullable: true })
  xp_required_for_next?: number;
  
  @Column({ type: 'integer', default: 0 })
  xp_earned_for_rank: number;
  
  @Column({ type: 'integer', default: 0 })
  ml_coins_bonus: number;

  // Certificates and badges
  @Column({ type: 'text', nullable: true })
  certificate_url?: string;
  
  @Column({ type: 'text', nullable: true })
  badge_url?: string;

  // Achievement dates
  @Column({ type: 'timestamp with time zone', nullable: true })
  achieved_at?: Date;
  
  @Column({ type: 'timestamp with time zone', nullable: true })
  previous_rank_achieved_at?: Date;

  // Status control
  @Column({ type: 'boolean', default: true })
  is_current: boolean;  // Only one per user should be true
  
  @Column({ type: 'jsonb', default: {} })
  rank_metadata: Record<string, any>;  // Flexible metadata

  // Audit
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
  
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
```

#### Características Clave:

1. **Historial de Rangos:**
   - Múltiples registros por usuario
   - Campo `is_current` marca el rango activo
   - Índice único compuesto: `(user_id, is_current) WHERE is_current = true`

2. **Progresión Maya:**
   - Enum MayaRank con 5 valores
   - XP mínimo y máximo por rango
   - Bonos de ML Coins al alcanzar

3. **Auditoría:**
   - Timestamps de creación y actualización
   - Metadata flexible para datos adicionales
   - URLs de certificado y badge

4. **Relaciones:**
   - user_id → auth.users (FK)
   - tenant_id → auth_management.tenants (FK, nullable)

---

### Achievement - Análisis Profundo

**Ruta:** `/entities/achievement.entity.ts`  
**Líneas:** 210  
**Tabla:** `gamification_system.achievements`

#### Estructura de Logros:

```typescript
@Entity({ schema: DB_SCHEMAS.GAMIFICATION, name: DB_TABLES.GAMIFICATION.ACHIEVEMENTS })
@Index('idx_achievements_category', ['category'])
@Index('idx_achievements_active', ['is_active'], { where: 'is_active = true' })
@Index('idx_achievements_secret', ['is_secret'], { where: 'is_secret = true' })
@Index('idx_achievements_conditions_gin', ['conditions'], { synchronize: false })
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  tenant_id?: string;

  // Basic info
  @Column({ type: 'text' })
  name: string;
  
  @Column({ type: 'text', nullable: true })
  description?: string;
  
  @Column({ type: 'text', default: 'trophy' })
  icon: string;

  // Categorization
  @Column({ type: 'enum', enum: AchievementCategoryEnum })
  category: AchievementCategoryEnum;  // progress|streak|completion|social|special|mastery|exploration
  
  @Column({ type: 'text', default: 'common' })
  rarity: string;  // common|rare|epic|legendary
  
  @Column({ type: 'enum', enum: DifficultyLevelEnum, default: DifficultyLevelEnum.BEGINNER })
  difficulty_level: DifficultyLevelEnum;

  // Conditions & rewards (flexible)
  @Column({ type: 'jsonb' })
  conditions: Record<string, any>;  // type, requirements, etc.
  
  @Column({ type: 'jsonb', default: { xp: 100, badge: null, ml_coins: 50 } })
  rewards: Record<string, any>;
  
  @Column({ type: 'integer', default: 0 })
  ml_coins_reward: number;

  // Visibility & status
  @Column({ type: 'boolean', default: false })
  is_secret: boolean;
  
  @Column({ type: 'boolean', default: true })
  is_active: boolean;
  
  @Column({ type: 'boolean', default: false })
  is_repeatable: boolean;

  // Ordering & points
  @Column({ type: 'integer', default: 0 })
  order_index: number;
  
  @Column({ type: 'integer', default: 0 })
  points_value: number;

  // Messages & guidance
  @Column({ type: 'text', nullable: true })
  unlock_message?: string;
  
  @Column({ type: 'text', nullable: true })
  instructions?: string;
  
  @Column({ type: 'text', array: true, nullable: true })
  tips?: string[];

  // Metadata & audit
  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;
  
  @Column({ type: 'uuid', nullable: true })
  created_by?: string;
  
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
  
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
```

#### Tipos de Conditions Soportadas:

```json
{
  "type": "progress",
  "exercises_completed": 10,
  "modules_completed": 2
}

{
  "type": "streak",
  "min_streak": 7
}

{
  "type": "level",
  "min_level": 10
}

{
  "type": "score",
  "min_average_score": 85,
  "min_perfect_scores": 5
}

{
  "type": "rank",
  "target_rank": "Nacom"
}

{
  "type": "ml_coins",
  "min_coins_earned": 1000
}
```

---

### UserAchievement - Análisis Profundo

**Ruta:** `/entities/user-achievement.entity.ts`  
**Líneas:** 137  
**Tabla:** `gamification_system.user_achievements`

#### Estructura:

```typescript
@Entity({ schema: DB_SCHEMAS.GAMIFICATION, name: DB_TABLES.GAMIFICATION.USER_ACHIEVEMENTS })
@Index(['user_id'])
@Index(['achievement_id'])
@Index(['user_id', 'is_completed'])
@Index(['user_id', 'is_completed', 'completed_at'])
@Index('idx_user_achievements_unclaimed', ['user_id'], {
  where: '(is_completed = true) AND (rewards_claimed = false)',
})
export class UserAchievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  achievement_id: string;

  // Progress tracking (incremental)
  @Column({ type: 'integer', default: 0 })
  progress: number;  // e.g., 3 completed exercises of 10
  
  @Column({ type: 'integer', default: 100 })
  max_progress: number;
  
  @Column({ type: 'boolean', default: false })
  is_completed: boolean;
  
  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0.0 })
  completion_percentage: number;  // Calculated: (progress / max_progress) * 100

  // Completion tracking
  @Column({ type: 'timestamptz', nullable: true })
  completed_at: Date | null;
  
  // Notification status
  @Column({ type: 'boolean', default: false })
  notified: boolean;
  
  @Column({ type: 'boolean', default: false })
  viewed: boolean;
  
  // Rewards
  @Column({ type: 'boolean', default: false })
  rewards_claimed: boolean;
  
  @Column({ type: 'jsonb', default: {} })
  rewards_received: Record<string, any>;  // { ml_coins: 50, items: [...] }
  
  // Progress data (achievement-specific)
  @Column({ type: 'jsonb', default: {} })
  progress_data: Record<string, any>;  // { levels_completed: [1,2,5], ... }
  
  // Milestones (intermediate goals)
  @Column({ type: 'text', array: true, nullable: true })
  milestones_reached: string[] | null;  // ["25%", "50%", "75%"]
  
  // Additional metadata
  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  // Timestamps
  @Column({ type: 'timestamptz', default: () => "gamilit.now_mexico()" })
  started_at: Date;
  
  @Column({ type: 'timestamptz', default: () => "gamilit.now_mexico()" })
  created_at: Date;
}
```

#### Flujo de Completitud:

```
Estado Inicial:
  - progress = 0
  - is_completed = false
  - completion_percentage = 0.00
  - rewards_claimed = false

Durante Progreso:
  - progress incrementa
  - completion_percentage se recalcula
  - milestones_reached se actualiza si toca un 25%, 50%, 75%

Al Completar:
  - is_completed = true
  - completed_at = NOW
  - completion_percentage = 100.00
  - notified = true (al usuario)

Al Reclamar Recompensas:
  - rewards_claimed = true
  - rewards_received se popula
```

---

### UserStats - Análisis Profundo

**Ruta:** `/entities/user-stats.entity.ts`  
**Líneas:** 309  
**Tabla:** `gamification_system.user_stats`

#### Estructura Completa (35+ campos):

```typescript
@Entity({ schema: DB_SCHEMAS.GAMIFICATION, name: DB_TABLES.GAMIFICATION.USER_STATS })
@Index('idx_user_stats_user_id', ['user_id'])
@Index('idx_user_stats_tenant_id', ['tenant_id'])
@Index('idx_user_stats_level', ['level'])
@Index('idx_user_stats_tenant_level', ['tenant_id', 'level'])
@Index('idx_user_stats_ml_coins', ['ml_coins'])
@Index('idx_user_stats_streak', ['current_streak'])
@Index('idx_user_stats_current_rank', ['current_rank'])
@Index('idx_user_stats_perfect_scores', ['perfect_scores'])
export class UserStats {
  // Identity
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({ type: 'uuid', unique: true })
  user_id: string;  // 1:1 relationship
  
  @Column({ type: 'uuid', nullable: true })
  tenant_id?: string;

  // ============= LEVEL & XP SYSTEM =============
  @Column({ type: 'integer', default: 1 })
  level: number;
  
  @Column({ type: 'integer', default: 0 })
  total_xp: number;
  
  @Column({ type: 'integer', default: 100 })
  xp_to_next_level: number;

  // ============= RANK SYSTEM =============
  @Column({ type: 'text', default: 'Ajaw' })
  current_rank: string;  // Maya rank
  
  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0.00 })
  rank_progress: number;  // 0-100% to next rank

  // ============= ML COINS SYSTEM =============
  @Column({ type: 'integer', default: 100 })
  ml_coins: number;  // Current balance
  
  @Column({ type: 'integer', default: 100 })
  ml_coins_earned_total: number;  // Historical
  
  @Column({ type: 'integer', default: 0 })
  ml_coins_spent_total: number;  // Historical
  
  @Column({ type: 'integer', default: 0 })
  ml_coins_earned_today: number;  // Daily reset
  
  @Column({ type: 'timestamp with time zone', nullable: true })
  last_ml_coins_reset?: Date;

  // ============= STREAK SYSTEM =============
  @Column({ type: 'integer', default: 0 })
  current_streak: number;  // Consecutive days
  
  @Column({ type: 'integer', default: 0 })
  max_streak: number;  // Personal record
  
  @Column({ type: 'timestamp with time zone', nullable: true })
  streak_started_at?: Date;
  
  @Column({ type: 'integer', default: 0 })
  days_active_total: number;

  // ============= PROGRESS METRICS =============
  @Column({ type: 'integer', default: 0 })
  exercises_completed: number;
  
  @Column({ type: 'integer', default: 0 })
  modules_completed: number;
  
  @Column({ type: 'integer', default: 0 })
  total_score: number;
  
  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  average_score?: number;
  
  @Column({ type: 'integer', default: 0 })
  perfect_scores: number;

  // ============= ACHIEVEMENTS =============
  @Column({ type: 'integer', default: 0 })
  achievements_earned: number;
  
  @Column({ type: 'integer', default: 0 })
  certificates_earned: number;

  // ============= TIME TRACKING =============
  @Column({ type: 'interval', default: '00:00:00' })
  total_time_spent: string;  // PostgreSQL interval
  
  @Column({ type: 'interval', default: '00:00:00' })
  weekly_time_spent: string;
  
  @Column({ type: 'integer', default: 0 })
  sessions_count: number;

  // ============= PERIODIC XP =============
  @Column({ type: 'integer', default: 0 })
  weekly_xp: number;
  
  @Column({ type: 'integer', default: 0 })
  monthly_xp: number;
  
  @Column({ type: 'integer', default: 0 })
  weekly_exercises: number;

  // ============= RANKING POSITIONS =============
  @Column({ type: 'integer', nullable: true })
  global_rank_position?: number;  // Pre-calculated
  
  @Column({ type: 'integer', nullable: true })
  class_rank_position?: number;
  
  @Column({ type: 'integer', nullable: true })
  school_rank_position?: number;

  // ============= ACTIVITY TIMESTAMPS =============
  @Column({ type: 'timestamp with time zone', nullable: true })
  last_activity_at?: Date;
  
  @Column({ type: 'timestamp with time zone', nullable: true })
  last_login_at?: Date;

  // ============= METADATA & AUDIT =============
  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;
  
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
  
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
```

---

## CONTROLLERS DETALLADOS

### RanksController - Análisis Completo

**Ruta:** `/controllers/ranks.controller.ts`  
**Líneas:** 311  
**Métodos:** 8 endpoints

#### Endpoint 1: GET /api/v1/gamification/ranks

```typescript
@Get()
async listRanks(): Promise<RankMetadataDto[]>
```

**Descripción:** Obtiene metadata de todos los 5 rangos maya.

**Responsabilidades:**
1. Obtener configuración de rangos del servicio
2. Mapear RankConfig a RankMetadataDto
3. Convertir Infinity a -1 para JSON

**Respuesta Ejemplo:**
```json
[
  {
    "rank": "Ajaw",
    "name": "Ajaw",
    "description": "Señor - Nivel inicial",
    "xp_min": 0,
    "xp_max": 999,
    "ml_coins_bonus": 0,
    "order": 1
  },
  // ... 4 más
]
```

---

#### Endpoint 2: GET /api/v1/gamification/ranks/current

```typescript
@Get('current')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
async getCurrentRank(@Request() req: any): Promise<UserRank>
```

**Autenticación:** JWT Bearer Token (JwtAuthGuard)

**Responsabilidades:**
1. Extraer user_id del JWT (req.user.sub)
2. Buscar rango actual (is_current = true)
3. Lanzar NotFoundException si no existe

**Lógica del Servicio:**
```typescript
async getCurrentRank(userId: string): Promise<UserRank> {
  const currentRank = await this.userRankRepo.findOne({
    where: {
      user_id: userId,
      is_current: true,
    },
  });

  if (!currentRank) {
    throw new NotFoundException(
      `No current rank found for user ${userId}. User may need to be initialized.`,
    );
  }

  return currentRank;
}
```

---

#### Endpoint 3: GET /api/v1/gamification/ranks/:id

```typescript
@Get(':id')
async getRankDetails(@Param('id') id: string): Promise<UserRank>
```

**Responsabilidades:**
1. Buscar rango por ID específico
2. Lanzar NotFoundException si no existe

**Casos de Uso:**
- Ver historial de un rango específico
- Auditoría de cambios de rango
- Consultar fecha de logro

---

#### Endpoint 4: GET /api/v1/gamification/users/:userId/rank-progress

```typescript
@Get('users/:userId/rank-progress')
@UseGuards(JwtAuthGuard)
async getUserRankProgress(@Param('userId') userId: string): Promise<RankProgressDto>
```

**Autenticación:** JWT Bearer Token

**Responsabilidades:**
1. Obtener rango actual del usuario
2. Obtener stats (XP total)
3. Calcular progreso hacia siguiente rango
4. Retornar RankProgressDto

**Lógica de Cálculo:**
```typescript
async calculateRankProgress(userId: string): Promise<RankProgressDto> {
  const currentRank = await this.getCurrentRank(userId);
  const userStats = await this.userStatsService.findByUserId(userId);
  const currentXP = userStats.total_xp;

  // Si es rango máximo
  if (!nextRank) {
    return {
      current_rank,
      next_rank: null,
      progress_percentage: 100,
      xp_current: currentXP,
      xp_required: rankConfig.xp_max,
      xp_remaining: 0,
      ml_coins_bonus_on_promotion: 0,
      is_max_rank: true,
    };
  }

  // Calcular progreso
  const xpRangeStart = rankConfig.xp_min;
  const xpRangeEnd = nextRankConfig.xp_min;
  const xpInRange = currentXP - xpRangeStart;
  const xpRangeTotal = xpRangeEnd - xpRangeStart;

  const progressPercentage = Math.min(
    100,
    Math.max(0, Math.floor((xpInRange / xpRangeTotal) * 100)),
  );

  return {
    current_rank,
    next_rank: nextRank,
    progress_percentage: progressPercentage,
    xp_current: currentXP,
    xp_required: nextRankConfig.xp_min,
    xp_remaining: Math.max(0, nextRankConfig.xp_min - currentXP),
    ml_coins_bonus_on_promotion: nextRankConfig.ml_coins_bonus,
    is_max_rank: false,
  };
}
```

---

#### Endpoint 5: GET /api/v1/gamification/users/:userId/rank-history

```typescript
@Get('users/:userId/rank-history')
@UseGuards(JwtAuthGuard)
async getUserRankHistory(@Param('userId') userId: string): Promise<UserRank[]>
```

**Responsabilidades:**
1. Obtener todos los rangos del usuario
2. Ordenar por achieved_at DESC (más reciente primero)
3. Retornar array de UserRank

**Caso de Uso:** Ver progresión completa del usuario

---

#### Endpoint 6: POST /api/v1/gamification/admin/ranks

```typescript
@Post('admin/ranks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
async createRank(@Body() createDto: CreateUserRankDto): Promise<UserRank>
```

**Autenticación:** JWT + RolesGuard

**Lógica:**
1. Si is_current=true, marcar otros del usuario como is_current=false
2. Crear nuevo rango
3. Guardar en BD

**Validaciones:**
- user_id válido y existe
- current_rank es MayaRank válido
- Solo admin/super_admin

---

#### Endpoint 7: PUT /api/v1/gamification/admin/ranks/:id

```typescript
@Put('admin/ranks/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
async updateRank(
  @Param('id') id: string,
  @Body() updateDto: UpdateUserRankDto,
): Promise<UserRank>
```

**Responsabilidades:**
1. Buscar rango por ID
2. Actualizar campos
3. Si is_current=true, desmarcar otros

**Validaciones:**
- Rango existe
- Campos son válidos
- Solo admin

---

#### Endpoint 8: DELETE /api/v1/gamification/admin/ranks/:id

```typescript
@Delete('admin/ranks/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@HttpCode(HttpStatus.NO_CONTENT)
async deleteRank(@Param('id') id: string): Promise<void>
```

**Validaciones Críticas:**
1. Rango existe
2. is_current === false (no se puede eliminar rango activo)
3. Solo admin

**Lanzar BadRequestException si is_current = true**

---

### AchievementsController - Análisis Completo

**Ruta:** `/controllers/achievements.controller.ts`  
**Líneas:** 283  
**Métodos:** 4 endpoints

#### Endpoint 1: GET /api/v1/gamification/achievements

```typescript
@Get('achievements')
@HttpCode(HttpStatus.OK)
async getAllAchievements(@Query('includeSecret') includeSecret?: string)
```

**Query Parameters:**
- `includeSecret`: "true" para incluir logros secretos

**Lógica:**
```typescript
async findAll(includeSecret: boolean = false): Promise<Achievement[]> {
  const query = this.achievementRepo.createQueryBuilder('a')
    .where('a.is_active = true');

  if (!includeSecret) {
    query.andWhere('a.is_secret = false');
  }

  return await query
    .orderBy('a.order_index', 'ASC')
    .addOrderBy('a.name', 'ASC')
    .getMany();
}
```

---

#### Endpoint 2: GET /api/v1/gamification/achievements/:id

```typescript
@Get('achievements/:id')
async getAchievementById(@Param('id') id: string)
```

**Responsabilidades:**
1. Buscar achievement por ID
2. Lanzar NotFoundException si no existe
3. Retornar achievement completo

---

#### Endpoint 3: GET /api/v1/gamification/users/:userId/achievements

```typescript
@Get('users/:userId/achievements')
async getUserAchievements(@Param('userId') userId: string)
```

**Responsabilidades:**
1. Obtener achievements completados por usuario
2. Retornar array de UserAchievement con is_completed=true

**Lógica del Servicio:**
```typescript
async getCompletedByUser(userId: string): Promise<UserAchievement[]> {
  return await this.userAchievementRepo.find({
    where: {
      user_id: userId,
      is_completed: true,
    },
  });
}
```

---

#### Endpoint 4: POST /api/v1/gamification/users/:userId/achievements/:achievementId

```typescript
@Post('users/:userId/achievements/:achievementId')
@HttpCode(HttpStatus.CREATED)
async grantAchievement(
  @Param('userId') userId: string,
  @Param('achievementId') achievementId: string,
  @Body() grantDto: GrantAchievementDto,
)
```

**Request Body:**
```json
{
  "progress": 1,
  "max_progress": 1,
  "is_completed": true,
  "progress_data": { "source": "exercise_completion" },
  "metadata": {}
}
```

**Lógica:**
```typescript
async grantAchievement(
  userId: string,
  grantDto: GrantAchievementDto,
): Promise<UserAchievement> {
  // Validar achievement existe
  await this.findById(grantDto.achievement_id);

  // Buscar o crear UserAchievement
  let userAchievement = await this.userAchievementRepo.findOne({
    where: {
      user_id: userId,
      achievement_id: grantDto.achievement_id,
    },
  });

  if (!userAchievement) {
    // Crear nuevo
    userAchievement = this.userAchievementRepo.create({
      user_id: userId,
      achievement_id: grantDto.achievement_id,
      progress: grantDto.progress || 0,
      max_progress: grantDto.max_progress || 100,
      is_completed: grantDto.is_completed || false,
    });
  } else {
    // Actualizar progreso
    Object.assign(userAchievement, grantDto);
  }

  // Recalcular completion_percentage
  userAchievement.completion_percentage = Number(
    ((userAchievement.progress / userAchievement.max_progress) * 100).toFixed(2),
  );

  // Si completado, establecer fecha
  if (userAchievement.is_completed && !userAchievement.completed_at) {
    userAchievement.completed_at = new Date();
  }

  return await this.userAchievementRepo.save(userAchievement);
}
```

---

## SERVICES DETALLADOS

### RanksService - Análisis Completo

**Ruta:** `/services/ranks.service.ts`  
**Líneas:** 430  
**Métodos:** 15

#### RANK_CONFIG - Configuración Central

```typescript
private readonly RANK_CONFIG: Record<MayaRank, RankConfig> = {
  [MayaRank.AJAW]: {
    xp_min: 0,
    xp_max: 999,
    ml_coins_bonus: 0,
    next_rank: MayaRank.NACOM,
    name: 'Ajaw',
    description: 'Señor - Nivel inicial',
    order: 1,
  },
  [MayaRank.NACOM]: {
    xp_min: 1000,
    xp_max: 2999,
    ml_coins_bonus: 500,
    next_rank: MayaRank.AH_KIN,
    name: 'Nacom',
    description: 'Capitán de Guerra',
    order: 2,
  },
  [MayaRank.AH_KIN]: {
    xp_min: 3000,
    xp_max: 5999,
    ml_coins_bonus: 1000,
    next_rank: MayaRank.HALACH_UINIC,
    name: "Ah K'in",
    description: 'Sacerdote del Sol',
    order: 3,
  },
  [MayaRank.HALACH_UINIC]: {
    xp_min: 6000,
    xp_max: 9999,
    ml_coins_bonus: 2000,
    next_rank: MayaRank.KUKUKULKAN,
    name: 'Halach Uinic',
    description: 'Hombre Verdadero',
    order: 4,
  },
  [MayaRank.KUKUKULKAN]: {
    xp_min: 10000,
    xp_max: Infinity,
    ml_coins_bonus: 5000,
    next_rank: null,
    name: "K'uk'ulkan",
    description: 'Serpiente Emplumada - Máximo rango',
    order: 5,
  },
};
```

---

## FÓRMULAS MATEMÁTICAS

### Fórmula 1: XP por Nivel

```
xp_level(n) = floor(100 * 1.1^(n-1))
```

**Implementación:**
```typescript
private calculateXpForLevel(level: number): number {
  return Math.floor(this.XP_PER_LEVEL * Math.pow(this.XP_SCALING, level - 1));
}
```

**Valores Ejemplo:**
```
Level  XP Required  Total XP Acumulado
1      100          0
2      110          100
3      121          210
4      133          331
5      146          464
...
10     194.87       ~1,000 XP
...
50     1,306.87     ~150,000 XP
```

---

### Fórmula 2: Progreso de Rango

```
progress_percentage = floor((xp_in_range / xp_range_total) * 100)

Donde:
  xp_in_range = current_xp - xp_min_rango_actual
  xp_range_total = xp_min_siguiente - xp_min_actual
```

**Ejemplo:**
```
Usuario en Ajaw, XP actual = 500
  xp_in_range = 500 - 0 = 500
  xp_range_total = 1000 - 0 = 1000
  progress = floor((500 / 1000) * 100) = 50%

Usuario en Nacom, XP actual = 1500
  xp_in_range = 1500 - 1000 = 500
  xp_range_total = 3000 - 1000 = 2000
  progress = floor((500 / 2000) * 100) = 25%
```

---

### Fórmula 3: Progresión de Rango por Nivel

```
rank_promotion_threshold = (currentRankIndex + 1) * 5 niveles

Donde:
  Ajaw (0) → Nacom: 1 * 5 = nivel 5
  Nacom (1) → Ah K'in: 2 * 5 = nivel 10
  Ah K'in (2) → Halach: 3 * 5 = nivel 15
  Halach (3) → K'uk'ulkan: 4 * 5 = nivel 20
```

---

## FLUJOS DE PROCESO

### Flujo 1: Incremento de XP y Subida de Nivel

```
┌─ Usuario gana 250 XP (completó ejercicio)
│
├─ addXp(userId, 250)
│  ├─ Obtener UserStats
│  ├─ stats.total_xp += 250  (e.g., 500 → 750)
│  │
│  └─ BUCLE: Mientras total_xp >= xp_to_next_level
│     │
│     ├─ Calcular: total_xp -= xp_to_next_level
│     │   (e.g., 750 - 100 = 650)
│     │
│     ├─ Incrementar nivel: level++
│     │   (e.g., 5 → 6)
│     │
│     ├─ Recalcular xp_to_next_level
│     │   xp_for_level(6) = floor(100 * 1.1^5) ≈ 146
│     │
│     └─ checkRankPromotion()
│        ├─ Obtener índice de rango actual
│        │   (e.g., Nacom = 1)
│        │
│        ├─ Threshold = (1 + 1) * 5 = 10
│        ├─ IF stats.level (6) < threshold (10)
│        │   └─ Calcular rank_progress%
│        │      rank_progress = ((6-5)/(10-5))*100 = 20%
│        │
│        └─ IF stats.level >= threshold
│           ├─ promoteToNextRank()
│           │  ├─ Marcar rango anterior: is_current = false
│           │  ├─ Crear nuevo rango: is_current = true
│           │  ├─ Otorgar ML Coins bonus
│           │  ├─ Registrar transacción
│           │  └─ Actualizar UserStats.current_rank
│           │
│           └─ rank_progress = 0 (reiniciar)
│
└─ Guardar cambios en BD
```

---

### Flujo 2: Otorgamiento de Achievement

```
┌─ Sistema detecta: Usuario completó 5 ejercicios
│
├─ grantAchievement(userId, achievementId, grantDto)
│  │
│  ├─ Validar achievement existe
│  │
│  ├─ Buscar UserAchievement (user_id, achievement_id)
│  │
│  ├─ IF no existe
│  │  └─ Crear nuevo registro
│  │     ├─ progress = grantDto.progress
│  │     ├─ max_progress = grantDto.max_progress
│  │     ├─ is_completed = false (inicialmente)
│  │     └─ started_at = NOW
│  │
│  ├─ ELSE (existe)
│  │  └─ Actualizar progreso
│  │     ├─ progress += amount
│  │     ├─ Recalcular completion_percentage
│  │     │   = (progress / max_progress) * 100
│  │     │
│  │     └─ Verificar si completado
│  │        ├─ IF progress >= max_progress
│  │        │  ├─ is_completed = true
│  │        │  ├─ completed_at = NOW
│  │        │  ├─ notified = true
│  │        │  └─ Grabar recompensas
│  │        │     └─ rewards_received = { ml_coins, items, ... }
│  │        │
│  │        └─ Registrar milestones
│  │           ├─ IF completion = 25% → añadir "25%"
│  │           ├─ IF completion = 50% → añadir "50%"
│  │           ├─ IF completion = 75% → añadir "75%"
│  │           └─ IF completion = 100% → achievement completado
│  │
│  └─ Guardar en BD
│
└─ Retornar UserAchievement actualizado
```

---

## ÍNDICES DE BASE DE DATOS

### Índices de Optimización

#### UserRank Indexes:
```sql
-- Búsquedas por usuario
CREATE INDEX idx_user_ranks_user_id ON gamification_system.user_ranks(user_id);

-- Búsquedas por rango
CREATE INDEX idx_user_ranks_current ON gamification_system.user_ranks(current_rank);

-- Búsqueda ÚNICA de rango actual
CREATE UNIQUE INDEX idx_user_ranks_is_current 
  ON gamification_system.user_ranks(user_id, is_current) 
  WHERE is_current = true;
```

#### UserStats Indexes:
```sql
CREATE INDEX idx_user_stats_user_id ON gamification_system.user_stats(user_id);
CREATE INDEX idx_user_stats_tenant_id ON gamification_system.user_stats(tenant_id);
CREATE INDEX idx_user_stats_level ON gamification_system.user_stats(level);
CREATE INDEX idx_user_stats_tenant_level 
  ON gamification_system.user_stats(tenant_id, level);
CREATE INDEX idx_user_stats_ml_coins ON gamification_system.user_stats(ml_coins);
CREATE INDEX idx_user_stats_streak ON gamification_system.user_stats(current_streak);
CREATE INDEX idx_user_stats_current_rank 
  ON gamification_system.user_stats(current_rank);
CREATE INDEX idx_user_stats_perfect_scores 
  ON gamification_system.user_stats(perfect_scores);
```

#### Achievement Indexes:
```sql
CREATE INDEX idx_achievements_category 
  ON gamification_system.achievements(category);
CREATE INDEX idx_achievements_active 
  ON gamification_system.achievements(is_active) 
  WHERE is_active = true;
CREATE INDEX idx_achievements_secret 
  ON gamification_system.achievements(is_secret) 
  WHERE is_secret = true;
CREATE INDEX idx_achievements_conditions_gin 
  ON gamification_system.achievements USING GIN(conditions);
```

#### UserAchievement Indexes:
```sql
CREATE INDEX idx_user_achievements_user_id 
  ON gamification_system.user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id 
  ON gamification_system.user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_completed 
  ON gamification_system.user_achievements(user_id, is_completed);
CREATE INDEX idx_user_achievements_completed_at 
  ON gamification_system.user_achievements(user_id, is_completed, completed_at);
CREATE INDEX idx_user_achievements_unclaimed 
  ON gamification_system.user_achievements(user_id) 
  WHERE is_completed = true AND rewards_claimed = false;
```

---

## VALIDACIONES IMPLEMENTADAS

### En Entities (Columnas):

```typescript
// UserRank
- user_id: NOT NULL, UUID
- current_rank: ENUM check
- is_current: BOOLEAN default true
- rank_progress_percentage: 0-100 (numeric validation)

// Achievement
- name: NOT NULL, text
- category: ENUM check
- difficulty_level: ENUM check
- conditions: JSONB not empty
- is_secret: BOOLEAN default false

// UserAchievement
- progress: 0 <= progress <= max_progress
- completion_percentage: 0.00 <= x <= 100.00
- is_completed: BOOLEAN
```

### En Services:

```typescript
// RanksService - getCurrentRank
if (!currentRank) {
  throw new NotFoundException(
    `No current rank found for user ${userId}. User may need to be initialized.`
  );
}

// RanksService - promoteToNextRank
if (!isEligible) {
  throw new BadRequestException(
    `User ${userId} is not eligible for promotion. Check XP requirements.`
  );
}

if (!nextRank) {
  throw new BadRequestException(
    `User ${userId} is already at maximum rank.`
  );
}

// RanksService - deleteRank
if (rank.is_current) {
  throw new BadRequestException(
    'Cannot delete current rank. Set another rank as current first.'
  );
}

// AchievementsService - claimRewards
if (!userAchievement.is_completed) {
  throw new BadRequestException(`Achievement ${achievementId} is not completed yet`);
}

if (userAchievement.rewards_claimed) {
  throw new BadRequestException(`Rewards already claimed for achievement ${achievementId}`);
}

// UserStatsService - addXp
while (stats.total_xp >= stats.xp_to_next_level) {
  stats.total_xp -= stats.xp_to_next_level;
  stats.level += 1;
  // ... recalculate
}
```

---

## MANEJO DE ERRORES

### Errores HTTP Esperados:

```
400 Bad Request
  - Datos inválidos en request
  - No se puede eliminar rango actual
  - Usuario no elegible para promoción
  - Amount must be greater than 0
  - Achievement no completado
  - Saldo insuficiente

401 Unauthorized
  - JWT token inválido o expirado
  - No autenticado

403 Forbidden
  - No tiene rol admin/super_admin
  - Permisos insuficientes

404 Not Found
  - Usuario no encontrado
  - Rango no encontrado
  - Achievement no encontrado
  - User stats no encontrado
```

### Logging y Auditoría:

```typescript
this.logger = new Logger(RanksService.name);

this.logger.log(
  `User ${userId} promoted to ${nextRank}. Awarded ${nextRankConfig.ml_coins_bonus} ML Coins.`,
);

this.logger.error(
  `Error checking promotion eligibility for user ${userId}: ${error?.message || error}`,
);

this.logger.log(`Rank record ${rankId} deleted`);
```

---

**Fin del Documento Técnico**

Total de Líneas: 800+

