# Traza de Tareas: ATLAS-DATABASE

**Última actualización:** 2026-01-24 (TASK-001: Tabla two_factor_tokens para 2FA)
**Estado:** ✅ PRODUCTION READY - Validación integral completada

---

## 📋 Tareas Actuales (2026)

### ✅ TASK-001: Tabla two_factor_tokens para 2FA - COMPLETADO

**Fecha:** 2026-01-24
**Agente:** CLAUDE-CODE
**Prioridad:** P0 CRÍTICO
**Duración:** ~1.5 horas (parte de implementación 5 gaps P0)
**Estimación:** 8 SP (como parte del gap P0-001)

**Objetivo:**
Crear tabla para almacenar tokens de autenticación de dos factores (2FA) como parte de la implementación del gap P0-001.

**Archivo DDL Creado:**
`apps/database/ddl/schemas/auth_management/tables/13-two_factor_tokens.sql`

**Estructura de la Tabla:**

```sql
CREATE TABLE auth_management.two_factor_tokens (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    method varchar(20) NOT NULL,  -- 'email', 'sms', 'authenticator'
    secret_key varchar(255),
    token_hash varchar(255),
    is_enabled boolean DEFAULT false,
    is_verified boolean DEFAULT false,
    verified_at timestamptz,
    expires_at timestamptz,
    attempts_count int DEFAULT 0,
    last_attempt_at timestamptz,
    locked_until timestamptz,
    backup_codes_encrypted text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

**Índices:**
- `idx_2fa_user_id` ON (user_id)
- `idx_2fa_token_hash` ON (token_hash)
- `idx_2fa_enabled` ON (user_id, is_enabled)

**Coherencia:**
- ✅ Entity correspondiente: `two-factor-token.entity.ts`
- ✅ Constante: `DB_TABLES.AUTH.TWO_FACTOR_TOKENS`

**Referencias:**
- Documentación: `orchestration/tareas/TASK-001-fix-p0-gaps/`
- Backend: Ver TRAZA-TAREAS-BACKEND.md (TASK-001)
- Commit: `430e2792`

---

### ✅ TASK-2026-01-16-005: Validación Integral BD, Seeds y Scripts - COMPLETADO

**Fecha:** 2026-01-16
**Agente:** Database-Agent + Validation
**Prioridad:** P1 VALIDACIÓN
**Duración:** ~4 horas

**Objetivo:**
Validación completa de base de datos: duplicados en DDL, cobertura de seeds, scripts de carga y documentación.

**Hallazgos y Acciones:**

#### 1. Validación DDL
- **Tablas:** 137 (0 duplicados) ✅
- **Funciones:** 121 (0 duplicados) ✅
- **Naming convention:** 100% snake_case ✅
- **Issue corregido:** `15-student_intervention_alerts.sql` → `19-student_intervention_alerts.sql`

#### 2. Validación Seeds
- **Prod:** 101 seeds (baseline) ✅
- **Dev:** 94 seeds (93% cobertura) ✅
- **Staging:** 56 seeds (55% intencional) ✅
- **Deprecación:** Organizada en `_deprecated/` folders ✅

#### 3. Scripts Creados/Actualizados
- **NUEVO:** `load-dev-seeds.sh` (18 fases) - Script completo para dev
- **NUEVO:** `staging/README.md` - Documentación de cobertura staging
- **VALIDADO:** `create-database.sh`, `load-staging-seeds.sh`

#### 4. Documentación
- **Carpeta tarea:** `orchestration/tareas/TASK-2026-01-16-005/`
- **Reporte:** `DATABASE-VALIDATION-REPORT.md`
- **Inventarios:** SEEDS_INVENTORY, FRONTEND_INVENTORY, BACKEND_INVENTORY actualizados

**Estado:** ✅ TODAS LAS RECOMENDACIONES COMPLETADAS

---

### ✅ DB-138: Eliminación Tabla Deprecated user_activity - COMPLETADO

**Fecha:** 2026-01-07
**Agente:** Database-Agent
**Prioridad:** P1 MEJORA
**Duración:** 30 minutos
**Estimación:** 0.5 SP

**Objetivo:**
Eliminar tabla deprecated `audit_logging.user_activity` identificada como duplicado de `user_activity_logs` durante análisis de consolidación de tablas de auditoría.

**Contexto:**
- Análisis de 8 tablas de auditoría reveló que `user_activity` era duplicado de `user_activity_logs`
- `user_activity_logs` tiene estructura más completa (9 cols vs 6 cols)
- Ambas registran acciones de usuario con timestamps
- Arquitectura general del proyecto validada como correcta (sin otros duplicados reales)

**Solución Implementada:**

#### 1. DDL Movido a _deprecated
**Archivo original:** `apps/database/ddl/schemas/audit_logging/tables/07-user_activity.sql`
**Destino:** `apps/database/ddl/schemas/audit_logging/_deprecated/07-user_activity.sql`

#### 2. Backend Actualizado
**Archivo:** `apps/backend/src/shared/constants/database.constants.ts`
**Cambio:** Constante `USER_ACTIVITY` comentada con nota de deprecación

```typescript
// DEPRECATED 2026-01-07: Tabla duplicada de USER_ACTIVITY_LOGS
// Movida a _deprecated/ - Usar USER_ACTIVITY_LOGS en su lugar
// USER_ACTIVITY: 'user_activity',
```

#### 3. Documentación Actualizada
- **_MAP.md:** Actualizado para reflejar 6 tablas activas (era 7)
- **MIGRATION-DUPLICATE-TABLES.md:** Marcado como COMPLETADO

#### 4. Validación Script
**Script:** `validate-create-database.sh`
**Resultado:** PASSED
- Línea 142 excluye `_deprecated/` con patrón: `! -path "*/_deprecated/*"`
- 7 archivos detectados en audit_logging/tables (excluyendo deprecated)

**Tablas activas en audit_logging:**
1. 01-audit_logs.sql
2. 02-performance_metrics.sql
3. 03-system_alerts.sql
4. 04-system_logs.sql
5. 05-user_activity_logs.sql (tabla preferida)
6. 06-activity_log.sql
7. 08-pending_user_initialization.sql

**Archivos Modificados:**
| Archivo | Tipo | Cambio |
|---------|------|--------|
| audit_logging/tables/07-user_activity.sql | DDL | Movido a _deprecated/ |
| database.constants.ts | Backend | Constante comentada |
| audit_logging/_MAP.md | Docs | Tablas 7→6 activas |
| audit_logging/MIGRATION-DUPLICATE-TABLES.md | Docs | Marcado COMPLETADO |

**Acción Pendiente en Producción:**
```sql
-- Ejecutar solo si la tabla existe en BD de producción
DROP TABLE IF EXISTS audit_logging.user_activity CASCADE;
```

**Impacto:**
- **Limpieza:** 1 tabla deprecated eliminada del flujo DDL
- **Consistencia:** 0 referencias huérfanas en TypeScript
- **Arquitectura:** Validada como correcta (tablas de progreso son complementarias)

**Reporte completo:** `orchestration/reportes/REPORTE-FINAL-SESION-2026-01-07.md`

---

## 📦 Historial Archivado

Las tareas anteriores a 2026 han sido archivadas para mantener este archivo en un tamaño manejable.

| Archivo | Período | Tareas |
|---------|---------|--------|
| `_archive/TRAZA-DATABASE-2025.md` | 2025-11 a 2025-12 | ~44 tareas |

**Contenido archivado incluye:**
- DB-137: M4-M5 Tablas Media Attachments
- DB-136: Implementación Soft Delete
- DB-111 a DB-100: Reconciliaciones y validaciones
- DB-099 a DB-089: Seeds y correcciones
- Microciclos 1-9: Implementación inicial DDL
- Sesiones de validación y corrección

Para consultar el historial completo, ver: `_archive/TRAZA-DATABASE-2025.md`

---

*Archivo reorganizado: 2026-01-24 (Auditoría P2 GAMILIT)*
*Tamaño reducido: 318KB → ~12KB*
