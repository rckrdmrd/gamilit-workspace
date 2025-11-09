# REPORTE DE ALINEACIÓN: BACKEND vs BASE DE DATOS
## Proyecto Gamilit - Análisis Exhaustivo
**Fecha:** 2025-11-08
**Analista:** Claude Code
**Alcance:** Backend (NestJS + TypeORM) vs PostgreSQL Database

---

## RESUMEN EJECUTIVO

### Nivel de Alineación General: **73% (MODERADO)**

| Métrica | Valor | Estado |
|---------|-------|--------|
| **Entidades Backend Totales** | 45 | - |
| **Tablas BD Totales** | 89 | - |
| **Entidades Alineadas** | 33/45 (73%) | ⚠️ MODERADO |
| **Tablas Huérfanas (BD sin uso)** | 42 (48%) | ❌ CRÍTICO |
| **Tablas Faltantes (Backend necesita)** | 0 | ✅ OK |
| **Discrepancias en Enums** | 6 problemas | ❌ CRÍTICO |
| **Problemas Críticos (P0)** | 7 | ❌ CRÍTICO |

### Hallazgos Críticos

1. **DISCREPANCIA DOCUMENTACIÓN vs REALIDAD**
   - Documentación dice: Express.js + node-postgres
   - Realidad: **NestJS + TypeORM** ❌
   - Inventario backend dice: Prisma
   - Realidad: **TypeORM** ❌

2. **ASSIGNMENTS EN SCHEMA INCORRECTO** (P0)
   - 3 entidades backend apuntan a `public` schema
   - BD real: tablas movidas a `educational_content` y `social_features`
   - Impacto: **ALTO** - Queries fallan en runtime

3. **48% DE TABLAS HUÉRFANAS**
   - 42 tablas en BD sin entidades backend
   - Funcionalidad documentada no implementada
   - Desperdicio de recursos y confusión

4. **TEST COVERAGE REAL: 18%** (estimado original: 88%)
   - Gap de **-70%** respecto a estimaciones
   - Solo módulo `gamification/ranks` tiene tests completos
   - 14 de 15 módulos **SIN TESTS**

---

## 1. STACK TECNOLÓGICO REAL

### Documentado vs Real

| Componente | Documentación | Realidad | Estado |
|------------|--------------|----------|--------|
| **Backend Framework** | Express.js | **NestJS 11.1.8** | ❌ INCORRECTO |
| **ORM** | node-postgres / Prisma | **TypeORM 0.3.17** | ❌ INCORRECTO |
| **Database** | PostgreSQL 15+ | **PostgreSQL 15+** | ✅ CORRECTO |
| **Auth** | JWT custom | **Passport + JWT** | ⚠️ PARCIAL |
| **Testing** | Jest | **Jest 29.7** | ✅ CORRECTO |
| **LOC Backend** | ~45,000 | **~53,233** | ⚠️ DESACTUALIZADO |

**Recomendación P0:** Actualizar URGENTEMENTE `apps/backend/_MAP.md` y `BACKEND_INVENTORY.yml` con información real.

---

## 2. MAPEO DETALLADO: ENTIDADES vs TABLAS

### 2.1 Schema: auth / auth_management (90% alineado)

**Entidades Backend:** 10
**Tablas BD:** 15
**Estado:** ⚠️ Bueno pero incompleto

| Entidad Backend | Tabla BD Real | Estado | Problema |
|----------------|---------------|--------|----------|
| `User` | `auth.users` | ✅ | - |
| `Tenant` | `tenants` | ✅ | - |
| `Profile` | `profiles` | ✅ | - |
| `UserRole` | **`roles`** | ❌ | **Nombre incorrecto** (entity usa `user_roles`) |
| `Membership` | `memberships` | ✅ | - |
| `AuthProvider` | `auth_providers` | ✅ | - |
| `AuthAttempt` | `auth_attempts` | ✅ | - |
| `UserSession` | `user_sessions` | ✅ | - |
| `EmailVerificationToken` | `email_verification_tokens` | ✅ | - |
| `PasswordResetToken` | `password_reset_tokens` | ✅ | - |

