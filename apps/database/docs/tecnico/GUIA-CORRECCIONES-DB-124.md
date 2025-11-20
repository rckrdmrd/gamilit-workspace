# Guía de Correcciones Críticas DB-124

**Audiencia:** Desarrolladores, DevOps
**Propósito:** Aplicar correcciones obligatorias antes de clean load
**Fecha:** 2025-11-19

---

## Resumen

La auditoría DB-124 identificó **4 bloqueadores críticos** que deben corregirse antes de ejecutar clean load. Esta guía proporciona pasos exactos para aplicar cada corrección.

**Estado actual:**
- ✅ Corrección 1: Soft-delete (APLICADA - 2025-11-19)
- ✅ Corrección 2: DATABASE_INVENTORY.yml (APLICADA - 2025-11-19)
- ✅ Corrección 3: Issue M6-001 (APLICADA - 2025-11-19)
- ✅ Corrección 4: create-database.sh (APLICADA - 2025-11-19 14:45)
- ✅ Corrección 5: bloom_taxonomy ENUM (APLICADA - 2025-11-19 14:46)
- ✅ Corrección 6: Ejercicios M4-M5 (VALIDADA - 2025-11-19 14:47)
- ✅ Clean Load Test: EXITOSO (2025-11-19 14:47)

---

## Corrección 4: Modificar create-database.sh (🔴 P0)

### Problema

Script intentará cargar archivos que no existen y cargará notifications dos veces, causando fallo.

### Hallazgos Relacionados

- H-037: Archivos módulos 4-5 faltantes
- H-042: Notifications seeds duplicado
- H-046/H-047: Script con 2 bloqueadores

### Pasos

#### 1. Abrir archivo

```bash
cd /path/to/gamilit/projects/gamilit/apps/database
nano create-database.sh
```

#### 2. Comentar línea 517 (módulo 4)

**ANTES:**
```bash
execute_sql "$SEEDS_DIR/educational_content/05-exercises-module4.sql" "Seeds: Module 4 - Digital (9 exercises)"
```

**DESPUÉS:**
```bash
# execute_sql "$SEEDS_DIR/educational_content/05-exercises-module4.sql" "Seeds: Module 4 - Digital (9 exercises)"
```

#### 3. Comentar línea 518 (módulo 5)

**ANTES:**
```bash
execute_sql "$SEEDS_DIR/educational_content/06-exercises-module5.sql" "Seeds: Module 5 - Creativo (3 exercises)"
```

**DESPUÉS:**
```bash
# execute_sql "$SEEDS_DIR/educational_content/06-exercises-module5.sql" "Seeds: Module 5 - Creativo (3 exercises)"
```

#### 4. Actualizar comentario línea 525

**ANTES:**
```bash
# Total: 27 ejercicios production-ready con estructura JSONB completa
```

**DESPUÉS:**
```bash
# Total: 15 ejercicios production-ready (módulos 1-3) - Módulos 4-5 en backlog
```

#### 5. Eliminar línea 535 (notifications duplicado)

**ANTES (línea 535):**
```bash
execute_sql "$SEEDS_DIR/notifications/01-notification_templates.sql" "Seeds: notification_templates (8 templates)"
```

**DESPUÉS:**
```
(eliminar línea completa - ya se carga en línea 492)
```

#### 6. Guardar y verificar

```bash
# Guardar archivo (Ctrl+O, Enter, Ctrl+X en nano)

# Verificar cambios
grep -n "05-exercises-module4" create-database.sh
# Debe mostrar línea comentada: # execute_sql...

grep -n "notifications/01-notification" create-database.sh
# Debe mostrar solo 1 línea (línea 492)
```

### Validación

```bash
# Contar execute_sql de educational_content
grep "execute_sql.*educational_content" create-database.sh | grep -v "^#" | wc -l
# Debe ser 8 (era 10)

# Contar execute_sql de notifications
grep "execute_sql.*notifications" create-database.sh | grep -v "^#" | wc -l
# Debe ser 1 (era 2)
```

### Tiempo Estimado

