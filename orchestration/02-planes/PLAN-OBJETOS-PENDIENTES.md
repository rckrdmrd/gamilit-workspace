# Plan de Acción: Objetos Pendientes

**Proyecto:** GAMILIT - Migración Database
**Microciclo:** M9 - Corrección de Pendientes
**Fecha:** 2025-11-03
**Responsable:** SA-DB-045 (Agente de Corrección)
**Tiempo Estimado Total:** 22 minutos

---

## Resumen Ejecutivo

Se identificaron **10 objetos pendientes** durante la validación del Microciclo M8:
- **5 CRÍTICOS** que bloquean la ejecución de DDL (22 minutos)
- **4 MEDIOS** no bloqueantes (no requieren acción inmediata)
- **1 BAJO** confirmado como no existente

Este plan detalla las acciones correctivas para cada objeto, con código SQL listo para implementar.

---

## Objetos Críticos (5)

### 1. Función gamilit.is_admin() - PRIORIDAD CRÍTICA

**Estado:** FALTANTE (ISSUE-M8-001)

**Problema:**
La función `gamilit.is_admin()` es referenciada por 31 políticas RLS pero no existe en el codebase.

**Impacto:**
- 31 políticas RLS fallarán al ejecutar DDL
- Control de acceso administrativo no funcionará
- Tablas quedarán sin seguridad para administradores

**Archivos Afectados:**
- `auth_management/tables/03-profiles.sql` (2 políticas)
- `social_features/tables/03-classrooms.sql` (1 política)
- `gamification_system/tables/01-user_stats.sql` (1 política)
- ... y 28 archivos más

**Tiempo Estimado:** 5 minutos

**Acción Recomendada:**
Implementar función en `/apps/database/ddl/schemas/gamilit/functions/05-is_admin.sql`

**Código SQL:**
```sql
-- Función: gamilit.is_admin()
-- Descripción: Verifica si el usuario actual tiene rol de administrador
-- Uso: Políticas RLS para control de acceso administrativo
-- Retorna: BOOLEAN - true si el usuario es admin o super_admin

CREATE OR REPLACE FUNCTION gamilit.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_role TEXT;
BEGIN
    -- Obtener ID del usuario actual
    v_user_id := gamilit.get_current_user_id();

    IF v_user_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Verificar si el usuario tiene rol de administrador
    SELECT role INTO v_role
    FROM auth_management.profiles
    WHERE id = v_user_id;

    RETURN v_role IN ('admin_teacher', 'super_admin');

EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- Comentario
COMMENT ON FUNCTION gamilit.is_admin() IS
'Verifica si el usuario actual es administrador (admin_teacher o super_admin). Usada por políticas RLS.';

-- Permisos
GRANT EXECUTE ON FUNCTION gamilit.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION gamilit.is_admin() TO gamilit_user;
```

**Validación:**
```sql
-- Test 1: Verificar creación
SELECT proname, pronamespace::regnamespace
FROM pg_proc
WHERE proname = 'is_admin' AND pronamespace::regnamespace::text = 'gamilit';

-- Test 2: Ejecutar función (debe retornar boolean)
SELECT gamilit.is_admin(); -- Resultado esperado: true o false

-- Test 3: Verificar que políticas RLS no fallen
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE definition LIKE '%gamilit.is_admin%'
LIMIT 5;
```

**Dependencias:**
- Requiere: `gamilit.get_current_user_id()` ✅ (ya existe)
- Requiere: Tabla `auth_management.profiles` ✅ (ya existe)
- Requiere: Esquema `gamilit` ✅ (ya existe)

---

### 2. Función gamilit.update_user_stats_on_exercise_complete() - PRIORIDAD ALTA

**Estado:** FALTANTE (ISSUE-M8-002)

**Problema:**
La función es referenciada por 2 triggers pero no existe:
- `progress_tracking/triggers/21-trg_update_user_stats_on_exercise.sql`
- `public/triggers/21-trg_update_user_stats_on_exercise.sql`

**Impacto:**
- 2 triggers fallarán al ejecutar DDL
- Estadísticas de usuario no se actualizarán automáticamente al completar ejercicios
- Lógica de gamificación incompleta

**Tiempo Estimado:** 10 minutos

**Acción Recomendada:**
Implementar función en `/apps/database/ddl/schemas/gamilit/functions/14-update_user_stats_on_exercise_complete.sql`

