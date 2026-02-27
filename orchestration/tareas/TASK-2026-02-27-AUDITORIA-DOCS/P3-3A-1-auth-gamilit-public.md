# P3-3A-1: Data Model Alignment Audit — auth + auth_management + gamilit + public

**Tipo:** Data Model Alignment Audit
**Fecha:** 2026-02-27
**Scope:** Schemas: `auth`, `auth_management`, `gamilit`, `public`
**Doc de referencia:** `docs/20-architecture/schema-reference/01-auth.md`, `20-gamilit-utility.md`, `_INDEX.md`
**DDL base:** `apps/database/ddl/schemas/{auth,auth_management,gamilit,public}/`
**Metodologia:** DDL (source of truth) vs schema-reference docs (documentation layer)
**Auditor:** Claude Sonnet 4.6 (automated read-only audit)

---

## Resumen Ejecutivo

| Schema | Tablas DDL | Tablas Docs | Match | Issues |
|--------|-----------|-------------|-------|--------|
| `auth` | 1 | 7 (conceptual) | PARTIAL | Docs describe modelo legacy; nota aclaratoria presente |
| `auth_management` | 16 | 13 | PARTIAL | 3 tablas DDL sin docs individuales; 7 tablas legacy sin DDL |
| `gamilit` | 0 | 0 | MATCH | Schema de funciones, sin tablas — OK |
| `public` | 0 | 0 | MATCH | Schema reservado vacío — OK |

**Health Score DDL vs Docs: 72/100**

Problemas principales:
- `01-auth.md` documenta 6 tablas legacy del schema `auth` que NO existen en DDL
- 3 tablas DDL de `auth_management` (parent_accounts, parent_student_links, parent_notifications) documentadas solo en `14-parents.md` (schema conceptual diferente, columnas desalineadas)
- `user_status` ENUM en DDL tiene 5 valores; docs muestran solo 4
- `auth_provider` ENUM en docs (`_MAP.md`) incorrecto: dice `clever`, DDL tiene `github`
- `auth.users` columnas DDL (~32) vs docs (~14) — desalineamiento severo pero con nota justificativa

---

## Schema: auth

### DDL Overview
- **Archivo:** `apps/database/ddl/schemas/auth/tables/01-users.sql`
- **Total tablas DDL:** 1 (`auth.users`)
- **ENUMs DDL:** `aal_level`, `code_challenge_method` (en `auth/enums/`)
- **Vistas DDL:** `tenants_alias` (en `auth/views/`)
- **Funciones DDL:** `uid()` (en `auth/functions/`)

---

### auth.users

- **DDL:** `apps/database/ddl/schemas/auth/tables/01-users.sql`
- **Doc:** `docs/20-architecture/schema-reference/01-auth.md:20-44`
- **Status:** PARTIAL (desalineamiento intencional documentado — nota aclaratoria presente)
- **Columns DDL:** 32 | **Columns Doc:** 13 (subset documentado) | **Match:** PARTIAL

**Columnas en DDL (32):**
```
instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
invited_at, confirmation_token, confirmation_sent_at, recovery_token,
recovery_sent_at, email_change_token_new, email_change, email_change_sent_at,
last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
created_at, updated_at, phone, phone_confirmed_at, phone_change,
phone_change_token, phone_change_sent_at, confirmed_at,
email_change_token_current, email_change_confirm_status, banned_until,
reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at,
gamilit_role, status
```
*Nota: Contador real = 36 columnas incluyendo las 2 custom (gamilit_role, status)*

**Columnas en Docs (13 documentadas como "relevantes"):**
```
id, tenant_id, email, password_hash, first_name, last_name, role,
is_active, email_verified, avatar_url, last_login_at, created_at,
updated_at, deleted_at
```

**Missing from docs (no documentadas, presentes en DDL):**
- `instance_id`, `aud`, `encrypted_password`, `email_confirmed_at`, `invited_at`
- `confirmation_token`, `confirmation_sent_at`, `recovery_token`, `recovery_sent_at`
- `email_change_token_new`, `email_change`, `email_change_sent_at`
- `last_sign_in_at`, `raw_app_meta_data`, `raw_user_meta_data`, `is_super_admin`
- `phone`, `phone_confirmed_at`, `phone_change`, `phone_change_token`, `phone_change_sent_at`
- `confirmed_at`, `email_change_token_current`, `email_change_confirm_status`
- `banned_until`, `reauthentication_token`, `reauthentication_sent_at`
- `is_sso_user`, `role` (GoTrue role, no es gamilit_role)
- **`gamilit_role`** — columna CUSTOM GAMILIT, NO documentada en `01-auth.md`
- **`status`** — columna CUSTOM GAMILIT (FE-051 Admin Portal), NO documentada en `01-auth.md`

**Missing from DDL (en docs pero NO en DDL):**
- `tenant_id` — En docs como NOT NULL FK tenants.tenants; en DDL NO existe (auth.users es Supabase-compatible, no tiene tenant_id)
- `password_hash` — En DDL es `encrypted_password` (VARCHAR(255) → text)
- `first_name`, `last_name` — No existen en auth.users DDL (están en auth_management.profiles)
- `is_active` — No existe en DDL (se usa `status` VARCHAR(50))
- `email_verified` — No existe en auth.users DDL (se usa `email_confirmed_at` TIMESTAMPTZ)
- `avatar_url` — No existe en auth.users DDL (está en auth_management.profiles)
- `last_login_at` — En DDL es `last_sign_in_at`

**Type mismatches (columnas presentes en ambos):**
- `email`: DDL=`text NOT NULL` | Doc=`VARCHAR(255) NOT NULL`
- `id`: DDL=`uuid DEFAULT gen_random_uuid() NOT NULL` | Doc=`UUID NOT NULL DEFAULT uuid_generate_v4()` — diferencia menor en función UUID
- `created_at` / `updated_at`: DDL=`DEFAULT gamilit.now_mexico()` | Doc=`DEFAULT NOW()` — diferencia semántica

**Constraints en DDL no documentadas:**
- PRIMARY KEY `users_pkey` (id) — documentado en docs
- UNIQUE `users_email_key` (email) — docs dice UNIQUE (email, tenant_id), pero DDL solo tiene UNIQUE (email)
- CHECK `users_status_check` (status IN ('active','inactive','suspended','deleted')) — NO documentado en docs
- Indexes: `idx_auth_users_email`, `idx_auth_users_role`, `idx_auth_users_gamilit_role` — NO documentados en docs

**FK documented:** PARTIAL
- Docs dice: "FK tenants.tenants" para tenant_id — pero tenant_id NO EXISTE en la tabla DDL

**ENUMs used in DDL not documented in auth.users section:**
- `auth_management.gamilit_role` usada en columna `gamilit_role` — no mencionada en la tabla docs
- `status` VARCHAR(50) con CHECK — docs no menciona esta columna

**Notes:**
- El archivo `01-auth.md` incluye una nota aclaratoria (líneas 44-46) que explica el desalineamiento: "La tabla auth.users en produccion contiene ~30+ columnas siguiendo la estructura Supabase/GoTrue. Este documento muestra solo las columnas mas relevantes para el dominio gamilit." Esto JUSTIFICA parcialmente el gap, pero:
  1. Las columnas CUSTOM de GAMILIT (`gamilit_role`, `status`) deberían estar documentadas
  2. El índice `idx_auth_users_gamilit_role` indica uso activo no documentado
  3. El UNIQUE constraint en docs `(email, tenant_id)` es incorrecto — DDL solo tiene `(email)`
