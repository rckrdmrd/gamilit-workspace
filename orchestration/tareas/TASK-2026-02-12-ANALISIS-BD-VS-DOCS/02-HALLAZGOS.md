# Hallazgos del Analisis BD vs Documentacion

**Version:** 1.0.0
**Fecha:** 2026-02-12

---

## 1. BASELINE REAL VERIFICADO (DDL Fisico)

### 1.1 Conteos Reales por Tipo de Objeto

| Objeto | DDL Real | CLAUDE.md | DB_INVENTORY | MODELO-DATOS | database.config |
|--------|----------|-----------|--------------|--------------|-----------------|
| **Schemas** | **18** (16+2) | 18 | 18 | 18 | 18 |
| **Tablas** | **171** | 170 | 170 | 171 | 171 |
| **Views** | **22** | 22 | 22 | 13 | 13 |
| **Mat. Views** | **7** | 7 | 7 | 7 | 7 |
| **Funciones** | **183** | 255 | 255 | 128 | 128 |
| **Triggers** | **126** | 132 | 132 | 49 | 49 |
| **ENUMs** | **42** | 41 | 41 | 36 | 36 |
| **RLS Policies** | **~263** | 263 | 263 | 282 | 282 |
| **FK Constraints** | **298** | 273 | 273 | 299 | 299 |
| **Indexes** | **978** | 23 (files) | 23 (files) | N/A | N/A |
| **PostgreSQL** | **15** | 15 | 15 | **16** (error) | 15 |

### 1.2 Conteo de Tablas por Schema Fisico

| # | Schema Fisico | Archivos | Tablas Reales | Notas |
|---|--------------|----------|---------------|-------|
| 1 | auth | 1 | 1 | Solo auth.users |
| 2 | auth_management | 17 | 17 | Core: perfiles, roles, tenants, parents |
| 3 | educational_content | 21 | 21 | Incluye _cross_schema/classroom_modules |
| 4 | gamification_system | 21 | 21 | XP, ranks, achievements, store, missions |
| 5 | progress_tracking | 21 | 21 | Progreso, intentos, learning paths |
| 6 | social_features | 29 | 30 | guild_missions.sql tiene 2 tablas |
| 7 | notifications | 7 | 7 | Multi-canal completo |
| 8 | content_management | 10 | 10 | Templates, media, moderacion |
| 9 | system_configuration | 9 | 9 | Settings, feature flags |
| 10 | audit_logging | 7 | 7 | Auditoria y logs |
| 11 | admin_dashboard | 4 | 4 | Bulk ops, reportes, metricas |
| 12 | data_warehouse | 16 | 16 | Star schema: dim_* + fact_* |
| 13 | communication | 3 | 4 | conversation_participants.sql tiene 2 tablas |
| 14 | lti_integration | 3 | 3 | LTI 1.3 |
| 15 | gamilit | 0 | 0 | Solo funciones utilitarias |
| 16 | optimization | 0 | 0 | Solo indexes |
| 17 | public | 0 | 0 | Vacio (legacy) |
| 18 | storage | 0 | 0 | Vacio (placeholder) |
| | **TOTAL** | **169 files** | **171 tablas** | 3 archivos multi-tabla |

### 1.3 Desglose de Funciones (183 total)

| Ubicacion | Conteo |
|-----------|--------|
| Archivos dedicados en `/functions/` | 144 |
| Inline en archivos de tablas | 36 |
| Inline en archivos de triggers | 6 |
| Inline en archivos de views | 1 |
| Deduplicados (prerequisites) | -4 |
| **TOTAL** | **183** |

### 1.4 Desglose de Triggers (126 total)

| Ubicacion | Conteo |
|-----------|--------|
| Batch files (00-batch_updated_at) | 30 |
| Archivos individuales de triggers | 32 |
| Inline en archivos de tablas/funciones | 64 |
| **TOTAL** | **126** |

---

## 2. DISCREPANCIAS RESUELTAS

