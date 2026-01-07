# DB-166: Analisis y Plan de Correccion - trigger_missions_on_explore_modules

**Fecha:** 2026-01-04
**Tipo:** Bug Fix - Trigger con referencia a columna inexistente
**Severidad:** Media (genera warnings pero no bloquea operaciones)
**Detectado en:** Recreacion de base de datos (session 2)
**Estado:** IMPLEMENTADO (2026-01-04)

---

## Resumen Ejecutivo

El trigger `trg_update_missions_on_explore_modules` genera warnings porque su funcion wrapper `trigger_missions_on_explore_modules()` referencia una columna `modules_explored` que no existe en la tabla `progress_tracking.module_progress`.

**Warning observado:**
```
Error in trigger_missions_on_explore_modules: record "new" has no field "modules_explored"
```

---

## Analisis Detallado

### 1. Componentes Involucrados

| Componente | Ubicacion | Estado |
|------------|-----------|--------|
| Trigger | `progress_tracking/triggers/30-trg_update_missions_on_explore_modules.sql` | Correcto |
| Funcion Wrapper | `gamilit/functions/51-mission_trigger_wrappers.sql` (lineas 236-258) | **BUG** |
| Funcion Core | `gamilit.update_mission_progress()` | Correcto |
| Tabla Target | `progress_tracking.module_progress` | Correcta (no tiene `modules_explored`) |

### 2. Causa Raiz

La funcion wrapper fue copiada de `trigger_missions_on_complete_modules()` que opera sobre `gamification_system.user_stats`:

```sql
-- FUNCION ORIGINAL (user_stats - CORRECTA)
-- user_stats SI tiene columna modules_completed
IF NEW.modules_completed > COALESCE(OLD.modules_completed, 0) THEN
    PERFORM gamilit.update_mission_progress(NEW.user_id, 'complete_modules', 1);
END IF;

-- FUNCION COPIADA (module_progress - BUG)
-- module_progress NO tiene columna modules_explored
IF NEW.modules_explored > COALESCE(OLD.modules_explored, 0) THEN  -- ERROR!
    PERFORM gamilit.update_mission_progress(NEW.user_id, 'explore_modules', 1);
END IF;
```

### 3. Tabla module_progress (estructura actual)

```sql
-- Columnas relevantes de progress_tracking.module_progress:
id UUID
user_id UUID           -- Disponible en NEW
module_id UUID         -- Disponible en NEW
status progress_status -- Disponible en NEW
-- ...
-- NO existe: modules_explored
```

### 4. Logica Esperada (segun documentacion del trigger)

Segun `30-trg_update_missions_on_explore_modules.sql`:

- **INSERT:** Primera vez que usuario interactua con modulo → Contar como exploracion
- **UPDATE:** Usuario regresa a modulo → NO debe contar otra vez

El tracking de modulos unicos se hace en la mision via JSONB `modules_visited`.

### 5. Funcion Deprecada con Logica Correcta

Existe `gamilit.update_missions_on_explore_modules()` (deprecated) que tenia la logica correcta:

```sql
-- Logica correcta en funcion deprecated:
-- 1. Verifica si module_id ya esta en modules_visited
-- 2. Si NO esta, lo agrega y actualiza current
-- 3. Si SI esta, no hace nada (evita duplicados)
IF NOT (v_modules_visited @> to_jsonb(NEW.module_id::text)) THEN
    v_modules_visited := v_modules_visited || jsonb_build_array(NEW.module_id::text);
    -- actualizar current...
END IF;
```

---

## Solucion Propuesta

### Opcion A: Corregir Wrapper (Recomendada)

Cambiar la logica del wrapper para detectar INSERT vs UPDATE:

```sql
CREATE OR REPLACE FUNCTION gamilit.trigger_missions_on_explore_modules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Solo procesar en INSERT (primera interaccion con modulo)
    -- En UPDATE el modulo ya fue explorado, no contar de nuevo
    IF TG_OP = 'INSERT' THEN
        PERFORM gamilit.update_mission_progress(NEW.user_id, 'explore_modules', 1);
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in trigger_missions_on_explore_modules: %', SQLERRM;
        RETURN NEW;
END;
$$;
```

