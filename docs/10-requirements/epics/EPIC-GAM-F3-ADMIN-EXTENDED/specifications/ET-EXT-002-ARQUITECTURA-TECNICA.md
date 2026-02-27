# Especificaciones Técnicas - Admin Portal Extendido
## Arquitectura y Diseño Técnico - Sprints 1, 2, 3

**Epic:** EXT-002
**Fecha:** 2025-11-19
**Estado:** ✅ IMPLEMENTADO

---

## 1. Arquitectura General

### 1.1 Stack Tecnológico

```
┌─────────────────────────────────────────────┐
│           FRONTEND (React/Next.js)          │
│  - AdminDashboardPage                       │
│  - RolesManagementPage                      │
│  - ReportsPage                              │
│  - MaintenancePage                          │
└─────────────────────────────────────────────┘
                      │ HTTP/REST
                      ▼
┌─────────────────────────────────────────────┐
│      BACKEND (NestJS + TypeORM)             │
│  ┌──────────────────────────────────────┐   │
│  │   Controllers (8 new/modified)       │   │
│  │  - AdminDashboardController          │   │
│  │  - AdminRolesController              │   │
│  │  - AdminReportsController            │   │
│  │  - AdminLogsController               │   │
│  │  - AdminSystemController (mod)       │   │
│  │  - AdminUsersController (mod)        │   │
│  │  - AdminContentController (mod)      │   │
│  └──────────────────────────────────────┘   │
│                    ▼                         │
│  ┌──────────────────────────────────────┐   │
│  │   Services (7 new/modified)          │   │
│  │  - AdminDashboardService             │   │
│  │  - AdminRolesService                 │   │
│  │  - AdminReportsService               │   │
│  │  - AdminSystemService (mod)          │   │
│  │  - AdminUsersService (mod)           │   │
│  │  - AdminContentService (mod)         │   │
│  │  - BulkOperationsService (reused)    │   │
│  └──────────────────────────────────────┘   │
│                    ▼                         │
│  ┌──────────────────────────────────────┐   │
│  │   Repositories (TypeORM)             │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                      │ SQL
                      ▼
┌─────────────────────────────────────────────┐
│         DATABASE (PostgreSQL 15+)           │
│  ┌──────────────────────────────────────┐   │
│  │   Tables (3 used)                    │   │
│  │  - system_settings                   │   │
│  │  - content_approvals (new)           │   │
│  │  - bulk_operations                   │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │   Views (6 consumed)                 │   │
│  │  - recent_activity                   │   │
│  │  - user_stats_summary                │   │
│  │  - organization_stats_summary        │   │
│  │  - moderation_queue                  │   │
│  │  - classroom_overview                │   │
│  │  - assignment_submission_stats       │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │   Functions (2 used)                 │   │
│  │  - cleanup_old_system_logs()         │   │
│  │  - cleanup_old_user_activity()       │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### 1.2 Patrones de Diseño Aplicados

**1. Controller → Service → Repository (Layered Architecture)**
```typescript
// Controller Layer (HTTP handling)
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly service: AdminDashboardService) {}

  @Get()
  async getDashboard(): Promise<DashboardDataDto> {
    return await this.service.getDashboard();
  }
}

// Service Layer (Business logic)
@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectConnection('auth') private connection: Connection
  ) {}

  async getDashboard(): Promise<DashboardDataDto> {
    const [stats, activity] = await Promise.all([
      this.getDashboardStats(),
      this.getRecentActivity()
    ]);
    return { stats, activity };
  }
}

// Repository Layer (Data access via TypeORM)
```

**2. DTO Pattern (Data Transfer Objects)**
- Input validation con class-validator
- Transformación automática con class-transformer
- Documentación Swagger con decoradores @ApiProperty

**3. Dependency Injection**
- Constructor injection para servicios y repositorios
- @InjectRepository para repositorios TypeORM
- @InjectConnection para conexiones de DB

**4. Delegation Pattern**
- Controladores alias delegan a servicios existentes
- No duplicación de lógica de negocio
- Mantiene principio DRY

**5. Repository Pattern (TypeORM)**
- Abstracción de acceso a datos
- Queries type-safe
- Soporte para múltiples conexiones de DB

---

## 2. Estructuras de Datos

### 2.1 Entidades TypeORM

#### ContentApproval (Nueva)
```typescript
@Entity({ schema: 'educational_content', name: 'content_approvals' })
export class ContentApproval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  content_type: ContentApprovalType; // module, exercise, assignment, resource

  @Column('uuid')
  content_id: string;

  @Column('uuid')
  submitted_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'submitted_by' })
  submitter: User;

  @Column({ type: 'timestamp with time zone' })
  submitted_at: Date;

  @Column({ type: 'uuid', nullable: true })
  reviewed_by?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer?: User;

  @Column({ type: 'timestamp with time zone', nullable: true })
  reviewed_at?: Date;

  @Column({ type: 'varchar', length: 50 })
  status: ContentApprovalStatus; // pending, approved, rejected, needs_revision

  @Column({ type: 'text', nullable: true })
  reviewer_notes?: string;

  @Column({ type: 'text', nullable: true })
  revision_notes?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

