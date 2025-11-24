# PLAN DE CORRECCIÓN: DESACOPLAMIENTO MÓDULOS-GAMIFICACIÓN

**Fecha:** 2025-11-24
**Architecture-Analyst:** IA Assistant
**Basado en:** 01-ANALISIS-ACOPLAMIENTO-CRITICO.md
**Prioridad:** 🔴 **CRÍTICA**

---

## 🎯 OBJETIVO

Implementar desacoplamiento arquitectónico entre `educational_content` y `gamification_system` para que las correcciones en módulos NO causen errores en gamificación.

---

## 📊 ESTRATEGIA GENERAL

### Principios de Diseño

1. **Soft Delete** en lugar de CASCADE DELETE
2. **Foreign Keys** en TODAS las referencias
3. **Validation Layer** en servicios backend
4. **Content Versioning** para cambios en ejercicios
5. **Cache Invalidation** hooks en operaciones críticas

---

## 🔧 CORRECCIONES POR PRIORIDAD

### FASE 1: CORRECCIONES CRÍTICAS (🔴 P0 - Inmediato)

#### 1.1. Reemplazar CASCADE DELETE por Soft Delete

**Problema:** FK constraints con `ON DELETE CASCADE` borran progreso de usuarios

**Archivos a modificar:**
- `apps/database/ddl/schemas/progress_tracking/tables/03-exercise_attempts.sql`
- `apps/database/ddl/schemas/progress_tracking/tables/04-exercise_submissions.sql`
- `apps/database/ddl/schemas/progress_tracking/tables/01-module_progress.sql`

**Cambio requerido:**

```sql
-- ❌ ANTES (línea 120 de exercise_attempts.sql)
ALTER TABLE ONLY progress_tracking.exercise_attempts
    ADD CONSTRAINT exercise_attempts_exercise_id_fkey
    FOREIGN KEY (exercise_id)
    REFERENCES educational_content.exercises(id)
    ON DELETE CASCADE;  -- Borra attempts cuando exercise se elimina

-- ✅ DESPUÉS
ALTER TABLE ONLY progress_tracking.exercise_attempts
    ADD CONSTRAINT exercise_attempts_exercise_id_fkey
    FOREIGN KEY (exercise_id)
    REFERENCES educational_content.exercises(id)
    ON DELETE SET NULL;  -- Preserva attempts, marca exercise_id como NULL
```

**Adicional:** Agregar columna `deleted_at` a exercises para soft delete

```sql
-- exercises.sql - agregar después de línea 68
ALTER TABLE educational_content.exercises
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Crear índice
CREATE INDEX idx_exercises_deleted_at
ON educational_content.exercises(deleted_at)
WHERE deleted_at IS NULL;
```

**Migración de datos existentes:** NO requerida (cambio solo afecta futuros deletes)

---

#### 1.2. Agregar Foreign Key a comodin_usage_tracking

**Problema:** Tabla permite exercise_id inválidos (sin FK constraint)

**Archivo a modificar:**
- `apps/database/ddl/schemas/gamification_system/tables/15-comodin_usage_tracking.sql`

**Cambio requerido:**

```sql
-- ❌ ANTES (línea 12)
exercise_id UUID NOT NULL,

-- ✅ DESPUÉS (agregar constraint después de línea 40)
ALTER TABLE ONLY gamification_system.comodin_usage_tracking
    ADD CONSTRAINT fk_comodin_usage_exercise
    FOREIGN KEY (exercise_id)
    REFERENCES educational_content.exercises(id)
    ON DELETE SET NULL;  -- Permite consultar histórico aunque exercise no exista
```

**Migración de datos existentes:**

```sql
-- Antes de agregar FK, limpiar referencias inválidas
UPDATE gamification_system.comodin_usage_tracking
SET exercise_id = NULL
WHERE exercise_id NOT IN (SELECT id FROM educational_content.exercises);

-- Ahora sí agregar FK (fallará si aún hay inválidos)
```

---

#### 1.3. Modificar Trigger para Consultar Ejercicio Real

**Problema:** Trigger usa defaults hardcodeados en lugar de consultar xp_reward

**Archivo a modificar:**
- `apps/database/ddl/schemas/gamilit/functions/14-update_user_stats_on_exercise_complete.sql`

**Cambio requerido:**

