# 📋 PLAN DE EJECUCIÓN - FASES 1-4

**Fecha:** 2025-11-02
**Agente:** NEXUS-BACKEND v1.0
**Basado en:** PLAN-COMPLETITUD-MIGRACION.md
**Alcance:** Fases 1-4 (Semanas 3-24 del plan original)

---

## 🎯 OBJETIVO

Implementar las Fases 1-4 del plan de migración backend, adaptando lo que ya existe y agregando solo lo necesario.

**Principios de implementación:**
1. ✅ **Adaptar lo existente** en lugar de reescribir
2. ✅ **Usar constantes globales** (DB_SCHEMAS, DB_TABLES, ENUMs)
3. ✅ **Validar contra DDL** de base de datos
4. ✅ **Respetar arquitectura NestJS** (módulos/controllers/services/DTOs/entities)
5. ✅ **Tocar lo menos posible** código existente funcional

---

## 📊 ESTADO ACTUAL IDENTIFICADO

### ✅ Ya Implementado (NO tocar)

**Base de Datos (`/apps/database`):**
- ✅ Enum `maya_rank` (5 rangos correctos)
- ✅ Tabla `user_ranks` con todos los campos
- ✅ Tabla `notifications`
- ✅ Schema `gamification_system` completo
- ✅ Schema `auth_management` completo
- ✅ Schema `progress_tracking` completo
- ✅ Schema `social_features` completo

**Backend (`/apps/backend`):**
- ✅ Constantes globales (`database.constants.ts`, `enums.constants.ts`)
- ✅ Entity `UserRank` (requiere ajuste menor)
- ✅ DTOs de UserRank (`user-rank-response.dto.ts`, `create-user-rank.dto.ts`)
- ✅ Services existentes: `UserStatsService`, `AchievementsService`, `MLCoinsService`
- ✅ Controllers existentes: `UserStatsController`, `AchievementsController`, `MLCoinsController`

### ❌ Faltante (A implementar)

**FASE 1:**
- ❌ RanksService (o UserRanksService)
- ❌ RanksController
- ❌ 7 endpoints de Rangos Maya
- ❌ Módulo Admin completo (31 endpoints)
- ❌ Módulo Notifications + socket.io (7 endpoints + WebSocket)
- ❌ Dockerfile
- ❌ nodemon.json
- ❌ node-cron (si requerido)

**FASES 2-4:**
- ❌ Teacher Portal (29 endpoints)
- ❌ Gamificación restante (~37 endpoints)
- ❌ Social/Guilds (10 endpoints)
- ❌ Tests migrados (10 faltantes)
- ❌ Coverage ≥60%

---

## 🗓️ PLANIFICACIÓN DETALLADA

---

## FASE 1: CRÍTICO - FUNCIONALIDAD CORE (4 SEMANAS)

### CICLO-3: Sistema de Rangos Maya (2 semanas)

**Objetivo:** Implementar sistema completo de rangos maya usando la BD y entidades existentes

#### ✅ Checklist Pre-Implementación

**Base de Datos:**
- [x] Enum `maya_rank` existe en BD
- [x] Tabla `user_ranks` existe en BD
- [x] Tabla tiene todos los campos requeridos

**Backend:**
- [x] Entity `UserRank` existe
- [x] DTOs de respuesta/creación existen
- [x] Constantes `DB_SCHEMAS.GAMIFICATION` definida
- [x] Constante `DB_TABLES.GAMIFICATION.USER_RANKS` definida
- [x] Enum `MayaRank` definido en `enums.constants.ts`

**Por hacer:**
- [ ] Ajustar UserRank entity (cambiar default 'mercenario' → 'Ajaw')
- [ ] Crear RanksService (o UserRanksService)
- [ ] Crear RanksController
- [ ] Implementar 7 endpoints
- [ ] Tests unitarios + integración
- [ ] Documentación

---

#### Micro 3-1: Ajuste de Entity UserRank (0.5 días)

**Archivo:** `apps/backend/src/modules/gamification/entities/user-rank.entity.ts`

**Cambios mínimos:**
1. Cambiar línea 10: `import { MayaRankEnum }` → `import { MayaRank }`
2. Cambiar línea 61: `default: 'mercenario'` → `default: 'Ajaw'`
3. Cambiar tipo de campo `current_rank` de `string` a usar el enum correcto

**Razón:** Migrar de enum legacy (`MayaRankEnum`) a enum correcto (`MayaRank`)

**No tocar:**
- Estructura de la entity
- Decoradores de TypeORM
- Índices
- Otros campos

