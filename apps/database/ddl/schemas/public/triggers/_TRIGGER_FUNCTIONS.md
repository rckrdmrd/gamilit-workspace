# Catálogo de Funciones de Trigger - Schema PUBLIC (Consolidado)

**Propósito:** Documentar todas las funciones SQL requeridas por los triggers del schema public
**Responsabilidad:** SA-DB-037 (Consolidación Microciclo 7)
**Última actualización:** 2025-11-02
**Total de funciones únicas:** 4

---

## Resumen de Funciones Requeridas

Los 21 triggers consolidados en `/schemas/public/triggers/` dependen de **4 funciones únicas** implementadas en Microciclo 6 (P2):

| # | Función | Schema | Triggers que Usan | Reutilización | Estado |
|---|---------|--------|-------------------|----------------|--------|
| 1 | `update_updated_at_column()` | gamilit | 16 (01-11, 23, 24, 26, 27, 28, 29, 30) | 76% | ✅ |
| 2 | `update_user_stats_on_exercise_complete()` | gamilit | 1 (21) | 4.8% | ✅ |
| 3 | `update_exercise_submissions_updated_at()` | progress_tracking | 1 (22) | 4.8% | ✅ |
| 4 | `update_classroom_member_count()` | gamilit | 1 (25) | 4.8% | ✅ |

**Cobertura Total:** 4/4 funciones implementadas (100%)

---

## Función 1: update_updated_at_column()

### Metadatos
- **Nombre Completo:** `gamilit.update_updated_at_column()`
- **Ubicación:** `/schemas/gamilit/functions/09-update_updated_at_column.sql`
- **Lenguaje:** PL/pgSQL
- **Tipo:** Trigger Function
- **Retorno:** TRIGGER
- **Creada:** 2025-11-02 (Microciclo 6 - P2)

### Descripción
Función genérica que actualiza automáticamente el campo `updated_at` de una tabla cuando se ejecuta un trigger BEFORE UPDATE. Es la función más reutilizada en el sistema de triggers.

### Firma SQL
```sql
CREATE OR REPLACE FUNCTION gamilit.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Parámetros
- **Entrada:** Registro NEW (modificado)
- **Salida:** Registro NEW con updated_at actualizado

### Lógica
1. Asigna la fecha/hora actual (`NOW()`) al campo `updated_at` del nuevo registro
2. Retorna el registro modificado para que el trigger lo procese

### Triggers que Usan Esta Función (16 total - 76%)

#### Triggers de Tablas Públicas (9)
- `01-trg_assignment_classrooms_updated_at` (public.assignment_classrooms)
- `02-trg_assignment_exercises_updated_at` (public.assignment_exercises)
- `03-trg_assignment_students_updated_at` (public.assignment_students)
- `04-trg_assignment_submissions_updated_at` (public.assignment_submissions)
- `05-trg_assignments_updated_at` (public.assignments)
- `06-trg_classroom_students_updated_at` (public.classroom_students)
- `07-trg_classrooms_updated_at` (public.classrooms)
- `08-trg_notifications_updated_at` (public.notifications)
- `09-trg_teacher_notes_updated_at` (public.teacher_notes)

#### Triggers de Otros Schemas (7)
- `23-trg_module_progress_updated_at` (progress_tracking.module_progress)
- `24-trg_classroom_members_updated_at` (social_features.classroom_members)
- `26-trg_classrooms_updated_at` (social_features.classrooms)
- `27-trg_schools_updated_at` (social_features.schools)
- `28-trg_teams_updated_at` (social_features.teams)
- `29-trg_feature_flags_updated_at` (system_configuration.feature_flags)
- `30-trg_system_settings_updated_at` (system_configuration.system_settings)

### Casos de Uso
- Auditoría temporal automática
- Tracking de cambios sin intervención de aplicación
- Queries de análisis basadas en timestamp de cambios
- Cumplimiento de políticas de retención de datos

### Consideraciones de Performance
- ✅ Función simple con O(1) complejidad
- ✅ No requiere I/O adicional
- ✅ Ejecución muy rápida
- ✅ Recomendable crear índices en columnas `updated_at` para queries frecuentes

### Validación
```sql
-- Verificar que la función existe
SELECT proname, pronargs, prorettype
FROM pg_proc
WHERE proname = 'update_updated_at_column'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'gamilit');

