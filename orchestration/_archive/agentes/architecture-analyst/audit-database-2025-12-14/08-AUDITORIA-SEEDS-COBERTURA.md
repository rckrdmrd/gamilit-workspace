# AUDITORÍA DE SEEDS - COBERTURA Y ALINEACIÓN DDL

**Fecha:** 2025-12-14
**Proyecto:** GAMILIT - Plataforma de Aprendizaje Gamificada
**Ubicación Seeds:** `apps/database/seeds/`
**Ubicación DDL:** `apps/database/ddl/schemas/`

---

## RESUMEN EJECUTIVO

### Cobertura Global

| Métrica | Valor | Estado |
|---------|-------|--------|
| **Total tablas DDL** | 125 | - |
| **Tablas con seeds** | 33 | 26.4% |
| **Tablas sin seeds** | 92 | 73.6% |
| **Seeds en PROD** | 101 archivos | ✅ |
| **Schemas cubiertos** | 8/13 | 61.5% |

### Estado por Prioridad

| Prioridad | Tablas | Seeds | Gap | Estado |
|-----------|--------|-------|-----|--------|
| **P0 - Crítico** | 15 | 8 | 7 | ⚠️ CRÍTICO |
| **P1 - Alta** | 22 | 12 | 10 | ⚠️ ATENCIÓN |
| **P2 - Media** | 18 | 13 | 5 | ⚡ MEJORABLE |
| **N/A - Transaccional** | 70 | 0 | 70 | ✅ CORRECTO |

---

## ANÁLISIS POR SCHEMA

### 1. SYSTEM_CONFIGURATION (55.6% cobertura) ✅ ACEPTABLE

**Tablas: 9 | Con seeds: 5 | Sin seeds: 4**

#### Con Seeds (5)
✅ `feature_flags` (P0) - 01-feature_flags_seeds.sql
✅ `gamification_parameters` (P0) - 02-gamification_parameters_seeds.sql
✅ `notification_settings_global` (P1) - 03-notification_settings_global.sql
✅ `rate_limits` (P1) - 04-rate_limits.sql
✅ `system_settings` (P0) - 01-system_settings.sql

#### Sin Seeds (4)
❌ `api_configuration` (P1) - Configuración de APIs externas
❌ `environment_config` (P1) - Configuración por ambiente
❌ `notification_settings` (P2) - Preferencias de notificaciones
❌ `tenant_configurations` (P2) - Configuración por tenant

**Gap Crítico:** `api_configuration` y `environment_config` son tablas de catálogo que requieren valores iniciales.

---

### 2. GAMIFICATION_SYSTEM (52.9% cobertura) ⚡ MEJORABLE

**Tablas: 17 | Con seeds: 9 | Sin seeds: 8**

#### Con Seeds (9)
✅ `achievement_categories` (P0) - 01-achievement_categories.sql
✅ `achievements` (P0) - 04-achievements.sql
✅ `comodines_inventory` (P2) - 09-comodines_inventory.sql
✅ `leaderboard_metadata` (P0) - 02-leaderboard_metadata.sql
✅ `maya_ranks` (P0) - 03-maya_ranks.sql
✅ `ml_coins_transactions` (P2) - 07-ml_coins_transactions.sql
✅ `shop_categories` (P1) - 12-shop_categories.sql
✅ `shop_items` (P1) - 13-shop_items.sql
✅ `user_achievements` (P2) - 08-user_achievements.sql
✅ `user_ranks` (P2) - 06-user_ranks.sql

#### Sin Seeds (8)
❌ `active_boosts` (N/A - Transaccional)
❌ `classroom_missions` (P2) - Misiones por aula
❌ `comodin_usage_log` (N/A - Transaccional)
❌ `comodin_usage_tracking` (N/A - Transaccional)
❌ `inventory_transactions` (N/A - Transaccional)
❌ `mission_templates` (P0) - **CRÍTICO** - Templates de misiones
❌ `notifications` (N/A - Transaccional) - ⚠️ Duplicado con notifications.notifications
❌ `user_stats` (P2) - Estadísticas iniciales de usuarios

