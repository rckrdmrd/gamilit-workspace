---
titulo: Error DB-005 Recursión Infinita en Triggers
tipo: guia
dominio: troubleshooting
ultima_actualizacion: 2026-02-27
---

# ERR-DB-005: Recursion Infinita en Triggers

## Descripcion
Un trigger que modifica la misma tabla que lo disparo causa recursion infinita, agotando el stack de PostgreSQL y dejando la conexion inutilizable. Con 67 CREATE TRIGGER (126 trigger functions) en el sistema, este riesgo es particularmente relevante en triggers de auditoria y actualizacion automatica de campos.

## Sintomas
- Error: `ERROR: stack depth limit exceeded`
- Error: `HINT: Increase the configuration parameter "max_stack_depth"`
- Query colgado que eventualmente muestra timeout
- Pool de conexiones agotado por conexiones bloqueadas en recursion
- Alto consumo de CPU en el servidor PostgreSQL
- Logs de PostgreSQL inundados con mensajes de trigger repetidos

## Causa Raiz
1. Un trigger BEFORE/AFTER UPDATE ejecuta un UPDATE sobre la misma tabla sin verificar profundidad de recursion
2. Trigger de auditoria que inserta en tabla de log, y esa tabla tiene su propio trigger que referencia la tabla original
3. Trigger de actualizacion de `updated_at` que hace UPDATE explicito en vez de modificar NEW
4. Cadena circular de triggers entre tablas relacionadas (A actualiza B, B actualiza A)

## Solucion

### 1. Identificar triggers con riesgo de recursion
```sql
-- Listar triggers que hacen UPDATE/INSERT a su propia tabla
SELECT
  t.tgname AS trigger_name,
  c.relname AS table_name,
  n.nspname AS schema_name,
  p.prosrc AS function_source
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE p.prosrc ILIKE '%UPDATE%' || c.relname || '%'
  AND NOT t.tgisinternal
ORDER BY n.nspname, c.relname;
```

### 2. Agregar guarda de recursion con pg_trigger_depth()
```sql
-- INCORRECTO: trigger sin proteccion
CREATE OR REPLACE FUNCTION educational.update_module_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE educational.modules
  SET exercise_count = (
    SELECT COUNT(*) FROM educational.exercises WHERE module_id = NEW.module_id
  )
  WHERE id = NEW.module_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CORRECTO: con guarda de recursion
CREATE OR REPLACE FUNCTION educational.update_module_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevenir recursion: solo ejecutar en la primera invocacion
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  UPDATE educational.modules
  SET exercise_count = (
    SELECT COUNT(*) FROM educational.exercises WHERE module_id = NEW.module_id
  )
  WHERE id = NEW.module_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3. Usar WHEN clause para evitar disparo innecesario
```sql
-- Agregar condicion WHEN al trigger para que solo dispare cuando cambie algo relevante
CREATE TRIGGER trg_update_module_stats
  AFTER INSERT OR DELETE ON educational.exercises
  FOR EACH ROW
  WHEN (pg_trigger_depth() < 1)
  EXECUTE FUNCTION educational.update_module_stats();
```

### 4. Para triggers de updated_at, modificar NEW en vez de hacer UPDATE
```sql
-- INCORRECTO: causa recursion
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE current_table SET updated_at = gamilit.now_mexico() WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CORRECTO: modifica NEW directamente (sin recursion)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := gamilit.now_mexico();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 5. Diagnosticar recursion en tiempo real
```sql
-- Si sospecha de recursion activa, verificar conexiones bloqueadas
SELECT pid, state, query, wait_event_type, query_start
FROM pg_stat_activity
WHERE state = 'active'
  AND query_start < now() - interval '30 seconds'
ORDER BY query_start;

-- Terminar conexion problematica si es necesario
SELECT pg_terminate_backend(pid_problematico);
```

## Prevencion

1. **Regla de desarrollo**: Todo trigger que modifica su propia tabla DEBE incluir `pg_trigger_depth()` guard
2. **BEFORE triggers para updated_at**: Usar `NEW.campo := valor` en vez de `UPDATE` explicito
3. **Documentar cadenas de triggers**: Mapear que triggers disparan otros triggers
4. **Test de recursion**: Antes de deploy, ejecutar la operacion que dispara el trigger y verificar que no hay recursion

### Checklist antes de crear trigger:
- [ ] Trigger NO hace UPDATE/INSERT a su propia tabla (o tiene guard)
- [ ] `pg_trigger_depth()` guard incluido si modifica tablas con triggers
- [ ] Trigger de `updated_at` usa `NEW.updated_at :=` (no `UPDATE`)
- [ ] Cadena de triggers documentada
- [ ] Probado con datos reales (no solo en tabla vacia)

### Verificacion automatica
```bash
# Buscar funciones de trigger que hagan UPDATE sin pg_trigger_depth guard
grep -l "UPDATE" apps/database/ddl/schemas/*/functions/*.sql | \
  xargs grep -L "pg_trigger_depth"
```

## Ocurrencias

| Fecha | Schema | Trigger/Funcion | Tabla | Estado |
|-------|--------|-----------------|-------|--------|
| 2026-01-20 | educational | update_module_exercise_count | modules | Resuelto |
| 2025-12-15 | gamification | recalculate_user_xp | user_xp_totals | Resuelto |

## Referencias

- **DDL Triggers:** `apps/database/ddl/schemas/*/triggers/`
- **DDL Functions:** `apps/database/ddl/schemas/*/functions/`
- **PostgreSQL pg_trigger_depth:** https://www.postgresql.org/docs/15/functions-info.html
- **Inventario DB:** `orchestration/inventarios/DATABASE_INVENTORY.yml`

---

**Severidad:** Critica
**Frecuencia:** 2+ ocurrencias
**Tiempo de resolucion:** 30-60 min
**Ultimo update:** 2026-02-13