### 2.2 DTOs Principales

#### Dashboard DTOs
```typescript
export class DashboardStatsDto {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalOrganizations: number;
  totalExercises: number;
  totalModules: number;
  exercisesCompleted24h: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  avgResponseTime: number;
}

export class DashboardDataDto {
  stats: DashboardStatsDto;
  recentActivity: AdminActionDto[];
  timestamp: string;
}
```

#### Roles & Permissions DTOs
```typescript
export class PermissionDto {
  key: string; // can_create_content, can_manage_users, etc.
  displayName: string;
  category: 'content' | 'users' | 'system' | 'reports' | 'gamification' | 'analytics';
}

export class RoleDto {
  id: string;
  name: string;
  permissions: Record<string, boolean>;
  users_count?: number;
}
```

#### Reports DTOs
```typescript
export enum ReportType {
  USERS = 'users',
  PROGRESS = 'progress',
  GAMIFICATION = 'gamification',
  SYSTEM = 'system'
}

export enum ReportFormat {
  CSV = 'csv',
  EXCEL = 'excel',
  PDF = 'pdf'
}

export class ReportDto {
  id: string;
  type: ReportType;
  format: ReportFormat;
  status: 'generating' | 'completed' | 'failed';
  file_size?: number;
  download_url?: string;
  created_at: string;
  completed_at?: string;
}
```

### 2.3 Enums y Tipos

```typescript
// Content Approval
export enum ContentApprovalType {
  MODULE = 'module',
  EXERCISE = 'exercise',
  ASSIGNMENT = 'assignment',
  RESOURCE = 'resource'
}

export enum ContentApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NEEDS_REVISION = 'needs_revision'
}

// System Health
export type SystemHealthStatus = 'healthy' | 'degraded' | 'down';

// Permission Categories
export type PermissionCategory =
  | 'content'
  | 'users'
  | 'system'
  | 'reports'
  | 'gamification'
  | 'analytics';
```

---

## 3. API Endpoints

### 3.1 Dashboard Module

| Método | Endpoint | Descripción | Response Type |
|--------|----------|-------------|---------------|
| GET | `/admin/dashboard` | Dashboard completo | `DashboardDataDto` |
| GET | `/admin/dashboard/stats` | Solo estadísticas | `DashboardStatsDto` |
| GET | `/admin/dashboard/recent-activity` | Actividad paginada | `PaginatedActivityDto` |
| GET | `/admin/dashboard/user-stats` | Stats de usuarios (vista) | `UserStatsSummaryDto` |
| GET | `/admin/dashboard/organization-stats` | Stats de orgs (vista) | `OrganizationStatsSummaryDto` |
| GET | `/admin/dashboard/moderation-queue` | Cola de moderación | `PaginatedModerationQueueDto` |
| GET | `/admin/dashboard/classroom-overview` | Overview de aulas | `PaginatedClassroomOverviewDto` |
| GET | `/admin/dashboard/assignment-stats` | Stats de asignaciones | `PaginatedAssignmentSubmissionStatsDto` |

### 3.2 Roles Module

| Método | Endpoint | Descripción | Response Type |
|--------|----------|-------------|---------------|
| GET | `/admin/roles` | Listar roles | `RoleDto[]` |
| GET | `/admin/roles/permissions` | Permisos disponibles | `PermissionDto[]` |
| GET | `/admin/roles/:id/permissions` | Permisos de rol | `RolePermissionsDto` |
| PUT | `/admin/roles/:id/permissions` | Actualizar permisos | `RolePermissionsDto` |

### 3.3 Reports Module

| Método | Endpoint | Descripción | Response Type |
|--------|----------|-------------|---------------|
| POST | `/admin/reports/generate` | Generar reporte | `ReportDto` |
| GET | `/admin/reports` | Listar reportes | `PaginatedReportsDto` |
| GET | `/admin/reports/:id/download` | Descargar reporte | `ReportDto` |
| DELETE | `/admin/reports/:id` | Eliminar reporte | `204 No Content` |

### 3.4 System Config Module

| Método | Endpoint | Descripción | Response Type |
|--------|----------|-------------|---------------|
| GET | `/admin/system/config` | Config completa | `SystemConfigDto` |
| POST | `/admin/system/config` | Actualizar config | `SystemConfigDto` |
| GET | `/admin/system/config/:category` | Config por categoría | `Record<string, any>` |
| PUT | `/admin/system/config/:category` | Actualizar categoría | `Record<string, any>` |