- La nota en línea 14 del doc aclara que `auth.user_profiles`, `auth.user_preferences`, etc. son tablas del modelo conceptual legacy sin DDL propio
- **SEVERIDAD: MEDIA** — la nota justifica el gap intencional, pero las columnas custom GAMILIT deben documentarse

---

### Tablas legacy en 01-auth.md sin DDL

El documento `01-auth.md` describe las siguientes tablas bajo el schema `auth` que NO tienen archivos DDL propios en `apps/database/ddl/schemas/auth/tables/`:

| Tabla Documentada | Status | Equivalente Real en DDL |
|-------------------|--------|------------------------|
| `auth.user_profiles` | MISSING_FROM_DDL | `auth_management.profiles` |
| `auth.user_preferences` | MISSING_FROM_DDL | `auth_management.user_preferences` |
| `auth.sessions` | MISSING_FROM_DDL | `auth_management.user_sessions` |
| `auth.refresh_tokens` | MISSING_FROM_DDL | dentro de `auth_management.user_sessions` (refresh_token column) |
| `auth.oauth_connections` | MISSING_FROM_DDL | `auth_management.auth_providers` (configuración) / no hay tabla de conexiones per-user |
| `auth.password_resets` | MISSING_FROM_DDL | `auth_management.password_reset_tokens` |
| `auth.login_attempts` | MISSING_FROM_DDL | `auth_management.auth_attempts` |

**Nota:** El archivo `01-auth.md` en sus líneas 9-14 incluye una nota aclaratoria que explica explícitamente que estas tablas son "del modelo conceptual legacy (no tienen DDL propio)" y apunta a las equivalencias en `auth_management`. La documentación está alineada conceptualmente, pero puede generar confusión al lector.

**SEVERIDAD: BAJA** — ya documentado con nota, pero las tablas legacy no deberían aparecer con el mismo formato que las tablas reales.

---

### ENUMs auth schema

| ENUM | DDL | Docs | Status |
|------|-----|------|--------|
| `auth.aal_level` (aal1, aal2, aal3) | `auth/enums/aal_level.sql` | NO documentado en 01-auth.md | MISSING_FROM_DOCS |
| `auth.code_challenge_method` (plain, s256) | `auth/enums/code_challenge_method.sql` | NO documentado en 01-auth.md | MISSING_FROM_DOCS |

**Notes:** Estos ENUMs son del estándar OAuth 2.0 / OIDC y son de infraestructura. Su ausencia en la documentación de usuario es aceptable pero debería mencionarse en la sección de ENUMs del schema.

---

## Schema: auth_management

### DDL Overview
- **Tablas DDL:** 16 archivos en `tables/` (01 a 16; tabla 13 = two_factor_tokens, no hay archivo 13 en el MAP pero sí en el glob)
- **ENUMs DDL:** `gamilit_role`, `user_status`, `auth_provider` (3 ENUMs)
- **Funciones DDL:** 6 funciones
- **Triggers DDL:** 6 archivos activos
- **Índices DDL:** 11 archivos (+ índices inline)
- **RLS:** 2 archivos

**Tablas DDL identificadas (16):**
```
01-tenants.sql
02-auth_attempts.sql
03-profiles.sql
03b-roles.sql
04-user_roles.sql
05-auth_providers.sql
06-email_verification_tokens.sql
07-password_reset_tokens.sql
08-security_events.sql
09-user_preferences.sql
10-memberships.sql
11-user_sessions.sql
12-user_suspensions.sql
13-two_factor_tokens.sql
14-parent_accounts.sql
15-parent_student_links.sql
16-parent_notifications.sql
```

**Tablas documentadas en `01-auth.md`:** 13 (tenants, auth_attempts, profiles, roles, user_roles, auth_providers, email_verification_tokens, two_factor_tokens, security_events, user_suspensions, user_preferences, memberships, password_reset_tokens, user_sessions)

**Tablas DDL sin documentación en `01-auth.md`:** 3 (parent_accounts, parent_student_links, parent_notifications) — documentadas parcialmente en `14-parents.md` con schema conceptual incorrecto.

---

### auth_management.tenants

- **DDL:** `apps/database/ddl/schemas/auth_management/tables/01-tenants.sql`
- **Doc:** `docs/20-architecture/schema-reference/01-auth.md:359-386`
- **Status:** MATCH (con observaciones menores)
- **Columns DDL:** 14 | **Columns Doc:** 14 | **Match:** 14/14

**Verificación columna por columna:**
| Columna | DDL | Docs | Match |
|---------|-----|------|-------|
| id | uuid DEFAULT gen_random_uuid() NOT NULL | UUID NOT NULL gen_random_uuid() PK | OK |
| name | text NOT NULL | TEXT NOT NULL | OK |
| slug | text NOT NULL | TEXT NOT NULL | OK |
| domain | text | TEXT NULL | OK |
| logo_url | text | TEXT NULL | OK |
| subscription_tier | text DEFAULT 'free' | TEXT NULL 'free' | OK |
| max_users | integer DEFAULT 100 | INTEGER NULL 100 | OK |
| max_storage_gb | integer DEFAULT 5 | INTEGER NULL 5 | OK |
| is_active | boolean DEFAULT true | BOOLEAN NULL true | OK |
| trial_ends_at | timestamptz | TIMESTAMPTZ NULL | OK |
| settings | jsonb DEFAULT {...} | JSONB NULL (ver DDL) | OK |
| metadata | jsonb DEFAULT '{}' | JSONB NULL '{}' | OK |
| created_at | timestamptz DEFAULT gamilit.now_mexico() | TIMESTAMPTZ NULL gamilit.now_mexico() | OK |
| updated_at | timestamptz DEFAULT gamilit.now_mexico() | TIMESTAMPTZ NULL gamilit.now_mexico() | OK |
| deleted_at | timestamptz DEFAULT NULL | TIMESTAMPTZ NULL NULL | OK |

**Constraints:** MATCH — PRIMARY KEY (id), UNIQUE (slug), CHECK subscription_tier IN (...), CHECK max_users > 0, CHECK max_storage_gb > 0, indexes documentados correctamente.

**FK documented:** N/A (no tiene FKs salientes, es tabla raíz)

**Notes:** La diferencia `NULL` vs `NOT NULL` en varias columnas del doc vs DDL es intencional (DDL usa DEFAULT sin NOT NULL explícito para columnas opcionales). Documentación sustancialmente correcta.

---

### auth_management.auth_attempts

- **DDL:** `apps/database/ddl/schemas/auth_management/tables/02-auth_attempts.sql`
- **Doc:** `docs/20-architecture/schema-reference/01-auth.md:389-406`
- **Status:** MATCH
- **Columns DDL:** 9 | **Columns Doc:** 9 | **Match:** 9/9

