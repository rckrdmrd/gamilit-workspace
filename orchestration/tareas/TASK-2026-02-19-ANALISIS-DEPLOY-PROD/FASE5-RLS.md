# FASE 5: Analisis de RLS (Row Level Security) y BYPASSRLS

**Fecha:** 2026-02-19
**Tarea:** TASK-2026-02-19-ANALISIS-DEPLOY-PROD
**Analista:** Claude Opus 4.6
**Severidad General:** CRITICA

---

## 1. RESUMEN EJECUTIVO

El sistema gamilit tiene una contradiccion fundamental de seguridad: se han invertido cientos de horas definiendo **~467 politicas RLS** en la base de datos para proteger **~104 tablas**, pero **NINGUNA de estas politicas se ejecuta en produccion** porque `gamilit_user` tiene `BYPASSRLS=true`. Ademas, el backend no ejecuta `SET LOCAL app.current_user_id` en las conexiones a PostgreSQL (excepto en 4 metodos de TeacherReportsService), lo que significa que incluso si se revocara BYPASSRLS, el sistema se caeria inmediatamente porque todas las policies evaluarian `auth.uid()` como NULL, denegando todo acceso.

**Estado actual: RLS es completamente decorativo. No protege nada.**

---

## 2. ESTADO ACTUAL DE BYPASSRLS

### 2.1 Privilegios de gamilit_user

**Archivo:** `apps/database/ddl/99-post-ddl-permissions.sql`

```sql
-- Linea 119
ALTER ROLE gamilit_user BYPASSRLS;
```

**Comentario en DDL (lineas 112-117):**
```
-- Added: 2025-12-18 (FIX: Application user needs to bypass RLS)
-- Reason: The application manages RLS context via app.current_user_id
--         but needs BYPASSRLS to perform operations on behalf of users
```

**Privilegios completos otorgados a gamilit_user:**

| Categoria | Privilegio | Alcance |
|-----------|-----------|---------|
| Schema USAGE | GRANT USAGE | 16 schemas (todos excepto data_warehouse, gamilit) |
| Tables | ALL PRIVILEGES | Todas las tablas en 14 schemas |
| Sequences | ALL PRIVILEGES | Todas las secuencias en 14 schemas |
| Functions | EXECUTE | 6 schemas (gamilit, auth, public, notifications, communication, lti_integration) |
| Default Privileges | ALL ON TABLES | 14 schemas (future objects) |
| Default Privileges | ALL ON SEQUENCES | 14 schemas (future objects) |
| Default Privileges | EXECUTE ON FUNCTIONS | 6 schemas (future objects) |
| Role Attribute | **BYPASSRLS** | Global - bypasses ALL RLS policies |
| Role Attribute | CREATEDB (implicit) | Puede crear bases de datos |

**Impacto:** `gamilit_user` tiene acceso TOTAL e IRRESTRICTO a todas las tablas de todos los schemas. Las 467+ politicas RLS son completamente invisibles para este usuario.

### 2.2 Funcion post_seeds_security() -- DESHABILITADA

**Archivo:** `apps/database/scripts/init-database.sh` (lineas 1471-1513)

La funcion `post_seeds_security()` esta **COMENTADA** y solo emite warnings:

```bash
post_seeds_security() {
    print_step "Post-seeds security check (NOBYPASSRLS deshabilitado)..."
    print_warning "NOBYPASSRLS esta DESHABILITADO -- RLS policies existen pero gamilit_user las bypasea"
    # ... (codigo de NOBYPASSRLS completamente comentado)
}
```

**Prerequisitos documentados para re-habilitar NOBYPASSRLS (lineas 1483-1491):**

