# Scripts de Corrección DDL - Gamilit

**Fecha**: 2025-11-08
**Versión**: 1.0

---

## Descripción

Este directorio contiene scripts de corrección para resolver los **93 problemas** detectados en la validación exhaustiva de los archivos DDL de Gamilit.

**Reporte completo**: `apps/database/REPORTE-VALIDACION-EXHAUSTIVA-DDL-2025-11-08.md`

---

## Estructura de Correcciones

### Scripts P0 (BLOQUEANTES) - Ejecutar ANTES de crear la BD

Estos scripts corrigen errores críticos que impiden la creación exitosa de la base de datos.

| Script | Descripción | Problemas | Tiempo |
|--------|-------------|-----------|---------|
| `fix-enum-schemas.sql` | Corrige 23 referencias de ENUMs que usan `public` en lugar del schema correcto | P0-1 | 5 min |
| `create-missing-functions.sql` | Crea 2 funciones faltantes (`is_super_admin`, `initialize_user_missions`) | P0-2 | 2 min |
| `fix-broken-functions.sql` | Corrige 4 funciones con errores de lógica, elimina 2 funciones con dependencias inexistentes | P0-3 | 5 min |
| `/ddl/schemas/progress_tracking/enums/progress_status.sql` | Crea ENUM faltante `progress_status` | P0-4 | 1 min |

**Total P0**: ~13 minutos

### Scripts P1 (CRÍTICOS) - Ejecutar DESPUÉS de crear la BD

Estos scripts corrigen problemas críticos que comprometen la integridad de datos.

| Script | Descripción | Problemas | Tiempo |
|--------|-------------|-----------|---------|
| `fix-fk-references.sql` | Corrige 12 FK que apuntan a `auth.users` en lugar de `auth_management.profiles` | P1-1 | 3 min |
| `fix-function-volatility.sql` | Corrige volatilidad de `gamilit.now_mexico()` de IMMUTABLE a STABLE | P1-2 | 2 min |
| `add-on-delete-clauses.sql` | Agrega cláusulas ON DELETE a 15 FK que no las tienen | P1-3 | 3 min |

**Total P1**: ~8 minutos

### Scripts de Validación

| Script | Descripción | Uso |
|--------|-------------|-----|
| `validate-post-correction.sql` | Valida que todas las correcciones P0 y P1 fueron aplicadas correctamente | Después de P1 |

---

## Guía de Ejecución

### Opción A: Crear BD desde cero (RECOMENDADO)

Si estás creando la base de datos por primera vez:

```bash
# 1. Aplicar correcciones P0 a archivos DDL
cd apps/database

# 1.1. Corregir referencias de ENUMs en archivos DDL
bash scripts/fix-enum-schemas.sql

# 1.2. Crear archivo ENUM faltante
# (Ya existe: ddl/schemas/progress_tracking/enums/progress_status.sql)

# 1.3. Eliminar archivos de funciones rotas
rm ddl/schemas/educational_content/functions/calculate_learning_path.sql
rm ddl/schemas/educational_content/functions/get_recommended_missions.sql

# 2. Crear base de datos con script maestro
./create-database.sh "$DATABASE_URL"

# 3. Aplicar scripts P0 de funciones (en BD)
psql "$DATABASE_URL" -f scripts/create-missing-functions.sql
psql "$DATABASE_URL" -f scripts/fix-broken-functions.sql

# 4. Aplicar scripts P1 (en BD)
psql "$DATABASE_URL" -f scripts/fix-fk-references.sql
psql "$DATABASE_URL" -f scripts/fix-function-volatility.sql
psql "$DATABASE_URL" -f scripts/add-on-delete-clauses.sql

# 5. Validar correcciones
psql "$DATABASE_URL" -f scripts/validate-post-correction.sql

# 6. Verificar que todo está OK
echo "✅ Si todas las validaciones pasaron, la BD está lista para usar"
```

### Opción B: BD existente con datos

Si ya tienes una base de datos con datos:

```bash
# ADVERTENCIA: Hacer backup primero
pg_dump "$DATABASE_URL" > backup-gamilit-$(date +%Y%m%d).sql

# Aplicar solo scripts P1 (P0 requiere recrear BD)
cd apps/database

psql "$DATABASE_URL" -f scripts/fix-fk-references.sql
psql "$DATABASE_URL" -f scripts/fix-function-volatility.sql
psql "$DATABASE_URL" -f scripts/add-on-delete-clauses.sql

# Validar
psql "$DATABASE_URL" -f scripts/validate-post-correction.sql
```

---

## Detalles de Cada Script

### P0-1: fix-enum-schemas.sql