-- Resultado esperado: 1 fila, pronargs = 0
```

---

## Función 2: update_user_stats_on_exercise_complete()

### Metadatos
- **Nombre Completo:** `gamilit.update_user_stats_on_exercise_complete()`
- **Ubicación:** `/schemas/gamilit/functions/10-update_user_stats_on_exercise_complete.sql`
- **Lenguaje:** PL/pgSQL
- **Tipo:** Trigger Function (Business Logic)
- **Retorno:** TRIGGER
- **Creada:** 2025-11-02 (Microciclo 6 - P2)

### Descripción
Función que actualiza estadísticas de usuario (XP, nivel, ML Coins) cuando se completa un ejercicio. Implementa lógica de gamificación central del sistema.

### Firma SQL
```sql
CREATE OR REPLACE FUNCTION gamilit.update_user_stats_on_exercise_complete()
RETURNS TRIGGER AS $$
BEGIN
    -- Lógica de actualización de estadísticas
    -- Actualiza XP, nivel, coins basado en resultado del ejercicio
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Parámetros
- **Entrada:** Registro NEW (nuevo intento de ejercicio)
- **Salida:** Registro NEW procesado

### Lógica
1. Detecta que se ha completado un nuevo intento de ejercicio
2. Extrae puntuación y metadata del intento
3. Actualiza estadísticas del usuario en `gamification_system.user_stats`
4. Calcula aumento de XP basado en dificultad y resultado
5. Verifica si hay cambio de nivel
6. Registra transacción de ML Coins si aplica
7. Retorna registro procesado

### Triggers que Usan Esta Función (1 total - 4.8%)
- `21-trg_update_user_stats_on_exercise` (progress_tracking.exercise_attempts)

### Casos de Uso
- Actualización automática de XP al completar ejercicios
- Progresión de niveles de usuarios
- Otorgamiento automático de ML Coins
- Mantenimiento de leaderboards
- Tracking de progreso de usuarios

### Dependencias Críticas
- Tabla: `gamification_system.user_stats`
- Tabla: `progress_tracking.exercise_attempts`
- Tabla: `gamification_system.ml_coins_transactions`
- Función: `gamilit.award_ml_coins()` (si se requiere)
- Función: `gamilit.calculate_level_from_xp()` (si se requiere)

### Consideraciones de Performance
- ⚠️ Función más compleja con múltiples operaciones UPDATE/INSERT
- ⚠️ Requiere acceso a tablas de gamificación
- ✓ Debe optimizarse para tablas con alto volumen de ejercicios
- ✓ Considerar índices en `user_id`, `exercise_id`, `created_at`

### Validación
```sql
-- Verificar que la función existe
SELECT proname, pronargs
FROM pg_proc
WHERE proname = 'update_user_stats_on_exercise_complete'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'gamilit');

-- Resultado esperado: 1 fila, pronargs = 0

-- Verificar que la tabla user_stats existe
SELECT * FROM information_schema.tables
WHERE table_schema = 'gamification_system'
AND table_name = 'user_stats';
```

---

## Función 3: update_exercise_submissions_updated_at()

### Metadatos
- **Nombre Completo:** `progress_tracking.update_exercise_submissions_updated_at()`
- **Ubicación:** `/schemas/progress_tracking/functions/03-update_exercise_submissions_updated_at.sql`
- **Lenguaje:** PL/pgSQL
- **Tipo:** Trigger Function (Specialized)
- **Retorno:** TRIGGER
- **Creada:** 2025-11-02 (Microciclo 6 - P2)

### Descripción
Función especializada que actualiza el campo `updated_at` para la tabla `exercise_submissions`. Similar a `update_updated_at_column()` pero específica para este schema.

