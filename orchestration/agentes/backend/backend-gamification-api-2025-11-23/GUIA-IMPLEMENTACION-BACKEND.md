# GUIA DE IMPLEMENTACION - BACKEND AGENT

**Tarea:** Validar y completar endpoints de gamificación
**Prioridad:** P1
**Estimado:** 1 día

---

## RESUMEN

Validar que endpoints existentes funcionan correctamente y crear endpoints faltantes para ML Coins transactions.

---

## CHECKLIST DE TAREAS

### ✅ FASE 1: Validación de Endpoints Existentes (2h)

#### 1.1 User Stats Endpoints

**Validar:**
- [ ] `GET /api/v1/gamification/users/:userId/stats`
- [ ] `PATCH /api/v1/gamification/users/:userId/stats`
- [ ] `GET /api/v1/gamification/users/:userId/rank`

**Testing:**

```bash
# Test GET stats
curl -X GET \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3006/api/v1/gamification/users/USER_ID/stats

# Expected response:
{
  "id": "uuid",
  "user_id": "uuid",
  "level": 5,
  "total_xp": 250,
  "xp_to_next_level": 121,
  "current_rank": "Nacom",
  "rank_progress": 45.5,
  "ml_coins": 500,
  "ml_coins_earned_total": 1000,
  "ml_coins_spent_total": 500,
  "current_streak": 3,
  "max_streak": 10,
  "days_active_total": 15,
  "exercises_completed": 28,
  "modules_completed": 4,
  "total_score": 890,
  "achievements_earned": 8,
  "certificates_earned": 2,
  "sessions_count": 45
}

# Test PATCH stats (increment XP)
curl -X PATCH \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"total_xp_increment": 50, "xp_source": "exercise_completion"}' \
  http://localhost:3006/api/v1/gamification/users/USER_ID/stats

# Expected: Updated stats with new XP
```

**Validación:**
- [ ] Response tiene todos los campos necesarios
- [ ] Tipos de datos son correctos
- [ ] Autenticación JWT funciona
- [ ] Manejo de errores apropiado (404, 401, 500)

**Ajustes necesarios (si aplica):**

Si `PATCH` no soporta `total_xp_increment`:

```typescript
// En user-stats.controller.ts
@Patch('users/:userId/stats')
async updateUserStats(
  @Param('userId') userId: string,
  @Body() updateData: UpdateUserStatsDto,
) {
  // Support increment operations
  if (updateData.total_xp_increment) {
    const currentStats = await this.userStatsService.findByUserId(userId);
    updateData.total_xp = currentStats.total_xp + updateData.total_xp_increment;
    delete updateData.total_xp_increment;
  }

  if (updateData.ml_coins_increment) {
    const currentStats = await this.userStatsService.findByUserId(userId);
    updateData.ml_coins = currentStats.ml_coins + updateData.ml_coins_increment;
    updateData.ml_coins_earned_total = currentStats.ml_coins_earned_total + updateData.ml_coins_increment;
    delete updateData.ml_coins_increment;
  }

  if (updateData.ml_coins_decrement) {
    const currentStats = await this.userStatsService.findByUserId(userId);
    updateData.ml_coins = currentStats.ml_coins - updateData.ml_coins_decrement;
    updateData.ml_coins_spent_total = currentStats.ml_coins_spent_total + updateData.ml_coins_decrement;
    delete updateData.ml_coins_decrement;
  }

  return await this.userStatsService.updateStats(userId, updateData);
}
```

DTO:
```typescript
// update-user-stats.dto.ts
export class UpdateUserStatsDto {
  // Direct updates
  @IsOptional()
  @IsNumber()
  total_xp?: number;

  @IsOptional()
  @IsNumber()
  ml_coins?: number;

  // Increment operations (more convenient for frontend)
  @IsOptional()
  @IsNumber()
  total_xp_increment?: number;

  @IsOptional()
  @IsNumber()
  ml_coins_increment?: number;

  @IsOptional()
  @IsNumber()
  ml_coins_decrement?: number;

  @IsOptional()
  @IsString()
  xp_source?: string;

  @IsOptional()
  @IsString()
  description?: string;

  // Other fields...
}
```

#### 1.2 Achievements Endpoints

**Validar:**
- [ ] `GET /api/v1/gamification/achievements`
- [ ] `GET /api/v1/gamification/users/:userId/achievements`
- [ ] `POST /api/v1/gamification/users/:userId/achievements/:achievementId`

**Testing:**

