# Guia de Migraciones Expand/Contract

---
titulo: Guia de Migraciones Expand/Contract
version: 1.0.0
fecha_creacion: 2026-02-14
tags: [database, migraciones, zero-downtime, ddl]
aplica_a: [database, backend]
estado: vigente
---

**Proyecto:** GAMILIT
**Version:** 1.0.0
**Fecha:** 2026-02-14
**Aplica a:** PostgreSQL 15 + TypeORM 0.3.x (DDL-first workflow)

---

## 1. Que es Expand/Contract

El patron Expand/Contract (tambien conocido como Parallel Change) es una tecnica de migracion de base de datos que permite realizar cambios de schema sin downtime. Divide cada cambio destructivo en 3 fases independientes, cada una desplegable por separado.

### Por que es necesario en gamilit

- **169 tablas** con datos en produccion que no pueden perderse
- **418 politicas RLS** que dependen de nombres de columnas y tablas
- **67 triggers** que referencian columnas especificas
- **298 foreign keys** que crean dependencias entre schemas
- **152 entities TypeORM** que deben reflejar el schema exacto
- **Deploy con PM2** (fork mode) — hay un breve periodo donde codigo viejo y nuevo coexisten

### Compatible con DDL-first workflow

gamilit usa DDL-first: los archivos SQL en `apps/database/ddl/schemas/` son la fuente de verdad. Las entities de TypeORM son reflejo del DDL, no al reves. El patron Expand/Contract se integra naturalmente con este flujo.

---

## 2. Las 3 Fases

```
FASE 1: EXPAND (Agregar)
|-- Agregar nueva columna/tabla (nullable o con default)
|-- NO remover nada existente
|-- Codigo sigue usando estructura antigua
|-- Deploy: DDL expand -> sin cambio de codigo
|-- Duracion: minutos

FASE 2: MIGRATE (Transicionar)
|-- Codigo escribe a AMBAS estructuras (dual-write)
|-- Migrar datos existentes (backfill)
|-- Codigo lee de nueva estructura
|-- Deploy: nuevo codigo -> datos migrados
|-- Duracion: horas a dias (dependiendo del volumen de datos)

FASE 3: CONTRACT (Limpiar)
|-- Remover columna/tabla antigua
|-- Remover codigo de dual-write
|-- Limpiar constraints antiguos
|-- Deploy: DDL contract -> codigo limpio
|-- Duracion: minutos
```

### Diagrama de tiempo

```
Tiempo -->

Deploy 1 (EXPAND):
  DDL: ADD columna nueva (nullable)
  Codigo: sin cambios (usa columna vieja)
  Datos: columna nueva vacia

  [esperar que deploy sea estable]

Deploy 2 (MIGRATE):
  DDL: sin cambios
  Codigo: dual-write (escribe a ambas columnas, lee de nueva)
  Datos: backfill de datos existentes a columna nueva

  [verificar que TODOS los datos estan migrados]

Deploy 3 (CONTRACT):
  DDL: DROP columna vieja + ALTER NOT NULL en nueva
  Codigo: solo usa columna nueva
  Datos: columna vieja eliminada
```

### Regla fundamental

Cada fase es un deploy independiente. NUNCA se combinan fases en un mismo deploy. Entre cada fase debe haber verificacion de que el sistema funciona correctamente.

---

## 3. Ejemplo Practico: Renombrar Columna

### Escenario

Renombrar `auth_management.users.full_name` a dos columnas separadas: `first_name` y `last_name`.

### Fase 1: EXPAND

**Archivo DDL:** `apps/database/ddl/schemas/auth_management/migrations/EXPAND-20260214-split-fullname.sql`

```sql
-- EXPAND: Agregar columnas first_name y last_name
-- Ambas nullable porque aun no tienen datos

ALTER TABLE auth_management.users
  ADD COLUMN first_name VARCHAR(100),
  ADD COLUMN last_name VARCHAR(100);

-- Agregar indice para la nueva columna (si se necesita para busquedas)
CREATE INDEX CONCURRENTLY idx_users_first_name
  ON auth_management.users(first_name);

CREATE INDEX CONCURRENTLY idx_users_last_name
  ON auth_management.users(last_name);

COMMENT ON COLUMN auth_management.users.first_name IS 'Nombre (migrado desde full_name) — EXPAND fase';
COMMENT ON COLUMN auth_management.users.last_name IS 'Apellido (migrado desde full_name) — EXPAND fase';
```