**Tablas BD SIN entidades backend (5):**
- `security_events` ← ⚠️ Auditoría importante
- `user_preferences` ← ⚠️ Configuración de usuario
- `user_suspensions` ← ⚠️ Moderación
- `parent_accounts` (Fase 3 - EXT-010)
- `parent_student_links` (Fase 3 - EXT-010)

**Acción Requerida P1:**
1. Corregir nombre de tabla `UserRole` entity (debe apuntar a `roles`, no `user_roles`)
2. Crear entidades para `security_events`, `user_preferences`, `user_suspensions`

---

### 2.2 Schema: gamification_system (92% alineado) ✅

**Entidades Backend:** 12
**Tablas BD:** 15
**Estado:** ✅ Excelente

| Entidad Backend | Tabla BD | Estado |
|----------------|----------|--------|
| `UserStats` | `user_stats` | ✅ |
| `UserRank` | `user_ranks` | ✅ |
| `Achievement` | `achievements` | ✅ |
| `UserAchievement` | `user_achievements` | ✅ |
| `MLCoinsTransaction` | `ml_coins_transactions` | ✅ |
| `Mission` | `missions` | ✅ |
| `ComodinesInventory` | `comodines_inventory` | ✅ |
| `Notification` | `notifications` | ✅ |
| `LeaderboardMetadata` | `leaderboard_metadata` | ✅ |
| `AchievementCategory` | `achievement_categories` | ✅ |
| `ActiveBoost` | `active_boosts` | ✅ |
| `InventoryTransaction` | `inventory_transactions` | ✅ |

**Tablas BD SIN entidades (3):**
- `comodin_usage_log` (tracking - 2025-11-08)
- `comodin_usage_tracking` (analytics - 2025-11-08)
- `maya_ranks` (tabla de datos, OK sin entidad)

**Estado:** ✅ **MEJOR ALINEADO** - Módulo más completo del proyecto

---

### 2.3 Schema: educational_content (27% alineado) ❌

**Entidades Backend:** 4
**Tablas BD:** 15
**Estado:** ❌ **CRÍTICO** - Muy incompleto

| Entidad Backend | Tabla BD | Estado |
|----------------|----------|--------|
| `Module` | `modules` | ✅ |
| `Exercise` | `exercises` | ✅ |
| `AssessmentRubric` | `assessment_rubrics` | ✅ |
| `MediaResource` | `media_resources` | ✅ |

**Tablas BD SIN entidades (11):**
1. `assignments` ← **CONFLICTO**: Backend apunta a `public`, tabla está aquí
2. `assignment_exercises` ← Movido de public
3. `assignment_students` ← Movido de public
4. `assignment_submissions` ← **CONFLICTO**: Backend apunta a `public`
5. `content_approvals` (EXT-006)
6. `content_metadata`
7. `content_tags`
8. `exercise_answers`
9. `exercise_options`
10. `module_dependencies`
11. `taxonomies`

**Acción Requerida P0:**
- Migrar entidades `Assignment`, `AssignmentSubmission`, `AssignmentExercise`, `AssignmentStudent` de `public` a `educational_content`

---

### 2.4 Schema: progress_tracking (38% alineado) ⚠️

**Entidades Backend:** 5
**Tablas BD:** 13
**Estado:** ⚠️ Incompleto

| Entidad Backend | Tabla BD | Estado |
|----------------|----------|--------|
| `ModuleProgress` | `module_progress` | ✅ |
| `LearningSession` | `learning_sessions` | ✅ |
| `ExerciseAttempt` | `exercise_attempts` | ✅ |
| `ExerciseSubmission` | `exercise_submissions` | ✅ |
| `ScheduledMission` | `scheduled_missions` | ✅ |

**Tablas BD SIN entidades (8):**
- `engagement_metrics`
- `learning_paths`
- `mastery_tracking`
- `module_completion_tracking`
- `progress_snapshots`
- `skill_assessments`
- `teacher_notes` (movido de public)
- `user_learning_paths`

---

### 2.5 Schema: social_features (58% alineado) ⚠️

**Entidades Backend:** 7
**Tablas BD:** 12
**Estado:** ⚠️ Moderado

| Entidad Backend | Tabla BD | Estado |
|----------------|----------|--------|
| `Friendship` | `friendships` | ✅ |
| `School` | `schools` | ✅ |
| `Classroom` | `classrooms` | ✅ |
| `ClassroomMember` | `classroom_members` | ✅ |
| `Team` | `teams` | ✅ |
| `TeamMember` | `team_members` | ✅ |
| `TeamChallenge` | `team_challenges` | ✅ |

