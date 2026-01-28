# TASK-003: Ejecucion - Correccion school_id Usuarios

**Fecha:** 2026-01-25
**Fase:** E (Ejecucion)
**Estado:** Completada

---

## 1. Resumen de Acciones

| # | Accion | Estado |
|---|--------|--------|
| 1 | Diagnostico de estado actual | ✓ |
| 2 | Modificar trigger set_default_tenant | ✓ |
| 3 | Crear script de migracion | ✓ |
| 4 | Ejecutar trigger en BD | ✓ |
| 5 | Ejecutar migracion de datos | ✓ |
| 6 | Validar resultados | ✓ |
| 7 | Commit y push | ✓ |

---

## 2. Detalle de Ejecucion

### 2.1 Diagnostico Inicial

**Consultas ejecutadas:**
```sql
-- Verificar instituciones
SELECT id, code, name FROM social_features.schools;
-- Resultado: 1 fila (GAMILIT-DEFAULT)

-- Verificar usuarios por school_id
SELECT school_id, COUNT(*) FROM auth_management.profiles GROUP BY school_id;
-- Resultado: NULL | 48

-- Verificar distribucion por rol
SELECT role, COUNT(*) FROM auth_management.profiles GROUP BY role;
-- Resultado: student=46, admin_teacher=1, super_admin=1
```

**Diagnostico:**
- 48 usuarios con school_id = NULL
- Institucion default existe correctamente
- El problema esta en la asignacion, no en los datos maestros

### 2.2 Modificacion del Trigger

**Archivo:** `apps/database/ddl/schemas/gamilit/functions/11-set_default_tenant.sql`

**Cambios realizados:**

1. Agregada variable `v_default_school_id UUID`

2. Agregado Paso 6 despues de asignar tenant_id:
```sql
-- Paso 6: Asignar la escuela default si no se especifico
IF NEW.school_id IS NULL THEN
    -- Buscar por flag is_default en settings
    SELECT id INTO v_default_school_id
    FROM social_features.schools
    WHERE settings->>'is_default' = 'true'
      AND is_active = true
    LIMIT 1;

    -- Fallback: buscar por codigo conocido
    IF v_default_school_id IS NULL THEN
        SELECT id INTO v_default_school_id
        FROM social_features.schools
        WHERE code = 'GAMILIT-DEFAULT'
          AND is_active = true
        LIMIT 1;
    END IF;

    -- Asignar si se encontro
    IF v_default_school_id IS NOT NULL THEN
        NEW.school_id := v_default_school_id;
    END IF;
END IF;
```

3. Actualizado mensaje de log para incluir school_id

4. Actualizado comentario de la funcion

### 2.3 Creacion de Script de Migracion

**Archivo creado:** `apps/database/migrations/2026-01-25-fix-profiles-school-id.sql`

**Contenido:**
- Verificacion PRE-MIGRACION (contar usuarios sin school_id)
- UPDATE masivo asignando school_id = '99999999-9999-9999-9999-999999999999'
- Registro en metadata de la correccion aplicada
- Verificacion POST-MIGRACION
- Reporte por rol

### 2.4 Ejecucion en Base de Datos

**Comando 1 - Actualizar trigger:**
```bash
wsl -d Ubuntu-24.04 -u developer -- bash -c "PGPASSWORD='gamilit_dev_2026' \
  psql -h localhost -U gamilit_user -d gamilit_platform \
  -f '/mnt/c/.../11-set_default_tenant.sql'"
```
**Resultado:** `CREATE FUNCTION` / `COMMENT`

**Comando 2 - Ejecutar migracion:**
```bash
wsl -d Ubuntu-24.04 -u developer -- bash -c "PGPASSWORD='gamilit_dev_2026' \
  psql -h localhost -U gamilit_user -d gamilit_platform \
  -f '/mnt/c/.../2026-01-25-fix-profiles-school-id.sql'"
```
**Resultado:**
```
NOTICE: === PRE-MIGRATION STATUS ===
NOTICE: Total usuarios: 48
NOTICE: Usuarios sin school_id: 48
NOTICE: Escuela default encontrada: 99999999-9999-9999-9999-999999999999
UPDATE 48
NOTICE: === POST-MIGRATION STATUS ===
NOTICE: Total usuarios: 48
NOTICE: Usuarios sin school_id: 0 (esperado: 0)
NOTICE: Usuarios asignados a GAMILIT-DEFAULT: 48
NOTICE: SUCCESS: Todos los usuarios tienen school_id asignado
```

### 2.5 Validacion de Resultados

**Query de validacion:**
```sql
SELECT school_id,
       (SELECT code FROM social_features.schools WHERE id = school_id) as school_code,
       COUNT(*) as total
FROM auth_management.profiles
GROUP BY school_id;
```

**Resultado:**
```
              school_id               |   school_code   | total
--------------------------------------+-----------------+-------
 99999999-9999-9999-9999-999999999999 | GAMILIT-DEFAULT |    48
```

### 2.6 Commits Realizados

**Commit 1 - Repositorio gamilit:**
```
Hash: 4e5aa582
Mensaje: [FIX-SCHOOL-ID] fix: Assign school_id to all users in default institution
Archivos:
  - M apps/database/ddl/schemas/gamilit/functions/11-set_default_tenant.sql
  - A apps/database/migrations/2026-01-25-fix-profiles-school-id.sql
```

**Commit 2 - Repositorio workspace-v2:**
```
Hash: 1eb19507
Mensaje: [FIX-SCHOOL-ID] chore: Update gamilit submodule with school_id fix
Archivos:
  - M projects/gamilit (submodule)
```

---

## 3. Problemas Encontrados

| # | Problema | Resolucion |
|---|----------|------------|
| 1 | Error de sintaxis en COMMENT multilinea | Consolidar en una sola linea |
| 2 | Conexion WSL timeout | Usar PGPASSWORD explicito |

---

## 4. Verificacion Final

```
Estado ANTES:                    Estado DESPUES:
┌───────────────────────┐        ┌───────────────────────┐
│ school_id = NULL: 48  │   →    │ school_id = NULL: 0   │
│ GAMILIT-DEFAULT: 0    │        │ GAMILIT-DEFAULT: 48   │
└───────────────────────┘        └───────────────────────┘
```

| Validacion | Estado |
|------------|--------|
| Trigger ejecuta sin errores | ✓ PASA |
| Migracion ejecuta sin errores | ✓ PASA |
| 48 usuarios actualizados | ✓ PASA |
| 0 usuarios sin school_id | ✓ PASA |
| Commits en gamilit | ✓ PASA |
| Push a origin | ✓ PASA |
| Submodule actualizado en workspace-v2 | ✓ PASA |