```bash
# Test get all achievements
curl -X GET \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3006/api/v1/gamification/achievements

# Test get user achievements
curl -X GET \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3006/api/v1/gamification/users/USER_ID/achievements

# Expected response:
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "achievement_id": "achievement-uuid",
    "is_completed": true,
    "completed_at": "2025-11-23T10:30:00Z",
    "progress": 1,
    "max_progress": 1
  }
]
```

**Validación:**
- [ ] Response formato correcto
- [ ] achievement_id presente (frontend lo necesita)
- [ ] is_completed field presente

#### 1.3 Leaderboard Endpoints

**Validar:**
- [ ] `GET /api/v1/gamification/leaderboard/global`
- [ ] `GET /api/v1/gamification/leaderboard/schools/:schoolId`
- [ ] `GET /api/v1/gamification/leaderboard/classrooms/:classroomId`

**Testing:**

```bash
# Test global leaderboard
curl -X GET \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3006/api/v1/gamification/leaderboard/global?limit=10&offset=0"

# Expected response:
{
  "type": "global",
  "entries": [
    {
      "rank": 1,
      "userId": "uuid",
      "username": "Juan Pérez",
      "totalXP": 15000,
      "level": 25,
      "currentRank": "Nacom",
      "streak": 45,
      "achievementCount": 12
    }
  ],
  "totalEntries": 1500,
  "lastUpdated": "2025-11-23T10:30:00Z"
}
```

**Validación:**
- [ ] Paginación funciona correctamente
- [ ] Orden por XP descendente
- [ ] Campos necesarios presentes

#### 1.4 Ranks Endpoints

**Validar:**
- [ ] `GET /api/v1/gamification/ranks/current`
- [ ] `GET /api/v1/gamification/users/:userId/rank-progress`
- [ ] `POST /api/v1/gamification/ranks/promote/:userId`

**Testing:**

```bash
# Test get current rank
curl -X GET \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3006/api/v1/gamification/ranks/current

# Test get rank progress
curl -X GET \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3006/api/v1/gamification/users/USER_ID/rank-progress

# Expected response:
{
  "current_rank": "Nacom",
  "level": 5,
  "current_xp": 250,
  "xp_to_next_level": 100,
  "total_xp": 500,
  "next_rank": "Ah K'in",
  "can_rank_up": false,
  "multiplier": 1.0
}

# Test promote
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3006/api/v1/gamification/ranks/promote/USER_ID
```

**Validación:**
- [ ] Promoción funciona correctamente
- [ ] can_rank_up calcula correctamente
- [ ] Multipliers se actualizan

#### 1.5 Comodines Endpoints

**Validar:**
- [ ] `POST /api/v1/gamification/comodines/purchase`
- [ ] `POST /api/v1/gamification/comodines/use`
- [ ] `GET /api/v1/gamification/users/:userId/inventory`

**Testing:**

```bash
# Test purchase
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USER_ID",
    "comodin_type": "pistas",
    "quantity": 3
  }' \
  http://localhost:3006/api/v1/gamification/comodines/purchase

# Expected: Updated inventory with purchased comodines

# Test use
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USER_ID",
    "comodin_type": "pistas",
    "quantity": 1,
    "exercise_id": "EXERCISE_ID"
  }' \
  http://localhost:3006/api/v1/gamification/comodines/use

# Test inventory
curl -X GET \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3006/api/v1/gamification/users/USER_ID/inventory
```

**Validación:**
- [ ] Purchase deduce ML Coins correctamente
- [ ] Inventory actualiza
- [ ] Use decrementa disponibilidad

### ✅ FASE 2: Endpoints Adicionales (si necesarios) (2h)

#### 2.1 ML Coins Transactions Endpoint (opcional)

Si frontend necesita historial de transacciones separado:

**Nuevo Endpoint:**
`GET /api/v1/gamification/users/:userId/ml-coins/transactions`

**Implementación:**

```typescript
// ml-coins.controller.ts
@Get('users/:userId/ml-coins/transactions')
@HttpCode(HttpStatus.OK)
@ApiOperation({
  summary: 'Get ML Coins transaction history',
  description: 'Obtiene el historial de transacciones de ML Coins del usuario',
})
@ApiParam({
  name: 'userId',
  description: 'ID del usuario',
  type: String,
})
@ApiQuery({
  name: 'limit',
  required: false,
  type: Number,
  description: 'Cantidad de transacciones (default: 50)',
})
@ApiQuery({
  name: 'offset',
  required: false,
  type: Number,
  description: 'Offset para paginación (default: 0)',
})
async getTransactionHistory(
  @Param('userId') userId: string,
  @Query('limit') limit?: number,
  @Query('offset') offset?: number,
): Promise<Transaction[]> {
  const parsedLimit = limit ? parseInt(String(limit), 10) : 50;
  const parsedOffset = offset ? parseInt(String(offset), 10) : 0;

  return await this.mlCoinsService.getTransactionHistory(
    userId,
    parsedLimit,
    parsedOffset,
  );
}
```