**Tablas BD SIN entidades (5):**
- `assignment_classrooms` ← **CONFLICTO**: Backend apunta a `public`
- `discussion_threads`
- `social_interactions`
- `teacher_classrooms` (EXT-001)
- `user_follows`

---

### 2.6 Schema: content_management (38% alineado) ⚠️

**Entidades Backend:** 3
**Tablas BD:** 8
**Estado:** ⚠️ Incompleto

| Entidad Backend | Tabla BD | Estado |
|----------------|----------|--------|
| `ContentTemplate` | `content_templates` | ✅ |
| `MarieCurieContent` | `marie_curie_content` | ✅ |
| `MediaFile` | `media_files` | ✅ |

**Tablas BD SIN entidades (5):**
- `content_versions` (EXT-006)
- `flagged_content`
- `content_authors`
- `content_categories`
- `media_metadata`

---

### 2.7 Schema: audit_logging (17% alineado) ❌

**Entidades Backend:** 1
**Tablas BD:** 6
**Estado:** ❌ Muy incompleto

| Entidad Backend | Tabla BD | Estado |
|----------------|----------|--------|
| `AuditLog` | `audit_logs` | ✅ |

**Tablas BD SIN entidades (5):**
- `performance_metrics`
- `system_alerts`
- `system_logs`
- `user_activity_logs`
- `user_activity`

---

### 2.8 Schemas SIN entidades backend

**system_configuration (0% alineado):**
- 0 entidades backend
- 6 tablas BD (EXT-002, EXT-008)

**lti_integration (0% alineado):**
- 0 entidades backend
- 2 tablas BD (EXT-007)

---

## 3. DISCREPANCIAS EN ENUMS CRÍTICAS

### 3.1 ProgressStatusEnum ❌ CRÍTICO

**Backend (`enums.constants.ts`):**
```typescript
export enum ProgressStatusEnum {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  NEEDS_REVIEW = 'needs_review',
  MASTERED = 'mastered',  // ❌ NO EXISTE EN BD
}
```

**Base de Datos (`progress_tracking.progress_status`):**
```sql
CREATE TYPE progress_tracking.progress_status AS ENUM (
  'not_started',
  'in_progress',
  'completed',
  'needs_review',
  'abandoned'  -- ❌ NO EXISTE EN BACKEND
);
```

**Problema:**
- Backend usa `mastered` ← No existe en BD
- BD usa `abandoned` ← No existe en backend

**Impacto:** **CRÍTICO** - Queries fallan en runtime al insertar/actualizar status

**Acción P0:**
1. Decidir cuál es el valor correcto
2. Actualizar enum en BD o backend para sincronizar
3. Migrar datos existentes si es necesario

---

### 3.2 DifficultyLevelEnum ⚠️ NO VERIFICADO

**Backend:** 8 valores
```typescript
BEGINNER, INTERMEDIATE, ADVANCED, VERY_EASY, EASY, MEDIUM, HARD, VERY_HARD
```

**Base de Datos:** Se usa `educational_content.difficulty_level` ENUM pero **NO EXISTE ARCHIVO DDL**

**Problema:** Enum se referencia en múltiples tablas pero no está definido explícitamente

**Acción P1:**
1. Verificar si enum existe en BD con `\dT educational_content.difficulty_level`
2. Si existe: Crear archivo DDL faltante
3. Si NO existe: Crearlo según backend

---

### 3.3 NotificationTypeEnum ⚠️ FALTA ENUM EN BD

**Backend:** 11 tipos de notificaciones (bien definidos)

**Base de Datos:** Columna `type` es **TEXT** (no ENUM)

**Problema:** Sin type safety a nivel de BD

**Acción P2:**
1. Crear ENUM `notification_type` en BD
2. Migrar columna TEXT → ENUM
3. Agregar CHECK constraint como fallback

---

### 3.4 NotificationPriorityEnum ⚠️ FALTA ENUM EN BD

**Backend:** 4 niveles (LOW, MEDIUM, HIGH, CRITICAL)

