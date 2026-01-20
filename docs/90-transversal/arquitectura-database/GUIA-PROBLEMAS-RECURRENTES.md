# Guia de Problemas Recurrentes - Base de Datos

## Proposito
Esta guia documenta patrones de errores recurrentes en la integracion frontend-backend-database,
sus causas raiz, y las soluciones estandar para resolverlos rapidamente.

---

## PATRON 1: Error 500 - "column X does not exist"

### Sintoma
```
QueryFailedError: column <tabla>.<columna> does not exist
```

### Causa Raiz
El DDL fue actualizado con nuevas columnas pero la base de datos no fue re-inicializada.
TypeORM genera SELECTs basados en las entidades, que incluyen columnas que no existen en la BD.

### Diagnostico Rapido
```bash
# 1. Verificar si la columna existe en el DDL
grep -r "columna_name" apps/database/ddl/

# 2. Verificar si la columna existe en la entidad
grep -r "columna_name" apps/backend/src/modules/

# 3. Verificar en la BD real
PGPASSWORD=xxx psql -h localhost -U gamilit_user -d gamilit -c "
SELECT column_name FROM information_schema.columns
WHERE table_name = 'tabla_name' AND column_name = 'columna_name';"
```

### Solucion
```bash
# Opcion A: Reset completo (entorno desarrollo)
cd apps/database/scripts
./reset-database.sh

# Opcion B: Migracion manual (preservar datos)
ALTER TABLE schema.tabla ADD COLUMN IF NOT EXISTS columna_name TYPE DEFAULT valor;
```

### Prevencion
1. Siempre ejecutar `./reset-database.sh` despues de modificar DDL
2. Documentar cambios de schema en CHANGELOG
3. Considerar implementar TypeORM migrations para produccion

---

## PATRON 2: Error 404 - "User stats/ranks not found"

### Sintoma
```
NotFoundException: User stats not found for <uuid>
NotFoundException: User ranks not found for <uuid>
```

### Causa Raiz
Los usuarios de testing (UUIDs fijos como `aaaa...`, `bbbb...`, `cccc...`) fueron
creados via seeds directos sin disparar el trigger `initialize_user_stats()`.

### Diagnostico Rapido
```bash
# Verificar si el usuario tiene user_stats
PGPASSWORD=xxx psql -h localhost -U gamilit_user -d gamilit -c "
SELECT user_id, ml_coins, level FROM gamification_system.user_stats
WHERE user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid;"

# Verificar si el usuario tiene user_ranks
PGPASSWORD=xxx psql -h localhost -U gamilit_user -d gamilit -c "
SELECT user_id, current_rank FROM gamification_system.user_ranks
WHERE user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid;"
```

### Solucion Permanente (ya implementada)
Los seeds en `seeds/*/gamification_system/05-user_stats.sql` incluyen FASE 0 que
garantiza registros para usuarios de testing:

```sql
-- FASE 0: Asegurar registros base para usuarios de testing
INSERT INTO gamification_system.user_stats (user_id, tenant_id, ml_coins, ml_coins_earned_total)
VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, v_tenant_id, 100, 100)
ON CONFLICT (user_id) DO NOTHING;
```

### Solucion Temporal (fix rapido)
```sql
-- Insertar manualmente registros faltantes
SELECT gamilit.initialize_user_stats('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid);
```

### Prevencion
1. Siempre usar ON CONFLICT DO NOTHING en seeds de testing
2. Incluir registros dependientes cuando se crean usuarios de testing
3. Documentar dependencias entre tablas

---

## PATRON 3: Error 404 - "missions/daily|weekly|special" vacias

### Sintoma
```
GET /api/v1/gamification/missions/daily -> 404 o []
GET /api/v1/gamification/missions/weekly -> 404 o []
GET /api/v1/gamification/missions/special -> 404 o []
```

### Causa Raiz
Los usuarios de testing no tienen registros en `gamification_system.missions`.
Normalmente `initialize_user_missions()` crea las misiones, pero no se ejecuta
para usuarios insertados via seeds directos.

### Diagnostico Rapido
```bash
PGPASSWORD=xxx psql -h localhost -U gamilit_user -d gamilit -c "
SELECT user_id, mission_type, COUNT(*) FROM gamification_system.missions
WHERE user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid
GROUP BY user_id, mission_type;"
```

### Solucion Permanente (ya implementada)
Los seeds incluyen FASE 0.5 que crea misiones para usuarios de testing:

```sql
-- FASE 0.5: Inicializar misiones para usuarios de testing
-- Crea 9 misiones por usuario: 3 daily, 5 weekly, 1 special
```

### Solucion Temporal
```sql
-- Ejecutar inicializacion manual de misiones
SELECT gamilit.initialize_user_missions('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid);
```

---

## PATRON 4: Error 403 - "Cannot access stats of another user"

### Sintoma
```
403 Forbidden: Cannot access stats of another user
```

### Causa Raiz
El endpoint valida que `userId` del parametro coincida con `req.user.id` del JWT.
Puede ocurrir cuando:
1. El frontend envia un userId diferente al del token
2. El authStore tiene un userId desactualizado
3. Race condition entre login y llamadas API

### Diagnostico Rapido
```typescript
// En el frontend, verificar que coincidan:
console.log('authStore.user.id:', useAuthStore.getState().user?.id);
console.log('JWT user.id:', parseJWT(token).id);
```

### Solucion Recomendada
Usar endpoints `/me` que extraen el userId del JWT en lugar de pasarlo como parametro:

```typescript
// En lugar de:
GET /gamification/missions/stats/:userId

// Usar:
GET /gamification/missions/stats/me
```