---

#### Micro 3-2: Crear RanksService (4 días)

**Archivo:** `apps/backend/src/modules/gamification/services/ranks.service.ts`

**Responsabilidades:**
- Obtener rango actual del usuario
- Calcular progreso hacia siguiente rango
- Promover usuario a siguiente rango
- Historial de rangos
- Lógica de XP requerida por rango
- Bonos de ML Coins por promoción

**Métodos principales:**
```typescript
class RanksService {
  // Obtener rango actual
  async getCurrentRank(userId: string): Promise<UserRank>

  // Obtener todos los rangos del usuario (historial)
  async getUserRankHistory(userId: string): Promise<UserRank[]>

  // Calcular progreso hacia siguiente rango
  async calculateRankProgress(userId: string): Promise<RankProgressDto>

  // Promover a siguiente rango
  async promoteToNextRank(userId: string): Promise<UserRank>

  // Verificar si cumple requisitos para promoción
  async checkPromotionEligibility(userId: string): Promise<boolean>

  // Obtener configuración de rangos (XP requerida, bonos)
  getRankConfig(rank: MayaRank): RankConfig

  // ADMIN: Crear nuevo rango
  async createRank(userId: string, createDto: CreateUserRankDto): Promise<UserRank>

  // ADMIN: Actualizar rango manualmente
  async updateRank(rankId: string, updateDto: UpdateUserRankDto): Promise<UserRank>

  // ADMIN: Eliminar registro de rango
  async deleteRank(rankId: string): Promise<void>
}
```

**Dependencias:**
- `Repository<UserRank>` (TypeORM)
- `UserStatsService` (para obtener XP actual)
- `MLCoinsService` (para otorgar bonos)

**Constantes a usar:**
- `DB_SCHEMAS.GAMIFICATION`
- `DB_TABLES.GAMIFICATION.USER_RANKS`
- `MayaRank` enum

**Lógica de progresión:**
```typescript
const RANK_CONFIG = {
  [MayaRank.AJAW]: {
    xp_min: 0,
    xp_max: 999,
    ml_coins_bonus: 0,
    next_rank: MayaRank.NACOM
  },
  [MayaRank.NACOM]: {
    xp_min: 1000,
    xp_max: 2999,
    ml_coins_bonus: 500,
    next_rank: MayaRank.AH_KIN
  },
  [MayaRank.AH_KIN]: {
    xp_min: 3000,
    xp_max: 5999,
    ml_coins_bonus: 1000,
    next_rank: MayaRank.HALACH_UINIC
  },
  [MayaRank.HALACH_UINIC]: {
    xp_min: 6000,
    xp_max: 9999,
    ml_coins_bonus: 2000,
    next_rank: MayaRank.KUKUKULKAN
  },
  [MayaRank.KUKUKULKAN]: {
    xp_min: 10000,
    xp_max: Infinity,
    ml_coins_bonus: 5000,
    next_rank: null // Máximo rango
  },
};
```

**Tests requeridos:**
- Test unitario: getRankConfig()
- Test unitario: calculateRankProgress()
- Test unitario: checkPromotionEligibility()
- Test integración: promoteToNextRank() con BD
- Coverage objetivo: ≥80%

---

#### Micro 3-3: Crear RanksController (2 días)

**Archivo:** `apps/backend/src/modules/gamification/controllers/ranks.controller.ts`

**7 Endpoints a implementar:**

**Endpoints Públicos (Students):**
```typescript
// 1. GET /api/ranks
// Listar todos los rangos disponibles (metadata)
@Get()
async listRanks(): Promise<RankMetadataDto[]>

// 2. GET /api/ranks/current
// Obtener rango actual del usuario autenticado
@Get('current')
@UseGuards(JwtAuthGuard)
async getCurrentRank(@Request() req): Promise<UserRankResponseDto>

// 3. GET /api/ranks/:id
// Detalles de un rango específico
@Get(':id')
async getRankDetails(@Param('id') id: string): Promise<RankDetailsDto>

// 4. GET /api/users/:userId/rank-progress
// Progreso hacia siguiente rango
@Get('users/:userId/rank-progress')
@UseGuards(JwtAuthGuard)
async getUserRankProgress(@Param('userId') userId: string): Promise<RankProgressDto>
```