```sql
-- ❌ ANTES (líneas 21-26)
DECLARE
    v_xp_earned INTEGER;
    v_coins_earned INTEGER;
BEGIN
    v_xp_earned := COALESCE(NEW.xp_earned, 10);      -- Hardcoded!
    v_coins_earned := COALESCE(NEW.ml_coins_earned, 5);  -- Hardcoded!

-- ✅ DESPUÉS
DECLARE
    v_xp_earned INTEGER;
    v_coins_earned INTEGER;
    v_exercise_xp INTEGER;
    v_exercise_coins INTEGER;
BEGIN
    -- Consultar rewards reales del ejercicio
    SELECT xp_reward, ml_coins_reward
    INTO v_exercise_xp, v_exercise_coins
    FROM educational_content.exercises
    WHERE id = NEW.exercise_id;

    -- Si no encontrado (ejercicio eliminado), usar defaults
    v_exercise_xp := COALESCE(v_exercise_xp, 10);
    v_exercise_coins := COALESCE(v_exercise_coins, 5);

    -- Usar valor enviado por backend, o el del ejercicio si NULL
    v_xp_earned := COALESCE(NEW.xp_earned, v_exercise_xp);
    v_coins_earned := COALESCE(NEW.ml_coins_earned, v_exercise_coins);
```

**Ventajas:**
- ✅ Siempre usa rewards correctos del ejercicio
- ✅ Tiene fallback si ejercicio eliminado
- ✅ Compatible con backend que ya envía valores

---

### FASE 2: CORRECCIONES ALTAS (🟠 P1 - Esta Semana)

#### 2.1. Agregar Validación de Existencia en Servicios Backend

**Problema:** Servicios asumen exercise_id es válido sin verificar

**Archivos a modificar:**
- `apps/backend/src/modules/progress/services/exercise-attempt.service.ts`
- `apps/backend/src/modules/progress/services/exercise-submission.service.ts`

**Cambio requerido:**

```typescript
// ❌ ANTES (exercise-attempt.service.ts línea 40-50)
async submitAttempt(dto: CreateExerciseAttemptDto) {
  const attemptNumber = await this.getNextAttemptNumber(
    dto.user_id,
    dto.exercise_id  // NO valida
  );
  // ... continúa sin verificar
}

// ✅ DESPUÉS
async submitAttempt(dto: CreateExerciseAttemptDto) {
  // Validar que ejercicio existe y está activo
  const exercise = await this.exerciseRepository.findOne({
    where: { id: dto.exercise_id, is_active: true, deleted_at: null }
  });

  if (!exercise) {
    throw new NotFoundException(
      `Exercise ${dto.exercise_id} not found or inactive`
    );
  }

  const attemptNumber = await this.getNextAttemptNumber(
    dto.user_id,
    dto.exercise_id
  );
  // ... continúa con exercise validado
}
```

**Aplicar mismo patrón en:**
- `submitExercise()` (exercise-submission.service.ts)
- `gradeSubmission()` (exercise-submission.service.ts)
- `getExerciseAttempts()` (exercise-attempt.service.ts)

---

#### 2.2. Actualizar Función calculate_module_progress

**Problema:** Cuenta 0 ejercicios si is_active = false → división por 0

**Archivo a modificar:**
- `apps/database/ddl/schemas/progress_tracking/functions/01-calculate_module_progress.sql`

**Cambio requerido:**

```sql
-- ❌ ANTES (línea 23)
SELECT COUNT(*) INTO v_total_exercises
FROM educational_content.exercises
WHERE module_id = p_module_id
  AND is_active = true;  -- Problema: puede ser 0

-- ✅ DESPUÉS
SELECT COUNT(*) INTO v_total_exercises
FROM educational_content.exercises
WHERE module_id = p_module_id
  AND is_active = true
  AND deleted_at IS NULL;  -- Excluir soft-deleted

-- Agregar validación de división por cero
IF v_total_exercises = 0 THEN
    -- Si módulo no tiene ejercicios activos, retornar 0% progreso
    RETURN 0;
END IF;

-- Continuar con cálculo normal
v_progress_percentage := (v_completed_exercises::NUMERIC / v_total_exercises) * 100;
```

---

#### 2.3. Implementar Cache Invalidation Hooks

**Problema:** Cache de leaderboards/stats no se invalida cuando exercises cambian