**Gap Crítico:** `mission_templates` es P0 - sin seeds no hay misiones disponibles.

---

### 3. EDUCATIONAL_CONTENT (35.0% cobertura) ⚠️ ATENCIÓN

**Tablas: 20 | Con seeds: 7 | Sin seeds: 13**

#### Con Seeds (7)
✅ `assessment_rubrics` (P1) - 07-assessment-rubrics.sql
✅ `assignments` (P2) - 05-assignments.sql
✅ `difficulty_criteria` (P0) - 08-difficulty_criteria.sql
✅ `exercise_mechanic_mapping` (P0) - 09-exercise_mechanic_mapping.sql
✅ `exercise_validation_config` (P1) - 10-exercise_validation_config.sql
✅ `exercises` (P0) - 02-06-exercises-module[1-5].sql (23 ejercicios)
✅ `modules` (P0) - 01-modules.sql (5 módulos)

#### Sin Seeds (13)
❌ `assignment_exercises` (N/A - Transaccional)
❌ `assignment_students` (N/A - Transaccional)
❌ `assignment_submissions` (N/A - Transaccional)
❌ `classroom_modules` (P2) - Asignación módulos por aula
❌ `content_approvals` (N/A - Transaccional)
❌ `content_metadata` (P2) - Metadatos de contenido
❌ `content_tags` (P1) - **CRÍTICO** - Tags para clasificación
❌ `exercise_validation_audit` (N/A - Transaccional)
❌ `media_attachments` (N/A - Transaccional)
❌ `media_resources` (P1) - Recursos multimedia base
❌ `module_dependencies` (P0) - **CRÍTICO** - Dependencias entre módulos
❌ `taxonomies` (P0) - **CRÍTICO** - Taxonomías educativas
❌ `teacher_content` (P2) - Contenido de profesores

**Gaps Críticos:**
- `module_dependencies` (P0) - Sin esto no hay progresión validada
- `taxonomies` (P0) - Sistema de clasificación educativa
- `content_tags` (P1) - Sistema de etiquetado

---

### 4. SOCIAL_FEATURES (27.8% cobertura) ⚠️ ATENCIÓN

**Tablas: 18 | Con seeds: 5 | Sin seeds: 13**

#### Con Seeds (5)
✅ `classroom_members` (P2) - 03-classroom-members.sql
✅ `classrooms` (P1) - 02-classrooms.sql
✅ `friendships` (P2) - 04-friendships.sql
✅ `schools` (P1) - 01-schools.sql
✅ `teacher_classrooms` (P2) - (implícito en classrooms)

#### Sin Seeds (13)
❌ `assignment_classrooms` (N/A - Transaccional)
❌ `challenge_participants` (N/A - Transaccional)
❌ `challenge_results` (N/A - Transaccional)
❌ `discussion_threads` (N/A - Transaccional)
❌ `friend_requests` (N/A - Transaccional)
❌ `peer_challenges` (P2) - Desafíos entre pares
❌ `social_interactions` (N/A - Transaccional)
❌ `teacher_reports` (N/A - Transaccional)
❌ `team_challenges` (P2) - Desafíos por equipos
❌ `team_members` (N/A - Transaccional)
❌ `teams` (P2) - Equipos base
❌ `user_activities` (N/A - Transaccional)
❌ `user_follows` (N/A - Transaccional)

**Gap Notable:** `teams` (P2) - Si se usa funcionalidad de equipos, requiere datos iniciales.

---

### 5. AUTH_MANAGEMENT (20.0% cobertura) ⚠️ CRÍTICO

**Tablas: 15 | Con seeds: 3 | Sin seeds: 12**

#### Con Seeds (3)
✅ `auth_providers` (P0) - 02-auth_providers.sql
✅ `profiles` (P2) - 03-profiles.sql, 04-profiles-complete.sql
✅ `tenants` (P0) - 01-tenants.sql

