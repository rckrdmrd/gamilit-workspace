# SIMCO: SINCRONIZACIÓN BASE DE DATOS

**Versión:** 1.0.0
**Alias:** @SYNC_BD
**Fecha:** 2026-01-10
**Categoría:** operaciones_documentacion
**Obligatoria:** SÍ (post-cambio DDL)

---

## RESUMEN EJECUTIVO

> **Principio:** Todo cambio en DDL DEBE reflejarse en scripts, código y documentación. Un DDL sin sincronizar es una bomba de tiempo.

Esta directiva establece el flujo obligatorio de sincronización cuando se realizan cambios en la base de datos.

---

## 1. Propósito

### 1.1 Objetivo

Garantizar coherencia completa entre:
- Archivos DDL (schemas, tablas, funciones)
- Scripts de creación/recreación de BD
- Entities y DTOs del backend
- Types del frontend
- Inventarios de base de datos
- Documentación técnica

### 1.2 Problemas que Resuelve

| Problema | Solución |
|----------|----------|
| Scripts desactualizados | Actualización obligatoria post-DDL |
| Entities desincronizadas | Checklist de sincronización |
| Recreación fallida | Validación de ejecución |
| Inventarios obsoletos | Actualización como paso final |

---

## 2. Triggers de Sincronización

### 2.1 Cuándo Aplicar

| Cambio | Sincronización |
|--------|----------------|
| Nuevo schema | OBLIGATORIA |
| Nueva tabla | OBLIGATORIA |
| Nueva columna | OBLIGATORIA |
| Modificación de tipo de columna | OBLIGATORIA |
| Nuevo constraint (FK, UK, CHECK) | OBLIGATORIA |
| Nuevo índice | OBLIGATORIA |
| Nueva función | OBLIGATORIA |
| Nuevo trigger | OBLIGATORIA |
| Nueva view | OBLIGATORIA |
| Modificación de RLS policy | OBLIGATORIA |
| Cambio en seeds | RECOMENDADA |

### 2.2 Excepciones

- Comentarios en DDL (solo documentación)
- Cambios cosméticos (formato, espacios)

---

## 3. Flujo de Sincronización

### 3.1 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                 FLUJO DE SINCRONIZACIÓN BD                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. MODIFICAR DDL                                          │
│         │                                                   │
│         ▼                                                   │
│   2. ACTUALIZAR SCRIPTS ──────────────────────┐             │
│         │                                     │             │
│         ▼                                     │             │
│   3. EJECUTAR RECREACIÓN ◄────────────────────┘             │
│         │                                                   │
│         ▼                                                   │
│   4. SINCRONIZAR BACKEND                                    │
│         │   ├── Entity                                      │
│         │   ├── DTO                                         │
│         │   ├── Repository                                  │
│         │   └── Service/Controller (si aplica)              │
│         │                                                   │
│         ▼                                                   │
│   5. SINCRONIZAR FRONTEND (si API cambia)                   │
│         │   ├── Types/Interfaces                            │
│         │   └── Services                                    │
│         │                                                   │
│         ▼                                                   │
│   6. ACTUALIZAR INVENTARIOS                                 │
│         │   ├── DATABASE_INVENTORY                          │
│         │   ├── BACKEND_INVENTORY                           │
│         │   └── MASTER_INVENTORY                            │
│         │                                                   │
│         ▼                                                   │
│   7. DOCUMENTAR CAMBIO                                      │
│         │   ├── ADR (si decisión arquitectural)             │
│         │   ├── ET-* (spec técnico)                         │
│         │   └── Changelog                                   │
│         │                                                   │
│         ▼                                                   │
│   8. EJECUTAR TESTS                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Detalle por Paso

#### Paso 1: Modificar DDL

```sql
-- Ubicación típica: database/ddl/ o apps/database/ddl/

-- Ejemplo de cambio
ALTER TABLE schema_name.table_name
ADD COLUMN new_column VARCHAR(100) NOT NULL DEFAULT '';

-- O en archivo DDL nuevo
CREATE TABLE schema_name.new_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- ...
);
```

#### Paso 2: Actualizar Scripts

**Scripts a actualizar:**

| Script | Ubicación Típica | Acción |
|--------|------------------|--------|
| create-database.sh | database/ o scripts/ | Agregar nuevo DDL |
| recreate-database.sh | database/ o scripts/ | Misma actualización |
| drop-database.sh | database/ o scripts/ | Si es nueva tabla |

