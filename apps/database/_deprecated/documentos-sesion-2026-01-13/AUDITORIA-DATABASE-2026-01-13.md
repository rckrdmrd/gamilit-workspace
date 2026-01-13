# AUDITORIA EXHAUSTIVA - BASE DE DATOS GAMILIT

**Fecha:** 2026-01-13
**Version:** 1.0.0
**Ejecutada por:** @PERFIL_DB_AUDITOR + @PERFIL_ORQUESTADOR
**Sistema:** SIMCO v3.8+ con SAAD

---

## RESUMEN EJECUTIVO

Se realizo una auditoria exhaustiva de la base de datos del proyecto GAMILIT con los siguientes resultados:

| Metrica | Valor |
|---------|-------|
| **Schemas analizados** | 16 |
| **Archivos DDL** | 392 |
| **Archivos Seeds** | 178 (75 dev, 80 prod, 6 staging) |
| **Entidades TypeORM** | 93 |
| **Problemas CRITICOS** | 5 |
| **Problemas ALTOS** | 6 |
| **Problemas MEDIOS** | 4 |
| **Problemas BAJOS** | 3 |

### Estado General

| Area | Estado | Cobertura |
|------|--------|-----------|
| DDL Execution | BUENO | 100% |
| Seeds PROD | BUENO | 80.5% |
| Seeds STAGING | CRITICO | 7.5% |
| Coherencia DDL-TypeORM | BUENO | 93% |
| Documentacion _MAP.md | REQUIERE ATENCION | 75% |

---

## PROBLEMAS IDENTIFICADOS

### CRITICOS (Requieren correccion inmediata)

#### CRIT-001: Referencias Rotas a "auth.users" - 16 ARCHIVOS

**Descripcion:** Multiples archivos DDL referencian `auth.users` pero la tabla real es `auth_management.profiles` para la mayoria de FKs.

**Archivos afectados:**

| Schema | Archivo | Linea Aprox |
|--------|---------|-------------|
| admin_dashboard | `tables/07-bulk_operations.sql` | FK user_id |
| admin_dashboard | `tables/08-admin_reports.sql` | FK user_id |
| auth_management | `tables/03-profiles.sql` | FK user_id (CORRECTO) |
| auth_management | `tables/06-email_verification_tokens.sql` | FK user_id |
| auth_management | `tables/07-password_reset_tokens.sql` | FK user_id |
| auth_management | `tables/08-security_events.sql` | FK user_id |
| auth_management | `tables/12-user_suspensions.sql` | FK user_id |
| content_management | `tables/05-flagged_content.sql` | FK reporter_id |
| content_management | `tables/06-moderation_rules.sql` | FK created_by |
| content_management | `tables/content_authors.sql` | FK user_id |
| educational_content | `tables/content_approvals.sql` | FK approved_by |
| educational_content | `tables/content_tags.sql` | FK created_by |
| social_features | `tables/09-user_activities.sql` | FK user_id |
| social_features | `tables/discussion_threads.sql` | FK author_id |
| social_features | `tables/social_interactions.sql` | FK user_id |
| social_features | `tables/user_follows.sql` | FK follower_id, following_id |

**Impacto:** El script DDL puede fallar durante creacion si auth.users no existe o no tiene la estructura esperada.

**Solucion:** Verificar que auth.users existe (tabla Supabase) o cambiar referencias a auth_management.profiles donde corresponda.

---

#### CRIT-002: Funcion `is_feature_enabled` DUPLICADA

**Descripcion:** La funcion existe en dos ubicaciones:

1. `/ddl/schemas/system_configuration/functions/is_feature_enabled.sql`
2. `/ddl/schemas/system_configuration/tables/06-feature_flags.sql` (inline)

**Impacto:** Conflicto durante creacion de BD, una definicion sobrescribe la otra.

**Solucion:**
- Mantener SOLO en `functions/is_feature_enabled.sql`
- Eliminar definicion inline de `tables/06-feature_flags.sql`

---