**Entity TypeORM:** Sin cambios en esta fase. La entity sigue usando solo `fullName`.

**Deploy:**
```bash
# 1. Ejecutar DDL en produccion
psql -U postgres -d gamilit_platform -f EXPAND-20260214-split-fullname.sql

# 2. Verificar
psql -U postgres -d gamilit_platform -c "\d auth_management.users"

# 3. No se necesita restart de aplicacion
```

### Fase 2: MIGRATE

**Archivo DDL (backfill):** `apps/database/ddl/schemas/auth_management/migrations/BACKFILL-20260214-split-fullname.sql`

```sql
-- BACKFILL: Migrar datos existentes de full_name a first_name + last_name
UPDATE auth_management.users
SET
  first_name = split_part(full_name, ' ', 1),
  last_name = CASE
    WHEN position(' ' in full_name) > 0
    THEN substring(full_name from position(' ' in full_name) + 1)
    ELSE ''
  END
WHERE first_name IS NULL AND full_name IS NOT NULL;

-- Verificar migracion
-- SELECT count(*) FROM auth_management.users WHERE first_name IS NULL AND full_name IS NOT NULL;
-- Debe retornar 0
```

**Entity TypeORM:** Actualizar para dual-write.

```typescript
// apps/backend/src/modules/profile/entities/user.entity.ts
@Entity('users', { schema: 'auth_management' })
export class User {
  // Columna vieja (mantener por ahora)
  @Column({ name: 'full_name', type: 'varchar', length: 200, nullable: true })
  fullName: string;

  // Columnas nuevas
  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName: string;

  // Dual-write: sincronizar ambas representaciones
  @BeforeInsert()
  @BeforeUpdate()
  syncNames() {
    // Escribir a nueva estructura
    if (this.fullName && !this.firstName) {
      const parts = this.fullName.split(' ');
      this.firstName = parts[0];
      this.lastName = parts.slice(1).join(' ');
    }
    // Mantener vieja estructura (retrocompatibilidad)
    if (this.firstName && !this.fullName) {
      this.fullName = `${this.firstName} ${this.lastName || ''}`.trim();
    }
  }
}
```

**Service:** Actualizar para leer de nueva estructura.

```typescript
// Los services ahora usan firstName/lastName para lectura
getUserDisplayName(user: User): string {
  // Leer de nueva estructura (prioridad)
  if (user.firstName) {
    return `${user.firstName} ${user.lastName || ''}`.trim();
  }
  // Fallback a vieja estructura
  return user.fullName || 'Sin nombre';
}
```

**Deploy:**
```bash
# 1. Ejecutar backfill en produccion
psql -U postgres -d gamilit_platform -f BACKFILL-20260214-split-fullname.sql

# 2. Verificar que todos los datos fueron migrados
psql -U postgres -d gamilit_platform -c "
  SELECT count(*) AS pendientes
  FROM auth_management.users
  WHERE first_name IS NULL AND full_name IS NOT NULL;"
# Debe retornar 0

# 3. Deploy de codigo con dual-write
cd apps/backend && npm run build
pm2 restart ecosystem.config.js

# 4. Monitorear errores por 24-48 horas
```

### Fase 3: CONTRACT

**Archivo DDL:** `apps/database/ddl/schemas/auth_management/migrations/CONTRACT-20260216-drop-fullname.sql`

```sql
-- CONTRACT: Eliminar columna full_name (ya no se usa)

-- 1. Primero hacer NOT NULL las nuevas columnas (si aplica)
ALTER TABLE auth_management.users
  ALTER COLUMN first_name SET NOT NULL;

-- 2. Eliminar la columna vieja
ALTER TABLE auth_management.users
  DROP COLUMN full_name;

-- 3. Limpiar comentarios de migracion
COMMENT ON COLUMN auth_management.users.first_name IS 'Nombre del usuario';
COMMENT ON COLUMN auth_management.users.last_name IS 'Apellido del usuario';

-- 4. Actualizar politicas RLS que referencien full_name (si existen)
-- Verificar: SELECT * FROM pg_policies WHERE qual::text LIKE '%full_name%';
```