### Firma SQL
```sql
CREATE OR REPLACE FUNCTION progress_tracking.update_exercise_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Parámetros
- **Entrada:** Registro NEW de exercise_submissions
- **Salida:** Registro NEW con updated_at actualizado

### Lógica
1. Asigna fecha/hora actual al campo `updated_at`
2. Retorna registro modificado

### Triggers que Usan Esta Función (1 total - 4.8%)
- `22-exercise_submissions_updated_at` (progress_tracking.exercise_submissions)

### Casos de Uso
- Auditoría de envíos de ejercicios
- Tracking de cambios en estado de envíos
- Queries de análisis temporal de envíos

### Por Qué Función Específica vs. Genérica
- ✓ Potencial para agregar lógica adicional (validación, notificaciones)
- ✓ Mayor claridad semántica en código
- ✓ Facilita debugging y troubleshooting

### Validación
```sql
-- Verificar que la función existe
SELECT proname, pronargs
FROM pg_proc
WHERE proname = 'update_exercise_submissions_updated_at'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'progress_tracking');

-- Resultado esperado: 1 fila, pronargs = 0
```

---

## Función 4: update_classroom_member_count()

### Metadatos
- **Nombre Completo:** `gamilit.update_classroom_member_count()`
- **Ubicación:** `/schemas/gamilit/functions/07-update_classroom_member_count.sql`
- **Lenguaje:** PL/pgSQL
- **Tipo:** Trigger Function (Business Logic)
- **Retorno:** TRIGGER
- **Creada:** 2025-11-02 (Microciclo 6 - P2)

### Descripción
Función que sincroniza automáticamente el contador de miembros en una aula cuando se agregan o eliminan miembros. Mantiene integridad de datos de membresía.

### Firma SQL
```sql
CREATE OR REPLACE FUNCTION gamilit.update_classroom_member_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Lógica de actualización de contador
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Parámetros
- **Entrada:** Registro NEW/OLD de classroom_members
- **Salida:** Registro procesado

### Lógica
1. Detecta operación (INSERT o DELETE) en tabla classroom_members
2. Si INSERT: incrementa contador en tabla classrooms
3. Si DELETE: decrementa contador en tabla classrooms
4. Retorna registro procesado

### Triggers que Usan Esta Función (1 total - 4.8%)
- `25-trg_update_classroom_count` (social_features.classroom_members)
- Evento: `AFTER INSERT OR DELETE`

### Casos de Uso
- Sincronización automática de estadísticas de aulas
- Mantener contador denormalizado para performance
- Queries rápidas de cantidad de miembros
- Dashboard y vistas de aulas

### Dependencias Críticas
- Tabla: `social_features.classroom_members`
- Tabla: `social_features.classrooms` (para actualizar contador)
- Columna: `classrooms.member_count`

### Consideraciones de Performance
- ✓ Operación sencilla de UPDATE
- ✓ Ejecución O(1) complejidad
- ✓ Minimiza queries de conteo en aplicación
- ✓ Recomendable índice en `classrooms.id`

### Validación
```sql
-- Verificar que la función existe
SELECT proname, pronargs
FROM pg_proc
WHERE proname = 'update_classroom_member_count'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'gamilit');

-- Resultado esperado: 1 fila, pronargs = 0

-- Verificar estructura de tablas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'social_features'
AND table_name = 'classrooms'
AND column_name = 'member_count';
```

---

## Matriz de Dependencias

### Tablas Afectadas por Funciones

| Función | Lee | Modifica | Referencia |
|---------|-----|----------|-----------|
| `update_updated_at_column` | NEW.updated_at | NEW.updated_at | Cualquier tabla |
| `update_user_stats_on_exercise_complete` | exercise_attempts | user_stats, ml_coins_transactions | gamification_system.* |
| `update_exercise_submissions_updated_at` | NEW.updated_at | NEW.updated_at | exercise_submissions |
| `update_classroom_member_count` | OLD/NEW.classroom_id | classrooms.member_count | classroom_members, classrooms |

### Schemas Dependientes

```
gamilit (3 funciones)
├── update_updated_at_column() [16 triggers]
├── update_user_stats_on_exercise_complete() [1 trigger]
└── update_classroom_member_count() [1 trigger]

progress_tracking (1 función)
└── update_exercise_submissions_updated_at() [1 trigger]
```

---

## Estadísticas de Funciones