**Código SQL:**
```sql
-- Función: gamilit.update_user_stats_on_exercise_complete()
-- Descripción: Actualiza estadísticas del usuario al completar un ejercicio
-- Tipo: TRIGGER FUNCTION
-- Evento: AFTER INSERT OR UPDATE ON progress_tracking.exercise_submissions
-- Uso: Automatiza actualización de stats de gamificación

CREATE OR REPLACE FUNCTION gamilit.update_user_stats_on_exercise_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_is_correct BOOLEAN;
    v_xp_earned INTEGER;
BEGIN
    -- Solo procesar si el ejercicio fue completado exitosamente
    IF NEW.status = 'completed' AND NEW.is_correct = TRUE THEN

        -- Calcular XP ganado (puede variar según dificultad)
        v_xp_earned := COALESCE(NEW.xp_earned, 10); -- Default 10 XP

        -- Actualizar estadísticas del usuario
        UPDATE gamification_system.user_stats
        SET
            exercises_completed = exercises_completed + 1,
            total_xp = total_xp + v_xp_earned,
            updated_at = gamilit.now_mexico()
        WHERE user_id = NEW.user_id;

        -- Si no existe registro de stats, crearlo
        IF NOT FOUND THEN
            INSERT INTO gamification_system.user_stats (
                user_id,
                exercises_completed,
                total_xp,
                level,
                created_at,
                updated_at
            ) VALUES (
                NEW.user_id,
                1,
                v_xp_earned,
                1,
                gamilit.now_mexico(),
                gamilit.now_mexico()
            );
        END IF;

        -- Registrar evento en log (opcional)
        RAISE NOTICE 'Usuario % completó ejercicio. XP ganado: %', NEW.user_id, v_xp_earned;
    END IF;

    RETURN NEW;

EXCEPTION
    WHEN OTHERS THEN
        -- No fallar el trigger si hay error, solo loggear
        RAISE WARNING 'Error actualizando stats: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Comentario
COMMENT ON FUNCTION gamilit.update_user_stats_on_exercise_complete() IS
'Trigger function que actualiza las estadísticas de gamificación del usuario al completar un ejercicio exitosamente.';

-- Permisos
GRANT EXECUTE ON FUNCTION gamilit.update_user_stats_on_exercise_complete() TO gamilit_user;
```

**Validación:**
```sql
-- Test 1: Verificar creación
SELECT proname, pronamespace::regnamespace, prorettype::regtype
FROM pg_proc
WHERE proname = 'update_user_stats_on_exercise_complete';

-- Test 2: Verificar triggers que la usan
SELECT schemaname, tablename, tgname
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE tgname LIKE '%user_stats_on_exercise%';

-- Test 3: Simular inserción de exercise_submission
-- (ejecutar solo en dev/staging)
BEGIN;
    INSERT INTO progress_tracking.exercise_submissions (
        user_id, exercise_id, status, is_correct, xp_earned
    ) VALUES (
        'test-user-uuid', 'test-exercise-uuid', 'completed', TRUE, 15
    );

    -- Verificar que stats se actualizaron
    SELECT exercises_completed, total_xp
    FROM gamification_system.user_stats
    WHERE user_id = 'test-user-uuid';
ROLLBACK;
```

**Dependencias:**
- Requiere: `gamilit.now_mexico()` ✅ (ya existe)
- Requiere: Tabla `gamification_system.user_stats` ✅ (ya existe)
- Requiere: Tabla `progress_tracking.exercise_submissions` ✅ (ya existe)

---

### 3. Función progress_tracking.update_exercise_submissions_updated_at() - PRIORIDAD ALTA

**Estado:** FALTANTE (ISSUE-M8-002)

**Problema:**
La función es referenciada por 2 triggers pero no existe:
- `progress_tracking/triggers/22-exercise_submissions_updated_at.sql`
- `public/triggers/22-exercise_submissions_updated_at.sql`

**Impacto:**
- 2 triggers fallarán al ejecutar DDL
- Campo `updated_at` no se actualizará automáticamente
- Pérdida de trazabilidad de cambios

**Tiempo Estimado:** 5 minutos

**Acción Recomendada:**
Implementar función en `/apps/database/ddl/schemas/progress_tracking/functions/07-update_exercise_submissions_updated_at.sql`

