# SIMCO: OPERACIONES DDL (Database)

**Versión:** 1.1.0
**Fecha:** 2026-01-24
**Aplica a:** Todo agente que trabaje con base de datos PostgreSQL
**Prioridad:** OBLIGATORIA para operaciones de BD

---

## RESUMEN EJECUTIVO

> **DDL-First: Los archivos DDL son la fuente de verdad. La BD es el resultado de ejecutarlos.**

---

## CONTEXTO ARQUITECTURA LOCAL (CRITICO)

```
╔══════════════════════════════════════════════════════════════════════════╗
║                      ECOSISTEMA DE 3 WORKSPACES                           ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  workspace-bootstrap          workspace-infra           workspace-v2      ║
║  (Crea WSL nuevo)      -->    (Gestiona WSL)     <--   (Codigo DDL)      ║
║                                                                           ║
║  C:\Empresas\ISEM\            /home/developer/          C:\Empresas\ISEM\ ║
║  workspace-bootstrap          workspaces/               workspace-v2      ║
║                               workspace-infra                             ║
║                                                                           ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  Las bases de datos corren en WSL Ubuntu-24.04 (PostgreSQL :5432)        ║
║  Los archivos DDL estan en workspace-v2/projects/{proyecto}/database/    ║
║  Para cambios DDL: modificar archivo → recrear BD en WSL                 ║
║                                                                           ║
║  Ver: @TRIGGER-DDL-WSL para procedimiento de recreacion                  ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

**Credenciales de BD (Desarrollo):**

| Proyecto | Base de Datos | Usuario | Password |
|----------|---------------|---------|----------|
| gamilit | gamilit_platform | gamilit_user | gamilit_dev_2026 |
| erp-core | erp_generic | erp_admin | erp_dev_2026 |
| template-saas | template_saas_dev | template_saas_user | saas_dev_2026 |
| michangarrito | michangarrito_dev | michangarrito_dev | mch_dev_2026 |

---

## PRINCIPIO FUNDAMENTAL

```
╔══════════════════════════════════════════════════════════════════════╗
║  POLÍTICA DE CARGA LIMPIA                                            ║
║                                                                       ║
║  1. TODO cambio de BD = modificar archivo DDL                        ║
║  2. NUNCA ejecutar ALTER/CREATE directo en BD                        ║
║  3. SIEMPRE validar con recreación completa                          ║
║  4. La BD debe poder recrearse 100% desde DDL                        ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## FLUJO DDL-FIRST

```
1. CREAR/MODIFICAR ARCHIVO DDL
         │
         ▼
2. EJECUTAR CARGA LIMPIA COMPLETA
   cd @DB_SCRIPTS && ./{RECREATE_CMD}
         │
         ▼
3. ¿PASA SIN ERRORES?
   ├── SÍ → Continuar a paso 4
   └── NO → Volver a paso 1 (corregir DDL)
         │
         ▼
4. VALIDAR ESTRUCTURA
   \dt, \di, \d tabla
         │
         ▼
5. COMMIT ARCHIVO DDL
```

---

## ESTRUCTURA DE ARCHIVOS DDL

```
{DB_DDL_PATH}/
├── 00-init.sql                          # Extensiones, tipos base
└── schemas/
    ├── {schema_1}/
    │   ├── 00-schema.sql                # CREATE SCHEMA
    │   ├── tables/
    │   │   ├── 01-{tabla}.sql           # Tablas en orden de dependencia
    │   │   └── 02-{tabla}.sql
    │   ├── functions/
    │   │   └── {funcion}.sql
    │   └── triggers/
    │       └── trg_{tabla}_{accion}.sql
    └── {schema_2}/
        └── ...

{DB_SEEDS_PATH}/
├── dev/                                 # Seeds para desarrollo
│   ├── 01-{nombre}.sql
│   └── 02-{nombre}.sql
└── prod/                                # Seeds para producción
    └── 01-{nombre}.sql
```

---

## CONVENCIONES DE NOMENCLATURA

