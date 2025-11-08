# ANÁLISIS DE COHERENCIA DEL MODELO - `level` vs `current_level`

## Metadata
- **Documento**: ANALISIS-COHERENCIA-MODELO-LEVEL.md
- **Fecha**: 2025-11-07
- **Propósito**: Análisis exhaustivo de coherencia entre la nomenclatura de columnas SQL y las interfaces TypeScript
- **Alcance**: Validación completa del modelo de datos para adaptación coherente

---

## 🎯 OBJETIVO

Validar que todos los objetos del sistema (tablas, funciones, vistas, APIs, frontend) usen correctamente la nomenclatura de columnas según su contexto, siguiendo el principio:

> **"Si ya existe un objeto, hay que adaptar el código que lo usa para que funcione correctamente, validando que no afecte a otros objetos dependientes"**

---

## 📊 ARQUITECTURA DEL MODELO `level` / `current_level`

### Patrón de Transformación de Nomenclatura

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA DE BASE DE DATOS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📦 TABLA FÍSICA (PostgreSQL)                                   │
│  ┌───────────────────────────────────────────────────┐         │
│  │ gamification_system.user_stats                    │         │
│  │ ──────────────────────────────────────────────    │         │
│  │ ✅ level INTEGER DEFAULT 1 NOT NULL               │         │
│  │ ✅ current_rank maya_rank DEFAULT 'Ajaw'          │         │
│  │ ✅ total_xp INTEGER                                │         │
│  └───────────────────────────────────────────────────┘         │
│         │                                                       │
│         │ SELECT directamente desde funciones SQL              │
│         ▼                                                       │
│  ┌───────────────────────────────────────────────────┐         │
│  │ 🛠️  FUNCIONES SQL INTERNAS                        │         │
│  │ ──────────────────────────────────────────────    │         │
│  │ ✅ CORRECTO:   SELECT level INTO v_level          │         │
│  │ ❌ INCORRECTO: SELECT current_level INTO v_level  │         │
│  └───────────────────────────────────────────────────┘         │
│         │                                                       │
│         │ Transformación en Vistas/MVs                         │
│         ▼                                                       │
│  ┌───────────────────────────────────────────────────┐         │
│  │ 🔄 VISTAS Y MATERIALIZED VIEWS                     │         │
│  │ ──────────────────────────────────────────────    │         │
│  │ ✅ SELECT us.level AS current_level               │         │
│  │ ✅ SELECT ur.current_rank AS maya_rank            │         │
│  │                                                    │         │
│  │ Ejemplo: leaderboard_xp                           │         │
│  │ - us.level AS current_level ← Transformación      │         │
│  └───────────────────────────────────────────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                         │
                         │ JSON/API Response
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA DE APLICACIÓN                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📡 BACKEND (NestJS + TypeScript)                               │
│  ┌───────────────────────────────────────────────────┐         │
│  │ DTOs / Interfaces                                 │         │
│  │ ──────────────────────────────────────────────    │         │
│  │ ✅ current_level: number                          │         │
│  │ ✅ currentRank: MayaRank                          │         │
│  │                                                    │         │
│  │ LeaderboardEntryDto:                              │         │
│  │   - current_level!: number                        │         │
│  └───────────────────────────────────────────────────┘         │
│         │                                                       │
│         │ HTTP/JSON                                             │
│         ▼                                                       │
│  ┌───────────────────────────────────────────────────┐         │
│  │ 🎨 FRONTEND (React + TypeScript)                  │         │
│  │ ──────────────────────────────────────────────    │         │
│  │ ✅ current_level: number                          │         │
│  │ ✅ currentRank: MayaRank                          │         │
│  │                                                    │         │
│  │ UserStats interface:                              │         │
│  │   - current_level: number                         │         │
│  └───────────────────────────────────────────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 HALLAZGOS - ANÁLISIS EXHAUSTIVO

### 1. Referencias a `current_level` en el Código (50+ ocurrencias)