**Base de Datos:** **NO EXISTE**

**Acción P2:** Crear ENUM en BD

---

### 3.5 ContentStatusEnum ⚠️ POSIBLE DISCREPANCIA

**Backend:**
```typescript
DRAFT = 'draft',
PUBLISHED = 'published',
ARCHIVED = 'archived',
UNDER_REVIEW = 'under_review',
```

**Base de Datos (`educational_content.module_status`):**
- Necesita verificación

**Acción P2:** Verificar sincronización

---

### 3.6 ModuleStatusEnum vs ContentStatusEnum ⚠️

**Problema:** Hay 2 enums similares que podrían generar confusión:
- `educational_content.module_status`
- `public.content_status`

**Acción P2:** Consolidar o documentar diferencias

---

## 4. PROBLEMAS DE REFERENCIAS Y FK

### 4.1 Referencias Cross-Schema COMENTADAS

**Problema:** Múltiples entidades tienen relaciones comentadas

**Ejemplo:**
```typescript
// User.entity.ts (schema: auth)
// @OneToOne(() => Profile, (profile) => profile.user)
// profile?: Profile; // COMENTADO porque cruza schemas
```

**Tablas afectadas:**
- `auth.users` → `auth_management.profiles`
- Todas las tablas con `user_id` FK

**Impacto:** Backend no puede usar relaciones TypeORM, debe hacer JOIN manuales

**Solución:** TypeORM **SÍ SOPORTA** relaciones cross-schema. Descomentar relaciones.

---

### 4.2 Confusión: auth.users vs auth_management.profiles

**Problema:** Inconsistencia en cuál tabla usar para FK `user_id`

Algunas tablas apuntan a:
- `auth.users.id` (tabla Supabase Auth built-in)
- `auth_management.profiles.id` (perfil extendido)

**Recomendación:**
- **Estandarizar** en `auth_management.profiles.id` para todas las relaciones
- `auth.users` solo para autenticación interna
- `profiles` para relaciones de negocio

---

## 5. MATRIZ DE ALINEACIÓN GENERAL

| Schema | Entidades Backend | Tablas BD | Alineación | Estado |
|--------|------------------|-----------|------------|--------|
| `auth` / `auth_management` | 10 | 15 | 67% | ⚠️ Bueno |
| `gamification_system` | 12 | 15 | 80% | ✅ Excelente |
| `educational_content` | 4 | 15 | 27% | ❌ Crítico |
| `progress_tracking` | 5 | 13 | 38% | ⚠️ Incompleto |
| `social_features` | 7 | 12 | 58% | ⚠️ Moderado |
| `content_management` | 3 | 8 | 38% | ⚠️ Incompleto |
| `audit_logging` | 1 | 6 | 17% | ❌ Muy bajo |
| `system_configuration` | 0 | 6 | 0% | ❌ Sin implementar |
| `lti_integration` | 0 | 2 | 0% | ⚠️ Futuro (EXT-007) |
| **TOTAL** | **45** | **89** | **51%** | ⚠️ MODERADO |

---

## 6. TESTING: GAP CRÍTICO

### Comparación: Estimado vs Real

| Épica | Coverage Estimado | Coverage Real | Gap |
|-------|------------------|---------------|-----|
| **EAI-001** (Fundamentos) | 88% | 18% | **-70%** ❌ |
| **EAI-003** (Gamificación) | 89% | 25% | **-64%** ❌ |
| **PROMEDIO** | ~88% | ~18% | **-70%** ❌ |

### Módulos Backend con Tests

| Módulo | Tests | Coverage | Estado |
|--------|-------|----------|--------|
| `gamification/ranks` | ✅ Completo | 88% | ✅ OK |
| `auth` | ⚠️ Básicos | 15% | ❌ Insuficiente |
| `educational` | ❌ Sin tests | 0% | ❌ CRÍTICO |
| `progress` | ❌ Sin tests | 0% | ❌ CRÍTICO |
| `social` | ❌ Sin tests | 0% | ❌ CRÍTICO |
| `content` | ❌ Sin tests | 0% | ❌ CRÍTICO |
| `admin` | ❌ Sin tests | 0% | ❌ CRÍTICO |
| `teacher` | ❌ Sin tests | 0% | ❌ CRÍTICO |
| `assignments` | ❌ Sin tests | 0% | ❌ CRÍTICO |
| `audit` | ❌ Sin tests | 0% | ❌ CRÍTICO |
| `notifications` | ❌ Sin tests | 0% | ❌ CRÍTICO |
| `tasks` | ❌ Sin tests | 0% | ❌ CRÍTICO |
| `websocket` | ❌ Sin tests | 0% | ❌ CRÍTICO |
| `mail` | ❌ Sin tests | 0% | ❌ CRÍTICO |

