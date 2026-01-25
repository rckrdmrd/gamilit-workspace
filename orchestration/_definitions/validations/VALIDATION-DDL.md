# Validación DDL - PostgreSQL
## Definición Canónica

**Alias:** @DEF_VAL_DDL
**Dominio:** Database DDL PostgreSQL

---

## COMANDOS OBLIGATORIOS

```bash
# ANTES de marcar tarea como completada:

# 1. Validar sintaxis SQL
psql -h localhost -U postgres -d {DB} -f {archivo}.sql --set ON_ERROR_STOP=1

# 2. Verificar que no hay errores
echo $?  # Debe ser 0

# 3. Si existe script de recreación:
./scripts/recreate-database.sh  # DEBE ejecutar sin errores
```

## CRITERIOS DE ACEPTACIÓN

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
  - "Índices en columnas de búsqueda frecuente"

rls_policies:
  - "Habilitado en tablas multi-tenant"
  - "Políticas para SELECT, INSERT, UPDATE, DELETE"
  - "Usando tenant_id del contexto"

funciones:
  - "SECURITY DEFINER/INVOKER correcto"
  - "Manejo de errores (EXCEPTION)"
  - "Documentación en comentarios"

triggers:
  - "Timing correcto (BEFORE/AFTER)"
  - "Operaciones correctas (INSERT/UPDATE/DELETE)"
  - "Función trigger existe"
```

## ERRORES COMUNES

```yaml
- error: "relation already exists"
  causa: "Tabla/objeto ya existe"
  solucion: "Usar IF NOT EXISTS o DROP primero"

- error: "foreign key constraint violation"
  causa: "Referencia a registro inexistente"
  solucion: "Verificar orden de inserción o CASCADE"

- error: "column does not exist"
  causa: "Nombre de columna incorrecto"
  solucion: "Verificar nombres y comillas"
```

---

**Referencia:** @PERFIL_DATABASE, @SIMCO_DDL