1. **RlsInterceptor debe ejecutar `SET LOCAL app.current_user_id = '<uuid>'`** en la conexion DB de CADA request autenticado (via TypeORM transaction)
2. **Endpoints publicos** (login, register, health) deben tener policies que permitan operaciones sin user context (`WITH CHECK true` + `SELECT USING true`)
3. **Todas las tablas con `INSERT...RETURNING*`** deben tener SELECT policies que pasen sin user context O el ORM debe evitar `RETURNING*`
4. **Validacion end-to-end** con la app corriendo: login, CRUD, y admin flujos funcionen

---

## 3. ANALISIS DEL RLS INTERCEPTOR

### 3.1 Estado Actual del Interceptor

**Archivo:** `apps/backend/src/shared/interceptors/rls.interceptor.ts`

El interceptor esta registrado globalmente en `app.module.ts` (linea 460):
```typescript
{
  provide: APP_INTERCEPTOR,
  useClass: RlsInterceptor,
}
```

**Lo que HACE actualmente:**
- Extrae `userId`, `userEmail`, `userRole`, `tenantId` del JWT
- Adjunta un objeto `request.rlsContext` al request HTTP
- Emite logs de debug

**Lo que NO HACE (y deberia hacer):**
- **NO ejecuta `SET LOCAL app.current_user_id`** en la conexion PostgreSQL
- **NO ejecuta `SET LOCAL app.current_tenant_id`** en la conexion PostgreSQL
- **NO ejecuta `SET LOCAL app.current_user_role`** en la conexion PostgreSQL
- El metodo `getDataSource()` (linea 41) retorna `null` siempre con un TODO comentario

**Codigo critico (lineas 96-99):**
```typescript
// Por ahora, el RLS se aplicara a nivel de servicio usando el contexto
// En el futuro, se puede implementar la aplicacion automatica de SET LOCAL
return next.handle().pipe(
```

**Conclusion:** El interceptor es un **stub incompleto**. Adjunta metadata al request pero no interactua con PostgreSQL en absoluto.

### 3.2 Uso de rlsContext en el Backend

Solo **1 archivo** referencia `rlsContext`:
- `apps/backend/src/shared/interceptors/rls.interceptor.ts` (donde se define)

**Ningun servicio, controller, o guard lee `request.rlsContext`** para tomar decisiones de seguridad. El contexto se adjunta pero se ignora completamente.

### 3.3 Unico Lugar con SET LOCAL Funcional

**Archivo:** `apps/backend/src/modules/teacher/services/teacher-reports.service.ts`

**4 metodos** ejecutan `SET LOCAL app.current_user_id` dentro de transacciones explecitas:

| Metodo | Linea | Descripcion |
|--------|-------|-------------|
| `getMyReports()` | 55 | Obtiene reportes del maestro |
| `getMyReportsWithStats()` | 85 | Reportes con estadisticas |
| `getReportDetail()` | 162 | Detalle de un reporte |
| `deleteReport()` | 230 | Eliminar reporte |

**Patron usado:**
```typescript
return this.dataSource.transaction(async (manager) => {
    await manager.query(`SET LOCAL app.current_user_id = '${teacherId}'`);
    // ... queries within transaction
});
```

**Nota de seguridad:** El valor `teacherId` se interpola directamente en la cadena SQL (string interpolation). Aunque se valida con regex UUID antes de usarlo, esto representa un patron de SQL injection que deberia usar parametros preparados.

**Esto significa:** De los **904 endpoints** del backend, exactamente **4** (0.44%) tendrian RLS funcional si se deshabilitara BYPASSRLS. Los otros **900 endpoints** fallarian inmediatamente.

---

## 4. COBERTURA RLS EN LA BASE DE DATOS

### 4.1 Tablas con RLS Habilitado

Conteo de `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` deduplicado por tabla unica:

| Fase | Archivo DDL | Tablas Cubiertas |
|------|-------------|------------------|
| Fase 1 | `07-enable-rls.sql` | 29 tablas |
| Fase 2 | `07b-enable-rls-phase2.sql` | 34 tablas |
| Fase 3 | `07c-enable-rls-phase3.sql` | 19 tablas |
| Fase Pending | `07d-rls-policies-pending-tables.sql` | 8 tablas nuevas + 17 existentes refinadas |
| Schema DDL | `schemas/*/rls-policies/` y `schemas/*/tables/` | Duplicados + 13 tablas adicionales |