#### CRIT-003: Funcion `validate_rueda_inferencias` DUPLICADA

**Descripcion:** Dos archivos con funciones relacionadas:

1. `/ddl/schemas/educational_content/functions/14-validate_rueda_inferencias_text.sql`
2. `/ddl/schemas/educational_content/functions/14-validate_rueda_inferencias.sql`

**Impacto:** Ambos archivos tienen prefijo "14", posible conflicto de orden.

**Solucion:** Consolidar en un solo archivo o renumerar.

---

#### CRIT-004: Timestamps incompatibles en tabla `missions`

**Descripcion:** DDL usa `timestamp without time zone` pero TypeORM declara `timestamp with time zone`.

**Archivos:**
- DDL: `/ddl/schemas/gamification_system/tables/06-missions.sql` (lineas 40-45)
- TypeORM: `/apps/backend/src/modules/gamification/entities/mission.entity.ts` (lineas 126-136)

**Campos afectados:**
- `start_date`
- `end_date`
- `completed_at`
- `claimed_at`

**Impacto:** Conversiones implicitas, inconsistencias en comparaciones de fechas.

**Solucion:** Alinear ambos a `timestamp with time zone` (estandar).

---

#### CRIT-005: Tipo `progress` incompatible en tabla `missions`

**Descripcion:**
- DDL: `double precision`
- TypeORM: `float` (mapea a `real` en PostgreSQL)

**Impacto:** Perdida de precision potencial.

**Solucion:** Cambiar TypeORM a `{ type: 'double precision' }`.

---

### ALTOS (Corregir en 1-2 semanas)

#### ALTO-001: _MAP.md Desactualizados - 3 SCHEMAS

| Schema | _MAP.md reporta | Real | Discrepancia |
|--------|-----------------|------|--------------|
| educational_content | 14 tablas | 24 tablas | +10 sin documentar |
| gamification_system | 15 tablas | 20 tablas | +5 sin documentar |
| progress_tracking | 17 tablas | 19 tablas | +2 sin documentar |

**Solucion:** Actualizar _MAP.md de cada schema.

---

#### ALTO-002: STAGING Incompleto

**Descripcion:**
- staging/: 6 archivos
- prod/: 80 archivos

**Impacto:** No se puede probar pipeline completo en staging.

**Solucion:** Copiar seeds de prod/ a staging/ con datos de prueba.

---

#### ALTO-003: Seed `11-exercise_validation_config_m4_m5.sql` NO EJECUTADO

**Descripcion:** El archivo existe pero NO se ejecuta en create-database.sh

**Impacto:** Si se usan modulos 4-5, sus validaciones no funcionaran.

**Solucion:** Agregar al script o documentar como intencionalmente omitido.

---

#### ALTO-004: AchievementCategory ENUM v1.1 no verificado

**Descripcion:** DDL tiene valores nuevos `collection` y `hidden` (v1.1, 2025-12-15).

**Archivos:**
- DDL: `/ddl/00-prerequisites.sql` (lineas 123-135)
- Backend: `/apps/backend/src/shared/constants/enums.constants.ts`

**Solucion:** Verificar que backend tiene los nuevos valores.

---

#### ALTO-005: communication/_MAP.md estructura enganosa

**Descripcion:** _MAP.md reporta funciones/triggers/indexes que estan inline en tablas, no en archivos separados.

**Solucion:** Clarificar en _MAP.md que son inline.

---

#### ALTO-006: Tabla `user_activity` estado residual

**Descripcion:**
- Eliminada 2026-01-07 (redundante)
- DDL en `audit_logging/_deprecated/07-user_activity.sql`
- Pero existen: `user_activity_logs`, `activity_log`

**Solucion:** Consolidar en una sola tabla canonica.

---

### MEDIOS (Corregir en 1 mes)

#### MEDIO-001: 15 Seeds no ejecutados (mayoria intencional)

