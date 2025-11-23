# PLAN DE CORRECCIÓN: DIRECTIVAS DESALINEADAS

**Fecha:** 2025-11-23
**Agente:** Database-Agent
**Tarea:** Reescribir directivas para alinearlas con el proyecto GAMILIT
**Prioridad:** 🔴 P0 - CRÍTICA
**Dependencias:** Análisis de desalineación completado

---

## 🎯 OBJETIVO

Reescribir completamente las directivas **DIRECTIVA-DISENO-BASE-DATOS.md** y **ESTANDARES-NOMENCLATURA.md** para que:

1. ✅ Describan el proyecto **GAMILIT** (NO "Sistema Administración de Obra e INFONAVIT")
2. ✅ Usen ejemplos reales del código implementado
3. ✅ Mantengan los principios generales que SÍ aplican
4. ✅ Sirvan como guía útil para Database-Agent y desarrolladores

---

## 📋 TAREAS A REALIZAR

### TAREA 1: Reescribir DIRECTIVA-DISENO-BASE-DATOS.md

**Archivo:** `orchestration/directivas/DIRECTIVA-DISENO-BASE-DATOS.md`

**Estado actual:** ❌ TOTALMENTE DESALINEADA
**Estado objetivo:** ✅ ALINEADA con GAMILIT

#### Cambios a realizar:

1. **Metadatos del documento** (líneas 1-8)
   - ❌ Eliminar: "MVP Sistema Administración de Obra e INFONAVIT"
   - ✅ Reemplazar con: "GAMILIT - Plataforma Educativa Gamificada"
   - ❌ Eliminar: "PostgreSQL 15+ con PostGIS"
   - ✅ Reemplazar con: "PostgreSQL 15+ con Supabase (Auth + Storage)"

2. **Sección "Organización de Schemas"** (líneas 299-313)
   - ❌ Eliminar schemas incorrectos:
     - `project_management`
     - `financial_management`
     - `purchasing_management`
     - `construction_management`
     - `quality_management`
     - `infonavit_management`
   - ✅ Reemplazar con schemas reales de GAMILIT:
     - `educational_content` - Módulos, ejercicios, asignaciones
     - `gamification_system` - Achievements, badges, ML coins, rangos Maya
     - `progress_tracking` - Progreso estudiantil, streaks, metas
     - `social_features` - Aulas, equipos, escuelas
     - `content_management` - Gestión de contenido educativo
     - `lti_integration` - Integración con LMS externos
     - `notifications` - Sistema de notificaciones multi-canal
     - `admin_dashboard` - Vistas analíticas y dashboard
     - `audit_logging` - Auditoría de acciones
     - `system_configuration` - Configuración global
     - `auth_management` - Autenticación y usuarios
     - `auth` - Schema de Supabase Auth
     - `storage` - Schema de Supabase Storage
     - `gamilit` - Utilidades y funciones compartidas

3. **Ejemplos de código SQL** (TODO el documento)
   - ❌ Eliminar TODOS los ejemplos con:
     - `projects`, `developments`, `phases`, `units`
     - `budgets`, `budget_items`
     - `contracts`, `subcontracts`
     - `suppliers`, `purchase_orders`
     - `materials`, `warehouses`
   - ✅ Reemplazar con ejemplos reales de GAMILIT:
     - `modules`, `exercises`, `assignments`, `submissions`
     - `achievements`, `user_achievements`, `achievement_categories`
     - `student_progress`, `module_progress`, `exercise_attempts`
     - `classrooms`, `teams`, `schools`
     - `ml_coins_transactions`, `comodines_inventory`

4. **Sección PostGIS** (líneas 609-676)
   - ❌ **ELIMINAR COMPLETAMENTE** la sección de PostGIS
   - Razón: GAMILIT NO usa geolocalización
   - GAMILIT NO tiene `coordinates GEOGRAPHY(POINT, 4326)`

5. **Ejemplos de ENUMs**
   - ❌ Eliminar ejemplos irrelevantes:
     - `project_status`
     - `contract_status`
     - `payment_status`
   - ✅ Agregar ejemplos reales de GAMILIT:
     - `gamilit_role` ('student', 'admin_teacher', 'super_admin')
     - `exercise_type` (22 tipos de ejercicios)
     - `achievement_type` ('badge', 'trophy', 'certificate')
     - `maya_rank` (rangos mayas de 1-20)
     - `submission_status` ('pending', 'graded', 'returned')
     - `difficulty_level` ('beginner', 'intermediate', 'advanced', 'expert')