**Pros:**
- Solucion simple y consistente con otros wrappers
- Mantiene el patron de wrapper unificado
- El tracking de unicidad lo hace `update_mission_progress` via JSONB

**Contras:**
- No trackea `module_id` en `modules_visited` (la funcion core no lo soporta)

### Opcion B: Extender update_mission_progress

Agregar parametro opcional para pasar `entity_id`:

```sql
-- Signature extendida:
gamilit.update_mission_progress(
    p_user_id UUID,
    p_objective_type TEXT,
    p_increment_value INTEGER DEFAULT 1,
    p_entity_id UUID DEFAULT NULL  -- Para tracking de unicidad
)
```

**Pros:**
- Soporte completo para tracking de modulos unicos

**Contras:**
- Cambio mayor que afecta funcion core
- Requiere mas testing

### Opcion C: Modificar Trigger a Solo INSERT

Cambiar el trigger para que solo se dispare en INSERT:

```sql
CREATE TRIGGER trg_update_missions_on_explore_modules
    AFTER INSERT ON progress_tracking.module_progress  -- Solo INSERT
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.trigger_missions_on_explore_modules();
```

Y simplificar el wrapper:

```sql
CREATE OR REPLACE FUNCTION gamilit.trigger_missions_on_explore_modules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Siempre incrementar (el trigger solo se dispara en INSERT)
    PERFORM gamilit.update_mission_progress(NEW.user_id, 'explore_modules', 1);
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in trigger_missions_on_explore_modules: %', SQLERRM;
        RETURN NEW;
END;
$$;
```

**Pros:**
- Mas eficiente (no se dispara en UPDATE)
- Codigo mas simple

**Contras:**
- Cambio en dos archivos (trigger + funcion)

---

## Recomendacion Final

**Implementar Opcion C** - Es la solucion mas limpia y eficiente:

1. El trigger solo se dispara cuando es necesario (INSERT)
2. La funcion wrapper es simple y sin logica condicional
3. Alineado con la documentacion existente del trigger
4. Menor overhead en operaciones UPDATE

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `gamilit/functions/51-mission_trigger_wrappers.sql` | Simplificar funcion (lineas 236-258) |
| `progress_tracking/triggers/30-trg_update_missions_on_explore_modules.sql` | Cambiar a solo INSERT |

---

## Plan de Implementacion

### Fase 1: Correccion DDL

1. Actualizar `51-mission_trigger_wrappers.sql`:
   - Remover condicion `IF NEW.modules_explored...`
   - Llamar directamente a `update_mission_progress()`

2. Actualizar `30-trg_update_missions_on_explore_modules.sql`:
   - Cambiar `AFTER INSERT OR UPDATE` a `AFTER INSERT`

### Fase 2: Validacion

1. Recrear base de datos
2. Verificar que no hay warnings
3. Ejecutar test `26-update_missions_on_explore_modules.TEST.sql`

### Fase 3: Documentacion

1. Actualizar _MAP.md de schema gamilit
2. Agregar entrada a CHANGELOG

---

## Impacto en Backend

**Ninguno.** El cambio es interno a la base de datos y no afecta la API.

---

## Riesgos

| Riesgo | Probabilidad | Mitigacion |
|--------|--------------|------------|
| Tests existentes fallan | Baja | El test espera INSERT → cuenta, UPDATE → no cuenta |
| Misiones no se actualizan | Baja | Misma logica, solo cambio en cuando se dispara |

---

## Referencias

- Trigger: `ddl/schemas/progress_tracking/triggers/30-trg_update_missions_on_explore_modules.sql`
- Funcion Wrapper: `ddl/schemas/gamilit/functions/51-mission_trigger_wrappers.sql`
- Test: `ddl/schemas/gamilit/functions/26-update_missions_on_explore_modules.TEST.sql`
- Funcion Deprecated: `ddl/schemas/gamilit/functions/_deprecated/26-update_missions_on_explore_modules.sql`

---

**Ultima actualizacion:** 2026-01-04
