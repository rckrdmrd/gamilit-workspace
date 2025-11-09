# GUÍA DE CORRECCIONES P0 - GAMILIT
**Fecha:** 2025-11-09 | **Prioridad:** CRÍTICA | **Deadline:** 2025-11-16

---

## CORRECCIÓN 1: ORM en BACKEND_INVENTORY.yml

### Problema

```yaml
# docs/90-transversal/inventarios/BACKEND_INVENTORY.yml
# LÍNEA 30 (INCORRECTO)
stack:
  orm: Prisma  # ❌ INCORRECTO
```

### Solución

```yaml
# CORREGIR A:
stack:
  orm: TypeORM  # ✅ CORRECTO
```

### Pasos

1. Abrir archivo: `docs/90-transversal/inventarios/BACKEND_INVENTORY.yml`
2. Ir a línea 30
3. Cambiar `Prisma` por `TypeORM`
4. Guardar archivo
5. Commit: `docs: fix incorrect ORM in BACKEND_INVENTORY.yml`

**Responsable:** Tech Lead
**Esfuerzo:** 5 minutos
**Impacto:** Elimina confusión crítica sobre arquitectura

---

## CORRECCIÓN 2: Test Coverage en Inventarios

### Problema

Los inventarios sobrestiman el test coverage real en ~60%:

- **Backend:** Documenta 18%, real es ~5%
- **Frontend:** Documenta 13%, real es ~5%

### Solución Backend

```yaml
# docs/90-transversal/inventarios/BACKEND_INVENTORY.yml
# LÍNEAS 610-634

# ANTES (INCORRECTO):
testing:
  unit_tests:
    total: 2
    coverage: 18%
    note: "Solo módulo gamification/ranks tiene tests completos"
    modules_without_tests: 14

  overall_coverage: 18%

# DESPUÉS (CORRECTO):
testing:
  unit_tests:
    total: 11  # ✅ Archivos .spec.ts encontrados
    coverage: 5%  # ✅ Coverage real estimado
    note: "Solo gamification/ranks tiene tests completos. 14 de 15 módulos sin tests"
    files_tested:
      - gamification/services/ranks.service.spec.ts
      - gamification/controllers/ranks.controller.spec.ts
      - (otros 9 archivos sin confirmar funcionalidad)
    modules_without_tests: 14

  integration_tests:
    total: 0  # ❌ No implementados
    coverage: 0%

  e2e_tests:
    total: 0  # ❌ No implementados
    coverage: 0%

  overall_coverage: 5%  # ✅ CORRECTO
  coverage_goal: 40%
  gap: -35%  # ✅ Gap real
  priority: CRÍTICA
```

### Solución Frontend

```yaml
# docs/90-transversal/inventarios/FRONTEND_INVENTORY.yml
# LÍNEAS 90-117

# ANTES (INCORRECTO):
testing:
  unit_tests:
    total: 8
    coverage: 13%
    files_tested:
      - (lista de 8 archivos)

  overall_coverage: 13%

# DESPUÉS (CORRECTO):
testing:
  unit_tests:
    total: 19  # ✅ Archivos .test.tsx/.test.ts encontrados
    coverage: 5%  # ✅ Coverage real estimado
    files_tested:
      - apps/student/pages/__tests__/EmailVerificationPage.test.tsx
      - apps/student/pages/__tests__/LoginPage.test.tsx
      - apps/student/pages/__tests__/RegisterPage.test.tsx
      - apps/student/pages/admin/__tests__/UserManagementPage.test.tsx
      - features/admin/components/__tests__/DeactivateUserModal.test.tsx
      - features/auth/__tests__/authStore.test.ts
      - features/gamification/leaderboard/LiveLeaderboard.test.tsx
      - shared/hooks/useSanitizedHTML.test.ts
      - (otros 11 archivos)

  overall_coverage: 5%  # ✅ CORRECTO
  coverage_goal: 40%
  gap: -35%  # ✅ Gap real
  priority: CRÍTICA

  untested:
    components_without_tests: ~368  # ~387 componentes - ~19 tests
    hooks_tested: 1 de 68 (1.5%)
    stores_tested: 1 de 11 (9%)
    apis_tested: 0 de 11 (0%)
    e2e_tests: 0
```

### Pasos

1. Abrir `docs/90-transversal/inventarios/BACKEND_INVENTORY.yml`
2. Reemplazar sección `testing` (líneas 610-634) con la versión corregida
3. Guardar archivo
4. Abrir `docs/90-transversal/inventarios/FRONTEND_INVENTORY.yml`
5. Reemplazar sección `testing` (líneas 90-117) con la versión corregida
6. Guardar archivo
7. Commit: `docs: fix test coverage metrics in inventories`

