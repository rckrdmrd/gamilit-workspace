# Hallazgos — Auditoria Integral de Base de Datos

**Fecha:** 2026-02-26
**Alcance:** Modelado, Seeds, UUIDs, Triggers — 18 schemas, 173 tablas, 3 ambientes

---

## FASE 0: Inventario y Census

### 0A — Census UUID

**Total non-v4 UUIDs encontrados:** ~230+ instancias en 18+ archivos por ambiente

| Patron | Namespace | Archivos | Count/env | Riesgo |
|--------|-----------|----------|-----------|--------|
| `90000001-xxxx` | Achievement PKs | 3 archivos | 40 | CRITICO — remediado en Fase 2 |
| `80000001-xxxx` | Rubric/Shop PKs | 3 archivos | 38 | MEDIO — estables, FKs cruzados |
| `d0000001-xxxx` | Transaction PKs | 1 archivo | 36 | BAJO — PKs no referenciados |
| `c0000001-xxxx` | Message PKs | 2 archivos | 1-25 | BAJO — PKs no referenciados |
| `20000001-xxxx` | Mission Template PKs | 1 archivo | 13 | ALTO — referenciados por trigger |
| `a5500001-xxxx` | Assignment PKs | 1 archivo | 9 | BAJO |
| `30000001-xxxx` | Module Dep PKs | 1 archivo | 6 | BAJO |
| `50000001-xxxx` | Content PKs | 1 archivo | 6 | BAJO |
| `40000001-xxxx` | Taxonomy PKs | 1 archivo | 4 | BAJO |
| `a1b2c3d4-xxxx` | Template PKs | 1 archivo | 3 | BAJO |
| `10000004-xxxx` | User Role PKs | 1 archivo | 5 | BAJO |
| `a0000001-xxxx` | Auth Attempt PKs | 1 archivo | 6 | BAJO (dev only) |
| `00000000-xxxx` | Sentinel/Nil | 2 archivos | 4 | SAFE — intencionado |

**Hallazgo clave:** No son "placeholders legacy" sino un sistema deliberado de namespacing por subsistema. Cada prefijo identifica el dominio. La prioridad de remediacion se basa en si los UUIDs son referenciados como FKs en otros archivos.

**Patron `aaaaaaaa`/`bbbbbbbb`:** 0 ocurrencias en seeds (solo en @ApiProperty DTOs del backend).

**gen_random_uuid() usage:** dev=369, staging=189, prod=182 llamadas.

**Tenant canonico `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`:** VALID_V4 (confirmado). 432 usos en 45 archivos.

### 0B — Reconciliacion Seed Loaders

#### Conteos por ambiente

| Ambiente | Archivos en disco | Referenciados en loader | Huerfanos puros | Loader faltante |
|----------|-------------------|------------------------|-----------------|-----------------|
| dev | 113 | 77 (dev-loader) / 87 (init-db) | 7 | N/A |
| staging | 71 | 45 (staging-loader) | 1 | 2 MISSING_FILE |
| prod | 74 | 0 (no loader) / ~58 (init-db) | 6 | **load-prod-seeds.sh NO EXISTE** |

#### Issues P0 (Criticos)

1. **`prod/_testing/` contiene 4 archivos de testing** — Riesgo de seguridad/datos
   - `01-test-exercises-validation.sql`
   - `02-test-nuevos-validadores-DB-117.sql`
   - `10-test-nuevos-validadores-FE-059.sql`
   - `CREAR-USUARIOS-TESTING.sql`

2. **`load-prod-seeds.sh` NO EXISTE** — Prod no tiene loader standalone

#### Issues P1 (Altos)

3. **Staging loader referencia archivos que no existen:**
   - `staging/auth_management/03-profiles.sql` — MISSING_FILE
   - `staging/auth_management/04-user_roles.sql` — MISSING_FILE

4. **Staging loader tiene errores de numeracion en gamification:**
   - Referencia `03-leaderboard_metadata.sql` → archivo real es `02-leaderboard_metadata.sql`
   - Referencia `04-maya_ranks.sql` → archivo real es `03-maya_ranks.sql`
   - Referencia `02-achievements.sql` → archivo real es `04-achievements.sql`

#### Issues P2 (Medios)

5. **Scope conflict:** `content_management/02-marie_curie_content.sql` — init-db dice `prod|core` pero dev-loader lo ejecuta
6. **Dev huerfanos puros (no referenciados por nadie):** 7 archivos (notification_templates_i18n, notifications, notification_logs, notification_queue, pending_user_initialization, classroom_modules dup, CREAR-USUARIOS-TESTING)
7. **Prod huerfanos:** `social_features/08-peer_challenges.sql`, `social_features/10-team_challenges.sql` — no en init-db
8. **Dev-loader vs init-db divergencia gamification:** loader para en `09-comodines_inventory`, init-db incluye 6 archivos mas (15-20)