6. **Ejemplos de Foreign Keys**
   - ❌ Eliminar: `fk_developments_to_projects`, `fk_budget_items_to_budgets`
   - ✅ Agregar: `fk_exercises_to_modules`, `fk_submissions_to_assignments`, `fk_user_achievements_to_users`

7. **Ejemplos de funciones y triggers**
   - ✅ Mantener ejemplos genéricos de `update_updated_at_column()`
   - ✅ Agregar ejemplos específicos de GAMILIT:
     - `calculate_student_xp(user_id UUID)`
     - `award_achievement(user_id UUID, achievement_id UUID)`
     - `validate_exercise_answer(submission JSONB, correct_answer JSONB)`
     - `update_leaderboard_after_submission()`

---

### TAREA 2: Reescribir ESTANDARES-NOMENCLATURA.md

**Archivo:** `orchestration/directivas/ESTANDARES-NOMENCLATURA.md`

**Estado actual:** ❌ TOTALMENTE DESALINEADA
**Estado objetivo:** ✅ ALINEADA con GAMILIT

#### Cambios a realizar:

1. **Metadatos del documento** (líneas 1-6)
   - ❌ Eliminar: "MVP Sistema Administración de Obra e INFONAVIT"
   - ✅ Reemplazar con: "GAMILIT - Plataforma Educativa Gamificada"

2. **Sección "1.1. Schemas"** (líneas 73-109)
   - ❌ Eliminar todos los ejemplos incorrectos de schemas
   - ✅ Reemplazar con schemas reales (listados arriba)

3. **Sección "1.2. Tablas"** (líneas 111-166)
   - ❌ Eliminar ejemplos: `projects`, `developments`, `budgets`, `contracts`, `suppliers`
   - ✅ Reemplazar con:
     - `modules`, `exercises`, `assignments`, `submissions`
     - `achievements`, `comodines`, `leaderboards`
     - `student_progress`, `exercise_attempts`, `learning_streaks`
     - `classrooms`, `teams`, `schools`

4. **Sección "1.3. Columnas"** (líneas 168-234)
   - ❌ Eliminar ejemplos específicos de construcción:
     - `project_code`, `contract_code`, `invoice_code`
     - `project_status`, `contract_status`, `payment_status`
     - `total_budget`, `unit_price`
   - ✅ Reemplazar con ejemplos de GAMILIT:
     - `module_code`, `exercise_code`, `assignment_code`
     - `exercise_type`, `submission_status`, `achievement_type`
     - `total_xp`, `ml_coins_earned`, `difficulty_multiplier`

5. **Sección "1.6. Functions"** (líneas 364-384)
   - ❌ Eliminar: `calculate_budget_total()`, `update_contract_status()`
   - ✅ Reemplazar con:
     - `calculate_student_xp()`, `validate_exercise_answer()`
     - `award_achievement()`, `update_maya_rank()`

6. **Sección "1.8. Triggers"** (líneas 403-420)
   - ❌ Eliminar: `trg_projects_before_update`, `trg_contracts_after_insert`
   - ✅ Reemplazar con:
     - `trg_submissions_after_insert_update_progress`
     - `trg_exercise_attempts_update_streak`
     - `trg_user_achievements_award_ml_coins`

7. **Sección "2. BACKEND (Node.js + TypeScript + TypeORM)"** (líneas 442-850)
   - ❌ Eliminar TODOS los ejemplos con:
     - `ProjectEntity`, `BudgetItemEntity`, `ContractEntity`
     - `ProjectService`, `UserService`, `BudgetItemService`
     - `ProjectController`, `BudgetItemController`
     - `CreateProjectDto`, `UpdateProjectDto`
   - ✅ Reemplazar con ejemplos reales de GAMILIT:
     - `ModuleEntity`, `ExerciseEntity`, `SubmissionEntity`, `AchievementEntity`
     - `ModuleService`, `ExerciseService`, `StudentProgressService`
     - `ModuleController`, `ExerciseController`, `GamificationController`
     - `CreateModuleDto`, `CreateExerciseDto`, `SubmitAnswerDto`