### Schemas
```sql
-- snake_case
CREATE SCHEMA auth_management;
CREATE SCHEMA gamification_system;
CREATE SCHEMA project_management;
```

### Tablas
```sql
-- snake_case, plural
CREATE TABLE users;
CREATE TABLE student_progress;
CREATE TABLE badge_awards;
```

### Columnas
```sql
-- snake_case
user_id UUID
first_name VARCHAR(100)
created_at TIMESTAMP
is_active BOOLEAN
```

### Índices
```sql
-- idx_{tabla}_{columna(s)}
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status_created ON users(status, created_at);
CREATE UNIQUE INDEX idx_users_username ON users(username);
```

### Foreign Keys
```sql
-- fk_{tabla}_to_{tabla_referenciada}
CONSTRAINT fk_students_to_users
    FOREIGN KEY (user_id)
    REFERENCES auth_management.users(id)
```

### Check Constraints
```sql
-- chk_{tabla}_{columna}
CONSTRAINT chk_users_status
    CHECK (status IN ('active', 'inactive', 'suspended'))
```

### Triggers
```sql
-- trg_{tabla}_{accion}
CREATE TRIGGER trg_users_updated
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Functions
```sql
-- snake_case con verbo
CREATE FUNCTION calculate_user_level()
CREATE FUNCTION award_badge_to_user()
CREATE FUNCTION update_updated_at_column()
```

---

## TEMPLATE DE ARCHIVO DDL

```sql
-- ============================================================================
-- Tabla: {nombre_tabla}
-- Schema: {schema}
-- Descripción: {descripción breve de la tabla y su propósito}
-- Autor: {Agente}
-- Fecha: {YYYY-MM-DD}
-- Dependencias: {lista de tablas de las que depende o "Ninguna"}
-- ============================================================================

-- Eliminar si existe (solo desarrollo)
DROP TABLE IF EXISTS {schema}.{tabla} CASCADE;

-- ============================================================================
-- CREAR TABLA
-- ============================================================================
CREATE TABLE {schema}.{tabla} (
    -- ─────────────────────────────────────────────────────────────────────
    -- Identificador
    -- ─────────────────────────────────────────────────────────────────────
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- ─────────────────────────────────────────────────────────────────────
    -- Campos de Negocio
    -- ─────────────────────────────────────────────────────────────────────
    {campo_1} {TIPO} {NOT NULL} {DEFAULT},
    {campo_2} {TIPO} {NOT NULL} {DEFAULT},

    -- ─────────────────────────────────────────────────────────────────────
    -- Referencias (Foreign Keys inline o al final)
    -- ─────────────────────────────────────────────────────────────────────
    {fk_campo} UUID,

    -- ─────────────────────────────────────────────────────────────────────
    -- Auditoría
    -- ─────────────────────────────────────────────────────────────────────
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by UUID,

    -- ─────────────────────────────────────────────────────────────────────
    -- Constraints
    -- ─────────────────────────────────────────────────────────────────────
    CONSTRAINT fk_{tabla}_to_{ref}
        FOREIGN KEY ({fk_campo})
        REFERENCES {schema_ref}.{tabla_ref}(id)
        ON DELETE {CASCADE|SET NULL|RESTRICT},

    CONSTRAINT chk_{tabla}_{campo}
        CHECK ({condicion})
);

-- ============================================================================
-- COMENTARIOS
-- ============================================================================
COMMENT ON TABLE {schema}.{tabla} IS
    '{Descripción de la tabla}';

COMMENT ON COLUMN {schema}.{tabla}.{campo_1} IS
    '{Descripción del campo, valores válidos, restricciones}';

COMMENT ON COLUMN {schema}.{tabla}.{campo_2} IS
    '{Descripción del campo}';

-- ============================================================================
-- ÍNDICES
-- ============================================================================

-- Índice para búsqueda por {criterio}
CREATE INDEX idx_{tabla}_{campo}
    ON {schema}.{tabla}({campo});

-- Índice único para {criterio}
CREATE UNIQUE INDEX idx_{tabla}_{campo}_unique
    ON {schema}.{tabla}({campo});