---

## FASE 1: Core Identity Layer

### 1A — DDL + Triggers

#### Profiles (auth_management.profiles)
- 23 columnas, 11 indices, 4 RLS policies
- PK: `id` (uuid, gen_random_uuid())
- FKs: `tenant_id` → tenants (CASCADE), `user_id` → auth.users (CASCADE), `school_id` → schools (SET NULL)
- 77 FKs de otras tablas apuntan a profiles (documentado en comment de deleted_at)

#### Users (auth.users)
- 35 columnas (patron Supabase extendido)
- UNIQUE on email, NO format CHECK (a diferencia de profiles que si tiene regex)
- `gamilit_role` column usa cross-schema ENUM `auth_management.gamilit_role`

#### Trigger Chain — INSERT on profiles

```
BEFORE INSERT (orden alfabetico):
  1. trg_ensure_profile_name       → Computa full_name, defaults first/last name
  2. trg_set_default_tenant        → Fuerza tenant_id al principal GAMILIT

  [row committed]

AFTER INSERT (orden alfabetico):
  3. trg_assign_default_classroom  → Inserta en classroom_members (solo students)
  4. trg_initialize_user_stats     → Inicializa 16 rows en 10+ tablas (SECURITY DEFINER)
```

#### FK fk_profiles_school_id
- **NO es DEFERRABLE** — el archivo dice "diferido" pero se refiere al orden de ejecucion DDL (Phase 9), no a PostgreSQL DEFERRABLE
- Es `ON DELETE SET NULL` — seguro
- Se agrega via ALTER TABLE despues de crear schools

#### initialize_user_stats — Tablas afectadas

| # | Tabla | Datos creados | Guard |
|---|-------|---------------|-------|
| 1 | gamification_system.user_stats | ml_coins=100, earned_total=100 | ON CONFLICT (user_id) DO NOTHING |
| 2 | gamification_system.ml_coins_transactions | welcome bonus 100 coins | ON CONFLICT DO NOTHING |
| 3 | gamification_system.comodines_inventory | row vacia | ON CONFLICT (user_id) DO NOTHING |
| 4 | auth_management.user_preferences | theme=light, lang=es | ON CONFLICT (user_id) DO NOTHING |
| 5 | gamification_system.user_ranks | rank=Ajaw | WHERE NOT EXISTS |
| 6 | gamification_system.user_achievements | 1 row por achievement activo | ON CONFLICT (user_id, achievement_id) DO NOTHING |
| 7 | progress_tracking.module_progress | 1 row por modulo publicado | ON CONFLICT (user_id, module_id) DO NOTHING |
| 8-15 | gamification_system.missions | 3 diarias + 5 semanales via initialize_user_missions | ON CONFLICT DO NOTHING |
| 16 | social_features.teacher_reports | Solo admin_teacher role | ON CONFLICT DO NOTHING |

#### Bug menor identificado
- Linea 254: WARNING usa `NEW.user_id` (nullable) en vez de `NEW.id` — inconsistencia de logging

#### initialize_user_missions
- Archivo: `18-initialize_user_missions.sql`
- Busca 8 templates por `(type, target_type)` — NO usa IDs hardcoded
- Si falta cualquier template → WARNING y return sin insertar (graceful degradation)
- 3 daily (completar ejercicios, ganar XP, usar comodin) + 5 weekly

### 1B — Seeds Parity auth/auth_management

| Archivo | dev | staging | prod | Diferencia |
|---------|-----|---------|------|------------|
| auth/01-demo-users.sql | SI | SI | SI | Identico |
| auth/01b-demo-students.sql | SI | NO | NO | Dev-only (4 demo students) |
| auth/02-production-users.sql | SI | SI | SI | Identico (50 real users) |
| auth_mgmt/01-tenants.sql | SI | SI | SI | Identico |
| auth_mgmt/02-auth_providers.sql | SI | SI | SI | Identico (metadata dice "development" en los 3) |
| auth_mgmt/02-tenants-production.sql | SI | NO | SI | **Staging FALTANTE** |
| auth_mgmt/03-profiles.sql | SI | SI | NO | Prod usa seeds explicitos en su lugar |
| auth_mgmt/04-user_roles.sql | SI | SI | NO | Dev=demo users, staging=@gamilit.com only |
| auth_mgmt/04-profiles-complete.sql | SI | SI | SI | Identico |
| auth_mgmt/05-user_preferences.sql | SI | NO | NO | Dev-only (demo users) |
| auth_mgmt/06-auth_attempts.sql | SI | NO | NO | Dev-only |
| auth_mgmt/06-profiles-production.sql | SI | SI | SI | Identico (Lote 1, 13 users) |
| auth_mgmt/07-security_events.sql | SI | NO | NO | Dev-only |
| auth_mgmt/07-user_roles.sql | SI | SI | SI | Identico |
| auth_mgmt/07-profiles-production-add.sql | SI | SI | SI | Identico (Lotes 2-5, 37 users) |
| auth_mgmt/08-assign-admin-schools.sql | SI | SI | SI | Identico |