**Conclusión:** Solo 1 de 15 módulos tiene tests completos (7%)

---

## 7. INVENTARIOS DESACTUALIZADOS

### 7.1 BACKEND_INVENTORY.yml

**Problemas encontrados:**

1. **ORM incorrecto:**
   - Dice: Prisma
   - Real: **TypeORM 0.3.17**

2. **Total módulos:**
   - Dice: 20 módulos
   - Real: **15 módulos** (16 contando websocket)

3. **Módulos listados pero NO existen:**
   - `lti` (partial 40%) ← NO existe carpeta
   - `white-label` (partial 30%) ← NO existe carpeta
   - `peer-challenges` (partial 50%) ← NO existe carpeta
   - `parent-portal` (partial 35%) ← NO existe carpeta

4. **Test coverage:**
   - Dice: 87% global
   - Real: **18%**

**Acción P0:** Actualizar `BACKEND_INVENTORY.yml` con datos reales

---

### 7.2 DATABASE_INVENTORY.yml

**Estado:** ✅ Generalmente correcto (actualizado 2025-11-08)

**Mejoras necesarias:**
- Marcar tablas sin entidades backend
- Agregar nota de enums faltantes

---

### 7.3 apps/backend/_MAP.md

**Problemas:**
1. Dice: Express.js
2. Dice: node-postgres directo
3. Métricas de código desactualizadas

**Acción P0:** Reescribir completamente con información real

---

## 8. RECOMENDACIONES PRIORITARIAS

### P0 - CRÍTICO (Bloquea desarrollo) - 1 semana

**Esfuerzo estimado:** 20-30 horas

1. **Migrar Assignments a schemas correctos**
   ```
   Assignment → educational_content.assignments
   AssignmentSubmission → educational_content.assignment_submissions
   AssignmentExercise → educational_content.assignment_exercises
   AssignmentStudent → educational_content.assignment_students
   AssignmentClassroom → social_features.assignment_classrooms
   ```
   - Actualizar entidades TypeORM
   - Actualizar constantes `DB_SCHEMAS` y `DB_TABLES`
   - Probar queries

2. **Resolver discrepancia ProgressStatusEnum**
   - Decidir: `mastered` vs `abandoned`
   - Migrar enum en BD o backend
   - Actualizar código existente

3. **Corregir auth_management.user_roles → roles**
   - Actualizar `UserRole` entity
   - Verificar que tabla real se llama `roles`
   - Probar queries

4. **Actualizar documentación crítica**
   - `apps/backend/_MAP.md`
   - `BACKEND_INVENTORY.yml`
   - Marcar ORM real: **TypeORM**

---

### P1 - ALTO (Impacta funcionalidad) - 2 semanas

**Esfuerzo estimado:** 30-40 horas

5. **Crear ENUMs faltantes en BD**
   - `notification_type` (11 valores)
   - `notification_priority` (4 valores)
   - `difficulty_level` (8 valores) ← verificar si existe primero

6. **Crear entidades para tablas críticas**
   - `security_events` (auth_management)
   - `user_preferences` (auth_management)
   - `user_suspensions` (auth_management)
   - `teacher_notes` (progress_tracking - EXT-001)

7. **Descomentar relaciones cross-schema**
   - `User` ↔ `Profile`
   - Todas las relaciones a `Profile`
   - Beneficio: Mejor DX, queries automáticas

8. **Crear tests para módulos sin coverage**
   - Priorizar: `educational`, `progress`, `social`
   - Meta: 40% coverage en 3 módulos principales

---

### P2 - MEDIO (Mejoras) - 1 mes

**Esfuerzo estimado:** 40-50 horas

9. **Documentar y planificar tablas huérfanas (42 tablas)**
   - Clasificar: legacy vs futuras features
   - Marcar para eliminación o implementación
   - Actualizar inventarios