#### Sin Seeds (12)
❌ `auth_attempts` (N/A - Transaccional)
❌ `email_verification_tokens` (N/A - Transaccional)
❌ `memberships` (N/A - Transaccional)
❌ `parent_accounts` (P2) - Cuentas de padres (Portal Padres fuera de alcance v2.3.x)
❌ `parent_notifications` (N/A - Transaccional)
❌ `parent_student_links` (N/A - Transaccional)
❌ `password_reset_tokens` (N/A - Transaccional)
❌ `security_events` (N/A - Transaccional)
❌ `user_preferences` (P1) - **RECOMENDADO** - Preferencias por defecto
❌ `user_roles` (P0) - **CRÍTICO** - Roles del sistema
❌ `user_sessions` (N/A - Transaccional)
❌ `user_suspensions` (N/A - Transaccional)

**Gap Crítico:** `user_roles` (P0) - Sin roles definidos, el sistema de permisos no funciona.

---

### 6. NOTIFICATIONS (16.7% cobertura) ⚠️ ATENCIÓN

**Tablas: 6 | Con seeds: 1 | Sin seeds: 5**

#### Con Seeds (1)
✅ `notification_templates` (P0) - 01-notification_templates.sql

#### Sin Seeds (5)
❌ `notification_logs` (N/A - Transaccional)
❌ `notification_preferences` (P2) - Preferencias de notificaciones
❌ `notification_queue` (N/A - Transaccional)
❌ `notifications` (N/A - Transaccional)
❌ `user_devices` (N/A - Transaccional)

**Estado:** Cobertura mínima aceptable (P0 cubierto).

---

### 7. LTI_INTEGRATION (33.3% cobertura) ⚡ MEJORABLE

**Tablas: 3 | Con seeds: 1 | Sin seeds: 2**

#### Con Seeds (1)
✅ `lti_consumers` (P1) - 01-lti_consumers.sql

#### Sin Seeds (2)
❌ `lti_grade_passback` (N/A - Transaccional)
❌ `lti_sessions` (N/A - Transaccional)

**Estado:** Funcionalidad LTI tiene datos demo adecuados.

---

### 8. CONTENT_MANAGEMENT (11.1% cobertura) ⚠️ CRÍTICO

**Tablas: 9 | Con seeds: 1 | Sin seeds: 8**

#### Con Seeds (1)
✅ `content_templates` (P1) - 01-default-templates.sql

#### Sin Seeds (8)
❌ `content_authors` (P2) - Autores de contenido
❌ `content_categories` (P1) - **CRÍTICO** - Categorías de contenido
❌ `content_versions` (N/A - Transaccional)
❌ `flagged_content` (N/A - Transaccional)
❌ `marie_curie_content` (P0) - **CRÍTICO** - Contenido biográfico principal
❌ `media_files` (P2) - Archivos multimedia base
❌ `media_metadata` (P2) - Metadatos de media
❌ `moderation_rules` (P1) - Reglas de moderación

**Gaps Críticos:**
- `marie_curie_content` (P0) - Contenido central de la plataforma
- `content_categories` (P1) - Sistema de categorización
- `moderation_rules` (P1) - Reglas de moderación de contenido

---

### 9. AUTH (100% cobertura) ✅ COMPLETO

**Tablas: 1 | Con seeds: 1 | Sin seeds: 0**

✅ `users` (P2) - 01-demo-users.sql, 02-production-users.sql

**Estado:** Totalmente cubierto.

---

### 10. AUDIT_LOGGING (0% cobertura) ✅ CORRECTO (Transaccional)

**Tablas: 7 | Con seeds: 0 | Sin seeds: 7**

Todas las tablas son transaccionales (logs, métricas, alertas).

❌ `activity_log` (N/A - Transaccional)
❌ `audit_logs` (N/A - Transaccional)
❌ `performance_metrics` (N/A - Transaccional)
❌ `system_alerts` (N/A - Transaccional)
❌ `system_logs` (N/A - Transaccional)
❌ `user_activity` (N/A - Transaccional)
❌ `user_activity_logs` (N/A - Transaccional)

**Estado:** No requiere seeds (excepto quizás datos de prueba en DEV).

---

### 11. PROGRESS_TRACKING (0% cobertura) ⚠️ ATENCIÓN

**Tablas: 17 | Con seeds: 0 | Sin seeds: 17**

