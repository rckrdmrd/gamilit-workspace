# FASE-3: RESULTADOS DE VALIDACION POR PROCESO DE NEGOCIO

**Tarea:** TASK-2026-02-05-ANALISIS-INTEGRAL-MODELADO-BD
**Fase:** FASE-3 - Validacion End-to-End por Proceso de Negocio
**Fecha:** 2026-02-05
**Estado:** COMPLETADA
**Agentes ejecutados:** 6 (SA-F3-01 a SA-F3-06)

---

## 1. RESUMEN EJECUTIVO

### Alcance
- **9 procesos de negocio** validados end-to-end
- **14+ schemas** trazados a traves de DDL -> Entity -> Controller -> Endpoint
- **170+ tablas DDL** referenciadas en flujos de proceso
- **100+ endpoints** verificados contra sus tablas de soporte
- **6 agentes paralelos** ejecutaron validacion independiente

### Resultado Global

```
SCORE PROMEDIO PONDERADO:     79%
  PROCESOS CORE:              75% (Auth 71%, Educational 93%, Gamification 67%, Social 70%)
  PROCESOS SECUNDARIOS:       87% (Admin 91%, Audit 85%, Notif 72%, Parents 92%, LTI 95%)

BLOCKERS CRITICOS:            14
GAPS ALTOS:                   11
GAPS MODERADOS:               9
GAPS BAJOS:                   8
NUEVOS HALLAZGOS:             12 (H-029 a H-040)
```

### Score de Completitud por Proceso

| # | Proceso | Schema(s) Principal(es) | Score | Agente |
|---|---------|------------------------|-------|--------|
| 1 | Auth E2E | auth, auth_management | 71% | SA-F3-01 |
| 2 | Educational E2E | educational_content, progress_tracking | 93% | SA-F3-02 |
| 3 | Gamification E2E | gamification_system | 67% | SA-F3-03 |
| 4 | Social E2E | social_features, communication | 70% | SA-F3-04 |
| 5 | Admin E2E | admin_dashboard, system_configuration | 91% | SA-F3-05 |
| 6 | Audit E2E | audit_logging | 85% | SA-F3-05 |
| 7 | Notifications E2E | notifications | 72% | SA-F3-06 |
| 8 | Parents Portal E2E | auth_management (parent_*) | 92% | SA-F3-06 |
| 9 | LTI Integration E2E | lti_integration | 95% | SA-F3-06 |

---

## 2. PROCESOS CORE - DETALLE

### 2.1 Auth E2E (71%)

**Flujo:** Registro -> Verificacion email -> Login -> Sesiones -> Roles -> Password Reset -> Suspension -> Multi-tenant

| Sub-flujo | Score | Blocker |
|-----------|-------|---------|
| User Registration | 80% | auth.users 20 cols unmapped |
| Email Verification | 60% | Column name mismatches (token vs token_hash, used_at vs verified_at) |
| Login | 95% | - |
| Session Management | 45% | FK target mismatch (profiles vs users) |
| Role Assignment | 70% | User @ManyToMany JoinTable broken |
| Password Reset | 85% | Duplicate routes Auth/Password controllers |
| User Suspension | 100% | - |
| Multi-Tenant | 35% | FK mismatch + no tenant CRUD controller + no tenant switch |

**Blockers Criticos:**
1. FK targets profiles(id) vs entity apunta a User(auth.users) en sessions y memberships
2. auth_providers entity vs DDL son modelos completamente diferentes
3. email_verification_tokens: 2 column name mismatches
4. User @ManyToMany JoinTable referencia role_id inexistente

**Hallazgos Nuevos:**
- No existe TenantController para CRUD de tenants
- No existe endpoint de tenant switch
- Rutas duplicadas entre AuthController y PasswordController
- Membership entity tiene columna invited_by que no existe en DDL

### 2.2 Educational E2E (93%)

**Flujo:** Modulos -> Ejercicios (23 tipos) -> Auto-grade (M1-M3) -> Manual review (M4-M5) -> Rewards -> Progreso -> Learning Path

| Sub-flujo | Score | Blocker |
|-----------|-------|---------|
| Module List | 100% | - |
| Exercise Selection | 98% | ENUM tiene 31 tipos (doc dice 27) |
| Auto-Graded Exercise (M1-M3) | 100% | - |
| Manual Review (M4-M5) | 100% | Dual-table pattern correcto |
| Reward Chain | 92% | rankUp: null con TODO en auto-grade |
| Teacher Review Workflow | 100% | - |
| Module Progress/Unlock | 85% | Sin tabla module_dependencies formal |
| Learning Path | 70% | Sin junction table learning_path_modules |