### 3.5 Maintenance Module

| Método | Endpoint | Descripción | Response Type |
|--------|----------|-------------|---------------|
| POST | `/admin/system/maintenance/cleanup-logs` | Limpiar logs | `MaintenanceOperationResultDto` |
| POST | `/admin/system/maintenance/cleanup-activity` | Limpiar actividad | `MaintenanceOperationResultDto` |
| POST | `/admin/system/maintenance/optimize-database` | Optimizar DB | `DatabaseOptimizationResultDto` |
| POST | `/admin/system/maintenance/clear-cache` | Limpiar caché | `CacheClearResultDto` |
| POST | `/admin/system/maintenance/cleanup-sessions` | Limpiar sesiones | `SessionCleanupResultDto` |

### 3.6 Users Bulk Ops (Aliases)

| Método | Endpoint | Descripción | Delegado a |
|--------|----------|-------------|------------|
| POST | `/admin/users/bulk/suspend` | Suspender en lote | `BulkOperationsService.bulkSuspendUsers()` |
| POST | `/admin/users/bulk/delete` | Eliminar en lote | `BulkOperationsService.bulkDeleteUsers()` |
| POST | `/admin/users/bulk/update-role` | Actualizar rol | `BulkOperationsService.bulkUpdateRole()` |

### 3.7 Content Approval

| Método | Endpoint | Descripción | Response Type |
|--------|----------|-------------|---------------|
| GET | `/admin/content/approval-history` | Historial de aprobaciones | `PaginatedApprovalHistoryDto` |
| GET | `/admin/content/exercises/pending` | Ejercicios pendientes (alias) | `PaginatedContentDto` |
| POST | `/admin/content/exercises/:id/approve` | Aprobar ejercicio (alias) | `ContentDto` |
| POST | `/admin/content/exercises/:id/reject` | Rechazar ejercicio (alias) | `ContentDto` |

### 3.8 Logs (Alias)

| Método | Endpoint | Descripción | Delegado a |
|--------|----------|-------------|------------|
| GET | `/admin/logs` | Audit logs (alias) | `AdminSystemService.getAuditLog()` |

**Total endpoints:** 33

---

## 4. Seguridad y Autenticación

### 4.1 Guards Aplicados

```typescript
@Controller('admin/*')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController {
  // Todos los endpoints protegidos
}
```

**1. JwtAuthGuard**
- Valida token JWT en header Authorization
- Extrae user del token
- Inyecta user en request

**2. AdminGuard**
- Verifica que user.role sea admin
- Bloquea acceso a no-admins
- Retorna 403 Forbidden si no es admin

### 4.2 Permisos Granulares (Futuro)

Actualmente implementado solo a nivel de roles. Para futura implementación:

```typescript
@RequiresPermission('can_manage_users')
async suspendUser() { }

@RequiresPermission(['can_create_content', 'can_approve_content'])
async approveContent() { }
```

### 4.3 Audit Trail

**Registro de acciones:**
- Todos los cambios en `system_settings` registran `updated_by`
- Aprobaciones/rechazos se registran en `content_approvals`
- Bulk operations se rastrean en `bulk_operations`
- Activity log registra acciones importantes

---

## 5. Optimizaciones de Performance

### 5.1 Queries Paralelas

```typescript
// Dashboard: 2 queries en paralelo
const [stats, activity] = await Promise.all([
  this.getDashboardStats(),
  this.getRecentActivity()
]);

// Stats: 7 queries en paralelo
const [totalUsers, activeUsers, newUsers, ...] = await Promise.all([
  this.userRepo.count(),
  this.getActiveUsers24h(),
  this.userRepo.count({ where: { created_at: MoreThanOrEqual(today) } }),
  // ... más queries
]);
```

### 5.2 Índices de Base de Datos

Creados en tablas relevantes:
```sql
-- content_approvals
CREATE INDEX idx_content_approvals_content
  ON content_approvals(content_type, content_id);
CREATE INDEX idx_content_approvals_status
  ON content_approvals(status);
CREATE INDEX idx_content_approvals_submitted_by
  ON content_approvals(submitted_by);
CREATE INDEX idx_content_approvals_reviewed_by
  ON content_approvals(reviewed_by) WHERE reviewed_by IS NOT NULL;
```

### 5.3 Vistas Materializadas (Potencial)

Actualmente vistas normales. Para mayor performance en producción:
```sql
CREATE MATERIALIZED VIEW admin_dashboard.user_stats_summary_mat AS
SELECT * FROM admin_dashboard.user_stats_summary;

-- Refresh automático cada hora
CREATE OR REPLACE FUNCTION refresh_user_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY admin_dashboard.user_stats_summary_mat;
END;
$$ LANGUAGE plpgsql;
```