**Archivos omitidos:**
- audit_logging: 3 (demo data)
- auth_management: 5 (deprecated/old versions)
- content_management: 2 (alternativas)
- educational_content: 1 (M4-M5 validation)
- progress_tracking: 3 (demo data)
- social_features: 2 (datos opcionales)
- system_configuration: 1 (old version)

**Solucion:** Documentar cada omision en README.md

---

#### MEDIO-002: Schema STORAGE vacio

**Descripcion:** FASE 4 del script no hace nada porque storage/ esta vacio.

**Solucion:** Eliminar FASE 4 o documentar como placeholder.

---

#### MEDIO-003: Validacion post-seeds limitada

**Descripcion:** Solo chequea module_progress, no verifica perfiles, ranks, integridad FK.

**Solucion:** Expandir script de validacion.

---

#### MEDIO-004: MayaRank ENUM escaping diferente

**Descripcion:**
- DDL: `'Ah K''in'` (SQL escape)
- TypeORM: `'Ah K\'in'` (JavaScript escape)

**Impacto:** Funciona pero puede causar confusion.

**Solucion:** Documentar la diferencia.

---

### BAJOS (Mejoras opcionales)

#### BAJO-001: `mv_mechanic_leaderboard` sin uso en backend

**Solucion:** Deprecate o documentar uso futuro.

#### BAJO-002: Falta indice maestro de triggers consolidados

**Solucion:** Crear INDEX-TRIGGERS.md

#### BAJO-003: Versiones antiguas de seeds no eliminadas

**Solucion:** Mover a _deprecated/

---

## GRAFO DE DEPENDENCIAS ENTRE SCHEMAS

```
Nivel 0 (Core):
  auth --> storage --> public

Nivel 1 (Application):
  auth_management (depende de: auth)
  system_configuration (sin deps)

Nivel 2 (Domain):
  educational_content (depende de: auth_management)
  notifications (depende de: auth_management)
  gamification_system (depende de: notifications, auth_management)
  progress_tracking (depende de: educational_content, auth_management)
  social_features (depende de: auth_management)
  content_management (depende de: auth_management)

Nivel 3 (Integration/Audit):
  lti_integration (depende de: system_configuration)
  communication (depende de: auth_management)
  audit_logging (depende de: auth_management)
  admin_dashboard (depende de: varios)
```

---

## ORDEN DE CARGA DE SEEDS (Validado Correcto)

```
1. system_configuration (sin dependencias)
2. audit_logging (sin dependencias)
3. auth/users (usuarios base)
4. educational_content/modules (ANTES de profiles - trigger)
5. auth_management/tenants
6. auth_management/auth_providers
7. auth_management/profiles --> DISPARA: initialize_user_stats()
8. social_features/schools
9. social_features/classrooms
10. social_features/classroom_members
11. educational_content/exercises (M1-M5)
12. gamification_system (achievements, rankings, shop)
13. progress_tracking
14. lti_integration
```

---

## UUIDs HARDCODEADOS CRITICOS

| UUID | Proposito | Referencias |
|------|-----------|-------------|
| `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` | Tenant principal | 196+ |
| `aaaaaaaa-*` | Admin testing | 20+ |
| `bbbbbbbb-*` | Teacher testing | 15+ |
| `cccccccc-*` | Student testing | 25+ |
| `99999999-9999-9999-9999-999999999999` | Escuela default | 10+ |

**RIESGO:** Si falta cualquier UUID principal -> FKs fallan en cascada.

---

## METRICAS DETALLADAS POR SCHEMA