Mayormente transaccionales, pero algunas requieren configuración inicial.

❌ `engagement_metrics` (N/A - Transaccional)
❌ `exercise_attempts` (N/A - Transaccional)
❌ `exercise_submissions` (N/A - Transaccional)
❌ `learning_paths` (P1) - **CRÍTICO** - Rutas de aprendizaje predefinidas
❌ `learning_sessions` (N/A - Transaccional)
❌ `manual_reviews` (N/A - Transaccional)
❌ `mastery_tracking` (N/A - Transaccional)
❌ `module_completion_tracking` (N/A - Transaccional)
❌ `module_progress` (P2) - Progreso inicial (EXISTE seed en INVENTORY pero no detectado)
❌ `progress_snapshots` (N/A - Transaccional)
❌ `scheduled_missions` (N/A - Transaccional)
❌ `skill_assessments` (P2) - Evaluaciones de habilidades base
❌ `student_intervention_alerts` (N/A - Transaccional)
❌ `teacher_notes` (N/A - Transaccional)
❌ `user_current_level` (N/A - Transaccional)
❌ `user_difficulty_progress` (N/A - Transaccional)
❌ `user_learning_paths` (N/A - Transaccional)

**Gap Crítico:** `learning_paths` (P1) - Rutas de aprendizaje predefinidas necesarias.

---

### 12. ADMIN_DASHBOARD (0% cobertura) ✅ CORRECTO (Transaccional)

**Tablas: 2 | Con seeds: 0 | Sin seeds: 2**

❌ `admin_reports` (N/A - Transaccional)
❌ `bulk_operations` (N/A - Transaccional)

**Estado:** No requiere seeds (vistas materializadas y operaciones).

---

### 13. COMMUNICATION (0% cobertura) ✅ CORRECTO (Transaccional)

**Tablas: 1 | Con seeds: 0 | Sin seeds: 1**

❌ `messages` (N/A - Transaccional)

**Estado:** No requiere seeds.

---

## TABLA RESUMEN: GAPS CRÍTICOS (P0/P1)

### PRIORIDAD 0 - BLOQUEANTE (7 gaps)

| Schema | Tabla | Impacto | Solución |
|--------|-------|---------|----------|
| **auth_management** | `user_roles` | Sistema de permisos no funcional | Seed con roles: admin, teacher, student, parent |
| **content_management** | `marie_curie_content` | Contenido biográfico faltante | Migrar contenido desde documentación |
| **educational_content** | `module_dependencies` | Progresión sin validación | Definir dependencias entre módulos |
| **educational_content** | `taxonomies` | Clasificación educativa faltante | Seed con Bloom Taxonomy + CEFR |
| **gamification_system** | `mission_templates` | No hay misiones disponibles | Crear templates de misiones |
| **system_configuration** | `feature_flags` | YA CUBIERTO ✅ | - |
| **system_configuration** | `gamification_parameters` | YA CUBIERTO ✅ | - |

### PRIORIDAD 1 - ALTA (10 gaps)

| Schema | Tabla | Impacto | Solución |
|--------|-------|---------|----------|
| **auth_management** | `user_preferences` | Preferencias por defecto faltantes | Seed con theme, language, notifications |
| **content_management** | `content_categories` | Categorización de contenido faltante | Crear categorías base |
| **content_management** | `moderation_rules` | Moderación automática deshabilitada | Definir reglas de moderación |
| **educational_content** | `content_tags` | Sistema de etiquetado faltante | Crear tags base |
| **educational_content** | `media_resources` | Recursos multimedia faltantes | Definir recursos base |
| **progress_tracking** | `learning_paths` | Rutas de aprendizaje faltantes | Crear paths predefinidos |
| **social_features** | `classrooms` | YA CUBIERTO ✅ | - |
| **social_features** | `schools` | YA CUBIERTO ✅ | - |
| **system_configuration** | `api_configuration` | APIs externas sin config | Configurar APIs (opcional) |
| **system_configuration** | `environment_config` | Config por ambiente faltante | Crear configs DEV/PROD/STAGING |

---

## SEEDS HUÉRFANOS (sin tabla DDL correspondiente)

