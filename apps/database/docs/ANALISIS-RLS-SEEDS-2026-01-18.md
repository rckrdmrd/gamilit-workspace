# Analisis: RLS Bloqueando Seeds - GAMILIT

**Fecha:** 2026-01-18
**Problema:** Seeds de datos fallan con "new row violates row-level security policy"
**Estado:** ✅ RESUELTO (2026-01-18)

---

## RESOLUCION IMPLEMENTADA

La correccion fue implementada en los scripts de recreacion de BD:

| Script | Version | Cambio |
|--------|---------|--------|
| `database-master.sh` | 1.0.0 | Paso [6/8] ejecuta BYPASSRLS como superusuario |
| `force-recreate-all.sh` | 2.2.0 | Paso [6/8] ejecuta BYPASSRLS como superusuario |

**Verificacion post-correccion:**
- BYPASSRLS = ACTIVO (rolbypassrls = 't')
- Tenants = 14 registros
- Profiles = 48 registros
- User Stats = 48 registros
- Module Progress = 144 registros

---

## 1. RESUMEN EJECUTIVO

### Causa Raiz

El comando `ALTER ROLE gamilit_user BYPASSRLS;` en `99-post-ddl-permissions.sql` **falla silenciosamente** porque:

1. `create-database.sh` ejecuta este archivo conectado como `gamilit_user`
2. Un usuario **NO puede otorgarse BYPASSRLS a si mismo**
3. Solo un **superusuario** (postgres) puede ejecutar `ALTER ROLE ... BYPASSRLS`
4. Resultado: `gamilit_user` queda **SIN** BYPASSRLS
5. Las tablas con `FORCE ROW LEVEL SECURITY` rechazan los INSERTs

### Evidencia

```sql
-- Consulta de verificacion
SELECT rolname, rolbypassrls FROM pg_roles WHERE rolname = 'gamilit_user';

-- Resultado ACTUAL (problema)
   rolname    | rolbypassrls
--------------+--------------
 gamilit_user | f            -- FALSE - BYPASSRLS NO activo
```

---

## 2. FLUJO DEL PROBLEMA

```
database-master.sh --mode full
    |
    v
[1-5] Crear usuario gamilit_user + BD vacia
    |
    v
[6] create-database.sh ejecuta con DATABASE_URL (gamilit_user)
    |
    v
[FASE 15.5] execute_sql("99-post-ddl-permissions.sql")
    |
    v
ALTER ROLE gamilit_user BYPASSRLS;  <-- FALLA SILENCIOSAMENTE
    |                                    (requiere superusuario)
    v
[FASE 15.6] execute_sql("07-enable-rls.sql")
    |
    v
ALTER TABLE auth_management.tenants FORCE ROW LEVEL SECURITY;
ALTER TABLE auth_management.profiles FORCE ROW LEVEL SECURITY;
    |
    v
[FASE 16] Seeds intentan INSERT
    |
    v
ERROR: new row violates row-level security policy for table "tenants"
```

---

## 3. TABLAS AFECTADAS (FORCE RLS)

Estas tablas tienen `FORCE ROW LEVEL SECURITY`, lo que significa que **incluso el owner** debe cumplir las politicas RLS (a menos que tenga BYPASSRLS):

| Schema | Tabla | Archivo DDL |
|--------|-------|-------------|
| auth_management | tenants | rls-policies/02-enable-rls.sql:84-85 |
| auth_management | profiles | rls-policies/02-enable-rls.sql:20-21 |
| auth_management | user_sessions | rls-policies/02-enable-rls.sql |
| auth_management | email_verification_tokens | rls-policies/02-enable-rls.sql |
| auth_management | password_reset_tokens | rls-policies/02-enable-rls.sql |
| auth_management | user_preferences | rls-policies/02-enable-rls.sql |
| auth_management | memberships | rls-policies/02-enable-rls.sql |
| auth_management | user_suspensions | rls-policies/02-enable-rls.sql |
| auth_management | security_events | rls-policies/02-enable-rls.sql |

---

## 4. SEEDS FALLIDOS

### 4.1 auth_management/01-tenants.sql
- **Error:** `new row violates row-level security policy for table "tenants"`
- **Linea:** ~90
- **Impacto:** CRITICO - Sin tenants, no se pueden crear profiles

### 4.2 auth_management/04-profiles-complete.sql
- **Error Previo:** `CRITICAL ERROR: No existe ningun tenant en el sistema`
- **Causa:** Seed de tenants fallo primero