**Código SQL:**
```sql
-- Función: progress_tracking.update_exercise_submissions_updated_at()
-- Descripción: Actualiza automáticamente el campo updated_at
-- Tipo: TRIGGER FUNCTION
-- Evento: BEFORE UPDATE ON progress_tracking.exercise_submissions
-- Patrón: Timestamp automático

CREATE OR REPLACE FUNCTION progress_tracking.update_exercise_submissions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Actualizar timestamp usando zona horaria de México
    NEW.updated_at = gamilit.now_mexico();
    RETURN NEW;
END;
$$;

-- Comentario
COMMENT ON FUNCTION progress_tracking.update_exercise_submissions_updated_at() IS
'Trigger function que actualiza automáticamente el campo updated_at con la fecha/hora actual de México.';

-- Permisos
GRANT EXECUTE ON FUNCTION progress_tracking.update_exercise_submissions_updated_at() TO gamilit_user;
GRANT EXECUTE ON FUNCTION progress_tracking.update_exercise_submissions_updated_at() TO authenticated;
```

**Validación:**
```sql
-- Test 1: Verificar creación
SELECT proname, pronamespace::regnamespace
FROM pg_proc
WHERE proname = 'update_exercise_submissions_updated_at';

-- Test 2: Verificar trigger existe
SELECT tgname, tgtype, tgfoid::regproc
FROM pg_trigger
WHERE tgname LIKE '%exercise_submissions_updated_at%';

-- Test 3: Probar actualización (dev/staging)
BEGIN;
    UPDATE progress_tracking.exercise_submissions
    SET status = 'completed'
    WHERE id = (SELECT id FROM progress_tracking.exercise_submissions LIMIT 1);

    -- Verificar que updated_at cambió
    SELECT id, created_at, updated_at
    FROM progress_tracking.exercise_submissions
    WHERE id = (SELECT id FROM progress_tracking.exercise_submissions LIMIT 1);
ROLLBACK;
```

**Dependencias:**
- Requiere: `gamilit.now_mexico()` ✅ (ya existe)
- Requiere: Tabla `progress_tracking.exercise_submissions` ✅ (ya existe)

---

### 4. Corregir CREATE TYPE gamification_system.maya_rank - PRIORIDAD MEDIA

**Estado:** ERROR DE SINTAXIS (ISSUE-M8-003)

**Archivo:** `/apps/database/ddl/schemas/gamification_system/enums/maya_rank.sql`
**Línea:** 8

**Problema:**
```sql
CREATE TYPE maya_rank AS ENUM (
```

**Debe ser:**
```sql
CREATE TYPE gamification_system.maya_rank AS ENUM (
```

**Impacto:**
- El ENUM se creará en schema incorrecto (probablemente `public`)
- Causará conflictos con otras definiciones
- Errores en referencias posteriores

**Tiempo Estimado:** 1 minuto

**Acción Recomendada:**
Editar el archivo directamente

**Código a Cambiar:**
```sql
-- ANTES (línea 8):
CREATE TYPE maya_rank AS ENUM (

-- DESPUÉS (línea 8):
CREATE TYPE gamification_system.maya_rank AS ENUM (
```

**Validación:**
```sql
-- Verificar que el tipo existe en el schema correcto
SELECT typname, typnamespace::regnamespace
FROM pg_type
WHERE typname = 'maya_rank';
-- Resultado esperado: typnamespace = 'gamification_system'
```

**Dependencias:** Ninguna

---

### 5. Corregir FK en public.assignment_exercises - PRIORIDAD MEDIA

**Estado:** ERROR DE SINTAXIS (ISSUE-M8-003)

**Archivo:** `/apps/database/ddl/schemas/public/tables/assignment_exercises.sql`
**Línea:** 8

**Problema:**
```sql
exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
```

**Debe ser:**
```sql
exercise_id UUID NOT NULL REFERENCES educational_content.exercises(id) ON DELETE CASCADE,
```

**Impacto:**
- La constraint de FK fallará al ejecutar
- La tabla `public.exercises` no existe
- La tabla correcta es `educational_content.exercises`

**Tiempo Estimado:** 1 minuto

**Acción Recomendada:**
Editar el archivo directamente