8. **Sección "3. FRONTEND (React + TypeScript)"** (líneas 924-1283)
   - ❌ Eliminar ejemplos:
     - `ProjectCard`, `ProjectsPage`, `BudgetItemList`
     - `useProjects`, `projectService`, `useProjectStore`
   - ✅ Reemplazar con:
     - `ModuleCard`, `ExercisePage`, `LeaderboardList`, `AchievementBadge`
     - `useModules`, `useStudentProgress`, `useAchievements`
     - `moduleService`, `gamificationService`, `progressService`
     - `useModuleStore`, `useGamificationStore`, `useProgressStore`

9. **Sección "1.9. Sequences"** (líneas 422-438)
   - ❌ Eliminar: `seq_contracts_number`, `seq_purchase_orders_year`
   - ✅ Reemplazar con:
     - `seq_assignment_number`
     - `seq_achievement_order`

---

## 🔧 ESTRATEGIA DE IMPLEMENTACIÓN

### Opción A: Reescritura Completa (RECOMENDADA)

**Ventajas:**
- ✅ Documento limpio y consistente
- ✅ Sin "restos" del proyecto anterior
- ✅ Oportunidad para mejorar estructura

**Desventajas:**
- ⚠️ Requiere más tiempo
- ⚠️ Mayor riesgo de olvidar principios importantes

**Pasos:**
1. Crear backup de archivos originales (mover a `_deprecated/`)
2. Crear nueva versión desde cero usando estructura original
3. Copiar SOLO principios generales aplicables
4. Reemplazar TODOS los ejemplos con ejemplos de GAMILIT
5. Agregar secciones específicas de GAMILIT (si necesario)
6. Validar que todos los ejemplos existen en el código real

---

### Opción B: Reescritura Incremental

**Ventajas:**
- ✅ Menor riesgo de perder principios importantes
- ✅ Más rápido

**Desventajas:**
- ⚠️ Puede quedar inconsistente
- ⚠️ Riesgo de dejar ejemplos incorrectos

**Pasos:**
1. Hacer backup de archivos originales
2. Buscar y reemplazar todos los términos incorrectos
3. Reemplazar ejemplos uno por uno
4. Revisar sección por sección

---

**DECISIÓN:** Usar **Opción A (Reescritura Completa)**

**Razón:** La desalineación es tan grande que es más eficiente reescribir completamente que intentar "parchear" el documento existente.

---

## 📝 TEMPLATE DE NUEVA DIRECTIVA-DISENO-BASE-DATOS.md

```markdown
# DIRECTIVA: DISEÑO DE BASE DE DATOS Y NORMALIZACIÓN

**Proyecto:** GAMILIT - Plataforma Educativa Gamificada
**Versión:** 2.0.0
**Fecha:** 2025-11-23
**Ámbito:** Database-Agent y subagentes
**Tipo:** Directiva Obligatoria
**Stack:** PostgreSQL 15+ con Supabase (Auth + Storage)

---

## 🎯 PROPÓSITO

Establecer criterios claros de diseño de base de datos que garanticen:
- **Normalización adecuada** sin sacrificar performance
- **Escalabilidad** para agregar nuevos módulos educativos
- **Integridad** de datos con constraints apropiados
- **Performance óptima** con indexación estratégica
- **Mantenibilidad** a largo plazo

---

## 📐 NIVELES DE NORMALIZACIÓN

[MANTENER sección de 3NF - está correcta]

---

## 🏗️ DISEÑO DE SCHEMAS

### Organización de Schemas

```yaml
Principio: Un schema por contexto de negocio (Bounded Context de DDD)

Schemas del proyecto GAMILIT:

  # Core funcional
  educational_content:    Módulos educativos, ejercicios, asignaciones, rúbricas
  gamification_system:    Achievements, badges, ML coins, rangos Maya, comodines
  progress_tracking:      Progreso estudiantil, intentos, streaks, metas

  # Social y colaboración
  social_features:        Aulas, equipos, escuelas, membresías

  # Gestión y administración
  content_management:     Gestión de contenido educativo, versiones, aprobaciones
  admin_dashboard:        Vistas analíticas, estadísticas, reportes
  notifications:          Sistema de notificaciones multi-canal

  # Integraciones y sistema
  lti_integration:        Learning Tools Interoperability (LMS externos)
  auth_management:        Usuarios, perfiles, roles, permisos
  audit_logging:          Logs de auditoría, eventos de sistema
  system_configuration:   Configuración global, feature flags, rate limits

  # Supabase (provisto)
  auth:                   Schema de Supabase Auth (sistema)
  storage:                Schema de Supabase Storage (sistema)

  # Utilidades
  gamilit:                Funciones compartidas, utilities, helpers
