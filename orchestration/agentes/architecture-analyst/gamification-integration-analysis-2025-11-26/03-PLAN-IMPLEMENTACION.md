# PLAN DE IMPLEMENTACIÓN - CORRECCIÓN DE MISIONES

**Fecha:** 2025-11-26
**Estado:** EN EJECUCIÓN
**Prioridad:** P0 (CRÍTICA)

---

## RESUMEN DEL PROBLEMA

La función `initialize_user_missions` crea `objectives` como **OBJETO JSONB**:
```sql
jsonb_build_object('type', 'complete_exercises', 'target', 3, 'current', 0)
-- Resultado: {"type": "complete_exercises", "target": 3, "current": 0}
```

Pero el trigger `update_missions_on_exercise_complete` espera **ARRAY JSONB**:
```sql
-- Línea 39: Busca con operador @>
objectives @> '[{"type": "complete_exercises"}]'::jsonb

-- Línea 45: Usa jsonb_array_length
v_obj_count := jsonb_array_length(v_objectives);
```

**Resultado**: Las misiones NUNCA se actualizan porque la condición WHERE nunca encuentra coincidencias.

---

## TAREAS DE CORRECCIÓN

### TAREA 1: Corregir initialize_user_missions.sql (P0)

**Archivo**: `apps/database/ddl/schemas/gamilit/functions/18-initialize_user_missions.sql`

**Cambios requeridos** (8 lugares, líneas 75-79, 110-114, 145-149, 184-188, 219-223, 254-258, 289-294, 325-329):

Cada `jsonb_build_object(...)` debe envolverse en `jsonb_build_array(...)`:

```sql
-- ANTES:
jsonb_build_object(
    'type', 'complete_exercises',
    'target', 3,
    'current', 0
)

-- DESPUÉS:
jsonb_build_array(
    jsonb_build_object(
        'type', 'complete_exercises',
        'target', 3,
        'current', 0
    )
)
```

### TAREA 2: Script de Migración para Misiones Existentes (P0)

**Crear script**: `apps/database/scripts/migrate-missions-objectives-to-array.sql`

```sql
-- Migrar objectives de OBJETO a ARRAY para misiones existentes
UPDATE gamification_system.missions
SET objectives = jsonb_build_array(objectives),
    updated_at = gamilit.now_mexico()
WHERE jsonb_typeof(objectives) = 'object';
```

---

## AGENTES A ORQUESTAR

### Agente 1: Database-Agent
**Tarea**: Corregir `18-initialize_user_missions.sql`
**Prioridad**: P0

### Agente 2: Database-Agent
**Tarea**: Crear script de migración
**Prioridad**: P0

---

## CRITERIOS DE ACEPTACIÓN

1. ✅ Todas las 8 inserciones de misiones usan `jsonb_build_array(jsonb_build_object(...))`
2. ✅ Script de migración convierte misiones existentes de objeto a array
3. ✅ Nuevos usuarios obtienen misiones con estructura correcta
4. ✅ Trigger encuentra misiones y las actualiza al completar ejercicios

---

## VALIDACIÓN POST-CORRECCIÓN

```sql
-- 1. Verificar estructura de nuevas misiones
SELECT id, jsonb_typeof(objectives) as tipo
FROM gamification_system.missions
LIMIT 5;
-- Esperado: tipo = 'array' para todas

-- 2. Verificar que trigger encuentra misiones
SELECT COUNT(*)
FROM gamification_system.missions
WHERE objectives @> '[{"type": "complete_exercises"}]'::jsonb;
-- Esperado: > 0

-- 3. Test de actualización
-- Completar un ejercicio y verificar que objectives[0].current aumenta
```

---

**Estado**: LISTO PARA ORQUESTACIÓN