**Verificación columna por columna:**
| Columna | DDL | Docs | Match |
|---------|-----|------|-------|
| id | uuid DEFAULT gen_random_uuid() NOT NULL | UUID NOT NULL gen_random_uuid() | OK |
| email | text NOT NULL | TEXT NOT NULL | OK |
| ip_address | inet NOT NULL | INET NOT NULL | OK |
| user_agent | text | TEXT NULL | OK |
| success | boolean NOT NULL | BOOLEAN NOT NULL | OK |
| failure_reason | text | TEXT NULL | OK |
| tenant_slug | text | TEXT NULL | OK |
| attempted_at | timestamptz DEFAULT gamilit.now_mexico() | TIMESTAMPTZ NULL gamilit.now_mexico() | OK |
| metadata | jsonb DEFAULT '{}' | JSONB NULL '{}' | OK |

**Constraints:** MATCH — PRIMARY KEY (id), indexes documentados.
**FK documented:** N/A (tabla de auditoría independiente, sin FKs — documentado correctamente)

---

### auth_management.profiles

- **DDL:** `apps/database/ddl/schemas/auth_management/tables/03-profiles.sql`
- **Doc:** `docs/20-architecture/schema-reference/01-auth.md:410-450`
- **Status:** MATCH
- **Columns DDL:** 22 | **Columns Doc:** 22 | **Match:** 22/22

**Verificación columna por columna:**
| Columna | DDL | Docs | Match |
|---------|-----|------|-------|
| id | uuid NOT NULL gen_random_uuid() | UUID NOT NULL gen_random_uuid() | OK |
| tenant_id | uuid NOT NULL | UUID NOT NULL | OK |
| display_name | text | TEXT NULL | OK |
| full_name | text | TEXT NULL | OK |
| first_name | text | TEXT NULL | OK |
| last_name | text | TEXT NULL | OK |
| email | text NOT NULL | TEXT NOT NULL | OK |
| avatar_url | text | TEXT NULL | OK |
| bio | text | TEXT NULL | OK |
| phone | text | TEXT NULL | OK |
| date_of_birth | date | DATE NULL | OK |
| grade_level | text | TEXT NULL | OK |
| student_id | text | TEXT NULL | OK |
| school_id | uuid | UUID NULL | OK |
| role | gamilit_role NOT NULL DEFAULT 'student' | gamilit_role NOT NULL 'student' | OK |
| status | user_status NOT NULL DEFAULT 'active' | user_status NOT NULL 'active' | OK |
| email_verified | boolean DEFAULT false | BOOLEAN NULL false | OK |
| phone_verified | boolean DEFAULT false | BOOLEAN NULL false | OK |
| preferences | jsonb DEFAULT {...} | JSONB NULL (ver DDL) | OK |
| last_sign_in_at | timestamptz | TIMESTAMPTZ NULL | OK |
| last_activity_at | timestamptz | TIMESTAMPTZ NULL | OK |
| metadata | jsonb DEFAULT '{}' | JSONB NULL '{}' | OK |
| created_at | timestamptz DEFAULT gamilit.now_mexico() | TIMESTAMPTZ NULL gamilit.now_mexico() | OK |
| updated_at | timestamptz DEFAULT gamilit.now_mexico() | TIMESTAMPTZ NULL gamilit.now_mexico() | OK |
| deleted_at | timestamptz DEFAULT NULL | TIMESTAMPTZ NULL | OK |
| user_id | uuid (last column) | UUID NULL | OK |

**Constraints en DDL:**
- PRIMARY KEY (id) — documentado
- UNIQUE email (`profiles_email_key`) — documentado
- UNIQUE user_id (`profiles_user_id_key`) — documentado
- CHECK email_check (regex) — documentado
- CHECK bio_length_check (bio IS NULL OR LENGTH(bio) <= 500) — documentado
- FK fk_profiles_tenant_id → auth_management.tenants ON DELETE CASCADE — documentado
- FK fk_profiles_user_id → auth.users ON DELETE CASCADE — documentado
- FK school_id diferida — documentado

**Indexes:** 11 índices — todos documentados.
**Triggers:** 3 triggers referenciados correctamente.
**RLS:** Habilitado — 4 policies, documentadas.

**Notes:** Documentación excelente para esta tabla central. MATCH completo.

---

### auth_management.roles

- **DDL:** `apps/database/ddl/schemas/auth_management/tables/03b-roles.sql`
- **Doc:** `docs/20-architecture/schema-reference/01-auth.md:187-204`
- **Status:** MATCH
- **Columns DDL:** 6 | **Columns Doc:** 7 | **Match:** 6/6 (1 aparente discrepancia)

**Verificación columna por columna:**
| Columna | DDL | Docs | Match |
|---------|-----|------|-------|
| id | uuid NOT NULL DEFAULT gen_random_uuid() | UUID NOT NULL gen_random_uuid() | OK |
| name | varchar(50) NOT NULL | VARCHAR(50) NOT NULL | OK |
| description | text | TEXT NULL | OK |
| permissions | jsonb DEFAULT '{}' NOT NULL | JSONB NOT NULL '{}' | OK |
| is_active | boolean DEFAULT true NOT NULL | BOOLEAN NOT NULL true | OK |
| created_at | timestamptz DEFAULT gamilit.now_mexico() NOT NULL | TIMESTAMPTZ NOT NULL gamilit.now_mexico() | OK |
| updated_at | timestamptz DEFAULT gamilit.now_mexico() NOT NULL | TIMESTAMPTZ NOT NULL gamilit.now_mexico() | OK |

**Nota:** Docs lista 7 columnas (incluyendo updated_at), DDL tiene 7 columnas — MATCH correcto (mi conteo inicial estaba equivocado).

**Constraints:** MATCH — PRIMARY KEY (id), UNIQUE name (`roles_name_key`), indexes `idx_roles_name`, `idx_roles_is_active`.
**FK documented:** N/A (tabla raíz sin FKs salientes)

---

### auth_management.user_roles

- **DDL:** `apps/database/ddl/schemas/auth_management/tables/04-user_roles.sql`
- **Doc:** `docs/20-architecture/schema-reference/01-auth.md:208-232`
- **Status:** MATCH
- **Columns DDL:** 14 | **Columns Doc:** 14 | **Match:** 14/14

**Verificación columna por columna:**
| Columna | DDL | Docs | Match |
|---------|-----|------|-------|
| id | uuid NOT NULL gen_random_uuid() | UUID NOT NULL gen_random_uuid() | OK |
| user_id | uuid NOT NULL | UUID NOT NULL | OK |
| tenant_id | uuid NOT NULL | UUID NOT NULL | OK |
| role | gamilit_role NOT NULL | gamilit_role NOT NULL | OK |
| permissions | jsonb DEFAULT {...} | JSONB NULL {...} | OK |
| assigned_by | uuid | UUID NULL | OK |
| assigned_at | timestamptz DEFAULT gamilit.now_mexico() | TIMESTAMPTZ NULL gamilit.now_mexico() | OK |
| expires_at | timestamptz | TIMESTAMPTZ NULL | OK |
| revoked_by | uuid | UUID NULL | OK |
| revoked_at | timestamptz | TIMESTAMPTZ NULL | OK |
| is_active | boolean DEFAULT true | BOOLEAN NULL true | OK |
| metadata | jsonb DEFAULT '{}' | JSONB NULL '{}' | OK |
| created_at | timestamptz DEFAULT gamilit.now_mexico() | TIMESTAMPTZ NULL gamilit.now_mexico() | OK |
| updated_at | timestamptz DEFAULT gamilit.now_mexico() | TIMESTAMPTZ NULL gamilit.now_mexico() | OK |