**Endpoints Admin:**
```typescript
// 5. POST /api/admin/ranks
// Crear nuevo registro de rango (admin)
@Post('admin/ranks')
@UseGuards(JwtAuthGuard, AdminGuard)
async createRank(@Body() createDto: CreateUserRankDto): Promise<UserRankResponseDto>

// 6. PUT /api/admin/ranks/:id
// Actualizar rango manualmente (admin)
@Put('admin/ranks/:id')
@UseGuards(JwtAuthGuard, AdminGuard)
async updateRank(
  @Param('id') id: string,
  @Body() updateDto: UpdateUserRankDto
): Promise<UserRankResponseDto>

// 7. DELETE /api/admin/ranks/:id
// Eliminar registro de rango (admin)
@Delete('admin/ranks/:id')
@UseGuards(JwtAuthGuard, AdminGuard)
@HttpCode(HttpStatus.NO_CONTENT)
async deleteRank(@Param('id') id: string): Promise<void>
```

**Decoradores requeridos:**
- `@ApiTags('Ranks')` - Swagger
- `@ApiBearerAuth()` - JWT
- `@ApiOperation()` - Descripción
- `@ApiResponse()` - Respuestas

**Guards:**
- `JwtAuthGuard` - Autenticación
- `AdminGuard` - Solo admins

**Constantes de rutas a usar:**
- Agregar a `routes.constants.ts`:
  ```typescript
  export const ROUTES = {
    RANKS: {
      BASE: 'ranks',
      CURRENT: 'current',
      ADMIN: 'admin/ranks',
      USER_PROGRESS: 'users/:userId/rank-progress',
    }
  }
  ```

---

#### Micro 3-4: DTOs Adicionales (1 día)

**Crear nuevos DTOs:**

**1. `rank-progress-response.dto.ts`**
```typescript
export class RankProgressResponseDto {
  current_rank: string;
  next_rank: string | null;
  progress_percentage: number;
  xp_current: number;
  xp_required: number;
  xp_remaining: number;
  ml_coins_bonus_on_promotion: number;
  is_max_rank: boolean;
}
```

**2. `rank-metadata.dto.ts`**
```typescript
export class RankMetadataDto {
  rank: string;
  name: string; // Display name
  description: string;
  xp_min: number;
  xp_max: number;
  ml_coins_bonus: number;
  badge_url?: string;
  order: number; // 1-5
}
```

**3. `update-user-rank.dto.ts`**
```typescript
export class UpdateUserRankDto {
  @IsOptional()
  @IsEnum(MayaRank)
  current_rank?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  rank_progress_percentage?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  xp_earned_for_rank?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  ml_coins_bonus?: number;

  @IsOptional()
  rank_metadata?: Record<string, any>;
}
```

---

#### Micro 3-5: Integración en Module (0.5 días)

**Archivo:** `apps/backend/src/modules/gamification/gamification.module.ts`

**Actualizar:**
```typescript
import { RanksService } from './services/ranks.service';
import { RanksController } from './controllers/ranks.controller';
import { UserRank } from './entities/user-rank.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // ... entities existentes
      UserRank,
    ]),
  ],
  controllers: [
    // ... controllers existentes
    RanksController,
  ],
  providers: [
    // ... services existentes
    RanksService,
  ],
  exports: [
    // ... exports existentes
    RanksService, // Exportar para usar en otros módulos
  ],
})
export class GamificationModule {}
```

---

#### Micro 3-6: Tests (2 días)

**Tests Unitarios:**
- `ranks.service.spec.ts`
  - getRankConfig()
  - calculateRankProgress()
  - checkPromotionEligibility()
  - promoteToNextRank()

**Tests de Integración:**
- `ranks.controller.spec.ts`
  - GET /api/ranks
  - GET /api/ranks/current
  - GET /api/ranks/:id
  - GET /api/users/:userId/rank-progress

**Tests E2E:**
- `ranks.e2e-spec.ts`
  - Flujo completo: crear usuario → ganar XP → promoción automática
  - Validar bonos de ML Coins
  - Validar historial de rangos

**Coverage objetivo:** ≥70%

---

#### Micro 3-7: Documentación y Validación (1 día)

**Documentación:**
1. Swagger annotations completas
2. JSDoc en service y controller
3. README.md en `/modules/gamification/docs/RANGOS-MAYA.md`

**Validación:**
1. Validar contra `/docs/02-especificaciones-tecnicas/apis/gamificacion-api/01-RANGOS-MAYA.md`
2. Ejecutar tests: `npm test gamification/ranks`
3. Validar cobertura: `npm run test:cov`
4. Build exitoso: `npm run build`
5. Lint sin errores: `npm run lint`

