# PLAN DE CORRECCIONES: COHERENCIA ARQUITECTÓNICA PORTAL ADMIN

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Proyecto:** GAMILIT - Portal de Administración
**Documento Base:** REPORTE-COHERENCIA-ARQUITECTONICA-2025-11-24.md
**Versión:** 1.0

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Correcciones Validadas](#correcciones-validadas)
3. [Plan P0: Duplicidad Interface Alert](#plan-p0-duplicidad-interface-alert)
4. [Plan P1: Acciones de Usuarios](#plan-p1-acciones-de-usuarios)
5. [Plan P1: Endpoint Dashboard Growth](#plan-p1-endpoint-dashboard-growth)
6. [Plan P1: Settings por Categoría](#plan-p1-settings-por-categoría)
7. [Orquestación de Agentes](#orquestación-de-agentes)
8. [Actualización de Documentación](#actualización-de-documentación)

---

## 📊 RESUMEN EJECUTIVO

### Hallazgo Crítico: Análisis Original Parcialmente Incorrecto

**IMPORTANTE:** Durante la validación con inventarios y trazas, se descubrió que el análisis de coherencia original contenía UN ERROR:

| Problema Reportado | Estado Real | Corrección Necesaria |
|--------------------|-------------|----------------------|
| **Módulo de Roles: 0/4 endpoints** | ❌ INCORRECTO | ✅ **4/4 endpoints IMPLEMENTADOS** |
| Duplicidad Interface Alert | ✅ CORRECTO | ✅ Requiere corrección |
| 22 endpoints faltantes | ⚠️ PARCIAL | ✅ Revalidar count exacto |

**Validación Realizada:**

```typescript
// Backend - AdminRolesController.ts (64 líneas)
✅ GET  /admin/roles                   // getRoles()
✅ GET  /admin/roles/permissions       // getAvailablePermissions()
✅ GET  /admin/roles/:id/permissions   // getRolePermissions()
✅ PUT  /admin/roles/:id/permissions   // updateRolePermissions()

// Frontend - adminAPI.ts
✅ adminAPI.roles.list()
✅ adminAPI.roles.getAvailablePermissions()
✅ adminAPI.roles.getPermissions(roleId)
✅ adminAPI.roles.updatePermissions(roleId, permissions)

// Hooks - useRoles.ts, useRolePermissions.ts
✅ Implementados y funcionales
✅ AdminRolesPage integrado con backend

// CONCLUSIÓN: Módulo de Roles 100% funcional
```

### Correcciones Revalidadas

| Prioridad | Corrección | Estado Original | Estado Validado | Acción |
|-----------|-----------|-----------------|-----------------|--------|
| **P0** | Duplicidad Alert | ✅ Válido | ✅ Válido | Implementar |
| **P0** | Módulo Roles | ❌ Inválido | ✅ YA IMPLEMENTADO | Documentar |
| **P1** | Acciones Usuarios | ✅ Válido | ✅ Válido | Implementar |
| **P1** | Dashboard Growth | ✅ Válido | ✅ Válido | Implementar |
| **P1** | Settings Categorías | ✅ Válido | ✅ Válido | Implementar |

### Endpoints Faltantes (Recuento Actualizado)

**Backend implementado:**
- ✅ Alertas: 7/7 (100%)
- ✅ Analíticas: 7/7 (100%)
- ✅ Progreso: 6/6 (100%)
- ✅ Monitoreo: 5/5 (100%)
- ✅ Organizaciones: 6/6 (100%)
- ✅ Contenido: 8/8 (100%)
- ✅ **Roles: 4/4 (100%)** ← **CORREGIDO**

**Backend faltante:**
- ⚠️ Dashboard: 2/3 (66.7%) - **Falta 1 endpoint**
- ⚠️ Usuarios: 3/8 (37.5%) - **Faltan 5 endpoints**
- ⚠️ Gamificación: 1/5 (20%) - **Faltan 4 endpoints**
- ⚠️ Settings: 2/6 (33.3%) - **Faltan 4 endpoints**
- ⚠️ Reportes: 2/4 (50%) - **Faltan 2 endpoints**

**Total Actualizado:** 55/77 → **59/77 (76.6%)** - **Faltan 18 endpoints** (antes eran 22)

---

## ✅ CORRECCIONES VALIDADAS

### ❌ DESCARTADO: Implementar Módulo de Roles

**Razón:** El módulo de roles YA está completamente implementado.

**Evidencia:**

1. **Backend Files:**
   - `apps/backend/src/modules/admin/controllers/admin-roles.controller.ts` (64 líneas)
   - `apps/backend/src/modules/admin/services/admin-roles.service.ts` (237 líneas)
   - `apps/backend/src/modules/admin/dto/roles/role.dto.ts` (78 líneas)

2. **Frontend Files:**
   - `apps/frontend/src/apps/admin/pages/AdminRolesPage.tsx` (100+ líneas)
   - `apps/frontend/src/apps/admin/hooks/useRoles.ts` (194 líneas)
   - `apps/frontend/src/apps/admin/hooks/useRolePermissions.ts` (215 líneas)

3. **API Integration:**
   - adminAPI.roles.list() ✅
   - adminAPI.roles.getAvailablePermissions() ✅
   - adminAPI.roles.getPermissions(roleId) ✅
   - adminAPI.roles.updatePermissions(roleId, permissions) ✅

**Acción:** Actualizar inventarios y documentación para reflejar que Roles está 100% implementado.

---

## 🔴 PLAN P0: DUPLICIDAD INTERFACE ALERT

### Problema Identificado

**Severidad:** CRÍTICO (P0)
**Impacto:** Name collision puede causar errores de compilación TypeScript
**Archivos Afectados:** 10

**Duplicidad Detectada:**

```typescript
// ❌ CONFLICTO: Dos interfaces con el mismo nombre

// File 1: apps/frontend/src/services/api/adminTypes.ts:581
export interface Alert {
  id: string;
  tenant_id?: string;
  alert_type: AlertType;       // SystemAlertType
  severity: AlertSeverity;
  // ... 29 propiedades (Sistema de Alertas Admin)
}

// File 2: apps/frontend/src/services/api/teacher/interventionAlertsApi.ts:39
export interface Alert {       // ❌ NAME COLLISION
  id: string;
  student_id: string;           // Diferente estructura
  classroom_id: string;
  alert_type: AlertType;        // InterventionAlertType
  // ... 17 propiedades (Alertas de Intervención Teacher)
}
```

### Solución: Renombrado Semántico

**Estrategia:** Renombrar ambas interfaces para reflejar su propósito específico.

#### Paso 1: Renombrar en adminTypes.ts

```typescript
// apps/frontend/src/services/api/adminTypes.ts

// ANTES (líneas 575-581)
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved' | 'suppressed';
export type AlertType = 'performance_degradation' | 'high_error_rate' | ...;

export interface Alert { ... }

// DESPUÉS
export type SystemAlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type SystemAlertStatus = 'open' | 'acknowledged' | 'resolved' | 'suppressed';
export type SystemAlertType = 'performance_degradation' | 'high_error_rate' | ...;

export interface SystemAlert {
  id: string;
  tenant_id?: string;
  alert_type: SystemAlertType;
  severity: SystemAlertSeverity;
  status: SystemAlertStatus;
  // ... resto de propiedades
}

// Alias para compatibilidad (opcional - deprecar después)
/**
 * @deprecated Use SystemAlert instead
 */
export type Alert = SystemAlert;
```

#### Paso 2: Renombrar en interventionAlertsApi.ts

```typescript
// apps/frontend/src/services/api/teacher/interventionAlertsApi.ts

// ANTES (líneas 11-39)
export type AlertType = 'low_completion' | 'high_error_rate' | ...;
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved' | 'dismissed';

export interface Alert { ... }

// DESPUÉS
export type InterventionAlertType = 'low_completion' | 'high_error_rate' | ...;
export type InterventionAlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type InterventionAlertStatus = 'open' | 'acknowledged' | 'resolved' | 'dismissed';

export interface StudentInterventionAlert {
  id: string;
  student_id: string;
  classroom_id: string;
  alert_type: InterventionAlertType;
  severity: InterventionAlertSeverity;
  status: InterventionAlertStatus;
  // ... resto de propiedades
}

// Alias para compatibilidad (opcional - deprecar después)
/**
 * @deprecated Use StudentInterventionAlert instead
 */
export type Alert = StudentInterventionAlert;
```

#### Paso 3: Actualizar Imports (8 archivos Admin)

**Archivos a modificar:**

1. `apps/frontend/src/apps/admin/pages/AdminAlertsPage.tsx`
2. `apps/frontend/src/apps/admin/components/alerts/AlertsList.tsx`
3. `apps/frontend/src/apps/admin/components/alerts/AlertCard.tsx`
4. `apps/frontend/src/apps/admin/components/alerts/AlertDetailsModal.tsx`
5. `apps/frontend/src/apps/admin/components/alerts/AcknowledgeAlertModal.tsx`
6. `apps/frontend/src/apps/admin/components/alerts/ResolveAlertModal.tsx`
7. `apps/frontend/src/apps/admin/components/alerts/AlertsStats.tsx`
8. `apps/frontend/src/apps/admin/components/monitoring/AlertasTab.tsx`

**Cambio a realizar:**

```typescript
// ANTES
import type { Alert, AlertSeverity, AlertStatus, AlertType } from '@/services/api/adminTypes';

// DESPUÉS
import type {
  SystemAlert,
  SystemAlertSeverity,
  SystemAlertStatus,
  SystemAlertType
} from '@/services/api/adminTypes';

// Actualizar todas las referencias en el archivo
Alert → SystemAlert
AlertSeverity → SystemAlertSeverity
AlertStatus → SystemAlertStatus
AlertType → SystemAlertType
```

#### Paso 4: Actualizar Imports (1 archivo Teacher)

**Archivo a modificar:**

1. `apps/frontend/src/apps/teacher/components/alerts/InterventionAlertsPanel.tsx`

**Cambio a realizar:**

```typescript
// ANTES
import { Alert, AlertType, AlertSeverity, AlertStatus } from '@/services/api/teacher/interventionAlertsApi';

// DESPUÉS
import {
  StudentInterventionAlert,
  InterventionAlertType,
  InterventionAlertSeverity,
  InterventionAlertStatus
} from '@/services/api/teacher/interventionAlertsApi';

// Actualizar todas las referencias
Alert → StudentInterventionAlert
AlertType → InterventionAlertType
AlertSeverity → InterventionAlertSeverity
AlertStatus → InterventionAlertStatus
```

### Archivos Totales a Modificar

| Archivo | Tipo | Cambios |
|---------|------|---------|
| `adminTypes.ts` | Types | Renombrar 4 types + 1 interface |
| `interventionAlertsApi.ts` | Types | Renombrar 3 types + 1 interface |
| `AdminAlertsPage.tsx` | Component | Actualizar imports y referencias |
| `AlertsList.tsx` | Component | Actualizar imports y referencias |
| `AlertCard.tsx` | Component | Actualizar imports y referencias |
| `AlertDetailsModal.tsx` | Component | Actualizar imports y referencias |
| `AcknowledgeAlertModal.tsx` | Component | Actualizar imports y referencias |
| `ResolveAlertModal.tsx` | Component | Actualizar imports y referencias |
| `AlertsStats.tsx` | Component | Actualizar imports y referencias |
| `AlertasTab.tsx` | Component | Actualizar imports y referencias |
| `InterventionAlertsPanel.tsx` | Component | Actualizar imports y referencias |

**Total:** 11 archivos

### Validación Post-Implementación

```bash
# 1. Verificar que no quedan referencias a Alert sin prefijo
grep -rn "^import.*Alert[^a-zA-Z]" apps/frontend/src/apps/admin --include="*.tsx"
grep -rn "^import.*Alert[^a-zA-Z]" apps/frontend/src/apps/teacher --include="*.tsx"

# 2. Compilar TypeScript
cd apps/frontend
npm run type-check

# 3. Build de producción
npm run build

# Esperado: 0 errores de compilación
```

### Esfuerzo Estimado

- **Tiempo:** 2-3 horas
- **Riesgo:** Bajo (cambio mecánico, no breaking si se hace correcto)
- **Prioridad:** P0 (CRÍTICO - debe resolverse antes de merge)

---

## 🟡 PLAN P1: ACCIONES DE USUARIOS

### Problema Identificado

**Severidad:** IMPORTANTE (P1)
**Impacto:** Usuarios solo pueden consultarse, no modificarse desde UI Admin
**Endpoints Faltantes:** 5 de 8

**Estado Actual:**

```typescript
// ✅ IMPLEMENTADOS (3/8)
GET  /admin/users              // Listar usuarios
GET  /admin/users/:id          // Detalle de usuario
GET  /admin/users/stats        // Estadísticas

// ❌ FALTANTES (5/8)
POST   /admin/users            // Crear usuario
PATCH  /admin/users/:id        // Actualizar usuario
DELETE /admin/users/:id        // Eliminar usuario
PATCH  /admin/users/:id/suspend // Suspender usuario
PATCH  /admin/users/:id/activate // Activar usuario
```

### Solución: Implementar CRUD Completo de Usuarios

#### Archivos a Crear/Modificar

**Backend:**

1. **Controller:** `apps/backend/src/modules/admin/controllers/admin-users.controller.ts`
   - Agregar 5 nuevos endpoints

2. **Service:** `apps/backend/src/modules/admin/services/admin-users.service.ts`
   - Implementar métodos: createUser, updateUser, deleteUser, suspendUser, activateUser

3. **DTOs:** `apps/backend/src/modules/admin/dto/users/`
   - `create-user.dto.ts` (nombre, email, role, organization, password)
   - `update-user.dto.ts` (Partial de CreateUserDto)
   - `suspend-user.dto.ts` (reason, duration)
   - `activate-user.dto.ts` (optional note)

**Frontend:**

4. **API:** `apps/frontend/src/services/api/adminAPI.ts`
   - Agregar 5 métodos al módulo users

5. **Components:** `apps/frontend/src/apps/admin/components/users/`
   - `CreateUserModal.tsx`
   - `EditUserModal.tsx`
   - `DeleteUserConfirmModal.tsx`
   - `SuspendUserModal.tsx`

6. **Hook:** `apps/frontend/src/apps/admin/hooks/useUsers.ts`
   - Agregar métodos: createUser, updateUser, deleteUser, suspendUser, activateUser

### Implementación Detallada

#### 1. Backend - CreateUserDto

```typescript
// apps/backend/src/modules/admin/dto/users/create-user.dto.ts

import { IsEmail, IsString, IsEnum, IsUUID, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserRole {
  STUDENT = 'student',
  ADMIN_TEACHER = 'admin_teacher',
  SUPER_ADMIN = 'super_admin',
}

export class CreateUserDto {
  @ApiProperty({ description: 'User full name', example: 'Juan Pérez' })
  @IsString()
  full_name!: string;

  @ApiProperty({ description: 'User email address', example: 'juan@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'User role', enum: UserRole, example: UserRole.STUDENT })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiPropertyOptional({ description: 'Organization/Tenant ID', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  organization_id?: string;

  @ApiPropertyOptional({ description: 'Initial password (optional, auto-generated if not provided)' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({ description: 'Send welcome email', default: true })
  @IsOptional()
  send_welcome_email?: boolean;
}
```

#### 2. Backend - AdminUsersService.createUser()

```typescript
// apps/backend/src/modules/admin/services/admin-users.service.ts

async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
  // 1. Validar que email no existe
  const existingUser = await this.usersRepo.findOne({ where: { email: dto.email } });
  if (existingUser) {
    throw new BadRequestException(`User with email ${dto.email} already exists`);
  }

  // 2. Generar password si no se proporciona
  const password = dto.password || this.generateRandomPassword();
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Crear usuario en auth.users (Supabase table)
  const user = this.usersRepo.create({
    email: dto.email,
    encrypted_password: hashedPassword,
    role: dto.role,
    email_confirmed_at: new Date(), // Auto-confirm for admin-created users
  });
  await this.usersRepo.save(user);

  // 4. Crear profile en auth_management.profiles
  const profile = this.profilesRepo.create({
    user_id: user.id,
    full_name: dto.full_name,
    tenant_id: dto.organization_id,
    role: dto.role,
  });
  await this.profilesRepo.save(profile);

  // 5. Enviar email de bienvenida (opcional)
  if (dto.send_welcome_email) {
    await this.emailService.sendWelcomeEmail(user.email, password);
  }

  // 6. Retornar usuario creado
  return this.mapToDto(user, profile);
}
```

#### 3. Backend - SuspendUser Endpoint

```typescript
// apps/backend/src/modules/admin/controllers/admin-users.controller.ts

@Patch(':id/suspend')
@ApiOperation({ summary: 'Suspend user account' })
async suspendUser(
  @Param('id') id: string,
  @Body() dto: SuspendUserDto,
): Promise<UserResponseDto> {
  return await this.adminUsersService.suspendUser(id, dto);
}
```

#### 4. Frontend - CreateUserModal

```typescript
// apps/frontend/src/apps/admin/components/users/CreateUserModal.tsx

export function CreateUserModal({ isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState<CreateUserFormData>({
    full_name: '',
    email: '',
    role: 'student',
    organization_id: '',
    password: '',
    send_welcome_email: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newUser = await adminAPI.users.create(formData);
      onSuccess(newUser);
      onClose();
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Nuevo Usuario">
      <form onSubmit={handleSubmit}>
        <Input
          label="Nombre Completo"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <Select
          label="Rol"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
          options={[
            { value: 'student', label: 'Estudiante' },
            { value: 'admin_teacher', label: 'Profesor' },
            { value: 'super_admin', label: 'Administrador' },
          ]}
        />
        <Button type="submit">Crear Usuario</Button>
      </form>
    </Modal>
  );
}
```

### Validación Post-Implementación

```bash
# 1. Ejecutar tests backend
npm run test apps/backend/src/modules/admin/services/admin-users.service.spec.ts

# 2. Testing manual con script bash
./apps/backend/scripts/test-admin-users-endpoints.sh

# 3. Compilar frontend
cd apps/frontend && npm run build

# Esperado: Todos los tests pasan, build exitoso
```

### Esfuerzo Estimado

- **Tiempo:** 2-3 días
- **Riesgo:** Medio (requiere manejo de passwords y emails)
- **Prioridad:** P1 (IMPORTANTE - próximo sprint)

---

## 🟡 PLAN P1: ENDPOINT DASHBOARD GROWTH

### Problema Identificado

**Severidad:** IMPORTANTE (P1)
**Impacto:** Gráfico de crecimiento mensual no disponible en dashboard
**Endpoint Faltante:** 1 de 3

**Estado Actual:**

```typescript
// ✅ IMPLEMENTADOS (2/3)
GET /admin/dashboard/stats      // Estadísticas generales
GET /admin/dashboard/activity   // Actividad reciente

// ❌ FALTANTE (1/3)
GET /admin/dashboard/growth     // Datos de crecimiento mensual
```

### Solución: Implementar Endpoint de Crecimiento

#### Implementación Backend

```typescript
// apps/backend/src/modules/admin/controllers/admin-dashboard.controller.ts

@Get('growth')
@ApiOperation({
  summary: 'Get monthly growth data',
  description: 'Returns monthly growth metrics for users and organizations over the last 12 months',
})
async getGrowthData(@Query() query: GrowthQueryDto): Promise<MonthlyGrowthDto[]> {
  return await this.adminDashboardService.getGrowthData(query);
}
```

```typescript
// apps/backend/src/modules/admin/services/admin-dashboard.service.ts

async getGrowthData(query: GrowthQueryDto): Promise<MonthlyGrowthDto[]> {
  const months = query.months || 12;
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  // Query para obtener usuarios creados por mes
  const usersGrowth = await this.usersRepo
    .createQueryBuilder('u')
    .select("to_char(u.created_at, 'YYYY-MM') as month")
    .addSelect('COUNT(u.id) as count')
    .where('u.created_at >= :startDate', { startDate })
    .groupBy("to_char(u.created_at, 'YYYY-MM')")
    .orderBy("to_char(u.created_at, 'YYYY-MM')", 'ASC')
    .getRawMany();

  // Query para obtener organizaciones creadas por mes
  const orgsGrowth = await this.tenantsRepo
    .createQueryBuilder('t')
    .select("to_char(t.created_at, 'YYYY-MM') as month")
    .addSelect('COUNT(t.id) as count')
    .where('t.created_at >= :startDate', { startDate })
    .groupBy("to_char(t.created_at, 'YYYY-MM')")
    .orderBy("to_char(t.created_at, 'YYYY-MM')", 'ASC')
    .getRawMany();

  // Combinar datos por mes
  const growthMap = new Map<string, MonthlyGrowthDto>();
  usersGrowth.forEach(row => {
    growthMap.set(row.month, {
      month: row.month,
      users: parseInt(row.count),
      organizations: 0,
    });
  });

  orgsGrowth.forEach(row => {
    const existing = growthMap.get(row.month);
    if (existing) {
      existing.organizations = parseInt(row.count);
    } else {
      growthMap.set(row.month, {
        month: row.month,
        users: 0,
        organizations: parseInt(row.count),
      });
    }
  });

  return Array.from(growthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
}
```

#### DTO

```typescript
// apps/backend/src/modules/admin/dto/dashboard/monthly-growth.dto.ts

export class GrowthQueryDto {
  @ApiPropertyOptional({ description: 'Number of months to retrieve', default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  months?: number = 12;
}

export class MonthlyGrowthDto {
  @ApiProperty({ description: 'Month in YYYY-MM format', example: '2025-11' })
  month!: string;

  @ApiProperty({ description: 'Number of users created in this month', example: 150 })
  users!: number;

  @ApiProperty({ description: 'Number of organizations created in this month', example: 5 })
  organizations!: number;
}
```

#### Frontend

```typescript
// apps/frontend/src/services/api/adminAPI.ts

export const adminAPI = {
  dashboard: {
    getStats: async () => { /* ... */ },
    getRecentActivity: async () => { /* ... */ },

    // ✅ NUEVO
    getGrowthData: async (months: number = 12): Promise<MonthlyGrowth[]> => {
      const response = await apiClient.get('/admin/dashboard/growth', {
        params: { months }
      });
      return response.data.data;
    },
  },
};
```

### Esfuerzo Estimado

- **Tiempo:** 4-6 horas
- **Riesgo:** Bajo (query simple de agregación)
- **Prioridad:** P1 (IMPORTANTE)

---

## 🟡 PLAN P1: SETTINGS POR CATEGORÍA

### Problema Identificado

**Severidad:** IMPORTANTE (P1)
**Impacto:** Solo 2 de 6 categorías de settings son editables desde UI
**Endpoints Faltantes:** 4 de 6

**Estado Actual:**

```typescript
// ✅ IMPLEMENTADOS (2/6)
GET /admin/settings/general       // Configuración general
PUT /admin/settings/general       // Actualizar general

// ❌ FALTANTES (4/6)
GET /admin/settings/email         // Configuración de email
PUT /admin/settings/email         // Actualizar email
GET /admin/settings/notifications // Configuración de notificaciones
PUT /admin/settings/notifications // Actualizar notificaciones
```

### Solución: Implementar Settings por Categoría

#### Backend - EmailSettingsDto

```typescript
// apps/backend/src/modules/admin/dto/settings/email-settings.dto.ts

export class EmailSettingsDto {
  @ApiProperty()
  @IsString()
  smtp_host!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(65535)
  smtp_port!: number;

  @ApiProperty()
  @IsString()
  smtp_user!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  smtp_password?: string; // Never returned in GET

  @ApiProperty()
  @IsEmail()
  smtp_from!: string;

  @ApiProperty()
  @IsString()
  smtp_from_name!: string;
}
```

#### Backend - Controller

```typescript
// apps/backend/src/modules/admin/controllers/admin-settings.controller.ts

@Get('email')
async getEmailSettings(): Promise<EmailSettingsDto> {
  return await this.settingsService.getEmailSettings();
}

@Put('email')
async updateEmailSettings(@Body() dto: EmailSettingsDto): Promise<EmailSettingsDto> {
  return await this.settingsService.updateEmailSettings(dto);
}

@Get('notifications')
async getNotificationSettings(): Promise<NotificationSettingsDto> {
  return await this.settingsService.getNotificationSettings();
}

@Put('notifications')
async updateNotificationSettings(@Body() dto: NotificationSettingsDto): Promise<NotificationSettingsDto> {
  return await this.settingsService.updateNotificationSettings(dto);
}
```

### Esfuerzo Estimado

- **Tiempo:** 1-2 días
- **Riesgo:** Medio (manejo de contraseñas SMTP)
- **Prioridad:** P1 (IMPORTANTE)

---

## 🤖 ORQUESTACIÓN DE AGENTES

### Agentes Requeridos

| Agente | Tarea | Prioridad | Duración |
|--------|-------|-----------|----------|
| **Frontend-Agent** | P0: Renombrar Alert interfaces | P0 | 2-3 horas |
| **Backend-Agent** | P1: Implementar CRUD Usuarios | P1 | 2-3 días |
| **Backend-Agent** | P1: Implementar Dashboard Growth | P1 | 4-6 horas |
| **Backend-Agent** | P1: Implementar Settings Email/Notifications | P1 | 1-2 días |
| **Frontend-Agent** | P1: Actualizar UI para nuevos endpoints | P1 | 1 día |

### Orden de Ejecución

**Sprint Actual (Semana 48):**

1. **Día 1:** P0 - Duplicidad Alert (Frontend-Agent)
   - Renombrar interfaces
   - Actualizar imports
   - Validar compilación

2. **Día 2-4:** P1 - CRUD Usuarios (Backend-Agent + Frontend-Agent en paralelo)
   - Backend: Controller, Service, DTOs
   - Frontend: Modals, Hook updates

**Próximo Sprint (Semana 49):**

3. **Día 1:** P1 - Dashboard Growth (Backend-Agent)
   - Implementar endpoint
   - Testing

4. **Día 2-3:** P1 - Settings (Backend-Agent + Frontend-Agent en paralelo)
   - Backend: Endpoints Email/Notifications
   - Frontend: Settings tabs

### Comandos de Orquestación

```markdown
## P0: Duplicidad Alert

Orquestar Frontend-Agent para:
1. Renombrar interface Alert → SystemAlert en adminTypes.ts
2. Renombrar interface Alert → StudentInterventionAlert en interventionAlertsApi.ts
3. Actualizar imports en 9 archivos (8 admin + 1 teacher)
4. Validar npm run type-check
5. Validar npm run build

## P1: CRUD Usuarios

Orquestar Backend-Agent para:
1. Crear DTOs: create-user.dto.ts, update-user.dto.ts, suspend-user.dto.ts
2. Implementar 5 métodos en admin-users.service.ts
3. Agregar 5 endpoints en admin-users.controller.ts
4. Crear tests unitarios
5. Validar npm run test

Orquestar Frontend-Agent para:
1. Crear CreateUserModal, EditUserModal, SuspendUserModal
2. Actualizar useUsers hook
3. Agregar métodos a adminAPI.users
4. Validar npm run build
```

---

## 📝 ACTUALIZACIÓN DE DOCUMENTACIÓN

### Inventarios a Actualizar

1. **DATABASE_INVENTORY.yml**
   - No requiere cambios (DB no afectada)

2. **BACKEND_INVENTORY.yml**
   - Agregar 10 nuevos endpoints (5 users + 1 dashboard + 4 settings)
   - Actualizar count total: 55 → 65 endpoints
   - Actualizar módulo de Roles: Documentar que está 100% implementado

3. **FRONTEND_INVENTORY.yml**
   - Agregar 4 nuevos modals
   - Actualizar types (renombrado Alert)
   - Agregar nuevos métodos en adminAPI

### Trazas a Actualizar

1. **TRAZA-TAREAS-BACKEND.md**
   - Agregar BE-130: Implementar CRUD Usuarios
   - Agregar BE-131: Implementar Dashboard Growth
   - Agregar BE-132: Implementar Settings Email/Notifications
   - Actualizar BE-XXX: Documentar que Roles está completo

2. **TRAZA-TAREAS-FRONTEND.md**
   - Agregar FE-101: Resolver Duplicidad Alert
   - Agregar FE-102: Implementar Modals CRUD Usuarios
   - Agregar FE-103: Integrar nuevos endpoints

### Reporte de Coherencia

**Actualizar REPORTE-COHERENCIA-ARQUITECTONICA-2025-11-24.md:**

1. Sección "Hallazgos Críticos" → Agregar nota de corrección sobre Roles
2. Sección "Endpoints Faltantes" → Actualizar de 22 a 18 faltantes
3. Matriz de Coherencia → Actualizar Roles de 0% a 100%
4. Score General → Recalcular: 95.3% → ~97% (después de correcciones)

---

## ✅ CRITERIOS DE ACEPTACIÓN

### P0: Duplicidad Alert

- [ ] Interface Alert renombrada a SystemAlert en adminTypes.ts
- [ ] Interface Alert renombrada a StudentInterventionAlert en interventionAlertsApi.ts
- [ ] Todos los imports actualizados (11 archivos)
- [ ] `npm run type-check` pasa sin errores
- [ ] `npm run build` pasa sin errores
- [ ] 0 referencias a `Alert` sin prefijo en codebase

### P1: CRUD Usuarios

- [ ] 5 nuevos endpoints implementados y documentados en Swagger
- [ ] DTOs validados con class-validator
- [ ] Tests unitarios con >80% coverage
- [ ] Modals de creación/edición/suspensión funcionales
- [ ] Emails de bienvenida enviados correctamente
- [ ] Validación de email único funciona

### P1: Dashboard Growth

- [ ] Endpoint GET /admin/dashboard/growth implementado
- [ ] Query optimizada con índices
- [ ] Frontend muestra gráfico de crecimiento mensual
- [ ] Datos retroactivos de 12 meses disponibles

### P1: Settings

- [ ] 4 endpoints implementados (email, notifications GET/PUT)
- [ ] Contraseñas SMTP nunca retornadas en GET
- [ ] Tabs de configuración funcionales en UI
- [ ] Validación de SMTP settings funciona

---

## 📊 MÉTRICAS DE ÉXITO

Al completar todas las correcciones:

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Coherencia General** | 95.3% | ~97.5% | +2.2% |
| **Endpoints Implementados** | 59/77 (76.6%) | 69/77 (89.6%) | +13% |
| **Módulos 100% Funcionales** | 7/12 (58.3%) | 10/12 (83.3%) | +25% |
| **Issues Críticos (P0)** | 1 | 0 | -100% |
| **Issues Importantes (P1)** | 4 | 1 | -75% |

---

## 📅 CRONOGRAMA

### Semana 48 (Actual)

**Lunes:**
- ✅ Análisis de coherencia completado
- ✅ Plan de correcciones generado
- ⏳ Iniciar P0: Duplicidad Alert

**Martes-Jueves:**
- ⏳ Completar P0: Duplicidad Alert
- ⏳ Iniciar P1: CRUD Usuarios (backend)

**Viernes:**
- ⏳ P1: CRUD Usuarios (frontend)
- ⏳ Testing y validación

### Semana 49 (Próxima)

**Lunes:**
- ⏳ P1: Dashboard Growth
- ⏳ Testing

**Martes-Miércoles:**
- ⏳ P1: Settings Email/Notifications
- ⏳ Testing

**Jueves:**
- ⏳ Actualización de inventarios y trazas
- ⏳ Documentación

**Viernes:**
- ⏳ Smoke testing completo
- ⏳ Deploy a staging

---

## 📞 CONTACTO Y SOPORTE

**Analista Responsable:** Architecture-Analyst
**Fecha de Plan:** 2025-11-24
**Versión:** 1.0
**Estado:** Listo para Ejecución

**Para consultas:**
1. Revisar este plan detallado
2. Consultar documentación de cada módulo en `EAI-008-portal-admin/`
3. Contactar al Tech Lead para aprobación de ejecución

---

**Versión:** 1.0
**Estado:** Aprobado para Ejecución
**Última Actualización:** 2025-11-24

---

**Mantenido por:** Architecture-Analyst