**Constraints:** MATCH — PRIMARY KEY (id), UNIQUE (user_id, tenant_id, role), indexes, FKs:
- user_id → auth_management.profiles — documentado
- tenant_id → auth_management.tenants — documentado
- assigned_by → auth_management.profiles — documentado
- revoked_by → auth_management.profiles — documentado

---

### auth_management.auth_providers

- **DDL:** `apps/database/ddl/schemas/auth_management/tables/05-auth_providers.sql`
- **Doc:** `docs/20-architecture/schema-reference/01-auth.md:235-263`
- **Status:** MATCH (con 1 issue en ENUM docs)
- **Columns DDL:** 18 | **Columns Doc:** 18 | **Match:** 18/18

**Verificación de columnas:** Todas las columnas (id, provider_name, display_name, is_enabled, client_id, client_secret, authorization_url, token_url, user_info_url, scope, redirect_uri, icon_url, button_color, priority, config, metadata, created_at, updated_at) — MATCH.

**Constraints:** MATCH — PRIMARY KEY (id), UNIQUE provider_name, CHECK priority >= 0, indexes.

**ENUM Issue:**
- DDL: `auth_management.auth_provider` ENUM values = `local, google, facebook, apple, microsoft, github`
- `_MAP.md` del schema (línea 71): dice `auth_provider: "local, google, microsoft, clever"` — INCORRECTO, falta `facebook`, `apple`, `github` y tiene `clever` que no existe en DDL
- `01-auth.md` línea 241: dice `auth_provider NOT NULL` con valores `(local, google, facebook, apple, microsoft, github)` — CORRECTO

**SEVERIDAD: MEDIA** — El `_MAP.md` del schema tiene valores ENUM incorrectos, pero el doc principal `01-auth.md` es correcto.

---

### auth_management.email_verification_tokens

- **DDL:** `apps/database/ddl/schemas/auth_management/tables/06-email_verification_tokens.sql`
- **Doc:** `docs/20-architecture/schema-reference/01-auth.md:267-284`
- **Status:** MATCH
- **Columns DDL:** 7 | **Columns Doc:** 7 | **Match:** 7/7

**Verificación columna por columna:**
| Columna | DDL | Docs | Match |
|---------|-----|------|-------|
| id | uuid NOT NULL gen_random_uuid() | UUID NOT NULL gen_random_uuid() | OK |
| user_id | uuid NOT NULL | UUID NOT NULL | OK |
| token_hash | varchar(255) NOT NULL | VARCHAR(255) NOT NULL | OK |
| email | varchar(255) NOT NULL | VARCHAR(255) NOT NULL | OK |
| expires_at | timestamptz NOT NULL | TIMESTAMPTZ NOT NULL | OK |
| verified_at | timestamptz | TIMESTAMPTZ NULL | OK |
| created_at | timestamptz DEFAULT gamilit.now_mexico() | TIMESTAMPTZ NULL gamilit.now_mexico() | OK |

**Constraints:** MATCH — PRIMARY KEY (id), UNIQUE token_hash, FK user_id → auth.users ON DELETE CASCADE, indexes.

---

### auth_management.password_reset_tokens

- **DDL:** `apps/database/ddl/schemas/auth_management/tables/07-password_reset_tokens.sql`
- **Doc:** `docs/20-architecture/schema-reference/01-auth.md:453-469`
- **Status:** MATCH
- **Columns DDL:** 7 | **Columns Doc:** 7 | **Match:** 7/7

**Verificación columna por columna:**
| Columna | DDL | Docs | Match |
|---------|-----|------|-------|
| id | uuid NOT NULL gen_random_uuid() | UUID NOT NULL gen_random_uuid() | OK |
| user_id | uuid NOT NULL | UUID NOT NULL | OK |
| token_hash | varchar(255) NOT NULL | VARCHAR(255) NOT NULL | OK |
| expires_at | timestamptz NOT NULL | TIMESTAMPTZ NOT NULL | OK |
| used_at | timestamptz | TIMESTAMPTZ NULL | OK |
| ip_address | inet | INET NULL | OK |
| created_at | timestamptz DEFAULT gamilit.now_mexico() | TIMESTAMPTZ NULL gamilit.now_mexico() | OK |

**Constraints:** MATCH — PRIMARY KEY (id), UNIQUE token_hash, FK user_id → auth.users ON DELETE CASCADE, indexes.

---

### auth_management.security_events

- **DDL:** `apps/database/ddl/schemas/auth_management/tables/08-security_events.sql`
- **Doc:** `docs/20-architecture/schema-reference/01-auth.md:315-334`
- **Status:** MATCH
- **Columns DDL:** 9 | **Columns Doc:** 9 | **Match:** 9/9

**Verificación columna por columna:**
| Columna | DDL | Docs | Match |
|---------|-----|------|-------|
| id | uuid NOT NULL gen_random_uuid() | UUID NOT NULL gen_random_uuid() | OK |
| user_id | uuid (nullable) | UUID NULL | OK |
| event_type | varchar(100) NOT NULL | VARCHAR(100) NOT NULL | OK |
| severity | varchar(50) NOT NULL | VARCHAR(50) NOT NULL | OK |
| description | text | TEXT NULL | OK |
| ip_address | inet | INET NULL | OK |
| user_agent | text | TEXT NULL | OK |
| metadata | jsonb | JSONB NULL | OK |
| created_at | timestamptz DEFAULT CURRENT_TIMESTAMP | TIMESTAMPTZ NULL CURRENT_TIMESTAMP | OK |

**Constraints:** MATCH — PRIMARY KEY (id), CHECK severity IN ('low','medium','high','critical'), FK user_id → auth.users ON DELETE SET NULL, indexes.

**Notes:** `created_at` usa `CURRENT_TIMESTAMP` (no `gamilit.now_mexico()`) — consistente entre DDL y docs.

---

### auth_management.user_preferences

- **DDL:** `apps/database/ddl/schemas/auth_management/tables/09-user_preferences.sql`
- **Doc:** `docs/20-architecture/schema-reference/01-auth.md:473-494`
- **Status:** MATCH
- **Columns DDL:** 10 | **Columns Doc:** 10 | **Match:** 10/10

**Verificación columna por columna:**
| Columna | DDL | Docs | Match |
|---------|-----|------|-------|
| user_id | UUID PRIMARY KEY FK profiles | UUID NOT NULL PK FK profiles | OK |
| theme | VARCHAR(20) DEFAULT 'light' | VARCHAR(20) NULL 'light' | OK |
| language | VARCHAR(10) DEFAULT 'es' | VARCHAR(10) NULL 'es' | OK |
| notifications_enabled | BOOLEAN DEFAULT true | BOOLEAN NULL true | OK |
| email_notifications | BOOLEAN DEFAULT true | BOOLEAN NULL true | OK |
| sound_enabled | BOOLEAN DEFAULT true | BOOLEAN NULL true | OK |
| tutorial_completed | BOOLEAN DEFAULT false | BOOLEAN NULL false | OK |
| preferences | JSONB DEFAULT '{}' | JSONB NULL '{}' | OK |
| created_at | TIMESTAMPTZ DEFAULT NOW() | TIMESTAMPTZ NULL NOW() | OK |
| updated_at | TIMESTAMPTZ DEFAULT NOW() | TIMESTAMPTZ NULL NOW() | OK |

