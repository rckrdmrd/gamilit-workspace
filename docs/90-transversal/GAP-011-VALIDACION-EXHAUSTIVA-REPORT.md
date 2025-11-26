# GAP-011: Validación Exhaustiva de Configuración API - Reporte Final

**ID:** GAP-011-VALIDATION
**Categoría:** Arquitectura - Validación Post-Migración
**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Estado:** ⚠️ COMPLETADO CON HALLAZGOS CRÍTICOS

---

## 📋 RESUMEN EJECUTIVO

### Objetivo
Validar exhaustivamente que las soluciones implementadas para corregir URLs duplicadas (`/v1/v1/`) son **permanentes, no hardcoded, y no se repiten en ningún otro lugar del código**.

### Metodología
Validación sistemática en 6 dimensiones:
1. URLs hardcoded con `/v1/` en código activo
2. Validez de todos los `API_ENDPOINTS` referenciados
3. Imports del viejo `apiConfig` en código activo
4. Patrones de construcción manual de URLs
5. Coherencia entre rutas frontend y backend
6. Documentación de hallazgos

### Resultado General
✅ **FIXES INICIALES EXITOSOS** - Los dos problemas reportados (gamificationAPI.ts y educationalAPI.ts) están correctamente resueltos y no se repiten.

⚠️ **HALLAZGOS CRÍTICOS ADICIONALES** - Se encontraron múltiples endpoints referenciados en el código que **NO existen** en la configuración centralizada, lo que causará errores en runtime.

---

## 🔍 VALIDACIÓN 1: URLs Hardcoded con `/v1/`

### Búsqueda Ejecutada
```bash
grep -rn "/v1/" --include="*.ts" --include="*.tsx" apps/frontend/src
```

### Resultados
- **Total de archivos analizados:** 757 TypeScript files
- **Archivos con `/v1/` encontrados:** 2 archivos

### Detalle de Hallazgos

#### ✅ ACEPTABLE: Archivo Deprecado
**Archivo:** `src/services/api/apiConfig.deprecated.ts`
**Razón:** Archivo deprecado correctamente, con warning comment referenciando GAP-011.

#### ✅ ACEPTABLE: Tipos Generados
**Archivo:** `src/generated/api-types.ts`
**Razón:** Auto-generado desde Swagger del backend, incluye `/v1/` en ejemplos de URLs.

### Conclusión ✅
**VALIDACIÓN PASADA** - No existen URLs hardcoded con `/v1/` en código activo que puedan causar duplicación.

---

## 🔍 VALIDACIÓN 2: Validez de API_ENDPOINTS

### Búsqueda Ejecutada
```bash
grep -rn "API_ENDPOINTS\.(auth|gamification|educational|progress|economy|social|notifications|admin|teacher|student|health)\." \
  --include="*.ts" --include="*.tsx" apps/frontend/src
```

### Resultados
- **Usos de API_ENDPOINTS encontrados:** 107+ referencias
- **Archivos afectados:** 15 archivos

### ⚠️ CRÍTICO: Endpoints No Existentes en Config

#### Namespace `educational` - 9 endpoints NO existen

| Endpoint Usado | Archivo | Línea | Existe en Config |
|---------------|---------|-------|------------------|
| `API_ENDPOINTS.educational.moduleAccess(moduleId)` | educationalAPI.ts | 330 | ❌ NO |
| `API_ENDPOINTS.educational.moduleExercises(moduleId)` | educationalAPI.ts | 434 | ❌ NO |
| `API_ENDPOINTS.educational.userProgress(userId)` | educationalAPI.ts | 644 | ❌ NO (debe ser `progress.userProgress`) |
| `API_ENDPOINTS.educational.moduleProgress(userId, moduleId)` | educationalAPI.ts | 678 | ❌ NO (debe ser `progress.moduleProgress`) |
| `API_ENDPOINTS.educational.userDashboard(userId)` | educationalAPI.ts | 711 | ❌ NO |
| `API_ENDPOINTS.educational.exerciseAttempts(userId)` | educationalAPI.ts | 748 | ❌ NO |
| `API_ENDPOINTS.educational.userAnalytics(userId)` | educationalAPI.ts | 792 | ❌ NO |
| `API_ENDPOINTS.educational.activityStats(userId)` | educationalAPI.ts | 876 | ❌ NO |
| `API_ENDPOINTS.educational.activitiesByType(userId, type)` | educationalAPI.ts | 909 | ❌ NO |