**Archivos a crear:**
- `apps/backend/src/modules/educational/listeners/exercise-updated.listener.ts`

**Código propuesto:**

```typescript
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CacheManager } from '@nestjs/cache-manager';

@Injectable()
export class ExerciseUpdatedListener {
  constructor(private cacheManager: CacheManager) {}

  @OnEvent('exercise.updated')
  async handleExerciseUpdated(payload: { exerciseId: string; moduleId: string }) {
    // Invalidar caches relacionados
    await this.cacheManager.del(`leaderboard:global:*`);
    await this.cacheManager.del(`module:${payload.moduleId}:progress:*`);
    await this.cacheManager.del(`exercise:${payload.exerciseId}:*`);

    console.log(`[Cache] Invalidated caches for exercise ${payload.exerciseId}`);
  }

  @OnEvent('module.updated')
  async handleModuleUpdated(payload: { moduleId: string }) {
    await this.cacheManager.del(`module:${payload.moduleId}:*`);
    await this.cacheManager.del(`leaderboard:*`);
  }
}
```

**Modificar servicios para emitir eventos:**

```typescript
// educational/services/exercises.service.ts
async updateExercise(id: string, data: UpdateExerciseDto) {
  const exercise = await this.exerciseRepository.update(id, data);

  // Emitir evento para listeners
  this.eventEmitter.emit('exercise.updated', {
    exerciseId: id,
    moduleId: exercise.module_id
  });

  return exercise;
}
```

---

### FASE 3: CORRECCIONES MEDIAS (🟡 P2 - Próximas 2 Semanas)

#### 3.1. Implementar Content Versioning

**Objetivo:** Rastrear cambios en ejercicios sin perder referencias

**Nuevo schema a crear:**
- `apps/database/ddl/schemas/educational_content/tables/20-exercise_versions.sql`

**Estructura propuesta:**

```sql
CREATE TABLE educational_content.exercise_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exercise_id UUID NOT NULL REFERENCES educational_content.exercises(id),
    version INTEGER NOT NULL,
    content JSONB NOT NULL,
    solution JSONB,
    xp_reward INTEGER,
    ml_coins_reward INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    change_notes TEXT,

    UNIQUE (exercise_id, version)
);

-- Índices
CREATE INDEX idx_exercise_versions_exercise_id ON educational_content.exercise_versions(exercise_id);
CREATE INDEX idx_exercise_versions_created_at ON educational_content.exercise_versions(created_at DESC);
```

**Ventajas:**
- ✅ Historial completo de cambios en ejercicios
- ✅ Permite rollback a versión anterior
- ✅ exercise_id se mantiene → NO rompe referencias
- ✅ Audit trail para debugging

---

#### 3.2. Crear Abstraction Layer en Backend

**Objetivo:** Capa de validación que oculta complejidad de FKs

**Nuevo servicio a crear:**
- `apps/backend/src/modules/educational/services/exercise-validation.service.ts`

**Código propuesto:**

```typescript
@Injectable()
export class ExerciseValidationService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepo: Repository<Exercise>
  ) {}

  /**
   * Validates exercise exists, is active, and not soft-deleted
   * Throws NotFoundException if invalid
   */
  async validateAndGet(exerciseId: string): Promise<Exercise> {
    const exercise = await this.exerciseRepo.findOne({
      where: {
        id: exerciseId,
        is_active: true,
        deleted_at: null
      },
      relations: ['module']
    });

    if (!exercise) {
      throw new NotFoundException(
        `Exercise ${exerciseId} not found, inactive, or deleted`
      );
    }

    // Validar módulo también activo
    if (!exercise.module.is_published) {
      throw new BadRequestException(
        `Exercise ${exerciseId} belongs to unpublished module`
      );
    }

    return exercise;
  }

  /**
   * Batch validation for multiple exercises
   */
  async validateMany(exerciseIds: string[]): Promise<Exercise[]> {
    const exercises = await this.exerciseRepo.find({
      where: {
        id: In(exerciseIds),
        is_active: true,
        deleted_at: null
      }
    });

    if (exercises.length !== exerciseIds.length) {
      const foundIds = exercises.map(e => e.id);
      const missingIds = exerciseIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(
        `Exercises not found: ${missingIds.join(', ')}`
      );
    }

    return exercises;
  }
}
```

**Uso en otros servicios:**