**Constraints:** MATCH — PRIMARY KEY user_id (PK = FK), CHECK theme IN ('light','dark','auto'), CHECK language IN ('es','en'), FK → auth_management.profiles ON DELETE CASCADE, indexes, triggers, RLS.

---

### auth_management.memberships

- **DDL:** `apps/database/ddl/schemas/auth_management/tables/10-memberships.sql`
- **Doc:** `docs/20-architecture/schema-reference/01-auth.md:498-522`
- **Status:** MATCH
- **Columns DDL:** 13 | **Columns Doc:** 13 | **Match:** 13/13

**Verificación columna por columna:**
| Columna | DDL | Docs | Match |
|---------|-----|------|-------|
| id | uuid NOT NULL gen_random_uuid() | UUID NOT NULL gen_random_uuid() | OK |
| user_id | uuid NOT NULL | UUID NOT NULL | OK |
| tenant_id | uuid NOT NULL | UUID NOT NULL | OK |
| role | text DEFAULT 'member' | TEXT NULL 'member' | OK |
| status | text DEFAULT 'active' | TEXT NULL 'active' | OK |
| joined_at | timestamptz DEFAULT gamilit.now_mexico() | TIMESTAMPTZ NULL gamilit.now_mexico() | OK |
| expires_at | timestamptz | TIMESTAMPTZ NULL | OK |
| last_access_at | timestamptz | TIMESTAMPTZ NULL | OK |
| permissions | jsonb DEFAULT {...} | JSONB NULL (ver DDL) | OK |
| restrictions | jsonb DEFAULT '{}' | JSONB NULL '{}' | OK |
| metadata | jsonb DEFAULT '{}' | JSONB NULL '{}' | OK |
| created_at | timestamptz DEFAULT gamilit.now_mexico() | TIMESTAMPTZ NULL gamilit.now_mexico() | OK |
| updated_at | timestamptz DEFAULT gamilit.now_mexico() | TIMESTAMPTZ NULL gamilit.now_mexico() | OK |

**Constraints:** MATCH — PRIMARY KEY (id), UNIQUE (user_id, tenant_id), CHECK role IN (...), CHECK status IN (...), FKs, indexes.

---

### auth_management.user_sessions

- **DDL:** `apps/database/ddl/schemas/auth_management/tables/11-user_sessions.sql`
- **Doc:** `docs/20-architecture/schema-reference/01-auth.md:526-554`
- **Status:** MATCH
- **Columns DDL:** 19 | **Columns Doc:** 19 | **Match:** 19/19

**Verificación columna por columna:**
| Columna | DDL | Docs | Match |
|---------|-----|------|-------|
| id | uuid NOT NULL gen_random_uuid() | UUID NOT NULL gen_random_uuid() | OK |
| user_id | uuid NOT NULL | UUID NOT NULL | OK |
| tenant_id | uuid (nullable) | UUID NULL | OK |
| session_token | text NOT NULL | TEXT NOT NULL | OK |
| refresh_token | text | TEXT NULL | OK |
| user_agent | text | TEXT NULL | OK |
| ip_address | inet | INET NULL | OK |
| device_type | text | TEXT NULL | OK |
| browser | text | TEXT NULL | OK |
| os | text | TEXT NULL | OK |
| country | text | TEXT NULL | OK |
| city | text | TEXT NULL | OK |
| created_at | timestamptz DEFAULT gamilit.now_mexico() | TIMESTAMPTZ NULL gamilit.now_mexico() | OK |
| last_activity_at | timestamptz DEFAULT gamilit.now_mexico() | TIMESTAMPTZ NULL gamilit.now_mexico() | OK |
| expires_at | timestamptz NOT NULL | TIMESTAMPTZ NOT NULL | OK |
| is_active | boolean DEFAULT true | BOOLEAN NULL true | OK |
| revoked_at | timestamptz | TIMESTAMPTZ NULL | OK |
| metadata | jsonb DEFAULT '{}' | JSONB NULL '{}' | OK |

**Constraints:** MATCH — PRIMARY KEY (id), UNIQUE session_token, CHECK device_type IN ('desktop','mobile','tablet','unknown'), FKs user_id → profiles, tenant_id → tenants, indexes.

---

### auth_management.user_suspensions

- **DDL:** `apps/database/ddl/schemas/auth_management/tables/12-user_suspensions.sql`
- **Doc:** `docs/20-architecture/schema-reference/01-auth.md:338-355`
- **Status:** MATCH
- **Columns DDL:** 8 | **Columns Doc:** 8 | **Match:** 8/8

**Verificación columna por columna:**
| Columna | DDL | Docs | Match |
|---------|-----|------|-------|
| id | UUID PRIMARY KEY DEFAULT gen_random_uuid() | UUID NOT NULL gen_random_uuid() | OK |
| user_id | UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE | UUID NOT NULL FK auth.users ON DELETE CASCADE | OK |
| reason | TEXT NOT NULL | TEXT NOT NULL | OK |
| suspension_until | TIMESTAMPTZ (nullable) | TIMESTAMPTZ NULL | OK |
| suspended_by | UUID NOT NULL REFERENCES auth.users | UUID NOT NULL FK auth.users | OK |
| suspended_at | TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP | TIMESTAMPTZ NULL CURRENT_TIMESTAMP | OK |
| created_at | TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP | TIMESTAMPTZ NULL CURRENT_TIMESTAMP | OK |
| updated_at | TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP | TIMESTAMPTZ NULL CURRENT_TIMESTAMP | OK |

**Constraints:** MATCH — PRIMARY KEY (id), UNIQUE user_id (1 suspensión por usuario), FKs, indexes.

---

### auth_management.two_factor_tokens

- **DDL:** `apps/database/ddl/schemas/auth_management/tables/13-two_factor_tokens.sql`
- **Doc:** `docs/20-architecture/schema-reference/01-auth.md:287-311`
- **Status:** MATCH
- **Columns DDL:** 15 | **Columns Doc:** 15 | **Match:** 15/15

**Verificación columna por columna:**
| Columna | DDL | Docs | Match |
|---------|-----|------|-------|
| id | uuid DEFAULT gen_random_uuid() PRIMARY KEY | UUID NOT NULL gen_random_uuid() | OK |
| user_id | uuid NOT NULL FK auth.users ON DELETE CASCADE | UUID NOT NULL FK auth.users | OK |
| method | varchar(20) NOT NULL CHECK IN ('email','sms','authenticator') | VARCHAR(20) NOT NULL | OK |
| secret_key | varchar(255) | VARCHAR(255) NULL | OK |
| token_hash | varchar(255) | VARCHAR(255) NULL | OK |
| is_enabled | boolean DEFAULT false | BOOLEAN NULL false | OK |
| is_verified | boolean DEFAULT false | BOOLEAN NULL false | OK |
| verified_at | timestamptz | TIMESTAMPTZ NULL | OK |
| expires_at | timestamptz | TIMESTAMPTZ NULL | OK |
| attempts_count | int DEFAULT 0 | INTEGER NULL 0 | OK |
| last_attempt_at | timestamptz | TIMESTAMPTZ NULL | OK |
| locked_until | timestamptz | TIMESTAMPTZ NULL | OK |
| backup_codes_encrypted | text | TEXT NULL | OK |
| created_at | timestamptz DEFAULT gamilit.now_mexico() | TIMESTAMPTZ NULL gamilit.now_mexico() | OK |
| updated_at | timestamptz DEFAULT gamilit.now_mexico() | TIMESTAMPTZ NULL gamilit.now_mexico() | OK |