### D-001: Tablas (170 vs 171)
- **CLAUDE.md dice:** 170 | **MODELO-DATOS dice:** 171
- **Real:** **171**
- **Causa:** CLAUDE.md perdio 1 tabla multi-archivo (communication/conversation_participants.sql crea 2 tablas)
- **Accion:** Corregir CLAUDE.md y DATABASE_INVENTORY.yml a 171

### D-002: Funciones (128 vs 255)
- **MODELO-DATOS dice:** 128 | **CLAUDE.md/INVENTORY dice:** 255
- **Real:** **183**
- **Causa:** 128 = conteo de archivos de funciones (~114 archivos). 255 = numero inflado (posiblemente incluye funciones de runtime/seeds)
- **Accion:** Corregir TODAS las fuentes a 183

### D-003: Triggers (49 vs 132)
- **MODELO-DATOS dice:** 49 | **CLAUDE.md/INVENTORY dice:** 132
- **Real:** **126**
- **Causa:** 49 = solo triggers en archivos individuales (sin batch ni inline). 132 = ligeramente inflado de version anterior de DDL
- **Accion:** Corregir TODAS las fuentes a 126

### D-004: Views (13 vs 22)
- **MODELO-DATOS dice:** 13 | **CLAUDE.md/INVENTORY dice:** 22
- **Real:** **22** (16 en archivos dedicados + 6 inline en tablas/funciones)
- **Causa:** MODELO-DATOS solo contaba vistas en archivos dedicados y faltaban las inline
- **Accion:** Corregir MODELO-DATOS y database.config a 22

### D-005: ENUMs (36 vs 41)
- **MODELO-DATOS dice:** 36 | **CLAUDE.md/INVENTORY dice:** 41
- **Real:** **42**
- **Causa:** 36 = archivos en directorios enum (~37 archivos). 41 = falta 1 enum inline
- **Desglose:** 38 en archivos dedicados + 2 solo en prerequisites + 2 inline en tablas
- **Accion:** Corregir TODAS las fuentes a 42

### D-006: RLS Policies (263 vs 282)
- **CLAUDE.md/INVENTORY dice:** 263 | **MODELO-DATOS dice:** 282
- **Real:** **~263 unicas activas** (541 CREATE POLICY totales con solapamiento)
- **Causa:** 282 fue un conteo intermedio. 263 es el conteo de policies unicas que sobreviven tras la carga completa
- **Accion:** Mantener 263 en CLAUDE.md/INVENTORY, corregir MODELO-DATOS a 263

### D-007: FK Constraints (273 vs 299)
- **CLAUDE.md/INVENTORY dice:** 273 | **MODELO-DATOS dice:** 299
- **Real:** **298** (297 inline REFERENCES + 1 deferred FK)
- **Causa:** 273 = conteo obsoleto (antes de guilds, challenges, reports). 299 = off-by-1
- **Accion:** Corregir TODAS las fuentes a 298

### D-008: PostgreSQL Version (15 vs 16)
- **CLAUDE.md/INVENTORY/database.config.yml dice:** 15
- **MODELO-DATOS.md (linea 439) dice:** 16
- **Real:** **PostgreSQL 15**
- **Causa:** Error tipografico en MODELO-DATOS.md linea 439
- **Nota:** `database-master.sh` y `force-recreate-all.sh` mencionan "PostgreSQL 16 puerto 5433" pero estos son scripts alternativos para un sistema con PG16 paralelo. La configuracion oficial es PG 15 en puerto 5432.
- **Accion:** Corregir MODELO-DATOS.md linea 439

### D-009: Schemas Conceptuales vs Fisicos
- **Documentacion usa:** 16 schemas conceptuales (auth, tenants, education, gamification, social, classrooms, analytics, reports, notifications, store, missions, leaderboard, content, parents, settings, audit)
- **DDL usa:** 18 schemas fisicos (auth, auth_management, educational_content, gamification_system, social_features, progress_tracking, notifications, content_management, system_configuration, audit_logging, admin_dashboard, data_warehouse, communication, lti_integration, gamilit, optimization, public, storage)
- **Mapeo:** 1 conceptual -> N fisicos (ver tabla completa en seccion 3)
- **Accion:** Crear documento de mapeo explicito, actualizar schema-reference