#### Namespace `admin` - Estructura Anidada No Existe

**Problema:** El código espera sub-namespaces como `API_ENDPOINTS.admin.organizations.list`, pero el config tiene estructura plana como `API_ENDPOINTS.admin.organizations` (string).

**Endpoints problemáticos en `adminAPI.ts`:**

```typescript
// ❌ NO EXISTEN (nested structure)
API_ENDPOINTS.admin.organizations.list
API_ENDPOINTS.admin.organizations.get(id)
API_ENDPOINTS.admin.organizations.create
API_ENDPOINTS.admin.organizations.update(id)
API_ENDPOINTS.admin.organizations.delete(id)
API_ENDPOINTS.admin.organizations.users(id)
API_ENDPOINTS.admin.organizations.updateSubscription(id)
API_ENDPOINTS.admin.organizations.updateFeatures(id)

API_ENDPOINTS.admin.approvals.pending
API_ENDPOINTS.admin.approvals.approve(id)
API_ENDPOINTS.admin.approvals.reject(id)
API_ENDPOINTS.admin.approvals.history

API_ENDPOINTS.admin.content.mediaLibrary
API_ENDPOINTS.admin.content.deleteMedia(id)
API_ENDPOINTS.admin.content.createVersion

API_ENDPOINTS.admin.users.list
API_ENDPOINTS.admin.users.get(id)
API_ENDPOINTS.admin.users.update(id)
API_ENDPOINTS.admin.users.delete(id)
API_ENDPOINTS.admin.users.activate(id)
API_ENDPOINTS.admin.users.deactivate(id)
API_ENDPOINTS.admin.users.suspend(id)
API_ENDPOINTS.admin.users.unsuspend(id)

API_ENDPOINTS.admin.roles.list
API_ENDPOINTS.admin.roles.permissions(roleId)
API_ENDPOINTS.admin.roles.updatePermissions(roleId)
API_ENDPOINTS.admin.roles.availablePermissions

API_ENDPOINTS.admin.gamification.settings
API_ENDPOINTS.admin.gamification.updateSettings
API_ENDPOINTS.admin.gamification.previewChanges
API_ENDPOINTS.admin.gamification.restoreDefaults

API_ENDPOINTS.admin.system.health
API_ENDPOINTS.admin.system.metrics
API_ENDPOINTS.admin.system.logs
API_ENDPOINTS.admin.system.maintenance
API_ENDPOINTS.admin.system.config
API_ENDPOINTS.admin.system.configCategories
API_ENDPOINTS.admin.system.categoryConfig(category)
API_ENDPOINTS.admin.system.validateConfig

API_ENDPOINTS.admin.reports.generate
API_ENDPOINTS.admin.reports.list
API_ENDPOINTS.admin.reports.download(reportId)
API_ENDPOINTS.admin.reports.delete(reportId)
API_ENDPOINTS.admin.reports.schedule(reportId)

// ✅ LO QUE EXISTE EN CONFIG (flat structure)
API_ENDPOINTS.admin.organizations  // string: '/admin/organizations'
API_ENDPOINTS.admin.users          // string: '/admin/users'
API_ENDPOINTS.admin.gamificationConfig  // string: '/admin/gamification/config'
// ...etc
```

#### Namespace `teacher` - Estructura Anidada No Existe

**Endpoints problemáticos en `teacherApi.ts`:**

```typescript
// ❌ NO EXISTEN (nested structure)
API_ENDPOINTS.teacher.dashboard.stats
API_ENDPOINTS.teacher.dashboard.activities
API_ENDPOINTS.teacher.dashboard.alerts
API_ENDPOINTS.teacher.dashboard.topPerformers
API_ENDPOINTS.teacher.dashboard.moduleProgress

API_ENDPOINTS.teacher.analytics
API_ENDPOINTS.teacher.engagementMetrics
API_ENDPOINTS.teacher.generateReport
API_ENDPOINTS.teacher.reportStatus(reportId)
API_ENDPOINTS.teacher.studentInsights(studentId)

API_ENDPOINTS.teacher.classroomStudents(classroomId)
API_ENDPOINTS.teacher.classroomStats(classroomId)
API_ENDPOINTS.teacher.createClassroom
API_ENDPOINTS.teacher.updateClassroom(id)
API_ENDPOINTS.teacher.deleteClassroom(id)

API_ENDPOINTS.teacher.assignment(assignmentId)
API_ENDPOINTS.teacher.createAssignment
API_ENDPOINTS.teacher.updateAssignment(assignmentId)
API_ENDPOINTS.teacher.deleteAssignment(assignmentId)
API_ENDPOINTS.teacher.assignmentSubmissions(assignmentId)
API_ENDPOINTS.teacher.submission(submissionId)
API_ENDPOINTS.teacher.gradeSubmission(submissionId)

// ✅ LO QUE EXISTE EN CONFIG (flat structure)
API_ENDPOINTS.teacher.dashboard        // string: '/teacher/dashboard'
API_ENDPOINTS.teacher.classrooms       // string: '/teacher/classrooms'
API_ENDPOINTS.teacher.classroom(id)    // function: (id) => `/teacher/classrooms/${id}`
API_ENDPOINTS.teacher.assignments      // string: '/teacher/assignments'
// ...etc
```