#### ✅ **CORRECTO**: Vistas y Materialized Views (5 archivos)

Estas **DEBEN** usar `AS current_level` para transformar la nomenclatura SQL → API:

| Archivo | Línea | Código | Estado |
|---------|-------|--------|--------|
| `gamification_system/views/04-leaderboard_xp.sql` | 20 | `us.level AS current_level` | ✅ CORRECTO |
| `gamification_system/materialized-views/01-mv_global_leaderboard.sql` | ~20 | `us.level AS current_level` | ✅ CORRECTO |
| `gamification_system/materialized-views/02-mv_classroom_leaderboard.sql` | ~20 | `us.level AS current_level` | ✅ CORRECTO |
| `gamification_system/materialized-views/03-mv_weekly_leaderboard.sql` | ~20 | `us.level AS current_level` | ✅ CORRECTO |
| `gamification_system/materialized-views/04-mv_mechanic_leaderboard.sql` | ~20 | `us.level AS current_level` | ✅ CORRECTO |

**Razón**: Las vistas son la **capa de transformación** entre SQL (snake_case) y API (camelCase).

---

#### ✅ **CORRECTO**: Frontend y Backend TypeScript (10+ archivos)

Estos **DEBEN** usar `current_level` porque consumen datos de las vistas/API:

| Archivo | Línea | Código | Estado |
|---------|-------|--------|--------|
| `apps/backend/src/shared/types/index.ts` | 135 | `current_level: number` | ✅ CORRECTO |
| `apps/backend/src/modules/gamification/dto/leaderboard-entry.dto.ts` | 46 | `current_level!: number` | ✅ CORRECTO |
| `apps/frontend/src/pages/teacher/StudentProgressViewer.tsx` | 37 | `current_level: number` | ✅ CORRECTO |
| `apps/frontend/src/pages/teacher/ClassroomAnalytics.tsx` | 59 | `current_level: number` | ✅ CORRECTO |
| `docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md` | 85 | `current_level: number` | ✅ CORRECTO |

**Razón**: El frontend/backend consumen JSON de las vistas que ya transformaron `level` → `current_level`.

---

#### ❌ **INCORRECTO**: Funciones SQL que acceden directamente a la tabla (4 archivos)

Estas funciones **NO deben** usar `current_level` porque acceden a la tabla física, no a vistas:

| Archivo | Línea | Código | Estado |
|---------|-------|--------|--------|
| `gamification_system/functions/process_exercise_completion.sql` | 28 | `SELECT current_level INTO v_old_level` | ❌ **BUG P0** |
| `progress_tracking/functions/06-update_mission_progress.sql` | 45 | `SELECT current_level INTO v_old_level` | ❌ **BUG P0** |
| `educational_content/functions/get_recommended_missions.sql` | 31 | `SELECT us.current_level, ur.current_rank` | ❌ **BUG P0** |
| `educational_content/functions/calculate_learning_path.sql` | 30 | `us.current_level` (en CTE) | ❌ **BUG P0** |

**Razón**: Estas funciones hacen `SELECT` directamente desde `gamification_system.user_stats` que tiene columna `level`, NO `current_level`.

**Error Observable**:
```sql
ERROR: column "current_level" does not exist
LINE 28: SELECT current_level INTO v_old_level
                ^
HINT: Perhaps you meant to reference the column "user_stats.level".
```

---

#### ✅ **CORRECTO**: Funciones SQL que usan `level` correctamente

| Archivo | Línea | Código | Estado |
|---------|-------|--------|--------|
| `gamification_system/functions/08-recalculate_level_on_xp_change.sql` | 20 | `IF v_new_level != NEW.level THEN` | ✅ CORRECTO |
| `gamification_system/functions/08-recalculate_level_on_xp_change.sql` | 21 | `NEW.level := v_new_level` | ✅ CORRECTO |