**Tablas unicas con RLS ENABLE (deduplicadas):** ~104 tablas

**Total de tablas en la base de datos:** 169

**Cobertura RLS:** ~62% de tablas (104/169)

**Tablas SIN RLS (~65 tablas):** Incluyen tablas de:
- `data_warehouse` (fact tables, dimension tables) -- ~16 tablas
- `auth.users` -- tabla core de autenticacion
- Varias tablas de configuracion y metadata
- `storage` schema
- Junction tables sin user_id

### 4.2 Conteo de Politicas RLS

| Fuente | CREATE POLICY Count |
|--------|-------------------|
| `07-enable-rls.sql` | 63 |
| `07b-enable-rls-phase2.sql` | 65 |
| `07c-enable-rls-phase3.sql` | 29 |
| `07d-rls-policies-pending-tables.sql` | 75 |
| Schema-level RLS files | 392 |
| **Total DDL source** | **624** |
| **Runtime (post-DROP duplicates)** | **~467** |

La diferencia entre 624 y ~467 se debe a que `07d` hace `DROP POLICY IF EXISTS` antes de recrear policies con patrones `gamilit.*` mas granulares, reemplazando las de `07/07b`.

### 4.3 Patron de Autenticacion en Policies

Las policies usan dos patrones para identificar al usuario:

**Patron 1 -- auth.uid() (older, ~190 references):**
```sql
USING (user_id = auth.uid())
-- auth.uid() delega a gamilit.get_current_user_id()
```

**Patron 2 -- gamilit.get_current_user_id() (newer, ~75 references):**
```sql
USING (user_id = gamilit.get_current_user_id())
```

Ambos patrones convergen en la misma funcion:
```sql
-- gamilit.get_current_user_id()
RETURN NULLIF(current_setting('app.current_user_id', true), '')::UUID;
```

**Sin `SET LOCAL app.current_user_id`**, esta funcion retorna **NULL**, y todas las policies que comparan `user_id = NULL` evaluan a **FALSE** (deny).

### 4.4 FORCE ROW LEVEL SECURITY

**38 declaraciones** `FORCE ROW LEVEL SECURITY` en el DDL, cubriendo ~13 tablas unicas:

```
auth_management.auth_attempts
educational_content.assessment_rubrics
educational_content.media_resources
progress_tracking.scheduled_missions
progress_tracking.student_intervention_alerts
progress_tracking.teacher_alert_configurations
progress_tracking.user_learning_paths
progress_tracking.engagement_metrics
progress_tracking.progress_snapshots
auth_management.two_factor_tokens
social_features.guild_join_requests
gamification_system.user_equipped_items
gamification_system.user_purchases
system_configuration.notification_settings
```

`FORCE ROW LEVEL SECURITY` asegura que incluso el **owner** de la tabla (que normalmente bypasses RLS) esta sujeto a las policies. Sin embargo, con `BYPASSRLS=true` en el role, **FORCE tampoco tiene efecto** -- BYPASSRLS supera a FORCE.

### 4.5 Multi-Tenancy via RLS

**19 policies** referencian `app.current_tenant_id`:
- `auth_management.rls-policies/01-policies.sql` -- 4 policies (profiles, user_roles, memberships, tenants)
- `educational_content.rls-policies/03-teacher_content-policies.sql` -- 9 policies (teacher_contents)
- `social_features` -- 4 policies (schools, teacher_reports, scheduled_reports, shared_reports)
- `system_configuration` -- 2 policies (notification_settings)