**Entity TypeORM:** Remover dual-write.

```typescript
@Entity('users', { schema: 'auth_management' })
export class User {
  // SOLO columnas nuevas (full_name eliminada)
  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName: string;

  // Sin hooks de dual-write
}
```

**Deploy:**
```bash
# 1. Deploy de codigo limpio (sin dual-write)
cd apps/backend && npm run build
pm2 restart ecosystem.config.js

# 2. Ejecutar DDL contract
psql -U postgres -d gamilit_platform -f CONTRACT-20260216-drop-fullname.sql

# 3. Verificar schema final
psql -U postgres -d gamilit_platform -c "\d auth_management.users"
```

---

## 4. Ejemplo Practico: Cambiar Tipo de Columna

### Escenario

Cambiar `gamification_system.scores.value` de `INT` a `DECIMAL(10,2)` para soportar puntuaciones parciales.

### Fase 1: EXPAND

```sql
-- EXPAND: Agregar columna value_decimal
ALTER TABLE gamification_system.scores
  ADD COLUMN value_decimal DECIMAL(10,2);

COMMENT ON COLUMN gamification_system.scores.value_decimal
  IS 'Puntuacion decimal (migrado desde value INT) — EXPAND fase';
```

### Fase 2: MIGRATE

```sql
-- BACKFILL: Copiar datos existentes
UPDATE gamification_system.scores
SET value_decimal = value::DECIMAL(10,2)
WHERE value_decimal IS NULL AND value IS NOT NULL;
```

Entity con dual-write:

```typescript
@Entity('scores', { schema: 'gamification_system' })
export class Score {
  @Column({ name: 'value', type: 'int', nullable: true })
  valueInt: number;

  @Column({ name: 'value_decimal', type: 'decimal', precision: 10, scale: 2, nullable: true })
  valueDecimal: number;

  @BeforeInsert()
  @BeforeUpdate()
  syncValues() {
    if (this.valueDecimal !== undefined && this.valueDecimal !== null) {
      this.valueInt = Math.round(this.valueDecimal);
    } else if (this.valueInt !== undefined && this.valueInt !== null) {
      this.valueDecimal = this.valueInt;
    }
  }
}
```

### Fase 3: CONTRACT

```sql
-- CONTRACT: Eliminar columna vieja, renombrar nueva
ALTER TABLE gamification_system.scores DROP COLUMN value;
ALTER TABLE gamification_system.scores RENAME COLUMN value_decimal TO value;
ALTER TABLE gamification_system.scores ALTER COLUMN value SET NOT NULL;

-- Actualizar indices que referenciaban la columna vieja
-- DROP INDEX IF EXISTS gamification_system.idx_scores_value;
-- CREATE INDEX idx_scores_value ON gamification_system.scores(value);
```

---

## 5. Ejemplo Practico: Agregar Tabla Intermedia (Many-to-Many)

### Escenario

Convertir relacion directa `students -> classrooms` (FK en students) a many-to-many con tabla intermedia `student_classrooms`.

### Fase 1: EXPAND

```sql
-- EXPAND: Crear tabla intermedia
CREATE TABLE educational_content.student_classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth_management.users(id),
  classroom_id UUID NOT NULL REFERENCES educational_content.classrooms(id),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, classroom_id)
);

-- Habilitar RLS (consistente con las 418 politicas existentes)
ALTER TABLE educational_content.student_classrooms ENABLE ROW LEVEL SECURITY;

-- Indices
CREATE INDEX idx_student_classrooms_student ON educational_content.student_classrooms(student_id);
CREATE INDEX idx_student_classrooms_classroom ON educational_content.student_classrooms(classroom_id);
```

### Fase 2: MIGRATE

```sql
-- BACKFILL: Migrar datos de FK existente a tabla intermedia
INSERT INTO educational_content.student_classrooms (student_id, classroom_id)
SELECT id, classroom_id
FROM auth_management.users
WHERE classroom_id IS NOT NULL
ON CONFLICT (student_id, classroom_id) DO NOTHING;
```