**Estructura esperada del script:**

```bash
#!/bin/bash
# create-database.sh

# 1. Crear extensiones
psql -f ddl/00-extensions.sql

# 2. Crear schemas (en orden)
psql -f ddl/01-schema-auth.sql
psql -f ddl/02-schema-users.sql
# ... agregar nuevo schema aquí si aplica

# 3. Crear tablas (en orden de dependencias)
psql -f ddl/tables/auth/*.sql
psql -f ddl/tables/users/*.sql
# ... agregar nueva tabla aquí

# 4. Crear constraints
psql -f ddl/constraints/*.sql

# 5. Crear índices
psql -f ddl/indexes/*.sql

# 6. Crear funciones
psql -f ddl/functions/*.sql

# 7. Crear triggers
psql -f ddl/triggers/*.sql

# 8. Crear views
psql -f ddl/views/*.sql

# 9. Crear RLS policies
psql -f ddl/policies/*.sql

# 10. Seeds (opcional)
psql -f seeds/*.sql
```

#### Paso 3: Ejecutar Recreación

```bash
# Validar antes de ejecutar
./recreate-database.sh --dry-run  # Si está disponible

# Ejecutar recreación
./recreate-database.sh

# Verificar resultado
echo "Verificando schemas..."
psql -c "\dn"

echo "Verificando tablas..."
psql -c "\dt schema_name.*"

echo "Verificando funciones..."
psql -c "\df schema_name.*"
```

**Criterios de éxito:**
- Sin errores de sintaxis SQL
- Todos los objetos creados
- Constraints activos
- Índices creados
- RLS policies activas

#### Paso 4: Sincronizar Backend

**Entity (TypeORM ejemplo):**

```typescript
// src/modules/module-name/entities/table-name.entity.ts

@Entity({ schema: 'schema_name', name: 'table_name' })
export class TableName {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Agregar nueva columna
  @Column({ type: 'varchar', length: 100, default: '' })
  newColumn: string;

  // ... resto de columnas
}
```

**DTO:**

```typescript
// src/modules/module-name/dto/create-table-name.dto.ts

export class CreateTableNameDto {
  @IsString()
  @MaxLength(100)
  @IsOptional()
  newColumn?: string;

  // ... resto de campos
}
```

**Repository (si métodos nuevos):**

```typescript
// src/modules/module-name/repositories/table-name.repository.ts

@Injectable()
export class TableNameRepository {
  // Agregar método si la nueva columna requiere queries específicos
  async findByNewColumn(value: string): Promise<TableName[]> {
    return this.repository.find({ where: { newColumn: value } });
  }
}
```

#### Paso 5: Sincronizar Frontend

**Types:**

```typescript
// src/types/table-name.types.ts

export interface TableName {
  id: string;
  newColumn: string;  // Agregar nuevo campo
  // ...
}

export interface CreateTableNameDto {
  newColumn?: string;  // Agregar nuevo campo
  // ...
}
```

#### Paso 6: Actualizar Inventarios

**DATABASE_INVENTORY.yml:**

```yaml
schemas:
  - name: schema_name
    tables:
      - name: table_name
        columns: 15  # Actualizar conteo
        last_modified: "2026-01-10"
        changes:
          - "2026-01-10: Agregada columna new_column"
```

**BACKEND_INVENTORY.yml:**

```yaml
entities:
  - name: TableName
    file: "src/modules/module-name/entities/table-name.entity.ts"
    columns: 15  # Actualizar
    last_modified: "2026-01-10"
```

#### Paso 7: Documentar Cambio

**Si es decisión arquitectural → ADR:**

```markdown
# ADR-NNNN: Agregar columna X a tabla Y

## Contexto
...

## Decisión
...

## Consecuencias
...
```

**Actualizar spec técnico:**

```markdown
# ET-BD-XXX: Schema schema_name

## Cambios Recientes
- 2026-01-10: Agregada columna new_column a table_name
```

#### Paso 8: Ejecutar Tests

```bash
# Tests unitarios
npm run test -- --grep "TableName"

# Tests de integración
npm run test:e2e -- --grep "table-name"

# Verificar build
npm run build
```

---

## 4. Validación de Scripts BD