**Impacto de BYPASSRLS en multi-tenancy:**
- El backend **NO ejecuta `SET LOCAL app.current_tenant_id`** en ninguna parte
- Con BYPASSRLS=true, **no hay aislamiento de tenant a nivel de base de datos**
- Todo el aislamiento de tenant depende exclusivamente de la logica de aplicacion (WHERE clauses en queries)
- Un bug en cualquier servicio podria exponer datos de otro tenant

---

## 5. EVALUACION DE IMPACTO DE SEGURIDAD

### 5.1 Riesgo: Sin Aislamiento de Datos a Nivel DB

| Escenario | Sin RLS (actual) | Con RLS (target) |
|-----------|-----------------|-----------------|
| Bug en servicio filtra WHERE | Acceso a TODOS los datos | Bloqueado por policy |
| SQL injection | Acceso a TODAS las tablas | Limitado a user context |
| Escalacion de privilegios app | Sin defensa en profundidad | DB valida permisos |
| Cross-tenant data leak | Posible via bug | Bloqueado por tenant policy |
| Admin impersonation | Trivial | Requiere admin role en DB |

### 5.2 Datos Sensibles Sin Proteccion Real

Las siguientes tablas contienen datos sensibles y tienen policies definidas pero **inefectivas**:

| Tabla | Datos Sensibles | Risk Level |
|-------|----------------|------------|
| `auth_management.two_factor_tokens` | secret_key, backup_codes_encrypted | CRITICO |
| `auth_management.user_sessions` | session tokens, IP addresses | ALTO |
| `auth_management.security_events` | Security event logs | ALTO |
| `progress_tracking.exercise_attempts` | Student academic data | ALTO |
| `gamification_system.user_stats` | Gamification profiles | MEDIO |
| `gamification_system.ml_coins_transactions` | Virtual economy | MEDIO |
| `communication.messages` | Private messages | ALTO |
| `audit_logging.audit_logs` | System audit trail | ALTO |

### 5.3 Severidad por Escenario de Ataque

| Ataque | Probabilidad | Impacto | Severidad |
|--------|-------------|---------|-----------|
| App-layer bug expose cross-tenant data | MEDIA | ALTO | **ALTO** |
| SQL injection (string interpolation en TeacherReportsService) | BAJA | CRITICO | **ALTO** |
| Insider threat (dev con acceso a DB) | BAJA | CRITICO | **MEDIO** |
| Compromiso de credenciales gamilit_user | BAJA | CRITICO | **ALTO** |

---

## 6. PLAN DE MIGRACION A NOBYPASSRLS (Enfoque por Fases)

### Fase 0: Preparacion y Auditoria (1-2 semanas)

**Objetivo:** Asegurar que las policies existentes son correctas antes de activarlas.

1. **Auditar todas las 467 policies** para verificar que no bloquean operaciones legitimas
2. **Identificar tablas faltantes** que necesitan policies
3. **Clasificar endpoints por patron de acceso:**
   - Publicos (no requieren user context): login, register, health, public content
   - Autenticados (requieren user context): la mayoria
   - Admin-only: admin dashboard, system config
   - System (cron jobs, triggers): necesitan bypass especial

4. **Crear policies para endpoints publicos:**
   ```sql
   -- Ejemplo para auth.users (login)
   CREATE POLICY users_public_read ON auth.users
       FOR SELECT USING (true);  -- login necesita buscar por email

   CREATE POLICY users_system_insert ON auth.users
       FOR INSERT WITH CHECK (true);  -- registration
   ```

5. **Documentar todas las tablas con INSERT...RETURNING\*:**
   TypeORM usa `RETURNING *` por defecto en INSERTs. Cada tabla con INSERT policy necesita tambien SELECT policy que pase para el mismo contexto.

### Fase 1: Implementar SET LOCAL en RlsInterceptor (2-3 semanas)

**Objetivo:** Hacer que el interceptor ejecute SET LOCAL en cada conexion DB.

**Implementacion requerida:**