**Checklist final:**
- [ ] Todos los tests pasan
- [ ] Coverage ≥70%
- [ ] Build exitoso
- [ ] Lint sin errores
- [ ] Swagger docs generadas
- [ ] Validado contra especificación
- [ ] Log generado en `orchestration/04-logs/backend/`

---

**Entregable CICLO-3:**
- ✅ 7 endpoints de Rangos Maya funcionales
- ✅ Sistema de progresión automática
- ✅ Bonos de ML Coins por promoción
- ✅ Tests ≥70% coverage
- ✅ Documentación completa

---

### CICLO-4: Módulo Admin Completo (3 semanas)

**Objetivo:** Implementar panel de administración completo (31 endpoints)

**Estructura de implementación:**
```
apps/backend/src/modules/admin/
├── admin.module.ts
├── controllers/
│   ├── users.controller.ts          # 7 endpoints
│   ├── organizations.controller.ts  # 5 endpoints
│   ├── content.controller.ts        # 3 endpoints
│   ├── system.controller.ts         # 4 endpoints
│   └── analytics.controller.ts      # 12 endpoints (opcional)
├── services/
│   ├── admin-users.service.ts
│   ├── admin-organizations.service.ts
│   ├── admin-content.service.ts
│   ├── admin-system.service.ts
│   └── admin-analytics.service.ts
├── dto/
│   ├── users/
│   ├── organizations/
│   ├── content/
│   └── system/
└── guards/
    └── admin.guard.ts (si no existe)
```

#### Sub-Módulo 1: Admin/Users (1 semana)

**7 endpoints:**

```typescript
// 1. GET /api/admin/users
// Listar usuarios con filtros y paginación
@Get()
@UseGuards(JwtAuthGuard, AdminGuard)
async listUsers(@Query() query: ListUsersDto): Promise<PaginatedUsersDto>

// 2. GET /api/admin/users/:id
// Detalles de usuario específico
@Get(':id')
@UseGuards(JwtAuthGuard, AdminGuard)
async getUserDetails(@Param('id') id: string): Promise<UserDetailsDto>

// 3. PUT /api/admin/users/:id
// Actualizar usuario (perfil, rol, etc.)
@Put(':id')
@UseGuards(JwtAuthGuard, AdminGuard)
async updateUser(
  @Param('id') id: string,
  @Body() updateDto: UpdateUserDto
): Promise<UserDetailsDto>

// 4. DELETE /api/admin/users/:id
// Eliminar usuario (soft delete)
@Delete(':id')
@UseGuards(JwtAuthGuard, AdminGuard)
@HttpCode(HttpStatus.NO_CONTENT)
async deleteUser(@Param('id') id: string): Promise<void>

// 5. POST /api/admin/users/:id/suspend
// Suspender cuenta de usuario
@Post(':id/suspend')
@UseGuards(JwtAuthGuard, AdminGuard)
async suspendUser(
  @Param('id') id: string,
  @Body() suspendDto: SuspendUserDto
): Promise<UserDetailsDto>

// 6. POST /api/admin/users/:id/activate
// Activar cuenta suspendida
@Post(':id/activate')
@UseGuards(JwtAuthGuard, AdminGuard)
async activateUser(@Param('id') id: string): Promise<UserDetailsDto>

// 7. GET /api/admin/users/stats
// Estadísticas de usuarios (totales, activos, suspendidos, etc.)
@Get('stats')
@UseGuards(JwtAuthGuard, AdminGuard)
async getUserStats(): Promise<UserStatsDto>
```

**Tablas de BD a usar:**
- `auth_management.users`
- `auth_management.profiles`
- `auth_management.user_roles`
- `auth_management.memberships`

**Constantes:**
- `DB_SCHEMAS.AUTH`
- `DB_TABLES.AUTH.USERS`
- `DB_TABLES.AUTH.PROFILES`

---

#### Sub-Módulo 2: Admin/Organizations (1 semana)

**5 endpoints:**

