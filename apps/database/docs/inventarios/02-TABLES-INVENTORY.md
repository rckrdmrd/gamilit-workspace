# Inventario de Tablas - Base de Datos GAMILIT

**Fecha generación:** 2025-11-07
**Versión:** 1.0
**Total tablas:** 64
**Método:** Análisis de archivos DDL

---

## 📑 Índice por Schema

| Schema | Tablas | % del Total |
|--------|--------|-------------|
| [auth_management](#auth_management-12-tablas) | 12 | 19% |
| [gamification_system](#gamification_system-12-tablas) | 12 | 19% |
| [public](#public-9-tablas) | 9 | 14% ⚠️ |
| [social_features](#social_features-7-tablas) | 7 | 11% |
| [audit_logging](#audit_logging-6-tablas) | 6 | 9% |
| [content_management](#content_management-5-tablas) | 5 | 8% |
| [progress_tracking](#progress_tracking-5-tablas) | 5 | 8% |
| [educational_content](#educational_content-4-tablas) | 4 | 6% |
| [system_configuration](#system_configuration-3-tablas) | 3 | 5% |
| [auth](#auth-1-tabla) | 1 | 2% |
| **TOTAL** | **64** | **100%** |

---

## 🔍 Detalle de Tablas por Schema

### auth (1 tabla)

**Ubicación:** `apps/database/ddl/schemas/auth/tables/`

| # | Tabla | Propósito | Estado Doc |
|---|-------|-----------|------------|
| 1 | `users` | Tabla base de usuarios | ✅ |

**Contexto:**
- Tabla fundamental del sistema
- Extendida por `auth_management.profiles`
- Referenciada por todos los schemas

**Referencias SIMCO:**
- Seeds: `apps/database/seeds/auth/`
- Backend: `apps/backend/src/modules/auth/entities/user.entity.ts`

---

### auth_management (12 tablas)

**Ubicación:** `apps/database/ddl/schemas/auth_management/tables/`

| # | Tabla | Propósito | Estado Doc |
|---|-------|-----------|------------|
| 1 | `tenants` | Multi-tenancy (escuelas, instituciones) | ✅ |
| 2 | `auth_attempts` | Registro de intentos de autenticación | ✅ |
| 3 | `profiles` | Perfiles extendidos de usuarios | ✅ |
| 4 | `roles` | Roles del sistema (admin, teacher, student) | ✅ |
| 5 | `auth_providers` | Proveedores OAuth (Google, Facebook) | ✅ |
| 6 | `email_verification_tokens` | Tokens de verificación de email | ✅ |
| 7 | `password_reset_tokens` | Tokens de reset de contraseña | ✅ |
| 8 | `security_events` | Eventos de seguridad | ✅ |
| 9 | `user_preferences` | Preferencias de usuario | ✅ |
| 10 | `memberships` | Membresías usuario-tenant | ✅ |
| 11 | `user_sessions` | Sesiones activas de usuarios | ✅ |
| 12 | `user_suspensions` | Suspensiones de cuentas | ✅ |

**Relaciones Clave:**
- `tenants` → Raíz del multi-tenancy
- `profiles` → Extiende `auth.users`
- `memberships` → Liga users ↔ tenants
- `roles` → Define permisos (admin, teacher, student)

**Referencias SIMCO:**
- Docs: `docs/03-desarrollo/base-de-datos/schemas/auth_management/`
- Backend: `apps/backend/src/modules/auth/`, `apps/backend/src/modules/users/`
- Seeds: `apps/database/seeds/auth_management/`

---

### gamification_system (12 tablas)

**Ubicación:** `apps/database/ddl/schemas/gamification_system/tables/`

| # | Tabla | Propósito | Estado Doc |
|---|-------|-----------|------------|
| 1 | `user_stats` | Estadísticas de usuario (puntos, nivel, racha) | ✅ |
| 2 | `user_ranks` | Rangos maya (NACOM, BATAB, HOLCATTE, GUERRERO, MERCENARIO) | ✅ |
| 3 | `achievements` | Catálogo de logros | ✅ |
| 4 | `user_achievements` | Logros desbloqueados por usuario | ✅ |
| 5 | `ml_coins_transactions` | Transacciones de monedas ML (Maya Learning) | ✅ |
| 6 | `missions` | Misiones diarias/semanales | ✅ |
| 7 | `comodines_inventory` | Inventario de comodines (power-ups) | ✅ |
| 8 | `notifications` | Notificaciones de gamificación | ✅ ⚠️ |
| 9 | `leaderboard_metadata` | Metadata de leaderboards | ✅ |
| 10 | `achievement_categories` | Categorías de logros | ✅ |
| 11 | `active_boosts` | Boosts activos del usuario | ✅ |
| 12 | `inventory_transactions` | Historial de transacciones de inventario | ✅ |

**⚠️ Posible Duplicación:**
- `notifications` existe en **gamification_system** Y en **public**
- **Acción requerida:** Verificar si son tablas diferentes o duplicadas

**Sistema de Rangos Maya:**
1. **NACOM** (Nivel 1) - Principiante
2. **BATAB** (Nivel 2) - Intermedio
3. **HOLCATTE** (Nivel 3) - Avanzado
4. **GUERRERO** (Nivel 4) - Experto
5. **MERCENARIO** (Nivel 5) - Maestro

**Referencias SIMCO:**
- Docs: `docs/03-desarrollo/base-de-datos/schemas/gamification_system/`
- Backend: `apps/backend/src/modules/gamification/`
- Frontend: `apps/frontend/src/features/gamification/`
- Seeds: `apps/database/seeds/gamification_system/`

---

### public (9 tablas) ⚠️

**Ubicación:** `apps/database/ddl/schemas/public/tables/`
**Estado:** ⚠️ **REQUIERE ANÁLISIS CRÍTICO**

| # | Tabla | Propósito Estimado | Estado Doc |
|---|-------|-------------------|------------|
| 1 | `assignments` | Asignaciones de ejercicios a clases | ⚠️ No doc |
| 2 | `assignment_classrooms` | Relación assignments ↔ classrooms | ⚠️ No doc |
| 3 | `assignment_exercises` | Relación assignments ↔ exercises | ⚠️ No doc |
| 4 | `assignment_students` | Relación assignments ↔ students | ⚠️ No doc |
| 5 | `assignment_submissions` | Entregas de estudiantes | ⚠️ No doc |
| 6 | `classrooms` | Clases/Aulas | ⚠️ No doc ⚠️ |
| 7 | `classroom_students` | Estudiantes en clases | ⚠️ No doc ⚠️ |
| 8 | `notifications` | Notificaciones generales | ⚠️ No doc ⚠️ |
| 9 | `teacher_notes` | Notas de profesores | ⚠️ No doc |

### ⚠️ ALERTA CRÍTICA: Duplicación de Tablas

**Problema 1: classrooms duplicado**
- `public.classrooms` vs `social_features.classrooms`
- `public.classroom_students` vs `social_features.classroom_members`

**Problema 2: notifications duplicado**
- `public.notifications` vs `gamification_system.notifications`

**Problema 3: Arquitectura inconsistente**
- Las tablas de `assignments` pertenecen funcionalmente a `educational_content` o `progress_tracking`
- Estar en `public` rompe la arquitectura modular

### 🎯 Acciones Requeridas URGENTES

1. **Análisis de Duplicación:**
   - [ ] Comparar esquemas de `public.classrooms` vs `social_features.classrooms`
   - [ ] Comparar esquemas de `public.notifications` vs `gamification_system.notifications`
   - [ ] Determinar cuál es la tabla "correcta" y cuál es legacy/duplicada

2. **Plan de Migración/Consolidación:**
   - [ ] Si `public` es legacy: Migrar datos a schemas correctos
   - [ ] Si `public` es funcional: Renombrar y mover a schema apropiado
   - [ ] Eliminar duplicados después de consolidación

3. **Reasignación de Tablas:**
   - `assignments` → Debería estar en `educational_content` o `progress_tracking`
   - `classrooms` → Consolidar en `social_features` (ya existe)
   - `notifications` → Consolidar en `gamification_system` (ya existe)
   - `teacher_notes` → Podría ir en `educational_content` o nuevo schema `teacher_tools`

**Referencias SIMCO:**
- ⚠️ Requiere documentación urgente en `docs/03-desarrollo/base-de-datos/schemas/public/`
- ⚠️ Requiere análisis de arquitectura

---

### social_features (7 tablas)

**Ubicación:** `apps/database/ddl/schemas/social_features/tables/`

| # | Tabla | Propósito | Estado Doc |
|---|-------|-----------|------------|
| 1 | `friendships` | Relaciones de amistad entre usuarios | ✅ |
| 2 | `schools` | Escuelas | ✅ |
| 3 | `classrooms` | Aulas/Clases | ✅ ⚠️ |
| 4 | `classroom_members` | Miembros de clases | ✅ ⚠️ |
| 5 | `teams` | Equipos de estudiantes | ✅ |
| 6 | `team_members` | Miembros de equipos | ✅ |
| 7 | `team_challenges` | Desafíos entre equipos | ✅ |

**⚠️ Conflicto con public:**
- `social_features.classrooms` vs `public.classrooms`
- `social_features.classroom_members` vs `public.classroom_students`
- **Acción:** Determinar cuál es la tabla correcta

**Referencias SIMCO:**
- Docs: `docs/03-desarrollo/base-de-datos/schemas/social_features/`
- Backend: `apps/backend/src/modules/social/`
- Frontend: `apps/frontend/src/features/social/`

---

### audit_logging (6 tablas)

**Ubicación:** `apps/database/ddl/schemas/audit_logging/tables/`

| # | Tabla | Propósito | Estado Doc |
|---|-------|-----------|------------|
| 1 | `audit_logs` | Logs de auditoría general | ✅ |
| 2 | `performance_metrics` | Métricas de performance del sistema | ✅ |
| 3 | `system_alerts` | Alertas del sistema | ✅ |
| 4 | `system_logs` | Logs del sistema | ✅ |
| 5 | `user_activity_logs` | Logs de actividad de usuarios | ✅ |
| 6 | `user_activity` | Actividad reciente de usuarios | ✅ |

**Patrón:**
- Todas las tablas de auditoría son append-only
- Requieren particionamiento por fecha para escalabilidad
- RLS: Solo admins pueden leer

**Referencias SIMCO:**
- Docs: `docs/03-desarrollo/base-de-datos/schemas/audit_logging/`
- Backend: `apps/backend/src/modules/audit/`

---

### content_management (5 tablas)

**Ubicación:** `apps/database/ddl/schemas/content_management/tables/`

| # | Tabla | Propósito | Estado Doc |
|---|-------|-----------|------------|
| 1 | `content_templates` | Plantillas de contenido | ✅ |
| 2 | `marie_curie_content` | Contenido de Marie Curie (personaje guía) | ✅ |
| 3 | `media_files` | Archivos multimedia | ✅ |
| 4 | `content_versions` | Versionado de contenido | ✅ |
| 5 | `flagged_content` | Contenido reportado/moderado | ✅ |

**Integración con storage:**
- `media_files` se integra con schema `storage`
- Files almacenados en MinIO/S3
- BD solo guarda metadata

**Referencias SIMCO:**
- Docs: `docs/03-desarrollo/base-de-datos/schemas/content_management/`
- Backend: `apps/backend/src/modules/content/`
- Storage: Schema `storage`, MinIO/S3

---

### progress_tracking (5 tablas)

**Ubicación:** `apps/database/ddl/schemas/progress_tracking/tables/`

| # | Tabla | Propósito | Estado Doc |
|---|-------|-----------|------------|
| 1 | `module_progress` | Progreso por módulo | ✅ |
| 2 | `learning_sessions` | Sesiones de aprendizaje | ✅ |
| 3 | `exercise_attempts` | Intentos de ejercicios | ✅ |
| 4 | `exercise_submissions` | Entregas de ejercicios | ✅ |
| 5 | `scheduled_missions` | Misiones programadas | ✅ |

**Tabla de alto tráfico:**
- `exercise_attempts` y `learning_sessions` son las más escritas
- Requiere indexes optimizados por usuario y fecha
- Candidatas para particionamiento

**Referencias SIMCO:**
- Docs: `docs/03-desarrollo/base-de-datos/schemas/progress_tracking/`
- Backend: `apps/backend/src/modules/progress/`
- Frontend: `apps/frontend/src/features/student-dashboard/`

---

### educational_content (4 tablas)

**Ubicación:** `apps/database/ddl/schemas/educational_content/tables/`

| # | Tabla | Propósito | Estado Doc |
|---|-------|-----------|------------|
| 1 | `modules` | Módulos educativos | ✅ |
| 2 | `exercises` | Ejercicios/Actividades | ✅ |
| 3 | `assessment_rubrics` | Rúbricas de evaluación | ✅ |
| 4 | `media_resources` | Recursos multimedia educativos | ✅ |

**Nota:**
- Originalmente se esperaban tablas de `subjects`, `lessons`, `quizzes`
- Parece que la estructura se simplificó a `modules` y `exercises`
- **Acción:** Verificar si quizzes están en otra tabla o integrados en exercises

**Referencias SIMCO:**
- Docs: `docs/03-desarrollo/base-de-datos/schemas/educational_content/`
- Backend: `apps/backend/src/modules/subjects/`, `apps/backend/src/modules/exercises/`
- Frontend: `apps/frontend/src/features/learning/`

---

### system_configuration (3 tablas)

**Ubicación:** `apps/database/ddl/schemas/system_configuration/tables/`

| # | Tabla | Propósito | Estado Doc |
|---|-------|-----------|------------|
| 1 | `system_settings` | Configuración global del sistema | ✅ |
| 2 | `feature_flags` | Feature flags (A/B testing, rollout) | ✅ |
| 3 | `notification_settings` | Configuración de notificaciones | ✅ |

**Patrón Key-Value:**
- Tablas diseñadas con patrón key-value para flexibilidad
- RLS: Solo role `admin` puede modificar
- Backend cachea estos valores

**Referencias SIMCO:**
- Docs: `docs/03-desarrollo/base-de-datos/schemas/system_configuration/`
- Backend: `apps/backend/src/modules/config/`

---

## 📊 Análisis Estadístico

### Distribución por Schema

```
auth_management      ████████████████████ 12 (19%)
gamification_system  ████████████████████ 12 (19%)
public              ████████████████ 9 (14%) ⚠️
social_features     ██████████████ 7 (11%)
audit_logging       ████████████ 6 (9%)
content_management  ██████████ 5 (8%)
progress_tracking   ██████████ 5 (8%)
educational_content ████████ 4 (6%)
system_config       ██████ 3 (5%)
auth               ██ 1 (2%)
```

### Por Tipo de Funcionalidad

| Tipo | Tablas | Schemas |
|------|--------|---------|
| **Core/Auth** | 13 | auth, auth_management |
| **Features** | 33 | gamification, educational, progress, content, social |
| **System** | 9 | system_config, audit |
| **Legacy/Unclear** | 9 | public ⚠️ |

### Tablas de Alto Tráfico (Writes)

1. `progress_tracking.exercise_attempts` - Alta escritura
2. `progress_tracking.learning_sessions` - Alta escritura
3. `gamification_system.ml_coins_transactions` - Media-Alta escritura
4. `audit_logging.user_activity_logs` - Alta escritura
5. `auth_management.user_sessions` - Media escritura

**Recomendación:** Considerar particionamiento por fecha para estas tablas.

---

## 🚨 Discrepancias y Problemas Identificados

### 1. Duplicación de Tablas (CRÍTICO)

| Tabla | Schema 1 | Schema 2 | Acción |
|-------|----------|----------|--------|
| `classrooms` | social_features | public | Consolidar |
| `classroom_members/students` | social_features | public | Consolidar |
| `notifications` | gamification_system | public | Consolidar |

### 2. Tablas en Schema Incorrecto

| Tabla | Schema Actual | Schema Sugerido | Razón |
|-------|---------------|-----------------|-------|
| `assignments` | public | educational_content | Funcionalidad educativa |
| `assignment_*` (5 tablas) | public | educational_content | Funcionalidad educativa |
| `teacher_notes` | public | educational_content | Funcionalidad educativa |

### 3. Conteo de Tablas Documentadas

**Documentado originalmente:** 48 tablas
**Real:** 64 tablas
**Diferencia:** +16 tablas

**Las 16+ tablas no documentadas probablemente son:**
1. Las 9 tablas de `public` (todas sin documentar)
2. Posibles tablas nuevas en otros schemas

### 4. Schema public - Análisis Requerido

**Total de tablas en public:** 9 tablas (14% del total)

**Estado:** Todas sin documentar

**Posibles escenarios:**
1. **Legacy de migración:** Tablas del sistema anterior no migradas
2. **Desarrollo temporal:** Tablas creadas durante desarrollo
3. **Funcionalidad activa:** Sistema de assignments que debería moverse

**Recomendación:**
- **Investigar uso actual:** Consultar backend para ver si hay EntityORMentities usando estas tablas
- **Si activo:** Migrar a schemas correctos
- **Si legacy:** Crear plan de deprecación
- **Si duplicado:** Consolidar con tablas existentes

---

## 🎯 Plan de Acción

### Fase 2A: Análisis de Duplicación (Urgente)

- [ ] **Comparar esquemas:**
  ```sql
  -- Comparar public.classrooms vs social_features.classrooms
  \d public.classrooms
  \d social_features.classrooms

  -- Comparar public.notifications vs gamification_system.notifications
  \d public.notifications
  \d gamification_system.notifications
  ```

- [ ] **Verificar uso en backend:**
  ```bash
  # Buscar referencias a public.classrooms
  grep -r "public.classrooms" apps/backend/
  grep -r "social_features.classrooms" apps/backend/
  ```

- [ ] **Contar registros:**
  ```sql
  SELECT 'public.classrooms' as tabla, count(*) FROM public.classrooms
  UNION ALL
  SELECT 'social_features.classrooms', count(*) FROM social_features.classrooms;
  ```

### Fase 2B: Documentar Tablas Faltantes

- [ ] Documentar las 9 tablas de `public`
- [ ] Identificar cualquier otra tabla no documentada
- [ ] Crear diagramas ERD completos

### Fase 2C: Plan de Consolidación

Una vez identificadas las duplicaciones:

1. **Determinar tabla "correcta"** (la más usada, mejor diseño)
2. **Migrar datos** de tabla incorrecta a correcta
3. **Actualizar referencias** en backend
4. **Deprecar tabla antigua** (no eliminar inmediatamente)
5. **Validar en QA/staging**
6. **Eliminar tabla deprecated** después de período de gracia

---

## 📎 Referencias SIMCO

**Este documento es parte del sistema SIMCO (Sistema Indexado Modular por Contexto)**

### Referencias Cruzadas
- **Inventario anterior:** `01-SCHEMAS-INVENTORY.md`
- **Siguiente inventario:** `03-ENUMS-INVENTORY.md`
- **Plan maestro:** `apps/database/PLAN-ACTUALIZACION-DOCUMENTACION.md`
- **Documentación schemas:** `docs/03-desarrollo/base-de-datos/schemas/`

### Scripts Relacionados
- **Script de inventario:** `apps/database/scripts/inventory/list-tables.sh`
- **DDL Source:** `apps/database/ddl/schemas/*/tables/*.sql`
- **Seeds:** `apps/database/seeds/*/`

---

**Generado por:** Sistema de inventario automatizado SIMCO
**Método:** Análisis de estructura DDL + scripts bash
**Estado:** ⚠️ Requiere validación de duplicaciones y consolidación de public schema
**Próxima acción:** Análisis de duplicación de tablas + inventario de ENUMs