**Blockers Criticos:** Ninguno. FASE-2 issues C-EDU-01 y C-EDU-02 RESUELTOS.

**Hallazgos Nuevos:**
- Falta tabla `learning_path_modules` para mapear paths a modulos
- Falta tabla `module_dependencies` (prerrequisitos como uuid[] sin FK)
- rankUp no retornado en respuesta de auto-grade (solo en manual review)
- No hay endpoint de "unlock check" server-side

### 2.3 Gamification E2E (67%)

**Flujo:** XP Gain -> Rank Up (5 rangos Maya) -> ML Coins -> Shop -> Comodines -> Achievements -> Missions -> Boosts -> Leaderboard

| Sub-flujo | Score | Blocker |
|-----------|-------|---------|
| XP Gain | 70% | Rank multiplier NOT applied (H-004) |
| Rank Up | 90% | DB trigger OK, ENUM comments stale |
| ML Coins Gain | 65% | Rank multiplier NOT applied, entity missing tenant_id |
| Shop Purchase | 85% | Achievement validation no enforced |
| Comodin Usage | 55% | 3 name mismatches CRITICAL, missing entity |
| Achievement Unlock | 80% | No notification dispatch |
| Daily/Weekly Mission | 70% | Timestamp WITHOUT TZ vs WITH TZ |
| Activate Boost | 20% | NO service/controller (DDL+entity exist) |
| Leaderboard | 50% | MV exist but no refresh mechanism |

**Blockers Criticos:**
1. 3 name mismatches (comodin_usage_logs, comodin_usage_trackings, leaderboard_metadatas)
2. XP/ML Coins rank multiplier no aplicado (H-004 confirmado)
3. Boost system: DDL+Entity existen pero NO hay service ni controller

**Hallazgos Nuevos:**
- Sistema tiene 5 rangos Maya (no 9 como se creia): Ajaw -> K'uk'ulkan
- ExerciseRewardsService usa hardcoded BASE_REWARDS, ignora maya_ranks.xp_multiplier
- active_boosts es "dead data" - tabla poblable pero sin logica de activacion/expiracion
- Materialized views de leaderboard sin mecanismo de refresh

### 2.4 Social E2E (70%)

**Flujo:** Amistades -> Equipos -> Aulas -> Challenges -> Guilds -> Foros -> Interacciones -> Assignments

| Sub-flujo | Score | Blocker |
|-----------|-------|---------|
| Friend Request | 92% | friendships.status default mismatch |
| Team Creation | 97% | - |
| Classroom Management | 97% | - |
| Challenge (P2P) | 97% | - |
| Guild System | 81% | guild_emblems y guild_mission_contributions sin entity |
| Discussion Forum | 45% | NO CONTROLLER (feature non-functional) |
| Social Interactions | 57% | NO CONTROLLER dedicado |
| Assignment Distribution | 95% | - |

**Blockers Criticos:**
1. user_blocks: NO ENTITY (safety feature para EdTech con menores)
2. user_reports: NO ENTITY (19 cols, workflow de moderacion)
3. Discussion Forum: NO CONTROLLER (feature completamente non-functional)
4. 6 tablas DDL con FK stale a auth.users en vez de auth_management.profiles

**Hallazgos Nuevos:**
- Plataforma EdTech para menores SIN mecanismo de bloqueo funcional (LEGAL/COPPA risk)
- user_reports tiene 19 columnas bien modeladas en DDL pero sin backend
- discussion_threads entity existe pero sin controller = foro muerto
- social_interactions entity orphaned (sin controller)
- team_vs_team_challenges: 30+ columnas en DDL, zero backend support
- 6 FKs stale a auth.users: discussion_threads, social_interactions(x2), user_activities, user_follows(x2)

---

## 3. PROCESOS SECUNDARIOS - DETALLE

### 3.1 Admin E2E (91%)

**Flujo:** CRUD Users -> Manage Orgs -> System Config -> Analytics -> Reports -> Moderation -> Audit Trail

| Sub-flujo | Score | Blocker |
|-----------|-------|---------|
| CRUD Users | 100% | - |
| Manage Orgs/Classrooms | 100% | - |
| System Configuration | 100% | Feature flags 98% coverage |
| Analytics Dashboard | 85% | No endpoint para MV refresh manual |
| Report Generation | 100% | - |
| Content Moderation | 80% | Sin notification pipeline post-moderation |
| Audit Trail | 90% | - |