```

**✅ Ejemplo correcto (GAMILIT)**

```sql
-- Schema bien definido por contexto
CREATE SCHEMA IF NOT EXISTS educational_content;
COMMENT ON SCHEMA educational_content IS
'Gestión de contenido educativo: módulos, ejercicios, asignaciones, submissions y rúbricas.';

CREATE TABLE educational_content.modules (...);
CREATE TABLE educational_content.exercises (...);
CREATE TABLE educational_content.assignments (...);
CREATE TABLE educational_content.submissions (...);
```

**❌ Ejemplo incorrecto**

```sql
-- ❌ Mezclar contextos en un schema
CREATE SCHEMA general_data;

CREATE TABLE general_data.modules (...);      -- ❌ Contexto educativo
CREATE TABLE general_data.achievements (...); -- ❌ Contexto gamificación
CREATE TABLE general_data.classrooms (...);   -- ❌ Contexto social
CREATE TABLE general_data.users (...);        -- ❌ Contexto auth
```

[... continúa con ejemplos específicos de GAMILIT ...]
```

---

## 📝 TEMPLATE DE NUEVA ESTANDARES-NOMENCLATURA.md

```markdown
# ESTÁNDARES DE NOMENCLATURA

**Proyecto:** GAMILIT - Plataforma Educativa Gamificada
**Versión:** 2.0.0
**Fecha:** 2025-11-23
**Audiencia:** Todos los agentes (Database, Backend, Frontend) y subagentes

---

## PROPÓSITO

Este documento establece las **convenciones de nomenclatura obligatorias** para todos los elementos del proyecto:

- Archivos y carpetas
- Objetos de base de datos
- Código Backend (TypeScript)
- Código Frontend (React/React Native)
- Constantes y configuraciones

**Objetivo:** Mantener consistencia, legibilidad y predictibilidad en todo el codebase.

---

[MANTENER secciones de principios generales - están correctas]

---

## 1. BASE DE DATOS (PostgreSQL)

### 1.1. Schemas

**Convención:** `snake_case` + sufijo `_management`, `_system`, o `_tracking` según contexto

```sql
-- ✅ CORRECTO (GAMILIT)
educational_content     -- Contenido educativo
gamification_system     -- Sistema de gamificación
progress_tracking       -- Tracking de progreso
auth_management         -- Gestión de autenticación
content_management      -- Gestión de contenido
social_features         -- Características sociales
admin_dashboard         -- Dashboard administrativo
lti_integration         -- Integración LTI
notifications           -- Sistema de notificaciones
audit_logging           -- Auditoría
system_configuration    -- Configuración

-- ❌ INCORRECTO
EducationalContent      -- Pascal case
educational_content_mgmt -- Abreviatura no estándar
content                 -- Sin sufijo descriptivo
```

### 1.2. Tablas

**Convención:** `snake_case`, plural cuando representan colecciones

```sql
-- ✅ CORRECTO (GAMILIT)
modules                 -- Módulos educativos
exercises               -- Ejercicios
assignments             -- Asignaciones
submissions             -- Respuestas de estudiantes
achievements            -- Logros/badges
user_achievements       -- Achievements ganados
student_progress        -- Progreso estudiantil
module_progress         -- Progreso por módulo
classrooms              -- Aulas
teams                   -- Equipos
ml_coins_transactions   -- Transacciones de ML coins
leaderboards            -- Tablas de clasificación

-- ❌ INCORRECTO
Modules                 -- Pascal case
module                  -- Singular (debería ser plural)
exerciseList            -- Camel case
```

### 1.3. Columnas

**Convención:** `snake_case`

```sql
-- ✅ CORRECTO (GAMILIT)
id
module_id
exercise_id
user_id
exercise_type           -- ENUM: 'multiple_choice', 'true_false', etc.
submission_status       -- ENUM: 'pending', 'graded', 'returned'
achievement_category    -- ENUM: 'participation', 'mastery', 'social'
difficulty_level        -- ENUM: 'beginner', 'intermediate', 'advanced'
total_xp                -- Experiencia acumulada
ml_coins_earned         -- ML Coins ganados
created_at
updated_at
is_active
is_auto_gradable