```typescript
// Pseudocodigo del interceptor corregido
intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
        return next.handle(); // Endpoints publicos
    }

    const userId = user.userId || user.sub || user.id;
    const tenantId = user.tenantId || user.tenant_id;

    // NUEVO: Inyectar en CADA query runner via TypeORM subscriber
    // o via middleware de conexion
    return from(this.setRlsContext(userId, tenantId)).pipe(
        switchMap(() => next.handle()),
        finalize(() => this.clearRlsContext())
    );
}

private async setRlsContext(userId: string, tenantId?: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.query(`SET LOCAL app.current_user_id = $1`, [userId]);
    if (tenantId) {
        await queryRunner.query(`SET LOCAL app.current_tenant_id = $1`, [tenantId]);
    }
}
```

**Desafio principal:** TypeORM no garantiza que queries subsecuentes usen la MISMA conexion del pool. `SET LOCAL` solo aplica dentro de una transaccion. Posibles soluciones:
- Wrappear cada request en una transaccion implicita (TransactionInterceptor)
- Usar `SET SESSION` en lugar de `SET LOCAL` (menos seguro, requiere RESET)
- Usar un middleware de conexion que inyecte el contexto antes de cada query

### Fase 2: Validacion con BYPASSRLS (1-2 semanas)

**Objetivo:** Verificar que SET LOCAL funciona sin desactivar BYPASSRLS todavia.

1. Agregar logging temporal que verifique que `gamilit.get_current_user_id()` retorna el UUID correcto despues de SET LOCAL
2. Correr test suite completa (833 tests)
3. Validar en dev que login, CRUD, admin, y teacher flujos funcionan
4. Verificar que no hay regresiones de performance (SET LOCAL agrega latencia)

### Fase 3: NOBYPASSRLS en Dev (2-3 semanas)

**Objetivo:** Activar NOBYPASSRLS en ambiente de desarrollo.

1. Ejecutar: `ALTER ROLE gamilit_user NOBYPASSRLS;`
2. Correr todo el test suite
3. Probar manualmente TODOS los flujos criticos:
   - Login/Logout (4 roles)
   - CRUD de cada modulo
   - Gamificacion (XP, logros, tienda)
   - Reportes de maestro
   - Admin dashboard
   - Notificaciones
4. Documentar CADA policy que necesita ajuste
5. Corregir policies y repetir validacion

### Fase 4: NOBYPASSRLS en Produccion (1 semana)

**Objetivo:** Desplegar en produccion con NOBYPASSRLS.

1. Backup completo de base de datos
2. Desplegar codigo con SET LOCAL implementado
3. Ejecutar `ALTER ROLE gamilit_user NOBYPASSRLS;` en produccion
4. Monitorear logs por 48 horas
5. Plan de rollback: `ALTER ROLE gamilit_user BYPASSRLS;` si hay problemas criticos

### Estimacion Total: 6-10 semanas

---

## 7. RIESGOS Y MITIGACIONES

### R1: TypeORM Connection Pooling vs SET LOCAL
- **Riesgo:** SET LOCAL solo aplica dentro de una transaccion; TypeORM puede usar diferentes conexiones
- **Mitigacion:** Implementar TransactionInterceptor que wrappea cada request en una transaccion implicita

### R2: Performance Impact
- **Riesgo:** SET LOCAL + RLS policy evaluation agrega latencia a cada query
- **Mitigacion:** Las policies usan indices (user_id, tenant_id ya tienen indices); benchmark antes de produccion

### R3: Cron Jobs y Background Tasks
- **Riesgo:** Tareas de sistema (PendingUserInitialization, etc.) no tienen user context
- **Mitigacion:** Crear un role separado `gamilit_system` con BYPASSRLS para operaciones de sistema, o usar policies `WITH CHECK (true)` para INSERT de sistema