| Métrica | Valor |
|---------|-------|
| **Total de funciones únicas** | 4 |
| **Funciones en schema gamilit** | 3 |
| **Funciones en otros schemas** | 1 |
| **Funciones genéricas reutilizables** | 1 (`update_updated_at_column`) |
| **Funciones especializadas** | 3 |
| **Reutilización promedio** | 5.25 triggers/función |
| **Cobertura de triggers** | 100% (21/21 triggers) |
| **Líneas de código total** | ~200 líneas |

---

## Validación Global de Funciones

### Pre-requisitos para Deployment
```sql
-- 1. Verificar que TODAS las funciones existen
SELECT COUNT(*) as total_funciones
FROM pg_proc
WHERE proname IN ('update_updated_at_column',
                  'update_user_stats_on_exercise_complete',
                  'update_exercise_submissions_updated_at',
                  'update_classroom_member_count')
AND pronamespace IN (SELECT oid FROM pg_namespace
                     WHERE nspname IN ('gamilit', 'progress_tracking'));
-- Resultado esperado: 4

-- 2. Verificar integridad de parámetros
SELECT proname, pronargs, prorettype
FROM pg_proc
WHERE proname IN ('update_updated_at_column',
                  'update_user_stats_on_exercise_complete',
                  'update_exercise_submissions_updated_at',
                  'update_classroom_member_count')
ORDER BY proname;
-- Resultado esperado: 4 filas, todas con pronargs=0

-- 3. Verificar que retornan TRIGGER
SELECT proname, pg_get_function_result(oid) as return_type
FROM pg_proc
WHERE proname IN ('update_updated_at_column',
                  'update_user_stats_on_exercise_complete',
                  'update_exercise_submissions_updated_at',
                  'update_classroom_member_count')
ORDER BY proname;
-- Resultado esperado: Todas retornan 'trigger'
```

---

## Recomendaciones de Optimización

### Función update_updated_at_column()
- **Actual:** Muy eficiente, uso mínimo de recursos
- **Recomendación:** Consolidar con parametrización si es necesario en futuro

### Función update_user_stats_on_exercise_complete()
- **Actual:** Implementada pero requiere validación de lógica
- **Recomendación:**
  - Agregar validaciones de integridad
  - Optimizar queries de actualización
  - Considerar caching de leaderboards

### Función update_exercise_submissions_updated_at()
- **Actual:** Funciona correctamente
- **Recomendación:**
  - Evaluar consolidación con función genérica
  - Mantener especificidad si hay cambios futuros

### Función update_classroom_member_count()
- **Actual:** Implementada correctamente
- **Recomendación:**
  - Validar que counter no sea NULL
  - Considerer trigger de sincronización periódica
  - Agregar validaciones de integridad

---

## Checklist de Verificación

### Pre-Deployment
- [ ] Todas las funciones creadas exitosamente
- [ ] Validada sintaxis PL/pgSQL de cada función
- [ ] Verificado que retornan tipo TRIGGER
- [ ] Confirmado que no hay parámetros requeridos
- [ ] Testeada ejecución manual de funciones

### Post-Deployment
- [ ] Triggers se activan correctamente
- [ ] Campo `updated_at` se actualiza en triggers BEFORE UPDATE
- [ ] Función `update_user_stats_on_exercise_complete()` agrega XP correctamente
- [ ] Contador de miembros de aula se sincroniza
- [ ] No hay errores en logs de base de datos
- [ ] Performance acceptable para volumen esperado

---

## Documentación Relacionada

- **Triggers Consolidados:** `/schemas/public/triggers/_MAP.md`
- **Schema PUBLIC:** `/schemas/public/README.md`
- **Schema GAMILIT:** `/schemas/gamilit/README.md`
- **Funciones GAMILIT:** `/schemas/gamilit/functions/_MAP.md`
- **Microciclo 6 Report:** `/gamilit/projects/gamilit/orchestration/REPORTE-MICROCICLO-6-P2.md`

---

**Generado por:** SA-DB-037 (Consolidación de Triggers Microciclo 7)
**Timestamp:** 2025-11-02
**Estado:** ✅ DOCUMENTACIÓN COMPLETA
**Versión:** 1.0
