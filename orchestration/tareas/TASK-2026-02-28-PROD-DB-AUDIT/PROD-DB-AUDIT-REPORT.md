---
title: "Auditoría BD Producción vs Desarrollo — Reporte Final"
task: "TASK-2026-02-28-PROD-DB-AUDIT"
agent: "SA-7A"
date: "2026-02-28"
version: "1.0.0"
status: "FINAL"
phases: 7
subagents: 15
---

# Auditoría BD Producción vs Desarrollo — Reporte Final

**Fecha:** 2026-02-28
**Servidor:** 74.208.126.102 (usuario: isem)
**Base de datos:** gamilit_platform (PostgreSQL 16.11)
**Backup analizado:** `apps/database/backups/gamilit_platform_20260228_210825.sql` (5.1 MB, 64,572 líneas)

---

## Resumen Ejecutivo

Esta auditoría fue realizada por **15 subagentes en 7 fases** tras el reporte de que el servidor de producción "dejó de funcionar" el 28 de febrero de 2026, aproximadamente a las 21:00 UTC.

### Conclusión Principal

**La base de datos está estructuralmente alineada con el DDL fuente de verdad. El problema NO fue corrupción de datos ni discrepancia de esquema.**

La causa más probable del incidente es **agotamiento de reintentos de PM2** (80% de confianza):

1. Se aplicó DDL en producción (3 nuevas tablas del feature `resource_sharing`), causando que PostgreSQL estuviera temporalmente no disponible por ~8 minutos (21:00:50 – 21:08:25).
2. El budget de reintentos de TypeORM (5 intentos × 5 segundos = 25 segundos) se agotó mucho antes de que PostgreSQL recuperara disponibilidad.
3. El proceso NestJS crasheó de forma repetida. PM2 (`max_restarts: 10`) agotó sus 10 reintentos en aproximadamente 5 minutos, marcando el proceso como "errored" y deteniendo el auto-restart.
4. Cuando PostgreSQL se recuperó (~21:08:25), PM2 ya no intentó reiniciar el backend automáticamente. El servicio permaneció caído hasta que alguien ejecutara `pm2 restart` manualmente.

### Issues Encontrados

**17 issues totales:** 2 CRITICAL, 4 HIGH, 7 MEDIUM, 4 LOW (ajustados después de validación Phase 6)

| Severidad | Cantidad | Descripción General |
|-----------|----------|---------------------|
| CRITICAL | 2 | Configuración de producción (placeholders, Redis) |
| HIGH | 4 | Seguridad RLS + mismatches entidad-DDL |
| MEDIUM | 7 | Triggers faltantes, índices, documentación, pool |
| LOW | 4 | Consistencia DDL, naming, backup scripts |

---

## Metodología

### Estructura de Fases

| Fase | Agentes | Actividad |
|------|---------|-----------|
| Phase 1 (Extracción) | SA-1A, SA-1B, SA-1C, SA-1D, SA-1E | Catálogo del backup, catálogo DDL, drift Feb21→Feb28, auditoría de config, análisis de backups fallidos |
| Phase 2 (Diffs Profundos) | SA-2A, SA-2B, SA-2C | Diff columna-por-columna, funciones/triggers/ENUMs, RLS/índices/vistas |
| Phase 3 (Alineación Entidades) | SA-3A, SA-3B | Alineación TypeORM vs DDL vs backup, auditoría de datasources |
| Phase 4 (Seeds) | SA-4A | Análisis de datos semilla vs datos en backup |
| Phase 5 (Síntesis) | SA-5A (Opus) | Síntesis de causa raíz cross-phase |
| Phase 6 (Validación) | SA-6A | Validación independiente — corrigió 4 hallazgos |
| Phase 7 (Documentación) | SA-7A | Este reporte final + playbook |

### Fuentes de Verdad

- **Production backup:** `apps/database/backups/gamilit_platform_20260228_210825.sql`
- **DDL source of truth:** `apps/database/ddl/schemas/`
- **Backend entities:** `apps/backend/src/modules/*/entities/*.entity.ts`
- **Configuration:** `ecosystem.config.js`, `apps/backend/src/config/database.config.ts`, `apps/backend/.env.production.example`

---

## Hallazgos por Categoría

### Estructura de Tablas

| Métrica | DDL | Producción | Delta | Estado |
|---------|-----|-----------|-------|--------|
| Tablas totales | 173 | 173 | 0 | MATCH |
| Columnas con diferencia | — | — | 0 | MATCH |
| Tablas con mismatches de columna | — | — | 0 | MATCH |