**Código a Cambiar:**
```sql
-- ANTES (línea 8):
exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,

-- DESPUÉS (línea 8):
exercise_id UUID NOT NULL REFERENCES educational_content.exercises(id) ON DELETE CASCADE,
```

**Validación:**
```sql
-- Verificar que la FK se creó correctamente
SELECT
    tc.constraint_name,
    tc.table_schema,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'assignment_exercises'
    AND kcu.column_name = 'exercise_id';
-- Resultado esperado: foreign_table_schema = 'educational_content'
```

**Dependencias:**
- Requiere: Tabla `educational_content.exercises` ✅ (ya existe)

---

## Objetos Medios - No Bloqueantes (4)

### 6. Función gamilit.handle_new_user() - NO BLOQUEANTE

**Estado:** NO ENCONTRADA (ISSUE-M6-001)

**Problema:**
Función listada en plan original pero no existe en fuentes de backup.

**Impacto:**
NO HAY IMPACTO. La función no es referenciada por ningún otro objeto (triggers, views, etc.).

**Acción Recomendada:**
**NO IMPLEMENTAR** - Marcar como "no requerida" en documentación.

**Justificación:**
- No está en backup original
- No hay referencias en codebase
- Posible función legacy o planificada pero nunca implementada

**Validación:**
```bash
# Buscar referencias en todo el codebase
grep -r "handle_new_user" /apps/database/ddl/schemas/
# Resultado esperado: 0 coincidencias
```

---

### 7. Función gamilit.is_classroom_teacher() - NO BLOQUEANTE

**Estado:** NO ENCONTRADA (ISSUE-M6-001)

**Problema:**
Función listada en plan original pero no existe en fuentes de backup.

**Impacto:**
NO HAY IMPACTO. La función no es referenciada por ningún otro objeto.

**Acción Recomendada:**
**NO IMPLEMENTAR** - Marcar como "no requerida" en documentación.

**Justificación:**
- No está en backup original
- No hay referencias en codebase
- Puede ser reemplazada por queries directas o RLS policies

---

### 8. Función gamilit.is_student_in_classroom() - NO BLOQUEANTE

**Estado:** NO ENCONTRADA (ISSUE-M6-001)

**Problema:**
Función listada en plan original pero no existe en fuentes de backup.

**Impacto:**
NO HAY IMPACTO. La función no es referenciada por ningún otro objeto.

**Acción Recomendada:**
**NO IMPLEMENTAR** - Marcar como "no requerida" en documentación.

**Justificación:**
- No está en backup original
- No hay referencias en codebase
- Lógica puede implementarse en aplicación

---

### 9. Función gamilit.log_user_login() - NO BLOQUEANTE

**Estado:** NO ENCONTRADA (ISSUE-M6-001)

**Problema:**
Función listada en plan original pero no existe en fuentes de backup.

**Impacto:**
NO HAY IMPACTO. La función no es referenciada por ningún otro objeto.

**Acción Recomendada:**
**NO IMPLEMENTAR** - Marcar como "no requerida" en documentación.

**Justificación:**
- No está en backup original
- No hay referencias en codebase
- Logging puede hacerse a nivel de aplicación o con trigger genérico

---

## Objeto Bajo - Confirmado No Existente (1)

### 10. Tabla public.for - CONFIRMADO NO EXISTE

**Estado:** RESUELTO (ISSUE-001)

**Problema:**
Tabla listada en matriz de gaps original pero no existe en ninguna fuente.

**Impacto:**
NINGUNO. La tabla no existe y nunca existió.

**Acción Recomendada:**
**NINGUNA** - Cerrar issue como "falsa alarma".

**Justificación:**
- No existe en backup original
- No existe en migraciones
- No existe en documentación
- Posible error de parsing al generar matriz de gaps (palabra reservada SQL "FOR")

**Validación:**
```bash
# Buscar archivos
find /apps/database/ddl/schemas/ -name "*for.sql"
# Resultado: 0 archivos

# Buscar en backup
find /projects/gamilit-docs/.../backup-ddl/ -name "*for.sql"
# Resultado: 0 archivos
```

---

## Resumen de Acciones

### Objetos a Implementar (3 funciones)

