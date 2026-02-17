---
name: simco-ddl-management
description: "Gestion de cambios DDL con orden de dependencias y validacion de coherencia"
version: 1.0.0
simco_source: orchestration/directivas/simco/SIMCO-DDL.md
category: sync
priority: P1
capved_required: true
agents_compatible:
  - claude-code
  - gemini-cli
  - windsurf
  - trae
dependencies:
  - simco-safe-edit
  - simco-apply-standard
triggers:
  - on_ddl_change
  - on_schema_modification
  - on_entity_sync
internal: true
estimated_tokens: 900
tags:
  - ddl
  - database
  - postgresql
  - entity-sync
  - schema
input_schema:
  required:
    - target_schema
    - change_type
    - object_name
  optional:
    - dependencies
    - cascade_targets
    - rls_policies
output_schema:
  success:
    - ddl_files_changed
    - entities_updated
    - validation_status
  error:
    - error_code
    - error_message
contract_version: 1.0.0
---

# simco-ddl-management

## Proposito
Gestionar cambios DDL (Data Definition Language) en la base de datos PostgreSQL de gamilit, asegurando el orden correcto de dependencias entre schemas, la sincronizacion con entities del backend, y la validacion completa mediante recreacion de la base de datos. Cubre las 169 tablas distribuidas en 18 schemas del proyecto.

## Cuando Usar
- Al crear o modificar tablas, views, funciones, triggers o politicas RLS.
- Cuando se agrega un nuevo schema o se reorganizan objetos entre schemas.
- Al crear entities nuevas que requieren DDL correspondiente.
- Cuando se detectan discrepancias entre DDL y entities existentes.

## Cuando NO Usar
- Para cambios de datos (INSERT/UPDATE/DELETE) -- usar seeds en su lugar.
- Para consultas de solo lectura o analisis de datos existentes.
- Para cambios que solo afectan el backend sin impacto en la base de datos.
- Para modificaciones de configuracion de conexion (eso es config, no DDL).

## Prerequisitos
- Acceso a la base de datos PostgreSQL (`gamilit_platform`).
- Conocimiento de los 18 schemas y su estructura de dependencias.
- Script `apps/database/scripts/recreate-database.sh` funcional.
- Backend con TypeORM 0.3.x y entities sincronizadas.

## Instrucciones

### Paso 1: Identificar schema y tabla objetivo
Determinar en cual de los 18 schemas del proyecto se ubica o ubicara el cambio:
- `auth_management` -- autenticacion, perfiles, roles
- `educational_content` -- modulos, ejercicios, contenido
- `gamification_system` -- XP, rangos, logros, economia
- `student_progress` -- progreso, submissions, tracking
- `social_interaction` -- amigos, gremios, leaderboards
- `teacher_portal` -- asignaciones, reportes docentes
- `admin_dashboard` -- vistas administrativas
- `audit_logging` -- logs de sistema, actividad
- `data_warehouse` -- facts, dims (DDL-only, sin entities)
- Otros: `communication`, `notification_system`, `parent_portal`, `system_config`, `gamilit`

Consultar `apps/database/ddl/schemas/<schema>/` para ver los archivos existentes.

### Paso 2: Verificar dependencias
Antes de escribir DDL, verificar:
- **Foreign keys:** Las tablas referenciadas deben existir antes. Verificar orden de creacion.
- **ENUMs:** Los tipos ENUM referenciados deben estar definidos en `00-prerequisites.sql` o en el schema correspondiente.
- **Funciones:** Si el trigger referencia una funcion, esta debe existir antes del trigger.
- **Cross-schema references:** Usar nombre completo `schema.tabla`. Verificar que no haya referencias circulares.
- **RLS policies:** Las funciones auxiliares (`auth.uid()`, `gamilit.is_super_admin()`) deben existir.

### Paso 3: Escribir DDL con convenciones de nombrado
Seguir las convenciones del proyecto:
- **Tablas:** snake_case, plural (`exercise_submissions`, NO `exercise_submission`)
- **Columnas:** snake_case (`created_at`, `updated_at`, `tenant_id`)
- **Foreign keys:** `fk_<tabla>_<columna>` o inferido por TypeORM
- **Indices:** `idx_<tabla>_<columnas>`
- **Triggers:** `trg_<descripcion>` con numeracion en archivo (`28-trg_update_missions_on_use_comodines.sql`)
- **Funciones:** snake_case, agrupadas por proposito
- **RLS policies:** `<accion>_<tabla>_<scope>` (ej: `select_profiles_own_tenant`)

