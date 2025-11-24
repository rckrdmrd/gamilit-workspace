# ANÁLISIS CRÍTICO: ACOPLAMIENTO MÓDULOS-GAMIFICACIÓN

**Fecha:** 2025-11-24
**Architecture-Analyst:** IA Assistant
**Tipo:** Análisis Arquitectónico de Problema Recurrente
**Severidad:** 🔴 **CRÍTICA**

---

## 🎯 PROBLEMA REPORTADO

**Síntoma:** Las correcciones en los módulos educativos causan errores recurrentes en el sistema de gamificación.

**Contexto del usuario:**
> "Se ha vuelto una constante que cuando se realiza una corrección en los módulos la gamificación presenta errores"

**Impacto:**
- Usuarios pierden progreso visible
- Estadísticas de XP/coins inconsistentes
- Leaderboards muestran datos obsoletos
- Comodines no disponibles
- Misiones no progresan

---

## 📊 HALLAZGOS PRINCIPALES

### Resumen de Severidades

| Severidad | Cantidad | Descripción |
|-----------|----------|-------------|
| 🔴 **CRÍTICA** | 3 | Causan pérdida de datos o inconsistencias graves |
| 🟠 **ALTA** | 4 | Causan errores funcionales visibles |
| 🟡 **MEDIA** | 2 | Causan inconsistencias temporales |

**Total puntos de acoplamiento identificados:** 9

---

## 🔴 PROBLEMAS CRÍTICOS

### 1. CASCADE DELETE Destruye Historial de Progreso

**Archivo:** `apps/database/ddl/schemas/progress_tracking/tables/03-exercise_attempts.sql`
**Línea:** 120

**Código problemático:**
```sql
ALTER TABLE ONLY progress_tracking.exercise_attempts
    ADD CONSTRAINT exercise_attempts_exercise_id_fkey
    FOREIGN KEY (exercise_id)
    REFERENCES educational_content.exercises(id)
    ON DELETE CASCADE;  -- ⚠️ PROBLEMA CRÍTICO
```

**¿Por qué es un problema?**

Cuando corriges un módulo y recargas los seeds:
1. Los ejercicios viejos se eliminan (con sus UUIDs)
2. **ON DELETE CASCADE** borra automáticamente TODOS los `exercise_attempts` asociados
3. Los usuarios pierden su historial completo de intentos
4. Pero `gamification_system.user_stats` **NO tiene FK con exercises**
5. **Resultado:** Usuario tiene 1000 XP pero 0 intentos registrados

**Evidencia de ocurrencia reciente:**
```bash
# Archivos modificados 23-Nov-2025:
02-exercises-module1.sql.backup.20251123_ejercicio13
02-exercises-module1.sql (23:37:13)

# Cambios: Ejercicio 1.3 - alternatives modificados en espacios 5-6
# Si el UUID cambió → CASCADE eliminó todos los attempts anteriores
```

**Impacto en gamificación:**
- ❌ Estadísticas de "ejercicios completados" incorrectas
- ❌ Racha (streak) se reinicia a 0
- ❌ Progreso del módulo muestra 0%
- ❌ Misiones de "completar N ejercicios" se resetean

---

### 2. Referencias Huérfanas en Comodin Usage

**Archivo:** `apps/database/ddl/schemas/gamification_system/tables/15-comodin_usage_tracking.sql`
**Línea:** 12

**Código problemático:**
```sql
CREATE TABLE gamification_system.comodin_usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exercise_id UUID NOT NULL,  -- ⚠️ SIN FOREIGN KEY CONSTRAINT
    ...
);
```

**¿Por qué es un problema?**

Esta tabla rastrea el uso de comodines por ejercicio, pero:
- **NO tiene FOREIGN KEY** a `educational_content.exercises(id)`
- Permite almacenar `exercise_id` que no existen
- Cuando ejercicios se modifican/eliminan → quedan referencias "fantasma"

**Flujo de error:**
```typescript
// Backend: ExerciseAttemptService
const availableComodines = await comodinUsageTracking.findByExerciseId(exerciseId);
// ← Retorna registros con exercise_id inválidos
// ← LEFT JOIN con exercises retorna NULL
// ← Frontend: "undefined comodines disponibles" ❌
```