| Prioridad | Objeto | Archivo | Tiempo | Impacto |
|-----------|--------|---------|--------|---------|
| 1 - CRÍTICA | `gamilit.is_admin()` | `gamilit/functions/05-is_admin.sql` | 5 min | Desbloquea 31 RLS |
| 2 - ALTA | `gamilit.update_user_stats_on_exercise_complete()` | `gamilit/functions/14-update_user_stats_on_exercise_complete.sql` | 10 min | Desbloquea 2 triggers |
| 3 - ALTA | `progress_tracking.update_exercise_submissions_updated_at()` | `progress_tracking/functions/07-update_exercise_submissions_updated_at.sql` | 5 min | Desbloquea 2 triggers |

**Subtotal:** 20 minutos

### Archivos a Editar (2 correcciones)

| Prioridad | Archivo | Línea | Cambio | Tiempo |
|-----------|---------|-------|--------|--------|
| 4 - MEDIA | `gamification_system/enums/maya_rank.sql` | 8 | Agregar `gamification_system.` | 1 min |
| 5 - MEDIA | `public/tables/assignment_exercises.sql` | 8 | `public.exercises` → `educational_content.exercises` | 1 min |

**Subtotal:** 2 minutos

### Objetos a Marcar como "No Requeridos" (4 funciones)

- `gamilit.handle_new_user()`
- `gamilit.is_classroom_teacher()`
- `gamilit.is_student_in_classroom()`
- `gamilit.log_user_login()`

**Acción:** Documentar en README como funciones no implementadas por no ser necesarias.

### Issues a Cerrar (1)

- ISSUE-001: Tabla public.for → CERRAR como "no existe, falsa alarma"

---

## Secuencia de Ejecución Recomendada

### Fase 1: Crear Funciones (20 minutos)

**Orden de ejecución:**
1. `progress_tracking.update_exercise_submissions_updated_at()` (5 min)
   - Más simple, sin dependencias complejas
2. `gamilit.update_user_stats_on_exercise_complete()` (10 min)
   - Depende de tablas, más lógica
3. `gamilit.is_admin()` (5 min)
   - Crítica para RLS

**Comandos:**
```bash
cd /apps/database/ddl/schemas

# 1. Crear función de progress_tracking
psql -U postgres -d gamilit -f progress_tracking/functions/07-update_exercise_submissions_updated_at.sql

# 2. Crear función de gamificación
psql -U postgres -d gamilit -f gamilit/functions/14-update_user_stats_on_exercise_complete.sql

# 3. Crear función de admin
psql -U postgres -d gamilit -f gamilit/functions/05-is_admin.sql
```

### Fase 2: Corregir Errores de Sintaxis (2 minutos)

**Archivos a editar:**
1. `gamification_system/enums/maya_rank.sql` línea 8
2. `public/tables/assignment_exercises.sql` línea 8

**Comandos:**
```bash
# Usar editor de texto o sed
sed -i 's/CREATE TYPE maya_rank/CREATE TYPE gamification_system.maya_rank/' gamification_system/enums/maya_rank.sql

sed -i 's/REFERENCES public.exercises/REFERENCES educational_content.exercises/' public/tables/assignment_exercises.sql
```

### Fase 3: Validar Correcciones (5 minutos)

**Ejecutar validaciones SQL:**
```bash
psql -U postgres -d gamilit -f /orchestration/05-validaciones/validar-objetos-pendientes.sql
```