| Schema | Tablas | Funciones | Triggers | Indices | RLS | Estado |
|--------|--------|-----------|----------|---------|-----|--------|
| gamilit | 0 | 35 | 0 | 0 | 0 | OK |
| auth | 1 | 0 | 0 | 0 | 0 | OK |
| auth_management | 17 | 6 | 9 | 15 | 5 | REVISAR |
| educational_content | 24 | 28 | 5 | 20 | 8 | REVISAR |
| gamification_system | 20 | 25 | 10 | 12 | 10 | REVISAR |
| progress_tracking | 19 | 12 | 13 | 15 | 5 | REVISAR |
| social_features | 18 | 3 | 6 | 10 | 4 | OK |
| content_management | 10 | 4 | 3 | 5 | 1 | REVISAR |
| audit_logging | 7 | 5 | 1 | 8 | 0 | REVISAR |
| system_configuration | 9 | 2 | 2 | 5 | 0 | REVISAR |
| notifications | 6 | 3 | 0 | 4 | 2 | REVISAR |
| lti_integration | 3 | 0 | 2 | 3 | 0 | OK |
| admin_dashboard | 4 | 1 | 0 | 2 | 0 | REVISAR |
| communication | 2 | 0 | 0 | 0 | 0 | REVISAR |
| storage | 0 | 0 | 0 | 0 | 0 | VACIO |
| public | 0 | 0 | 0 | 0 | 0 | RESERVADO |

**TOTALES:** ~165 tablas, ~155 funciones, ~66 triggers, ~100 indices, ~32 RLS policies

---

## COHERENCIA DDL-TypeORM

| Categoria | Cantidad | Estado |
|-----------|----------|--------|
| Entidades sincronizadas | 87 (93%) | OK |
| Problemas menores | 4 (4%) | VERIFICAR |
| Problemas criticos | 2 (2%) | CORREGIR YA |

### Entidades con Problemas Criticos

1. **Mission** (`gamification_system.missions`)
   - Timestamps: without vs with time zone
   - Progress: double precision vs float

### Entidades a Verificar

1. **Achievement** - verificar ENUM collection/hidden
2. **Exercise** - verificar 28+ tipos de ejercicio
3. **Profile** - verificar campos FK
4. **Notification** - verificar consolidacion v2.0

---

## VALIDACIONES POSITIVAS

- Sin dependencias circulares (arquitectura es DAG valido)
- ENUMs correctamente separados por schema
- Consolidacion de triggers bien implementada
- Migraciones documentadas
- Arquitectura dual de ejercicios intencional

---

## PROXIMOS PASOS RECOMENDADOS

### Inmediato (Esta semana)

1. [ ] Corregir 16 referencias `auth.users`
2. [ ] Consolidar funcion `is_feature_enabled`
3. [ ] Consolidar funcion `validate_rueda_inferencias`
4. [ ] Alinear timestamps en tabla missions (DDL o TypeORM)
5. [ ] Alinear tipo progress en tabla missions

### Corto Plazo (2 semanas)

6. [ ] Actualizar _MAP.md de educational_content
7. [ ] Actualizar _MAP.md de gamification_system
8. [ ] Actualizar _MAP.md de progress_tracking
9. [ ] Completar seeds de staging
10. [ ] Verificar ENUMs collection/hidden en backend
11. [ ] Evaluar seed M4-M5 validation

### Mediano Plazo (1 mes)

12. [ ] Documentar seeds omitidos intencionalmente
13. [ ] Eliminar FASE 4 (storage vacio) o documentar
14. [ ] Expandir validacion post-seeds
15. [ ] Consolidar tablas activity_log

---

## ARCHIVOS CRITICOS A MODIFICAR

```
DDL:
- ddl/schemas/system_configuration/tables/06-feature_flags.sql (remover funcion inline)
- ddl/schemas/educational_content/functions/14-validate_rueda_inferencias*.sql (consolidar)
- ddl/schemas/gamification_system/tables/06-missions.sql (timestamps)

Backend:
- apps/backend/src/modules/gamification/entities/mission.entity.ts (timestamps + progress)
- apps/backend/src/shared/constants/enums.constants.ts (verificar collection/hidden)

Documentacion:
- ddl/schemas/educational_content/_MAP.md
- ddl/schemas/gamification_system/_MAP.md
- ddl/schemas/progress_tracking/_MAP.md
- ddl/schemas/communication/_MAP.md
```

---

**Auditoria completada:** 2026-01-13
**Tiempo de ejecucion:** ~45 minutos
**Agentes utilizados:** 4 (DDL, Seeds, Scripts, Coherencia)