**Propósito**: Corregir referencias de ENUMs en archivos DDL

**Método**: Script bash que usa `sed` para reemplazar referencias

**Archivos modificados**: 15 archivos DDL

**Ejemplo de cambio**:
```sql
-- ANTES:
type notification_type NOT NULL

-- DESPUÉS:
type gamification_system.notification_type NOT NULL
```

**Ejecución**:
```bash
bash scripts/fix-enum-schemas.sql
```

**Verificación**:
```bash
git diff ddl/schemas/
```

---

### P0-2: create-missing-functions.sql

**Propósito**: Crear 2 funciones que son referenciadas pero no existen

**Funciones creadas**:
1. `gamilit.is_super_admin(UUID)` - Verifica si usuario es super admin
2. `gamilit.has_role(UUID, VARCHAR)` - Verifica si usuario tiene un rol
3. `gamilit.initialize_user_missions(UUID)` - Stub para inicializar misiones (no implementado)

**Ejecución**:
```sql
psql "$DATABASE_URL" -f scripts/create-missing-functions.sql
```

**Verificación**:
```sql
SELECT proname, provolatile
FROM pg_proc
WHERE proname IN ('is_super_admin', 'has_role', 'initialize_user_missions');

-- Debería retornar 3 filas
```

---

### P0-3: fix-broken-functions.sql

**Propósito**: Corregir 4 funciones con errores de lógica

**Acciones**:
- ✅ **Corregir** `process_exercise_completion`: Fórmula de nivel (SQRT en lugar de división)
- ✅ **Corregir** `log_audit_event`: Nombres de columnas (auth_user_id, old_values, new_values)
- ✅ **Corregir** `calculate_user_rank`: Contar ejercicios desde exercise_submissions
- ❌ **Eliminar** `calculate_learning_path`: Tabla missions no existe
- ❌ **Eliminar** `get_recommended_missions`: Tabla missions no existe

**Ejecución**:
```sql
psql "$DATABASE_URL" -f scripts/fix-broken-functions.sql
```

**Verificación**:
```sql
-- Verificar que funciones corregidas existen
SELECT proname FROM pg_proc
WHERE proname IN ('process_exercise_completion', 'log_audit_event', 'calculate_user_rank');

-- Verificar que funciones eliminadas NO existen
SELECT proname FROM pg_proc
WHERE proname IN ('calculate_learning_path', 'get_recommended_missions');
-- Debería retornar 0 filas
```

---

### P0-4: progress_status.sql

**Propósito**: Crear ENUM faltante `progress_status`

**Ubicación**: `ddl/schemas/progress_tracking/enums/progress_status.sql`

**Valores**:
- `not_started`
- `in_progress`
- `completed`
- `abandoned`
- `needs_review`

**Ejecución**: Automática al ejecutar `create-database.sh`

**Verificación**:
```sql
SELECT enumlabel
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'progress_status';

-- Debería retornar 5 filas
```

---

### P1-1: fix-fk-references.sql

**Propósito**: Corregir FK que apuntan a `auth.users` en lugar de `auth_management.profiles`

**Tablas afectadas**:
- `social_features.friendships` (2 FK)
- `social_features.team_members` (1 FK)
- `social_features.classroom_members` (1 FK)
- `content_management.flagged_content` (1 FK)
- `content_management.user_activity` (1 FK)

**Ejecución**:
```sql
psql "$DATABASE_URL" -f scripts/fix-fk-references.sql
```

**Verificación**:
```sql
-- No debería haber FK a auth.users (excepto desde auth schema)
SELECT COUNT(*)
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_schema = 'auth'
  AND ccu.table_name = 'users'
  AND tc.table_schema NOT IN ('pg_catalog', 'information_schema', 'auth');

-- Debería retornar 0
```

---

### P1-2: fix-function-volatility.sql

**Propósito**: Corregir volatilidad de `gamilit.now_mexico()` de IMMUTABLE a STABLE

**Razón**: La función usa `NOW()` que es STABLE, no IMMUTABLE.

**Consecuencia de error**: Cache incorrecto de valores, resultados impredecibles en índices.

**Ejecución**:
```sql
psql "$DATABASE_URL" -f scripts/fix-function-volatility.sql
```

**Verificación**:
```sql
SELECT proname, provolatile
FROM pg_proc
WHERE proname = 'now_mexico';

-- provolatile debería ser 's' (STABLE)
```

---

### P1-3: add-on-delete-clauses.sql

**Propósito**: Agregar cláusulas ON DELETE a 15 FK que no las tienen

