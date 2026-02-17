# 01-HALLAZGOS.md - Validacion Integral de Desarrollo

**Fecha:** 2026-02-14
**Tarea:** TASK-2026-02-17-VALIDACION-DESARROLLO
**Ambiente:** DEV (Windows 11 + WSL Ubuntu-24.04)

---

## Resumen Ejecutivo

| Fase | Descripcion | Resultado |
|------|-------------|-----------|
| 0 | Prerequisitos | PASS (PostgreSQL iniciado manualmente) |
| 1 | Recreacion BD | PASS con errores (exit 0, BD recreada) |
| 2 | Validacion conteos BD | 8 PASS, 1 FAIL, 1 PARTIAL |
| 3 | Backend build + lint | Build PASS, Lint FAIL (7 errors) |
| 4 | Frontend build + lint | Build PASS, Lint PASS (0 errors) |
| 5 | Backend dev startup | FAIL (env validation error) |
| 6 | Frontend dev startup | PASS (HTTP 200 en 295ms) |

---

## Hallazgos Detallados

### H-01 [P0] Backend No Arranca — Validacion de ENV Falla

**Archivo:** `apps/backend/src/config/env.validation.ts`
**Error:**
```
Environment validation failed:
  - PORT: PORT must not be greater than 65535, PORT must not be less than 1, PORT must be a number
  - DB_PORT: DB_PORT must be a number conforming to the specified constraints
```

**Causa Raiz:** TypeScript emite `design:type` como `Object` (no `Number`) para propiedades de clase sin anotacion de tipo explicita. En la clase `EnvironmentVariables`:
```typescript
@IsNumber() @Min(1) @Max(65535)
PORT = 3006;        // <-- design:type = Object (sin `: number`)

@IsNumber() @IsOptional()
DB_PORT = 5432;     // <-- design:type = Object (sin `: number`)
```

Cuando `class-transformer` ejecuta `plainToInstance` con `enableImplicitConversion: true`, consulta `Reflect.getMetadata('design:type', ...)`. Si obtiene `Object`, no convierte el string "3006" a number — queda como string y `@IsNumber()` falla.

**Verificado en compilado:** `dist/config/env.validation.js` confirma:
```javascript
__metadata("design:type", Object)   // PORT
__metadata("design:type", Object)   // DB_PORT
```

**Comparacion:** Propiedades con tipo explicito emiten correctamente:
```javascript
__metadata("design:type", String)   // NODE_ENV: Environment (enum = string)
__metadata("design:type", String)   // DB_PASSWORD?: string
```

**Impacto:** Backend completamente inoperativo. No puede arrancar en dev ni en prod.

---

### H-02 [P1] RLS Policies: 195 vs 227 Esperadas

**Fuente:** FASE 2 — Validacion post-recreacion
**Esperado:** 227 (DDL source count)
**Actual:** 195 (runtime count)
**Delta:** -32 policies (-14%)
**Tolerancia:** >=200 — **FALLA**

**Errores en init-database.sh:**
- 16 archivos RLS de schema con errores
- 3 archivos RLS globales con errores (07-enable-rls.sql, 07b, 07c)

**Desglose por schema (actual):**
| Schema | Policies |
|--------|----------|
| social_features | 61 |
| gamification_system | 27 |
| progress_tracking | 24 |
| auth_management | 18 |
| communication | 17 |
| notifications | 14 |
| audit_logging | 11 |
| lti_integration | 11 |
| educational_content | 6 |
| system_configuration | 5 |
| content_management | 1 |
| **Total** | **195** |

**Schemas sin policies que deberian tener:**
- `admin_dashboard` — 0 (deberia tener)
- `teacher_tools` — no listado (posiblemente merged en otro schema)

**Causa probable:** Errores de dependencia — policies referencian tablas/funciones que fallaron en pasos anteriores (funciones con error, vistas con error).

---

### H-03 [P1] Tablas: 165 vs 169 Esperadas

**Fuente:** FASE 2
**Esperado:** 169 (DDL count)
**Actual:** 165
**Delta:** -4 tablas
**Tolerancia:** >=163 — **PASA** (pero amerita investigacion)

**Nota:** init-database.sh reporto 167 tablas creadas + 1 cross-schema = 168 en creacion, pero pg_tables muestra 165. Posible discrepancia por tablas en schemas excluidos del conteo o tablas que fallaron silenciosamente.

---

### H-04 [P2] Backend Lint: 7 Errores

**Archivos afectados (2 archivos):**

| Archivo | Linea | Error |
|---------|-------|-------|
| `modules/educational/services/exercise-attempt.service.ts` | 318,319 | `no-case-declarations` (x2) |
| `modules/visualization/services/aggregation.service.ts` | 180,181 | `no-case-declarations` |
| `modules/visualization/services/aggregation.service.ts` | 186,187 | `no-case-declarations` |
| `modules/visualization/services/aggregation.service.ts` | 192 | `no-case-declarations` |

**Impacto:** Bajo-medio — `exercise-attempt.service.ts` esta en modulo importado (educational), pero el error es solo de estilo (falta `{}` en case blocks). `visualization` NO esta importado. 910 warnings adicionales (mayoria `@typescript-eslint/no-explicit-any`).

---

### H-05 [P2] Funciones BD: 3 Errores en Creacion