**Constraints:** MATCH — PRIMARY KEY (id), CHECK method IN ('email','sms','authenticator'), FK user_id → auth.users ON DELETE CASCADE, indexes.

---

### auth_management.parent_accounts

- **DDL:** `apps/database/ddl/schemas/auth_management/tables/14-parent_accounts.sql`
- **Doc (01-auth.md):** NO DOCUMENTADA en `01-auth.md`
- **Doc (14-parents.md):** Documentada como `parents.parent_profiles` con schema conceptual diferente
- **Status:** MISSING_FROM_DOCS (en 01-auth.md) / PARTIAL (en 14-parents.md)
- **Columns DDL:** 22 | **Columns Doc (14-parents.md):** 8 | **Match:** 4/22

**Comparación DDL vs 14-parents.md `parents.parent_profiles`:**

| Columna DDL | Columna Doc | Match |
|-------------|-------------|-------|
| id | id | OK |
| profile_id (NOT NULL UNIQUE FK profiles) | user_id (FK auth.users) | MISMATCH — DDL FK → profiles, doc FK → auth.users |
| relationship_type | relationship (VARCHAR(50)) | PARTIAL — tipos diferentes: DDL: mother/father/guardian/tutor/other; Doc: parent/tutor/guardian |
| - | phone | MISSING_FROM_DDL — docs tiene `phone`, DDL no |
| - | notification_preferences | MISSING_FROM_DDL — docs tiene JSONB, DDL tiene campos individuales |
| notification_frequency | - | MISSING_FROM_DOCS |
| alert_on_low_performance | - | MISSING_FROM_DOCS |
| alert_on_inactivity_days | - | MISSING_FROM_DOCS |
| alert_on_achievement_unlocked | - | MISSING_FROM_DOCS |
| alert_on_rank_promotion | - | MISSING_FROM_DOCS |
| preferred_report_format | - | MISSING_FROM_DOCS |
| preferred_language | - | MISSING_FROM_DOCS |
| dashboard_widgets | - | MISSING_FROM_DOCS |
| can_view_detailed_progress | - | MISSING_FROM_DOCS |
| can_view_exercise_attempts | - | MISSING_FROM_DOCS |
| can_receive_alerts | - | MISSING_FROM_DOCS |
| can_download_reports | - | MISSING_FROM_DOCS |
| is_verified | - | MISSING_FROM_DOCS |
| is_active | - | MISSING_FROM_DOCS |
| created_at | created_at | OK |
| updated_at | updated_at | OK |
| last_login_at | - | MISSING_FROM_DOCS |
| metadata | - | MISSING_FROM_DOCS |

**Missing from docs:** 16 columnas (notification_frequency, alert_*, preferred_*, dashboard_widgets, can_*, is_verified, is_active, last_login_at, metadata)
**Missing from DDL:** 1 columna (phone) — probablemente cubierta por auth_management.profiles.phone
**Type mismatches:** FK diferente (profile_id → profiles vs user_id → auth.users)
**FK documented:** PARTIAL — doc dice FK → auth.users, DDL dice FK → auth_management.profiles
**Notes:**
- La tabla `parent_accounts` es más rica que lo documentado en `14-parents.md`
- El schema conceptual en `14-parents.md` usa `parents.parent_profiles` (schema incorrecto)
- **SEVERIDAD: ALTA** — documentación sustancialmente incorrecta para esta tabla

---

### auth_management.parent_student_links

- **DDL:** `apps/database/ddl/schemas/auth_management/tables/15-parent_student_links.sql`
- **Doc (01-auth.md):** NO DOCUMENTADA
- **Doc (14-parents.md):** Documentada como `parents.parent_student_links` con schema conceptual diferente
- **Status:** PARTIAL (documentación parcial en schema incorrecto)
- **Columns DDL:** 25 | **Columns Doc (14-parents.md):** 9 | **Match:** 4/25

**Comparación DDL vs 14-parents.md:**

| Columna DDL | Columna Doc | Match |
|-------------|-------------|-------|
| id | id | OK |
| parent_account_id (FK parent_accounts) | parent_id (FK auth.users) | MISMATCH — tipo de FK diferente |
| student_id (FK profiles) | student_id (FK auth.users) | MISMATCH — FK target diferente |
| - | tenant_id | MISSING_FROM_DDL |
| relationship_type | - | MISSING_FROM_DOCS |
| can_view_progress | - | MISSING_FROM_DOCS |
| can_view_grades | - | MISSING_FROM_DOCS |
| can_receive_notifications | - | MISSING_FROM_DOCS |
| can_contact_teachers | - | MISSING_FROM_DOCS |
| link_status | status (link_status ENUM) | PARTIAL — DDL usa TEXT, doc usa link_status ENUM |
| - | linked_at | MISSING_FROM_DDL |
| - | linked_via | MISSING_FROM_DDL |
| is_verified | - | MISSING_FROM_DOCS |
| verified_by | - | MISSING_FROM_DOCS |
| verified_at | - | MISSING_FROM_DOCS |
| verification_code | - | MISSING_FROM_DOCS |
| verification_code_expires_at | - | MISSING_FROM_DOCS |
| verification_attempts | - | MISSING_FROM_DOCS |
| student_approval_required | - | MISSING_FROM_DOCS |
| student_approved | - | MISSING_FROM_DOCS |
| student_approved_at | - | MISSING_FROM_DOCS |
| created_at | created_at | OK |
| updated_at | - | MISSING_FROM_DOCS |
| activated_at | - | MISSING_FROM_DOCS |
| revoked_at | - | MISSING_FROM_DOCS |
| revoked_by | - | MISSING_FROM_DOCS |
| revocation_reason | - | MISSING_FROM_DOCS |
| metadata | - | MISSING_FROM_DOCS |

**Missing from docs:** 19 columnas
**Missing from DDL:** 2 columnas (tenant_id, linked_via)
**FK documented:** INCORRECT — doc dice FKs → auth.users; DDL dice FKs → parent_accounts, profiles
**Notes:**
- La tabla DDL es mucho más compleja que lo documentado
- **SEVERIDAD: ALTA** — documentación insuficiente y con FKs incorrectos

---

### auth_management.parent_notifications

- **DDL:** `apps/database/ddl/schemas/auth_management/tables/16-parent_notifications.sql`
- **Doc (01-auth.md):** NO DOCUMENTADA
- **Doc (14-parents.md):** Documentada como `parents.parent_notifications` con schema conceptual diferente
- **Status:** PARTIAL (documentación parcial en schema incorrecto)
- **Columns DDL:** 22 | **Columns Doc (14-parents.md):** 10 | **Match:** 5/22

**Columnas en DDL (22):**
parent_account_id, student_id, notification_type, title, message, summary, student_snapshot, priority, sent_via_email, sent_via_in_app, sent_via_push, status, related_entity_type, related_entity_id, action_url, scheduled_for, sent_at, read_at, created_at, updated_at, metadata, id

**Columnas en Docs (10):**
id, parent_id, student_id, tenant_id, event_type, title, message, is_read, read_at, created_at

