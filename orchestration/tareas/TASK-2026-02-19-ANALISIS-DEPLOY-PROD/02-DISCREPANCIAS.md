# Discrepancias Detalladas: Seeds, Usuarios, Configuracion

**Fecha:** 2026-02-19 | **Version:** 1.0.0

---

## 1. DISCREPANCIAS DE SEEDS (DEV vs PROD vs STAGING)

### 1.1 Conteos por Ambiente

| Metrica | DEV | PROD | STAGING |
|---------|:---:|:----:|:-------:|
| Archivos .sql totales | 113 | 77 | 61 |
| Archivos en pipeline | 79 | 59 | 0 (sin .conf) |
| Schemas con seeds | 13 | 13 | 12 |
| Config .conf | SI | SI | **NO** |

### 1.2 Numeracion Duplicada en Gamification (CRITICA)

| Concepto | DEV | PROD | STAGING |
|----------|:---:|:----:|:-------:|
| shop_items_expanded | **16** | - | - |
| metadata_normalization | **17** | **17** | **17** |
| user_purchases-demo | **18** | **17** (DUP!) | **16** |
| user_equipped_items-demo | **19** | **18** | **17** (DUP!) |
| achievements-collection | **20** | **20** | **20** |

**PROD** tiene 2 archivos con prefijo `17-`. **STAGING** tiene 2 archivos con prefijo `17-`.

### 1.3 Archivos con Contenido Diferente entre DEV y PROD (26 archivos)

| Schema | Archivo | Scope |
|--------|---------|-------|
| admin_dashboard | 01-bulk_operations.sql | `all\|core` |
| admin_dashboard | 02-admin_reports.sql | `all\|core` |
| auth_management | 06-profiles-production.sql | `all\|core` |
| communication | 01-system-messages.sql | `all\|core` |
| communication | 02-message_participants.sql | `all\|core` |
| educational_content | 05-assignments.sql | `all\|core` |
| educational_content | 05-exercises-module4.sql | `all\|core` |
| educational_content | 06-exercises-module5.sql | `all\|core` |
| educational_content | 07-assessment-rubrics.sql | `all\|core` |
| educational_content | 08-difficulty_criteria.sql | `all\|core` |
| educational_content | 09-exercise_mechanic_mapping.sql | `all\|core` |
| gamification_system | 02-leaderboard_metadata.sql | `all\|core` |
| gamification_system | 04-achievements.sql | `all\|core` |
| gamification_system | 05-user_stats.sql | `all\|core` |
| gamification_system | 07-ml_coins_transactions.sql | `all\|core` |
| gamification_system | 08-user_achievements.sql | `all\|core` |
| gamification_system | 10-mission_templates.sql | `all\|core` |
| gamification_system | 15-comodin_usage_tracking.sql | `all\|core` |
| gamification_system | 17-shop_items_metadata_normalization.sql | `all\|core` |
| gamification_system | 20-achievements-collection.sql | `all\|core` |
| lti_integration | 01-lti_consumers.sql | `all\|core` |
| notifications | 01-notification_templates.sql | `all\|core` |
| notifications | 02-notification_preferences_defaults.sql | `all\|core` |
| social_features | 02-classrooms.sql | `all\|core` |
| social_features | 04-teams.sql | `all\|core` |
| system_configuration | 03-notification_settings_global.sql | `all\|core` |

**Nota:** Todos son scope `all|core` — se cargan en TODOS los ambientes. El contenido divergente significa que recrear PROD con `--env prod` produce datos diferentes a los de recrear DEV con `--env dev`, lo cual puede ser intencional (datos prod-appropriate) o un bug de sincronizacion.

### 1.4 Archivos Faltantes en STAGING (scope `all|core`)

| Schema | Archivo | En DEV | En PROD | En STAGING |
|--------|---------|:------:|:-------:|:----------:|
| admin_dashboard | 01-bulk_operations.sql | SI | SI | **NO** |
| admin_dashboard | 02-admin_reports.sql | SI | SI | **NO** |
| auth | 02-production-users.sql | SI | SI | **NO** |
| auth_management | 02-tenants-production.sql | SI | SI | **NO** |
| auth_management | 04-profiles-complete.sql | SI | SI | **NO** |
| auth_management | 06-profiles-production.sql | SI | SI | **NO** |
| auth_management | 07-profiles-production-additional.sql | SI | SI | **NO** |
| auth_management | 07-user_roles.sql | SI | SI | **NO** |
| auth_management | 08-assign-admin-schools.sql | SI | SI | **NO** |