**Archivos con error:**
1. `02-retry_pending_initializations.sql`
2. `cleanup_old_system_logs.sql`
3. `cleanup_old_user_activity.sql`

**Impacto:** Medio-bajo — funciones de mantenimiento/cleanup. 112 de 115 creadas exitosamente.

---

### H-06 [P2] Vistas BD: 5 Errores en Creacion

**Archivos con error:**
1. `classroom_overview.sql`
2. `moderation_queue.sql`
3. `v_student_engagement_metrics.sql`
4. `v_student_feature_base.sql`
5. `v_student_performance_metrics.sql`

**Impacto:** Medio — 12 de 17 vistas creadas. Las 3 vistas `v_student_*` son usadas por el modulo ML (no importado). `classroom_overview` y `moderation_queue` podrian afectar queries del backend.

---

### H-07 [P2] Indices BD: 14 Errores en Creacion

**Impacto:** Medio — 12 de 26 indices creados. Indices faltantes pueden afectar performance en queries de produccion.

---

### H-08 [P2] Triggers BD: 3 Errores en Creacion

**Archivos con error:**
1. `01-trg_set_default_tenant.sql`
2. `00-batch_updated_at_triggers.sql`
3. `28-trg_update_missions_on_use_comodines.sql`

**Impacto:** Medio — `trg_set_default_tenant` es critico para multi-tenancy. `batch_updated_at_triggers` afecta audit trail. 34 de 37 creados.

---

### H-09 [P2] Seeds BD: 30 Errores de 65 Archivos

**Archivos con error (muestra):**
- `03-profiles.sql`, `06-profiles-production.sql`
- `04-user_roles.sql`, `05-user_preferences.sql`
- `07-security_events.sql`
- `02-notification_preferences_defaults.sql`
- `04-achievements.sql`, `05-user_stats.sql`
- `01-demo-progress.sql`, `02-exercise-attempts.sql`
- `01-audit-logs.sql`, `02-system-metrics.sql`
- `01-lti_consumers.sql`, `01-bulk_operations.sql`
- Y mas...

**Impacto:** Alto para desarrollo — demo data incompleta. Sin embargo, post-seeds fix funciono (48 profiles, 48 user_stats, 48 user_ranks inicializados).

---

### H-10 [P3] gamilit_user: Password Auth Falla

**Error:** `FATAL: password authentication failed for user "gamilit_user"` via localhost
**Nota:** El usuario EXISTE en pg_roles y puede usarse via `SET ROLE`. Backend conecta via WSL IP (172.21.220.31), no localhost.
**Causa probable:** pg_hba.conf configurado para `peer` auth en localhost, no `md5/scram-sha-256`.
**Impacto:** Bajo — backend conecta via IP de WSL, no localhost.

---

### H-11 [P3] Schemas: 20 vs 18 Esperados

**Fuente:** FASE 2
**Actual:** 20 schemas
**Esperado:** 18 (16 activos + 2 placeholder)
**Impacto:** Ninguno negativo — schemas adicionales probablemente `public` y `auth`.

---

### H-12 [P0] WSL2 Port Forwarding: 11 Datasources Crash svchost Proxy

**Descubierto durante:** Validacion post-CORR-01
**Sintoma:** `ECONNRESET` en todas las conexiones TypeORM desde Windows a WSL PostgreSQL via localhost:5432

**Analisis detallado:**
- `svchost.exe` (PID variable) actua como proxy WSL2 en `127.0.0.1:5432` → WSL PostgreSQL
- **1 conexion pg.Client:** FUNCIONA
- **3 conexiones pg.Client simultaneas:** FUNCIONA
- **11 conexiones pg.Client simultaneas:** FUNCIONA
- **1 conexion pg.Pool:** FALLA con ECONNRESET
- **11 conexiones TypeORM (pg-pool):** FALLA consistentemente
- Despues de multiples intentos fallidos, el proxy svchost entra en estado inestable (incluso 1 conexion falla)
- `systemctl restart postgresql` restaura la conectividad temporalmente

**Causa raiz:** El proxy svchost de WSL2 no maneja bien las conexiones pg-pool/TypeORM que abren 11 datasources simultaneos con pools de 2 conexiones cada uno.

**Impacto:** Backend no puede arrancar desde Windows para conectar a WSL PostgreSQL. **Esto NO afecta produccion** (deploy directo en Linux).

**Workarounds:**
1. Ejecutar `npm run dev` DENTRO de WSL (connection directa, sin proxy)
2. Instalar PostgreSQL nativo en Windows
3. Usar Docker para PostgreSQL en Windows (bridge networking)
4. Reducir/consolidar datasources en TypeORM (11→3-4)

---

## Clasificacion de Prioridad

| Prioridad | Hallazgos | Descripcion |
|-----------|-----------|-------------|
| **P0** | ~~H-01~~ | ~~Backend no arranca (env validation)~~ **CORREGIDO (CORR-01)** |
| **P0** | H-12 | WSL2 proxy crash con 11 datasources (infra, no codigo) |
| **P1** | H-02, H-03 | RLS deficit, tablas faltantes |
| **P2** | ~~H-04~~ | ~~Lint errors~~ **CORREGIDO (CORR-02)** |
| **P2** | H-05 thru H-09 | BD object creation errors |
| **P3** | H-10, H-11 | gamilit_user auth, schema count |