-- ❌ INCORRECTO
Id                      -- Pascal case
moduleId                -- Camel case
createdAt               -- Camel case
```

[... continúa con ejemplos específicos de GAMILIT ...]
```

---

## ✅ CRITERIOS DE VALIDACIÓN

Antes de dar por completada la reescritura, validar que:

1. **✅ Todos los metadatos** mencionan "GAMILIT"
2. **✅ CERO menciones** a "Administración de Obra", "INFONAVIT", "construcción", "proyectos de obra"
3. **✅ CERO menciones** a PostGIS, GEOGRAPHY, coordenadas
4. **✅ Todos los ejemplos de schemas** existen en `apps/database/ddl/schemas/`
5. **✅ Todos los ejemplos de tablas** existen en los DDL
6. **✅ Todos los ejemplos de ENUMs** existen en `00-prerequisites.sql`
7. **✅ Todos los ejemplos de funciones** existen en `ddl/schemas/*/functions/`
8. **✅ Principios generales** (3NF, nomenclatura, constraints) se mantienen
9. **✅ Estructura del documento** es clara y navegable
10. **✅ Ejemplos de código** están probados y son válidos

---

## 📊 ESTIMACIÓN DE ESFUERZO

| Tarea | Estimación | Complejidad |
|-------|------------|-------------|
| Backup de archivos originales | 5 min | Baja |
| Reescribir DIRECTIVA-DISENO-BASE-DATOS.md | 2-3 horas | Alta |
| Reescribir ESTANDARES-NOMENCLATURA.md | 1.5-2 horas | Alta |
| Validar ejemplos contra código real | 1 hora | Media |
| Revisión y ajustes finales | 30 min | Baja |
| **TOTAL** | **5-6.5 horas** | **Alta** |

---

## 🚀 PLAN DE EJECUCIÓN

### Fase 1: Preparación (10 minutos)

1. ✅ Crear carpeta de backups
   ```bash
   mkdir -p orchestration/directivas/_deprecated/2025-11-23
   ```

2. ✅ Mover archivos originales a backup
   ```bash
   mv orchestration/directivas/DIRECTIVA-DISENO-BASE-DATOS.md \
      orchestration/directivas/_deprecated/2025-11-23/
   mv orchestration/directivas/ESTANDARES-NOMENCLATURA.md \
      orchestration/directivas/_deprecated/2025-11-23/
   ```

3. ✅ Crear archivo de registro de cambios
   ```bash
   touch orchestration/directivas/CHANGELOG-DIRECTIVAS-2025-11-23.md
   ```

---

### Fase 2: Reescritura DIRECTIVA-DISENO-BASE-DATOS.md (2-3 horas)

**Secciones a reescribir (en orden):**

1. ✅ Metadatos (líneas 1-10)
2. ✅ Propósito (líneas 12-20)
3. ✅ Niveles de Normalización (MANTENER - líneas 23-173)
4. ✅ Cuándo Desnormalizar (MANTENER - líneas 175-295)
5. ✅ Diseño de Schemas (REESCRIBIR COMPLETAMENTE - líneas 299-340)
6. ✅ Claves y Constraints (MANTENER ejemplos genéricos + AGREGAR ejemplos GAMILIT - líneas 343-488)
7. ✅ Indexación Estratégica (MANTENER + AGREGAR ejemplos GAMILIT - líneas 490-605)
8. ❌ **ELIMINAR** Sección PostGIS (líneas 609-676)
9. ✅ Timestamps y Auditoría (MANTENER - líneas 678-764)
10. ✅ Performance y Optimización (MANTENER - líneas 767-840)
11. ✅ Checklist de Diseño (ACTUALIZAR con criterios GAMILIT - líneas 843-895)

**Nuevos ejemplos a agregar:**