**Razón**: Usa correctamente `NEW.level` en trigger function.

---

#### ✅ **CORRECTO**: Documentación y Migraciones

| Archivo | Línea | Código | Estado |
|---------|-------|--------|--------|
| `gamification_system/tables/01-user_stats.sql` | 304 | `-- level (SQL) vs current_level (TS): Se mantiene "level" por simplicidad` | ✅ Documentado |
| `docs/03-desarrollo/base-de-datos/MIGRACIONES.md` | 423 | `level as current_level` | ✅ Transformación documentada |

---

## 🔧 CORRECCIONES REQUERIDAS

### Bug P0-01: `process_exercise_completion` línea 28

**Archivo**: `apps/database/ddl/schemas/gamification_system/functions/process_exercise_completion.sql`

**Línea 28 - ANTES** ❌:
```sql
SELECT current_level INTO v_old_level
FROM gamification_system.user_stats
WHERE user_id = p_user_id;
```

**Línea 28 - DESPUÉS** ✅:
```sql
SELECT level INTO v_old_level
FROM gamification_system.user_stats
WHERE user_id = p_user_id;
```

**Justificación**: La tabla `user_stats` tiene columna `level`, no `current_level`. La función accede directamente a la tabla física.

**Dependencias afectadas**: Ninguna (función no exporta `current_level`).

---

### Bug P0-02: `grant_mission_completion_rewards` línea 45

**Archivo**: `apps/database/ddl/schemas/progress_tracking/functions/06-update_mission_progress.sql`

**Línea 45 - ANTES** ❌:
```sql
SELECT current_level INTO v_old_level
FROM gamification_system.user_stats
WHERE user_id = p_user_id;
```

**Línea 45 - DESPUÉS** ✅:
```sql
SELECT level INTO v_old_level
FROM gamification_system.user_stats
WHERE user_id = p_user_id;
```

**Justificación**: Mismo motivo que P0-01.

**Dependencias afectadas**: Ninguna.

---

### Bug P0-03: `get_recommended_missions` línea 31

**Archivo**: `apps/database/ddl/schemas/educational_content/functions/get_recommended_missions.sql`

**Línea 31 - ANTES** ❌:
```sql
SELECT us.current_level, ur.current_rank
INTO v_user_level, v_user_rank
FROM gamification_system.user_stats us
JOIN gamification_system.user_ranks ur ON ur.user_id = us.user_id
WHERE us.user_id = p_user_id;
```

**Línea 31 - DESPUÉS** ✅:
```sql
SELECT us.level, ur.current_rank
INTO v_user_level, v_user_rank
FROM gamification_system.user_stats us
JOIN gamification_system.user_ranks ur ON ur.user_id = us.user_id
WHERE us.user_id = p_user_id;
```

**Justificación**: Tabla `user_stats` usa `level`. Nota: `current_rank` está correcto porque la tabla `user_ranks` SÍ usa `current_rank`.

**Dependencias afectadas**: Ninguna (variable interna `v_user_level`).

---

### Bug P0-04: `calculate_learning_path` línea 30

**Archivo**: `apps/database/ddl/schemas/educational_content/functions/calculate_learning_path.sql`

**Línea 30 - ANTES** ❌:
```sql
WITH user_progress AS (
    SELECT
        us.current_level,
        ur.current_rank
    FROM gamification_system.user_stats us
    JOIN gamification_system.user_ranks ur ON ur.user_id = us.user_id
    WHERE us.user_id = p_user_id
),
```

**Línea 30 - DESPUÉS** ✅:
```sql
WITH user_progress AS (
    SELECT
        us.level,
        ur.current_rank
    FROM gamification_system.user_stats us
    JOIN gamification_system.user_ranks ur ON ur.user_id = us.user_id
    WHERE us.user_id = p_user_id
),
```

**Justificación**: CTE accede directamente a tabla física `user_stats.level`.

**Dependencias afectadas**: Ninguna (CTE interno).