**Issues identificados:**
1. `02-tenants-production.sql` falta en staging → posibles tenants personales huerfanos
2. `02-auth_providers.sql` metadata dice "development" en prod → error documental
3. `03-profiles.sql` en staging overlap con `04-profiles-complete.sql` → inocuo por ON CONFLICT
4. `04-user_roles.sql` en staging redundante con `07-user_roles.sql` → wasted work
5. `05-user_preferences.sql` no tiene guard para profiles inexistentes → falla si se ejecuta antes

### 1C — Trigger Chain E2E + Overlap Matrix

#### Overlap Matrix (Trigger vs Seed)

| Tabla | Trigger crea | Seed crea | ON CONFLICT funciona | Riesgo |
|-------|-------------|-----------|---------------------|--------|
| user_stats | Si (ml_coins=100) | Si (safety net) | DO NOTHING — safe | SAFE |
| ml_coins_transactions | Si (1 welcome row) | Si (otro welcome row) | ON CONFLICT (id) — NO previene duplicacion trigger+seed | **NEEDS_FIX** |
| comodines_inventory | Si (vacia) | Demo: DO UPDATE, testing: DO NOTHING | Correcto | SAFE |
| user_preferences | Si (defaults) | DO UPDATE para demo users | Correcto | SAFE |
| user_ranks | Si (WHERE NOT EXISTS) | Seed 06: UPDATE only | Correcto | **INVESTIGATE** (CREAR-USUARIOS ON CONFLICT sin unique constraint) |
| user_achievements | Si (progress=0) | DO UPDATE con progreso | Correcto | SAFE |
| module_progress | Si (not_started) | Seed intencionalmente vacio v3.0 | N/A | SAFE |
| missions | Si (8 rows) | FASE 0.5 re-inserta mismas 8 | ON CONFLICT DO NOTHING puede ser no-op sin constraint | **INVESTIGATE** |

**Issue critico:** `ml_coins_transactions` — cada usuario seeded termina con 2 rows de welcome_bonus. El balance chain queda corrupto (seed asume balance_before=0 pero trigger ya dio 100).

**Issues a investigar:**
- `user_ranks`: verificar si existe UNIQUE constraint en (user_id)
- `missions`: verificar si existe UNIQUE constraint en (user_id, template_id, start_date)

---

## Hallazgos Consolidados por Severidad

### CRITICOS (requieren fix)
| # | Hallazgo | Fase | Accion |
|---|----------|------|--------|
| H-01 | prod/_testing/ con 4 archivos de testing | 0B | Eliminar |
| H-02 | 40 UUIDs achievement non-v4 (90000001-xxxx) | 0A | Remediar → gen_random_uuid() |
| H-03 | ml_coins_transactions duplica welcome bonus | 1C | Fix seed con balance awareness |
| H-04 | load-prod-seeds.sh no existe | 0B | Crear |

### ALTOS
| # | Hallazgo | Fase | Accion |
|---|----------|------|--------|
| H-05 | Staging loader referencia 2 archivos inexistentes | 0B | Fix refs |
| H-06 | Staging loader numbering errors en gamification | 0B | Fix refs |
| H-07 | 02-tenants-production.sql falta en staging | 1B | Copiar |
| H-08 | Mission templates non-v4 UUIDs referenciados por trigger | 0A | Evaluar remediacion |

### MEDIOS
| # | Hallazgo | Fase | Accion |
|---|----------|------|--------|
| H-09 | 7 seeds huerfanos puros en dev | 0B | Mover a _deprecated/ |
| H-10 | 6 archivos gamification no en dev-loader | 0B | Agregar a loader |
| H-11 | Prod orphans: peer/team challenges | 0B | Evaluar inclusion |
| H-12 | auth_providers metadata "development" en prod | 1B | Fix metadata |
| H-13 | Scope conflict marie_curie_content | 0B | Unificar scope |
| H-14 | user_ranks posible falta de UNIQUE constraint | 1C | Verificar DDL |
| H-15 | missions posible falta de UNIQUE constraint | 1C | Verificar DDL |
| H-16 | WARNING log usa NEW.user_id en vez de NEW.id | 1A | Fix menor |

### BAJOS
| # | Hallazgo | Fase | Accion |
|---|----------|------|--------|
| H-17 | staging/_testing/ con 1 archivo test | 0B | Eliminar |
| H-18 | 14 categorias non-v4 UUIDs (deliberados) | 0A | Documentar, no remediar |
| H-19 | auth.users no tiene email format CHECK | 1A | Aceptar (pattern Supabase) |
| H-20 | 04-user_roles.sql staging redundante con 07 | 1B | Aceptar (inocuo) |