**Resultado: ALINEACIÓN PERFECTA.** Las 173 tablas en producción coinciden con el DDL fuente de verdad. No hay tablas faltantes, extra, ni diferencias de columnas.

**Corrección Phase 6:** SA-1B reportó inicialmente 174 tablas DDL vs 173 en backup. SA-2A corrigió esto como falso positivo: el schema `communication` tiene 4 tablas (no 5). SA-1B contó incorrectamente `conversation_participants.sql` que define 2 tablas en un solo archivo.

**Drift Feb 21 → Feb 28:** Se adicionaron 3 tablas intencionales (feature `resource_sharing`):
- `educational_content.resource_comments`
- `educational_content.resource_downloads`
- `educational_content.resource_ratings`

Junto con 2 triggers, 13 políticas RLS y 11 índices adicionales. Todos los cambios son intencionales y bien estructurados.

---

### ENUMs

| Métrica | DDL | Producción | Delta | Estado |
|---------|-----|-----------|-------|--------|
| ENUMs totales | 42 | 42 | 0 | MATCH |
| Valores verificados | Todos | Todos | 0 | MATCH |

**Todos los 42 ENUMs coinciden valor por valor** entre DDL y backup de producción.

**CORRECCIÓN CRÍTICA (Phase 6 — P1-001 CERRADO):** SA-5A reportó inicialmente que el `ExerciseTypeEnum` TypeScript tenía 31 valores vs 33 en la BD, identificando `diario_interactivo` y `resumen_visual` como faltantes. SA-6A **refutó completamente este hallazgo**:

- El enum TypeScript tiene **33 valores** (conteo verificado líneas 489–532 de `enums.constants.ts`)
- El DDL y la BD también tienen **33 valores**
- Ni `diario_interactivo` ni `resumen_visual` existen en el backup de producción (grep = 0 hits)
- El comentario histórico "REMOVIDO 2025-11-11" describe una limpieza que sincronizó TS con DDL

**Estado actual:** TS y DB están perfectamente alineados en los 33 valores de `exercise_type`. No se requiere acción.

---

### Funciones y Triggers

| Métrica | DDL | Producción | Delta | Estado |
|---------|-----|-----------|-------|--------|
| Funciones | 185 | 185 | 0 | MATCH |
| Triggers en producción | 72 | 72 | 0 | MATCH |
| Triggers definidos en DDL | ~120 | — | ~48 pendientes | VER ABAJO |

**185/185 funciones coinciden perfectamente** entre DDL y producción. Ninguna función extra o faltante.

**72/72 triggers activos en producción** tienen definición DDL correspondiente. Ningún trigger no autorizado en producción.

**48 triggers `updated_at` definidos en DDL pero ausentes de producción:** Todos son triggers de mantenimiento de timestamp `updated_at`. Afectan tablas como `parent_accounts`, `shop_items`, `learning_paths`, `manual_reviews` y 44 más. Ninguno es lógica de negocio. Severidad: LOW. Las tablas afectadas simplemente no actualizan `updated_at` automáticamente; la app debe setearlo explícitamente.

---

### RLS y Seguridad

| Métrica | DDL | Producción | Delta | Estado |
|---------|-----|-----------|-------|--------|
| Políticas RLS (CREATE POLICY) | ~483 efectivas | 483 | 0 | MATCH |
| Tablas con RLS habilitado | ~132 | 132 | 0 | MATCH |
| Tablas con FORCE RLS | 38 | 30 | -8 | DISCREPANCIA |

**483/483 políticas RLS coinciden.** La discrepancia documentada inicialmente (MASTER_INVENTORY: 251 vs backup: 483) fue un error de conteo en la documentación — el DDL contiene efectivamente ~483 políticas activas.

**FORCE RLS: 8 tablas faltantes (corregido de 6 en Phase 5).**

SA-6A identificó las 8 tablas con `FORCE ROW LEVEL SECURITY` en DDL pero ausentes del backup de producción. Todas están en `apps/database/ddl/07d-rls-policies-pending-tables.sql` que no fue aplicado en producción:

| # | Tabla | Riesgo |
|---|-------|--------|
| 1 | `auth_management.two_factor_tokens` | CRÍTICO (secretos 2FA) |
| 2 | `gamification_system.user_purchases` | ALTO |
| 3 | `progress_tracking.user_learning_paths` | ALTO |
| 4 | `progress_tracking.engagement_metrics` | ALTO |
| 5 | `progress_tracking.progress_snapshots` | ALTO |
| 6 | `social_features.guild_join_requests` | MEDIO |
| 7 | `progress_tracking.user_difficulty_progresses` | MEDIO |
| 8 | `system_configuration.rate_limits` | BAJO |