Ubicar el archivo en `apps/database/ddl/schemas/<schema>/<tipo>/` donde tipo es `tables`, `functions`, `triggers`, `policies`, `views`.

### Paso 4: Actualizar entity del backend
Por cada tabla nueva o modificada (excepto data_warehouse), crear o actualizar la entity correspondiente:
- Ubicacion: `apps/backend/src/modules/<modulo>/entities/<nombre>.entity.ts`
- Decoradores: `@Entity('<nombre_tabla>')`, `@Column()`, `@ManyToOne()`, `@OneToMany()`
- **Importante:** Verificar que la entity este registrada en el datasource correcto de `app.module.ts` (11 datasources).
- **Cross-datasource:** Si la entity tiene `@ManyToOne` a Profile o Tenant, registrar esas entities en el datasource.

### Paso 5: Verificar orden de cascada
Ejecutar mentalmente o con herramientas el orden de creacion:
1. ENUMs y tipos
2. Schemas
3. Tablas base (sin FKs a otras tablas del mismo batch)
4. Tablas con FKs (en orden de dependencia)
5. Funciones
6. Triggers
7. Politicas RLS
8. Views y Materialized Views

Verificar que `init-database.sh` procesara los archivos en el orden correcto.

### Paso 6: Validar con recreacion de base de datos
```bash
cd apps/database && bash scripts/recreate-database.sh
```
Verificar:
- Sin errores en la creacion de objetos.
- Conteos esperados: tablas, funciones, triggers, RLS policies.
- Backend compila correctamente: `cd apps/backend && npm run build`.
- Tests pasan: `cd apps/backend && npm run test`.

## Manejo de Errores

| Escenario | Accion | Ejemplo |
|-----------|--------|---------|
| Dependencia faltante | Identificar objeto requerido, crear DDL primero, re-ejecutar | FK a tabla inexistente -> crear tabla base antes |
| Naming mismatch DDL/Entity | Corregir el que diverge del estandar (DDL es la fuente de verdad) | Entity usa singular, DDL usa plural -> corregir entity |
| Cascade failure | Revisar orden de archivos en el schema, renumerar si es necesario | `05-tabla.sql` depende de `07-funcion.sql` -> reordenar |
| Permission denied | Verificar que DDL corre como superuser (postgres), no como gamilit_user | SECURITY DEFINER functions requieren superuser |
| ENUM ya existe | Usar `DO $$ ... IF NOT EXISTS` pattern para ENUMs idempotentes | `CREATE TYPE IF NOT EXISTS` no existe en PG -> usar DO block |

## Formato de Salida

```yaml
ddl_management_result:
  ddl_files_changed:
    - path: "apps/database/ddl/schemas/gamification_system/tables/new_table.sql"
      action: "created"
    - path: "apps/database/ddl/schemas/gamification_system/triggers/29-trg_new.sql"
      action: "created"
  entities_updated:
    - path: "apps/backend/src/modules/gamification/entities/new-table.entity.ts"
      action: "created"
      datasource: "gamification"
  validation_status:
    recreate_db: "success"
    backend_build: "success"
    backend_tests: "pass"
  metrics_delta:
    tables: "+1 (170)"
    functions: "+0"
    triggers: "+1 (68)"
    rls_policies: "+2 (229)"
```

## Checklist de Validacion
- [ ] El schema objetivo fue correctamente identificado.
- [ ] Todas las dependencias (FKs, ENUMs, funciones) existen antes del nuevo objeto.
- [ ] Las convenciones de nombrado se respetan (plural, snake_case).
- [ ] La entity correspondiente fue creada/actualizada en el backend.
- [ ] La entity esta registrada en el datasource correcto de `app.module.ts`.
- [ ] `recreate-database.sh` ejecuta sin errores.
- [ ] `npm run build` del backend compila sin errores.

## Referencias
- `orchestration/directivas/simco/SIMCO-DDL.md`
- `orchestration/directivas/simco/SIMCO-SINCRONIZACION-BD.md`
- `docs/40-standards/ESTANDAR-DATABASE-PROFESIONAL.md`
- `docs/20-architecture/MODELO-DATOS.md`
- CLAUDE.md -- RC2: COHERENCIA ENTRE CAPAS