---

## ✅ VALIDACIÓN DE NO-AFECTACIÓN

### 1. Vistas y MVs NO se afectan

Las vistas continúan transformando correctamente:
```sql
SELECT us.level AS current_level  -- ✅ Sigue funcionando
FROM gamification_system.user_stats us
```

**Impacto**: NINGUNO. Las vistas siguen retornando `current_level` al frontend/backend.

---

### 2. Frontend y Backend NO se afectan

El frontend/backend consumen datos de las vistas, que siguen retornando:
```json
{
  "current_level": 12,
  "currentRank": "Nacom"
}
```

**Impacto**: NINGUNO. La API no cambia.

---

### 3. Otras Funciones NO se afectan

Ninguna otra función depende de las funciones corregidas para obtener `current_level`:

**Validación**:
```bash
# Buscar funciones que llamen a process_exercise_completion
grep -r "process_exercise_completion" apps/database/ddl --include="*.sql"
# Resultado: Solo 1 archivo (la definición misma)
```

**Impacto**: NINGUNO. Las funciones son independientes.

---

## 📋 NOMENCLATURA SQL vs TypeScript

### Reglas de Transformación

| Contexto | Nomenclatura | Ejemplo | Razón |
|----------|--------------|---------|-------|
| **Tabla SQL** | snake_case, sin prefijo | `level` | Simplicidad, convención PostgreSQL |
| **Columna SQL con estado** | snake_case, prefijo `current_` | `current_rank` | Indica "valor actual" cuando hay históricos |
| **Vista SQL (salida)** | AS alias, prefijo `current_` | `level AS current_level` | Transformación para API |
| **TypeScript/JSON** | camelCase, prefijo `current` | `currentLevel` | Convención JavaScript |
| **Variable PL/pgSQL** | snake_case, prefijo `v_` | `v_old_level` | Convención PostgreSQL |

---

### Ejemplos de Transformación Correcta

#### 📦 Tabla `user_stats`
```sql
CREATE TABLE gamification_system.user_stats (
    level INTEGER DEFAULT 1 NOT NULL,           -- ✅ Sin "current_"
    current_rank maya_rank DEFAULT 'Ajaw',      -- ✅ CON "current_" (hay user_ranks histórico)
    total_xp INTEGER DEFAULT 0 NOT NULL
);
```

#### 🔄 Vista `leaderboard_xp`
```sql
CREATE VIEW gamification_system.leaderboard_xp AS
SELECT
    us.level AS current_level,          -- ✅ Transformación level → current_level
    ur.current_rank AS maya_rank,       -- ✅ Transformación current_rank → maya_rank
    us.total_xp AS total_xp             -- ✅ Sin transformación (igual nombre)
FROM gamification_system.user_stats us;
```

#### 🛠️ Función SQL
```sql
CREATE FUNCTION process_exercise_completion(p_user_id UUID)
RETURNS TABLE(...) AS $$
DECLARE
    v_old_level INTEGER;                      -- ✅ Variable interna usa v_
BEGIN
    SELECT level INTO v_old_level             -- ✅ Usa "level" de la tabla
    FROM gamification_system.user_stats
    WHERE user_id = p_user_id;

    -- Lógica...
END;
$$;
```

#### 📡 Backend DTO
```typescript
export class LeaderboardEntryDto {
  @Expose()
  current_level!: number;   // ✅ Usa current_level (viene de vista SQL)

  @Expose()
  maya_rank?: string;       // ✅ Usa maya_rank (transformado en vista)
}
```

#### 🎨 Frontend Interface
```typescript
interface UserStats {
  current_level: number;    // ✅ Usa current_level (viene de API)
  currentRank: MayaRank;    // ✅ camelCase opcional para JS
  total_xp: number;
}
```

---

## 🎯 PLAN DE ADAPTACIÓN

### Sprint 0: Corrección Inmediata (1 hora)