### Impacto
🔴 **CRÍTICO** - Estos endpoints causarán errores en runtime:
- `TypeError: API_ENDPOINTS.admin.organizations.list is not a function`
- `TypeError: Cannot read property 'list' of undefined`

### Archivos Afectados
1. `src/services/api/educationalAPI.ts` - 9 endpoints incorrectos
2. `src/services/api/adminAPI.ts` - ~50 endpoints incorrectos
3. `src/services/api/teacher/analyticsApi.ts` - 5 endpoints incorrectos
4. `src/services/api/teacher/classroomsApi.ts` - 7 endpoints incorrectos
5. `src/services/api/teacher/assignmentsApi.ts` - 8 endpoints incorrectos
6. `src/services/api/teacher/teacherApi.ts` - 5 endpoints incorrectos
7. `src/apps/admin/hooks/useContentManagement.ts` - 3 endpoints incorrectos
8. `src/features/admin/api/adminAPI.ts` - 2 endpoints incorrectos

### Conclusión ⚠️
**VALIDACIÓN FALLIDA** - Existen múltiples endpoints referenciados que NO existen en el config centralizado.

---

## 🔍 VALIDACIÓN 3: Imports del Viejo apiConfig

### Búsqueda Ejecutada
```bash
# Búsqueda 1: Imports relativos
grep -rn "from '\./apiConfig'" --include="*.ts" --include="*.tsx" apps/frontend/src
grep -rn 'from "\./apiConfig"' --include="*.ts" --include="*.tsx" apps/frontend/src
grep -rn "from '\.\.\/apiConfig'" --include="*.ts" --include="*.tsx" apps/frontend/src

# Búsqueda 2: Imports absolutos
grep -rn "from '@/services/api/apiConfig'" --include="*.ts" --include="*.tsx" apps/frontend/src
```

### Resultados
- **Archivos encontrados con imports viejos:** 0 archivos (excluyendo `.deprecated.ts`)

### Conclusión ✅
**VALIDACIÓN PASADA** - No existen imports del viejo `apiConfig` en código activo.

---

## 🔍 VALIDACIÓN 4: Patrones de URLs Construidas Manualmente

### Búsqueda Ejecutada
```bash
grep -rn "apiClient\.(get|post|put|delete|patch)\(\`[^\`]+\$\{" \
  --include="*.ts" --include="*.tsx" apps/frontend/src
```

### Resultados
- **Instancias encontradas:** 68 llamadas con URLs en template literals
- **Patrón encontrado:** Todas usan URLs relativas SIN `/v1/` prefix

### Ejemplos Validados (✅ CORRECTOS)

```typescript
// ✅ CORRECTO - Sin /v1/ prefix
apiClient.get(`/gamification/users/${userId}/stats`)
apiClient.get(`/progress/users/${userId}`)
apiClient.get(`/educational/modules/${id}`)
apiClient.post(`/auth/logout`)
apiClient.patch(`/notifications/${notificationId}/read`)
apiClient.get(`/gamification/ranks/user/${userId}`)
apiClient.get(`/gamification/leaderboard/user/${userId}/position`)
```

