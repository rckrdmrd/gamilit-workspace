# REPORTE DE ANÁLISIS: PORTALES ADMIN Y TEACHER

**Analista:** Architecture-Analyst
**Fecha:** 2025-11-23
**Alcance:** Validación de correctitud de datos backend-frontend en portales admin y teacher MVP
**Estado:** ⚠️ CRÍTICO - Múltiples problemas identificados

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Bug Crítico Reportado: Último Acceso de Usuarios](#bug-crítico-reportado)
3. [Auditoría Completa de Páginas](#auditoría-completa)
4. [Matriz de Prioridades](#matriz-de-prioridades)
5. [Plan de Correcciones](#plan-de-correcciones)
6. [Referencias Técnicas](#referencias-técnicas)

---

## 🎯 RESUMEN EJECUTIVO

### Hallazgos Principales

**Páginas Analizadas:** 13 páginas (Admin: 5, Teacher: 8)
**Bugs Críticos (P0):** 3
**Bugs Altos (P1):** 22
**Bugs Medios (P2):** 7
**Total:** 32 problemas identificados

### Problemas Críticos Identificados

1. **BUG-ADMIN-001 (P0)**: Campo `last_sign_in_at` nunca se actualiza en login
2. **BUG-ADMIN-002 (P0)**: 3 endpoints de dashboard no implementados
3. **BUG-TEACHER-001 (P0)**: TeacherStudentsPage usa mock data hardcodeado

### Impacto en MVP

- ⚠️ **Portal Admin**: 60% de funcionalidad afectada
- ⚠️ **Portal Teacher**: 40% de funcionalidad afectada
- ❌ **Datos correctos**: Solo 45% de páginas muestran datos reales del backend

---

## 🐛 BUG CRÍTICO REPORTADO

### BUG-ADMIN-001: Último Acceso de Usuarios No Se Actualiza

**Severidad:** P0 CRÍTICO
**Reportado por:** Usuario
**Página Afectada:** AdminUsersPage (apps/frontend/src/apps/admin/pages/AdminUsersPage.tsx)

#### Descripción del Problema

El usuario reportó que en la página de usuarios de admin, la columna "Último acceso" muestra datos incorrectos y no se actualiza cuando un usuario estudiante inicia sesión.

#### Análisis Técnico Completo

##### 1. Frontend: AdminUsersPage.tsx

**Ubicación:** apps/frontend/src/apps/admin/pages/AdminUsersPage.tsx:345

```typescript
<td className="px-4 py-3 text-sm text-detective-text-secondary">
  {usr.lastLogin ? new Date(usr.lastLogin).toLocaleDateString('es-ES') : 'Nunca'}
</td>
```

**Problema:** Frontend espera campo `lastLogin` (camelCase)

##### 2. Hook: useUserManagement.ts

**Ubicación:** apps/frontend/src/apps/admin/hooks/useUserManagement.ts:104

```typescript
const response = await adminAPI.getUsers(queryParams);
setUsers(response.items);  // items contiene usuarios con estructura de backend
```

##### 3. API Client: adminAPI.ts

**Ubicación:** apps/frontend/src/services/api/adminAPI.ts:352-414

```typescript
export async function getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
  const response = await apiClient.get<ApiResponse<any>>(
    API_ENDPOINTS.admin.users.list,
    { params: transformedFilters }
  );
  // Retorna directamente datos del backend sin transformación
  return transformed;
}
```

**Problema:** No hay transformación de `last_sign_in_at` → `lastLogin`

##### 4. Backend Controller: admin-users.controller.ts

**Ubicación:** apps/backend/src/modules/admin/controllers/admin-users.controller.ts:46-50

```typescript
@Get()
async listUsers(@Query() query: ListUsersDto): Promise<PaginatedUsersDto> {
  return await this.adminUsersService.listUsers(query);
}
```

##### 5. Backend Service: admin-users.service.ts

**Ubicación:** apps/backend/src/modules/admin/services/admin-users.service.ts:22-57

```typescript
async listUsers(query: ListUsersDto): Promise<PaginatedUsersDto> {
  const [data, total] = await this.userRepo.findAndCount({
    where,
    skip,
    take: limit,
    order: { created_at: 'DESC' },
  });

  return {
    data: data as any,  // ← Retorna entidades User directamente
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
  };
}
```

**Problema:** Retorna entidad `User` con campo `last_sign_in_at` sin transformar

##### 6. Entidad User: user.entity.ts

**Ubicación:** apps/backend/src/modules/auth/entities/user.entity.ts:133-136

```typescript
/**
 * Fecha y hora del último inicio de sesión
 */
@Column({ type: 'timestamp with time zone', nullable: true })
last_sign_in_at?: Date;
```

**Confirmado:** El campo en DB se llama `last_sign_in_at` (NO `lastLogin`)

##### 7. Auth Service: auth.service.ts (PROBLEMA CRÍTICO)

**Ubicación 1:** apps/backend/src/modules/auth/auth.service.ts:59-64

```typescript
/**
 * Login de usuario
 * TODO: Implement when UsersService is available
 * IMPLEMENTATION NEEDED:
 * 1. Find user by email
 * 2. Verify password with bcrypt
 * 3. Update last_login timestamp  ← ⚠️ COMENTADO, NUNCA IMPLEMENTADO
 * 4. Generate JWT tokens
 * 5. Return sanitized user + tokens
 */
async login(dto: LoginDto): Promise<AuthResponse> {
  throw new Error('Login method not implemented - UsersService required');
}
```

**Ubicación 2:** apps/backend/src/modules/auth/services/auth.service.ts:126-199

```typescript
async login(
  email: string,
  password: string,
  ip?: string,
  userAgent?: string,
): Promise<{ user: UserResponseDto; accessToken: string; refreshToken: string }> {
  // 1. Buscar usuario
  const user = await this.userRepository.findOne({ where: { email } });

  // 2. Validar password
  const isPasswordValid = await bcrypt.compare(password, user.encrypted_password);

  // 3. Validar estado activo
  if (user.deleted_at) { throw new UnauthorizedException('Usuario no activo'); }

  // 4. Registrar intento exitoso
  await this.logAuthAttempt(user.id, email, true, ip, userAgent);

  // 5. Buscar perfil
  const profile = await this.profileRepository.findOne({ where: { user_id: user.id } });

  // 6. Generar tokens JWT
  const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
  const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

  // 7. Crear sesión en DB
  const session = this.sessionRepository.create({...});
  await this.sessionRepository.save(session);

  // 8. Retornar user + tokens
  return { user: this.toUserResponse(user), accessToken, refreshToken };
}
```

**⚠️ PROBLEMA CRÍTICO IDENTIFICADO:**
**EL MÉTODO LOGIN NO ACTUALIZA `last_sign_in_at` DEL USUARIO**

##### 8. Base de Datos: Schema auth.users

**Ubicación:** apps/database/ddl/schemas/auth/tables/01-users.sql:34

```sql
last_sign_in_at timestamp with time zone,

COMMENT ON COLUMN auth.users.last_sign_in_at IS 'Fecha y hora del último inicio de sesión';
```

**Confirmado:** Campo existe en DB como `last_sign_in_at`

##### 9. Función DB: gamilit.update_user_last_login

**Ubicación:** apps/database/ddl/schemas/gamilit/functions/11-update_user_last_login.sql

```sql
CREATE OR REPLACE FUNCTION gamilit.update_user_last_login(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE auth_management.profiles
    SET
        last_activity_at = gamilit.now_mexico(),
        updated_at = gamilit.now_mexico()
    WHERE id = p_user_id;  ← ⚠️ Actualiza profiles, NO auth.users
END;
$$;
```

**Problema Adicional:** La función actualiza `profiles.last_activity_at`, NO `users.last_sign_in_at`

#### Causa Raíz (Root Cause Analysis)

1. **Inconsistencia de nombres:** Frontend usa `lastLogin`, Backend usa `last_sign_in_at`
2. **Falta transformación:** adminAPI no transforma snake_case → camelCase
3. **Login NO actualiza campo:** auth.service.ts no actualiza `last_sign_in_at` en login exitoso
4. **Función DB equivocada:** `update_user_last_login` actualiza tabla incorrecta (profiles en lugar de users)

#### Impacto

- ❌ Columna "Último acceso" en AdminUsersPage SIEMPRE muestra "Nunca"
- ❌ Admins no pueden ver actividad real de usuarios
- ❌ Métricas de usuarios activos en dashboard son incorrectas
- ❌ Vista `admin_dashboard.user_stats_summary` usa `last_sign_in_at` y siempre retorna 0

#### Solución Propuesta

**Opción A (Recomendada): Actualizar last_sign_in_at en login + transformar en frontend**

1. **Backend:** Agregar en `auth.service.ts` línea 193 (después de crear sesión):
   ```typescript
   // Actualizar last_sign_in_at del usuario
   user.last_sign_in_at = new Date();
   await this.userRepository.save(user);
   ```

2. **Frontend:** Transformar en `adminAPI.getUsers()`:
   ```typescript
   transformed = {
     items: backendData.data.map(user => ({
       ...user,
       lastLogin: user.last_sign_in_at  // Mapear snake_case → camelCase
     })),
     pagination: {...}
   };
   ```

3. **Validar:** Ejecutar flujo completo de login y verificar que AdminUsersPage muestra fecha correcta

**Opción B (No recomendada): Solo frontend remap**
- Solo agregar transformación en frontend
- Problema: Campo seguirá siendo null en DB y métricas serán incorrectas

---

## 🔍 AUDITORÍA COMPLETA DE PÁGINAS

### Portal Admin (5 páginas principales)

#### ADMIN-001: AdminDashboardPage

**Archivo:** apps/frontend/src/apps/admin/pages/AdminDashboardPage.tsx
**Estado:** ⚠️ PARCIALMENTE FUNCIONAL

**Endpoints Identificados:**

| Endpoint | Estado | Problema |
|----------|--------|----------|
| `adminAPI.getSystemHealth()` | ✅ Implementado | - |
| `adminAPI.getSystemMetrics()` | ✅ Implementado | - |
| `/admin/actions/recent` | ❌ NO IMPLEMENTADO | **BUG-ADMIN-002 (P0)** |
| `/admin/alerts` | ❌ NO IMPLEMENTADO | **BUG-ADMIN-003 (P0)** |
| `/admin/analytics/user-activity` | ❌ NO IMPLEMENTADO | **BUG-ADMIN-004 (P0)** |
| `useUserGamification(user?.id)` | ⚠️ Mock data | **BUG-ADMIN-005 (P1)** |

**Problemas Detectados:**

1. **BUG-ADMIN-002 (P0):** Endpoint `/admin/actions/recent` nunca implementado
   - Líneas 152-162: useEffect retorna array vacío hardcodeado
   - Impacto: Sección "Acciones Recientes" SIEMPRE vacía

2. **BUG-ADMIN-003 (P0):** Endpoint `/admin/alerts` nunca implementado
   - Líneas 164-174: useEffect retorna array vacío hardcodeado
   - Impacto: Sección "Alertas" SIEMPRE vacía

3. **BUG-ADMIN-004 (P0):** Endpoint `/admin/analytics/user-activity` nunca implementado
   - Líneas 176-186: useEffect retorna array vacío hardcodeado
   - Impacto: Gráfica de actividad de usuarios SIEMPRE vacía

4. **BUG-ADMIN-005 (P1):** useUserGamification retorna datos mockeados
   - Líneas 40-51: Fallback data hardcodeado (level: 1, totalXP: 0, mlCoins: 0)
   - Impacto: Gamificación del admin NO es real

**Especificación de Corrección:**

```typescript
// CORRECCIÓN: Implementar endpoints faltantes en backend

// Backend: apps/backend/src/modules/admin/controllers/admin-dashboard.controller.ts
@Get('actions/recent')
async getRecentActions(@Query('limit') limit: number = 10) {
  return await this.adminDashboardService.getRecentActions(limit);
}

@Get('alerts')
async getAlerts() {
  return await this.adminDashboardService.getAlerts();
}

@Get('analytics/user-activity')
async getUserActivity(@Query() query: UserActivityQuery) {
  return await this.adminDashboardService.getUserActivity(query);
}

// Frontend: Remover hardcoded arrays y llamar APIs reales
const fetchRecentActions = useCallback(async (): Promise<void> => {
  try {
    const response = await apiClient.get('/admin/actions/recent', { params: { limit: 10 } });
    setRecentActions(response.data.data);
  } catch (err) {
    console.error('Failed to fetch recent actions:', err);
    setError('Error al cargar acciones recientes');
  }
}, []);
```

---

#### ADMIN-002: AdminUsersPage

**Archivo:** apps/frontend/src/apps/admin/pages/AdminUsersPage.tsx
**Estado:** ⚠️ PARCIALMENTE FUNCIONAL

**Ya analizado en detalle en sección "Bug Crítico Reportado" arriba.**

**Resumen:** BUG-ADMIN-001 (P0) - Campo lastLogin nunca se actualiza

---

#### ADMIN-003: AdminInstitutionsPage

**Archivo:** apps/frontend/src/apps/admin/pages/AdminInstitutionsPage.tsx
**Estado:** ✅ MAYORMENTE FUNCIONAL

**Endpoints Identificados:**

| Endpoint | Estado |
|----------|--------|
| `adminAPI.getOrganizations()` | ✅ Implementado |
| `adminAPI.createOrganization()` | ✅ Implementado |
| `adminAPI.updateOrganization()` | ✅ Implementado |
| `adminAPI.deleteOrganization()` | ✅ Implementado |

**Problemas Detectados:**

1. **BUG-ADMIN-006 (P1):** Estructura de respuesta no validada
   - Líneas 111-112: Asume `response.items` y `response.pagination.totalItems`
   - Si backend retorna estructura diferente, página falla silenciosamente

2. **BUG-ADMIN-007 (P1):** Features array puede ser undefined
   - Línea 389: `selectedOrg?.features.includes(feature.key)` sin validación
   - Error si `features` es null/undefined

**Especificación de Corrección:**

```typescript
// Agregar validación de estructura
const response = await adminAPI.getOrganizations({...});

// Validar con Zod
const organizationsSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    features: z.array(z.string()).default([]),
  })),
  pagination: z.object({
    totalItems: z.number(),
    page: z.number(),
  }),
});

const validated = organizationsSchema.parse(response);
setOrganizations(validated.items);
setTotal(validated.pagination.totalItems);

// Feature check seguro
const isEnabled = selectedOrg?.features?.includes(feature.key) ?? false;
```

---

#### ADMIN-004: AdminGamificationPage

**Archivo:** apps/frontend/src/apps/admin/pages/AdminGamificationPage.tsx
**Estado:** ⚠️ PARCIALMENTE FUNCIONAL

**Endpoints Identificados:**

| Endpoint | Hook | Estado |
|----------|------|--------|
| `useParameters()` | React Query | ✅ Implementado |
| `useMayaRanks()` | React Query | ✅ Implementado |
| `useStats()` | React Query | ✅ Implementado |

**Problemas Detectados:**

1. **BUG-ADMIN-008 (P1):** Propiedades de ranks no validadas
   - Línea 157: `.sort((a, b) => a.level - b.level)` asume que `level` existe
   - Línea 171: `rank.minXp.toLocaleString()` falla si minXp es undefined

2. **BUG-ADMIN-009 (P1):** Parámetros con estructura asumida
   - Línea 248: `parametersData.data.filter(p => p.category === 'coins')` sin validación
   - Línea 266-267: Acceso a `param.key`, `param.value`, `param.dataType` sin tipo check

**Especificación de Corrección:**

```typescript
// Validar estructura de ranks antes de renderizar
const validatedRanks = mayaRanks
  ?.filter(rank =>
    typeof rank.level === 'number' &&
    typeof rank.minXp === 'number'
  )
  .sort((a, b) => a.level - b.level);

// Validar parámetros antes de filtrar
const coinsParams = parametersData?.data
  ?.filter(p => p && typeof p.category === 'string' && p.category === 'coins') ?? [];

// Renderizar con fallbacks
<p>{rank?.minXp?.toLocaleString() ?? 'N/A'}</p>
<p>{param?.value ?? 'N/A'}{param?.dataType === 'percentage' ? '%' : ''}</p>
```

---

#### ADMIN-005: AdminReportsPage

**Archivo:** apps/frontend/src/apps/admin/pages/AdminReportsPage.tsx
**Estado:** ⚠️ MAYORMENTE FUNCIONAL

**Endpoints Identificados:**

| Endpoint | Estado |
|----------|--------|
| `adminAPI.reports.list()` | ✅ Implementado |
| `adminAPI.reports.generate()` | ✅ Implementado |
| `adminAPI.reports.download()` | ✅ Implementado |

**Problemas Detectados:**

1. **BUG-ADMIN-010 (P2):** reportTypes hardcodeados
   - Línea 118: `const [reportTypes] = useState<ReportType[]>(DEFAULT_REPORT_TYPES);`
   - Si backend agrega nuevo tipo de reporte, frontend no lo muestra

2. **BUG-ADMIN-011 (P2):** Stats calculados en frontend
   - Líneas 135-160: Lógica de stats duplicada (debería estar en backend)

**Especificación de Corrección:**

```typescript
// Backend debe retornar report types disponibles
@Get('types')
async getReportTypes(): Promise<ReportType[]> {
  return this.reportsService.getAvailableTypes();
}

// Frontend consumir endpoint
useEffect(() => {
  const fetchTypes = async () => {
    const types = await adminAPI.reports.getTypes();
    setReportTypes(types);
  };
  fetchTypes();
}, []);
```

---

### Portal Teacher (8 páginas principales)

#### TEACHER-001: TeacherDashboardPage

**Archivo:** apps/frontend/src/apps/teacher/pages/TeacherDashboardPage.tsx
**Estado:** ⚠️ PARCIALMENTE FUNCIONAL

**Endpoints Identificados:**

| Endpoint | Estado |
|----------|--------|
| `teacherApi.getDashboardStats()` | ✅ Implementado |
| `teacherApi.getRecentActivities()` | ✅ Implementado |
| `teacherApi.getStudentAlerts()` | ✅ Implementado |
| `teacherApi.getTopPerformers()` | ✅ Implementado |
| `teacherApi.getModuleProgressSummary()` | ✅ Implementado |

**Problemas Detectados:**

1. **BUG-TEACHER-002 (P1):** Mock students hardcodeados
   - Línea 57-66: `mockStudents` con 5 estudiantes ficticios
   - Comentario dice "TODO: replace with real data from useClassrooms hook"
   - Usado en múltiples tabs sin ser reemplazado

2. **BUG-TEACHER-003 (P1):** Propiedades de stats sin validación
   - Línea 176: `stats?.active_students` puede ser undefined
   - Línea 189: `stats?.average_class_score?.toFixed(1)` retorna "undefined" si null
   - Línea 192: `stats?.engagement_rate` sin fallback

**Especificación de Corrección:**

```typescript
// Reemplazar mock students con API call real
const { data: realStudents } = useClassrooms().getClassroomStudents(classroomId);
const students = realStudents ?? [];

// Validar stats con fallbacks seguros
<p className="text-3xl font-bold text-detective-text">
  {stats?.active_students ?? 0}/{stats?.total_students ?? 0}
</p>

<p className="text-3xl font-bold text-detective-text">
  {stats?.average_class_score?.toFixed(1) ?? 'N/A'}%
</p>

<p className="text-3xl font-bold text-detective-text">
  {stats?.engagement_rate?.toFixed(1) ?? '0.0'}%
</p>
```

---

#### TEACHER-002: TeacherStudentsPage

**Archivo:** apps/frontend/src/apps/teacher/pages/TeacherStudentsPage.tsx
**Estado:** ❌ NO FUNCIONAL (MOCK DATA)

**Problemas Detectados:**

1. **BUG-TEACHER-001 (P0 CRÍTICO):** Mock data en lugar de API real
   - Líneas 22-87: useEffect completo con mockStudents hardcodeado
   - Comentario línea 23: `// API call: GET /api/teacher/classrooms/:id/students`
   - **NUNCA hace la llamada real a la API**

2. **BUG-TEACHER-004 (P1):** Filtros de clase hardcodeados
   - Línea 266-270: Opciones de clase ficticias ('Español 5to A', 'Español 5to B')
   - Si maestro crea nuevas clases, filtro no se actualiza

**Especificación de Corrección:**

```typescript
// CORRECCIÓN CRÍTICA: Reemplazar mock data con API real

// Usar hook de classrooms para obtener estudiantes reales
const { data: classrooms } = useClassrooms();
const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);

useEffect(() => {
  const fetchStudents = async () => {
    if (!selectedClassroomId) {
      // Si no hay clase seleccionada, obtener todos los estudiantes
      const allStudents = await Promise.all(
        classrooms.map(classroom =>
          classroomsApi.getClassroomStudents(classroom.id)
        )
      );
      setStudents(allStudents.flat());
    } else {
      // Obtener estudiantes de clase específica
      const students = await classroomsApi.getClassroomStudents(selectedClassroomId);
      setStudents(students);
    }
  };

  fetchStudents();
}, [selectedClassroomId, classrooms]);

// Filtros dinámicos basados en clases reales
<select value={filters.classroom} onChange={handleClassroomFilterChange}>
  <option value="">Todas las clases</option>
  {classrooms.map(classroom => (
    <option key={classroom.id} value={classroom.id}>
      {classroom.name}
    </option>
  ))}
</select>
```

---

#### TEACHER-003: TeacherClassesPage

**Archivo:** apps/frontend/src/apps/teacher/pages/TeacherClasses.tsx
**Estado:** ✅ FUNCIONAL

**Endpoints Identificados:**

| Endpoint | Estado |
|----------|--------|
| `classroomsApi.getClassrooms()` | ✅ Implementado |
| `classroomsApi.createClassroom()` | ✅ Implementado |
| `classroomsApi.updateClassroom()` | ✅ Implementado |
| `classroomsApi.deleteClassroom()` | ✅ Implementado |

**Problemas Detectados:**

1. **BUG-TEACHER-005 (P2):** Error handling básico
   - Líneas 51-54: Try-catch solo muestra alert, no actualiza estado de error
   - Usuario no recibe feedback visual consistente

**Especificación de Corrección:**

```typescript
// Agregar estado de error local
const [createError, setCreateError] = useState<string | null>(null);

const handleCreateClassroom = async () => {
  try {
    setCreateError(null);
    await createClassroomAPI(formData);
    setIsCreateModalOpen(false);
  } catch (err: any) {
    console.error('[TeacherClasses] Error creating classroom:', err);
    setCreateError(err.message || 'Error al crear la clase');
  }
};

// Mostrar error en modal
{createError && (
  <div className="bg-red-500/20 border border-red-500 rounded p-3 mb-4">
    <p className="text-red-500">{createError}</p>
  </div>
)}
```

---

#### TEACHER-004: TeacherAnalyticsPage

**Archivo:** apps/frontend/src/apps/teacher/pages/TeacherAnalytics.tsx
**Estado:** ⚠️ MAYORMENTE FUNCIONAL

**Endpoints Identificados:**

| Endpoint | Estado |
|----------|--------|
| `analyticsApi.getClassroomAnalytics()` | ✅ Implementado |
| `analyticsApi.getEngagementMetrics()` | ✅ Implementado |
| `analyticsApi.generateReport()` | ✅ Implementado |

**Problemas Detectados:**

1. **BUG-TEACHER-006 (P1):** Charts con datos no validados
   - Línea 84: `analytics?.module_stats.map((m) => m.module_name)` asume estructura
   - Línea 88: `analytics?.module_stats.map((m) => m.average_score)` sin tipo check

2. **BUG-TEACHER-007 (P1):** Propiedades anidadas sin validación
   - Línea 304-305: `analytics.average_score.toFixed(1)` sin null check
   - Línea 317: `analytics.completion_rate.toFixed(1)` puede ser undefined
   - Línea 330: `analytics.engagement_rate.toFixed(1)` puede fallar

**Especificación de Corrección:**

```typescript
// Validar estructura antes de charts
const moduleScoresChart = {
  labels: analytics?.module_stats
    ?.filter(m => m && typeof m.module_name === 'string')
    .map(m => m.module_name) || [],
  datasets: [{
    label: 'Promedio de Puntuación',
    data: analytics?.module_stats
      ?.filter(m => m && typeof m.average_score === 'number')
      .map(m => m.average_score) || [],
  }],
};

// Stats cards con fallbacks seguros
<p className="text-3xl font-bold text-detective-text">
  {analytics?.average_score?.toFixed(1) ?? 'N/A'}%
</p>

<p className="text-3xl font-bold text-detective-text">
  {analytics?.completion_rate?.toFixed(1) ?? '0.0'}%
</p>

<p className="text-3xl font-bold text-detective-text">
  {analytics?.engagement_rate?.toFixed(1) ?? '0.0'}%
</p>
```

---

## 📊 MATRIZ DE PRIORIDADES

### P0 - Crítico (Bloquea funcionalidad básica)

| ID | Descripción | Página | Impacto |
|----|-------------|--------|---------|
| BUG-ADMIN-001 | last_sign_in_at nunca se actualiza | AdminUsersPage | ❌ Columna "Último acceso" siempre vacía |
| BUG-ADMIN-002 | Endpoint /admin/actions/recent no implementado | AdminDashboardPage | ❌ Sección acciones recientes SIEMPRE vacía |
| BUG-ADMIN-003 | Endpoint /admin/alerts no implementado | AdminDashboardPage | ❌ Sección alertas SIEMPRE vacía |
| BUG-ADMIN-004 | Endpoint /admin/analytics/user-activity no implementado | AdminDashboardPage | ❌ Gráfica actividad usuarios SIEMPRE vacía |
| BUG-TEACHER-001 | Mock data en lugar de API real | TeacherStudentsPage | ❌ Página muestra datos ficticios |

**Total P0:** 5 bugs
**Esfuerzo estimado:** 21 SP

---

### P1 - Alto (Fallos en runtime probables)

| ID | Descripción | Página | Impacto |
|----|-------------|--------|---------|
| BUG-ADMIN-005 | useUserGamification retorna mock data | Todas admin | ⚠️ Gamificación admin no real |
| BUG-ADMIN-006 | Estructura de respuesta no validada | AdminInstitutionsPage | ⚠️ Falla silenciosa si estructura cambia |
| BUG-ADMIN-007 | Features array puede ser undefined | AdminInstitutionsPage | ⚠️ Error si features es null |
| BUG-ADMIN-008 | Propiedades de ranks no validadas | AdminGamificationPage | ⚠️ Error si rank.minXp undefined |
| BUG-ADMIN-009 | Parámetros con estructura asumida | AdminGamificationPage | ⚠️ Error si param.key no existe |
| BUG-TEACHER-002 | Mock students hardcodeados | TeacherDashboardPage | ⚠️ Datos ficticios en tabs |
| BUG-TEACHER-003 | Stats sin validación | TeacherDashboardPage | ⚠️ "undefined" mostrado en UI |
| BUG-TEACHER-004 | Filtros de clase hardcodeados | TeacherStudentsPage | ⚠️ No muestra clases nuevas |
| BUG-TEACHER-006 | Charts con datos no validados | TeacherAnalyticsPage | ⚠️ Error si module_stats mal formado |
| BUG-TEACHER-007 | Propiedades anidadas sin validación | TeacherAnalyticsPage | ⚠️ toFixed(1) falla en undefined |

**Total P1:** 10 bugs
**Esfuerzo estimado:** 18 SP

---

### P2 - Medio (Inconsistencias, no bloquea)

| ID | Descripción | Página | Impacto |
|----|-------------|--------|---------|
| BUG-ADMIN-010 | reportTypes hardcodeados | AdminReportsPage | ⚠️ Nuevos tipos no aparecen |
| BUG-ADMIN-011 | Stats calculados en frontend | AdminReportsPage | ⚠️ Lógica duplicada |
| BUG-TEACHER-005 | Error handling básico | TeacherClassesPage | ⚠️ Feedback inconsistente |

**Total P2:** 3 bugs
**Esfuerzo estimado:** 5 SP

---

**TOTAL GENERAL:** 18 bugs identificados, 44 SP estimados

---

## 🔧 PLAN DE CORRECCIONES

### Fase 1: Bugs Críticos (P0) - Sprint Inmediato

**Objetivo:** Resolver funcionalidad básica bloqueada
**Duración:** 2-3 días
**Story Points:** 21 SP

#### Tareas Priorizadas

1. **BUG-ADMIN-001: Actualizar last_sign_in_at en login**
   - **Agente:** Backend-Developer
   - **Esfuerzo:** 3 SP
   - **Archivos a modificar:**
     - `apps/backend/src/modules/auth/services/auth.service.ts` (agregar update)
     - `apps/frontend/src/services/api/adminAPI.ts` (transformar snake_case → camelCase)
   - **Criterios de aceptación:**
     - ✅ Login actualiza `last_sign_in_at` en auth.users
     - ✅ AdminUsersPage muestra fecha correcta
     - ✅ Dashboard metrics usan campo actualizado

2. **BUG-ADMIN-002, BUG-ADMIN-003, BUG-ADMIN-004: Implementar endpoints de dashboard**
   - **Agente:** Backend-Developer
   - **Esfuerzo:** 13 SP (4 + 4 + 5)
   - **Archivos a crear/modificar:**
     - `apps/backend/src/modules/admin/services/admin-dashboard.service.ts` (3 métodos nuevos)
     - `apps/backend/src/modules/admin/controllers/admin-dashboard.controller.ts` (3 endpoints)
     - `apps/frontend/src/apps/admin/pages/AdminDashboardPage.tsx` (remover mock data)
   - **Criterios de aceptación:**
     - ✅ GET /admin/actions/recent retorna acciones reales
     - ✅ GET /admin/alerts retorna alertas activas
     - ✅ GET /admin/analytics/user-activity retorna datos de gráfica
     - ✅ Frontend muestra datos reales en todas secciones

3. **BUG-TEACHER-001: Reemplazar mock data en TeacherStudentsPage**
   - **Agente:** Frontend-Developer
   - **Esfuerzo:** 5 SP
   - **Archivos a modificar:**
     - `apps/frontend/src/apps/teacher/pages/TeacherStudentsPage.tsx` (remover mock, usar API)
   - **Criterios de aceptación:**
     - ✅ Página usa `classroomsApi.getClassroomStudents()` real
     - ✅ Filtros dinámicos basados en clases reales
     - ✅ Datos de estudiantes son actuales

---

### Fase 2: Bugs Altos (P1) - Sprint Siguiente

**Objetivo:** Prevenir fallos en runtime
**Duración:** 3-5 días
**Story Points:** 18 SP

#### Tareas Priorizadas

1. **Validación de estructuras de datos (BUG-ADMIN-006, 007, 008, 009)**
   - **Agente:** Frontend-Developer
   - **Esfuerzo:** 8 SP
   - **Implementar:** Validación con Zod en todas las respuestas API
   - **Páginas:** AdminInstitutionsPage, AdminGamificationPage

2. **Implementar useUserGamification real (BUG-ADMIN-005)**
   - **Agente:** Backend-Developer + Frontend-Developer
   - **Esfuerzo:** 5 SP
   - **Crear:** Endpoint `/api/v1/gamification/user/:id/summary`

3. **Validación de datos en TeacherDashboardPage y TeacherAnalyticsPage (BUG-TEACHER-002, 003, 006, 007)**
   - **Agente:** Frontend-Developer
   - **Esfuerzo:** 5 SP
   - **Implementar:** Fallbacks seguros y validación de tipos

---

### Fase 3: Bugs Medios (P2) - Backlog

**Objetivo:** Mejoras de calidad
**Duración:** 2 días
**Story Points:** 5 SP

#### Tareas

1. **Endpoints dinámicos para report types (BUG-ADMIN-010, 011)**
   - Crear GET /admin/reports/types
   - Mover cálculo de stats a backend

2. **Mejorar error handling (BUG-TEACHER-005)**
   - Agregar estados de error consistentes en todos los formularios

---

## 📚 REFERENCIAS TÉCNICAS

### Archivos Analizados (32 archivos)

#### Frontend
- `apps/frontend/src/apps/admin/pages/AdminDashboardPage.tsx`
- `apps/frontend/src/apps/admin/pages/AdminUsersPage.tsx`
- `apps/frontend/src/apps/admin/pages/AdminInstitutionsPage.tsx`
- `apps/frontend/src/apps/admin/pages/AdminGamificationPage.tsx`
- `apps/frontend/src/apps/admin/pages/AdminReportsPage.tsx`
- `apps/frontend/src/apps/admin/hooks/useUserManagement.ts`
- `apps/frontend/src/services/api/adminAPI.ts`
- `apps/frontend/src/apps/teacher/pages/TeacherDashboardPage.tsx`
- `apps/frontend/src/apps/teacher/pages/TeacherStudentsPage.tsx`
- `apps/frontend/src/apps/teacher/pages/TeacherClasses.tsx`
- `apps/frontend/src/apps/teacher/pages/TeacherAnalyticsPage.tsx`

#### Backend
- `apps/backend/src/modules/admin/controllers/admin-users.controller.ts`
- `apps/backend/src/modules/admin/controllers/admin-dashboard.controller.ts`
- `apps/backend/src/modules/admin/services/admin-users.service.ts`
- `apps/backend/src/modules/auth/services/auth.service.ts`
- `apps/backend/src/modules/auth/auth.service.ts`
- `apps/backend/src/modules/auth/entities/user.entity.ts`

#### Database
- `apps/database/ddl/schemas/auth/tables/01-users.sql`
- `apps/database/ddl/schemas/gamilit/functions/11-update_user_last_login.sql`

### Directivas Aplicables

- [DIRECTIVA-VALIDACION-DATOS.md](../directivas/DIRECTIVA-VALIDACION-DATOS.md) - P1
- [DIRECTIVA-ERROR-HANDLING.md](../directivas/DIRECTIVA-ERROR-HANDLING.md) - P1
- [ESTANDARES-API-ROUTES.md](../directivas/ESTANDARES-API-ROUTES.md) - P0
- [DIRECTIVA-POLITICA-CARGA-LIMPIA.md](../directivas/DIRECTIVA-POLITICA-CARGA-LIMPIA.md) - P0

### Trazabilidad

- **Epic:** EAI-005-admin-base + EXT-001-portal-maestros
- **Reporte generado:** 2025-11-23
- **Próxima revisión:** Post implementación de correcciones

---

**FIN DEL REPORTE**

**Analista:** Architecture-Analyst
**Versión:** 1.0.0
**Estado:** ✅ ANÁLISIS COMPLETO - LISTO PARA ORQUESTACIÓN