#### Tarea 1: Corregir 4 funciones SQL (30 minutos)

```bash
# Script automatizado de corrección
#!/bin/bash

FILES=(
  "gamification_system/functions/process_exercise_completion.sql"
  "progress_tracking/functions/06-update_mission_progress.sql"
  "educational_content/functions/get_recommended_missions.sql"
  "educational_content/functions/calculate_learning_path.sql"
)

for file in "${FILES[@]}"; do
  echo "📝 Corrigiendo: $file"

  # Backup
  cp "apps/database/ddl/schemas/$file" "apps/database/ddl/schemas/$file.backup"

  # Corrección 1: SELECT current_level → SELECT level
  sed -i 's/SELECT current_level INTO/SELECT level INTO/g' "apps/database/ddl/schemas/$file"

  # Corrección 2: us.current_level → us.level
  sed -i 's/us\.current_level/us.level/g' "apps/database/ddl/schemas/$file"

  echo "✅ Corregido: $file"
done

echo ""
echo "🎉 Todas las correcciones aplicadas"
echo "📦 Backups guardados en *.backup"
```

#### Tarea 2: Aplicar en base de datos (10 minutos)

```bash
#!/bin/bash
# Aplicar funciones corregidas

cd apps/database/ddl/schemas

psql -U gamilit_user -d gamilit_db << EOF
\i gamification_system/functions/process_exercise_completion.sql
\i progress_tracking/functions/06-update_mission_progress.sql
\i educational_content/functions/get_recommended_missions.sql
\i educational_content/functions/calculate_learning_path.sql
EOF

echo "✅ Funciones aplicadas en base de datos"
```

#### Tarea 3: Testing (20 minutos)

```sql
-- Test Suite: Validar correcciones

-- Test 1: Verificar columna en user_stats
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'gamification_system'
  AND table_name = 'user_stats'
  AND column_name IN ('level', 'current_level');
-- Esperado: Solo 'level' existe

-- Test 2: Ejecutar process_exercise_completion
SELECT * FROM gamification_system.process_exercise_completion(
    (SELECT id FROM auth_management.profiles WHERE role = 'student' LIMIT 1),
    gen_random_uuid(),
    100
);
-- Esperado: Ejecuta sin error

-- Test 3: Ejecutar grant_mission_completion_rewards
SELECT * FROM progress_tracking.grant_mission_completion_rewards(
    (SELECT id FROM auth_management.profiles WHERE role = 'student' LIMIT 1),
    (SELECT id FROM gamification_system.missions LIMIT 1)
);
-- Esperado: Ejecuta sin error

-- Test 4: Ejecutar get_recommended_missions
SELECT * FROM educational_content.get_recommended_missions(
    (SELECT id FROM auth_management.profiles WHERE role = 'student' LIMIT 1),
    3
);
-- Esperado: Retorna 3 misiones recomendadas

-- Test 5: Ejecutar calculate_learning_path
SELECT * FROM educational_content.calculate_learning_path(
    (SELECT id FROM auth_management.profiles WHERE role = 'student' LIMIT 1),
    5
);
-- Esperado: Retorna 5 items del learning path

-- Test 6: Verificar vistas siguen funcionando
SELECT current_level, maya_rank, total_xp
FROM gamification_system.leaderboard_xp
LIMIT 5;
-- Esperado: Retorna 5 filas con current_level
```

---

### Sprint 1: Documentación (30 minutos)

#### Tarea 4: Actualizar documentación (30 minutos)

**Archivos a actualizar**:

1. `docs/03-desarrollo/base-de-datos/TRIGGERS-Y-FUNCIONES.md`
   - Documentar que funciones usan `level`, no `current_level`
   - Agregar sección "Nomenclatura y Transformaciones"

