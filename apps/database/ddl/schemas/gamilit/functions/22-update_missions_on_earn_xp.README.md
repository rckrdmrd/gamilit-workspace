# Función: update_missions_on_earn_xp

## Información General

- **Archivo**: `22-update_missions_on_earn_xp.sql`
- **Schema**: `gamilit`
- **Tipo**: TRIGGER FUNCTION
- **Creado**: 2025-11-28
- **Database-Agent Task**: Crear función y trigger para actualizar misiones con objetivo 'earn_xp'

## Propósito

Esta función actualiza automáticamente el progreso de misiones diarias/semanales cuando un usuario gana XP (puntos de experiencia). Se integra con el sistema de gamificación para recompensar a los estudiantes por acumular experiencia a través de diversas actividades.

## Características Principales

### 1. Detección de Ganancia de XP
- Solo se ejecuta cuando `total_xp` AUMENTA
- Calcula XP ganado incremental: `NEW.total_xp - OLD.total_xp`
- Optimizado con WHEN clause en trigger para evitar ejecuciones innecesarias

### 2. Actualización de Misiones
- Busca misiones activas con objetivo `'earn_xp'`
- Incrementa el contador `current` con el XP ganado
- Respeta el límite `target` usando `LEAST()`
- Recalcula el progreso total de la misión

### 3. Gestión de Estados
- `active` → `in_progress` cuando progreso > 0%
- `in_progress` → `completed` cuando progreso = 100%
- Establece `completed_at` cuando se completa

### 4. Manejo Robusto de Errores
- Excepciones individuales por misión (no afecta otras)
- Excepción global no bloquea el UPDATE original
- Logging de errores con RAISE WARNING

## Estructura de Objectives

La función procesa objetivos en formato JSONB:

```json
[
  {
    "type": "earn_xp",
    "target": 100,
    "current": 0,
    "description": "Gana 100 XP"
  }
]
```

## Trigger Asociado

- **Archivo**: `apps/database/ddl/schemas/gamification_system/triggers/27-trg_update_missions_on_earn_xp.sql`
- **Tabla**: `gamification_system.user_stats`
- **Evento**: `AFTER UPDATE`
- **Condición**: `WHEN (OLD.total_xp IS DISTINCT FROM NEW.total_xp)`

## Flujo de Ejecución

1. Usuario gana XP (cualquier actividad: ejercicios, logros, bonos)
2. `user_stats.total_xp` se actualiza
3. WHEN clause valida que `total_xp` cambió
4. Función calcula XP ganado
5. Busca misiones activas con objetivo 'earn_xp'
6. Incrementa `current` en cada misión
7. Recalcula `progress` de la misión
8. Actualiza estado si corresponde

## Ejemplos de Uso

### Misión Diaria: Gana 50 XP

```sql
-- Crear misión
INSERT INTO gamification_system.missions (user_id, title, mission_type, objectives, end_date)
VALUES ('user-uuid', 'Gana experiencia', 'daily',
  '[{"type": "earn_xp", "target": 50, "current": 0}]'::jsonb,
  NOW() + INTERVAL '1 day');

-- Usuario completa ejercicio y gana 25 XP
UPDATE gamification_system.user_stats
SET total_xp = total_xp + 25
WHERE user_id = 'user-uuid';
-- Resultado: objectives[0].current = 25, progress = 50%

-- Usuario gana 25 XP más
UPDATE gamification_system.user_stats
SET total_xp = total_xp + 25
WHERE user_id = 'user-uuid';
-- Resultado: status = 'completed', progress = 100%
```

### Misión Combinada

```sql
INSERT INTO gamification_system.missions (user_id, title, mission_type, objectives, end_date)
VALUES ('user-uuid', 'Misión combinada', 'weekly',
  '[
    {"type": "earn_xp", "target": 200, "current": 0},
    {"type": "complete_exercises", "target": 5, "current": 0}
  ]'::jsonb,
  NOW() + INTERVAL '7 days');

-- Ganar 100 XP
UPDATE gamification_system.user_stats
SET total_xp = total_xp + 100
WHERE user_id = 'user-uuid';
-- Resultado: objectives[0].current = 100, progress = 25%
-- (50% de earn_xp + 0% de exercises) / 2 = 25%
```

## Dependencias

### Funciones
- `gamilit.now_mexico()`: Timestamp actual en timezone de México

### Tablas
- `gamification_system.missions`: Tabla de misiones
- `gamification_system.user_stats`: Estadísticas del usuario (tabla fuente)

### Índices Recomendados
- `idx_missions_user_type_status`: Para búsqueda eficiente de misiones
- GIN index en `objectives`: Para operador `@>`

## Performance

- **Complejidad**: O(n * m) donde n = misiones activas, m = objetivos por misión
- **Optimizaciones**:
  - WHEN clause evita ejecución innecesaria
  - Operador `@>` usa índice GIN
  - Un UPDATE por misión afectada (no bulk update)
- **Impacto**: Mínimo - solo se ejecuta cuando `total_xp` cambia

## Testing

Ver archivo principal para 4 tests documentados:
1. Usuario con misión diaria de ganar XP
2. Usuario completa la misión de XP
3. XP que no aumenta no afecta misiones
4. Múltiples objetivos

## Seguridad

- **SECURITY DEFINER**: Permite escribir en `missions` sin permisos directos
- **RLS Compatible**: Funciona con Row Level Security
- **Validación de input**: Usa LEAST() para evitar overflow
- **Error handling**: No expone información sensible

## Comparación con Plantilla

Basado en: `17-update_missions_on_exercise_complete.sql`

| Característica | Plantilla (17) | Esta función (22) |
|----------------|----------------|-------------------|
| Estructura DECLARE | ✅ Idéntica | ✅ Idéntica |
| Loop sobre misiones | ✅ Idéntica | ✅ Idéntica |
| Objetivo procesado | `complete_exercises` | `earn_xp` |
| Incremento | +1 por ejercicio | +XP ganado |
| Documentación | ✅ Completa | ✅ Más extensa |

## Changelog

- **2025-11-28**: Creación inicial
  - Implementada para integrar ganancia de XP con misiones
  - Soporta misiones diarias, semanales y combinadas
  - Manejo robusto de errores
  - Compatible con arquitectura existente de triggers
  - Calcula XP ganado incremental (no total_xp absoluto)

## Referencias

- **Requerimiento**: Sistema de misiones con objetivos configurables
- **Patrón**: `apps/database/ddl/schemas/gamilit/functions/17-update_missions_on_exercise_complete.sql`
- **Tabla fuente**: `apps/database/ddl/schemas/gamification_system/tables/01-user_stats.sql`

---

**Mantenido por**: Database-Agent
**Proyecto**: GAMILIT
**Versión**: 1.0.0