```typescript
// 1. GET /api/admin/organizations
// Listar organizaciones (tenants)
@Get()
@UseGuards(JwtAuthGuard, AdminGuard)
async listOrganizations(@Query() query: ListOrganizationsDto): Promise<PaginatedOrganizationsDto>

// 2. POST /api/admin/organizations
// Crear nueva organización (tenant)
@Post()
@UseGuards(JwtAuthGuard, AdminGuard)
async createOrganization(@Body() createDto: CreateOrganizationDto): Promise<OrganizationDto>

// 3. PUT /api/admin/organizations/:id
// Actualizar organización
@Put(':id')
@UseGuards(JwtAuthGuard, AdminGuard)
async updateOrganization(
  @Param('id') id: string,
  @Body() updateDto: UpdateOrganizationDto
): Promise<OrganizationDto>

// 4. DELETE /api/admin/organizations/:id
// Eliminar organización (con confirmación)
@Delete(':id')
@UseGuards(JwtAuthGuard, AdminGuard)
@HttpCode(HttpStatus.NO_CONTENT)
async deleteOrganization(@Param('id') id: string): Promise<void>

// 5. GET /api/admin/organizations/:id/stats
// Estadísticas de una organización específica
@Get(':id/stats')
@UseGuards(JwtAuthGuard, AdminGuard)
async getOrganizationStats(@Param('id') id: string): Promise<OrganizationStatsDto>
```

**Tabla de BD:**
- `auth_management.tenants`
- `auth_management.memberships`

**Constantes:**
- `DB_SCHEMAS.AUTH`
- `DB_TABLES.AUTH.TENANTS`
- `DB_TABLES.AUTH.MEMBERSHIPS`

---

#### Sub-Módulo 3: Admin/Content (0.5 semanas)

**3 endpoints:**

```typescript
// 1. GET /api/admin/content/pending
// Contenido pendiente de aprobación
@Get('pending')
@UseGuards(JwtAuthGuard, AdminGuard)
async getPendingContent(@Query() query: ListContentDto): Promise<PaginatedContentDto>

// 2. POST /api/admin/content/:id/approve
// Aprobar contenido
@Post(':id/approve')
@UseGuards(JwtAuthGuard, AdminGuard)
async approveContent(
  @Param('id') id: string,
  @Body() approvalDto: ApproveContentDto
): Promise<ContentDto>

// 3. POST /api/admin/content/:id/reject
// Rechazar contenido con razón
@Post(':id/reject')
@UseGuards(JwtAuthGuard, AdminGuard)
async rejectContent(
  @Param('id') id: string,
  @Body() rejectionDto: RejectContentDto
): Promise<ContentDto>
```

**Tablas de BD:**
- `content_management.content_templates`
- `content_management.marie_curie_content`
- `educational_content.modules`
- `educational_content.exercises`

**Constantes:**
- `DB_SCHEMAS.CONTENT`
- `DB_TABLES.CONTENT.CONTENT_TEMPLATES`
- `DB_SCHEMAS.EDUCATIONAL`
- `DB_TABLES.EDUCATIONAL.MODULES`

---

#### Sub-Módulo 4: Admin/System (0.5 semanas)

**4 endpoints:**

```typescript
// 1. GET /api/admin/system/health
// Health check detallado del sistema
@Get('health')
@UseGuards(JwtAuthGuard, AdminGuard)
async getSystemHealth(): Promise<SystemHealthDto>

// 2. GET /api/admin/system/metrics
// Métricas del sistema (performance, uso)
@Get('metrics')
@UseGuards(JwtAuthGuard, AdminGuard)
async getSystemMetrics(): Promise<SystemMetricsDto>

// 3. GET /api/admin/system/audit-log
// Log de auditoría
@Get('audit-log')
@UseGuards(JwtAuthGuard, AdminGuard)
async getAuditLog(@Query() query: AuditLogQuery): Promise<PaginatedAuditLogDto>

// 4. POST /api/admin/system/config
// Actualizar configuración del sistema
@Post('config')
@UseGuards(JwtAuthGuard, AdminGuard)
async updateSystemConfig(@Body() configDto: UpdateSystemConfigDto): Promise<SystemConfigDto>
```

**Tablas de BD:**
- `audit_logging.security_events` (usar si existe)
- `auth_management.auth_attempts`
- Sistema de configuración (variables de entorno o tabla config)

**Constantes:**
- `DB_SCHEMAS.AUDIT`
- `DB_SCHEMAS.AUTH`

---

**Entregable CICLO-4:**
- ✅ 31 endpoints admin implementados (19 críticos + 12 opcionales analytics)
- ✅ Panel de administración funcional
- ✅ Sistema de auditoría
- ✅ Tests ≥60% coverage
- ✅ Documentación completa

---

### CICLO-5: Notifications + socket.io (1 semana)

**Objetivo:** Implementar notificaciones en tiempo real con WebSocket

#### Micro 5-1: Instalación socket.io (0.5 días)

```bash
npm install socket.io @nestjs/platform-socket.io
npm install -D @types/socket.io
```

**Configurar en main.ts:**
```typescript
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // WebSocket adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(3000);
}
```

---

