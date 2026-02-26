# Seed Loading Order

**Version:** 1.0.0
**Date:** 2026-02-26
**Task:** TASK-2026-02-26-AUDITORIA-BD

---

## Loaders

| Ambiente | Script | Fases |
|----------|--------|-------|
| Dev | `load-dev-seeds.sh` | 18 fases |
| Staging | `load-staging-seeds.sh` | 15 fases |
| Prod | `load-prod-seeds.sh` | 15 fases |
| All (via init-database.sh) | `init-database.sh --env <env>` | Integrado con DDL |

---

## Orden por Fase (Produccion)

Las dependencias FK dictan el orden. Cada fase depende de que las anteriores se hayan completado.

```
FASE 1:  system_configuration          (sin deps)
FASE 2:  audit_logging                 (sin deps)
FASE 3:  auth_management (tenants)     (sin deps)
FASE 4:  auth (users)                  (sin deps)
FASE 5:  notifications (templates)     (sin deps)
FASE 6:  educational_content (modules) (sin deps directas)
   |
FASE 7:  auth_management (profiles)    (deps: auth.users, tenants)
   |        -> triggers fire: initialize_user_stats, assign_default_classroom
FASE 8:  notifications (preferences)   (deps: profiles)
FASE 9:  content_management            (deps: profiles para created_by)
FASE 10: social_features               (deps: profiles, classrooms FK chain)
FASE 10.5: auth_management (schools)   (deps: social_features.schools)
   |
FASE 11: educational_content (exercises) (deps: modules)
FASE 12: progress_tracking             (deps: profiles, modules)
FASE 13: lti_integration               (sin FK deps fuertes)
FASE 14: gamification_system           (deps: profiles, modules, achievements)
FASE 15: admin_dashboard               (deps: profiles)
```

---

## Dependencias FK Criticas

| Tabla Destino | Tabla Origen (FK) | Nota |
|---------------|-------------------|------|
| auth_management.profiles | auth.users (user_id) | CASCADE delete |
| auth_management.profiles | auth_management.tenants (tenant_id) | CASCADE delete |
| auth_management.profiles | social_features.schools (school_id) | SET NULL, added post-DDL |
| social_features.classrooms | social_features.schools | FK a school |
| social_features.classroom_members | auth_management.profiles + classrooms | Composite FK |
| gamification_system.user_stats | auth_management.profiles (user_id) | Trigger-created |
| gamification_system.user_achievements | profiles + achievements | Composite unique |
| progress_tracking.module_progress | profiles + modules | Composite unique |
| gamification_system.missions | profiles + mission_templates | Template lookup |

---

## Trigger vs Seed Overlap Matrix

El trigger `initialize_user_stats` se dispara en `AFTER INSERT ON auth_management.profiles` y crea datos en multiples tablas. Los seeds deben usar `ON CONFLICT DO NOTHING` o `DO UPDATE` para manejar datos pre-creados por el trigger.

| Tabla | Trigger crea | Seed maneja | Resolucion |
|-------|-------------|-------------|------------|
| gamification_system.user_stats | ml_coins=100 | ON CONFLICT (user_id) DO NOTHING | SAFE |
| gamification_system.ml_coins_transactions | 1 welcome bonus | ON CONFLICT (id) — no previene dup | KNOWN ISSUE |
| gamification_system.comodines_inventory | row vacia | ON CONFLICT (user_id) DO UPDATE | SAFE |
| auth_management.user_preferences | defaults | ON CONFLICT (user_id) DO NOTHING/UPDATE | SAFE |
| gamification_system.user_ranks | rank=Ajaw | WHERE NOT EXISTS | SAFE |
| gamification_system.user_achievements | progress=0 | ON CONFLICT (user_id, achievement_id) | SAFE |
| progress_tracking.module_progress | not_started | ON CONFLICT (user_id, module_id) | SAFE |
| gamification_system.missions | 8 missions | ON CONFLICT DO NOTHING | SAFE |

---

## Diferencias Intencionales entre Ambientes

### Dev-only seeds (no en staging/prod)
- `auth/01b-demo-students.sql` — 4 demo students (@demo.glit.edu.mx)
- `auth_management/03-profiles.sql` — SELECT-based batch profile creator (legacy)
- `auth_management/04-user_roles.sql` — Demo user roles
- `auth_management/05-user_preferences.sql` — Demo user preferences
- `auth_management/06-auth_attempts.sql` — Sample audit data
- `auth_management/07-security_events.sql` — Sample security events
- `content_management/01-marie-curie-bio.sql` — Extended biography
- `content_management/02-media-files.sql` — Mock media registry
- `notifications/02-user_devices_dev.sql` — Dev push devices
- `progress_tracking/01-demo-progress.sql` through `16-*.sql` — Extended demo data
- `lti_integration/02-lti_sessions.sql`, `03-lti_grade_passback.sql` — Demo sessions
- `gamification_system/18-user_purchases-demo.sql`, `19-user_equipped_items-demo.sql`
- `_testing/*.sql` — Exercise validation tests
- `communication/01-conversations.sql` — Full conversation threads

### Prod-only seeds (not in dev/staging or different content)
- `gamification_system/15-comodin_usage_tracking.sql` — Empty in prod (runtime data)
- `social_features/10-team_challenges.sql` — Shell only in prod (runtime data)

### Core seeds (identical across all 3 envs)
All seeds not listed above are intended to be identical. Key core seeds:
- `auth/01-demo-users.sql` (admin, teacher, student base accounts)
- `auth/02-production-users.sql` (50 enrolled students)
- `auth_management/01-tenants.sql` (GAMILIT Platform tenant)
- `educational_content/01-modules.sql` (5 modules)
- `educational_content/02-06-exercises-*.sql` (all exercises M1-M5)
- `gamification_system/04-achievements.sql` (achievements — now gen_random_uuid())
- `gamification_system/10-mission_templates.sql` (8 mission templates)
- All system_configuration seeds

---

## Non-v4 UUID Namespaces (Deliberate)

These are intentional sequential seed IDs, not placeholders:

| Prefix | Domain | Count | Referenced as FK |
|--------|--------|-------|-----------------|
| `80000001-xxxx` | Assessment Rubrics | 15 | Yes (exercise_type_rubrics) |
| `80000006-xxxx` | Shop Items Expanded | 18 | No |
| `d0000001-xxxx` | ML Coins Transactions | 36 | No |
| `c0000001-xxxx` | Communication Messages | 1-25 | Yes (message_participants) |
| `20000001-xxxx` | Mission Templates | 13 | Yes (trigger lookup) |
| `a5500001-xxxx` | Assignments | 9 | Yes (assignment_students) |
| `30000001-xxxx` | Module Dependencies | 6 | No |
| `50000001-xxxx` | Content Articles | 6 | No |
| `40000001-xxxx` | Taxonomies | 4 | No |
| `a1b2c3d4-xxxx` | Content Templates | 3 | No |
| `10000004-xxxx` | User Roles | 5 | No |
| `a0eebc99-xxxx` | Tenant (GAMILIT Platform) | 1 | Yes (VALID v4) |
| `00000000-xxxx` | Sentinel/System | 4 | Legacy cleanup |

**Remediated:** `90000001-xxxx` Achievement UUIDs replaced with `gen_random_uuid()` + lookup by `(name, tenant_id)` (2026-02-26).
