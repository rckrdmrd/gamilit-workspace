# PLAN DE CORRECCION - BASE DE DATOS GAMILIT

**Fecha:** 2026-01-13
**Tipo:** Plan de Correccion CAPVED
**Basado en:** ANALISIS-COMPARATIVO-BD-V1-V2-2026-01-13.md

---

## RESUMEN DE PROBLEMAS IDENTIFICADOS

| ID | Problema | Severidad | Existe en V1? | Existe en V2? |
|----|----------|-----------|---------------|---------------|
| ERR-001 | Seed ml_coins_transactions usa columnas inexistentes | MEDIA | SI | SI |
| ERR-002 | fix-missing-module-progress.sql movido a deprecated | ALTA | NO | SI |

---

## ERR-001: SEED ml_coins_transactions USA COLUMNAS INEXISTENTES

### Descripcion

La seed `07-ml_coins_transactions.sql` intenta usar las columnas `related_entity_type` y `related_entity_id` que NO existen en el DDL de la tabla `gamification_system.ml_coins_transactions`.

### Ubicacion

- **Seed:** `seeds/prod/gamification_system/07-ml_coins_transactions.sql`
- **DDL:** `ddl/schemas/gamification_system/tables/05-ml_coins_transactions.sql`

### Evidencia

Log de creacion de BD:
```
psql:.../07-ml_coins_transactions.sql:498: ERROR:  column "related_entity_type" of relation "ml_coins_transactions" does not exist
```

Conteo de errores: 43 por ejecucion (tanto en V1 como en V2)

### Columnas en DDL

```sql
id, user_id, tenant_id, amount, balance_before, balance_after,
transaction_type, description, reason, reference_id, reference_type,
multiplier, bonus_applied, metadata, created_at
```

### Columnas usadas en Seed (problematicas)

```sql
related_entity_type  -- NO EXISTE
related_entity_id    -- NO EXISTE (posiblemente = reference_id?)
```

### Opciones de Correccion

#### Opcion A: Actualizar DDL (Agregar columnas)

```sql
ALTER TABLE gamification_system.ml_coins_transactions
ADD COLUMN related_entity_type TEXT,
ADD COLUMN related_entity_id UUID;
```

**Pros:** Mantiene datos historicos de seeds
**Contras:** Duplica columnas (reference_id/reference_type ya existen)

#### Opcion B: Actualizar Seed (Eliminar columnas) [RECOMENDADA]

Cambiar la seed para usar las columnas existentes:
- `related_entity_type` -> `reference_type`
- `related_entity_id` -> `reference_id`

**Pros:** Usa columnas existentes, no modifica DDL
**Contras:** Requiere actualizar 43 lineas de la seed

### Accion Recomendada

**Opcion B:** Actualizar la seed para usar las columnas correctas `reference_type` y `reference_id`.

### Archivos a Modificar

1. `/apps/database/seeds/prod/gamification_system/07-ml_coins_transactions.sql`
2. `/apps/database/seeds/dev/gamification_system/07-ml_coins_transactions.sql` (si existe)

---

## ERR-002: fix-missing-module-progress.sql MOVIDO A DEPRECATED

### Descripcion

El archivo `fix-missing-module-progress.sql` fue movido a `_deprecated/scripts-violacion-carga-limpia/` pero el script `create-database.sh` aun lo referencia en linea 695.

### Ubicacion

- **Referencia en script:** `create-database.sh:695`
- **Ubicacion actual:** `_deprecated/scripts-violacion-carga-limpia/fix-missing-module-progress.sql`
- **Ubicacion esperada:** `scripts/fix-missing-module-progress.sql`

### Evidencia

```bash
$ grep -n "fix-missing-module-progress" create-database.sh
695:execute_sql "$SCRIPT_DIR/scripts/fix-missing-module-progress.sql" ...
```

### Impacto

Si se ejecuta `create-database.sh`, fallara en FASE 17 porque el archivo no existe.

### Opciones de Correccion

#### Opcion A: Restaurar archivo a ubicacion correcta [RECOMENDADA]

```bash
mv _deprecated/scripts-violacion-carga-limpia/fix-missing-module-progress.sql scripts/
```

**Pros:** No modifica el script maestro
**Contras:** Restaura archivo que fue deprecado intencionalmente

#### Opcion B: Actualizar referencia en create-database.sh

Cambiar linea 695 para usar la nueva ubicacion:
```bash
execute_sql "$SCRIPT_DIR/_deprecated/scripts-violacion-carga-limpia/fix-missing-module-progress.sql" ...
```

**Pros:** No mueve archivos
**Contras:** Referencias a _deprecated en script de produccion

#### Opcion C: Eliminar referencia (si no es necesaria)

Verificar si la funcionalidad de `initialize_module_progress_for_users()` se ejecuta de otra manera.

**Pros:** Limpia el script
**Contras:** Puede perder funcionalidad critica

### Accion Recomendada

**Opcion A:** Restaurar el archivo a `scripts/` ya que es necesario para la validacion post-seeds.

### Archivos a Modificar

1. Mover `_deprecated/scripts-violacion-carga-limpia/fix-missing-module-progress.sql` a `scripts/`

---

## PLAN DE EJECUCION

### Fase 1: Correccion de ERR-001 (Seed ml_coins_transactions)

1. Leer seed completa para entender estructura
2. Identificar todas las referencias a `related_entity_type` y `related_entity_id`
3. Reemplazar por `reference_type` y `reference_id`
4. Validar que los valores sean compatibles con CONSTRAINT existente

### Fase 2: Correccion de ERR-002 (Archivo movido)

1. Mover archivo de `_deprecated/` a `scripts/`
2. Verificar que script es ejecutable

### Fase 3: Validacion

1. Ejecutar `drop-and-recreate-database.sh`
2. Verificar que no hay errores de columnas inexistentes
3. Verificar que FASE 17 completa exitosamente
4. Verificar conteo de objetos creados

### Fase 4: Propagacion

1. Sincronizar cambios con V1 si aplica
2. Actualizar inventarios
3. Documentar en trazas

---

## DEPENDENCIAS

### ERR-001

- Ninguna dependencia externa
- La seed se puede modificar independientemente

### ERR-002

- Depende de que la funcion `gamilit.initialize_module_progress_for_users()` exista
- Verificar que la funcion esta en el DDL

---

## ESTIMACION

| Tarea | Archivos | Complejidad |
|-------|----------|-------------|
| ERR-001 | 1-2 | MEDIA (43 reemplazos) |
| ERR-002 | 1 | BAJA (solo mover) |
| Validacion | 0 | MEDIA (ejecucion script) |

---

## VALIDACION POST-CORRECCION

```bash
# Ejecutar recreacion de BD
cd /home/isem/workspace-v2/projects/gamilit/apps/database
./drop-and-recreate-database.sh

# Verificar sin errores de columnas
grep -i "error" create-database-*.log | grep -v "NOTICE"

# Verificar FASE 17 completada
grep "FASE 17 completada" create-database-*.log
```

---

**Generado por:** SIMCO CAPVED - Fase Planeacion
**Fecha:** 2026-01-13
**Perfil:** Orquestador + Database-Agent