#### Micro 5-2: NotificationsService (2 días)

**Archivo:** `apps/backend/src/modules/notifications/services/notifications.service.ts`

**Usar tabla existente:**
- `gamification_system.notifications` (si existe en DDL)

**Métodos:**
```typescript
class NotificationsService {
  // Crear notificación
  async createNotification(createDto: CreateNotificationDto): Promise<Notification>

  // Enviar notificación (persistir + emitir WebSocket)
  async sendNotification(userId: string, notification: CreateNotificationDto): Promise<void>

  // Obtener notificaciones del usuario
  async getUserNotifications(userId: string, filters: NotificationFilters): Promise<Notification[]>

  // Obtener notificaciones no leídas
  async getUnreadNotifications(userId: string): Promise<Notification[]>

  // Marcar como leída
  async markAsRead(notificationId: string, userId: string): Promise<Notification>

  // Marcar todas como leídas
  async markAllAsRead(userId: string): Promise<void>

  // Obtener preferencias de notificaciones
  async getPreferences(userId: string): Promise<NotificationPreferences>

  // Actualizar preferencias
  async updatePreferences(userId: string, preferences: UpdatePreferencesDto): Promise<NotificationPreferences>
}
```

**Constantes:**
- `DB_SCHEMAS.GAMIFICATION`
- `DB_TABLES.GAMIFICATION.NOTIFICATIONS`
- `NotificationTypeEnum`
- `NotificationChannelEnum`

---

#### Micro 5-3: NotificationsController (REST) (1 día)

**7 endpoints REST:**

```typescript
// 1. GET /api/notifications
// Listar notificaciones del usuario autenticado
@Get()
@UseGuards(JwtAuthGuard)
async getNotifications(
  @Request() req,
  @Query() filters: NotificationFiltersDto
): Promise<PaginatedNotificationsDto>

// 2. GET /api/notifications/unread
// Notificaciones no leídas
@Get('unread')
@UseGuards(JwtAuthGuard)
async getUnreadNotifications(@Request() req): Promise<NotificationDto[]>

// 3. PUT /api/notifications/:id/read
// Marcar como leída
@Put(':id/read')
@UseGuards(JwtAuthGuard)
async markAsRead(
  @Param('id') id: string,
  @Request() req
): Promise<NotificationDto>

// 4. PUT /api/notifications/read-all
// Marcar todas como leídas
@Put('read-all')
@UseGuards(JwtAuthGuard)
async markAllAsRead(@Request() req): Promise<void>

// 5. GET /api/notifications/preferences
// Obtener preferencias
@Get('preferences')
@UseGuards(JwtAuthGuard)
async getPreferences(@Request() req): Promise<NotificationPreferencesDto>

// 6. PUT /api/notifications/preferences
// Actualizar preferencias
@Put('preferences')
@UseGuards(JwtAuthGuard)
async updatePreferences(
  @Request() req,
  @Body() updateDto: UpdatePreferencesDto
): Promise<NotificationPreferencesDto>

// 7. POST /api/admin/notifications/broadcast
// Enviar notificación masiva (admin)
@Post('admin/notifications/broadcast')
@UseGuards(JwtAuthGuard, AdminGuard)
async broadcastNotification(@Body() broadcastDto: BroadcastNotificationDto): Promise<void>
```

---

#### Micro 5-4: WebSocket Gateway (1.5 días)