### 1.5 Seeds No En Pipeline (27 archivos huerfanos)

Existen en disco pero no declarados en `seed_entries[]` de init-database.sh:

- 11 en `progress_tracking/` (04-14)
- 4 en `notifications/` (02-i18n, 03, 04, 05)
- 5 en `social_features/` (06-10)
- 2 en `lti_integration/` (02, 03)
- 2 en `audit_logging/` (01-sample, 03-pending)
- ~~2 excluidos (default-templates, moderation_rules)~~ **RESUELTO** — Re-habilitados en pipeline (SEED-HOMOLOGATION 2026-02-20)
- 1 raiz (00-dev-testing-student.sql)

---

## 2. DISCREPANCIAS DE USUARIOS

### 2.1 Matriz de Usuarios por Ambiente

| Tipo | DEV | STAGING | PROD |
|------|:---:|:-------:|:----:|
| Test (@gamilit.com) — UUID predecible | 3 | 3 | 3 |
| Demo (@demo.glit.edu.mx) — solo dev | 4 | 0 | 0 |
| Produccion (reales) — 45 estudiantes CBTis 136 | 45 | 0 | 45 |
| **TOTAL** | **52** | **3** | **48** |

### 2.2 UUIDs Predecibles en PRODUCCION

| UUID | Usuario | Rol | Riesgo |
|------|---------|-----|--------|
| `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` | admin@gamilit.com | super_admin | **CRITICO** |
| `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb` | teacher@gamilit.com | admin_teacher | ALTO |
| `cccccccc-cccc-cccc-cccc-cccccccccccc` | student@gamilit.com | student | MEDIO |

### 2.3 Tenant y Escuela (Identicos en 3 ambientes)

| Concepto | UUID | Nota |
|----------|------|------|
| Tenant unico | `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` | Referenciado por 100+ seeds |
| Escuela default | Codigo `GAMILIT-DEFAULT` | Usuarios sin escuela se asignan aqui |

### 2.4 Datos Sensibles en Repositorio

| Dato | Archivo | Riesgo |
|------|---------|--------|
| 45 emails reales de estudiantes menores | `02-production-users.sql` (dev+prod) | Violacion LFPDPPP |
| 15 nombres completos reales | `02-production-users.sql` (dev+prod) | PII expuesta |
| 45 hashes bcrypt de passwords reales | `02-production-users.sql` (dev+prod) | Ataque offline posible |
| Password `Test1234` en texto plano | `01-demo-users.sql` (3 ambientes) | Acceso trivial al admin |

---

## 3. DISCREPANCIAS DE CONFIGURACION

### 3.1 Variables Criticas Faltantes o con Placeholder

| Variable | `.env` (dev) | `.env.production` | Estado |
|----------|-------------|-------------------|--------|
| `DB_PASSWORD` | gamilit_dev_2026 | CHANGE_ME_IN_PRODUCTION | **PLACEHOLDER** |
| `JWT_SECRET` | gamilit-dev-jwt-... | CHANGE_ME_IN_PRODUCTION | **PLACEHOLDER** |
| `SESSION_SECRET` | gamilit-dev-session-... | CHANGE_ME_IN_PRODUCTION | **PLACEHOLDER** |
| `JWT_REFRESH_SECRET` | **ausente** | **ausente** | **FALTANTE** (bloquea startup) |
| `DB_POOL_MAX` | 2 | **ausente** | Default 2 (insuficiente para prod) |
| `REDIS_ENABLED` | true | **ausente** | Implicito |
| `CRON_ENABLED` | true | **ausente** | Implicito |

### 3.2 Archivos de Configuracion Frontend

| Archivo | Existe | Necesario para Prod |
|---------|--------|---------------------|
| `apps/frontend/.env` | SI | Solo dev |
| `apps/frontend/.env.example` | SI | Template |
| `apps/frontend/.env.production.example` | SI | Template |
| `apps/frontend/.env.production` | **NO** | **SI** — build Vite lo necesita |

### 3.3 CORS en Produccion

```
CORS_ORIGIN=https://74.208.126.102:3005,https://74.208.126.102,http://74.208.126.102:3005,http://74.208.126.102
```

| Origin | Protocolo | Debe estar | Razon |
|--------|-----------|:----------:|-------|
| `https://74.208.126.102:3005` | HTTPS | Dudoso | Si Nginx sirve en 443, el origin real no tiene :3005 |
| `https://74.208.126.102` | HTTPS | **SI** | Origin principal via Nginx |
| `http://74.208.126.102:3005` | HTTP | **NO** | HTTP no debe permitirse en prod |
| `http://74.208.126.102` | HTTP | **NO** | HTTP no debe permitirse en prod |