### Fase 3: CONTRACT

```sql
-- CONTRACT: Eliminar FK vieja de students
ALTER TABLE auth_management.users DROP COLUMN classroom_id;
```

---

## 6. Integracion con DDL-First de Gamilit

### 6.1 Estructura de archivos

Cada migracion Expand/Contract se organiza dentro del schema correspondiente:

```
apps/database/ddl/schemas/{schema}/
  tables/          -- DDL de tablas (estado final deseado)
  functions/       -- Funciones SQL
  triggers/        -- Triggers
  views/           -- Views
  migrations/      -- Archivos de migracion Expand/Contract
    EXPAND-{YYYYMMDD}-{descripcion}.sql
    BACKFILL-{YYYYMMDD}-{descripcion}.sql
    CONTRACT-{YYYYMMDD}-{descripcion}.sql
```

### 6.2 Convencion de nombres

| Prefijo | Fase | Descripcion |
|---------|------|-------------|
| `EXPAND-` | 1 | Agrega columnas/tablas nuevas |
| `BACKFILL-` | 2 | Migra datos existentes |
| `CONTRACT-` | 3 | Elimina estructura vieja |

Formato completo: `{PREFIJO}{FECHA}-{descripcion-kebab-case}.sql`

Ejemplos:
- `EXPAND-20260214-split-fullname.sql`
- `BACKFILL-20260214-split-fullname.sql`
- `CONTRACT-20260216-drop-fullname.sql`

### 6.3 Actualizacion del DDL canonico

Despues de completar la fase CONTRACT, el archivo de tabla canonico debe actualizarse para reflejar el estado final:

```
ANTES (en tables/):
  CREATE TABLE users (
    ...
    full_name VARCHAR(200),
    ...
  );

DESPUES (en tables/):
  CREATE TABLE users (
    ...
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    ...
  );
```

Los archivos de migracion en `migrations/` se conservan como historial pero no se ejecutan en recreaciones desde cero.

### 6.4 Relacion con init-database.sh

El script `apps/database/scripts/init-database.sh` ejecuta los archivos DDL canonicos (en `tables/`, `functions/`, etc.) para crear la base de datos desde cero. Los archivos de `migrations/` NO se ejecutan en este flujo — son solo para bases de datos existentes en produccion.

```
Recreacion desde cero (dev/test):
  init-database.sh -> DDL canonicos -> BD limpia

Migracion en produccion:
  EXPAND -> BACKFILL -> CONTRACT -> Actualizar DDL canonico
```

---

## 7. Integracion con TypeORM Entities

### 7.1 Fase EXPAND: Entity sin cambios

Durante la fase EXPAND, la entity TypeORM permanece sin cambios. La nueva columna existe en la BD pero la entity no la conoce.

```typescript
// Sin cambios — entity solo tiene columnas originales
@Entity('users', { schema: 'auth_management' })
export class User {
  @Column({ name: 'full_name' })
  fullName: string;
  // first_name y last_name existen en BD pero entity no las mapea aun
}
```

### 7.2 Fase MIGRATE: Entity con dual-write

Durante la fase MIGRATE, la entity debe mapear AMBAS columnas y sincronizarlas usando lifecycle hooks de TypeORM.

```typescript
@Entity('users', { schema: 'auth_management' })
export class User {
  // AMBAS columnas mapeadas
  @Column({ name: 'full_name', nullable: true })
  fullName: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @BeforeInsert()
  @BeforeUpdate()
  syncNames() {
    // Dual-write: mantener ambas estructuras sincronizadas
    if (this.firstName && !this.fullName) {
      this.fullName = `${this.firstName} ${this.lastName || ''}`.trim();
    }
    if (this.fullName && !this.firstName) {
      const parts = this.fullName.split(' ');
      this.firstName = parts[0];
      this.lastName = parts.slice(1).join(' ');
    }
  }

  @AfterLoad()
  loadFromNewStructure() {
    // Leer preferentemente de nueva estructura
    if (this.firstName) {
      this.fullName = `${this.firstName} ${this.lastName || ''}`.trim();
    }
  }
}
```

### 7.3 Fase CONTRACT: Entity limpia

