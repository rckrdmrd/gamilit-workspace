# ADR-003: Row-Level Security (RLS) para Multi-tenancy con Aislamiento de Escuelas

**Fecha:** 2025-08-18
**Estado:** Aceptada
**Autor:** Equipo GAMILIT

---

## Contexto

GAMILIT es una plataforma multi-tenant donde cada escuela opera como un tenant independiente. Los datos de estudiantes, progreso academico, y actividades deben estar estrictamente aislados entre escuelas por motivos de privacidad (datos de menores) y regulacion educativa.

### Requisitos:
- Aislamiento completo de datos por escuela (tenant)
- Sin posibilidad de acceso accidental entre tenants
- Performance aceptable con cientos de tenants
- Complejidad manejable en desarrollo (no bases de datos separadas por escuela)

---

## Decision

Implementar multi-tenancy mediante **Row-Level Security (RLS)** de PostgreSQL 15, con policies aplicadas a todas las tablas que contienen datos de tenant.

### Arquitectura:
1. **Todas las tablas multi-tenant** tienen columna `tenant_id UUID NOT NULL`
2. **231 DDL source / 471 runtime RLS policies** aplicadas (SELECT, INSERT, UPDATE, DELETE por tabla)
3. **Tenant context** se establece via `SET app.current_tenant_id` al inicio de cada request
4. **NestJS middleware** establece el tenant context basado en el JWT del usuario
5. **Tablas globales** (definiciones, catalogos) NO tienen RLS

### Flujo:
```
1. Request llega con JWT -> TenantMiddleware extrae tenant_id del JWT
2. TypeORM ejecuta: SET LOCAL app.current_tenant_id = 'uuid'
3. Todas las queries son filtradas por RLS automaticamente
4. No es posible leer/escribir datos de otro tenant
```

### Policy Standard:
```sql
CREATE POLICY "tenant_isolation" ON schema.table
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

---

## Consecuencias

### Positivas
- **Aislamiento garantizado a nivel de BD** (no depende de logica de aplicacion)
- **Single database:** Operacion simplificada (backup, migrations, monitoring)
- **Transparente para el ORM:** TypeORM queries funcionan normal, RLS filtra
- **Performance:** PostgreSQL optimiza RLS policies (no degradacion significativa)
- **Compliance:** Cumple requisitos de privacidad de datos de menores
- **231 DDL source / 471 runtime policies:** Cobertura completa de todas las tablas multi-tenant

### Negativas
- **Complejidad DDL:** Cada tabla nueva requiere policies
- **Testing:** Deben probarse policies (verificar aislamiento)
- **Context management:** Si no se establece tenant_id, queries pueden fallar o retornar vacio
- **Migrations:** Agregar policies a tablas existentes requiere cuidado

### Mitigaciones
- Template estandar para nuevas tablas (incluye policies automaticamente)
- Test suite especifico para validar aislamiento entre tenants
- Guard en NestJS que bloquea si no hay tenant context
- Funciones SQL helper: `set_tenant_context()`, `get_current_tenant()`

---

## Alternativas Consideradas

### 1. Base de datos separada por tenant
- **Rechazada:** Operacion insostenible con cientos de escuelas (backup, migrations, provisioning)

### 2. Schema por tenant
- **Rechazada:** Complejidad media pero poor tooling support en TypeORM, migrations complejas

### 3. Filtro por WHERE en aplicacion
- **Rechazada:** Un bug en el codigo puede exponer datos entre tenants, no es seguro para datos de menores

### 4. Columna discriminadora con Views
- **Rechazada:** Similar a WHERE en aplicacion pero con extra indirection, sin garantia a nivel BD

---

## Metricas

| Metrica | Valor |
|---------|-------|
| Total RLS policies | 231 DDL source / 471 runtime |
| Tablas con RLS | ~120 |
| Tablas sin RLS (global) | ~51 |
| Performance overhead | < 2% (medido) |
| Tenant context method | SET LOCAL (transaction-scoped) |

---

## Excepciones Documentadas de RLS

### 1. USING(true) intencionales

Las tablas `challenge_participants`, `challenge_results`, `user_ranks` tienen policies con `USING(true)` de forma intencional -- son tablas de lectura publica para leaderboards y competencias. El patron permite que cualquier usuario autenticado pueda ver rankings y resultados de desafios sin restriccion de tenant, lo cual es necesario para funcionalidades cross-tenant como leaderboards globales.

### 2. fact_exercise_completions (9 indexes)

Excepcion justificada para tabla read-only de data_warehouse con patron star-schema que requiere multiples puntos de acceso para queries analiticos. Los 9 indexes cubren las distintas dimensiones (fecha, estudiante, ejercicio, modulo, tiempo) y combinaciones frecuentes en reportes. Al ser una tabla de solo lectura sin RLS (data_warehouse no tiene tenant_id), los indexes optimizan queries de agregacion sin riesgo de fuga de datos.

### 3. BYPASSRLS de gamilit_user

Historicamente activo para simplificar desarrollo. El rol `gamilit_user` tiene `BYPASSRLS` habilitado durante la inicializacion de la base de datos para permitir la carga de seeds sin conflictos con las policies RLS. Se desactiva post-seeds en `init-database.sh` (CORR-F2-01b) mediante `ALTER ROLE gamilit_user NOBYPASSRLS`, garantizando que en runtime la aplicacion respeta todas las policies.

---

*ADR-003 - Aceptada*