### Análisis de Seeds sin Tabla

Después de revisar los seeds en `prod/`, los siguientes archivos **NO** tienen correspondencia con tablas DDL:

1. **gamification_system/05-user_stats.sql**
   - ⚠️ POSIBLE INCONSISTENCIA: Tabla `user_stats` existe en DDL
   - Verificar si seed está insertando correctamente

2. **progress_tracking/01-module_progress.sql**
   - ⚠️ POSIBLE INCONSISTENCIA: Tabla `module_progress` existe en DDL
   - Verificar si seed está insertando correctamente

**Nota:** La mayoría de seeds están correctamente alineados. Los 2 casos anteriores requieren verificación manual para determinar si hay un problema de nomenclatura o sintaxis SQL.

---

## MATRIZ DE COBERTURA POR SCHEMA

```
┌──────────────────────────┬───────┬──────┬─────────┬──────────┐
│ Schema                   │ Total │ Seeds│ Coverage│ Estado   │
├──────────────────────────┼───────┼──────┼─────────┼──────────┤
│ auth                     │   1   │   1  │  100.0% │ ✅ FULL  │
│ system_configuration     │   9   │   5  │   55.6% │ ✅ GOOD  │
│ gamification_system      │  17   │   9  │   52.9% │ ⚡ OK    │
│ educational_content      │  20   │   7  │   35.0% │ ⚠️ LOW   │
│ lti_integration          │   3   │   1  │   33.3% │ ⚡ OK    │
│ social_features          │  18   │   5  │   27.8% │ ⚠️ LOW   │
│ auth_management          │  15   │   3  │   20.0% │ ⚠️ LOW   │
│ notifications            │   6   │   1  │   16.7% │ ⚠️ LOW   │
│ content_management       │   9   │   1  │   11.1% │ ❌ CRIT  │
│ progress_tracking        │  17   │   0  │    0.0% │ ⚠️ LOW   │
│ admin_dashboard          │   2   │   0  │    0.0% │ ✅ OK*   │
│ audit_logging            │   7   │   0  │    0.0% │ ✅ OK*   │
│ communication            │   1   │   0  │    0.0% │ ✅ OK*   │
├──────────────────────────┼───────┼──────┼─────────┼──────────┤
│ TOTAL                    │  125  │  33  │   26.4% │ ⚠️ LOW   │
└──────────────────────────┴───────┴──────┴─────────┴──────────┘
```

*OK* = Tablas transaccionales que no requieren seeds

---

## RECOMENDACIONES

### FASE 1 - CRÍTICO (Semana 1) ⚠️ BLOQUEANTE

**Impacto:** Sistema no funciona correctamente sin estos seeds

1. **`auth_management.user_roles`** (P0)
   - Crear: `auth_management/04-user_roles.sql`
   - Roles: `admin`, `teacher`, `student`, `parent`
   - Permisos por rol definidos

2. **`content_management.marie_curie_content`** (P0)
   - Crear: `content_management/02-marie_curie_content.sql`
   - Contenido biográfico base (juventud, logros, legacy)
   - Integrar con exercises

3. **`educational_content.module_dependencies`** (P0)
   - Crear: `educational_content/11-module_dependencies.sql`
   - Definir: MOD-01 → MOD-02 → MOD-03 → MOD-04 → MOD-05
   - Requisitos de completitud

4. **`educational_content.taxonomies`** (P0)
   - Crear: `educational_content/12-taxonomies.sql`
   - Bloom Taxonomy (6 niveles)
   - CEFR (A1-C2)
   - Mapeo a módulos

5. **`gamification_system.mission_templates`** (P0)
   - Crear: `gamification_system/10-mission_templates.sql`
   - 5-10 templates base
   - Misiones diarias, semanales, mensuales

### FASE 2 - ALTA PRIORIDAD (Semana 2-3) ⚡

**Impacto:** Funcionalidades importantes limitadas

6. **`auth_management.user_preferences`** (P1)
   - Crear: `auth_management/08-user_preferences_defaults.sql`
   - Defaults: theme=light, language=es, notifications=enabled