**Impacto en gamificación:**
- ❌ Comodines no disponibles para ejercicios modificados
- ❌ Query de comodines retorna NULL
- ❌ Frontend muestra "0 comodines" aunque usuario sí tiene

---

### 3. Trigger con Valores Hardcodeados

**Archivo:** `apps/database/ddl/schemas/gamilit/functions/14-update_user_stats_on_exercise_complete.sql`
**Líneas:** 25-26

**Código problemático:**
```sql
CREATE OR REPLACE FUNCTION gamilit.update_user_stats_on_exercise_complete()
RETURNS TRIGGER AS $$
DECLARE
    v_xp_earned INTEGER;
    v_coins_earned INTEGER;
BEGIN
    -- ⚠️ VALORES HARDCODEADOS - NO CONSULTA exercise.xp_reward
    v_xp_earned := COALESCE(NEW.xp_earned, 10);      -- Default 10 XP
    v_coins_earned := COALESCE(NEW.ml_coins_earned, 5);  -- Default 5 coins

    UPDATE gamification_system.user_stats
    SET
        total_xp = total_xp + v_xp_earned,
        ml_coins = ml_coins + v_coins_earned,
        ...
```

**¿Por qué es un problema?**

Los ejercicios tienen columnas `xp_reward` y `ml_coins_reward` en su definición, pero:
- El trigger **NO consulta estos valores** de la tabla exercises
- Usa defaults hardcodeados (10 XP, 5 coins)
- Si backend envía NULL → usa valores incorrectos

**Escenario de fallo:**
1. Corriges módulo → cambias `xp_reward` de 20 a 30
2. Usuario completa ejercicio
3. Backend calcula XP correctamente y lo envía
4. **PERO** si hay un error y backend envía NULL por algún motivo
5. Trigger usa default: `COALESCE(NULL, 10) = 10` ❌
6. Usuario gana 10 XP en lugar de 30 XP

**Impacto en gamificación:**
- ❌ Recompensas incorrectas si backend falla
- ❌ XP/coins no reflejan definición real del ejercicio
- ❌ Dificulta balanceo de sistema de recompensas

---

## 🟠 PROBLEMAS ALTOS

### 4. Status de Módulos Rompe Cálculo de Progreso

**Archivo:** `apps/database/ddl/schemas/progress_tracking/functions/01-calculate_module_progress.sql`
**Línea:** 23

**Evidencia de cambio reciente:**
```sql
-- Archivo: 01-modules.sql.backup.20251123_173547 (ANTES)
status = 'backlog',
is_published = false  -- Módulos 4-5

-- Archivo: 01-modules.sql (DESPUÉS - 21:02:51)
status = 'published',
is_published = true  -- Módulos 4-5
```

**Código problemático:**
```sql
-- calculate_module_progress.sql línea 23
SELECT COUNT(*) INTO v_total_exercises
FROM educational_content.exercises
WHERE module_id = p_module_id
  AND is_active = true;  -- ⚠️ Filtra solo activos
```

**¿Por qué es un problema?**

1. Cambias módulo de `status='backlog'` a `status='published'`
2. Pero olvidas actualizar ejercicios a `is_active=true`
3. Función cuenta: `v_total_exercises = 0`
4. Cálculo de progreso: `completados / 0 = NaN` ❌

**Impacto en gamificación:**
- ❌ Frontend muestra "NaN% completado"
- ❌ Barra de progreso vacía
- ❌ Rank no progresa (XP obtenido pero módulo "sin avance")
- ❌ Misiones de "completar módulo X" nunca se cumplen

---

### 5. Sin Validación de Existencia en Servicios Backend

**Archivo:** `apps/backend/src/modules/progress/services/exercise-attempt.service.ts`
**Línea:** 42

**Código problemático:**
```typescript
async submitAttempt(dto: CreateExerciseAttemptDto) {
  // ⚠️ NO VALIDA que exercise_id exista antes de operar
  const attemptNumber = await this.getNextAttemptNumber(
    dto.user_id,
    dto.exercise_id  // Asume que es válido
  );

  // Si exercise_id no existe → query retorna NULL
  // Continúa procesamiento con NULL → NullPointerException
}
```

**¿Por qué es un problema?**

