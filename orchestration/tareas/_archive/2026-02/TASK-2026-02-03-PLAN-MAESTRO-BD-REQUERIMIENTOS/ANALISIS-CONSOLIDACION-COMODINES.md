# ANALISIS-CONSOLIDACION-COMODINES.md

**Tarea:** TASK-2026-02-03-PLAN-MAESTRO-BD-REQUERIMIENTOS
**Fecha:** 2026-02-03
**Autor:** Claude Opus 4.5
**Estado:** ANALISIS COMPLETO

---

## 1. RESUMEN EJECUTIVO

Se analizaron 2 tablas en el schema `gamification_system` relacionadas con tracking de comodines:

| Tabla | Proposito | Campos | Tipo |
|-------|-----------|--------|------|
| `comodin_usage_log` | Log historico detallado de uso | 11 | **MAESTRA (Event Sourcing)** |
| `comodin_usage_tracking` | Contadores agregados por intento | 11 | **DERIVADA (Snapshot)** |

**Conclusion:** `comodin_usage_tracking` ES efectivamente una tabla de contadores agregados que PUEDE ser reemplazada por una VIEW materializada o regular sobre `comodin_usage_log`.

---

## 2. COMPARATIVA DE TABLAS

### 2.1 comodin_usage_log (TABLA MAESTRA)

```sql
-- Estructura actual
CREATE TABLE gamification_system.comodin_usage_log (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,               -- FK a profiles
    comodin_type comodin_type NOT NULL,  -- ENUM: pistas, vision_lectora, segunda_oportunidad
    exercise_id UUID,                    -- Contexto
    attempt_id UUID,                     -- Contexto
    module_id UUID,                      -- Contexto
    effect_applied TEXT,                 -- Detalle del efecto
    value_provided JSONB,                -- Valor proporcionado
    usage_context JSONB,                 -- Contexto adicional
    used_at TIMESTAMPTZ,                 -- Timestamp del uso
    UNIQUE(user_id, exercise_id, attempt_id, comodin_type)  -- Evita duplicados
);
```

**Proposito:** Event sourcing - registra CADA uso individual de comodin con todo su contexto.

### 2.2 comodin_usage_tracking (TABLA DERIVADA)

```sql
-- Estructura actual
CREATE TABLE gamification_system.comodin_usage_tracking (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    exercise_id UUID NOT NULL,
    attempt_id UUID NOT NULL,

    -- CONTADORES (estos son AGREGADOS de comodin_usage_log)
    pistas_used INTEGER DEFAULT 0 CHECK (pistas_used >= 0 AND pistas_used <= 3),
    vision_lectora_used INTEGER DEFAULT 0 CHECK (vision_lectora_used >= 0 AND vision_lectora_used <= 1),
    segunda_oportunidad_used INTEGER DEFAULT 0 CHECK (segunda_oportunidad_used >= 0 AND segunda_oportunidad_used <= 1),

    -- FLAGS (derivados de contadores)
    pistas_limit_reached BOOLEAN DEFAULT false,
    vision_lectora_limit_reached BOOLEAN DEFAULT false,
    segunda_oportunidad_limit_reached BOOLEAN DEFAULT false,

    started_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    UNIQUE(user_id, exercise_id, attempt_id)
);
```

**Proposito:** Snapshot de contadores para validacion rapida de limites.

---

## 3. ANALISIS DE REDUNDANCIA

### 3.1 Datos que se pueden derivar de comodin_usage_log

| Campo en tracking | Derivacion desde log |
|-------------------|---------------------|
| `pistas_used` | `COUNT(*) WHERE comodin_type = 'pistas'` |
| `vision_lectora_used` | `COUNT(*) WHERE comodin_type = 'vision_lectora'` |
| `segunda_oportunidad_used` | `COUNT(*) WHERE comodin_type = 'segunda_oportunidad'` |
| `pistas_limit_reached` | `pistas_used >= 3` |
| `vision_lectora_limit_reached` | `vision_lectora_used >= 1` |
| `segunda_oportunidad_limit_reached` | `segunda_oportunidad_used >= 1` |
| `started_at` | `MIN(used_at)` |
| `last_used_at` | `MAX(used_at)` |

**100% de los campos de tracking son derivables de log.**

### 3.2 Justificacion Original de la Tabla tracking

Segun el comentario en DDL:
> "Tracking de uso de comodines por intento para validar limites (max 3 pistas, 1 vision lectora, 1 segunda oportunidad)"

La tabla existe para:
1. **Performance:** Evitar COUNT en cada validacion de limite
2. **Atomicidad:** Actualizar contador + flag en una sola operacion

---

## 4. PROPUESTA: VIEW EN LUGAR DE TABLA

### 4.1 Vista Regular (Opcion A - RECOMENDADA)