### 5.4 Paginación

Todas las listas implementan paginación:
```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
```

Uso de skip/take en TypeORM:
```typescript
const skip = (page - 1) * limit;
const [data, total] = await repo.findAndCount({
  skip,
  take: limit
});
```

---

## 6. Manejo de Errores

### 6.1 Estrategia de Errores

```typescript
// Errores esperados con excepciones NestJS
throw new NotFoundException(`User ${id} not found`);
throw new BadRequestException('User is already deactivated');

// Errores de validación automáticos (class-validator)
@IsString()
@IsNotEmpty()
name: string; // Lanza ValidationException si falla

// Errores de DB se propagan como InternalServerException
```

### 6.2 Try-Catch para Operaciones Críticas

```typescript
async getRecentActivity(): Promise<AdminActionDto[]> {
  try {
    const results = await this.connection.query(
      'SELECT * FROM admin_dashboard.recent_activity LIMIT $1',
      [limit]
    );
    return results.map(mapToDto);
  } catch (error) {
    console.error('Error fetching activity:', error);
    return []; // Graceful degradation
  }
}
```

### 6.3 Validación de DTOs

```typescript
export class CreateReportDto {
  @IsEnum(ReportType)
  type: ReportType; // Valida que sea users, progress, etc.

  @IsEnum(ReportFormat)
  format: ReportFormat; // Valida que sea csv, excel, pdf

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}
```

---

## 7. Testing Considerations

### 7.1 Tests Unitarios (Recomendado)

```typescript
describe('AdminDashboardService', () => {
  let service: AdminDashboardService;
  let userRepo: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AdminDashboardService,
        {
          provide: getRepositoryToken(User, 'auth'),
          useValue: mockUserRepository
        }
      ]
    }).compile();

    service = module.get(AdminDashboardService);
  });

  it('should return dashboard stats', async () => {
    mockUserRepository.count.mockResolvedValue(100);
    const stats = await service.getDashboardStats();
    expect(stats.totalUsers).toBe(100);
  });
});
```

### 7.2 Tests E2E (Recomendado)

```typescript
describe('Admin Dashboard (e2e)', () => {
  it('/admin/dashboard (GET) should require admin role', () => {
    return request(app.getHttpServer())
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(403);
  });

  it('/admin/dashboard (GET) should return stats for admin', () => {
    return request(app.getHttpServer())
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('stats');
        expect(res.body).toHaveProperty('recentActivity');
      });
  });
});
```

---

## 8. Deployment Considerations

### 8.1 Variables de Entorno

```env
# Database Connections
DATABASE_URL_AUTH=postgresql://user:pass@host:5432/auth_db
DATABASE_URL_EDUCATIONAL=postgresql://user:pass@host:5432/educational_db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1h

# System Config
DEFAULT_RETENTION_DAYS_LOGS=90
DEFAULT_RETENTION_DAYS_ACTIVITY=180
```

### 8.2 Migraciones

```bash
# Crear migración para content_approvals
npm run migration:generate -- -n CreateContentApprovals

# Ejecutar migraciones
npm run migration:run

# Revertir si es necesario
npm run migration:revert
```

### 8.3 Seeds de Datos

```sql
-- Permisos iniciales
INSERT INTO auth.permissions (key, display_name, category) VALUES
('can_create_content', 'Can Create Content', 'content'),
('can_approve_content', 'Can Approve Content', 'content'),
-- ... 14 más

-- Asignar permisos a super_admin
INSERT INTO auth.role_permissions (role_id, permission_key)
SELECT r.id, p.key
FROM auth.roles r, auth.permissions p
WHERE r.name = 'super_admin';
```

---

## 9. Mejoras Futuras

### 9.1 Sistema de Reportes
- Migrar de Map a tabla `admin.reports`
- Implementar almacenamiento de archivos (S3)
- Cola de jobs con Bull/BullMQ
- Más tipos de reportes y filtros

### 9.2 Caché
- Implementar Redis para caché distribuido
- Cache de estadísticas del dashboard (TTL 5 min)
- Cache de permisos por rol
- Invalidación inteligente

### 9.3 Websockets
- Updates en tiempo real para dashboard
- Notificaciones de reportes completados
- Progress de operaciones bulk en tiempo real

### 9.4 Audit Logging Mejorado
- Decorador @AuditLog() para acciones críticas
- Logging automático de cambios en entidades
- Diferencias antes/después en metadata

---

**Documento generado:** 2025-11-19
**Versión:** 1.0
**Estado:** Arquitectura implementada y validada
