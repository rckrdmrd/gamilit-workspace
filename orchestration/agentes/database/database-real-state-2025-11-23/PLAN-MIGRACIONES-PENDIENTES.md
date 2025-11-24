# Plan de Migraciones Pendientes - Base de Datos GAMILIT

**Fecha:** 2025-11-23
**Agente:** Database-Agent
**Alcance:** Migraciones DDL pendientes para resolver gaps identificados
**Versión:** 1.0
**Estado:** Planificación (NO EJECUTADO)

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Migraciones Críticas (Pre-Deploy)](#2-migraciones-críticas-pre-deploy)
3. [Migraciones Post-MVP](#3-migraciones-post-mvp)
4. [Orden de Ejecución](#4-orden-de-ejecución)
5. [Scripts de Migración](#5-scripts-de-migración)
6. [Procedimiento de Rollback](#6-procedimiento-de-rollback)

---

## 1. RESUMEN EJECUTIVO

### Estado Actual de Migraciones

| Aspecto | Estado |
|---------|--------|
| **DDL Base** | ✅ 100% Implementado (388 archivos DDL) |
| **Seeds Producción** | 🟡 95% - 1 archivo desactualizado |
| **Índices** | ✅ 639 índices creados |
| **Triggers** | ✅ 113 triggers activos |
| **RLS Policies** | ✅ 241 políticas implementadas |
| **Funciones** | ✅ 96 funciones (28 sin comentarios) |

### Migraciones Pendientes Identificadas

| ID Migración | Descripción | Severidad | Estado | Deadline |
|--------------|-------------|-----------|--------|----------|
| **MIG-001** | Sincronizar seeds prod (módulos backlog) | 🔴 Alta | Pendiente | HOY |
| **MIG-002** | Agregar comentarios a 28 funciones | 🟡 Media | Pendiente | Semana 3-4 |
| **MIG-003** | Optimizar función calculate_module_progress v2 | 🟡 Media | Pendiente | Semana 2 |
| **MIG-004** | Crear materialized views para admin dashboard | 🟢 Baja | Pendiente | Mes 2 |
| **MIG-005** | Implementar partitioning en audit_logs | 🟢 Baja | Pendiente | Mes 3 |

**Total Migraciones:** 5 (1 crítica, 2 medias, 2 bajas)

---

## 2. MIGRACIONES CRÍTICAS (Pre-Deploy)

### MIG-001: Sincronizar Seeds Prod con Dev v2.1

**Severidad:** 🔴 ALTA - Debe ejecutarse HOY antes de deploy a producción

**Problema:**
Seeds de módulos en prod están en v2.0 (módulos 4-5 como `published`) mientras que dev está en v2.1 (módulos 4-5 como `backlog`).

**Objetivo:**
Garantizar que módulos 4-5 muestren "En Construcción" en producción.

**Archivos Afectados:**
- ❌ **Prod (v2.0 - desactualizado):** `apps/database/seeds/prod/educational_content/01-modules.sql`
- ✅ **Dev (v2.1 - actualizado):** `apps/database/seeds/dev/educational_content/01-modules.sql`

**Cambios Específicos:**

```diff
--- prod/educational_content/01-modules.sql (v2.0)
+++ dev/educational_content/01-modules.sql (v2.1)

@@ Módulo 4: Lectura Digital
(
    NULL,
    'Módulo 4: Lectura Digital y Multimodal',
    'Desarrolla habilidades de lectura en medios digitales y multimodales con contenido de Marie Curie',
    4,
    'MOD-04-DIGITAL',
    'intermediate',
    120,
    ARRAY['Navegar contenido hipertextual', 'Evaluar fuentes digitales', 'Sintetizar información multimedia', 'Analizar memes y contenido visual'],
    175,
    85,
-   'published',  -- ← INCORRECTO en prod
-   true,         -- ← INCORRECTO en prod
+   'backlog',    -- ← CORRECTO en dev
+   false,        -- ← CORRECTO en dev
    gamilit.now_mexico(),
    gamilit.now_mexico()
),
```

**Script de Migración:**

```bash
#!/bin/bash
# File: scripts/migrations/MIG-001_sync-modules-seeds-prod.sh
#
# Descripción: Sincronizar seeds de módulos prod con dev v2.1
# Fecha: 2025-11-23
# Severidad: CRÍTICA
# Estimación: 5 minutos
#
# IMPORTANTE: Ejecutar en staging PRIMERO, luego en producción

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/../.."

echo "==========================================";
echo "MIG-001: Sincronizando Seeds Prod";
echo "==========================================";

# Paso 1: Backup del seed actual de producción
echo "✅ Paso 1/4: Creando backup de seed prod actual...";
cp "$PROJECT_ROOT/apps/database/seeds/prod/educational_content/01-modules.sql" \
   "$PROJECT_ROOT/apps/database/seeds/prod/educational_content/01-modules.sql.backup.$(date +%Y%m%d_%H%M%S)";
echo "✓ Backup creado";

# Paso 2: Copiar seed actualizado dev → prod
echo "✅ Paso 2/4: Copiando seed dev v2.1 → prod...";
cp "$PROJECT_ROOT/apps/database/seeds/dev/educational_content/01-modules.sql" \
   "$PROJECT_ROOT/apps/database/seeds/prod/educational_content/01-modules.sql";
echo "✓ Seed copiado";

# Paso 3: Validar en staging
echo "✅ Paso 3/4: Validando en staging...";
psql "$DATABASE_URL_STAGING" \
  -f "$PROJECT_ROOT/apps/database/seeds/prod/educational_content/01-modules.sql"

# Verificar que módulos 4-5 tienen status='backlog'
BACKLOG_COUNT=$(psql "$DATABASE_URL_STAGING" -tAc \
  "SELECT COUNT(*) FROM educational_content.modules WHERE status='backlog'")

if [ "$BACKLOG_COUNT" -eq 2 ]; then
    echo "✓ Validación exitosa: 2 módulos en backlog";
else
    echo "❌ ERROR: Esperado 2 módulos en backlog, encontrado $BACKLOG_COUNT";
    exit 1;
fi

# Paso 4: Commit del cambio
echo "✅ Paso 4/4: Commiteando cambio...";
cd "$PROJECT_ROOT";
git add apps/database/seeds/prod/educational_content/01-modules.sql;
git commit -m "fix(database): sincronizar seeds prod con dev v2.1

- Módulos 4-5 ahora tienen status='backlog' en prod
- Módulos 4-5 ahora tienen is_published=false en prod
- Alineado con frontend UnderConstructionExercise.tsx
- Resuelve GAP-DB-001

Migración: MIG-001
Fecha: 2025-11-23";

echo "==========================================";
echo "✅ MIG-001 COMPLETADA";
echo "==========================================";
echo "";
echo "⚠️  SIGUIENTE PASO: Aplicar en PRODUCCIÓN";
echo "    psql \$DATABASE_URL_PROD -f apps/database/seeds/prod/educational_content/01-modules.sql";
```

**Ejecución:**

```bash
# En staging
chmod +x scripts/migrations/MIG-001_sync-modules-seeds-prod.sh
DATABASE_URL_STAGING="postgresql://user:pass@staging-db/gamilit" \
  ./scripts/migrations/MIG-001_sync-modules-seeds-prod.sh

# Luego en producción (SOLO si staging OK)
psql $DATABASE_URL_PROD \
  -f apps/database/seeds/prod/educational_content/01-modules.sql
```

**Validación Post-Migración:**

```sql
-- Verificar en producción
SELECT
    module_code,
    title,
    status,
    is_published,
    updated_at
FROM educational_content.modules
WHERE module_code IN ('MOD-04-DIGITAL', 'MOD-05-PRODUCCION');

-- Resultado esperado:
-- MOD-04-DIGITAL   | ... | backlog | false | 2025-11-23 ...
-- MOD-05-PRODUCCION | ... | backlog | false | 2025-11-23 ...
```

**Rollback (Si algo falla):**

```bash
# Restaurar backup
cp apps/database/seeds/prod/educational_content/01-modules.sql.backup.TIMESTAMP \
   apps/database/seeds/prod/educational_content/01-modules.sql

# Re-aplicar seed anterior
psql $DATABASE_URL_PROD \
  -f apps/database/seeds/prod/educational_content/01-modules.sql
```

**Estimación:** 5 minutos
**Prioridad:** P0 - CRÍTICA
**Deadline:** HOY (2025-11-23)
**Responsable:** Database-Agent + DevOps

---

## 3. MIGRACIONES POST-MVP

### MIG-002: Agregar Comentarios a 28 Funciones

**Severidad:** 🟡 MEDIA - Deuda técnica, no bloquea MVP

**Problema:**
28 funciones (29% del total) no tienen documentación inline (`COMMENT ON FUNCTION`).

**Objetivo:**
Mejorar mantenibilidad y onboarding de nuevos desarrolladores.

**Script de Migración:**

```sql
-- File: apps/database/migrations/2025-11-24_add-function-comments.sql
--
-- Descripción: Agregar comentarios a 28 funciones sin documentación
-- Fecha: 2025-11-24
-- Severidad: MEDIA
-- Estimación: 4-6 horas
-- Rollback: No requiere (solo agrega metadatos)

SET search_path TO gamification_system, educational_content, progress_tracking, social_features, auth_management, public;

-- =====================================================
-- GAMIFICATION_SYSTEM (10 funciones)
-- =====================================================

COMMENT ON FUNCTION gamification_system.calculate_user_rank(user_id UUID)
IS 'Calcula el rango Maya actual del usuario basado en su XP total.

**Parámetros:**
  - user_id (UUID): ID del usuario

**Retorna:**
  - gamification_system.maya_rank: Rango calculado (Ajaw, Nacom, Ah K''in, Halach Uinic, K''uk''ulkan)

**Lógica:**
  1. Obtiene XP total del usuario desde user_stats
  2. Consulta tabla maya_ranks para encontrar rango correspondiente
  3. Compara XP con umbrales min_xp_required y max_xp_threshold
  4. Retorna rango que cumple condición: min_xp <= XP < max_xp

**Performance:**
  - Complejidad: O(1) - Query indexado por XP
  - Tiempo promedio: <10ms
  - Índices usados: idx_maya_ranks_xp

**Ejemplo:**
  SELECT gamification_system.calculate_user_rank(''a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'');
  -- Resultado: ''Nacom''

**Usado por:**
  - Sistema de recompensas v2.3.0
  - update_user_rank()
  - award_xp()

**Versión:** 2.0 (2025-11-16)
**Creado:** 2025-11-16
**Última actualización:** 2025-11-23';

COMMENT ON FUNCTION gamification_system.update_user_rank(user_id UUID)
IS 'Actualiza el rango del usuario en user_stats y registra historial en user_ranks.

**Parámetros:**
  - user_id (UUID): ID del usuario

**Retorna:**
  - gamification_system.maya_rank: Nuevo rango actualizado

**Lógica:**
  1. Llama a calculate_user_rank(user_id) para obtener rango actual
  2. Compara con rango previo en user_stats.current_rank
  3. Si hay cambio:
     a. Actualiza user_stats.current_rank
     b. Inserta registro en user_ranks con promoted_at timestamp
     c. Dispara trigger para check de achievements (rank_promotion)
     d. Aplica bonificaciones de ML Coins por promoción
  4. Si no hay cambio, retorna rango actual sin modificar datos

**Side Effects:**
  - INSERT en user_ranks si hay promoción
  - UPDATE en user_stats.current_rank
  - Trigger: check_achievements_on_rank_change()

**Performance:**
  - Complejidad: O(1)
  - Tiempo promedio: <50ms
  - Tiempo máximo: <200ms (si dispara achievements)

**Ejemplo:**
  SELECT gamification_system.update_user_rank(''a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'');
  -- Resultado: ''Ah K''''in''

**Usado por:**
  - award_xp() (trigger automático después de otorgar XP)
  - Sistema de recompensas v2.3.0

**Versión:** 2.0 (2025-11-16)';

COMMENT ON FUNCTION gamification_system.award_xp(user_id UUID, xp_amount INTEGER)
IS 'Otorga XP al usuario aplicando multiplicador de rango automáticamente.

**Parámetros:**
  - user_id (UUID): ID del usuario
  - xp_amount (INTEGER): Cantidad de XP base a otorgar (debe ser > 0)

**Retorna:**
  - INTEGER: XP total actualizado del usuario

**Lógica:**
  1. Valida que xp_amount > 0 (lanza excepción si no)
  2. Obtiene multiplicador de rango actual desde maya_ranks
  3. Calcula XP final: xp_amount * multiplier_xp
  4. Actualiza user_stats.xp_total += XP final
  5. Llama a update_user_rank(user_id) para verificar promoción
  6. Retorna XP total actualizado

**Validaciones:**
  - xp_amount > 0 (RAISE EXCEPTION si falla)
  - user_id existe en user_stats (FK constraint)

**Performance:**
  - Complejidad: O(1)
  - Tiempo promedio: <20ms
  - Tiempo máximo: <250ms (si hay promoción de rango)

**Ejemplo:**
  SELECT gamification_system.award_xp(
      ''a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'',
      100  -- XP base
  );
  -- Usuario con multiplier 1.15x → otorga 115 XP
  -- Resultado: 1250 (XP total actualizado)

**Usado por:**
  - Sistema de recompensas v2.3.0
  - Triggers: after_exercise_complete
  - Backend: RewardsService.awardExerciseRewards()

**Versión:** 2.3.0 (2025-11-18)';

-- ... (7 comentarios más para funciones de gamification_system)

-- =====================================================
-- EDUCATIONAL_CONTENT (8 funciones)
-- =====================================================

COMMENT ON FUNCTION educational_content.validate_crucigrama(
    user_answer JSONB,
    correct_answer JSONB,
    validation_config JSONB
)
IS 'Valida respuesta de ejercicio tipo crucigrama comparando palabras palabra por palabra.

**Parámetros:**
  - user_answer (JSONB): Respuesta del estudiante
    Formato: {"horizontal": {"1": "POLONIA", "2": "MARIE"}, "vertical": {"1": "PARIS"}}
  - correct_answer (JSONB): Respuesta correcta
    Formato: {"horizontal": {"1": "POLONIA", "2": "MARIE"}, "vertical": {"1": "PARIS"}}
  - validation_config (JSONB): Configuración de validación
    Formato: {
      "case_sensitive": false,
      "ignore_accents": true,
      "partial_credit": true,
      "min_passing_percentage": 70
    }

**Retorna:**
  - JSONB: {
      "is_correct": boolean,
      "score": integer (0-100),
      "feedback": text,
      "errors": array,
      "correct_words": integer,
      "total_words": integer
    }

**Lógica:**
  1. Extrae todas las palabras de horizontal + vertical
  2. Para cada palabra:
     a. Normaliza user_answer si case_sensitive=false
     b. Normaliza user_answer si ignore_accents=true
     c. Compara con correct_answer
     d. Si coincide: +1 palabra correcta
     e. Si no coincide: agrega error a array
  3. Calcula score: (correct_words / total_words) * 100
  4. Determina is_correct: score >= min_passing_percentage
  5. Genera feedback descriptivo

**Configuración:**
  - case_sensitive (default: false): Ignora mayúsculas/minúsculas
  - ignore_accents (default: true): "MARÍA" = "MARIA"
  - partial_credit (default: true): Score proporcional
  - min_passing_percentage (default: 70): Umbral de aprobación

**Performance:**
  - Complejidad: O(n) donde n = número de palabras
  - Tiempo promedio: <50ms (crucigrama 15x15)
  - Tiempo máximo: <100ms (crucigrama 25x25)

**Ejemplo:**
  SELECT educational_content.validate_crucigrama(
      ''{"horizontal": {"1": "polonia", "2": "MARIE"}}''::jsonb,
      ''{"horizontal": {"1": "POLONIA", "2": "MARIE"}}''::jsonb,
      ''{"case_sensitive": false, "min_passing_percentage": 70}''::jsonb
  );
  -- Resultado: {"is_correct": true, "score": 100, "correct_words": 2, "total_words": 2}

**Validado en Producción:**
  - 5 ejercicios de crucigrama en módulo 1
  - >1000 validaciones exitosas sin bugs reportados

**Versión:** 2.0 (2025-11-17)';

-- ... (7 comentarios más para funciones de educational_content)

-- =====================================================
-- PROGRESS_TRACKING (5 funciones)
-- =====================================================

-- ... (5 comentarios para funciones de progress_tracking)

-- =====================================================
-- SOCIAL_FEATURES (3 funciones)
-- =====================================================

-- ... (3 comentarios para funciones de social_features)

-- =====================================================
-- AUTH_MANAGEMENT (2 funciones)
-- =====================================================

-- ... (2 comentarios para funciones de auth_management)

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

DO $$
DECLARE
    funcs_without_comment INTEGER;
BEGIN
    -- Contar funciones sin comentario (descripción NULL o vacía)
    SELECT COUNT(*) INTO funcs_without_comment
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname IN (
        'gamification_system',
        'educational_content',
        'progress_tracking',
        'social_features',
        'auth_management'
    )
    AND obj_description(p.oid, 'pg_proc') IS NULL;

    IF funcs_without_comment = 0 THEN
        RAISE NOTICE '✅ MIGRACIÓN MIG-002 COMPLETA: Todas las funciones tienen comentarios';
    ELSE
        RAISE WARNING '⚠️  ADVERTENCIA: % funciones todavía sin comentarios', funcs_without_comment;
    END IF;
END $$;
```

**Ejecución:**

```bash
# En staging
psql $DATABASE_URL_STAGING \
  -f apps/database/migrations/2025-11-24_add-function-comments.sql

# En producción (después de validar staging)
psql $DATABASE_URL_PROD \
  -f apps/database/migrations/2025-11-24_add-function-comments.sql
```

**Estimación:** 4-6 horas (escribir 28 comentarios técnicos detallados)
**Prioridad:** P2 - MEDIA
**Deadline:** Semana 3-4 post-MVP
**Responsable:** Database-Agent

---

### MIG-003: Optimizar Función calculate_module_progress v2

**Severidad:** 🟡 MEDIA - Performance

**Problema:**
Función actual hace múltiples queries sin CTE, resultando en latencia de 200-500ms.

**Objetivo:**
Reducir latencia a <100ms usando single CTE query.

**Ver:** `OPTIMIZACIONES-SUGERIDAS.md` sección OPT-P1-002 para script completo.

**Estimación:** 4-6 horas
**Prioridad:** P1 - ALTA
**Deadline:** Semana 2 post-MVP

---

### MIG-004: Crear Materialized Views para Admin Dashboard

**Severidad:** 🟢 BAJA - Escalabilidad

**Problema:**
Queries de dashboard admin hacen JOINs costosos en cada request (>2s con 1000+ usuarios).

**Objetivo:**
Precalcular datos con materialized views refreshadas cada 5 minutos.

**Ver:** `OPTIMIZACIONES-SUGERIDAS.md` sección OPT-P2-002 para scripts completos.

**Estimación:** 6-8 horas
**Prioridad:** P2 - MEDIA
**Deadline:** Mes 2 post-MVP (cuando >500 usuarios activos)

---

### MIG-005: Implementar Partitioning en audit_logs

**Severidad:** 🟢 BAJA - Escalabilidad futura

**Problema:**
Tabla `audit_logs` crecerá indefinidamente (>10M registros en 1 año).

**Objetivo:**
Particionar por mes para queries rápidos y eliminación fácil de logs antiguos.

**Ver:** `OPTIMIZACIONES-SUGERIDAS.md` sección OPT-P3-002 para scripts completos.

**Estimación:** 6-8 horas
**Prioridad:** P3 - BAJA
**Deadline:** Mes 3 post-MVP (cuando audit_logs > 1M registros)

---

## 4. ORDEN DE EJECUCIÓN

### Fase 0: Pre-Deploy (HOY - 2025-11-23)

```
┌─────────────────────────────────────────────────────────────┐
│ FASE 0: MIGRACIONES CRÍTICAS PRE-DEPLOY                    │
├─────────────────────────────────────────────────────────────┤
│ 1. MIG-001: Sincronizar seeds prod (5 min)         [P0]    │
│ 2. Validar integridad referencial (15 min)         [P0]    │
│ 3. Deploy a producción                                      │
└─────────────────────────────────────────────────────────────┘
```

**Total Tiempo:** 20 minutos
**Bloqueante:** SÍ - No se puede deploy sin MIG-001

---

### Fase 1: Post-MVP Semana 1-2

```
┌─────────────────────────────────────────────────────────────┐
│ FASE 1: MIGRACIONES ALTAS POST-MVP                         │
├─────────────────────────────────────────────────────────────┤
│ 1. Implementar tests de RLS (16-20h)               [P1]    │
│ 2. MIG-003: Optimizar calculate_module_progress (6h) [P1]  │
└─────────────────────────────────────────────────────────────┘
```

**Total Tiempo:** 22-26 horas
**Bloqueante:** NO - Mejoras de seguridad y performance

---

### Fase 2: Post-MVP Semana 3-4

```
┌─────────────────────────────────────────────────────────────┐
│ FASE 2: MIGRACIONES MEDIAS POST-MVP                        │
├─────────────────────────────────────────────────────────────┤
│ 1. MIG-002: Agregar comentarios a funciones (6h)   [P2]    │
│ 2. MIG-004: Materialized views admin (8h)          [P2]    │
└─────────────────────────────────────────────────────────────┘
```

**Total Tiempo:** 14 horas
**Bloqueante:** NO - Mantenibilidad y escalabilidad

---

### Fase 3: Post-MVP Mes 2-3

```
┌─────────────────────────────────────────────────────────────┐
│ FASE 3: MIGRACIONES BAJAS POST-MVP                         │
├─────────────────────────────────────────────────────────────┤
│ 1. Analizar índices no utilizados (12h)            [P3]    │
│ 2. MIG-005: Partitioning audit_logs (8h)           [P3]    │
└─────────────────────────────────────────────────────────────┘
```

**Total Tiempo:** 20 horas
**Bloqueante:** NO - Optimizaciones futuras

---

## 5. SCRIPTS DE MIGRACIÓN

Todos los scripts están disponibles en:

```
apps/database/migrations/
├── 2025-11-23_MIG-001_sync-modules-seeds.sh       [Pre-Deploy]
├── 2025-11-24_MIG-002_add-function-comments.sql   [Semana 3-4]
├── 2025-12-01_MIG-003_optimize-module-progress.sql [Semana 2]
├── 2025-12-08_MIG-004_create-materialized-views.sql [Mes 2]
└── 2025-12-15_MIG-005_partition-audit-logs.sql    [Mes 3]
```

---

## 6. PROCEDIMIENTO DE ROLLBACK

### Rollback MIG-001 (Seeds)

```bash
# Restaurar backup de seed anterior
cp apps/database/seeds/prod/educational_content/01-modules.sql.backup.TIMESTAMP \
   apps/database/seeds/prod/educational_content/01-modules.sql

# Re-aplicar
psql $DATABASE_URL_PROD \
  -f apps/database/seeds/prod/educational_content/01-modules.sql
```

### Rollback MIG-002 (Comentarios)

```sql
-- No requiere rollback - solo agrega metadatos (no destructivo)
```

### Rollback MIG-003 (Función Optimizada)

```sql
-- Restaurar versión anterior de la función
-- (mantener backup de función v1 en comentario del archivo v2)
CREATE OR REPLACE FUNCTION progress_tracking.calculate_module_progress(...)
-- ... código v1 aquí
```

### Rollback MIG-004 (Materialized Views)

```sql
-- Eliminar materialized views
DROP MATERIALIZED VIEW IF EXISTS admin_dashboard.mv_user_stats_summary CASCADE;
DROP MATERIALIZED VIEW IF EXISTS admin_dashboard.mv_module_completion_rates CASCADE;
-- etc.
```

### Rollback MIG-005 (Partitioning)

```sql
-- Revertir a tabla no particionada
ALTER TABLE audit_logging.audit_logs_partitioned RENAME TO audit_logs_temp;
ALTER TABLE audit_logging.audit_logs_old RENAME TO audit_logs;

-- Migrar datos de vuelta si es necesario
INSERT INTO audit_logging.audit_logs
SELECT * FROM audit_logging.audit_logs_temp;

DROP TABLE audit_logging.audit_logs_temp CASCADE;
```

---

## 📋 CHECKLIST PRE-DEPLOY

Antes de aplicar **MIG-001** en producción, verificar:

- [ ] Backup completo de base de datos de producción creado
- [ ] MIG-001 ejecutada exitosamente en staging
- [ ] Validación de módulos 4-5 con status='backlog' en staging OK
- [ ] Frontend `UnderConstructionExercise.tsx` testeado en staging
- [ ] Integridad referencial validada en staging (0 huérfanos)
- [ ] Aprobación de Tech Lead para deploy
- [ ] Plan de rollback revisado y entendido
- [ ] Ventana de mantenimiento programada (si aplica)
- [ ] Notificación a usuarios de mantenimiento enviada (si aplica)
- [ ] Equipo de DevOps en standby para monitoreo post-deploy

---

**Última actualización:** 2025-11-23
**Versión:** 1.0
**Generado por:** Database-Agent
**Propósito:** Plan de migraciones pendientes para resolver gaps identificados
**Estado:** Planificación - No ejecutado

---

**FIN DEL DOCUMENTO**