```sql
-- =====================================================
-- View: gamification_system.comodin_usage_summary
-- Description: Reemplaza comodin_usage_tracking con agregados en tiempo real
-- Author: Claude Opus 4.5
-- Date: 2026-02-03
-- =====================================================

CREATE OR REPLACE VIEW gamification_system.comodin_usage_summary AS
SELECT
    -- Identificadores
    cul.user_id,
    cul.exercise_id,
    cul.attempt_id,

    -- Contadores por tipo
    COUNT(*) FILTER (WHERE cul.comodin_type = 'pistas') AS pistas_used,
    COUNT(*) FILTER (WHERE cul.comodin_type = 'vision_lectora') AS vision_lectora_used,
    COUNT(*) FILTER (WHERE cul.comodin_type = 'segunda_oportunidad') AS segunda_oportunidad_used,

    -- Total de comodines usados
    COUNT(*) AS total_comodines_used,

    -- Flags de limite alcanzado
    COUNT(*) FILTER (WHERE cul.comodin_type = 'pistas') >= 3 AS pistas_limit_reached,
    COUNT(*) FILTER (WHERE cul.comodin_type = 'vision_lectora') >= 1 AS vision_lectora_limit_reached,
    COUNT(*) FILTER (WHERE cul.comodin_type = 'segunda_oportunidad') >= 1 AS segunda_oportunidad_limit_reached,

    -- Timestamps
    MIN(cul.used_at) AS started_at,
    MAX(cul.used_at) AS last_used_at,

    -- Tipos de comodines usados (array)
    ARRAY_AGG(DISTINCT cul.comodin_type ORDER BY cul.comodin_type) AS comodin_types_used

FROM gamification_system.comodin_usage_log cul
WHERE cul.exercise_id IS NOT NULL
  AND cul.attempt_id IS NOT NULL
GROUP BY cul.user_id, cul.exercise_id, cul.attempt_id;

-- Comentario
COMMENT ON VIEW gamification_system.comodin_usage_summary IS
    'Vista que agrega uso de comodines por intento. Reemplaza tabla comodin_usage_tracking.
     Limites: pistas <= 3, vision_lectora <= 1, segunda_oportunidad <= 1';
```

### 4.2 Vista Materializada (Opcion B - Para Alto Volumen)

```sql
-- Solo si hay problemas de performance con la vista regular
CREATE MATERIALIZED VIEW gamification_system.mv_comodin_usage_summary AS
SELECT
    -- Misma consulta que la vista regular
    cul.user_id,
    cul.exercise_id,
    cul.attempt_id,
    COUNT(*) FILTER (WHERE cul.comodin_type = 'pistas') AS pistas_used,
    COUNT(*) FILTER (WHERE cul.comodin_type = 'vision_lectora') AS vision_lectora_used,
    COUNT(*) FILTER (WHERE cul.comodin_type = 'segunda_oportunidad') AS segunda_oportunidad_used,
    COUNT(*) FILTER (WHERE cul.comodin_type = 'pistas') >= 3 AS pistas_limit_reached,
    COUNT(*) FILTER (WHERE cul.comodin_type = 'vision_lectora') >= 1 AS vision_lectora_limit_reached,
    COUNT(*) FILTER (WHERE cul.comodin_type = 'segunda_oportunidad') >= 1 AS segunda_oportunidad_limit_reached,
    MIN(cul.used_at) AS started_at,
    MAX(cul.used_at) AS last_used_at
FROM gamification_system.comodin_usage_log cul
WHERE cul.exercise_id IS NOT NULL
  AND cul.attempt_id IS NOT NULL
GROUP BY cul.user_id, cul.exercise_id, cul.attempt_id;

-- Indice unico para REFRESH CONCURRENTLY
CREATE UNIQUE INDEX ON gamification_system.mv_comodin_usage_summary (user_id, exercise_id, attempt_id);

-- Trigger para refrescar automaticamente (opcional)
CREATE OR REPLACE FUNCTION gamification_system.refresh_comodin_summary()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY gamification_system.mv_comodin_usage_summary;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

---

## 5. ANALISIS DE PERFORMANCE

### 5.1 Consulta Actual (con tabla tracking)

```sql
-- Query tipica para validar limite
SELECT pistas_used, pistas_limit_reached
FROM gamification_system.comodin_usage_tracking
WHERE user_id = $1 AND exercise_id = $2 AND attempt_id = $3;

-- Costo: Index scan simple, O(1)
```

### 5.2 Consulta con Vista Regular

```sql
-- Misma query pero sobre vista
SELECT pistas_used, pistas_limit_reached
FROM gamification_system.comodin_usage_summary
WHERE user_id = $1 AND exercise_id = $2 AND attempt_id = $3;