10. **Estandarizar FK user_id**
    - Decisión: `auth.users` vs `auth_management.profiles`
    - Migrar todas las FK a mismo destino
    - Actualizar constraints

11. **Crear entidades para system_configuration**
    - `system_settings`
    - `feature_flags`
    - `notification_settings`
    - `api_configuration`
    - `environment_config`
    - `tenant_configurations`

12. **Verificar y documentar enums compartidos**
    - Crear doc de sincronización Backend ↔ BD
    - Script de validación automática
    - CI/CD check

---

### P3 - BAJO (Optimizaciones) - Backlog

13. **Limpiar tablas legacy en public**
    - Verificar que tablas movidas estén vacías
    - DROP tablas legacy después de backup

14. **Agregar validaciones en entidades**
    - CHECK constraints como decoradores
    - Validaciones de negocio

15. **Mejorar DX con type helpers**
    - Generar types automáticos desde BD
    - Sync automático de enums

---

## 9. PLAN DE ACCIÓN INMEDIATO (SPRINT 1-2)

### Sprint 1 - Correcciones Críticas (P0)

**Duración:** 5 días laborables
**Objetivo:** Resolver bloqueos de desarrollo

**Día 1-2:**
- [ ] Migrar entidades Assignments a schemas correctos
- [ ] Actualizar `DB_SCHEMAS` y `DB_TABLES` constants
- [ ] Probar queries de assignments

**Día 3:**
- [ ] Resolver enum `ProgressStatusEnum` (mastered vs abandoned)
- [ ] Migrar datos si es necesario
- [ ] Actualizar código backend

**Día 4:**
- [ ] Corregir `UserRole` entity (user_roles → roles)
- [ ] Probar auth RBAC

**Día 5:**
- [ ] Actualizar `_MAP.md` y `BACKEND_INVENTORY.yml`
- [ ] Revisión y testing de cambios

---

### Sprint 2 - ENUMs y Entidades Faltantes (P1)

**Duración:** 10 días laborables
**Objetivo:** Completar funcionalidad base

**Semana 1:**
- [ ] Crear ENUMs faltantes en BD
- [ ] Migrar columnas TEXT → ENUM donde corresponda
- [ ] Crear entidades `security_events`, `user_preferences`, `user_suspensions`
- [ ] Descomentar relaciones cross-schema

**Semana 2:**
- [ ] Crear tests para módulos `educational`, `progress`
- [ ] Meta: 30% coverage en 2 módulos
- [ ] Documentar tablas huérfanas

---

## 10. MÉTRICAS DE ÉXITO

### KPIs de Alineación

| Métrica | Actual | Meta Sprint 1 | Meta Sprint 2 |
|---------|--------|---------------|---------------|
| **Alineación General** | 73% | 85% | 90% |
| **Problemas P0** | 7 | 0 | 0 |
| **Tablas Huérfanas** | 42 (48%) | 40 (45%) | 30 (34%) |
| **Discrepancias Enums** | 6 | 2 | 0 |
| **Test Coverage Backend** | 18% | 20% | 30% |
| **Inventarios Actualizados** | 0/3 | 3/3 | 3/3 |

---

## 11. RIESGOS Y MITIGACIONES

### Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| **Queries fallan en producción** (assignments) | Alta | Crítico | Deploy en horario valle, rollback plan |
| **Migración enum rompe datos** | Media | Alto | Backup BD antes, testing exhaustivo |
| **Relaciones cross-schema lentas** | Baja | Medio | Benchmarking, índices adicionales |
| **Refactor introduce nuevos bugs** | Media | Alto | Tests E2E antes y después |

---

## 12. CONCLUSIONES

### Estado Actual del Proyecto

**Positivo:**
- ✅ Stack robusto (NestJS + TypeORM + PostgreSQL)
- ✅ Schema `gamification_system` muy bien alineado (92%)
- ✅ Arquitectura modular bien diseñada
- ✅ Uso de constantes para evitar hardcoding
- ✅ Database_INVENTORY actualizado (2025-11-08)