Despues del CONTRACT, la entity solo tiene las columnas nuevas.

```typescript
@Entity('users', { schema: 'auth_management' })
export class User {
  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;
  // fullName eliminada — no existe en BD
}
```

### 7.4 Consideraciones con multiples datasources

gamilit tiene 10 datasources en `app.module.ts`. Al hacer migraciones Expand/Contract, asegurar que la entity se actualiza en el datasource correcto:

| Schema PostgreSQL | Datasource TypeORM |
|-------------------|--------------------|
| auth + auth_management | default (auth) |
| educational_content | educational |
| progress_tracking | progress |
| gamification_system | gamification |
| social_features | social |
| content_management | content |
| audit_logging | audit |
| communication | communication |
| system_configuration | configuration |
| admin_dashboard | admin |

---

## 8. Integracion con Deploy (PM2)

### 8.1 Secuencia de deploy para cada fase

**Deploy EXPAND:**
```bash
# 1. Ejecutar SQL EXPAND en produccion
psql -U postgres -d gamilit_platform -f EXPAND-*.sql

# 2. Verificar que la columna/tabla fue creada
psql -U postgres -d gamilit_platform -c "\d {schema}.{tabla}"

# 3. NO se necesita restart de aplicacion (codigo no cambia)
```

**Deploy MIGRATE:**
```bash
# 1. Ejecutar BACKFILL en produccion
psql -U postgres -d gamilit_platform -f BACKFILL-*.sql

# 2. Verificar datos migrados
psql -U postgres -d gamilit_platform -c "
  SELECT count(*) FROM {schema}.{tabla} WHERE {columna_nueva} IS NULL AND {columna_vieja} IS NOT NULL;"
# Debe retornar 0

# 3. Deploy de codigo con dual-write
cd apps/backend
npm run build
pm2 restart ecosystem.config.js --update-env

# 4. Monitorear errores
pm2 logs backend --lines 100

# 5. Esperar 24-48 horas para confirmar estabilidad
```

**Deploy CONTRACT:**
```bash
# 1. Deploy de codigo limpio (sin dual-write) PRIMERO
cd apps/backend
npm run build
pm2 restart ecosystem.config.js --update-env

# 2. Verificar que la aplicacion funciona sin la columna vieja
pm2 logs backend --lines 50

# 3. LUEGO ejecutar SQL CONTRACT
psql -U postgres -d gamilit_platform -f CONTRACT-*.sql

# 4. Actualizar DDL canonico en el repositorio
# Editar apps/database/ddl/schemas/{schema}/tables/{tabla}.sql
```

### 8.2 Regla critica de orden

```
EXPAND:    DDL primero  -> codigo despues (o sin cambio)
MIGRATE:   DDL primero  -> codigo despues
CONTRACT:  Codigo primero -> DDL despues

NUNCA: EXPAND + CONTRACT en el mismo deploy
NUNCA: DDL CONTRACT antes de deploy de codigo limpio
```

**Justificacion:** Si se ejecuta CONTRACT DDL antes del codigo limpio, el codigo viejo intentara leer una columna que ya no existe, causando errores 500.

### 8.3 Rollback

| Fase | Rollback |
|------|----------|
| EXPAND | `ALTER TABLE DROP COLUMN` de la columna nueva (seguro, no hay datos) |
| MIGRATE | Revertir codigo a version sin dual-write (datos en columna nueva se mantienen) |
| CONTRACT | No se puede revertir facilmente — requiere EXPAND inverso (re-agregar columna vieja) |

---

## 9. Impacto en RLS, Triggers y FK

### 9.1 Politicas RLS

Con 418 politicas RLS en gamilit, antes de ejecutar CONTRACT verificar que ninguna politica referencia la columna a eliminar:

```sql
-- Buscar politicas que referencian la columna
SELECT schemaname, tablename, policyname, qual::text, with_check::text
FROM pg_policies
WHERE qual::text LIKE '%full_name%'
   OR with_check::text LIKE '%full_name%';
```

Si existen politicas que referencian la columna vieja, deben actualizarse ANTES del CONTRACT.

### 9.2 Triggers