-- Costo: Index scan + agregacion, O(log n) donde n = registros del usuario
```

### 5.3 Estimacion de Impacto

| Escenario | Registros por intento | Impacto |
|-----------|----------------------|---------|
| Tipico | 1-5 comodines | NEGLIGIBLE |
| Alto uso | 5-10 comodines | NEGLIGIBLE |
| Extremo | 50+ comodines | CONSIDERAR materialized view |

**Dado el constraint UNIQUE(user_id, exercise_id, attempt_id, comodin_type), el maximo teorico es 5 registros por intento (3 pistas + 1 vision + 1 segunda oportunidad).**

**Conclusion:** Vista regular es suficiente. No hay riesgo de performance.

---

## 6. PLAN DE MIGRACION

### 6.1 Fase 1: Crear Vista (Sin Downtime)

```sql
-- Crear vista con nombre diferente para pruebas
CREATE VIEW gamification_system.comodin_usage_summary AS ...;
```

### 6.2 Fase 2: Actualizar Backend

Cambiar referencias en backend de:
- `comodin_usage_tracking` a `comodin_usage_summary`

O alternativamente, crear vista con el mismo nombre despues de deprecar tabla.

### 6.3 Fase 3: Deprecar Tabla Original

```sql
-- Renombrar tabla original
ALTER TABLE gamification_system.comodin_usage_tracking
    RENAME TO comodin_usage_tracking_deprecated;

-- Crear vista con nombre original para compatibilidad total
CREATE VIEW gamification_system.comodin_usage_tracking AS
SELECT
    gen_random_uuid() as id,  -- ID sintetico
    user_id,
    exercise_id,
    attempt_id,
    pistas_used::integer,
    vision_lectora_used::integer,
    segunda_oportunidad_used::integer,
    pistas_limit_reached,
    vision_lectora_limit_reached,
    segunda_oportunidad_limit_reached,
    started_at,
    last_used_at
FROM gamification_system.comodin_usage_summary;
```

### 6.4 Fase 4: Eliminar Tabla Deprecated (Despues de validacion)

```sql
-- Solo despues de validar que todo funciona
DROP TABLE IF EXISTS gamification_system.comodin_usage_tracking_deprecated;
```

---

## 7. CAMBIOS REQUERIDOS EN BACKEND

### 7.1 Archivos a Buscar y Modificar

```bash
# Buscar referencias a comodin_usage_tracking
grep -r "comodin_usage_tracking" apps/backend/src/
```

### 7.2 Cambios Esperados

| Operacion Original | Cambio Requerido |
|-------------------|------------------|
| SELECT de tracking | Sin cambios (vista compatible) |
| INSERT a tracking | ELIMINAR - ya no necesario |
| UPDATE a tracking | ELIMINAR - ya no necesario |

**Importante:** La logica de INSERT/UPDATE a `comodin_usage_tracking` se vuelve innecesaria porque la vista calcula los valores automaticamente desde `comodin_usage_log`.

---

## 8. BENEFICIOS DE LA CONSOLIDACION

| Beneficio | Descripcion |
|-----------|-------------|
| **Single Source of Truth** | Solo `comodin_usage_log` contiene datos |
| **Consistencia Garantizada** | Imposible tener contadores desincronizados |
| **Menor Complejidad** | Elimina logica de INSERT/UPDATE en backend |
| **Menos Tablas** | -1 tabla en el schema |
| **Auditoria Mejorada** | Todo el historial en una tabla |

---

## 9. RIESGOS Y MITIGACION

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Performance degradada | BAJA | BAJO | Max 5 registros por intento |
| Backend tiene logica compleja de tracking | MEDIA | MEDIO | Vista de compatibilidad |
| Triggers que actualizan tracking | BAJA | MEDIO | Identificar y eliminar |

---

## 10. CONCLUSION

**Verificacion Completada:**
- `comodin_usage_tracking` ES una tabla de contadores agregados
- 100% de sus campos son derivables de `comodin_usage_log`
- El constraint UNIQUE garantiza max 5 registros por intento
- Vista regular es suficiente (no necesita materializada)

**Recomendacion Final:**
CREAR vista `comodin_usage_summary` y deprecar tabla `comodin_usage_tracking`.

**SQL Final Propuesto:**

```sql
-- Vista que reemplaza la tabla
CREATE OR REPLACE VIEW gamification_system.comodin_usage_summary AS
SELECT
    user_id,
    exercise_id,
    attempt_id,
    COUNT(*) FILTER (WHERE comodin_type = 'pistas') AS pistas_used,
    COUNT(*) FILTER (WHERE comodin_type = 'vision_lectora') AS vision_lectora_used,
    COUNT(*) FILTER (WHERE comodin_type = 'segunda_oportunidad') AS segunda_oportunidad_used,
    COUNT(*) FILTER (WHERE comodin_type = 'pistas') >= 3 AS pistas_limit_reached,
    COUNT(*) FILTER (WHERE comodin_type = 'vision_lectora') >= 1 AS vision_lectora_limit_reached,
    COUNT(*) FILTER (WHERE comodin_type = 'segunda_oportunidad') >= 1 AS segunda_oportunidad_limit_reached,
    MIN(used_at) AS started_at,
    MAX(used_at) AS last_used_at
FROM gamification_system.comodin_usage_log
WHERE exercise_id IS NOT NULL AND attempt_id IS NOT NULL
GROUP BY user_id, exercise_id, attempt_id;
```

---

*Documento generado por Claude Opus 4.5 - 2026-02-03*