**Responsable:** QA Lead
**Esfuerzo:** 30 minutos
**Impacto:** Refleja realidad del proyecto, evita falsa seguridad

---

## CORRECCIÓN 3: Constantes Backend Incompletas

### Problema 3A: Schemas Faltantes

```typescript
// apps/backend/src/shared/constants/database.constants.ts
// Solo tiene 8 de 14 schemas mapeados
```

### Solución 3A

```typescript
// apps/backend/src/shared/constants/database.constants.ts
// LÍNEAS 18-27

// ANTES (INCORRECTO - Solo 8 schemas):
export const DB_SCHEMAS = {
  AUTH: 'auth_management',
  GAMIFICATION: 'gamification_system',
  EDUCATIONAL: 'educational_content',
  PROGRESS: 'progress_tracking',
  SOCIAL: 'social_features',
  CONTENT: 'content_management',
  AUDIT: 'audit_logging',
  GAMILIT: 'gamilit',
} as const;

// DESPUÉS (CORRECTO - 14 schemas):
export const DB_SCHEMAS = {
  // Core schemas (8 existentes)
  AUTH: 'auth_management',
  GAMIFICATION: 'gamification_system',
  EDUCATIONAL: 'educational_content',
  PROGRESS: 'progress_tracking',
  SOCIAL: 'social_features',
  CONTENT: 'content_management',
  AUDIT: 'audit_logging',
  GAMILIT: 'gamilit',

  // Schemas faltantes (6 nuevos)
  ADMIN: 'admin_dashboard',
  LTI: 'lti_integration',
  PUBLIC: 'public',
  STORAGE: 'storage',
  SYSTEM_CONFIG: 'system_configuration',
  AUTH_SUPABASE: 'auth',  // Supabase built-in (opcional)
} as const;
```

### Problema 3B: Tablas Faltantes en EDUCATIONAL

```typescript
// DB_TABLES.EDUCATIONAL solo tiene 8 de 15 tablas
```

### Solución 3B

```typescript
// apps/backend/src/shared/constants/database.constants.ts
// LÍNEAS 76-85

// ANTES (INCORRECTO - Solo 8 tablas):
EDUCATIONAL: {
  MODULES: 'modules',
  EXERCISES: 'exercises',
  ASSESSMENT_RUBRICS: 'assessment_rubrics',
  MEDIA_RESOURCES: 'media_resources',
  ASSIGNMENTS: 'assignments',
  ASSIGNMENT_EXERCISES: 'assignment_exercises',
  ASSIGNMENT_STUDENTS: 'assignment_students',
  ASSIGNMENT_SUBMISSIONS: 'assignment_submissions',
}

// DESPUÉS (CORRECTO - 15 tablas):
EDUCATIONAL: {
  // Core tables (4)
  MODULES: 'modules',
  EXERCISES: 'exercises',
  ASSESSMENT_RUBRICS: 'assessment_rubrics',
  MEDIA_RESOURCES: 'media_resources',

  // Assignment tables (4)
  ASSIGNMENTS: 'assignments',
  ASSIGNMENT_EXERCISES: 'assignment_exercises',
  ASSIGNMENT_STUDENTS: 'assignment_students',
  ASSIGNMENT_SUBMISSIONS: 'assignment_submissions',

  // Content tables (7 nuevas)
  EXERCISE_OPTIONS: 'exercise_options',
  EXERCISE_ANSWERS: 'exercise_answers',
  CONTENT_METADATA: 'content_metadata',
  MODULE_DEPENDENCIES: 'module_dependencies',
  TAXONOMIES: 'taxonomies',
  CONTENT_TAGS: 'content_tags',
  CONTENT_APPROVALS: 'content_approvals',
}
```

### Problema 3C: Type Helpers Incompletos

```typescript
// Faltan type helpers para los nuevos schemas
```

### Solución 3C