5 minutos

---

## Corrección 5: Eliminar bloom_taxonomy ENUM (🔴 P1)

### Problema

Existe ENUM duplicado representando mismo concepto en inglés y español, ambos sin uso.

### Hallazgo Relacionado

- H-032: Bloom Taxonomy duplicado

### Pasos

#### 1. Verificar que no tiene uso

```sql
-- Conectar a BD
psql -h localhost -U gamilit_user -d gamilit_platform

-- Verificar uso (debe ser 0)
SELECT COUNT(*) FROM information_schema.columns
WHERE udt_schema = 'educational_content'
  AND udt_name = 'bloom_taxonomy';
-- Resultado esperado: 0
```

#### 2. Eliminar ENUM

```sql
-- Si el conteo es 0, eliminar
DROP TYPE IF EXISTS educational_content.bloom_taxonomy CASCADE;

-- Verificar eliminación
\dT educational_content.*
-- No debe aparecer bloom_taxonomy

-- Mantener cognitive_level (español)
\dT+ educational_content.cognitive_level
-- Debe existir y mostrar: recordar, comprender, aplicar, analizar, evaluar, crear
```

#### 3. Salir

```sql
\q
```

### Validación

```bash
# Verificar que ya no existe
psql -h localhost -U gamilit_user -d gamilit_platform \
  -c "\dT educational_content.bloom_taxonomy"
# Debe mostrar: Did not find any relation named "bloom_taxonomy"

# Verificar que cognitive_level sí existe
psql -h localhost -U gamilit_user -d gamilit_platform \
  -c "\dT+ educational_content.cognitive_level"
# Debe mostrar los 6 valores en español
```

### Tiempo Estimado

2 minutos

---

## Corrección 6: Manejar Ejercicios Módulos 4-5 (🔴 P0)

### Problema

8 ejercicios en BD sin validadores implementados, causando experiencia no funcional para usuarios.

### Hallazgo Relacionado

- H-043: Ejercicios módulos 4-5 sin validadores

### Opciones

#### OPCIÓN A: Eliminar de BD (RÁPIDO - RECOMENDADO)

**Cuándo usar:** Módulos 4-5 no están listos para producción

```sql
-- Conectar a BD
psql -h localhost -U gamilit_user -d gamilit_platform

-- Verificar cuántos ejercicios se eliminarán
SELECT COUNT(*) FROM educational_content.exercises
WHERE module_id IN (
  SELECT id FROM educational_content.modules WHERE order_index IN (4, 5)
);
-- Debe mostrar: 8

-- Eliminar ejercicios
DELETE FROM educational_content.exercises
WHERE module_id IN (
  SELECT id FROM educational_content.modules WHERE order_index IN (4, 5)
);

-- Verificar eliminación
SELECT COUNT(*) FROM educational_content.exercises;
-- Debe mostrar: 18 (26 - 8 = 18)

\q
```

**Tiempo:** 5 minutos

---

#### OPCIÓN B: Marcar como draft (MEDIO)

**Cuándo usar:** Módulos 4-5 estarán listos pronto, pero necesitas filtrar en UI

```sql
-- Conectar a BD
psql -h localhost -U gamilit_user -d gamilit_platform

-- 1. Agregar columna status si no existe
ALTER TABLE educational_content.exercises
ADD COLUMN IF NOT EXISTS status educational_content.module_status DEFAULT 'published';

-- 2. Marcar módulos 4-5 como draft
UPDATE educational_content.exercises
SET status = 'draft'
WHERE module_id IN (
  SELECT id FROM educational_content.modules WHERE order_index IN (4, 5)
);

-- 3. Verificar
SELECT module_id, status, COUNT(*)
FROM educational_content.exercises
GROUP BY module_id, status
ORDER BY module_id;
-- Debe mostrar: módulos 1-3 = published, módulos 4-5 = draft

\q
```

**Luego actualizar frontend:**