2. `apps/database/ddl/schemas/gamification_system/tables/01-user_stats.sql`
   - Actualizar comentario línea 304:
   ```sql
   -- NOMENCLATURA:
   -- - level (SQL) vs current_level (TS):
   --   * Tabla usa "level" por simplicidad
   --   * Vistas transforman a "current_level" para API
   --   * Funciones SQL usan "level" (acceso directo a tabla)
   --   * TypeScript usa "current_level" (consume vistas/API)
   ```

3. `docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md`
   - Agregar nota sobre transformación SQL → TS

---

## 📊 MATRIZ DE IMPACTO

| Componente | Requiere Cambio | Impacto | Riesgo |
|------------|----------------|---------|--------|
| **Tablas SQL** | ❌ NO | NINGUNO | ✅ Sin riesgo |
| **Vistas SQL** | ❌ NO | NINGUNO | ✅ Sin riesgo |
| **Funciones SQL (4 archivos)** | ✅ SÍ | BAJO (solo internas) | 🟡 Bajo (bien aisladas) |
| **Backend DTOs** | ❌ NO | NINGUNO | ✅ Sin riesgo |
| **Frontend Interfaces** | ❌ NO | NINGUNO | ✅ Sin riesgo |
| **API Responses** | ❌ NO | NINGUNO | ✅ Sin riesgo |
| **Migraciones** | ❌ NO | NINGUNO | ✅ Sin riesgo |

---

## ✅ CRITERIOS DE ACEPTACIÓN

### Validación Post-Corrección

- [ ] Las 4 funciones SQL usan `level` (no `current_level`)
- [ ] Las vistas/MVs siguen retornando `current_level` (transformación AS)
- [ ] El backend sigue recibiendo `current_level` en JSON
- [ ] El frontend sigue mostrando `current_level` correctamente
- [ ] No hay errores `column "current_level" does not exist`
- [ ] Tests de integración pasan exitosamente
- [ ] Documentación actualizada con nomenclatura clara

---

## 📖 LECCIONES APRENDIDAS

### 1. Patrón de Transformación en Capas

**Principio**: Cada capa usa la nomenclatura apropiada a su contexto:
- SQL físico: Simple y directo (`level`)
- SQL de salida: Transformado para API (`level AS current_level`)
- TypeScript: Convención de API (`current_level` o `currentLevel`)

### 2. Importancia de la Documentación de Nomenclatura

La tabla `user_stats` ya tenía una nota (línea 304) que advertía la discrepancia:
```sql
-- - level (SQL) vs current_level (TS): Se mantiene "level" por simplicidad
```

**Aprendizaje**: Documentar decisiones de nomenclatura evita confusiones futuras.

### 3. Vistas como Capa de Traducción

Las vistas/MVs actúan como **traducción** entre:
- Modelo de datos interno (SQL)
- Contrato de API (JSON/TypeScript)

Este patrón debe mantenerse consistente en todo el sistema.

---

## 🎯 CONCLUSIÓN

### Resumen Ejecutivo

✅ **Modelo coherente identificado**: El sistema tiene un patrón claro de transformación `level` (SQL) → `current_level` (API/TS).

❌ **4 bugs identificados**: Funciones SQL acceden incorrectamente a `current_level` en lugar de `level`.

✅ **Corrección sin impacto**: Las correcciones NO afectan a frontend, backend, vistas ni API.

⏱️ **Tiempo de corrección**: 1 hora (30 min corrección + 20 min testing + 10 min deploy)

🎉 **Resultado**: Sistema 100% coherente y funcional tras correcciones.

---

**Próxima acción**: Aplicar script de corrección automatizado y ejecutar test suite.

---

**Documentos relacionados**:
- [VERIFICACION-BUGS-PENDIENTES.md](./VERIFICACION-BUGS-PENDIENTES.md)
- [CORRECCION-REPORTE-ALINEACION.md](./CORRECCION-REPORTE-ALINEACION.md)
- [REPORTE-ALINEACION-SISTEMA.md](./REPORTE-ALINEACION-SISTEMA.md)

---

**Fin del Análisis de Coherencia**