```sql
-- Buscar triggers que referencian la columna en su funcion
SELECT trigger_name, event_object_schema, event_object_table
FROM information_schema.triggers
WHERE trigger_name IN (
  SELECT tgname FROM pg_trigger
  JOIN pg_proc ON pg_proc.oid = tgfoid
  WHERE prosrc LIKE '%full_name%'
);
```

### 9.3 Foreign Keys

```sql
-- Verificar FK que referencian la columna
SELECT
  tc.constraint_name,
  tc.table_schema || '.' || tc.table_name AS table_name,
  kcu.column_name,
  ccu.table_schema || '.' || ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND (kcu.column_name = 'full_name' OR ccu.column_name = 'full_name');
```

### 9.4 Views y Materialized Views

```sql
-- Buscar views que referencian la columna
SELECT schemaname, viewname, definition
FROM pg_views
WHERE definition LIKE '%full_name%';

-- Buscar materialized views
SELECT schemaname, matviewname, definition
FROM pg_matviews
WHERE definition LIKE '%full_name%';
```

Si existen views dependientes, deben recrearse con las columnas nuevas ANTES del CONTRACT.

---

## 10. Checklist de Expand/Contract

### Pre-migracion

- [ ] Identificar todas las dependencias de la columna/tabla a modificar
- [ ] Verificar politicas RLS que la referencian
- [ ] Verificar triggers que la referencian
- [ ] Verificar FK que la referencian
- [ ] Verificar views y materialized views dependientes
- [ ] Identificar DTOs del backend que mapean la columna
- [ ] Identificar componentes del frontend que usan el campo

### Fase EXPAND

- [ ] Escribir SQL EXPAND con columnas/tablas nuevas (nullable o con default)
- [ ] Probar SQL EXPAND en entorno dev
- [ ] Ejecutar SQL EXPAND en produccion
- [ ] Verificar que columna/tabla fue creada correctamente
- [ ] Confirmar que la aplicacion sigue funcionando sin cambios

### Fase MIGRATE

- [ ] Escribir script BACKFILL para migrar datos existentes
- [ ] Probar BACKFILL en dev con datos representativos
- [ ] Actualizar entity TypeORM con dual-write (ambas columnas)
- [ ] Actualizar services para leer de nueva estructura
- [ ] Actualizar DTOs si es necesario
- [ ] Ejecutar BACKFILL en produccion
- [ ] Verificar que todos los datos fueron migrados (0 pendientes)
- [ ] Deploy de codigo con dual-write
- [ ] Monitorear errores por 24-48 horas

### Fase CONTRACT

- [ ] Actualizar politicas RLS que referencian estructura vieja
- [ ] Actualizar triggers que referencian estructura vieja
- [ ] Recrear views dependientes con nueva estructura
- [ ] Actualizar entity TypeORM (eliminar columna vieja y dual-write)
- [ ] Actualizar services (eliminar fallbacks a estructura vieja)
- [ ] Deploy de codigo limpio
- [ ] Verificar que aplicacion funciona sin la estructura vieja
- [ ] Ejecutar SQL CONTRACT en produccion
- [ ] Actualizar archivo DDL canonico en `apps/database/ddl/schemas/`
- [ ] Actualizar tests que referencien la estructura vieja
- [ ] ANALYZE de la tabla modificada

### Post-migracion

- [ ] Verificar que `npm run build` pasa en backend
- [ ] Verificar que `npm run test` pasa en backend
- [ ] Verificar que frontend no tiene errores de tipo
- [ ] Mover archivos de migracion a `migrations/completed/` (opcional)
- [ ] Actualizar inventarios si cambio el conteo de tablas/columnas

---

## 11. Anti-patrones

### 11.1 NUNCA: ALTER COLUMN TYPE directamente en produccion

```sql
-- INCORRECTO: Lock exclusivo en toda la tabla, reescritura completa
ALTER TABLE gamification_system.scores ALTER COLUMN value TYPE DECIMAL(10,2);

-- CORRECTO: Usar Expand/Contract
-- Fase 1: ADD COLUMN value_decimal DECIMAL(10,2)
-- Fase 2: Backfill + dual-write
-- Fase 3: DROP COLUMN value, RENAME value_decimal TO value
```

