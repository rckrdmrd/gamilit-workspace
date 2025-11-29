# GUÍA DE DESPLIEGUE: update_missions_on_complete_modules

## Resumen

Esta guía documenta el despliegue de la función y trigger para actualizar misiones cuando un usuario completa un módulo.

## Archivos Involucrados

1. **Función**: `apps/database/ddl/schemas/gamilit/functions/25-update_missions_on_complete_modules.sql`
2. **Trigger**: `apps/database/ddl/schemas/progress_tracking/triggers/29-trg_update_missions_on_complete_modules.sql`
3. **Tests**: `apps/database/ddl/schemas/gamilit/functions/25-update_missions_on_complete_modules.TEST.sql`

## Pre-requisitos

Antes de desplegar, verificar que existan:

```sql
-- Verificar función now_mexico
SELECT proname FROM pg_proc WHERE proname = 'now_mexico';

-- Verificar tabla missions
SELECT tablename FROM pg_tables
WHERE schemaname = 'gamification_system' AND tablename = 'missions';

-- Verificar tabla module_progress
SELECT tablename FROM pg_tables
WHERE schemaname = 'progress_tracking' AND tablename = 'module_progress';

-- Verificar índices en missions (performance)
SELECT indexname FROM pg_indexes
WHERE tablename = 'missions'
AND indexname IN ('idx_missions_user_type_status', 'idx_missions_user_id');
```

**Resultado esperado**: Todas las consultas deben retornar resultados.

## Pasos de Despliegue

### 1. Crear Función

```bash
cd apps/database
psql -d gamilit_platform -f ddl/schemas/gamilit/functions/25-update_missions_on_complete_modules.sql
```

**Verificación**:
```sql
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'update_missions_on_complete_modules';
```

### 2. Crear Trigger

```bash
psql -d gamilit_platform -f ddl/schemas/progress_tracking/triggers/29-trg_update_missions_on_complete_modules.sql
```

**Verificación**:
```sql
SELECT tgname, tgenabled, proname
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'progress_tracking.module_progress'::regclass
AND tgname = 'trg_update_missions_on_complete_modules';
```

**Resultado esperado**: 1 fila con tgenabled = 'O' (enabled)

### 3. Ejecutar Tests

```bash
psql -d gamilit_platform -f ddl/schemas/gamilit/functions/25-update_missions_on_complete_modules.TEST.sql
```

**Resultado esperado**: Mensajes de tests exitosos (✅ TEST N PASSED)

## Validación Post-Despliegue

### Verificar Triggers Activos

```sql
SELECT
    t.tgname as trigger_name,
    t.tgtype,
    t.tgenabled,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'progress_tracking.module_progress'::regclass
ORDER BY t.tgname;
```

**Resultado esperado**:
```
trigger_name                            | tgtype | tgenabled | function_name
----------------------------------------|--------|-----------|--------------------------------
trg_module_progress_updated_at          | ...    | O         | update_updated_at_column
trg_update_missions_on_complete_modules | ...    | O         | update_missions_on_complete_modules
```

### Test Manual

```sql
-- 1. Crear misión de prueba
INSERT INTO gamification_system.missions (
    user_id,
    template_id,
    title,
    mission_type,
    objectives,
    rewards,
    end_date
) VALUES (
    (SELECT id FROM auth_management.profiles WHERE username = 'test_student' LIMIT 1),
    'MANUAL_TEST_COMPLETE_MODULES',
    'Test Manual: Completa módulos',
    'daily',
    '[{"type": "complete_modules", "target": 2, "current": 0, "description": "Completa 2 módulos"}]'::jsonb,
    '{"xp": 100, "ml_coins": 50}'::jsonb,
    NOW() + INTERVAL '1 day'
) RETURNING id;

-- 2. Completar un módulo
UPDATE progress_tracking.module_progress
SET status = 'completed', completed_at = NOW()
WHERE user_id = (SELECT id FROM auth_management.profiles WHERE username = 'test_student' LIMIT 1)
AND module_id = (SELECT id FROM educational_content.modules LIMIT 1);

-- 3. Verificar actualización de misión
SELECT
    id,
    objectives->0->>'current' as current,
    objectives->0->>'target' as target,
    progress,
    status
FROM gamification_system.missions
WHERE template_id = 'MANUAL_TEST_COMPLETE_MODULES';

-- Resultado esperado: current='1', target='2', progress=50, status='in_progress'

-- 4. Limpiar
DELETE FROM gamification_system.missions WHERE template_id = 'MANUAL_TEST_COMPLETE_MODULES';
```