**Service:**

```typescript
// ml-coins.service.ts
async getTransactionHistory(
  userId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<Transaction[]> {
  // Query from inventory_transactions table
  const transactions = await this.inventoryTransactionsRepository.find({
    where: { user_id: userId },
    order: { created_at: 'DESC' },
    take: limit,
    skip: offset,
  });

  // Transform to Transaction format
  return transactions.map(tx => ({
    id: tx.id,
    type: tx.transaction_type === 'PURCHASE' ? 'spend' : 'earn',
    amount: tx.quantity,
    source: tx.metadata?.source || 'unknown',
    description: tx.metadata?.description || '',
    timestamp: tx.created_at,
    balanceAfter: 0, // Calculate if needed
    metadata: tx.metadata,
  }));
}
```

#### 2.2 Batch Operations (opcional)

Si necesitas optimizar múltiples requests:

```typescript
// batch.controller.ts
@Post('users/:userId/gamification/batch')
@HttpCode(HttpStatus.OK)
async getBatchData(
  @Param('userId') userId: string,
  @Body() request: BatchRequestDto,
): Promise<BatchResponseDto> {
  const [stats, achievements, rankProgress] = await Promise.all([
    request.include_stats ? this.userStatsService.findByUserId(userId) : null,
    request.include_achievements ? this.achievementsService.getCompletedByUser(userId) : null,
    request.include_rank_progress ? this.ranksService.calculateRankProgress(userId) : null,
  ]);

  return {
    stats,
    achievements: achievements?.map(a => a.achievement_id),
    rankProgress,
  };
}
```

**DTO:**
```typescript
export class BatchRequestDto {
  @IsOptional()
  @IsBoolean()
  include_stats?: boolean;

  @IsOptional()
  @IsBoolean()
  include_achievements?: boolean;

  @IsOptional()
  @IsBoolean()
  include_rank_progress?: boolean;
}
```

Esto permite al frontend hacer una sola llamada en vez de 3.

### ✅ FASE 3: Tests E2E (2h)

**Crear tests para flujos completos:**

