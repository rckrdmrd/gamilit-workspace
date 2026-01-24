# Validacion DDL - PostgreSQL
## Definicion Canonica

**Alias:** @DEF_VAL_DDL
**Dominio:** Database DDL PostgreSQL
**Fecha:** 2026-01-18
**Propagado desde:** workspace-v2/orchestration/_definitions/validations/VALIDATION-DDL.md

---

## COMANDOS OBLIGATORIOS

```bash
# ANTES de marcar tarea como completada:

# 1. Validar sintaxis SQL
psql -h localhost -U postgres -d {DB} -f {archivo}.sql --set ON_ERROR_STOP=1

# 2. Verificar que no hay errores
echo $?  # Debe ser 0

# 3. Si existe script de recreacion:
# ./scripts/recreate-database.sh  # DEBE ejecutar sin errores
```

## CRITERIOS DE ACEPTACION

```yaml
sintaxis:
  resultado: "SQL ejecuta sin errores"
  encoding: "UTF-8"
  schema_correcto: true

convenciones:
  tablas: "snake_case, plural (users, products)"
  columnas: "snake_case (created_at, user_id)"
  constraints: "{tabla}_{columna}_{tipo} (users_email_unique)"
  indices: "idx_{tabla}_{columnas}"
  foreign_keys: "fk_{tabla_origen}_{tabla_destino}"

integridad:
  - "Primary keys definidas"
  - "Foreign keys con ON DELETE/UPDATE"
  - "NOT NULL donde aplique"
  - "DEFAULT values apropiados"
  - "CHECK constraints donde necesario"
```

## VALIDACIONES ADICIONALES

```yaml
tablas:
  - "Columnas id, created_at, updated_at presentes"
  - "Tipos de datos apropiados"
  - "Indices en columnas de busqueda frecuente"

rls_policies:
  - "Habilitado en tablas multi-tenant"
  - "Politicas para SELECT, INSERT, UPDATE, DELETE"
  - "Usando tenant_id del contexto"

funciones:
  - "SECURITY DEFINER/INVOKER correcto"
  - "Manejo de errores (EXCEPTION)"
  - "Documentacion en comentarios"

triggers:
  - "Timing correcto (BEFORE/AFTER)"
  - "Operaciones correctas (INSERT/UPDATE/DELETE)"
  - "Funcion trigger existe"
```

## RUTAS ESPECIFICAS GAMILIT

```yaml
ddl_path: "ddl/"
schemas_path: "ddl/schemas/"
functions_path: "ddl/functions/"
triggers_path: "ddl/triggers/"
migrations_path: "migrations/"
```

## ERRORES COMUNES

```yaml
- error: "relation already exists"
  causa: "Tabla/objeto ya existe"
  solucion: "Usar IF NOT EXISTS o DROP primero"

- error: "foreign key constraint violation"
  causa: "Referencia a registro inexistente"
  solucion: "Verificar orden de insercion o CASCADE"

- error: "column does not exist"
  causa: "Nombre de columna incorrecto"
  solucion: "Verificar nombres y comillas"
```

---

**Referencia:** orchestration/agentes/, orchestration/directivas/
**Propagado desde:** workspace-v2