7. **`content_management.content_categories`** (P1)
   - Crear: `content_management/03-content_categories.sql`
   - Categorías: Biografía, Ciencia, Historia, Experimentos

8. **`content_management.moderation_rules`** (P1)
   - Crear: `content_management/04-moderation_rules.sql`
   - Reglas de keywords, patterns, auto-flag

9. **`educational_content.content_tags`** (P1)
   - Crear: `educational_content/13-content_tags.sql`
   - Tags: #marie-curie, #radiactividad, #nobel, etc.

10. **`educational_content.media_resources`** (P1)
    - Crear: `educational_content/14-media_resources.sql`
    - URLs de imágenes, videos, audios base

11. **`progress_tracking.learning_paths`** (P1)
    - Crear: `progress_tracking/02-learning_paths.sql`
    - Rutas predefinidas: Básico → Intermedio → Avanzado

12. **`system_configuration.environment_config`** (P1)
    - Crear: `system_configuration/05-environment_config.sql`
    - Configs: DEV, STAGING, PROD

### FASE 3 - MEJORAS (Semana 4) ⚡

**Impacto:** Experiencia de usuario mejorada

13. **`gamification_system.user_stats`** (P2)
    - Verificar seed existente `05-user_stats.sql`
    - Asegurar inicialización correcta

14. **`social_features.teams`** (P2)
    - Crear: `social_features/05-teams.sql`
    - Equipos demo si se usa funcionalidad

15. **`progress_tracking.module_progress`** (P2)
    - Verificar seed existente `01-module_progress.sql`
    - Datos demo de progreso

### FASE 4 - OPCIONAL (Backlog) 📋

16. **`system_configuration.api_configuration`** (P1)
    - APIs externas: OpenAI, Anthropic, etc.
    - Solo si se usan integraciones

17. **`gamification_system.classroom_missions`** (P2)
    - Misiones específicas por aula

18. **`notifications.notification_preferences`** (P2)
    - Preferencias granulares de notificaciones

---

## PRÓXIMOS PASOS

### Acción Inmediata

1. **Crear seeds P0** (CRÍTICO - Fase 1)
   - Estimación: 3-5 días
   - Responsable: Database Team
   - Validación: QA + Product Owner

2. **Validar seeds existentes** (VERIFICACIÓN)
   - `gamification_system/05-user_stats.sql`
   - `progress_tracking/01-module_progress.sql`
   - Asegurar que INSERT INTO apunta a tablas correctas

3. **Actualizar SEEDS_INVENTORY.yml**
   - Incrementar versión a `2.2.0`
   - Documentar nuevos seeds P0/P1
   - Actualizar changelog

4. **Probar en DEV**
   - `./create-database.sh --env dev`
   - Verificar carga completa
   - Validar relaciones FK

5. **Migrar a STAGING**
   - Validar con datos reales
   - Performance tests
   - Aprobación PO

### Criterios de Éxito

✅ Cobertura P0: 100% (todos los seeds críticos creados)
✅ Cobertura P1: 80%+ (mayoría de seeds alta prioridad)
✅ Cobertura Global: 40%+ (mejora de 26.4% → 40%+)
✅ Seeds huérfanos: 0 (todos los seeds tienen tabla DDL)
✅ Tests pasando: 100% (validación automatizada)

---

## DOCUMENTOS RELACIONADOS

- **SEEDS_INVENTORY.yml** - `/orchestration/inventarios/SEEDS_INVENTORY.yml`
- **DDL Schemas** - `apps/database/ddl/schemas/`
- **Seeds PROD** - `apps/database/seeds/prod/`
- **Seeds DEV** - `apps/database/seeds/dev/`

---

## CHANGELOG

**2025-12-14 - v1.0.0 - Auditoría Inicial**
- Análisis completo de 125 tablas DDL
- Identificación de 33 seeds existentes (26.4% cobertura)
- Clasificación P0/P1/P2 de gaps
- Identificación de 7 gaps críticos (P0)
- Plan de acción en 4 fases

---

**Generado por:** Architecture Analyst Agent
**Fecha:** 2025-12-14
**Versión:** 1.0.0