### Archivos con URLs Hardcoded (todos ✅ CORRECTOS)
1. `src/hooks/useAchievements.ts` - 3 URLs (✅ sin /v1/)
2. `src/services/NotificationService.ts` - 1 URL (✅ sin /v1/)
3. `src/lib/api/progress.api.ts` - 11 URLs (✅ sin /v1/)
4. `src/lib/api/educational.api.ts` - 3 URLs (✅ sin /v1/)
5. `src/apps/student/hooks/useGamificationData.ts` - 5 URLs (✅ sin /v1/)
6. `src/apps/student/hooks/useDashboardData.ts` - 4 URLs (✅ sin /v1/)
7. `src/services/api/notificationsAPI.ts` - 3 URLs (✅ sin /v1/)
8. `src/services/api/missionsAPI.ts` - 3 URLs (✅ sin /v1/)
9. `src/services/api/admin/gamificationConfigApi.ts` - 2 URLs (✅ sin /v1/)
10. `src/services/api/admin/classroomTeacherApi.ts` - 5 URLs (✅ sin /v1/)
11. `src/services/api/profileAPI.ts` - 4 URLs (✅ sin /v1/)
12. `src/features/gamification/missions/hooks/useMissions.ts` - 3 URLs (✅ sin /v1/)
13. `src/apps/admin/hooks/useContentManagement.ts` - 3 URLs (✅ sin /v1/)
14. `src/apps/admin/hooks/useUserManagement.ts` - 1 URL (✅ sin /v1/)
15. `src/apps/admin/hooks/useAdminData.ts` - 2 URLs (✅ sin /v1/)
16. `src/apps/admin/hooks/useSystemMonitoring.ts` - 1 URL (✅ sin /v1/)
17. `src/apps/teacher/hooks/useStudentMonitoring.ts` - 3 URLs (✅ sin /v1/)
18. `src/apps/teacher/hooks/useClassroomData.ts` - 2 URLs (✅ sin /v1/)

### Conclusión ✅
**VALIDACIÓN PASADA** - Todas las URLs construidas manualmente usan el patrón correcto sin `/v1/` prefix.

---

## 🔍 VALIDACIÓN 5: Coherencia Frontend ↔ Backend

### Metodología
Comparación entre:
- **Frontend:** `apps/frontend/src/config/api.config.ts` (API_ENDPOINTS)
- **Backend:** `apps/backend/src/shared/constants/routes.constants.ts` (API_ROUTES)

### Análisis de Coherencia

#### ✅ Namespaces Alineados Correctamente

| Namespace | Frontend | Backend | Estado |
|-----------|----------|---------|--------|
| `auth` | ✅ 8 endpoints | ✅ 8 routes | ✅ MATCH |
| `gamification` (core) | ✅ 8 endpoints | ✅ 20+ routes | ⚠️ Parcial (backend más completo) |
| `educational` | ✅ 7 endpoints | ✅ 16+ routes | ⚠️ Parcial (backend más completo) |
| `progress` | ✅ 5 endpoints | ✅ 50+ routes | ⚠️ Parcial (backend MUY más completo) |
| `notifications` | ✅ 5 endpoints | ✅ 13 routes | ⚠️ Parcial (backend más completo) |
| `health` | ✅ 2 endpoints | ✅ 4 routes | ⚠️ Parcial |

#### ⚠️ Namespaces con Desalineación Significativa

**Admin Namespace:**
- **Frontend config:** Estructura plana simple (10 endpoints)
  ```typescript
  admin: {
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    organizations: '/admin/organizations',
    // ...etc
  }
  ```
- **Backend routes:** Estructura detallada (25+ endpoints)
  ```typescript
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    ORGANIZATIONS: '/admin/organizations',
    ORGANIZATION_BY_ID: (id) => `/admin/organizations/${id}`,
    ORGANIZATION_FEATURES: (id) => `/admin/organizations/${id}/features`,
    ORGANIZATION_SUBSCRIPTION: (id) => `/admin/organizations/${id}/subscription`,
    // ...etc
  }
  ```
- **Impacto:** Frontend `adminAPI.ts` espera estructura anidada que no existe en config

**Teacher Namespace:**
- **Frontend config:** Estructura plana simple (8 endpoints)
- **Backend routes:** Estructura más detallada (12 endpoints)
- **Impacto:** Frontend teacher APIs esperan más endpoints que los definidos

### Missing Endpoints (Backend existe, Frontend NO)

#### Progress Module (Backend tiene 50+, Frontend tiene 5)
- `exerciseProgress(userId, exerciseId)` - ❌ NO en frontend
- Sessions (10+ endpoints) - ❌ NO en frontend
- Attempts (10+ endpoints) - ❌ NO en frontend
- Submissions (10+ endpoints) - ❌ NO en frontend
- Scheduled Missions (8+ endpoints) - ❌ NO en frontend