### 4.3 auth_management/06-profiles-production.sql
- **Error:** Mismo que 04
- **Impacto:** 13 usuarios de produccion no se crean

### 4.4 Seeds Dependientes (Efecto Cascada)
- `gamification_system/05-user_stats.sql` - Requiere profiles
- `social_features/04-friendships.sql` - Requiere profiles
- `progress_tracking/01-module_progress.sql` - Requiere profiles

---

## 5. POLITICAS RLS INVOLUCRADAS

### 5.1 Politica en tenants (Ejemplo)
```sql
-- Archivo: ddl/schemas/auth_management/rls-policies/01-policies.sql
CREATE POLICY tenants_read_own
    ON auth_management.tenants
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (id = current_setting('app.current_tenant_id', true)::uuid);
```

**Problema:**
- Solo hay politica para SELECT
- NO hay politica para INSERT
- Sin BYPASSRLS, cualquier INSERT es rechazado

### 5.2 Politica en profiles
```sql
-- Solo SELECT policies definidas
CREATE POLICY profiles_read_own ...
CREATE POLICY profiles_read_teacher ...
CREATE POLICY profiles_read_admin ...
CREATE POLICY profiles_update_own ...
CREATE POLICY profiles_update_admin ...
```

**Problema:**
- NO hay politica INSERT para seeds
- Sin BYPASSRLS, INSERTs son rechazados

---

## 6. PLAN DE CORRECCION

### Opcion A: Ejecutar BYPASSRLS como Superusuario (RECOMENDADA)

**Archivo a crear:** `ddl/99a-superuser-permissions.sql`

```sql
-- Este archivo DEBE ejecutarse como superusuario (postgres)
-- NO puede ejecutarse como gamilit_user

ALTER ROLE gamilit_user BYPASSRLS;

-- Verificacion
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gamilit_user' AND rolbypassrls = true) THEN
        RAISE NOTICE 'BYPASSRLS habilitado exitosamente para gamilit_user';
    ELSE
        RAISE EXCEPTION 'ERROR: No se pudo habilitar BYPASSRLS para gamilit_user';
    END IF;
END $$;
```

**Modificar:** `database-master.sh` y `force-recreate-all.sh`

```bash
# Despues de crear usuario y BD, ejecutar como postgres:
print_step "[X/Y] Habilitando BYPASSRLS para gamilit_user..."
run_as_postgres "ALTER ROLE gamilit_user BYPASSRLS;"
```

### Opcion B: Agregar Politicas INSERT para Seeds

**Archivo a modificar:** `ddl/schemas/auth_management/rls-policies/01-policies.sql`

```sql
-- Politica temporal para seeds (NO recomendada en produccion)
CREATE POLICY tenants_insert_seed
    ON auth_management.tenants
    AS PERMISSIVE
    FOR INSERT
    TO gamilit_user
    WITH CHECK (true);  -- Permite cualquier INSERT

CREATE POLICY profiles_insert_seed
    ON auth_management.profiles
    AS PERMISSIVE
    FOR INSERT
    TO gamilit_user
    WITH CHECK (true);
```

**Problema:** Menos seguro, politicas permisivas permanentes.

### Opcion C: Deshabilitar RLS Temporalmente en Seeds

**Modificar:** Cada seed que inserta en tablas con FORCE RLS

```sql
-- Al inicio del seed
ALTER TABLE auth_management.tenants DISABLE ROW LEVEL SECURITY;

-- Ejecutar INSERTs...

-- Al final del seed
ALTER TABLE auth_management.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_management.tenants FORCE ROW LEVEL SECURITY;
```

**Problema:** Requiere modificar multiples seeds, riesgo de olvidar re-habilitar.

---

## 7. SOLUCION RECOMENDADA

### Implementar Opcion A

**Archivos a modificar:**

| Archivo | Cambio |
|---------|--------|
| `database-master.sh` | Agregar paso para ejecutar BYPASSRLS como postgres |
| `scripts/force-recreate-all.sh` | Agregar paso para ejecutar BYPASSRLS como postgres |
| `ddl/99-post-ddl-permissions.sql` | Mover BYPASSRLS a seccion separada con comentario de que requiere superusuario |

**Flujo corregido:**

```
database-master.sh --mode full
    |
    v
[1-5] Crear usuario gamilit_user + BD vacia (como postgres)
    |
    v
[5.5] ALTER ROLE gamilit_user BYPASSRLS; (como postgres)  <-- NUEVO
    |
    v
[6] create-database.sh (como gamilit_user)
    |
    v
[FASE 15.5] 99-post-ddl-permissions.sql (sin BYPASSRLS)
    |
    v
[FASE 15.6] 07-enable-rls.sql (FORCE RLS)
    |
    v
[FASE 16] Seeds (gamilit_user con BYPASSRLS activo)
    |
    v
SUCCESS: Datos insertados correctamente
```