**Archivo:** `apps/backend/src/modules/notifications/gateways/notifications.gateway.ts`

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>(); // userId → socketId

  constructor(
    private jwtService: JwtService,
    private notificationsService: NotificationsService
  ) {}

  // Conexión de cliente
  async handleConnection(socket: Socket) {
    try {
      // Extraer JWT del handshake
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;

      // Guardar mapping userId → socketId
      this.userSockets.set(userId, socket.id);

      // Unir al room del usuario
      socket.join(`user:${userId}`);

      console.log(`User ${userId} connected to notifications`);
    } catch (error) {
      socket.disconnect();
    }
  }

  // Desconexión de cliente
  handleDisconnect(socket: Socket) {
    // Remover del mapping
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === socket.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  // Emitir notificación a usuario específico
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // Eventos del cliente
  @SubscribeMessage('notification.read')
  async handleNotificationRead(socket: Socket, payload: { notificationId: string }) {
    const token = socket.handshake.auth.token;
    const user = await this.jwtService.verifyAsync(token);

    await this.notificationsService.markAsRead(payload.notificationId, user.sub);

    // Confirmar al cliente
    socket.emit('notification.read.success', { notificationId: payload.notificationId });
  }
}
```

**Eventos WebSocket:**
- `notification.new` - Nueva notificación (server → client)
- `notification.read` - Marcar como leída (client → server)
- `notification.read.success` - Confirmación (server → client)

---

#### Micro 5-5: Tests (1 día)

**Tests unitarios:**
- `notifications.service.spec.ts`
- `notifications.controller.spec.ts`

**Tests de integración:**
- `notifications.gateway.spec.ts`
  - Conexión WebSocket
  - Autenticación JWT
  - Emitir notificación
  - Marcar como leída

**Tests E2E:**
- `notifications.e2e-spec.ts`
  - Flujo REST + WebSocket completo

**Coverage objetivo:** ≥70%

---

**Entregable CICLO-5:**
- ✅ socket.io instalado y configurado
- ✅ 7 endpoints REST de notificaciones
- ✅ WebSocket gateway funcional
- ✅ Notificaciones en tiempo real
- ✅ Tests ≥70% coverage

---

### CICLO-6: Configuraciones Deployment (0.5 semanas)

**Objetivo:** Completar configuraciones para despliegue

#### Micro 6-1: Migrar Dockerfile (1 día)

**Fuente:** `/projects/gamilit-platform-backend/Dockerfile`
**Destino:** `/apps/backend/Dockerfile`

**Adaptar a NestJS:**
```dockerfile
# ==========================================
# Stage 1: Builder
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY tsconfig*.json ./

# Instalar dependencias
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar código fuente
COPY src ./src

# Build
RUN npm run build

# ==========================================
# Stage 2: Production
# ==========================================
FROM node:20-alpine

WORKDIR /app

# Copiar dependencias de producción
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Usuario no-root
RUN addgroup -S gamilit && adduser -S gamilit -G gamilit
USER gamilit

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start
CMD ["node", "dist/main.js"]
```

**Crear `.dockerignore`:**
```
node_modules
dist
.env*
.git
*.md
```

---

#### Micro 6-2: Migrar nodemon.json (0.5 días)

**Fuente:** `/projects/gamilit-platform-backend/nodemon.json`
**Destino:** `/apps/backend/nodemon.json`

**Adaptar paths:**
```json
{
  "watch": ["src"],
  "ext": "ts",
  "ignore": ["src/**/*.spec.ts", "node_modules"],
  "exec": "ts-node -r tsconfig-paths/register src/main.ts",
  "env": {
    "NODE_ENV": "development"
  }
}
```

---

#### Micro 6-3: Validar node-cron (0.5 días)

**Validar si se usa en código origen:**
```bash
grep -r "node-cron" /projects/gamilit-platform-backend/src
```

**Si se usa:**
1. Instalar: `npm install node-cron @types/node-cron`
2. Crear `TaskSchedulerService` para tareas programadas
3. Configurar cron jobs necesarios

**Si NO se usa:**
- Documentar que no es necesario
- Remover de lista de dependencias faltantes

---

#### Micro 6-4: Actualizar .env.example (0.5 días)

**Agregar variables faltantes:**
```env
# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/gamilit
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gamilit
DB_USER=gamilit_user
DB_PASSWORD=your-password
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000

# Server
PORT=3000
NODE_ENV=development
API_PREFIX=api

# Frontend (CORS)
FRONTEND_URL=http://localhost:5173

# WebSocket
WS_PORT=3001

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

---

**Entregable CICLO-6:**
- ✅ Dockerfile production-ready
- ✅ nodemon.json configurado
- ✅ node-cron validado/instalado (si necesario)
- ✅ .env.example completo
- ✅ Build Docker funcional

---

**Checkpoint FASE 1 (al completar CICLO-6):**
- ✅ Sistema de rangos Maya implementado (7 endpoints)
- ✅ Panel admin completo (31 endpoints)
- ✅ Notificaciones tiempo real (7 endpoints + WebSocket)
- ✅ Configuraciones deployment completas
- ✅ **Sistema desplegable a staging**

---

## FASE 2: ALTO - PORTAL DE PROFESORES (6 SEMANAS)

**Objetivo:** Habilitar modelo B2B con portal completo para profesores

### CICLO-7: Teacher/Classroom Management (2 semanas)
### CICLO-8: Teacher/Assignments (1.5 semanas)
### CICLO-9: Teacher/Grading (1.5 semanas)
### CICLO-10: Teacher/Analytics (2 semanas)

**Total:** 29 endpoints teacher

_(Plan detallado similar a FASE 1, a desarrollar cuando se complete FASE 1)_