```typescript
// apps/backend/src/shared/constants/database.constants.ts
// DESPUÉS DE LÍNEA 162

// Type Helpers (agregar 6 nuevos)
export type DbSchema = (typeof DB_SCHEMAS)[keyof typeof DB_SCHEMAS];
export type AuthTable = (typeof DB_TABLES.AUTH)[keyof typeof DB_TABLES.AUTH];
export type GamificationTable = (typeof DB_TABLES.GAMIFICATION)[keyof typeof DB_TABLES.GAMIFICATION];
export type EducationalTable = (typeof DB_TABLES.EDUCATIONAL)[keyof typeof DB_TABLES.EDUCATIONAL];
export type ProgressTable = (typeof DB_TABLES.PROGRESS)[keyof typeof DB_TABLES.PROGRESS];
export type SocialTable = (typeof DB_TABLES.SOCIAL)[keyof typeof DB_TABLES.SOCIAL];
export type ContentTable = (typeof DB_TABLES.CONTENT)[keyof typeof DB_TABLES.CONTENT];

// AGREGAR (6 nuevos):
export type AdminTable = (typeof DB_TABLES.ADMIN)[keyof typeof DB_TABLES.ADMIN];
export type LtiTable = (typeof DB_TABLES.LTI)[keyof typeof DB_TABLES.LTI];
export type PublicTable = (typeof DB_TABLES.PUBLIC)[keyof typeof DB_TABLES.PUBLIC];
export type StorageTable = (typeof DB_TABLES.STORAGE)[keyof typeof DB_TABLES.STORAGE];
export type SystemConfigTable = (typeof DB_TABLES.SYSTEM_CONFIG)[keyof typeof DB_TABLES.SYSTEM_CONFIG];
export type AuditTable = (typeof DB_TABLES.AUDIT)[keyof typeof DB_TABLES.AUDIT];
```

### Problema 3D: DB_TABLES para Nuevos Schemas

```typescript
// Faltan secciones completas de DB_TABLES
```

### Solución 3D

```typescript
// apps/backend/src/shared/constants/database.constants.ts
// DESPUÉS DE LÍNEA 135 (después de DB_TABLES.GAMILIT)

// AGREGAR secciones faltantes:

/**
 * Admin Dashboard Schema
 * Tablas de dashboard administrativo (actualmente solo vistas)
 */
ADMIN: {
  // Schema tiene 0 tablas (solo vistas)
  // Agregar aquí cuando se implementen tablas
},

/**
 * LTI Integration Schema
 * Tablas de integración LTI 1.3
 */
LTI: {
  LTI_CONSUMERS: 'lti_consumers',
  LTI_SESSIONS: 'lti_sessions',
  LTI_GRADE_PASSBACK: 'lti_grade_passback',
},

/**
 * Public Schema
 * Schema público (limpiado - solo funciones y triggers)
 */
PUBLIC: {
  // Schema tiene 0 tablas (migradas a otros schemas)
  // Mantener vacío
},

/**
 * Storage Schema
 * Schema de almacenamiento (usa Supabase Storage)
 */
STORAGE: {
  // Schema tiene 0 tablas (usa Supabase Storage API)
  // Mantener vacío
},

/**
 * System Configuration Schema
 * Tablas de configuración del sistema
 */
SYSTEM_CONFIG: {
  SYSTEM_SETTINGS: 'system_settings',
  FEATURE_FLAGS: 'feature_flags',
  NOTIFICATION_SETTINGS: 'notification_settings',
  ENVIRONMENT_CONFIG: 'environment_config',
  API_CONFIGURATION: 'api_configuration',
  TENANT_CONFIGURATIONS: 'tenant_configurations',
},
```

### Pasos

1. Abrir `apps/backend/src/shared/constants/database.constants.ts`
2. Aplicar **Solución 3A** (agregar 6 schemas en DB_SCHEMAS)
3. Aplicar **Solución 3B** (agregar 7 tablas en EDUCATIONAL)
4. Aplicar **Solución 3C** (agregar 6 type helpers)
5. Aplicar **Solución 3D** (agregar 5 secciones en DB_TABLES)
6. Guardar archivo
7. Ejecutar build: `npm run build` (verificar sin errores TypeScript)
8. Commit: `fix(backend): complete database constants with all schemas and tables`

**Responsable:** Backend Team
**Esfuerzo:** 1.5 horas (incluyendo testing)
**Impacto:** Type-safety completo para todas las tablas BD

---

## VALIDACIÓN DE CORRECCIONES

### Checklist de Verificación

Después de aplicar las 3 correcciones, verificar:

#### ✅ Corrección 1 (ORM)
```bash
# Verificar cambio
grep -n "orm:" docs/90-transversal/inventarios/BACKEND_INVENTORY.yml
# Debe mostrar: "orm: TypeORM"
```

#### ✅ Corrección 2 (Test Coverage)
```bash
# Verificar cambios en Backend
grep -A 5 "overall_coverage:" docs/90-transversal/inventarios/BACKEND_INVENTORY.yml
# Debe mostrar: "overall_coverage: 5%"

# Verificar cambios en Frontend
grep -A 5 "overall_coverage:" docs/90-transversal/inventarios/FRONTEND_INVENTORY.yml
# Debe mostrar: "overall_coverage: 5%"
```