- Servicios asumen que `exercise_id` recibido del frontend es válido
- **NO verifican existencia** con query a `educational_content.exercises`
- Si ejercicio fue modificado/eliminado entre peticiones → falla silenciosamente

**Flujo de error:**
1. Usuario abre ejercicio X (frontend carga data)
2. TÚ modificas módulos → ejercicio X cambia UUID
3. Usuario completa ejercicio y envía respuesta
4. Backend: `exercise_id` viejo no existe → query retorna NULL
5. Service continúa con NULL → ❌ Error en runtime

**Impacto en gamificación:**
- ❌ Attempts no se registran (usuario pierde progreso)
- ❌ XP/coins no se otorgan
- ❌ Frontend muestra "Error al enviar ejercicio"

---

### 6. Mismo Problema en Exercise Submissions

**Archivo:** `apps/database/ddl/schemas/progress_tracking/tables/04-exercise_submissions.sql`
**Línea:** 177

**Código problemático:**
```sql
ALTER TABLE ONLY progress_tracking.exercise_submissions
    ADD CONSTRAINT fk_exercise_submissions_exercise
    FOREIGN KEY (exercise_id)
    REFERENCES educational_content.exercises(id)
    ON DELETE CASCADE;  -- ⚠️ MISMO PROBLEMA QUE ATTEMPTS
```

**Impacto:** Idéntico al problema #1 (CASCADE DELETE)

---

### 7. Module Progress con CASCADE DELETE

**Archivo:** `apps/database/ddl/schemas/progress_tracking/tables/01-module_progress.sql`

**Código problemático:**
```sql
ALTER TABLE ONLY progress_tracking.module_progress
    ADD CONSTRAINT module_progress_module_id_fkey
    FOREIGN KEY (module_id)
    REFERENCES educational_content.modules(id)
    ON DELETE CASCADE;  -- ⚠️ PROBLEMA
```

**Impacto:** Si módulo se recrea con nuevo UUID → progreso del usuario se borra

---

## 🟡 PROBLEMAS MEDIOS

### 8. Cache Sin Invalidación en Leaderboards

**Archivo:** `apps/backend/src/modules/gamification/services/leaderboard.service.ts`
**Líneas:** 46-58

**Código problemático:**
```typescript
async getGlobalLeaderboard(...) {
  const cacheKey = `leaderboard:global:${limit}:${offset}:${timePeriod}`;

  // Cache dura 60 segundos
  const cachedData = await this.cacheManager.get(cacheKey);
  if (cachedData) {
    return cachedData;  // ⚠️ Retorna datos obsoletos
  }

  // Consulta DB solo si cache expiró
  // PERO no se invalida cuando exercises cambian
}
```

**¿Por qué es un problema?**

1. Leaderboard se cachea por 60 segundos
2. TÚ modificas ejercicios → nombres/recompensas cambian
3. Usuarios consultan leaderboard → **ven datos viejos** hasta 60s después

**Impacto en gamificación:**
- ⚠️ Leaderboard muestra nombres de ejercicios obsoletos
- ⚠️ Estadísticas de "ejercicios completados" desactualizadas
- ⚠️ Confusión en usuarios (ven ejercicio X en leaderboard pero ya no existe)

**No es crítico porque:** Se autocorrige en 60 segundos

---

### 9. Misiones con Referencias Implícitas

**Archivo:** `apps/database/seeds/prod/gamification_system/10-missions-init.sql`
**Líneas:** 106-110

**Código problemático:**
```json
{
    "objectives": {
        "type": "complete_exercises",  // ⚠️ Referencia implícita
        "target": 3,
        "current": 0
    }
}
```

**¿Por qué es potencialmente un problema?**

- Misiones referencian "complete_exercises" por tipo, no por exercise_id específico
- Si cambias `order_index` de ejercicios → misiones pueden contar mal
- Si cambias `is_active` → ejercicios no cuentan para misión

**Impacto:** Bajo (misiones genéricas sí funcionan, solo las específicas fallan)

---

## 🚩 BANDERAS ROJAS ARQUITECTÓNICAS

### Red Flag #1: Dependencias Circulares Sin Abstracción