```sql
-- Ejemplo: Tabla de educational_content
CREATE TABLE educational_content.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  difficulty_level educational_content.difficulty_level NOT NULL,
  required_maya_rank gamification_system.maya_rank,
  total_exercises INTEGER DEFAULT 0,
  created_by_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT gamilit.now_mexico(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT gamilit.now_mexico(),

  CONSTRAINT fk_modules_to_users
    FOREIGN KEY (created_by_id)
    REFERENCES auth_management.profiles(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

-- Comentarios
COMMENT ON TABLE educational_content.modules IS
  'Módulos educativos del sistema GAMILIT. Cada módulo contiene múltiples ejercicios agrupados por tema.';

COMMENT ON COLUMN educational_content.modules.difficulty_level IS
  'Nivel de dificultad del módulo: beginner, intermediate, advanced, expert';

COMMENT ON COLUMN educational_content.modules.required_maya_rank IS
  'Rango maya mínimo requerido para desbloquear el módulo (gamificación)';

-- Índices
CREATE INDEX idx_modules_difficulty_level
  ON educational_content.modules(difficulty_level);

CREATE INDEX idx_modules_required_maya_rank
  ON educational_content.modules(required_maya_rank)
  WHERE required_maya_rank IS NOT NULL;

CREATE INDEX idx_modules_created_by_id
  ON educational_content.modules(created_by_id);

-- Trigger de auditoría
CREATE TRIGGER trg_modules_updated_at
  BEFORE UPDATE ON educational_content.modules
  FOR EACH ROW
  EXECUTE FUNCTION gamilit.update_updated_at_column();
```

---

### Fase 3: Reescritura ESTANDARES-NOMENCLATURA.md (1.5-2 horas)

**Secciones a reescribir (en orden):**

1. ✅ Metadatos (líneas 1-6)
2. ✅ Propósito y Principios Generales (MANTENER - líneas 10-65)
3. ✅ 1. BASE DE DATOS (REESCRIBIR ejemplos - líneas 70-438)
   - 1.1. Schemas → Ejemplos GAMILIT
   - 1.2. Tablas → Ejemplos GAMILIT
   - 1.3. Columnas → Ejemplos GAMILIT
   - 1.4. Índices → Ejemplos GAMILIT
   - 1.5. Constraints → Ejemplos GAMILIT
   - 1.6. Functions → Ejemplos GAMILIT
   - 1.7. Views → Mantener
   - 1.8. Triggers → Ejemplos GAMILIT
   - 1.9. Sequences → Ejemplos GAMILIT

4. ✅ 2. BACKEND (REESCRIBIR ejemplos - líneas 442-850)
   - 2.1. Entities → Ejemplos GAMILIT
   - 2.2. Properties → Ejemplos GAMILIT
   - 2.3. Relaciones → Ejemplos GAMILIT
   - 2.4. Services → Ejemplos GAMILIT
   - 2.5. Controllers → Ejemplos GAMILIT
   - 2.6. DTOs → Ejemplos GAMILIT
   - 2.7. Interfaces → Mantener
   - 2.8. Enums → Ejemplos GAMILIT
   - 2.9. Constantes → Mantener
   - 2.10. Variables → Mantener

5. ✅ 3. FRONTEND (REESCRIBIR ejemplos - líneas 924-1283)
   - 3.1. Componentes → Ejemplos GAMILIT
   - 3.2. Páginas → Ejemplos GAMILIT
   - 3.3. Hooks → Ejemplos GAMILIT
   - 3.4. Stores → Ejemplos GAMILIT
   - 3.5. Services → Ejemplos GAMILIT
   - 3.6. Types → Mantener
   - 3.7. Variables → Mantener
   - 3.8. CSS Classes → Mantener

6. ✅ 4-7. ARCHIVOS Y NOMENCLATURA (MANTENER - líneas 1285-1925)

---

### Fase 4: Validación (1 hora)

1. ✅ Validar que todos los ejemplos de schemas existen:
   ```bash
   # Extraer schemas mencionados en directiva
   grep "CREATE SCHEMA" orchestration/directivas/DIRECTIVA-DISENO-BASE-DATOS.md

   # Comparar con schemas reales
   ls -1 apps/database/ddl/schemas/
   ```

2. ✅ Validar que todos los ejemplos de tablas existen:
   ```bash
   # Buscar tabla en DDL
   find apps/database/ddl/schemas -name "*.sql" -exec grep -l "CREATE TABLE.*modules" {} \;
   ```