**Comportamientos agregados**:
- **CASCADE**: 10 FK (relaciones de composición)
- **RESTRICT**: 3 FK (relaciones de catálogo)
- **SET NULL**: 2 FK (relaciones de auditoría)

**Ejecución**:
```sql
psql "$DATABASE_URL" -f scripts/add-on-delete-clauses.sql
```

**Verificación**:
```sql
-- Ver distribución de ON DELETE behaviors
SELECT delete_rule, COUNT(*)
FROM information_schema.referential_constraints
WHERE constraint_schema NOT IN ('pg_catalog', 'information_schema')
GROUP BY delete_rule;
```

---

### validate-post-correction.sql

**Propósito**: Validar que todas las correcciones fueron aplicadas correctamente

**Validaciones**:
- ✅ No hay ENUMs en schema `public`
- ✅ Funciones faltantes fueron creadas
- ✅ Funciones rotas fueron corregidas/eliminadas
- ✅ ENUM `progress_status` existe
- ✅ No hay FK a `auth.users`
- ✅ `now_mexico()` es STABLE
- ✅ Mayoría de FK tienen ON DELETE explícito

**Ejecución**:
```sql
psql "$DATABASE_URL" -f scripts/validate-post-correction.sql
```

**Resultado esperado**:
```
✅ ALL CRITICAL CORRECTIONS VALIDATED SUCCESSFULLY!

Database is ready for:
  1. Backend integration testing
  2. Data seeding
  3. RLS policy testing
```

---

## Troubleshooting

### Error: "relation does not exist"

**Causa**: Intentaste ejecutar scripts P1 antes de crear la BD.

**Solución**: Ejecutar `create-database.sh` primero.

### Error: "type does not exist"

**Causa**: Referencias de ENUMs no fueron corregidas en archivos DDL.

**Solución**: Ejecutar `bash scripts/fix-enum-schemas.sql` antes de `create-database.sh`.

### Error: "function does not exist"

**Causa**: Funciones faltantes no fueron creadas.

**Solución**: Ejecutar `scripts/create-missing-functions.sql`.

### Warning: "FK still point to auth.users"

**Causa**: Script `fix-fk-references.sql` no se ejecutó o falló parcialmente.

**Solución**: Revisar el log del script y ejecutar manualmente los ALTER TABLE que fallaron.

---

## Orden de Ejecución Completo

**Para BD nueva**:

1. ✅ `bash scripts/fix-enum-schemas.sql` (modifica archivos DDL)
2. ✅ `./create-database.sh "$DATABASE_URL"` (crea BD)
3. ✅ `psql "$DATABASE_URL" -f scripts/create-missing-functions.sql`
4. ✅ `psql "$DATABASE_URL" -f scripts/fix-broken-functions.sql`
5. ✅ `psql "$DATABASE_URL" -f scripts/fix-fk-references.sql`
6. ✅ `psql "$DATABASE_URL" -f scripts/fix-function-volatility.sql`
7. ✅ `psql "$DATABASE_URL" -f scripts/add-on-delete-clauses.sql`
8. ✅ `psql "$DATABASE_URL" -f scripts/validate-post-correction.sql`

**Para BD existente**:

1. ⚠️ `pg_dump "$DATABASE_URL" > backup.sql` (BACKUP!)
2. ✅ `psql "$DATABASE_URL" -f scripts/fix-fk-references.sql`
3. ✅ `psql "$DATABASE_URL" -f scripts/fix-function-volatility.sql`
4. ✅ `psql "$DATABASE_URL" -f scripts/add-on-delete-clauses.sql`
5. ✅ `psql "$DATABASE_URL" -f scripts/validate-post-correction.sql`

---

## Siguientes Pasos

Después de ejecutar todos los scripts de corrección:

1. ✅ Ejecutar `validate-post-correction.sql` y verificar que todas las validaciones pasen
2. ✅ Ejecutar tests de integración del backend
3. ✅ Aplicar datos semilla (seed data) si existen
4. ⚠️ Considerar aplicar correcciones P2 (mejoras) según prioridad
5. ✅ Crear documentación actualizada de la estructura de BD

---

## Archivos Relacionados

- `../REPORTE-VALIDACION-EXHAUSTIVA-DDL-2025-11-08.md` - Reporte completo de validación
- `../REPORTE-COMPLETITUD-DDL-2025-11-08.md` - Inventario de archivos DDL
- `../README-CREAR-BD.md` - Guía para crear la base de datos
- `../create-database.sh` - Script maestro de creación

---

**Documento creado**: 2025-11-08
**Última actualización**: 2025-11-08
**Autor**: Sistema de validación DDL
**Versión**: 1.0