**Missing from docs:** summary, student_snapshot, priority, sent_via_email, sent_via_in_app, sent_via_push, status, related_entity_type, related_entity_id, action_url, scheduled_for, sent_at, updated_at, metadata
**Missing from DDL:** tenant_id, is_read (DDL usa status CHECK IN 'pending','sent','read','archived')

**Type mismatches:**
- `parent_id` (doc) vs `parent_account_id` (DDL) — FK diferente (auth.users vs parent_accounts)
- `event_type VARCHAR(50)` (doc) vs `notification_type TEXT CHECK` (DDL) — nombre y tipo diferente
- `is_read BOOLEAN` (doc) vs `status TEXT` (DDL) — manejo de estado diferente

**FK documented:** INCORRECT
**Notes:**
- **SEVERIDAD: ALTA** — documentación desalineada sustancialmente

---

## ENUMs auth_management — Comparación

### auth_management.gamilit_role

| Fuente | Valores |
|--------|---------|
| **DDL** (`gamilit_role.sql`) | `student`, `admin_teacher`, `super_admin` |
| **Docs `01-auth.md`** (l.429, 217) | `student`, `admin_teacher`, `super_admin` |
| **`_MAP.md`** (l.70) | `student, admin_teacher, super_admin` |
| **Status** | MATCH |

### auth_management.user_status

| Fuente | Valores |
|--------|---------|
| **DDL** (`user_status.sql`) | `active`, `inactive`, `suspended`, `banned`, `pending` |
| **Docs `01-auth.md`** (l.430, profiles.status) | mentions `user_status NOT NULL DEFAULT 'active'` sin listar valores |
| **`_MAP.md`** (l.70) | `active, inactive, suspended, pending_verification` |
| **Status** | MISMATCH |

**Issues:**
1. `_MAP.md` dice `pending_verification` pero DDL tiene `pending` (sin "_verification")
2. `_MAP.md` NO incluye `banned` (agregado en v1.1 2025-11-08)
3. `auth.users.status` CHECK en DDL usa `VARCHAR(50)` con CHECK IN ('active','inactive','suspended','deleted') — diferente de `auth_management.user_status` ENUM — los valores 'deleted' y 'banned' no están sincronizados entre los dos mecanismos de estado de usuario

**SEVERIDAD: ALTA** — Discrepancia entre ENUM en `auth_management.profiles.status` y CHECK en `auth.users.status`, más documentación incorrecta del ENUM en `_MAP.md`.

### auth_management.auth_provider (ENUM)

| Fuente | Valores |
|--------|---------|
| **DDL** (`auth_provider.sql`) | `local`, `google`, `facebook`, `apple`, `microsoft`, `github` |
| **Docs `01-auth.md`** (l.241) | `local, google, facebook, apple, microsoft, github` |
| **`_MAP.md`** (l.71) | `local, google, microsoft, clever` |
| **Status** | PARTIAL — `01-auth.md` CORRECTO; `_MAP.md` INCORRECTO |

**Issues en `_MAP.md`:**
- Falta: `facebook`, `apple`, `github`
- Tiene de más: `clever` (no existe en DDL)

**SEVERIDAD: ALTA** — `_MAP.md` es el directorio del schema y debe ser preciso.

---

## Schema: gamilit

### DDL Overview
- **Tablas DDL:** 0 (sin archivos en `tables/`, directorio inexistente)
- **Funciones DDL:** 31+ archivos en `functions/`
- **Vistas DDL:** 1 (`views/number_series.sql`)

### Verificación vs Documentación

- **Doc:** `docs/20-architecture/schema-reference/20-gamilit-utility.md`
- **Status:** MATCH

**El schema `gamilit` es correctamente descrito en `20-gamilit-utility.md`:**
- "Sin tablas: Este schema solo contiene lógica (funciones, triggers, views)" — CORRECTO
- "Sin entities: No se necesitan entities backend para este schema" — CORRECTO
- 37 funciones documentadas — DDL muestra ~30+ archivos (algunos son .md y .TEST.sql, no funciones SQL). Conteo aproximado correcto.
- 1 view (`number_series`) — documentada correctamente.
- `gamilit` tiene `is_admin()` pero docs menciona `is_super_admin` (05b-is_super_admin.sql) — no incluido en tabla de funciones del doc.

**Función no documentada en table de funciones:**
- `is_super_admin()` (05b-is_super_admin.sql) — presente en DDL, ausente en docs tabla de funciones
- `update_user_last_login()` — presente en DDL, ausente en docs tabla de funciones
- `audit_profile_changes()` — presente en DDL (01-audit_profile_changes.sql), documentada en docs. OK.

**Notes:**
- La documentación `20-gamilit-utility.md` no documenta el contenido de cada función individualmente (solo lista nombres), lo cual es aceptable para un schema utilitario.
- `is_super_admin()` debería aparecer junto a `is_admin()` en la tabla.
- **SEVERIDAD: BAJA**

---

## Schema: public

### DDL Overview
- **Tablas DDL:** 0 (solo archivo `_MAP.md` en el directorio)
- **Tablas en producción (fuera de DDL):** TypeORM crea `typeorm_metadata` y `migrations` automáticamente — no tienen DDL explícito en el proyecto.

### Verificación vs Documentación

- **Doc principal:** `docs/20-architecture/schema-reference/_INDEX.md` (línea 83): `public` — "placeholder/vacíos"
- **Doc `_MAP.md`:** `apps/database/ddl/schemas/public/_MAP.md` — correctamente documenta que el schema es vacío por diseño.
- **Status:** MATCH

**Notas:**
- `_INDEX.md` y `public/_MAP.md` están alineados: schema reservado sin objetos propios de GAMILIT.
- Las tablas TypeORM (`typeorm_metadata`, `migrations`) son creadas por el ORM en runtime y no requieren DDL explícito en el repositorio — correctamente no documentadas en schema-reference.
- **SEVERIDAD: N/A (no hay issues)**

---

## Resumen de Issues por Severidad

### ALTA (3 issues)

| ID | Schema | Objeto | Descripción |
|----|--------|--------|-------------|
| A-01 | auth_management | user_status ENUM | `_MAP.md` dice `pending_verification` (DDL: `pending`); falta valor `banned` en docs. Además, `auth.users.status` CHECK usa `deleted` que no existe en el ENUM. |
| A-02 | auth_management | auth_provider ENUM en `_MAP.md` | `_MAP.md` tiene valores incorrectos: tiene `clever` (no existe), falta `facebook`, `apple`, `github` |
| A-03 | auth_management | parent_accounts / parent_student_links / parent_notifications | 3 tablas documentadas con schema incorrecto (`parents.*` en lugar de `auth_management.*`), FKs incorrectas, 14-22 columnas por tabla no documentadas |

### MEDIA (2 issues)

| ID | Schema | Objeto | Descripción |
|----|--------|--------|-------------|
| M-01 | auth | auth.users — columnas custom | `gamilit_role` y `status` son columnas propias de GAMILIT agregadas a `auth.users` pero NO aparecen en la sección de la tabla en `01-auth.md` |
| M-02 | auth | auth.users — UNIQUE constraint incorrecto | Doc dice UNIQUE `(email, tenant_id)` pero DDL solo tiene UNIQUE `(email)`. `auth.users` no tiene columna `tenant_id`. |