**Hallazgos Nuevos:**
- Feature flags system es excelente (98% completitud, lifecycle completo)
- Falta endpoint para refresh manual de materialized views
- AdminReport FK apunta a User en vez de Profile

### 3.2 Audit E2E (85%)

**Flujo:** Action Logging -> System Logging -> Activity Tracking -> Performance Monitoring -> Alerts

| Sub-flujo | Score | Blocker |
|-----------|-------|---------|
| Action Logging | 85% | 4 type mismatches (text vs uuid/inet) |
| System Logging | 75% | DB functions broken |
| Activity Tracking | 95% | - |
| Performance Monitoring | 90% | - |
| Alert System | 95% | Full lifecycle management |

**Blockers Criticos:**
1. `log_audit_event()` y `log_system_event()` insertan columnas inexistentes en system_logs
2. audit_logs: 4 type mismatches (resource_id, actor_id, target_id como text vs uuid; actor_ip como text vs inet)

**Hallazgos Nuevos:**
- 2 funciones SQL (log_audit_event, log_system_event) referecian columnas que NO existen en system_logs DDL
- audit_logs vs system_logs overlap confirmado al 70% pero con propositos distintos
- pending_user_initializations sin endpoint REST

### 3.3 Notifications E2E (72%)

**Flujo:** Generar -> Queue -> Preferencias -> Dispositivos -> Enviar -> Log

| Sub-flujo | Score | Blocker |
|-----------|-------|---------|
| Generate Notification | 100% | - |
| Queue Processing | 85% | scheduled_for nullable mismatch |
| User Preferences | 100% | - |
| Device Registration | 80% | browser/os vs deviceName drift |
| Send Notification | 90% | - |
| Notification Log | 70% | Entity tiene external_id no en DDL |
| Rate Limiting | 50% | NO ENTITY (rate_limit_logs) |

**Blockers:**
1. rate_limit_logs sin entity (audit trail de rate limiting perdido)
2. notification_logs entity tiene external_id que no existe en DDL
3. notification_templates: double unique constraint rompe versionado
4. notification_queue scheduled_for nullable mismatch (entity nullable, DDL NOT NULL)

### 3.4 Parents Portal E2E (92%)

**Flujo:** Registro Padre -> Vinculacion Estudiante -> Dashboard Progreso -> Notificaciones

Todos los sub-flujos al 90-100%. Excelente alineacion DDL-Entity (95%).
Sin blockers criticos. Sistema de notificaciones de padres es separado del general.

### 3.5 LTI Integration E2E (95%)

**Flujo:** Consumer Registration -> OIDC Launch -> Grade Passback

Todos los sub-flujos al 95-100%. Alineacion DDL-Entity al 98%.
Sin blockers criticos. LTI 1.3 completo con OIDC + AGS.

---

## 4. HALLAZGOS NUEVOS FASE-3 (H-029 a H-040)

### H-029: Boost System Dead Code (CRITICO)
- **Severidad:** CRITICA
- **Descripcion:** active_boosts DDL y entity existen pero NO hay BoostService ni BoostController. ExerciseRewardsService no consulta active_boosts al calcular recompensas. Feature completamente no funcional.
- **Impacto:** Usuarios pueden comprar boosts en tienda pero no pueden activarlos ni beneficiarse de ellos.
- **Accion:** Crear BoostService con activate/check/expire + integrar en reward pipeline.

### H-030: Discussion Forum Non-Functional (CRITICO)
- **Severidad:** CRITICA
- **Descripcion:** discussion_threads tiene DDL y entity pero NO tiene controller ni endpoints. No existe tabla de replies. FK stale a auth.users.
- **Impacto:** Feature de foro completamente muerta desde API.
- **Accion:** Crear controller + tabla discussion_replies + fix FK.

### H-031: Safety Features Missing for EdTech (CRITICO)
- **Severidad:** CRITICA
- **Descripcion:** user_blocks (5 cols) y user_reports (19 cols) tienen DDL bien modelado pero NO tienen entities TypeORM. Plataforma EdTech para menores sin mecanismo de bloqueo ni reporte funcional.
- **Impacto:** Riesgo legal COPPA/child safety. Workaround actual (friendships.status='blocked') no usa tabla dedicada.
- **Accion:** Crear entities + services + controllers inmediatamente.