**BYPASSRLS:** No verificable desde el backup (pg_dump no exporta atributos de rol). Se requiere consulta directa: `SELECT rolname, rolbypassrls FROM pg_roles WHERE rolname = 'gamilit_user';`

---

### Índices y Vistas

| Métrica | DDL | Producción | Delta | Estado |
|---------|-----|-----------|-------|--------|
| Vistas regulares | 22 | 22 | 0 | MATCH |
| Vistas materializadas | 7 | 7 | 0 | MATCH |
| Índices totales | ~982 | 967 | -15 | ACEPTABLE |

**22+7 vistas coinciden perfectamente.**

**~15 índices de optimización faltantes:** No son unique constraints ni primary keys, sino índices adicionales de rendimiento. Sin impacto funcional. Aplicables en ventana de mantenimiento.

---

### Alineación Entidad-Tabla

| Métrica | Valor |
|---------|-------|
| Archivos de entity verificados | 156 (157 clases) |
| Entidades alineadas | ~155 |
| Mismatches críticos | 0 |
| Mismatches HIGH | 2 confirmados |
| Datasources activos | 11 (+ 1 condicional) |
| Cobertura de entidades | 173/174 (99.4%) |

**ExerciseTypeEnum:** VALIDADO (33/33 valores, ver corrección arriba).

**Mismatches confirmados:**

1. **ShopItem.icon:** DDL default `'package'` → Entity default `'gift'`. Items creados vía ORM vs SQL directo tendrán iconos distintos. (Severidad: HIGH)

2. **auth.users.phone:** DDL `varchar(15)` → Entity `text` (sin límite). Si un número de teléfono >15 chars llega al backend, PostgreSQL rechazará con error 500. (Severidad: HIGH)

**Datasource 'communication' (Finding F-001):** El glob pattern `message*.entity{.ts,.js}` podría no capturar `message.entity.ts`. Requiere verificación en runtime. Si falla, añadir path explícito en `app.module.ts` línea ~383.

---

### Configuración

| Componente | Estado | Detalle |
|-----------|--------|---------|
| .env.production.example | CRÍTICO | 8 valores placeholder `<...>` confirmados |
| PM2 max_restarts | 10 | Corregido de "~15" en síntesis |
| PM2 min_uptime | 10s | Confirmado |
| TypeORM retry budget | 25s | 5 intentos × 5s delay |
| DB_POOL_MAX default | 2/datasource | 22 conexiones totales (11 DS × 2) |
| DB_SYNCHRONIZE | false | Correcto — no auto-sync en producción |

**Placeholders en `.env.production.example`:**

| Línea | Variable | Placeholder |
|-------|----------|-------------|
| 25 | DB_PASSWORD | `<PASSWORD_SEGURO_AQUI>` |
| 32 | JWT_SECRET | `<GENERAR_SECRET_SEGURO_AQUI>` |
| 70 | SESSION_SECRET | `<GENERAR_SECRET_SEGURO_AQUI>` |
| 101 | VAPID_PUBLIC_KEY | `<GENERAR_CON_WEB_PUSH_GENERATE_VAPID_KEYS>` |
| 102 | VAPID_PRIVATE_KEY | `<GENERAR_CON_WEB_PUSH_GENERATE_VAPID_KEYS>` |
| 126 | TWILIO_ACCOUNT_SID | `<OBTENER_DE_TWILIO_CONSOLE>` |
| 127 | TWILIO_AUTH_TOKEN | `<OBTENER_DE_TWILIO_CONSOLE>` |
| 142 | REDIS_PASSWORD | `<REDIS_PASSWORD_IF_REQUIRED>` |

Si `.env.production` fue copiado de este template sin reemplazar valores, el backend no puede arrancar (`main.ts` líneas 159-184 valida JWT_SECRET ≥32 chars, DB_PASSWORD ≥8 chars).

---

### Integridad de Datos

| Tabla | Filas | Estado |
|-------|-------|--------|
| auth.users | 57 | Verificado |
| auth_management.profiles | 57 | 1:1 con users — CORRECTO |
| gamification_system.user_stats | 57 | 1:1 con profiles — Trigger funcionando |
| gamification_system.maya_ranks | 5 | MATCH con seeds |
| educational_content.modules | 5 | MATCH con seeds |
| system_configuration.feature_flags | 27 | MATCH con seeds |
| system_configuration.gamification_parameters | 38 | MATCH con seeds |
| gamification_system.mission_templates | 28 | MATCH con seeds |