-- Índice compuesto para {criterio}
CREATE INDEX idx_{tabla}_{campo1}_{campo2}
    ON {schema}.{tabla}({campo1}, {campo2});

-- ============================================================================
-- TRIGGER DE AUDITORÍA
-- ============================================================================
CREATE TRIGGER trg_{tabla}_updated
    BEFORE UPDATE ON {schema}.{tabla}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (si aplica)
-- ============================================================================
ALTER TABLE {schema}.{tabla} ENABLE ROW LEVEL SECURITY;

CREATE POLICY {tabla}_select_policy
    ON {schema}.{tabla}
    FOR SELECT
    USING ({condicion_rls});

CREATE POLICY {tabla}_insert_policy
    ON {schema}.{tabla}
    FOR INSERT
    WITH CHECK ({condicion_rls});

-- ============================================================================
-- FIN DE ARCHIVO
-- ============================================================================
```

---

## COMANDOS DE VALIDACIÓN

### Carga Limpia (OBLIGATORIO)
```bash
cd @DB_SCRIPTS
./{RECREATE_CMD}
# DEBE completar sin errores
```

### Verificar Estructura
```bash
# Listar schemas
psql -d {DB_NAME} -c "\dn"

# Listar tablas de un schema
psql -d {DB_NAME} -c "\dt {schema}.*"

# Ver estructura de tabla
psql -d {DB_NAME} -c "\d {schema}.{tabla}"

# Ver índices
psql -d {DB_NAME} -c "\di {schema}.*"

# Ver constraints
psql -d {DB_NAME} -c "\d+ {schema}.{tabla}"
```

### Verificar Comentarios
```bash
# Ver comentario de tabla
psql -d {DB_NAME} -c "
SELECT obj_description('{schema}.{tabla}'::regclass);
"

# Ver comentarios de columnas
psql -d {DB_NAME} -c "
SELECT column_name, col_description('{schema}.{tabla}'::regclass, ordinal_position)
FROM information_schema.columns
WHERE table_schema = '{schema}' AND table_name = '{tabla}';
"
```

### Tests Básicos
```bash
# Insert de prueba
psql -d {DB_NAME} -c "
INSERT INTO {schema}.{tabla} ({columnas})
VALUES ({valores});
"

# Verificar constraint CHECK
psql -d {DB_NAME} -c "
INSERT INTO {schema}.{tabla} ({columna})
VALUES ('valor_invalido');
"
# Debe fallar con error de constraint

# Verificar FK
psql -d {DB_NAME} -c "
INSERT INTO {schema}.{tabla} ({fk_columna})
VALUES ('uuid-no-existente');
"
# Debe fallar con error de FK
```

---

## PROHIBICIONES

```
╔══════════════════════════════════════════════════════════════════════╗
║  ❌ PROHIBIDO                                                        ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  • Ejecutar ALTER TABLE directo en BD sin actualizar DDL             ║
║  • Crear carpeta migrations/                                         ║
║  • Crear archivos fix-*.sql o patch-*.sql                            ║
║  • Crear archivos migration-*.sql                                    ║
║  • Dejar BD y DDL desincronizados                                    ║
║  • Ejecutar psql -c "CREATE/ALTER..." sin archivo DDL                ║
║  • Marcar tarea completa sin carga limpia exitosa                    ║
║                                                                       ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## MODIFICAR TABLA EXISTENTE

### Proceso Correcto
```bash
# 1. Editar archivo DDL existente (NO crear migration)
vim @DDL/{schema}/tables/{NN}-{tabla}.sql

# 2. Agregar/modificar columna en CREATE TABLE
# (NO usar ALTER TABLE como cambio principal)

# 3. Ejecutar carga limpia completa
cd @DB_SCRIPTS
./{RECREATE_CMD}

# 4. Verificar cambios
psql -d {DB_NAME} -c "\d {schema}.{tabla}"

# 5. Commit cambios
git add @DDL/{schema}/tables/{NN}-{tabla}.sql
git commit -m "feat(db): add column to {tabla}"
```