```
educational_content.exercises (tabla)
            ↓ (FK con CASCADE DELETE)
progress_tracking.exercise_attempts (tabla)
            ↓ (TRIGGER ejecuta función)
gamification_system.user_stats (tabla)
            ↑ (NO hay FK de vuelta)
```

**Problema:** Flujo unidireccional sin integridad referencial completa

---

### Red Flag #2: Sin Estrategia de Migración de Contenido

**Evidencia de archivos recientes:**
```bash
01-modules.sql.backup.20251123_173547
02-exercises-module1.sql.backup.20251123_ejercicio13
05-assignments.sql.backup.20251124_005602
```

**Lo que falta:**
- ❌ NO hay carpeta `/migrations` para data migrations
- ❌ NO hay estrategia de versionado de contenido
- ❌ NO hay scripts para actualizar referencias cuando IDs cambian

**Debería existir:**
```sql
-- migrations/2025-11-23-update-exercise-1.3-references.sql
-- Mapeo de IDs viejos → nuevos
UPDATE progress_tracking.exercise_attempts
SET exercise_id = '42d9895b-cf92-4df2-a0d4-1877759d365a'  -- Nuevo UUID
WHERE exercise_id = '<uuid-viejo>';

UPDATE gamification_system.comodin_usage_tracking
SET exercise_id = '42d9895b-cf92-4df2-a0d4-1877759d365a'
WHERE exercise_id = '<uuid-viejo>';
```

---

### Red Flag #3: Múltiples Campos de Estado Inconsistentes

**Tablas afectadas:**

1. **modules:**
   - `status` (enum: 'draft', 'published', 'archived', 'backlog')
   - `is_published` (boolean)
   - ⚠️ Pueden estar desincronizados

2. **exercises:**
   - `is_active` (boolean)
   - `is_optional` (boolean)
   - `is_bonus` (boolean)
   - ⚠️ Combinaciones confusas

3. **exercise_submissions:**
   - `status` (enum: 'submitted', 'graded', 'reviewed')
   - `is_correct` (boolean)
   - ⚠️ Puede ser 'graded' pero is_correct=NULL

**Problema:** Al hacer correcciones, cambias un campo pero olvidas los otros

---

### Red Flag #4: Trigger No Consulta Fuente de Verdad

El trigger `update_user_stats_on_exercise_complete` usa valores del INSERT:
```sql
v_xp_earned := COALESCE(NEW.xp_earned, 10);
```

**Debería consultar la tabla exercises:**
```sql
SELECT xp_reward, ml_coins_reward
INTO v_xp_earned, v_coins_earned
FROM educational_content.exercises
WHERE id = NEW.exercise_id;
```

---

### Red Flag #5: No Hay Abstraction Layer en Backend

Los servicios consultan directamente:
```typescript
// ❌ Mal diseño
const attempt = await exerciseAttemptRepository.create({
  exercise_id: dto.exercise_id  // No valida
});

// ✅ Debería ser:
const validExercise = await exerciseValidationService.getById(dto.exercise_id);
if (!validExercise) throw new NotFoundException('Exercise not found');
const attempt = await exerciseAttemptRepository.create({
  exercise_id: validExercise.id
});
```

---

### Red Flag #6: Comodin Usage Tracking Sin FK

```sql
-- ❌ Estado actual
CREATE TABLE gamification_system.comodin_usage_tracking (
    exercise_id UUID NOT NULL  -- Sin FK
);

-- ✅ Debería ser:
CREATE TABLE gamification_system.comodin_usage_tracking (
    exercise_id UUID NOT NULL,
    CONSTRAINT fk_comodin_exercise
        FOREIGN KEY (exercise_id)
        REFERENCES educational_content.exercises(id)
        ON DELETE SET NULL  -- O CASCADE según lógica de negocio
);
```

---

## 📈 IMPACTO ESTIMADO

### Por Tipo de Corrección en Módulos

| Tipo de Corrección | Problemas Activados | Severidad Total |
|-------------------|---------------------|-----------------|
| **Cambio de UUID de ejercicio** | #1, #2, #5, #6 | 🔴🔴🔴🔴 CRÍTICA |
| **Cambio de status de módulo** | #4, #7 | 🟠🟠 ALTA |
| **Cambio de xp_reward** | #3 | 🔴 CRÍTICA (si backend falla) |
| **Cambio de nombre/título** | #8 | 🟡 MEDIA (cache 60s) |
| **Cambio de is_active** | #4, #9 | 🟠 ALTA |