**Contenido del archivo de validación:**
```sql
-- validar-objetos-pendientes.sql

\echo '=== VALIDACIÓN DE OBJETOS CORREGIDOS ==='

-- 1. Verificar función is_admin
SELECT 'gamilit.is_admin()' AS objeto,
       CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin' AND pronamespace::regnamespace::text = 'gamilit')
       THEN '✅ OK' ELSE '❌ FALTA' END AS estado;

-- 2. Verificar función update_user_stats_on_exercise_complete
SELECT 'gamilit.update_user_stats_on_exercise_complete()' AS objeto,
       CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_user_stats_on_exercise_complete')
       THEN '✅ OK' ELSE '❌ FALTA' END AS estado;

-- 3. Verificar función update_exercise_submissions_updated_at
SELECT 'progress_tracking.update_exercise_submissions_updated_at()' AS objeto,
       CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_exercise_submissions_updated_at')
       THEN '✅ OK' ELSE '❌ FALTA' END AS estado;

-- 4. Verificar ENUM maya_rank en schema correcto
SELECT 'gamification_system.maya_rank' AS objeto,
       CASE WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'maya_rank' AND typnamespace::regnamespace::text = 'gamification_system')
       THEN '✅ OK' ELSE '❌ ERROR SCHEMA' END AS estado;

-- 5. Verificar FK de assignment_exercises
SELECT 'FK assignment_exercises → educational_content.exercises' AS objeto,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.table_constraints tc
           JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
           WHERE tc.table_name = 'assignment_exercises'
             AND tc.constraint_type = 'FOREIGN KEY'
             AND ccu.table_schema = 'educational_content'
             AND ccu.table_name = 'exercises'
       ) THEN '✅ OK' ELSE '❌ ERROR FK' END AS estado;

\echo ''
\echo '=== RESUMEN ==='
SELECT
    COUNT(*) FILTER (WHERE estado = '✅ OK') AS objetos_ok,
    COUNT(*) FILTER (WHERE estado LIKE '❌%') AS objetos_error,
    COUNT(*) AS total
FROM (
    SELECT 'gamilit.is_admin()' AS objeto,
           CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin' AND pronamespace::regnamespace::text = 'gamilit')
           THEN '✅ OK' ELSE '❌ FALTA' END AS estado
    UNION ALL
    SELECT 'gamilit.update_user_stats_on_exercise_complete()',
           CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_user_stats_on_exercise_complete')
           THEN '✅ OK' ELSE '❌ FALTA' END
    UNION ALL
    SELECT 'progress_tracking.update_exercise_submissions_updated_at()',
           CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_exercise_submissions_updated_at')
           THEN '✅ OK' ELSE '❌ FALTA' END
    UNION ALL
    SELECT 'gamification_system.maya_rank',
           CASE WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'maya_rank' AND typnamespace::regnamespace::text = 'gamification_system')
           THEN '✅ OK' ELSE '❌ ERROR' END
    UNION ALL
    SELECT 'FK assignment_exercises',
           CASE WHEN EXISTS (
               SELECT 1 FROM information_schema.table_constraints tc
               JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
               WHERE tc.table_name = 'assignment_exercises'
                 AND tc.constraint_type = 'FOREIGN KEY'
                 AND ccu.table_schema = 'educational_content'
           ) THEN '✅ OK' ELSE '❌ ERROR' END
) validacion;
```

---

## Criterios de Éxito

### Técnicos
- [ ] 3 funciones implementadas sin errores de sintaxis
- [ ] 2 archivos editados correctamente
- [ ] 5/5 validaciones SQL pasan (100%)
- [ ] 0 errores en re-ejecución de SA-DB-043

### Organizacionales
- [ ] Archivos en ubicaciones correctas
- [ ] Código con estándares de calidad
- [ ] Documentación actualizada
- [ ] Issues cerrados en tracker

### Validación
- [ ] Re-ejecutar SA-DB-043: 0 errores críticos
- [ ] Ejecutar DDL completo en staging: sin errores
- [ ] Tests de integración: RLS funciona
- [ ] Tests de integración: Triggers funcionan

---

## Responsables

| Tarea | Responsable | Tiempo |
|-------|-------------|--------|
| Implementar 3 funciones | SA-DB-045 | 20 min |
| Editar 2 archivos | SA-DB-045 | 2 min |
| Validar correcciones | SA-DB-043 (re-run) | 5 min |
| Actualizar documentación | SA-DB-044 | 10 min |
| Ejecutar en staging | DevOps / DBA | 30 min |

**Tiempo total:** 67 minutos (1 hora 7 minutos)

---

## Próximos Pasos Post-Corrección

1. **Re-validación (Microciclo M8 bis)**
   - Re-ejecutar SA-DB-043
   - Confirmar 0 errores críticos
   - Actualizar REPORTE-VALIDACION.md

2. **Testing en Staging**
   - Ejecutar DDL completo
   - Probar RLS policies
   - Probar triggers
   - Validar performance

3. **Deployment a Producción**
   - Backup completo
   - Ejecutar DDL en ventana de mantenimiento
   - Monitoreo post-deployment
   - Rollback plan disponible

---

**Generado por:** SA-DB-044
**Microciclo:** M8 - Reporte Final
**Fecha:** 2025-11-03
**Versión:** 1.0
**Estado:** ✅ PLAN LISTO PARA EJECUCIÓN