### 4.1 Estructura de Scripts Requeridos

| Script | Obligatorio | Propósito |
|--------|-------------|-----------|
| create-database.sh | SÍ | Crear BD desde cero |
| recreate-database.sh | SÍ | Drop + Create |
| drop-database.sh | RECOMENDADO | Solo drop |
| seed-database.sh | OPCIONAL | Datos iniciales |
| migrate.sh | SI MIGRATIONS | Ejecutar migraciones |

### 4.2 Checklist Pre-Recreación

```yaml
antes_de_recrear:
  - [ ] Backup de BD si tiene datos importantes
  - [ ] Verificar no hay conexiones activas
  - [ ] Revisar orden de scripts
  - [ ] Verificar dependencias entre schemas
  - [ ] Confirmar variables de entorno
```

### 4.3 Checklist Post-Recreación

```yaml
despues_de_recrear:
  - [ ] Todos los schemas creados
  - [ ] Todas las tablas creadas
  - [ ] Todos los constraints activos
  - [ ] Todos los índices creados
  - [ ] Todas las funciones creadas
  - [ ] Todos los triggers activos
  - [ ] Todas las views creadas
  - [ ] RLS policies activas
  - [ ] Seeds ejecutados (si aplica)
  - [ ] Aplicación puede conectar
```

---

## 5. Matriz de Dependencias DDL

### 5.1 Dependencias de Tablas

```
Tabla Principal
    └── FK → Tabla Referenciada (debe existir primero)
    └── View que la usa (debe actualizarse)
    └── Trigger asociado (debe actualizarse)
    └── Función que la referencia (debe actualizarse)
```

### 5.2 Orden de Creación

```
1. Extensions (uuid-ossp, pg_trgm, etc.)
2. Schemas
3. Types/Enums
4. Tablas sin FK
5. Tablas con FK (orden de dependencias)
6. Constraints adicionales
7. Índices
8. Funciones
9. Triggers
10. Views
11. RLS Policies
12. Grants/Permissions
```

### 5.3 Impacto de Cambios

| Cambio | Impacto |
|--------|---------|
| Renombrar columna | Views, funciones, triggers, código |
| Cambiar tipo | Validaciones, DTOs, frontend |
| Agregar NOT NULL | Seeds, tests, código existente |
| Agregar FK | Orden de inserts, deletes |
| Eliminar columna | ALTO - verificar uso en todo el sistema |

---

## 6. Checklist por Tipo de Cambio

### 6.1 Nueva Tabla

```yaml
nueva_tabla:
  ddl:
    - [ ] Archivo DDL creado en ubicación correcta
    - [ ] Schema especificado
    - [ ] PK definida (UUID recomendado)
    - [ ] Timestamps (created_at, updated_at)
    - [ ] Tenant column si multi-tenant
    - [ ] Índices necesarios definidos

  scripts:
    - [ ] create-database.sh actualizado
    - [ ] Orden de creación correcto (después de dependencias)
    - [ ] recreate-database.sh actualizado

  backend:
    - [ ] Entity creada
    - [ ] DTO Create creado
    - [ ] DTO Update creado
    - [ ] DTO Response creado
    - [ ] Repository creado
    - [ ] Service creado
    - [ ] Controller creado
    - [ ] Module actualizado

  tests:
    - [ ] Tests de entity
    - [ ] Tests de service
    - [ ] Tests e2e de endpoints

  inventarios:
    - [ ] DATABASE_INVENTORY actualizado
    - [ ] BACKEND_INVENTORY actualizado
    - [ ] MASTER_INVENTORY actualizado
```

### 6.2 Nueva Columna

```yaml
nueva_columna:
  ddl:
    - [ ] Columna agregada al archivo DDL
    - [ ] Tipo de dato correcto
    - [ ] Constraints definidos (NOT NULL, DEFAULT, etc.)
    - [ ] Índice si será buscada frecuentemente

  scripts:
    - [ ] Script de creación actualizado
    - [ ] Recreación exitosa verificada

  backend:
    - [ ] Entity actualizada
    - [ ] DTOs actualizados
    - [ ] Validadores agregados si aplica

  frontend:
    - [ ] Types actualizados
    - [ ] Formularios actualizados si visible
```

### 6.3 Nueva Función/Trigger