```typescript
// En exercisesAPI.ts o similar
const fetchExercises = async (moduleId: string) => {
  // Agregar filtro WHERE status = 'published'
  const { data } = await supabase
    .from('exercises')
    .select('*')
    .eq('module_id', moduleId)
    .eq('status', 'published'); // NUEVO filtro

  return data;
};
```

**Tiempo:** 30 minutos (5 min SQL + 25 min frontend)

---

#### OPCIÓN C: Implementar 8 validadores (LARGO)

**Cuándo usar:** Módulos 4-5 son prioridad y se implementarán esta semana

**Validadores faltantes:**

1. validate_verificador_fake_news
2. validate_infografia_interactiva
3. validate_quiz_tiktok
4. validate_navegacion_hipertextual
5. validate_analisis_memes
6. validate_diario_multimedia
7. validate_comic_digital
8. validate_video_carta

**Pasos por validador:**

1. Crear archivo DDL `apps/database/ddl/schemas/educational_content/functions/XX-validate_[tipo].sql`
2. Implementar lógica de validación
3. Agregar config en `seeds/prod/educational_content/10-exercise_validation_config.sql`
4. Testing en dev
5. Aplicar en producción
6. Descomentar líneas 517-518 en `create-database.sh`

**Tiempo:** 80-120 horas (2-3 semanas)

---

### Recomendación

**Para producción inmediata:** OPCIÓN A (eliminar)
**Para staging/testing:** OPCIÓN B (marcar como draft)
**Para implementación completa:** OPCIÓN C (implementar validadores)

---

## Checklist Pre-Clean Load

Antes de ejecutar `./create-database.sh` en clean load:

- [ ] ✅ **Corrección 4 aplicada** (create-database.sh modificado)
  - [ ] Línea 517 comentada (módulo 4)
  - [ ] Línea 518 comentada (módulo 5)
  - [ ] Línea 525 actualizada (comentario)
  - [ ] Línea 535 eliminada (notifications)

- [ ] ✅ **Corrección 5 aplicada** (bloom_taxonomy eliminado)
  - [ ] ENUM bloom_taxonomy no existe
  - [ ] ENUM cognitive_level sí existe

- [ ] ✅ **Corrección 6 aplicada** (ejercicios M4-M5)
  - [ ] OPCIÓN A: Ejercicios eliminados (18 totales)
  - [ ] O OPCIÓN B: Ejercicios marcados como draft

- [ ] ✅ **Soft-delete verificado** (Corrección 1)
  - [ ] Columna deleted_at en profiles
  - [ ] Columna deleted_at en tenants
  - [ ] Índices idx_profiles_deleted_at y idx_tenants_deleted_at

- [ ] ✅ **DATABASE_INVENTORY.yml verificado** (Corrección 2)
  - [ ] Version 2.5.0
  - [ ] Conteos actualizados (121, 112, 112)

---

## Ejecutar Clean Load

```bash
# 1. Crear base de test
createdb -h localhost -U postgres gamilit_test

# 2. Configurar DATABASE_URL
export DATABASE_URL="postgresql://gamilit_user:PASSWORD@localhost:5432/gamilit_test"

# 3. Ejecutar script (con timeout de 15 min)
cd /path/to/gamilit/projects/gamilit/apps/database
timeout 900 ./create-database.sh

# 4. Verificar éxito
echo $?  # Debe ser 0 (éxito)

# 5. Validar objetos creados
psql $DATABASE_URL -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema');"
# Debe mostrar: ~121

psql $DATABASE_URL -c "SELECT COUNT(*) FROM educational_content.exercises;"
# Debe mostrar: 18 (si OPCIÓN A) o 26 (si OPCIÓN B)
```

---

## Rollback (Si algo sale mal)

```bash
# Si clean load falla, eliminar BD de test
dropdb -h localhost -U postgres gamilit_test

# Revisar logs
tail -100 /tmp/database-creation.log

# Corregir error y volver a intentar
```

---

## Referencias

- **Auditoría:** orchestration/database/DB-124/
- **Hallazgos:** H-032, H-037, H-042, H-043, H-046, H-047
- **Reportes:** Ciclos 4, 5, 6, 8