### D-010: Cobertura de Documentacion
- **Tablas documentadas en schema-reference:** 82 de 171 = **48%**
- **15 tablas documentadas pero inexistentes** en DDL (conceptuales)
- **84+ tablas en DDL sin documentar** en schema-reference
- **4 schemas fisicos sin documentacion:** data_warehouse, admin_dashboard, communication, gamilit
- **Accion:** Actualizar schema-reference para reflejar realidad del DDL

---

## 3. MAPEO DE SCHEMAS: FISICO vs CONCEPTUAL

| Schema Conceptual (Docs) | Schema(s) Fisico(s) DDL | Tipo Mapeo |
|--------------------------|------------------------|------------|
| auth | auth + auth_management (parcial) | ONE-TO-MANY |
| tenants | auth_management (parcial) | MERGED |
| education | educational_content + progress_tracking (parcial) | ONE-TO-MANY |
| gamification | gamification_system (parcial) | PARTIAL |
| social | social_features (parcial) + communication | ONE-TO-MANY |
| classrooms | social_features (parcial) | MERGED |
| analytics | data_warehouse + admin_dashboard (parcial) | ONE-TO-MANY |
| reports | admin_dashboard (parcial) + social_features (parcial) | SCATTERED |
| notifications | notifications | APPROXIMATE 1:1 |
| store | gamification_system (parcial) | MERGED |
| missions | gamification_system (parcial) | MERGED |
| leaderboard | gamification_system (parcial) | MERGED |
| content | content_management | APPROXIMATE 1:1 |
| parents | auth_management (parcial) | MERGED |
| settings | system_configuration | APPROXIMATE 1:1 |
| audit | audit_logging | APPROXIMATE 1:1 |
| integrations (placeholder) | lti_integration (3 tablas activas!) | PLACEHOLDER vs ACTIVE |
| billing (placeholder) | (ninguno) | TRUE PLACEHOLDER |

### Schemas Fisicos SIN Representacion en Docs:
- **data_warehouse** (16 tablas) - No documentado
- **admin_dashboard** (4 tablas + 7 views) - No documentado
- **communication** (4 tablas) - No documentado
- **gamilit** (30 funciones + 1 view) - No documentado
- **optimization** (indexes/triggers) - No documentado

---

## 4. COHERENCIA ENTITY-DDL

### 4.1 Resumen

| Metrica | Valor |
|---------|-------|
| Entities backend | 152 |
| Tablas DDL | 171 |
| Tablas CON entity | ~149 (87%) |
| Tablas SIN entity | ~22 (13%) |
| Entities SIN tabla DDL | 0 (100% cobertura) |

### 4.2 Gap: Tablas sin Entity (22)

| Categoria | Conteo | Justificacion |
|-----------|--------|---------------|
| Data Warehouse (star schema) | 16 | Intencional: acceso via SQL raw + MVs |
| Infraestructura (auth.users Supabase) | 1 | Gestionado externamente |
| Catalogo/Infrastructure | 5 | Covered by related entities o tablas semilla |
| **TOTAL** | **22** | Ningun gap critico |

### 4.3 Alineacion de Columnas (Top 20 Tablas Criticas)

| Resultado | Conteo | Porcentaje |
|-----------|--------|------------|
| EXACT MATCH | 16 | 80% |
| MISMATCH | 4 | 20% |

**Mismatches detectados:**

| Tabla | Columna Faltante | Severidad | Descripcion |
|-------|-----------------|-----------|-------------|
| auth_management.profiles | `deleted_at` | **HIGH** | Soft-delete no implementado (77 FKs apuntan a esta tabla) |
| auth_management.tenants | `deleted_at` | **HIGH** | Soft-delete no implementado (29 FKs apuntan a esta tabla) |
| gamification_system.ml_coins_transactions | `tenant_id` | MEDIUM | Multi-tenancy FK no expuesta en entity |
| notifications.notifications | `updated_at` | LOW | Trigger DB actualiza pero entity no mapea |