```yaml
nueva_funcion:
  ddl:
    - [ ] Función creada en archivo separado
    - [ ] Schema especificado
    - [ ] SECURITY DEFINER si accede a otras tablas
    - [ ] Documentación inline

  scripts:
    - [ ] Agregada al script de creación
    - [ ] Orden correcto (después de tablas que usa)

  trigger:
    - [ ] Trigger creado si aplica
    - [ ] Evento correcto (BEFORE/AFTER, INSERT/UPDATE/DELETE)
    - [ ] FOR EACH ROW si por fila

  tests:
    - [ ] Test de función
    - [ ] Test de trigger si aplica
```

---

## 7. Actualización de Inventarios

### 7.1 DATABASE_INVENTORY.yml

```yaml
# Estructura mínima requerida
database:
  name: "{database_name}"
  version: "{semver}"
  updated: "{YYYY-MM-DD}"

schemas:
  - name: "{schema_name}"
    tables_count: {N}
    functions_count: {N}
    triggers_count: {N}
    views_count: {N}
    tables:
      - name: "{table_name}"
        columns: {N}
        indexes: {N}
        has_rls: {true|false}

functions:
  - name: "{function_name}"
    schema: "{schema_name}"
    returns: "{return_type}"

triggers:
  - name: "{trigger_name}"
    table: "{schema.table}"
    event: "{BEFORE|AFTER} {INSERT|UPDATE|DELETE}"
```

### 7.2 Qué Actualizar

| Cambio DDL | Actualizar en Inventario |
|------------|-------------------------|
| Nueva tabla | schemas[].tables[], tables_count |
| Nueva columna | tables[].columns |
| Nuevo índice | tables[].indexes |
| Nueva función | functions[], functions_count |
| Nuevo trigger | triggers[], triggers_count |
| Nueva view | views[], views_count |
| Nuevo schema | schemas[] |

---

## 8. Documentación de Cambios

### 8.1 Cuándo Crear ADR

- Nuevo schema con propósito específico
- Cambio de estrategia de índices
- Implementación de RLS
- Cambio de tipos de datos masivo
- Nueva función compleja

### 8.2 Formato de Registro en Changelog

```markdown
## [{YYYY-MM-DD}] Base de Datos

### Agregado
- Nueva tabla: `schema.nueva_tabla`
- Nueva columna: `schema.tabla.nueva_columna`
- Nueva función: `schema.nueva_funcion()`

### Modificado
- Columna: `schema.tabla.columna` - tipo VARCHAR(50) → VARCHAR(100)

### Deprecado
- Función: `schema.funcion_antigua()` - usar `schema.funcion_nueva()`

### Eliminado
- Tabla: `schema.tabla_obsoleta` (datos migrados a `schema.nueva_tabla`)
```

---

## 9. Errores Comunes

| Error | Consecuencia | Prevención |
|-------|--------------|------------|
| Script no actualizado | Recreación falla | Actualizar SIEMPRE post-DDL |
| Orden incorrecto | FK violations | Respetar dependencias |
| Entity desincronizada | Runtime errors | Sincronizar inmediatamente |
| Inventario obsoleto | Documentación incorrecta | Último paso del ciclo |
| Sin backup | Pérdida de datos | Backup antes de recrear |

---

## 10. Referencia: Checklist Completo

Para validación detallada usar:

**Referencia:** @CHK_SYNC_BD

---

## 11. Referencias

| Alias | Directiva | Uso |
|-------|-----------|-----|
| @MANTENIMIENTO_DOCS | SIMCO-MANTENIMIENTO-DOCUMENTACION.md | Ciclo de mantenimiento |
| @CHK_SYNC_BD | CHECKLIST-SINCRONIZACION-BD.md | Checklist detallado |
| @OP_DDL | SIMCO-DDL.md | Operaciones de BD |
| @INVENTARIOS | SIMCO-INVENTARIOS.md | Estándares de inventarios |
| @MIGRACIONES | SIMCO-MIGRACIONES-BD.md | Migraciones de BD |

---

## 12. Changelog

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2026-01-10 | Versión inicial |

---

**Referencia rápida:**
```
Flujo: DDL → Scripts → Recrear → Backend → Frontend → Inventarios → Docs → Tests
Checklist: @CHK_SYNC_BD
Trigger: Cualquier cambio en DDL
```