```typescript
// gamification-api.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Gamification API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login and get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword',
      });

    authToken = loginResponse.body.access_token;
    testUserId = loginResponse.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User Stats', () => {
    it('GET /users/:userId/stats - should return user stats', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/gamification/users/${testUserId}/stats`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('user_id');
          expect(res.body).toHaveProperty('level');
          expect(res.body).toHaveProperty('total_xp');
          expect(res.body).toHaveProperty('ml_coins');
          expect(res.body).toHaveProperty('current_rank');
        });
    });

    it('PATCH /users/:userId/stats - should update XP', async () => {
      const currentStats = await request(app.getHttpServer())
        .get(`/api/v1/gamification/users/${testUserId}/stats`)
        .set('Authorization', `Bearer ${authToken}`);

      const currentXP = currentStats.body.total_xp;

      return request(app.getHttpServer())
        .patch(`/api/v1/gamification/users/${testUserId}/stats`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ total_xp_increment: 50 })
        .expect(200)
        .expect((res) => {
          expect(res.body.total_xp).toBe(currentXP + 50);
        });
    });
  });

  describe('Achievements', () => {
    it('GET /users/:userId/achievements - should return user achievements', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/gamification/users/${testUserId}/achievements`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('achievement_id');
            expect(res.body[0]).toHaveProperty('is_completed');
          }
        });
    });
  });

  describe('Leaderboard', () => {
    it('GET /leaderboard/global - should return global leaderboard', () => {
      return request(app.getHttpServer())
        .get('/api/v1/gamification/leaderboard/global?limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('type', 'global');
          expect(res.body).toHaveProperty('entries');
          expect(Array.isArray(res.body.entries)).toBe(true);
        });
    });
  });

  describe('Comodines', () => {
    it('POST /comodines/purchase - should purchase comodines', () => {
      return request(app.getHttpServer())
        .post('/api/v1/gamification/comodines/purchase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          user_id: testUserId,
          comodin_type: 'pistas',
          quantity: 1,
        })
        .expect((res) => {
          // Expect 201 or 400 if insufficient balance
          expect([201, 400]).toContain(res.status);
        });
    });

    it('GET /users/:userId/inventory - should return inventory', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/gamification/users/${testUserId}/inventory`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('pistas');
          expect(res.body).toHaveProperty('vision_lectora');
          expect(res.body).toHaveProperty('segunda_oportunidad');
        });
    });
  });

  describe('Ranks', () => {
    it('GET /ranks/current - should return current rank', () => {
      return request(app.getHttpServer())
        .get('/api/v1/gamification/ranks/current')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('current_rank');
          expect(res.body).toHaveProperty('level');
        });
    });

    it('GET /users/:userId/rank-progress - should return rank progress', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/gamification/users/${testUserId}/rank-progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('current_rank');
          expect(res.body).toHaveProperty('next_rank');
          expect(res.body).toHaveProperty('can_rank_up');
        });
    });
  });

  describe('Full Flow: Earn XP -> Level Up -> Rank Up', () => {
    it('should handle complete progression flow', async () => {
      // 1. Get current stats
      const initialStats = await request(app.getHttpServer())
        .get(`/api/v1/gamification/users/${testUserId}/stats`)
        .set('Authorization', `Bearer ${authToken}`);

      const initialLevel = initialStats.body.level;
      const initialRank = initialStats.body.current_rank;

      // 2. Add enough XP to level up
      await request(app.getHttpServer())
        .patch(`/api/v1/gamification/users/${testUserId}/stats`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ total_xp_increment: 1000 })
        .expect(200);

      // 3. Check if leveled up
      const newStats = await request(app.getHttpServer())
        .get(`/api/v1/gamification/users/${testUserId}/stats`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(newStats.body.level).toBeGreaterThanOrEqual(initialLevel);

      // 4. Check rank progress
      const rankProgress = await request(app.getHttpServer())
        .get(`/api/v1/gamification/users/${testUserId}/rank-progress`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(rankProgress.body).toHaveProperty('can_rank_up');

      // 5. If can rank up, promote
      if (rankProgress.body.can_rank_up) {
        const promoteResponse = await request(app.getHttpServer())
          .post(`/api/v1/gamification/ranks/promote/${testUserId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(promoteResponse.body).toHaveProperty('new_rank');
        expect(promoteResponse.body.new_rank).not.toBe(initialRank);
      }
    });
  });
});
```

**Ejecutar tests:**
```bash
npm run test:e2e
```

### ✅ FASE 4: Documentación Swagger (1h)

**Actualizar documentación:**

```typescript
// En cada controller, asegurar que tenga:

@ApiTags('Gamification - User Stats')
@ApiBearerAuth()
@Controller('gamification')
export class UserStatsController {
  @Get('users/:userId/stats')
  @ApiOperation({
    summary: 'Get user gamification stats',
    description: 'Obtiene las estadísticas completas de gamificación para un usuario',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario en formato UUID',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        id: 'uuid',
        user_id: 'uuid',
        level: 5,
        total_xp: 250,
        // ... all fields
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  async getUserStats(@Param('userId') userId: string) {
    return await this.userStatsService.findByUserId(userId);
  }
}
```

**Verificar Swagger UI:**
```
http://localhost:3006/api-docs
```

Asegurar que:
- [ ] Todos los endpoints están documentados
- [ ] Ejemplos de request/response están actualizados
- [ ] Autenticación JWT está indicada
- [ ] Códigos de error documentados

### ✅ FASE 5: Performance y Optimización (1h)

**Optimizaciones sugeridas:**

#### 5.1 Caching con Redis (opcional)

```typescript
// user-stats.service.ts
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UserStatsService {
  constructor(
    @InjectRepository(UserStats)
    private userStatsRepository: Repository<UserStats>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async findByUserId(userId: string): Promise<UserStats> {
    // Check cache first
    const cacheKey = `user-stats:${userId}`;
    const cached = await this.cacheManager.get<UserStats>(cacheKey);

    if (cached) {
      return cached;
    }

    // Fetch from database
    const stats = await this.userStatsRepository.findOne({
      where: { user_id: userId },
    });

    if (!stats) {
      throw new NotFoundException(`No stats found for user ${userId}`);
    }

    // Cache for 5 minutes
    await this.cacheManager.set(cacheKey, stats, 300);

    return stats;
  }

  async updateStats(userId: string, updateData: any): Promise<UserStats> {
    // Update database
    await this.userStatsRepository.update({ user_id: userId }, updateData);

    // Invalidate cache
    await this.cacheManager.del(`user-stats:${userId}`);

    // Return updated stats
    return this.findByUserId(userId);
  }
}
```

#### 5.2 Database Indexes

Asegurar que existen índices en:

```sql
-- user_stats table
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_user_stats_total_xp ON user_stats(total_xp DESC);
CREATE INDEX idx_user_stats_current_rank ON user_stats(current_rank);

-- user_achievements table
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_completed ON user_achievements(is_completed);

-- comodines_inventory table
CREATE INDEX idx_comodines_inventory_user_id ON comodines_inventory(user_id);
```

#### 5.3 Query Optimization

Para leaderboard:

```typescript
// leaderboard.service.ts
async getGlobalLeaderboard(
  limit: number = 100,
  offset: number = 0,
): Promise<LeaderboardResponse> {
  // Use raw query for better performance
  const entries = await this.userStatsRepository
    .createQueryBuilder('stats')
    .leftJoinAndSelect('stats.user', 'user')
    .select([
      'stats.user_id',
      'stats.total_xp',
      'stats.level',
      'stats.current_rank',
      'stats.current_streak',
      'user.first_name',
      'user.last_name',
    ])
    .orderBy('stats.total_xp', 'DESC')
    .take(limit)
    .skip(offset)
    .getMany();

  // Add rank numbers
  const entriesWithRank = entries.map((entry, index) => ({
    rank: offset + index + 1,
    userId: entry.user_id,
    username: `${entry.user.first_name} ${entry.user.last_name}`,
    totalXP: entry.total_xp,
    level: entry.level,
    currentRank: entry.current_rank,
    streak: entry.current_streak,
  }));

  const total = await this.userStatsRepository.count();

  return {
    type: 'global',
    entries: entriesWithRank,
    totalEntries: total,
    lastUpdated: new Date().toISOString(),
  };
}
```

---

## COMANDOS UTILES

```bash
# Ejecutar backend
npm run start:dev

# Ejecutar tests
npm run test

# Ejecutar tests E2E
npm run test:e2e

# Ver Swagger docs
# http://localhost:3006/api-docs

# Type checking
npm run build

# Lint
npm run lint

# Format
npm run format
```

---

## VERIFICACION FINAL

- [ ] Todos los endpoints validados funcionan correctamente
- [ ] PATCH /users/:userId/stats soporta increment operations
- [ ] Responses coinciden con tipos TypeScript de frontend
- [ ] Tests E2E pasan (>80% coverage)
- [ ] Swagger documentation actualizada
- [ ] Performance optimizada (índices, caching)
- [ ] Manejo de errores apropiado
- [ ] Logging configurado
- [ ] No hay errores TypeScript
- [ ] No hay memory leaks

---

## COMUNICACION CON FRONTEND-AGENT

**Reportar:**
1. Cualquier cambio en estructura de respuestas
2. Nuevos endpoints creados
3. Campos deprecados o renombrados
4. Requisitos de autenticación adicionales
5. Limitaciones o restricciones descubiertas

**Ejemplo de reporte:**

```markdown
## Cambios en API - 2025-11-23

### Endpoint modificado: PATCH /users/:userId/stats

**Nuevo comportamiento:**
- Ahora soporta `total_xp_increment` en lugar de solo `total_xp`
- Ahora soporta `ml_coins_increment` y `ml_coins_decrement`
- Response incluye campo `leveled_up` (boolean)
- Response incluye campo `ranked_up` (boolean)

**Ejemplo request:**
```json
{
  "total_xp_increment": 50,
  "xp_source": "exercise_completion",
  "description": "Completed Detective Textual"
}
```

**Ejemplo response:**
```json
{
  "user_id": "uuid",
  "total_xp": 300,
  "current_xp": 50,
  "level": 6,
  "leveled_up": true,
  "ranked_up": false,
  ...
}
```

**Migración necesaria en frontend:**
- Cambiar de `total_xp` a `total_xp_increment` en calls
- Manejar `leveled_up` y `ranked_up` flags
```

---

## NOTAS ADICIONALES

- Mantener versionado de API (/api/v1/)
- Documentar breaking changes
- Considerar rate limiting para endpoints costosos
- Monitorear performance en producción
- Mantener logs para debugging

**Contacto Frontend-Agent:** Para coordinar cambios en contratos API