### Proceso INCORRECTO
```bash
# ❌ NO hacer esto
psql -d {DB_NAME} -c "ALTER TABLE {schema}.{tabla} ADD COLUMN..."

# ❌ NO crear migration
echo "ALTER TABLE..." > migrations/002-add-column.sql

# ❌ NO crear fix temporal
echo "ALTER TABLE..." > fix-add-column.sql
```

---

## CHECKLIST DDL

```
ANTES DE CREAR
├── [ ] Verificar que tabla no existe (@INVENTORY, grep)
├── [ ] Verificar schema existe (00-schema.sql)
├── [ ] Identificar dependencias (FKs a otras tablas)
├── [ ] Determinar número de archivo (secuencial)
└── [ ] Leer tabla similar como referencia

DURANTE CREACIÓN
├── [ ] Encabezado completo (descripción, autor, fecha, deps)
├── [ ] Columnas con tipos correctos
├── [ ] Campos de auditoría (created_at, updated_at)
├── [ ] Constraints nombrados correctamente
├── [ ] Índices necesarios
├── [ ] COMMENT ON para tabla y columnas importantes
└── [ ] Trigger de updated_at (si aplica)

VALIDACIÓN
├── [ ] Carga limpia exitosa
├── [ ] Estructura verificada (\d tabla)
├── [ ] Índices verificados (\di)
├── [ ] Insert de prueba exitoso
├── [ ] Constraints funcionan (test de validación)
└── [ ] Comentarios presentes

DOCUMENTACIÓN
├── [ ] @INVENTORY actualizado
├── [ ] @TRAZA_DB actualizada
└── [ ] Entity correspondiente identificada para Backend
```

---

## ERRORES COMUNES

| Error | Causa | Solución |
|-------|-------|----------|
| FK falla | Tabla referenciada no existe | Verificar orden de creación |
| Tipo incorrecto | No alineado con diseño | Consultar especificación |
| Sin comentarios | Olvidó COMMENT ON | Template incluye comentarios |
| Sin índices | No pensó en queries | Agregar para columnas de búsqueda |
| Carga limpia falla | DDL con errores | Corregir DDL, no fix manual |

---

## REFERENCIAS

- **Crear archivos:** @CREAR (SIMCO-CREAR.md)
- **Validar:** @VALIDAR (SIMCO-VALIDAR.md)
- **Documentar:** @DOCUMENTAR (SIMCO-DOCUMENTAR.md)
- **Política carga limpia:** @DIRECTIVAS/DIRECTIVA-POLITICA-CARGA-LIMPIA.md
- **Diseño de BD:** @DIRECTIVAS/DIRECTIVA-DISENO-BASE-DATOS.md
- **Nomenclatura:** @DIRECTIVAS/ESTANDARES-NOMENCLATURA-BASE.md
- **Trigger DDL-WSL:** @TRIGGER-DDL-WSL (TRIGGER-DDL-RECREAR-BD-WSL.md) - **OBLIGATORIO**
- **Operaciones WSL:** @WSL-OPS (SIMCO-LOCAL-WSL.md)
- **Integracion Workspaces:** @WORKSPACE-INTEGRATION

---

## COMANDO DE CARGA LIMPIA (WSL)

```powershell
# COMANDO CONCRETO para recrear BD en ambiente local WSL:

# 1. Verificar servicio PostgreSQL
wsl -d Ubuntu-24.04 -u developer -- sudo systemctl status postgresql

# 2. Conectar y recrear BD
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -c "DROP DATABASE IF EXISTS {database}; CREATE DATABASE {database} OWNER {usuario};"

# 3. Cargar DDL
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -d {database} -f '/mnt/c/Empresas/ISEM/workspace-v2/projects/{proyecto}/database/ddl/{archivo}.sql'

# 4. Verificar
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -d {database} -c "\dt *.*"
```

**Ver @TRIGGER-DDL-WSL para procedimiento completo.**

---

**Versión:** 1.1.0 | **Sistema:** SIMCO | **Mantenido por:** Tech Lead
