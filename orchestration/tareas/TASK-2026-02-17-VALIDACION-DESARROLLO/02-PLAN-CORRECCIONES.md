# 02-PLAN-CORRECCIONES.md

**Fecha:** 2026-02-14
**Tarea:** TASK-2026-02-17-VALIDACION-DESARROLLO
**Status:** PROPUESTO (pendiente aprobacion)

---

## Orden de Ejecucion

Las correcciones deben ejecutarse en orden de prioridad y dependencias:

```
CORR-01 (P0, env validation) ─────────────────────────┐
                                                        ├─→ Re-validar: Backend arranca
CORR-02 (P2, lint errors) ────────────────────────────┘

CORR-03 (P1, DB init errors) ─────────────────────────┐
                                                        ├─→ Re-validar: BD counts OK
CORR-04 (P1, RLS deficit)  ───────────────────────────┘

CORR-05 (P2, seeds errors) ──→ depende de CORR-03/04 ─→ Re-validar: Seeds cargados
```

---

## CORR-01 [P0] Fix env.validation.ts — Agregar Tipos Explicitos

**Archivo:** `apps/backend/src/config/env.validation.ts`
**Cambio:** Agregar anotacion de tipo explicita `: number` a PORT y DB_PORT

**Antes:**
```typescript
@IsNumber()
@Min(1)
@Max(65535)
PORT = 3006;

@IsNumber()
@IsOptional()
DB_PORT = 5432;
```

**Despues:**
```typescript
@IsNumber()
@Min(1)
@Max(65535)
PORT: number = 3006;

@IsNumber()
@IsOptional()
DB_PORT: number = 5432;
```

**Tambien revisar** otros campos sin tipo explicito que tienen default value:
- `DB_HOST = 'localhost'` → `DB_HOST: string = 'localhost'` (tiene `@IsString()` + `@IsOptional()`, podria fallar igualmente)
- `DB_USERNAME = 'gamilit_user'` → `DB_USERNAME: string = 'gamilit_user'`
- `DB_DATABASE = 'gamilit_platform'` → `DB_DATABASE: string = 'gamilit_platform'`

**Validacion:** Rebuild + re-run `ts-node` env validation test + `npm run dev` debe arrancar y responder en `/api/health`.

**Esfuerzo:** ~5 min
**Riesgo:** Minimo — cambio aditivo, no modifica logica

---

## CORR-02 [P2] Fix Backend Lint Errors (7 errores)

**Archivos afectados (2 archivos):**

### A) `modules/educational/services/exercise-attempt.service.ts:318-319`
- Error: `no-case-declarations` (x2)
- Fix: Envolver case body en `{ }` braces
- Nota: modulo educational ESTA importado — este fix es funcional

### B) `modules/visualization/services/aggregation.service.ts:180-192`
- Error: `no-case-declarations` (x5)
- Fix: Envolver cada case body en `{ }` braces
- Nota: modulo visualization NO esta importado

**Validacion:** `npm run lint` debe pasar con 0 errors (warnings OK).

**Esfuerzo:** ~10 min
**Riesgo:** Minimo — modulos no importados

---

## CORR-03 [P1] Investigar y Corregir Errores de Creacion BD

**Requiere:** Capturar errores DETALLADOS de init-database.sh con `ON_ERROR_STOP=1` o logs verbose.

### Paso 1: Obtener errores exactos
```bash
# Re-ejecutar init con logging verbose
wsl -d Ubuntu-24.04 -u developer -- bash -c "
  cd /mnt/c/Empresas/ISEM/gamilit-workspace
  bash apps/database/scripts/recreate-database.sh --env dev --force 2>&1 | tee /tmp/db-init-verbose.log
"
```

### Paso 2: Clasificar errores

**Funciones (3 errores):**
1. `02-retry_pending_initializations.sql` — probablemente referencia tabla/funcion faltante
2. `cleanup_old_system_logs.sql` — probablemente referencia tabla `system_logs` no creada
3. `cleanup_old_user_activity.sql` — probablemente referencia tabla no creada

**Vistas (5 errores):**
1. `classroom_overview.sql` — posible dependencia de funcion o tabla faltante
2. `moderation_queue.sql` — posible dependencia de tabla communication
3. `v_student_engagement_metrics.sql` — ML module view
4. `v_student_feature_base.sql` — ML module view
5. `v_student_performance_metrics.sql` — ML module view

**Indices (14 errores):**
- Probablemente referencian tablas que no se crearon o columnas renombradas

**Triggers (3 errores):**
1. `01-trg_set_default_tenant.sql` — CRITICO para multi-tenancy
2. `00-batch_updated_at_triggers.sql` — IMPORTANTE para audit
3. `28-trg_update_missions_on_use_comodines.sql` — gamification

### Paso 3: Corregir DDL
- Cada error DDL requiere analisis individual del SQL file vs estado actual de la BD
- Posibles fixes: rename tabla singular→plural, agregar dependencia faltante, fix FK references

**Validacion:** Re-ejecutar init-database.sh con 0 errores en funciones, vistas, indices, triggers.

**Esfuerzo:** ~2-4 horas (investigacion + correcciones)
**Riesgo:** Medio — cambios DDL pueden tener efectos cascada

---

## CORR-04 [P1] Corregir Deficit de RLS Policies

**Delta:** 195 actual vs 227 esperado = 32 policies faltantes

**Hipotesis:** Los 16+3=19 archivos RLS con error probablemente contienen las 32 policies faltantes. Los errores son probablemente cascada de:
1. Tablas faltantes (4 tablas missing)
2. Funciones faltantes (3 funciones con error)
3. Orden de ejecucion incorrecto en init-database.sh

**Accion:** Resolver como parte de CORR-03 (misma raiz). Si las tablas y funciones se crean correctamente, las policies deberian crearse sin error.

**Validacion:** `SELECT COUNT(*) FROM pg_policies;` debe retornar >=220 (idealmente 227).

**Esfuerzo:** Incluido en CORR-03
**Riesgo:** Bajo si CORR-03 se resuelve primero

---

## CORR-05 [P2] Corregir Seeds (30 errores de 65)

**Depende de:** CORR-03 y CORR-04

**Hipotesis:** Muchos seeds fallan porque referencian tablas, columnas o FK constraints que no se crearon correctamente. Ejemplos:
- `profiles.sql` falla si tabla `profiles` tiene FK a tabla inexistente
- `user_roles.sql` falla si ENUM o columna no existe
- `audit-logs.sql` falla si tabla `audit_logs` no tiene trigger o constraint

**Accion:**
1. Resolver CORR-03 primero (DDL correcto = seeds funcionan)
2. Re-ejecutar init-database.sh
3. Verificar que seeds cargan >90% sin error

**Validacion:** `<= 5 seeds con error` (idealmente 0).

**Esfuerzo:** Mayoria se resuelve con CORR-03. Seeds individuales que fallan: ~1 hora
**Riesgo:** Bajo

---

## Resumen de Esfuerzo Estimado

| Correccion | Prioridad | Esfuerzo | Riesgo |
|------------|-----------|----------|--------|
| CORR-01 | P0 | 5 min | Minimo |
| CORR-02 | P2 | 10 min | Minimo |
| CORR-03 | P1 | 2-4 horas | Medio |
| CORR-04 | P1 | (incluido en CORR-03) | Bajo |
| CORR-05 | P2 | ~1 hora adicional | Bajo |

**Total estimado:** 3-5 horas

**Recomendacion:** Ejecutar CORR-01 inmediatamente (desbloquea backend). CORR-02 en paralelo. CORR-03/04/05 como sprint dedicado de BD.
