# ERR-DB-004: Conflictos RLS entre Schemas

## Descripcion
Las politicas RLS que referencian tablas en otros schemas sin usar nombres completamente calificados (schema.tabla) fallan porque PostgreSQL resuelve el nombre usando el search_path actual, que durante la evaluacion de la politica puede no incluir el schema destino.

## Sintomas
- Error: `relation "tabla" does not exist` durante evaluacion de politica RLS
- Error: `permission denied for table tabla` a pesar de que el rol tiene permisos correctos
- Queries que funcionan como superusuario pero fallan con usuario de aplicacion
- Registros "invisibles" para usuarios que deberian tener acceso
- Comportamiento inconsistente: la misma query funciona en un schema pero no en otro

## Causa Raiz
1. La politica RLS usa un nombre de tabla sin prefijo de schema (ej: `users` en vez de `auth_management.users`)
2. El `search_path` de la sesion no incluye el schema donde reside la tabla referenciada
3. Durante la evaluacion de la politica, PostgreSQL busca la tabla en los schemas del search_path y no la encuentra
4. Con 18 schemas y 251 politicas RLS, las referencias cross-schema son frecuentes (especialmente hacia `auth_management`, `gamilit`, y `tenant_management`)

## Solucion

### 1. Identificar politicas con referencias no calificadas
```bash
# Buscar referencias a tablas comunes sin prefijo de schema en politicas RLS
grep -rn "USING\|WITH CHECK" apps/database/ddl/schemas/*/policies/*.sql | \
  grep -v "[a-z_]*\.[a-z_]*" | \
  grep "SELECT\|EXISTS\|IN ("
```

### 2. Verificar politicas en PostgreSQL directamente
```sql
-- Listar todas las politicas RLS y sus definiciones
SELECT
  schemaname,
  tablename,
  policyname,
  qual AS using_expression,
  with_check AS check_expression
FROM pg_policies
WHERE qual LIKE '%SELECT%' OR with_check LIKE '%SELECT%'
ORDER BY schemaname, tablename;

-- Buscar politicas que referencian tablas sin schema
SELECT policyname, schemaname, tablename, qual
FROM pg_policies
WHERE qual IS NOT NULL
  AND qual ~ 'FROM\s+[a-z_]+\s'
  AND qual !~ 'FROM\s+[a-z_]+\.[a-z_]+';
```

### 3. Corregir las politicas
```sql
-- INCORRECTO: nombre no calificado
CREATE POLICY "users_tenant_isolation" ON educational.student_progress
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = current_setting('app.current_user_id')::uuid
    )
  );

-- CORRECTO: nombre completamente calificado
CREATE POLICY "users_tenant_isolation" ON educational.student_progress
  USING (
    tenant_id IN (
      SELECT tenant_id FROM auth_management.users
      WHERE id = current_setting('app.current_user_id')::uuid
    )
  );
```

### 4. Verificar que la correccion funciona
```sql
-- Probar como usuario de aplicacion (no superuser)
SET ROLE gamilit_user;
SET app.current_user_id = 'uuid-del-usuario';
SET app.current_tenant_id = 'uuid-del-tenant';

-- Ejecutar query que involucre la politica
SELECT * FROM educational.student_progress LIMIT 5;

-- Restaurar rol
RESET ROLE;
```

## Prevencion

1. **Regla de desarrollo**: Toda referencia a tabla en politica RLS DEBE usar nombre completamente calificado (`schema.tabla`)
2. **Code review**: Verificar que no haya nombres de tabla sin schema en archivos de politicas
3. **Script de validacion**: Ejecutar antes de aplicar cambios DDL
4. **Documentacion**: Mantener mapa de dependencias cross-schema en politicas

### Checklist antes de crear politica RLS:
- [ ] Todas las tablas referenciadas usan `schema.tabla`
- [ ] Las funciones usadas existen y son accesibles (ej: `current_setting`)
- [ ] Probado con rol `gamilit_user` (no superuser)
- [ ] No depende del `search_path` de la sesion
- [ ] Politica documentada en inventario

### Verificacion automatica
```bash
# Buscar posibles referencias no calificadas en archivos de politicas
grep -rn "FROM [a-z_]*[^.]" apps/database/ddl/schemas/*/policies/*.sql | \
  grep -v "FROM [a-z_]*\." | \
  grep -v "FROM UNNEST\|FROM generate\|FROM json"
```

## Ocurrencias

| Fecha | Schema Origen | Schema Destino | Politica | Estado |
|-------|---------------|----------------|----------|--------|
| 2026-01-15 | educational | auth_management | student_progress_tenant_isolation | Resuelto |
| 2026-01-10 | gamification | auth_management | xp_transactions_user_access | Resuelto |
| 2025-12-20 | progress | tenant_management | module_progress_tenant_check | Resuelto |

## Referencias

- **DDL Politicas:** `apps/database/ddl/schemas/*/policies/`
- **Schema Reference:** `docs/20-architecture/schema-reference/`
- **Inventario DB:** `orchestration/inventarios/DATABASE_INVENTORY.yml`
- **PostgreSQL RLS Docs:** https://www.postgresql.org/docs/15/ddl-rowsecurity.html

---

**Severidad:** Alta
**Frecuencia:** 3+ ocurrencias
**Tiempo de resolucion:** 20-40 min
**Ultimo update:** 2026-02-13
