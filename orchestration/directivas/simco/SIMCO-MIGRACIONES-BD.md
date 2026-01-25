# SIMCO-MIGRACIONES-BD
**Version:** 1.0.0
**Tipo:** Directiva Operacional
**Prioridad:** P0
**Alias:** @MIGRACIONES
**Creado:** 2026-01-10
**Depende de:** SIMCO-DDL.md

---

## 1. Proposito

Establecer el protocolo estandar para migraciones de base de datos, incluyendo nomenclatura, estructura, rollback obligatorio y flujo de aprobacion.

---

## 2. Principios de Migraciones

### 2.1 Inmutabilidad

- Una migracion ejecutada NUNCA se modifica
- Cambios nuevos = migracion nueva
- Historial es sagrado

### 2.2 Rollback Obligatorio

- Toda migracion UP debe tener DOWN
- Si no es reversible, documentar alternativa
- Probar rollback antes de aplicar

### 2.3 Atomicidad

- Una migracion = un cambio logico
- No mezclar DDL con DML masivo
- Transaccional cuando sea posible

### 2.4 Orden Estricto

- Ejecutar en orden cronologico
- Nunca saltar migraciones
- Resolver conflictos antes de merge

---

## 3. Nomenclatura de Archivos

### 3.1 Formato Estandar

```
{YYYYMMDDHHMMSS}_{descripcion_en_snake_case}.sql

Ejemplos:
20260110143000_create_users_table.sql
20260110150000_add_email_to_users.sql
20260110160000_create_tenants_schema.sql
```

### 3.2 Convenciones de Nombre

| Accion | Prefijo | Ejemplo |
|--------|---------|---------|
| Crear tabla | create_ | create_users_table.sql |
| Agregar columna | add_ | add_email_to_users.sql |
| Eliminar columna | remove_ | remove_legacy_field.sql |
| Crear indice | create_index_ | create_index_users_email.sql |
| Crear schema | create_schema_ | create_schema_tenants.sql |
| Datos iniciales | seed_ | seed_roles_data.sql |
| Alterar tabla | alter_ | alter_users_add_timestamps.sql |

---

## 4. Estructura de Migracion

### 4.1 Template Base

```sql
-- Migration: {YYYYMMDDHHMMSS}_{descripcion}
-- Autor: {nombre}
-- Fecha: {YYYY-MM-DD}
-- Descripcion: {descripcion detallada}
-- Rollback: {SI|NO - si NO, explicar alternativa}

-- ============================================
-- UP MIGRATION
-- ============================================

BEGIN;

-- {Comandos DDL aqui}

COMMIT;

-- ============================================
-- DOWN MIGRATION (ROLLBACK)
-- ============================================

-- Para ejecutar rollback, descomentar y ejecutar:
/*
BEGIN;

-- {Comandos de rollback aqui}

COMMIT;
*/
```

### 4.2 Ejemplo Completo

```sql
-- Migration: 20260110143000_create_users_table
-- Autor: Backend Team
-- Fecha: 2026-01-10
-- Descripcion: Crea tabla de usuarios con RLS
-- Rollback: SI

-- ============================================
-- UP MIGRATION
-- ============================================

BEGIN;

CREATE TABLE IF NOT EXISTS core.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES core.tenants(id),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_email_tenant UNIQUE (tenant_id, email)
);

-- Indices
CREATE INDEX idx_users_tenant ON core.users(tenant_id);
CREATE INDEX idx_users_email ON core.users(email);

-- RLS
ALTER TABLE core.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_tenant_isolation ON core.users
    USING (tenant_id = current_setting('app.current_tenant')::UUID);

COMMIT;

-- ============================================
-- DOWN MIGRATION (ROLLBACK)
-- ============================================

/*
BEGIN;

DROP POLICY IF EXISTS users_tenant_isolation ON core.users;
DROP TABLE IF EXISTS core.users;

COMMIT;
*/
```

---

## 5. Rollback Obligatorio

### 5.1 Reglas de Rollback

| Tipo Cambio | Rollback Posible | Estrategia |
|-------------|------------------|------------|
| CREATE TABLE | SI | DROP TABLE |
| ADD COLUMN | SI | DROP COLUMN |
| DROP COLUMN | NO* | Backup previo requerido |
| MODIFY TYPE | DEPENDE | Nueva migracion |
| DROP TABLE | NO* | Backup previo requerido |
| CREATE INDEX | SI | DROP INDEX |
| INSERT seed | SI | DELETE con WHERE |

*Requiere backup y plan de recuperacion documentado

### 5.2 Cuando NO es Posible Rollback

Si rollback no es posible, documentar:

```sql
-- Migration: 20260110170000_drop_legacy_table
-- Rollback: NO
-- Alternativa: Restaurar desde backup (ver docs/recovery/legacy_table.md)
-- Backup requerido: SI - ejecutar scripts/backup_legacy_table.sh antes
```

---

## 6. Testing de Migraciones

### 6.1 Checklist Pre-Aplicacion

- [ ] Migracion tiene rollback
- [ ] Rollback fue probado localmente
- [ ] No rompe migraciones anteriores
- [ ] Indempotente (puede correr 2 veces sin error)
- [ ] Performance verificada en dataset similar a prod

### 6.2 Script de Validacion

```bash
#!/bin/bash
# scripts/validate_migration.sh

MIGRATION_FILE=$1

# 1. Verificar sintaxis SQL
psql -h localhost -U test -d test_db -f $MIGRATION_FILE --dry-run

# 2. Aplicar migracion
psql -h localhost -U test -d test_db -f $MIGRATION_FILE

# 3. Verificar rollback
# Extraer seccion DOWN y ejecutar
sed -n '/DOWN MIGRATION/,$ p' $MIGRATION_FILE | sed 's/^--//' | psql -h localhost -U test -d test_db

# 4. Re-aplicar para verificar idempotencia
psql -h localhost -U test -d test_db -f $MIGRATION_FILE

echo "Migration validated successfully"
```

---

## 7. Documentacion Requerida

### 7.1 En el Archivo de Migracion

```sql
-- Migration: {timestamp}_{descripcion}
-- Autor: {nombre/equipo}
-- Fecha: {YYYY-MM-DD}
-- Descripcion: {que hace esta migracion}
-- Rollback: {SI|NO}
-- Impacto: {LOW|MEDIUM|HIGH}
-- Downtime: {YES|NO} - {minutos estimados si YES}
-- Dependencias: {migraciones previas requeridas}
-- Ticket: {JIRA-XXX o N/A}
```

### 7.2 En DATABASE_INVENTORY.yml

```yaml
migraciones:
  ultima: "20260110143000"
  pendientes: 0
  historial:
    - id: "20260110143000"
      archivo: "20260110143000_create_users_table.sql"
      descripcion: "Crea tabla de usuarios con RLS"
      fecha_aplicado: "2026-01-10"
      autor: "Backend Team"
      rollback_probado: true
```

---

## 8. Flujo de Aprobacion

### 8.1 Proceso Estandar

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Crear     │ --> │   Review    │ --> │   Aprobar   │
│  Migracion  │     │   por DBA   │     │   en PR     │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              v
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Produccion │ <-- │   Staging   │ <-- │   Develop   │
│   (con      │     │   (test     │     │   (apply    │
│  supervision)│    │   rollback) │     │   local)    │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 8.2 Matriz de Aprobacion

| Impacto | Review Requerido | Aprobador |
|---------|------------------|-----------|
| LOW | Code Review | Tech Lead |
| MEDIUM | Code + DBA Review | Tech Lead + DBA |
| HIGH | Code + DBA + Arch | CTO/Arquitecto |

### 8.3 Criterios de Impacto

| Nivel | Criterio |
|-------|----------|
| LOW | Solo agrega (columnas, tablas, indices) |
| MEDIUM | Modifica estructura existente |
| HIGH | Elimina datos, cambios breaking, downtime |

---

## 9. Integracion con SIMCO-DDL

### 9.1 Referencia a SIMCO-DDL

Esta directiva extiende @SIMCO-DDL con:
- Proceso de migraciones incrementales
- Protocolo de rollback
- Flujo de aprobacion

### 9.2 Patrones de DDL Aplicables

Ver SIMCO-DDL.md para:
- Patrones de nombres de tablas
- Convencion de tipos de datos
- Estructura de RLS
- Naming de constraints

---

## 10. Ubicacion de Archivos

### 10.1 Estructura de Directorio

```
apps/database/
├── migrations/
│   ├── 20260110143000_create_users_table.sql
│   ├── 20260110150000_add_email_to_users.sql
│   └── 20260110160000_create_tenants_schema.sql
├── seeds/
│   ├── 001_roles.sql
│   └── 002_permissions.sql
├── scripts/
│   ├── validate_migration.sh
│   ├── apply_migrations.sh
│   └── rollback_migration.sh
└── README.md
```

---

## 11. Referencias

| Directiva | Proposito |
|-----------|-----------|
| SIMCO-DDL.md | Patrones DDL base |
| SIMCO-INVENTARIOS.md | Registro en DATABASE_INVENTORY |
| SIMCO-DEVOPS.md | CI/CD para migraciones |

---

**Ultima actualizacion:** 2026-01-10
**Mantenido por:** Orchestration Team