**Composición de los 57 usuarios:**
- 1 × system@gamilit.com (super_admin)
- 1 × admin@gamilit.com (super_admin)
- 1 × teacher@gamilit.com (admin_teacher)
- 2 × devs/owners (student role)
- **52 × estudiantes reales** registrados Nov 2025 – Feb 2026

**Integridad: LIMPIA.** No hay pérdida de datos, ni corrupción, ni discrepancias en relaciones 1:1.

---

## Inventario de Issues (Tabla Completa)

| ID | Severidad | Descripción | Capa | Estado | Complejidad Fix |
|----|-----------|-------------|------|--------|-----------------|
| P0-001 | CRITICAL | PostgreSQL no disponible ~8 min (21:00-21:08) — causa directa del incidente | BD/DevOps | CONFIRMADO | Moderada (logs del servidor) |
| P0-002 | CRITICAL | `.env.production.example` con 8 placeholders — riesgo si fue copiado | Config | CONFIRMADO | Trivial |
| P0-003 | CRITICAL | Estado de Redis en producción desconocido | Config | POSIBLE | Simple |
| P1-001 | HIGH | ~~ExerciseTypeEnum 31 vs 33~~ | Backend | **REFUTADO (Phase 6)** | N/A |
| P1-002 | HIGH | 8 tablas sin FORCE RLS (incl. two_factor_tokens) | BD/Seguridad | CONFIRMADO | Simple |
| P1-003 | HIGH | ShopItem.icon: DDL='package' vs Entity='gift' | Backend/BD | CONFIRMADO | Trivial |
| P1-004 | HIGH | phone: DDL=varchar(15) vs Entity=text | Backend/BD | CONFIRMADO | Trivial |
| P2-001 | MEDIUM | 48 triggers `updated_at` no aplicados a producción | BD | CONFIRMADO | Simple |
| P2-002 | MEDIUM | ~15 índices de optimización no aplicados | BD | CONFIRMADO | Simple |
| P2-003 | MEDIUM | MASTER_INVENTORY con métricas desactualizadas | Docs | CONFIRMADO | Trivial |
| P2-004 | MEDIUM | BYPASSRLS de gamilit_user no verificable desde backup | BD/Seguridad | POSIBLE | Simple |
| P2-005 | MEDIUM | DB_USER vs DB_USERNAME — dos variables para mismo valor | Config | POSIBLE | Simple |
| P2-006 | MEDIUM | DB_POOL_MAX=2 conservador para producción | Config | CONFIRMADO | Trivial |
| P2-007 | MEDIUM | Nombres de rangos maya incorrectos en ~21 archivos de docs/seeds | Docs | CONFIRMADO (target corregido) | Moderada |
| P3-001 | LOW | ~90 archivos DDL sin cláusula OWNER TO explícita | BD/DDL | CONFIRMADO | Moderada |
| P3-002 | LOW | DB_SCHEMAS.AUTH naming counterintuitivo | Backend/Docs | CONFIRMADO | Moderada |
| P3-003 | LOW | Scripts de backup suprimen stderr (`2>/dev/null`) | DevOps | CONFIRMADO | Simple |

**Totales:** 2 CRITICAL + 4 HIGH + 7 MEDIUM + 4 LOW = **17 issues** (P1-001 cerrado como FALSE POSITIVE)

---

## Análisis de Causa Raíz

### Hipótesis Rankeadas por Probabilidad

| Hipótesis | Probabilidad | Descripción |
|-----------|-------------|-------------|
| G: PM2 restart exhaustion | **80%** | Causa más probable (PRIMARIA) |
| D: DDL sin restart de PM2 | — | Factor contribuyente a G |
| A: .env.production con placeholders | 15% | No descartable sin acceso SSH |
| B: Redis no funcionando | 10% | Degradación pero no caída total |
| C: BD recreada incorrectamente | 5% | DESCARTADA por evidencia fuerte |
| E: TypeORM entity scan failure | <2% | DESCARTADA (P1-001 refutado) |
| F: Nginx/SSL/CORS blocking | 10% | No diagnosticable desde backup |
| H: Connection pool exhaustion | <5% | DESCARTADA (22 conexiones << 100 límite) |

### Reconstrucción del Timeline

