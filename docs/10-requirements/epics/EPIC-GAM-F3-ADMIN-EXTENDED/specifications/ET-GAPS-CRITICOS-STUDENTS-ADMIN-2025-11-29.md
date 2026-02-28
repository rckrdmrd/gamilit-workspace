---
titulo: "Especificación Técnica: Gaps Críticos Portal Students → Admin"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Especificación Técnica: Gaps Críticos Portal Students → Admin

**Versión:** 1.0.0
**Fecha:** 2025-11-29
**Autor:** Architecture-Analyst
**Tipo:** Especificación Técnica Consolidada
**Origen:** Análisis de Dependencias Portal Students

---

## Resumen Ejecutivo

Este documento especifica los gaps técnicos críticos identificados en el análisis del Portal Students y su impacto en el Portal Admin. Incluye gaps de seguridad, funcionalidad faltante, y mejoras requeridas.

### Gaps Documentados

| ID | Gap | Prioridad | US Relacionada |
|----|-----|-----------|----------------|
| GAP-C02 | Admin no ve Assignments | P0 | US-AE-009 |
| GAP-C01 | Admin no puede crear usuarios | P1 | US-AE-010 |
| GAP-C08 | Sin Audit Logs UI | P1 | US-AE-011 |
| GAP-C06 | RLS incompleto en ejercicios | P0 | Este documento |
| GAP-C07 | Sin filtros avanzados usuarios | P1 | Este documento |
| GAP-C03 | Admin no ve comodines | P2 | Este documento |
| GAP-C04 | Admin no ve misiones | P2 | Este documento |
| GAP-C05 | Sin notificación al suspender | P2 | Este documento |

---

## GAP-C06: RLS Incompleto en Ejercicios

### Descripción del Problema

**Situación actual:**
- `GET /api/v1/educational/exercises` devuelve TODOS los ejercicios del sistema
- No hay filtrado por classroom/organización del estudiante
- Cualquier estudiante autenticado puede ver ejercicios de otras organizaciones

**Impacto de seguridad:** ALTO
- Exposición de contenido educativo entre organizaciones
- Violación de aislamiento multi-tenant
- Potencial fuga de propiedad intelectual de ejercicios

### Solución Técnica

#### Backend - Modificaciones Requeridas

**Archivo:** `apps/backend/src/modules/educational/services/exercises.service.ts`

```typescript
// ANTES (vulnerable)
async findAll(filters: ExerciseFilters): Promise<Exercise[]> {
  return this.exerciseRepository.find({
    where: { ...filters },
    relations: ['module']
  });
}

// DESPUÉS (con RLS)
async findAllForStudent(userId: string, filters: ExerciseFilters): Promise<Exercise[]> {
  // 1. Obtener classrooms del estudiante
  const studentClassrooms = await this.classroomMemberRepository.find({
    where: { user_id: userId, status: 'active' }
  });

  const classroomIds = studentClassrooms.map(cm => cm.classroom_id);

  // 2. Obtener módulos asignados a esos classrooms
  const assignedModules = await this.assignmentClassroomRepository.find({
    where: { classroom_id: In(classroomIds) }
  });

  const moduleIds = [...new Set(assignedModules.map(ac => ac.module_id))];

  // 3. Filtrar ejercicios por módulos asignados
  return this.exerciseRepository.find({
    where: {
      module_id: In(moduleIds),
      ...filters
    },
    relations: ['module']
  });
}
```

**Archivo:** `apps/backend/src/modules/educational/controllers/exercises.controller.ts`

```typescript
@Get()
@UseGuards(JwtAuthGuard)
async findAll(
  @CurrentUser() user: JwtPayload,
  @Query() filters: ExerciseFiltersDto
): Promise<Exercise[]> {
  // Si es student, aplicar RLS
  if (user.role === 'student') {
    return this.exercisesService.findAllForStudent(user.sub, filters);
  }
  // Si es admin/teacher, devolver según sus permisos
  return this.exercisesService.findAll(filters);
}
```

#### Criterios de Aceptación

- [ ] Student solo ve ejercicios de módulos asignados a sus classrooms
- [ ] Teacher ve ejercicios de sus classrooms asignados
- [ ] Admin ve todos los ejercicios
- [ ] Tests unitarios verifican aislamiento
- [ ] No breaking changes en endpoints existentes