3. ✅ Validar que todos los ENUMs existen:
   ```bash
   grep "CREATE TYPE" apps/database/ddl/00-prerequisites.sql
   ```

4. ✅ Validar que no quedan menciones incorrectas:
   ```bash
   # Buscar términos prohibidos
   grep -i "infonavit\|construcción\|obra\|presupuesto\|contrato" \
     orchestration/directivas/DIRECTIVA-DISENO-BASE-DATOS.md

   # Debe retornar vacío
   ```

---

### Fase 5: Documentación de Cambios (30 minutos)

Crear archivo `CHANGELOG-DIRECTIVAS-2025-11-23.md`:

```markdown
# CHANGELOG: Reescritura de Directivas

**Fecha:** 2025-11-23
**Razón:** Desalineación crítica entre directivas y código implementado

## Archivos Modificados

1. `DIRECTIVA-DISENO-BASE-DATOS.md`
   - **Versión anterior:** 1.0.0 (2025-11-20) - Proyecto incorrecto
   - **Versión nueva:** 2.0.0 (2025-11-23) - Alineada con GAMILIT
   - **Cambios:** Reescritura completa con ejemplos de GAMILIT

2. `ESTANDARES-NOMENCLATURA.md`
   - **Versión anterior:** 1.0.0 (2025-11-17) - Proyecto incorrecto
   - **Versión nueva:** 2.0.0 (2025-11-23) - Alineada con GAMILIT
   - **Cambios:** Reescritura completa con ejemplos de GAMILIT

## Backups

Los archivos originales se movieron a:
- `orchestration/directivas/_deprecated/2025-11-23/DIRECTIVA-DISENO-BASE-DATOS.md`
- `orchestration/directivas/_deprecated/2025-11-23/ESTANDARES-NOMENCLATURA.md`

## Razón del Cambio

Las directivas originales describían un proyecto diferente ("Sistema Administración de Obra e INFONAVIT") en lugar del proyecto real (GAMILIT). Esto causó confusión y hacía imposible seguir las directivas.

## Principios Mantenidos

- ✅ Normalización 3NF
- ✅ Convenciones snake_case, PascalCase, camelCase
- ✅ Nomenclatura de constraints (fk_, idx_, chk_, uq_)
- ✅ Estructura de archivos DDL
- ✅ Timestamps de auditoría

## Cambios Principales

- ✅ Reemplazados todos los ejemplos con ejemplos de GAMILIT
- ✅ Eliminada sección de PostGIS (no aplicable)
- ✅ Agregados schemas reales de GAMILIT
- ✅ Agregados ENUMs específicos de GAMILIT
- ✅ Agregados ejemplos de gamificación, contenido educativo, progreso estudiantil

## Validación

- ✅ Todos los schemas mencionados existen en apps/database/ddl/schemas/
- ✅ Todos los ejemplos de tablas existen en DDL
- ✅ Todos los ENUMs existen en 00-prerequisites.sql
- ✅ Cero menciones a proyecto incorrecto
- ✅ Cero menciones a PostGIS

---

**Responsable:** Database-Agent
**Reporte:** orchestration/agentes/database/validacion-alineacion-docs-20251123/
```

---

## 🎯 ENTREGABLES

1. ✅ `DIRECTIVA-DISENO-BASE-DATOS.md` (versión 2.0.0) - Alineada con GAMILIT
2. ✅ `ESTANDARES-NOMENCLATURA.md` (versión 2.0.0) - Alineada con GAMILIT
3. ✅ `CHANGELOG-DIRECTIVAS-2025-11-23.md` - Documentación de cambios
4. ✅ Backup de archivos originales en `_deprecated/2025-11-23/`
5. ✅ Reporte de validación (este documento)

---

## 📌 PRÓXIMOS PASOS

Una vez completada la reescritura:

1. ✅ Actualizar referencias en PROMPT-DATABASE-AGENT.md
2. ✅ Notificar a otros agentes (Backend, Frontend) de las nuevas directivas
3. ✅ Agregar referencia en documentación principal (docs/README.md)
4. ✅ Revisar que no haya otras directivas con el mismo problema

---

**Plan creado por:** Database-Agent
**Fecha:** 2025-11-23
**Estado:** LISTO PARA EJECUCIÓN
**Aprobación requerida:** Product Owner (para confirmar alcance)