```
~20:55  DDL maintenance iniciado en prod — aplicando resource_sharing feature
21:00:50  Backup attempt #1 → 0 bytes (PostgreSQL NO DISPONIBLE)
21:00-21:07  Backend NestJS pierde conexiones. TypeORM agota retry budget en 25s.
            Proceso crashea. PM2 auto-restart. Cada ciclo dura ~30s.
            PM2 agota 10 reintentos en ~5 minutos → proceso marcado "errored"
21:07:16  Backup attempt #2 → 0 bytes (PostgreSQL todavía NO DISPONIBLE)
~21:08  DDL application completa. PostgreSQL acepta conexiones.
21:08:25  Backup attempt #3 → 5.1MB SQL + 3.1MB dump (EXITOSO)
Post 21:08:25  PostgreSQL disponible, pero PM2 no auto-reinicia (ya en "errored").
            Frontend sirve la SPA estática. API calls a puerto 3006 fallan.
            Nginx devuelve 502. Users ven UI cargada pero sin datos.
```

### Por Qué Esta Narrativa Es Consistente

- **BD estructuralmente perfecta** (0 discrepancias de columnas) — descarta corrupción
- **Datos intactos** (57 users, todos los seeds presentes) — descarta pérdida de datos
- **Drift intencional** (SA-1C: +3 tablas resource_sharing) — descarta DDL accidental
- **Patrón de backup fallido** (0-byte, 0-byte, éxito) — confirma PostgreSQL temporalmente down
- **8 minutos > 25 segundos** (TypeORM retry budget agotado) — confirma crash del backend
- **max_restarts = 10** (corregido por SA-6A) — agotamiento PM2 aún más rápido de lo estimado
- **Instancia única fork mode** — sin redundancia para absorber el incidente

---

## Métricas Corregidas (Post-Auditoría)

Las siguientes métricas en `MASTER_INVENTORY.yml` requieren actualización:

| Métrica | Valor Actual (INCORRECTO) | Valor Correcto |
|---------|--------------------------|----------------|
| `funciones` | 158 | **185** |
| `triggers` | 68 | **72** (en prod) / ~120 (en DDL) |
| `rls_policies` | 251 | **483** |
| `vistas_regulares` | 18 | **22** |
| PM2 max_restarts | N/A | **10** (no ~15 como asumía la síntesis) |
| FORCE RLS faltantes | "6 tablas" | **8 tablas** |

---

## Archivos Generados en Esta Auditoría

Todos los archivos se encuentran en `orchestration/tareas/TASK-2026-02-28-PROD-DB-AUDIT/`:

| Archivo | Fase | Contenido |
|---------|------|-----------|
| SA-1A-BACKUP-CATALOG.md | Phase 1 | Catálogo completo del backup de producción |
| SA-1B-DDL-CATALOG.md | Phase 1 | Catálogo completo del DDL fuente de verdad |
| SA-1C-DRIFT-REPORT.md | Phase 1 | Análisis de drift Feb 21 → Feb 28 |
| SA-1D-CONFIG-AUDIT.md | Phase 1 | Auditoría de configuración (.env, PM2, pool) |
| SA-1E-BACKUP-ANALYSIS.md | Phase 1 | Análisis de los 2 backups fallidos de 0 bytes |
| SA-2A-TABLE-DIFF.md | Phase 2 | Diff columna-por-columna (173 tablas) |
| SA-2B-FUNC-TRIGGER-ENUM-DIFF.md | Phase 2 | Diff funciones, triggers y ENUMs |
| SA-2C-RLS-INDEX-VIEW-DIFF.md | Phase 2 | Diff RLS, índices y vistas |
| SA-3A-ENTITY-ALIGNMENT.md | Phase 3 | Alineación TypeORM entities vs DDL vs backup |
| SA-3B-DATASOURCE-AUDIT.md | Phase 3 | Auditoría de 11+1 datasources TypeORM |
| SA-4A-SEED-DATA-ANALYSIS.md | Phase 4 | Análisis de datos semilla (76 archivos SQL) |
| ROOT-CAUSE-SYNTHESIS.md | Phase 5 | Síntesis de causa raíz (SA-5A, Opus) |
| SA-6A-VALIDATION-REPORT.md | Phase 6 | Validación independiente — 4 correcciones |
| PROD-DB-AUDIT-REPORT.md | Phase 7 | **Este reporte final** |
| REMEDIATION-PLAYBOOK.md | Phase 7 | **Playbook de remediación paso a paso** |

---

*Reporte generado por SA-7A | TASK-2026-02-28-PROD-DB-AUDIT | 2026-02-28*
*Cross-referencing: 13 reportes de subagentes + validación independiente Phase 6*