---

## GAP-C07: Filtros Avanzados de Usuarios

### Descripción del Problema

**Situación actual:**
- AdminUsersPage solo tiene filtros básicos: rol, estado, búsqueda por nombre/email
- Marcado como "COMING SOON" en línea 364
- No se puede filtrar por organización, fecha de registro, último acceso, nivel de gamificación

**Impacto:**
- Difícil encontrar usuarios específicos en sistemas con muchos usuarios
- No se puede identificar usuarios inactivos (sin acceso reciente)
- No se puede segmentar por institución

### Solución Técnica

#### Backend - Extender Query Params

**Archivo:** `apps/backend/src/modules/admin/dto/users/list-users.dto.ts`

```typescript
export class ListUsersDto {
  // Existentes
  @IsOptional()
  @IsEnum(['student', 'admin_teacher', 'super_admin'])
  role?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended', 'pending'])
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  // NUEVOS
  @IsOptional()
  @IsUUID()
  organization_id?: string;

  @IsOptional()
  @IsUUID()
  classroom_id?: string;

  @IsOptional()
  @IsDateString()
  registered_from?: string;

  @IsOptional()
  @IsDateString()
  registered_to?: string;

  @IsOptional()
  @IsDateString()
  last_login_from?: string;

  @IsOptional()
  @IsDateString()
  last_login_to?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  min_level?: number;

  @IsOptional()
  @IsInt()
  @Max(100)
  max_level?: number;

  @IsOptional()
  @IsBoolean()
  has_never_logged_in?: boolean;
}
```

#### Frontend - Componente de Filtros

**Archivo:** `apps/frontend/src/apps/admin/components/users/AdvancedFilters.tsx`

```tsx
interface AdvancedFiltersProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  organizations: Organization[];
}

export function AdvancedFilters({ filters, onFiltersChange, organizations }: AdvancedFiltersProps) {
  return (
    <Collapsible>
      <CollapsibleTrigger>
        Filtros Avanzados {hasActiveFilters && <Badge>{activeCount}</Badge>}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Organización */}
          <Select
            value={filters.organization_id}
            onValueChange={(v) => onFiltersChange({...filters, organization_id: v})}
          >
            <SelectTrigger>Organización</SelectTrigger>
            <SelectContent>
              {organizations.map(org => (
                <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Fecha de registro */}
          <DateRangePicker
            label="Fecha de registro"
            from={filters.registered_from}
            to={filters.registered_to}
            onChange={(from, to) => onFiltersChange({
              ...filters,
              registered_from: from,
              registered_to: to
            })}
          />

          {/* Último acceso */}
          <DateRangePicker
            label="Último acceso"
            from={filters.last_login_from}
            to={filters.last_login_to}
            onChange={(from, to) => onFiltersChange({
              ...filters,
              last_login_from: from,
              last_login_to: to
            })}
          />

          {/* Nivel */}
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Nivel min"
              value={filters.min_level}
              onChange={(e) => onFiltersChange({...filters, min_level: +e.target.value})}
            />
            <Input
              type="number"
              placeholder="Nivel max"
              value={filters.max_level}
              onChange={(e) => onFiltersChange({...filters, max_level: +e.target.value})}
            />
          </div>

          {/* Checkbox usuarios inactivos */}
          <Checkbox
            checked={filters.has_never_logged_in}
            onCheckedChange={(v) => onFiltersChange({...filters, has_never_logged_in: v})}
          >
            Solo usuarios que nunca han iniciado sesión
          </Checkbox>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
```

#### Criterios de Aceptación

- [ ] Filtro por organización con selector searchable
- [ ] Filtro por rango de fecha de registro
- [ ] Filtro por rango de último acceso
- [ ] Filtro por rango de nivel (gamificación)
- [ ] Checkbox "usuarios que nunca han iniciado sesión"
- [ ] Filtros combinables entre sí
- [ ] Badge con conteo de filtros activos
- [ ] Botón "Limpiar filtros"
- [ ] Persistencia de filtros en URL (query params)

---

## GAP-C03: Admin No Ve Comodines/Power-ups

### Descripción del Problema

**Situación actual:**
- Portal Student usa comodines (pistas, 50/50, skip)
- Backend tiene `comodinesService` con inventario y transacciones
- Admin NO tiene visibilidad del uso de comodines por estudiantes