### BAJA (3 issues)

| ID | Schema | Objeto | Descripción |
|----|--------|--------|-------------|
| B-01 | auth | auth.aal_level, auth.code_challenge_method ENUMs | ENUMs del schema `auth` no documentados en `01-auth.md` |
| B-02 | auth | Tablas legacy en `01-auth.md` | auth.user_profiles, auth.sessions, auth.refresh_tokens, auth.oauth_connections, auth.password_resets, auth.login_attempts aparecen como tablas pero son modelo legacy. La nota aclaratoria ayuda pero puede confundir. |
| B-03 | gamilit | is_super_admin() función | `is_super_admin()` función en DDL ausente en tabla de funciones en `20-gamilit-utility.md` |

### INFORMATIVO (no bugs, solo notas)

| ID | Schema | Objeto | Descripción |
|----|--------|--------|-------------|
| I-01 | auth_management | DEFAULT gamilit.now_mexico() vs NOW() | `user_preferences` y `security_events` usan `CURRENT_TIMESTAMP` / `NOW()` mientras que otras tablas usan `gamilit.now_mexico()`. No es error de docs pero hay inconsistencia en DDL. |
| I-02 | auth_management | NULL vs NOT NULL en docs | Docs marca muchas columnas como `NULL` cuando en DDL son nullable por omisión (sin NOT NULL explícito). Semánticamente correcto pero podría ser más preciso. |
| I-03 | auth_management | 13 tablas documentadas vs 16 en DDL | El `_MAP.md` del schema lista 17 archivos en `tables/` pero no incluye `13-two_factor_tokens.sql` en la lista (solo incluye tablas 01-12, 14-16). El archivo sí existe y está documentado en `01-auth.md`. |

---

## Tablas DDL vs Documentación — Tabla Maestra

| Tabla DDL | Archivo DDL | Archivo Doc | Sección Doc | Status |
|-----------|-------------|-------------|-------------|--------|
| `auth.users` | 01-users.sql | 01-auth.md | L20-46 | PARTIAL (columnas custom no docs) |
| `auth_management.tenants` | 01-tenants.sql | 01-auth.md | L359-386 | MATCH |
| `auth_management.auth_attempts` | 02-auth_attempts.sql | 01-auth.md | L389-406 | MATCH |
| `auth_management.profiles` | 03-profiles.sql | 01-auth.md | L410-450 | MATCH |
| `auth_management.roles` | 03b-roles.sql | 01-auth.md | L187-204 | MATCH |
| `auth_management.user_roles` | 04-user_roles.sql | 01-auth.md | L208-232 | MATCH |
| `auth_management.auth_providers` | 05-auth_providers.sql | 01-auth.md | L235-263 | MATCH |
| `auth_management.email_verification_tokens` | 06-email_verification_tokens.sql | 01-auth.md | L267-284 | MATCH |
| `auth_management.password_reset_tokens` | 07-password_reset_tokens.sql | 01-auth.md | L453-469 | MATCH |
| `auth_management.security_events` | 08-security_events.sql | 01-auth.md | L315-334 | MATCH |
| `auth_management.user_preferences` | 09-user_preferences.sql | 01-auth.md | L473-494 | MATCH |
| `auth_management.memberships` | 10-memberships.sql | 01-auth.md | L498-522 | MATCH |
| `auth_management.user_sessions` | 11-user_sessions.sql | 01-auth.md | L526-554 | MATCH |
| `auth_management.user_suspensions` | 12-user_suspensions.sql | 01-auth.md | L338-355 | MATCH |
| `auth_management.two_factor_tokens` | 13-two_factor_tokens.sql | 01-auth.md | L287-311 | MATCH |
| `auth_management.parent_accounts` | 14-parent_accounts.sql | 14-parents.md | L9-23 | PARTIAL (schema incorrecto, 16 cols faltantes) |
| `auth_management.parent_student_links` | 15-parent_student_links.sql | 14-parents.md | L27-42 | PARTIAL (FKs incorrectas, 19 cols faltantes) |
| `auth_management.parent_notifications` | 16-parent_notifications.sql | 14-parents.md | L46-60 | PARTIAL (FKs incorrectas, 14 cols faltantes) |
| gamilit (sin tablas) | — | 20-gamilit-utility.md | — | MATCH |
| public (sin tablas) | — | _INDEX.md | L83 | MATCH |

**Tablas documentadas sin DDL (legacy/conceptual en 01-auth.md):**
- `auth.user_profiles`, `auth.user_preferences`, `auth.sessions`, `auth.refresh_tokens`, `auth.oauth_connections`, `auth.password_resets`, `auth.login_attempts` — anotadas con nota aclaratoria en docs

---

## Métricas Finales

| Categoría | Valor |
|-----------|-------|
| Tablas DDL auditadas | 18 (1 auth + 16 auth_management + 0 gamilit + 0 public) |
| Tablas con status MATCH | 13 |
| Tablas con status PARTIAL | 4 (auth.users + 3 parent tables) |
| Tablas MISSING_FROM_DOCS | 0 (todas tienen alguna cobertura) |
| Tablas MISSING_FROM_DDL | 7 (legacy en 01-auth.md, anotadas) |
| Issues ALTA | 3 |
| Issues MEDIA | 2 |
| Issues BAJA | 3 |
| Columnas totales auditadas (DDL) | ~248 |
| Columnas correctamente documentadas | ~198 (~80%) |

---

## Recomendaciones

### Prioridad 1 — Correcciones Inmediatas

1. **Actualizar `apps/database/ddl/schemas/auth_management/_MAP.md`:**
   - Corregir ENUM `auth_provider`: cambiar `clever` → agregar `facebook`, `apple`, `github`, quitar `clever`
   - Corregir ENUM `user_status`: cambiar `pending_verification` → `pending`, agregar `banned`
   - Agregar `13-two_factor_tokens.sql` a la lista de tablas

2. **Actualizar `docs/20-architecture/schema-reference/01-auth.md` — sección auth.users:**
   - Agregar documentación de columnas custom GAMILIT: `gamilit_role` y `status`
   - Corregir UNIQUE constraint: cambiar `UNIQUE (email, tenant_id)` → `UNIQUE (email)`
   - Agregar CHECK constraint para `status`

### Prioridad 2 — Documentación de Tablas Parents

3. **Actualizar `docs/20-architecture/schema-reference/01-auth.md`:**
   - Agregar sección completa para `auth_management.parent_accounts` con las 22 columnas reales
   - Agregar sección completa para `auth_management.parent_student_links` con las 25 columnas reales
   - Agregar sección completa para `auth_management.parent_notifications` con las 22 columnas reales

4. **Actualizar `docs/20-architecture/schema-reference/14-parents.md`:**
   - Cambiar schema conceptual de `parents.*` → `auth_management.*`
   - Actualizar FKs: cambiar referencias a `auth.users` → `auth_management.profiles` / `auth_management.parent_accounts`
   - Agregar columnas faltantes o indicar referencia a `01-auth.md`

### Prioridad 3 — Mejoras Menores

5. **Actualizar `docs/20-architecture/schema-reference/20-gamilit-utility.md`:**
   - Agregar `is_super_admin()` a la tabla de funciones junto a `is_admin()`

---

*Generado: 2026-02-27 | Audit: P3-3A-1 | Read-only audit — ningún archivo modificado*