#### ✅ Corrección 3 (Constantes)
```bash
# Verificar schemas (debe mostrar 14)
grep -c ":" apps/backend/src/shared/constants/database.constants.ts | head -1

# Verificar tablas EDUCATIONAL (debe mostrar 15)
grep -A 20 "EDUCATIONAL:" apps/backend/src/shared/constants/database.constants.ts | grep -c ":"

# Verificar build sin errores
cd apps/backend && npm run build
```

### Test de Regresión

Después de las correcciones, ejecutar:

```bash
# Backend
cd apps/backend
npm run test  # Verificar que tests existentes sigan pasando

# Frontend
cd apps/frontend
npm run test  # Verificar que tests existentes sigan pasando
```

---

## COMUNICACIÓN DE CAMBIOS

### Template de Commit Messages

```bash
# Corrección 1
git add docs/90-transversal/inventarios/BACKEND_INVENTORY.yml
git commit -m "docs: fix incorrect ORM in BACKEND_INVENTORY.yml

Changed ORM from Prisma to TypeORM to reflect actual implementation.
Backend uses TypeORM 0.3.17 with @nestjs/typeorm 11.0.0.

Related: Issue #XXX"

# Corrección 2
git add docs/90-transversal/inventarios/BACKEND_INVENTORY.yml \
       docs/90-transversal/inventarios/FRONTEND_INVENTORY.yml
git commit -m "docs: fix test coverage metrics in inventories

Updated test coverage to reflect reality:
- Backend: 18% → 5% (11 test files found)
- Frontend: 13% → 5% (19 test files found)

Coverage was overestimated by ~60%. Only gamification/ranks
module has complete tests. 14 of 15 modules lack tests.

Related: Issue #XXX"

# Corrección 3
git add apps/backend/src/shared/constants/database.constants.ts
git commit -m "fix(backend): complete database constants with all schemas and tables

Added missing schemas to DB_SCHEMAS:
- admin_dashboard, lti_integration, public, storage,
  system_configuration, auth (Supabase)

Added missing tables to EDUCATIONAL:
- exercise_options, exercise_answers, content_metadata,
  module_dependencies, taxonomies, content_tags, content_approvals

Added DB_TABLES sections for:
- ADMIN, LTI, PUBLIC, STORAGE, SYSTEM_CONFIG

Added type helpers for new schemas.

This ensures type-safety for all database references.

Related: Issue #XXX"
```

### Notificación al Equipo

**Enviar mensaje en Slack/Teams:**

```
🔧 **CORRECCIONES CRÍTICAS APLICADAS**

Se aplicaron 3 correcciones P0 en los inventarios del proyecto:

1. ✅ ORM corregido: Prisma → TypeORM
2. ✅ Test coverage actualizado: Refleja realidad (5% en vez de 15%)
3. ✅ Constantes BD completas: 14 schemas + todas las tablas

📄 **Documentos actualizados:**
- BACKEND_INVENTORY.yml
- FRONTEND_INVENTORY.yml
- database.constants.ts

⚠️ **Impacto:**
- Mayor precisión en documentación
- Type-safety completo para referencias BD
- Elimina falsa sensación de seguridad en tests

📋 **Próximos pasos:**
- Ver GUIA-CORRECCIONES-P0-2025-11-09.md para detalles
- Revisar cambios en PR #XXX
- Plan de incremento de test coverage en backlog

cc: @tech-lead @qa-lead @backend-team
```

---

## SEGUIMIENTO

### Métricas de Éxito

Después de aplicar las correcciones P0:

| Métrica | Antes | Después | Meta |
|---------|-------|---------|------|
| Discrepancias Críticas | 3 | 0 | 0 |
| Schemas en Constants | 8/14 (57%) | 14/14 (100%) | 100% |
| Tablas EDUCATIONAL en Constants | 8/15 (53%) | 15/15 (100%) | 100% |
| Precisión Test Coverage | 30% | 100% | 100% |
| Coherencia Global | 70% | 85% | 90% |

### Próxima Revisión

**Fecha:** 2025-11-16 (1 semana)
**Objetivo:** Validar que correcciones P0 estén aplicadas y comenzar P1

---

**Fin de la Guía**

Para correcciones P1 y P2, ver:
- `ANALISIS-FINAL-CONSOLIDADO-GAMILIT-2025-11-09.md` (Sección 7.2 y 7.3)
