# ERR-DB-006: Foreign Key Cross-Schema sin Search Path

## Descripcion
Las foreign keys que referencian tablas en schemas diferentes sin usar el nombre completamente calificado (`schema.tabla`) fallan durante la creacion, porque PostgreSQL no puede resolver la tabla destino usando solo el search_path por defecto. Con 299 foreign keys repartidas entre 18 schemas, las referencias cross-schema son frecuentes.

## Sintomas
- Error: `relation "tabla" does not exist` al ejecutar DDL de creacion de tabla
- Error: `there is no unique constraint matching given keys for referenced table "tabla"`
- Script de recreacion de BD falla en tablas con FK cross-schema
- `recreate-database.sh` se detiene a mitad de ejecucion
- FK se crea exitosamente en un orden de ejecucion pero falla en otro (dependencia de search_path)

## Causa Raiz
1. DDL usa `REFERENCES tabla(id)` sin prefijo de schema para tablas en otro schema
2. El script de ejecucion no configura `search_path` antes de crear las tablas
3. El orden de ejecucion de archivos DDL no garantiza que el schema referenciado ya este creado
4. Copy-paste de FK desde tabla dentro del mismo schema a tabla que referencia otro schema, sin agregar el prefijo

## Solucion

### 1. Identificar FK cross-schema sin calificar
```bash
# Buscar REFERENCES sin prefijo de schema en archivos DDL
grep -rn "REFERENCES" apps/database/ddl/schemas/*/tables/*.sql | \
  grep -v "REFERENCES [a-z_]*\.[a-z_]*"
```

### 2. Verificar en PostgreSQL que FKs existentes son correctas
```sql
-- Listar FK cross-schema para verificar integridad
SELECT
  tc.constraint_name,
  tc.table_schema AS source_schema,
  tc.table_name AS source_table,
  kcu.column_name AS source_column,
  ccu.table_schema AS target_schema,
  ccu.table_name AS target_table,
  ccu.column_name AS target_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema != ccu.table_schema
ORDER BY tc.table_schema, tc.table_name;
```

### 3. Corregir la definicion DDL
```sql
-- INCORRECTO: sin schema, depende del search_path
CREATE TABLE educational.student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),          -- Falla si search_path no incluye auth_management
  tenant_id UUID NOT NULL REFERENCES tenants(id),          -- Falla si search_path no incluye tenant_management
  module_id UUID NOT NULL REFERENCES modules(id),          -- Ambiguo: podria estar en educational o en otro schema
  created_at TIMESTAMPTZ DEFAULT gamilit.now_mexico()
);

-- CORRECTO: con schema completamente calificado
CREATE TABLE educational.student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth_management.users(id),
  tenant_id UUID NOT NULL REFERENCES tenant_management.tenants(id),
  module_id UUID NOT NULL REFERENCES educational.modules(id),
  created_at TIMESTAMPTZ DEFAULT gamilit.now_mexico()
);
```

### 4. Asegurar orden de creacion correcto
```bash
# El script recreate-database.sh debe crear schemas en orden de dependencia:
# 1. gamilit (funciones base como now_mexico)
# 2. tenant_management (tenants referenciados por casi todos)
# 3. auth_management (users referenciados por muchas tablas)
# 4. educational, gamification, progress, etc. (dependen de los anteriores)
```

### 5. Verificar despues de la correccion
```bash
# Recrear BD completa para validar
bash apps/database/scripts/recreate-database.sh

# Si hay errores, revisar el log para FK especificas
psql -U gamilit_user -d gamilit_platform -c "
  SELECT conname, conrelid::regclass, confrelid::regclass
  FROM pg_constraint
  WHERE contype = 'f'
  ORDER BY conrelid::regclass::text;
"
```

## Prevencion

1. **Regla DDL**: Toda clausula REFERENCES DEBE usar `schema.tabla(columna)` sin excepcion
2. **Script de validacion**: Ejecutar grep previo a commit para detectar REFERENCES sin schema
3. **Orden de creacion**: Documentar y respetar el orden de dependencia entre schemas
4. **Code review**: Verificar que nuevas tablas con FK cross-schema usen nombres calificados

### Checklist antes de crear tabla con FK:
- [ ] Todas las REFERENCES usan `schema.tabla(columna)`
- [ ] Schema destino existe y se crea antes que el schema origen
- [ ] Columna referenciada tiene constraint UNIQUE o PRIMARY KEY
- [ ] Probado con `recreate-database.sh` completo
- [ ] FK documentada en inventario de BD

### Verificacion automatica
```bash
# Verificar que NO haya REFERENCES sin schema prefix
result=$(grep -rn "REFERENCES [a-z_]*(id)" apps/database/ddl/schemas/*/tables/*.sql | \
  grep -v "REFERENCES [a-z_]*\.[a-z_]*(id)")
if [ -n "$result" ]; then
  echo "FK sin schema encontradas:"
  echo "$result"
  exit 1
else
  echo "Todas las FK usan nombres calificados"
fi
```

## Ocurrencias

| Fecha | Archivo DDL | FK Problema | Schema Destino | Estado |
|-------|-------------|-------------|----------------|--------|
| 2026-01-18 | educational/student_enrollments.sql | REFERENCES users(id) | auth_management | Resuelto |
| 2026-01-12 | gamification/xp_transactions.sql | REFERENCES users(id) | auth_management | Resuelto |
| 2025-12-28 | progress/module_progress.sql | REFERENCES tenants(id) | tenant_management | Resuelto |
| 2025-12-20 | social/team_members.sql | REFERENCES users(id) | auth_management | Resuelto |

## Referencias

- **DDL Tablas:** `apps/database/ddl/schemas/*/tables/`
- **Script recrear BD:** `apps/database/scripts/recreate-database.sh`
- **Schema Reference:** `docs/20-architecture/schema-reference/`
- **Inventario DB:** `orchestration/inventarios/DATABASE_INVENTORY.yml`
- **PostgreSQL FK Docs:** https://www.postgresql.org/docs/15/ddl-constraints.html#DDL-CONSTRAINTS-FK

---

**Severidad:** Alta
**Frecuencia:** 4+ ocurrencias
**Tiempo de resolucion:** 15-30 min
**Ultimo update:** 2026-02-13