### H-032: 6 Stale FKs to auth.users (ALTO)
- **Severidad:** ALTA
- **Descripcion:** 6 columnas FK en social_features referencian auth.users(id) en vez de auth_management.profiles(id): discussion_threads.created_by, social_interactions.user_id, social_interactions.target_user_id, user_activities.user_id, user_follows.follower_id, user_follows.following_id.
- **Impacto:** DDL recreation puede fallar si auth.users no tiene los datos esperados.
- **Accion:** Actualizar DDL files para referenciar auth_management.profiles(id).

### H-033: 2 DB Functions Reference Non-Existent Columns (ALTO)
- **Severidad:** ALTA
- **Descripcion:** log_audit_event() y log_system_event() insertan en system_logs con columnas (action, table_name, record_id, old_data, new_data, event_type, event_source) que NO existen en el DDL actual de system_logs.
- **Impacto:** Funciones fallaran en runtime. Cualquier trigger que las invoque causara error.
- **Accion:** Reescribir funciones con columnas reales de system_logs o eliminar.

### H-034: No Tenant Management API (ALTO)
- **Severidad:** ALTA
- **Descripcion:** No existe TenantController dedicado para CRUD de tenants ni endpoint de tenant switch. Multi-tenancy no es administrable via API.
- **Impacto:** Tenants solo pueden crearse via seed/DDL directo.
- **Accion:** Crear TenantController + tenant switch endpoint.

### H-035: Duplicate Routes Auth vs Password (MEDIO)
- **Severidad:** MEDIA
- **Descripcion:** AuthController y PasswordController definen endpoints duplicados para verify-email y reset-password. Colision de rutas.
- **Impacto:** Solo una ruta sera activa; la otra sera ignorada silenciosamente.
- **Accion:** Consolidar en PasswordController, eliminar duplicados de AuthController.

### H-036: Missing Junction Tables for Learning Paths (MEDIO)
- **Severidad:** MEDIA
- **Descripcion:** No existe tabla learning_path_modules para mapear formalmente que modulos pertenecen a cada path. Tampoco module_dependencies para prerrequisitos con FK.
- **Impacto:** Learning paths no pueden definir secuencia de modulos. Prerequisites como uuid[] sin integridad referencial.
- **Accion:** Crear tablas junction con FKs apropiados.

### H-037: Materialized Views Sin Refresh (MEDIO)
- **Severidad:** MEDIA
- **Descripcion:** 4 MVs de leaderboard en gamification + 3 MVs en admin_dashboard existen en DDL pero el backend no tiene mecanismo de refresh (ni cron ni endpoint).
- **Impacto:** Datos de dashboards y leaderboards quedan stale indefinidamente.
- **Accion:** Implementar cron job o endpoint admin para REFRESH MATERIALIZED VIEW.

### H-038: Notification Templates Double Unique (MEDIO)
- **Severidad:** MEDIA
- **Descripcion:** Entity notification_templates tiene unique:true en template_key (column-level) Y unique index composite (template_key, version). El column-level unique impide versionado.
- **Impacto:** No se pueden crear multiples versiones del mismo template.
- **Accion:** Remover unique:true del column decorator, mantener solo composite index.

### H-039: team_vs_team_challenges Zero Backend (MEDIO)
- **Severidad:** MEDIA
- **Descripcion:** DDL tiene 30+ columnas para team_vs_team_challenges con lifecycle management completo, pero no hay entity, service ni controller.
- **Impacto:** Feature de desafios equipo vs equipo completamente no funcional.
- **Accion:** Crear entity + service + controller.

### H-040: Parent Notifications Parallel System (BAJO)
- **Severidad:** BAJA
- **Descripcion:** auth_management.parent_notifications es un sistema completamente separado de notifications.notifications. No comparten queue, delivery tracking ni analytics.
- **Impacto:** Duplicacion de logica de envio. Sin rate limiting para notificaciones de padres.
- **Accion:** Evaluar integracion con sistema general de notificaciones (ADR).

---

## 5. MAPA DE DEPENDENCIAS CROSS-SCHEMA