**Impacto:**
- No se puede analizar engagement con sistema de ayudas
- No se detecta abuso de comodines
- No hay métricas de economía de comodines

### Solución Propuesta (P2)

#### Nuevo Tab en Gamification o Dashboard

**Endpoints requeridos:**

```yaml
GET /api/admin/comodines/stats
  Response:
    - total_comodines_purchased: number
    - total_comodines_used: number
    - most_used_type: string
    - ml_coins_spent: number
    - users_with_comodines: number

GET /api/admin/comodines/usage
  Query: date_from, date_to, user_id, comodin_type
  Response: PaginatedResponse<ComodinUsage>

GET /api/admin/comodines/users/:userId
  Response: UserComodinHistory
```

**Componentes Frontend:**
- `ComodinesStatsCards.tsx` - Cards con métricas
- `ComodinesUsageTable.tsx` - Tabla de uso
- Tab en AdminGamificationPage o AdminAnalyticsPage

#### Criterios de Aceptación (P2)

- [ ] Cards de estadísticas globales de comodines
- [ ] Tabla de uso con filtros (tipo, fecha, usuario)
- [ ] Gráfico de distribución por tipo
- [ ] Detalle de uso por estudiante individual

---

## GAP-C04: Admin No Ve Misiones Activas

### Descripción del Problema

**Situación actual:**
- Portal Student muestra misiones diarias/semanales
- Backend tiene `missionsService` con generación y tracking
- Admin NO puede ver qué misiones están activas ni completion rates

**Impacto:**
- No se puede medir engagement con sistema de misiones
- No hay datos para ajustar dificultad de misiones
- No se detectan problemas de balance

### Solución Propuesta (P2)

#### Nuevo Tab en Gamification

**Endpoints requeridos:**

```yaml
GET /api/admin/missions/stats
  Response:
    - active_daily_missions: number
    - active_weekly_missions: number
    - completion_rate_daily: number
    - completion_rate_weekly: number
    - avg_rewards_claimed: number

GET /api/admin/missions/active
  Response: Array<ActiveMissionSummary>

GET /api/admin/missions/users/:userId
  Response: UserMissionHistory
```

**Componentes Frontend:**
- `MissionsStatsCards.tsx` - Cards con métricas
- `ActiveMissionsTable.tsx` - Misiones activas del sistema
- Tab en AdminGamificationPage

#### Criterios de Aceptación (P2)

- [ ] Cards de estadísticas de misiones (daily vs weekly)
- [ ] Tabla de misiones activas con completion rate
- [ ] Gráfico de tendencia de completions
- [ ] Detalle de misiones por estudiante

---

## GAP-C05: Sin Notificación al Suspender Usuario

### Descripción del Problema

**Situación actual:**
- Admin puede suspender usuarios vía POST /admin/users/:id/suspend
- Usuario suspendido simplemente no puede hacer login
- NO se envía notificación al usuario explicando la suspensión

**Impacto:**
- Usuario no sabe por qué no puede acceder
- Genera confusión y tickets de soporte
- No hay comunicación formal de la acción

### Solución Propuesta (P2)

#### Integración con Notification Service

**Modificación en backend:**

**Archivo:** `apps/backend/src/modules/admin/services/admin-users.service.ts`

```typescript
async suspendUser(userId: string, adminId: string, reason: string): Promise<void> {
  // 1. Suspender usuario (existente)
  await this.usersRepository.update(userId, {
    status: 'suspended',
    suspended_at: new Date(),
    suspended_by: adminId,
    suspension_reason: reason
  });

  // 2. NUEVO: Enviar notificación al usuario
  const user = await this.usersRepository.findOne(userId);

  await this.notificationService.sendEmail({
    to: user.email,
    template: 'account-suspended',
    data: {
      userName: user.full_name,
      reason: reason,
      supportEmail: this.configService.get('SUPPORT_EMAIL'),
      appealUrl: `${this.configService.get('APP_URL')}/appeal-suspension`
    }
  });

  // 3. Crear notificación in-app (cuando reactive)
  await this.notificationService.create({
    user_id: userId,
    type: 'account_suspended',
    title: 'Tu cuenta ha sido suspendida',
    message: `Razón: ${reason}. Contacta soporte para más información.`,
    priority: 'high'
  });

  // 4. Audit log (existente)
  await this.auditService.log({
    actor_id: adminId,
    action_type: 'user.suspended',
    resource_type: 'user',
    resource_id: userId,
    metadata: { reason }
  });
}
```