### R4: INSERT...RETURNING\* Pattern
- **Riesgo:** TypeORM usa RETURNING\* por defecto; si el INSERT policy pasa pero el SELECT policy falla, el INSERT "funciona" pero retorna 0 rows, causando errores silenciosos
- **Mitigacion:** Asegurar que toda tabla con INSERT policy tambien tenga SELECT policy para el mismo contexto

### R5: String Interpolation en TeacherReportsService
- **Riesgo:** `SET LOCAL app.current_user_id = '${teacherId}'` es vulnerable a SQL injection si la validacion UUID falla
- **Mitigacion:** Migrar a parametros preparados o usar QueryRunner con parametros

---

## 8. QUICK WINS (Sin Cambiar BYPASSRLS)

Incluso sin migrar a NOBYPASSRLS, se pueden hacer mejoras inmediatas:

1. **Separar role de sistema:** Crear `gamilit_system` con BYPASSRLS para cron jobs, y `gamilit_app` con NOBYPASSRLS para el backend web
2. **Implementar tenant filtering en middleware:** Aunque no es RLS real, agregar un middleware que inyecte `WHERE tenant_id = ?` en todas las queries de TypeORM
3. **Auditar TeacherReportsService:** Corregir la SQL injection potencial con parametros preparados
4. **Habilitar FORCE RLS en TODAS las tablas con policies:** Actualmente solo 13 tablas tienen FORCE; deberian ser las ~104

---

## 9. RESUMEN DE HALLAZGOS

| # | Hallazgo | Severidad | Estado |
|---|----------|-----------|--------|
| H-RLS-01 | BYPASSRLS=true anula TODAS las 467 policies RLS | CRITICO | SIN CORREGIR |
| H-RLS-02 | RlsInterceptor no ejecuta SET LOCAL (es un stub) | CRITICO | SIN CORREGIR |
| H-RLS-03 | Solo 4/904 endpoints ejecutan SET LOCAL | CRITICO | PARCIAL |
| H-RLS-04 | Aislamiento multi-tenant depende solo de app logic | ALTO | SIN CORREGIR |
| H-RLS-05 | 65/169 tablas no tienen policies RLS definidas | MEDIO | DOCUMENTADO |
| H-RLS-06 | Solo 13/104 tablas tienen FORCE ROW LEVEL SECURITY | MEDIO | PARCIAL |
| H-RLS-07 | SQL injection potencial en TeacherReportsService | MEDIO | SIN CORREGIR |
| H-RLS-08 | No hay SET LOCAL para app.current_tenant_id en NINGUN lugar | ALTO | SIN CORREGIR |
| H-RLS-09 | post_seeds_security() comentada en init-database.sh | INFO | DOCUMENTADO |
| H-RLS-10 | 19 policies con tenant_id filter son inoperantes | ALTO | SIN CORREGIR |

---

## 10. RECOMENDACIONES PRIORIZADAS

### Prioridad 1 (Inmediata -- produccion actual)
- **Documentar** que RLS no esta activo y que la seguridad depende 100% de la capa de aplicacion
- **Revisar** todos los servicios para confirmar que tienen WHERE clauses de tenant_id
- **Corregir** la SQL injection en TeacherReportsService (usar parametros)

### Prioridad 2 (Sprint siguiente)
- **Implementar** SET LOCAL en RlsInterceptor con TransactionInterceptor
- **Crear** policies para endpoints publicos (login, register, health)
- **Crear** role gamilit_system para background tasks

### Prioridad 3 (2-3 sprints)
- **Activar** NOBYPASSRLS en dev y validar exhaustivamente
- **Completar** policies para las 65 tablas sin cobertura
- **Agregar** FORCE ROW LEVEL SECURITY a todas las tablas con policies

### Prioridad 4 (4-5 sprints)
- **Desplegar** NOBYPASSRLS en produccion
- **Monitorear** y ajustar policies basado en logs
- **Documentar** modelo de seguridad completo

---

*Documento generado por Claude Opus 4.6 -- TASK-2026-02-19-ANALISIS-DEPLOY-PROD/FASE5-RLS*