### Implementacion Backend
```typescript
// missions.controller.ts
@Get('stats/me')
async getMyStats(@Request() req: AuthRequest) {
  return this.missionsService.getStats(req.user!.id);
}
```

---

## PATRON 5: Trigger no se ejecuta para usuarios de seeds

### Sintoma
Usuarios creados via seeds no tienen registros en tablas dependientes
(user_stats, user_ranks, comodines_inventory, missions).

### Causa Raiz
Los triggers de PostgreSQL solo se ejecutan en operaciones DML reales.
Los seeds que usan INSERT INTO... no disparan triggers si la sesion
tiene triggers deshabilitados o si el orden de seeds es incorrecto.

### Solucion Estandar
1. Usar la funcion de inicializacion directamente despues del INSERT:
```sql
INSERT INTO auth_management.profiles (...) VALUES (...);
SELECT gamilit.initialize_user_stats(NEW_USER_ID);
SELECT gamilit.initialize_user_missions(NEW_USER_ID);
```

2. O incluir INSERTs explicitos para todas las tablas dependientes con ON CONFLICT DO NOTHING.

---

## PATRON 6: TypeORM Cross-Datasource Entity Metadata Error

### Sintoma
```
TypeORMError: Entity metadata for Classroom#tenant was not found.
Check if you specified a correct entity object and if it's connected
in the connection options.
```

### Causa Raiz
TypeORM con **multiples datasources** requiere que TODAS las entidades referenciadas
en relaciones (`@ManyToOne`, `@OneToMany`, etc.) esten registradas en el **MISMO datasource**.

Ejemplo del error:
- `Classroom` (en datasource 'social') tiene `@ManyToOne(() => Tenant)`
- `Tenant` esta en datasource 'auth' pero NO en 'social'
- TypeORM no puede encontrar los metadatos de `Tenant` dentro del contexto 'social'

### Diagnostico Rapido
```bash
# 1. Identificar que entidad falta
# El error indica: "Entity metadata for X#Y was not found"
# X = entidad que tiene la relacion
# Y = campo de la relacion (ej: tenant, profile, school)

# 2. Buscar que datasource usa la entidad X
grep -n "X.entity" apps/backend/src/app.module.ts

# 3. Verificar si la entidad relacionada (del campo Y) esta en ese datasource
# Revisar la seccion de entities: [] en app.module.ts
```

### Solucion
Agregar la entidad faltante al datasource en `app.module.ts`:

```typescript
// Datasource 'social' - ANTES (ERROR):
entities: [
  __dirname + '/modules/social/entities/**/*.entity{.ts,.js}',
],

// Datasource 'social' - DESPUES (CORRECTO):
entities: [
  __dirname + '/modules/social/entities/**/*.entity{.ts,.js}',
  // FIX-BE-012: Required for @ManyToOne relations
  __dirname + '/modules/auth/entities/profile.entity{.ts,.js}',
  __dirname + '/modules/auth/entities/tenant.entity{.ts,.js}',
],
```

### Cascada de Dependencias

Si la entidad agregada tiene sus propias relaciones, tambien deben agregarse:

```
EntityA -> EntityB -> EntityC

Si EntityA esta en datasource X:
- EntityB debe estar en datasource X
- EntityC debe estar en datasource X (por la cascada EntityB -> EntityC)
```

### Prevencion
1. **ANTES de agregar `@ManyToOne`:** Verificar que la entidad relacionada esta en el mismo datasource
2. Revisar la directiva: `orchestration/directivas/triggers/TRIGGER-TYPEORM-CROSS-DATASOURCE.md`
3. Documentar cada adicion con comentario `// FIX-BE-XXX: Required for...`

### Referencia
- Tarea de origen: TASK-2026-01-19-013
- Directiva: `orchestration/directivas/triggers/TRIGGER-TYPEORM-CROSS-DATASOURCE.md`

---

## CHECKLIST DE RESET DE BASE DE DATOS

Antes de probar la aplicacion despues de cambios de schema:

- [ ] Ejecutar `./reset-database.sh` desde `apps/database/scripts/`
- [ ] Verificar que no hay errores en la salida del script
- [ ] Confirmar que los usuarios de testing existen:
  - `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` (admin)
  - `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb` (teacher)
  - `cccccccc-cccc-cccc-cccc-cccccccccccc` (student)
- [ ] Verificar que tienen registros en:
  - `gamification_system.user_stats`
  - `gamification_system.user_ranks`
  - `gamification_system.comodines_inventory`
  - `gamification_system.missions`
- [ ] Probar login con cada tipo de usuario
- [ ] Verificar que el dashboard carga sin errores 404/500

---

## COMANDOS UTILES

```bash
# Ver estructura de una tabla
PGPASSWORD=xxx psql -h localhost -U gamilit_user -d gamilit -c "\d+ schema.tabla"

# Ver triggers de una tabla
PGPASSWORD=xxx psql -h localhost -U gamilit_user -d gamilit -c "
SELECT tgname, proname FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'schema.tabla'::regclass;"

# Ver funciones de un schema
PGPASSWORD=xxx psql -h localhost -U gamilit_user -d gamilit -c "
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'gamilit';"

# Reset database completo
cd apps/database/scripts && ./reset-database.sh
```

---

## REFERENCIAS

- DDL Location: `apps/database/ddl/schemas/`
- Seeds Location: `apps/database/seeds/{dev,prod}/`
- Entities Location: `apps/backend/src/modules/*/entities/`
- Init Functions: `apps/database/ddl/schemas/gamilit/functions/`
  - `04-initialize_user_stats.sql`
  - `18-initialize_user_missions.sql`