**Template de email:**

```html
<!-- templates/account-suspended.hbs -->
<h1>Tu cuenta en GAMILIT ha sido suspendida</h1>
<p>Hola {{userName}},</p>
<p>Tu cuenta ha sido suspendida por el siguiente motivo:</p>
<blockquote>{{reason}}</blockquote>
<p>Si crees que esto es un error, puedes:</p>
<ul>
  <li>Contactar a soporte: {{supportEmail}}</li>
  <li>Apelar la decisión: <a href="{{appealUrl}}">Formulario de apelación</a></li>
</ul>
```

#### Criterios de Aceptación (P2)

- [ ] Email enviado automáticamente al suspender
- [ ] Email incluye razón de suspensión
- [ ] Email incluye información de contacto/apelación
- [ ] Notificación in-app creada para cuando usuario recupere acceso
- [ ] Similar para reactivación (email de "cuenta reactivada")

---

## Plan de Implementación por Prioridad

### Sprint 1 - P0 (Críticos)

| Item | Story Points | Días | Dependencias |
|------|-------------|------|--------------|
| GAP-C06: RLS Ejercicios | 5 | 1 | Ninguna |
| US-AE-009: Admin Assignments | 13 | 3 | Backend Assignments |

**Total Sprint 1:** 18 SP, 4 días

### Sprint 2 - P1 (Altos)

| Item | Story Points | Días | Dependencias |
|------|-------------|------|--------------|
| US-AE-010: Crear Usuarios | 13 | 3 | Ninguna |
| US-AE-011: Audit Logs UI | 8 | 2 | Ninguna |
| GAP-C07: Filtros Avanzados | 5 | 1 | Ninguna |

**Total Sprint 2:** 26 SP, 6 días

### Sprint 3 - P2 (Medios)

| Item | Story Points | Días | Dependencias |
|------|-------------|------|--------------|
| GAP-C03: Comodines Tracking | 8 | 2 | Ninguna |
| GAP-C04: Misiones Tracking | 8 | 2 | Ninguna |
| GAP-C05: Notificación Suspensión | 5 | 1 | Mail Service |

**Total Sprint 3:** 21 SP, 5 días

---

## Archivos Afectados (Resumen)

### Backend

```
apps/backend/src/modules/
├── educational/
│   ├── services/exercises.service.ts        # MODIFICAR - RLS
│   └── controllers/exercises.controller.ts  # MODIFICAR - RLS
├── admin/
│   ├── controllers/
│   │   ├── admin-assignments.controller.ts  # CREAR
│   │   └── admin-users.controller.ts        # MODIFICAR
│   ├── services/
│   │   ├── admin-assignments.service.ts     # CREAR
│   │   └── admin-users.service.ts           # MODIFICAR
│   └── dto/
│       ├── assignments/                      # CREAR directorio
│       └── users/list-users.dto.ts          # MODIFICAR
└── notifications/
    └── templates/                            # CREAR templates email
```

### Frontend

```
apps/frontend/src/apps/admin/
├── pages/
│   ├── AdminAssignmentsPage.tsx             # CREAR
│   └── AdminAuditLogsPage.tsx               # CREAR
├── components/
│   ├── assignments/                          # CREAR directorio
│   ├── audit/                                # CREAR directorio
│   └── users/
│       └── AdvancedFilters.tsx              # CREAR
└── hooks/
    ├── useAdminAssignments.ts               # CREAR
    └── useUserManagement.ts                 # MODIFICAR
```

---

## Referencias

- **Reporte de Análisis:** `orchestration/agentes/architecture-analyst/REPORTE-ANALISIS-PORTAL-STUDENTS-2025-11-29.md`
- **US Existentes:** `docs/03-fase-extensiones/EXT-002-admin-extendido/historias-usuario/`
- **Backend Admin Module:** `apps/backend/src/modules/admin/`
- **Frontend Admin App:** `apps/frontend/src/apps/admin/`

---

**Creado:** 2025-11-29
**Autor:** Architecture-Analyst
**Aprobación:** Pendiente