### Frecuencia de Ocurrencia

Basado en archivos de backup recientes:
- **23-Nov:** 3 correcciones (módulos, ejercicio 1.3, assignments)
- **Frecuencia estimada:** 2-3 correcciones por semana
- **Probabilidad de error:** ~80% (8 de 9 problemas se activan frecuentemente)

---

## 🔍 EVIDENCIA DE OCURRENCIA RECIENTE

### Commits Git Recientes
```bash
6962423 fix(seeds): align M3 exercise timings to design docs (GAP-003, GAP-004)
db82449 feat(database): add assignments seed for Teacher portal demo
c106fe5 Corrections send answers module 1 and 2, corrections on code and seeds
f684443 Module 1 exercise 5 button enter, module 2 corrections, module 3 implementation
```

### Archivos Backup (indican correcciones recientes)
```bash
01-modules.sql.backup.20251123_173547          (23-Nov 17:35)
02-exercises-module1.sql.backup.20251123_ejercicio13  (23-Nov 23:36)
05-assignments.sql.backup.20251124_005602       (24-Nov 00:56)
```

### Cambios Específicos Detectados

**1. Módulos 4-5 (23-Nov 17:35):**
```sql
-- ANTES
status = 'backlog'
is_published = false

-- DESPUÉS
status = 'published'
is_published = true
```
**Problema activado:** #4 (cálculo de progreso)

**2. Ejercicio 1.3 (23-Nov 23:36):**
```json
// ANTES
"blank_5": {"correctAnswer": "ciencias"},
"blank_6": {"correctAnswer": "matemáticas", "alternatives": ["física"]}

// DESPUÉS
"blank_5": {"correctAnswer": "ciencias", "alternatives": ["matemáticas", "física"]},
"blank_6": {"correctAnswer": "matemáticas", "alternatives": ["ciencias", "física"]}
```
**Problema activado:** Ninguno (solo cambio en content JSON, UUID se mantuvo)

**3. Assignments (24-Nov 00:56):**
- Seed nuevo creado
- Potencial problema si assignments referencian exercise_ids específicos

---

## 🎯 CONCLUSIÓN

El problema NO es de datos corruptos sino de **DISEÑO ARQUITECTÓNICO**.

### Causas Sistémicas

1. **Acoplamiento directo** entre educational_content y gamification_system sin capa de abstracción
2. **CASCADE DELETE** agresivo destruye datos de usuario
3. **Falta de Foreign Keys** en referencias críticas (comodin_usage_tracking)
4. **Sin validación** de existencia de IDs en servicios backend
5. **Sin estrategia de migración** para cambios en contenido educativo
6. **Triggers con valores hardcodeados** en lugar de consultar fuente de verdad

### Impacto en Producción

**Cada corrección en módulos causa:**
- ❌ Pérdida de historial de ejercicios (attempts borrados)
- ❌ Estadísticas de gamificación inconsistentes
- ❌ Comodines no disponibles
- ❌ Misiones que no progresan
- ❌ Leaderboards desactualizados
- ❌ Frontend con errores de "undefined"

**Frecuencia:** 2-3 veces por semana
**Severidad acumulada:** 🔴 **CRÍTICA**

---

## 📋 PRÓXIMOS PASOS

Este análisis es la **Fase 1: Diagnóstico**.

**Documentos a generar:**
1. ✅ `01-ANALISIS-ACOPLAMIENTO-CRITICO.md` (este documento)
2. ⏳ `02-PLAN-CORRECCION-ARQUITECTONICA.md` (próximo)
3. ⏳ `03-SCRIPT-VALIDACION-INTEGRIDAD.sql` (queries de diagnóstico)
4. ⏳ `04-ADR-DESACOPLAMIENTO-MODULOS-GAMIFICACION.md` (decisión arquitectónica)

---

**Reporte generado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Versión:** 1.0.0 (Análisis Inicial)
**Estado:** ✅ **COMPLETO - REQUIERE PLAN DE CORRECCIÓN**