**Justificacion:** `ALTER COLUMN TYPE` requiere un lock exclusivo `ACCESS EXCLUSIVE` que bloquea TODAS las lecturas y escrituras. En una tabla con millones de filas, esto puede tardar minutos.

### 11.2 NUNCA: DROP columna sin fase MIGRATE

```sql
-- INCORRECTO: El codigo aun referencia full_name
ALTER TABLE auth_management.users DROP COLUMN full_name;
-- Resultado: Error 500 en toda la aplicacion

-- CORRECTO: Primero deploy de codigo sin full_name, LUEGO drop
```

### 11.3 NUNCA: RENAME columna directamente

```sql
-- INCORRECTO: PostgreSQL lo permite pero rompe el codigo inmediatamente
ALTER TABLE auth_management.users RENAME COLUMN full_name TO display_name;
-- Resultado: TypeORM busca 'full_name', no existe -> Error

-- CORRECTO: Usar Expand/Contract completo
```

### 11.4 NUNCA: Deploy con EXPAND + CONTRACT simultaneos

```bash
# INCORRECTO: Combinar fases
psql -f EXPAND-20260214-split-fullname.sql
psql -f CONTRACT-20260214-drop-fullname.sql  # DANGER!
pm2 restart ecosystem.config.js

# CORRECTO: Fases separadas con verificacion entre cada una
```

### 11.5 NUNCA: Backfill sin verificacion

```sql
-- INCORRECTO: Asumir que el backfill funciono
UPDATE users SET first_name = split_part(full_name, ' ', 1);
-- No verificar, proceder al CONTRACT

-- CORRECTO: Siempre verificar
UPDATE users SET first_name = split_part(full_name, ' ', 1)
  WHERE first_name IS NULL AND full_name IS NOT NULL;

-- Verificar
SELECT count(*) FROM users WHERE first_name IS NULL AND full_name IS NOT NULL;
-- DEBE ser 0 antes de proceder al CONTRACT
```

### 11.6 NUNCA: Ignorar RLS en migraciones

```sql
-- INCORRECTO: Ejecutar backfill como gamilit_user
-- (RLS puede filtrar filas, no se migran todos los datos)
SET ROLE gamilit_user;
UPDATE users SET first_name = split_part(full_name, ' ', 1);
-- Resultado: Solo migra filas visibles para el tenant actual

-- CORRECTO: Ejecutar backfill como postgres (superuser, bypasa RLS)
SET ROLE postgres;
UPDATE users SET first_name = split_part(full_name, ' ', 1);
```

---

## 12. Tabla de Referencia Rapida

| Operacion | Metodo |
|-----------|--------|
| Agregar columna | DDL directo (nullable o con default) |
| Eliminar columna | Expand/Contract completo |
| Renombrar columna | Expand/Contract completo |
| Cambiar tipo de columna | Expand/Contract completo |
| Agregar tabla | DDL directo |
| Eliminar tabla | Verificar dependencias, luego DROP |
| Agregar FK | DDL directo (NOT VALID + VALIDATE por separado) |
| Eliminar FK | DDL directo |
| Agregar indice | CREATE INDEX CONCURRENTLY |
| Eliminar indice | DROP INDEX CONCURRENTLY |
| Agregar NOT NULL | Expand/Contract (agregar con default, backfill, luego SET NOT NULL) |
| Agregar CHECK constraint | ALTER ADD CONSTRAINT NOT VALID, luego ALTER VALIDATE |

---

## Referencias

- `apps/database/ddl/` — Archivos DDL canonicos
- `apps/database/scripts/init-database.sh` — Script de inicializacion
- `apps/backend/src/app.module.ts` — Configuracion de datasources
- `docs/50-guides/backend/GUIA-CREAR-BASE-DATOS.md` — Guia de creacion de BD
- `docs/50-guides/backend/GUIA-RUNBOOK-POSTGRESQL.md` — Runbook de operaciones
- `docs/50-guides/integration/GUIA-TYPEORM-CROSS-DATASOURCE.md` — Guia cross-datasource
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/15/sql-altertable.html) — Documentacion oficial
- [Expand/Contract Pattern](https://www.martinfowler.com/bliki/ParallelChange.html) — Martin Fowler