```typescript
// exercise-attempt.service.ts
constructor(
  private exerciseValidation: ExerciseValidationService
) {}

async submitAttempt(dto: CreateExerciseAttemptDto) {
  // Validar en una línea
  const exercise = await this.exerciseValidation.validateAndGet(dto.exercise_id);

  // Continuar con lógica, exercise garantizado válido
  const attemptNumber = await this.getNextAttemptNumber(dto.user_id, exercise.id);
  // ...
}
```

---

#### 3.3. Consolidar Campos de Estado

**Objetivo:** Eliminar redundancia entre status/is_published/is_active

**Opción A: Usar solo ENUM status (recomendado)**

```sql
-- modules.sql
ALTER TABLE educational_content.modules
DROP COLUMN is_published;  -- Redundante con status='published'

-- Agregar constraint para validar consistencia
ALTER TABLE educational_content.modules
ADD CONSTRAINT check_status_valid
CHECK (status IN ('draft', 'published', 'archived', 'backlog'));
```

**Opción B: Agregar trigger de sincronización**

```sql
CREATE OR REPLACE FUNCTION educational_content.sync_module_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-sync is_published basado en status
    NEW.is_published := (NEW.status = 'published');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_module_status
BEFORE INSERT OR UPDATE ON educational_content.modules
FOR EACH ROW
EXECUTE FUNCTION educational_content.sync_module_status();
```

---

### FASE 4: MEJORAS ARQUITECTÓNICAS (📐 P3 - Largo Plazo)

#### 4.1. Implementar Event Sourcing para Cambios Críticos

**Objetivo:** Audit trail completo de cambios en educational_content

**Nueva tabla:**

```sql
CREATE TABLE audit.educational_content_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,  -- 'exercise.created', 'exercise.updated', etc.
    entity_type VARCHAR(50) NOT NULL,  -- 'exercise', 'module', etc.
    entity_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    change_reason TEXT
);

CREATE INDEX idx_events_entity ON audit.educational_content_events(entity_type, entity_id);
CREATE INDEX idx_events_timestamp ON audit.educational_content_events(changed_at DESC);
```

**Ventajas:**
- ✅ Debugging completo ("¿quién cambió este ejercicio?")
- ✅ Rollback a cualquier punto en el tiempo
- ✅ Compliance/auditoría

---

#### 4.2. Implementar UUID Stability Layer

**Objetivo:** Permitir cambios en contenido sin cambiar UUIDs

**Enfoque:**
- Nunca regenerar UUIDs de ejercicios/módulos
- Usar `exercise_versions` para cambios de contenido
- Mantener UUID estable → FK references nunca se rompen

**Validación en seeds:**

```sql
-- Agregar check en seed scripts
DO $$
DECLARE
    v_existing_uuid UUID;
BEGIN
    -- Verificar que UUID del ejercicio 1.3 no cambió
    SELECT id INTO v_existing_uuid
    FROM educational_content.exercises
    WHERE order_index = 3
      AND module_id = '<module-1-uuid>';

    IF v_existing_uuid IS NOT NULL AND
       v_existing_uuid != '42d9895b-cf92-4df2-a0d4-1877759d365a' THEN
        RAISE EXCEPTION 'UUID change detected for exercise 1.3. This breaks references!';
    END IF;
END $$;
```

---

## 📋 PLAN DE EJECUCIÓN

### Semana 1 (Inmediato)

**Día 1:**
- [ ] Implementar Fase 1.1 (Soft Delete)
- [ ] Implementar Fase 1.2 (FK en comodin_usage_tracking)
- [ ] Ejecutar script de validación (`03-SCRIPT-VALIDACION-INTEGRIDAD.sql`)

**Día 2:**
- [ ] Implementar Fase 1.3 (Trigger con consulta real)
- [ ] Testing en DEV
- [ ] Validar con recreación de BD

**Día 3:**
- [ ] Implementar Fase 2.1 (Validación en servicios)
- [ ] Implementar Fase 2.2 (calculate_module_progress)
- [ ] Code review

**Día 4-5:**
- [ ] Testing exhaustivo
- [ ] Documentar cambios
- [ ] Preparar despliegue a STAGING

---

### Semana 2

**Día 1-2:**
- [ ] Implementar Fase 2.3 (Cache invalidation)
- [ ] Testing de invalidación