## Monitoreo

### Ver Logs en Tiempo Real

```sql
-- Habilitar logging de NOTICE
SET client_min_messages TO NOTICE;

-- Ejecutar update y ver logs
UPDATE progress_tracking.module_progress
SET status = 'completed'
WHERE user_id = 'some-uuid' AND module_id = 'some-module-uuid';
```

### Verificar Errores

```sql
-- Ver logs de PostgreSQL
tail -f /var/log/postgresql/postgresql-*.log | grep "update_missions_on_complete_modules"
```

## Rollback (si es necesario)

### Deshabilitar Trigger

```sql
ALTER TABLE progress_tracking.module_progress
DISABLE TRIGGER trg_update_missions_on_complete_modules;
```

### Eliminar Trigger

```sql
DROP TRIGGER IF EXISTS trg_update_missions_on_complete_modules
ON progress_tracking.module_progress CASCADE;
```

### Eliminar Función

```sql
DROP FUNCTION IF EXISTS gamilit.update_missions_on_complete_modules() CASCADE;
```

## Troubleshooting

### Error: "function now_mexico does not exist"

**Solución**: Crear función `gamilit.now_mexico()` primero:
```sql
CREATE OR REPLACE FUNCTION gamilit.now_mexico()
RETURNS TIMESTAMP WITHOUT TIME ZONE
AS $$
BEGIN
    RETURN NOW() AT TIME ZONE 'America/Mexico_City';
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### Error: "relation missions does not exist"

**Solución**: Crear tabla `gamification_system.missions` antes de desplegar.

### Trigger no se dispara

**Verificar**:
1. Trigger está habilitado: `SELECT tgenabled FROM pg_trigger WHERE tgname = 'trg_update_missions_on_complete_modules';`
2. Condición WHEN se cumple: status debe cambiar A 'completed' (no de 'completed' a 'completed')
3. Revisar logs: `tail -f /var/log/postgresql/postgresql-*.log`

### Performance lento

**Optimizar**:
```sql
-- Crear índice GIN en objectives (si no existe)
CREATE INDEX idx_missions_objectives_gin
ON gamification_system.missions
USING GIN (objectives jsonb_path_ops);

-- Verificar plan de ejecución
EXPLAIN ANALYZE
SELECT id, objectives, status
FROM gamification_system.missions
WHERE user_id = 'some-uuid'
  AND status IN ('active', 'in_progress')
  AND end_date > NOW()
  AND objectives @> '[{"type": "complete_modules"}]'::jsonb;
```

## Contacto y Soporte

- **Implementado por**: Database-Agent
- **Fecha**: 2025-11-28
- **Patrón de referencia**: `17-update_missions_on_exercise_complete.sql`
- **Documentación adicional**: Ver comentarios inline en archivos SQL

## Checklist de Despliegue

- [ ] Pre-requisitos verificados (función now_mexico, tablas existen)
- [ ] Función creada sin errores
- [ ] Trigger creado sin errores
- [ ] Tests ejecutados exitosamente
- [ ] Verificación post-despliegue completada
- [ ] Test manual ejecutado
- [ ] Monitoreo configurado
- [ ] Documentación actualizada en MASTER_INVENTORY.yml
- [ ] Traza actualizada en TRAZA-TAREAS-DATABASE.md

---

**Estado**: ✅ LISTO PARA DESPLIEGUE
**Fecha**: 2025-11-28
**Versión**: 1.0.0