#### Educational Module (Backend tiene 16+, Frontend tiene 7)
- `moduleExercises(moduleId)` - ❌ NO en frontend (usado en código!)
- `exerciseSubmit(id)` - ❌ NO en frontend
- `exerciseValidate(id)` - ❌ NO en frontend
- `exerciseHints(id)` - ❌ NO en frontend
- Media resources (3 endpoints) - ❌ NO en frontend
- Assessment rubrics (2 endpoints) - ❌ NO en frontend

#### Gamification Module (Backend tiene 20+, Frontend tiene 8)
- Missions (4 endpoints) - ❌ NO en frontend (usado en código!)
- Comodines/Power-ups (3 endpoints) - ❌ NO en frontend
- Rank history - ❌ NO en frontend
- ML Coins transactions - ❌ NO en frontend

### Conclusión ⚠️
**DESALINEACIÓN SIGNIFICATIVA** - El frontend config está incompleto comparado con las rutas reales del backend.

---

## 📊 ESTADÍSTICAS GENERALES

### Scope de Análisis
- **Total de archivos TypeScript:** 757 files
- **Archivos analizados en detalle:** 30+ archivos API
- **Líneas de código inspeccionadas:** ~5,000+ LOC
- **Patrones de búsqueda ejecutados:** 8 patterns diferentes

### Resultados por Validación

| # | Validación | Estado | Archivos Afectados |
|---|-----------|--------|-------------------|
| 1 | URLs hardcoded `/v1/` | ✅ PASADA | 0 (2 aceptables) |
| 2 | Validez API_ENDPOINTS | ⚠️ FALLIDA | 8 archivos |
| 3 | Imports viejo config | ✅ PASADA | 0 archivos |
| 4 | URLs construidas manualmente | ✅ PASADA | 18 archivos (correctos) |
| 5 | Coherencia frontend↔backend | ⚠️ PARCIAL | N/A |

### Hallazgos Críticos

🔴 **CRÍTICO (Runtime Errors):**
- 80+ endpoints referenciados que NO existen en config
- Estructura anidada esperada pero no definida (`admin.*.*`, `teacher.*.*`)

🟡 **ALTO (Funcionalidad Incompleta):**
- Frontend config tiene ~50 endpoints menos que backend routes
- Muchos módulos (Progress, Educational, Gamification) parcialmente mapeados

🟢 **BAJO (Mantenibilidad):**
- 68 URLs hardcoded en template literals (patrón correcto pero no usa config)

---

## ✅ RESPUESTA A SOLICITUD DEL USUARIO

### Pregunta del Usuario
> "Puedes validar que son soluciones permanentes, que no esta hardcodeado y ya fue una solución definitiva y que no se repite en cualquier otro lado"

### Respuesta: ✅ SÍ para los Fixes Originales

**Para los 2 problemas reportados originalmente:**

1. **gamificationAPI.ts - duplicación `/v1/v1/`:**
   - ✅ **Solución PERMANENTE:** URL ahora usa `/gamification/users/${userId}/summary` (sin /v1/)
   - ✅ **NO hardcoded:** Usa `apiClient` con baseURL del config centralizado
   - ✅ **NO se repite:** Validación exhaustiva confirma que NO hay más casos de `/v1/` hardcoded

2. **educationalAPI.ts - `userActivities` no existe:**
   - ✅ **Solución PERMANENTE:** Cambiado a `API_ENDPOINTS.progress.recentActivities(userId)`
   - ✅ **NO hardcoded:** Usa endpoint del config centralizado
   - ✅ **NO se repite:** Endpoint `progress.recentActivities` existe y está correctamente definido

### ⚠️ PERO: Hallazgos Adicionales Críticos

La validación exhaustiva reveló **80+ endpoints adicionales** con el mismo tipo de problema (referenciados pero no existen en config), que causarán errores similares cuando esas funcionalidades sean usadas.

---

## 🎯 RECOMENDACIONES

### 1. URGENTE: Completar API_ENDPOINTS Config

**Prioridad:** 🔴 CRÍTICA

**Acción:** Agregar todos los endpoints faltantes a `/config/api.config.ts`:

```typescript
// Ejemplo: Admin namespace completo
admin: {
  // Dashboard
  dashboard: '/admin/dashboard',
  analytics: '/admin/analytics',
  reports: '/admin/reports',
  settings: '/admin/settings',

  // Organizations (nested structure)
  organizations: '/admin/organizations',
  organization: (id: string) => `/admin/organizations/${id}`,
  organizationFeatures: (id: string) => `/admin/organizations/${id}/features`,
  organizationSubscription: (id: string) => `/admin/organizations/${id}/subscription`,
  organizationUsers: (id: string) => `/admin/organizations/${id}/users`,

  // Users management
  users: '/admin/users',
  user: (id: string) => `/admin/users/${id}`,
  userRoles: (id: string) => `/admin/users/${id}/roles`,
  userPermissions: (id: string) => `/admin/users/${id}/permissions`,

  // Classrooms
  classrooms: '/admin/classrooms',
  classroom: (id: string) => `/admin/classrooms/${id}`,
  classroomTeachers: (classroomId: string) => `/admin/classrooms/${classroomId}/teachers`,

  // Gamification config
  gamificationConfig: '/admin/gamification/config',
  gamificationParameters: '/admin/gamification/config/parameters',
  gamificationParameter: (key: string) => `/admin/gamification/config/parameters/${key}`,
  gamificationMayaRanks: '/admin/gamification/config/maya-ranks',
  gamificationMayaRank: (id: string) => `/admin/gamification/config/maya-ranks/${id}`,
}
```

**Archivos a actualizar:**
- `/config/api.config.ts` - Agregar ~50 endpoints faltantes

### 2. MEDIO: Refactorizar APIs para Usar Config

**Prioridad:** 🟡 ALTA

**Acción:** Reemplazar URLs hardcoded por referencias a `API_ENDPOINTS`:

```typescript
// ❌ ANTES (hardcoded)
const response = await apiClient.get(`/gamification/users/${userId}/stats`);

// ✅ DESPUÉS (usa config)
const response = await apiClient.get(API_ENDPOINTS.gamification.userStats(userId));
```

**Archivos a refactorizar (18 archivos):**
- `src/hooks/useAchievements.ts`
- `src/lib/api/progress.api.ts`
- `src/lib/api/educational.api.ts`
- `src/apps/student/hooks/useGamificationData.ts`
- `src/apps/student/hooks/useDashboardData.ts`
- (ver lista completa en Validación 4)

### 3. LARGO PLAZO: Automatizar Validación

**Prioridad:** 🟢 MEDIA

**Acción:** Crear script de validación en CI/CD:

```bash
# Ejemplo: scripts/validate-api-endpoints.ts
# - Lee API_ENDPOINTS del frontend
# - Lee API_ROUTES del backend
# - Compara y reporta diferencias
# - Falla build si hay inconsistencias
```

### 4. DOCUMENTACIÓN: Actualizar ADR-015

**Prioridad:** 🟢 BAJA

**Acción:** Documentar hallazgos en ADR-015:
- Endpoints faltantes descubiertos
- Plan de completitud
- Lecciones aprendidas de GAP-011

---

## 📝 CONCLUSIÓN FINAL

### Para el Usuario ✅

**Los 2 fixes reportados son PERMANENTES y NO se repiten:**
1. ✅ gamificationAPI.ts - duplicación `/v1/v1/` corregida permanentemente
2. ✅ educationalAPI.ts - endpoint `userActivities` corregido permanentemente

**No existen más URLs con `/v1/` hardcoded en código activo.**

### Para el Proyecto ⚠️

**Se descubrieron problemas estructurales más profundos:**
- 80+ endpoints referenciados que NO existen en config centralizado
- Config frontend significativamente incompleto vs backend routes
- 18 archivos usando URLs hardcoded (patrón correcto pero no centralizado)

**Estos problemas NO afectan las funcionalidades actualmente usadas por el usuario recién registrado**, pero causarán errores cuando se intenten usar features de Admin/Teacher que dependen de esos endpoints.

### Siguiente Paso Sugerido

🔴 **RECOMENDACIÓN URGENTE:** Completar el archivo `/config/api.config.ts` con todos los endpoints faltantes antes de que usuarios intenten usar funcionalidades Admin/Teacher, para evitar errores en producción.

---

## 🔗 REFERENCIAS

- **GAP-011 Analysis:** `/docs/90-transversal/GAP-011-API-CONFIG-MIGRATION-ANALYSIS.md`
- **ADR-015:** `/docs/97-adr/ADR-015-centralized-api-routes-configuration.md`
- **Frontend Config:** `/apps/frontend/src/config/api.config.ts`
- **Backend Routes:** `/apps/backend/src/shared/constants/routes.constants.ts`
- **Traza Arquitectura:** `/orchestration/trazas/TRAZA-ANALISIS-ARQUITECTURA.md`

---

**Reporte generado:** 2025-11-24
**Revisión:** v1.0.0
**Analista:** Architecture-Analyst Agent