---

## FASE 3: MEDIO - GAMIFICACIÓN COMPLETA (6 SEMANAS)

**Objetivo:** Completar sistema de gamificación y características sociales

### CICLO-11: Gamificación Restante (4 semanas)
- Misiones diarias/semanales
- Powerups y su uso
- Leaderboards por diferentes métricas
- Sistema de streaks
- Recompensas especiales
- Eventos temporales

### CICLO-12: Social/Guilds (2 semanas)
- 10 endpoints de guilds

_(Plan detallado a desarrollar después de FASE 2)_

---

## FASE 4: CONSOLIDACIÓN - PRODUCTION READY (6 SEMANAS)

**Objetivo:** Sistema production-ready con alta calidad

### CICLO-13: Migración Tests Restantes (2 semanas)
### CICLO-14: Coverage ≥60% (3 semanas)
### CICLO-15: Configuraciones y Hardening (1 semana)
### CICLO-16: Performance y Optimización (2 semanas)

_(Plan detallado a desarrollar después de FASE 3)_

---

## 📊 MÉTRICAS DE SEGUIMIENTO

### Por Ciclo

| Ciclo | Endpoints | Tests | Coverage | Duración |
|-------|-----------|-------|----------|----------|
| CICLO-3 | 7 | ≥10 | ≥70% | 2 semanas |
| CICLO-4 | 31 | ≥25 | ≥60% | 3 semanas |
| CICLO-5 | 7 + WS | ≥8 | ≥70% | 1 semana |
| CICLO-6 | N/A | N/A | N/A | 0.5 semanas |

### Acumulado Fase 1

| Métrica | Objetivo |
|---------|----------|
| Endpoints nuevos | 45 |
| Tests creados | ≥43 |
| Coverage promedio | ≥65% |
| Archivos nuevos | ~80 |
| Duración total | 6.5 semanas |

---

## ✅ CRITERIOS DE ACEPTACIÓN

### Por Ciclo

**CICLO-3 (Rangos Maya):**
- [ ] 7 endpoints funcionales
- [ ] Sistema de progresión automática
- [ ] Bonos de ML Coins por promoción
- [ ] Tests ≥70% coverage
- [ ] Validado contra especificación

**CICLO-4 (Admin):**
- [ ] 31 endpoints implementados
- [ ] Panel admin funcional
- [ ] Sistema de auditoría
- [ ] Tests ≥60% coverage
- [ ] Documentación completa

**CICLO-5 (Notifications):**
- [ ] socket.io configurado
- [ ] 7 endpoints REST
- [ ] WebSocket gateway funcional
- [ ] Notificaciones tiempo real
- [ ] Tests ≥70% coverage

**CICLO-6 (Deployment):**
- [ ] Dockerfile funcional
- [ ] Build Docker exitoso
- [ ] nodemon.json configurado
- [ ] .env.example completo

### Fase 1 Completa

- [ ] 45 endpoints nuevos implementados
- [ ] Todos los tests pasan
- [ ] Coverage ≥65%
- [ ] Build exitoso sin warnings
- [ ] Lint sin errores
- [ ] Sistema desplegable a staging
- [ ] Documentación actualizada

---

## 🚨 RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Integración socket.io compleja | Media | Alto | Spike técnico antes de CICLO-5 |
| Admin endpoints muy numerosos | Alta | Medio | Priorizar 19 críticos, postponer 12 analytics |
| Tests llevan más tiempo | Media | Medio | Paralelizar con desarrollo, pair programming |
| Conflictos con código existente | Baja | Alto | Usar constantes globales, adaptar no reescribir |

---

## 📞 PRÓXIMOS PASOS

**Ahora:**
1. ✅ Aprobar este plan de ejecución
2. ✅ Asignar equipo (2-3 backend devs)
3. ✅ Configurar entorno de desarrollo
4. ✅ Iniciar CICLO-3 (Rangos Maya)

**Esta semana:**
1. ✅ Micro 3-1: Ajustar UserRank entity
2. ✅ Micro 3-2: Crear RanksService
3. ✅ Daily standups

**Próxima semana:**
1. ✅ Completar CICLO-3
2. ✅ Demo de sistema de rangos
3. ✅ Iniciar CICLO-4 (Admin)

---

**Generado por:** NEXUS-BACKEND v1.0
**Fecha:** 2025-11-02
**Basado en:** PLAN-COMPLETITUD-MIGRACION.md + análisis BD + análisis código existente
**Estado:** ✅ LISTO PARA EJECUCIÓN