```
                         auth_management.profiles
                         (HUB CENTRAL - TODAS las FKs)
                                    |
          +----------+---------+----+----+---------+----------+
          |          |         |         |         |          |
    educational   progress  gamification  social  notifications  audit
    _content      _tracking  _system     _features              _logging
          |          |         |         |         |          |
          +--modules |   user_stats     |  classrooms  notification  audit_logs
          |  exercises|   maya_ranks    |  teams       _queue      system_logs
          +----+-----+   ml_coins_tx   |  guilds      user_devices activity_logs
               |          achievements  |  challenges              system_alerts
               v          missions      |  friendships
          exercise_      shop_items     |  user_blocks*
          attempts       comodines_inv  |  user_reports*
          exercise_                     |
          submissions                   +--- communication
          manual_reviews                     messages
          learning_paths                     conversations*

    admin_dashboard          system_configuration       lti_integration
    metrics_history          feature_flags              lti_consumers
    admin_reports            system_settings            lti_sessions
    bulk_operations          environment_configs        lti_grade_passbacks

    * = sin entity (gap critico)
```

---

## 6. ANALISIS COMPARATIVO FASE-2 vs FASE-3

| Hallazgo FASE-2 | Confirmacion FASE-3 | Impacto Proceso |
|-----------------|---------------------|-----------------|
| auth_providers modelo diferente (C-AUTH-01) | CONFIRMADO - OAuth login sin DDL backing | Auth 71% |
| User ManyToMany broken (C-AUTH-02) | CONFIRMADO - role_id no existe | Auth 71% |
| FK profiles vs users (C-AUTH-03/04) | CONFIRMADO - sessions y memberships fallan | Auth 71% |
| email_verification mismatches (C-AUTH-05) | CONFIRMADO - 2 column names incorrectos | Auth 71% |
| assignment_students 17% match (C-EDU-01) | RESUELTO - ALTER script agrega 20 cols | Educational 93% |
| ContentStatusEnum falta backlog (C-EDU-02) | RESUELTO - ENUM v1.2 incluye backlog | Educational 93% |
| comodin_uses sin entity (C-GAM-01) | CONFIRMADO - comodin audit trail roto | Gamification 67% |
| 3 name mismatches gamification | CONFIRMADO - runtime errors | Gamification 67% |
| ML Coins multiplier no implementado (H-004) | CONFIRMADO - hardcoded en ExerciseRewardsService | Gamification 67% |
| notifications 58% match | CONFIRMADO - 5 drift issues especificos | Notifications 72% |
| audit_logs type mismatches | CONFIRMADO - 4 text vs uuid/inet | Audit 85% |
| audit_logs missing FKs | CONFIRMADO - actor_id, tenant_id sin @ManyToOne | Audit 85% |
| user_blocks sin entity | CONFIRMADO - COPPA/safety risk | Social 70% |
| user_reports sin entity | CONFIRMADO - moderation workflow blocked | Social 70% |

**Nuevos descubrimientos FASE-3 (no detectados en FASE-2):**
- Boost system completamente dead code (H-029)
- Discussion forum non-functional (H-030)
- 6 stale FKs a auth.users (H-032)
- 2 DB functions broken (H-033)
- No tenant management API (H-034)
- Missing junction tables learning paths (H-036)
- MV sin refresh mechanism (H-037)

---

## 7. CLASIFICACION DE GAPS POR TIPO

### Tipo A: Dead Features (DDL+Entity exist, no service/controller)
- active_boosts (gamification) - H-029
- discussion_threads (social) - H-030
- social_interactions (social)
- team_vs_team_challenges (social) - H-039

### Tipo B: Missing Entities (DDL exists, no entity)
- user_blocks (social) - H-031
- user_reports (social) - H-031
- guild_emblems (social)
- guild_mission_contributions (social)
- comodin_uses (gamification) - C-GAM-01
- rate_limit_logs (notifications)

### Tipo C: FK/Model Mismatches (entity apunta a tabla incorrecta)
- sessions/memberships FK to profiles vs users - C-AUTH-03/04
- auth_providers modelo completamente diferente - C-AUTH-01
- User ManyToMany JoinTable broken - C-AUTH-02
- 6 stale FKs to auth.users - H-032
- AdminReport FK to User vs Profile

### Tipo D: Missing API Endpoints
- Tenant CRUD controller - H-034
- Tenant switch endpoint - H-034
- MV refresh endpoint - H-037
- pending_user_initializations endpoint

### Tipo E: Broken DB Functions
- log_audit_event() columns inexistentes - H-033
- log_system_event() columns inexistentes - H-033

---

## 8. PLAN DE REMEDIACION ACTUALIZADO (FASE-2 + FASE-3)