### 4.4 Inconsistencias de Estilo

- `user-suspension.entity.ts` usa schema hardcoded `'auth_management'` en vez de `DB_SCHEMAS.AUTH`
- `user-preferences.entity.ts` usa schema hardcoded `'auth_management'` en vez de `DB_SCHEMAS.AUTH`

---

## 5. DOCUMENTACION A PURGAR/ACTUALIZAR

### 5.1 Archivos con Metricas Incorrectas (ACTUALIZAR)

| Archivo | Campo | Actual | Correcto |
|---------|-------|--------|----------|
| CLAUDE.md | tablas | 170 | 171 |
| CLAUDE.md | funciones | 255 | 183 |
| CLAUDE.md | triggers | 132 | 126 |
| CLAUDE.md | enums | 41 | 42 |
| CLAUDE.md | foreign_keys | 273 | 298 |
| DATABASE_INVENTORY.yml | tablas | 170 | 171 |
| DATABASE_INVENTORY.yml | funciones | 255 | 183 |
| DATABASE_INVENTORY.yml | triggers | 132 | 126 |
| DATABASE_INVENTORY.yml | enums | 41 | 42 |
| DATABASE_INVENTORY.yml | foreign_keys | 273 | 298 |
| MASTER_INVENTORY.yml | tablas | 170 | 171 |
| MASTER_INVENTORY.yml | funciones | 255 | 183 |
| MASTER_INVENTORY.yml | triggers | 132 | 126 |
| MASTER_INVENTORY.yml | enums | 41 | 42 |
| MASTER_INVENTORY.yml | foreign_keys | 273 | 298 |
| MODELO-DATOS.md | views | 13 | 22 |
| MODELO-DATOS.md | funciones | 128 | 183 |
| MODELO-DATOS.md | triggers | 49 | 126 |
| MODELO-DATOS.md | enums | 36 | 42 |
| MODELO-DATOS.md | rls_policies | 282 | 263 |
| MODELO-DATOS.md | foreign_keys | 299 | 298 |
| MODELO-DATOS.md | PostgreSQL | 16 (ln 439) | 15 |
| database.config.yml | views | 13 | 22 |
| database.config.yml | funciones | 128 | 183 |
| database.config.yml | triggers | 49 | 126 |
| database.config.yml | enums | 36 | 42 |
| database.config.yml | rls_policies | 282 | 263 |
| database.config.yml | foreign_keys | 299 | 298 |

### 5.2 Schema-Reference a Reescribir

Los 16 archivos en `docs/20-architecture/schema-reference/` usan nombres conceptuales que no coinciden con los schemas fisicos. Deben actualizarse para reflejar la estructura real del DDL con tabla de mapeo explicita.

### 5.3 Documentacion Faltante

| Documento Necesario | Ubicacion Propuesta | Prioridad |
|---------------------|---------------------|-----------|
| Schema data_warehouse (16 tablas) | schema-reference/ | HIGH |
| Schema admin_dashboard (4 tablas + 7 views) | schema-reference/ | MEDIUM |
| Schema communication (4 tablas) | schema-reference/ | MEDIUM |
| Schema gamilit (30 funciones) | schema-reference/ | MEDIUM |
| Mapeo schema fisico <-> conceptual | schema-reference/_INDEX.md | HIGH |

---

## 6. NUMEROS DUPLICADOS EN DDL

Detectados en `social_features/tables/`:
- `11-peer_challenges.sql` y `11-scheduled_reports.sql`
- `12-challenge_participants.sql` y `12-shared_reports.sql`
- `27-team_vs_team_challenges.sql` y `27-user_reports.sql`

Detectados en `auth_management/tables/`:
- `03b-roles.sql` y `04-roles.sql` (posible duplicacion de refactor)