**Día 3-4:**
- [ ] Despliegue a STAGING
- [ ] Validación con datos reales
- [ ] Correcciones de bugs encontrados

**Día 5:**
- [ ] Despliegue a PRODUCTION
- [ ] Monitoreo 24h

---

### Semanas 3-4

**Fase 3:** Content Versioning + Abstraction Layer + Consolidación de estado

---

### Mes 2+

**Fase 4:** Event Sourcing + UUID Stability

---

## ✅ CRITERIOS DE ÉXITO

### Para Fase 1 (P0)

- [ ] CASCADE DELETE reemplazado por SET NULL en 3 tablas
- [ ] FK agregado a comodin_usage_tracking
- [ ] Trigger consulta exercise.xp_reward real
- [ ] Recreación de BD exitosa sin errores
- [ ] 0 orphaned references en queries de validación

### Para Fase 2 (P1)

- [ ] Validación en 4 servicios backend
- [ ] calculate_module_progress maneja división por 0
- [ ] Cache invalidation funcional
- [ ] Tests E2E pasando (corrección → sin error gamificación)

### Para Fase 3 (P2)

- [ ] Tabla exercise_versions creada
- [ ] ExerciseValidationService implementado
- [ ] Status fields consolidados
- [ ] Documentación ADR completa

### Global

- [ ] **0 errores en gamificación** después de correcciones en módulos
- [ ] Progreso de usuarios preservado
- [ ] Estadísticas consistentes
- [ ] Leaderboards actualizados correctamente

---

## 🚨 RIESGOS Y MITIGACIÓN

### Riesgo #1: Datos Existentes Inconsistentes

**Probabilidad:** ALTA
**Impacto:** MEDIO

**Mitigación:**
```sql
-- Ejecutar ANTES de aplicar Fase 1
-- Limpiar exercise_attempts huérfanos
DELETE FROM progress_tracking.exercise_attempts
WHERE exercise_id NOT IN (SELECT id FROM educational_content.exercises);

-- Limpiar comodin_usage_tracking huérfanos
UPDATE gamification_system.comodin_usage_tracking
SET exercise_id = NULL
WHERE exercise_id NOT IN (SELECT id FROM educational_content.exercises);
```

---

### Riesgo #2: Soft Delete Acumula Registros

**Probabilidad:** MEDIA
**Impacto:** BAJO (performance)

**Mitigación:**
- Implementar job de limpieza mensual
- `deleted_at < NOW() - INTERVAL '90 days'` → hard delete

```sql
-- Cron job mensual
DELETE FROM educational_content.exercises
WHERE deleted_at IS NOT NULL
  AND deleted_at < NOW() - INTERVAL '90 days';
```

---

### Riesgo #3: Breaking Changes en API

**Probabilidad:** BAJA
**Impacto:** ALTO

**Mitigación:**
- Todos los cambios son backward-compatible
- SET NULL en FKs → backend maneja NULL gracefully
- Validación en servicios → errors más claros, no silent fails

---

## 📚 DOCUMENTACIÓN REQUERIDA

### Para Desarrolladores

- [ ] ADR: "Desacoplamiento Módulos-Gamificación"
- [ ] Guía: "Cómo modificar ejercicios sin romper gamificación"
- [ ] Guía: "Content Versioning Strategy"

### Para Product Owners

- [ ] Documento: "Impacto de correcciones en módulos"
- [ ] Checklist: "Pre-deployment validation"

### Para Operaciones

- [ ] Runbook: "Rollback de cambios en módulos"
- [ ] Runbook: "Validación de integridad referencial"

---

## 🎯 RESUMEN

Este plan de corrección aborda los **9 puntos de acoplamiento identificados** en 4 fases progresivas.

**Priorización:**
- Fase 1 (P0): Evita pérdida de datos → CRÍTICO
- Fase 2 (P1): Evita errores visibles → URGENTE
- Fase 3 (P2): Mejora arquitectura → IMPORTANTE
- Fase 4 (P3): Visión a largo plazo → DESEABLE

**Timeline estimado:**
- Fase 1: 3 días
- Fase 2: 7 días
- Fase 3: 14 días
- Fase 4: 1-2 meses

**Esfuerzo total:** ~6 semanas para correcciones críticas + arquitectura mejorada

---

**Plan generado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Versión:** 1.0.0
**Estado:** ⏳ **PENDIENTE DE APROBACIÓN**