### 3.4 PM2 Ecosystem — Propiedades Invalidas/Problematicas

| Propiedad | Valor | Problema |
|-----------|-------|----------|
| `env_file` | `.env.production` | **No es propiedad valida de PM2** — ignorada silenciosamente |
| `wait_ready` | true | `process.send('ready')` **nunca se llama** en main.ts |
| script frontend | `npx vite preview` | **No apto para produccion** (Vite docs) |

### 3.5 Puertos (100% Consistente)

| Puerto | Servicio | Archivos verificados | Estado |
|--------|----------|:--------------------:|--------|
| 3005 | Frontend | 9 | OK |
| 3006 | Backend | 13 | OK |
| 5432 | PostgreSQL | 6 | OK |
| 6379 | Redis | 6 | OK |

### 3.6 Credenciales Tracked en Git

| Archivo | Credencial | En Git |
|---------|-----------|:------:|
| `database-master.sh:41` | `SUDO_PASS_DEV="2320"` | **SI** |
| `.env.database` | `DB_PASSWORD=gamilit_dev_2026` | **SI** |
| `.env.dev` (database) | `DB_PASSWORD=gamilit_dev_2026` | **SI** |
| `database-master.sh:40` | `DB_PORT="5433"` (incorrecto para prod) | **SI** |

---

## 4. DISCREPANCIAS DE SEGURIDAD (RLS)

### 4.1 Estado RLS

| Metrica | DDL Source | Runtime | Efectivo |
|---------|:---------:|:-------:|:--------:|
| Policies | 231 | 467 | **0** (BYPASSRLS) |
| Tablas con RLS ENABLE | 104 | 104 | **0** |
| Tablas con FORCE RLS | 13 | 13 | **0** |
| SET LOCAL user_id | - | - | 4 de 904 endpoints |
| SET LOCAL tenant_id | - | - | **0** de 904 endpoints |

### 4.2 Interceptor vs Realidad

| Aspecto | Esperado | Actual |
|---------|----------|--------|
| RlsInterceptor | Ejecuta SET LOCAL en DB connection | Solo adjunta metadata al request |
| getDataSource() | Retorna DataSource para SET LOCAL | Retorna `null` (TODO) |
| rlsContext | Leido por servicios para seguridad | **Nunca leido** por ningun servicio |

---

## 5. DISCREPANCIAS DE DEPLOY PIPELINE

### 5.1 CI/CD Branch Mismatch

| Workflow | Branch Configurada | Branch Real | Match |
|----------|-------------------|-------------|:-----:|
| backend-ci.yml | master | master | OK |
| frontend-ci.yml | master | master | OK |
| deploy-production.yml | **main** | master | **NO** |
| validate-constants.yml | **main/develop** | master | **NO** |
| validate-api-routes.yml | master/main/develop | master | OK |

### 5.2 Scripts de Deploy Duplicados

| Script | Ubicacion | Tipo |
|--------|-----------|------|
| deploy-production.sh | `apps/devops/scripts/` | Principal (documentado) |
| deploy-production.sh | `scripts/` | Legacy/Duplicado |
| update-production.sh | `scripts/` | Alternativo (recrea BD) |
| deploy.sh | `apps/devops/scripts/` | Generico |
| PM2 deploy | `ecosystem.config.js` | Configurado, no documentado |

### 5.3 Health Check

| Aspecto | Configurado | Correcto |
|---------|-------------|----------|
| URL | `/api/health` | `/api/v1/health` |
| Swagger check | `/api/v1/docs` | Deshabilitado en prod |
| Readiness | No usado | `/api/v1/health/ready` disponible |
| Frontend check | No existe | Deberia verificar acceso a / |

### 5.4 Validacion BD — Thresholds vs Realidad

| Metrica | Threshold (prod.conf) | Valor Real | Cobertura |
|---------|:---------------------:|:----------:|:---------:|
| Schemas | 9 | 18 | 50% |
| Tablas | 64 | 169 | **38%** |
| Funciones | 60 | 183 | **33%** |
| Triggers | 50 | 67 | 75% |
| RLS Policies | 200 | 467 | 43% |

---

*Documento de discrepancias — TASK-2026-02-19-ANALISIS-DEPLOY-PROD*