---

## 8. ARCHIVOS AFECTADOS (RESUMEN)

### Base de Datos

| Archivo | Accion | Estado |
|---------|--------|--------|
| `database-master.sh` | Agregar BYPASSRLS step [6/8] | ✅ COMPLETADO v1.0.0 |
| `scripts/force-recreate-all.sh` | Agregar BYPASSRLS step [6/8] | ✅ COMPLETADO v2.2.0 |
| `ddl/99-post-ddl-permissions.sql` | Sin cambios necesarios | ⏭️ No aplica |

### Documentacion

| Archivo | Accion | Estado |
|---------|--------|--------|
| `SIMCO-RECREACION-BD.md` | Actualizar con BYPASSRLS | ✅ COMPLETADO v1.1.0 |
| `DEVENV-MASTER-INVENTORY.yml` | Actualizar inventario | ✅ COMPLETADO v1.2.0 |
| `ANALISIS-RLS-SEEDS-2026-01-18.md` | Marcar RESUELTO | ✅ Este documento |

### No Requieren Cambios

- Seeds (`seeds/prod/auth_management/*.sql`) - Funcionan correctamente con BYPASSRLS activo
- Politicas RLS (`ddl/schemas/*/rls-policies/*.sql`) - Estan correctas
- Backend (`apps/backend/`) - No afectado por este problema

---

## 9. VERIFICACION POST-CORRECCION

```bash
# 1. Verificar BYPASSRLS esta activo
PGPASSWORD='...' psql -h localhost -p 5433 -U gamilit_user -d gamilit_platform \
  -c "SELECT rolname, rolbypassrls FROM pg_roles WHERE rolname = 'gamilit_user';"
# Esperado: rolbypassrls = t

# 2. Verificar tenants creados
PGPASSWORD='...' psql -h localhost -p 5433 -U gamilit_user -d gamilit_platform \
  -c "SELECT COUNT(*) FROM auth_management.tenants;"
# Esperado: >= 1

# 3. Verificar profiles creados
PGPASSWORD='...' psql -h localhost -p 5433 -U gamilit_user -d gamilit_platform \
  -c "SELECT COUNT(*) FROM auth_management.profiles;"
# Esperado: >= 35 (testing + demo + produccion)

# 4. Verificar user_stats creados (dependiente de profiles)
PGPASSWORD='...' psql -h localhost -p 5433 -U gamilit_user -d gamilit_platform \
  -c "SELECT COUNT(*) FROM gamification_system.user_stats;"
# Esperado: igual al conteo de profiles
```

---

## 10. HALLAZGOS ADICIONALES

### 10.1 Multi-tenancy Incompleto

La funcion `gamilit.get_current_tenant_id()` retorna NULL:

```sql
-- Archivo: ddl/schemas/gamilit/functions/...
CREATE OR REPLACE FUNCTION gamilit.get_current_tenant_id()
RETURNS uuid LANGUAGE sql STABLE
AS $$ SELECT NULL::uuid; $$;  -- PLACEHOLDER
```

**Impacto:** Las politicas RLS que dependen de `current_tenant_id` no funcionan correctamente.
**Accion:** Crear tarea separada para completar implementacion multi-tenant.

### 10.2 Backend RLS Interceptor Incompleto

El `RlsInterceptor` extrae contexto pero **NO ejecuta SET LOCAL**:

```typescript
// apps/backend/src/shared/interceptors/rls.interceptor.ts
// Por ahora, el RLS se aplicará a nivel de servicio
// En el futuro, se puede implementar la aplicación automática de SET LOCAL
```

**Impacto:** Las politicas RLS en tiempo de ejecucion no reciben contexto de usuario.
**Accion:** Crear tarea separada para implementar SET LOCAL automatico.

---

## 11. PASOS EJECUTADOS (COMPLETADO)

1. ✅ Modificar `database-master.sh` para ejecutar BYPASSRLS como postgres
2. ✅ Ejecutar recreacion de BD
3. ✅ Verificar que seeds se carguen correctamente
4. ✅ Documentar el proceso

**Resultado:** Base de datos recreada exitosamente con todos los seeds cargados.

---

*Documento generado automaticamente durante analisis de problema RLS*
*Agente: Claude Code - TASK-2026-01-18*
*Resuelto: 2026-01-18*