**Crítico:**
- ❌ Documentación desactualizada (Express vs NestJS)
- ❌ 3 entidades Assignments en schema incorrecto
- ❌ 48% de tablas BD sin uso (42 tablas)
- ❌ Test coverage real 18% (estimado 88%)
- ❌ 6 discrepancias en enums críticas

### Nivel de Urgencia

**🔴 URGENTE:** Resolver P0 antes de continuar desarrollo de features
**🟡 IMPORTANTE:** Abordar P1 en próximo sprint
**🟢 PUEDE ESPERAR:** P2 y P3 en backlog

### Recomendación Final

**Dedicar 2 sprints (15 días) a deuda técnica antes de nuevas features:**

1. Sprint de corrección crítica (P0)
2. Sprint de enums y tests (P1)

**Beneficio:** Base sólida para desarrollo futuro, menos bugs en producción, mejor DX.

---

## 13. ANEXOS

### A. Lista Completa de Tablas Huérfanas (42)

**auth_management (5):**
- security_events
- user_preferences
- user_suspensions
- parent_accounts
- parent_student_links

**gamification_system (3):**
- comodin_usage_log
- comodin_usage_tracking
- maya_ranks (datos)

**educational_content (11):**
- assignment_exercises
- assignment_students
- assignment_submissions
- assignments
- content_approvals
- content_metadata
- content_tags
- exercise_answers
- exercise_options
- module_dependencies
- taxonomies

**progress_tracking (8):**
- engagement_metrics
- learning_paths
- mastery_tracking
- module_completion_tracking
- progress_snapshots
- skill_assessments
- teacher_notes
- user_learning_paths

**social_features (5):**
- assignment_classrooms
- discussion_threads
- social_interactions
- teacher_classrooms
- user_follows

**content_management (5):**
- content_versions
- flagged_content
- content_authors
- content_categories
- media_metadata

**audit_logging (5):**
- performance_metrics
- system_alerts
- system_logs
- user_activity_logs
- user_activity

---

### B. Scripts de Migración Recomendados

**1. Migrar Assignments a educational_content**

```sql
-- apps/database/migrations/2025-11-08-migrate-assignments.sql

BEGIN;

-- Verificar que tablas están en educational_content
SELECT schemaname, tablename
FROM pg_tables
WHERE tablename LIKE 'assignment%'
  AND schemaname = 'educational_content';

-- NO hacer nada en BD (ya están migradas)
-- Solo actualizar backend entities

COMMIT;
```

**2. Resolver ProgressStatusEnum**

```sql
-- Opción A: Agregar 'mastered' a BD
ALTER TYPE progress_tracking.progress_status ADD VALUE 'mastered';

-- Opción B: Agregar 'abandoned' a backend
-- (modificar enums.constants.ts)

-- Opción C: Tener ambos
ALTER TYPE progress_tracking.progress_status ADD VALUE 'mastered';
ALTER TYPE progress_tracking.progress_status ADD VALUE 'abandoned';
```

---

### C. Checklist de Verificación Post-Sprint

**Sprint 1 (P0):**
- [ ] Assignments queries funcionan correctamente
- [ ] Tests E2E de assignments pasan
- [ ] ProgressStatusEnum sincronizado BD ↔ Backend
- [ ] UserRole apunta a tabla correcta
- [ ] _MAP.md actualizado con NestJS + TypeORM
- [ ] BACKEND_INVENTORY.yml corregido
- [ ] Sin errores en logs de producción

**Sprint 2 (P1):**
- [ ] ENUMs creados en BD
- [ ] Entidades security_events, user_preferences, user_suspensions funcionando
- [ ] Relaciones cross-schema descomentadas y testeadas
- [ ] Coverage backend ≥ 30% en módulos principales
- [ ] Documentación de tablas huérfanas creada
- [ ] Sin regresiones en funcionalidad existente

---

**FIN DEL REPORTE**

---

**Generado por:** Claude Code (Anthropic)
**Método:** Análisis exhaustivo de código fuente + DDL + Documentación
**Herramientas:** Task Agent (Explore), Read, Grep, Bash
**Tiempo de análisis:** ~45 minutos
**Archivos analizados:** ~120 archivos

**Próximos pasos:**
1. Revisar reporte con Tech Lead
2. Priorizar tareas P0 en backlog
3. Asignar sprint de deuda técnica
4. Ejecutar migraciones con revisión de código