### BATCH-1: Name Mismatches (30 min)
- 21 constantes singular->plural en database.constants.ts
- Eliminar constante obsoleta DB_TABLES.GAMIFICATION.NOTIFICATIONS

### BATCH-2: Crear Entities Faltantes (3-4h)
- user_blocks entity + service + controller (safety-critical)
- user_reports entity + service + controller (moderation)
- comodin_uses entity
- rate_limit_logs entity
- guild_emblems entity (read-only)
- guild_mission_contributions entity

### BATCH-3: Fix Auth Structural (2-4h)
- Crear DDL user_auth_providers O reescribir entity
- Remover @ManyToMany broken de User entity
- Fix email_verification_tokens column names
- Fix FK targets sessions/memberships (profiles vs users)

### BATCH-4: Fix Column Mismatches (1-2h)
- assignment_students: add 20 missing columns from ALTER
- scheduled_reports: fix 4 column name mappings
- MLCoinsTransaction: add tenant_id
- Membership: remove invited_by, add 5 missing DDL cols

### BATCH-5: Fix Notifications Drift (2-3h)
- notification_logs: sync external_id, status values
- notification_queue: fix scheduled_for nullable
- notification_templates: remove double unique
- user_devices: reconcile browser/os vs deviceName

### BATCH-6: Enum + Constraint + Type Alignment (1-2h)
- ContentStatusEnum: add 'backlog'
- audit_logs: 4 type mismatches text->uuid/inet
- audit_logs: add @Check constraints
- missions: timestamp TZ alignment

### BATCH-7: Dead Features Activation (4-6h) [NUEVO]
- BoostService + BoostController + integration en reward pipeline
- DiscussionThread controller + discussion_replies DDL
- social_interactions controller
- team_vs_team_challenges entity + controller

### BATCH-8: Missing APIs + DB Functions (2-3h) [NUEVO]
- TenantController CRUD + tenant switch
- Fix log_audit_event() y log_system_event()
- Fix 6 stale FKs a auth.users
- MV refresh mechanism (cron o endpoint)
- Rank XP multiplier integration en ExerciseRewardsService

### BATCH-9: Junction Tables + Architecture (2-3h) [NUEVO]
- Crear learning_path_modules junction table
- Crear module_dependencies table (reemplazar uuid[])
- Consolidar rutas duplicadas Auth/Password controllers
- ADR: parent_notifications vs notifications integration

---

## 9. METRICAS CONSOLIDADAS

```
PROCESOS VALIDADOS:          9
SCORE PROMEDIO:              79% (ponderado)

POR CATEGORIA:
  Core (4 procesos):         75.3%
  Secundarios (5 procesos):  87.0%

GAPS TOTALES:                42
  CRITICOS:                  14
  ALTOS:                     11
  MEDIOS:                    9
  BAJOS:                     8

HALLAZGOS NUEVOS:            12 (H-029 a H-040)
  Criticos:                  3 (H-029, H-030, H-031)
  Altos:                     3 (H-032, H-033, H-034)
  Medios:                    5 (H-035, H-036, H-037, H-038, H-039)
  Bajos:                     1 (H-040)

DEAD FEATURES:               4 (boosts, forum, social_interactions, team_vs_team)
MISSING ENTITIES:            6 operacionales
FK/MODEL MISMATCHES:         8 criticos
MISSING ENDPOINTS:           4
BROKEN DB FUNCTIONS:         2

ESFUERZO REMEDIACION (9 BATCHES):
  BATCH 1-6 (de FASE-2):    ~10-16h
  BATCH 7-9 (de FASE-3):    ~8-12h
  TOTAL ESTIMADO:            ~18-28h (parallelizable ~12-16h)
```

---

## 10. PROCESOS MAS SANOS vs MAS AFECTADOS

### Top 3 Sanos
1. **LTI Integration (95%)** - DDL-Entity 98%, full OIDC+AGS flow
2. **Educational (93%)** - Core learning flow impecable, dual-table pattern correcto
3. **Parents Portal (92%)** - DDL-Entity 95%, 3 tablas bien alineadas

### Top 3 Afectados
1. **Gamification (67%)** - Boost dead, rank multiplier no aplicado, name mismatches
2. **Social (70%)** - Safety features missing, forum dead, 6 stale FKs
3. **Auth (71%)** - FK mismatches criticos, auth_providers incompatible

---

*FASE-3 Resultados v1.0.0 - 2026-02-05*
